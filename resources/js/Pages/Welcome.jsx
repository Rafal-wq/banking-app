import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import BankLogo from '@/components/BankLogo';

export default function Welcome({ canLogin, canRegister, laravelVersion, phpVersion, stockData, currencyRates }) {
    const [currentDateTime, setCurrentDateTime] = useState(new Date());

    // Aktualizacja daty i czasu co sekundę
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentDateTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Formatowanie daty
    const formattedDate = new Intl.DateTimeFormat('pl-PL', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(currentDateTime);

    // Formatowanie czasu
    const formattedTime = new Intl.DateTimeFormat('pl-PL', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    }).format(currentDateTime);

    return (
        <div className="min-h-screen bg-gray-50">
            <Head title="Bank App - Strona główna" />

            {/* Nagłówek z przyciskami logowania i rejestracji */}
            <div className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            {/* Tutaj zamieniamy tekst na komponent logo */}
                            <BankLogo className="h-8" />
                            {/* Opcjonalnie możesz zachować tekst obok logo */}
                            <span className="ml-2 text-xl font-bold text-gray-800">Bank App</span>
                        </div>
                        <div className="flex items-center">
                            {canLogin && (
                                <Link
                                    href="/login"
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                                >
                                    Logowanie
                                </Link>
                            )}

                            {canRegister && (
                                <Link
                                    href="/register"
                                    className="ml-4 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition"
                                >
                                    Rejestracja
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Data i czas */}
            <div className="bg-blue-700 text-white py-2">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center">
                        <div>{formattedDate}</div>
                        <div className="font-mono">{formattedTime}</div>
                    </div>
                </div>
            </div>

            {/* Główna treść */}
            <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
                    Witaj w aplikacji bankowej
                </h2>

                <div className="text-center mb-8">
                    <p className="text-gray-600">
                        Twoje centrum finansowe z dostępem do aktualnych danych giełdowych
                    </p>
                </div>

                {/* Dane giełdowe */}
                <div className="mb-10">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Główne indeksy giełdowe</h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* NYSE */}
                        {stockData.nyse && (
                            <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition">
                                <h4 className="font-bold">{stockData.nyse.name}</h4>
                                <div className="flex justify-between items-center mt-2">
                                    <div className="text-gray-600">{stockData.nyse.index}</div>
                                    <div className="text-lg font-mono font-bold">{stockData.nyse.value}</div>
                                </div>
                                <div className={`text-right ${stockData.nyse.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                                    {stockData.nyse.change}
                                </div>
                            </div>
                        )}

                        {/* London */}
                        {stockData.london && (
                            <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition">
                                <h4 className="font-bold">{stockData.london.name}</h4>
                                <div className="flex justify-between items-center mt-2">
                                    <div className="text-gray-600">{stockData.london.index}</div>
                                    <div className="text-lg font-mono font-bold">{stockData.london.value}</div>
                                </div>
                                <div className={`text-right ${stockData.london.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                                    {stockData.london.change}
                                </div>
                            </div>
                        )}

                        {/* Tokyo */}
                        {stockData.tokyo && (
                            <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition">
                                <h4 className="font-bold">{stockData.tokyo.name}</h4>
                                <div className="flex justify-between items-center mt-2">
                                    <div className="text-gray-600">{stockData.tokyo.index}</div>
                                    <div className="text-lg font-mono font-bold">{stockData.tokyo.value}</div>
                                </div>
                                <div className={`text-right ${stockData.tokyo.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                                    {stockData.tokyo.change}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Kursy walut */}
                <div className="mb-10">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Kursy walut</h3>

                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Para walutowa</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Kurs</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Zmiana</th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {currencyRates.map((currency, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {currency.code}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-mono font-bold text-gray-900">
                                        {currency.rate}
                                    </td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-right ${currency.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                                        {currency.change}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Aktualizacja danych */}
                <div className="text-center text-xs text-gray-500 mb-8">
                    <p>Dane finansowe są aktualizowane co 15 minut</p>
                </div>

                {/* Informacje o wersji */}
                <div className="text-center text-sm text-gray-500 mt-8 border-t border-gray-200 pt-8">
                    <p>Laravel version: {laravelVersion}</p>
                    <p>PHP version: {phpVersion}</p>
                </div>
            </div>
        </div>
    );
}
