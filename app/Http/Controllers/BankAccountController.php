<?php

namespace App\Http\Controllers;

use App\Models\BankAccount;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class BankAccountController extends Controller
{
    /**
     * Display a listing of the user's bank accounts.
     */
    public function index(Request $request): \Illuminate\Http\JsonResponse
    {

        $user = auth()->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.',
            ], 401);
        }

        // Sprawdź, czy relacja istnieje
        try {
            $accounts = $user->bankAccounts()->with(['incomingTransactions', 'outgoingTransactions'])->get();

            return response()->json([
                'success' => true,
                'data' => $accounts,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Store a newly created bank account in storage.
     */


    public function store(Request $request): \Illuminate\Http\JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'currency' => ['required', 'string', Rule::in(['PLN', 'EUR', 'USD', 'GBP'])],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();

        // Sprawdzamy, czy użytkownik ma już jakieś konta
        $existingAccountsCount = BankAccount::where('user_id', $user->id)->count();

        // Przygotuj informację o bonusie do wyświetlenia
        $bonusMessage = '';

        // Generate a unique account number
        $accountNumber = BankAccount::generateAccountNumber();

        $account = BankAccount::create([
            'user_id' => $user->id,
            'account_number' => $accountNumber,
            'name' => $request->name,
            'balance' => 0.00, // Początkowe saldo nadal 0
            'currency' => $request->currency,
            'is_active' => true,
        ]);

        // Dodaj bonus powitalny tylko dla pierwszego konta użytkownika
        if ($existingAccountsCount === 0) {
            $bonusAmount = 1000.00; // 1000 w walucie konta

            // Jeśli waluta nie jest PLN, przelicz odpowiednią wartość bonusu
            if ($request->currency !== 'PLN') {
                // Przelicznik waluty - tutaj używamy uproszczonych stałych kursów
                // W rzeczywistej aplikacji lepiej użyć aktualnych kursów z API
                $exchangeRates = [
                    'EUR' => 0.22, // 1 PLN = 0.22 EUR
                    'USD' => 0.25, // 1 PLN = 0.25 USD
                    'GBP' => 0.19, // 1 PLN = 0.19 GBP
                ];

                $bonusAmount = round(1000 * $exchangeRates[$request->currency], 2);
            }

            $account->deposit($bonusAmount);

            // Utwórz systemową transakcję dla bonusu powitalnego
            $transaction = \App\Models\Transaction::create([
                'from_account_id' => $account->id,  // W przypadku bonusu, źródłem jest system, ale dla uproszczenia używamy tego samego konta
                'to_account_id' => $account->id,
                'amount' => $bonusAmount,
                'title' => 'Bonus powitalny',
                'description' => 'Bonus powitalny za utworzenie pierwszego konta',
                'status' => 'completed',
                'executed_at' => now(),
            ]);

            $bonusMessage = ' with a welcome bonus of ' . number_format($bonusAmount, 2) . ' ' . $request->currency;
        }

        Cache::forget('user.'.$user->id.'.accounts');

        return response()->json([
            'success' => true,
            'data' => $account->fresh(),
            'message' => 'Bank account created successfully' . $bonusMessage,
        ], 201);
    }

    /**
     * Display the specified bank account.
     */
    public function show(Request $request, BankAccount $bankAccount): \Illuminate\Http\JsonResponse
    {
        if ($request->user()->id !== $bankAccount->user_id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to bank account.',
            ], 403);
        }

        $bankAccount->load(['incomingTransactions', 'outgoingTransactions']);

        return response()->json([
            'success' => true,
            'data' => $bankAccount,
        ]);
    }

    /**
     * Update the specified bank account in storage.
     */
    public function update(Request $request, BankAccount $bankAccount): \Illuminate\Http\JsonResponse
    {
        // Authorize that the account belongs to the authenticated user
        if ($request->user()->id !== $bankAccount->user_id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to bank account.',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'is_active' => 'sometimes|required|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $bankAccount->update($request->only(['name', 'is_active']));

        Cache::forget('user.'.$request->user()->id.'.accounts');

        return response()->json([
            'success' => true,
            'data' => $bankAccount,
            'message' => 'Bank account updated successfully.',
        ]);
    }

    /**
     * Remove the specified bank account from storage.
     */
    public function destroy(Request $request, BankAccount $bankAccount)
    {
        if ($request->user()->id !== $bankAccount->user_id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to bank account.',
            ], 403);
        }

        if ($bankAccount->balance > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete an account with a positive balance.',
            ], 422);
        }

        $pendingTransactions = $bankAccount->outgoingTransactions()
            ->where('status', 'pending')
            ->orWhere(function ($query) use ($bankAccount) {
                $query->where('to_account_id', $bankAccount->id)
                    ->where('status', 'pending');
            })
            ->exists();

        if ($pendingTransactions) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete an account with pending transactions.',
            ], 422);
        }

        $bankAccount->delete();

        Cache::forget('user.'.$request->user()->id.'.accounts');

        return response()->json([
            'success' => true,
            'message' => 'Bank account deleted successfully.',
        ]);
    }

    /**
     * Deposit money into the specified bank account.
     */
    public function deposit(Request $request, BankAccount $bankAccount)
    {
        if ($request->user()->id !== $bankAccount->user_id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to bank account.',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'amount' => 'required|numeric|min:0.01',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $amount = $request->amount;
        $success = $bankAccount->deposit($amount);

        if ($success) {
            Cache::forget('user.'.$request->user()->id.'.accounts');

            return response()->json([
                'success' => true,
                'data' => $bankAccount->fresh(),
                'message' => "Successfully deposited {$amount} {$bankAccount->currency}.",
            ]);
        } else {
            return response()->json([
                'success' => false,
                'message' => 'Failed to deposit the amount.',
            ], 500);
        }
    }

    /**
     * Withdraw money from the specified bank account.
     */
    public function withdraw(Request $request, BankAccount $bankAccount)
    {
        if ($request->user()->id !== $bankAccount->user_id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to bank account.',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'amount' => 'required|numeric|min:0.01',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $amount = $request->amount;

        if ($bankAccount->balance < $amount) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient funds.',
            ], 422);
        }

        $success = $bankAccount->withdraw($amount);

        if ($success) {
            Cache::forget('user.'.$request->user()->id.'.accounts');

            return response()->json([
                'success' => true,
                'data' => $bankAccount->fresh(),
                'message' => "Successfully withdrew {$amount} {$bankAccount->currency}.",
            ]);
        } else {
            return response()->json([
                'success' => false,
                'message' => 'Failed to withdraw the amount.',
            ], 500);
        }
    }
}
