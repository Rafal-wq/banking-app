<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\BankAccount;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use App\Mail\TransactionNotification;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class TransactionController extends Controller
{
    /**
     * Display a listing of the user's transactions.
     */

    public function index(Request $request)
    {
        $user = $request->user();
        $accountIds = $user->bankAccounts()->pluck('id')->toArray();

        $cacheKey = 'user.'.$user->id.'.transactions';

        // Wyczyść cache przy każdym żądaniu, aby zawsze mieć aktualne dane
        Cache::forget($cacheKey);

        $transactions = Cache::remember($cacheKey, now()->addMinutes(5), function () use ($accountIds, $user) {
            $transactions = Transaction::where(function ($query) use ($accountIds) {
                $query->whereIn('from_account_id', $accountIds)
                    ->orWhereIn('to_account_id', $accountIds);
            })
                ->with(['fromAccount', 'toAccount']) // Upewniamy się, że relacje są ładowane
                ->orderBy('created_at', 'desc')
                ->get();

            // Dodaj flagę, czy transakcja jest wychodząca dla bieżącego użytkownika
            foreach ($transactions as $transaction) {
                if ($transaction->title === 'Bonus powitalny' && $transaction->from_account_id === $transaction->to_account_id) {
                    $transaction->is_outgoing = false;
                } else {
                    $transaction->is_outgoing = in_array($transaction->from_account_id, $accountIds);
                }
            }

            return $transactions;
        });

        return response()->json([
            'success' => true,
            'data' => $transactions,
        ]);
    }

    /**
     * Store a newly created transaction in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'from_account_id' => 'required|exists:bank_accounts,id',
            'to_account_id' => 'required|exists:bank_accounts,id|different:from_account_id',
            'amount' => 'required|numeric|min:0.01',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();
        $fromAccount = BankAccount::findOrFail($request->from_account_id);
        $toAccount = BankAccount::findOrFail($request->to_account_id);

        // Authorize that the source account belongs to the authenticated user
        if ($user->id !== $fromAccount->user_id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to source bank account.',
            ], 403);
        }

        // Check if the source account is active
        if (!$fromAccount->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'The source account is inactive.',
            ], 422);
        }

        // Check if the destination account is active
        if (!$toAccount->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'The destination account is inactive.',
            ], 422);
        }

        $sourceAmount = $request->amount;
        $targetAmount = $sourceAmount;
        $exchangeRate = 1.0;

        // Sprawdź, czy potrzebne jest przewalutowanie
        if ($fromAccount->currency !== $toAccount->currency) {
            // Tworzymy instancję serwisu do przewalutowania
            $currencyService = new \App\Services\CurrencyExchangeService();

            // Obliczamy kurs wymiany
            $exchangeRate = $currencyService->getExchangeRate($fromAccount->currency, $toAccount->currency);

            // Obliczamy kwotę docelową po przewalutowaniu
            $targetAmount = $currencyService->convert($sourceAmount, $fromAccount->currency, $toAccount->currency);
        }

        // Check if the source account has enough balance
        if ($fromAccount->balance < $sourceAmount) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient funds in the source account.',
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Create the transaction
            $transaction = Transaction::create([
                'from_account_id' => $request->from_account_id,
                'to_account_id' => $request->to_account_id,
                'amount' => $sourceAmount, // Zapisujemy kwotę źródłową
                'target_amount' => $targetAmount,
                'title' => $request->title,
                'description' => $request->description .
                    // Dodajemy informację o przewalutowaniu, jeśli miało miejsce
                    ($fromAccount->currency !== $toAccount->currency ?
                        " (Przewalutowanie: {$sourceAmount} {$fromAccount->currency} = {$targetAmount} {$toAccount->currency}, kurs: {$exchangeRate})" : ''),
                'status' => 'pending',
            ]);

            // Pobierz środki z konta źródłowego
            $withdrawSuccess = $fromAccount->withdraw($sourceAmount);

            // Tylko gdy pobranie się powiedzie, dodajemy środki do konta docelowego
            if ($withdrawSuccess) {
                // Dodajemy przeliczoną kwotę do konta docelowego
                $depositSuccess = $toAccount->deposit($targetAmount);

                if ($depositSuccess) {
                    $transaction->status = 'completed';
                    $transaction->executed_at = now();
                    $transaction->save();

                    // COMMIT transakcji finansowej PRZED próbą wysłania emaili
                    DB::commit();

                    // Clear the cache for this user's accounts and transactions
                    Cache::forget('user.'.$user->id.'.accounts');
                    Cache::forget('user.'.$user->id.'.transactions');

                    // If the destination account belongs to another user, clear their cache too
                    if ($fromAccount->user_id !== $toAccount->user_id) {
                        Cache::forget('user.'.$toAccount->user_id.'.accounts');
                        Cache::forget('user.'.$toAccount->user_id.'.transactions');
                    }

                    // === NOWA LOGIKA EMAILI ===
                    // Próbuj wysłać emaile (ale nie blokuj transakcji)
                    $emailSent = $this->attemptEmailSending($transaction);

                    $baseMessage = 'Transaction completed successfully' .
                        ($fromAccount->currency !== $toAccount->currency ?
                            " with currency conversion from {$sourceAmount} {$fromAccount->currency} to {$targetAmount} {$toAccount->currency}" : '');

                    return response()->json([
                        'success' => true,
                        'data' => $transaction->load(['fromAccount', 'toAccount']),
                        'message' => $baseMessage,
                        'email_sent' => $emailSent, // Informacja dla frontendu o statusie emaila
                    ], 201);
                } else {
                    // If deposit fails, rollback the transaction
                    DB::rollBack();
                    $transaction->status = 'failed';
                    $transaction->save();
                    return response()->json([
                        'success' => false,
                        'message' => 'Failed to deposit funds to the destination account.',
                    ], 500);
                }
            } else {
                // If withdrawal fails, mark transaction as failed
                DB::rollBack();
                $transaction->status = 'failed';
                $transaction->save();
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to withdraw funds from the source account.',
                ], 500);
            }
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Transaction failed', [
                'error' => $e->getMessage(),
                'from_account_id' => $request->from_account_id,
                'to_account_id' => $request->to_account_id,
                'amount' => $sourceAmount
            ]);

            return response()->json([
                'success' => false,
                'message' => 'An error occurred while processing the transaction: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Próbuj wysłać emaile z 2 próbami
     */
    private function attemptEmailSending(Transaction $transaction): bool
    {
        // Sprawdź czy emaile są włączone w konfiguracji
        if (!config('mail.enabled', true)) {
            Log::info("Email notifications disabled", [
                'transaction_id' => $transaction->id
            ]);
            return false;
        }

        $maxAttempts = 2;

        for ($attempt = 1; $attempt <= $maxAttempts; $attempt++) {
            try {
                // Ładujemy relacje z userami, jeśli nie są załadowane
                if (!$transaction->relationLoaded('fromAccount')) {
                    $transaction->load(['fromAccount.user', 'toAccount.user']);
                }

                $emailsSent = 0;
                $emailErrors = [];

                // Wyślij email do nadawcy (outgoing transaction)
                if ($transaction->fromAccount &&
                    $transaction->fromAccount->user &&
                    $transaction->fromAccount->user->email) {

                    try {
                        Mail::to($transaction->fromAccount->user->email)
                            ->send(new TransactionNotification($transaction, true));
                        $emailsSent++;

                        Log::info("Outgoing transaction email sent", [
                            'transaction_id' => $transaction->id,
                            'recipient' => $transaction->fromAccount->user->email,
                            'attempt' => $attempt
                        ]);
                    } catch (\Throwable $e) {
                        $emailErrors[] = "Sender email failed: " . $e->getMessage();
                    }
                }

                // Wyślij email do odbiorcy (incoming transaction)
                // ZAWSZE gdy odbiorca ma email (nawet jeśli to ten sam użytkownik)
                if ($transaction->toAccount &&
                    $transaction->toAccount->user &&
                    $transaction->toAccount->user->email) {

                    try {
                        Mail::to($transaction->toAccount->user->email)
                            ->send(new TransactionNotification($transaction, false));
                        $emailsSent++;

                        Log::info("Incoming transaction email sent", [
                            'transaction_id' => $transaction->id,
                            'recipient' => $transaction->toAccount->user->email,
                            'is_same_user' => $transaction->fromAccount->user_id === $transaction->toAccount->user_id,
                            'attempt' => $attempt
                        ]);
                    } catch (\Throwable $e) {
                        $emailErrors[] = "Recipient email failed: " . $e->getMessage();
                    }
                }

                // Sukces - emaile zostały wysłane (przynajmniej jeden)
                if ($emailsSent > 0) {
                    Log::info("Transaction notifications sent successfully", [
                        'transaction_id' => $transaction->id,
                        'emails_sent' => $emailsSent,
                        'attempt' => $attempt,
                        'errors' => $emailErrors
                    ]);

                    return true;
                }

                // Jeśli żaden email się nie wysłał, rzuć wyjątek
                throw new \Exception("No emails were sent. Errors: " . implode('; ', $emailErrors));

            } catch (\Throwable $exception) {
                Log::warning("Email sending attempt {$attempt} failed", [
                    'transaction_id' => $transaction->id,
                    'error' => $exception->getMessage(),
                    'attempt' => $attempt
                ]);

                // Jeśli to ostatnia próba, poddaj się
                if ($attempt === $maxAttempts) {
                    Log::error("Email sending failed permanently after {$maxAttempts} attempts", [
                        'transaction_id' => $transaction->id,
                        'final_error' => $exception->getMessage()
                    ]);
                    return false;
                }

                // Czekaj 1 sekundę przed kolejną próbą
                sleep(1);
            }
        }

        return false;
    }

    /**
     * Display the specified transaction.
     */
    public function show(Request $request, Transaction $transaction)
    {
        $user = $request->user();
        $userAccountIds = $user->bankAccounts()->pluck('id')->toArray();

        // Authorize that the transaction involves one of the user's accounts
        if (!in_array($transaction->from_account_id, $userAccountIds) &&
            !in_array($transaction->to_account_id, $userAccountIds)) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to transaction.',
            ], 403);
        }

        // Dodaj flagę isOutgoing do obiektu transakcji
        $transaction->is_outgoing = in_array($transaction->from_account_id, $userAccountIds);

        $transaction->load(['fromAccount', 'toAccount']);

        return response()->json([
            'success' => true,
            'data' => $transaction,
        ]);
    }

    /**
     * Cannot update a transaction after it's created.
     */
    public function update(Request $request, Transaction $transaction)
    {
        return response()->json([
            'success' => false,
            'message' => 'Transactions cannot be modified after creation.',
        ], 422);
    }

    /**
     * Cannot delete a transaction after it's created.
     */
    public function destroy(Request $request, Transaction $transaction)
    {
        return response()->json([
            'success' => false,
            'message' => 'Transactions cannot be deleted.',
        ], 422);
    }

    /**
     * Get all transactions for a specific bank account.
     */
    public function getAccountTransactions(Request $request, BankAccount $bankAccount)
    {
        $user = $request->user();

        // Authorize that the account belongs to the authenticated user
        if ($user->id !== $bankAccount->user_id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to bank account.',
            ], 403);
        }

        $cacheKey = 'account.'.$bankAccount->id.'.transactions';

        $transactions = Cache::remember($cacheKey, now()->addMinutes(5), function () use ($bankAccount, $user) {
            $accountIds = $user->bankAccounts()->pluck('id')->toArray();
            $transactions = Transaction::where('from_account_id', $bankAccount->id)
                ->orWhere('to_account_id', $bankAccount->id)
                ->with(['fromAccount', 'toAccount'])
                ->orderBy('created_at', 'desc')
                ->get();

            // Dodaj flagę is_outgoing do każdej transakcji
            foreach ($transactions as $transaction) {
                if ($transaction->title === 'Bonus powitalny' && $transaction->from_account_id === $transaction->to_account_id) {
                    $transaction->is_outgoing = false;
                } else {
                    $transaction->is_outgoing = in_array($transaction->from_account_id, $accountIds);
                }
            }

            return $transactions;
        });

        return response()->json([
            'success' => true,
            'data' => $transactions,
        ]);
    }

    /**
     * Wyszukuje konto bankowe po numerze konta.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function findAccountByNumber(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'account_number' => 'required|string|min:5',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $accountNumber = $request->account_number;

        try {
            // Wyszukaj konto po numerze, ale nie zwracaj kont należących do zalogowanego użytkownika
            $account = BankAccount::where('account_number', $accountNumber)
                ->where('user_id', '!=', auth()->id())
                ->with('user:id,name')
                ->first();

            if (!$account) {
                return response()->json([
                    'success' => false,
                    'message' => 'Nie znaleziono konta o podanym numerze.'
                ], 404);
            }

            // Zwróć podstawowe informacje o koncie (bez ujawniania wrażliwych danych)
            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $account->id,
                    'name' => $account->name,
                    'account_number' => $account->account_number,
                    'currency' => $account->currency,
                    'user_name' => $account->user->name,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Wystąpił błąd podczas wyszukiwania konta: ' . $e->getMessage()
            ], 500);
        }
    }
}
