// @ts-nocheck
import React, { useState } from 'react';

interface CharacterEditorProps {
  isOpen: boolean;
  onClose: () => void;
  settings: any;
  onSettingsChange: (newSettings: any) => void;
}

export const CharacterEditor: React.FC<CharacterEditorProps> = ({ 
  isOpen, 
  onClose, 
  settings, 
  onSettingsChange 
}) => {
  const [characters, setCharacters] = useState(() => {
    return settings?.characters || [
      { id: '1', name: '主人公', alias: ['protagonist', 'default', 'プレイヤー'], image: 'https://placehold.co/800x1200/e0e7ff/1e3a8a?text=Protagonist', isProtagonist: true, isDisplayed: false, profile: '' },
      { id: '2', name: 'アキラ', alias: ['akira'], image: 'https://placehold.co/800x1200/dbeafe/1e3a8a?text=Akira', isProtagonist: false, isDisplayed: true, profile: '冷静沈着だが、仲間思いの一面も。古代文明の謎を追っている。' }
    ];
  });

  if (!isOpen) return null;

  const handleSave = () => {
    onSettingsChange({ characters });
    alert('キャラクター設定を保存しました。');
    onClose();
  };

  const addCharacter = () => {
    const newCharacter = {
      id: Date.now().toString(),
      name: '新しいキャラクター',
      alias: [],
      image: '',
      isProtagonist: false,
      isDisplayed: false,
      profile: ''
    };
    setCharacters([...characters, newCharacter]);
  };

  const updateCharacter = (id, field, value) => {
    setCharacters(chars => chars.map(char => 
      char.id === id ? { ...char, [field]: value } : char
    ));
  };

  const deleteCharacter = (id) => {
    if (confirm('このキャラクターを削除しますか？')) {
      setCharacters(chars => chars.filter(char => char.id !== id));
    }
  };

  const addAlias = (id, alias) => {
    if (alias.trim()) {
      updateCharacter(id, 'alias', [...(characters.find(c => c.id === id)?.alias || []), alias.trim()]);
    }
  };

  const removeAlias = (id, aliasIndex) => {
    const character = characters.find(c => c.id === id);
    if (character) {
      const newAliases = character.alias.filter((_, index) => index !== aliasIndex);
      updateCharacter(id, 'alias', newAliases);
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
        }, '👥 キャラクター設定'),
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
            }, 'ゲームに登場するキャラクターを管理できます。'),
            React.createElement('button', {
              onClick: addCharacter,
              className: 'px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600'
            }, '+ キャラクター追加')
          ),
          React.createElement('div', {
            className: 'bg-blue-50 border border-blue-200 rounded-lg p-3'
          },
            React.createElement('h4', {
              className: 'text-sm font-medium text-blue-800 mb-2'
            }, '📋 推奨画像仕様'),
            React.createElement('ul', {
              className: 'text-xs text-blue-700 space-y-1'
            },
              React.createElement('li', null, '• 推奨サイズ: 縦1200px × 横800px程度の縦長画像'),
              React.createElement('li', null, '• ファイル形式: PNG, JPG, WebP'),
              React.createElement('li', null, '• 背景透過推奨（PNG形式）'),
              React.createElement('li', null, '• 高解像度推奨（画面に大きく表示されます）')
            )
          )
        ),
        
        React.createElement('div', {
          className: 'space-y-4'
        },
          characters.map(character => 
            React.createElement('div', {
              key: character.id,
              className: 'border border-slate-200 rounded-lg p-4 bg-slate-50'
            },
              React.createElement('div', {
                className: 'flex justify-between items-start mb-4'
              },
                React.createElement('div', {
                  className: 'flex items-center space-x-3'
                },
                  character.image && React.createElement('img', {
                    src: character.image,
                    alt: character.name,
                    className: 'w-12 h-12 rounded-full object-cover',
                    onError: (e) => { e.target.style.display = 'none'; }
                  }),
                  React.createElement('div', null,
                    React.createElement('h4', {
                      className: 'font-semibold text-slate-800'
                    }, character.name),
                    character.isProtagonist && React.createElement('span', {
                      className: 'text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full'
                    }, '主人公')
                  )
                ),
                !character.isProtagonist && React.createElement('button', {
                  onClick: () => deleteCharacter(character.id),
                  className: 'text-red-500 hover:text-red-700 p-1'
                }, '🗑️')
              ),
              
              React.createElement('div', {
                className: 'grid grid-cols-1 md:grid-cols-2 gap-4'
              },
                React.createElement('div', null,
                  React.createElement('label', {
                    className: 'block text-sm font-medium text-slate-700 mb-2'
                  }, 'キャラクター名'),
                  React.createElement('input', {
                    type: 'text',
                    value: character.name,
                    onChange: e => updateCharacter(character.id, 'name', e.target.value),
                    className: 'w-full p-2 border border-slate-300 rounded-md'
                  })
                ),
                
                React.createElement('div', null,
                  React.createElement('label', {
                    className: 'block text-sm font-medium text-slate-700 mb-2'
                  }, '画像URL'),
                  React.createElement('input', {
                    type: 'url',
                    value: character.image,
                    onChange: e => updateCharacter(character.id, 'image', e.target.value),
                    placeholder: 'https://example.com/image.jpg',
                    className: 'w-full p-2 border border-slate-300 rounded-md'
                  })
                )
              ),
              
              React.createElement('div', {
                className: 'mt-4'
              },
                React.createElement('label', {
                  className: 'block text-sm font-medium text-slate-700 mb-2'
                }, '別名・呼び方'),
                React.createElement('div', {
                  className: 'flex flex-wrap gap-2 mb-2'
                },
                  (character.alias || []).map((alias, index) =>
                    React.createElement('span', {
                      key: index,
                      className: 'bg-slate-200 text-slate-700 px-2 py-1 rounded-full text-sm flex items-center gap-1'
                    },
                      alias,
                      React.createElement('button', {
                        onClick: () => removeAlias(character.id, index),
                        className: 'text-slate-500 hover:text-red-500'
                      }, '×')
                    )
                  )
                ),
                React.createElement('input', {
                  type: 'text',
                  placeholder: '別名を入力してEnterキーを押す',
                  className: 'w-full p-2 border border-slate-300 rounded-md',
                  onKeyPress: (e) => {
                    if (e.key === 'Enter') {
                      addAlias(character.id, e.target.value);
                      e.target.value = '';
                    }
                  }
                })
              ),
              
              React.createElement('div', {
                className: 'mt-4'
              },
                React.createElement('label', {
                  className: 'block text-sm font-medium text-slate-700 mb-2'
                }, 'キャラクターの性格・設定'),
                React.createElement('textarea', {
                  value: character.profile || '',
                  onChange: e => updateCharacter(character.id, 'profile', e.target.value),
                  placeholder: 'このキャラクターの性格、背景設定、口調などを記述してください...',
                  className: 'w-full p-3 border border-slate-300 rounded-md h-24 resize-none',
                  rows: 3
                })
              ),
              
              React.createElement('div', {
                className: 'mt-4 space-y-3'
              },
                React.createElement('div', {
                  className: 'flex items-center'
                },
                  React.createElement('input', {
                    type: 'checkbox',
                    id: `protagonist-${character.id}`,
                    checked: character.isProtagonist,
                    onChange: e => {
                      // 主人公は一人だけ
                      if (e.target.checked) {
                        setCharacters(chars => chars.map(char => ({
                          ...char,
                          isProtagonist: char.id === character.id
                        })));
                      }
                    },
                    className: 'mr-2'
                  }),
                  React.createElement('label', {
                    htmlFor: `protagonist-${character.id}`,
                    className: 'text-sm text-slate-700'
                  }, '主人公として設定する')
                ),
                React.createElement('div', {
                  className: 'flex items-center'
                },
                  React.createElement('input', {
                    type: 'checkbox',
                    id: `displayed-${character.id}`,
                    checked: character.isDisplayed || false,
                    onChange: e => updateCharacter(character.id, 'isDisplayed', e.target.checked),
                    className: 'mr-2'
                  }),
                  React.createElement('label', {
                    htmlFor: `displayed-${character.id}`,
                    className: 'text-sm text-slate-700'
                  }, 'このキャラクターを画面に表示する')
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
          }, `登録キャラクター数: ${characters.length}`),
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