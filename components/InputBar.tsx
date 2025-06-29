import React, { useState } from 'react';
import { SendIcon } from './icons/Icons';
import { ThinkingIndicator } from './ThinkingIndicator';

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
    <form onSubmit={handleSubmit} className="flex items-center p-1 bg-gray-900 border-t-2 border-gray-700">
      {isLoading ? (
          <ThinkingIndicator />
      ) : (
        <>
            <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="どうする？"
            className="flex-grow bg-transparent text-white placeholder-gray-500 focus:outline-none px-4 py-2 text-lg"
            disabled={isLoading}
            autoFocus
            />
            <button
            type="submit"
            aria-label="Send"
            disabled={isLoading || !text.trim()}
            className="p-3 text-white rounded-full transition-colors disabled:text-gray-600 enabled:hover:bg-indigo-600"
            >
                <SendIcon />
            </button>
        </>
      )}
    </form>
  );
};
