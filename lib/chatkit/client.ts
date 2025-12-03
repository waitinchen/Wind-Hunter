/**
 * 🧊 ChatKit 客戶端
 * OpenAI ChatKit Integration
 * 
 * TODO: 實際整合時需要安裝正確的 ChatKit SDK
 * 目前使用 mock 實作以確保專案可以建置
 */

// 環境變數檢查（開發時可選）
const CHATKIT_API_KEY = process.env.CHATKIT_API_KEY || '';
const CHATKIT_PROJECT_ID = process.env.CHATKIT_PROJECT_ID || '';

/**
 * 檢查 ChatKit 是否已設定
 */
export const isChatKitConfigured = (): boolean => {
    return !!(CHATKIT_API_KEY && CHATKIT_PROJECT_ID);
};

/**
 * 取得 ChatKit 客戶端
 * TODO: 實際整合 ChatKit SDK
 */
export const getChatKit = () => {
    if (!isChatKitConfigured()) {
        throw new Error('ChatKit is not configured. Please set CHATKIT_API_KEY and CHATKIT_PROJECT_ID environment variables.');
    }

    // TODO: 實際整合時返回真實的 ChatKit 實例
    // return new ChatKit({ apiKey: CHATKIT_API_KEY, projectId: CHATKIT_PROJECT_ID });

    return {
        messages: {
            create: async (params: any) => {
                console.warn('Using mock ChatKit implementation');
                return {
                    output_text: '這是模擬回應，請設定真實的 ChatKit API Key'
                };
            }
        }
    };
};

// 為了向後相容，導出預設實例（但可能為 null）
export const chatkit = isChatKitConfigured() ? getChatKit() : null;

export default chatkit;
