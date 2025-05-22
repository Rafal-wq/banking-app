import React, { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import axios from 'axios';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import InputError from '@/Components/InputError';
import BankLogo from '@/Components/BankLogo';

export default function ExternalTransfer() {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState({});
    const [status, setStatus] = useState(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedSourceAccount, setSelectedSourceAccount] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [foundAccount, setFoundAccount] = useState(null);

    // === NOWY STAN DLA TOAST NOTIFICATIONS ===
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState('');
    const [showToast, setShowToast] = useState(false);

    const [formData, setFormData] = useState({
        from_account_id: '',
        to_account_number: '',
        amount: '',
        title: '',
        description: '',
    });

    // === FUNKCJA DO POKAZYWANIA TOAST ===
    const showEmailToast = (message, type) => {
        setToastMessage(message);
        setToastType(type);
        setShowToast(true);

        // Ukryj toast po 4 sekundach
        setTimeout(() => {
            setShowToast(false);
        }, 4000);
    };

    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                const response = await axios.get('/api/bank-accounts', {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                    withCredentials: true,
                });

                if (response.data && response.data.success) {
                    const accountsData = response.data.data || [];
                    setAccounts(accountsData);
                }
            } catch (error) {
                console.error('Error fetching accounts:', error);
                setStatus('Wystąpił błąd podczas pobierania listy kont.');
            } finally {
                setLoading(false);
            }
        };

        fetchAccounts();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'from_account_id' && value) {
            const account = accounts.find(acc => acc.id.toString() === value);
            setSelectedSourceAccount(account);
        }

        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const searchAccount = async () => {
        if (!formData.to_account_number || formData.to_account_number.length < 5) {
            setErrors({
                ...errors,
                to_account_number: 'Wprowadź co najmniej 5 znaków numeru konta'
            });
            return;
        }

        setIsSearching(true);
        setFoundAccount(null);
        setErrors({});

        try {
            const response = await axios.get('/api/find-account', {
                params: { account_number: formData.to_account_number },
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                withCredentials: true,
            });

            if (response.data && response.data.success) {
                setFoundAccount(response.data.data);
            }
        } catch (error) {
            console.error('Error searching account:', error);
            if (error.response && error.response.data) {
                if (error.response.data.errors) {
                    setErrors(error.response.data.errors);
                } else if (error.response.data.message) {
                    setErrors({
                        to_account_number: error.response.data.message
                    });
                }
            } else {
                setErrors({
                    to_account_number: 'Wystąpił błąd podczas wyszukiwania konta.'
                });
            }
        } finally {
            setIsSearching(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setStatus(null);
        setIsSuccess(false);
        setIsSubmitting(true);

        try {
            // Przygotowanie danych do wysłania
            // Ważne: używamy id znalezionego konta, a nie numeru konta
            const transactionData = {
                from_account_id: formData.from_account_id,
                to_account_id: foundAccount.id, // Używamy ID znalezionego konta
                amount: formData.amount,
                title: formData.title,
                description: formData.description,
            };

            console.log("Sending transaction data:", transactionData);

            const response = await axios.post('/api/transactions', transactionData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                withCredentials: true,
            });

            if (response.data && response.data.success) {
                setIsSuccess(true);
                setStatus(response.data.message);

                // === NOWA LOGIKA TOAST ===
                // Sprawdź czy email został wysłany i pokaż toast po 2 sekundach
                if (response.data.email_sent) {
                    setTimeout(() => {
                        showEmailToast('✅ Email z potwierdzeniem transakcji został wysłany', 'success');
                    }, 2000);
                }

                setFormData({
                    from_account_id: '',
                    to_account_number: '',
                    amount: '',
                    title: '',
                    description: '',
                });
                setFoundAccount(null);
                setSelectedSourceAccount(null);
            }
        } catch (error) {
            console.error('Error creating transaction:', error);

            if (error.response && error.response.data) {
                if (error.response.data.errors) {
                    setErrors(error.response.data.errors);
                } else if (error.response.data.message) {
                    setStatus(error.response.data.message);
                }
            } else {
                setStatus('Wystąpił błąd podczas realizacji transakcji. Spróbuj ponownie.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // Helper function to format account number for display
    const formatAccountNumber = (accountNumber) => {
        if (!accountNumber) return '';
        return accountNumber.replace(/(.{2})(.{4})(.{4})(.{4})(.{4})(.{4})(.{4})/, '$1 $2 $3 $4 $5 $6 $7');
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
                                <span className="ml-3 text-xl font-semibold text-gray-800">Przelew Zewnętrzny</span>
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

                <div className="flex justify-center items-center h-64">
                    <div className="text-center">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                        <p className="mt-2">Ładowanie danych...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* === TOAST NOTIFICATION === */}
            {showToast && (
                <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transition-all duration-300 ${
                    toastType === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                }`}>
                    <div className="flex items-center">
                        <span>{toastMessage}</span>
                        <button
                            onClick={() => setShowToast(false)}
                            className="ml-4 text-white hover:text-gray-200"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}

            {/* Nagłówek z logo */}
            <div className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <BankLogo className="h-10 w-auto" />
                            <span className="ml-3 text-xl font-semibold text-gray-800">Przelew Zewnętrzny</span>
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

            <div className="container mx-auto px-4 py-8">
                <div className="mb-6 flex items-center">
                    <Link href="/dashboard" className="text-blue-600 hover:text-blue-800 mr-2">
                        ← Wróć do panelu
                    </Link>
                </div>

                <h1 className="text-3xl font-bold text-gray-800 mb-6">Przelew na obce konto</h1>

                {accounts.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-8 text-center">
                        <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        <h3 className="mt-2 text-xl font-medium text-gray-900">Nie masz żadnych kont</h3>
                        <p className="mt-1 text-gray-500">Aby wykonać przelew, musisz najpierw utworzyć konto bankowe.</p>
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
                    <div className="bg-white rounded-lg shadow-md p-6 max-w-3xl mx-auto">
                        {isSuccess ? (
                            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6" role="alert">
                                <p className="font-bold">Sukces!</p>
                                <p>{status}</p>
                                <div className="mt-4 flex space-x-4">
                                    <Link
                                        href="/transactions"
                                        className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                    >
                                        Historia transakcji
                                    </Link>
                                    <button
                                        onClick={() => {
                                            setIsSuccess(false);
                                            setStatus(null);
                                        }}
                                        className="inline-flex items-center px-4 py-2 bg-gray-800 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                    >
                                        Wykonaj kolejny przelew
                                    </button>
                                </div>
                            </div>
                        ) : status && !isSuccess ? (
                            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
                                <p className="font-bold">Błąd!</p>
                                <p>{status}</p>
                            </div>
                        ) : null}

                        <form onSubmit={handleSubmit}>
                            {/* Z konta */}
                            <div className="mb-4">
                                <InputLabel htmlFor="from_account_id" value="Z konta" />
                                <select
                                    id="from_account_id"
                                    name="from_account_id"
                                    value={formData.from_account_id}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm"
                                    required
                                >
                                    <option value="">Wybierz konto źródłowe</option>
                                    {accounts.map((account) => (
                                        <option key={account.id} value={account.id}>
                                            {account.name} - {formatAccountNumber(account.account_number)} ({new Intl.NumberFormat('pl-PL', { style: 'currency', currency: account.currency }).format(account.balance)})
                                        </option>
                                    ))}
                                </select>
                                {errors.from_account_id && <InputError message={errors.from_account_id} className="mt-2" />}
                            </div>

                            {/* Na konto (wyszukiwanie) */}
                            <div className="mb-4">
                                <InputLabel htmlFor="to_account_number" value="Na konto (numer)" />
                                <div className="mt-1 flex">
                                    <TextInput
                                        id="to_account_number"
                                        type="text"
                                        name="to_account_number"
                                        value={formData.to_account_number}
                                        onChange={handleChange}
                                        className="block w-full rounded-r-none"
                                        placeholder="Wprowadź numer konta odbiorcy (min. 5 znaków)"
                                        required
                                        disabled={!formData.from_account_id || foundAccount}
                                    />
                                    <button
                                        type="button"
                                        onClick={searchAccount}
                                        disabled={!formData.from_account_id || isSearching || formData.to_account_number.length < 5 || foundAccount}
                                        className="px-4 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 focus:outline-none disabled:opacity-50"
                                    >
                                        {isSearching ? 'Szukam...' : 'Szukaj'}
                                    </button>
                                </div>
                                {errors.to_account_number && <InputError message={errors.to_account_number} className="mt-2" />}

                                {/* Znalezione konto */}
                                {foundAccount && (
                                    <div className="mt-2 p-3 border border-green-300 rounded-md bg-green-50">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="font-semibold">{foundAccount.user_name}</p>
                                                <p className="text-sm text-gray-600">{foundAccount.name} ({foundAccount.currency})</p>
                                                <p className="text-sm font-mono">{formatAccountNumber(foundAccount.account_number)}</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setFoundAccount(null);
                                                    setFormData({
                                                        ...formData,
                                                        to_account_number: ''
                                                    });
                                                }}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                Anuluj
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Kwota */}
                            <div className="mb-4">
                                <InputLabel htmlFor="amount" value="Kwota" />
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 sm:text-sm">
                                            {selectedSourceAccount ? selectedSourceAccount.currency : 'PLN'}
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
                                        disabled={!formData.from_account_id || !foundAccount}
                                    />
                                </div>
                                {selectedSourceAccount && (
                                    <p className="mt-1 text-sm text-gray-500">
                                        Dostępne środki: {new Intl.NumberFormat('pl-PL', { style: 'currency', currency: selectedSourceAccount.currency }).format(selectedSourceAccount.balance)}
                                    </p>
                                )}
                                {errors.amount && <InputError message={errors.amount} className="mt-2" />}
                            </div>

                            {/* Tytuł przelewu */}
                            <div className="mb-4">
                                <InputLabel htmlFor="title" value="Tytuł przelewu" />
                                <TextInput
                                    id="title"
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="mt-1 block w-full"
                                    placeholder="np. Opłata za czynsz"
                                    required
                                    disabled={!formData.from_account_id || !foundAccount}
                                />
                                {errors.title && <InputError message={errors.title} className="mt-2" />}
                            </div>

                            {/* Opis (opcjonalny) */}
                            <div className="mb-6">
                                <InputLabel htmlFor="description" value="Opis (opcjonalny)" />
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm"
                                    rows="3"
                                    placeholder="Dodatkowe informacje do przelewu"
                                    disabled={!formData.from_account_id || !foundAccount}
                                ></textarea>
                                {errors.description && <InputError message={errors.description} className="mt-2" />}
                            </div>

                            <div className="flex items-center justify-end mt-6">
                                <Link
                                    href="/dashboard"
                                    className="text-gray-600 hover:text-gray-900 underline rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Anuluj
                                </Link>

                                <PrimaryButton
                                    type="submit"
                                    className="ml-4"
                                    disabled={isSubmitting || !formData.from_account_id || !foundAccount || !formData.amount || !formData.title}
                                >
                                    {isSubmitting ? 'Przetwarzanie...' : 'Wykonaj przelew'}
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
