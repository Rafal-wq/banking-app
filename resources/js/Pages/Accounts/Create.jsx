import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import axios from 'axios';

export default function CreateAccount() {
    const [formData, setFormData] = useState({
        name: '',
        currency: 'PLN',
    });

    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState(false);
    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        try {
            await axios.get('/sanctum/csrf-cookie');

            const response = await axios.post('/api/bank-accounts', formData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                withCredentials: true
            });

            if (response.data.success) {
                setSuccess(true);
                setMessage(response.data.message || 'Konto zostało pomyślnie utworzone!');
            }
        } catch (error) {
            console.error('Error creating account:', error);

            if (error.response) {
                if (error.response.data && error.response.data.errors) {
                    setErrors(error.response.data.errors);
                } else {
                    setMessage(error.response.data.message || 'Wystąpił błąd podczas tworzenia konta.');
                }
            } else {
                setMessage('Nie można nawiązać połączenia z serwerem.');
            }
        } finally {
            setProcessing(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            currency: 'PLN',
        });
        setSuccess(false);
        setMessage('');
        setErrors({});
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
                    <p className="mb-4">{message || 'Twoje nowe konto bankowe zostało pomyślnie utworzone.'}</p>
                    <div className="flex space-x-4">
                        <Link
                            href="/dashboard"
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                        >
                            Powrót do dashboardu
                        </Link>
                        <button
                            onClick={resetForm}
                            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
                        >
                            Utwórz kolejne konto
                        </button>
                    </div>
                </div>
            ) : (
                <div className="bg-white p-6 rounded-lg shadow">
                    {message && (
                        <div className="bg-red-100 p-4 rounded mb-4 text-red-700">
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-gray-700 font-medium mb-2" htmlFor="name">
                                Nazwa konta
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
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
                                name="currency"
                                value={formData.currency}
                                onChange={handleChange}
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
