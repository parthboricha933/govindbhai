// Shared types and constants for the surgery management app

export const COMMISSION_AMOUNT = 500 // INR per Other Hospital surgery

export type Hospital = 'Sadvichar' | 'Other'

export const HOSPITALS: Hospital[] = ['Sadvichar', 'Other']

export const COMMON_SURGERIES = [
  'Cataract Surgery',
  'Appendectomy',
  'Cesarean Section',
  'Gallbladder Removal',
  'Knee Replacement',
  'Hernia Repair',
  'Tonsillectomy',
  'Hysterectomy',
  'Fracture Fixation',
  'Cataract (Phaco)',
  'Dental Surgery',
  'ENT Surgery',
  'Laparoscopic Surgery',
  'Orthopedic Surgery',
  'Plastic Surgery',
  'Eye Surgery',
  'General Surgery',
  'Gynecological Surgery',
  'Urological Surgery',
  'Cardiac Surgery',
]

export function calculateCommission(hospital: string, surgeryCharge: number): number {
  if (hospital === 'Other') {
    return COMMISSION_AMOUNT
  }
  return 0
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount || 0)
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function formatDateForInput(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export interface SurgeryRecord {
  id: string
  patientName: string
  village: string
  surgeryName: string
  surgeryDate: string
  hospital: string
  surgeryCharge: number
  commission: number
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface DashboardStats {
  totalSurgeries: number
  totalRevenue: number
  sadvicharSurgeries: number
  sadvicharRevenue: number
  otherSurgeries: number
  otherRevenue: number
  totalCommission: number
  todaySurgeries: number
  thisMonthSurgeries: number
}

export interface ReportStats {
  totalSurgeries: number
  totalRevenue: number
  totalCommission: number
  averageCharge: number
  highestCharge: number
  lowestCharge: number
}
