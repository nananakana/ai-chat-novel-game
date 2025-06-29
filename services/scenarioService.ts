export interface ScenarioCheckpoint {
  event: string;
  description: string;
  forced_prompt: string;
  background?: string;
  character?: string;
  sound?: string;
}

export interface ScenarioData {
  checkpoints: ScenarioCheckpoint[];
}

class ScenarioService {
  private scenarios: ScenarioData | null = null;
  private isLoaded = false;

  async loadScenarios(): Promise<void> {
    if (this.isLoaded) return;

    try {
      const response = await fetch('/scenarios/main_scenario.json');
      if (!response.ok) {
        throw new Error(`Failed to load scenarios: ${response.status}`);
      }
      
      this.scenarios = await response.json();
      this.isLoaded = true;
      console.log('Scenarios loaded successfully:', this.scenarios);
    } catch (error) {
      console.error('Failed to load scenario data:', error);
      // フォールバック: 空のシナリオデータを設定
      this.scenarios = { checkpoints: [] };
      this.isLoaded = true;
    }
  }

  async getCheckpoint(eventName: string): Promise<ScenarioCheckpoint | null> {
    await this.loadScenarios();
    
    if (!this.scenarios || !this.scenarios.checkpoints) {
      return null;
    }

    const checkpoint = this.scenarios.checkpoints.find(cp => cp.event === eventName);
    return checkpoint || null;
  }

  async getAllCheckpoints(): Promise<ScenarioCheckpoint[]> {
    await this.loadScenarios();
    return this.scenarios?.checkpoints || [];
  }

  async isCheckpointEvent(eventName: string): Promise<boolean> {
    const checkpoint = await this.getCheckpoint(eventName);
    return checkpoint !== null;
  }

  // シナリオの強制プロンプトを取得
  async getForcedPrompt(eventName: string): Promise<string | null> {
    const checkpoint = await this.getCheckpoint(eventName);
    return checkpoint?.forced_prompt || null;
  }

  // シナリオに定義された背景画像を取得
  async getBackground(eventName: string): Promise<string | null> {
    const checkpoint = await this.getCheckpoint(eventName);
    return checkpoint?.background || null;
  }

  // シナリオに定義されたキャラクター画像を取得
  async getCharacter(eventName: string): Promise<string | null> {
    const checkpoint = await this.getCheckpoint(eventName);
    return checkpoint?.character || null;
  }

  // シナリオに定義されたサウンドを取得
  async getSound(eventName: string): Promise<string | null> {
    const checkpoint = await this.getCheckpoint(eventName);
    return checkpoint?.sound || null;
  }

  // デバッグ用: 全シナリオデータの取得
  async getScenarioData(): Promise<ScenarioData | null> {
    await this.loadScenarios();
    return this.scenarios;
  }

  // シナリオの再読み込み（開発時用）
  async reloadScenarios(): Promise<void> {
    this.isLoaded = false;
    this.scenarios = null;
    await this.loadScenarios();
  }
}

// シングルトンインスタンス
export const scenarioService = new ScenarioService();