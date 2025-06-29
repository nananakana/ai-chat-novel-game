import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../types';

interface MessageWindowProps {
  message: ChatMessage | null;
  isLoading: boolean;
}

export const MessageWindow: React.FC<MessageWindowProps> = ({ message, isLoading }) => {
  const [displayedText, setDisplayedText] = useState('');
  const messageRef = useRef<ChatMessage | null>(null);

  useEffect(() => {
    if (!message || isLoading) {
        if (isLoading && message && message.role === 'user') {
            // Keep user text visible while loading
            setDisplayedText(message.text);
        }
        return;
    }
    
    // Only start typing animation if the message is new
    if (message.id === messageRef.current?.id) return;
    messageRef.current = message;

    setDisplayedText(''); 
    let i = 0;
    const typingInterval = setInterval(() => {
      if (i < message.text.length) {
        setDisplayedText(prev => prev + message.text.charAt(i));
        i++;
      } else {
        clearInterval(typingInterval);
      }
    }, 40); // Typing speed

    return () => clearInterval(typingInterval);
  }, [message, isLoading]);

  const currentSpeaker = isLoading && message?.role === 'user' ? 'プレイヤー' : message?.speaker;

  return (
    <div className="relative h-full p-6 flex flex-col justify-end">
        {currentSpeaker && (
          <div className="absolute top-0 left-0 -mt-5 ml-8 px-4 py-1 bg-gray-800 border border-gray-600 rounded-t-lg text-lg font-bold">
            {currentSpeaker}
          </div>
        )}
        <p className="text-xl leading-relaxed whitespace-pre-wrap">
          {displayedText || (!message ? '物語が始まるのを待っています...' : '')}
        </p>
    </div>
  );
};
