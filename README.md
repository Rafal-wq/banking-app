# Dokumentacja projektu Bank App

Ten katalog zawiera kompletną dokumentację techniczną i użytkownika dla aplikacji bankowej.

## Struktura dokumentacji

```
docs/
├── technical/                        # Dokumentacja techniczna
│   ├── functional-description.tex    # Opis funkcjonalny systemu
│   ├── technical-architecture.tex    # Opis technologiczny systemu
│   ├── implementation-analysis.tex   # Analiza implementacji zagadnień kwalifikacyjnych
│   ├── api-documentation.tex         # Dokumentacja API (planowane)
│   ├── database-schema.tex           # Schemat bazy danych (planowane)
│   ├── deployment-guide.tex           # Przewodnik wdrożenia i uruchomienia systemu
├── user/                             # Dokumentacja użytkownika
│   └── user-manual.tex               # Instrukcja użytkownika (planowane)
├── images/                           # Zasoby graficzne
├── output/                           # Skompilowane pliki PDF
│   ├── functional-description.pdf    # ✓ Dostępny
│   ├── technical-architecture.pdf    # ✓ Dostępny
│   ├── implementation-analysis.pdf   # ✓ Dostępny
│   └── deployment-guide.pdf          # ✓ Dostępny
├── Makefile                          # Automatyzacja kompilacji
└── README.md                         # Ten plik
```

## Istniejące dokumenty

### Dokumentacja techniczna

1. **Opis funkcjonalny systemu** (`functional-description.tex`)
    - Wprowadzenie do aplikacji bankowej
    - Szczegółowy opis modułów funkcjonalnych
    - Bezpieczeństwo i interfejs użytkownika
    - Integracje zewnętrzne i architektura

2. **Opis technologiczny systemu** (`technical-architecture.tex`)
    - Stos technologiczny (Laravel 12, React 18, MySQL 8.0)
    - Architektura Modern Monolith
    - Szczegóły implementacji backend i frontend
    - Deployment i infrastruktura

3. **Analiza implementacji zagadnień kwalifikacyjnych** (`implementation-analysis.tex`)
    - 18 zagadnień kwalifikacyjnych z przykładami kodu
    - Framework MVC, CSS, baza danych, cache
    - Uwierzytelnianie, mailing, formularze
    - RWD, logger, deployment i więcej

4. **Przewodnik wdrożenia i uruchomienia systemu** (`deployment-guide.tex`)
    - Instrukcja uruchomienia lokalnego (php artisan serve + npm run dev)
    - Dostęp do aplikacji zdalnej (http://209.38.233.137/)
    - Konfiguracja środowisk deweloperskiego i produkcyjnego
    - Rozwiązywanie problemów i optymalizacja wdrożenia i uruchomienia systemu** (`deployment-guide.tex`)
    - Instrukcja uruchomienia lokalnego (php artisan serve + npm run dev)
    - Dostęp do aplikacji zdalnej (http://209.38.233.137/)
    - Konfiguracja środowisk deweloperskiego i produkcyjnego
    - Rozwiązywanie problemów i optymalizacja

### Dokumentacja planowana

- **Dokumentacja API** - szczegółowy opis endpointów REST API
- **Schemat bazy danych** - diagramy ERD i opis tabel
- **Przewodnik wdrożenia** - instrukcje deployment na różne środowiska
- **Instrukcja użytkownika** - przewodnik dla końcowych użytkowników

## Kompilacja dokumentacji

### Wymagania
- LaTeX (TeX Live, MiKTeX lub podobna dystrybucja)
- pdflatex
- Polskie pakiety językowe

### Instalacja LaTeX

**Windows:**
```bash
# Zainstaluj MiKTeX z https://miktex.org/
# Lub przez Chocolatey:
choco install miktex
```

**macOS:**
```bash
# Zainstaluj MacTeX z https://www.tug.org/mactex/
# Lub przez Homebrew:
brew install --cask mactex
```

**Ubuntu/Debian:**
```bash
sudo apt-get install texlive-full
sudo apt-get install texlive-lang-polish
```

### Kompilacja ręczna

```bash
# Przejdź do katalogu z dokumentacją
cd docs/technical

# Kompiluj konkretny dokument
pdflatex functional-description.tex
pdflatex functional-description.tex  # Druga kompilacja dla ToC

# Przenieś PDF do katalogu output
mv functional-description.pdf ../output/
```

### Automatyczna kompilacja (Makefile)

Użyj dołączonego Makefile dla wygodnej kompilacji:

```bash
# Kompiluj wszystkie dokumenty
make all

# Kompiluj konkretne dokumenty
make functional-description
make technical-architecture
make implementation-analysis

# Sprawdź dostępne komendy
make help

# Wyczyść pliki tymczasowe
make clean

# Wyczyść wszystko włącznie z PDF
make cleanall
```

### Dostępne komendy Makefile

| Komenda | Opis |
|---------|------|
| `make all` | Kompiluj wszystkie dokumenty |
| `make functional-description` | Kompiluj opis funkcjonalny |
| `make technical-architecture` | Kompiluj opis technologiczny |
| `make implementation-analysis` | Kompiluj analizę implementacji |
| `make api-docs` | Kompiluj dokumentację API |
| `make deployment-guide` | Kompiluj przewodnik wdrożenia |
| `make database-schema` | Kompiluj schemat bazy danych |
| `make user-manual` | Kompiluj instrukcję użytkownika |
| `make clean` | Usuń pliki tymczasowe |
| `make cleanall` | Usuń wszystkie wygenerowane pliki |
| `make check-deps` | Sprawdź zależności LaTeX |
| `make help` | Pokaż pomoc |

## Dodawanie nowej dokumentacji

1. Utwórz nowy plik `.tex` w odpowiednim katalogu:
    - `technical/` - dla dokumentacji technicznej
    - `user/` - dla dokumentacji użytkownika

2. Użyj szablonu z istniejących dokumentów jako wzór

3. Dodaj nowy target do `Makefile`:
   ```makefile
   .PHONY: new-document
   new-document: $(OUTPUT_DIR)/new-document.pdf
   ```

4. Zaktualizuj ten `README.md`:
    - Dodaj do struktury katalogów
    - Opisz zawartość dokumentu
    - Dodaj do tabeli komend Makefile

5. Przetestuj kompilację:
   ```bash
   make new-document
   make all
   ```

## Konwencje dokumentacji

### Nazewnictwo plików
- Używaj kebab-case: `my-document.tex`
- Opisowe nazwy: `api-documentation.tex`
- Rozszerzenie `.tex` dla źródeł LaTeX

### Język i format
- **Dokumentacja techniczna**: polski
- **Komentarze w kodzie LaTeX**: polski
- **Nazwy plików i katalogów**: angielski
- **Encoding**: UTF-8
- **Font size**: 12pt
- **Paper**: A4
- **Margins**: 2.5cm

### Struktura dokumentu
```latex
\documentclass[12pt,a4paper]{article}
\usepackage[utf8]{inputenc}
\usepackage[polish]{babel}
\usepackage[T1]{fontenc}
% ... inne pakiety

\title{\textbf{Tytuł Dokumentu}}
\author{Dokumentacja techniczna}
\date{\today}

\begin{document}
\maketitle
\tableofcontents
\newpage

\section{Wprowadzenie}
% Zawartość...

\end{document}
```

## Status kompilacji

| Dokument | Status | Ostatnia aktualizacja |
|----------|--------|-----------------------|
| functional-description.pdf | ✅ Kompiluje | - |
| technical-architecture.pdf | ✅ Kompiluje | - |
| implementation-analysis.pdf | ✅ Kompiluje | - |
| deployment-guide.pdf | ✅ Kompiluje | - |
| api-documentation.pdf | ⏳ Planowane | - |
| database-schema.pdf | ⏳ Planowane | - |
| user-manual.pdf | ⏳ Planowane | - |

## Przydatne linki

- [LaTeX Documentation](https://www.latex-project.org/help/documentation/)
- [Polish LaTeX Guide](http://www.gust.org.pl/)
- [Overleaf LaTeX Tutorial](https://www.overleaf.com/learn)
- [Makefile Tutorial](https://makefiletutorial.com/)

## Rozwiązywanie problemów

### Błędy kompilacji LaTeX
```bash
# Sprawdź instalację LaTeX
make check-deps

# Wyczyść pliki tymczasowe i spróbuj ponownie
make clean
make functional-description

# Sprawdź logi błędów w katalogu technical/
cat technical/*.log
```

### Problemy z polskimi znakami
Upewnij się, że:
- Plik jest zapisany w UTF-8
- Używasz pakietów `\usepackage[utf8]{inputenc}` i `\usepackage[polish]{babel}`
- Masz zainstalowane polskie pakiety LaTeX

### Brakujące pakiety LaTeX
```bash
# Ubuntu/Debian
sudo apt-get install texlive-lang-polish texlive-latex-extra

# macOS z MacTeX
# Pakiety powinny być już zainstalowane

# Windows z MiKTeX
# Pakiety instalują się automatycznie przy pierwszym użyciu
```
