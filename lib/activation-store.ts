/**
 * 洋葱一键出海 · 激活码存储层
 * 本地（Prisma/SQLite）与生产（Turso 直连）双后端，按 TURSO_DATABASE_URL 切换
 */
import { db } from '@/lib/db'
import { tursoActivation } from '@/lib/turso'

export const TURSO_ENABLED = !!process.env.TURSO_DATABASE_URL

export interface ActivationCodeRow {
  id: number
  code: string
  cid: string
  expiresAt: Date | string
  maxDevices: number
  status: string
  createdBy: number | null
  createdAt: Date | string
  activatedAt: Date | string | null
}

export async function getCodeByCode(code: string) {
  if (TURSO_ENABLED) return tursoActivation.getCodeByCode(code)
  return db.activationCode.findUnique({ where: { code } })
}

export async function getCodeByCid(cid: string) {
  if (TURSO_ENABLED) return tursoActivation.getCodeByCid(cid)
  return db.activationCode.findUnique({ where: { cid } })
}

export async function insertCode(code: string, cid: string, expiresAt: Date, maxDevices: number, createdBy: number | null) {
  if (TURSO_ENABLED) return tursoActivation.insertCode(code, cid, expiresAt.toISOString(), maxDevices, createdBy)
  return db.activationCode.create({ data: { code, cid, expiresAt, maxDevices, createdBy } })
}

export async function updateCodeStatus(cid: string, status: string, activatedAt?: Date | null) {
  if (TURSO_ENABLED) return tursoActivation.updateCodeStatus(cid, status, activatedAt ? activatedAt.toISOString() : null)
  return db.activationCode.update({ where: { cid }, data: { status, activatedAt: activatedAt ?? null } })
}

export async function getActivation(codeId: number, fp: string) {
  if (TURSO_ENABLED) return tursoActivation.getActivation(codeId, fp)
  return db.activation.findUnique({
    where: { codeId_deviceFingerprint: { codeId, deviceFingerprint: fp } },
  })
}

export async function insertActivation(codeId: number, fp: string, token: string, validUntil: Date) {
  if (TURSO_ENABLED) return tursoActivation.insertActivation(codeId, fp, token, validUntil.toISOString())
  return db.activation.create({ data: { codeId, deviceFingerprint: fp, token, validUntil } })
}

export async function touchHeartbeat(id: number, time = new Date()) {
  if (TURSO_ENABLED) return tursoActivation.touchHeartbeat(id, time.toISOString())
  return db.activation.update({ where: { id }, data: { lastHeartbeatAt: time } })
}

export async function countAct(codeId: number) {
  if (TURSO_ENABLED) return tursoActivation.countAct(codeId)
  return db.activation.count({ where: { codeId } })
}

export async function listCodes(limit = 100) {
  if (TURSO_ENABLED) return tursoActivation.listCodes(limit)
  return db.activationCode.findMany({
    orderBy: { id: 'desc' },
    take: limit,
    include: { _count: { select: { activations: true } } },
  })
}

/** 用户自己生成的激活码（登录购买联动） */
export async function listCodesByUser(userId: number) {
  if (TURSO_ENABLED) {
    // Turso 简单查询
    const all = await tursoActivation.listCodes(1000)
    return all.filter((c) => Number(c.createdBy) === userId)
  }
  return db.activationCode.findMany({
    where: { createdBy: userId },
    orderBy: { id: 'desc' },
    include: { _count: { select: { activations: true } } },
  })
}
