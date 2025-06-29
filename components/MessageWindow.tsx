// @ts-nocheck
import React, { useState, useEffect } from 'react';

interface MessageWindowProps {
  message: any;
  isLoading: boolean;
  onRetry?: () => void;
  isVisible?: boolean;
}

export const MessageWindow: React.FC<MessageWindowProps> = ({ 
  message, 
  isLoading, 
  onRetry, 
  isVisible = true 
}) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    if (!message || (isLoading && message.role === 'user')) {
      setDisplayedText(message?.text || '');
      return;
    }
    
    let i = 0;
    const interval = setInterval(() => {
      if (i < message.text.length) {
        setDisplayedText(message.text.substring(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 35);

    return () => clearInterval(interval);
  }, [message, isLoading]);

  if (!message) return null;

  const showRetry = !isLoading && message.role === 'model' && onRetry && displayedText === message.text;

  return React.createElement('div', { 
    className: `transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}` 
  },
    React.createElement('div', {
      className: 'h-64 mx-auto max-w-4xl bg-white/80 border-2 border-slate-200 rounded-t-lg backdrop-blur-md relative'
    },
      React.createElement('div', { className: 'relative h-full p-8' },
        message.speaker && React.createElement('div', { 
          className: 'absolute top-0 left-0 -mt-5 ml-12 px-4 py-1 bg-white border-2 border-slate-200 rounded-t-lg text-lg font-bold text-slate-700' 
        }, message.speaker),
        showRetry && React.createElement('button', { 
          onClick: onRetry, 
          title: 'やり直し', 
          className: 'absolute top-2 right-2 p-2 text-slate-500 hover:text-sky-500 rounded-full' 
        }, '🔄'),
        React.createElement('p', { 
          className: 'text-xl text-slate-800 leading-relaxed whitespace-pre-wrap' 
        }, displayedText || '')
      )
    )
  );
};
