// @ts-nocheck
import React from 'react';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: any;
  onSettingsChange: (newSettings: any) => void;
  onEditCharacters: () => void;
  onEditWorld: () => void;
  onEditSystemPrompt: () => void;
  onEditBackgrounds: () => void;
  onEditEventCGs: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ 
  isOpen, 
  onClose, 
  settings, 
  onSettingsChange,
  onEditCharacters,
  onEditWorld,
  onEditSystemPrompt,
  onEditBackgrounds,
  onEditEventCGs
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
        className: 'p-6 overflow-y-auto space-y-6 flex-1'
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
            }, '🌍 世界観の編集'),
            React.createElement('button', {
              onClick: onEditCharacters,
              className: 'p-3 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 text-slate-700 text-left'
            }, '👥 キャラクターの編集'),
            React.createElement('button', {
              onClick: onEditSystemPrompt,
              className: 'p-3 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 text-slate-700 text-left'
            }, '🤖 システムプロンプト編集'),
            React.createElement('button', {
              onClick: onEditBackgrounds,
              className: 'p-3 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 text-slate-700 text-left'
            }, '🌅 背景の編集'),
            React.createElement('button', {
              onClick: onEditEventCGs,
              className: 'p-3 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 text-slate-700 text-left'
            }, '🎨 イベントCGの編集')
          )
        ),
        React.createElement('div', null,
          React.createElement('h3', {
            className: 'text-lg font-semibold mb-2 text-slate-700'
          }, 'AIモデル'),
          React.createElement('div', {
            className: 'bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4'
          },
            React.createElement('h4', {
              className: 'text-sm font-medium text-blue-800 mb-2'
            }, '📊 モデル選択ガイド'),
            React.createElement('p', {
              className: 'text-xs text-blue-700'
            }, '各グループで「高速・安価」「バランス」「高性能・高価」の選択肢を提供')
          ),
          React.createElement('select', {
            id: 'aiModel',
            value: settings?.aiModel || 'gemini-1.5-flash',
            onChange: e => onSettingsChange({ aiModel: e.target.value }),
            className: 'w-full p-2 bg-white border border-slate-300 rounded-md mb-4'
          },
            React.createElement('optgroup', { label: '🟢 Gemini Models' },
              React.createElement('option', { value: 'gemini-1.5-flash' }, 'Gemini 1.5 Flash (高速・安価)'),
              React.createElement('option', { value: 'gemini-1.5-pro' }, 'Gemini 1.5 Pro (バランス)'),
              React.createElement('option', { value: 'gemini-2.5-pro' }, 'Gemini 2.5 Pro (高性能)')
            ),
            React.createElement('optgroup', { label: '🔵 ChatGPT Models' },
              React.createElement('option', { value: 'gpt-4o-mini' }, 'GPT-4o Mini (高速・安価)'),
              React.createElement('option', { value: 'gpt-4o' }, 'GPT-4o (バランス)'),
              React.createElement('option', { value: 'gpt-4-turbo' }, 'GPT-4 Turbo (高性能)')
            ),
            React.createElement('optgroup', { label: '🟡 その他' },
              React.createElement('option', { value: 'dummy' }, 'Dummy AI (テスト用)')
            )
          ),
          
          // Gemini APIキー入力欄
          (settings?.aiModel?.startsWith('gemini') || !settings?.aiModel) && React.createElement('div', {
            className: 'mb-4'
          },
            React.createElement('label', {
              htmlFor: 'geminiApiKey',
              className: 'block text-sm font-medium text-slate-700 mb-2'
            }, 'Gemini API Key'),
            React.createElement('input', {
              type: 'password',
              id: 'geminiApiKey',
              value: settings?.geminiApiKey || '',
              onChange: e => onSettingsChange({ geminiApiKey: e.target.value }),
              placeholder: 'Gemini APIキーを入力',
              className: 'w-full p-2 bg-white border border-slate-300 rounded-md'
            })
          ),
          
          // OpenAI APIキー入力欄
          settings?.aiModel?.startsWith('gpt') && React.createElement('div', {
            className: 'mb-4'
          },
            React.createElement('label', {
              htmlFor: 'openaiApiKey',
              className: 'block text-sm font-medium text-slate-700 mb-2'
            }, 'OpenAI API Key'),
            React.createElement('input', {
              type: 'password',
              id: 'openaiApiKey',
              value: settings?.openaiApiKey || '',
              onChange: e => onSettingsChange({ openaiApiKey: e.target.value }),
              placeholder: 'OpenAI APIキーを入力',
              className: 'w-full p-2 bg-white border border-slate-300 rounded-md'
            })
          ),
          
          // コスト表示設定
          React.createElement('div', {
            className: 'flex items-center'
          },
            React.createElement('input', {
              type: 'checkbox',
              id: 'showCost',
              checked: settings?.showCost || false,
              onChange: e => onSettingsChange({ showCost: e.target.checked }),
              className: 'mr-2'
            }),
            React.createElement('label', {
              htmlFor: 'showCost',
              className: 'text-sm text-slate-700'
            }, 'APIコストを表示する')
          )
        )
      ),
      
      // フッター
      React.createElement('div', {
        className: 'p-4 border-t border-slate-200 bg-slate-50'
      },
        React.createElement('div', {
          className: 'flex justify-between items-center text-sm text-slate-600'
        },
          React.createElement('span', null, `総コスト: $${(settings?.totalCost || 0).toFixed(4)}`),
          React.createElement('button', {
            onClick: onClose,
            className: 'px-4 py-2 bg-sky-500 text-white rounded-md hover:bg-sky-600'
          }, '閉じる')
        )
      )
    )
  );
};