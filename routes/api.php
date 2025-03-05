<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\BankAccountController;
use App\Http\Controllers\TransactionController;

// Trasy bez uwierzytelniania
Route::post('/login', [AuthenticatedSessionController::class, 'store']);
Route::post('/register', [RegisteredUserController::class, 'store']);

// Trasy z uwierzytelnianiem
Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy']);

    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Trasy dla kont bankowych - nadajemy im prefix 'api.'
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

    // Trasy dla transakcji - nadajemy im prefix 'api.'
    Route::apiResource('transactions', TransactionController::class)->names([
        'index' => 'api.transactions.index',
        'store' => 'api.transactions.store',
        'show' => 'api.transactions.show',
        'update' => 'api.transactions.update',
        'destroy' => 'api.transactions.destroy',
    ]);

    Route::get('bank-accounts/{bankAccount}/transactions', [TransactionController::class, 'getAccountTransactions'])
        ->name('api.bank-accounts.transactions');
});
