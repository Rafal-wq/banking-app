<?php
// Poprawiony skrypt railway-server.php dla deploymentu na Railway

// Pobierz PORT z zmiennej środowiskowej z fallbackiem na 8000
$port = getenv('PORT') ? getenv('PORT') : 8000;

echo "Starting server on port {$port}...\n";

// Uruchom wbudowany serwer PHP na określonym porcie
$command = sprintf('php -S 0.0.0.0:%d -t public', $port);
passthru($command);
