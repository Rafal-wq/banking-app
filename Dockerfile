FROM composer:2 as build
WORKDIR /app
COPY . /app/
RUN composer install --prefer-dist --no-dev --optimize-autoloader --no-interaction

FROM php:8.2-cli
RUN docker-php-ext-install pdo pdo_mysql

COPY --from=build /app /var/www/html
WORKDIR /var/www/html

# Utwórz plik .env jeśli nie istnieje
RUN touch .env

# Ustaw odpowiednie uprawnienia
RUN chmod 777 -R /var/www/html/storage/ && \
    chown -R www-data:www-data /var/www/html

# Utwórz skrypt startowy dla Railway
RUN echo '#!/bin/bash\nphp -S 0.0.0.0:${PORT:-8000} -t public' > /var/www/html/start.sh && \
    chmod +x /var/www/html/start.sh

# Domyślny port
ENV PORT=8000

# Railway będzie nadpisywał tę zmienną
EXPOSE $PORT

# Użyj skryptu powłoki
CMD ["/bin/bash", "/var/www/html/start.sh"]
