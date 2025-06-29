// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useGameLogic } from './hooks/useGameLogic';
import { Header } from './components/Header';
import { MessageWindow } from './components/MessageWindow';
import { InputBar } from './components/InputBar';
import { SettingsPanel } from './components/SettingsPanel';
import { BacklogPanel } from './components/BacklogPanel';
import { GalleryPanel } from './components/GalleryPanel';
import { WorldEditor } from './components/WorldEditor';
import { CharacterEditor } from './components/CharacterEditor';
import { SaveLoadPanel } from './components/SaveLoadPanel';
import { assetManager } from './services/assetManager';

const App = () => {
  const { state, handleSendMessage, handleRetry, updateSettings, saveGame, loadGame, getSaveList, deleteSave } = useGameLogic();
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [isBacklogOpen, setBacklogOpen] = useState(false);
  const [isGalleryOpen, setGalleryOpen] = useState(false);
  const [isWorldEditorOpen, setWorldEditorOpen] = useState(false);
  const [isCharacterEditorOpen, setCharacterEditorOpen] = useState(false);
  const [isSaveLoadOpen, setSaveLoadOpen] = useState(false);
  const [saveLoadMode, setSaveLoadMode] = useState('save');
  const [isWindowVisible, setWindowVisible] = useState(true);
  const [background, setBackground] = useState('https://images.unsplash.com/photo-1533134486753-c833f0ed4866?q=80&w=2070&auto=format&fit=crop');
  const [visibleCharacters, setVisibleCharacters] = useState([]);
  const [activeCharacters, setActiveCharacters] = useState([]);

  const lastMessage = state.messages[state.messages.length - 1];

  // キャラクター表示ロジックの抽本的見直し
  useEffect(() => {
    if (!state.settings?.characters) return;
    
    // 表示対象キャラクターを取得（isDisplayed=trueかつ主人公以外）
    const displayableCharacters = state.settings.characters.filter(char => 
      char.isDisplayed && !char.isProtagonist && char.image
    );
    
    setVisibleCharacters(displayableCharacters.slice(0, 3)); // 最大3人まで
  }, [state.settings?.characters]);

  // アクティブキャラクター管理（eventベース）
  useEffect(() => {
    if (!lastMessage?.event) return;
    
    const event = lastMessage.event;
    
    if (event.startsWith('show_character:')) {
      const characterName = event.replace('show_character:', '').trim();
      const character = state.settings?.characters?.find(c => 
        c.name === characterName || c.alias?.includes(characterName)
      );
      
      if (character && !character.isProtagonist) {
        setActiveCharacters(prev => {
          const updated = prev.filter(c => c.id !== character.id);
          return [...updated, character].slice(-3); // 最大3人まで
        });
      }
    } else if (event.startsWith('hide_character:')) {
      const characterName = event.replace('hide_character:', '').trim();
      setActiveCharacters(prev => 
        prev.filter(c => c.name !== characterName && !c.alias?.includes(characterName))
      );
    } else if (event.startsWith('change_background:')) {
      const backgroundDescription = event.replace('change_background:', '').trim();
      // 背景変更の簡易実装（実際の画像URLの代わりに説明ベースの背景を設定）
      const newBackgroundUrl = `https://images.unsplash.com/photo-1533134486753-c833f0ed4866?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&text=${encodeURIComponent(backgroundDescription)}`;
      setBackground(newBackgroundUrl);
    }
  }, [lastMessage?.event, state.settings?.characters]);

  return React.createElement('div', { 
    className: 'relative w-screen h-screen overflow-hidden bg-slate-50 text-slate-800 select-none' 
  },
    // 背景レイヤー
    React.createElement('div', { 
      className: 'absolute inset-0 bg-cover bg-center transition-all duration-1000',
      style: { backgroundImage: `url(${background})` },
      key: background
    }),
    React.createElement('div', { className: 'absolute inset-0 bg-white bg-opacity-10' }),
    
    // キャラクターレイヤー（動的ポジション対応）
    activeCharacters.length > 0 && React.createElement('div', {
      className: 'absolute bottom-0 left-0 right-0 h-[90%] flex items-end justify-center transition-all duration-500'
    },
      activeCharacters.map((character, index) => {
        const totalChars = activeCharacters.length;
        let positionClass = '';
        
        if (totalChars === 1) {
          positionClass = 'justify-center';
        } else if (totalChars === 2) {
          positionClass = index === 0 ? 'justify-start pl-10' : 'justify-end pr-10';
        } else if (totalChars === 3) {
          if (index === 0) positionClass = 'justify-start pl-10';
          else if (index === 1) positionClass = 'justify-center';
          else positionClass = 'justify-end pr-10';
        }
        
        return React.createElement('div', {
          key: character.id,
          className: `flex-1 h-full flex items-end ${positionClass} transition-all duration-500`
        },
          React.createElement('img', {
            src: character.image,
            alt: character.name,
            className: 'h-full max-w-[300px] object-contain drop-shadow-2xl transition-opacity duration-500',
            onError: (e) => {
              console.warn('Character image failed to load:', character.image);
              e.target.style.display = 'none';
            }
          })
        );
      })
    ),
    
    // UIレイヤー
    React.createElement('div', { className: 'absolute inset-0 flex flex-col' },
      React.createElement(Header, { 
        ...state,
        onSettingsClick: () => setSettingsOpen(true),
        onSaveClick: () => {
          setSaveLoadMode('save');
          setSaveLoadOpen(true);
        },
        onLoadClick: () => {
          setSaveLoadMode('load');
          setSaveLoadOpen(true);
        },
        onBacklogClick: () => setBacklogOpen(true),
        onGalleryClick: () => setGalleryOpen(true)
      }),
      React.createElement('main', { className: 'flex-grow' }),
      React.createElement('footer', { className: 'relative z-10' },
        // ウィンドウ表示切替ボタン
        React.createElement('button', {
          onClick: () => setWindowVisible(!isWindowVisible),
          className: 'absolute -top-10 right-1/2 translate-x-1/2 sm:right-10 sm:translate-x-0 p-2 bg-white/80 backdrop-blur-md rounded-full text-slate-600 hover:bg-white',
          title: 'ウィンドウ表示切替'
        }, isWindowVisible ? '👁️‍🗨️' : '👁️'),
        React.createElement(MessageWindow, { 
          message: lastMessage,
          isLoading: state.isLoading,
          onRetry: handleRetry,
          isVisible: isWindowVisible
        }),
        React.createElement(InputBar, { 
          onSend: handleSendMessage,
          isLoading: state.isLoading,
          isWindowVisible
        })
      )
    ),
    
    // モーダルパネル群
    React.createElement(SettingsPanel, { 
      isOpen: isSettingsOpen,
      onClose: () => setSettingsOpen(false),
      settings: state.settings,
      onSettingsChange: updateSettings,
      onEditCharacters: () => setCharacterEditorOpen(true),
      onEditWorld: () => setWorldEditorOpen(true)
    }),
    React.createElement(BacklogPanel, { 
      isOpen: isBacklogOpen,
      onClose: () => setBacklogOpen(false),
      messages: state.messages
    }),
    React.createElement(GalleryPanel, { 
      isOpen: isGalleryOpen,
      onClose: () => setGalleryOpen(false),
      items: state.unlockedGalleryItems || []
    }),
    React.createElement(WorldEditor, {
      isOpen: isWorldEditorOpen,
      onClose: () => setWorldEditorOpen(false),
      settings: state.settings,
      onSettingsChange: updateSettings
    }),
    React.createElement(CharacterEditor, {
      isOpen: isCharacterEditorOpen,
      onClose: () => setCharacterEditorOpen(false),
      settings: state.settings,
      onSettingsChange: updateSettings
    }),
    React.createElement(SaveLoadPanel, {
      isOpen: isSaveLoadOpen,
      onClose: () => setSaveLoadOpen(false),
      mode: saveLoadMode,
      onSave: (slotNumber) => {
        saveGame(slotNumber);
        setSaveLoadOpen(false);
      },
      onLoad: (slotNumber) => {
        loadGame(slotNumber);
        setSaveLoadOpen(false);
      },
      getSaveList,
      onDeleteSave: deleteSave
    })
  );
};

export default App;