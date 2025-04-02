# Aplikacja Bankowa

Nowoczesna aplikacja bankowości internetowej zbudowana przy użyciu Laravel i React, oferująca podstawowe usługi bankowe, w tym zarządzanie kontami, przelewy i śledzenie historii transakcji.

## Funkcje

- **Uwierzytelnianie Użytkowników**: Bezpieczne logowanie, rejestracja i odzyskiwanie hasła
- **Zarządzanie Kontami**: Tworzenie i zarządzanie wieloma kontami bankowymi w różnych walutach
- **Operacje Finansowe**: Wpłaty i wypłaty środków z kont
- **Przelewy**: Przesyłanie pieniędzy między kontami z historią transakcji
- **Aktualizacje Salda w Czasie Rzeczywistym**: Natychmiastowy podgląd zmian salda po transakcjach
- **Obsługa Wielu Walut**: Obsługa kont w PLN, EUR, USD i GBP

## Technologie

### Backend
- **Laravel 12**: Framework PHP do solidnego rozwoju backendu
- **Sanctum**: System uwierzytelniania API
- **MySQL/SQLite**: Przechowywanie danych
- **Eloquent ORM**: Mapowanie obiektowo-relacyjne bazy danych

### Frontend
- **React**: Biblioteka frontendowa do budowania interfejsów użytkownika
- **Inertia.js**: Łączy Laravel i React bez konieczności budowania oddzielnego API
- **Tailwind CSS**: Framework CSS typu utility-first do stylizacji
- **Headless UI**: Dostępne komponenty UI bez stylizacji

## Wymagania Systemowe

- PHP 8.2 lub wyższy
- Composer
- Node.js i npm
- Baza danych (MySQL, PostgreSQL lub SQLite)

## Instalacja

1. **Klonowanie repozytorium**

```bash
git clone https://github.com/twoj-username/aplikacja-bankowa.git
cd aplikacja-bankowa
```

2. **Instalacja zależności PHP**

```bash
composer install
```

3. **Instalacja zależności JavaScript**

```bash
npm install
```

4. **Konfiguracja środowiska**

```bash
cp .env.example .env
php artisan key:generate
```

5. **Konfiguracja bazy danych**

Edytuj plik `.env` i ustaw dane połączenia z bazą danych:

```
DB_CONNECTION=sqlite
# Lub użyj ustawień MySQL/PostgreSQL
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=laravel
# DB_USERNAME=root
# DB_PASSWORD=
```

6. **Uruchomienie migracji i seedów**

```bash
php artisan migrate --seed
```

7. **Uruchomienie serwerów programistycznych**

```bash
# Terminal 1: Serwer Laravel
php artisan serve

# Terminal 2: Serwer programistyczny Vite
npm run dev
```

## Użytkowanie

Po instalacji, dostęp do aplikacji jest możliwy pod adresem `http://localhost:8000`.

### Domyślny Użytkownik Testowy
- Email: test@example.com
- Hasło: password

## Endpointy API

Aplikacja udostępnia API RESTful do operacji bankowych:

### Uwierzytelnianie
- `POST /api/login`: Uwierzytelnienie użytkownika
- `POST /api/register`: Rejestracja nowego użytkownika
- `POST /api/logout`: Wylogowanie bieżącego użytkownika

### Konta Bankowe
- `GET /api/bank-accounts`: Lista kont bankowych użytkownika
- `POST /api/bank-accounts`: Utworzenie nowego konta bankowego
- `GET /api/bank-accounts/{id}`: Podgląd konkretnego konta bankowego
- `PATCH /api/bank-accounts/{id}`: Aktualizacja konta bankowego
- `DELETE /api/bank-accounts/{id}`: Usunięcie konta bankowego
- `POST /api/bank-accounts/{id}/deposit`: Wpłata pieniędzy
- `POST /api/bank-accounts/{id}/withdraw`: Wypłata pieniędzy

### Transakcje
- `GET /api/transactions`: Lista transakcji użytkownika
- `POST /api/transactions`: Utworzenie nowej transakcji
- `GET /api/transactions/{id}`: Podgląd konkretnej transakcji
- `GET /api/bank-accounts/{id}/transactions`: Pobieranie transakcji dla konta

## Struktura Projektu

```
app/
├── Http/
│   ├── Controllers/         # Kontrolery API i web
│   ├── Middleware/          # Middleware aplikacji
│   └── Requests/            # Klasy walidacji formularzy
├── Models/                  # Modele Eloquent
│   ├── User.php
│   ├── BankAccount.php
│   └── Transaction.php
database/
├── migrations/              # Migracje bazy danych
└── seeders/                 # Seedy bazy danych
resources/
├── js/                      # Komponenty frontendowe React
│   ├── Pages/               # Komponenty stron
│   └── Components/          # Komponenty wielokrotnego użytku
routes/
├── api.php                  # Trasy API
└── web.php                  # Trasy webowe
```

## Testowanie

Aplikacja zawiera kompleksowy zestaw testów:

```bash
# Uruchomienie wszystkich testów
php artisan test

# Uruchomienie konkretnego testu
php artisan test --filter BankApiTest
```

## Aspekty Bezpieczeństwa

- Wszystkie endpointy API są chronione uwierzytelnianiem Sanctum
- Haszowanie haseł za pomocą bcrypt
- Ochrona CSRF dla tras webowych
- Walidacja danych wejściowych dla wszystkich żądań
- Kontrola uprawnień dla operacji na kontach i transakcjach

## Planowane Udoskonalenia

- Wyciągi z konta i eksporty
- Przelewy planowane
- Przelewy międzynarodowe
- Integracja z aplikacją mobilną
- Uwierzytelnianie dwuskładnikowe
- Panel administracyjny
- Integracje płatności

## Licencja

Ten projekt jest oprogramowaniem open-source na licencji MIT.
