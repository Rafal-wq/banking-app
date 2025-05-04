FROM composer:2 as build
WORKDIR /app
COPY . /app/
RUN composer install --prefer-dist --no-dev --optimize-autoloader --no-interaction

FROM php:8.2-cli
RUN docker-php-ext-install pdo pdo_mysql

COPY --from=build /app /var/www/html
WORKDIR /var/www/html

RUN touch .env

RUN chmod 777 -R /var/www/html/storage/ && \
    chown -R www-data:www-data /var/www/html && \
    chmod +x railway-server.php

EXPOSE 8000
CMD ["php", "railway-server.php"]
