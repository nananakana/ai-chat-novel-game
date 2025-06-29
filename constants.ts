import { GameState, GameSettings } from './types';

// AIへの指示（システムプロンプト）のテンプレート
export const SYSTEM_PROMPT_TEMPLATE = `あなたは卓越したインタラクティブノベルの語り手（ゲームマスター）です。プレイヤーの行動にリアルタイムで応答し、物語を生成してください。

### 世界観
- ジャンル: SFファンタジー
- 舞台: 忘れ去られた古代文明の遺跡が点在する、緑豊かな惑星「エデン」。
- 主人公: プレイヤー自身。記憶を一部失っており、自分の過去を探している。

### 長期記憶（これまでの物語の要約）
{longTermMemory}

### 短期記憶（直近の会話）
{shortTermMemory}

### マスターからの特別な指示
{forcedPrompt}

### プレイヤーの現在の入力
プレイヤー: 「{playerInput}」

### 出力形式の指示
以上の情報を元に、物語の続きをJSON形式で出力してください。形式は以下の通りです。
- "speaker": 話者の名前（例: "ナレーター", "アキラ", "謎の声"）。不明な場合は"???"とする。
- "text": 生成したセリフや状況説明。
- "event": 何か特別なイベントが発生した場合のフラグ名（例: "found_key", "enemy_appeared", "enter_cave"）。なければnull。

例:
{"speaker": "ナレーター", "text": "目の前には巨大な扉が立ちはだかっている。", "event": null}
`;

// 各種設定の初期値
export const INITIAL_SETTINGS: GameSettings = {
  geminiApiKey: '',
  openaiApiKey: '',
  aiModel: 'gemini',
  showCost: true,
};

export const INITIAL_STATE: GameState = {
  messages: [
    { 
      id: '0', 
      role: 'model', 
      speaker: 'ナレーター',
      text: 'あなたは、苔むした遺跡の前で目を覚ました。自分が誰で、なぜここにいるのか思い出せない。目の前には、巨大な石造りの扉がある。どうする？', 
      timestamp: new Date().toISOString() 
    }
  ],
  settings: INITIAL_SETTINGS,
  longTermMemory: 'まだ物語は始まっていません。',
  totalCost: 0,
  isLoading: false,
  isSummarizing: false,
  isMemoryInitializing: false,
  error: null,
  lastTriggeredEvent: null,
  pendingScenarioPrompt: null,
};

export const SHORT_TERM_MEMORY_TURNS = 5; // 短期記憶として保持する対話の数
export const LONG_TERM_MEMORY_UPDATE_INTERVAL = 5; // 長期記憶を更新する間隔（ユーザーの発言回数）
