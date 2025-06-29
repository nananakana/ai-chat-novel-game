// @ts-nocheck
import React from 'react';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: any;
  onSettingsChange: (newSettings: any) => void;
  onEditCharacters: () => void;
  onEditWorld: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ 
  isOpen, 
  onClose, 
  settings, 
  onSettingsChange,
  onEditCharacters,
  onEditWorld
}) => {
  if (!isOpen) return null;

  return React.createElement('div', {
    className: 'fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center p-4',
    onClick: onClose
  },
    React.createElement('div', {
      className: 'bg-slate-50 rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col',
      onClick: e => e.stopPropagation()
    },
      React.createElement('header', {
        className: 'flex justify-between items-center p-4 border-b border-slate-200'
      },
        React.createElement('h2', {
          className: 'text-xl font-bold text-slate-800'
        }, '設定'),
        React.createElement('button', {
          onClick: onClose,
          className: 'p-2 hover:bg-slate-200 rounded-full'
        }, '✕')
      ),
      React.createElement('div', {
        className: 'p-6 overflow-y-auto space-y-6'
      },
        React.createElement('div', null,
          React.createElement('h3', {
            className: 'text-lg font-semibold mb-2 text-slate-700'
          }, 'ゲーム設定'),
          React.createElement('div', {
            className: 'grid grid-cols-1 sm:grid-cols-2 gap-4'
          },
            React.createElement('button', {
              onClick: onEditWorld,
              className: 'p-3 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 text-slate-700 text-left'
            }, '世界観の編集'),
            React.createElement('button', {
              onClick: onEditCharacters,
              className: 'p-3 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 text-slate-700 text-left'
            }, 'キャラクターの編集')
          )
        ),
        React.createElement('div', null,
          React.createElement('h3', {
            className: 'text-lg font-semibold mb-2 text-slate-700'
          }, 'AIモデル'),
          React.createElement('select', {
            id: 'aiModel',
            value: settings?.aiModel || 'gemini',
            onChange: e => onSettingsChange({ aiModel: e.target.value }),
            className: 'w-full p-2 bg-white border border-slate-300 rounded-md'
          },
            React.createElement('option', { value: 'gemini' }, 'Gemini 1.5 Flash'),
            React.createElement('option', { value: 'chatgpt' }, 'ChatGPT-4o-mini'),
            React.createElement('option', { value: 'dummy' }, 'Dummy AI')
          )
        )
      )
    )
  );
};