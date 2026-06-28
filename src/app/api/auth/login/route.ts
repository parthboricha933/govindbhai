import { NextRequest, NextResponse } from 'next/server'
import { verifyCredentials, createSession } from '@/lib/auth'
import { db } from '@/lib/db'

// POST /api/auth/login
// Body: { username, password }
// If no admin exists yet, seed the default admin/admin123 automatically.
export async function POST(req: NextRequest) {
  const body = await req.json()
  const username = String(body.username || '').trim()
  const password = String(body.password || '')

  if (!username || !password) {
    return NextResponse.json({ error: 'Username and password required' }, { status: 400 })
  }

  // Auto-seed default admin if table empty (defensive — should already exist)
  const count = await db.adminUser.count()
  if (count === 0) {
    await db.adminUser.create({ data: { username: 'admin', password: 'admin123' } })
  }

  const ok = await verifyCredentials(username, password)
  if (!ok) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }
  await createSession(username)
  return NextResponse.json({ success: true, username })
}
