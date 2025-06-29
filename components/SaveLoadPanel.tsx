// @ts-nocheck
import React, { useState, useEffect } from 'react';

interface SaveLoadPanelProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'save' | 'load';
  onSave: (slotNumber: number) => void;
  onLoad: (slotNumber: number) => void;
  getSaveList: () => any;
  onDeleteSave: (slotNumber: number) => void;
}

export const SaveLoadPanel: React.FC<SaveLoadPanelProps> = ({ 
  isOpen, 
  onClose, 
  mode,
  onSave,
  onLoad,
  getSaveList,
  onDeleteSave
}) => {
  const [saveList, setSaveList] = useState({});
  const TOTAL_SLOTS = 20;

  useEffect(() => {
    if (isOpen) {
      setSaveList(getSaveList());
    }
  }, [isOpen, getSaveList]);

  if (!isOpen) return null;

  const handleSlotAction = (slotNumber) => {
    if (mode === 'save') {
      onSave(slotNumber);
      setSaveList(getSaveList()); // リストを更新
    } else {
      onLoad(slotNumber);
    }
  };

  const handleDeleteSave = (slotNumber, e) => {
    e.stopPropagation();
    if (confirm(`スロット${slotNumber + 1}のセーブデータを削除しますか？`)) {
      onDeleteSave(slotNumber);
      setSaveList(getSaveList()); // リストを更新
    }
  };

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleString('ja-JP');
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
        }, mode === 'save' ? '💾 ゲームセーブ' : '📁 ゲームロード'),
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
            className: 'text-sm text-slate-600'
          }, mode === 'save' ? 'セーブするスロットを選択してください' : 'ロードするセーブデータを選択してください')
        ),
        
        React.createElement('div', {
          className: 'grid grid-cols-1 md:grid-cols-2 gap-4'
        },
          Array.from({ length: TOTAL_SLOTS }, (_, index) => {
            const slotData = saveList[index];
            const isEmpty = !slotData;
            
            return React.createElement('div', {
              key: index,
              className: `border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                isEmpty 
                  ? 'border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100' 
                  : 'border-slate-200 bg-white hover:border-sky-300 hover:shadow-md'
              }`,
              onClick: () => {
                if (mode === 'save' || !isEmpty) {
                  handleSlotAction(index);
                }
              }
            },
              React.createElement('div', {
                className: 'flex justify-between items-start mb-2'
              },
                React.createElement('h3', {
                  className: 'font-semibold text-slate-800'
                }, `スロット ${index + 1}`),
                !isEmpty && React.createElement('button', {
                  onClick: (e) => handleDeleteSave(index, e),
                  className: 'text-red-500 hover:text-red-700 p-1',
                  title: '削除'
                }, '🗑️')
              ),
              
              isEmpty 
                ? React.createElement('p', {
                    className: 'text-slate-500 text-sm'
                  }, '空のスロット')
                : React.createElement('div', {
                    className: 'space-y-2'
                  },
                    React.createElement('p', {
                      className: 'text-sm text-slate-600'
                    }, `保存日時: ${formatDate(slotData.savedAt)}`),
                    React.createElement('p', {
                      className: 'text-sm text-slate-600'
                    }, `メッセージ数: ${slotData.messageCount}`),
                    React.createElement('p', {
                      className: 'text-xs text-slate-500 bg-slate-100 p-2 rounded'
                    }, slotData.lastMessage || '内容なし')
                  )
            );
          })
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
          }, `利用可能スロット: ${TOTAL_SLOTS}`),
          React.createElement('button', {
            onClick: onClose,
            className: 'px-4 py-2 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-100'
          }, 'キャンセル')
        )
      )
    )
  );
};