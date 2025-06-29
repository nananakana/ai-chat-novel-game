
// @ts-nocheck
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// 外部ライブラリの動的インポートと初期化
(async () => {
    console.log('🚀 アプリケーション初期化開始...');
    
    // OpenAI ライブラリの動的インポート
    if (!window.OpenAI) {
        try {
            console.log('📦 OpenAI ライブラリ読み込み中...');
            // 最新の安定版を使用
            const openaiModule = await import('https://esm.sh/openai@4.29.2');
            window.OpenAI = openaiModule.default || openaiModule.OpenAI;
            window.OpenAIConfig.loaded = true;
            console.log('✅ OpenAI ライブラリ読み込み完了');
        } catch (e) {
            console.error('❌ OpenAI library failed to load:', e);
            window.OpenAIConfig.error = e.message;
        }
    }
    
    // Google Generative AI ライブラリの動的インポート
    if (!window.GoogleGenerativeAI) {
        try {
            console.log('📦 Google Generative AI ライブラリ読み込み中...');
            const module = await import('https://esm.sh/@google/generative-ai@0.21.0');
            window.GoogleGenerativeAI = module.GoogleGenerativeAI;
            window.GoogleAIConfig.loaded = true;
            console.log('✅ Google Generative AI ライブラリ読み込み完了');
        } catch (e) {
            console.error('❌ Google Generative AI library failed to load:', e);
            window.GoogleAIConfig.error = e.message;
        }
    }
    
    // ライブラリ読み込み結果をレポート
    const openaiStatus = window.OpenAI ? '✅' : '❌';
    const geminiStatus = window.GoogleGenerativeAI ? '✅' : '❌';
    console.log(`🔍 ライブラリ読み込み状況: OpenAI ${openaiStatus} | Gemini ${geminiStatus}`);

    const rootElement = document.getElementById('root');
    if (!rootElement) {
        throw new Error("Could not find root element to mount to");
    }

    console.log('🎯 React アプリケーション初期化中...');
    const root = ReactDOM.createRoot(rootElement);
    root.render(
        React.createElement(React.StrictMode, null, React.createElement(App))
    );
    
    console.log('🎉 AI Chat Novel Game 起動完了！');
    
    // パフォーマンス測定
    if (performance.mark) {
        performance.mark('app-start');
        console.log('⚡ アプリケーション初期化時間:', performance.now().toFixed(2) + 'ms');
    }
})();
