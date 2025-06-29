
import React, { useEffect, useRef } from 'react';
import { ChatMessage, GameSettings } from '../types';
import { Message } from './Message';
import { ThinkingIndicator } from './ThinkingIndicator';

interface ChatWindowProps {
  messages: ChatMessage[];
  isLoading: boolean;
  isSummarizing: boolean;
  settings: GameSettings;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isLoading, isSummarizing, settings }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, isSummarizing]);

  const showWelcome = messages.length === 0 && !isLoading;

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-6">
      {showWelcome && (
        <div className="text-center text-gray-500 animate-fade-in">
          <h2 className="text-2xl font-bold mb-2">Welcome to the AI Chat Novel!</h2>
          <p>Type your first action below to begin the story.</p>
        </div>
      )}
      {messages.map((msg) => (
        <Message key={msg.id} message={msg} settings={settings} />
      ))}
      {(isLoading || isSummarizing) && <ThinkingIndicator isSummarizing={isSummarizing} />}
    </div>
  );
};
