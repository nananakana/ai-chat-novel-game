import { GameState, GameSettings, CustomWorldSetting, CustomCharacter } from './types';

// システムプロンプト生成関数
export const generateSystemPrompt = (
  longTermMemory: string,
  shortTermMemory: string,
  forcedPrompt: string,
  playerInput: string,
  customWorldSetting?: CustomWorldSetting,
  customCharacters?: CustomCharacter[]
) => {
  // カスタム世界観の生成
  const worldSection = customWorldSetting 
    ? `### 世界観
- ジャンル: ${customWorldSetting.genre}
- 舞台: ${customWorldSetting.setting}
- 主人公: ${customWorldSetting.mainCharacter}
${customWorldSetting.customPrompt ? `- 追加設定: ${customWorldSetting.customPrompt}` : ''}`
    : `### 世界観
- ジャンル: SFファンタジー
- 舞台: 忘れ去られた古代文明の遺跡が点在する、緑豊かな惑星「エデン」。
- 主人公: プレイヤー自身。記憶を一部失っており、自分の過去を探している。`;

  // カスタムキャラクター情報の生成
  const charactersSection = customCharacters && customCharacters.length > 0
    ? `\n### 登場キャラクター
${customCharacters.map(char => 
  `- ${char.name}${char.aliases.length > 0 ? ` (別名: ${char.aliases.join(', ')})` : ''}${char.isProtagonist ? ' [主人公]' : ''}`
).join('\n')}`
    : '';

  return `あなたは卓越したインタラクティブノベルの語り手（ゲームマスター）です。プレイヤーの行動にリアルタイムで応答し、物語を生成してください。

${worldSection}${charactersSection}

### 長期記憶（これまでの物語の要約）
${longTermMemory}

### 短期記憶（直近の会話）
${shortTermMemory}

### マスターからの特別な指示
${forcedPrompt}

### プレイヤーの現在の入力
プレイヤー: 「${playerInput}」

### 出力形式の指示
以上の情報を元に、物語の続きをJSON形式で出力してください。形式は以下の通りです。
- "speaker": 話者の名前（例: "ナレーター", "アキラ", "謎の声"）。不明な場合は"???"とする。
- "text": 生成したセリフや状況説明。
- "event": 何か特別なイベントが発生した場合のフラグ名（例: "found_key", "enemy_appeared", "enter_cave"）。なければnull。

例:
{"speaker": "ナレーター", "text": "目の前には巨大な扉が立ちはだかっている。", "event": null}
`;
};

// 後方互換性のための従来のテンプレート（レガシー用）
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
  // エディタ機能の初期値
  customWorldSetting: {
    title: "失われた記憶の探求",
    genre: "SFファンタジー",
    setting: "忘れ去られた古代文明の遺跡が点在する、緑豊かな惑星「エデン」。",
    mainCharacter: "記憶を一部失っており、自分の過去を探している冒険者。",
  },
  customCharacters: [
    {
      id: 'protagonist',
      name: '主人公',
      aliases: ['プレイヤー', '冒険者', '君'],
      imageUrl: 'https://placehold.co/800x1200/ffffff/1a1a2e?text=Protagonist',
      isProtagonist: true,
    },
    {
      id: 'akira',
      name: 'アキラ',
      aliases: ['akira', 'アキラ'],
      imageUrl: 'https://placehold.co/800x1200/ffffff/1a1a2e?text=Akira',
    },
  ],
  galleryItems: [],
};

export const SHORT_TERM_MEMORY_TURNS = 5; // 短期記憶として保持する対話の数
export const LONG_TERM_MEMORY_UPDATE_INTERVAL = 5; // 長期記憶を更新する間隔（ユーザーの発言回数）

// ライトテーマカラーパレット
export const LIGHT_THEME_COLORS = {
  // 背景色
  background: {
    primary: 'bg-slate-50',      // メイン背景
    secondary: 'bg-sky-50',      // セカンダリ背景
    panel: 'bg-white',           // パネル背景
    overlay: 'bg-black bg-opacity-20', // オーバーレイ
  },
  // テキスト色
  text: {
    primary: 'text-slate-800',   // メインテキスト
    secondary: 'text-slate-700', // サブテキスト
    muted: 'text-slate-600',     // ミュートテキスト
    light: 'text-slate-500',     // ライトテキスト
    white: 'text-white',         // 白テキスト
  },
  // ボーダー色
  border: {
    primary: 'border-slate-200', // メインボーダー
    secondary: 'border-slate-300', // セカンダリボーダー
    accent: 'border-sky-200',    // アクセントボーダー
  },
  // ボタン色
  button: {
    primary: {
      bg: 'bg-sky-500',
      hover: 'hover:bg-sky-600',
      text: 'text-white',
    },
    secondary: {
      bg: 'bg-slate-200',
      hover: 'hover:bg-slate-300',
      text: 'text-slate-800',
    },
    icon: {
      text: 'text-slate-600',
      hover: 'hover:bg-slate-200',
    },
    danger: {
      bg: 'bg-red-500',
      hover: 'hover:bg-red-600',
      text: 'text-white',
    },
    warning: {
      bg: 'bg-yellow-500',
      hover: 'hover:bg-yellow-600',
      text: 'text-white',
    },
    success: {
      bg: 'bg-green-500',
      hover: 'hover:bg-green-600',
      text: 'text-white',
    },
  },
  // 状態色
  status: {
    error: 'bg-red-100 text-red-800 border-red-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    success: 'bg-green-100 text-green-800 border-green-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200',
  },
};
