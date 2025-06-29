import React, { useState, useEffect } from 'react';
import { GameSettings } from '../types';
import { costService } from '../services/costService';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  onSettingsChange: (newSettings: Partial<GameSettings>) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose, settings, onSettingsChange }) => {
  const [monthlyLimit, setMonthlyLimit] = useState(50);
  const [costStats, setCostStats] = useState({ currentCost: 0, limit: 50 });

  useEffect(() => {
    if (isOpen) {
      const limit = costService.getMonthlyLimit();
      const currentCost = costService.getCurrentMonthCost();
      setMonthlyLimit(limit);
      setCostStats({ currentCost, limit });
    }
  }, [isOpen]);

  const handleLimitUpdate = () => {
    costService.setMonthlyLimit(monthlyLimit);
    setCostStats(prev => ({ ...prev, limit: monthlyLimit }));
  };

  const handleDownloadCsv = () => {
    costService.downloadCsvReport();
  };

  const handleClearCostHistory = () => {
    if (confirm('コスト履歴を削除しますか？この操作は元に戻せません。')) {
      costService.clearCostHistory();
      setCostStats({ currentCost: 0, limit: monthlyLimit });
    }
  };

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

          {/* コスト管理セクション */}
          <div className="border-t border-gray-600 pt-6">
            <h3 className="text-lg font-semibold mb-4">コスト管理</h3>
            
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-300 mb-2">
                  今月の使用量: ${costStats.currentCost.toFixed(6)} / ${costStats.limit} USD
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all ${
                      costStats.currentCost >= costStats.limit ? 'bg-red-500' : 
                      costStats.currentCost >= costStats.limit * 0.8 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min((costStats.currentCost / costStats.limit) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <label htmlFor="monthlyLimit" className="block text-sm font-medium text-gray-400 mb-1">月次上限 (USD)</label>
                <div className="flex gap-2">
                  <input
                    id="monthlyLimit"
                    type="number"
                    min="1"
                    max="1000"
                    step="1"
                    value={monthlyLimit}
                    onChange={(e) => setMonthlyLimit(Number(e.target.value))}
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    onClick={handleLimitUpdate}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors"
                  >
                    更新
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleDownloadCsv}
                  className="flex-1 py-2 bg-green-600 hover:bg-green-700 rounded-md transition-colors"
                >
                  CSV出力
                </button>
                <button
                  onClick={handleClearCostHistory}
                  className="flex-1 py-2 bg-red-600 hover:bg-red-700 rounded-md transition-colors"
                >
                  履歴削除
                </button>
              </div>
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
