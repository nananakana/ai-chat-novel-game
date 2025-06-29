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

// AI生成関数（拡張モデル対応）
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

  // Gemini API呼び出し（全Geminiモデル対応）
  if (settings.aiModel?.startsWith('gemini') && settings.geminiApiKey) {
    try {
      if (typeof window !== 'undefined' && window.GoogleGenerativeAI) {
        const genAI = new window.GoogleGenerativeAI(settings.geminiApiKey);
        
        // モデル名のマッピング
        const getGeminiModelName = (aiModel) => {
          switch (aiModel) {
            case 'gemini-flash': return 'gemini-1.5-flash';
            case 'gemini-pro': return 'gemini-1.5-pro';
            case 'gemini-ultra': return 'gemini-ultra';
            default: return 'gemini-1.5-flash'; // デフォルト
          }
        };
        
        const modelName = getGeminiModelName(settings.aiModel);
        const model = genAI.getGenerativeModel({ model: modelName });
        
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
          cost: estimateCost(text, settings.aiModel)
        };
      }
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error('Gemini APIでエラーが発生しました: ' + error.message);
    }
  }

  // OpenAI API呼び出し（全GPTモデル対応）
  if (settings.aiModel?.startsWith('gpt') && settings.openaiApiKey) {
    try {
      if (typeof window !== 'undefined' && window.OpenAI) {
        const openai = new window.OpenAI({
          apiKey: settings.openaiApiKey,
          dangerouslyAllowBrowser: true
        });
        
        // モデル名のマッピング
        const getOpenAIModelName = (aiModel) => {
          switch (aiModel) {
            case 'gpt-4o-mini': return 'gpt-4o-mini';
            case 'gpt-4o': return 'gpt-4o';
            case 'gpt-4-turbo': return 'gpt-4-turbo';
            default: return 'gpt-4o-mini'; // デフォルト
          }
        };
        
        const modelName = getOpenAIModelName(settings.aiModel);
        const prompt = createGamePrompt(history, settings);
        const completion = await openai.chat.completions.create({
          model: modelName,
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
          cost: estimateCost(content, settings.aiModel)
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
- 現在場面にいるキャラクターをscene_charactersフィールドに配列形式で必ず報告してください
- キャラクターが誰もいない場合は空のリスト [] を返してください
- 背景を変更する場合は、eventフィールドに "change_background:背景名" を設定してください

### 出力形式
以下のJSON形式で物語の続きを出力してください：
{"speaker": "話者名", "text": "生成したセリフや状況説明", "event": "イベント名またはnull", "scene_characters": ["キャラクター名1", "キャラクター名2"]}

例: {"speaker": "ナレーター", "text": "目の前には巨大な扉が立ちはだかっている。", "event": null, "scene_characters": []}
例: {"speaker": "アキラ", "text": "こんにちは！元気だった？", "event": null, "scene_characters": ["アキラ"]}
例: {"speaker": "ナレーター", "text": "アキラとニックが現れた。", "event": null, "scene_characters": ["アキラ", "ニック"]}`;
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
        event: parsed.event || null,
        scene_characters: parsed.scene_characters || []
      };
    }
  } catch (e) {
    console.warn('JSONパースに失敗、テキストとして処理:', e);
  }
  
  // JSONパースに失敗した場合はプレーンテキストとして扱う
  return {
    speaker: 'ナレーター',
    text: text.trim(),
    event: null,
    scene_characters: []
  };
};

// ギャラリーアイテム生成（イベントCG対応）
const createGalleryItem = (message) => {
  const eventName = message.event;
  const isCharacterEvent = eventName?.startsWith('show_character:') || eventName?.startsWith('hide_character:');
  
  // キャラクターの出入りイベントはギャラリー対象外
  if (isCharacterEvent) return null;
  
  // イベント名からCGのテーマを決定
  const getImageTheme = (event) => {
    const themes = {
      'game_start': 'ancient+ruins+fantasy+misty',
      'found_key': 'golden+key+magical+light',
      'meet_akira': 'anime+character+meeting+fantasy',
      'door_opened': 'ancient+door+opening+light',
      'treasure_found': 'treasure+chest+golden+coins',
      'battle_victory': 'victory+celebration+fantasy',
      'mysterious_voice': 'mysterious+dark+figure+shadow',
      'magic_spell': 'magical+spell+glowing+runes',
      'forest_entrance': 'enchanted+forest+magical+trees',
      'castle_approach': 'fantasy+castle+dramatic+clouds'
    };
    
    return themes[event] || `fantasy+adventure+${encodeURIComponent(event)}`;
  };
  
  const imageTheme = getImageTheme(eventName);
  const imageUrl = `https://images.unsplash.com/photo-1533134486753-c833f0ed4866?q=80&w=800&h=600&auto=format&fit=crop&text=${imageTheme}`;
  
  return {
    id: `${Date.now()}_${eventName}`,
    title: getEventTitle(eventName),
    description: message.text.length > 150 ? message.text.substring(0, 150) + '...' : message.text,
    imageUrl: imageUrl,
    unlockedAt: new Date().toISOString(),
    eventName: eventName,
    speaker: message.speaker
  };
};

// イベントタイトルの生成
const getEventTitle = (eventName) => {
  const titles = {
    'game_start': '🌅 物語の始まり',
    'found_key': '🔑 古い鍵の発見',
    'meet_akira': '👥 アキラとの出会い',
    'door_opened': '🚪 扉の向こう側',
    'treasure_found': '💎 隠された宝物',
    'battle_victory': '⚔️ 勝利の瞬間',
    'mysterious_voice': '👻 謎の声',
    'magic_spell': '✨ 魔法の発動',
    'forest_entrance': '🌲 森への入口',
    'castle_approach': '🏰 城への接近'
  };
  
  return titles[eventName] || `🎭 ${eventName}`;
};

// コスト推定（拡張モデル対応）
const estimateCost = (text, modelType) => {
  const tokenCount = Math.ceil(text.length / 4); // 簡易的なトークン数推定
  
  // Geminiモデルのコスト (USD per 1000 tokens)
  if (modelType?.startsWith('gemini')) {
    switch (modelType) {
      case 'gemini-flash': return tokenCount * 0.000001; // Flash: 非常に安価
      case 'gemini-pro': return tokenCount * 0.000005; // Pro: 中価格
      case 'gemini-ultra': return tokenCount * 0.00002; // Ultra: 高価格
      default: return tokenCount * 0.000001;
    }
  }
  
  // OpenAIモデルのコスト (USD per 1000 tokens)
  if (modelType?.startsWith('gpt')) {
    switch (modelType) {
      case 'gpt-4o-mini': return tokenCount * 0.00015; // Mini: 安価
      case 'gpt-4o': return tokenCount * 0.005; // 4o: 中価格
      case 'gpt-4-turbo': return tokenCount * 0.01; // Turbo: 高価格
      default: return tokenCount * 0.00015;
    }
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
      if (message.event && message.event !== 'change_background') {
        const galleryItem = createGalleryItem(message);
        if (galleryItem) {
          updatedState.galleryItem = galleryItem;
        }
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