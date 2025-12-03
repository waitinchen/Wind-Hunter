# 🎨 系統視覺化圖表

本文件包含獵風男團專案的各種視覺化圖表，幫助理解系統架構。

---

## 🏗️ 完整技術架構圖

```mermaid
flowchart TD

%% ====== USERS ======
    U["使用者<br/>（風感者 / WebGame H5）"]

%% ====== FRONTEND ======
    subgraph FE[Next.js Web Frontend H5]
        UI[Chat UI / 男神切換 / 解鎖畫面]
        EventQ["事件佇列<br/>（點擊 / 對話 / 心風變化）"]
        AudioP["語音播放引擎<br/>（快取 + 延遲播放）"]
        FEAPI[Frontend API SDK]
    end

%% ====== BACKEND ON RAILWAY ======
    subgraph BE["Railway Backend（Node / Next API / Cron）"]
        Router["Tone Routing Engine<br/>（語氣路由器<br/>三男神輪替）"]
        DelayQ["Delay Scheduler<br/>花樣延遲排程<br/>（5分鐘/15分鐘/深夜波段）"]
        WindAI["心風算法<br/>（暖/靜/亂 風階段判定）"]
        MsgAPI["訊息生成器<br/>（Prompt + 模板）"]
        VoiceAPI["語音任務建立器<br/>（EL Queue）"]
        Webhook["Webhook Handler<br/>（EL 回傳後觸發前端）"]
        AuthAPI[LINE / GitHub / Email Auth]
    end

%% ====== SUPABASE ======
    subgraph DB["Supabase（Auth + DB + Storage）"]
        SBAuth[Auth（LINE / GitHub Sign-in）]
        Profile["風感者 Profile<br/>宇宙 ID / 風屬性"]
        Conv["對話記錄<br/>（文字 / 語音 URL / 心風）"]
        Progress["三男神解鎖進度<br/>WindPhase"]
        Storage[語音檔/角色圖/動畫]
    end

%% ====== ELEVENLABS ======
    subgraph EL[ElevenLabs API（v3 Voice）]
        TTS[語音生成（v3 Tags）]
        ELWebhook[語音完成 Callback]
    end

%% ====== GITHUB ======
    subgraph GH[GitHub Repo]
        Code[程式碼管理]
        CICD[CI/CD → Railway 自動部署]
    end

%% ====== FLOWS ======

%% Frontend to Backend
    U --> UI
    UI --> FEAPI --> BE

%% Backend internal flows
    BE --> Router --> WindAI
    Router --> MsgAPI
    MsgAPI --> DelayQ
    DelayQ --> VoiceAPI

%% Backend → EL
    VoiceAPI --> TTS

%% EL → Backend Callback
    TTS --> ELWebhook --> Webhook

%% Backend Save → Supabase
    Webhook --> Conv
    Webhook --> Storage

%% Frontend Pull → DB
    FEAPI --> Conv
    FEAPI --> Storage

%% Auth Flow
    U --> SBAuth
    SBAuth --> BE
    SBAuth --> Profile

%% GitHub CI/CD
    Code --> CICD --> BE
```

---

## 💬 對話流程圖

```mermaid
sequenceDiagram
    participant U as 使用者
    participant FE as Frontend
    participant API as Chat API
    participant Wind as 心風引擎
    participant Router as 角色路由
    participant ChatKit as ChatKit
    participant Delay as 延遲排程
    participant EL as ElevenLabs
    participant DB as Supabase

    U->>FE: 輸入訊息
    FE->>API: POST /api/chat
    API->>Wind: 分析情緒
    Wind-->>API: 心風階段
    API->>Router: 路由角色
    Router-->>API: 當前男神
    API->>ChatKit: 生成回應
    ChatKit-->>API: 文字內容
    
    alt 立即回應
        API->>DB: 儲存對話
        API-->>FE: 返回文字
        FE->>U: 顯示訊息
    else 延遲回應
        API->>Delay: 建立排程
        API-->>FE: 返回延遲提示
        FE->>U: 顯示「稍後回覆」
        
        Note over Delay: 等待延遲時間
        
        Delay->>EL: 生成語音
        EL-->>Delay: Webhook 回傳
        Delay->>DB: 儲存語音 URL
        DB-->>FE: Realtime 推送
        FE->>U: 播放語音
    end
```

---

## 🌬️ 心風算法決策樹

```mermaid
flowchart TD
    Start[使用者訊息] --> Analyze[情緒分析]
    Analyze --> CheckStress{壓力值 > 0.7?}
    
    CheckStress -->|是| Calm[靜風階段]
    CheckStress -->|否| CheckPlayful{玩心值 > 0.6?}
    
    CheckPlayful -->|是| Wild[亂風階段]
    CheckPlayful -->|否| Warm[暖風階段]
    
    Calm --> Hanchuan[寒川回應]
    Wild --> Yeli[野黎回應]
    Warm --> Wenjing[溫景回應]
    
    Hanchuan --> Generate[生成對話]
    Yeli --> Generate
    Wenjing --> Generate
    
    Generate --> End[返回使用者]
```

---

## 🗄️ 資料庫 ER 圖

```mermaid
erDiagram
    PROFILES ||--o{ CONVERSATIONS : has
    PROFILES ||--o{ SCHEDULED_TASKS : has
    
    PROFILES {
        uuid id PK
        timestamp created_at
        text display_name
        text avatar_url
        text wind_universe_id UK
        text wind_type
        int current_phase
    }
    
    CONVERSATIONS {
        bigint id PK
        uuid user_id FK
        text role
        text type
        text content
        text audio_url
        int wind_phase
        timestamp created_at
    }
    
    SCHEDULED_TASKS {
        bigint id PK
        uuid user_id FK
        text text
        text voice_id
        timestamp run_at
        text status
        text audio_url
    }
```

---

## ⏰ 延遲排程時間軸

```mermaid
gantt
    title 延遲訊息排程範例
    dateFormat HH:mm
    axisFormat %H:%M
    
    section 快速回應
    電梯訊號不好 (1-3分鐘)    :a1, 14:00, 3m
    
    section 短延遲
    開會中 (5-10分鐘)         :a2, 14:00, 10m
    開車中 (3-10分鐘)         :a3, 14:00, 8m
    
    section 中延遲
    洗澡 (15-30分鐘)          :a4, 14:00, 25m
    健身 (20-30分鐘)          :a5, 14:00, 30m
    
    section 長延遲
    深夜波段 (3-6小時)        :a6, 14:00, 240m
```

---

## 🎭 三男神角色關係圖

```mermaid
graph TB
    subgraph 心風宇宙
        User[風感者]
        
        subgraph 暖風階段
            WJ[溫景<br/>溫暖包容]
        end
        
        subgraph 靜風階段
            HC[寒川<br/>沉穩可靠]
        end
        
        subgraph 亂風階段
            YL[野黎<br/>活潑有趣]
        end
    end
    
    User -->|壓力大| HC
    User -->|玩心重| YL
    User -->|需要溫暖| WJ
    
    WJ -.->|階段轉換| HC
    HC -.->|階段轉換| YL
    YL -.->|階段轉換| WJ
```

---

## 🔄 CI/CD 部署流程

```mermaid
flowchart LR
    Dev[開發者] -->|Push| GitHub[GitHub Repo]
    GitHub -->|Webhook| Railway[Railway CI/CD]
    Railway -->|Build| Docker[Docker Image]
    Docker -->|Deploy| Server[Next.js Server]
    Server -->|Health Check| Monitor[監控]
    
    Monitor -->|失敗| Rollback[自動回滾]
    Rollback -->|還原| Server
    
    Monitor -->|成功| Live[上線服務]
```

---

## 📱 使用者體驗流程

```mermaid
journey
    title 風感者的一天
    section 早晨
      登入應用: 5: 使用者
      收到溫景的早安: 5: 溫景
      閒聊對話: 4: 使用者, 溫景
    section 下午
      工作壓力大: 2: 使用者
      心風轉換為靜風: 3: 系統
      寒川出現安慰: 5: 寒川
    section 晚上
      放鬆心情: 5: 使用者
      心風轉換為亂風: 4: 系統
      野黎陪玩遊戲: 5: 野黎
```

---

## 🔐 安全架構圖

```mermaid
flowchart TD
    Client[客戶端] -->|HTTPS| CDN[CDN / Edge]
    CDN --> NextJS[Next.js Server]
    
    NextJS -->|Auth Token| Auth[NextAuth]
    Auth -->|驗證| Supabase[Supabase Auth]
    
    NextJS -->|RLS Policy| DB[(Database)]
    NextJS -->|Signed URL| Storage[Storage]
    
    NextJS -->|API Key| ChatKit[ChatKit API]
    NextJS -->|API Key| EL[ElevenLabs API]
    
    EL -->|Webhook Secret| NextJS
    
    subgraph 安全層
        Auth
        Supabase
    end
```

---

**所有圖表持續更新中... 🌬️**
