/**
 * 🎤 Whisper Transcription API
 * 語音轉文字服務
 * 
 * 功能：
 * 1. 接收音訊檔案
 * 2. 呼叫 OpenAI Whisper API
 * 3. 回傳轉錄文字
 */

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.CHATKIT_API_KEY || process.env.OPENAI_API_KEY || '',
});

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const audioFile = formData.get('audio') as File;

        if (!audioFile) {
            return NextResponse.json(
                { error: 'Missing audio file' },
                { status: 400 }
            );
        }

        // 呼叫 Whisper API
        const transcription = await openai.audio.transcriptions.create({
            file: audioFile,
            model: 'whisper-1',
            language: 'zh', // 中文
        });

        return NextResponse.json({
            text: transcription.text,
            language: 'zh',
        });
    } catch (error) {
        console.error('Whisper API error:', error);
        return NextResponse.json(
            { error: 'Failed to transcribe audio' },
            { status: 500 }
        );
    }
}
