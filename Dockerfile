FROM php:8.2-cli

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
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copy project files
COPY . /var/www/

# Install dependencies
RUN composer install --no-dev --optimize-autoloader

# Upewnij się, że katalogi są zapisywalne
RUN chmod -R 775 /var/www/storage /var/www/bootstrap/cache

# Utwórz skrypt startowy z poprawnym formatem
RUN echo '#!/bin/bash\n\nPORT="${PORT:-8000}"\necho "Starting server on port $PORT"\nexec php -S 0.0.0.0:$PORT -t public' > start.sh && chmod +x start.sh

# Komenda do uruchomienia aplikacji
CMD ["./start.sh"]
