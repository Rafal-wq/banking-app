FROM composer:2 as build
WORKDIR /app
COPY . /app/
RUN composer install --prefer-dist --no-dev --optimize-autoloader --no-interaction

FROM php:8.2-apache
RUN docker-php-ext-install pdo pdo_mysql

COPY --from=build /app /var/www/html
COPY docker/000-default.conf /etc/apache2/sites-available/000-default.conf
COPY docker/apache2.conf /etc/apache2/apache2.conf
COPY .env.production /var/www/html/.env

RUN chmod 777 -R /var/www/html/storage/ && \
    echo "Listen \${PORT}" > /etc/apache2/ports.conf && \
    chown -R www-data:www-data /var/www/ && \
    a2enmod rewrite

EXPOSE 8080
CMD ["apache2-foreground"]
