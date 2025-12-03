# 🚀 快速開始指南

歡迎來到**獵風男團 · Wind Hunter WebGame**！

這份指南將幫助你在 5 分鐘內啟動專案。

---

## 📋 前置需求

確保你的開發環境已安裝：

- **Node.js** >= 18.0.0
- **pnpm** >= 8.0.0（推薦）或 npm/yarn
- **Git**

---

## 🔧 步驟 1：安裝依賴

```bash
# 使用 pnpm（推薦）
pnpm install

# 或使用 npm
npm install

# 或使用 yarn
yarn install
```

---

## 🔑 步驟 2：設定環境變數

1. 複製環境變數範本：

```bash
cp .env.example .env.local
```

2. 編輯 `.env.local`，填入你的 API 金鑰：

### 必填項目

```env
# Supabase（必填）
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# Next.js（必填）
NEXTAUTH_SECRET=your-random-secret-here
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# ChatKit（必填）
CHATKIT_API_KEY=your-chatkit-key
CHATKIT_PROJECT_ID=your-project-id

# ElevenLabs（必填）
ELEVENLABS_API_KEY=your-elevenlabs-key
VOICE_ID_WENJING=voice-id-1
VOICE_ID_HANCHUAN=voice-id-2
VOICE_ID_YELI=voice-id-3
```

### 選填項目

```env
# LINE Login（選填）
LINE_CHANNEL_ID=
LINE_CHANNEL_SECRET=
```

---

## 🗄️ 步驟 3：設定 Supabase 資料庫

1. 登入 [Supabase Dashboard](https://app.supabase.com/)
2. 建立新專案或選擇現有專案
3. 進入 **SQL Editor**
4. 複製 `supabase/schema.sql` 的內容
5. 執行 SQL 建立資料表

### 建立 Storage Buckets

在 Supabase Dashboard 的 **Storage** 區域建立以下 buckets：

- `avatars` - 使用者頭像（公開讀取）
- `voice-messages` - 語音訊息（私人）
- `character-assets` - 角色圖片（公開讀取）

---

## ▶️ 步驟 4：啟動開發伺服器

```bash
pnpm dev
```

開啟瀏覽器訪問：[http://localhost:3000](http://localhost:3000)

---

## 🎯 下一步

### 開發功能

專案已包含以下核心模組：

- ✅ **心風算法引擎** (`lib/wind-engine`)
- ✅ **三男神路由器** (`lib/tone-router`)
- ✅ **延遲排程系統** (`lib/delay-scheduler`)
- ✅ **ChatKit 集成** (`lib/chatkit`)

### 需要實作的 API Routes

在 `app/api` 目錄下建立：

1. **`/api/chat/route.ts`** - 處理對話請求
2. **`/api/voice-webhook/route.ts`** - ElevenLabs webhook
3. **`/api/auth/[...nextauth]/route.ts`** - NextAuth 設定

### 需要實作的頁面

在 `app` 目錄下建立：

1. **`/wind/page.tsx`** - 風感者主頁
2. **`/auth/page.tsx`** - 登入頁面
3. **`/page.tsx`** - 首頁

---

## 🐛 常見問題

### Q: pnpm 安裝失敗？

```bash
# 清除快取後重試
pnpm store prune
pnpm install
```

### Q: Supabase 連線失敗？

檢查 `.env.local` 中的 URL 和 Key 是否正確。

### Q: TypeScript 報錯？

```bash
# 重新生成型別
pnpm type-check
```

---

## 📚 更多資源

- [完整 README](./README.md)
- [Supabase 文件](https://supabase.com/docs)
- [Next.js 文件](https://nextjs.org/docs)
- [ChatKit 文件](https://github.com/openai/chatkit-js)
- [ElevenLabs API](https://elevenlabs.io/docs)

---

## 🆘 需要幫助？

遇到問題？歡迎：

- 查看 [GitHub Issues](https://github.com/your-org/wind-hunter/issues)
- 聯繫開發團隊

---

**祝你開發順利！🌬️**
