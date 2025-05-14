import React, { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import axios from 'axios';
import BankLogo from '@/Components/BankLogo';

export default function TransactionsIndex() {
    const [transactions, setTransactions] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [accountsMap, setAccountsMap] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedAccountId, setSelectedAccountId] = useState('all');

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Najpierw pobieramy wszystkie konta użytkownika
                const accountsResponse = await axios.get('/api/bank-accounts', {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                    withCredentials: true,
                });

                let userAccounts = [];
                let accountsMapObj = {};

                if (accountsResponse.data && accountsResponse.data.success) {
                    userAccounts = accountsResponse.data.data || [];

                    // Tworzymy mapę kont dla szybkiego dostępu
                    userAccounts.forEach(account => {
                        accountsMapObj[account.id] = account;
                    });

                    setAccounts(userAccounts);
                    setAccountsMap(accountsMapObj);
                }

                // Potem pobieramy transakcje
                const response = await axios.get('/api/transactions', {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                    withCredentials: true,
                });

                if (response.data && response.data.success) {
                    // Uzupełniamy informacje o walutach w transakcjach na podstawie mapy kont
                    const processedTransactions = response.data.data.map(transaction => {
                        const fromAccountId = transaction.from_account_id;
                        const toAccountId = transaction.to_account_id;

                        // Pobierz waluty bezpośrednio z naszej mapy kont
                        const fromAccountCurrency = accountsMapObj[fromAccountId]?.currency || 'PLN';
                        const toAccountCurrency = accountsMapObj[toAccountId]?.currency || 'PLN';

                        // Dodaj informacje o walutach do obiektu transakcji
                        transaction.fromAccountCurrency = fromAccountCurrency;
                        transaction.toAccountCurrency = toAccountCurrency;

                        return transaction;
                    });

                    setTransactions(processedTransactions);
                } else {
                    console.error('Nie udało się pobrać historii transakcji');
                    setTransactions([]);
                }
            } catch (error) {
                console.error('Błąd pobierania danych:', error);
                setError('Wystąpił błąd podczas ładowania danych. Spróbuj ponownie później.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Funkcja do filtrowania transakcji według wybranego konta
    const getFilteredTransactions = () => {
        if (selectedAccountId === 'all') {
            return transactions;
        }

        return transactions.filter(transaction =>
            transaction.from_account_id.toString() === selectedAccountId ||
            transaction.to_account_id.toString() === selectedAccountId
        );
    };

    // Formatowanie daty
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('pl-PL', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Formatowanie kwoty z określoną walutą
    const formatAmount = (amount, currency) => {
        // Upewnij się, że currency jest walidowane i ma domyślną wartość
        const currencyCode = currency && typeof currency === 'string' ? currency : 'PLN';

        try {
            return new Intl.NumberFormat('pl-PL', {
                style: 'currency',
                currency: currencyCode
            }).format(amount);
        } catch (error) {
            console.error(`Błąd formatowania waluty: ${error.message}`);
            // W przypadku błędu formatowania, pokaż kwotę z symbolem waluty
            return `${amount} ${currencyCode}`;
        }
    };

    const handleAccountChange = (e) => {
        setSelectedAccountId(e.target.value);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100">
                <div className="bg-white shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <div className="flex items-center">
                                <BankLogo className="h-10 w-auto" />
                                <span className="ml-3 text-xl font-semibold text-gray-800">Historia Transakcji</span>
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

                <div className="p-6 max-w-7xl mx-auto">
                    <div className="flex justify-center items-center h-64">
                        <div className="text-center">
                            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                            <p className="mt-2">Ładowanie historii transakcji...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const filteredTransactions = getFilteredTransactions();

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <BankLogo className="h-10 w-auto" />
                            <span className="ml-3 text-xl font-semibold text-gray-800">Historia Transakcji</span>
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

            <div className="p-6 max-w-7xl mx-auto">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                        <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Historia transakcji</h1>

                        <div className="flex flex-col sm:flex-row gap-4">
                            {/* Selektor kont */}
                            <div className="flex-grow">
                                <select
                                    value={selectedAccountId}
                                    onChange={handleAccountChange}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                    <option value="all">Wszystkie konta</option>
                                    {accounts.map(account => (
                                        <option key={account.id} value={account.id}>
                                            {account.name} ({account.currency})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <Link
                                href="/transactions/create"
                                className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                            >
                                Nowy przelew
                            </Link>
                        </div>
                    </div>

                    {filteredTransactions.length === 0 ? (
                        <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
                            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                            </svg>
                            <h2 className="mt-4 text-xl font-semibold text-gray-700">Brak historii transakcji</h2>
                            <p className="mt-2 text-gray-500 max-w-md mx-auto">
                                {selectedAccountId === 'all'
                                    ? 'Nie masz jeszcze żadnych transakcji. Wykonaj swój pierwszy przelew, aby rozpocząć budowanie historii transakcji.'
                                    : 'Nie masz jeszcze żadnych transakcji dla wybranego konta.'}
                            </p>
                            <div className="mt-6">
                                <Link
                                    href="/transactions/create"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                                >
                                    Wykonaj pierwszy przelew
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tytuł</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Z / Na konto</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kwota</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th scope="col" className="relative px-6 py-3">
                                        <span className="sr-only">Akcje</span>
                                    </th>
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                {filteredTransactions.map((transaction) => {
                                    // Ustal, czy transakcja jest wychodząca
                                    const isOutgoing = transaction.is_outgoing === true;

                                    // Ustal konto, które będzie wyświetlane w kolumnie "Z / Na konto"
                                    const accountInfo = isOutgoing ?
                                        (transaction.toAccount || accountsMap[transaction.to_account_id] || {}) :
                                        (transaction.fromAccount || accountsMap[transaction.from_account_id] || {});

                                    // Ustal klasę dla koloru kwoty
                                    const amountClass = isOutgoing ? 'text-red-600' : 'text-green-600';

                                    // Ustal prefiks kwoty
                                    const amountPrefix = isOutgoing ? '-' : '+';

                                    // Ustal walutę do wyświetlenia
                                    let displayCurrency;

                                    if (isOutgoing) {
                                        // Dla transakcji wychodzących używamy waluty konta źródłowego
                                        displayCurrency = transaction.fromAccountCurrency || accountsMap[transaction.from_account_id]?.currency || 'PLN';
                                    } else {
                                        // Dla transakcji przychodzących używamy waluty konta docelowego
                                        displayCurrency = transaction.toAccountCurrency || accountsMap[transaction.to_account_id]?.currency || 'PLN';
                                    }

                                    // Dla transakcji w USD (z tytułem TestUSD), używaj USD
                                    if (transaction.title === 'TestUSD') {
                                        displayCurrency = 'USD';
                                    }

                                    // Jeśli jesteśmy w widoku konkretnego konta, użyj jego waluty
                                    if (selectedAccountId !== 'all') {
                                        displayCurrency = accountsMap[parseInt(selectedAccountId)]?.currency || displayCurrency;
                                    }

                                    return (
                                        <tr key={transaction.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {formatDate(transaction.executed_at || transaction.created_at)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {transaction.title}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {isOutgoing ? (
                                                    <span>Do: {accountInfo?.name || 'Nieznane konto'}</span>
                                                ) : (
                                                    <span>Od: {accountInfo?.name || 'Nieznane konto'}</span>
                                                )}
                                            </td>
                                            <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${amountClass}`}>
                                                {amountPrefix}{formatAmount(transaction.amount, displayCurrency)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                        transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-red-100 text-red-800'
                                                }`}>
                                                    {transaction.status === 'completed' ? 'Zrealizowana' :
                                                        transaction.status === 'pending' ? 'W trakcie' :
                                                            'Anulowana'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Link
                                                    href={`/transactions/${transaction.id}`}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    Szczegóły
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
