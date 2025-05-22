#!/bin/bash
echo "Inicjalizacja projektu Bank App w środowisku Docker..."

# Zawsze kopiuj konfigurację Docker do .env (wymuszenie poprawnych ustawień)
echo "Kopiowanie konfiguracji Docker do .env..."
cp .env.docker .env
echo "Skopiowano poprawną konfigurację z .env.docker"

# Debug - pokaż aktualne ustawienia DB
echo "Aktualne ustawienia bazy danych:"
grep "DB_" .env

# Utwórz potrzebne katalogi
echo "Tworzenie katalogów dla przechowywania danych..."
mkdir -p storage/framework/{sessions,views,cache}
mkdir -p storage/logs
chmod -R 775 storage bootstrap/cache

# Uruchom kontenery Docker
echo "Uruchamianie kontenerów Docker..."
docker-compose down
docker-compose up -d

# Poczekaj, aż wszystkie kontenery będą gotowe - zwiększamy czas oczekiwania
echo "Oczekiwanie na uruchomienie kontenerów (może to potrwać do 2 minut)..."
sleep 30

# Sprawdź czy MySQL jest gotowy - znacznie dłuższe oczekiwanie
echo "Sprawdzanie gotowości MySQL..."
mysql_ready=false
for i in {1..120}; do  # 120 prób = 10 minut
    if docker-compose exec mysql mysql -u laravel -psecret -e "SELECT 1" >/dev/null 2>&1; then
        echo "MySQL jest gotowy po $((i*5)) sekundach!"
        mysql_ready=true
        break
    fi

    # Pokaż status co 6 prób (co 30 sekund)
    if [ $((i % 6)) -eq 0 ]; then
        echo "Próba $i/120: MySQL dalej się uruchamia... ($(docker-compose ps mysql | grep mysql | awk '{print $4}'))"
    fi
    sleep 5
done

if [ "$mysql_ready" = false ]; then
    echo "Błąd: MySQL nie odpowiada po 10 minutach!"
    echo "Sprawdź logi: docker-compose logs mysql"
    exit 1
fi

# Dodatkowe oczekiwanie po gotowości MySQL
echo "MySQL gotowy - czekam dodatkowe 10 sekund dla stabilności..."
sleep 10

# Sprawdź czy kontenery działają
echo "Sprawdzanie statusu kontenerów..."
docker-compose ps

# Instaluj zależności PHP
echo "Instalacja zależności PHP..."
docker-compose exec app composer install --no-interaction

# Sprawdź czy APP_KEY jest ustawiony, jeśli nie - wygeneruj
echo "Sprawdzanie klucza aplikacji..."
if ! docker-compose exec app php artisan config:show | grep -q "app.key.*base64:"; then
    echo "Generowanie klucza aplikacji..."
    docker-compose exec app php artisan key:generate --no-interaction --force
else
    echo "Klucz aplikacji już istnieje."
fi

# Wykonaj migracje bazy danych
echo "Wykonywanie migracji bazy danych..."
if docker-compose exec app php artisan migrate --force --no-interaction; then
    echo "Migracje wykonane pomyślnie!"

    # Poczekaj chwilę po migracjach
    sleep 5

    # Wyczyść cache po migracjach
    docker-compose exec app php artisan config:clear
    docker-compose exec app php artisan cache:clear
else
    echo "Błąd podczas wykonywania migracji!"
    exit 1
fi

# Sprawdź ponownie połączenie przed seeding z retry
echo "Sprawdzanie połączenia przed ładowaniem danych..."
for i in {1..10}; do
    if docker-compose exec mysql mysql -u laravel -psecret -e "SELECT 1" >/dev/null 2>&1; then
        echo "Połączenie MySQL OK. Ładowanie danych testowych..."
        if docker-compose exec app php artisan db:seed --no-interaction; then
            echo "Dane testowe załadowane pomyślnie!"
            break
        else
            echo "Błąd podczas ładowania danych testowych w próbie $i/10"
            sleep 5
        fi
    else
        echo "Próba $i/10: Brak połączenia z MySQL, czekam..."
        sleep 5
    fi

    if [ $i -eq 10 ]; then
        echo "Ostrzeżenie: Nie udało się załadować danych testowych po 10 próbach."
    fi
done

# Instaluj zależności NPM w dedykowanym kontenerze node
echo "Instalacja zależności NPM..."
docker-compose run --rm node install

# Zbuduj zasoby frontendowe
echo "Budowanie zasobów frontendowych..."
docker-compose run --rm node run build

echo "====================================================="
echo "Aplikacja bankowa została skonfigurowana w Dockerze!"
echo "Otwórz http://localhost:8000 w przeglądarce"
echo "====================================================="
echo ""
echo "Dane testowe:"
echo "Email: test@example.com"
echo "Hasło: password"
echo "====================================================="
