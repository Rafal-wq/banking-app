<?php

namespace App\Services;

class CurrencyExchangeService
{
    /**
     * Stałe kursy walut dla uproszczenia (w rzeczywistej aplikacji powinny być pobierane z API)
     * Kursy są w stosunku do PLN (1 jednostka obcej waluty = X PLN)
     */
    protected $exchangeRates = [
        'PLN' => 1.0,
        'EUR' => 4.55,    // 1 EUR = 4.55 PLN
        'USD' => 4.00,    // 1 USD = 4.00 PLN
        'GBP' => 5.30     // 1 GBP = 5.30 PLN
    ];

    /**
     * Oblicz kurs wymiany między dwiema walutami
     *
     * @param string $fromCurrency Waluta źródłowa
     * @param string $toCurrency Waluta docelowa
     * @return float Kurs wymiany (1 jednostka waluty źródłowej = X jednostek waluty docelowej)
     */
    public function getExchangeRate(string $fromCurrency, string $toCurrency): float
    {
        if ($fromCurrency === $toCurrency) {
            return 1.0;
        }

        // Najpierw przeliczamy na PLN, a potem na walutę docelową
        $fromToPln = $this->exchangeRates[$fromCurrency];
        $plnToTarget = 1 / $this->exchangeRates[$toCurrency];

        return round($fromToPln * $plnToTarget, 6);
    }

    /**
     * Przelicz kwotę z jednej waluty na drugą
     *
     * @param float $amount Kwota do przeliczenia
     * @param string $fromCurrency Waluta źródłowa
     * @param string $toCurrency Waluta docelowa
     * @return float Przeliczona kwota
     */
    public function convert(float $amount, string $fromCurrency, string $toCurrency): float
    {
        $rate = $this->getExchangeRate($fromCurrency, $toCurrency);
        return round($amount * $rate, 2);
    }

    /**
     * Pobierz wszystkie dostępne kursy walut
     *
     * @return array Tablica kursów walut
     */
    public function getAllExchangeRates(): array
    {
        $rates = [];

        foreach ($this->exchangeRates as $baseCurrency => $baseRate) {
            foreach ($this->exchangeRates as $targetCurrency => $targetRate) {
                if ($baseCurrency !== $targetCurrency) {
                    $rate = $this->getExchangeRate($baseCurrency, $targetCurrency);
                    $rates["{$baseCurrency}/{$targetCurrency}"] = $rate;
                }
            }
        }

        return $rates;
    }
}
