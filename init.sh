#!/bin/bash
# init.sh
echo "Inicjalizacja projektu Bank App w środowisku Docker..."

# Sprawdź czy plik .env istnieje
if [ ! -f .env ]; then
    echo "Tworzenie pliku .env z domyślnych ustawień..."
    cp .env.docker .env
fi

# Utwórz potrzebne katalogi
echo "Tworzenie katalogów dla przechowywania danych..."
mkdir -p storage/framework/{sessions,views,cache}
mkdir -p storage/logs
chmod -R 775 storage bootstrap/cache

# Uruchom kontenery Docker
echo "Uruchamianie kontenerów Docker..."
docker-compose down
docker-compose up -d

# Poczekaj, aż wszystkie kontenery będą gotowe
echo "Oczekiwanie na uruchomienie kontenerów..."
sleep 10

# Instaluj zależności PHP
echo "Instalacja zależności PHP..."
docker-compose exec app composer install

# Wygeneruj klucz aplikacji
echo "Generowanie klucza aplikacji..."
docker-compose exec app php artisan key:generate --no-interaction

# Wykonaj migracje bazy danych
echo "Wykonywanie migracji bazy danych..."
docker-compose exec app php artisan migrate --force --no-interaction

# Instaluj zależności NPM i uruchom Vite
echo "Uruchamianie serwera deweloperskiego Vite..."
docker-compose exec app npm install

echo "====================================================="
echo "Aplikacja bankowa została skonfigurowana w Dockerze!"
echo "Otwórz http://localhost:8000 w przeglądarce"
echo "====================================================="
