import React, { useState, useEffect } from 'react';
import { Link, useForm } from '@inertiajs/react';
import axios from 'axios';
import TextInput from '@/components/TextInput';
import InputLabel from '@/components/InputLabel';
import PrimaryButton from '@/components/PrimaryButton';
import InputError from '@/components/InputError';
import BankLogo from '@/components/BankLogo';

const CreateTransaction = () => {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState({});
    const [status, setStatus] = useState(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedSourceAccount, setSelectedSourceAccount] = useState(null);

    // Pobierz parametry z URL jeśli istnieją
    const urlParams = new URLSearchParams(window.location.search);
    const fromAccountIdParam = urlParams.get('from_account_id');

    const { data, setData, reset } = useForm({
        from_account_id: fromAccountIdParam || '',
        to_account_id: '',
        amount: '',
        title: '',
        description: '',
    });

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

                    // Jeśli mamy parametr from_account_id z URL, zaktualizuj wybrany rachunek
                    if (fromAccountIdParam && accountsData.length > 0) {
                        const account = accountsData.find(acc => acc.id.toString() === fromAccountIdParam);
                        if (account) {
                            setSelectedSourceAccount(account);
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching accounts:', error);
                setStatus('Wystąpił błąd podczas pobierania listy kont.');
            } finally {
                setLoading(false);
            }
        };

        fetchAccounts();
    }, [fromAccountIdParam]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'from_account_id' && value) {
            const account = accounts.find(acc => acc.id.toString() === value);
            setSelectedSourceAccount(account);
        }

        setData(name, value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setStatus(null);
        setIsSuccess(false);
        setIsSubmitting(true);

        try {
            const response = await axios.post('/api/transactions', data, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                withCredentials: true,
            });

            if (response.data && response.data.success) {
                setIsSuccess(true);
                setStatus('Transakcja została pomyślnie zrealizowana.');
                reset();
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
                                <span className="ml-3 text-xl font-semibold text-gray-800">Wykonaj Przelew</span>
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
            {/* Nagłówek z logo */}
            <div className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <BankLogo className="h-10 w-auto" />
                            <span className="ml-3 text-xl font-semibold text-gray-800">Wykonaj Przelew</span>
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

                <h1 className="text-3xl font-bold text-gray-800 mb-6">Wykonaj przelew</h1>

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
                                    value={data.from_account_id}
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

                            {/* Na konto */}
                            <div className="mb-4">
                                <InputLabel htmlFor="to_account_id" value="Na konto" />
                                <select
                                    id="to_account_id"
                                    name="to_account_id"
                                    value={data.to_account_id}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm"
                                    required
                                    disabled={!data.from_account_id}
                                >
                                    <option value="">Wybierz konto docelowe</option>
                                    {accounts
                                        .filter(account => account.id.toString() !== data.from_account_id)
                                        .map((account) => (
                                            <option key={account.id} value={account.id}>
                                                {account.name} - {formatAccountNumber(account.account_number)}
                                            </option>
                                        ))}
                                </select>
                                {errors.to_account_id && <InputError message={errors.to_account_id} className="mt-2" />}
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
                                        value={data.amount}
                                        onChange={handleChange}
                                        className="pl-16 block w-full"
                                        placeholder="0.00"
                                        min="0.01"
                                        step="0.01"
                                        required
                                        disabled={!data.from_account_id}
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
                                    value={data.title}
                                    onChange={handleChange}
                                    className="mt-1 block w-full"
                                    placeholder="np. Opłata za czynsz"
                                    required
                                    disabled={!data.from_account_id}
                                />
                                {errors.title && <InputError message={errors.title} className="mt-2" />}
                            </div>

                            {/* Opis (opcjonalny) */}
                            <div className="mb-6">
                                <InputLabel htmlFor="description" value="Opis (opcjonalny)" />
                                <textarea
                                    id="description"
                                    name="description"
                                    value={data.description}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm"
                                    rows="3"
                                    placeholder="Dodatkowe informacje do przelewu"
                                    disabled={!data.from_account_id}
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
                                    disabled={isSubmitting || !data.from_account_id || !data.to_account_id || !data.amount || !data.title}
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

export default CreateTransaction;
