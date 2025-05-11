FROM php:8.2-fpm

# Argumenty używane podczas budowy
ARG user=laravel
ARG uid=1000

# Instalacja zależności systemowych
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libzip-dev \
    zip \
    unzip \
    libfreetype6-dev \
    libjpeg62-turbo-dev \
    libpng-dev

# Konfiguracja i instalacja rozszerzeń PHP
RUN docker-php-ext-configure gd --with-freetype --with-jpeg
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip

# Pobieranie i instalacja Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Tworzenie użytkownika systemowego dla aplikacji
RUN useradd -G www-data,root -u $uid -d /home/$user $user
RUN mkdir -p /home/$user/.composer && \
    chown -R $user:$user /home/$user

# Ustawienie katalogu roboczego
WORKDIR /var/www

# Kopiowanie plików projektu
COPY . /var/www
COPY --chown=$user:$user . /var/www

# Zmiana uprawnień dla przechowywania przesłanych plików
RUN chown -R $user:www-data /var/www/storage /var/www/bootstrap/cache
RUN chmod -R 775 /var/www/storage /var/www/bootstrap/cache

# Przełączenie na użytkownika aplikacji
USER $user

# Odsłonięcie portu 9000 dla PHP-FPM
EXPOSE 9000

# Skrypt startowy
CMD ["php-fpm"]
