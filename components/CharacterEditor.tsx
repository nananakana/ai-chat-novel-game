import React, { useState } from 'react';
import { CustomCharacter } from '../types';
import { LIGHT_THEME_COLORS } from '../constants';

interface CharacterEditorProps {
  isOpen: boolean;
  onClose: () => void;
  characters: CustomCharacter[];
  onSave: (characters: CustomCharacter[]) => void;
}

export const CharacterEditor: React.FC<CharacterEditorProps> = ({ isOpen, onClose, characters, onSave }) => {
  const [editedCharacters, setEditedCharacters] = useState<CustomCharacter[]>(() => [...characters]);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(
    characters.length > 0 ? characters[0].id : null
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const selectedCharacter = editedCharacters.find(char => char.id === selectedCharacterId);

  const validateCharacter = (character: CustomCharacter) => {
    const newErrors: Record<string, string> = {};
    
    if (!character.name.trim()) {
      newErrors.name = "名前は必須です";
    }
    if (!character.imageUrl.trim()) {
      newErrors.imageUrl = "画像URLは必須です";
    }

    return newErrors;
  };

  const updateCharacter = (updatedCharacter: CustomCharacter) => {
    setEditedCharacters(prev => 
      prev.map(char => char.id === updatedCharacter.id ? updatedCharacter : char)
    );
  };

  const addNewCharacter = () => {
    const newId = `char_${Date.now()}`;
    const newCharacter: CustomCharacter = {
      id: newId,
      name: "",
      aliases: [],
      imageUrl: "",
      isProtagonist: false,
    };
    
    setEditedCharacters(prev => [...prev, newCharacter]);
    setSelectedCharacterId(newId);
  };

  const deleteCharacter = (characterId: string) => {
    if (editedCharacters.length <= 1) {
      alert('最低1つのキャラクターが必要です');
      return;
    }

    const targetCharacter = editedCharacters.find(char => char.id === characterId);
    if (targetCharacter?.isProtagonist) {
      alert('主人公キャラクターは削除できません');
      return;
    }

    if (confirm('このキャラクターを削除しますか？')) {
      setEditedCharacters(prev => prev.filter(char => char.id !== characterId));
      if (selectedCharacterId === characterId) {
        setSelectedCharacterId(editedCharacters[0]?.id || null);
      }
    }
  };

  const handleSave = () => {
    let hasErrors = false;
    const allErrors: Record<string, string> = {};

    editedCharacters.forEach(character => {
      const charErrors = validateCharacter(character);
      if (Object.keys(charErrors).length > 0) {
        hasErrors = true;
        Object.assign(allErrors, charErrors);
      }
    });

    if (hasErrors) {
      setErrors(allErrors);
      return;
    }

    // 主人公が1人だけかチェック
    const protagonists = editedCharacters.filter(char => char.isProtagonist);
    if (protagonists.length !== 1) {
      alert('主人公は必ず1人設定してください');
      return;
    }

    onSave(editedCharacters);
    onClose();
  };

  const parseAliases = (aliasesText: string): string[] => {
    return aliasesText
      .split(',')
      .map(alias => alias.trim())
      .filter(alias => alias.length > 0);
  };

  const aliasesText = selectedCharacter?.aliases.join(', ') || '';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 z-50 animate-fade-in" onClick={onClose}>
      <div 
        className={`fixed inset-4 ${LIGHT_THEME_COLORS.background.panel} ${LIGHT_THEME_COLORS.text.primary} p-6 rounded-lg shadow-xl border ${LIGHT_THEME_COLORS.border.primary} overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="character-editor-title"
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-6">
          <h2 id="character-editor-title" className={`text-2xl font-bold ${LIGHT_THEME_COLORS.text.primary}`}>
            キャラクターエディタ
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

        <div className="flex gap-6 h-96">
          {/* キャラクターリスト */}
          <div className="w-1/3">
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${LIGHT_THEME_COLORS.text.primary}`}>キャラクター一覧</h3>
              <button
                onClick={addNewCharacter}
                className={`px-3 py-1 ${LIGHT_THEME_COLORS.button.primary.bg} ${LIGHT_THEME_COLORS.button.primary.hover} ${LIGHT_THEME_COLORS.button.primary.text} rounded text-sm transition-colors`}
              >
                + 追加
              </button>
            </div>
            
            <div className={`border ${LIGHT_THEME_COLORS.border.primary} rounded-md overflow-hidden`}>
              {editedCharacters.map((character, index) => (
                <div
                  key={character.id}
                  className={`p-3 cursor-pointer border-b ${LIGHT_THEME_COLORS.border.primary} last:border-b-0 ${
                    selectedCharacterId === character.id 
                      ? `${LIGHT_THEME_COLORS.background.secondary}` 
                      : 'hover:bg-slate-50'
                  }`}
                  onClick={() => setSelectedCharacterId(character.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className={`font-medium ${LIGHT_THEME_COLORS.text.primary}`}>
                        {character.name || `キャラクター${index + 1}`}
                        {character.isProtagonist && (
                          <span className="ml-2 px-2 py-0.5 bg-sky-500 text-white text-xs rounded-full">主人公</span>
                        )}
                      </div>
                      {character.aliases.length > 0 && (
                        <div className={`text-xs ${LIGHT_THEME_COLORS.text.light} mt-1`}>
                          {character.aliases.slice(0, 2).join(', ')}
                          {character.aliases.length > 2 && '...'}
                        </div>
                      )}
                    </div>
                    
                    {!character.isProtagonist && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteCharacter(character.id);
                        }}
                        className={`text-red-500 hover:text-red-700 transition-colors`}
                        title="削除"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* キャラクター詳細編集 */}
          <div className="flex-1">
            {selectedCharacter ? (
              <div className="space-y-4">
                <h3 className={`text-lg font-semibold ${LIGHT_THEME_COLORS.text.primary} mb-4`}>詳細設定</h3>
                
                {/* 名前 */}
                <div>
                  <label className={`block text-sm font-medium ${LIGHT_THEME_COLORS.text.secondary} mb-2`}>
                    名前 *
                  </label>
                  <input
                    type="text"
                    value={selectedCharacter.name}
                    onChange={(e) => updateCharacter({ ...selectedCharacter, name: e.target.value })}
                    className={`w-full px-3 py-2 ${LIGHT_THEME_COLORS.background.secondary} border ${errors.name ? 'border-red-400' : LIGHT_THEME_COLORS.border.primary} rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 ${LIGHT_THEME_COLORS.text.primary}`}
                    placeholder="キャラクターの名前"
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                {/* エイリアス */}
                <div>
                  <label className={`block text-sm font-medium ${LIGHT_THEME_COLORS.text.secondary} mb-2`}>
                    エイリアス（別名）
                  </label>
                  <input
                    type="text"
                    value={aliasesText}
                    onChange={(e) => updateCharacter({ 
                      ...selectedCharacter, 
                      aliases: parseAliases(e.target.value)
                    })}
                    className={`w-full px-3 py-2 ${LIGHT_THEME_COLORS.background.secondary} border ${LIGHT_THEME_COLORS.border.primary} rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 ${LIGHT_THEME_COLORS.text.primary}`}
                    placeholder="アキラ, akira, 少年（カンマ区切り）"
                  />
                  <p className={`mt-1 text-xs ${LIGHT_THEME_COLORS.text.light}`}>
                    AIがこのキャラクターを認識するための別名をカンマ区切りで入力
                  </p>
                </div>

                {/* 画像URL */}
                <div>
                  <label className={`block text-sm font-medium ${LIGHT_THEME_COLORS.text.secondary} mb-2`}>
                    画像URL *
                  </label>
                  <input
                    type="url"
                    value={selectedCharacter.imageUrl}
                    onChange={(e) => updateCharacter({ ...selectedCharacter, imageUrl: e.target.value })}
                    className={`w-full px-3 py-2 ${LIGHT_THEME_COLORS.background.secondary} border ${errors.imageUrl ? 'border-red-400' : LIGHT_THEME_COLORS.border.primary} rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 ${LIGHT_THEME_COLORS.text.primary}`}
                    placeholder="https://example.com/character.png"
                  />
                  {errors.imageUrl && <p className="mt-1 text-sm text-red-600">{errors.imageUrl}</p>}
                </div>

                {/* 主人公フラグ */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isProtagonist"
                    checked={selectedCharacter.isProtagonist || false}
                    onChange={(e) => {
                      // 主人公フラグを変更する場合、他のキャラクターの主人公フラグを解除
                      if (e.target.checked) {
                        const updatedCharacters = editedCharacters.map(char => ({
                          ...char,
                          isProtagonist: char.id === selectedCharacter.id
                        }));
                        setEditedCharacters(updatedCharacters);
                      } else {
                        updateCharacter({ ...selectedCharacter, isProtagonist: false });
                      }
                    }}
                    className="w-4 h-4 text-sky-600 bg-gray-100 border-gray-300 rounded focus:ring-sky-500 focus:ring-2"
                  />
                  <label htmlFor="isProtagonist" className={`ml-2 text-sm ${LIGHT_THEME_COLORS.text.secondary}`}>
                    主人公キャラクター
                  </label>
                </div>

                {/* プレビュー */}
                {selectedCharacter.imageUrl && (
                  <div>
                    <label className={`block text-sm font-medium ${LIGHT_THEME_COLORS.text.secondary} mb-2`}>
                      プレビュー
                    </label>
                    <div className="w-32 h-48 border border-gray-300 rounded-md overflow-hidden">
                      <img 
                        src={selectedCharacter.imageUrl} 
                        alt={selectedCharacter.name || "キャラクター"}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://placehold.co/128x192/f3f4f6/9ca3af?text=画像エラー';
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className={`flex items-center justify-center h-full text-center ${LIGHT_THEME_COLORS.text.muted}`}>
                <p>キャラクターを選択してください</p>
              </div>
            )}
          </div>
        </div>

        {/* フッター */}
        <div className={`flex justify-end gap-3 mt-6 pt-4 border-t ${LIGHT_THEME_COLORS.border.primary}`}>
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
  );
};