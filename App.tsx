import React, { useState, useEffect } from 'react';
import { useGameLogic } from './hooks/useGameLogic';
import { Header } from './components/Header';
import { MessageWindow } from './components/MessageWindow';
import { InputBar } from './components/InputBar';
import { SettingsPanel } from './components/SettingsPanel';
import { BacklogPanel } from './components/BacklogPanel';
import { scenarioService } from './services/scenarioService';
import { assetManager } from './services/assetManager';
import { LIGHT_THEME_COLORS } from './constants';


export default function App() {
  const { state, handleSendMessage, handleRetry, updateSettings, saveGame, loadGame } = useGameLogic();
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [isBacklogOpen, setBacklogOpen] = useState(false);
  const [background, setBackground] = useState(assetManager.getDefaultBackground());
  const [characterImage, setCharacterImage] = useState(assetManager.getDefaultCharacter());

  // 表示する最新のメッセージを取得
  const lastMessage = state.messages[state.messages.length - 1];

  // メッセージの更新を監視して画像を変更（シナリオ連動）
  useEffect(() => {
    const handleImageChange = async () => {
      if (lastMessage?.role === 'model' && lastMessage.event) {
        const eventName = lastMessage.event;
        
        // シナリオサービスから画像情報を取得
        const scenarioBackground = await scenarioService.getBackground(eventName);
        const scenarioCharacter = await scenarioService.getCharacter(eventName);
        
        // シナリオ定義に従って背景を変更またはassetManagerのイベントベース切り替え
        if (scenarioBackground && assetManager.hasBackground(scenarioBackground)) {
          const backgroundUrl = assetManager.getBackground(scenarioBackground);
          if (backgroundUrl) setBackground(backgroundUrl);
        } else {
          // assetManagerのイベント解決機能を使用
          const eventAssets = assetManager.resolveAssetsByEvent(eventName);
          if (eventAssets.background) {
            setBackground(eventAssets.background);
          }
        }
        
        // シナリオ定義に従ってキャラクターを変更またはassetManagerのイベントベース切り替え
        if (scenarioCharacter !== null) {
          if (scenarioCharacter === '' || scenarioCharacter === 'none') {
            setCharacterImage(''); // 立ち絵を非表示
          } else if (assetManager.hasCharacter(scenarioCharacter)) {
            const characterUrl = assetManager.getCharacter(scenarioCharacter);
            if (characterUrl) setCharacterImage(characterUrl);
          }
        } else {
          // assetManagerのイベント解決機能を使用
          const eventAssets = assetManager.resolveAssetsByEvent(eventName);
          if (eventAssets.character !== undefined) {
            setCharacterImage(eventAssets.character);
          }
        }
      }
      
      // 話者に応じたキャラクター表示（assetManagerの話者解決機能を使用）
      if (lastMessage?.role === 'model' && !lastMessage.event) {
        const speakerCharacter = assetManager.resolveCharacterBySpeaker(lastMessage.speaker || '');
        if (speakerCharacter !== null) {
          setCharacterImage(speakerCharacter);
        }
      }
    };

    handleImageChange();
  }, [lastMessage]);

  return (
    <div className={`relative w-screen h-screen overflow-hidden ${LIGHT_THEME_COLORS.background.primary} ${LIGHT_THEME_COLORS.text.primary} select-none font-sans`}>
      {/* 背景レイヤー */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
        style={{ backgroundImage: `url(${background})` }}
        key={background} // keyの変更でCSS Transitionをトリガー
      ></div>
      <div className={`absolute inset-0 ${LIGHT_THEME_COLORS.background.overlay}`}></div>

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
          onBacklogClick={() => setBacklogOpen(true)}
          isSummarizing={state.isSummarizing}
          isMemoryInitializing={state.isMemoryInitializing}
          error={state.error}
        />
        
        <main className="flex-grow"></main> {/* 上部の空間 */}

        {/* 下部UIエリア */}
        <footer className="relative z-10">
            <div className={`h-64 mx-auto max-w-4xl ${LIGHT_THEME_COLORS.background.panel} bg-opacity-90 border-2 ${LIGHT_THEME_COLORS.border.primary} rounded-t-lg backdrop-blur-sm shadow-lg`}>
                <MessageWindow message={lastMessage} isLoading={state.isLoading} onRetry={handleRetry} />
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

      {/* バックログパネル */}
      <BacklogPanel 
        isOpen={isBacklogOpen}
        onClose={() => setBacklogOpen(false)}
        messages={state.messages}
      />
    </div>
  );
}
