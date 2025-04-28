FROM php:8.2-fpm

# System dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    nodejs \
    npm

RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

# Clear cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Install Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Set working directory
WORKDIR /var/www

# Copy project files
COPY . /var/www/

# Install Composer dependencies
RUN composer install --no-dev --optimize-autoloader

# Install NPM dependencies and build assets
RUN npm install && npm run build

# Set permissions
RUN chown -R www-data:www-data /var/www

# Expose port
EXPOSE 8000

# Start server
CMD php artisan serve --host=0.0.0.0 --port=8000
