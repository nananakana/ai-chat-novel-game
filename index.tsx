
// @ts-nocheck
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// 外部ライブラリの動的インポート
(async () => {
    // OpenAI ライブラリの動的インポート
    if (!window.OpenAI) {
        try {
            await import('https://cdn.jsdelivr.net/npm/openai@4.29.2/dist/index.browser.min.js');
        } catch (e) {
            console.warn('OpenAI library failed to load:', e);
        }
    }
    
    // Google Generative AI ライブラリの動的インポート
    if (!window.GoogleGenerativeAI) {
        try {
            const module = await import('https://esm.run/@google/generative-ai');
            window.GoogleGenerativeAI = module.GoogleGenerativeAI;
        } catch (e) {
            console.warn('Google Generative AI library failed to load:', e);
        }
    }

    const rootElement = document.getElementById('root');
    if (!rootElement) {
        throw new Error("Could not find root element to mount to");
    }

    const root = ReactDOM.createRoot(rootElement);
    root.render(
        React.createElement(React.StrictMode, null, React.createElement(App))
    );
})();
