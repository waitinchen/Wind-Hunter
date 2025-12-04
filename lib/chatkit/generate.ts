/**
 * 🧊 對話生成輔助函數
 * Message Generation Helper
 */

import { generateWindMessage } from './client';
import { Character, getSystemPrompt } from '../tone-router/router';
import { WindPhase } from '../wind-engine';

export interface GenerateDelayedResponseParams {
    character: Character;
    windPhase: WindPhase;
    delayMinutes: number;
    scenario: string;
}

/**
 * 生成延遲回應訊息
 */
export async function generateDelayedResponse(
    params: GenerateDelayedResponseParams
): Promise<string> {
    const { character, delayMinutes, scenario } = params;
    const systemPrompt = getSystemPrompt(character);

    const userMessage = `使用者等了 ${delayMinutes} 分鐘，情境是：${scenario}。請生成一個自然的回應訊息。`;

    return await generateWindMessage({
        systemPrompt,
        userMessage,
    });
}

export { generateWindMessage };
