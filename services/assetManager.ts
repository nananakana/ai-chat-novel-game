export interface AssetDefinition {
  backgrounds: Record<string, string>;
  characters: Record<string, string>;
  sounds?: Record<string, string>;
}

export interface AssetResolverResult {
  background?: string;
  character?: string;
  sound?: string;
}

class AssetManager {
  private assets: AssetDefinition = {
    backgrounds: {
      default: "https://placehold.co/1920x1080/1a1a2e/ffffff?text=Ruins+Entrance",
      cave: "https://placehold.co/1920x1080/2d2d3a/ffffff?text=Dark+Cave",
      cave_light: "https://placehold.co/1920x1080/3a3a4a/ffffff?text=Cave+with+Light",
      ruins: "https://placehold.co/1920x1080/1a1a2e/ffffff?text=Ancient+Ruins",
      forest: "https://placehold.co/1920x1080/2d5016/ffffff?text=Forest",
      laboratory: "https://placehold.co/1920x1080/3a3a5a/ffffff?text=Laboratory",
    },
    characters: {
      default: "https://placehold.co/800x1200/ffffff/1a1a2e?text=Protagonist",
      akira: "https://placehold.co/800x1200/ffffff/1a1a2e?text=Akira",
      scientist: "https://placehold.co/800x1200/ffffff/1a1a2e?text=Scientist",
      mysterious_figure: "https://placehold.co/800x1200/ffffff/1a1a2e?text=Mystery",
    },
    sounds: {
      cave_ambience: "/sounds/cave_ambience.mp3",
      footsteps: "/sounds/footsteps.mp3",
      door_open: "/sounds/door_open.mp3",
      discovery: "/sounds/discovery.mp3",
    }
  };

  // 背景画像を取得
  getBackground(key: string): string | null {
    return this.assets.backgrounds[key] || null;
  }

  // キャラクター画像を取得
  getCharacter(key: string): string | null {
    if (key === '' || key === 'none') return '';
    return this.assets.characters[key] || null;
  }

  // サウンドファイルを取得
  getSound(key: string): string | null {
    return this.assets.sounds?.[key] || null;
  }

  // イベント名に基づいてアセットを解決
  resolveAssetsByEvent(eventName: string): AssetResolverResult {
    const result: AssetResolverResult = {};

    // イベント名からアセットをマッピング
    switch (eventName) {
      case 'enter_cave':
        result.background = this.getBackground('cave');
        result.sound = this.getSound('cave_ambience');
        break;
      case 'meet_akira':
        result.character = this.getCharacter('akira');
        break;
      case 'find_ancient_device':
        result.sound = this.getSound('discovery');
        break;
      case 'memory_flashback':
        result.character = this.getCharacter(''); // 立ち絵非表示
        break;
      case 'exit_cave':
        result.background = this.getBackground('default');
        break;
      default:
        // 未知のイベントの場合は空のresultを返す
        break;
    }

    return result;
  }

  // 話者名に基づいてキャラクター画像を解決
  resolveCharacterBySpeaker(speakerName: string): string | null {
    const speaker = speakerName?.toLowerCase();
    
    switch (speaker) {
      case 'akira':
        return this.getCharacter('akira');
      case 'ナレーター':
      case '謎の声':
      case '???':
        return ''; // 立ち絵非表示
      case 'scientist':
      case '科学者':
        return this.getCharacter('scientist');
      case 'mysterious_figure':
      case '謎の人物':
        return this.getCharacter('mysterious_figure');
      default:
        return null; // 変更なし
    }
  }

  // 参考コード互換用 - キャラクター画像取得
  getCharacterImage(speaker: string, characters: any[]): string | null {
    if (!speaker) return null;
    
    // charactersが配列の場合の処理
    if (Array.isArray(characters)) {
      const char = characters.find(c => 
        c.name === speaker || 
        c.alias?.includes(speaker?.toLowerCase()) ||
        c.aliases?.includes(speaker?.toLowerCase())
      );
      return char ? char.image || char.imageUrl : null;
    }
    
    // フォールバック - 直接的な解決
    return this.resolveCharacterBySpeaker(speaker);
  }

  // 参考コード互換用 - 主人公取得
  getProtagonist(characters: any[]): any | undefined {
    if (!Array.isArray(characters)) return undefined;
    return characters.find(c => c.isProtagonist);
  }

  // 新しいアセットを動的に追加
  addBackground(key: string, url: string): void {
    this.assets.backgrounds[key] = url;
  }

  addCharacter(key: string, url: string): void {
    this.assets.characters[key] = url;
  }

  addSound(key: string, url: string): void {
    if (!this.assets.sounds) this.assets.sounds = {};
    this.assets.sounds[key] = url;
  }

  // 全アセット定義を取得（デバッグ用）
  getAllAssets(): AssetDefinition {
    return { ...this.assets };
  }

  // デフォルト背景を取得
  getDefaultBackground(): string {
    return this.assets.backgrounds.default;
  }

  // デフォルトキャラクターを取得
  getDefaultCharacter(): string {
    return this.assets.characters.default;
  }

  // アセット存在チェック
  hasBackground(key: string): boolean {
    return key in this.assets.backgrounds;
  }

  hasCharacter(key: string): boolean {
    return key in this.assets.characters;
  }

  hasSound(key: string): boolean {
    return this.assets.sounds ? key in this.assets.sounds : false;
  }
}

// シングルトンインスタンス
export const assetManager = new AssetManager();