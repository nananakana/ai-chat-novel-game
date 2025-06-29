import React from 'react';
import { GalleryItem } from '../types';
import { LIGHT_THEME_COLORS } from '../constants';

interface GalleryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  galleryItems: GalleryItem[];
}

export const GalleryPanel: React.FC<GalleryPanelProps> = ({ isOpen, onClose, galleryItems }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 z-50 animate-fade-in" onClick={onClose}>
      <div 
        className={`fixed inset-4 ${LIGHT_THEME_COLORS.background.panel} ${LIGHT_THEME_COLORS.text.primary} p-6 rounded-lg shadow-xl border ${LIGHT_THEME_COLORS.border.primary} overflow-hidden flex flex-col`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="gallery-title"
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-6">
          <h2 id="gallery-title" className={`text-2xl font-bold ${LIGHT_THEME_COLORS.text.primary}`}>
            イベントギャラリー
          </h2>
          <button 
            onClick={onClose}
            className={`${LIGHT_THEME_COLORS.text.muted} hover:${LIGHT_THEME_COLORS.text.primary} transition-colors`}
            aria-label="閉じる"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ギャラリーコンテンツ */}
        <div className="flex-1 overflow-y-auto">
          {galleryItems.length === 0 ? (
            <div className={`flex flex-col items-center justify-center h-full text-center ${LIGHT_THEME_COLORS.text.muted}`}>
              <div className="mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">まだアンロックされたイベントがありません</h3>
              <p className="text-sm">
                物語を進めてイベントを発生させると、<br />
                ここに特別なCGが保存されます。
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {galleryItems.map((item) => (
                <div 
                  key={item.id}
                  className={`${LIGHT_THEME_COLORS.background.secondary} border ${LIGHT_THEME_COLORS.border.primary} rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow`}
                >
                  {/* イベント画像 */}
                  <div className="aspect-video bg-gray-100 relative overflow-hidden">
                    <img 
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://placehold.co/400x225/f3f4f6/9ca3af?text=イベントCG';
                      }}
                    />
                    
                    {/* イベント名バッジ */}
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-1 bg-purple-500 text-white text-xs rounded-full">
                        {item.eventName}
                      </span>
                    </div>
                  </div>
                  
                  {/* イベント情報 */}
                  <div className="p-4">
                    <h3 className={`font-medium mb-2 ${LIGHT_THEME_COLORS.text.primary}`}>
                      {item.title}
                    </h3>
                    <p className={`text-sm ${LIGHT_THEME_COLORS.text.secondary} mb-3 line-clamp-2`}>
                      {item.description}
                    </p>
                    <div className={`text-xs ${LIGHT_THEME_COLORS.text.light}`}>
                      アンロック日時: {new Date(item.unlockedAt).toLocaleString('ja-JP')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* フッター */}
        <div className={`flex justify-between items-center mt-6 pt-4 border-t ${LIGHT_THEME_COLORS.border.primary}`}>
          <div className={`text-sm ${LIGHT_THEME_COLORS.text.secondary}`}>
            アンロック済み: {galleryItems.length} / ∞
          </div>
          <button
            onClick={onClose}
            className={`px-4 py-2 ${LIGHT_THEME_COLORS.button.primary.bg} ${LIGHT_THEME_COLORS.button.primary.hover} ${LIGHT_THEME_COLORS.button.primary.text} rounded-md transition-colors`}
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};