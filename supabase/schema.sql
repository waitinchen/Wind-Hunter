-- ====================================
-- 🌬️ 獵風男團 · Wind Hunter WebGame
-- Supabase Database Schema
-- ====================================

-- ====================================
-- 使用者資料表 (Profiles)
-- ====================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 基本資訊
  display_name TEXT,
  avatar_url TEXT,
  
  -- 風感者宇宙設定
  wind_universe_id TEXT UNIQUE NOT NULL, -- 每人一個獨立宇宙 ID
  wind_type TEXT,                        -- 初始風屬性 (暖/靜/亂)
  current_phase INT DEFAULT 1,           -- 三男神解鎖階段 (1-3)
  
  -- 索引
  CONSTRAINT profiles_phase_check CHECK (current_phase >= 1 AND current_phase <= 3)
);

-- 建立索引
CREATE INDEX IF NOT EXISTS idx_profiles_universe_id ON profiles(wind_universe_id);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);

-- ====================================
-- 對話紀錄表 (Conversations)
-- ====================================
CREATE TABLE IF NOT EXISTS conversations (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 關聯使用者
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- 對話內容
  role TEXT NOT NULL,           -- wenjing | hanchuan | yeli | user
  type TEXT NOT NULL,           -- text | audio
  content TEXT,                 -- 文字內容
  audio_url TEXT,               -- 語音檔 URL (存在 Supabase Storage)
  
  -- 心風狀態
  wind_phase INT,               -- 當時的心風階段
  
  -- 元數據
  metadata JSONB,               -- 額外的元數據 (如情緒分數、延遲時間等)
  
  -- 約束
  CONSTRAINT conversations_role_check CHECK (role IN ('wenjing', 'hanchuan', 'yeli', 'user')),
  CONSTRAINT conversations_type_check CHECK (type IN ('text', 'audio')),
  CONSTRAINT conversations_phase_check CHECK (wind_phase >= 1 AND wind_phase <= 3)
);

-- 建立索引
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_role ON conversations(role);
CREATE INDEX IF NOT EXISTS idx_conversations_user_created ON conversations(user_id, created_at DESC);

-- ====================================
-- 排程任務表 (Scheduled Tasks)
-- 用於延遲語音生成
-- ====================================
CREATE TABLE IF NOT EXISTS scheduled_tasks (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 關聯使用者
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- 任務內容
  text TEXT NOT NULL,           -- 要轉換成語音的文字
  voice_id TEXT NOT NULL,       -- ElevenLabs Voice ID
  
  -- 排程設定
  run_at TIMESTAMP WITH TIME ZONE NOT NULL,  -- 預定執行時間
  status TEXT DEFAULT 'pending',             -- pending | processing | completed | failed
  
  -- 結果
  audio_url TEXT,               -- 生成的語音檔 URL
  error_message TEXT,           -- 錯誤訊息 (如果失敗)
  
  -- 元數據
  metadata JSONB,               -- 額外的元數據
  
  -- 約束
  CONSTRAINT scheduled_tasks_status_check CHECK (status IN ('pending', 'processing', 'completed', 'failed'))
);

-- 建立索引
CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_user_id ON scheduled_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_run_at ON scheduled_tasks(run_at);
CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_status ON scheduled_tasks(status);
CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_pending ON scheduled_tasks(run_at, status) WHERE status = 'pending';

-- ====================================
-- 更新時間戳記觸發器
-- ====================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ====================================
-- Row Level Security (RLS) 政策
-- ====================================

-- 啟用 RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_tasks ENABLE ROW LEVEL SECURITY;

-- Profiles: 使用者只能看到和修改自己的資料
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Conversations: 使用者只能看到自己的對話
CREATE POLICY "Users can view own conversations"
  ON conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Scheduled Tasks: 使用者只能看到自己的任務
CREATE POLICY "Users can view own tasks"
  ON scheduled_tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks"
  ON scheduled_tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ====================================
-- 初始化範例資料 (Optional)
-- ====================================

-- 可以在這裡加入測試用的範例資料
-- 例如：預設的風屬性設定、角色設定等

-- ====================================
-- Storage Buckets 設定
-- 需要在 Supabase Dashboard 手動建立
-- ====================================

-- 建立以下 Storage Buckets:
-- 1. avatars - 使用者頭像
-- 2. voice-messages - 語音訊息檔案
-- 3. character-assets - 角色圖片和動畫

-- Storage 政策範例 (需在 Dashboard 設定):
-- avatars: 公開讀取，使用者只能上傳自己的
-- voice-messages: 使用者只能存取自己的語音
-- character-assets: 公開讀取

-- ====================================
-- 實用查詢函數
-- ====================================

-- 取得使用者最近的對話
CREATE OR REPLACE FUNCTION get_recent_conversations(
  p_user_id UUID,
  p_limit INT DEFAULT 50
)
RETURNS TABLE (
  id BIGINT,
  role TEXT,
  type TEXT,
  content TEXT,
  audio_url TEXT,
  wind_phase INT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.role,
    c.type,
    c.content,
    c.audio_url,
    c.wind_phase,
    c.created_at
  FROM conversations c
  WHERE c.user_id = p_user_id
  ORDER BY c.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 取得待執行的排程任務
CREATE OR REPLACE FUNCTION get_pending_tasks()
RETURNS TABLE (
  id BIGINT,
  user_id UUID,
  text TEXT,
  voice_id TEXT,
  run_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    st.id,
    st.user_id,
    st.text,
    st.voice_id,
    st.run_at
  FROM scheduled_tasks st
  WHERE st.status = 'pending'
    AND st.run_at <= NOW()
  ORDER BY st.run_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================================
-- 完成
-- ====================================
