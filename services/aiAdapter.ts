import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GameSettings, ChatMessage, AiModel } from '../types';
import { SYSTEM_PROMPT_TEMPLATE, SHORT_TERM_MEMORY_TURNS } from '../constants';

// ダミーAIの応答リスト
const DUMMY_RESPONSES = [
  { speaker: "ナレーター", text: "あたりは静まり返っている。風の音だけが聞こえる。", event: null },
  { speaker: "謎の声", text: "…何者だ…？", event: "voice_heard" },
  { speaker: "ナレーター", text: "足元で何かが光った。調べてみますか？", event: null },
];
let dummyResponseIndex = 0;

const GEMINI_MODEL = 'gemini-2.5-flash-preview-04-17';

// This is a rough estimation and may not reflect the exact billing.
function estimateCost(prompt: string, response: string): number {
    const inputChars = prompt.length;
    const outputChars = response.length;
    const inputCost = (inputChars / 1000) * 0.000105;
    const outputCost = (outputChars / 1000) * 0.000210;
    return inputCost + outputCost;
}

function parseJsonResponse(jsonString: string): any {
    let cleanJsonString = jsonString.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = cleanJsonString.match(fenceRegex);
    if (match && match[2]) {
        cleanJsonString = match[2].trim();
    }

    try {
        return JSON.parse(cleanJsonString);
    } catch (e) {
        console.error("Failed to parse JSON response:", e, "Original string:", jsonString);
        // Return a fallback object to prevent crashing the app
        return {
            speaker: "ナレーター",
            text: "物語が予期せぬ方向に進んだ... (JSONパースエラー)",
            event: "error"
        };
    }
}

// レスポンスを生成するメイン関数
export const generateResponse = async (
    history: ChatMessage[],
    longTermMemory: string,
    settings: GameSettings
  ): Promise<{ message: ChatMessage; cost: number }> => {

    if (settings.aiModel === 'dummy') {
        dummyResponseIndex = (dummyResponseIndex + 1) % DUMMY_RESPONSES.length;
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    message: {
                        id: Date.now().toString(),
                        role: 'model',
                        ...DUMMY_RESPONSES[dummyResponseIndex],
                        timestamp: new Date().toISOString()
                    },
                    cost: 0
                });
            }, 800);
        });
    }

    if (!settings.apiKey) {
        throw new Error("APIキーが設定されていません。設定画面でキーを入力してください。");
    }
    const ai = new GoogleGenAI({ apiKey: settings.apiKey });

    const shortTermMemory = history.slice(-SHORT_TERM_MEMORY_TURNS * 2);
    const shortTermMemoryText = shortTermMemory.map(m => `${m.role === 'user' ? 'プレイヤー' : m.speaker}: ${m.text}`).join('\n');
    const playerInput = history[history.length - 1].text;

    const prompt = SYSTEM_PROMPT_TEMPLATE
        .replace('{longTermMemory}', longTermMemory)
        .replace('{shortTermMemory}', shortTermMemoryText)
        .replace('{playerInput}', playerInput);
    
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            }
        });
        
        const responseText = response.text;
        const parsedResponse = parseJsonResponse(responseText);
        const cost = estimateCost(prompt, responseText);
        
        const newMessage: ChatMessage = {
          id: Date.now().toString(),
          role: 'model',
          speaker: parsedResponse.speaker || 'ナレーター',
          text: parsedResponse.text || '...',
          event: parsedResponse.event || null,
          timestamp: new Date().toISOString(),
        };
        return { message: newMessage, cost };
    } catch(e) {
        console.error("Gemini API call failed:", e);
        throw new Error("AIとの通信に失敗しました。キーやネットワークを確認してください。");
    }
};

// 長期記憶を要約する関数
export const summarizeHistory = async (history: ChatMessage[], apiKey: string): Promise<string> => {
    if (!apiKey) return "APIキーが未設定のため要約できません。";
    const ai = new GoogleGenAI({ apiKey });
    
    const fullHistory = history.map(m => `${m.role === 'user' ? 'プレイヤー' : m.speaker}: ${m.text}`).join('\n');
    const prompt = `以下の会話履歴を、三人称視点の物語として簡潔に要約してください。\n\n${fullHistory}`;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: prompt,
        });
        return response.text;
    } catch(e) {
        console.error("Gemini summarization failed:", e);
        return "履歴の要約中にエラーが発生しました。";
    }
};
