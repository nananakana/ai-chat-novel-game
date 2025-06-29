
import React from 'react';
import { ChatMessage, GameSettings } from '../types';

interface MessageProps {
  message: ChatMessage;
  settings: GameSettings;
}

export const Message: React.FC<MessageProps> = ({ message, settings }) => {
  const isUser = message.role === 'user';
  const showCost = settings.showCost && !isUser && message.cost !== undefined && message.cost > 0;

  return (
    <div className={`flex items-end gap-3 my-4 animate-slide-in-bottom ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-10 h-10 rounded-full bg-brand-purple flex-shrink-0 flex items-center justify-center font-bold text-white">
          AI
        </div>
      )}
      <div
        className={`max-w-xl p-4 rounded-2xl ${
          isUser
            ? 'bg-brand-purple text-white rounded-br-lg'
            : 'bg-gray-700 text-gray-200 rounded-bl-lg'
        }`}
      >
        <p className="whitespace-pre-wrap">{message.text}</p>
        {showCost && (
          <div className="text-xs text-gray-400 mt-2 pt-1 border-t border-gray-600">
            Cost: ${message.cost?.toFixed(6)}
          </div>
        )}
      </div>
      {isUser && (
        <div className="w-10 h-10 rounded-full bg-gray-600 flex-shrink-0 flex items-center justify-center font-bold text-white">
          You
        </div>
      )}
    </div>
  );
};
