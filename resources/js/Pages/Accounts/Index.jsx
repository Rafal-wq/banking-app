import React, { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import axios from 'axios';

const ArrowRightIcon = ({ className = "h-4 w-4" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

const AccountsIndex = () => {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                // Konfiguracja axios dla CSRF ochrony i nagłówków akceptacji
                axios.defaults.withCredentials = true;

                // Pobierz dane kont
                const response = await axios.get('/api/bank-accounts');
                if (response.data && response.data.success) {
                    setAccounts(response.data.data || []);
                }
            } catch (error) {
                console.error('Error fetching accounts:', error);
                setError('Wystąpił błąd podczas ładowania kont. Spróbuj ponownie później.');
            } finally {
                setLoading(false);
            }
        };

        fetchAccounts();
    }, []);

    // Helper function to format account number for display
    const formatAccountNumber = (accountNumber) => {
        if (!accountNumber) return '';
        // Format: XX XXXX XXXX XXXX XXXX XXXX XXXX
        return accountNumber.replace(/(.{2})(.{4})(.{4})(.{4})(.{4})(.{4})(.{4})/, '$1 $2 $3 $4 $5 $6 $7');
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                    <p className="mt-2">Ładowanie kont...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative my-4" role="alert">
                <strong className="font-bold">Błąd! </strong>
                <span className="block sm:inline">{error}</span>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Moje konta</h1>
                <Link
                    href="/accounts/create"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition ease-in-out duration-150"
                >
                    Dodaj nowe konto
                </Link>
            </div>

            {accounts.length === 0 ? (
                <div className="bg-white shadow rounded-lg p-10 text-center">
                    <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    <h3 className="mt-2 text-xl font-medium text-gray-900">Nie masz żadnych kont</h3>
                    <p className="mt-1 text-gray-500">Rozpocznij swoje doświadczenie bankowe, dodając pierwsze konto.</p>
                    <div className="mt-6">
                        <Link
                            href="/accounts/create"
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Dodaj konto
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {accounts.map((account) => (
                        <div key={account.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                            <div className="p-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-800">{account.name}</h2>
                                        <p className="text-gray-600 font-mono mt-1">{formatAccountNumber(account.account_number)}</p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${account.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {account.is_active ? 'Aktywne' : 'Nieaktywne'}
                                    </span>
                                </div>
                                <div className="mt-4 flex justify-between items-center">
                                    <div>
                                        <p className="text-sm text-gray-500">Dostępne środki</p>
                                        <p className={`text-2xl font-bold ${account.balance < 0 ? 'text-red-600' : 'text-gray-800'}`}>
                                            {new Intl.NumberFormat('pl-PL', {
                                                style: 'currency',
                                                currency: account.currency
                                            }).format(account.balance)}
                                        </p>
                                    </div>
                                    <Link
                                        href={`/accounts/${account.id}`}
                                        className="inline-flex items-center text-blue-600 hover:text-blue-800"
                                    >
                                        Szczegóły
                                        <ArrowRightIcon className="ml-1 h-4 w-4" />
                                    </Link>
                                </div>
                                <div className="mt-6 grid grid-cols-2 gap-3">
                                    <Link
                                        href={`/accounts/${account.id}/deposit`}
                                        className="inline-flex justify-center items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                    >
                                        Wpłać środki
                                    </Link>
                                    <Link
                                        href={`/accounts/${account.id}/withdraw`}
                                        className="inline-flex justify-center items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        Wypłać środki
                                    </Link>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-6 py-4">
                                <div className="flex justify-between">
                                    <Link
                                        href={`/transactions/create?from_account_id=${account.id}`}
                                        className="text-blue-600 hover:text-blue-800 font-medium"
                                    >
                                        Wykonaj przelew
                                    </Link>
                                    <Link
                                        href={`/accounts/${account.id}/transactions`}
                                        className="text-gray-600 hover:text-gray-800 font-medium"
                                    >
                                        Historia transakcji
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AccountsIndex;
