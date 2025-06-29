// @ts-nocheck
import React, { useState, Fragment } from 'react';

interface InputBarProps {
  onSend: (text: string) => void;
  isLoading: boolean;
  isWindowVisible: boolean;
}

export const InputBar: React.FC<InputBarProps> = ({ onSend, isLoading, isWindowVisible }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim() && !isLoading) {
      onSend(text);
      setText('');
    }
  };

  if (!isWindowVisible) return null;

  return React.createElement('form', { 
    onSubmit: handleSubmit, 
    className: 'flex items-center p-2 bg-slate-200 border-t-2 border-slate-300 max-w-4xl mx-auto' 
  },
    isLoading ? 
      React.createElement('div', { 
        className: 'flex items-center justify-center w-full px-4 py-2 text-slate-500 animate-pulse' 
      }, 'AIが思考中...') :
      React.createElement(Fragment, null,
        React.createElement('input', { 
          type: 'text', 
          value: text, 
          onChange: e => setText(e.target.value), 
          placeholder: 'どうする？', 
          className: 'flex-grow bg-transparent text-slate-800 placeholder-slate-500 focus:outline-none px-4 py-2 text-lg', 
          disabled: isLoading 
        }),
        React.createElement('button', { 
          type: 'submit', 
          disabled: isLoading || !text.trim(), 
          className: 'p-3 text-white bg-sky-500 rounded-full disabled:bg-slate-400 hover:bg-sky-600' 
        }, '➤')
      )
  );
};
