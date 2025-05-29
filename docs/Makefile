# Makefile dla dokumentacji Bank App
# Automatyczna kompilacja dokumentów LaTeX do PDF

# Katalogi
TECH_DIR = technical
USER_DIR = user
OUTPUT_DIR = output
IMAGES_DIR = images

# Pliki źródłowe
TECH_SOURCES = $(wildcard $(TECH_DIR)/*.tex)
USER_SOURCES = $(wildcard $(USER_DIR)/*.tex)
ALL_SOURCES = $(TECH_SOURCES) $(USER_SOURCES)

# Pliki PDF (cele)
TECH_PDFS = $(patsubst $(TECH_DIR)/%.tex,$(OUTPUT_DIR)/%.pdf,$(TECH_SOURCES))
USER_PDFS = $(patsubst $(USER_DIR)/%.tex,$(OUTPUT_DIR)/%.pdf,$(USER_SOURCES))
ALL_PDFS = $(TECH_PDFS) $(USER_PDFS)

# Domyślny cel
.PHONY: all
all: $(ALL_PDFS)

# Kompilacja dokumentów technicznych
$(OUTPUT_DIR)/%.pdf: $(TECH_DIR)/%.tex | $(OUTPUT_DIR)
	@echo "Kompilowanie $<..."
	cd $(TECH_DIR) && pdflatex -interaction=nonstopmode $(notdir $<)
	cd $(TECH_DIR) && pdflatex -interaction=nonstopmode $(notdir $<)
	mv $(TECH_DIR)/$(notdir $(@:.pdf=.pdf)) $@
	@echo "✓ Utworzono $@"

# Kompilacja dokumentów użytkownika (jeśli katalog istnieje)
$(OUTPUT_DIR)/%.pdf: $(USER_DIR)/%.tex | $(OUTPUT_DIR)
	@echo "Kompilowanie $<..."
	cd $(USER_DIR) && pdflatex -interaction=nonstopmode $(notdir $<)
	cd $(USER_DIR) && pdflatex -interaction=nonstopmode $(notdir $<)
	mv $(USER_DIR)/$(notdir $(@:.pdf=.pdf)) $@
	@echo "✓ Utworzono $@"

# Tworzenie katalogu output
$(OUTPUT_DIR):
	mkdir -p $(OUTPUT_DIR)

# Kompletna dokumentacja w jednym pliku
.PHONY: full-documentation
full-documentation: $(OUTPUT_DIR)/main.pdf

$(OUTPUT_DIR)/main.pdf: main.tex | $(OUTPUT_DIR)
	@echo "Kompilowanie kompletnej dokumentacji..."
	pdflatex -interaction=nonstopmode main.tex
	pdflatex -interaction=nonstopmode main.tex
	mv main.pdf $(OUTPUT_DIR)/
	@echo "✓ Utworzono $(OUTPUT_DIR)/main.pdf - kompletna dokumentacja aplikacji bankowej"

# Konkretne dokumenty (zachowujemy dla kompatybilności)
.PHONY: functional-description
functional-description: $(OUTPUT_DIR)/functional-description.pdf

.PHONY: technical-architecture
technical-architecture: $(OUTPUT_DIR)/technical-architecture.pdf

.PHONY: implementation-analysis
implementation-analysis: $(OUTPUT_DIR)/implementation-analysis.pdf

.PHONY: project-conclusions
project-conclusions: $(OUTPUT_DIR)/project-conclusions.pdf

.PHONY: deployment-guide
deployment-guide: $(OUTPUT_DIR)/deployment-guide.pdf

.PHONY: api-docs
api-docs: $(OUTPUT_DIR)/api-documentation.pdf

.PHONY: database-schema
database-schema: $(OUTPUT_DIR)/database-schema.pdf

.PHONY: user-manual
user-manual: $(OUTPUT_DIR)/user-manual.pdf

# Czyszczenie plików tymczasowych
.PHONY: clean
clean:
	@echo "Czyszczenie plików tymczasowych..."
	# Czyść katalog technical (zawsze istnieje)
	find $(TECH_DIR) -name "*.aux" -delete 2>/dev/null || true
	find $(TECH_DIR) -name "*.log" -delete 2>/dev/null || true
	find $(TECH_DIR) -name "*.toc" -delete 2>/dev/null || true
	find $(TECH_DIR) -name "*.out" -delete 2>/dev/null || true
	find $(TECH_DIR) -name "*.fdb_latexmk" -delete 2>/dev/null || true
	find $(TECH_DIR) -name "*.fls" -delete 2>/dev/null || true
	find $(TECH_DIR) -name "*.synctex.gz" -delete 2>/dev/null || true
	# Czyść katalog user (jeśli istnieje)
	@if [ -d "$(USER_DIR)" ]; then \
		find $(USER_DIR) -name "*.aux" -delete 2>/dev/null || true; \
		find $(USER_DIR) -name "*.log" -delete 2>/dev/null || true; \
		find $(USER_DIR) -name "*.toc" -delete 2>/dev/null || true; \
		find $(USER_DIR) -name "*.out" -delete 2>/dev/null || true; \
		find $(USER_DIR) -name "*.fdb_latexmk" -delete 2>/dev/null || true; \
		find $(USER_DIR) -name "*.fls" -delete 2>/dev/null || true; \
		find $(USER_DIR) -name "*.synctex.gz" -delete 2>/dev/null || true; \
	fi
	# Czyszczenie plików tymczasowych dla main.tex
	rm -f main.aux main.log main.toc main.out main.fdb_latexmk main.fls main.synctex.gz
	@echo "✓ Pliki tymczasowe wyczyszczone"

# Czyszczenie wszystkiego
.PHONY: cleanall
cleanall: clean
	@echo "Usuwanie wszystkich plików PDF..."
	rm -rf $(OUTPUT_DIR)/*.pdf
	@echo "✓ Wszystkie pliki PDF usunięte"

# Pomoc
.PHONY: help
help:
	@echo "Dostępne komendy:"
	@echo "  make all                     - Kompiluj wszystkie dokumenty (oddzielnie)"
	@echo "  make full-documentation      - Kompiluj kompletną dokumentację w jednym pliku"
	@echo "  make functional-description  - Kompiluj opis funkcjonalny"
	@echo "  make technical-architecture  - Kompiluj opis technologiczny"
	@echo "  make implementation-analysis - Kompiluj analizę implementacji"
	@echo "  make project-conclusions     - Kompiluj wnioski projektowe"
	@echo "  make deployment-guide        - Kompiluj przewodnik wdrożenia"
	@echo "  make api-docs               - Kompiluj dokumentację API"
	@echo "  make database-schema        - Kompiluj schemat bazy danych"
	@echo "  make user-manual            - Kompiluj instrukcję użytkownika"
	@echo "  make clean                  - Usuń pliki tymczasowe"
	@echo "  make cleanall               - Usuń wszystkie wygenerowane pliki"
	@echo "  make help                   - Pokaż tę pomoc"
	@echo ""
	@echo "ZALECANE: Użyj 'make full-documentation' dla kompletnej dokumentacji do oddania"

# Sprawdzenie zależności
.PHONY: check-deps
check-deps:
	@echo "Sprawdzanie zależności..."
	@command -v pdflatex >/dev/null 2>&1 || { echo "❌ pdflatex nie jest zainstalowany"; exit 1; }
	@echo "✓ pdflatex jest dostępny"
	@echo "✓ Wszystkie zależności są spełnione"
