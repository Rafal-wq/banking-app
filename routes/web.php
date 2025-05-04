<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Artisan;
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

// Endpoint diagnostyczny - informacje o konfiguracji bazy danych
Route::get('/db-info', function () {
    $connection = config('database.default');
    $config = config('database.connections.' . $connection);

    // Ukryj hasło z wyników
    if (isset($config['password'])) {
        $config['password'] = '***********';
    }

    return [
        'connection' => $connection,
        'config' => $config,
        'database_url' => env('DATABASE_URL') ? 'ustawione' : 'brak',
        'env' => app()->environment(),
        'all_env_vars' => [
            'DB_CONNECTION' => env('DB_CONNECTION'),
            'DB_HOST' => env('DB_HOST'),
            'DB_PORT' => env('DB_PORT'),
            'DB_DATABASE' => env('DB_DATABASE'),
            'DB_USERNAME' => env('DB_USERNAME'),
            'MYSQL_URL_EXISTS' => env('MYSQL_URL') ? 'tak' : 'nie'
        ]
    ];
});

// Endpoint do testowania i uruchamiania migracji
Route::get('/run-migrations', function () {
    try {
        // Sprawdź połączenie
        $pdo = DB::connection()->getPdo();

        // Informacje o połączeniu
        $connectionInfo = [
            'driver' => $pdo->getAttribute(\PDO::ATTR_DRIVER_NAME),
            'server_version' => $pdo->getAttribute(\PDO::ATTR_SERVER_VERSION),
            'client_version' => $pdo->getAttribute(\PDO::ATTR_CLIENT_VERSION),
            'connection_status' => $pdo->getAttribute(\PDO::ATTR_CONNECTION_STATUS),
        ];

        // Sprawdź czy tabela migracji istnieje
        try {
            $migrationTableExists = DB::select("SHOW TABLES LIKE 'migrations'");
        } catch (\Exception $e) {
            $migrationTableExists = false;
        }

        // Uruchom migracje
        Artisan::call('migrate', ['--force' => true]);

        return [
            'success' => true,
            'message' => 'Migracje uruchomione pomyślnie',
            'output' => Artisan::output(),
            'connection_info' => $connectionInfo,
            'migration_table_existed' => !empty($migrationTableExists)
        ];
    } catch (\Exception $e) {
        return [
            'success' => false,
            'message' => 'Błąd podczas migracji: ' . $e->getMessage(),
            'trace' => explode("\n", $e->getTraceAsString())
        ];
    }
});

// Istniejący endpoint testowy DB
Route::get('/db-test', function () {
    try {
        // Sprawdź połączenie z bazą danych
        $pdo = DB::connection()->getPdo();

        // Wylistuj wszystkie tabele
        try {
            $tables = DB::select('SHOW TABLES');
        } catch (\Exception $e) {
            $tables = [];
        }

        return [
            'status' => 'success',
            'message' => 'Połączono z bazą: ' . DB::connection()->getDatabaseName(),
            'connection_details' => [
                'driver' => $pdo->getAttribute(\PDO::ATTR_DRIVER_NAME),
                'server_version' => $pdo->getAttribute(\PDO::ATTR_SERVER_VERSION),
                'client_version' => $pdo->getAttribute(\PDO::ATTR_CLIENT_VERSION),
                'connection_status' => $pdo->getAttribute(\PDO::ATTR_CONNECTION_STATUS),
            ],
            'tables' => $tables
        ];
    } catch (\Exception $e) {
        return [
            'status' => 'error',
            'message' => 'Nie można połączyć się z bazą. Błąd: ' . $e->getMessage(),
            'trace' => explode("\n", $e->getTraceAsString())
        ];
    }
});

// [Pozostała część pliku zostaje bez zmian]

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

    Route::get('/external-transfer', function () {
        return Inertia::render('Transactions/ExternalTransfer');
    })->name('transactions.external');

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
