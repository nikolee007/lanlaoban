# 懒老板 · AI 短视频生产系统设计（v2）

> 目标：**前端简化到商家点一下就出稿，后端做深让 Agent 真正「越用越懂你」**
> 定位：优化版，替代原「轻量Agent调度+Skill内核」方案，解决其 4 个硬伤
> 技术栈：Next.js 14 + Prisma + SQLite/Turso + OpenAI API + Agnes 数字人

---

## 一、设计原则

| 端 | 原则 |
|----|------|
| **前端** | 商家不懂技术。主力是「选场景 → 填 3 个字段 → 一次出稿」；一句话对话是进阶，懒人模式是兜底 |
| **后端** | 每个商家一个画像，内容生产全部结构化（可校验），反馈数据回填画像 → 「越用越懂你」是真功能不是口号 |
| **稳定** | Skill 封装标准生产逻辑，Agent 只判断调度，输出用 JSON Schema 强制，后端校验失败自动重试 |

---

## 二、总体架构

```
[前端三档入口]
  场景直选(5按钮) ─┐
  一句话输入   ────┤→ [Agent 调度层] 意图识别 + 画像注入
  懒人模式     ───┘        │
                           ▼
                 [Skill 引擎] 5 套 Skill（JSON Schema 强制输出）
                           │
                           ▼
                 [校验层] Schema 校验 → 失败自动重试（≤2次）
                           │
                           ▼
                 [交付] 页面预览 / 邮箱 / 内容日历排期
                           │
                           ▼
                 [反馈层] 播放/完播/转化数据采集 → 回填商家画像
                           │
                           └───────── 越用越懂你（飞轮）
```

---

## 三、前端交互（简化用户操作）

### 入口 A · 场景直选（主力，占 70%）

首页 / 短视频工作台放 **5 个大按钮**，点哪个出哪个：

| 按钮 | Skill | 典型用户 |
|------|-------|---------|
| 标准短视频方案 | S1 | 日常稳定出片 |
| 冷启动破播放 | S2 | 新号/没流量 |
| 转化获客招商 | S3 | 要客户/招商 |
| 矩阵批量脚本 | S4 | 多账号/做测试 |
| 优化我已有脚本 | S5 | 有稿子要改 |

**点按钮后 → 极简表单（只填 3 项，全部有默认值）：**

```
行业：  [下拉：餐饮/美业/零售/工厂/教育/医疗/其他]  ← 选完自动加载该行业模板
目标：  [单选：涨粉 / 引流到店 / 招商成交 / 促复购]  ← 默认「涨粉」
时长：  [30s / 60s / 90s]                            ← 默认 60s
─────────────────────────────
[一句话补充]（选填）：如「招牌菜是剁椒鱼头，主打家庭聚餐」
─────────────────────────────
        [ 一键生成 ]
```

> 关键：**能预填的绝不让人填**。行业选完，该行业的爆款句式、合规红线、常用选题自动生效；画像里有历史，自动带入账号阶段和目标。

### 入口 B · 一句话输入（进阶，占 25%）

自由输入，Agent 自动调度：`"我是烧烤店，想拍3条冷启动的"` → 识别为 S2，画像补齐行业，一次出稿。
识别不清 → 展示 5 个场景按钮让用户选（保留原容错兜底）。

### 入口 C · 懒人模式（兜底，占 5%）

什么都不填，只给一句话（甚至只给行业），Agent 用**默认参数 + 画像推断**直接出稿。

**前端交互铁律：**
1. 四要素（行业/目标/受众/时长）从"对话反问"改为**表单必填 + 默认值**，按钮通道零反问
2. 交付给「内容日历」：月产出 30/60 条自动排期，哪天发哪条一目了然，不把一堆文件砸给老板
3. 一次出稿后给「换一版/换钩子」按钮，不用重新填表

---

## 四、后端学习与生成（核心）

### 1. 商家画像记忆层（「越用越懂你」的技术底座）

每次生成前，从数据库读商家 Profile，注入系统提示词：

```
你服务的是：湘菜馆「××食府」，
账号阶段：成长期，
上次爆款：脚本《剁椒鱼头的三种吃法》播放 23w，钩子用了「厨房机密」句式。
本次目标：涨粉，产出：30 条脚本。
```

**Profile 数据模型：**

| 字段 | 说明 | 来源 |
|------|------|------|
| 行业/品类 | 餐饮·湘菜 | 首次填表 |
| 门店信息 | 店名/位置/招牌菜 | 首次填表 |
| 账号阶段 | 冷启动/成长/成熟 | 画像学习 |
| 视频目标 | 涨粉/引流/招商 | 画像学习 |
| 历史内容库 | 生成过的脚本+成片+标题 | 自动沉淀 |
| 爆款记录 | 爆款脚本、命中句式/钩子 | 反馈回填 |
| 偏好 | 口播风格、音色、字幕 | 用户选择 |

### 2. Skill 结构化输出（JSON Schema 强制）

5 套 Skill 全部定义 JSON Schema，用 **function calling / structured output** 调用，字段必填、类型固定，后端 `校验失败 → 自动重试（≤2次）`。

**Skill1 标准方案 Schema（其余 4 套同构，字段略）：**

```json
{
  "video_profile": {
    "track": "string", "account_stage": "enum[冷启动|成长|成熟]",
    "goal": "enum[涨粉|引流|招商|促复购]", "audience": "string",
    "duration_sec": "int", "hook_3s": "string"
  },
  "script": [
    { "time": "string", "line": "string", "pause": "enum[/|//]", "shot_hint": "string" }
  ],
  "ops_materials": {
    "titles": ["string", 5],
    "cover_copy": ["string", 3],
    "comment_seeds": ["string", 3]
  },
  "render_params": {
    "persona_style": "string", "speech_rate": "string",
    "voice": "string", "background": "string", "subtitle_style": "string"
  },
  "ops_advice": { "distribution": "string", "notes": ["string"] }
}
```

> `script[].pause` 枚举 `/` `//` 硬编码，直接映射数字人停顿节奏。

### 3. 批量生成引擎（匹配套餐产能）

- 按套餐产能批量：尝鲜 10 / 标准 30 / 专业 60 条/月
- **内容日历排期**：批量任务自动分布到全月，每天 1-2 条，生成后进日历
- 任务队列 + 限流 + 失败重试，支持"今晚先出 5 条"

### 4. 反馈闭环（飞轮）

```
商家发布 → 后台采集播放/完播/转化 → 标记爆款
   → 提炼爆款句式/钩子 → 写入画像 → 下次生成更贴
```

- 埋点：发布平台回传数据（或商家手动标记「这条爆了」）
- 画像学习：爆款脚本做「句式/钩子」拆解，进行业模板库和商家画像

### 5. 行业模板库

每个行业预置三件套，选行业即生效：
- **爆款句式库**：该行业验证过的钩子/文案句式
- **合规红线**：餐饮禁夸大功效、美业禁承诺效果、招商禁保收益
- **场景素材**：常用拍摄/数字人背景、字幕风格

---

## 五、数据库设计（Prisma）

```prisma
model MerchantProfile {
  id          String   @id
  userId      String
  industry    String
  category    String?
  storeName   String?
  signature   String?        // 招牌产品
  stage       String   @default("cold")   // cold|growing|mature
  goal        String   @default("fans")
  preference  Json?          // 音色/风格/字幕
  scripts     Script[]
  feedbacks   FeedbackMetric[]
}

model Script {
  id          String   @id
  merchantId  String
  skillType   String   // S1..S5
  content     Json             // JSON Schema 结果
  publishedAt DateTime?
  performance Json?            // 播放/完播/转化
  isViral     Boolean  @default(false)
}

model FeedbackMetric {
  id         String   @id
  scriptId   String
  plays      Int
  completion Float
  leads      Int?
}

model IndustryTemplate {
  id       String @id
  industry String @unique
  hooks    Json   // 爆款句式库
  redLines Json   // 合规红线
  assets   Json   // 场景素材
}
```

---

## 六、对接现有代码

| 现有资产 | 对接方式 |
|---------|---------|
| `app/scripts` / `app/generate` | 改造为「场景直选 + 极简表单」工作台入口 |
| OpenAI API（已有 key） | 用 structured output / function calling 调 Skill |
| Agnes API（数字人） | `render_params` 字段映射到 Agnes 口播参数 |
| Prisma + SQLite/Turso | 新增上面 4 张表 |
| `interview`（AI采访） | 复用：首次画像采集用采访对话而非填表 |
| 邮箱交付（已有） | 交付走内容日历 + 邮箱自动发送 |

**新增 API：**
- `POST /api/agent/generate` — 场景+表单 → 出稿（走 Skill + 校验 + 画像注入）
- `POST /api/agent/optimize` — S5 脚本优化
- `POST /api/agent/batch` — 批量生成 + 日历排期
- `POST /api/agent/feedback` — 爆款数据回填
- `GET  /api/agent/profile` — 画像读取/更新

---

## 七、落地分期

| 阶段 | 内容 | 里程碑 |
|------|------|--------|
| **P1** | 场景直选 + 极简表单 + S1-S5 JSON Schema + Profile 基础表 + 校验重试 | 按钮通道跑通，格式 100% 稳定 |
| **P2** | 一句话通道（意图调度）+ 反馈闭环 + 内容日历 + 批量引擎 | Agent 开始"越用越懂你" |
| **P3** | 行业模板库深化 + interview 画像采集 + 数据看板 + 爆款句式自动沉淀 | 飞轮成型 |

---

## 八、P1 落地实现（对接现有代码的真实方案）

> ⚠️ 重要发现：懒老板**已有大量基础设施**，P1 是"叠加 + 对接"，不是从零建。
> 现有资产：`/api/generate/scripts`（30条五模块生成）、`lib/knowledge`（痛点/口语句式/标题公式）、`lib/compliance`（违禁词）、`lib/openai`（客户端+JSON提取）、`IpProfile` 表（画像）。

### 已有 → 本设计映射

| 本设计 | 现有资产 | 关系 |
|--------|---------|------|
| 画像记忆层 | `IpProfile` 表（industry/product/pains/goal/videoScripts…） | **直接复用**，缺"账号阶段+爆款反馈"字段，P2 补 |
| Skill 引擎 | `/api/generate/scripts` 的 4 套 COACH_PROMPTS | **Skill1 的雏形**，扩展为 5 场景 |
| 行业模板库 | `lib/knowledge`（pain-points/oral-phrases/title-formulas） | **直接复用** |
| 风控 | `lib/compliance`（checkForbidden + forbidden.json） | **直接复用** |
| 渲染参数 | 现有 Agnes / digital-human API | 映射字段 |

### P1 具体交付物（按开发顺序）

1. **`lib/agent-skills.ts`**（新建）— 5 套 Skill 的 system prompt + 场景定义 + 输出 Schema
   - S1 标准方案 / S2 冷启动 / S3 转化招商 / S4 矩阵批量 / S5 脚本优化
   - 每个 Skill：`id / name / desc / systemPrompt / parse(校验)`
   - 复用现有 knowledge/compliance/openai lib

2. **`app/api/agent/generate/route.ts`**（新建）— 调度入口
   - 入参：`{ skillType, industry, product, targetCustomer, durationSec, note, profileId }`
   - 流程：读 IpProfile → 拼画像注入段 → 加载对应 Skill prompt → 调 OpenAI（JSON 强制）→ 校验重试 → 违禁词检测 → 返回
   - 画像注入示例：`你服务的是：{industry}·{product}，账号阶段：{stage}，目标：{goal}`

3. **`app/scripts/page.tsx`**（改造）— 场景直选 + 极简表单
   - 顶部加 5 个场景大按钮（标准/冷启动/转化/矩阵/优化）
   - 下方极简表单：行业[下拉，读 IpProfile 预填] + 目标[单选] + 时长[默认60s] + 一句话补充
   - 一键生成 → 调新 API → 展示结构化结果
   - 保留现有 30 条五模块视图作为「标准版」的展示（S1 对应现有能力）

4. **Prisma**（P1 只加字段，不加新表）
   - `IpProfile` 加 `accountStage String?`（cold/growing/mature）——P1 可选，不加也不阻塞

### P1 完成标准（gates）

- [ ] 5 个场景按钮可点，分别走对应 Skill
- [ ] 行业/产品从 IpProfile 自动注入，商家不用重填
- [ ] 输出为 JSON Schema 校验通过的结构化结果，后端可解析
- [ ] 违禁词检测复用现有 lib/compliance，标记违规条
- [ ] 新 API 与现有 `/api/generate/scripts` 共存，不影响老功能

### 待拍板（开发前）

- [ ] Skill 输出展示形式：新 API 返回结构 vs 复用现有 scripts 页 30 条视图？——建议：标准(S1)复用现有视图，冷启动/转化/矩阵/优化用新结构卡片展示

---

## 八、与原方案的差异（解决掉的问题）

| 原方案硬伤 | 本方案解法 |
|-----------|-----------|
| 无状态，「越用越懂你」是空话 | 新增**商家画像记忆层**，生成前注入 |
| 结构化输出靠 LLM 自觉 | **JSON Schema + function calling + 校验重试** |
| 需求横跨多 Skill 会拧巴 | 入口 A 的**表单强制单选场景**，批量需求走 S4 矩阵而非自由混合 |
| 快捷按钮被"主动反问"卡住 | 四要素改为**表单必填 + 默认值**，零反问 |
| 没有批量/日历/反馈 | 新增**批量引擎 + 内容日历 + 反馈闭环** |

---

*懒老板 · 2026-08-12 · AI 短视频生产系统设计 v2*
