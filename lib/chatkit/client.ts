/**
/**
 * 🧊 ChatKit 客戶端
 * OpenAI ChatKit Integration
 */

import { ChatKit } from '@openai/chatkit';

// 環境變數檢查（開發時可選）
const CHATKIT_API_KEY = process.env.CHATKIT_API_KEY || '';
const CHATKIT_PROJECT_ID = process.env.CHATKIT_PROJECT_ID || '';

// 只在實際使用時才初始化（避免建置時錯誤）
let chatkitInstance: ChatKit | null = null;

export const getChatKit = (): ChatKit => {
    if (!CHATKIT_API_KEY || !CHATKIT_PROJECT_ID) {
        throw new Error('ChatKit is not configured. Please set CHATKIT_API_KEY and CHATKIT_PROJECT_ID environment variables.');
    }

    if (!chatkitInstance) {
        chatkitInstance = new ChatKit({
            apiKey: CHATKIT_API_KEY,
            projectId: CHATKIT_PROJECT_ID,
        });
    }

    return chatkitInstance;
};

// 檢查 ChatKit 是否已設定
export const isChatKitConfigured = (): boolean => {
    return !!(CHATKIT_API_KEY && CHATKIT_PROJECT_ID);
};

// 為了向後相容，導出預設實例（但可能為 null）
export const chatkit = isChatKitConfigured() ? getChatKit() : null;

export default chatkit;
