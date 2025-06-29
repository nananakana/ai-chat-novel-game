import { useReducer, useEffect, useCallback } from 'react';
import { GameState, ChatMessage, GameSettings } from '../types';
import { INITIAL_STATE, LONG_TERM_MEMORY_UPDATE_INTERVAL } from '../constants';
import { generateResponse, summarizeHistory } from '../services/aiAdapter';

// Reducerのアクション定義
type Action =
  | { type: 'SEND_MESSAGE_START'; payload: ChatMessage }
  | { type: 'RECEIVE_RESPONSE_SUCCESS'; payload: { message: ChatMessage; cost: number } }
  | { type: 'RECEIVE_RESPONSE_ERROR'; payload: string }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<GameSettings> }
  | { type: 'START_SUMMARIZING' }
  | { type: 'UPDATE_LONG_TERM_MEMORY'; payload: string }
  | { type: 'SAVE_GAME' }
  | { type: 'LOAD_GAME'; payload: GameState }
  | { type: 'CLEAR_ERROR' };

// ゲーム状態を管理するReducer
const gameReducer = (state: GameState, action: Action): GameState => {
  switch (action.type) {
    case 'SEND_MESSAGE_START':
      return { ...state, isLoading: true, error: null, messages: [...state.messages, action.payload] };
    case 'RECEIVE_RESPONSE_SUCCESS':
      return {
        ...state,
        isLoading: false,
        messages: [...state.messages, action.payload.message],
        totalCost: state.totalCost + action.payload.cost,
        error: null,
      };
    case 'RECEIVE_RESPONSE_ERROR':
      return { ...state, isLoading: false, error: action.payload };
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    case 'START_SUMMARIZING':
      return { ...state, isSummarizing: true };
    case 'UPDATE_LONG_TERM_MEMORY':
        return { ...state, isSummarizing: false, longTermMemory: action.payload };
    case 'SAVE_GAME':
      try {
        localStorage.setItem('aiChatNovelGameSave', JSON.stringify(state));
      } catch (e) {
        console.error("セーブに失敗しました:", e);
      }
      return state;
    case 'LOAD_GAME':
      return { ...action.payload, error: null }; // ロード時にエラーをリセット
    case 'CLEAR_ERROR':
        return { ...state, error: null };
    default:
      return state;
  }
};

export const useGameLogic = () => {
  const [state, dispatch] = useReducer(gameReducer, INITIAL_STATE);

  // メッセージ履歴の変更を監視して長期記憶を更新
  useEffect(() => {
    const userMessages = state.messages.filter(m => m.role === 'user');
    if (
      userMessages.length > 0 &&
      userMessages.length % LONG_TERM_MEMORY_UPDATE_INTERVAL === 0 &&
      !state.isLoading && !state.isSummarizing
    ) {
      const updateMemory = async () => {
        if(!state.settings.apiKey) return;
        dispatch({ type: 'START_SUMMARIZING' });
        try {
          const summary = await summarizeHistory(state.messages, state.settings.apiKey);
          dispatch({ type: 'UPDATE_LONG_TERM_MEMORY', payload: summary });
        } catch (e) {
          console.error("Failed to summarize history:", e);
          dispatch({ type: 'UPDATE_LONG_TERM_MEMORY', payload: state.longTermMemory }); // 失敗時は元に戻す
        }
      };
      updateMemory();
    }
  }, [state.messages.length, state.isLoading, state.isSummarizing, state.settings.apiKey, state.longTermMemory, state.messages]);

  // メッセージ送信処理
  const handleSendMessage = useCallback(async (text: string) => {
    if (state.isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text,
      timestamp: new Date().toISOString(),
      speaker: 'プレイヤー',
    };
    dispatch({ type: 'SEND_MESSAGE_START', payload: userMessage });

    try {
      const { message, cost } = await generateResponse(
        [...state.messages, userMessage],
        state.longTermMemory,
        state.settings
      );
      dispatch({ type: 'RECEIVE_RESPONSE_SUCCESS', payload: { message, cost } });
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : '不明なエラーが発生しました。';
      dispatch({ type: 'RECEIVE_RESPONSE_ERROR', payload: errorMessage });
    }
  }, [state.isLoading, state.messages, state.longTermMemory, state.settings]);
  
  const updateSettings = (newSettings: Partial<GameSettings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: newSettings });
  };

  const saveGame = () => {
    dispatch({ type: 'SAVE_GAME' });
    alert('ゲームの状態を保存しました。');
  };

  const loadGame = () => {
    const savedStateJSON = localStorage.getItem('aiChatNovelGameSave');
    if (savedStateJSON) {
      try {
        const savedState: GameState = JSON.parse(savedStateJSON);
        dispatch({ type: 'LOAD_GAME', payload: savedState });
        alert('ゲームの状態をロードしました。');
      } catch (e) {
        alert('セーブデータの読み込みに失敗しました。');
      }
    } else {
      alert('セーブデータが見つかりません。');
    }
  };

  return { state, handleSendMessage, updateSettings, saveGame, loadGame };
};
