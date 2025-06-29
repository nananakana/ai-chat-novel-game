// @ts-nocheck
import React, { useState } from 'react';

interface GalleryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  items: any[];
}

export const GalleryPanel: React.FC<GalleryPanelProps> = ({ isOpen, onClose, items }) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [sortBy, setSortBy] = useState('newest');
  
  if (!isOpen) return null;
  
  // ソート処理
  const sortedItems = [...items].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.unlockedAt) - new Date(a.unlockedAt);
      case 'oldest':
        return new Date(a.unlockedAt) - new Date(b.unlockedAt);
      case 'name':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

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
        React.createElement('div', {
          className: 'flex items-center space-x-4'
        },
          React.createElement('h2', {
            className: 'text-xl font-bold text-slate-800'
          }, 'ギャラリー'),
          items.length > 0 && React.createElement('div', {
            className: 'flex items-center space-x-2'
          },
            React.createElement('span', {
              className: 'text-sm text-slate-600'
            }, 'ソート:'),
            React.createElement('select', {
              value: sortBy,
              onChange: e => setSortBy(e.target.value),
              className: 'text-sm px-2 py-1 border border-slate-300 rounded bg-white'
            },
              React.createElement('option', { value: 'newest' }, '新しい順'),
              React.createElement('option', { value: 'oldest' }, '古い順'),
              React.createElement('option', { value: 'name' }, '名前順')
            )
          )
        ),
        React.createElement('div', {
          className: 'flex items-center space-x-2'
        },
          items.length > 0 && React.createElement('span', {
            className: 'text-sm text-slate-600'
          }, `${items.length}件`),
          React.createElement('button', {
            onClick: onClose,
            className: 'p-2 hover:bg-slate-200 rounded-full'
          }, '✕')
        )
      ),
      React.createElement('div', {
        className: 'p-6 overflow-y-auto flex-1'
      },
        items.length === 0 ? 
          React.createElement('div', {
            className: 'flex flex-col items-center justify-center h-full min-h-[200px] text-center'
          },
            React.createElement('div', {
              className: 'text-6xl mb-4 text-slate-400'
            }, '🎨'),
            React.createElement('p', {
              className: 'text-slate-500 mb-2'
            }, 'まだアンロックされたイベントCGはありません。'),
            React.createElement('p', {
              className: 'text-sm text-slate-400'
            }, '物語を進めて特別なイベントを発生させてください。')
          ) :
          React.createElement('div', {
            className: 'grid grid-cols-2 md:grid-cols-3 gap-4'
          },
            sortedItems.map(item => 
              React.createElement('div', {
                key: item.id,
                className: 'border border-slate-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow group cursor-pointer bg-white',
                onClick: () => setSelectedItem(item)
              },
                React.createElement('img', {
                  src: item.imageUrl,
                  alt: item.title,
                  className: 'w-full h-40 object-cover group-hover:scale-105 transition-transform',
                  onError: (e) => {
                    e.target.src = 'https://placehold.co/300x200/e2e8f0/64748b?text=No+Image';
                  }
                }),
                React.createElement('div', {
                  className: 'p-3'
                },
                  React.createElement('h4', {
                    className: 'font-bold text-slate-700 mb-1'
                  }, item.title || 'タイトルなし'),
                  React.createElement('p', {
                    className: 'text-sm text-slate-500 line-clamp-2'
                  }, item.description || '説明なし'),
                  item.unlockedAt && React.createElement('p', {
                    className: 'text-xs text-slate-400 mt-2'
                  }, `アンロック: ${new Date(item.unlockedAt).toLocaleDateString()}`)
                )
              )
            )
          )
      ),
      
      // 画像詳細表示モーダル
      selectedItem && React.createElement('div', {
        className: 'absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-10',
        onClick: () => setSelectedItem(null)
      },
        React.createElement('div', {
          className: 'max-w-4xl max-h-full bg-white rounded-lg overflow-hidden flex flex-col',
          onClick: e => e.stopPropagation()
        },
          React.createElement('div', {
            className: 'flex justify-between items-center p-4 border-b border-slate-200'
          },
            React.createElement('h3', {
              className: 'text-xl font-bold text-slate-800'
            }, selectedItem.title || 'イベントCG'),
            React.createElement('button', {
              onClick: () => setSelectedItem(null),
              className: 'p-2 hover:bg-slate-100 rounded-full'
            }, '✕')
          ),
          React.createElement('div', {
            className: 'flex-1 overflow-auto'
          },
            React.createElement('img', {
              src: selectedItem.imageUrl,
              alt: selectedItem.title,
              className: 'w-full h-auto',
              onError: (e) => {
                e.target.src = 'https://placehold.co/800x600/e2e8f0/64748b?text=No+Image';
              }
            })
          ),
          React.createElement('div', {
            className: 'p-4 border-t border-slate-200 bg-slate-50'
          },
            React.createElement('p', {
              className: 'text-slate-700 mb-2'
            }, selectedItem.description || '説明がありません'),
            selectedItem.unlockedAt && React.createElement('p', {
              className: 'text-sm text-slate-500'
            }, `アンロック日時: ${new Date(selectedItem.unlockedAt).toLocaleString()}`)
          )
        )
      )
    )
  );
};