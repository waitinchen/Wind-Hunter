/**
 * 🔊 Voice Generation API
 * 語音生成服務
 * 
 * 功能：
 * 1. 接收文字與 Voice ID
 * 2. 呼叫 ElevenLabs API 生成語音
 * 3. 上傳至 Supabase Storage
 * 4. 回傳語音 URL
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { generateVoice } from '@/lib/elevenlabs/client';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { text, voiceId, conversationId } = body;

        // 驗證輸入
        if (!text || !voiceId) {
            return NextResponse.json(
                { error: 'Missing required fields: text, voiceId' },
                { status: 400 }
            );
        }

        // 1. 生成語音
        const audioBuffer = await generateVoice({
            text,
            voiceId,
        });

        // 2. 上傳至 Supabase Storage
        const fileName = `${Date.now()}-${conversationId || 'voice'}.mp3`;
        const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
            .from('voice-messages')
            .upload(fileName, audioBuffer, {
                contentType: 'audio/mpeg',
                cacheControl: '3600',
            });

        if (uploadError) {
            console.error('Supabase upload error:', uploadError);
            throw new Error('Failed to upload audio');
        }

        // 3. 取得公開 URL
        const { data: urlData } = supabaseAdmin.storage
            .from('voice-messages')
            .getPublicUrl(fileName);

        const audioUrl = urlData.publicUrl;

        // 4. 如果有 conversationId，更新對話記錄
        if (conversationId) {
            await supabaseAdmin
                .from('conversations')
                .update({ audio_url: audioUrl })
                .eq('id', conversationId);
        }

        // 5. 回傳結果
        return NextResponse.json({
            audioUrl,
            duration: 0, // TODO: 計算實際時長
        });
    } catch (error) {
        console.error('Voice API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
