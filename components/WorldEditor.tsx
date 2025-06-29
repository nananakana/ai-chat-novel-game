import React, { useState } from 'react';
import { CustomWorldSetting } from '../types';
import { LIGHT_THEME_COLORS } from '../constants';

interface WorldEditorProps {
  isOpen: boolean;
  onClose: () => void;
  worldSetting?: CustomWorldSetting;
  onSave: (setting: CustomWorldSetting) => void;
}

export const WorldEditor: React.FC<WorldEditorProps> = ({ isOpen, onClose, worldSetting, onSave }) => {
  const [editedSetting, setEditedSetting] = useState<CustomWorldSetting>(() => ({
    title: worldSetting?.title || "",
    genre: worldSetting?.genre || "",
    setting: worldSetting?.setting || "",
    mainCharacter: worldSetting?.mainCharacter || "",
    customPrompt: worldSetting?.customPrompt || "",
  }));

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!editedSetting.title.trim()) {
      newErrors.title = "タイトルは必須です";
    }
    if (!editedSetting.genre.trim()) {
      newErrors.genre = "ジャンルは必須です";
    }
    if (!editedSetting.setting.trim()) {
      newErrors.setting = "舞台設定は必須です";
    }
    if (!editedSetting.mainCharacter.trim()) {
      newErrors.mainCharacter = "主人公設定は必須です";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave(editedSetting);
      onClose();
    }
  };

  const handleReset = () => {
    setEditedSetting({
      title: "失われた記憶の探求",
      genre: "SFファンタジー",
      setting: "忘れ去られた古代文明の遺跡が点在する、緑豊かな惑星「エデン」。",
      mainCharacter: "記憶を一部失っており、自分の過去を探している冒険者。",
      customPrompt: "",
    });
    setErrors({});
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 z-50 animate-fade-in" onClick={onClose}>
      <div 
        className={`fixed inset-4 ${LIGHT_THEME_COLORS.background.panel} ${LIGHT_THEME_COLORS.text.primary} p-6 rounded-lg shadow-xl border ${LIGHT_THEME_COLORS.border.primary} overflow-auto`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="world-editor-title"
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-6">
          <h2 id="world-editor-title" className={`text-2xl font-bold ${LIGHT_THEME_COLORS.text.primary}`}>
            世界観エディタ
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

        <div className="space-y-6">
          {/* タイトル */}
          <div>
            <label htmlFor="title" className={`block text-sm font-medium ${LIGHT_THEME_COLORS.text.secondary} mb-2`}>
              物語のタイトル *
            </label>
            <input
              id="title"
              type="text"
              value={editedSetting.title}
              onChange={(e) => setEditedSetting(prev => ({ ...prev, title: e.target.value }))}
              className={`w-full px-3 py-2 ${LIGHT_THEME_COLORS.background.secondary} border ${errors.title ? 'border-red-400' : LIGHT_THEME_COLORS.border.primary} rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 ${LIGHT_THEME_COLORS.text.primary}`}
              placeholder="例: 失われた記憶の探求"
            />
            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
          </div>

          {/* ジャンル */}
          <div>
            <label htmlFor="genre" className={`block text-sm font-medium ${LIGHT_THEME_COLORS.text.secondary} mb-2`}>
              ジャンル *
            </label>
            <input
              id="genre"
              type="text"
              value={editedSetting.genre}
              onChange={(e) => setEditedSetting(prev => ({ ...prev, genre: e.target.value }))}
              className={`w-full px-3 py-2 ${LIGHT_THEME_COLORS.background.secondary} border ${errors.genre ? 'border-red-400' : LIGHT_THEME_COLORS.border.primary} rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 ${LIGHT_THEME_COLORS.text.primary}`}
              placeholder="例: SFファンタジー、ミステリー、ホラー"
            />
            {errors.genre && <p className="mt-1 text-sm text-red-600">{errors.genre}</p>}
          </div>

          {/* 舞台設定 */}
          <div>
            <label htmlFor="setting" className={`block text-sm font-medium ${LIGHT_THEME_COLORS.text.secondary} mb-2`}>
              舞台・世界観 *
            </label>
            <textarea
              id="setting"
              value={editedSetting.setting}
              onChange={(e) => setEditedSetting(prev => ({ ...prev, setting: e.target.value }))}
              rows={4}
              className={`w-full px-3 py-2 ${LIGHT_THEME_COLORS.background.secondary} border ${errors.setting ? 'border-red-400' : LIGHT_THEME_COLORS.border.primary} rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 ${LIGHT_THEME_COLORS.text.primary} resize-vertical`}
              placeholder="物語の舞台となる世界について詳しく記述してください..."
            />
            {errors.setting && <p className="mt-1 text-sm text-red-600">{errors.setting}</p>}
          </div>

          {/* 主人公設定 */}
          <div>
            <label htmlFor="mainCharacter" className={`block text-sm font-medium ${LIGHT_THEME_COLORS.text.secondary} mb-2`}>
              主人公設定 *
            </label>
            <textarea
              id="mainCharacter"
              value={editedSetting.mainCharacter}
              onChange={(e) => setEditedSetting(prev => ({ ...prev, mainCharacter: e.target.value }))}
              rows={3}
              className={`w-full px-3 py-2 ${LIGHT_THEME_COLORS.background.secondary} border ${errors.mainCharacter ? 'border-red-400' : LIGHT_THEME_COLORS.border.primary} rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 ${LIGHT_THEME_COLORS.text.primary} resize-vertical`}
              placeholder="主人公（プレイヤー）の背景や特徴について記述してください..."
            />
            {errors.mainCharacter && <p className="mt-1 text-sm text-red-600">{errors.mainCharacter}</p>}
          </div>

          {/* カスタムプロンプト */}
          <div>
            <label htmlFor="customPrompt" className={`block text-sm font-medium ${LIGHT_THEME_COLORS.text.secondary} mb-2`}>
              追加設定（オプション）
            </label>
            <textarea
              id="customPrompt"
              value={editedSetting.customPrompt || ""}
              onChange={(e) => setEditedSetting(prev => ({ ...prev, customPrompt: e.target.value }))}
              rows={3}
              className={`w-full px-3 py-2 ${LIGHT_THEME_COLORS.background.secondary} border ${LIGHT_THEME_COLORS.border.primary} rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 ${LIGHT_THEME_COLORS.text.primary} resize-vertical`}
              placeholder="AIに対する追加の指示や制約があれば記述してください..."
            />
            <p className={`mt-1 text-xs ${LIGHT_THEME_COLORS.text.light}`}>
              特別なルールや物語の方向性など、AIに伝えたい追加情報を入力できます
            </p>
          </div>
        </div>

        {/* フッター */}
        <div className={`flex justify-between items-center mt-8 pt-6 border-t ${LIGHT_THEME_COLORS.border.primary}`}>
          <button
            onClick={handleReset}
            className={`px-4 py-2 ${LIGHT_THEME_COLORS.button.secondary.bg} ${LIGHT_THEME_COLORS.button.secondary.hover} ${LIGHT_THEME_COLORS.button.secondary.text} rounded-md transition-colors`}
          >
            デフォルトに戻す
          </button>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className={`px-4 py-2 ${LIGHT_THEME_COLORS.button.secondary.bg} ${LIGHT_THEME_COLORS.button.secondary.hover} ${LIGHT_THEME_COLORS.button.secondary.text} rounded-md transition-colors`}
            >
              キャンセル
            </button>
            <button
              onClick={handleSave}
              className={`px-4 py-2 ${LIGHT_THEME_COLORS.button.primary.bg} ${LIGHT_THEME_COLORS.button.primary.hover} ${LIGHT_THEME_COLORS.button.primary.text} rounded-md transition-colors`}
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};