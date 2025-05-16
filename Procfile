<invoke name="artifacts">
<parameter name="command">create</parameter>
<parameter name="id">post-deploy-script</parameter>
<parameter name="type">application/vnd.ant.code</parameter>
<parameter name="title">.do/deploy.sh</parameter>
<parameter name="content">#!/bin/bash

# Utwórz katalogi do przechowywania danych, jeśli nie istnieją
mkdir -p storage/framework/{sessions,views,cache}
mkdir -p storage/logs

# Ustaw odpowiednie uprawnienia
chmod -R 775 storage bootstrap/cache

# Uruchom migracje bazy danych
php artisan migrate --force

# Optymalizuj aplikację
php artisan optimize
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "Zakończono skrypt post-deploy."
</parameter>
</invoke>
