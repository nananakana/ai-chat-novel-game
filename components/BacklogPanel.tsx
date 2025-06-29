import React from 'react';
import { ChatMessage } from '../types';

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
    <div className="fixed inset-0 bg-black bg-opacity-75 z-40 animate-fade-in" onClick={onClose}>
      <div 
        className="fixed inset-y-0 right-0 w-full max-w-4xl bg-gray-900 text-white shadow-lg transform transition-transform duration-300 ease-in-out overflow-hidden"
        style={{ transform: isOpen ? 'translateX(0)' : 'translateX(100%)' }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="backlog-title"
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700 bg-gray-800">
          <h2 id="backlog-title" className="text-2xl font-bold">会話履歴</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-full transition-colors"
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
            <div className="text-center text-gray-400 mt-20">
              <p className="text-lg">まだ会話履歴がありません。</p>
              <p className="text-sm mt-2">ゲームを開始すると、ここに会話の記録が表示されます。</p>
            </div>
          ) : (
            gameMessages.map((message, index) => (
              <div key={message.id} className="space-y-2">
                {/* メッセージ番号 */}
                <div className="text-xs text-gray-500">
                  #{index + 1} - {new Date(message.timestamp).toLocaleString('ja-JP')}
                </div>
                
                {/* メッセージ本体 */}
                <div 
                  className={`p-4 rounded-lg border-l-4 ${
                    message.role === 'user' 
                      ? 'bg-blue-900 bg-opacity-30 border-blue-400' 
                      : 'bg-gray-800 bg-opacity-50 border-gray-500'
                  }`}
                >
                  {/* 話者名 */}
                  <div className="flex items-center justify-between mb-2">
                    <span className={`font-semibold text-sm ${
                      message.role === 'user' ? 'text-blue-300' : 'text-gray-300'
                    }`}>
                      {message.role === 'user' ? 'プレイヤー' : (message.speaker || 'AI')}
                    </span>
                    
                    {/* イベントフラグ表示 */}
                    {message.event && (
                      <span className="px-2 py-1 bg-purple-600 text-purple-100 text-xs rounded-full">
                        {message.event}
                      </span>
                    )}
                  </div>
                  
                  {/* メッセージテキスト */}
                  <p className="text-white whitespace-pre-wrap leading-relaxed">
                    {message.text}
                  </p>
                  
                  {/* コスト情報（設定で表示が有効な場合） */}
                  {message.cost !== undefined && message.cost > 0 && (
                    <div className="mt-2 text-xs text-gray-400">
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
        <div className="p-4 border-t border-gray-700 bg-gray-800 text-center">
          <p className="text-sm text-gray-400">
            総メッセージ数: {gameMessages.length}
          </p>
        </div>
      </div>
    </div>
  );
};