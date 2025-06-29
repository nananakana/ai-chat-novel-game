// @ts-nocheck
import React from 'react';

interface BacklogPanelProps {
  isOpen: boolean;
  onClose: () => void;
  messages: any[];
}

export const BacklogPanel: React.FC<BacklogPanelProps> = ({ isOpen, onClose, messages }) => {
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
        }, 'バックログ'),
        React.createElement('button', {
          onClick: onClose,
          className: 'p-2 hover:bg-slate-200 rounded-full'
        }, '✕')
      ),
      React.createElement('div', {
        className: 'flex-grow overflow-y-auto p-6'
      },
        messages.map(msg => 
          React.createElement('div', { 
            key: msg.id, 
            className: 'mb-4' 
          }, 
            React.createElement('p', { 
              className: 'font-bold text-lg text-slate-700' 
            }, msg.speaker || (msg.role === 'user' ? 'プレイヤー' : 'システム')),
            React.createElement('p', { 
              className: 'whitespace-pre-wrap text-slate-600' 
            }, msg.text)
          )
        )
      )
    )
  );
};