// @ts-nocheck
import React from 'react';

interface HeaderProps {
  onSettingsClick: () => void;
  onSaveClick: () => void;
  onLoadClick: () => void;
  onBacklogClick: () => void;
  onGalleryClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onSettingsClick, 
  onSaveClick, 
  onLoadClick, 
  onBacklogClick, 
  onGalleryClick 
}) => {
  return React.createElement('header', { 
    className: 'absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-2 sm:p-4' 
  },
    React.createElement('h1', { 
      className: 'text-lg sm:text-xl font-bold text-slate-700' 
    }, 'AI Novel'),
    React.createElement('div', { 
      className: 'flex items-center space-x-0 sm:space-x-1' 
    },
      React.createElement('button', { 
        onClick: onGalleryClick, 
        title: 'ギャラリー', 
        className: 'p-2 text-slate-600 hover:bg-slate-200 rounded-full' 
      }, '🖼️'),
      React.createElement('button', { 
        onClick: onBacklogClick, 
        title: 'バックログ', 
        className: 'p-2 text-slate-600 hover:bg-slate-200 rounded-full' 
      }, '📋'),
      React.createElement('button', { 
        onClick: onSaveClick, 
        title: 'セーブ', 
        className: 'p-2 text-slate-600 hover:bg-slate-200 rounded-full' 
      }, '💾'),
      React.createElement('button', { 
        onClick: onLoadClick, 
        title: 'ロード', 
        className: 'p-2 text-slate-600 hover:bg-slate-200 rounded-full' 
      }, '📁'),
      React.createElement('button', { 
        onClick: onSettingsClick, 
        title: '設定', 
        className: 'p-2 text-slate-600 hover:bg-slate-200 rounded-full' 
      }, '⚙️')
    )
  );
};
