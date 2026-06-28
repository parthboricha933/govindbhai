import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { COMMISSION_AMOUNT } from '@/lib/surgery'

// GET /api/analytics — returns dashboard stats + monthly series + breakdowns + reports
export async function GET(req: NextRequest) {
  const url = req.nextUrl
  const startDate = url.searchParams.get('startDate') || ''
  const endDate = url.searchParams.get('endDate') || ''
  const hospital = url.searchParams.get('hospital') || ''
  const village = url.searchParams.get('village') || ''
  const surgeryName = url.searchParams.get('surgeryName') || ''

  const where: any = { AND: [] }
  if (startDate) where.AND.push({ surgeryDate: { gte: new Date(startDate) } })
  if (endDate) {
    const e = new Date(endDate)
    e.setDate(e.getDate() + 1)
    where.AND.push({ surgeryDate: { lt: e } })
  }
  if (hospital) where.AND.push({ hospital })
  if (village) where.AND.push({ village: { contains: village } })
  if (surgeryName) where.AND.push({ surgeryName: { contains: surgeryName } })
  if (where.AND.length === 0) delete where.AND

  const all = await db.surgery.findMany({
    where,
    orderBy: { surgeryDate: 'desc' },
  })

  // Dashboard stats (ignoring date range filter for dashboard summary cards, but
  // we honor the date-range filter when present — used by the Reports page).
  const totalSurgeries = all.length
  const totalRevenue = all.reduce((s, r) => s + r.surgeryCharge, 0)
  const sadvichar = all.filter((r) => r.hospital === 'Sadvichar')
  const other = all.filter((r) => r.hospital === 'Other')
  const sadvicharSurgeries = sadvichar.length
  const sadvicharRevenue = sadvichar.reduce((s, r) => s + r.surgeryCharge, 0)
  const otherSurgeries = other.length
  const otherRevenue = other.reduce((s, r) => s + r.surgeryCharge, 0)
  const totalCommission = otherSurgeries * COMMISSION_AMOUNT

  // Today's surgeries
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const todayEnd = new Date(todayStart)
  todayEnd.setDate(todayEnd.getDate() + 1)
  const todaySurgeries = all.filter(
    (r) => r.surgeryDate >= todayStart && r.surgeryDate < todayEnd
  ).length

  // This month's surgeries
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const thisMonthSurgeries = all.filter((r) => r.surgeryDate >= monthStart).length

  // Monthly series (last 12 months) for charts
  const monthlyMap = new Map<string, { surgeries: number; revenue: number; commission: number }>()
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    monthlyMap.set(key, { surgeries: 0, revenue: 0, commission: 0 })
  }
  for (const r of all) {
    const key = `${r.surgeryDate.getFullYear()}-${String(r.surgeryDate.getMonth() + 1).padStart(2, '0')}`
    if (monthlyMap.has(key)) {
      const e = monthlyMap.get(key)!
      e.surgeries += 1
      e.revenue += r.surgeryCharge
      e.commission += r.commission
    }
  }
  const monthlySeries = Array.from(monthlyMap.entries()).map(([k, v]) => {
    const [y, m] = k.split('-')
    const label = new Date(Number(y), Number(m) - 1, 1).toLocaleDateString('en-IN', {
      month: 'short',
      year: '2-digit',
    })
    return { month: label, ...v }
  })

  // Hospital-wise breakdown
  const hospitalBreakdown = [
    { hospital: 'Sadvichar', surgeries: sadvicharSurgeries, revenue: sadvicharRevenue },
    { hospital: 'Other', surgeries: otherSurgeries, revenue: otherRevenue },
  ]

  // Village-wise breakdown (top 15)
  const villageMap = new Map<string, number>()
  for (const r of all) {
    villageMap.set(r.village, (villageMap.get(r.village) || 0) + 1)
  }
  const villageBreakdown = Array.from(villageMap.entries())
    .map(([village, count]) => ({ village, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15)

  // Surgery name frequency (most common)
  const surgeryMap = new Map<string, number>()
  for (const r of all) {
    surgeryMap.set(r.surgeryName, (surgeryMap.get(r.surgeryName) || 0) + 1)
  }
  const surgeryBreakdown = Array.from(surgeryMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)

  // Report stats — charge stats only consider Other Hospital records
  // (Sadvichar Hospital surgeries have no charge recorded, since you work there)
  const otherRecords = all.filter((r) => r.hospital === 'Other')
  const charges = otherRecords.map((r) => r.surgeryCharge)
  const otherTotalRevenue = charges.reduce((s, c) => s + c, 0)
  const averageCharge = charges.length ? otherTotalRevenue / charges.length : 0
  const highestCharge = charges.length ? Math.max(...charges) : 0
  const lowestCharge = charges.length ? Math.min(...charges) : 0

  return NextResponse.json({
    dashboard: {
      totalSurgeries,
      totalRevenue,
      sadvicharSurgeries,
      sadvicharRevenue,
      otherSurgeries,
      otherRevenue,
      totalCommission,
      todaySurgeries,
      thisMonthSurgeries,
    },
    report: {
      totalSurgeries,
      totalRevenue: otherTotalRevenue,
      totalCommission,
      averageCharge,
      highestCharge,
      lowestCharge,
    },
    monthlySeries,
    hospitalBreakdown,
    villageBreakdown,
    surgeryBreakdown,
    records: all,
  })
}
