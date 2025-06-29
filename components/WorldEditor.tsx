// @ts-nocheck
import React, { useState } from 'react';

interface WorldEditorProps {
  isOpen: boolean;
  onClose: () => void;
  settings: any;
  onSettingsChange: (newSettings: any) => void;
}

export const WorldEditor: React.FC<WorldEditorProps> = ({ 
  isOpen, 
  onClose, 
  settings, 
  onSettingsChange 
}) => {
  const [localSettings, setLocalSettings] = useState({
    genre: settings?.genre || 'SFファンタジー',
    setting: settings?.setting || '忘れ去られた古代文明の遺跡が点在する、緑豊かな惑星「エデン」。',
    mainCharacter: settings?.mainCharacter || 'プレイヤー自身。記憶を一部失っており、自分の過去を探している。',
    customPrompt: settings?.customPrompt || ''
  });

  if (!isOpen) return null;

  const handleSave = () => {
    const worldPrompt = `- ジャンル: ${localSettings.genre}
- 舞台: ${localSettings.setting}
- 主人公: ${localSettings.mainCharacter}${localSettings.customPrompt ? `
- 追加設定: ${localSettings.customPrompt}` : ''}`;
    
    onSettingsChange({ 
      worldPrompt,
      genre: localSettings.genre,
      setting: localSettings.setting,
      mainCharacter: localSettings.mainCharacter,
      customPrompt: localSettings.customPrompt
    });
    
    alert('世界観設定を保存しました。');
    onClose();
  };

  const handleReset = () => {
    if (confirm('世界観設定をデフォルトにリセットしますか？')) {
      setLocalSettings({
        genre: 'SFファンタジー',
        setting: '忘れ去られた古代文明の遺跡が点在する、緑豊かな惑星「エデン」。',
        mainCharacter: 'プレイヤー自身。記憶を一部失っており、自分の過去を探している。',
        customPrompt: ''
      });
    }
  };

  return React.createElement('div', {
    className: 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4',
    onClick: onClose
  },
    React.createElement('div', {
      className: 'bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col',
      onClick: e => e.stopPropagation()
    },
      React.createElement('header', {
        className: 'flex justify-between items-center p-6 border-b border-slate-200'
      },
        React.createElement('h2', {
          className: 'text-2xl font-bold text-slate-800'
        }, '🌍 世界観設定'),
        React.createElement('button', {
          onClick: onClose,
          className: 'p-2 hover:bg-slate-100 rounded-full text-slate-500 hover:text-slate-700'
        }, '✕')
      ),

      React.createElement('div', {
        className: 'p-6 overflow-y-auto flex-1 space-y-6'
      },
        React.createElement('div', null,
          React.createElement('label', {
            className: 'block text-sm font-medium text-slate-700 mb-2'
          }, 'ジャンル'),
          React.createElement('input', {
            type: 'text',
            value: localSettings.genre,
            onChange: e => setLocalSettings({...localSettings, genre: e.target.value}),
            className: 'w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500',
            placeholder: '例: SFファンタジー, 現代ホラー, 中世ファンタジー'
          })
        ),
        
        React.createElement('div', null,
          React.createElement('label', {
            className: 'block text-sm font-medium text-slate-700 mb-2'
          }, '舞台設定'),
          React.createElement('textarea', {
            value: localSettings.setting,
            onChange: e => setLocalSettings({...localSettings, setting: e.target.value}),
            rows: 4,
            className: 'w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500',
            placeholder: '物語の舞台となる世界について詳しく説明してください...'
          })
        ),
        
        React.createElement('div', null,
          React.createElement('label', {
            className: 'block text-sm font-medium text-slate-700 mb-2'
          }, '主人公設定'),
          React.createElement('textarea', {
            value: localSettings.mainCharacter,
            onChange: e => setLocalSettings({...localSettings, mainCharacter: e.target.value}),
            rows: 3,
            className: 'w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500',
            placeholder: '主人公（プレイヤー）の背景や特徴について説明してください...'
          })
        ),
        
        React.createElement('div', null,
          React.createElement('label', {
            className: 'block text-sm font-medium text-slate-700 mb-2'
          }, '追加設定（オプション）'),
          React.createElement('textarea', {
            value: localSettings.customPrompt,
            onChange: e => setLocalSettings({...localSettings, customPrompt: e.target.value}),
            rows: 3,
            className: 'w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500',
            placeholder: '特別なルール、魔法システム、重要な背景設定など...'
          })
        ),
        
        React.createElement('div', {
          className: 'bg-slate-50 p-4 rounded-lg'
        },
          React.createElement('h4', {
            className: 'font-semibold text-slate-700 mb-2'
          }, 'プレビュー'),
          React.createElement('div', {
            className: 'text-sm text-slate-600 whitespace-pre-line'
          }, `- ジャンル: ${localSettings.genre}
- 舞台: ${localSettings.setting}
- 主人公: ${localSettings.mainCharacter}${localSettings.customPrompt ? `
- 追加設定: ${localSettings.customPrompt}` : ''}`)
        )
      ),

      React.createElement('footer', {
        className: 'p-6 border-t border-slate-200 bg-slate-50'
      },
        React.createElement('div', {
          className: 'flex justify-between'
        },
          React.createElement('button', {
            onClick: handleReset,
            className: 'px-4 py-2 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-100'
          }, 'リセット'),
          React.createElement('div', {
            className: 'space-x-3'
          },
            React.createElement('button', {
              onClick: onClose,
              className: 'px-4 py-2 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-100'
            }, 'キャンセル'),
            React.createElement('button', {
              onClick: handleSave,
              className: 'px-4 py-2 bg-sky-500 text-white rounded-md hover:bg-sky-600'
            }, '保存')
          )
        )
      )
    )
  );
};