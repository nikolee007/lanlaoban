# 数字人口播视频模块 — 设计文档

## 概述

在懒老板平台增加 AI 数字人口播视频生成功能。核心原则：**借势**。有免费 API 直接调用，有开源项目部署接入，用户能自己做的引导用户做，平台只负责编排、模板和 UI。

## 分期

| 阶段 | 内容 | 借势来源 | 状态 |
|------|------|---------|------|
| **P0** | 数字口播视频生成 | Agnes video API + image API | 本期实现 |
| **P1** | 声音合成 | 开源TTS（GPT-SoVITS/CosyVoice） | 后续 |
| **P2** | 声音克隆 | 开源声音克隆 | 后续 |

## P0 实现范围

### 用户流程

```
首页/ai-video → 数字人入口 → ①选场景 → ②传照片 → ③写/选脚本 → ④生成预览
```

### 场景模板（首批 6 个）

| 场景 | 姿势描述 | 适合行业 | 参考图 |
|------|---------|---------|-------|
| 站立口播 | 正面站立，背景门店/车间 | 餐饮、工厂、门店 | existing |
| 坐姿访谈 | 坐办公桌/吧台前 | 知识博主、顾问 | existing |
| 走姿讲解 | 边走边讲，展示环境 | 探店、工厂参观 | existing |
| 产品展示 | 手持产品，特写讲解 | 好物测评 | existing |
| 厨房操作台 | 站灶台前 | 餐饮、手工艺 | existing |
| 门店招牌前 | 站店门口/招牌下 | 所有实体店 | existing |

### API 对接

**Agnes Image API** — POST `https://apihub.agnes-ai.com/v1/images/generations`
- 模型：`agnes-image-2.1-flash`
- 用途：根据用户照片 + 场景描述生成数字人形象

**Agnes Video API** — POST `https://apihub.agnes-ai.com/v1/video/generations`
- 模型：`agnes-video-v2.0`
- 用途：图片 → 数字人口播视频
- 异步任务模式：提交 → 轮询 task_id → 获取结果

### 页面结构

```
/digital-human/page.tsx
  ├── StepSelect (场景模板选择)
  ├── StepUpload (照片上传 + 拍摄引导)
  ├── StepScript (脚本填写/选择)
  ├── StepGenerate (生成进度 + 预览)
  └── StepResult (下载/分享)
```

### 技术要点

1. 任务队列：Video API 一次只能跑 1 个任务，需队列管理
2. 图片缓存：生成的数字人形象图片可复用
3. 进度反馈：轮询 task_id 状态 → 实时显示进度
4. 引导链路：每步都有"建议用美图秀秀/豆包处理"提示

### 数据流

```
用户上传照片 → (可选) Image API 生成优化形象
  → 结合场景模板 + 脚本 → Video API 提交任务
  → 轮询直至完成 → 返回视频 URL → 用户预览下载
```
