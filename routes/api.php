<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\BankAccountController;
use App\Http\Controllers\TransactionController;

Route::middleware(['auth:sanctum'])->get('/debug-user', function (Request $request) {
    if ($request->user()) {
        return response()->json([
            'authenticated' => true,
            'user' => $request->user(),
            'session_id' => session()->getId(),
        ]);
    }

    return response()->json([
        'authenticated' => false,
        'session_id' => session()->getId(),
    ], 401);
});

Route::get('/auth-check', function (Request $request) {
    return response()->json([
        'authenticated' => Auth::check(),
        'user' => Auth::check() ? Auth::user() : null,
        'session_id' => session()->getId(),
        'cookies' => $request->cookies->all(),
    ]);
});

Route::get('/auth-test', function (Request $request) {
    if ($request->user()) {
        return response()->json([
            'success' => true,
            'message' => 'Authenticated',
            'user' => $request->user(),
        ]);
    } else {
        return response()->json([
            'success' => false,
            'message' => 'Not authenticated',
        ], 401);
    }
})->middleware('auth:sanctum');

Route::post('/login', [AuthenticatedSessionController::class, 'store']);
Route::post('/register', [RegisteredUserController::class, 'store']);

Route::middleware(['auth:sanctum'])->get('/accounts-alt', function (Request $request) {
    $user = $request->user();
    return response()->json([
        'success' => true,
        'data' => $user->bankAccounts,
        'user' => $user
    ]);

});

Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy']);

    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::get('bank-accounts/{bankAccount}/transactions', [TransactionController::class, 'getAccountTransactions'])
        ->name('api.bank-accounts.transactions');

    Route::get('/my-accounts', function (Request $request) {
        $user = $request->user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 401);
        }

        $accounts = $user->bankAccounts;
        return response()->json([
            'success' => true,
            'data' => $accounts
        ]);
    });

    Route::apiResource('bank-accounts', BankAccountController::class)->names([
        'index' => 'api.bank-accounts.index',
        'store' => 'api.bank-accounts.store',
        'show' => 'api.bank-accounts.show',
        'update' => 'api.bank-accounts.update',
        'destroy' => 'api.bank-accounts.destroy',
    ]);

    Route::post('bank-accounts/{bankAccount}/deposit', [BankAccountController::class, 'deposit'])
        ->name('api.bank-accounts.deposit');

    Route::post('bank-accounts/{bankAccount}/withdraw', [BankAccountController::class, 'withdraw'])
        ->name('api.bank-accounts.withdraw');

    Route::get('bank-accounts/{bankAccount}/transactions', [TransactionController::class, 'getAccountTransactions'])
        ->name('api.bank-accounts.transactions');
});
