import React, { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import axios from 'axios';
import BankLogo from '@/components/BankLogo';

export default function AccountDetails({ id }) {
    const [account, setAccount] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                if (!token) {
                    window.location.href = '/login';
                    return;
                }

                // Pobierz szczegóły konta
                const accountResponse = await axios.get(`/api/bank-accounts/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (accountResponse.data && accountResponse.data.success) {
                    setAccount(accountResponse.data.data);
                } else {
                    throw new Error('Nie udało się pobrać danych konta');
                }

                // Pobierz transakcje dla konta
                const transactionsResponse = await axios.get(`/api/bank-accounts/${id}/transactions`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (transactionsResponse.data && transactionsResponse.data.success) {
                    setTransactions(transactionsResponse.data.data);
                } else {
                    throw new Error('Nie udało się pobrać historii transakcji');
                }
            } catch (error) {
                console.error('Błąd pobierania danych:', error);
                setError('Wystąpił błąd podczas ładowania danych konta lub transakcji.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    // Formatowanie daty
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('pl-PL', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    // Formatowanie kwoty
    const formatAmount = (amount, currency) => {
        return new Intl.NumberFormat('pl-PL', {
            style: 'currency',
            currency: currency || 'PLN'
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100">
                {/* Nagłówek z logo */}
                <div className="bg-white shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <div className="flex items-center">
                                <BankLogo className="h-10 w-auto" />
                                <span className="ml-3 text-xl font-semibold text-gray-800">Szczegóły konta</span>
                            </div>
                            <Link
                                href="/dashboard"
                                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
                            >
                                Powrót do dashboardu
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="p-6 max-w-7xl mx-auto">
                    <div className="bg-white rounded-lg shadow p-6 flex justify-center items-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        <span className="ml-3">Ładowanie danych...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !account) {
        return (
            <div className="min-h-screen bg-gray-100">
                {/* Nagłówek z logo */}
                <div className="bg-white shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <div className="flex items-center">
                                <BankLogo className="h-10 w-auto" />
                                <span className="ml-3 text-xl font-semibold text-gray-800">Szczegóły konta</span>
                            </div>
                            <Link
                                href="/dashboard"
                                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
                            >
                                Powrót do dashboardu
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="p-6 max-w-7xl mx-auto">
                    <div className="bg-white rounded-lg shadow p-6 text-center">
                        <p className="text-red-500">{error || 'Nie znaleziono konta'}</p>
                    </div>
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
                            <span className="ml-3 text-xl font-semibold text-gray-800">Szczegóły konta</span>
                        </div>
                        <Link
                            href="/dashboard"
                            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
                        >
                            Powrót do dashboardu
                        </Link>
                    </div>
                </div>
            </div>

            <div className="p-6 max-w-7xl mx-auto">
                {/* Szczegóły konta */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h1 className="text-2xl font-bold mb-4">{account.name}</h1>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-gray-600">Numer konta:</p>
                            <p className="font-mono text-lg">{account.account_number}</p>
                        </div>
                        <div>
                            <p className="text-gray-600">Dostępne środki:</p>
                            <p className="text-2xl font-bold">{formatAmount(account.balance, account.currency)}</p>
                        </div>
                        <div>
                            <p className="text-gray-600">Waluta:</p>
                            <p>{account.currency}</p>
                        </div>
                        <div>
                            <p className="text-gray-600">Status:</p>
                            <p className={`font-semibold ${account.is_active ? 'text-green-600' : 'text-red-600'}`}>
                                {account.is_active ? 'Aktywne' : 'Nieaktywne'}
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-4">
                        <Link
                            href={`/transactions/create?from_account_id=${account.id}`}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                        >
                            Wykonaj przelew
                        </Link>
                        <Link
                            href={`/accounts/${account.id}/deposit`}
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                        >
                            Wpłać środki
                        </Link>
                        <Link
                            href={`/accounts/${account.id}/withdraw`}
                            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition"
                        >
                            Wypłać środki
                        </Link>
                    </div>
                </div>

                {/* Historia transakcji */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold mb-4">Historia transakcji</h2>

                    {transactions.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data i czas</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Typ</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tytuł</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kwota</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                {transactions.map(transaction => {
                                    // Określenie typu transakcji (przychodzące/wychodzące)
                                    const isIncoming = transaction.to_account_id === parseInt(id);
                                    const displayAmount = isIncoming
                                        ? `+${formatAmount(transaction.amount, account.currency)}`
                                        : `-${formatAmount(transaction.amount, account.currency)}`;

                                    // Data wykonania (lub utworzenia jeśli nie została wykonana)
                                    const displayDate = transaction.executed_at
                                        ? formatDate(transaction.executed_at)
                                        : formatDate(transaction.created_at);

                                    return (
                                        <tr key={transaction.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {displayDate}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <span className={`px-2 py-1 rounded-full text-xs ${isIncoming ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                                    {isIncoming ? 'Przychodząca' : 'Wychodząca'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {transaction.title}
                                            </td>
                                            <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isIncoming ? 'text-green-600' : 'text-blue-600'}`}>
                                                {displayAmount}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className={`px-2 py-1 rounded-full text-xs ${
                                                    transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                        transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-red-100 text-red-800'
                                                }`}>
                                                    {transaction.status === 'completed' ? 'Zakończona' :
                                                        transaction.status === 'pending' ? 'W trakcie' : 'Anulowana'}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-600">Brak transakcji dla tego konta.</p>
                            <p className="mt-2">Wykonaj swój pierwszy przelew, aby zobaczyć historię transakcji.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
