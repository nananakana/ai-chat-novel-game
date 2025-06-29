import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../types';
import { LIGHT_THEME_COLORS } from '../constants';

interface MessageWindowProps {
  message: ChatMessage | null;
  isLoading: boolean;
  onRetry?: () => void;
  isVisible?: boolean;
  onToggleVisibility?: () => void;
}

export const MessageWindow: React.FC<MessageWindowProps> = ({ message, isLoading, onRetry, isVisible = true, onToggleVisibility }) => {
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
    <div className={`relative h-full p-6 flex flex-col justify-end transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        {currentSpeaker && isVisible && (
          <div className={`absolute top-0 left-0 -mt-5 ml-8 px-4 py-1 ${LIGHT_THEME_COLORS.background.secondary} border ${LIGHT_THEME_COLORS.border.accent} rounded-t-lg text-lg font-bold ${LIGHT_THEME_COLORS.text.primary}`}>
            {currentSpeaker}
          </div>
        )}

        {/* 表示切替ボタン */}
        {onToggleVisibility && (
          <div className="absolute top-0 right-0 -mt-8 mr-2">
            <button
              onClick={onToggleVisibility}
              className={`p-2 ${LIGHT_THEME_COLORS.button.icon.text} ${LIGHT_THEME_COLORS.button.icon.hover} rounded-full transition-colors bg-white bg-opacity-90 shadow-sm`}
              title={isVisible ? "メッセージを非表示" : "メッセージを表示"}
            >
              {isVisible ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
        )}
        
        {/* リトライボタン */}
        {showRetryButton && isVisible && (
          <div className="absolute top-0 right-0 -mt-3 mr-16">
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
        
        {isVisible && (
          <p className={`text-xl leading-relaxed whitespace-pre-wrap ${LIGHT_THEME_COLORS.text.primary}`}>
            {displayedText || (!message ? '物語が始まるのを待っています...' : '')}
          </p>
        )}
    </div>
  );
};
