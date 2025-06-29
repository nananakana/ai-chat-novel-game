import React, { useState } from 'react';
import { SendIcon } from './icons/Icons';
import { ThinkingIndicator } from './ThinkingIndicator';
import { LIGHT_THEME_COLORS } from '../constants';

interface InputBarProps {
  onSend: (text: string) => void;
  isLoading: boolean;
}

export const InputBar: React.FC<InputBarProps> = ({ onSend, isLoading }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !isLoading) {
      onSend(text);
      setText('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`flex items-center p-1 ${LIGHT_THEME_COLORS.background.panel} border-t-2 ${LIGHT_THEME_COLORS.border.primary}`}>
      {isLoading ? (
          <ThinkingIndicator />
      ) : (
        <>
            <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="どうする？"
            className={`flex-grow bg-transparent ${LIGHT_THEME_COLORS.text.primary} placeholder-slate-400 focus:outline-none px-4 py-2 text-lg`}
            disabled={isLoading}
            autoFocus
            />
            <button
            type="submit"
            aria-label="Send"
            disabled={isLoading || !text.trim()}
            className={`p-3 ${LIGHT_THEME_COLORS.button.primary.text} rounded-full transition-colors disabled:${LIGHT_THEME_COLORS.text.light} enabled:${LIGHT_THEME_COLORS.button.primary.hover}`}
            >
                <SendIcon />
            </button>
        </>
      )}
    </form>
  );
};
