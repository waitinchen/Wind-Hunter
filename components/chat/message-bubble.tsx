/**
 * 💬 訊息氣泡元件
 * Message Bubble Component
 */

import React from 'react';

export interface MessageBubbleProps {
    role: 'user' | 'wenjing' | 'hanchuan' | 'yeli';
    type: 'text' | 'audio';
    content?: string;
    audioUrl?: string;
    timestamp: Date;
}

const CHARACTER_NAMES = {
    wenjing: '溫景',
    hanchuan: '寒川',
    yeli: '野黎',
    user: '你',
};

const CHARACTER_COLORS = {
    wenjing: 'bg-amber-100 text-amber-900',
    hanchuan: 'bg-blue-100 text-blue-900',
    yeli: 'bg-red-100 text-red-900',
    user: 'bg-gray-100 text-gray-900',
};

export default function MessageBubble({
    role,
    type,
    content,
    audioUrl,
    timestamp,
}: MessageBubbleProps) {
    const isUser = role === 'user';
    const colorClass = CHARACTER_COLORS[role];
    const name = CHARACTER_NAMES[role];

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
            <div className={`max-w-[70%] ${isUser ? 'order-2' : 'order-1'}`}>
                {/* 角色名稱 */}
                {!isUser && (
                    <div className="text-xs text-gray-500 mb-1 ml-2">{name}</div>
                )}

                {/* 訊息氣泡 */}
                <div
                    className={`rounded-2xl px-4 py-3 ${colorClass} ${isUser ? 'rounded-tr-none' : 'rounded-tl-none'
                        }`}
                >
                    {/* 文字訊息 */}
                    {type === 'text' && content && (
                        <p className="text-sm whitespace-pre-wrap">{content}</p>
                    )}

                    {/* 語音訊息 */}
                    {type === 'audio' && audioUrl && (
                        <audio controls className="w-full">
                            <source src={audioUrl} type="audio/mpeg" />
                            您的瀏覽器不支援音訊播放
                        </audio>
                    )}
                </div>

                {/* 時間戳記 */}
                <div
                    className={`text-xs text-gray-400 mt-1 ${isUser ? 'text-right mr-2' : 'text-left ml-2'
                        }`}
                >
                    {new Date(timestamp).toLocaleTimeString('zh-TW', {
                        hour: '2-digit',
                        minute: '2-digit',
                    })}
                </div>
            </div>
        </div>
    );
}
