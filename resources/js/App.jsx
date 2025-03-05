import './bootstrap';
import '../css/app.css';

import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';

import { Ziggy } from './ziggy.js';

// Dodaj funkcję global route helper
window.route = (name, params, absolute) => {
    const ziggy = {
        ...Ziggy,
        location: window.location,
    };

    try {
        if (ziggy.routes[name]) {
            let path = ziggy.routes[name].uri;

            if (params) {
                Object.keys(params).forEach(key => {
                    path = path.replace(`{${key}}`, params[key]);
                });
            }

            return absolute
                ? `${ziggy.url}/${path}`
                : `/${path}`;
        }

        console.warn(`Route [${name}] not found.`);
        return '/';
    } catch (error) {
        console.error('Error using route helper:', error);
        return '/';
    }
};

createInertiaApp({
    title: (title) => `${title} - Laravel`,
    resolve: (name) => resolvePageComponent(`./Pages/${name}.jsx`, import.meta.glob('./Pages/**/*.jsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});
