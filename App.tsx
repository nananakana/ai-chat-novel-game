import React, { useState, useEffect } from 'react';
import { useGameLogic } from './hooks/useGameLogic';
import { Header } from './components/Header';
import { MessageWindow } from './components/MessageWindow';
import { InputBar } from './components/InputBar';
import { SettingsPanel } from './components/SettingsPanel';

// 画像アセットの定義
const IMAGE_ASSETS = {
  backgrounds: {
    default: "https://placehold.co/1920x1080/1a1a2e/ffffff?text=Ruins+Entrance",
    cave: "https://placehold.co/1920x1080/2d2d3a/ffffff?text=Dark+Cave",
  },
  characters: {
    default: "https://placehold.co/800x1200/ffffff/1a1a2e?text=Protagonist",
    akira: "https://placehold.co/800x1200/ffffff/1a1a2e?text=Akira",
  }
};

export default function App() {
  const { state, handleSendMessage, updateSettings, saveGame, loadGame } = useGameLogic();
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [background, setBackground] = useState(IMAGE_ASSETS.backgrounds.default);
  const [characterImage, setCharacterImage] = useState(IMAGE_ASSETS.characters.default);

  // 表示する最新のメッセージを取得
  const lastMessage = state.messages[state.messages.length - 1];

  // メッセージの更新を監視して画像を変更
  useEffect(() => {
    if (lastMessage?.role === 'model') {
      // イベントに応じた背景変更
      if (lastMessage.event === 'enter_cave') {
        setBackground(IMAGE_ASSETS.backgrounds.cave);
      } else if (lastMessage.event) {
        // You can add more event-based background changes here
      }

      // 話者に応じたキャラクター表示
      switch(lastMessage.speaker?.toLowerCase()){
        case 'akira':
            setCharacterImage(IMAGE_ASSETS.characters.akira);
            break;
        case 'ナレーター':
        case '謎の声':
        case '???':
             setCharacterImage(''); // 立ち絵を非表示
             break;
        default:
             // Keep the current character or set to default if needed
             // setCharacterImage(IMAGE_ASSETS.characters.default);
             break;
      }
    }
  }, [lastMessage]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gray-900 text-white select-none font-sans">
      {/* 背景レイヤー */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
        style={{ backgroundImage: `url(${background})` }}
        key={background} // keyの変更でCSS Transitionをトリガー
      ></div>
      <div className="absolute inset-0 bg-black bg-opacity-20"></div>

      {/* キャラクターレイヤー */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-5/6 w-1/2 flex items-end justify-center">
         <img 
            src={characterImage}
            alt="" 
            className="h-full object-contain drop-shadow-lg transition-opacity duration-500"
            style={{ opacity: characterImage ? 1 : 0 }}
            key={characterImage}
          />
      </div>
      
      {/* UIレイヤー */}
      <div className="absolute inset-0 flex flex-col">
        <Header 
          totalCost={state.totalCost} 
          showCost={state.settings.showCost}
          onSettingsClick={() => setSettingsOpen(true)}
          onSaveClick={saveGame}
          onLoadClick={loadGame}
          isSummarizing={state.isSummarizing}
          isMemoryInitializing={state.isMemoryInitializing}
          error={state.error}
        />
        
        <main className="flex-grow"></main> {/* 上部の空間 */}

        {/* 下部UIエリア */}
        <footer className="relative z-10">
            <div className="h-64 mx-auto max-w-4xl bg-black bg-opacity-75 border-2 border-gray-700 rounded-t-lg backdrop-blur-sm">
                <MessageWindow message={lastMessage} isLoading={state.isLoading} />
            </div>
            <div className="mx-auto max-w-4xl">
                 <InputBar onSend={handleSendMessage} isLoading={state.isLoading} />
            </div>
        </footer>
      </div>

      {/* 設定パネル */}
      <SettingsPanel 
        isOpen={isSettingsOpen} 
        onClose={() => setSettingsOpen(false)} 
        settings={state.settings}
        onSettingsChange={updateSettings}
      />
    </div>
  );
}
