'use client'

import * as React from 'react'

// Minimal type for the beforeinstallprompt event (not in standard TS DOM lib)
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt: () => Promise<void>
}

/**
 * usePwaInstall — React hook that listens for the browser's `beforeinstallprompt`
 * event (Chrome/Edge/Android) and exposes:
 *  - `canInstall`: whether the browser allows programmatic install prompt
 *  - `promptInstall`: async function that shows the native install dialog
 *  - `isInstalled`: whether the app is currently running in standalone (installed) mode
 *  - `isIOS`: whether the user is on iOS Safari (no beforeinstallprompt event there)
 */
export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = React.useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = React.useState(false)
  const [isIOS, setIsIOS] = React.useState(false)

  React.useEffect(() => {
    if (typeof window === 'undefined') return

    // Detect iOS Safari — PWA install is supported but only via the Share → Add to Home Screen menu.
    const ua = window.navigator.userAgent
    const isIOSDevice = /iPad|iPhone|iPod/.test(ua) || (ua.includes('Mac') && 'ontouchend' in document)
    setIsIOS(isIOSDevice)

    // Detect standalone (already installed) mode
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      // iOS Safari uses a different media feature
      (window.navigator as any).standalone === true
    setIsInstalled(standalone)

    function onBeforeInstallPrompt(e: Event) {
      e.preventDefault() // Prevent Chrome 67+ from auto-showing the mini-infobar
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    function onAppInstalled() {
      setIsInstalled(true)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt as EventListener)
    window.addEventListener('appinstalled', onAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt as EventListener)
      window.removeEventListener('appinstalled', onAppInstalled)
    }
  }, [])

  const promptInstall = React.useCallback(async (): Promise<'accepted' | 'dismissed' | 'unavailable'> => {
    if (!deferredPrompt) return 'unavailable'
    await deferredPrompt.prompt()
    const choice = await deferredPrompt.userChoice
    setDeferredPrompt(null)
    return choice.outcome
  }, [deferredPrompt])

  return {
    canInstall: !!deferredPrompt,
    isInstalled,
    isIOS,
    promptInstall,
  }
}
