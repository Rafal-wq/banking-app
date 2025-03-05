import React, { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';

export default function Dashboard() {
    const [accounts, setAccounts] = useState([]);
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dataFetched, setDataFetched] = useState(false); // Dodajemy flagę, aby zapobiec nieskończonej pętli

    useEffect(() => {
        // Zapobiegaj wielokrotnemu wywoływaniu efektu
        if (dataFetched) return;

        const fetchData = async () => {
            try {
                // Pobierz dane kont
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

                // Oznacz, że dane zostały pobrane
                setDataFetched(true);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                setError('Wystąpił błąd podczas ładowania danych.');
                // Oznacz, że próba pobrania danych została zakończona
                setDataFetched(true);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [dataFetched]); // Zależność od flagi dataFetched

    // Reszta kodu Dashboard...
    return (
        <div className="p-6">
            <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>

            {loading ? (
                <div>Ładowanie danych...</div>
            ) : error ? (
                <div className="bg-red-100 p-4 rounded">{error}</div>
            ) : (
                <div>
                    <h2 className="text-xl mb-4">Twoje konta ({accounts.length})</h2>
                    {accounts.length > 0 ? (
                        <ul className="space-y-2">
                            {accounts.map(account => (
                                <li key={account.id} className="p-4 border rounded">
                                    <strong>{account.name}</strong>: {account.balance} {account.currency}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>Nie masz jeszcze żadnych kont bankowych.</p>
                    )}
                </div>
            )}
        </div>
    );
}
