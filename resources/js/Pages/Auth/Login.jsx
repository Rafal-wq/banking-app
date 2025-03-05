import React, { useState, useEffect } from 'react';
import { Link, useForm, router } from '@inertiajs/react';
import TextInput from '@/components/TextInput';
import InputLabel from '@/components/InputLabel';
import PrimaryButton from '@/components/PrimaryButton';
import InputError from '@/components/InputError';

export default function Login() {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const [status, setStatus] = useState(null);

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();

        post('/login', {
            onSuccess: () => {
            },
            onError: (errors) => {
                if (errors.email || errors.password) {
                    setStatus('Nieprawidłowe dane logowania.');
                } else {
                    setStatus('Wystąpił błąd podczas logowania.');
                }
            },
        });
    };

    return (
        <div className="min-h-screen flex flex-col sm:justify-center items-center pt-6 sm:pt-0 bg-gray-100">
            <div className="w-full sm:max-w-md mt-6 px-6 py-4 bg-white shadow-md overflow-hidden sm:rounded-lg">
                <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">Logowanie</h1>

                {status && (
                    <div className="mb-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
                        <p>{status}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <InputLabel htmlFor="email" value="Email" />
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            className="mt-1 block w-full"
                            autoComplete="username"
                            required
                        />
                        {errors.email && <InputError message={errors.email} className="mt-2" />}
                    </div>

                    <div className="mb-4">
                        <InputLabel htmlFor="password" value="Hasło" />
                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            className="mt-1 block w-full"
                            autoComplete="current-password"
                            required
                        />
                        {errors.password && <InputError message={errors.password} className="mt-2" />}
                    </div>

                    <div className="block mb-4">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                name="remember"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                                className="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-gray-600">Zapamiętaj mnie</span>
                        </label>
                    </div>

                    <div className="flex items-center justify-between mt-6">
                        <Link
                            href={route('password.request')}
                            className="text-sm text-gray-600 hover:text-gray-900 underline rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Zapomniałeś hasła?
                        </Link>

                        <PrimaryButton type="submit" className="ml-4" disabled={processing}>
                            {processing ? 'Logowanie...' : 'Zaloguj się'}
                        </PrimaryButton>
                    </div>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        Nie masz konta?{' '}
                        <Link
                            href={route('register')}
                            className="text-blue-600 hover:text-blue-900 underline"
                        >
                            Zarejestruj się
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
