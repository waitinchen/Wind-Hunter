/**
 * 🕒 花樣延遲排程系統
 * Delay Scheduler
 * 
 * 管理延遲訊息的排程和執行
 */

export interface DelayTask {
    id?: number;
    userId: string;
    text: string;
    voiceId: string;
    delayMinutes: number;
    runAt: Date;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    metadata?: Record<string, any>;
}

export enum DelayPreset {
    QUICK = 'quick',           // 1-3 分鐘
    SHORT = 'short',           // 5-10 分鐘
    MEDIUM = 'medium',         // 15-30 分鐘
    LONG = 'long',             // 1-2 小時
    LATE_NIGHT = 'late_night', // 深夜波段
}

/**
 * 延遲預設時間（分鐘）
 */
export const DELAY_PRESETS: Record<DelayPreset, number[]> = {
    [DelayPreset.QUICK]: [1, 2, 3],
    [DelayPreset.SHORT]: [5, 8, 10],
    [DelayPreset.MEDIUM]: [15, 20, 30],
    [DelayPreset.LONG]: [60, 90, 120],
    [DelayPreset.LATE_NIGHT]: [180, 240, 360], // 3-6 小時
};

/**
 * 延遲情境訊息模板
 */
export const DELAY_MESSAGES = {
    meeting: '開會中，{time}分鐘後回妳',
    driving: '我在開車，稍等一下喔',
    elevator: '電梯訊號不好，等等回妳',
    busy: '我{time}分鐘後回妳喔，寶貝',
    shower: '我去洗個澡，等我一下',
    workout: '在健身房，等等回妳',
};

/**
 * 隨機選擇延遲時間
 */
export function getRandomDelay(preset: DelayPreset): number {
    const delays = DELAY_PRESETS[preset];
    return delays[Math.floor(Math.random() * delays.length)];
}

/**
 * 建立延遲任務
 */
export async function scheduleVoiceTask(payload: {
    userId: string;
    text: string;
    voiceId: string;
    delay: number; // 毫秒
    metadata?: Record<string, any>;
}): Promise<DelayTask> {
    const { userId, text, voiceId, delay, metadata } = payload;

    const task: DelayTask = {
        userId,
        text,
        voiceId,
        delayMinutes: delay / 60000,
        runAt: new Date(Date.now() + delay),
        status: 'pending',
        metadata,
    };

    // TODO: 儲存到 Supabase scheduled_tasks 表
    console.log('Scheduling task:', task);

    return task;
}

/**
 * 取得待執行的任務
 */
export async function getPendingTasks(): Promise<DelayTask[]> {
    // TODO: 從 Supabase 查詢待執行的任務
    // SELECT * FROM scheduled_tasks
    // WHERE status = 'pending'
    // AND run_at <= NOW()
    // ORDER BY run_at ASC

    return [];
}

/**
 * 更新任務狀態
 */
export async function updateTaskStatus(
    taskId: number,
    status: DelayTask['status'],
    audioUrl?: string,
    error?: string
): Promise<void> {
    // TODO: 更新 Supabase scheduled_tasks 表
    console.log(`Updating task ${taskId} to ${status}`);
}

/**
 * 取消任務
 */
export async function cancelTask(taskId: number): Promise<void> {
    await updateTaskStatus(taskId, 'failed', undefined, 'Cancelled by user');
}

/**
 * 生成延遲訊息
 */
export function generateDelayMessage(
    scenario: keyof typeof DELAY_MESSAGES,
    delayMinutes: number
): string {
    const template = DELAY_MESSAGES[scenario];
    return template.replace('{time}', delayMinutes.toString());
}
