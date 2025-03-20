import axios from 'axios';
window.axios = axios;

axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
axios.defaults.withCredentials = true;

const token = document.head.querySelector('meta[name="csrf-token"]');
const authToken = localStorage.getItem('auth_token');

if (token) {
    axios.defaults.headers.common['X-CSRF-TOKEN'] = token.content;
} else {
    console.error('CSRF token not found');
}

if (authToken) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
}

axios.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 401) {
            console.log('Unauthorized request detected. Redirecting to login...');

            if (window.location.pathname !== '/login') {
                localStorage.removeItem('auth_token');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

axios.interceptors.request.use(function (config) {
    let token = document.head.querySelector('meta[name="csrf-token"]');

    if (token) {
        config.headers['X-CSRF-TOKEN'] = token.content;
    }

    const authToken = localStorage.getItem('auth_token');
    if (authToken) {
        config.headers['Authorization'] = `Bearer ${authToken}`;
    }

    return config;
});
