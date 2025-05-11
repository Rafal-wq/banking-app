#!/bin/bash

# Upewnij się, że wszystkie kontenery zostały zbudowane i uruchomione
docker-compose up -d

# Komenda jaką chcemy wykonać (podana jako argument)
if [ -z "$1" ]; then
    echo "Użycie: ./docker-compose-run.sh [komenda]"
    echo "Przykład: ./docker-compose-run.sh php artisan migrate"
    exit 1
fi

# Uruchom komendę w kontenerze aplikacji
docker-compose exec app "$@"
