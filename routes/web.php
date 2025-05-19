<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use App\Mail\TransactionNotification;
use Illuminate\Http\Request;

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

        // Sprawdź, czy tabela migracji istnieje
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

// Endpoint testowy do wysyłania maili
Route::get('/mail-test', function (Request $request) {
    // Jeśli użytkownik nie jest zalogowany, używamy testowego adresu email
    $email = Auth::check() ? Auth::user()->email : 'test@example.com';

    // Stwórz testową transakcję
    $transaction = new \App\Models\Transaction();
    $transaction->id = 9999;
    $transaction->from_account_id = 1;
    $transaction->to_account_id = 2;
    $transaction->amount = 100.00;
    $transaction->target_amount = 100.00;
    $transaction->title = "Testowa transakcja";
    $transaction->description = "Test systemu mailowego";
    $transaction->status = "completed";
    $transaction->executed_at = now();
    $transaction->created_at = now();

    // Symulowane relacje
    $fromAccount = new \stdClass();
    $fromAccount->name = "Moje konto";
    $fromAccount->currency = "PLN";

    $toAccount = new \stdClass();
    $toAccount->name = "Konto docelowe";
    $toAccount->currency = "PLN";

    $transaction->fromAccount = $fromAccount;
    $transaction->toAccount = $toAccount;

    // Wysyłka maila
    Mail::to($email)->send(new TransactionNotification($transaction, true));

    return "Mail testowy został wysłany na adres: " . $email;
})->name('mail.test');

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

// Trasa testowa sprawdzająca konfigurację poczty
Route::get('/mail-config', function () {
    return [
        'driver' => config('mail.default'),
        'host' => config('mail.mailers.smtp.host'),
        'port' => config('mail.mailers.smtp.port'),
        'encryption' => config('mail.mailers.smtp.encryption'),
        'username' => config('mail.mailers.smtp.username') ? 'Is set' : 'Not set',
        'password' => config('mail.mailers.smtp.password') ? 'Is set' : 'Not set',
        'from_address' => config('mail.from.address'),
        'from_name' => config('mail.from.name'),
    ];
});

// Prosta trasa testowa do wysyłania maila
Route::get('/simple-mail-test', function () {
    try {
        $email = 'test@example.com'; // Możesz zamienić na swój rzeczywisty adres email testowy

        // Log przed próbą wysłania
        \Log::info("Attempting to send test email to: " . $email);

        Mail::to($email)->send(new \App\Mail\SimpleTestMail());

        // Log po wysłaniu
        \Log::info("Email sent successfully");

        return "Simple test mail sent to " . $email . " at " . now();
    } catch (\Exception $e) {
        // Log błędu
        \Log::error("Mail sending error: " . $e->getMessage());
        \Log::error($e->getTraceAsString());

        return "Error sending mail: " . $e->getMessage();
    }
});

require __DIR__.'/auth.php';
