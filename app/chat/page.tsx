/**
 * 💬 聊天頁面
 * Chat Page
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import MessageBubble from '@/components/chat/message-bubble';
import VoiceInput from '@/components/chat/voice-input';
import { Character } from '@/lib/tone-router/router';
import { WindPhase } from '@/lib/wind-engine';

interface Message {
    id: number;
    role: 'user' | Character;
    type: 'text' | 'audio';
    content?: string;
    audioUrl?: string;
    timestamp: Date;
}

const CHARACTER_INFO = {
    wenjing: { name: '溫景', emoji: '🌟', phase: '暖風' },
    hanchuan: { name: '寒川', emoji: '❄️', phase: '靜風' },
    yeli: { name: '野黎', emoji: '🔥', phase: '亂風' },
};

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [currentCharacter, setCurrentCharacter] = useState<Character>('wenjing');
    const [windPhase, setWindPhase] = useState<WindPhase>(WindPhase.WARM);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // TODO: 從 localStorage 或 Supabase 載入使用者 ID
    const userId = 'demo-user-id';

    // 自動滾動到最新訊息
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // 發送訊息
    const sendMessage = async (text: string) => {
        if (!text.trim() || isLoading) return;

        // 添加使用者訊息
        const userMessage: Message = {
            id: Date.now(),
            role: 'user',
            type: 'text',
            content: text,
            timestamp: new Date(),
        };
        setMessages((prev) => [...prev, userMessage]);
        setInputText('');
        setIsLoading(true);

        try {
            // 呼叫 Chat API
            const chatResponse = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    text,
                    selectedGod: currentCharacter,
                }),
            });

            if (!chatResponse.ok) throw new Error('Chat API failed');

            const chatData = await chatResponse.json();
            setCurrentCharacter(chatData.character);
            setWindPhase(chatData.windPhase);

            // 添加 AI 文字回應
            const aiMessage: Message = {
                id: chatData.conversationId,
                role: chatData.character,
                type: 'text',
                content: chatData.text,
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, aiMessage]);

            // 生成語音（背景執行）
            generateVoice(chatData.text, chatData.character, chatData.conversationId);
        } catch (error) {
            console.error('Send message error:', error);
            alert('發送訊息失敗，請重試');
        } finally {
            setIsLoading(false);
        }
    };

    // 生成語音
    const generateVoice = async (
        text: string,
        character: Character,
        conversationId: number
    ) => {
        try {
            const voiceIds = {
                wenjing: process.env.NEXT_PUBLIC_VOICE_ID_WENJING || '5MKDyn2TjFjzN17mMZPD',
                hanchuan: process.env.NEXT_PUBLIC_VOICE_ID_HANCHUAN || 'qQZ60jSsDEaszh2xyGwq',
                yeli: process.env.NEXT_PUBLIC_VOICE_ID_YELI || 'kc5QAWHEpQZzIr18Zr2w',
            };

            const response = await fetch('/api/voice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text,
                    voiceId: voiceIds[character],
                    conversationId,
                }),
            });

            if (!response.ok) throw new Error('Voice API failed');

            const data = await response.json();

            // 更新訊息的語音 URL
            setMessages((prev) =>
                prev.map((msg) =>
                    msg.id === conversationId ? { ...msg, audioUrl: data.audioUrl } : msg
                )
            );
        } catch (error) {
            console.error('Generate voice error:', error);
        }
    };

    // 處理語音輸入
    const handleVoiceTranscript = (text: string) => {
        setInputText(text);
    };

    const characterInfo = CHARACTER_INFO[currentCharacter];

    return (
        <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {/* Header */}
            <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="text-4xl">{characterInfo.emoji}</div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">
                            {characterInfo.name}
                        </h1>
                        <p className="text-sm text-gray-500">{characterInfo.phase}</p>
                    </div>
                </div>
                <div className="text-sm text-gray-400">Wind Hunter</div>
            </header>

            {/* Messages */}
            <main className="flex-1 overflow-y-auto px-6 py-4">
                {messages.length === 0 && (
                    <div className="text-center text-gray-400 mt-20">
                        <p className="text-lg">開始與 {characterInfo.name} 對話吧！</p>
                        <p className="text-sm mt-2">他會根據你的情緒狀態回應你</p>
                    </div>
                )}
                {messages.map((message) => (
                    <MessageBubble key={message.id} {...message} />
                ))}
                <div ref={messagesEndRef} />
            </main>

            {/* Input */}
            <footer className="bg-white border-t border-gray-200 px-6 py-4">
                <div className="flex items-center gap-3">
                    <VoiceInput
                        onTranscript={handleVoiceTranscript}
                        disabled={isLoading}
                    />
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage(inputText)}
                        placeholder="輸入訊息..."
                        disabled={isLoading}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    />
                    <button
                        onClick={() => sendMessage(inputText)}
                        disabled={isLoading || !inputText.trim()}
                        className="px-6 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isLoading ? '發送中...' : '發送'}
                    </button>
                </div>
            </footer>
        </div>
    );
}
