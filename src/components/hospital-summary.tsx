'use client'

import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, Coins, Hospital, Loader2, Stethoscope, Wallet } from 'lucide-react'
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
        <p className="text-sm text-muted-foreground">
          Totals for both sections — Sadvichar surgeries count and total cash paid by Other Hospital.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sadvichar Hospital — count only */}
        <Card className="shadow-sm border-primary/40 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Hospital className="size-4 text-primary" /> Sadvichar Hospital
            </CardTitle>
            <CardDescription>Surgeries performed at Sadvichar — no charge (you work there).</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase">Number of Surgeries</p>
                <p className="text-5xl font-bold text-primary">{d.sadvicharSurgeries.toLocaleString('en-IN')}</p>
              </div>
              <div className="size-16 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Stethoscope className="size-8" />
              </div>
            </div>
            <div className="rounded-md bg-background/60 border border-border/60 px-3 py-2 text-xs text-muted-foreground mt-4">
              No charge is recorded for in-house surgeries — only the count is tracked.
            </div>
          </CardContent>
        </Card>

        {/* Other Hospital — count + total cash paid */}
        <Card className="shadow-sm border-amber-500/40 bg-amber-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="size-4 text-amber-600" /> Other Hospital
            </CardTitle>
            <CardDescription>Surgeries performed at other hospitals.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase">Number of Surgeries</p>
                <p className="text-5xl font-bold">{d.otherSurgeries.toLocaleString('en-IN')}</p>
              </div>
              <div className="size-16 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <Stethoscope className="size-8" />
              </div>
            </div>
            <div className="border-t border-amber-500/20 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-amber-700 dark:text-amber-400 uppercase font-medium">Total Cash Paid to Sadvichar</p>
                  <p className="text-5xl font-bold text-amber-600">{formatINR(commissionPayable)}</p>
                  <p className="text-xs text-muted-foreground mt-1">₹500 × {d.otherSurgeries} surgeries</p>
                </div>
                <div className="size-16 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <Wallet className="size-8" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Combined totals */}
      <Card className="shadow-sm border-border/60 bg-muted/30">
        <CardHeader>
          <CardTitle className="text-base">Combined Overview</CardTitle>
          <CardDescription>Total surgeries across both hospitals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-md bg-background border border-border p-4">
              <div className="flex items-center gap-2 mb-1">
                <Stethoscope className="size-4 text-primary" />
                <p className="text-xs text-muted-foreground uppercase">Total Surgeries</p>
              </div>
              <p className="text-2xl font-bold">{d.totalSurgeries.toLocaleString('en-IN')}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Sadvichar: {d.sadvicharSurgeries} · Other: {d.otherSurgeries}
              </p>
            </div>
            <div className="rounded-md bg-background border border-border p-4">
              <div className="flex items-center gap-2 mb-1">
                <Coins className="size-4 text-amber-600" />
                <p className="text-xs text-muted-foreground uppercase">Total Cash Earned</p>
              </div>
              <p className="text-2xl font-bold text-amber-600">{formatINR(commissionPayable)}</p>
              <p className="text-xs text-muted-foreground mt-1">From Other Hospital commissions</p>
            </div>
            <div className="rounded-md bg-background border border-border p-4">
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="size-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground uppercase">Other Hospital Charges</p>
              </div>
              <p className="text-2xl font-bold">{formatINR(d.otherRevenue)}</p>
              <p className="text-xs text-muted-foreground mt-1">Total billed at Other Hospital</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Worked example */}
      <Card className="shadow-sm border-border/60 bg-muted/30">
        <CardHeader>
          <CardTitle className="text-base">How total cash paid is calculated</CardTitle>
          <CardDescription>Worked example based on current data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="rounded-md bg-background border border-border p-4">
              <p className="text-xs text-muted-foreground uppercase mb-1">Other Hospital Surgeries</p>
              <p className="text-xl font-bold">{d.otherSurgeries.toLocaleString('en-IN')}</p>
            </div>
            <div className="rounded-md bg-background border border-border p-4">
              <p className="text-xs text-muted-foreground uppercase mb-1">Cash Per Surgery</p>
              <p className="text-xl font-bold">₹500</p>
            </div>
            <div className="rounded-md bg-amber-500/10 border border-amber-500/30 p-4">
              <p className="text-xs text-amber-700 dark:text-amber-400 uppercase mb-1">Total Cash Paid</p>
              <p className="text-xl font-bold text-amber-600">{formatINR(commissionPayable)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
