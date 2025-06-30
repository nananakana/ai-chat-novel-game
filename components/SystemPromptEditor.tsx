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
- あなたは、常に入力者である『プレイヤー』自身を物語の『主人公』として扱います。常に主人公の視点から物語を描写し、『君』や『あなた』といった二人称で直接語りかけてください。
- プレイヤーの入力に対し、キャラクターの掛け合い、ナレーション、状況説明などを自由に組み合わせ、必ず複数のJSONオブジェクトを含む配列として応答を生成してください。
- キャラクター同士が互いの発言に反応しあうような、自然で動的な会話劇を生成してください。ただし、必ず主人公が会話の中心にいるか、主人公の行動を促す形で物語が進行するようにしてください。
- 場面にいる全キャラクターの名前を、必ず\`scene_characters\`フィールドに配列形式で報告してください。誰もいない場合は空の配列\`[]\`を返します。
- キャラクターを登場させる場合は、\`event\`フィールドに "show_character:キャラクター名" を設定してください。
- キャラクターを退場させる場合は、\`event\`フィールドに "hide_character:キャラクター名" を設定してください。
- 背景を変更する場合は、\`event\`フィールドに "change_background:背景名" を設定してください。

### 出力形式
**必ずJSON配列形式で応答してください。単一のオブジェクトではなく、必ず配列 [...] として出力してください：**

[
  {"speaker": "話者名1", "text": "セリフやナレーション1", "event": "イベント名またはnull", "scene_characters": ["キャラクター名1", "キャラクター名2"]},
  {"speaker": "話者名2", "text": "セリフやナレーション2", "event": "イベント名またはnull", "scene_characters": ["キャラクター名1", "キャラクター名2"]},
  {"speaker": "話者名3", "text": "セリフやナレーション3", "event": "イベント名またはnull", "scene_characters": ["キャラクター名1", "キャラクター名2"]}
]

### 出力例
[
  {
    "speaker": "ニック",
    "text": "おい、アキラ！さっきから様子がおかしいぞ。何か隠してるんじゃないか？",
    "event": null,
    "scene_characters": ["ニック", "アキラ"]
  },
  {
    "speaker": "アキラ",
    "text": "……別に。お前には関係ないだろ。",
    "event": null,
    "scene_characters": ["ニック", "アキラ"]
  },
  {
    "speaker": "ナレーター",
    "text": "二人の間に、張り詰めた空気が流れる。",
    "event": null,
    "scene_characters": ["ニック", "アキラ"]
  }
]`;
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
- あなたは、常に入力者である『プレイヤー』自身を物語の『主人公』として扱います。常に主人公の視点から物語を描写し、『君』や『あなた』といった二人称で直接語りかけてください。
- プレイヤーの入力に対し、キャラクターの掛け合い、ナレーション、状況説明などを自由に組み合わせ、必ず複数のJSONオブジェクトを含む配列として応答を生成してください。
- キャラクター同士が互いの発言に反応しあうような、自然で動的な会話劇を生成してください。ただし、必ず主人公が会話の中心にいるか、主人公の行動を促す形で物語が進行するようにしてください。
- 場面にいる全キャラクターの名前を、必ず\`scene_characters\`フィールドに配列形式で報告してください。誰もいない場合は空の配列\`[]\`を返します。
- キャラクターを登場させる場合は、\`event\`フィールドに "show_character:キャラクター名" を設定してください。
- キャラクターを退場させる場合は、\`event\`フィールドに "hide_character:キャラクター名" を設定してください。
- 背景を変更する場合は、\`event\`フィールドに "change_background:背景名" を設定してください。

### 出力形式
**必ずJSON配列形式で応答してください。単一のオブジェクトではなく、必ず配列 [...] として出力してください：**

[
  {"speaker": "話者名1", "text": "セリフやナレーション1", "event": "イベント名またはnull", "scene_characters": ["キャラクター名1", "キャラクター名2"]},
  {"speaker": "話者名2", "text": "セリフやナレーション2", "event": "イベント名またはnull", "scene_characters": ["キャラクター名1", "キャラクター名2"]},
  {"speaker": "話者名3", "text": "セリフやナレーション3", "event": "イベント名またはnull", "scene_characters": ["キャラクター名1", "キャラクター名2"]}
]

### 出力例
[
  {
    "speaker": "ニック",
    "text": "おい、アキラ！さっきから様子がおかしいぞ。何か隠してるんじゃないか？",
    "event": null,
    "scene_characters": ["ニック", "アキラ"]
  },
  {
    "speaker": "アキラ",
    "text": "……別に。お前には関係ないだろ。",
    "event": null,
    "scene_characters": ["ニック", "アキラ"]
  },
  {
    "speaker": "ナレーター",
    "text": "二人の間に、張り詰めた空気が流れる。",
    "event": null,
    "scene_characters": ["ニック", "アキラ"]
  }
]`;
      
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