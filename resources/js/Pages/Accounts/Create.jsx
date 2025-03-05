import React, { useState } from 'react';
import { Link, useForm } from '@inertiajs/react';
import axios from 'axios';
import TextInput from '@/components/TextInput';
import InputLabel from '@/components/InputLabel';
import PrimaryButton from '@/components/PrimaryButton';
import InputError from '@/components/InputError';

const CreateAccount = () => {
    const { data, setData, reset } = useForm({
        name: '',
        currency: 'PLN',
    });

    const [errors, setErrors] = useState({});
    const [status, setStatus] = useState(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const currencies = [
        { value: 'PLN', label: 'Polski złoty (PLN)' },
        { value: 'EUR', label: 'Euro (EUR)' },
        { value: 'USD', label: 'Dolar amerykański (USD)' },
        { value: 'GBP', label: 'Funt brytyjski (GBP)' },
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData(name, value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setStatus(null);
        setIsSuccess(false);
        setIsSubmitting(true);

        try {
            const response = await axios.post('/api/bank-accounts', data, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                withCredentials: true,
            });

            if (response.data && response.data.success) {
                setIsSuccess(true);
                setStatus(`Konto "${data.name}" zostało pomyślnie utworzone.`);
                reset();
            }
        } catch (error) {
            console.error('Error creating account:', error);

            if (error.response && error.response.data) {
                if (error.response.data.errors) {
                    setErrors(error.response.data.errors);
                } else if (error.response.data.message) {
                    setStatus(error.response.data.message);
                }
            } else {
                setStatus('Wystąpił błąd podczas tworzenia konta. Spróbuj ponownie.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6 flex items-center">
                <Link href="/accounts" className="text-blue-600 hover:text-blue-800 mr-2">
                    ← Wróć do listy kont
                </Link>
            </div>

            <h1 className="text-3xl font-bold text-gray-800 mb-6">Utwórz nowe konto</h1>

            <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
                {isSuccess ? (
                    <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6" role="alert">
                        <p className="font-bold">Sukces!</p>
                        <p>{status}</p>
                        <div className="mt-4 flex space-x-4">
                            <Link
                                href="/accounts"
                                className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition ease-in-out duration-150"
                            >
                                Przejdź do listy kont
                            </Link>
                            <button
                                onClick={() => {
                                    setIsSuccess(false);
                                    setStatus(null);
                                }}
                                className="inline-flex items-center px-4 py-2 bg-gray-800 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition ease-in-out duration-150"
                            >
                                Utwórz kolejne konto
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
                    <div className="mb-4">
                        <InputLabel htmlFor="name" value="Nazwa konta" />
                        <TextInput
                            id="name"
                            type="text"
                            name="name"
                            value={data.name}
                            onChange={handleChange}
                            className="mt-1 block w-full"
                            placeholder="np. Konto osobiste, Oszczędności, itp."
                            required
                            autoFocus
                        />
                        {errors.name && <InputError message={errors.name} className="mt-2" />}
                    </div>

                    <div className="mb-6">
                        <InputLabel htmlFor="currency" value="Waluta" />
                        <select
                            id="currency"
                            name="currency"
                            value={data.currency}
                            onChange={handleChange}
                            className="mt-1 block w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm"
                            required
                        >
                            {currencies.map((currency) => (
                                <option key={currency.value} value={currency.value}>
                                    {currency.label}
                                </option>
                            ))}
                        </select>
                        {errors.currency && <InputError message={errors.currency} className="mt-2" />}
                    </div>

                    <div className="flex items-center justify-end mt-6">
                        <Link
                            href="/accounts"
                            className="text-gray-600 hover:text-gray-900 underline rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Anuluj
                        </Link>

                        <PrimaryButton type="submit" className="ml-4" disabled={isSubmitting}>
                            {isSubmitting ? 'Tworzenie...' : 'Utwórz konto'}
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateAccount;
