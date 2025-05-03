<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

Route::get('/', function () {
    $financialService = new \App\Services\FinancialDataService();

    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
        'stockData' => $financialService->getStockIndices(),
        'currencyRates' => $financialService->getCurrencyRates(),
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard', [
        'user' => Auth::user(),
        'csrf_token' => csrf_token()
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('guest')->group(function () {
    Route::get('/login', function () {
        return Inertia::render('Auth/Login');
    })->name('login');

    Route::get('/register', function () {
        return Inertia::render('Auth/Register');
    })->name('register');
});

Route::get('/exchange', function () {
    return Inertia::render('Exchange');
})->name('exchange');

Route::get('/logout-page', function () {
    Auth::logout();
    return redirect('/login')->with('message', 'Zostałeś wylogowany.');
})->name('logout.page');

Route::get('/force-login', function () {
    return Inertia::render('Auth/Login');
})->name('force.login');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('/accounts/create', function () {
        return Inertia::render('Accounts/Create');
    })->name('accounts.create');

    Route::middleware('guest')->group(function () {
        Route::get('/login', function () {
            // Dodajmy debugging
            \Log::info('Rendering login page');
            return Inertia::render('Auth/Login');
        })->name('login');

        Route::get('/register', function () {
            return Inertia::render('Auth/Register');
        })->name('register');
    });

    Route::get('/accounts', function () {
        return Inertia::render('Accounts/Index');
    })->name('accounts.index');

    Route::get('/accounts/{id}', function ($id) {
        return Inertia::render('Accounts/Show', ['id' => $id]);
    })->name('accounts.show');

    Route::get('/transactions/create', function () {
        return Inertia::render('Transactions/Create');
    })->name('transactions.create');

    Route::get('/transactions', function () {
        return Inertia::render('Transactions/Index');
    })->name('transactions.index');
});

Route::get('/transactions/{id}', function ($id) {
    return Inertia::render('Transactions/Show', ['id' => $id]);
})->name('transactions.show')->middleware('auth');

Route::get('/session-test', function (Request $request) {
    return [
        'user' => auth()->user(),
        'session_id' => session()->getId(),
        'session_has_user' => session()->has('auth.password_confirmed_at'),
    ];
})->middleware('auth');

require __DIR__.'/auth.php';
