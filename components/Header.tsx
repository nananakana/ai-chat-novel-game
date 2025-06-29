import React, { useEffect, useState } from 'react';
import { CogIcon, SaveIcon, LoadIcon } from './icons/Icons';
import { costService } from '../services/costService';

interface HeaderProps {
  totalCost: number;
  showCost: boolean;
  onSettingsClick: () => void;
  onSaveClick: () => void;
  onLoadClick: () => void;
  onBacklogClick: () => void;
  isSummarizing: boolean;
  isMemoryInitializing: boolean;
  error: string | null;
}

export const Header: React.FC<HeaderProps> = ({ totalCost, showCost, onSettingsClick, onSaveClick, onLoadClick, onBacklogClick, isSummarizing, isMemoryInitializing, error }) => {
  const [costWarning, setCostWarning] = useState({ isWarning: false, isOverLimit: false, currentCost: 0, limit: 0 });

  useEffect(() => {
    const warning = costService.getMonthlyLimitWarning();
    setCostWarning(warning);
  }, [totalCost]); // totalCostが変更されるたびに警告をチェック

  return (
    <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 bg-black bg-opacity-30 text-white">
      <h1 className="text-xl font-bold">AI Chat Novel</h1>
      
      {error && <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-red-800 text-white px-4 py-2 rounded-md shadow-lg animate-fade-in">{error}</div>}
      
      {/* コスト警告 */}
      {costWarning.isOverLimit && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-red-700 text-white px-4 py-2 rounded-md shadow-lg animate-fade-in">
          月次コスト上限超過 (${costWarning.currentCost.toFixed(4)}/${costWarning.limit} USD) - ダミーモードで動作中
        </div>
      )}
      {costWarning.isWarning && !costWarning.isOverLimit && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-yellow-700 text-white px-4 py-2 rounded-md shadow-lg animate-fade-in">
          月次コスト警告 (${costWarning.currentCost.toFixed(4)}/${costWarning.limit} USD) - 上限の80%に到達
        </div>
      )}
      
      <div className="flex items-center space-x-4">
        {isSummarizing && <div className="text-sm animate-pulse">物語を記憶中...</div>}
        {isMemoryInitializing && <div className="text-sm animate-pulse">記憶システム初期化中...</div>}
        {showCost && (
          <div className="text-sm px-3 py-1 bg-gray-700 bg-opacity-70 rounded-full">
            今月: ${costWarning.currentCost.toFixed(4)} / 総計: ${totalCost.toFixed(6)}
          </div>
        )}
        <button onClick={onBacklogClick} title="バックログ" className="p-2 hover:bg-gray-700 rounded-full transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        </button>
        <button onClick={onSaveClick} title="セーブ" className="p-2 hover:bg-gray-700 rounded-full transition-colors"><SaveIcon /></button>
        <button onClick={onLoadClick} title="ロード" className="p-2 hover:bg-gray-700 rounded-full transition-colors"><LoadIcon /></button>
        <button onClick={onSettingsClick} title="設定" className="p-2 hover:bg-gray-700 rounded-full transition-colors"><CogIcon /></button>
      </div>
    </header>
  );
};
