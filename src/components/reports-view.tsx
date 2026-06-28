'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  BarChart3,
  CalendarRange,
  Coins,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  IndianRupee,
  Loader2,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import { fetchAnalytics, exportUrl, type AnalyticsResponse } from '@/lib/api-client'
import { formatINR } from '@/lib/surgery'
import { toast } from 'sonner'

interface ReportsViewProps {
  refreshKey: number
}

export function ReportsView({ refreshKey }: ReportsViewProps) {
  const [data, setData] = React.useState<AnalyticsResponse | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [startDate, setStartDate] = React.useState('')
  const [endDate, setEndDate] = React.useState('')
  const [hospital, setHospital] = React.useState('')
  const [village, setVillage] = React.useState('')
  const [surgeryName, setSurgeryName] = React.useState('')

  const load = React.useCallback(async () => {
    setLoading(true)
    try {
      const d = await fetchAnalytics({ startDate, endDate, hospital, village, surgeryName })
      setData(d)
    } catch (err: any) {
      toast.error(err.message || 'Failed to load reports')
    } finally {
      setLoading(false)
    }
  }, [startDate, endDate, hospital, village, surgeryName])

  React.useEffect(() => {
    load()
  }, [load, refreshKey])

  function clearFilters() {
    setStartDate('')
    setEndDate('')
    setHospital('')
    setVillage('')
    setSurgeryName('')
  }

  function handleExport(format: 'excel' | 'pdf') {
    const url = exportUrl(format, { startDate, endDate, hospital, village, surgeryName })
    if (format === 'pdf') {
      window.open(url, '_blank')
    } else {
      const a = document.createElement('a')
      a.href = url
      a.download = `surgery-report.${format === 'excel' ? 'csv' : 'csv'}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
    toast.success(`Exporting report as ${format.toUpperCase()}...`)
  }

  const hasFilters = !!(startDate || endDate || hospital || village || surgeryName)
  const report = data?.report

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-xl font-semibold tracking-tight flex items-center gap-2">
            <BarChart3 className="size-5 text-primary" /> Reports
          </h2>
          <p className="text-sm text-muted-foreground">Generate detailed reports with filters.</p>
        </div>
        <div className="flex items-center gap-1">
          <Button size="sm" variant="outline" onClick={() => handleExport('excel')}>
            <FileSpreadsheet className="size-4" /> Excel
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleExport('pdf')}>
            <FileText className="size-4" /> PDF
          </Button>
        </div>
      </div>

      <Card className="shadow-sm border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="size-4 text-primary" /> Report Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="space-y-1.5">
              <Label>Start Date</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>End Date</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Hospital</Label>
              <Select value={hospital || '__all__'} onValueChange={(v) => setHospital(v === '__all__' ? '' : v)}>
                <SelectTrigger className="w-full"><SelectValue placeholder="All" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All Hospitals</SelectItem>
                  <SelectItem value="Sadvichar">Sadvichar</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Village</Label>
              <Input placeholder="Village" value={village} onChange={(e) => setVillage(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Surgery</Label>
              <Input placeholder="Surgery name" value={surgeryName} onChange={(e) => setSurgeryName(e.target.value)} />
            </div>
          </div>
          {hasFilters && (
            <Button variant="ghost" size="sm" className="mt-2" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : report ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="shadow-sm border-border/60">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Surgeries</p>
                <CalendarRange className="size-4 text-primary" />
              </div>
              <p className="text-2xl font-bold">{report.totalSurgeries.toLocaleString('en-IN')}</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-border/60">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Revenue</p>
                <IndianRupee className="size-4 text-success" />
              </div>
              <p className="text-2xl font-bold text-success">{formatINR(report.totalRevenue)}</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-border/60">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Commission</p>
                <Coins className="size-4 text-amber-600" />
              </div>
              <p className="text-2xl font-bold text-amber-600">{formatINR(report.totalCommission)}</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-border/60">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Avg. Charge</p>
                <BarChart3 className="size-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold">{formatINR(report.averageCharge)}</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-border/60">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Highest</p>
                <TrendingUp className="size-4 text-success" />
              </div>
              <p className="text-2xl font-bold text-success">{formatINR(report.highestCharge)}</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-border/60">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Lowest</p>
                <TrendingDown className="size-4 text-destructive" />
              </div>
              <p className="text-2xl font-bold text-destructive">{formatINR(report.lowestCharge)}</p>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  )
}
