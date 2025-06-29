import React from 'react';
import { CogIcon, SaveIcon, LoadIcon } from './icons/Icons';

interface HeaderProps {
  totalCost: number;
  showCost: boolean;
  onSettingsClick: () => void;
  onSaveClick: () => void;
  onLoadClick: () => void;
  isSummarizing: boolean;
  error: string | null;
}

export const Header: React.FC<HeaderProps> = ({ totalCost, showCost, onSettingsClick, onSaveClick, onLoadClick, isSummarizing, error }) => {
  return (
    <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 bg-black bg-opacity-30 text-white">
      <h1 className="text-xl font-bold">AI Chat Novel</h1>
      
      {error && <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-red-800 text-white px-4 py-2 rounded-md shadow-lg animate-fade-in">{error}</div>}
      
      <div className="flex items-center space-x-4">
        {isSummarizing && <div className="text-sm animate-pulse">物語を記憶中...</div>}
        {showCost && (
          <div className="text-sm px-3 py-1 bg-gray-700 bg-opacity-70 rounded-full">
            総コスト: ${totalCost.toFixed(6)}
          </div>
        )}
        <button onClick={onSaveClick} title="セーブ" className="p-2 hover:bg-gray-700 rounded-full transition-colors"><SaveIcon /></button>
        <button onClick={onLoadClick} title="ロード" className="p-2 hover:bg-gray-700 rounded-full transition-colors"><LoadIcon /></button>
        <button onClick={onSettingsClick} title="設定" className="p-2 hover:bg-gray-700 rounded-full transition-colors"><CogIcon /></button>
      </div>
    </header>
  );
};
