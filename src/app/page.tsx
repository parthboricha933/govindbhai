'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Activity,
  BarChart3,
  Building2,
  LayoutDashboard,
  Moon,
  Plus,
  Printer,
  Stethoscope,
  Sun,
  Table2,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { toast } from 'sonner'
import { PatientForm } from '@/components/patient-form'
import { Dashboard } from '@/components/dashboard'
import { RecordsTable } from '@/components/records-table'
import { ReportsView } from '@/components/reports-view'
import { AnalyticsView } from '@/components/analytics-view'
import { HospitalSummary } from '@/components/hospital-summary'
import { fetchAnalytics, type AnalyticsResponse } from '@/lib/api-client'
import type { DashboardStats } from '@/lib/surgery'

type Tab = 'home' | 'dashboard' | 'records' | 'reports' | 'analytics' | 'summary'

const EMPTY_STATS: DashboardStats = {
  totalSurgeries: 0,
  totalRevenue: 0,
  sadvicharSurgeries: 0,
  sadvicharRevenue: 0,
  otherSurgeries: 0,
  otherRevenue: 0,
  totalCommission: 0,
  todaySurgeries: 0,
  thisMonthSurgeries: 0,
}

export default function Home() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const [tab, setTab] = React.useState<Tab>('home')
  const [analytics, setAnalytics] = React.useState<AnalyticsResponse | null>(null)
  const [loadingStats, setLoadingStats] = React.useState(false)
  const [refreshKey, setRefreshKey] = React.useState(0)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const refreshStats = React.useCallback(async () => {
    setLoadingStats(true)
    try {
      const a = await fetchAnalytics()
      setAnalytics(a)
    } catch {
      // ignore
    } finally {
      setLoadingStats(false)
      setRefreshKey((k) => k + 1)
    }
  }, [])

  React.useEffect(() => {
    refreshStats()
  }, [refreshStats])

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  const stats = analytics?.dashboard ?? EMPTY_STATS

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Sticky Navigation */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 no-print">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between gap-4">
            <div className="flex items-center gap-2 min-w-0">
              <div className="size-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                <Activity className="size-5" />
              </div>
              <div className="min-w-0">
                <h1 className="text-base font-semibold tracking-tight truncate">Sadvichar Surgery Records</h1>
                <p className="text-[10px] text-muted-foreground hidden sm:block">Hospital Surgery Management System</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                aria-label="Toggle theme"
                title="Toggle dark mode"
              >
                {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
              </Button>
            </div>
          </div>
        </div>
        {/* Tabs row */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pb-2">
          <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
            <TabsList className="w-full justify-start overflow-x-auto h-auto p-1 bg-muted/50">
              <TabsTrigger value="home" className="gap-1.5">
                <Plus className="size-4" /> <span className="hidden sm:inline">New Entry</span>
                <span className="sm:hidden">Entry</span>
              </TabsTrigger>
              <TabsTrigger value="dashboard" className="gap-1.5">
                <LayoutDashboard className="size-4" /> <span className="hidden sm:inline">Dashboard</span>
                <span className="sm:hidden">Stats</span>
              </TabsTrigger>
              <TabsTrigger value="records" className="gap-1.5">
                <Table2 className="size-4" /> <span className="hidden sm:inline">Records</span>
                <span className="sm:hidden">Data</span>
              </TabsTrigger>
              <TabsTrigger value="reports" className="gap-1.5">
                <Printer className="size-4" /> <span className="hidden sm:inline">Reports</span>
                <span className="sm:hidden">Report</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="gap-1.5">
                <BarChart3 className="size-4" /> <span className="hidden sm:inline">Analytics</span>
                <span className="sm:hidden">Charts</span>
              </TabsTrigger>
              <TabsTrigger value="summary" className="gap-1.5">
                <Building2 className="size-4" /> <span className="hidden sm:inline">Hospitals</span>
                <span className="sm:hidden">Hosp</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 py-6">
        {tab === 'home' && (
          <div className="space-y-6">
            <PatientForm onSaved={() => refreshStats()} />
            {/* Quick stats below form */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <QuickStat label="Total Surgeries" value={stats.totalSurgeries.toLocaleString('en-IN')} icon={<Stethoscope className="size-4" />} />
              <QuickStat label="Sadvichar" value={stats.sadvicharSurgeries.toLocaleString('en-IN')} icon={<Activity className="size-4" />} accent="primary" />
              <QuickStat label="Other" value={stats.otherSurgeries.toLocaleString('en-IN')} icon={<Building2 className="size-4" />} accent="warning" />
              <QuickStat label="Cash Earned" value={`₹${stats.totalCommission.toLocaleString('en-IN')}`} icon={<BarChart3 className="size-4" />} accent="success" />
            </div>
          </div>
        )}
        {tab === 'dashboard' && (
          <Dashboard stats={stats} loading={loadingStats && !analytics} />
        )}
        {tab === 'records' && (
          <RecordsTable refreshKey={refreshKey} onChange={refreshStats} />
        )}
        {tab === 'reports' && (
          <ReportsView refreshKey={refreshKey} />
        )}
        {tab === 'analytics' && (
          <AnalyticsView refreshKey={refreshKey} />
        )}
        {tab === 'summary' && (
          <HospitalSummary refreshKey={refreshKey} />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-border/60 bg-muted/30 no-print">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Sadvichar Hospital · Surgery Record Management System · All data stored securely
        </div>
      </footer>
    </div>
  )
}

function QuickStat({
  label,
  value,
  icon,
  accent = 'muted',
}: {
  label: string
  value: string
  icon: React.ReactNode
  accent?: 'primary' | 'success' | 'muted' | 'warning'
}) {
  const accents: Record<string, string> = {
    primary: 'bg-primary/10 text-primary',
    success: 'bg-success/10 text-success',
    muted: 'bg-muted text-muted-foreground',
    warning: 'bg-amber-500/10 text-amber-600',
  }
  return (
    <div className="rounded-lg border border-border/60 bg-card p-3 flex items-center gap-3 shadow-sm">
      <div className={`size-9 rounded-md flex items-center justify-center ${accents[accent]}`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wide truncate">{label}</p>
        <p className="text-base font-bold truncate">{value}</p>
      </div>
    </div>
  )
}
