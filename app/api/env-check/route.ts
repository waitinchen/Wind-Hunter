import { NextResponse } from 'next/server';

/**
 * 詳細環境變數檢查 API
 * 顯示環境變數的前幾個字元（用於驗證但不洩漏完整值）
 */
export async function GET(request: Request) {
    // 檢查是否有授權（簡單的安全措施）
    const url = new URL(request.url);
    const secret = url.searchParams.get('secret');

    // 只在開發環境或提供正確密鑰時才顯示詳細資訊
    const isDev = process.env.NODE_ENV === 'development';
    const isAuthorized = secret === process.env.DELAY_QUEUE_SECRET;

    if (!isDev && !isAuthorized) {
        return NextResponse.json({
            error: 'Unauthorized',
            message: 'Please provide valid secret parameter or run in development mode',
        }, { status: 401 });
    }

    // 遮罩函數：只顯示前4個字元
    const mask = (value: string | undefined): string => {
        if (!value) return '❌ Not Set';
        if (value.length <= 4) return '✅ Set (short)';
        return `✅ ${value.substring(0, 4)}...${value.substring(value.length - 4)}`;
    };

    const envDetails = {
        // Supabase
        'NEXT_PUBLIC_SUPABASE_URL': mask(process.env.NEXT_PUBLIC_SUPABASE_URL),
        'NEXT_PUBLIC_SUPABASE_ANON_KEY': mask(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
        'SUPABASE_SERVICE_KEY': mask(process.env.SUPABASE_SERVICE_KEY),

        // Next.js
        'NEXTAUTH_SECRET': mask(process.env.NEXTAUTH_SECRET),
        'NEXT_PUBLIC_SITE_URL': process.env.NEXT_PUBLIC_SITE_URL || '❌ Not Set',
        'NODE_ENV': process.env.NODE_ENV || '❌ Not Set',

        // LINE Login
        'LINE_CHANNEL_ID': mask(process.env.LINE_CHANNEL_ID),
        'LINE_CHANNEL_SECRET': mask(process.env.LINE_CHANNEL_SECRET),
        'LINE_REDIRECT_URI': process.env.LINE_REDIRECT_URI || '❌ Not Set',

        // ElevenLabs
        'ELEVENLABS_API_KEY': mask(process.env.ELEVENLABS_API_KEY),
        'ELEVENLABS_WEBHOOK_SECRET': mask(process.env.ELEVENLABS_WEBHOOK_SECRET),
        'VOICE_ID_WENJING': mask(process.env.VOICE_ID_WENJING),
        'VOICE_ID_HANCHUAN': mask(process.env.VOICE_ID_HANCHUAN),
        'VOICE_ID_YELI': mask(process.env.VOICE_ID_YELI),

        // ChatKit
        'CHATKIT_API_KEY': mask(process.env.CHATKIT_API_KEY),
        'CHATKIT_PROJECT_ID': mask(process.env.CHATKIT_PROJECT_ID),
        'CHATKIT_WS_URL': process.env.CHATKIT_WS_URL || '❌ Not Set',
        'CHATKIT_BASE_URL': process.env.CHATKIT_BASE_URL || '❌ Not Set',
        'CHATKIT_CLIENT_ID': mask(process.env.CHATKIT_CLIENT_ID),
        'CHATKIT_ALLOWED_ORIGIN': process.env.CHATKIT_ALLOWED_ORIGIN || '❌ Not Set',

        // Scheduler
        'DELAY_QUEUE_SECRET': mask(process.env.DELAY_QUEUE_SECRET),
    };

    return NextResponse.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        note: 'Values are masked for security. Only first and last 4 characters shown.',
        variables: envDetails,
    }, {
        status: 200,
        headers: {
            'Cache-Control': 'no-store, max-age=0',
        },
    });
}
