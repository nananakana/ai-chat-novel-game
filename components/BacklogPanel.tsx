import React from 'react';
import { ChatMessage } from '../types';
import { LIGHT_THEME_COLORS } from '../constants';

interface BacklogPanelProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
}

export const BacklogPanel: React.FC<BacklogPanelProps> = ({ isOpen, onClose, messages }) => {
  if (!isOpen) return null;

  // ゲーム開始後のメッセージのみを表示（初期メッセージ以降）
  const gameMessages = messages.slice(1);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 z-40 animate-fade-in" onClick={onClose}>
      <div 
        className={`fixed inset-y-0 right-0 w-full max-w-4xl ${LIGHT_THEME_COLORS.background.panel} ${LIGHT_THEME_COLORS.text.primary} shadow-xl border-l ${LIGHT_THEME_COLORS.border.primary} transform transition-transform duration-300 ease-in-out overflow-hidden`}
        style={{ transform: isOpen ? 'translateX(0)' : 'translateX(100%)' }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="backlog-title"
      >
        {/* ヘッダー */}
        <div className={`flex items-center justify-between p-6 border-b ${LIGHT_THEME_COLORS.border.primary} ${LIGHT_THEME_COLORS.background.secondary}`}>
          <h2 id="backlog-title" className={`text-2xl font-bold ${LIGHT_THEME_COLORS.text.primary}`}>会話履歴</h2>
          <button 
            onClick={onClose}
            className={`p-2 ${LIGHT_THEME_COLORS.button.icon.hover} rounded-full transition-colors ${LIGHT_THEME_COLORS.text.muted}`}
            aria-label="閉じる"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* メッセージ履歴 */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6" style={{ height: 'calc(100vh - 88px)' }}>
          {gameMessages.length === 0 ? (
            <div className={`text-center ${LIGHT_THEME_COLORS.text.muted} mt-20`}>
              <p className="text-lg">まだ会話履歴がありません。</p>
              <p className="text-sm mt-2">ゲームを開始すると、ここに会話の記録が表示されます。</p>
            </div>
          ) : (
            gameMessages.map((message, index) => (
              <div key={message.id} className="space-y-2">
                {/* メッセージ番号 */}
                <div className={`text-xs ${LIGHT_THEME_COLORS.text.light}`}>
                  #{index + 1} - {new Date(message.timestamp).toLocaleString('ja-JP')}
                </div>
                
                {/* メッセージ本体 */}
                <div 
                  className={`p-4 rounded-lg border-l-4 ${
                    message.role === 'user' 
                      ? 'bg-sky-50 border-sky-400' 
                      : `${LIGHT_THEME_COLORS.background.secondary} border-slate-300`
                  }`}
                >
                  {/* 話者名 */}
                  <div className="flex items-center justify-between mb-2">
                    <span className={`font-semibold text-sm ${
                      message.role === 'user' ? 'text-sky-600' : LIGHT_THEME_COLORS.text.secondary
                    }`}>
                      {message.role === 'user' ? 'プレイヤー' : (message.speaker || 'AI')}
                    </span>
                    
                    {/* イベントフラグ表示 */}
                    {message.event && (
                      <span className="px-2 py-1 bg-purple-500 text-white text-xs rounded-full">
                        {message.event}
                      </span>
                    )}
                  </div>
                  
                  {/* メッセージテキスト */}
                  <p className={`${LIGHT_THEME_COLORS.text.primary} whitespace-pre-wrap leading-relaxed`}>
                    {message.text}
                  </p>
                  
                  {/* コスト情報（設定で表示が有効な場合） */}
                  {message.cost !== undefined && message.cost > 0 && (
                    <div className={`mt-2 text-xs ${LIGHT_THEME_COLORS.text.light}`}>
                      コスト: ${message.cost.toFixed(6)}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          
          {/* 下部スペース */}
          <div className="h-4"></div>
        </div>

        {/* フッター */}
        <div className={`p-4 border-t ${LIGHT_THEME_COLORS.border.primary} ${LIGHT_THEME_COLORS.background.secondary} text-center`}>
          <p className={`text-sm ${LIGHT_THEME_COLORS.text.secondary}`}>
            総メッセージ数: {gameMessages.length}
          </p>
        </div>
      </div>
    </div>
  );
};