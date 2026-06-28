import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'

export async function GET() {
  const username = await getSessionUser()
  return NextResponse.json({ authenticated: !!username, username })
}
