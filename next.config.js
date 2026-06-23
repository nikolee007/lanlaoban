/** @type {import('next').NextConfig} */
const nextConfig = {
  // 启用压缩
  compress: true,

  // 图片优化
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    remotePatterns: [
      { protocol: 'https', hostname: 'flagcdn.com' },
      { protocol: 'https', hostname: '**.alicdn.com' },
      { protocol: 'https', hostname: '**.1688.com' },
      { protocol: 'https', hostname: '**.aliyuncs.com' },
      { protocol: 'https', hostname: '**.qcloud.com' },
      { protocol: 'https', hostname: '**.myqcloud.com' },
    ],
  },

  // 模块导入优化 — 自动 tree-shake 大包
  experimental: {
    optimizePackageImports: ['react-icons/fi'],
  },
}
module.exports = nextConfig
