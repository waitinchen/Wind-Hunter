/**
 * 🧊 ChatKit 客戶端
 * OpenAI API Integration
 * 
 * 使用 OpenAI API 生成對話回應
 */

import OpenAI from 'openai';

// 環境變數檢查
const OPENAI_API_KEY = process.env.CHATKIT_API_KEY || process.env.OPENAI_API_KEY || '';

if (!OPENAI_API_KEY) {
    console.warn('Warning: OPENAI_API_KEY or CHATKIT_API_KEY not configured');
}

// OpenAI 客戶端
const openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
});

// ChatKit 介面定義
interface ChatKitMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

interface GenerateMessageParams {
    systemPrompt: string;
    userMessage: string;
    conversationHistory?: ChatKitMessage[];
    model?: string;
}

/**
 * 生成 AI 回應
 */
export async function generateWindMessage(params: GenerateMessageParams): Promise<string> {
    const {
        systemPrompt,
        userMessage,
        conversationHistory = [],
        model = 'gpt-4-turbo-preview',
    } = params;

    try {
        const messages: ChatKitMessage[] = [
            { role: 'system', content: systemPrompt },
            ...conversationHistory,
            { role: 'user', content: userMessage },
        ];

        const response = await openai.chat.completions.create({
            model,
            messages: messages as any, // OpenAI's ChatCompletionMessageParam type is compatible
            temperature: 0.8,
            max_tokens: 200, // 限制回應長度以控制 TTS 成本
        });

        return response.choices[0]?.message?.content || '抱歉，我現在有點忙，等等再回你。';
    } catch (error) {
        console.error('OpenAI API error:', error);
        throw new Error('Failed to generate response');
    }
}

/**
 * 檢查 API 是否已設定
 */
export function isOpenAIConfigured(): boolean {
    return !!OPENAI_API_KEY;
}

export default { generateWindMessage, isOpenAIConfigured };
