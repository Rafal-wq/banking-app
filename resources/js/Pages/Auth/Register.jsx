import { useState } from "react";
import { Head, Link } from '@inertiajs/react';
import axios from "axios";
import BankLogo from '@/Components/BankLogo';

export default function Register() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        password_confirmation: ""
    });

    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);

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
            // Pobieramy CSRF token
            await axios.get('/sanctum/csrf-cookie');

            // Rejestracja użytkownika
            const response = await axios.post('/register', formData);

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
                setErrors({ general: 'Wystąpił błąd podczas rejestracji. Spróbuj ponownie.' });
            }
        }
    };

    // Funkcja do powrotu na stronę główną
    const goToHomePage = () => {
        window.location.replace('/');
    };

    return (
        <>
            <Head title="Rejestracja" />

            <div className="min-h-screen flex justify-center items-center bg-gray-100">
                <div className="max-w-md w-full bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-6">
                        {/* Dodanie logo banku na górze formularza */}
                        <div className="flex flex-col items-center mb-6">
                            <BankLogo className="h-16 w-auto mb-2" />
                            <h1 className="text-2xl font-bold text-gray-800">Rejestracja</h1>
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
                            {/* Imię */}
                            <div className="mb-4">
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Imię i nazwisko</label>
                                <input
                                    id="name"
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    autoComplete="name"
                                    autoFocus
                                    onChange={handleChange}
                                    required
                                />
                                {errors.name && <p className="mt-1 text-sm text-red-600">{Array.isArray(errors.name) ? errors.name[0] : errors.name}</p>}
                            </div>

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
                                    autoComplete="new-password"
                                    onChange={handleChange}
                                    required
                                />
                                {errors.password && <p className="mt-1 text-sm text-red-600">{Array.isArray(errors.password) ? errors.password[0] : errors.password}</p>}
                            </div>

                            {/* Potwierdzenie hasła */}
                            <div className="mb-6">
                                <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700">Powtórz hasło</label>
                                <input
                                    id="password_confirmation"
                                    type="password"
                                    name="password_confirmation"
                                    value={formData.password_confirmation}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    autoComplete="new-password"
                                    onChange={handleChange}
                                    required
                                />
                                {errors.password_confirmation && <p className="mt-1 text-sm text-red-600">{Array.isArray(errors.password_confirmation) ? errors.password_confirmation[0] : errors.password_confirmation}</p>}
                            </div>

                            <div className="flex items-center justify-between mt-6">
                                <Link
                                    href="/login"
                                    className="text-sm text-gray-600 hover:text-gray-900 underline"
                                >
                                    Masz już konto? Zaloguj się
                                </Link>

                                <button
                                    type="submit"
                                    className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none ${processing ? 'opacity-75 cursor-not-allowed' : ''}`}
                                    disabled={processing}
                                >
                                    {processing ? 'Przetwarzanie...' : 'Zarejestruj się'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
