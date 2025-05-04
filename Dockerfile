FROM composer:2 as build
WORKDIR /app
COPY . /app/
RUN composer install --prefer-dist --no-dev --optimize-autoloader --no-interaction

FROM php:8.2-apache
RUN docker-php-ext-install pdo pdo_mysql

COPY --from=build /app /var/www/html
COPY docker/000-default.conf /etc/apache2/sites-available/000-default.conf
COPY docker/apache2.conf /etc/apache2/apache2.conf

RUN touch /var/www/html/.env

# Utwórz skrypt startowy, który będzie prawidłowo interpretował zmienną PORT
RUN echo '#!/bin/bash\n\
echo "Listen ${PORT:-8080}" > /etc/apache2/ports.conf\n\
apache2-foreground' > /var/www/html/start.sh && \
    chmod +x /var/www/html/start.sh

RUN chmod 777 -R /var/www/html/storage/ && \
    chown -R www-data:www-data /var/www/

EXPOSE 8080
# Użyj skryptu startowego zamiast bezpośrednio apache2-foreground
CMD ["/var/www/html/start.sh"]
