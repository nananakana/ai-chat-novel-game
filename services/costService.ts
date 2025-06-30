import { AiModel } from '../types';

export interface CostEntry {
  id: string;
  timestamp: string;
  model: AiModel;
  promptTokens: number;
  responseTokens: number;
  cost: number;
  month: string; // YYYY-MM format
}

export interface MonthlyCost {
  month: string;
  totalCost: number;
  totalRequests: number;
  modelBreakdown: Record<AiModel, { cost: number; requests: number }>;
}

class CostService {
  private readonly COST_STORAGE_KEY = 'aiGameCostHistory';
  private readonly MONTHLY_LIMIT_KEY = 'aiGameMonthlyLimit';
  private readonly DEFAULT_MONTHLY_LIMIT = 50; // USD

  // モデル別の料金設定 (2024年12月時点の料金)
  private readonly PRICING = {
    'gemini-1.5-flash': {
      inputPer1K: 0.075 / 1000000, // $0.075 per 1M tokens
      outputPer1K: 0.30 / 1000000, // $0.30 per 1M tokens
      isTokenBased: true
    },
    'gemini-1.5-pro': {
      inputPer1K: 1.25 / 1000000, // $1.25 per 1M tokens
      outputPer1K: 5.00 / 1000000, // $5.00 per 1M tokens
      isTokenBased: true
    },
    'gemini-2.5-pro': {
      inputPer1K: 2.50 / 1000000, // $2.50 per 1M tokens
      outputPer1K: 10.00 / 1000000, // $10.00 per 1M tokens
      isTokenBased: true
    },
    'gpt-4o-mini': {
      inputPer1K: 0.15 / 1000000, // $0.15 per 1M tokens
      outputPer1K: 0.60 / 1000000, // $0.60 per 1M tokens
      isTokenBased: true
    },
    'gpt-4o': {
      inputPer1K: 5.00 / 1000000, // $5.00 per 1M tokens
      outputPer1K: 15.00 / 1000000, // $15.00 per 1M tokens
      isTokenBased: true
    },
    'gpt-4-turbo': {
      inputPer1K: 10.00 / 1000000, // $10.00 per 1M tokens
      outputPer1K: 30.00 / 1000000, // $30.00 per 1M tokens
      isTokenBased: true
    },
    'gemini-cli': {
      inputPer1K: 0,
      outputPer1K: 0,
      isTokenBased: false
    },
    dummy: {
      inputPer1K: 0,
      outputPer1K: 0,
      isTokenBased: false
    }
  };

  calculateCost(model: AiModel, promptText: string, responseText: string): { cost: number; promptTokens: number; responseTokens: number } {
    const pricing = this.PRICING[model];
    
    if (!pricing) {
      return { cost: 0, promptTokens: 0, responseTokens: 0 };
    }

    let promptTokens: number;
    let responseTokens: number;

    if (pricing.isTokenBased) {
      // トークンベース（ChatGPT）
      promptTokens = Math.ceil(promptText.length / 4); // 概算: 4文字=1トークン
      responseTokens = Math.ceil(responseText.length / 4);
    } else {
      // 文字ベース（Gemini）
      promptTokens = promptText.length;
      responseTokens = responseText.length;
    }

    const inputCost = (promptTokens / 1000) * pricing.inputPer1K;
    const outputCost = (responseTokens / 1000) * pricing.outputPer1K;
    const totalCost = inputCost + outputCost;

    return {
      cost: totalCost,
      promptTokens,
      responseTokens
    };
  }

  recordCost(model: AiModel, promptText: string, responseText: string): CostEntry {
    const { cost, promptTokens, responseTokens } = this.calculateCost(model, promptText, responseText);
    const now = new Date();
    
    const entry: CostEntry = {
      id: `cost_${now.getTime()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: now.toISOString(),
      model,
      promptTokens,
      responseTokens,
      cost,
      month: now.toISOString().slice(0, 7) // YYYY-MM
    };

    this.saveCostEntry(entry);
    return entry;
  }

  private saveCostEntry(entry: CostEntry): void {
    try {
      const existingEntries = this.getCostHistory();
      existingEntries.push(entry);
      
      // 直近6ヶ月のデータのみ保持
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      const cutoffMonth = sixMonthsAgo.toISOString().slice(0, 7);
      
      const filteredEntries = existingEntries.filter(e => e.month >= cutoffMonth);
      
      localStorage.setItem(this.COST_STORAGE_KEY, JSON.stringify(filteredEntries));
    } catch (error) {
      console.error('Failed to save cost entry:', error);
    }
  }

  getCostHistory(): CostEntry[] {
    try {
      const stored = localStorage.getItem(this.COST_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load cost history:', error);
      return [];
    }
  }

  getCurrentMonthCost(): number {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const entries = this.getCostHistory();
    
    return entries
      .filter(entry => entry.month === currentMonth)
      .reduce((sum, entry) => sum + entry.cost, 0);
  }

  getMonthlyCosts(): MonthlyCost[] {
    const entries = this.getCostHistory();
    const monthlyData: Record<string, MonthlyCost> = {};

    entries.forEach(entry => {
      if (!monthlyData[entry.month]) {
        monthlyData[entry.month] = {
          month: entry.month,
          totalCost: 0,
          totalRequests: 0,
          modelBreakdown: {
            'gemini-1.5-flash': { cost: 0, requests: 0 },
            'gemini-1.5-pro': { cost: 0, requests: 0 },
            'gemini-2.5-pro': { cost: 0, requests: 0 },
            'gpt-4o-mini': { cost: 0, requests: 0 },
            'gpt-4o': { cost: 0, requests: 0 },
            'gpt-4-turbo': { cost: 0, requests: 0 },
            'gemini-cli': { cost: 0, requests: 0 },
            dummy: { cost: 0, requests: 0 }
          }
        };
      }

      const monthData = monthlyData[entry.month];
      monthData.totalCost += entry.cost;
      monthData.totalRequests += 1;
      monthData.modelBreakdown[entry.model].cost += entry.cost;
      monthData.modelBreakdown[entry.model].requests += 1;
    });

    return Object.values(monthlyData).sort((a, b) => b.month.localeCompare(a.month));
  }

  getMonthlyLimit(): number {
    try {
      const stored = localStorage.getItem(this.MONTHLY_LIMIT_KEY);
      return stored ? parseFloat(stored) : this.DEFAULT_MONTHLY_LIMIT;
    } catch (error) {
      return this.DEFAULT_MONTHLY_LIMIT;
    }
  }

  setMonthlyLimit(limit: number): void {
    try {
      localStorage.setItem(this.MONTHLY_LIMIT_KEY, limit.toString());
    } catch (error) {
      console.error('Failed to save monthly limit:', error);
    }
  }

  isOverMonthlyLimit(): boolean {
    const currentCost = this.getCurrentMonthCost();
    const limit = this.getMonthlyLimit();
    return currentCost >= limit;
  }

  getMonthlyLimitWarning(): { isWarning: boolean; isOverLimit: boolean; currentCost: number; limit: number } {
    const currentCost = this.getCurrentMonthCost();
    const limit = this.getMonthlyLimit();
    const warningThreshold = limit * 0.8; // 80%で警告

    return {
      isWarning: currentCost >= warningThreshold,
      isOverLimit: currentCost >= limit,
      currentCost,
      limit
    };
  }

  exportToCsv(): string {
    const entries = this.getCostHistory();
    const headers = ['Timestamp', 'Model', 'Prompt Tokens', 'Response Tokens', 'Cost (USD)', 'Month'];
    
    const csvContent = [
      headers.join(','),
      ...entries.map(entry => [
        entry.timestamp,
        entry.model,
        entry.promptTokens,
        entry.responseTokens,
        entry.cost.toFixed(6),
        entry.month
      ].join(','))
    ].join('\n');

    return csvContent;
  }

  downloadCsvReport(): void {
    try {
      const csvContent = this.exportToCsv();
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `ai-game-cost-report-${new Date().toISOString().slice(0, 10)}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to download CSV report:', error);
    }
  }

  clearCostHistory(): void {
    try {
      localStorage.removeItem(this.COST_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear cost history:', error);
    }
  }
}

// シングルトンインスタンス
export const costService = new CostService();