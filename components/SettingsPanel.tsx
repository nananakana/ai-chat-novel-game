import React from 'react';
import { GameSettings } from '../types';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  onSettingsChange: (newSettings: Partial<GameSettings>) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose, settings, onSettingsChange }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-30 animate-fade-in" onClick={onClose}>
      <div 
        className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-gray-900 text-white p-6 shadow-lg transform transition-transform duration-300 ease-in-out"
        style={{ transform: isOpen ? 'translateX(0)' : 'translateX(100%)' }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
      >
        <h2 id="settings-title" className="text-2xl font-bold mb-6">設定</h2>
        
        <div className="space-y-6">
          <div>
            <label htmlFor="aiModel" className="block text-sm font-medium text-gray-400 mb-1">AIモデル</label>
            <select
              id="aiModel"
              value={settings.aiModel}
              onChange={(e) => onSettingsChange({ aiModel: e.target.value as any })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="gemini">Gemini 1.5 Flash</option>
              <option value="chatgpt">ChatGPT-4o-mini</option>
              <option value="gemini-cli">Gemini CLI (Local)</option>
              <option value="dummy">Debug (Dummy AI)</option>
            </select>
          </div>

          {settings.aiModel === 'gemini' && (
            <div>
              <label htmlFor="geminiApiKey" className="block text-sm font-medium text-gray-400 mb-1">Gemini API Key</label>
              <input
                id="geminiApiKey"
                type="password"
                value={settings.geminiApiKey}
                onChange={(e) => onSettingsChange({ geminiApiKey: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Gemini APIキーを入力..."
              />
            </div>
          )}

          {settings.aiModel === 'chatgpt' && (
            <div>
              <label htmlFor="openaiApiKey" className="block text-sm font-medium text-gray-400 mb-1">OpenAI API Key</label>
              <input
                id="openaiApiKey"
                type="password"
                value={settings.openaiApiKey}
                onChange={(e) => onSettingsChange({ openaiApiKey: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="OpenAI APIキーを入力..."
              />
            </div>
          )}

          {settings.aiModel === 'gemini-cli' && (
            <div className="p-3 bg-yellow-800 bg-opacity-50 border border-yellow-600 rounded-md">
              <p className="text-sm text-yellow-300">
                Gemini CLIモードは現在ブラウザでは動作しません。サーバーサイド実装が必要です。
              </p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <label htmlFor="showCost" className="text-sm font-medium text-gray-300">コストを表示</label>
             <div className="relative inline-flex items-center cursor-pointer">
                <input id="showCost" type="checkbox" checked={settings.showCost} onChange={(e) => onSettingsChange({ showCost: e.target.checked })} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-indigo-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </div>
          </div>
        </div>

        <button onClick={onClose} className="mt-8 w-full py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors">
          閉じる
        </button>
      </div>
    </div>
  );
};
