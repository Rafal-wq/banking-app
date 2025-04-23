import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import axios from 'axios';
import BankLogo from '@/components/BankLogo';

export default function Login() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        remember: false
    });

    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        try {
            // Pobieramy CSRF token
            await axios.get('/sanctum/csrf-cookie');

            // Logowanie
            const response = await axios.post('/login', formData);

            // Zapisujemy token, jeśli istnieje w odpowiedzi
            if (response.data && response.data.token) {
                localStorage.setItem('auth_token', response.data.token);
            }

            // Bezpośrednie przekierowanie za pomocą window.location
            window.location.replace('/dashboard');
        } catch (error) {
            setProcessing(false);
            if (error.response && error.response.data && error.response.data.errors) {
                setErrors(error.response.data.errors);
            } else {
                setErrors({ general: 'Nieprawidłowe dane logowania.' });
            }
        }
    };

    // Funkcja do powrotu na stronę główną
    const goToHomePage = () => {
        window.location.replace('/');
    };

    return (
        <>
            <Head title="Logowanie" />

            <div className="min-h-screen flex justify-center items-center bg-gray-100">
                <div className="max-w-md w-full bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-6">
                        {/* Dodanie logo banku na górze formularza */}
                        <div className="flex flex-col items-center mb-6">
                            <BankLogo className="h-16 w-auto mb-2" />
                            <h1 className="text-2xl font-bold text-gray-800">Logowanie</h1>
                        </div>

                        <div className="flex justify-end mb-4">
                            <button
                                onClick={goToHomePage}
                                className="text-blue-600 hover:text-blue-800"
                                type="button"
                            >
                                Powrót do strony głównej
                            </button>
                        </div>

                        {errors.general && (
                            <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
                                {errors.general}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            {/* Email */}
                            <div className="mb-4">
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    autoComplete="username"
                                    autoFocus
                                    onChange={handleChange}
                                    required
                                />
                                {errors.email && <p className="mt-1 text-sm text-red-600">{Array.isArray(errors.email) ? errors.email[0] : errors.email}</p>}
                            </div>

                            {/* Hasło */}
                            <div className="mb-4">
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Hasło</label>
                                <input
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    autoComplete="current-password"
                                    onChange={handleChange}
                                    required
                                />
                                {errors.password && <p className="mt-1 text-sm text-red-600">{Array.isArray(errors.password) ? errors.password[0] : errors.password}</p>}
                            </div>

                            {/* Zapamiętaj mnie */}
                            <div className="mb-4">
                                <label className="inline-flex items-center">
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

                            <div className="flex items-center justify-between mt-6">
                                <Link
                                    href="/forgot-password"
                                    className="text-sm text-gray-600 hover:text-gray-900 underline"
                                >
                                    Zapomniałeś hasła?
                                </Link>

                                <button
                                    type="submit"
                                    className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none ${processing ? 'opacity-75 cursor-not-allowed' : ''}`}
                                    disabled={processing}
                                >
                                    {processing ? 'Logowanie...' : 'Zaloguj'}
                                </button>
                            </div>

                            {/* Dodanie przycisku rejestracji na dole formularza */}
                            <div className="mt-6 text-center">
                                <span className="text-gray-600">Nie masz konta?</span>
                                <Link
                                    href="/register"
                                    className="ml-1 text-blue-600 hover:text-blue-800 underline"
                                >
                                    Zarejestruj się
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
