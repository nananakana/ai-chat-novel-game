export type AiModel = 'gemini' | 'dummy';

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
  apiKey: string;
  aiModel: AiModel;
  showCost: boolean;
}

export interface GameState {
  messages: ChatMessage[];
  settings: GameSettings;
  longTermMemory: string;
  totalCost: number;
  isLoading: boolean;
  isSummarizing: boolean;
  error: string | null;
}
