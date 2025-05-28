# Dokumentacja projektu Bank App

Ten katalog zawiera kompletną dokumentację techniczną i użytkownika dla aplikacji bankowej.

## Struktura dokumentacji

```
docs/
├── technical/              # Dokumentacja techniczna
│   ├── functional-description.tex    # Opis funkcjonalny systemu
│   ├── api-documentation.tex         # Dokumentacja API (planowane)
│   ├── database-schema.tex           # Schemat bazy danych (planowane)
│   └── deployment-guide.tex          # Przewodnik wdrożenia (planowane)
├── user/                   # Dokumentacja użytkownika
│   └── user-manual.tex               # Instrukcja użytkownika (planowane)
├── images/                 # Zasoby graficzne
├── output/                 # Skompilowane pliki PDF
└── README.md              # Ten plik
```

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

# Kompiluj dokument
pdflatex functional-description.tex
pdflatex functional-description.tex  # Druga kompilacja dla ToC

# Przenieś PDF do katalogu output
mv functional-description.pdf ../output/
```

### Automatyczna kompilacja (Makefile)

Użyj dołączonego Makefile:

```bash
# Kompiluj wszystkie dokumenty
make all

# Kompiluj konkretny dokument
make functional-description

# Wyczyść pliki tymczasowe
make clean

# Wyczyść wszystko włącznie z PDF
make cleanall
```

## Dodawanie nowej dokumentacji

1. Utwórz nowy plik `.tex` w odpowiednim katalogu
2. Użyj szablonu z istniejących dokumentów
3. Dodaj nowy target do Makefile
4. Zaktualizuj ten README

## Konwencje

### Nazewnictwo plików
- Używaj kebab-case: `my-document.tex`
- Opisowe nazwy: `api-documentation.tex`
- Rozszerzenie `.tex` dla źródeł

### Język
- Dokumentacja techniczna: polski
- Komentarze w kodzie LaTeX: polski
- Nazwy plików i katalogów: angielski

### Formatowanie
- Encoding: UTF-8
- Font size: 12pt
- Paper: A4
- Margins: 2.5cm

## Przydatne linki

- [LaTeX Documentation](https://www.latex-project.org/help/documentation/)
- [Polish LaTeX Guide](http://www.gust.org.pl/)
- [Overleaf LaTeX Tutorial](https://www.overleaf.com/learn)
