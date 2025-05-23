# init.ps1
Write-Host "Inicjalizacja projektu Bank App w srodowisku Docker..."

# Sprawdz czy plik .env istnieje
if (-not (Test-Path .env)) {
    Write-Host "Tworzenie pliku .env z domyslnych ustawien..."
    Copy-Item .env.docker .env
}

# Utworz potrzebne katalogi
Write-Host "Tworzenie katalogow dla przechowywania danych..."
New-Item -ItemType Directory -Force -Path storage/framework/sessions
New-Item -ItemType Directory -Force -Path storage/framework/views
New-Item -ItemType Directory -Force -Path storage/framework/cache
New-Item -ItemType Directory -Force -Path storage/logs
# Utworzenie katalogu dla vite
New-Item -ItemType Directory -Force -Path public/build

# Uruchom kontenery Docker
Write-Host "Uruchamianie kontenerow Docker..."
docker-compose down
docker-compose up -d

# Poczekaj, az wszystkie kontenery beda gotowe
Write-Host "Oczekiwanie na uruchomienie kontenerow..."
Start-Sleep -Seconds 10

# Instaluj zaleznosci PHP
Write-Host "Instalacja zaleznosci PHP..."
docker-compose exec app composer install --no-interaction

# Wygeneruj klucz aplikacji
Write-Host "Generowanie klucza aplikacji..."
docker-compose exec app php artisan key:generate --no-interaction

# Wykonaj migracje bazy danych
Write-Host "Wykonywanie migracji bazy danych..."
docker-compose exec app php artisan migrate --force --no-interaction

# Uruchom kontener node, aby zainstalować zależności i zbudować frontend
Write-Host "Uruchamianie serwera deweloperskiego Vite..."
docker-compose run --rm node sh -c "npm install && npm run build"

# Czyszczenie cache po zbudowaniu
Write-Host "Czyszczenie cache..."
docker-compose exec app php artisan config:clear
docker-compose exec app php artisan cache:clear
docker-compose exec app php artisan view:clear
docker-compose exec app php artisan route:clear

Write-Host "====================================================="
Write-Host "Aplikacja bankowa zostala skonfigurowana w Dockerze!"
Write-Host "Otworz http://localhost:8000 w przegladarce"
Write-Host "====================================================="
