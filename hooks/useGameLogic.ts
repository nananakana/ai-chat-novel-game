// @ts-nocheck
import { useReducer, useEffect, useCallback } from 'react';
import { INITIAL_STATE } from '../constants';

// 簡素化されたReducer
const gameReducer = (state, action) => {
  switch (action.type) {
    case 'SEND_MESSAGE_START':
      return { ...state, isLoading: true, error: null, messages: [...state.messages, action.payload] };
    case 'RECEIVE_RESPONSE_SUCCESS':
      const newState = {
        ...state,
        isLoading: false,
        messages: [...state.messages, action.payload.message],
        totalCost: state.totalCost + (action.payload.cost || 0),
        error: null,
      };
      
      // ギャラリーアイテムがある場合は追加
      if (action.payload.galleryItem) {
        newState.unlockedGalleryItems = [
          ...(state.unlockedGalleryItems || []),
          action.payload.galleryItem
        ];
      }
      
      return newState;
    case 'RECEIVE_RESPONSE_ERROR':
      return { ...state, isLoading: false, error: action.payload };
    case 'UPDATE_SETTINGS':
      const newSettings = { ...state.settings, ...action.payload };
      // 設定変更をローカルストレージに保存
      try {
        localStorage.setItem('aiChatNovelGameSettings', JSON.stringify(newSettings));
      } catch (e) {
        console.warn('設定の保存に失敗:', e);
      }
      return { ...state, settings: newSettings };
    case 'RETRY_LAST_RESPONSE':
      const filteredMessages = state.messages.slice(0, -1);
      return { ...state, messages: filteredMessages, isLoading: true, error: null };
    case 'SAVE_GAME':
      try {
        localStorage.setItem('aiChatNovelGameSave', JSON.stringify(state));
      } catch (e) {
        console.error("セーブに失敗しました:", e);
      }
      return state;
    case 'LOAD_GAME':
      return { ...action.payload, error: null };
    default:
      return state;
  }
};

// ダミーレスポンス
const DUMMY_RESPONSES = [
  { speaker: "ナレーター", text: "あたりは静まり返っている。", event: null },
  { speaker: "謎の声", text: "…何者だ…？", event: "voice_heard" }
];

// AI生成関数（Gemini/OpenAI対応）
const generateResponse = async (history, settings) => {
  // ダミーモードの場合
  if (settings.aiModel === 'dummy') {
    const dummy = DUMMY_RESPONSES[Date.now() % DUMMY_RESPONSES.length];
    return new Promise(resolve => 
      setTimeout(() => resolve({ 
        message: { 
          id: Date.now().toString(), 
          role: 'model', 
          ...dummy, 
          timestamp: new Date().toISOString() 
        }, 
        cost: 0 
      }), 800)
    );
  }

  // Gemini API呼び出し
  if (settings.aiModel === 'gemini' && settings.geminiApiKey) {
    try {
      if (typeof window !== 'undefined' && window.GoogleGenerativeAI) {
        const genAI = new window.GoogleGenerativeAI(settings.geminiApiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        const prompt = createGamePrompt(history, settings);
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        // JSONレスポンスをパース
        const parsedResponse = parseAIResponse(text);
        
        return {
          message: {
            id: Date.now().toString(),
            role: 'model',
            ...parsedResponse,
            timestamp: new Date().toISOString()
          },
          cost: estimateCost(text, 'gemini')
        };
      }
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error('Gemini APIでエラーが発生しました: ' + error.message);
    }
  }

  // OpenAI API呼び出し
  if (settings.aiModel === 'chatgpt' && settings.openaiApiKey) {
    try {
      if (typeof window !== 'undefined' && window.OpenAI) {
        const openai = new window.OpenAI({
          apiKey: settings.openaiApiKey,
          dangerouslyAllowBrowser: true
        });
        
        const prompt = createGamePrompt(history, settings);
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "system", content: prompt }],
          max_tokens: 500,
          temperature: 0.7
        });
        
        const content = completion.choices[0].message.content;
        const parsedResponse = parseAIResponse(content);
        
        return {
          message: {
            id: Date.now().toString(),
            role: 'model',
            ...parsedResponse,
            timestamp: new Date().toISOString()
          },
          cost: estimateCost(content, 'openai')
        };
      }
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('OpenAI APIでエラーが発生しました: ' + error.message);
    }
  }

  // APIキー未設定またはライブラリ未読み込みの場合はダミーレスポンス
  const dummy = DUMMY_RESPONSES[Date.now() % DUMMY_RESPONSES.length];
  return { 
    message: { 
      id: Date.now().toString(), 
      role: 'model', 
      ...dummy, 
      timestamp: new Date().toISOString() 
    }, 
    cost: 0 
  };
};

// ゲーム用プロンプト生成
const createGamePrompt = (history, settings) => {
  const recentMessages = history.slice(-10); // 直近10メッセージ
  const conversationText = recentMessages.map(m => `${m.speaker}: ${m.text}`).join('\n');
  
  // 登場キャラクター一覧を作成
  const characterList = settings.characters 
    ? settings.characters.map(char => `- ${char.name} (別名: ${char.alias?.join(', ') || 'なし'})`).join('\n')
    : '- 主人公\n- ナレーター';
  
  // カスタムプロンプトテンプレートが設定されている場合はそれを使用
  if (settings.systemPromptTemplate) {
    return settings.systemPromptTemplate
      .replace('{worldPrompt}', settings.worldPrompt || 'シンプルなファンタジー世界')
      .replace('{characterList}', characterList)
      .replace('{conversationText}', conversationText);
  }
  
  // デフォルトプロンプト
  return `あなたは卓越したインタラクティブノベルの語り手（ゲームマスター）です。プレイヤーの行動にリアルタイムで応答し、物語を生成してください。

### 世界観
${settings.worldPrompt || 'シンプルなファンタジー世界'}

### 登場キャラクター
${characterList}

### 直近の会話
${conversationText}

### 特別な指示
- キャラクターを登場させる場合は、eventフィールドに "show_character:キャラクター名" を設定してください
- キャラクターを退場させる場合は、eventフィールドに "hide_character:キャラクター名" を設定してください
- 背景を変更する場合は、eventフィールドに "change_background:背景の説明" を設定してください

### 出力形式
以下のJSON形式で物語の続きを出力してください：
{"speaker": "話者名", "text": "生成したセリフや状況説明", "event": "イベント名またはnull"}

例: {"speaker": "ナレーター", "text": "目の前には巨大な扉が立ちはだかっている。", "event": null}
例: {"speaker": "アキラ", "text": "こんにちは！元気だった？", "event": "show_character:アキラ"}`;
};

// AIレスポンスパーサー
const parseAIResponse = (text) => {
  try {
    // JSONの抽出を試みる
    const jsonMatch = text.match(/\{.*?\}/s);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        speaker: parsed.speaker || 'ナレーター',
        text: parsed.text || text,
        event: parsed.event || null
      };
    }
  } catch (e) {
    console.warn('JSONパースに失敗、テキストとして処理:', e);
  }
  
  // JSONパースに失敗した場合はプレーンテキストとして扱う
  return {
    speaker: 'ナレーター',
    text: text.trim(),
    event: null
  };
};

// コスト推定
const estimateCost = (text, model) => {
  const tokenCount = Math.ceil(text.length / 4); // 簡易的なトークン数推定
  
  if (model === 'gemini') {
    return tokenCount * 0.000001; // Gemini 1.5 Flashのコスト目安
  } else if (model === 'openai') {
    return tokenCount * 0.00001; // GPT-4o-miniのコスト目安
  }
  
  return 0;
};

export const useGameLogic = () => {
  // 初期状態に保存された設定をロード
  const getInitialState = () => {
    try {
      const savedSettings = localStorage.getItem('aiChatNovelGameSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        return {
          ...INITIAL_STATE,
          settings: { ...INITIAL_STATE.settings, ...settings }
        };
      }
    } catch (e) {
      console.warn('設定の読み込みに失敗:', e);
    }
    return INITIAL_STATE;
  };

  const [state, dispatch] = useReducer(gameReducer, getInitialState());

  const handleSendMessage = useCallback(async (text) => {
    if (state.isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      text,
      timestamp: new Date().toISOString(),
      speaker: 'プレイヤー',
    };
    
    dispatch({ type: 'SEND_MESSAGE_START', payload: userMessage });

    try {
      const { message, cost } = await generateResponse([...state.messages, userMessage], state.settings);
      
      // イベントが発生した場合のギャラリー処理
      let updatedState = { message, cost };
      if (message.event) {
        const galleryItem = {
          id: Date.now().toString(),
          title: `イベント: ${message.event}`,
          description: message.text.substring(0, 100) + '...',
          imageUrl: `https://placehold.co/400x300/e2e8f0/64748b?text=${encodeURIComponent(message.event)}`,
          unlockedAt: new Date().toISOString(),
          eventName: message.event
        };
        
        // ゲーム状態にギャラリーアイテムを追加
        updatedState.galleryItem = galleryItem;
      }
      
      dispatch({ type: 'RECEIVE_RESPONSE_SUCCESS', payload: updatedState });
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : '不明なエラーが発生しました。';
      dispatch({ type: 'RECEIVE_RESPONSE_ERROR', payload: errorMessage });
    }
  }, [state.isLoading, state.messages, state.settings]);

  const handleRetry = useCallback(async () => {
    if (state.isLoading) return;
    
    const lastMessage = state.messages[state.messages.length - 1];
    if (!lastMessage || lastMessage.role !== 'model') return;

    dispatch({ type: 'RETRY_LAST_RESPONSE' });

    try {
      const messagesWithoutLast = state.messages.slice(0, -1);
      const { message, cost } = await generateResponse(messagesWithoutLast, state.settings);
      dispatch({ type: 'RECEIVE_RESPONSE_SUCCESS', payload: { message, cost } });
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : '不明なエラーが発生しました。';
      dispatch({ type: 'RECEIVE_RESPONSE_ERROR', payload: errorMessage });
    }
  }, [state.isLoading, state.messages, state.settings]);

  const updateSettings = (newSettings) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: newSettings });
  };

  const saveGame = (slotNumber = 0) => {
    const saveData = {
      ...state,
      savedAt: new Date().toISOString(),
      slotNumber
    };
    const saveKey = `aiChatNovelGameSave_slot${slotNumber}`;
    
    try {
      localStorage.setItem(saveKey, JSON.stringify(saveData));
      
      // セーブスロット一覧を更新
      const existingSaves = JSON.parse(localStorage.getItem('aiChatNovelGameSaveList') || '{}');
      existingSaves[slotNumber] = {
        savedAt: saveData.savedAt,
        messageCount: state.messages.length,
        lastMessage: state.messages[state.messages.length - 1]?.text?.substring(0, 50) + '...'
      };
      localStorage.setItem('aiChatNovelGameSaveList', JSON.stringify(existingSaves));
      
      alert(`スロット${slotNumber + 1}にゲームを保存しました。`);
    } catch (e) {
      alert('セーブに失敗しました。');
    }
  };

  const loadGame = (slotNumber = 0) => {
    const saveKey = `aiChatNovelGameSave_slot${slotNumber}`;
    const savedData = localStorage.getItem(saveKey);
    
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        dispatch({ type: 'LOAD_GAME', payload: parsedData });
        alert(`スロット${slotNumber + 1}からゲームをロードしました。`);
      } catch (e) {
        alert('セーブデータの読み込みに失敗しました。');
      }
    } else {
      alert(`スロット${slotNumber + 1}にセーブデータが見つかりません。`);
    }
  };

  const getSaveList = () => {
    try {
      return JSON.parse(localStorage.getItem('aiChatNovelGameSaveList') || '{}');
    } catch (e) {
      return {};
    }
  };

  const deleteSave = (slotNumber) => {
    const saveKey = `aiChatNovelGameSave_slot${slotNumber}`;
    localStorage.removeItem(saveKey);
    
    const existingSaves = JSON.parse(localStorage.getItem('aiChatNovelGameSaveList') || '{}');
    delete existingSaves[slotNumber];
    localStorage.setItem('aiChatNovelGameSaveList', JSON.stringify(existingSaves));
    
    alert(`スロット${slotNumber + 1}のセーブデータを削除しました。`);
  };

  return { 
    state, 
    handleSendMessage, 
    handleRetry, 
    updateSettings, 
    saveGame, 
    loadGame,
    getSaveList,
    deleteSave
  };
};