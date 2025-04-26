import React, { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import axios from 'axios';
import BankLogo from '@/components/BankLogo';

export default function Dashboard() {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const handleLogout = () => {
        // Usuń token przed przekierowaniem
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');

        // Przekieruj do istniejącej trasy wylogowania
        window.location.href = '/logout-page';
    };

    const testAuthentication = async () => {
        try {
            const sessionResponse = await axios.get('/api/auth-check');
            console.log('Session status:', sessionResponse.data);

            try {
                const accountsResponse = await axios.get('/api/my-accounts');
                console.log('My accounts API:', accountsResponse.data);
            } catch (error) {
                console.log('My accounts error:', error.response?.data || error.message);
            }

            try {
                const altResponse = await axios.get('/api/accounts-alt');
                console.log('Accounts-alt API:', altResponse.data);
            } catch (error) {
                console.log('Accounts-alt error:', error.response?.data || error.message);
            }
        } catch (error) {
            console.log('Test failed:', error.response?.data || error.message);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                if (!token) {
                    window.location.href = '/login';
                    return;
                }

                const response = await axios.get('/api/my-accounts', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.data && response.data.data) {
                    setAccounts(response.data.data);
                } else if (Array.isArray(response.data)) {
                    setAccounts(response.data);
                } else {
                    setAccounts([]);
                }
            } catch (error) {
                console.error('Błąd pobierania danych:', error);
                setError('Wystąpił błąd podczas ładowania danych.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Nagłówek z logo i przyciskami */}
            <div className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <BankLogo className="h-10 w-auto" />
                            <span className="ml-3 text-xl font-semibold text-gray-800">Panel Klienta</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link
                                href="/profile"
                                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                            >
                                Profil
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                            >
                                Wyloguj
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-6 max-w-7xl mx-auto">
                {/*<button*/}
                {/*    onClick={testAuthentication}*/}
                {/*    className="mb-4 bg-gray-200 px-4 py-2 rounded"*/}
                {/*>*/}
                {/*    Test Authentication*/}
                {/*</button>*/}

                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl mb-4">Twoje konta ({accounts.length})</h2>
                        <Link
                            href="/accounts/create"
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                        >
                            + Dodaj nowe konto
                        </Link>
                    </div>

                    {loading ? (
                        <div className="py-4">Ładowanie danych...</div>
                    ) : error ? (
                        <div className="bg-red-100 p-4 rounded">{error}</div>
                    ) : (
                        <div>
                            {accounts.length > 0 ? (
                                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                                    {accounts.map(account => (
                                        <div key={account.id} className="p-4 border rounded shadow-sm hover:shadow-md transition">
                                            <h3 className="font-semibold text-lg">{account.name}</h3>
                                            <p className="text-gray-600 text-sm mb-2">{account.account_number}</p>
                                            <p className="text-xl font-bold">{account.balance} {account.currency}</p>
                                            <div className="mt-4 flex justify-end">
                                                <Link
                                                    href={`/accounts/${account.id}`}
                                                    className="text-blue-500 hover:text-blue-700"
                                                >
                                                    Szczegóły →
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-8 text-center">
                                    <p className="text-gray-600 mb-4">Nie masz jeszcze żadnych kont bankowych.</p>
                                    <Link
                                        href="/accounts/create"
                                        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                                    >
                                        Utwórz pierwsze konto
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl mb-4">Szybkie akcje</h2>
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                        <Link
                            href="/transactions/create"
                            className="p-4 border rounded text-center hover:bg-gray-50 transition"
                        >
                            <div className="font-semibold">Wykonaj przelew</div>
                            <p className="text-sm text-gray-600">Prześlij pieniądze na inne konto</p>
                        </Link>

                        <Link
                            href="/accounts/create"
                            className="p-4 border rounded text-center hover:bg-gray-50 transition"
                        >
                            <div className="font-semibold">Nowe konto</div>
                            <p className="text-sm text-gray-600">Otwórz nowe konto bankowe</p>
                        </Link>

                        <Link
                            href="/transactions"
                            className="p-4 border rounded text-center hover:bg-gray-50 transition"
                        >
                            <div className="font-semibold">Historia transakcji</div>
                            <p className="text-sm text-gray-600">Przeglądaj swoje transakcje</p>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
