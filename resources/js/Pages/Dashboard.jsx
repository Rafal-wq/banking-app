import React, { useState, useEffect } from 'react';
import { Link, useForm } from '@inertiajs/react';

export default function Dashboard() {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dataFetched, setDataFetched] = useState(false);

    // Formularz do wylogowania
    const { post } = useForm();

    const handleLogout = () => {
        post('/logout', {
            onSuccess: () => {
                window.location.href = '/login';
            }
        });
    };

    useEffect(() => {
        if (dataFetched) return;

        const fetchData = async () => {
            try {
                const accountsResponse = await fetch('/api/bank-accounts', {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    credentials: 'include'
                });

                console.log('Account response status:', accountsResponse.status);

                if (accountsResponse.ok) {
                    const accountsData = await accountsResponse.json();
                    setAccounts(accountsData.data || []);
                }

                setDataFetched(true);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                setError('Wystąpił błąd podczas ładowania danych.');
                setDataFetched(true);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [dataFetched]);

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Nagłówek z przyciskiem wylogowania */}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-semibold">Dashboard</h1>
                <div className="flex space-x-4">
                    <Link
                        href="/profile"
                        className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
                    >
                        Profil
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                    >
                        Wyloguj
                    </button>
                </div>
            </div>

            {/* Sekcja kont */}
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

            {/* Sekcja szybkich akcji */}
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
    );
}
