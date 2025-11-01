import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import ErrorBoundary from './ErrorBoundary';
import './styles.css';


createRoot(document.getElementById('root')).render(
    <ErrorBoundary>
        <HashRouter basename="/Hackathon_Portal_WiEmpower2.0">
            <App />
        </HashRouter>
    </ErrorBoundary>
);