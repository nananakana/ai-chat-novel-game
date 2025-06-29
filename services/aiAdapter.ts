import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import OpenAI from 'openai';
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
const CHATGPT_MODEL = 'gpt-4o-mini';

// ChatGPT用コスト計算（概算）
function estimateChatGptCost(prompt: string, response: string): number {
    const inputTokens = Math.ceil(prompt.length / 4);
    const outputTokens = Math.ceil(response.length / 4);
    const inputCost = (inputTokens / 1000) * 0.00015;
    const outputCost = (outputTokens / 1000) * 0.0006;
    return inputCost + outputCost;
}

// Gemini用コスト計算（概算）
function estimateGeminiCost(prompt: string, response: string): number {
    const inputChars = prompt.length;
    const outputChars = response.length;
    const inputCost = (inputChars / 1000) * 0.000105;
    const outputCost = (outputChars / 1000) * 0.000210;
    return inputCost + outputCost;
}

// Gemini CLI実行関数
async function callGeminiCli(prompt: string): Promise<string> {
    return new Promise((resolve, reject) => {
        // 30秒のタイムアウト
        const timeout = setTimeout(() => {
            reject(new Error('Gemini CLI execution timeout'));
        }, 30000);

        try {
            // ブラウザ環境ではsubprocessを直接実行できないため、
            // 実際の実装では別途サーバーサイドのAPIエンドポイントが必要
            clearTimeout(timeout);
            reject(new Error('Gemini CLI is not supported in browser environment. Server-side implementation required.'));
        } catch (error) {
            clearTimeout(timeout);
            reject(error);
        }
    });
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

    const shortTermMemory = history.slice(-SHORT_TERM_MEMORY_TURNS * 2);
    const shortTermMemoryText = shortTermMemory.map(m => `${m.role === 'user' ? 'プレイヤー' : m.speaker}: ${m.text}`).join('\n');
    const playerInput = history[history.length - 1].text;

    const prompt = SYSTEM_PROMPT_TEMPLATE
        .replace('{longTermMemory}', longTermMemory)
        .replace('{shortTermMemory}', shortTermMemoryText)
        .replace('{playerInput}', playerInput);

    try {
        let responseText: string;
        let cost: number;

        switch (settings.aiModel) {
            case 'gemini':
                if (!settings.geminiApiKey) {
                    throw new Error("Gemini APIキーが設定されていません。設定画面でキーを入力してください。");
                }
                const geminiAi = new GoogleGenAI({ apiKey: settings.geminiApiKey });
                const geminiResponse: GenerateContentResponse = await geminiAi.models.generateContent({
                    model: GEMINI_MODEL,
                    contents: prompt,
                    config: {
                        responseMimeType: "application/json",
                    }
                });
                responseText = geminiResponse.text;
                cost = estimateGeminiCost(prompt, responseText);
                break;

            case 'chatgpt':
                if (!settings.openaiApiKey) {
                    throw new Error("OpenAI APIキーが設定されていません。設定画面でキーを入力してください。");
                }
                const openai = new OpenAI({ 
                    apiKey: settings.openaiApiKey,
                    dangerouslyAllowBrowser: true 
                });
                const chatResponse = await openai.chat.completions.create({
                    model: CHATGPT_MODEL,
                    messages: [
                        { role: 'system', content: prompt }
                    ],
                    response_format: { type: 'json_object' },
                    temperature: 0.8,
                });
                responseText = chatResponse.choices[0]?.message?.content || '{}';
                cost = estimateChatGptCost(prompt, responseText);
                break;

            case 'gemini-cli':
                responseText = await callGeminiCli(prompt);
                cost = 0; // CLI使用時はコスト無料と仮定
                break;

            default:
                throw new Error(`未サポートのAIモデル: ${settings.aiModel}`);
        }

        const parsedResponse = parseJsonResponse(responseText);
        
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
        console.error(`${settings.aiModel} API call failed:`, e);
        throw new Error(`AIとの通信に失敗しました。キーやネットワークを確認してください。(${settings.aiModel})`);
    }
};

// 長期記憶を要約する関数
export const summarizeHistory = async (history: ChatMessage[], settings: GameSettings): Promise<string> => {
    const fullHistory = history.map(m => `${m.role === 'user' ? 'プレイヤー' : m.speaker}: ${m.text}`).join('\n');
    const prompt = `以下の会話履歴を、三人称視点の物語として簡潔に要約してください。\n\n${fullHistory}`;

    try {
        let responseText: string;

        switch (settings.aiModel) {
            case 'gemini':
                if (!settings.geminiApiKey) return "Gemini APIキーが未設定のため要約できません。";
                const geminiAi = new GoogleGenAI({ apiKey: settings.geminiApiKey });
                const geminiResponse: GenerateContentResponse = await geminiAi.models.generateContent({
                    model: GEMINI_MODEL,
                    contents: prompt,
                });
                responseText = geminiResponse.text;
                break;

            case 'chatgpt':
                if (!settings.openaiApiKey) return "OpenAI APIキーが未設定のため要約できません。";
                const openai = new OpenAI({ 
                    apiKey: settings.openaiApiKey,
                    dangerouslyAllowBrowser: true 
                });
                const chatResponse = await openai.chat.completions.create({
                    model: CHATGPT_MODEL,
                    messages: [
                        { role: 'system', content: prompt }
                    ],
                    temperature: 0.7,
                });
                responseText = chatResponse.choices[0]?.message?.content || '要約に失敗しました。';
                break;

            case 'gemini-cli':
                responseText = await callGeminiCli(prompt);
                break;

            case 'dummy':
                return "ダミーモードでは要約機能は利用できません。";

            default:
                return "サポートされていないAIモデルです。";
        }

        return responseText;
    } catch(e) {
        console.error(`${settings.aiModel} summarization failed:`, e);
        return "履歴の要約中にエラーが発生しました。";
    }
};
