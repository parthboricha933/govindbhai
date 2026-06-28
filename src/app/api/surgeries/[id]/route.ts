import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { calculateCommission } from '@/lib/surgery'

// PUT /api/surgeries/[id] — update
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()
  const existing = await db.surgery.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const hospital = body.hospital ?? existing.hospital
  const charge = Number(body.surgeryCharge ?? existing.surgeryCharge) || 0
  const commission = calculateCommission(hospital, charge)

  const updated = await db.surgery.update({
    where: { id },
    data: {
      patientName: body.patientName?.trim() ?? existing.patientName,
      village: body.village?.trim() ?? existing.village,
      surgeryName: body.surgeryName?.trim() ?? existing.surgeryName,
      surgeryDate: body.surgeryDate ? new Date(body.surgeryDate) : existing.surgeryDate,
      hospital,
      surgeryCharge: charge,
      commission,
      notes: body.notes !== undefined ? (body.notes ? String(body.notes).trim() : null) : existing.notes,
    },
  })

  return NextResponse.json({ data: updated })
}

// DELETE /api/surgeries/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const existing = await db.surgery.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  await db.surgery.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
