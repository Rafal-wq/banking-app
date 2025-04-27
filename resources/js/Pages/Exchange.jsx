import React, { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import axios from 'axios';
import BankLogo from '@/components/BankLogo';
import InputLabel from '@/components/InputLabel';
import TextInput from '@/components/TextInput';
import PrimaryButton from '@/components/PrimaryButton';

export default function Exchange() {
    // Stan dla kont i kursów walut
    const [accounts, setAccounts] = useState([]);
    const [exchangeRates, setExchangeRates] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Stan formularza wymiany walut
    const [formData, setFormData] = useState({
        from_account_id: '',
        to_account_id: '',
        amount: '',
    });

    // Stan dla wyliczeń
    const [calculatedAmount, setCalculatedAmount] = useState(null);
    const [exchangeRate, setExchangeRate] = useState(null);

    // Stan dla procesu przetwarzania i powiadomień
    const [processing, setProcessing] = useState(false);
    const [notification, setNotification] = useState(null);

    // Pobranie danych kont i kursów walut
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Pobieranie kont użytkownika
                const accountsResponse = await axios.get('/api/bank-accounts', {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                    withCredentials: true,
                });

                if (accountsResponse.data && accountsResponse.data.success) {
                    setAccounts(accountsResponse.data.data || []);
                }

                // Pobieranie kursów walut
                const ratesResponse = await axios.get('/api/exchange-rates', {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                    withCredentials: true,
                });

                if (ratesResponse.data && ratesResponse.data.success) {
                    setExchangeRates(ratesResponse.data.data || {});
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                setError('Wystąpił błąd podczas pobierania danych. Spróbuj ponownie później.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Obsługa zmiany formularza
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Resetuj wyliczenia przy zmianie kont lub kwoty
        setCalculatedAmount(null);
        setExchangeRate(null);
    };

    // Funkcja do wyliczania kwoty po przewalutowaniu
    const calculateExchange = () => {
        if (!formData.from_account_id || !formData.to_account_id || !formData.amount) {
            setNotification({
                type: 'error',
                message: 'Wypełnij wszystkie pola formularza.'
            });
            return;
        }

        const fromAccount = accounts.find(acc => acc.id.toString() === formData.from_account_id);
        const toAccount = accounts.find(acc => acc.id.toString() === formData.to_account_id);

        if (!fromAccount || !toAccount) {
            return;
        }

        // Jeśli waluty są takie same, nie ma przewalutowania
        if (fromAccount.currency === toAccount.currency) {
            setExchangeRate(1);
            setCalculatedAmount(parseFloat(formData.amount));
            return;
        }

        // Klucz dla kursu wymiany
        const rateKey = `${fromAccount.currency}/${toAccount.currency}`;

        // Jeśli mamy bezpośredni kurs wymiany
        if (exchangeRates[rateKey]) {
            const rate = exchangeRates[rateKey];
            setExchangeRate(rate);
            setCalculatedAmount(parseFloat((formData.amount * rate).toFixed(2)));
        } else {
            setNotification({
                type: 'error',
                message: 'Nie można określić kursu wymiany dla wybranych walut.'
            });
        }
    };

    // Obsługa wymiany walut
    const handleExchange = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setNotification(null);

        try {
            // Używamy istniejącego API transakcji, dodając informację o przewalutowaniu
            const response = await axios.post('/api/transactions', {
                from_account_id: formData.from_account_id,
                to_account_id: formData.to_account_id,
                amount: formData.amount,
                title: 'Wymiana walut',
                description: `Przewalutowanie ${formData.amount} ${accounts.find(acc => acc.id.toString() === formData.from_account_id).currency} na ${calculatedAmount} ${accounts.find(acc => acc.id.toString() === formData.to_account_id).currency}`
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                withCredentials: true,
            });

            if (response.data && response.data.success) {
                setNotification({
                    type: 'success',
                    message: 'Wymiana walut została pomyślnie zrealizowana.'
                });

                // Resetuj formularz
                setFormData({
                    from_account_id: '',
                    to_account_id: '',
                    amount: '',
                });
                setCalculatedAmount(null);
                setExchangeRate(null);

                // Odśwież dane kont
                const accountsResponse = await axios.get('/api/bank-accounts', {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                    withCredentials: true,
                });

                if (accountsResponse.data && accountsResponse.data.success) {
                    setAccounts(accountsResponse.data.data || []);
                }
            }
        } catch (error) {
            console.error('Error processing exchange:', error);

            if (error.response && error.response.data) {
                if (error.response.data.message) {
                    setNotification({
                        type: 'error',
                        message: error.response.data.message
                    });
                } else if (error.response.data.errors) {
                    const errorMessages = Object.values(error.response.data.errors).flat();
                    setNotification({
                        type: 'error',
                        message: errorMessages.join(' ')
                    });
                }
            } else {
                setNotification({
                    type: 'error',
                    message: 'Wystąpił błąd podczas przetwarzania wymiany walut. Spróbuj ponownie później.'
                });
            }
        } finally {
            setProcessing(false);
        }
    };

    // Helper do formatowania kwot
    const formatCurrency = (amount, currency) => {
        return new Intl.NumberFormat('pl-PL', {
            style: 'currency',
            currency: currency
        }).format(amount);
    };

    // Wyświetlanie podczas ładowania
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100">
                {/* Nagłówek z logo */}
                <div className="bg-white shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <div className="flex items-center">
                                <BankLogo className="h-10 w-auto" />
                                <span className="ml-3 text-xl font-semibold text-gray-800">Wymiana Walut</span>
                            </div>
                            <Link
                                href="/dashboard"
                                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
                            >
                                Powrót do panelu
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
                    <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                    <p className="text-center mt-4 text-gray-600">Ładowanie danych...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Nagłówek z logo */}
            <div className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <BankLogo className="h-10 w-auto" />
                            <span className="ml-3 text-xl font-semibold text-gray-800">Wymiana Walut</span>
                        </div>
                        <Link
                            href="/dashboard"
                            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
                        >
                            Powrót do panelu
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
                <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Aktualne kursy walut</h2>

                    {Object.keys(exchangeRates).length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Para walutowa
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Kurs wymiany
                                    </th>
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                {Object.entries(exchangeRates).map(([pair, rate]) => (
                                    <tr key={pair}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {pair}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {rate.toFixed(6)}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-gray-600">Brak dostępnych kursów walut.</p>
                    )}
                </div>

                {accounts.length < 2 ? (
                    <div className="bg-white shadow-sm rounded-lg p-6">
                        <div className="text-center py-6">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                            <h3 className="mt-2 text-lg font-medium text-gray-900">Za mało kont do wymiany walut</h3>
                            <p className="mt-1 text-gray-500">Aby dokonać wymiany walut, potrzebujesz co najmniej dwóch kont w różnych walutach.</p>
                            <div className="mt-6">
                                <Link
                                    href="/accounts/create"
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Utwórz nowe konto
                                </Link>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white shadow-sm rounded-lg p-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Wymień walutę</h2>

                        {notification && (
                            <div className={`p-4 mb-4 rounded-md ${notification.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                                {notification.message}
                            </div>
                        )}

                        <form onSubmit={handleExchange}>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div>
                                    <InputLabel htmlFor="from_account_id" value="Z konta" />
                                    <select
                                        id="from_account_id"
                                        name="from_account_id"
                                        value={formData.from_account_id}
                                        onChange={handleChange}
                                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                        required
                                    >
                                        <option value="">Wybierz konto źródłowe</option>
                                        {accounts.map(account => (
                                            <option key={`from-${account.id}`} value={account.id}>
                                                {account.name} ({formatCurrency(account.balance, account.currency)})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <InputLabel htmlFor="to_account_id" value="Na konto" />
                                    <select
                                        id="to_account_id"
                                        name="to_account_id"
                                        value={formData.to_account_id}
                                        onChange={handleChange}
                                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                        required
                                        disabled={!formData.from_account_id}
                                    >
                                        <option value="">Wybierz konto docelowe</option>
                                        {accounts
                                            .filter(account => account.id.toString() !== formData.from_account_id)
                                            .map(account => (
                                                <option key={`to-${account.id}`} value={account.id}>
                                                    {account.name} ({formatCurrency(account.balance, account.currency)})
                                                </option>
                                            ))
                                        }
                                    </select>
                                </div>

                                <div>
                                    <InputLabel htmlFor="amount" value="Kwota do wymiany" />
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-gray-500 sm:text-sm">
                                                {formData.from_account_id ?
                                                    accounts.find(acc => acc.id.toString() === formData.from_account_id)?.currency :
                                                    'PLN'
                                                }
                                            </span>
                                        </div>
                                        <TextInput
                                            id="amount"
                                            type="number"
                                            name="amount"
                                            value={formData.amount}
                                            onChange={handleChange}
                                            className="pl-16 block w-full"
                                            placeholder="0.00"
                                            min="0.01"
                                            step="0.01"
                                            required
                                            disabled={!formData.from_account_id || !formData.to_account_id}
                                        />
                                    </div>
                                    {formData.from_account_id && (
                                        <p className="mt-1 text-sm text-gray-500">
                                            Dostępne środki: {
                                            formatCurrency(
                                                accounts.find(acc => acc.id.toString() === formData.from_account_id)?.balance || 0,
                                                accounts.find(acc => acc.id.toString() === formData.from_account_id)?.currency || 'PLN'
                                            )
                                        }
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-end">
                                    <button
                                        type="button"
                                        onClick={calculateExchange}
                                        disabled={!formData.from_account_id || !formData.to_account_id || !formData.amount}
                                        className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Przelicz
                                    </button>
                                </div>
                            </div>

                            {/* Wynik kalkulacji */}
                            {calculatedAmount !== null && exchangeRate !== null && (
                                <div className="mt-6 p-4 bg-blue-50 rounded-md">
                                    <h3 className="text-lg font-medium text-blue-800">Wynik przewalutowania</h3>
                                    <p className="mt-2">
                                        <span className="font-semibold">{formData.amount}</span> {accounts.find(acc => acc.id.toString() === formData.from_account_id)?.currency} =
                                        <span className="font-semibold ml-1">{calculatedAmount.toFixed(2)}</span> {accounts.find(acc => acc.id.toString() === formData.to_account_id)?.currency}
                                    </p>
                                    <p className="text-sm text-blue-600 mt-1">
                                        Kurs wymiany: 1 {accounts.find(acc => acc.id.toString() === formData.from_account_id)?.currency} = {exchangeRate.toFixed(6)} {accounts.find(acc => acc.id.toString() === formData.to_account_id)?.currency}
                                    </p>
                                </div>
                            )}

                            <div className="mt-6 flex justify-end">
                                <Link
                                    href="/dashboard"
                                    className="mr-4 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Anuluj
                                </Link>
                                <PrimaryButton
                                    type="submit"
                                    disabled={processing || calculatedAmount === null || !formData.from_account_id || !formData.to_account_id || !formData.amount}
                                    className={processing ? "opacity-75 cursor-not-allowed" : ""}
                                >
                                    {processing ? "Przetwarzanie..." : "Wymień walutę"}
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
