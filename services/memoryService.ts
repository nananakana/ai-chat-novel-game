import OpenAI from 'openai';
import { ChatMessage, GameSettings } from '../types';

export interface MemoryVector {
  id: string;
  turnId: string;
  text: string;
  embedding: number[];
  timestamp: string;
}

export interface MemorySearchResult {
  text: string;
  similarity: number;
  turnId: string;
}

class MemoryService {
  private openai: OpenAI | null = null;
  private isInitialized = false;

  async initialize(settings: GameSettings): Promise<void> {
    if (this.isInitialized) return;

    try {
      // OpenAI Embeddingクライアントの初期化
      if (settings.openaiApiKey) {
        this.openai = new OpenAI({
          apiKey: settings.openaiApiKey,
          dangerouslyAllowBrowser: true
        });
      }

      this.isInitialized = true;
      console.log('Memory service initialized with localStorage backend');
    } catch (error) {
      console.warn('Memory service initialization failed:', error);
    }
  }

  async createEmbedding(text: string): Promise<number[]> {
    if (!this.openai) {
      throw new Error('OpenAI API key is required for embedding generation');
    }

    try {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
        encoding_format: 'float',
      });

      return response.data[0].embedding;
    } catch (error) {
      console.error('Failed to create embedding:', error);
      throw new Error('Embedding generation failed');
    }
  }

  async saveMemory(message: ChatMessage, userInput?: string): Promise<void> {
    if (!this.isInitialized) {
      console.warn('Memory service not initialized, skipping save');
      return;
    }

    try {
      // ユーザー入力とAI応答を組み合わせてコンテキストを作成
      const contextText = userInput 
        ? `プレイヤー: ${userInput}\n${message.speaker}: ${message.text}`
        : `${message.speaker}: ${message.text}`;

      const embedding = await this.createEmbedding(contextText);

      const memoryVector: MemoryVector = {
        id: `memory_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        turnId: message.id,
        text: contextText,
        embedding,
        timestamp: message.timestamp
      };

      // ローカルストレージに保存
      this.saveToLocalStorage(memoryVector);
    } catch (error) {
      console.error('Failed to save memory:', error);
    }
  }

  private saveToLocalStorage(memory: MemoryVector): void {
    try {
      const existingMemories = this.getMemoriesFromLocalStorage();
      existingMemories.push(memory);
      
      // 最新の100件のみ保持（メモリ制限対策）
      const trimmedMemories = existingMemories.slice(-100);
      localStorage.setItem('gameMemories', JSON.stringify(trimmedMemories));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }

  private getMemoriesFromLocalStorage(): MemoryVector[] {
    try {
      const stored = localStorage.getItem('gameMemories');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      return [];
    }
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  async searchMemories(query: string, topK: number = 3): Promise<MemorySearchResult[]> {
    if (!this.isInitialized) {
      console.warn('Memory service not initialized, returning empty results');
      return [];
    }

    try {
      const queryEmbedding = await this.createEmbedding(query);

      // ローカルストレージから検索
      return this.searchFromLocalStorage(queryEmbedding, topK);
    } catch (error) {
      console.error('Failed to search memories:', error);
      return [];
    }
  }

  private searchFromLocalStorage(queryEmbedding: number[], topK: number): MemorySearchResult[] {
    const memories = this.getMemoriesFromLocalStorage();
    
    const similarities = memories.map(memory => ({
      text: memory.text,
      similarity: this.cosineSimilarity(queryEmbedding, memory.embedding),
      turnId: memory.turnId
    }));

    // 類似度順にソートして上位topK件を返す
    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK)
      .filter(result => result.similarity > 0.1); // 閾値以下は除外
  }

  async clearMemories(): Promise<void> {
    try {
      localStorage.removeItem('gameMemories');
    } catch (error) {
      console.error('Failed to clear memories:', error);
    }
  }

  // セーブ/ロード用のメソッド
  async exportMemories(): Promise<MemoryVector[]> {
    // ローカルストレージから記憶をエクスポート
    return this.getMemoriesFromLocalStorage();
  }

  async importMemories(memories: MemoryVector[]): Promise<void> {
    try {
      localStorage.setItem('gameMemories', JSON.stringify(memories));
    } catch (error) {
      console.error('Failed to import memories:', error);
    }
  }
}

// シングルトンインスタンス
export const memoryService = new MemoryService();