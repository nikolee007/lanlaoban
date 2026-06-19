/** @type {import('next').NextConfig} */
const nextConfig = {
  // 启用压缩
  compress: true,

  // 图片优化
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200],
  },

  // 模块导入优化 — 自动 tree-shake 大包
  experimental: {
    optimizePackageImports: ['react-icons/fi'],
  },
}
module.exports = nextConfig
