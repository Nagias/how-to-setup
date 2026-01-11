import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';

console.log('🚀 main.jsx: Starting React app...');
console.log('📱 main.jsx: Current URL:', window.location.href);
console.log('🔗 main.jsx: Hash:', window.location.hash);

try {
    console.log('🔧 main.jsx: Creating React root...');
    const root = ReactDOM.createRoot(document.getElementById('root'));
    console.log('✅ main.jsx: React root created');

    root.render(
        <React.StrictMode>
            <HelmetProvider>
                <HashRouter>
                    <App />
                </HashRouter>
            </HelmetProvider>
        </React.StrictMode>
    );
    console.log('✅ main.jsx: React app rendered');
} catch (error) {
    console.error('❌ main.jsx: Error rendering app:', error);
    alert('Error: ' + error.message);
}
