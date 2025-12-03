/**
 * 🧊 ChatKit 訊息生成
 * Message Generation with ChatKit
 */

import { getChatKit, isChatKitConfigured } from './client';
import { Character, getSystemPrompt } from '../tone-router/router';
import { WindPhase } from '../wind-engine';

export interface UserState {
    windPhase: WindPhase;
    conversationHistory?: Array<{
        role: 'user' | 'assistant';
        content: string;
    }>;
}

export interface GenerateMessageParams {
    character: Character;
    userState: UserState;
    prompt: string;
    model?: string;
}

/**
 * 生成男神回應訊息
 */
export async function generateWindMessage({
    character,
    userState,
    prompt,
    model = 'gpt-4.1-mini',
}: GenerateMessageParams): Promise<string> {
    // 檢查 ChatKit 是否已設定
    if (!isChatKitConfigured()) {
        console.warn('ChatKit is not configured. Returning mock response.');
        return `[開發模式] ${character} 收到訊息：${prompt}`;
    }

    const chatkit = getChatKit();
    const systemPrompt = getSystemPrompt(character);

    const messages = [
        {
            role: 'system' as const,
            content: `${systemPrompt}

當前心風階段：${userState.windPhase}
請根據這個階段調整你的回應風格。`,
        },
        // 加入對話歷史（如果有）
        ...(userState.conversationHistory || []),
        {
            role: 'user' as const,
            content: prompt,
        },
    ];

    try {
        const response = await chatkit.messages.create({
            model,
            messages,
            stream: false,
        });

        return response.output_text || '抱歉，我現在有點忙，等等再回你喔';
    } catch (error) {
        console.error('ChatKit generation error:', error);
        throw error;
    }
}

/**
 * 生成帶延遲的回應
 */
export async function generateDelayedResponse({
    character,
    userState,
    prompt,
    delayScenario,
}: GenerateMessageParams & {
    delayScenario: string;
}): Promise<{
    immediateMessage: string;
    delayedMessage: string;
    delayMinutes: number;
}> {
    // 先生成立即回應（告知會延遲）
    const immediatePrompt = `使用者說：「${prompt}」
  
請簡短回應表示你現在${delayScenario}，會稍後回覆。保持角色個性。`;

    const immediateMessage = await generateWindMessage({
        character,
        userState,
        prompt: immediatePrompt,
    });

    // 生成延遲後的完整回應
    const delayedMessage = await generateWindMessage({
        character,
        userState,
        prompt,
    });

    // 根據情境決定延遲時間
    const delayMinutes = getDelayForScenario(delayScenario);

    return {
        immediateMessage,
        delayedMessage,
        delayMinutes,
    };
}

/**
 * 根據情境取得延遲時間
 */
function getDelayForScenario(scenario: string): number {
    const delays: Record<string, number> = {
        meeting: 15,
        driving: 10,
        elevator: 3,
        shower: 20,
        workout: 30,
    };

    return delays[scenario] || 5;
}
