import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import OpenAI from 'openai';
import { GameSettings, ChatMessage, AiModel } from '../types';
import { SYSTEM_PROMPT_TEMPLATE, SHORT_TERM_MEMORY_TURNS } from '../constants';
import { memoryService } from './memoryService';
import { costService } from './costService';

// ダミーAIの応答リスト
const DUMMY_RESPONSES = [
  { speaker: "ナレーター", text: "あたりは静まり返っている。風の音だけが聞こえる。", event: null },
  { speaker: "謎の声", text: "…何者だ…？", event: "voice_heard" },
  { speaker: "ナレーター", text: "足元で何かが光った。調べてみますか？", event: null },
];
let dummyResponseIndex = 0;

const GEMINI_MODEL = 'gemini-2.5-flash-preview-04-17';
const CHATGPT_MODEL = 'gpt-4o-mini';


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

    // ベクトル検索による長期記憶の取得
    let vectorSearchMemory = '';
    try {
        const searchResults = await memoryService.searchMemories(playerInput, 3);
        if (searchResults.length > 0) {
            vectorSearchMemory = '過去の関連する記憶:\n' + 
                searchResults.map((result, index) => 
                    `${index + 1}. ${result.text} (類似度: ${(result.similarity * 100).toFixed(1)}%)`
                ).join('\n');
        }
    } catch (error) {
        console.warn('Vector search failed, using text-based memory only:', error);
    }

    // 従来の要約ベースの長期記憶とベクトル検索結果を統合
    const combinedLongTermMemory = [longTermMemory, vectorSearchMemory]
        .filter(memory => memory.trim() !== '')
        .join('\n\n');

    const prompt = SYSTEM_PROMPT_TEMPLATE
        .replace('{longTermMemory}', combinedLongTermMemory)
        .replace('{shortTermMemory}', shortTermMemoryText)
        .replace('{playerInput}', playerInput);

    // 月次上限チェック
    const limitWarning = costService.getMonthlyLimitWarning();
    if (limitWarning.isOverLimit && settings.aiModel !== 'dummy') {
        console.warn(`Monthly cost limit exceeded (${limitWarning.currentCost.toFixed(4)}/${limitWarning.limit} USD), switching to dummy mode`);
        // 自動的にダミーモードに切り替え
        const dummyIndex = (Date.now() % DUMMY_RESPONSES.length);
        const dummyResponse = DUMMY_RESPONSES[dummyIndex];
        
        const newMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'model',
            speaker: dummyResponse.speaker,
            text: `${dummyResponse.text}\n\n※ 月次コスト上限に達したため、ダミーモードで動作しています。`,
            event: dummyResponse.event,
            timestamp: new Date().toISOString(),
        };
        return { message: newMessage, cost: 0 };
    }

    try {
        let responseText: string;

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
                break;

            case 'gemini-cli':
                responseText = await callGeminiCli(prompt);
                break;

            default:
                throw new Error(`未サポートのAIモデル: ${settings.aiModel}`);
        }

        const parsedResponse = parseJsonResponse(responseText);
        
        // コスト計算と記録
        const costEntry = costService.recordCost(settings.aiModel, prompt, responseText);
        
        const newMessage: ChatMessage = {
          id: Date.now().toString(),
          role: 'model',
          speaker: parsedResponse.speaker || 'ナレーター',
          text: parsedResponse.text || '...',
          event: parsedResponse.event || null,
          timestamp: new Date().toISOString(),
        };
        return { message: newMessage, cost: costEntry.cost };

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
