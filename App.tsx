// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useGameLogic } from './hooks/useGameLogic';
import { Header } from './components/Header';
import { MessageWindow } from './components/MessageWindow';
import { InputBar } from './components/InputBar';
import { SettingsPanel } from './components/SettingsPanel';
import { BacklogPanel } from './components/BacklogPanel';
import { GalleryPanel } from './components/GalleryPanel';
import { assetManager } from './services/assetManager';

const App = () => {
  const { state, handleSendMessage, handleRetry, updateSettings, saveGame, loadGame } = useGameLogic();
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [isBacklogOpen, setBacklogOpen] = useState(false);
  const [isGalleryOpen, setGalleryOpen] = useState(false);
  const [isWindowVisible, setWindowVisible] = useState(true);
  const [background, setBackground] = useState('https://images.unsplash.com/photo-1533134486753-c833f0ed4866?q=80&w=2070&auto=format&fit=crop');
  const [characterImage, setCharacterImage] = useState('');

  const lastMessage = state.messages[state.messages.length - 1];

  // 簡化された画像管理
  useEffect(() => {
    if (lastMessage?.role === 'model' && lastMessage.speaker) {
      const img = assetManager.getCharacterImage(lastMessage.speaker, state.settings?.characters || []);
      setCharacterImage(img || '');
    }
  }, [lastMessage, state.settings]);

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
    
    // キャラクターレイヤー
    characterImage && React.createElement('div', { 
      className: 'absolute bottom-0 right-10 h-[90%] w-auto max-w-[40%] transition-opacity duration-500 flex items-end justify-center',
      style: { opacity: characterImage ? 1 : 0 }
    },
      React.createElement('img', { 
        src: characterImage,
        alt: 'Character',
        className: 'h-full object-contain drop-shadow-2xl',
        key: characterImage
      })
    ),
    
    // UIレイヤー
    React.createElement('div', { className: 'absolute inset-0 flex flex-col' },
      React.createElement(Header, { 
        ...state,
        onSettingsClick: () => setSettingsOpen(true),
        onSaveClick: saveGame,
        onLoadClick: loadGame,
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
      onEditCharacters: () => console.log('Character editor'),
      onEditWorld: () => console.log('World editor')
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
    })
  );
};

export default App;