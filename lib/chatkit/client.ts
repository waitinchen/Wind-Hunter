/**
 * 🧊 ChatKit 客戶端
 * OpenAI ChatKit Integration
 * 
 * 注意：使用 mock 實作直到確認正確的 ChatKit SDK 用法
 */

// 環境變數檢查（開發時可選）
const CHATKIT_API_KEY = process.env.CHATKIT_API_KEY || '';
const CHATKIT_PROJECT_ID = process.env.CHATKIT_PROJECT_ID || '';

// ChatKit 介面定義
interface ChatKitMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

interface ChatKitResponse {
    output_text: string;
}

interface ChatKitClient {
    messages: {
        create: (params: {
            model: string;
            messages: ChatKitMessage[];
            stream: boolean;
        }) => Promise<ChatKitResponse>;
    };
}

// Mock ChatKit 實作（待替換為真實 SDK）
class MockChatKit implements ChatKitClient {
    private apiKey: string;
    private projectId: string;

    constructor(config: { apiKey: string; projectId: string }) {
        this.apiKey = config.apiKey;
        this.projectId = config.projectId;
    }

    messages = {
        create: async (params: {
            model: string;
            messages: ChatKitMessage[];
            stream: boolean;
        }): Promise<ChatKitResponse> => {
            // TODO: 實際呼叫 OpenAI API
            console.warn('Using mock ChatKit implementation');

            // 暫時返回模擬回應
            const userMessage = params.messages.find(m => m.role === 'user')?.content || '';
            return {
                output_text: `[Mock Response] 收到訊息：${userMessage}`
            };
        }
    };
}

// 只在實際使用時才初始化（避免建置時錯誤）
let chatkitInstance: ChatKitClient | null = null;

export const getChatKit = (): ChatKitClient => {
    if (!CHATKIT_API_KEY || !CHATKIT_PROJECT_ID) {
        throw new Error('ChatKit is not configured. Please set CHATKIT_API_KEY and CHATKIT_PROJECT_ID environment variables.');
    }

    if (!chatkitInstance) {
        chatkitInstance = new MockChatKit({
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
