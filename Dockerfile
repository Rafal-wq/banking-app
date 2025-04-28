# Etap 1: Budowanie frontendu
FROM node:20-slim as frontend-builder
WORKDIR /app

# Dodaj diagnostykę
RUN node -v && npm -v
RUN npm config list

# Kopiuj tylko pliki package.json i package-lock.json
COPY package.json package-lock.json* ./

# Instalacja z różnymi opcjami
RUN npm cache clean --force && \
    npm config set registry https://registry.npmjs.org/ && \
    export NODE_OPTIONS=--max_old_space_size=4096 && \
    npm install --no-audit --no-fund --prefer-offline --legacy-peer-deps || \
    npm install --no-audit --no-fund --legacy-peer-deps --force

# Etap 2: Konfiguracja PHP
FROM php:8.2-fpm
WORKDIR /var/www

# System dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Install Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Copy project files
COPY . /var/www/

# Kopiuj skompilowane pliki z etapu 1
COPY --from=frontend-builder /app/public/build /var/www/public/build

# Install Composer dependencies
RUN composer install --no-dev --optimize-autoloader

# Set permissions
RUN chmod -R 775 /var/www/storage /var/www/bootstrap/cache
RUN chown -R www-data:www-data /var/www

# Expose port
EXPOSE 8000

# Start server
CMD php artisan serve --host=0.0.0.0 --port=8000
