// @ts-nocheck
import React, { useState, useEffect } from 'react';

interface EventCGEditorProps {
  isOpen: boolean;
  onClose: () => void;
  settings: any;
  onSettingsChange: (newSettings: any) => void;
}

export const EventCGEditor: React.FC<EventCGEditorProps> = ({ 
  isOpen, 
  onClose, 
  settings, 
  onSettingsChange 
}) => {
  const [eventCGs, setEventCGs] = useState(() => {
    return settings?.eventCGs || [
      {
        id: '1',
        eventName: 'game_start',
        title: '🌅 物語の始まり',
        description: 'あなたは苔むした遺跡の前で目を覚ましました',
        imageUrl: 'https://images.unsplash.com/photo-1533134486753-c833f0ed4866?q=80&w=800&h=600&auto=format&fit=crop&text=ancient+ruins+fantasy+misty'
      }
    ];
  });

  const [editingCG, setEditingCG] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  useEffect(() => {
    if (isOpen && settings?.eventCGs) {
      setEventCGs(settings.eventCGs);
    }
  }, [isOpen, settings?.eventCGs]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSettingsChange({ eventCGs });
    alert('イベントCG設定を保存しました。');
    onClose();
  };

  const addNewCG = () => {
    const newCG = {
      id: Date.now().toString(),
      eventName: '',
      title: '',
      description: '',
      imageUrl: ''
    };
    setEditingCG(newCG);
    setIsAddingNew(true);
  };

  const saveCG = (cg) => {
    if (isAddingNew) {
      setEventCGs(prev => [...prev, cg]);
      setIsAddingNew(false);
    } else {
      setEventCGs(prev => prev.map(item => item.id === cg.id ? cg : item));
    }
    setEditingCG(null);
  };

  const deleteCG = (id) => {
    if (confirm('このイベントCGを削除しますか？')) {
      setEventCGs(prev => prev.filter(item => item.id !== id));
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
        }, '🎨 イベントCGの編集'),
        React.createElement('button', {
          onClick: onClose,
          className: 'p-2 hover:bg-slate-100 rounded-full text-slate-500 hover:text-slate-700'
        }, '✕')
      ),
      
      React.createElement('div', {
        className: 'p-6 overflow-y-auto flex-1'
      },
        React.createElement('div', {
          className: 'mb-4 flex justify-between items-center'
        },
          React.createElement('p', {
            className: 'text-sm text-slate-600'
          }, 'イベント名、タイトル、説明文、画像URLを管理できます。'),
          React.createElement('button', {
            onClick: addNewCG,
            className: 'px-4 py-2 bg-sky-500 text-white rounded-md hover:bg-sky-600'
          }, '+ 新規追加')
        ),
        
        React.createElement('div', {
          className: 'grid grid-cols-1 md:grid-cols-2 gap-4'
        },
          eventCGs.map(cg =>
            React.createElement('div', {
              key: cg.id,
              className: 'border border-slate-200 rounded-lg p-4 bg-slate-50'
            },
              React.createElement('div', {
                className: 'flex justify-between items-start mb-3'
              },
                React.createElement('h4', {
                  className: 'font-bold text-slate-700'
                }, cg.title || 'タイトル未設定'),
                React.createElement('div', {
                  className: 'flex space-x-2'
                },
                  React.createElement('button', {
                    onClick: () => setEditingCG(cg),
                    className: 'text-sm text-sky-600 hover:text-sky-800'
                  }, '編集'),
                  React.createElement('button', {
                    onClick: () => deleteCG(cg.id),
                    className: 'text-sm text-red-600 hover:text-red-800'
                  }, '削除')
                )
              ),
              React.createElement('p', {
                className: 'text-sm text-slate-600 mb-2'
              }, `イベント名: ${cg.eventName || '未設定'}`),
              React.createElement('p', {
                className: 'text-sm text-slate-600 mb-3'
              }, cg.description || '説明未設定'),
              cg.imageUrl && React.createElement('img', {
                src: cg.imageUrl,
                alt: cg.title,
                className: 'w-full h-32 object-cover rounded border',
                onError: (e) => {
                  e.target.src = 'https://placehold.co/300x200/e2e8f0/64748b?text=No+Image';
                }
              })
            )
          )
        )
      ),
      
      // 編集モーダル
      editingCG && React.createElement('div', {
        className: 'absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-10'
      },
        React.createElement('div', {
          className: 'bg-white rounded-lg w-full max-w-2xl p-6',
          onClick: e => e.stopPropagation()
        },
          React.createElement('h3', {
            className: 'text-xl font-bold mb-4'
          }, isAddingNew ? '新規イベントCG追加' : 'イベントCG編集'),
          
          React.createElement('div', {
            className: 'space-y-4'
          },
            React.createElement('div', null,
              React.createElement('label', {
                className: 'block text-sm font-medium text-slate-700 mb-2'
              }, 'イベント名'),
              React.createElement('input', {
                type: 'text',
                value: editingCG.eventName,
                onChange: e => setEditingCG({...editingCG, eventName: e.target.value}),
                className: 'w-full p-2 border border-slate-300 rounded-md',
                placeholder: 'game_start, found_key など'
              })
            ),
            React.createElement('div', null,
              React.createElement('label', {
                className: 'block text-sm font-medium text-slate-700 mb-2'
              }, 'タイトル'),
              React.createElement('input', {
                type: 'text',
                value: editingCG.title,
                onChange: e => setEditingCG({...editingCG, title: e.target.value}),
                className: 'w-full p-2 border border-slate-300 rounded-md',
                placeholder: '🌅 物語の始まり'
              })
            ),
            React.createElement('div', null,
              React.createElement('label', {
                className: 'block text-sm font-medium text-slate-700 mb-2'
              }, '説明文'),
              React.createElement('textarea', {
                value: editingCG.description,
                onChange: e => setEditingCG({...editingCG, description: e.target.value}),
                className: 'w-full p-2 border border-slate-300 rounded-md h-20',
                placeholder: 'イベントの説明を入力してください'
              })
            ),
            React.createElement('div', null,
              React.createElement('label', {
                className: 'block text-sm font-medium text-slate-700 mb-2'
              }, '画像URL'),
              React.createElement('input', {
                type: 'text',
                value: editingCG.imageUrl,
                onChange: e => setEditingCG({...editingCG, imageUrl: e.target.value}),
                className: 'w-full p-2 border border-slate-300 rounded-md',
                placeholder: 'https://...'
              })
            )
          ),
          
          React.createElement('div', {
            className: 'flex justify-end space-x-3 mt-6'
          },
            React.createElement('button', {
              onClick: () => {
                setEditingCG(null);
                setIsAddingNew(false);
              },
              className: 'px-4 py-2 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-100'
            }, 'キャンセル'),
            React.createElement('button', {
              onClick: () => saveCG(editingCG),
              className: 'px-4 py-2 bg-sky-500 text-white rounded-md hover:bg-sky-600'
            }, '保存')
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
          }, `${eventCGs.length}件のイベントCG設定`),
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