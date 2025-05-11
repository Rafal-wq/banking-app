#!/bin/bash

# Utwórz plik .env, jeśli nie istnieje
if [ ! -f .env ]; then
    echo "Tworzenie pliku .env z domyślnych ustawień Docker..."
    cp .env.docker .env
fi

# Utwórz potrzebne katalogi z odpowiednimi uprawnieniami
mkdir -p storage/framework/{sessions,views,cache}
mkdir -p storage/logs
chmod -R 775 storage bootstrap/cache
chmod +x docker-entrypoint.sh
chmod +x docker-compose-run.sh

# Uruchom kontenery
docker-compose up -d

# Poczekaj, aż wszystkie kontenery będą gotowe
echo "Oczekiwanie na uruchomienie kontenerów..."
sleep 10

# Instaluj zależności PHP
docker-compose exec app composer install

# Wygeneruj klucz aplikacji
docker-compose exec app php artisan key:generate

# Wykonaj migracje bazy danych
docker-compose exec app php artisan migrate --force

# Instaluj zależności NPM i zbuduj front-end
docker-compose run node install
docker-compose run node run build

echo "====================================================="
echo "Aplikacja bankowa została skonfigurowana w Dockerze!"
echo "Otwórz http://localhost:8000 w przeglądarce"
echo "====================================================="
