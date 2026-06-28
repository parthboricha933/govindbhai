'use client'

import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Hospital as HospitalIcon, Building2, Loader2, Save, Stethoscope, UserPlus } from 'lucide-react'
import { COMMON_SURGERIES } from '@/lib/surgery'
import { createSurgery } from '@/lib/api-client'
import { toast } from 'sonner'
import type { SurgeryRecord } from '@/lib/surgery'

interface PatientFormProps {
  onSaved?: (record: SurgeryRecord) => void
}

const AUTOSAVE_KEY = 'surgery_form_draft_v1'

export function PatientForm({ onSaved }: PatientFormProps) {
  const [patientName, setPatientName] = React.useState('')
  const [village, setVillage] = React.useState('')
  const [surgeryName, setSurgeryName] = React.useState('')
  const [customSurgery, setCustomSurgery] = React.useState('')
  const [isCustom, setIsCustom] = React.useState(false)
  const [surgeryDate, setSurgeryDate] = React.useState(() => new Date().toISOString().slice(0, 10))
  const [surgeryCharge, setSurgeryCharge] = React.useState('')
  const [notes, setNotes] = React.useState('')
  const [selectedHospital, setSelectedHospital] = React.useState<'Sadvichar' | 'Other' | null>(null)
  const [saving, setSaving] = React.useState(false)
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  // Auto-save draft while typing
  React.useEffect(() => {
    const draft = {
      patientName,
      village,
      surgeryName,
      customSurgery,
      isCustom,
      surgeryDate,
      surgeryCharge,
      notes,
      selectedHospital,
    }
    try {
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(draft))
    } catch {}
  }, [patientName, village, surgeryName, customSurgery, isCustom, surgeryDate, surgeryCharge, notes, selectedHospital])

  // Restore draft on mount (single-pass)
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(AUTOSAVE_KEY)
      if (raw) {
        const d = JSON.parse(raw)
        if (d.patientName) setPatientName(d.patientName)
        if (d.village) setVillage(d.village)
        if (d.surgeryName) setSurgeryName(d.surgeryName)
        if (d.customSurgery) setCustomSurgery(d.customSurgery)
        if (typeof d.isCustom === 'boolean') setIsCustom(d.isCustom)
        if (d.surgeryDate) setSurgeryDate(d.surgeryDate)
        if (d.surgeryCharge) setSurgeryCharge(String(d.surgeryCharge))
        if (d.notes) setNotes(d.notes)
        if (d.selectedHospital) setSelectedHospital(d.selectedHospital)
      }
    } catch {
      // ignore
    }
  }, [])

  async function handleSubmit(hospital: 'Sadvichar' | 'Other') {
    setSelectedHospital(hospital)
    const finalHospital = hospital
    const finalSurgery = isCustom ? customSurgery.trim() : surgeryName
    const e: Record<string, string> = {}
    if (!patientName.trim()) e.patientName = 'Patient name is required'
    if (!village.trim()) e.village = 'Village name is required'
    if (!finalSurgery) e.surgeryName = 'Surgery name is required'
    if (!surgeryDate) e.surgeryDate = 'Surgery date is required'
    // Charge is required ONLY for Other Hospital.
    // For Sadvichar Hospital the charge is always 0 (you work there).
    if (finalHospital === 'Other' && (!surgeryCharge || Number(surgeryCharge) < 0)) {
      e.surgeryCharge = 'Surgery charge is required for Other Hospital'
    }
    setErrors(e)
    if (Object.keys(e).length > 0) {
      toast.error('Please fill all required fields correctly.')
      return
    }

    setSaving(true)
    try {
      const finalCharge = finalHospital === 'Sadvichar' ? 0 : Number(surgeryCharge)
      const record = await createSurgery({
        patientName: patientName.trim(),
        village: village.trim(),
        surgeryName: finalSurgery,
        surgeryDate,
        hospital: finalHospital,
        surgeryCharge: finalCharge,
        notes: notes.trim() || undefined,
      })
      toast.success('Patient record saved successfully.', {
        description:
          finalHospital === 'Sadvichar'
            ? `${record.patientName} · ${record.surgeryName} · Sadvichar Hospital (no charge)`
            : `${record.patientName} · ${record.surgeryName} · Other Hospital · ₹500 commission`,
      })
      // Reset form
      setPatientName('')
      setVillage('')
      setSurgeryName('')
      setCustomSurgery('')
      setIsCustom(false)
      setSurgeryDate(new Date().toISOString().slice(0, 10))
      setSurgeryCharge('')
      setNotes('')
      setSelectedHospital(null)
      setErrors({})
      try {
        localStorage.removeItem(AUTOSAVE_KEY)
      } catch {}
      onSaved?.(record)
    } catch (err: any) {
      toast.error(err.message || 'Failed to save patient record.')
    } finally {
      setSaving(false)
    }
  }

  const commissionPreview = selectedHospital === 'Other' ? 500 : 0

  return (
    <Card className="shadow-sm border-border/60">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="size-5 text-primary" />
          New Patient Surgery Entry
        </CardTitle>
        <CardDescription>
          Fill in the patient details below and choose where the surgery was performed. The form auto-saves while you type.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="patientName">
              Patient Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="patientName"
              placeholder="e.g. Ramesh Kumar"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              disabled={saving}
            />
            {errors.patientName && <p className="text-xs text-destructive">{errors.patientName}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="village">
              Village Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="village"
              placeholder="e.g. Rampur"
              value={village}
              onChange={(e) => setVillage(e.target.value)}
              disabled={saving}
              list="villages-list"
            />
            <datalist id="villages-list">
              <option value="Rampur" />
              <option value="Sundarpur" />
              <option value="Lakshmipur" />
              <option value="Krishnanagar" />
              <option value="Bhavani Nagar" />
            </datalist>
            {errors.village && <p className="text-xs text-destructive">{errors.village}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="surgery">
              Surgery Name <span className="text-destructive">*</span>
            </Label>
            {!isCustom ? (
              <Select
                value={surgeryName}
                onValueChange={(v) => {
                  if (v === '__custom__') {
                    setIsCustom(true)
                    setSurgeryName('')
                  } else {
                    setSurgeryName(v)
                  }
                }}
                disabled={saving}
              >
                <SelectTrigger id="surgery" className="w-full">
                  <SelectValue placeholder="Select a surgery" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Common Surgeries</SelectLabel>
                    {COMMON_SURGERIES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                    <SelectLabel>Other</SelectLabel>
                    <SelectItem value="__custom__">+ Custom Surgery...</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            ) : (
              <div className="flex gap-2">
                <Input
                  placeholder="Type custom surgery name"
                  value={customSurgery}
                  onChange={(e) => setCustomSurgery(e.target.value)}
                  disabled={saving}
                  autoFocus
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsCustom(false)
                    setCustomSurgery('')
                  }}
                  disabled={saving}
                >
                  List
                </Button>
              </div>
            )}
            {errors.surgeryName && <p className="text-xs text-destructive">{errors.surgeryName}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="surgeryDate">
              Surgery Date <span className="text-destructive">*</span>
            </Label>
            <Input
              id="surgeryDate"
              type="date"
              value={surgeryDate}
              onChange={(e) => setSurgeryDate(e.target.value)}
              disabled={saving}
            />
            {errors.surgeryDate && <p className="text-xs text-destructive">{errors.surgeryDate}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="surgeryCharge">
              Surgery Charge (₹) <span className="text-muted-foreground text-xs font-normal">— Other Hospital only</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">₹</span>
              <Input
                id="surgeryCharge"
                type="number"
                inputMode="numeric"
                min={0}
                placeholder="0"
                className="pl-8"
                value={surgeryCharge}
                onChange={(e) => setSurgeryCharge(e.target.value)}
                disabled={saving}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              No charge for Sadvichar Hospital (you work there). Required only for Other Hospital.
            </p>
            {errors.surgeryCharge && <p className="text-xs text-destructive">{errors.surgeryCharge}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any additional notes..."
              rows={1}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={saving}
            />
          </div>
        </div>

        {selectedHospital && (
          <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Stethoscope className="size-4" />
              <span>
                Commission to Sadvichar Hospital: <strong className="text-foreground">₹{commissionPreview.toLocaleString('en-IN')}</strong>
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              {selectedHospital === 'Other' ? 'Auto ₹500 commission' : 'No commission'}
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <Button
            type="button"
            variant={selectedHospital === 'Sadvichar' ? 'success' : 'outline'}
            size="lg"
            className="h-16 text-base font-semibold"
            onClick={() => handleSubmit('Sadvichar')}
            disabled={saving}
          >
            {saving && selectedHospital === 'Sadvichar' ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <HospitalIcon className="size-5" />
            )}
            Sadvichar Hospital
          </Button>
          <Button
            type="button"
            variant={selectedHospital === 'Other' ? 'success' : 'outline'}
            size="lg"
            className="h-16 text-base font-semibold"
            onClick={() => handleSubmit('Other')}
            disabled={saving}
          >
            {saving && selectedHospital === 'Other' ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <Building2 className="size-5" />
            )}
            Other Hospital
          </Button>
        </div>
        {errors.hospital && <p className="text-xs text-destructive text-center">{errors.hospital}</p>}

        <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1.5">
          <Save className="size-3" />
          Form auto-saves your draft. Choose a hospital to save the record.
        </p>
      </CardContent>
    </Card>
  )
}
