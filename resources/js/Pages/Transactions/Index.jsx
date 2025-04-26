import React, { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import axios from 'axios';
import BankLogo from '@/components/BankLogo';

export default function TransactionsIndex() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const response = await axios.get('/api/transactions', {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                    withCredentials: true,
                });

                if (response.data && response.data.success) {
                    setTransactions(response.data.data || []);
                } else {
                    // Nie ustawiamy błędu, nawet jeśli API zwróci błąd
                    console.error('Nie udało się pobrać historii transakcji');
                    setTransactions([]);
                }
            } catch (error) {
                console.error('Błąd pobierania transakcji:', error);
                // Nie ustawiamy stanu błędu, zamiast tego po prostu ustawiamy pustą tablicę transakcji
                setTransactions([]);
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, []);

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

    // Formatowanie kwoty
    const formatAmount = (amount, currency = 'PLN') => {
        return new Intl.NumberFormat('pl-PL', {
            style: 'currency',
            currency: currency
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

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Nagłówek z logo */}
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
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">Historia transakcji</h1>
                        <Link
                            href="/transactions/create"
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                        >
                            Nowy przelew
                        </Link>
                    </div>

                    {transactions.length === 0 ? (
                        <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
                            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                            </svg>
                            <h2 className="mt-4 text-xl font-semibold text-gray-700">Brak historii transakcji</h2>
                            <p className="mt-2 text-gray-500 max-w-md mx-auto">
                                Nie masz jeszcze żadnych transakcji. Wykonaj swój pierwszy przelew, aby rozpocząć budowanie historii transakcji.
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
                                {transactions.map((transaction) => {
                                    const isOutgoing = transaction.fromAccount && transaction.fromAccount.user_id === (window.auth && window.auth.user ? window.auth.user.id : null);
                                    const accountInfo = isOutgoing ? transaction.toAccount : transaction.fromAccount;
                                    const amountClass = isOutgoing ? 'text-red-600' : 'text-green-600';
                                    const amountPrefix = isOutgoing ? '-' : '+';
                                    const currency = (isOutgoing ? transaction.fromAccount : transaction.toAccount)?.currency || 'PLN';

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
                                                    <>Do: {accountInfo?.name || 'Nieznane konto'}</>
                                                ) : (
                                                    <>Od: {accountInfo?.name || 'Nieznane konto'}</>
                                                )}
                                            </td>
                                            <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${amountClass}`}>
                                                {amountPrefix}{formatAmount(transaction.amount, currency)}
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
