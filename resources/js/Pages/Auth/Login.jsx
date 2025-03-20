import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import InputLabel from '@/components/InputLabel';
import TextInput from '@/components/TextInput';
import InputError from '@/components/InputError';
import PrimaryButton from '@/components/PrimaryButton';
import { Link } from '@inertiajs/react';
import axios from 'axios';

export default function Login() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        remember: false,
    });

    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});
    const [generalError, setGeneralError] = useState('');

    const handleChange = (e) => {
        const { name, value, checked, type } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    async function handleSubmit(e) {
        e.preventDefault();
        setProcessing(true);
        setErrors({});
        setGeneralError('');

        try {
            const response = await axios.post('/login', formData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (response.data.token) {
                localStorage.setItem('auth_token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                window.location.href = '/dashboard';
            }
        } catch (error) {
            if (error.response && error.response.data.errors) {
                setErrors(error.response.data.errors);
            } else {
                setGeneralError('Wystąpił błąd podczas logowania. Spróbuj ponownie.');
            }
            setProcessing(false);
        }
    }

    return (
        <>
            <Head title="Logowanie" />

            <div className="min-h-screen flex flex-col sm:justify-center items-center pt-6 sm:pt-0 bg-gray-100">
                <div className="w-full sm:max-w-md mt-6 px-6 py-4 bg-white shadow-md overflow-hidden sm:rounded-lg">
                    <h1 className="text-2xl font-bold text-center mb-6">Logowanie</h1>

                    {generalError && (
                        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
                            {generalError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div>
                            <InputLabel htmlFor="email" value="Email" />
                            <TextInput
                                id="email"
                                type="email"
                                name="email"
                                value={formData.email}
                                className="mt-1 block w-full"
                                autoComplete="username"
                                autoFocus
                                onChange={handleChange}
                            />
                            <InputError message={errors.email} className="mt-2" />
                        </div>

                        <div className="mt-4">
                            <InputLabel htmlFor="password" value="Hasło" />
                            <TextInput
                                id="password"
                                type="password"
                                name="password"
                                value={formData.password}
                                className="mt-1 block w-full"
                                autoComplete="current-password"
                                onChange={handleChange}
                            />
                            <InputError message={errors.password} className="mt-2" />
                        </div>

                        <div className="block mt-4">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="remember"
                                    checked={formData.remember}
                                    onChange={handleChange}
                                    className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                                />
                                <span className="ml-2 text-sm text-gray-600">Zapamiętaj mnie</span>
                            </label>
                        </div>

                        <div className="flex items-center justify-end mt-4">
                            <Link
                                href="/forgot-password"
                                className="underline text-sm text-gray-600 hover:text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Zapomniałeś hasła?
                            </Link>

                            <PrimaryButton className="ml-4" disabled={processing}>
                                {processing ? 'Logowanie...' : 'Zaloguj'}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
