/**
 * 🌬️ 心風算法引擎
 * Wind Phase Engine
 * 
 * 根據使用者的情緒狀態判定當前的心風階段
 */

export interface UserEmotion {
  stress: number;      // 壓力值 (0-1)
  playful: number;     // 玩心值 (0-1)
  warmth: number;      // 溫暖值 (0-1)
  calm: number;        // 平靜值 (0-1)
}

export enum WindPhase {
  WARM = 1,    // 暖風 - 溫景
  CALM = 2,    // 靜風 - 寒川
  WILD = 3,    // 亂風 - 野黎
}

/**
 * 計算當前的心風階段
 * @param userEmotion 使用者情緒狀態
 * @returns WindPhase 心風階段
 */
export function computeWindPhase(userEmotion: UserEmotion): WindPhase {
  // 高壓力 → 靜風（寒川）
  if (userEmotion.stress > 0.7) {
    return WindPhase.CALM;
  }
  
  // 高玩心 → 亂風（野黎）
  if (userEmotion.playful > 0.6) {
    return WindPhase.WILD;
  }
  
  // 預設 → 暖風（溫景）
  return WindPhase.WARM;
}

/**
 * 分析對話內容推測情緒
 * TODO: 未來可接入 Gemini / OpenAI Emotion API
 */
export function analyzeEmotionFromText(text: string): UserEmotion {
  // 簡單的關鍵字分析（未來可用 AI）
  const stressKeywords = ['累', '壓力', '煩', '忙', '疲憊'];
  const playfulKeywords = ['哈', '笑', '好玩', '有趣', '開心'];
  
  const stress = stressKeywords.some(kw => text.includes(kw)) ? 0.8 : 0.3;
  const playful = playfulKeywords.some(kw => text.includes(kw)) ? 0.7 : 0.3;
  
  return {
    stress,
    playful,
    warmth: 0.5,
    calm: 0.5,
  };
}

/**
 * 取得心風階段的描述
 */
export function getWindPhaseDescription(phase: WindPhase): string {
  switch (phase) {
    case WindPhase.WARM:
      return '暖風 - 溫暖包容的陪伴';
    case WindPhase.CALM:
      return '靜風 - 沉穩安定的支持';
    case WindPhase.WILD:
      return '亂風 - 活潑有趣的互動';
  }
}
