'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  Edit,
  FileSpreadsheet,
  FileText,
  Filter,
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  Printer,
  Search,
  Trash2,
  X,
} from 'lucide-react'
import type { SurgeryRecord } from '@/lib/surgery'
import { formatDate, formatINR } from '@/lib/surgery'
import { bulkDeleteSurgeries, deleteSurgery, duplicateSurgery, exportUrl, fetchSurgeries } from '@/lib/api-client'
import { toast } from 'sonner'
import { SurgeryDialog } from './surgery-dialog'

interface RecordsTableProps {
  refreshKey: number
  onChange: () => void
  compact?: boolean
  hideFilters?: boolean
  pageSize?: number
}

const PAGE_SIZE_DEFAULT = 10

export function RecordsTable({ refreshKey, onChange, compact, hideFilters, pageSize = PAGE_SIZE_DEFAULT }: RecordsTableProps) {
  const [records, setRecords] = React.useState<SurgeryRecord[]>([])
  const [loading, setLoading] = React.useState(false)
  const [search, setSearch] = React.useState('')
  const [debouncedSearch, setDebouncedSearch] = React.useState('')
  const [hospital, setHospital] = React.useState<string>('')
  const [village, setVillage] = React.useState('')
  const [surgeryName, setSurgeryName] = React.useState('')
  const [dateFilter, setDateFilter] = React.useState('')
  const [page, setPage] = React.useState(1)
  const [pageSizeState, setPageSizeState] = React.useState(pageSize)
  const [selected, setSelected] = React.useState<Set<string>>(new Set())
  const [editRecord, setEditRecord] = React.useState<SurgeryRecord | null>(null)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [deleteId, setDeleteId] = React.useState<string | null>(null)
  const [bulkDeleteOpen, setBulkDeleteOpen] = React.useState(false)

  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350)
    return () => clearTimeout(t)
  }, [search])

  const load = React.useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchSurgeries({
        search: debouncedSearch,
        hospital,
        village,
        surgeryName,
        date: dateFilter,
      })
      setRecords(data)
      setPage(1)
      setSelected(new Set())
    } catch (err: any) {
      toast.error(err.message || 'Failed to load records')
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, hospital, village, surgeryName, dateFilter])

  React.useEffect(() => {
    load()
  }, [load, refreshKey])

  function clearFilters() {
    setSearch('')
    setHospital('')
    setVillage('')
    setSurgeryName('')
    setDateFilter('')
  }

  const hasFilters = !!(debouncedSearch || hospital || village || surgeryName || dateFilter)

  const totalPages = Math.max(1, Math.ceil(records.length / pageSizeState))
  const pageRecords = records.slice((page - 1) * pageSizeState, page * pageSizeState)

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }
  function toggleSelectAll() {
    if (pageRecords.every((r) => selected.has(r.id))) {
      setSelected((prev) => {
        const next = new Set(prev)
        pageRecords.forEach((r) => next.delete(r.id))
        return next
      })
    } else {
      setSelected((prev) => {
        const next = new Set(prev)
        pageRecords.forEach((r) => next.add(r.id))
        return next
      })
    }
  }

  async function handleDelete() {
    if (!deleteId) return
    try {
      await deleteSurgery(deleteId)
      toast.success('Record deleted.')
      setDeleteId(null)
      load()
      onChange()
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete')
    }
  }

  async function handleBulkDelete() {
    if (selected.size === 0) return
    try {
      const n = await bulkDeleteSurgeries(Array.from(selected))
      toast.success(`${n} record(s) deleted.`)
      setBulkDeleteOpen(false)
      setSelected(new Set())
      load()
      onChange()
    } catch (err: any) {
      toast.error(err.message || 'Failed to bulk delete')
    }
  }

  async function handleDuplicate(id: string) {
    try {
      await duplicateSurgery(id)
      toast.success('Record duplicated.')
      load()
      onChange()
    } catch (err: any) {
      toast.error(err.message || 'Failed to duplicate')
    }
  }

  function handleExport(format: 'csv' | 'excel' | 'pdf') {
    const url = exportUrl(format, {
      search: debouncedSearch,
      hospital,
      village,
      surgeryName,
      date: dateFilter,
    })
    if (format === 'pdf') {
      window.open(url, '_blank')
    } else {
      // Trigger download
      const a = document.createElement('a')
      a.href = url
      a.download = `surgery-records.${format === 'excel' ? 'csv' : 'csv'}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
    toast.success(`Exporting as ${format.toUpperCase()}...`)
  }

  function handlePrint() {
    handleExport('pdf')
  }

  return (
    <Card className="shadow-sm border-border/60">
      {!hideFilters && (
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Filter className="size-4 text-primary" /> Filters
            </CardTitle>
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="size-3" /> Clear
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
            <div className="relative sm:col-span-2 lg:col-span-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search patients, villages..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={hospital || '__all__'} onValueChange={(v) => setHospital(v === '__all__' ? '' : v)}>
              <SelectTrigger className="w-full"><SelectValue placeholder="All Hospitals" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All Hospitals</SelectItem>
                <SelectItem value="Sadvichar">Sadvichar Hospital</SelectItem>
                <SelectItem value="Other">Other Hospital</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Village" value={village} onChange={(e) => setVillage(e.target.value)} />
            <Input placeholder="Surgery name" value={surgeryName} onChange={(e) => setSurgeryName(e.target.value)} />
            <Input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
          </div>
        </CardHeader>
      )}
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Button size="sm" variant="success" onClick={() => { setEditRecord(null); setDialogOpen(true) }}>
              <Plus className="size-4" /> Add Surgery
            </Button>
            {selected.size > 0 && (
              <Button size="sm" variant="destructive" onClick={() => setBulkDeleteOpen(true)}>
                <Trash2 className="size-4" /> Delete ({selected.size})
              </Button>
            )}
            <span className="text-xs text-muted-foreground">{records.length} record(s) found</span>
          </div>
          <div className="flex items-center gap-1">
            <Button size="sm" variant="outline" onClick={() => handleExport('excel')}>
              <FileSpreadsheet className="size-4" /> Excel
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleExport('csv')}>
              <Download className="size-4" /> CSV
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleExport('pdf')}>
              <FileText className="size-4" /> PDF
            </Button>
            <Button size="sm" variant="ghost" onClick={handlePrint}>
              <Printer className="size-4" /> Print
            </Button>
          </div>
        </div>

        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={pageRecords.length > 0 && pageRecords.every((r) => selected.has(r.id))}
                    onCheckedChange={toggleSelectAll}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Village</TableHead>
                <TableHead>Surgery</TableHead>
                <TableHead>Hospital</TableHead>
                <TableHead className="text-right">Charge</TableHead>
                <TableHead className="text-right">Commission</TableHead>
                {!compact && <TableHead>Notes</TableHead>}
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={compact ? 9 : 10} className="text-center py-10 text-muted-foreground">
                    <Loader2 className="size-5 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : pageRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={compact ? 9 : 10} className="text-center py-10 text-muted-foreground">
                    No records found. {hasFilters ? 'Try clearing filters.' : 'Add a new surgery to get started.'}
                  </TableCell>
                </TableRow>
              ) : (
                pageRecords.map((r) => (
                  <TableRow key={r.id} data-state={selected.has(r.id) ? 'selected' : undefined}>
                    <TableCell>
                      <Checkbox checked={selected.has(r.id)} onCheckedChange={() => toggleSelect(r.id)} aria-label={`Select ${r.patientName}`} />
                    </TableCell>
                    <TableCell className="text-sm whitespace-nowrap">{formatDate(r.surgeryDate)}</TableCell>
                    <TableCell className="font-medium">{r.patientName}</TableCell>
                    <TableCell className="text-sm">{r.village}</TableCell>
                    <TableCell className="text-sm">{r.surgeryName}</TableCell>
                    <TableCell>
                      <Badge variant={r.hospital === 'Sadvichar' ? 'default' : 'secondary'} className="whitespace-nowrap">
                        {r.hospital === 'Sadvichar' ? 'Sadvichar' : 'Other'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium whitespace-nowrap">{formatINR(r.surgeryCharge)}</TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      {r.commission > 0 ? (
                        <span className="text-amber-600 dark:text-amber-400 font-medium">{formatINR(r.commission)}</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    {!compact && (
                      <TableCell className="text-xs text-muted-foreground max-w-32 truncate" title={r.notes || ''}>
                        {r.notes || '—'}
                      </TableCell>
                    )}
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => { setEditRecord(r); setDialogOpen(true) }}>
                            <Pencil className="size-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicate(r.id)}>
                            <Copy className="size-4" /> Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" onClick={() => setDeleteId(r.id)}>
                            <Trash2 className="size-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {records.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Rows per page:</span>
              <Select value={String(pageSizeState)} onValueChange={(v) => setPageSizeState(Number(v))}>
                <SelectTrigger className="h-8 w-20"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[5, 10, 20, 50, 100].map((n) => (
                    <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span>· Page {page} of {totalPages}</span>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" onClick={() => setPage(1)} disabled={page === 1}>
                First
              </Button>
              <Button variant="outline" size="icon" className="size-8" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                <ChevronLeft className="size-4" />
              </Button>
              <Button variant="outline" size="icon" className="size-8" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                <ChevronRight className="size-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPage(totalPages)} disabled={page === totalPages}>
                Last
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      <SurgeryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        record={editRecord}
        onSaved={() => { load(); onChange() }}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this record?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The surgery record will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-white hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selected.size} record(s)?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all selected surgery records. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete} className="bg-destructive text-white hover:bg-destructive/90">
              Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
