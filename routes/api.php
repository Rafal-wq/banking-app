<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\BankAccountController;
use App\Http\Controllers\TransactionController;


Route::post('/login', [AuthenticatedSessionController::class, 'store']);
Route::post('/register', [RegisteredUserController::class, 'store']);
Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])->middleware('auth:sanctum');

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::middleware('auth:sanctum')->group(function () {
    // Bank Account Routes
    Route::apiResource('bank-accounts', BankAccountController::class);

    // Additional bank account operations
    Route::post('bank-accounts/{bankAccount}/deposit', [BankAccountController::class, 'deposit']);
    Route::post('bank-accounts/{bankAccount}/withdraw', [BankAccountController::class, 'withdraw']);

    // Transaction Routes
    Route::apiResource('transactions', TransactionController::class);

    // Get transactions for specific account
    Route::get('bank-accounts/{bankAccount}/transactions', [TransactionController::class, 'getAccountTransactions']);
});
