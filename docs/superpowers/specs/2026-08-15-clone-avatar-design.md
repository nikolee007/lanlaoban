# 克隆分身工作台 · 设计文档

> 日期：2026-08-15
> 项目：懒老板（lanlaoban）
> 状态：已获 NIKO 老大确认

---

## 一、背景与目标

懒老板的商家用户（实体店老板）不愿/不会出镜，平台需要让老板"不出镜也能做内容"。

**核心定义澄清（老大拍板）：**
- "数字人"不是第三方数字人，而是**基于用户本人素材生成的克隆分身**——脸要像本人。
- 第一版目标是：**用户上传本人照片 → 生成老板克隆分身 → 结合产品 → 出预览图**。
- 产品可视化形态不固定，按用户需求走，做成可选模板。

**本次范围：**
1. 克隆分身 + 预览图完整链路（工作台 `/clone`）
2. 克隆分身引擎可插拔（第一版免费跑通，后期切高质量引擎）
3. **算力账户**（用户充值 → 余额 → 生成扣费，平台赚差价）
4. **引擎切换**（用户可无缝切换生成大模型）
5. 为后续 4 个 Agent（AI 操盘手 / AI 广告导演 / AI 编剧 / AI 数据专家）预留调用接口

**非本次范围：**
- 4 个 Agent 本体实现（后续阶段）
- 即梦/可灵等高质量引擎的正式接入（需付费 API，后期老大加大投资）
- 用户余额充值的完整对账/退款体系（第一版最小闭环）

---

## 二、产品定位：三层架构

```
┌─ Agent 层（预留）─────────────────────────────┐
│  AI 操盘手 / AI 广告导演 / AI 编剧 / AI 数据专家   │
│  → 调用 clone-engine 统一接口产出内容             │
├─ 能力底座 ─────────────────────────────────────┤
│  lib/clone-engine 可插拔引擎                    │
│  · Agnes（第一版·免费跑通·参考图方式）             │
│  · 即梦 / 可灵（预留·人脸身份保持·后期切换）        │
├─ 用户工作台 ────────────────────────────────────┤
│  /clone 页面：照片→分身→产品→形态→预览图          │
│  /clone 算力充值 + 引擎切换                       │
└────────────────────────────────────────────────┘
```

> 运营经验（Agent）是护城河；克隆分身/预览图/算力是 Agent 的内容生产与变现底座。

---

## 三、克隆分身引擎抽象

### 3.1 统一接口（`lib/clone-engine/`）

```ts
// lib/clone-engine/types.ts
export type CloneEngineId = 'agnes' | 'jimeng' | 'kling'

export interface CreateAvatarInput {
  photos: string[]        // 用户上传照片（dataURL 或 URL）
  prompt: string          // 分身形象描述（服装/场景/姿态）
  size?: string           // 默认 1024x1024
}

export interface CreatePreviewInput {
  avatarUrl: string       // 已生成的克隆分身图
  productImage?: string   // 产品图（可选，dataURL 或 URL）
  template: PreviewTemplate
  prompt: string          // 模板对应的提示词
  size?: string
}

export interface CloneEngine {
  id: CloneEngineId
  name: string            // 展示名，如 "Agnes 免费引擎"
  pricePerImage: number   // 定价（元/张），算力扣费依据
  costPerImage: number    // 估算成本（元/张），算差价参考
  status: 'active' | 'preview' | 'coming'
  createAvatar(input: CreateAvatarInput): Promise<{ url: string }>
  createPreview(input: CreatePreviewInput): Promise<{ url: string }>
}
```

### 3.2 引擎路由（`lib/clone-engine/index.ts`）

- 环境变量 `CLONE_ENGINE` 决定**默认引擎**（第一版 `agnes`）。
- 用户在工作台可显式选择引擎（存 localStorage / 请求参数），无选择时用默认。
- `getEngine(id?)` 返回引擎实例；未知 id → 回退默认。

### 3.3 引擎实现

| 引擎 | 文件 | 第一版状态 | 说明 |
|------|------|-----------|------|
| Agnes | `lib/clone-engine/agnes.ts` | ✅ active | 复用 `lib/agnes-api.ts` 的 `generateImage(prompt, size, referenceImage)`，用户照片/分身图做参考图 |
| 即梦 | `lib/clone-engine/jimeng.ts` | ⏳ coming | 预留：图生图 3.0 `id` 人脸参考 + `swap_face`，**脸像本人**核心引擎 |
| 可灵 | `lib/clone-engine/kling.ts` | ⏳ coming | 预留：`image_reference=face` 人脸参考，低成本批量 |

> 引擎实现类全部写好框架，`coming` 引擎的 `createAvatar/createPreview` 抛"尚未开通"错误，UI 置灰显示"即将上线"。

---

## 四、预览图形态模板

第一版 3 个模板（`lib/clone-engine/templates.ts`），可扩展：

| 模板 id | 名称 | 提示词要点 | 产品图参与 |
|---------|------|-----------|-----------|
| `owner_product` | 老板+产品同框 | 老板站门店/场景前，产品放身前展台 | ✅ 产品图做主视觉 |
| `owner_holding` | 老板手持产品 | 老板双手持产品对镜头展示 | ✅ 产品图（稳定性较差，标注"需多次重试"） |
| `storefront_scene` | 门店场景+产品 | 老板站门店招牌下，产品在门口 | ✅ 场景可由门店照或模板背景 |

模板数据结构：

```ts
export interface PreviewTemplate {
  id: string
  name: string
  desc: string
  requiresProduct: boolean   // 是否必须产品图
  buildPrompt(avatarDesc: string, productDesc: string): string
}
```

> **产品描述来源**：第一版不强依赖描述 —— 传了产品图时用通用描述（"用户展示的产品"）即可，参考图已携带产品外观；`ProductPicker` 提供选填"一句话产品说明"输入框，填了就注入提示词，增强生成效果。

---

## 五、数据模型（Prisma）

新增两个模型 + User 加余额字段：

```prisma
// 克隆分身资产（用户上传一次，永久复用）
model CloneAvatar {
  id          Int      @id @default(autoincrement())
  userId      Int
  name        String   @default("我的分身")  // 分身名称
  avatarUrl   String                         // 分身图 URL
  sourcePhoto String?                        // 用户原始照片（dataURL/URL，可选保留）
  engine      String   @default("agnes")     // 生成引擎
  status      String   @default("ready")     // ready / generating / failed
  createdAt   DateTime @default(now())

  user User @relation(fields: [userId], references: [id])
}

// 生成记录（算力扣费落点）
model CloneGeneration {
  id          Int      @id @default(autoincrement())
  userId      Int
  type        String   // avatar / preview
  engine      String   // 引擎 id
  template    String?  // 预览图模板 id（type=preview 时）
  chargedYuan Float    // 向用户扣费金额（元）
  status      String   @default("done")   // done / failed / refunded
  createdAt   DateTime @default(now())
}
```

User 模型加：

```prisma
  balanceYuan Float  @default(0)   // 算力余额（元）
```

> 数据库为 SQLite/Turso。`prisma migrate` 或手动 ALTER 均需兼容现有 `dev.db`。

---

## 六、算力账户（算力差价商业模式）

### 6.1 计费规则

- 每次生成（分身或预览图）按所选引擎的 `pricePerImage` 从余额扣费。
- 新用户赠送 **3 次免费生成**（对齐现有"3 次免费试用"逻辑），用 `CloneGeneration` 计数，满 3 次后需充值。
- 余额不足 → 返回 `{ error: 'insufficient_balance' }`，前端引导充值。
- 生成失败 → 不扣费（先检查余额，后扣费，扣费后失败则退款标记 `refunded`）。

### 6.2 充值流程

- `POST /api/clone/recharge`：登录用户输入金额 → 调虎皮椒下单（`trade_order_id` 用 `RCH-<userId>-<ts>`）→ 返回二维码。
- 回调 `POST /api/clone/recharge/notify`：验签 → 解析 `attach = recharge|<userId>|<amount>` → 给用户 `balanceYuan` 加钱 → 返回 success。幂等：以 `trade_order_id` 去重（首版用本地 Set/查库简单处理）。

### 6.3 差价模型

| 引擎 | 成本估算 | 定价 | 单张差价 |
|------|---------|------|---------|
| Agnes | ~0.05 元 | 0.5 元 | ~0.45 元 |
| 即梦 | 待定 | 待定 | 后期定 |
| 可灵 | ~0.2 元 | 1 元 | ~0.8 元 |

> 成本列仅估算参考，`CloneGeneration` 记录实际扣费，后期可加 `costYuan` 字段做毛利统计。

---

## 七、API 设计

| 接口 | 方法 | 鉴权 | 说明 |
|------|------|------|------|
| `/api/clone/avatar` | POST | ✅ | 上传照片 → 生成克隆分身，存 CloneAvatar，扣算力 |
| `/api/clone/preview` | POST | ✅ | 分身 + 产品 + 模板 → 生成预览图，存 CloneGeneration，扣算力 |
| `/api/clone/avatars` | GET | ✅ | 我的分身列表 |
| `/api/clone/engines` | GET | — | 可用引擎列表（含价格/状态），前端切换用 |
| `/api/clone/generate` | POST | ✅ | **Agent 预留通用入口**：`{ type, engine, template, ... }` 统一分发 |
| `/api/clone/recharge` | POST | ✅ | 算力充值下单（虎皮椒） |
| `/api/clone/recharge/notify` | POST | — | 充值回调验签入账 |

请求格式：
- `/api/clone/avatar`：`FormData`（photos[] + name）
- `/api/clone/preview`：`FormData`（avatarUrl + productImage? + template）
- `/api/clone/generate`：JSON（Agent 预留）

统一返回：
```json
{ "success": true, "data": { ... } }
{ "success": false, "error": "insufficient_balance" }
```

---

## 八、页面设计（/clone 工作台）

SaaS 现代风格，白底卡片，品牌主色 #FF6034。

### 8.1 流程（5 步）

| 步骤 | 组件 | 说明 |
|------|------|------|
| ① 上传本人照片 | `PhotoUpload` | 拖拽上传 1-3 张，"生成你的老板分身"；复用/参考现有 digital-human 上传组件 |
| ② 生成克隆分身 | `AvatarGenerate` | 进度展示 → 结果卡片（分身图 + 改名 + 重新生成）；存为账号资产 |
| ③ 选产品 | `ProductPicker` | 上传产品图（dataURL 预览）；预留产品库入口 |
| ④ 选形态模板 | `TemplatePicker` | 3 模板卡片 + 每模板说明/示例图 |
| ⑤ 出预览图 | `PreviewResult` | 生成中 → 结果大图 + 下载 / 复制分享 / 换模板重出 / 换引擎重出 |

### 8.2 引擎切换（贯穿流程）

- 右上角/生成步骤旁放**引擎选择器**（下拉或胶囊）：列出 `/api/clone/engines` 的可用引擎，标注价格；`coming` 引擎置灰"即将上线"。
- 选择后所有生成走该引擎，当前选择存 localStorage，下次进入记住。

### 8.3 算力账户入口

- 工作台顶部显示余额（如"算力 ¥12.5"）+ 「充值」按钮。
- 充值弹层：金额快捷选项（10/50/100/200）+ 虎皮椒二维码扫码。
- 余额不足时自动弹充值。

### 8.4 导航

- 顶部导航加「克隆分身」入口（Breadcrumb 文案"老板分身"）。
- 与现有 `/digital-human`（AI 数字人口播视频）并列，定位不同：本页**先出图**。

---

## 九、错误处理

| 场景 | 处理 |
|------|------|
| 未登录 | 401，跳登录（复用 `getAuthUserId` + middleware 保护 `/clone`） |
| 余额不足 | `insufficient_balance` → 前端弹充值 |
| 引擎不可用（coming） | 后端抛"尚未开通"，前端置灰不可选 |
| 生成失败 | 不扣费/退费标记 refunded，前端提示重试（换模板/换引擎） |
| 图片生成服务异常 | 捕获 Agnes 错误返回友好提示 + console.error 落日志 |
| 充值回调重复 | `trade_order_id` 去重，防重复入账 |
| 提交超时 | 前端 8 分钟轮询上限（复用 digital-human 逻辑） |

---

## 十、测试门禁（quality gates）

### 单元测试（vitest）
- `lib/clone-engine`：`getEngine` 路由/回退、`CreatePreview` 提示词构造、模板 `buildPrompt`
- 算力：余额扣费/免费次数/失败退款逻辑
- 支付：`xunhupaySign` 验签（复用现有测试思路）

### 集成测试（本地跑通）
1. 上传照片 → `POST /api/clone/avatar` → CloneAvatar 落库 + 余额扣费正确
2. 分身 + 产品 + 模板 → `POST /api/clone/preview` → 返回预览图 URL
3. 免费 3 次后第 4 次 → `insufficient_balance`
4. 充值回调验签 → 余额增加，重复回调不重复入账
5. `npm run build` 通过（TS 无错误）

### 门禁命令
```bash
npm run test        # 单测全过
npm run build       # 构建通过
```

---

## 十一、为 4 个 Agent 预留

现有 `lib/agent-skills.ts` 是 Skill 内核模式。克隆分身作为**能力底座**接入：

- Agent 通过 `POST /api/clone/generate` 统一生成入口调用，不关心底层引擎细节。
- 后续 AI 广告导演：选定模板 + 文案 → 调 clone-engine 出图；AI 操盘手：按画像批量排期生成。
- 引擎切换对 Agent 透明：Agent 只需指定质量档位（标准/高清），引擎层按档位路由。

---

## 十二、阶段计划

| 阶段 | 内容 | 状态 |
|------|------|------|
| **Phase 1（本次）** | 克隆分身工作台 + 预览图 + Agnes 引擎 + 算力账户最小闭环 + 引擎切换框架 | 本次交付 |
| Phase 2 | 即梦/可灵接入，人脸身份保持（脸像本人兑现） | 后期（老大加大投资后） |
| Phase 3 | 4 个 Agent 接入，Agent 调 clone-engine 批量生产 | 后续 |

---

## 十三、目录落地清单

```
lib/clone-engine/
  types.ts          # 接口定义
  templates.ts      # 3 个预览图模板
  index.ts          # 引擎路由 getEngine()
  agnes.ts          # Agnes 引擎（第一版 active）
  jimeng.ts         # 即梦引擎（coming 预留）
  kling.ts          # 可灵引擎（coming 预留）
app/clone/
  page.tsx          # 工作台主页面
  components/
    PhotoUpload.tsx      # ① 上传照片
    AvatarGenerate.tsx   # ② 生成分身
    ProductPicker.tsx    # ③ 选产品
    TemplatePicker.tsx   # ④ 选模板
    PreviewResult.tsx    # ⑤ 预览图
    EngineSelector.tsx   # 引擎切换
    RechargeModal.tsx    # 算力充值弹层
app/api/clone/
  avatar/route.ts        # POST 生成分身
  preview/route.ts       # POST 出预览图
  avatars/route.ts       # GET 我的分身
  engines/route.ts       # GET 引擎列表
  generate/route.ts      # POST Agent 预留通用入口
  recharge/route.ts      # POST 充值下单
  recharge/notify/route.ts  # POST 充值回调
prisma/schema.prisma     # CloneAvatar / CloneGeneration / User.balanceYuan
app/components/NavHeader.tsx  # 加「克隆分身」入口
```
