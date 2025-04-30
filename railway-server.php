<?php
// Zapisz jako railway-server.php w głównym katalogu projektu

// Pobierz port z zmiennej środowiskowej lub użyj domyślnego 8000
$port = getenv('PORT') ?: 8000;

echo "Starting server on port {$port}...\n";

// Uruchom wbudowany serwer PHP na określonym porcie
$command = sprintf('php -S 0.0.0.0:%d -t public', $port);
passthru($command);
