'use client'

import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, Coins, Hospital, IndianRupee, Loader2, Stethoscope } from 'lucide-react'
import { fetchAnalytics, type AnalyticsResponse } from '@/lib/api-client'
import { formatINR } from '@/lib/surgery'
import { toast } from 'sonner'

interface HospitalSummaryProps {
  refreshKey: number
}

export function HospitalSummary({ refreshKey }: HospitalSummaryProps) {
  const [data, setData] = React.useState<AnalyticsResponse | null>(null)
  const [loading, setLoading] = React.useState(false)

  const load = React.useCallback(async () => {
    setLoading(true)
    try {
      const d = await fetchAnalytics()
      setData(d)
    } catch (err: any) {
      toast.error(err.message || 'Failed to load summary')
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    load()
  }, [load, refreshKey])

  if (loading && !data) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }
  if (!data) return null

  const { dashboard: d } = data
  const commissionPayable = d.otherSurgeries * 500

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight flex items-center gap-2">
          <Hospital className="size-5 text-primary" /> Hospital Summary
        </h2>
        <p className="text-sm text-muted-foreground">Combined totals and commission payable to Sadvichar Hospital.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Combined totals */}
        <Card className="shadow-sm border-primary/30 md:col-span-1 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Stethoscope className="size-4 text-primary" /> Combined
            </CardTitle>
            <CardDescription>All hospitals</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground uppercase">Total Surgeries</p>
              <p className="text-3xl font-bold">{d.totalSurgeries.toLocaleString('en-IN')}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase">Total Revenue</p>
              <p className="text-3xl font-bold text-success">{formatINR(d.totalRevenue)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase">Commission Earned</p>
              <p className="text-3xl font-bold text-amber-600">{formatINR(d.totalCommission)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Sadvichar */}
        <Card className="shadow-sm border-primary/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Hospital className="size-4 text-primary" /> Sadvichar Hospital
            </CardTitle>
            <CardDescription>Surgeries performed at Sadvichar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase">Total Surgeries</p>
                <p className="text-3xl font-bold">{d.sadvicharSurgeries.toLocaleString('en-IN')}</p>
              </div>
              <div className="size-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Stethoscope className="size-6" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase">Total Revenue</p>
                <p className="text-3xl font-bold text-success">{formatINR(d.sadvicharRevenue)}</p>
              </div>
              <div className="size-12 rounded-lg bg-success/10 text-success flex items-center justify-center">
                <IndianRupee className="size-6" />
              </div>
            </div>
            <div className="rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
              No commission is payable for in-house surgeries.
            </div>
          </CardContent>
        </Card>

        {/* Other Hospital */}
        <Card className="shadow-sm border-amber-500/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="size-4 text-amber-600" /> Other Hospital
            </CardTitle>
            <CardDescription>Surgeries performed elsewhere</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase">Total Surgeries</p>
                <p className="text-3xl font-bold">{d.otherSurgeries.toLocaleString('en-IN')}</p>
              </div>
              <div className="size-12 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <Stethoscope className="size-6" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase">Total Revenue</p>
                <p className="text-3xl font-bold">{formatINR(d.otherRevenue)}</p>
              </div>
              <div className="size-12 rounded-lg bg-muted text-muted-foreground flex items-center justify-center">
                <IndianRupee className="size-6" />
              </div>
            </div>
            <div className="rounded-md bg-amber-500/10 border border-amber-500/30 px-3 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Coins className="size-4 text-amber-600" />
                  <span className="text-xs font-medium text-amber-700 dark:text-amber-400 uppercase">Commission Payable</span>
                </div>
                <span className="text-xs text-muted-foreground">₹500 × {d.otherSurgeries}</span>
              </div>
              <p className="text-2xl font-bold text-amber-600 mt-1">{formatINR(commissionPayable)}</p>
              <p className="text-xs text-muted-foreground mt-1">Payable to Sadvichar Hospital</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Worked example */}
      <Card className="shadow-sm border-border/60 bg-muted/30">
        <CardHeader>
          <CardTitle className="text-base">How commission is calculated</CardTitle>
          <CardDescription>Worked example based on current data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="rounded-md bg-background border border-border p-3">
              <p className="text-xs text-muted-foreground uppercase mb-1">Other Hospital Surgeries</p>
              <p className="text-xl font-bold">{d.otherSurgeries.toLocaleString('en-IN')}</p>
            </div>
            <div className="rounded-md bg-background border border-border p-3">
              <p className="text-xs text-muted-foreground uppercase mb-1">Commission Rate</p>
              <p className="text-xl font-bold">₹500 / surgery</p>
            </div>
            <div className="rounded-md bg-amber-500/10 border border-amber-500/30 p-3">
              <p className="text-xs text-amber-700 dark:text-amber-400 uppercase mb-1">Total Commission</p>
              <p className="text-xl font-bold text-amber-600">{formatINR(commissionPayable)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
