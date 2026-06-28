import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST /api/surgeries/bulk — bulk delete
// body: { ids: string[] }
export async function POST(req: NextRequest) {
  const body = await req.json()
  const ids: string[] = Array.isArray(body.ids) ? body.ids : []
  if (ids.length === 0) {
    return NextResponse.json({ error: 'No ids provided' }, { status: 400 })
  }
  const result = await db.surgery.deleteMany({ where: { id: { in: ids } } })
  return NextResponse.json({ success: true, deleted: result.count })
}
