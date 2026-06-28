import type { SurgeryRecord, DashboardStats, ReportStats } from '@/lib/surgery'

export interface AnalyticsResponse {
  dashboard: DashboardStats
  report: ReportStats
  monthlySeries: { month: string; surgeries: number; revenue: number; commission: number }[]
  hospitalBreakdown: { hospital: string; surgeries: number; revenue: number }[]
  villageBreakdown: { village: string; count: number }[]
  surgeryBreakdown: { name: string; count: number }[]
  records: SurgeryRecord[]
}

export interface SurgeryFilters {
  search?: string
  hospital?: string
  village?: string
  surgeryName?: string
  startDate?: string
  endDate?: string
  date?: string
  limit?: number
}

function qs(filters: SurgeryFilters = {}): string {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== '' && v !== null) params.set(k, String(v))
  })
  const s = params.toString()
  return s ? `?${s}` : ''
}

export async function fetchSurgeries(filters: SurgeryFilters = {}): Promise<SurgeryRecord[]> {
  const res = await fetch(`/api/surgeries${qs(filters)}`, { cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to fetch surgeries')
  const json = await res.json()
  return json.data as SurgeryRecord[]
}

export async function createSurgery(input: {
  patientName: string
  village: string
  surgeryName: string
  surgeryDate: string
  hospital: 'Sadvichar' | 'Other'
  surgeryCharge: number
  notes?: string
}): Promise<SurgeryRecord> {
  const res = await fetch('/api/surgeries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Failed to create surgery')
  }
  const json = await res.json()
  return json.data as SurgeryRecord
}

export async function updateSurgery(
  id: string,
  input: Partial<{
    patientName: string
    village: string
    surgeryName: string
    surgeryDate: string
    hospital: 'Sadvichar' | 'Other'
    surgeryCharge: number
    notes: string
  }>
): Promise<SurgeryRecord> {
  const res = await fetch(`/api/surgeries/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Failed to update surgery')
  }
  const json = await res.json()
  return json.data as SurgeryRecord
}

export async function deleteSurgery(id: string): Promise<void> {
  const res = await fetch(`/api/surgeries/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete surgery')
}

export async function duplicateSurgery(id: string): Promise<SurgeryRecord> {
  const res = await fetch('/api/surgeries/duplicate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  })
  if (!res.ok) throw new Error('Failed to duplicate surgery')
  const json = await res.json()
  return json.data as SurgeryRecord
}

export async function bulkDeleteSurgeries(ids: string[]): Promise<number> {
  const res = await fetch('/api/surgeries/bulk', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  })
  if (!res.ok) throw new Error('Failed to bulk delete')
  const json = await res.json()
  return json.deleted as number
}

export async function fetchAnalytics(filters: SurgeryFilters = {}): Promise<AnalyticsResponse> {
  const res = await fetch(`/api/analytics${qs(filters)}`, { cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to fetch analytics')
  return res.json()
}

export function exportUrl(format: 'csv' | 'excel' | 'pdf', filters: SurgeryFilters = {}): string {
  return `/api/export?format=${format}${qs(filters).replace(/^\?/, '&')}`
}

export async function login(username: string, password: string): Promise<boolean> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  if (!res.ok) return false
  return true
}

export async function logout(): Promise<void> {
  await fetch('/api/auth/logout', { method: 'POST' })
}

export async function getSession(): Promise<{ authenticated: boolean; username: string | null }> {
  const res = await fetch('/api/auth/session', { cache: 'no-store' })
  if (!res.ok) return { authenticated: false, username: null }
  return res.json()
}
