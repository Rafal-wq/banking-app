import React, { useState, useEffect } from 'react';

export default function Edit(props) {
    // Stan komponentu
    const [userData, setUserData] = useState({
        name: props.userData?.name || '',
        email: props.userData?.email || ''
    });

    const [passwordData, setPasswordData] = useState({
        current_password: '',
        password: '',
        password_confirmation: ''
    });

    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [passwordErrors, setPasswordErrors] = useState({});
    const [notification, setNotification] = useState({ show: false, type: '', message: '' });
    const [debugInfo, setDebugInfo] = useState(''); // Do debugowania

    // Ładowanie danych użytkownika
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                console.log("Próba pobrania danych użytkownika...");

                // Pobierz token CSRF przed wysłaniem żądania
                await fetch('/sanctum/csrf-cookie', {
                    method: 'GET',
                    credentials: 'include'
                });

                // Próba pobrania danych użytkownika
                const response = await fetch('/api/user', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    credentials: 'include'
                });

                console.log("Status odpowiedzi API:", response.status);

                if (response.ok) {
                    const data = await response.json();
                    console.log("Pobrane dane:", data);

                    if (data) {
                        setUserData({
                            name: data.name || '',
                            email: data.email || ''
                        });
                        setDebugInfo(`Dane pobrane: ${data.name}, ${data.email}`);
                    } else {
                        setDebugInfo("API zwróciło pusty obiekt danych");
                    }
                } else {
                    console.error('Nie udało się załadować danych użytkownika');
                    setDebugInfo(`Błąd API: ${response.status}`);

                    // W przypadku problemów z API, spróbujmy pobrać dane z innego źródła
                    // Na przykład, dane mogą być dostępne w window.__INITIAL_DATA__
                    if (window.__INITIAL_DATA__ && window.__INITIAL_DATA__.auth && window.__INITIAL_DATA__.auth.user) {
                        const userData = window.__INITIAL_DATA__.auth.user;
                        setUserData({
                            name: userData.name || '',
                            email: userData.email || ''
                        });
                        setDebugInfo("Dane pobrane z __INITIAL_DATA__");
                    } else {
                        // Spróbujmy sprawdzić, czy te dane są dostępne bezpośrednio w window
                        if (window.auth && window.auth.user) {
                            setUserData({
                                name: window.auth.user.name || '',
                                email: window.auth.user.email || ''
                            });
                            setDebugInfo("Dane pobrane z window.auth");
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
                setDebugInfo(`Błąd podczas pobierania danych: ${error.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    // Funkcje pomocnicze
    const showNotification = (type, message) => {
        setNotification({ show: true, type, message });
        setTimeout(() => {
            setNotification({ show: false, type: '', message: '' });
        }, 5000);
    };

    // Obsługa zmiany danych formularza
    const handleUserDataChange = (e) => {
        const { name, value } = e.target;
        setUserData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Obsługa formularza profilu
    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setIsSubmitting(true);

        try {
            // Pobierz token CSRF
            await fetch('/sanctum/csrf-cookie', {
                method: 'GET',
                credentials: 'include'
            });

            // Wyślij żądanie aktualizacji profilu
            const response = await fetch('/profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-HTTP-Method-Override': 'PATCH'
                },
                credentials: 'include',
                body: JSON.stringify({
                    ...userData,
                    _method: 'PATCH'
                })
            });

            if (response.ok) {
                showNotification('success', 'Dane profilu zostały pomyślnie zaktualizowane.');
            } else {
                const errorData = await response.json();
                if (errorData.errors) {
                    setErrors(errorData.errors);
                } else {
                    showNotification('error', 'Wystąpił błąd podczas zapisywania danych.');
                }
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            showNotification('error', 'Wystąpił błąd podczas łączenia z serwerem.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Obsługa formularza zmiany hasła
    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setPasswordErrors({});
        setIsPasswordSubmitting(true);

        try {
            // Pobierz token CSRF
            await fetch('/sanctum/csrf-cookie', {
                method: 'GET',
                credentials: 'include'
            });

            // Wyślij żądanie zmiany hasła
            const response = await fetch('/password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-HTTP-Method-Override': 'PUT'
                },
                credentials: 'include',
                body: JSON.stringify({
                    ...passwordData,
                    _method: 'PUT'
                })
            });

            if (response.ok) {
                showNotification('success', 'Hasło zostało pomyślnie zmienione.');
                setPasswordData({
                    current_password: '',
                    password: '',
                    password_confirmation: ''
                });
            } else {
                const errorData = await response.json();
                if (errorData.errors) {
                    setPasswordErrors(errorData.errors);
                } else {
                    showNotification('error', 'Wystąpił błąd podczas zmiany hasła.');
                }
            }
        } catch (error) {
            console.error('Error updating password:', error);
            showNotification('error', 'Wystąpił błąd podczas łączenia z serwerem.');
        } finally {
            setIsPasswordSubmitting(false);
        }
    };

    // Komponent ładowania
    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-100">
                <div className="text-center">
                    <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                    <p className="mt-2 text-gray-700 font-medium">Ładowanie danych użytkownika...</p>
                </div>
            </div>
        );
    }

    // Główny render
    return (
        <div className="min-h-screen bg-gray-100">
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-semibold text-gray-800">Profil użytkownika</h1>
                        <button
                            onClick={() => window.location.href = '/dashboard'}
                            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
                        >
                            Powrót do dashboardu
                        </button>
                    </div>

                    {/* Powiadomienie */}
                    {notification.show && (
                        <div className={`mb-4 p-4 rounded ${notification.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {notification.message}
                        </div>
                    )}

                    {/* Sekcja edycji profilu */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                        <div className="p-6">
                            <h2 className="text-lg font-semibold mb-4">Edycja danych</h2>

                            <form onSubmit={handleProfileSubmit}>
                                <div className="mb-4">
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Imię i nazwisko</label>
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        value={userData.name}
                                        onChange={handleUserDataChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                                        required
                                        placeholder="Wprowadź imię i nazwisko"
                                    />
                                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                                </div>

                                <div className="mb-6">
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Adres email</label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={userData.email}
                                        onChange={handleUserDataChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                                        required
                                        placeholder="Wprowadź adres email"
                                    />
                                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent mr-2 align-middle"></span>
                                                <span>Zapisywanie...</span>
                                            </>
                                        ) : (
                                            'Zapisz zmiany'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Sekcja zmiany hasła */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h2 className="text-lg font-semibold mb-4">Zmiana hasła</h2>

                            <form onSubmit={handlePasswordSubmit}>
                                <div className="mb-4">
                                    <label htmlFor="current_password" className="block text-sm font-medium text-gray-700">Aktualne hasło</label>
                                    <input
                                        id="current_password"
                                        name="current_password"
                                        type="password"
                                        value={passwordData.current_password}
                                        onChange={handlePasswordChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                                        required
                                    />
                                    {passwordErrors.current_password && (
                                        <p className="mt-1 text-sm text-red-600">{passwordErrors.current_password}</p>
                                    )}
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">Nowe hasło</label>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        value={passwordData.password}
                                        onChange={handlePasswordChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                                        required
                                    />
                                    {passwordErrors.password && (
                                        <p className="mt-1 text-sm text-red-600">{passwordErrors.password}</p>
                                    )}
                                </div>

                                <div className="mb-6">
                                    <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700">Potwierdź hasło</label>
                                    <input
                                        id="password_confirmation"
                                        name="password_confirmation"
                                        type="password"
                                        value={passwordData.password_confirmation}
                                        onChange={handlePasswordChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                                        required
                                    />
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={isPasswordSubmitting}
                                        className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isPasswordSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
                                    >
                                        {isPasswordSubmitting ? (
                                            <>
                                                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent mr-2 align-middle"></span>
                                                <span>Przetwarzanie...</span>
                                            </>
                                        ) : (
                                            'Zmień hasło'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
