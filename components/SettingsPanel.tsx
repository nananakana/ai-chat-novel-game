import React, { useState, useEffect } from 'react';
import { GameSettings, CustomWorldSetting, CustomCharacter } from '../types';
import { costService } from '../services/costService';
import { LIGHT_THEME_COLORS } from '../constants';
import { WorldEditor } from './WorldEditor';
import { CharacterEditor } from './CharacterEditor';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  onSettingsChange: (newSettings: Partial<GameSettings>) => void;
  customWorldSetting?: CustomWorldSetting;
  customCharacters: CustomCharacter[];
  onWorldSettingChange: (setting: CustomWorldSetting) => void;
  onCharactersChange: (characters: CustomCharacter[]) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ 
  isOpen, 
  onClose, 
  settings, 
  onSettingsChange,
  customWorldSetting,
  customCharacters,
  onWorldSettingChange,
  onCharactersChange
}) => {
  const [monthlyLimit, setMonthlyLimit] = useState(50);
  const [costStats, setCostStats] = useState({ currentCost: 0, limit: 50 });
  const [isWorldEditorOpen, setWorldEditorOpen] = useState(false);
  const [isCharacterEditorOpen, setCharacterEditorOpen] = useState(false);

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
    <div className="fixed inset-0 bg-black bg-opacity-30 z-30 animate-fade-in" onClick={onClose}>
      <div 
        className={`fixed right-0 top-0 bottom-0 w-full max-w-sm ${LIGHT_THEME_COLORS.background.panel} ${LIGHT_THEME_COLORS.text.primary} p-6 shadow-xl transform transition-transform duration-300 ease-in-out border-l ${LIGHT_THEME_COLORS.border.primary}`}
        style={{ transform: isOpen ? 'translateX(0)' : 'translateX(100%)' }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
      >
        <h2 id="settings-title" className={`text-2xl font-bold mb-6 ${LIGHT_THEME_COLORS.text.primary}`}>設定</h2>
        
        <div className="space-y-6">
          {/* クリエイター機能セクション */}
          <div className={`border-b ${LIGHT_THEME_COLORS.border.primary} pb-6`}>
            <h3 className={`text-lg font-semibold mb-4 ${LIGHT_THEME_COLORS.text.primary}`}>クリエイター機能</h3>
            <div className="space-y-3">
              <button
                onClick={() => setWorldEditorOpen(true)}
                className={`w-full p-3 ${LIGHT_THEME_COLORS.background.secondary} ${LIGHT_THEME_COLORS.button.secondary.hover} ${LIGHT_THEME_COLORS.text.primary} rounded-md transition-colors flex items-center justify-between`}
              >
                <div className="text-left">
                  <div className="font-medium">世界観の編集</div>
                  <div className={`text-sm ${LIGHT_THEME_COLORS.text.secondary}`}>
                    {customWorldSetting?.title || "デフォルト設定"}
                  </div>
                </div>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              
              <button
                onClick={() => setCharacterEditorOpen(true)}
                className={`w-full p-3 ${LIGHT_THEME_COLORS.background.secondary} ${LIGHT_THEME_COLORS.button.secondary.hover} ${LIGHT_THEME_COLORS.text.primary} rounded-md transition-colors flex items-center justify-between`}
              >
                <div className="text-left">
                  <div className="font-medium">キャラクターの編集</div>
                  <div className={`text-sm ${LIGHT_THEME_COLORS.text.secondary}`}>
                    {customCharacters.length}体のキャラクター
                  </div>
                </div>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="aiModel" className={`block text-sm font-medium ${LIGHT_THEME_COLORS.text.secondary} mb-1`}>AIモデル</label>
            <select
              id="aiModel"
              value={settings.aiModel}
              onChange={(e) => onSettingsChange({ aiModel: e.target.value as any })}
              className={`w-full px-3 py-2 ${LIGHT_THEME_COLORS.background.secondary} border ${LIGHT_THEME_COLORS.border.primary} rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 ${LIGHT_THEME_COLORS.text.primary}`}
            >
              <option value="gemini">Gemini 1.5 Flash</option>
              <option value="chatgpt">ChatGPT-4o-mini</option>
              <option value="gemini-cli">Gemini CLI (Local)</option>
              <option value="dummy">Debug (Dummy AI)</option>
            </select>
          </div>

          {settings.aiModel === 'gemini' && (
            <div>
              <label htmlFor="geminiApiKey" className={`block text-sm font-medium ${LIGHT_THEME_COLORS.text.secondary} mb-1`}>Gemini API Key</label>
              <input
                id="geminiApiKey"
                type="password"
                value={settings.geminiApiKey}
                onChange={(e) => onSettingsChange({ geminiApiKey: e.target.value })}
                className={`w-full px-3 py-2 ${LIGHT_THEME_COLORS.background.secondary} border ${LIGHT_THEME_COLORS.border.primary} rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 ${LIGHT_THEME_COLORS.text.primary}`}
                placeholder="Gemini APIキーを入力..."
              />
            </div>
          )}

          {settings.aiModel === 'chatgpt' && (
            <div>
              <label htmlFor="openaiApiKey" className={`block text-sm font-medium ${LIGHT_THEME_COLORS.text.secondary} mb-1`}>OpenAI API Key</label>
              <input
                id="openaiApiKey"
                type="password"
                value={settings.openaiApiKey}
                onChange={(e) => onSettingsChange({ openaiApiKey: e.target.value })}
                className={`w-full px-3 py-2 ${LIGHT_THEME_COLORS.background.secondary} border ${LIGHT_THEME_COLORS.border.primary} rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 ${LIGHT_THEME_COLORS.text.primary}`}
                placeholder="OpenAI APIキーを入力..."
              />
            </div>
          )}

          {settings.aiModel === 'gemini-cli' && (
            <div className={`p-3 ${LIGHT_THEME_COLORS.status.warning} rounded-md`}>
              <p className="text-sm">
                Gemini CLIモードは現在ブラウザでは動作しません。サーバーサイド実装が必要です。
              </p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <label htmlFor="showCost" className={`text-sm font-medium ${LIGHT_THEME_COLORS.text.secondary}`}>コストを表示</label>
             <div className="relative inline-flex items-center cursor-pointer">
                <input id="showCost" type="checkbox" checked={settings.showCost} onChange={(e) => onSettingsChange({ showCost: e.target.checked })} className="sr-only peer" />
                <div className={`w-11 h-6 ${LIGHT_THEME_COLORS.background.secondary} rounded-full peer peer-focus:ring-2 peer-focus:ring-sky-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:border-slate-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500`}></div>
              </div>
          </div>

          {/* コスト管理セクション */}
          <div className={`border-t ${LIGHT_THEME_COLORS.border.primary} pt-6`}>
            <h3 className={`text-lg font-semibold mb-4 ${LIGHT_THEME_COLORS.text.primary}`}>コスト管理</h3>
            
            <div className="space-y-4">
              <div>
                <div className={`text-sm ${LIGHT_THEME_COLORS.text.secondary} mb-2`}>
                  今月の使用量: ${costStats.currentCost.toFixed(6)} / ${costStats.limit} USD
                </div>
                <div className={`w-full ${LIGHT_THEME_COLORS.background.secondary} rounded-full h-2`}>
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
                <label htmlFor="monthlyLimit" className={`block text-sm font-medium ${LIGHT_THEME_COLORS.text.secondary} mb-1`}>月次上限 (USD)</label>
                <div className="flex gap-2">
                  <input
                    id="monthlyLimit"
                    type="number"
                    min="1"
                    max="1000"
                    step="1"
                    value={monthlyLimit}
                    onChange={(e) => setMonthlyLimit(Number(e.target.value))}
                    className={`flex-1 px-3 py-2 ${LIGHT_THEME_COLORS.background.secondary} border ${LIGHT_THEME_COLORS.border.primary} rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 ${LIGHT_THEME_COLORS.text.primary}`}
                  />
                  <button
                    onClick={handleLimitUpdate}
                    className={`px-4 py-2 ${LIGHT_THEME_COLORS.button.primary.bg} ${LIGHT_THEME_COLORS.button.primary.hover} ${LIGHT_THEME_COLORS.button.primary.text} rounded-md transition-colors`}
                  >
                    更新
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleDownloadCsv}
                  className={`flex-1 py-2 ${LIGHT_THEME_COLORS.button.success.bg} ${LIGHT_THEME_COLORS.button.success.hover} ${LIGHT_THEME_COLORS.button.success.text} rounded-md transition-colors`}
                >
                  CSV出力
                </button>
                <button
                  onClick={handleClearCostHistory}
                  className={`flex-1 py-2 ${LIGHT_THEME_COLORS.button.danger.bg} ${LIGHT_THEME_COLORS.button.danger.hover} ${LIGHT_THEME_COLORS.button.danger.text} rounded-md transition-colors`}
                >
                  履歴削除
                </button>
              </div>
            </div>
          </div>
        </div>

        <button onClick={onClose} className={`mt-8 w-full py-2 ${LIGHT_THEME_COLORS.button.primary.bg} ${LIGHT_THEME_COLORS.button.primary.hover} ${LIGHT_THEME_COLORS.button.primary.text} rounded-md transition-colors`}>
          閉じる
        </button>
      </div>

      {/* エディタモーダル */}
      <WorldEditor
        isOpen={isWorldEditorOpen}
        onClose={() => setWorldEditorOpen(false)}
        worldSetting={customWorldSetting}
        onSave={onWorldSettingChange}
      />
      
      <CharacterEditor
        isOpen={isCharacterEditorOpen}
        onClose={() => setCharacterEditorOpen(false)}
        characters={customCharacters}
        onSave={onCharactersChange}
      />
    </div>
  );
};
