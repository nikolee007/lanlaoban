import { tursoDb } from './turso'
import { db } from './db'
import { isDemoAccount } from './clone-billing'

const TURSO = !!process.env.TURSO_DATABASE_URL

/** 付费门控：demo 账号豁免，其余需 serviceActive（付费后才运作） */
export async function requireServiceActive(userId: number): Promise<{ ok: true } | { ok: false }> {
  try {
    if (await isDemoAccount(userId)) return { ok: true }
    if (TURSO) {
      const s = await tursoDb.getUserServiceStatus(userId)
      return s.serviceActive ? { ok: true } : { ok: false }
    }
    const user = await db.user.findUnique({ where: { id: userId }, select: { serviceActive: true } })
    return user?.serviceActive ? { ok: true } : { ok: false }
  } catch (e) {
    console.error('[service-gate]', e)
    return { ok: false }
  }
}

/** 门控未过时的统一错误响应（引导开通） */
export function serviceRequiredResponse() {
  return { success: false, error: '请先开通服务，懒老板才能为你制作短视频' }
}
