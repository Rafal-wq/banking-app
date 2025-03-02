<?php

namespace App\Http\Controllers;

use App\Models\BankAccount;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class BankAccountController extends Controller
{
    /**
     * Display a listing of the user's bank accounts.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        // Using cache to improve performance
        $cacheKey = 'user.'.$user->id.'.accounts';
        $accounts = Cache::remember($cacheKey, now()->addMinutes(5), function () use ($user) {
            return $user->bankAccounts()->with(['incomingTransactions', 'outgoingTransactions'])->get();
        });

        return response()->json([
            'success' => true,
            'data' => $accounts,
        ]);
    }

    /**
     * Store a newly created bank account in storage.
     */
    public function store(Request $request)
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

        $accountNumber = BankAccount::generateAccountNumber();

        $account = BankAccount::create([
            'user_id' => $user->id,
            'account_number' => $accountNumber,
            'name' => $request->name,
            'balance' => 0.00,
            'currency' => $request->currency,
            'is_active' => true,
        ]);

        Cache::forget('user.'.$user->id.'.accounts');

        return response()->json([
            'success' => true,
            'data' => $account,
            'message' => 'Bank account created successfully.',
        ], 201);
    }

    /**
     * Display the specified bank account.
     */
    public function show(Request $request, BankAccount $bankAccount)
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
    public function update(Request $request, BankAccount $bankAccount)
    {
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

        // Clear the cache for this user's accounts
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
        // Authorize that the account belongs to the authenticated user
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
        // Authorize that the account belongs to the authenticated user
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
            // Clear the cache for this user's accounts
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
        // Authorize that the account belongs to the authenticated user
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
