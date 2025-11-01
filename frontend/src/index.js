import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import ErrorBoundary from './ErrorBoundary';
import './styles.css';

console.log('🚀 App starting...');
console.log('API Base:', process.env.REACT_APP_API_BASE || 'dynamic (will use current host:4000)');

const root = document.getElementById('root');
console.log('Root element:', root);

if (root) {
    createRoot(root).render(
        <HashRouter>
            <App />
        </HashRouter>
    );
} else {
    console.error('❌ Root element not found!');
}