// @ts-nocheck
import React, { useState, useEffect } from 'react';

interface SystemPromptEditorProps {
  isOpen: boolean;
  onClose: () => void;
  settings: any;
  onSettingsChange: (newSettings: any) => void;
}

export const SystemPromptEditor: React.FC<SystemPromptEditorProps> = ({ 
  isOpen, 
  onClose, 
  settings, 
  onSettingsChange 
}) => {
  const [systemPromptTemplate, setSystemPromptTemplate] = useState(() => {
    return settings?.systemPromptTemplate || `あなたは卓越したインタラクティブノベルの語り手（ゲームマスター）です。プレイヤーの行動にリアルタイムで応答し、物語を生成してください。

### 世界観
{worldPrompt}

### 登場キャラクター
{characterList}

### 直近の会話
{conversationText}

### 特別な指示
- キャラクターを登場させる場合は、eventフィールドに "show_character:キャラクター名" を設定してください
- キャラクターを退場させる場合は、eventフィールドに "hide_character:キャラクター名" を設定してください
- 背景を変更する場合は、eventフィールドに "change_background:背景の説明" を設定してください

### 出力形式
以下のJSON形式で物語の続きを出力してください：
{"speaker": "話者名", "text": "生成したセリフや状況説明", "event": "イベント名またはnull"}

例: {"speaker": "ナレーター", "text": "目の前には巨大な扉が立ちはだかっている。", "event": null}
例: {"speaker": "アキラ", "text": "こんにちは！元気だった？", "event": "show_character:アキラ"}`;
  });

  useEffect(() => {
    if (isOpen && settings?.systemPromptTemplate) {
      setSystemPromptTemplate(settings.systemPromptTemplate);
    }
  }, [isOpen, settings?.systemPromptTemplate]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSettingsChange({ systemPromptTemplate });
    alert('システムプロンプトを保存しました。');
    onClose();
  };

  const resetToDefault = () => {
    if (confirm('システムプロンプトをデフォルトにリセットしますか？現在の設定は失われます。')) {
      const defaultTemplate = `あなたは卓越したインタラクティブノベルの語り手（ゲームマスター）です。プレイヤーの行動にリアルタイムで応答し、物語を生成してください。

### 世界観
{worldPrompt}

### 登場キャラクター
{characterList}

### 直近の会話
{conversationText}

### 特別な指示
- キャラクターを登場させる場合は、eventフィールドに "show_character:キャラクター名" を設定してください
- キャラクターを退場させる場合は、eventフィールドに "hide_character:キャラクター名" を設定してください
- 背景を変更する場合は、eventフィールドに "change_background:背景の説明" を設定してください

### 出力形式
以下のJSON形式で物語の続きを出力してください：
{"speaker": "話者名", "text": "生成したセリフや状況説明", "event": "イベント名またはnull"}

例: {"speaker": "ナレーター", "text": "目の前には巨大な扉が立ちはだかっている。", "event": null}
例: {"speaker": "アキラ", "text": "こんにちは！元気だった？", "event": "show_character:アキラ"}`;
      
      setSystemPromptTemplate(defaultTemplate);
    }
  };

  return React.createElement('div', {
    className: 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4',
    onClick: onClose
  },
    React.createElement('div', {
      className: 'bg-white rounded-lg shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col',
      onClick: e => e.stopPropagation()
    },
      React.createElement('header', {
        className: 'flex justify-between items-center p-6 border-b border-slate-200'
      },
        React.createElement('h2', {
          className: 'text-2xl font-bold text-slate-800'
        }, '🤖 システムプロンプト編集'),
        React.createElement('button', {
          onClick: onClose,
          className: 'p-2 hover:bg-slate-100 rounded-full text-slate-500 hover:text-slate-700'
        }, '✕')
      ),
      
      React.createElement('div', {
        className: 'p-6 overflow-y-auto flex-1'
      },
        React.createElement('div', {
          className: 'mb-4'
        },
          React.createElement('p', {
            className: 'text-sm text-slate-600 mb-3'
          }, 'AIへの基本指示を編集できます。高度なカスタマイズが可能ですが、慎重に編集してください。'),
          
          React.createElement('div', {
            className: 'bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4'
          },
            React.createElement('h4', {
              className: 'text-sm font-medium text-amber-800 mb-2'
            }, '⚠️ 利用可能なプレースホルダー'),
            React.createElement('ul', {
              className: 'text-xs text-amber-700 space-y-1'
            },
              React.createElement('li', null, '• {worldPrompt} - 世界観設定が挿入されます'),
              React.createElement('li', null, '• {characterList} - キャラクター一覧が挿入されます'),
              React.createElement('li', null, '• {conversationText} - 直近の会話履歴が挿入されます')
            )
          )
        ),
        
        React.createElement('div', {
          className: 'mb-4'
        },
          React.createElement('label', {
            htmlFor: 'systemPromptTemplate',
            className: 'block text-sm font-medium text-slate-700 mb-2'
          }, 'システムプロンプトテンプレート'),
          React.createElement('textarea', {
            id: 'systemPromptTemplate',
            value: systemPromptTemplate,
            onChange: e => setSystemPromptTemplate(e.target.value),
            className: 'w-full h-96 p-3 border border-slate-300 rounded-md font-mono text-sm leading-relaxed resize-none',
            placeholder: 'システムプロンプトを入力してください...'
          })
        ),
        
        React.createElement('div', {
          className: 'flex items-center justify-between text-sm text-slate-500'
        },
          React.createElement('span', null, `文字数: ${systemPromptTemplate.length}`),
          React.createElement('button', {
            onClick: resetToDefault,
            className: 'text-red-600 hover:text-red-800 underline'
          }, 'デフォルトにリセット')
        )
      ),
      
      React.createElement('footer', {
        className: 'p-6 border-t border-slate-200 bg-slate-50'
      },
        React.createElement('div', {
          className: 'flex justify-between'
        },
          React.createElement('div', {
            className: 'text-sm text-slate-600'
          }, '変更は即座にAIとの会話に反映されます'),
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