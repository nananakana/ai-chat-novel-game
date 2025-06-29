// @ts-nocheck
import React, { useState } from 'react';

interface BackgroundEditorProps {
  isOpen: boolean;
  onClose: () => void;
  settings: any;
  onSettingsChange: (newSettings: any) => void;
}

export const BackgroundEditor: React.FC<BackgroundEditorProps> = ({ 
  isOpen, 
  onClose, 
  settings, 
  onSettingsChange 
}) => {
  const [backgrounds, setBackgrounds] = useState(() => {
    return settings?.backgrounds || [
      { id: '1', name: 'デフォルト背景', url: 'https://images.unsplash.com/photo-1533134486753-c833f0ed4866?q=80&w=2070&auto=format&fit=crop' },
      { id: '2', name: '森の遺跡', url: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?q=80&w=2070&auto=format&fit=crop' },
      { id: '3', name: '古代神殿', url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop' }
    ];
  });

  if (!isOpen) return null;

  const handleSave = () => {
    onSettingsChange({ backgrounds });
    alert('背景設定を保存しました。');
    onClose();
  };

  const addBackground = () => {
    const newBackground = {
      id: Date.now().toString(),
      name: '新しい背景',
      url: ''
    };
    setBackgrounds([...backgrounds, newBackground]);
  };

  const updateBackground = (id, field, value) => {
    setBackgrounds(bgs => bgs.map(bg => 
      bg.id === id ? { ...bg, [field]: value } : bg
    ));
  };

  const deleteBackground = (id) => {
    if (confirm('この背景を削除しますか？')) {
      setBackgrounds(bgs => bgs.filter(bg => bg.id !== id));
    }
  };

  return React.createElement('div', {
    className: 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4',
    onClick: onClose
  },
    React.createElement('div', {
      className: 'bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col',
      onClick: e => e.stopPropagation()
    },
      React.createElement('header', {
        className: 'flex justify-between items-center p-6 border-b border-slate-200'
      },
        React.createElement('h2', {
          className: 'text-2xl font-bold text-slate-800'
        }, '🌅 背景の編集'),
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
          React.createElement('div', {
            className: 'flex justify-between items-center mb-3'
          },
            React.createElement('p', {
              className: 'text-sm text-slate-600'
            }, 'ゲームで使用する背景画像を管理できます。'),
            React.createElement('button', {
              onClick: addBackground,
              className: 'px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600'
            }, '+ 背景追加')
          ),
          React.createElement('div', {
            className: 'bg-purple-50 border border-purple-200 rounded-lg p-3'
          },
            React.createElement('h4', {
              className: 'text-sm font-medium text-purple-800 mb-2'
            }, '📐 推奨画像仕様'),
            React.createElement('ul', {
              className: 'text-xs text-purple-700 space-y-1'
            },
              React.createElement('li', null, '• 推奨サイズ: 横1920px × 縦1080px (16:9)'),
              React.createElement('li', null, '• ファイル形式: PNG, JPG, WebP'),
              React.createElement('li', null, '• 高解像度推奨（画面全体に表示されます）'),
              React.createElement('li', null, '• 風景・建物・室内など、物語の舞台となる画像')
            )
          )
        ),
        
        React.createElement('div', {
          className: 'space-y-4'
        },
          backgrounds.map(background => 
            React.createElement('div', {
              key: background.id,
              className: 'border border-slate-200 rounded-lg p-4 bg-slate-50'
            },
              React.createElement('div', {
                className: 'flex justify-between items-start mb-4'
              },
                React.createElement('div', {
                  className: 'flex items-center space-x-3'
                },
                  background.url && React.createElement('img', {
                    src: background.url,
                    alt: background.name,
                    className: 'w-16 h-9 rounded object-cover border border-slate-300',
                    onError: (e) => { e.target.style.display = 'none'; }
                  }),
                  React.createElement('div', null,
                    React.createElement('h4', {
                      className: 'font-semibold text-slate-800'
                    }, background.name),
                    React.createElement('span', {
                      className: 'text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full'
                    }, `ID: ${background.id}`)
                  )
                ),
                React.createElement('button', {
                  onClick: () => deleteBackground(background.id),
                  className: 'text-red-500 hover:text-red-700 p-1'
                }, '🗑️')
              ),
              
              React.createElement('div', {
                className: 'grid grid-cols-1 md:grid-cols-2 gap-4'
              },
                React.createElement('div', null,
                  React.createElement('label', {
                    className: 'block text-sm font-medium text-slate-700 mb-2'
                  }, '背景名'),
                  React.createElement('input', {
                    type: 'text',
                    value: background.name,
                    onChange: e => updateBackground(background.id, 'name', e.target.value),
                    className: 'w-full p-2 border border-slate-300 rounded-md'
                  })
                ),
                
                React.createElement('div', null,
                  React.createElement('label', {
                    className: 'block text-sm font-medium text-slate-700 mb-2'
                  }, '画像URL'),
                  React.createElement('input', {
                    type: 'url',
                    value: background.url,
                    onChange: e => updateBackground(background.id, 'url', e.target.value),
                    placeholder: 'https://example.com/background.jpg',
                    className: 'w-full p-2 border border-slate-300 rounded-md'
                  })
                )
              )
            )
          )
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
          }, `登録背景数: ${backgrounds.length}`),
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