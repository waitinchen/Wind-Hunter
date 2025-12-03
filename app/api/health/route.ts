import { NextResponse } from 'next/server';

/**
 * Health Check API
 * 檢查環境變數是否正確載入
 */
export async function GET() {
    // 檢查各個環境變數是否存在（不顯示實際值，只顯示是否已設定）
    const envCheck = {
        // Supabase
        supabase: {
            url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
            anonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            serviceKey: !!process.env.SUPABASE_SERVICE_KEY,
        },

        // Next.js
        nextjs: {
            authSecret: !!process.env.NEXTAUTH_SECRET,
            siteUrl: !!process.env.NEXT_PUBLIC_SITE_URL,
            nodeEnv: process.env.NODE_ENV || 'not set',
        },

        // LINE Login
        line: {
            channelId: !!process.env.LINE_CHANNEL_ID,
            channelSecret: !!process.env.LINE_CHANNEL_SECRET,
            redirectUri: !!process.env.LINE_REDIRECT_URI,
        },

        // ElevenLabs
        elevenlabs: {
            apiKey: !!process.env.ELEVENLABS_API_KEY,
            webhookSecret: !!process.env.ELEVENLABS_WEBHOOK_SECRET,
            voiceIds: {
                wenjing: !!process.env.VOICE_ID_WENJING,
                hanchuan: !!process.env.VOICE_ID_HANCHUAN,
                yeli: !!process.env.VOICE_ID_YELI,
            },
        },

        // ChatKit
        chatkit: {
            apiKey: !!process.env.CHATKIT_API_KEY,
            projectId: !!process.env.CHATKIT_PROJECT_ID,
            wsUrl: !!process.env.CHATKIT_WS_URL,
            baseUrl: !!process.env.CHATKIT_BASE_URL,
            clientId: !!process.env.CHATKIT_CLIENT_ID,
            allowedOrigin: !!process.env.CHATKIT_ALLOWED_ORIGIN,
        },

        // Scheduler
        scheduler: {
            delayQueueSecret: !!process.env.DELAY_QUEUE_SECRET,
        },
    };

    // 計算總體狀態
    const allEnvVars = Object.values(envCheck).flatMap(category =>
        Object.values(category).flatMap(value =>
            typeof value === 'object' ? Object.values(value) : [value]
        )
    );

    const configuredCount = allEnvVars.filter(v => v === true).length;
    const totalCount = allEnvVars.filter(v => typeof v === 'boolean').length;
    const configurationPercentage = Math.round((configuredCount / totalCount) * 100);

    return NextResponse.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        configuration: {
            configured: configuredCount,
            total: totalCount,
            percentage: `${configurationPercentage}%`,
        },
        checks: envCheck,
    }, {
        status: 200,
        headers: {
            'Cache-Control': 'no-store, max-age=0',
        },
    });
}
