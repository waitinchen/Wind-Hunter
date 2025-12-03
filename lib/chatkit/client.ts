/**
 * 🧊 ChatKit 客戶端
 * OpenAI ChatKit Integration
 */

import { ChatKit } from '@openai/chatkit';

if (!process.env.CHATKIT_API_KEY) {
    throw new Error('CHATKIT_API_KEY is required');
}

if (!process.env.CHATKIT_PROJECT_ID) {
    throw new Error('CHATKIT_PROJECT_ID is required');
}

export const chatkit = new ChatKit({
    apiKey: process.env.CHATKIT_API_KEY,
    projectId: process.env.CHATKIT_PROJECT_ID,
});

export default chatkit;
