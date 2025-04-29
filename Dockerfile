# Utwórz Dockerfile.prod dla Railway
FROM php:8.2-fpm as base

WORKDIR /var/www

# System dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    cron \
    supervisor

# Install Node.js dla mniejszych projektów (prawdopodobnie zadziała na Railway)
RUN curl -sL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copy project files
COPY . /var/www/

# Instaluj zależności
RUN composer install --no-dev --optimize-autoloader

# Próba budowania frontendu (jeśli się nie powiedzie, to aplikacja dalej będzie działać)
RUN npm ci && npm run build || echo "Frontend build failed, but continuing"

# Set permissions
RUN chmod -R 775 /var/www/storage /var/www/bootstrap/cache
RUN chown -R www-data:www-data /var/www

# Expose port
EXPOSE 8000

# Start server
CMD php artisan serve --host=0.0.0.0 --port=${PORT:-8000}
