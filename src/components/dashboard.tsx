'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, Building2, CalendarDays, CalendarRange, Coins, Hospital, IndianRupee, Stethoscope, TrendingUp, Wallet } from 'lucide-react'
import type { DashboardStats } from '@/lib/surgery'
import { formatINR } from '@/lib/surgery'

interface DashboardProps {
  stats: DashboardStats
  loading?: boolean
}

interface StatCardProps {
  title: string
  value: string
  sub?: string
  icon: React.ReactNode
  accent?: 'primary' | 'success' | 'muted' | 'warning'
}

function StatCard({ title, value, sub, icon, accent = 'primary' }: StatCardProps) {
  const accentClasses: Record<string, string> = {
    primary: 'bg-primary/10 text-primary',
    success: 'bg-success/10 text-success',
    muted: 'bg-muted text-muted-foreground',
    warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  }
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow border-border/60">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide truncate">{title}</p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
          </div>
          <div className={`size-10 rounded-lg flex items-center justify-center shrink-0 ${accentClasses[accent]}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function Dashboard({ stats, loading }: DashboardProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <Card key={i} className="shadow-sm border-border/60">
            <CardContent className="p-5">
              <div className="h-4 w-20 bg-muted rounded mb-3 animate-pulse" />
              <div className="h-7 w-24 bg-muted rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight flex items-center gap-2">
          <Activity className="size-5 text-primary" />
          Dashboard
        </h2>
        <p className="text-sm text-muted-foreground">Real-time overview of all surgery records.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Surgeries"
          value={stats.totalSurgeries.toLocaleString('en-IN')}
          icon={<Stethoscope className="size-5" />}
          accent="primary"
        />
        <StatCard
          title="Sadvichar Surgeries"
          value={stats.sadvicharSurgeries.toLocaleString('en-IN')}
          sub="Performed at Sadvichar"
          icon={<Hospital className="size-5" />}
          accent="primary"
        />
        <StatCard
          title="Other Hospital"
          value={stats.otherSurgeries.toLocaleString('en-IN')}
          sub="Performed elsewhere"
          icon={<Building2 className="size-5" />}
          accent="warning"
        />
        <StatCard
          title="Total Cash Earned"
          value={formatINR(stats.totalCommission)}
          sub="₹500 × Other Hospital"
          icon={<Wallet className="size-5" />}
          accent="success"
        />
        <StatCard
          title="Other Hospital Charges"
          value={formatINR(stats.otherRevenue)}
          sub="Total billed at Other"
          icon={<IndianRupee className="size-5" />}
          accent="muted"
        />
        <StatCard
          title="Today's Surgeries"
          value={stats.todaySurgeries.toLocaleString('en-IN')}
          icon={<CalendarDays className="size-5" />}
          accent="muted"
        />
        <StatCard
          title="This Month"
          value={stats.thisMonthSurgeries.toLocaleString('en-IN')}
          icon={<CalendarRange className="size-5" />}
          accent="muted"
        />
        <StatCard
          title="Commission Rate"
          value="₹500"
          sub="Per Other Hospital surgery"
          icon={<Coins className="size-5" />}
          accent="warning"
        />
      </div>

      {/* Hospital comparison — two clear sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sadvichar Hospital — count only */}
        <Card className="shadow-sm border-primary/30 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Hospital className="size-4 text-primary" /> Sadvichar Hospital
            </CardTitle>
            <CardDescription>Surgeries you performed at Sadvichar (no charge — you work here).</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground uppercase">Number of Surgeries</p>
            <p className="text-4xl font-bold text-primary">{stats.sadvicharSurgeries.toLocaleString('en-IN')}</p>
            <p className="text-xs text-muted-foreground mt-2">No charge recorded for in-house surgeries.</p>
          </CardContent>
        </Card>

        {/* Other Hospital — count + total cash paid (commission) */}
        <Card className="shadow-sm border-amber-500/30 bg-amber-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="size-4 text-amber-600" /> Other Hospital
            </CardTitle>
            <CardDescription>Surgeries performed at other hospitals (₹500 commission each).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground uppercase">Number of Surgeries</p>
              <p className="text-4xl font-bold">{stats.otherSurgeries.toLocaleString('en-IN')}</p>
            </div>
            <div className="border-t border-amber-500/20 pt-3">
              <p className="text-xs text-muted-foreground uppercase">Total Cash Paid to Sadvichar</p>
              <p className="text-4xl font-bold text-amber-600">{formatINR(stats.totalCommission)}</p>
              <p className="text-xs text-muted-foreground mt-1">₹500 × {stats.otherSurgeries} surgeries</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
