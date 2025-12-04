/**
 * 🔊 ElevenLabs 語音生成客戶端
 * ElevenLabs v3 Voice API Integration
 */

import { ElevenLabsClient } from 'elevenlabs';

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || '';

if (!ELEVENLABS_API_KEY) {
    console.warn('Warning: ELEVENLABS_API_KEY not configured');
}

// ElevenLabs 客戶端
const elevenlabs = new ElevenLabsClient({
    apiKey: ELEVENLABS_API_KEY,
});

export interface GenerateVoiceParams {
    text: string;
    voiceId: string;
    modelId?: string;
}

/**
 * 生成語音
 * @returns Audio buffer (ArrayBuffer)
 */
export async function generateVoice(params: GenerateVoiceParams): Promise<ArrayBuffer> {
    const { text, voiceId, modelId = 'eleven_multilingual_v2' } = params;

    try {
        const audio = await elevenlabs.generate({
            voice: voiceId,
            text,
            model_id: modelId,
        });

        // 將 audio stream 轉換為 ArrayBuffer
        const chunks: Uint8Array[] = [];
        for await (const chunk of audio) {
            chunks.push(chunk);
        }

        // 合併所有 chunks
        const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
        const result = new Uint8Array(totalLength);
        let offset = 0;
        for (const chunk of chunks) {
            result.set(chunk, offset);
            offset += chunk.length;
        }

        return result.buffer;
    } catch (error) {
        console.error('ElevenLabs API error:', error);
        throw new Error('Failed to generate voice');
    }
}

/**
 * 檢查 ElevenLabs 是否已設定
 */
export function isElevenLabsConfigured(): boolean {
    return !!ELEVENLABS_API_KEY;
}

export default { generateVoice, isElevenLabsConfigured };
