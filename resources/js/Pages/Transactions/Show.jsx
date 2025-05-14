import React, { useState, useEffect } from 'react';
import { Link, } from '@inertiajs/react';
import axios from 'axios';
import BankLogo from '@/Components/BankLogo';
import PrimaryButton from '@/Components/PrimaryButton';

export default function Show({ id }) {
    console.log("Component Show rendered with ID:", id);
    const [transaction, setTransaction] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sourceAccount, setSourceAccount] = useState(null);
    const [destinationAccount, setDestinationAccount] = useState(null);

    useEffect(() => {
        const fetchTransactionDetails = async () => {
            try {
                // Pobieranie szczegółów transakcji
                const response = await axios.get(`/api/transactions/${id}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                    withCredentials: true,
                });

                if (response.data && response.data.success) {
                    const transactionData = response.data.data;
                    setTransaction(transactionData);

                    // Pobieranie dodatkowych informacji o kontach
                    if (transactionData.fromAccount) {
                        setSourceAccount(transactionData.fromAccount);
                    }

                    if (transactionData.toAccount) {
                        setDestinationAccount(transactionData.toAccount);
                    }
                } else {
                    throw new Error('Nie udało się pobrać szczegółów transakcji');
                }
            } catch (error) {
                console.error('Błąd podczas pobierania danych:', error);
                setError('Wystąpił błąd podczas ładowania szczegółów transakcji. Spróbuj ponownie później.');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchTransactionDetails();
        }
    }, [id]);

    // Funkcje pomocnicze
    const formatDate = (dateString) => {
        if (!dateString) return 'Brak danych';

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

    const formatCurrency = (amount, currency) => {
        if (amount === undefined || amount === null) return 'Brak danych';

        // Upewnij się, że currency ma wartość i jest to poprawny kod waluty
        if (!currency || typeof currency !== 'string' || currency.length !== 3) {
            currency = 'PLN'; // Domyślna waluta, jeśli nie podano poprawnej
        }

        try {
            return new Intl.NumberFormat('pl-PL', {
                style: 'currency',
                currency: currency
            }).format(amount);
        } catch (error) {
            console.error('Błąd formatowania waluty:', error);
            return `${amount} ${currency}`;
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'completed':
                return { text: 'Zrealizowana', class: 'bg-green-100 text-green-800' };
            case 'pending':
                return { text: 'Oczekująca', class: 'bg-yellow-100 text-yellow-800' };
            case 'failed':
                return { text: 'Odrzucona', class: 'bg-red-100 text-red-800' };
            default:
                return { text: status, class: 'bg-gray-100 text-gray-800' };
        }
    };

    // Funkcja do ekstrakcji informacji o przewalutowaniu z opisu
    const extractConversionInfo = (description) => {
        if (!description) return null;

        const conversionMatch = description.match(/Przewalutowanie: ([\d.,]+) ([A-Z]{3}) = ([\d.,]+) ([A-Z]{3}), kurs: ([\d.,]+)/);

        if (conversionMatch) {
            return {
                sourceAmount: parseFloat(conversionMatch[1].replace(',', '.')),
                sourceCurrency: conversionMatch[2],
                targetAmount: parseFloat(conversionMatch[3].replace(',', '.')),
                targetCurrency: conversionMatch[4],
                exchangeRate: parseFloat(conversionMatch[5].replace(',', '.'))
            };
        }

        return null;
    };

    // Generowanie unikalnego numeru referencyjnego na podstawie ID i timestampa
    const generateReferenceNumber = (id, timestamp) => {
        if (!id || !timestamp) return 'Brak danych';

        const date = new Date(timestamp);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        return `REF-${year}${month}${day}-${id}`;
    };

    const handleCreateSimilarTransfer = () => {
        if (!transaction) return;

        // Przekierowanie do strony tworzenia przelewu z wstępnie wypełnionymi danymi
        window.location.href = `/transactions/create?from_account_id=${transaction.from_account_id}&to_account_id=${transaction.to_account_id}&amount=${transaction.amount}&title=${encodeURIComponent(transaction.title)}`;
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
                                <span className="ml-3 text-xl font-semibold text-gray-800">Szczegóły Transakcji</span>
                            </div>
                            <Link
                                href="/transactions"
                                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
                            >
                                Powrót do historii
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
                    <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                    <p className="text-center mt-4 text-gray-600">Ładowanie szczegółów transakcji...</p>
                </div>
            </div>
        );
    }

    if (error || !transaction) {
        return (
            <div className="min-h-screen bg-gray-100">
                {/* Nagłówek z logo */}
                <div className="bg-white shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <div className="flex items-center">
                                <BankLogo className="h-10 w-auto" />
                                <span className="ml-3 text-xl font-semibold text-gray-800">Szczegóły Transakcji</span>
                            </div>
                            <Link
                                href="/transactions"
                                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
                            >
                                Powrót do historii
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-lg shadow p-6 text-center">
                        <div className="text-red-500 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h2 className="text-xl font-bold mt-2">Błąd</h2>
                        </div>
                        <p>{error || 'Nie znaleziono szczegółów transakcji'}</p>
                        <div className="mt-6">
                            <Link
                                href="/transactions"
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                            >
                                Wróć do historii transakcji
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Ekstrakcja informacji o przewalutowaniu z opisu (jeśli istnieje)
    const conversionInfo = extractConversionInfo(transaction.description);

    // Określenie, czy transakcja ma opłaty
    const hasFees = transaction.fees && transaction.fees > 0;

    // Określenie kursora wymiany, jeśli nie ma informacji o przewalutowaniu w opisie
    const exchangeRate = conversionInfo ? conversionInfo.exchangeRate :
        (transaction.target_amount && transaction.amount ?
            (transaction.target_amount / transaction.amount).toFixed(6) : null);

    // Generowanie numeru referencyjnego
    const referenceNumber = generateReferenceNumber(transaction.id, transaction.created_at);

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Nagłówek z logo */}
            <div className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <BankLogo className="h-10 w-auto" />
                            <span className="ml-3 text-xl font-semibold text-gray-800">Szczegóły Transakcji</span>
                        </div>
                        <Link
                            href="/transactions"
                            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
                        >
                            Powrót do historii
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    {/* Nagłówek transakcji */}
                    <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <h2 className="text-xl font-bold text-gray-800">{transaction.title}</h2>
                            <div className="mt-2 md:mt-0">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusLabel(transaction.status).class}`}>
                                    {getStatusLabel(transaction.status).text}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Główne informacje */}
                    <div className="px-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Lewa kolumna */}
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Informacje o transakcji</h3>

                                <div className="space-y-3">
                                    <div>
                                        <p className="text-sm text-gray-500">Data i czas realizacji</p>
                                        <p className="font-medium">{formatDate(transaction.executed_at || transaction.created_at)}</p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-500">Kwota</p>
                                        <p className="text-xl font-bold">{formatCurrency(
                                            transaction.amount,
                                            sourceAccount ? sourceAccount.currency : (
                                                conversionInfo ? conversionInfo.sourceCurrency : 'PLN'
                                            )
                                        )}</p>
                                    </div>

                                    {/* Warunek dla kwoty po przewalutowaniu */}
                                    {((transaction.target_amount && transaction.target_amount !== transaction.amount) || conversionInfo) && (
                                        <div>
                                            <p className="text-sm text-gray-500">Kwota po przewalutowaniu</p>
                                            <p className="text-lg font-semibold">{formatCurrency(
                                                transaction.target_amount || (conversionInfo ? conversionInfo.targetAmount : 0),
                                                destinationAccount ? destinationAccount.currency : (
                                                    conversionInfo ? conversionInfo.targetCurrency : 'PLN'
                                                )
                                            )}</p>
                                        </div>
                                    )}

                                    {(conversionInfo || exchangeRate) && (
                                        <div>
                                            <p className="text-sm text-gray-500">Kurs wymiany</p>
                                            <p className="font-medium">
                                                1 {conversionInfo ? conversionInfo.sourceCurrency :
                                                (sourceAccount ? sourceAccount.currency : 'GBP')} = {
                                                conversionInfo ? conversionInfo.exchangeRate :
                                                    (exchangeRate || '1.00')} {
                                                conversionInfo ? conversionInfo.targetCurrency :
                                                    (destinationAccount ? destinationAccount.currency : 'USD')}
                                            </p>
                                        </div>
                                    )}

                                    {hasFees && (
                                        <div>
                                            <p className="text-sm text-gray-500">Opłaty</p>
                                            <p className="font-medium">{formatCurrency(transaction.fees, sourceAccount ? sourceAccount.currency : 'PLN')}</p>
                                        </div>
                                    )}

                                    <div>
                                        <p className="text-sm text-gray-500">Status</p>
                                        <p className="font-medium">{getStatusLabel(transaction.status).text}</p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-500">Numer referencyjny</p>
                                        <p className="font-mono text-sm">{referenceNumber}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Prawa kolumna */}
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Szczegóły przelewu</h3>

                                <div className="space-y-3">
                                    {sourceAccount && (
                                        <div>
                                            <p className="text-sm text-gray-500">Z konta</p>
                                            <p className="font-medium">{sourceAccount.name}</p>
                                            <p className="text-sm font-mono">{sourceAccount.account_number}</p>
                                            <p className="text-sm text-gray-600">Saldo po transakcji: {formatCurrency(sourceAccount.balance, sourceAccount.currency)}</p>
                                        </div>
                                    )}

                                    {destinationAccount && (
                                        <div className="mt-4">
                                            <p className="text-sm text-gray-500">Na konto</p>
                                            <p className="font-medium">{destinationAccount.name}</p>
                                            <p className="text-sm font-mono">{destinationAccount.account_number}</p>
                                        </div>
                                    )}

                                    <div className="mt-4">
                                        <p className="text-sm text-gray-500">Tytuł przelewu</p>
                                        <p className="font-medium">{transaction.title}</p>
                                    </div>

                                    {transaction.description && (
                                        <div className="mt-4">
                                            <p className="text-sm text-gray-500">Opis</p>
                                            <p className="text-sm">{transaction.description}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Przyciski akcji */}
                    <div className="bg-gray-50 px-6 py-4 flex flex-wrap gap-4 justify-end">
                        <button
                            onClick={handleCreateSimilarTransfer}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                        >
                            Wykonaj podobny przelew
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
