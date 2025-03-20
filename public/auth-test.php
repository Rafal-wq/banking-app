<?php
require __DIR__.'/../vendor/autoload.php';

$app = require_once __DIR__.'/../bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

// Symuluj żądanie
$request = Illuminate\Http\Request::create('/api/auth-check', 'GET');

// Pobierz aktualną sesję jeśli istnieje
if (isset($_COOKIE['laravel_session'])) {
    $request->cookies->set('laravel_session', $_COOKIE['laravel_session']);
}

// Dodaj token CSRF jeśli istnieje
if (isset($_COOKIE['XSRF-TOKEN'])) {
    $request->headers->set('X-XSRF-TOKEN', urldecode($_COOKIE['XSRF-TOKEN']));
}

$response = $kernel->handle($request);

// Wypisz informacje diagnostyczne
header('Content-Type: application/json');
echo json_encode([
    'cookies' => $_COOKIE,
    'request_cookies' => $request->cookies->all(),
    'request_headers' => $request->headers->all(),
    'response' => json_decode($response->getContent()),
    'response_status' => $response->getStatusCode(),
    'response_headers' => $response->headers->all(),
    'session_status' => session_status(),
    'php_session_id' => session_id(),
]);
