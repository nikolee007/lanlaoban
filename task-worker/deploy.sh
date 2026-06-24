#!/bin/bash
# ============================================
# 懒老板 Task Worker 部署脚本
# 在腾讯云服务器 (124.222.200.151) 上执行
# ============================================
set -e

echo "🚀 开始部署 Task Worker..."

# 1. 创建目录
echo "📁 创建目录..."
mkdir -p /app/task-worker/data
cd /app/task-worker

# 2. 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js 18+"
    echo "   curl -fsSL https://deb.nodesource.com/setup_20.x | bash -"
    echo "   apt-get install -y nodejs"
    exit 1
fi

echo "✅ Node.js $(node --version)"

# 3. 复制文件（从本地上传或从 git 拉取）
# 方式A: scp 上传（在本地执行）
#   scp -r task-worker/* root@124.222.200.151:/app/task-worker/
#
# 方式B: Git 拉取（在服务器执行）
#   cd /app/task-worker && git pull

echo "📦 安装依赖..."
npm install --production

# 4. 配置环境变量
if [ ! -f .env ]; then
    echo "⚙️  创建 .env 文件..."
    cp .env.example .env
    echo "⚠️  请编辑 /app/task-worker/.env 设置正确配置"
fi

# 5. 安装 systemd 服务
echo "🔧 安装 systemd 服务..."
cp task-worker.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable task-worker
systemctl restart task-worker

# 6. 等待启动
sleep 2

# 7. 健康检查
echo "🏥 健康检查..."
if curl -sf http://localhost:8892/health > /dev/null 2>&1; then
    echo "✅ Task Worker 启动成功！"
    curl -s http://localhost:8892/health | python3 -m json.tool 2>/dev/null || curl -s http://localhost:8892/health
else
    echo "❌ 启动失败，查看日志: journalctl -u task-worker -n 50"
    exit 1
fi

# 8. 测试 API
echo ""
echo "🧪 测试 API..."
TASK_RESULT=$(curl -s -X POST http://localhost:8892/api/task \
  -H "Content-Type: application/json" \
  -d '{"type":"brand_promotion","input":{"productName":"部署测试"}}')
echo "$TASK_RESULT" | python3 -m json.tool 2>/dev/null || echo "$TASK_RESULT"

echo ""
echo "========================================"
echo "✅ 部署完成！"
echo ""
echo "API 端点:"
echo "  POST http://124.222.200.151:8892/api/task    创建任务"
echo "  GET  http://124.222.200.151:8892/api/task/:id 查询任务"
echo "  GET  http://124.222.200.151:8892/api/tasks     最近任务列表"
echo "  GET  http://124.222.200.151:8892/health        健康检查"
echo ""
echo "管理命令:"
echo "  systemctl status task-worker    查看状态"
echo "  systemctl restart task-worker   重启服务"
echo "  journalctl -u task-worker -f    查看日志"
echo "========================================"
