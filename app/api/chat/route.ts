/**
 * 💬 Chat API
 * 對話生成的統一入口
 * 
 * 功能：
 * 1. 接收使用者訊息
 * 2. 分析情緒並計算心風階段
 * 3. 路由到對應男神
 * 4. 生成 AI 回應
 * 5. 儲存對話記錄
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { analyzeEmotionFromText, computeWindPhase } from '@/lib/wind-engine';
import { routeCharacter, getSystemPrompt, Character } from '@/lib/tone-router/router';
import { generateWindMessage } from '@/lib/chatkit/client';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { userId, text, selectedGod } = body;

        // 驗證輸入
        if (!userId || !text) {
            return NextResponse.json(
                { error: 'Missing required fields: userId, text' },
                { status: 400 }
            );
        }

        // 1. 分析情緒並計算心風階段
        const emotion = analyzeEmotionFromText(text);
        const windPhase = computeWindPhase(emotion);

        // 2. 決定回應的男神（優先使用使用者選擇，否則根據心風階段）
        let character: Character;
        if (selectedGod) {
            character = selectedGod as Character;
        } else {
            character = routeCharacter(windPhase);
        }

        // 3. 取得角色的系統提示詞
        const systemPrompt = getSystemPrompt(character);

        // 4. 取得對話歷史（最近 10 則）
        const { data: history } = await supabaseAdmin
            .from('conversations')
            .select('role, content')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(10);

        const conversationHistory = (history || [])
            .reverse()
            .map((msg) => ({
                role: msg.role === 'user' ? 'user' as const : 'assistant' as const,
                content: msg.content || '',
            }));

        // 5. 生成 AI 回應
        const aiResponse = await generateWindMessage({
            systemPrompt,
            userMessage: text,
            conversationHistory,
        });

        // 6. 儲存使用者訊息
        await supabaseAdmin.from('conversations').insert({
            user_id: userId,
            role: 'user',
            type: 'text',
            content: text,
            wind_phase: windPhase,
        });

        // 7. 儲存 AI 回應
        const { data: savedConversation } = await supabaseAdmin
            .from('conversations')
            .insert({
                user_id: userId,
                role: character,
                type: 'text',
                content: aiResponse,
                wind_phase: windPhase,
            })
            .select()
            .single();

        // 8. 回傳結果
        return NextResponse.json({
            text: aiResponse,
            character,
            windPhase,
            conversationId: savedConversation?.id,
        });
    } catch (error) {
        console.error('Chat API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
