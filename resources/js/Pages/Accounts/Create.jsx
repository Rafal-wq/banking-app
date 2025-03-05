import React, { useState } from 'react';
import { Link, useForm } from '@inertiajs/react';

export default function CreateAccount() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        currency: 'PLN',
    });

    const [success, setSuccess] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();

        post('/api/bank-accounts', {
            onSuccess: () => {
                setSuccess(true);
            },
        });
    };

    const currencies = [
        { value: 'PLN', label: 'Polski złoty (PLN)' },
        { value: 'EUR', label: 'Euro (EUR)' },
        { value: 'USD', label: 'Dolar amerykański (USD)' },
        { value: 'GBP', label: 'Funt brytyjski (GBP)' },
    ];

    return (
        <div className="p-6 max-w-3xl mx-auto">
            <div className="mb-6">
                <Link href="/dashboard" className="text-blue-500 hover:text-blue-700">
                    &larr; Powrót do dashboardu
                </Link>
            </div>

            <h1 className="text-2xl font-semibold mb-6">Otwórz nowe konto bankowe</h1>

            {success ? (
                <div className="bg-green-100 p-6 rounded-lg shadow mb-6">
                    <h2 className="text-xl text-green-800 font-semibold mb-2">Konto zostało utworzone!</h2>
                    <p className="mb-4">Twoje nowe konto bankowe zostało pomyślnie utworzone.</p>
                    <div className="flex space-x-4">
                        <Link
                            href="/dashboard"
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                        >
                            Powrót do dashboardu
                        </Link>
                        <button
                            onClick={() => {
                                setData({ name: '', currency: 'PLN' });
                                setSuccess(false);
                            }}
                            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
                        >
                            Utwórz kolejne konto
                        </button>
                    </div>
                </div>
            ) : (
                <div className="bg-white p-6 rounded-lg shadow">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-gray-700 font-medium mb-2" htmlFor="name">
                                Nazwa konta
                            </label>
                            <input
                                type="text"
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="np. Konto osobiste, Oszczędności, Wakacje"
                                required
                            />
                            {errors.name && <div className="text-red-500 text-sm mt-1">{errors.name}</div>}
                        </div>

                        <div className="mb-6">
                            <label className="block text-gray-700 font-medium mb-2" htmlFor="currency">
                                Waluta
                            </label>
                            <select
                                id="currency"
                                value={data.currency}
                                onChange={(e) => setData('currency', e.target.value)}
                                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                {currencies.map(currency => (
                                    <option key={currency.value} value={currency.value}>
                                        {currency.label}
                                    </option>
                                ))}
                            </select>
                            {errors.currency && <div className="text-red-500 text-sm mt-1">{errors.currency}</div>}
                        </div>

                        <div className="flex justify-end">
                            <Link
                                href="/dashboard"
                                className="px-4 py-2 text-gray-700 mr-2 hover:text-gray-900"
                            >
                                Anuluj
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition disabled:opacity-50"
                            >
                                {processing ? 'Tworzenie...' : 'Utwórz konto'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
