'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Apple, Download, Loader2, MonitorDown, Smartphone } from 'lucide-react'
import { usePwaInstall } from '@/hooks/use-pwa-install'
import { toast } from 'sonner'

interface InstallButtonProps {
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'icon'
  className?: string
  showLabel?: boolean
}

/**
 * InstallButton — shows a "Download App" / "Install" control.
 *
 * Behavior:
 *  - If running in standalone mode (already installed): not rendered
 *  - If browser supports beforeinstallprompt (Chrome/Edge/Android desktop): clicking
 *    the button triggers the native install dialog directly
 *  - If on iOS Safari (no beforeinstallprompt event): opens a modal with
 *    step-by-step instructions to use Share → Add to Home Screen
 *  - Other browsers: opens the same modal with generic instructions
 */
export function InstallButton({
  variant = 'outline',
  size = 'sm',
  className = '',
  showLabel = true,
}: InstallButtonProps) {
  const { canInstall, isInstalled, isIOS, promptInstall } = usePwaInstall()
  const [busy, setBusy] = React.useState(false)
  const [instructionsOpen, setInstructionsOpen] = React.useState(false)

  // Hide button entirely if app is already installed
  if (isInstalled) return null

  async function handleInstallClick() {
    if (canInstall) {
      setBusy(true)
      try {
        const outcome = await promptInstall()
        if (outcome === 'accepted') {
          toast.success('App is being installed...', {
            description: 'Check your home screen / desktop for the Sadvichar Surgery icon.',
          })
        } else if (outcome === 'dismissed') {
          toast.info('Install dismissed', {
            description: 'You can install the app anytime from this button.',
          })
        }
      } catch {
        toast.error('Could not start install. Try the manual instructions.')
        setInstructionsOpen(true)
      } finally {
        setBusy(false)
      }
    } else {
      // iOS Safari or other browser without beforeinstallprompt — show instructions modal
      setInstructionsOpen(true)
    }
  }

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        className={className}
        onClick={handleInstallClick}
        disabled={busy}
        title="Install this app on your device for offline use"
      >
        {busy ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Download className="size-4" />
        )}
        {showLabel && (
          <span className="hidden sm:inline">{busy ? 'Installing...' : 'Download App'}</span>
        )}
        {showLabel && <span className="sm:hidden">{busy ? '...' : 'App'}</span>}
      </Button>

      <InstallInstructionsDialog
        open={instructionsOpen}
        onOpenChange={setInstructionsOpen}
        isIOS={isIOS}
      />
    </>
  )
}

function InstallInstructionsDialog({
  open,
  onOpenChange,
  isIOS,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  isIOS: boolean
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MonitorDown className="size-5 text-primary" />
            Install Sadvichar Surgery App
          </DialogTitle>
          <DialogDescription>
            Install this web app on your device so you can launch it like a native app —
            with its own icon, no browser address bar, and full-screen experience.
          </DialogDescription>
        </DialogHeader>

        {isIOS ? (
          <div className="space-y-3 text-sm">
            <p className="font-medium text-foreground">On iPhone / iPad (Safari):</p>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>
                Tap the <strong className="text-foreground inline-flex items-center gap-1">
                  <Apple className="size-3.5" /> Share
                </strong> button in Safari&apos;s toolbar (square with an up arrow).
              </li>
              <li>
                Scroll down and tap <strong className="text-foreground">Add to Home Screen</strong>.
              </li>
              <li>
                Confirm the name (e.g. <em>Sadvichar Surgery</em>) and tap <strong className="text-foreground">Add</strong>.
              </li>
              <li>The app icon will appear on your home screen.</li>
            </ol>
          </div>
        ) : (
          <div className="space-y-4 text-sm">
            <div className="space-y-2">
              <p className="font-medium text-foreground flex items-center gap-2">
                <Smartphone className="size-4" /> On Android (Chrome):
              </p>
              <ol className="list-decimal list-inside space-y-1.5 text-muted-foreground">
                <li>Tap the <strong className="text-foreground">three-dot menu</strong> (⋮) in Chrome.</li>
                <li>Select <strong className="text-foreground">Install app</strong> or <strong className="text-foreground">Add to Home screen</strong>.</li>
                <li>Tap <strong className="text-foreground">Install</strong> to confirm.</li>
              </ol>
            </div>
            <div className="space-y-2">
              <p className="font-medium text-foreground flex items-center gap-2">
                <MonitorDown className="size-4" /> On Desktop (Chrome / Edge):
              </p>
              <ol className="list-decimal list-inside space-y-1.5 text-muted-foreground">
                <li>Click the <strong className="text-foreground">install icon</strong> (⊕) at the right end of the address bar.</li>
                <li>Or click the <strong className="text-foreground">three-dot menu</strong> → <strong className="text-foreground">Install Sadvichar Surgery Records</strong>.</li>
                <li>Confirm by clicking <strong className="text-foreground">Install</strong>.</li>
              </ol>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Got it
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
