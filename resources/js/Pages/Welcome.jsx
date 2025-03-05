import { Head } from '@inertiajs/react';

export default function Welcome({ canLogin, canRegister, laravelVersion, phpVersion }) {
    return (
        <>
            <Head title="Welcome" />
            <div>
                <h1>Welcome to My App</h1>
                <p>Laravel version: {laravelVersion}</p>
                <p>PHP version: {phpVersion}</p>
            </div>
        </>
    );
}
