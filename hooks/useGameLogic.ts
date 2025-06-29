// @ts-nocheck
import { useReducer, useEffect, useCallback } from 'react';
import { INITIAL_STATE } from '../constants';

// 簡素化されたReducer
const gameReducer = (state, action) => {
  switch (action.type) {
    case 'SEND_MESSAGE_START':
      return { ...state, isLoading: true, error: null, messages: [...state.messages, action.payload] };
    case 'RECEIVE_RESPONSE_SUCCESS':
      return {
        ...state,
        isLoading: false,
        messages: [...state.messages, action.payload.message],
        totalCost: state.totalCost + (action.payload.cost || 0),
        error: null,
      };
    case 'RECEIVE_RESPONSE_ERROR':
      return { ...state, isLoading: false, error: action.payload };
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
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

// 簡易AI生成関数
const generateResponse = async (history, settings) => {
  // ダミーモードまたはAPIキー未設定の場合
  if (settings.aiModel === 'dummy' || (!settings.geminiApiKey && !settings.openaiApiKey)) {
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

  // 実際のAI呼び出しは後で実装
  const dummy = DUMMY_RESPONSES[0];
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

export const useGameLogic = () => {
  const [state, dispatch] = useReducer(gameReducer, INITIAL_STATE);

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
      dispatch({ type: 'RECEIVE_RESPONSE_SUCCESS', payload: { message, cost } });
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

  const saveGame = () => {
    dispatch({ type: 'SAVE_GAME' });
    alert('ゲームを保存しました。');
  };

  const loadGame = () => {
    const savedData = localStorage.getItem('aiChatNovelGameSave');
    if (savedData) {
      try {
        dispatch({ type: 'LOAD_GAME', payload: JSON.parse(savedData) });
        alert('ゲームをロードしました。');
      } catch (e) {
        alert('セーブデータの読み込みに失敗しました。');
      }
    } else {
      alert('セーブデータが見つかりません。');
    }
  };

  return { 
    state, 
    handleSendMessage, 
    handleRetry, 
    updateSettings, 
    saveGame, 
    loadGame 
  };
};