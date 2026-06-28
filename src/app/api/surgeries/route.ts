import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { calculateCommission } from '@/lib/surgery'

// GET /api/surgeries — list with optional filters
export async function GET(req: NextRequest) {
  const url = req.nextUrl
  const search = url.searchParams.get('search') || ''
  const hospital = url.searchParams.get('hospital') || ''
  const village = url.searchParams.get('village') || ''
  const surgeryName = url.searchParams.get('surgeryName') || ''
  const startDate = url.searchParams.get('startDate') || ''
  const endDate = url.searchParams.get('endDate') || ''
  const date = url.searchParams.get('date') || ''
  const limit = Number(url.searchParams.get('limit') || 0)

  const where: any = { AND: [] }

  if (search) {
    where.AND.push({
      OR: [
        { patientName: { contains: search } },
        { village: { contains: search } },
        { surgeryName: { contains: search } },
        { hospital: { contains: search } },
        { notes: { contains: search } },
      ],
    })
  }
  if (hospital) where.AND.push({ hospital })
  if (village) where.AND.push({ village: { contains: village } })
  if (surgeryName) where.AND.push({ surgeryName: { contains: surgeryName } })
  if (date) {
    const d = new Date(date)
    const next = new Date(d)
    next.setDate(next.getDate() + 1)
    where.AND.push({ surgeryDate: { gte: d, lt: next } })
  }
  if (startDate) {
    where.AND.push({ surgeryDate: { gte: new Date(startDate) } })
  }
  if (endDate) {
    const e = new Date(endDate)
    e.setDate(e.getDate() + 1)
    where.AND.push({ surgeryDate: { lt: e } })
  }

  if (where.AND.length === 0) delete where.AND

  const records = await db.surgery.findMany({
    where,
    orderBy: { surgeryDate: 'desc' },
    ...(limit > 0 ? { take: limit } : {}),
  })

  return NextResponse.json({ data: records })
}

// POST /api/surgeries — create a new surgery record
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { patientName, village, surgeryName, surgeryDate, hospital, surgeryCharge, notes } = body

  if (!patientName || !village || !surgeryName || !surgeryDate || !hospital) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    )
  }

  const charge = Number(surgeryCharge) || 0
  const commission = calculateCommission(hospital, charge)

  const record = await db.surgery.create({
    data: {
      patientName: String(patientName).trim(),
      village: String(village).trim(),
      surgeryName: String(surgeryName).trim(),
      surgeryDate: new Date(surgeryDate),
      hospital,
      surgeryCharge: charge,
      commission,
      notes: notes ? String(notes).trim() : null,
    },
  })

  return NextResponse.json({ data: record }, { status: 201 })
}
