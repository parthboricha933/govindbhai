import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST /api/surgeries/duplicate — duplicate a record by id
// body: { id: string }
export async function POST(req: NextRequest) {
  const body = await req.json()
  const id = body.id
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  }
  const original = await db.surgery.findUnique({ where: { id } })
  if (!original) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  const copy = await db.surgery.create({
    data: {
      patientName: original.patientName,
      village: original.village,
      surgeryName: original.surgeryName,
      surgeryDate: original.surgeryDate,
      hospital: original.hospital,
      surgeryCharge: original.surgeryCharge,
      commission: original.commission,
      notes: original.notes,
    },
  })
  return NextResponse.json({ data: copy }, { status: 201 })
}
