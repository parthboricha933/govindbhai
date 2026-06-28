import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { formatDate } from '@/lib/surgery'

// GET /api/export?format=csv|excel|pdf&...filters
// CSV / Excel are both produced as CSV here (Excel opens CSV natively).
// PDF is produced as a minimal print-ready HTML payload that the browser can print to PDF,
// keeping the project dependency-light.
export async function GET(req: NextRequest) {
  const url = req.nextUrl
  const format = (url.searchParams.get('format') || 'csv').toLowerCase()
  const search = url.searchParams.get('search') || ''
  const hospital = url.searchParams.get('hospital') || ''
  const village = url.searchParams.get('village') || ''
  const surgeryName = url.searchParams.get('surgeryName') || ''
  const startDate = url.searchParams.get('startDate') || ''
  const endDate = url.searchParams.get('endDate') || ''

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
  if (startDate) where.AND.push({ surgeryDate: { gte: new Date(startDate) } })
  if (endDate) {
    const e = new Date(endDate)
    e.setDate(e.getDate() + 1)
    where.AND.push({ surgeryDate: { lt: e } })
  }
  if (where.AND.length === 0) delete where.AND

  const records = await db.surgery.findMany({
    where,
    orderBy: { surgeryDate: 'desc' },
  })

  const rows = records.map((r) => ({
    Date: formatDate(r.surgeryDate),
    'Patient Name': r.patientName,
    Village: r.village,
    'Surgery Name': r.surgeryName,
    Hospital: r.hospital,
    'Surgery Charge': r.surgeryCharge,
    Commission: r.commission,
    Notes: r.notes || '',
  }))

  if (format === 'pdf') {
    const html = buildPdfHtml(rows)
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="surgery-records.html"`,
      },
    })
  }

  // CSV (works for both csv and excel)
  const csv = buildCsv(rows)
  const ext = format === 'excel' ? 'csv' : 'csv'
  return new NextResponse(csv, {
    headers: {
      'Content-Type': `text/csv; charset=utf-8`,
      'Content-Disposition': `attachment; filename="surgery-records.${ext}"`,
    },
  })
}

function escapeCsv(v: unknown): string {
  const s = String(v ?? '')
  if (/[",\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

function buildCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return ''
  const headers = Object.keys(rows[0])
  const lines = [headers.join(',')]
  for (const r of rows) {
    lines.push(headers.map((h) => escapeCsv(r[h])).join(','))
  }
  return lines.join('\n')
}

function buildPdfHtml(rows: Record<string, unknown>[]): string {
  const headers = rows.length ? Object.keys(rows[0]) : []
  const head = headers.map((h) => `<th>${h}</th>`).join('')
  const body = rows
    .map(
      (r) =>
        `<tr>${headers
          .map((h) => `<td>${String(r[h] ?? '').replace(/</g, '&lt;')}</td>`)
          .join('')}</tr>`
    )
    .join('')
  return `<!doctype html>
<html><head><meta charset="utf-8"><title>Surgery Records</title>
<style>
  body { font-family: -apple-system, system-ui, sans-serif; padding: 24px; color: #0f172a; }
  h1 { font-size: 20px; margin-bottom: 4px; }
  .meta { color: #64748b; font-size: 12px; margin-bottom: 16px; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th { background: #1e40af; color: #fff; text-align: left; padding: 8px; }
  td { padding: 8px; border-bottom: 1px solid #e2e8f0; }
  tr:nth-child(even) td { background: #f8fafc; }
  @media print {
    body { padding: 0; }
    .no-print { display: none; }
  }
</style></head>
<body>
  <h1>Surgery Records Report</h1>
  <div class="meta">Generated ${new Date().toLocaleString('en-IN')} &middot; ${rows.length} records</div>
  <button class="no-print" onclick="window.print()" style="padding:8px 16px;background:#1e40af;color:#fff;border:0;border-radius:6px;cursor:pointer;margin-bottom:12px;">Print / Save as PDF</button>
  <table>
    <thead><tr>${head}</tr></thead>
    <tbody>${body || '<tr><td colspan="' + headers.length + '">No records</td></tr>'}</tbody>
  </table>
</body></html>`
}
