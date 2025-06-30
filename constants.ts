// @ts-nocheck
// 参考コード互換の設定定義

const DEFAULT_WORLD_PROMPT = `- ジャンル: SFファンタジー
- 舞台: 忘れ去られた古代文明の遺跡が点在する、緑豊かな惑星「エデン」。
- 主人公: プレイヤー自身。記憶を一部失っており、自分の過去を探している。`;

const DEFAULT_CHARACTERS = [
    { id: '1', name: '主人公', alias: ['protagonist', 'default', 'プレイヤー'], image: 'https://placehold.co/800x1200/e0e7ff/1e3a8a?text=Protagonist', isProtagonist: true, isDisplayed: false },
    { id: '2', name: 'アキラ', alias: ['akira'], image: 'https://placehold.co/800x1200/dbeafe/1e3a8a?text=Akira', isProtagonist: false, isDisplayed: true }
];

const SYSTEM_PROMPT_TEMPLATE = `あなたは卓越したインタラクティブノベルの語り手（ゲームマスター）です。プレイヤーの行動にリアルタイムで応答し、物語を生成してください。

### 世界観
{worldPrompt}

### 登場人物 (名前と立ち絵のヒント)
{characterList}

### 長期記憶（過去の関連性の高い出来事）
{longTermMemory}

### 短期記憶（直近の会話）
{shortTermMemory}

### マスターからの特別な指示
{forcedPrompt}

### プレイヤーの現在の入力
プレイヤー: 「{playerInput}」

### 出力形式の指示
以上の情報を元に、物語の続きを厳密なJSON形式で出力してください。形式は以下の通りです。
- "speaker": 話者の名前。上記の登場人物リストにある名前を使うこと。
- "text": 生成したセリフや状況説明。
- "event": 何か特別なイベントが発生した場合のフラグ名（例: "found_key", "meet_akira"）。なければnull。

例:
{"speaker": "ナレーター", "text": "目の前には巨大な扉が立ちはだかっている。", "event": null}
`;

const INITIAL_SETTINGS = { 
  geminiApiKey: '', 
  openaiApiKey: '', 
  aiModel: 'gemini-1.5-flash', 
  showCost: true, 
  worldPrompt: DEFAULT_WORLD_PROMPT, 
  characters: DEFAULT_CHARACTERS 
};

const INITIAL_STATE = {
  messages: [{ 
    id: '0', 
    role: 'model', 
    speaker: 'ナレーター', 
    text: 'あなたは、苔むした遺跡の前で目を覚ました。自分が誰で、なぜここにいるのか思い出せない。目の前には、巨大な石造りの扉がある。どうする？', 
    timestamp: new Date().toISOString(),
    event: 'game_start'
  }],
  settings: INITIAL_SETTINGS, 
  memoryVectors: '[]', 
  totalCost: 0, 
  isLoading: false, 
  isMemoryInitializing: false, 
  error: null, 
  lastTriggeredEvent: null, 
  pendingScenarioPrompt: null, 
  unlockedGalleryItems: [
    {
      id: 'initial_cg',
      title: '🌅 物語の始まり',
      description: 'あなたは苔むした遺跡の前で目を覚ました。自分が誰で、なぜここにいるのか思い出せない。',
      imageUrl: 'https://images.unsplash.com/photo-1533134486753-c833f0ed4866?q=80&w=800&h=600&auto=format&fit=crop&text=ancient+ruins+fantasy+misty',
      unlockedAt: new Date().toISOString(),
      eventName: 'game_start',
      speaker: 'ナレーター'
    }
  ],
};

const SHORT_TERM_MEMORY_TURNS = 5;
const EMBEDDING_MODEL = 'text-embedding-3-small';

export {
  DEFAULT_WORLD_PROMPT,
  DEFAULT_CHARACTERS,
  SYSTEM_PROMPT_TEMPLATE,
  INITIAL_SETTINGS,
  INITIAL_STATE,
  SHORT_TERM_MEMORY_TURNS,
  EMBEDDING_MODEL
};