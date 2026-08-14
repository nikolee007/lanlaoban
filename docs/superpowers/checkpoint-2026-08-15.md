# 克隆分身工作台 · 开发完成记录（2026-08-15）

## 交付内容

| 模块 | 路径 | 说明 |
|------|------|------|
| 引擎层 | `lib/clone-engine/` | 可插拔：Agnes active / 即梦·可灵 coming 预留 |
| 计费层 | `lib/clone-billing.ts` | 前3次免费 → 按引擎扣余额，失败退款 |
| API 层 | `app/api/clone/` | 8 个路由（含 Agent 预留入口 + 充值回调） |
| 页面层 | `app/clone/` | 5 步工作台 + 引擎切换 + 充值弹层 |
| 数据库 | `prisma/` + `lib/turso.ts` | CloneAvatar/CloneGeneration 表 + User.balanceYuan，双模式 |
| 集成 | NavHeader + middleware + i18n | 「克隆分身」入口，三语言，/clone 保护 |

## 验证门禁

```
✓ npm run test — clone-engine 5 项单测全过
✓ npm run build — 构建通过，/clone 页面产物生成
✓ 全链路实测（dev.db + 真实 Agnes）:
  - 分身生成成功 13s (mode:free)
  - 免费额度: 3条免费, 第4次触发"余额不足，请先充值"
  - 付费: 模拟充值5元 → preview 12.6s (mode:paid), 扣0.5 余额4.5
  - 失败退款: 中断记录 refunded 不扣钱
  - 充值回调: 无签名返回 fail（验签拦截）
  - 认证: 未登录 401
```

## L2 三步深度审查

```
[审查] 克隆分身关键路径 4 条 + 资源 3 处
  - 分身生成: 参数边界(photos空/超3张) ✓ 免费/付费分支 ✓ 失败退款 ✓ 引擎coming拦截 ✓
  - 预览图生成: 模板requiresProduct校验 ✓ 产品图可选 ✓ 余额不足402 ✓ buildPrompt注入 ✓
  - 充值: 金额校验 ✓ 验签 ✓ 幂等去重 ✓ 双模式入账 ✓
  - 引擎路由: 未知id回退 ✓ CLONE_ENGINE配coming引擎时回退active ✓(修复)
  - 资源: Agnes fetch 60s超时+clearTimeout ✓ DB try/catch+日志 ✓ 无泄漏定时器 ✓
```

## 已知边界（可接受）

- 充值幂等用进程内 Set（serverless 多实例需换 DB 订单表，spec 已注明）
- 免费次数按生成记录总数计（含失败），失败也占免费额度（spec 设计如此，可后续优化）
- 产品图以 dataURL 传参（≤几百KB 可接受；大图后期上对象存储）

## 待办（后续）

1. 部署前配置 `NEXT_PUBLIC_SITE_URL`（充值回调 notifyUrl 用）
2. Phase 2：即梦/可灵接入（人脸身份保持，脸像本人兑现）
3. Phase 3：4 个 Agent 调 `/api/clone/generate` 批量生产
4. 商业化文档：首页文案/商业计划书/宣传脚本/服务须知（可并行产出）
