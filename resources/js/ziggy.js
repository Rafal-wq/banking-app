const Ziggy = {
    url: 'http://localhost:8000',
    port: 8000,
    defaults: {},
    routes: {
        'login': { uri: 'login', methods: ['GET', 'HEAD'] },
        'register': { uri: 'register', methods: ['GET', 'HEAD'] },
        'password.request': { uri: 'forgot-password', methods: ['GET', 'HEAD'] },
        'password.reset': { uri: 'reset-password/{token}', methods: ['GET', 'HEAD'] },
        'dashboard': { uri: 'dashboard', methods: ['GET', 'HEAD'] },
        'verification.notice': { uri: 'verify-email', methods: ['GET', 'HEAD'] },
        'verification.verify': { uri: 'verify-email/{id}/{hash}', methods: ['GET', 'HEAD'] },
    }
};

export { Ziggy };
