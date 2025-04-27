<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\BankAccount;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

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

        $transactions = Cache::remember($cacheKey, now()->addMinutes(5), function () use ($accountIds) {
            return Transaction::where(function ($query) use ($accountIds) {
                $query->whereIn('from_account_id', $accountIds)
                    ->orWhereIn('to_account_id', $accountIds);
            })
                ->with(['fromAccount', 'toAccount'])
                ->orderBy('created_at', 'desc')
                ->get();
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
                'title' => $request->title,
                'description' => $request->description .
                    // Dodajemy informację o przewalutowaniu, jeśli miało miejsce
                    ($fromAccount->currency !== $toAccount->currency ?
                        " (Przewalutowanie: {$sourceAmount} {$fromAccount->currency} = {$targetAmount} {$toAccount->currency}, kurs: {$exchangeRate})" : ''),
                'status' => 'pending',
            ]);

            // Modyfikacja wykonania transakcji, aby brać pod uwagę przewalutowanie
            // Zamiast używać metody execute z modelu Transaction, robimy to ręcznie

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

                    DB::commit();

                    // Clear the cache for this user's accounts and transactions
                    Cache::forget('user.'.$user->id.'.accounts');
                    Cache::forget('user.'.$user->id.'.transactions');

                    // If the destination account belongs to another user, clear their cache too
                    if ($fromAccount->user_id !== $toAccount->user_id) {
                        Cache::forget('user.'.$toAccount->user_id.'.accounts');
                        Cache::forget('user.'.$toAccount->user_id.'.transactions');
                    }

                    return response()->json([
                        'success' => true,
                        'data' => $transaction->load(['fromAccount', 'toAccount']),
                        'message' => 'Transaction completed successfully' .
                            ($fromAccount->currency !== $toAccount->currency ?
                                " with currency conversion from {$sourceAmount} {$fromAccount->currency} to {$targetAmount} {$toAccount->currency}" : ''),
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
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while processing the transaction: ' . $e->getMessage(),
            ], 500);
        }
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

        $transactions = Cache::remember($cacheKey, now()->addMinutes(5), function () use ($bankAccount) {
            return Transaction::where('from_account_id', $bankAccount->id)
                ->orWhere('to_account_id', $bankAccount->id)
                ->with(['fromAccount', 'toAccount'])
                ->orderBy('created_at', 'desc')
                ->get();
        });

        return response()->json([
            'success' => true,
            'data' => $transactions,
        ]);
    }
}
