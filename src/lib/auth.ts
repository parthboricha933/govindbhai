import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import crypto from 'crypto'

// Simple session token store using cookies.
// In production you would use NextAuth + JWT, but this is sufficient for the app's scope.

const SESSION_COOKIE = 'surgery_admin_session'
const SESSION_SECRET = process.env.SESSION_SECRET || 'sadvichar-surgery-secret-2024'

function sign(payload: string): string {
  const hmac = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex')
  return `${payload}.${hmac}`
}

function verify(token: string): string | null {
  const [payload, sig] = token.split('.')
  if (!payload || !sig) return null
  const expected = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex')
  if (sig !== expected) return null
  return payload
}

export async function createSession(username: string): Promise<void> {
  const expires = Date.now() + 1000 * 60 * 60 * 24 // 24 hours
  const payload = `${username}:${expires}`
  const token = sign(payload)
  const store = await cookies()
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24,
  })
}

export async function destroySession(): Promise<void> {
  const store = await cookies()
  store.delete(SESSION_COOKIE)
}

export async function getSessionUser(): Promise<string | null> {
  const store = await cookies()
  const token = store.get(SESSION_COOKIE)?.value
  if (!token) return null
  const payload = verify(token)
  if (!payload) return null
  const [username, expires] = payload.split(':')
  if (!username || !expires) return null
  if (Number(expires) < Date.now()) return null
  return username
}

export async function verifyCredentials(username: string, password: string): Promise<boolean> {
  const user = await db.adminUser.findUnique({ where: { username } })
  if (!user) return false
  return user.password === password
}
