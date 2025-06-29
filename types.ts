export type AiModel = 'gemini' | 'chatgpt' | 'gemini-cli' | 'dummy';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string;
  timestamp: string;
  cost?: number;
  speaker?: string; 
  event?: string | null;
}

export interface GameSettings {
  geminiApiKey: string;
  openaiApiKey: string;
  aiModel: AiModel;
  showCost: boolean;
}

// エディタ関連の型定義
export interface CustomCharacter {
  id: string;
  name: string;
  aliases: string[];  // エイリアス（カンマ区切りで入力）
  imageUrl: string;
  isProtagonist?: boolean;  // 主人公フラグ
}

export interface CustomWorldSetting {
  title: string;
  genre: string;
  setting: string;
  mainCharacter: string;
  customPrompt?: string;  // 追加のカスタムプロンプト
}

export interface GameState {
  messages: ChatMessage[];
  settings: GameSettings;
  longTermMemory: string;
  totalCost: number;
  isLoading: boolean;
  isSummarizing: boolean;
  isMemoryInitializing: boolean;
  error: string | null;
  lastTriggeredEvent: string | null;
  pendingScenarioPrompt: string | null;
  // エディタ機能用の状態
  customWorldSetting?: CustomWorldSetting;
  customCharacters: CustomCharacter[];
  unlockedGalleryItems: GalleryItem[];
}

// ギャラリー関連の型定義
export interface GalleryItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  eventName: string;
  unlockedAt: string;  // ISO timestamp
}
