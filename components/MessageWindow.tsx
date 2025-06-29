import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../types';
import { LIGHT_THEME_COLORS } from '../constants';

interface MessageWindowProps {
  message: ChatMessage | null;
  isLoading: boolean;
  onRetry?: () => void;
}

export const MessageWindow: React.FC<MessageWindowProps> = ({ message, isLoading, onRetry }) => {
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

  // リトライボタンを表示する条件
  const showRetryButton = !isLoading && 
                          message?.role === 'model' && 
                          onRetry && 
                          displayedText !== '';

  return (
    <div className="relative h-full p-6 flex flex-col justify-end">
        {currentSpeaker && (
          <div className={`absolute top-0 left-0 -mt-5 ml-8 px-4 py-1 ${LIGHT_THEME_COLORS.background.secondary} border ${LIGHT_THEME_COLORS.border.accent} rounded-t-lg text-lg font-bold ${LIGHT_THEME_COLORS.text.primary}`}>
            {currentSpeaker}
          </div>
        )}
        
        {/* リトライボタン */}
        {showRetryButton && (
          <div className="absolute top-0 right-0 -mt-3 mr-4">
            <button
              onClick={onRetry}
              className={`px-3 py-1 ${LIGHT_THEME_COLORS.button.warning.bg} ${LIGHT_THEME_COLORS.button.warning.hover} ${LIGHT_THEME_COLORS.button.warning.text} text-sm rounded-full transition-colors flex items-center gap-1 shadow-md`}
              title="この応答をやり直す"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              やり直し
            </button>
          </div>
        )}
        
        <p className={`text-xl leading-relaxed whitespace-pre-wrap ${LIGHT_THEME_COLORS.text.primary}`}>
          {displayedText || (!message ? '物語が始まるのを待っています...' : '')}
        </p>
    </div>
  );
};
