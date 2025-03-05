<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('guest')->group(function () {
    Route::get('/login', function () {
        return Inertia::render('Auth/Login');
    })->name('login');

    Route::get('/register', function () {
        return Inertia::render('Auth/Register');
    })->name('register');
});

Route::get('/logout-page', function () {
    Auth::logout();
    return redirect('/login')->with('message', 'Zostałeś wylogowany.');
})->name('logout.page');

// Dodajmy opcję wyświetlenia login nawet gdy jesteś zalogowany
Route::get('/force-login', function () {
    return Inertia::render('Auth/Login');
})->name('force.login');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::get('/accounts/create', function () {
    return Inertia::render('Accounts/Create');
})->middleware(['auth'])->name('accounts.create');

Route::get('/accounts', function () {
    return Inertia::render('Accounts/Index');
})->middleware(['auth'])->name('accounts.index');

Route::get('/accounts/{id}', function ($id) {
    return Inertia::render('Accounts/Show', ['id' => $id]);
})->middleware(['auth'])->name('accounts.show');

Route::get('/transactions/create', function () {
    return Inertia::render('Transactions/Create');
})->middleware(['auth'])->name('transactions.create');

Route::get('/transactions', function () {
    return Inertia::render('Transactions/Index');
})->middleware(['auth'])->name('transactions.index');

require __DIR__.'/auth.php';
