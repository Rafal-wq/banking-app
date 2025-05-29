# Dokumentacja projektu Bank App

Ten katalog zawiera kompletną dokumentację techniczną i użytkownika dla aplikacji bankowej.

## Struktura dokumentacji

```
docs/
├── main.tex                          # ✨ GŁÓWNY PLIK - kompletna dokumentacja w jednym pliku
├── Makefile                          # Automatyzacja kompilacji
├── output/                           # Skompilowane pliki PDF
│   ├── main.pdf                      # 🎯 KOMPLETNA DOKUMENTACJA (zalecane do oddania)
│   ├── functional-description.pdf    # ✓ Dostępny
│   ├── technical-architecture.pdf    # ✓ Dostępny
│   ├── implementation-analysis.pdf   # ✓ Dostępny
│   ├── project-conclusions.pdf       # ✓ Dostępny (przemianowany)
│   └── deployment-guide.pdf          # ✓ Dostępny
├── technical/                        # Dokumentacja techniczna (modularna)
│   ├── functional-description.tex    # Opis funkcjonalny systemu
│   ├── technical-architecture.tex    # Opis technologiczny systemu
│   ├── implementation-analysis.tex   # Analiza implementacji zagadnień kwalifikacyjnych
│   ├── project-conclusions.tex       # Wnioski projektowe (przemianowany)
│   ├── deployment-guide.tex          # Przewodnik wdrożenia i uruchomienia systemu
│   ├── api-documentation.tex         # Dokumentacja API (planowane)
│   └── database-schema.tex           # Schemat bazy danych (planowane)
├── user/                             # Dokumentacja użytkownika
│   └── user-manual.tex               # Instrukcja użytkownika (planowane)
├── images/                           # Zasoby graficzne
└── README.md                         # Ten plik
```

## 🎯 Główna dokumentacja

### **main.pdf** - Kompletna dokumentacja do oddania

**ZALECANE:** Używaj `main.pdf` do oddania - zawiera wszystkie sekcje w jednym profesjonalnym dokumencie:

1. **Opis funkcjonalny systemu** - kompletny opis funkcjonalności
2. **Opis technologiczny** - architektura i stack technologiczny
3. **Wdrożone zagadnienia kwalifikacyjne** - wszystkie 18 zagadnień z przykładami
4. **Instrukcja uruchomienia systemu** - lokalne i zdalne uruchomienie
5. **Wnioski projektowe** - analiza, lekcje, rekomendacje

```bash
# Skompiluj główną dokumentację
make full-documentation

# Rezultat: output/main.pdf - gotowe do oddania! 🚀
```

## 📚 Dokumentacja modularna

### Dokumentacja techniczna (katalog technical/)

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

4. **Wnioski projektowe** (`project-conclusions.tex`) *(przemianowany)*
    - Podsumowanie realizacji celów projektowych
    - Analiza wyborów technologicznych i architektonicznych
    - Lekcje wyniesione z projektu
    - Rekomendacje dla przyszłych projektów
    - Możliwości dalszego rozwoju systemu

5. **Przewodnik wdrożenia i uruchomienia systemu** (`deployment-guide.tex`)
    - Instrukcja uruchomienia lokalnego (php artisan serve + npm run dev)
    - Dostęp do aplikacji zdalnej (http://209.38.233.137/)
    - Konfiguracja środowisk deweloperskiego i produkcyjnego
    - Rozwiązywanie problemów i optymalizacja

### Dokumentacja planowana

- **Dokumentacja API** - szczegółowy opis endpointów REST API
- **Schemat bazy danych** - diagramy ERD i opis tabel
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

### Kompilacja z Makefile (ZALECANA)

```bash
# 🎯 GŁÓWNA DOKUMENTACJA (do oddania)
make full-documentation
# Rezultat: output/main.pdf

# Sprawdź dostępne komendy
make help

# Kompiluj wszystkie dokumenty modularnie
make all

# Wyczyść pliki tymczasowe
make clean

# Wyczyść wszystko włącznie z PDF
make cleanall
```

### Kompilacja ręczna

```bash
# Główna dokumentacja
pdflatex main.tex
pdflatex main.tex  # Druga kompilacja dla ToC
mv main.pdf output/

# Lub konkretny dokument modularny
cd technical/
pdflatex functional-description.tex
pdflatex functional-description.tex
mv functional-description.pdf ../output/
```

### Dostępne komendy Makefile

| Komenda | Opis |
|---------|------|
| `make full-documentation` | **🎯 Kompiluj główną dokumentację (ZALECANE)** |
| `make all` | Kompiluj wszystkie dokumenty modularnie |
| `make functional-description` | Kompiluj opis funkcjonalny |
| `make technical-architecture` | Kompiluj opis technologiczny |
| `make implementation-analysis` | Kompiluj analizę implementacji |
| `make project-conclusions` | Kompiluj wnioski projektowe |
| `make deployment-guide` | Kompiluj przewodnik wdrożenia |
| `make api-docs` | Kompiluj dokumentację API |
| `make database-schema` | Kompiluj schemat bazy danych |
| `make user-manual` | Kompiluj instrukcję użytkownika |
| `make clean` | Usuń pliki tymczasowe |
| `make cleanall` | Usuń wszystkie wygenerowane pliki |
| `make check-deps` | Sprawdź zależności LaTeX |
| `make help` | Pokaż pomoc |

## 🔄 Workflow dokumentacji

### Do oddania projektów/prac (ZALECANE)
```bash
make full-documentation
# Oddaj: output/main.pdf
```

### Do pracy zespołowej/modularnej
```bash
make all
# Edytuj: technical/*.tex
# Kompiluj: make [konkretny-dokument]
```

### Do development/debugowania
```bash
make clean
make full-documentation
# Sprawdź: output/main.pdf
```

## 📝 Zmiany w strukturze

### Co się zmieniło?

1. **➕ Dodany `main.tex`** - główny plik z kompletną dokumentacją
2. **🔄 Przemianowany plik** - `wnioski-projektowe.tex` → `project-conclusions.tex` (spójność nazewnictwa)
3. **⚡ Zaktualizowany Makefile** - nowy cel `make full-documentation`
4. **📖 Nowy workflow** - główna dokumentacja + opcjonalne moduły

### Dlaczego te zmiany?

- **Profesjonalny wygląd** - jeden dokument do oddania
- **Spójność** - wszystko w jednym pliku z ciągłą numeracją
- **Łatwość oceny** - jeden PDF zamiast pięciu osobnych
- **Zachowana modularność** - możliwość edycji pojedynczych sekcji

## Dodawanie nowej dokumentacji

1. Utwórz nowy plik `.tex` w odpowiednim katalogu:
    - `technical/` - dla dokumentacji technicznej
    - `user/` - dla dokumentacji użytkownika

2. Użyj szablonu z istniejących dokumentów jako wzór

3. **Dla dokumentacji modularnej** - dodaj nowy target do `Makefile`:
   ```makefile
   .PHONY: new-document
   new-document: $(OUTPUT_DIR)/new-document.pdf
   ```

4. **Dla głównej dokumentacji** - dodaj sekcję do `main.tex`:
   ```latex
   \section{Nowa sekcja}
   % Zawartość lub \input{sections/new-section.tex}
   ```

5. Zaktualizuj ten `README.md`

6. Przetestuj kompilację:
   ```bash
   make new-document  # dla modularnej
   make full-documentation  # dla głównej
   ```

## Konwencje dokumentacji

### Nazewnictwo plików
- **Modułowe**: kebab-case `my-document.tex`
- **Główny plik**: `main.tex`
- **Język nazw**: angielski (spójność techniczna)
- **Encoding**: UTF-8

### Język i format
- **Treść dokumentacji**: polski
- **Komentarze w LaTeX**: polski
- **Nazwy plików**: angielski
- **Font size**: 12pt, **Paper**: A4, **Margins**: 2.5cm

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

| Dokument | Status | Typ |
|----------|--------|-----|
| **main.pdf** | ✅ **Kompiluje** | **🎯 Główna dokumentacja** |
| functional-description.pdf | ✅ Kompiluje | 📄 Modularny |
| technical-architecture.pdf | ✅ Kompiluje | 📄 Modularny |
| implementation-analysis.pdf | ✅ Kompiluje | 📄 Modularny |
| project-conclusions.pdf | ✅ Kompiluje | 📄 Modularny (przemianowany) |
| deployment-guide.pdf | ✅ Kompiluje | 📄 Modularny |
| api-documentation.pdf | ⏳ Planowane | 📄 Modularny |
| database-schema.pdf | ⏳ Planowane | 📄 Modularny |
| user-manual.pdf | ⏳ Planowane | 📄 Modularny |

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
make full-documentation

# Sprawdź logi błędów
cat main.log
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

### Problemy z główną dokumentacją
```bash
# Jeśli main.tex nie kompiluje się
make clean
pdflatex main.tex
pdflatex main.tex  # Druga kompilacja dla spisu treści
mv main.pdf output/

# Lub sprawdź szczegóły błędu
cat main.log
```

## 🚀 Quick Start

```bash
# 1. Sklonuj repozytorium i przejdź do docs/
cd docs/

# 2. Sprawdź zależności
make check-deps

# 3. Kompiluj główną dokumentację
make full-documentation

# 4. Otwórz rezultat
open output/main.pdf  # macOS
xdg-open output/main.pdf  # Linux
start output/main.pdf  # Windows
```

**Gotowe! 🎉** Masz kompletną dokumentację w `output/main.pdf` gotową do oddania.
