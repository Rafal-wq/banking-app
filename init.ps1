# init.ps1
Write-Host "Inicjalizacja projektu Bank App w środowisku Docker..."

# Sprawdź czy plik .env istnieje
if (-not (Test-Path .env)) {
    Write-Host "Tworzenie pliku .env z domyślnych ustawień..."
    Copy-Item .env.docker .env
}

# Utwórz potrzebne katalogi
Write-Host "Tworzenie katalogów dla przechowywania danych..."
New-Item -ItemType Directory -Force -Path storage/framework/sessions
New-Item -ItemType Directory -Force -Path storage/framework/views
New-Item -ItemType Directory -Force -Path storage/framework/cache
New-Item -ItemType Directory -Force -Path storage/logs

# Uruchom kontenery Docker
Write-Host "Uruchamianie kontenerów Docker..."
docker-compose down
docker-compose up -d

# Poczekaj, aż wszystkie kontenery będą gotowe
Write-Host "Oczekiwanie na uruchomienie kontenerów..."
Start-Sleep -Seconds 10

# Instaluj zależności PHP
Write-Host "Instalacja zależności PHP..."
docker-compose exec app composer install

# Wygeneruj klucz aplikacji
Write-Host "Generowanie klucza aplikacji..."
docker-compose exec app php artisan key:generate --no-interaction

# Wykonaj migracje bazy danych
Write-Host "Wykonywanie migracji bazy danych..."
docker-compose exec app php artisan migrate --force --no-interaction

# Instaluj zależności NPM i uruchom Vite
Write-Host "Uruchamianie serwera deweloperskiego Vite..."
docker-compose exec app npm install

Write-Host "====================================================="
Write-Host "Aplikacja bankowa została skonfigurowana w Dockerze!"
Write-Host "Otwórz http://localhost:8000 w przeglądarce"
Write-Host "====================================================="
