'use client'

import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { formatDateForInput, type SurgeryRecord } from '@/lib/surgery'
import { createSurgery, updateSurgery } from '@/lib/api-client'

interface SurgeryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  record?: SurgeryRecord | null
  onSaved?: (record: SurgeryRecord) => void
}

export function SurgeryDialog({ open, onOpenChange, record, onSaved }: SurgeryDialogProps) {
  const isEdit = !!record
  const [patientName, setPatientName] = React.useState('')
  const [village, setVillage] = React.useState('')
  const [surgeryName, setSurgeryName] = React.useState('')
  const [surgeryDate, setSurgeryDate] = React.useState('')
  const [surgeryCharge, setSurgeryCharge] = React.useState('')
  const [notes, setNotes] = React.useState('')
  const [hospital, setHospital] = React.useState<'Sadvichar' | 'Other'>('Sadvichar')
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!open) return
    if (record) {
      setPatientName(record.patientName)
      setVillage(record.village)
      setSurgeryName(record.surgeryName)
      setSurgeryDate(formatDateForInput(record.surgeryDate))
      setSurgeryCharge(String(record.surgeryCharge))
      setNotes(record.notes || '')
      setHospital(record.hospital === 'Other' ? 'Other' : 'Sadvichar')
    } else {
      setPatientName('')
      setVillage('')
      setSurgeryName('')
      setSurgeryDate(new Date().toISOString().slice(0, 10))
      setSurgeryCharge('')
      setNotes('')
      setHospital('Sadvichar')
    }
    setError(null)
  }, [open, record])

  async function handleSave() {
    if (!patientName.trim() || !village.trim()) {
      setError('Patient name and village are required.')
      return
    }
    const finalSurgery = surgeryName.trim()
    if (!finalSurgery) {
      setError('Surgery name is required.')
      return
    }
    if (!surgeryDate) {
      setError('Surgery date is required.')
      return
    }
    // Charge is required ONLY for Other Hospital.
    // For Sadvichar Hospital the charge is always 0 (user works there).
    if (hospital === 'Other' && (!surgeryCharge || Number(surgeryCharge) < 0)) {
      setError('Surgery charge is required for Other Hospital.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const finalCharge = hospital === 'Sadvichar' ? 0 : Number(surgeryCharge)
      const payload = {
        patientName: patientName.trim(),
        village: village.trim(),
        surgeryName: finalSurgery,
        surgeryDate,
        hospital,
        surgeryCharge: finalCharge,
        notes: notes.trim(),
      }
      const saved = isEdit && record
        ? await updateSurgery(record.id, payload)
        : await createSurgery(payload)
      onSaved?.(saved)
      onOpenChange(false)
    } catch (err: any) {
      setError(err.message || 'Failed to save.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto scrollbar-thin">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Surgery Record' : 'Add Surgery Record'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update the details below.' : 'Enter the details for the new surgery record.'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-patient">Patient Name</Label>
              <Input id="edit-patient" value={patientName} onChange={(e) => setPatientName(e.target.value)} disabled={saving} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-village">Village</Label>
              <Input id="edit-village" value={village} onChange={(e) => setVillage(e.target.value)} disabled={saving} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-surgery">Surgery Name</Label>
              <Input
                id="edit-surgery"
                placeholder="Type the surgery name"
                value={surgeryName}
                onChange={(e) => setSurgeryName(e.target.value)}
                disabled={saving}
                autoComplete="off"
                autoCapitalize="words"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-date">Surgery Date</Label>
              <Input id="edit-date" type="date" value={surgeryDate} onChange={(e) => setSurgeryDate(e.target.value)} disabled={saving} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-hospital">Hospital</Label>
              <Select value={hospital} onValueChange={(v: 'Sadvichar' | 'Other') => setHospital(v)} disabled={saving}>
                <SelectTrigger id="edit-hospital" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sadvichar">Sadvichar Hospital</SelectItem>
                  <SelectItem value="Other">Other Hospital</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-charge">
                Surgery Charge (₹) <span className="text-muted-foreground text-xs font-normal">— Other only</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                <Input id="edit-charge" type="number" min={0} className="pl-8" value={surgeryCharge} onChange={(e) => setSurgeryCharge(e.target.value)} disabled={saving} />
              </div>
              {hospital === 'Other' ? (
                <p className="text-xs text-amber-600 dark:text-amber-400">+ ₹500 commission to Sadvichar</p>
              ) : (
                <p className="text-xs text-muted-foreground">No charge for Sadvichar Hospital (you work there).</p>
              )}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-notes">Notes</Label>
            <Textarea id="edit-notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} disabled={saving} />
          </div>
          {error && <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="size-4 animate-spin" /> : null}
            {isEdit ? 'Save Changes' : 'Add Record'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
