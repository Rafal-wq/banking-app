#!/bin/bash
set -ex

echo "🚀 Starting initialization script..."

# Instalacja zależności systemowych
echo "📦 Installing system dependencies..."
apt-get update
apt-get install -y git zip unzip libpng-dev libzip-dev libonig-dev nodejs npm

# Instalacja rozszerzeń PHP
echo "🔌 Installing PHP extensions..."
docker-php-ext-install pdo pdo_mysql mbstring exif pcntl bcmath gd zip

# Konfiguracja Apache
echo "🔧 Configuring Apache..."
a2enmod rewrite
cp /var/www/html/000-default.conf /etc/apache2/sites-available/000-default.conf

# Instalacja Composera
echo "🎼 Installing Composer..."
curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Kopiowanie pliku środowiskowego i ustawienie APP_KEY
echo "📝 Setting up environment file..."
if [ -f /var/www/html/.env.docker ]; then
    cp /var/www/html/.env.docker /var/www/html/.env
    echo "Copied .env.docker to .env"
else
    echo "WARNING: .env.docker not found, using .env.example"
    cp /var/www/html/.env.example /var/www/html/.env
fi

# Sprawdź, czy plik .env istnieje i zawiera APP_KEY
if [ ! -f /var/www/html/.env ]; then
    echo "ERROR: .env file does not exist!"
    exit 1
fi

if ! grep -q "APP_KEY=" /var/www/html/.env; then
    echo "APP_KEY not found in .env, adding it..."
    echo "APP_KEY=base64:vKviGD1k0RF0dOLKTnAUWmn9JuwuF2Qgdin2IcC7ub8=" >> /var/www/html/.env
fi

# Instalacja zależności PHP
echo "📦 Installing PHP dependencies..."
cd /var/www/html
composer install --no-interaction

# Instalacja zależności JavaScript i budowanie assets
echo "🔨 Installing and building frontend assets..."
npm install
npm run build

# Ustawienie uprawnień
echo "🔐 Setting file permissions..."
mkdir -p /var/www/html/storage/logs
touch /var/www/html/storage/logs/laravel.log
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Generowanie klucza aplikacji (tylko jeśli nie istnieje)
echo "🔑 Generating application key..."
grep -q "APP_KEY=base64:" /var/www/html/.env || php artisan key:generate --force

# Czekaj na gotowość MySQL
echo "⏳ Waiting for MySQL to be ready..."
sleep 15

# Debugowanie połączenia z bazą danych
echo "🔍 Checking database connection..."
cat /var/www/html/.env | grep DB_
ping -c 3 mysql

# Konfiguracja aplikacji
echo "⚙️ Configuring application..."
php artisan config:clear
php artisan cache:clear
php artisan view:clear

# Wykonywanie migracji i seedowanie bazy danych
echo "🗃️ Running database migrations and seeders..."
php artisan migrate --force || echo "Migration failed, continuing anyway..."
php artisan db:seed --force || echo "Seeding failed, continuing anyway..."

# Lista katalogów i plików
echo "📋 Listing key directories and files..."
ls -la /var/www/html/
ls -la /var/www/html/public/
ls -la /var/www/html/storage/

# Restart Apache
echo "🔄 Restarting Apache..."
service apache2 restart

echo "✅ Initialization complete! Starting Apache..."

# Uruchomienie Apache w trybie foreground
apache2-foreground
