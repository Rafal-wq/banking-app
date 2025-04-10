<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class FinancialDataService
{
    protected mixed $alphavantageApiKey;
    protected mixed $exchangeRateApiKey;

    public function __construct()
    {
        $this->alphavantageApiKey = env('ALPHAVANTAGE_API_KEY', '');
        $this->exchangeRateApiKey = env('EXCHANGERATE_API_KEY', '');
    }

    /**
     * Pobierz dane indeksów giełdowych
     */
    public function getStockIndices()
    {
        return Cache::remember('stock_indices', 900, function () {  // cache na 15 minut
            try {
                $indices = [];

                // S&P 500 (NYSE)
                $spData = $this->fetchAlphaVantageGlobalQuote('SPY');
                if ($spData) {
                    $indices['nyse'] = [
                        'name' => 'New York Stock Exchange',
                        'index' => 'S&P 500',
                        'value' => $spData['price'],
                        'change' => $spData['change_percent'],
                        'trend' => $spData['change'] >= 0 ? 'up' : 'down'
                    ];
                }

                // FTSE 100 (London)
                $ftseData = $this->fetchAlphaVantageGlobalQuote('FTSE.LON');
                if ($ftseData) {
                    $indices['london'] = [
                        'name' => 'London Stock Exchange',
                        'index' => 'FTSE 100',
                        'value' => $ftseData['price'],
                        'change' => $ftseData['change_percent'],
                        'trend' => $ftseData['change'] >= 0 ? 'up' : 'down'
                    ];
                }

                // Nikkei 225 (Tokyo)
                $nikkeiData = $this->fetchAlphaVantageGlobalQuote('NKY');
                if ($nikkeiData) {
                    $indices['tokyo'] = [
                        'name' => 'Tokyo Stock Exchange',
                        'index' => 'Nikkei 225',
                        'value' => $nikkeiData['price'],
                        'change' => $nikkeiData['change_percent'],
                        'trend' => $nikkeiData['change'] >= 0 ? 'up' : 'down'
                    ];
                }

                // Jeśli nie udało się pobrać wszystkich danych, uzupełnij brakującymi
                if (empty($indices) || count($indices) < 3) {
                    $defaultData = $this->getFallbackStockData();
                    if (!isset($indices['nyse'])) $indices['nyse'] = $defaultData['nyse'];
                    if (!isset($indices['london'])) $indices['london'] = $defaultData['london'];
                    if (!isset($indices['tokyo'])) $indices['tokyo'] = $defaultData['tokyo'];
                }

                return $indices;
            } catch (\Exception $e) {
                Log::error('Failed to fetch stock indices: ' . $e->getMessage());
                return $this->getFallbackStockData();
            }
        });
    }

    /**
     * Pobierz dane kursu walut
     */
    public function getCurrencyRates()
    {
        return Cache::remember('currency_rates', 900, function () {  // cache na 15 minut
            try {
                $response = Http::get("https://v6.exchangerate-api.com/v6/{$this->exchangeRateApiKey}/latest/PLN");

                if ($response->successful()) {
                    $data = $response->json();
                    $rates = $data['conversion_rates'] ?? [];

                    // Jeśli nie ma PLN jako bazowej waluty, użyj domyślnych danych
                    if (empty($rates)) {
                        return $this->getFallbackCurrencyData();
                    }

                    // Przygotuj kursy walut (odwracamy wartości, bo chcemy X/PLN, a API daje PLN/X)
                    $currencyList = [];
                    $currencies = ['USD', 'EUR', 'GBP', 'CHF'];

                    foreach ($currencies as $currency) {
                        if (isset($rates[$currency]) && $rates[$currency] > 0) {
                            $rate = 1 / $rates[$currency];
                            $formattedRate = number_format($rate, 4, '.', '');

                            // Sprawdź poprzednią wartość, aby określić trend
                            $prevRate = Cache::get("prev_rate_{$currency}", $rate);
                            $change = $rate - $prevRate;
                            $changePercent = ($prevRate > 0) ? ($change / $prevRate) * 100 : 0;
                            $formattedChange = ($changePercent >= 0 ? '+' : '') . number_format($changePercent, 2, '.', '') . '%';

                            $currencyList[] = [
                                'code' => "{$currency}/PLN",
                                'rate' => $formattedRate,
                                'change' => $formattedChange,
                                'trend' => $change >= 0 ? 'up' : 'down'
                            ];

                            // Zapisz obecną wartość jako poprzednią dla przyszłych porównań
                            Cache::put("prev_rate_{$currency}", $rate, 86400);  // 24 godziny
                        }
                    }

                    // Jeśli nie udało się pobrać wszystkich walut, uzupełnij brakującymi
                    if (count($currencyList) < 4) {
                        $defaultData = $this->getFallbackCurrencyData();
                        $existingCodes = array_column($currencyList, 'code');

                        foreach ($defaultData as $default) {
                            if (!in_array($default['code'], $existingCodes)) {
                                $currencyList[] = $default;
                            }
                        }
                    }

                    return $currencyList;
                }

                throw new \Exception('Could not fetch currency rates');
            } catch (\Exception $e) {
                Log::error('Failed to fetch currency rates: ' . $e->getMessage());
                return $this->getFallbackCurrencyData();
            }
        });
    }

    /**
     * Pobierz dane z AlphaVantage Global Quote API
     */
    protected function fetchAlphaVantageGlobalQuote($symbol)
    {
        $response = Http::get('https://www.alphavantage.co/query', [
            'function' => 'GLOBAL_QUOTE',
            'symbol' => $symbol,
            'apikey' => $this->alphavantageApiKey
        ]);

        if ($response->successful()) {
            $data = $response->json();

            if (isset($data['Global Quote']) && !empty($data['Global Quote'])) {
                $quote = $data['Global Quote'];

                return [
                    'price' => number_format((float)($quote['05. price'] ?? 0), 2, '.', ','),
                    'change' => (float)($quote['09. change'] ?? 0),
                    'change_percent' => $quote['10. change percent'] ?? '0.00%'
                ];
            }
        }

        Log::warning("Failed to fetch data for symbol: {$symbol}");
        return null;
    }

    /**
     * Dane awaryjne dla indeksów giełdowych (w przypadku błędu API)
     */
    protected function getFallbackStockData()
    {
        return [
            'nyse' => [
                'name' => 'New York Stock Exchange',
                'index' => 'S&P 500',
                'value' => '5,123.45',
                'change' => '+0.75%',
                'trend' => 'up'
            ],
            'london' => [
                'name' => 'London Stock Exchange',
                'index' => 'FTSE 100',
                'value' => '7,936.23',
                'change' => '-0.21%',
                'trend' => 'down'
            ],
            'tokyo' => [
                'name' => 'Tokyo Stock Exchange',
                'index' => 'Nikkei 225',
                'value' => '39,523.55',
                'change' => '+1.13%',
                'trend' => 'up'
            ]
        ];
    }

    /**
     * Dane awaryjne dla kursów walut (w przypadku błędu API)
     */
    protected function getFallbackCurrencyData()
    {
        return [
            ['code' => 'USD/PLN', 'rate' => '3.9721', 'change' => '+0.05%', 'trend' => 'up'],
            ['code' => 'EUR/PLN', 'rate' => '4.3142', 'change' => '-0.12%', 'trend' => 'down'],
            ['code' => 'GBP/PLN', 'rate' => '5.1254', 'change' => '+0.08%', 'trend' => 'up'],
            ['code' => 'CHF/PLN', 'rate' => '4.4876', 'change' => '-0.03%', 'trend' => 'down']
        ];
    }
}
