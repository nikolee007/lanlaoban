# Task Worker 部署指南

## 架构

```
Vercel (懒老板前端)                    腾讯云 (124.222.200.151:8892)
┌───────────────────┐                 ┌──────────────────────────┐
│ POST /api/task     │── HTTP ──→     │ task-worker (Express)     │
│ GET /api/task/:id  │←── HTTP ──     │ ├ SQLite (better-sqlite3) │
│                    │                 │ └ Processor (轮询处理)    │
│ Vercel 按需调用     │                 │   ├ 文案 (→ Vercel API)  │
│ 不干扰现有项目       │                 │   ├ 翻译 (→ Vercel API)  │
└───────────────────┘                 │   ├ TTS  (→ Vercel API)  │
                                      │   ├ 渲染 (→ Vercel API)  │
                                      │   └ 数字人(→ Agnes API)  │
                                      └──────────────────────────┘
```

## 文件说明

| 文件 | 功能 |
|------|------|
| `server.js` | Express API 服务 (端口 8892) |
| `db.js` | SQLite 数据库操作 (better-sqlite3) |
| `processor.js` | 后台任务处理引擎 |
| `package.json` | 依赖配置 |
| `.env.example` | 环境变量模板 |
| `task-worker.service` | systemd 服务配置 |
| `deploy.sh` | 一键部署脚本 |

## API 文档

### POST /api/task — 创建任务

```bash
curl -X POST http://124.222.200.151:8892/api/task \
  -H "Content-Type: application/json" \
  -d '{
    "type": "brand_promotion",
    "input": {
      "productName": "智能咖啡机",
      "sellingPoints": "30秒出杯,静音研磨",
      "style": "professional",
      "languages": ["zh", "en"],
      "duration": 60
    }
  }'
```

响应:
```json
{
  "success": true,
  "taskId": "abc-123-def",
  "message": "任务已创建 (abc-123-def)"
}
```

### GET /api/task/:id — 查询任务

```bash
curl http://124.222.200.151:8892/api/task/abc-123-def
```

响应 (pending):
```json
{
  "success": true,
  "data": {
    "id": "abc-123-def",
    "type": "brand_promotion",
    "status": "pending",
    "progress": 0,
    "step": "等待处理",
    "output_data": {},
    "created_at": "2026-06-24T03:00:00.000Z"
  }
}
```

响应 (processing):
```json
{
  "data": {
    "status": "processing",
    "progress": 30,
    "step": "配音生成中 (1/2: zh)..."
  }
}
```

响应 (done):
```json
{
  "data": {
    "status": "done",
    "progress": 100,
    "step": "全部完成",
    "output_data": {
      "scripts": {"zh": "...", "en": "..."},
      "audioResults": {"zh": {"audioData": "...", "source": "moss-tts"}},
      "renderConfig": {...},
      "digitalHuman": {"taskId": "..."}
    }
  }
}
```

### GET /api/tasks — 最近任务列表

```bash
curl http://124.222.200.151:8892/api/tasks?limit=10
```

### GET /health — 健康检查

```bash
curl http://124.222.200.151:8892/health
# {"ok": true, "uptime": 3600}
```

## 任务状态流转

```
pending → processing → done
                    → error
```

## 任务类型

### brand_promotion (品牌宣传视频)
5 步流水线:
1. **生成文案** (25%) — AI 多语言脚本
2. **配音生成** (25%) — TTS 每语言一个音频
3. **视频配置** (30%) — 渲染参数
4. **数字人** (20%) — Agnes 视频

### persona (人设生成)
4 步流水线:
1. **生成人设** (25%) — 昵称/Slogan/简介
2. **生成脚本** (20%) — 口播脚本
3. **配音生成** (25%) — TTS
4. **数字人** (30%) — Agnes 视频

## 部署步骤

### 前置条件
- 腾讯云服务器已安装 Node.js 18+
- 服务器可通过 SSH 访问

### 方式一：一键部署（推荐）

```bash
# 在本地打包文件
cd /Users/Zhuanz/projects/lanlaoban
tar czf task-worker.tar.gz task-worker/

# 上传到服务器
scp task-worker.tar.gz root@124.222.200.151:/tmp/

# SSH 到服务器执行
ssh root@124.222.200.151
cd /tmp
tar xzf task-worker.tar.gz
mv task-worker /app/
cd /app/task-worker
bash deploy.sh
```

### 方式二：手动部署

```bash
# 1. SSH 到服务器
ssh root@124.222.200.151

# 2. 创建目录和文件
mkdir -p /app/task-worker/data
cd /app/task-worker

# 3. 创建文件（将本地文件内容复制过去）
# package.json, db.js, processor.js, server.js

# 4. 安装依赖
npm install --production

# 5. 配置环境
cp .env.example .env
# 编辑 .env 确认 API_BASE 等配置

# 6. 启动测试
PORT=8892 DB_PATH=/app/task-worker/data/tasks.db node server.js

# 7. 确认健康检查通过后 Ctrl+C，安装 systemd 服务
cp task-worker.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable --now task-worker
```

### 验证部署

```bash
# 健康检查
curl http://124.222.200.151:8892/health

# 创建测试任务
curl -X POST http://124.222.200.151:8892/api/task \
  -H "Content-Type: application/json" \
  -d '{"type":"brand_promotion","input":{"productName":"测试"}}'

# 查看服务状态
systemctl status task-worker

# 查看日志
journalctl -u task-worker -f
```

## 前端集成

Vercel 前端调用 task-worker 的方式：

```typescript
// 创建异步任务
const res = await fetch('http://124.222.200.151:8892/api/task', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ type: 'brand_promotion', input: {...} })
})
const { taskId } = await res.json()

// 轮询任务状态
const poll = setInterval(async () => {
  const res = await fetch(`http://124.222.200.151:8892/api/task/${taskId}`)
  const { data } = await res.json()
  if (data.status === 'done' || data.status === 'error') {
    clearInterval(poll)
    // 处理结果
  }
}, 3000)
```

## Nginx 反向代理（可选）

如果需要通过域名访问，在 Nginx 中添加:

```nginx
location /task/ {
    proxy_pass http://127.0.0.1:8892/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_read_timeout 300s;
}
```

这样前端可以通过 `https://lenboss.win/task/api/task` 访问，避免跨域问题。

## 运维命令

```bash
systemctl start task-worker      # 启动
systemctl stop task-worker       # 停止
systemctl restart task-worker    # 重启
systemctl status task-worker     # 查看状态
journalctl -u task-worker -f     # 实时日志
journalctl -u task-worker -n 100 # 最近 100 行日志
```
