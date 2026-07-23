import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/** 需要登录才能访问的路由 */
const PROTECTED_PATHS = [
  '/global-supply/cart',
  '/global-supply/orders',
  '/global-supply/inquiries',
  '/global-supply/my-resources',
  '/global-supply/checkout',
  '/interview',
  '/brand-promotion',
  '/myshop',
  '/profile',
  '/settings',
  '/persona',
  '/digital-human',
  '/admin',
  '/api/ai-assistant',
  '/api/chat',
  '/api/copilotkit',
  '/api/shop/generate',
  '/api/admin',
]

/** 始终公开的路由（无需登录） */
const PUBLIC_PATHS = [
  '/',
  '/login',
  '/pricing',
  '/faq',
  '/about',
  '/terms',
  '/privacy',
  '/coming-soon',
  '/global-supply/ai-assistant',
  '/api/auth/login',
  '/api/auth/register',
  '/api/global-supply',
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 跳过公开路由
  if (PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))) {
    return NextResponse.next()
  }

  // 检查是否是受保护路由
  const isProtected = PROTECTED_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))

  if (isProtected) {
    // 从 cookie 或 Authorization header 读取 token
    const token = request.cookies.get('lanlaoban_token')?.value
      || request.headers.get('authorization')?.replace('Bearer ', '')

    if (!token) {
      // 对 API 请求返回 JSON 401
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { success: false, error: '请先登录', needsAuth: true },
          { status: 401 },
        )
      }
      // 对页面请求重定向到登录页
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // 排除静态资源
    '/((?!_next/static|_next/image|favicon.ico|public|product-images|images).*)',
  ],
}
