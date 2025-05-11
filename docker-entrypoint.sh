#!/bin/sh

# Instaluj zależności Composera (jeśli /vendor nie istnieje)
if [ ! -d "/var/www/vendor" ]; then
    echo "Brak katalogu vendor. Instalowanie zależności Composera..."
    composer install --no-interaction --no-plugins --no-scripts
else
    echo "Katalog vendor istnieje. Pomijam instalację zależności Composera."
fi

# Czekaj na gotowość bazy danych
echo "Oczekiwanie na bazę danych..."
until nc -z -v -w30 mysql 3306
do
  echo "Oczekiwanie na uruchomienie MySQL..."
  sleep 5
done
echo "MySQL jest dostępny"

# Jeśli nie istnieje APP_KEY, generuj go
if [ -z "$(grep '^APP_KEY=' .env | grep -v '=$')" ]; then
    echo "Brak APP_KEY. Generowanie..."
    php artisan key:generate
else
    echo "APP_KEY istnieje. Pomijam generowanie."
fi

# Uruchom migracje bazy danych
echo "Uruchamianie migracji bazy danych..."
php artisan migrate --force

# Uruchom polecenie przekazane jako argument dla tego skryptu
exec "$@"
