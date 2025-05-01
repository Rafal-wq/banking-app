<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie', 'login', 'logout', '*'],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['*'], // W środowisku deweloperskim zezwalam na wszystkie pochodzenia
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
