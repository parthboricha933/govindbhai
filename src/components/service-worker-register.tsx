'use client'

import * as React from 'react'

/**
 * ServiceWorkerRegister — client component that registers /sw.js on mount
 * (only in production browsers that support service workers).
 * Renders nothing.
 */
export function ServiceWorkerRegister() {
  React.useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator)) return
    // Don't register in dev — Next dev server and SW caching conflict
    if (process.env.NODE_ENV !== 'production') return

    const onLoad = () => {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .catch((err) => {
          // Silent fail — service worker is a progressive enhancement
          console.warn('SW registration failed:', err)
        })
    }

    if (document.readyState === 'complete') {
      onLoad()
    } else {
      window.addEventListener('load', onLoad)
      return () => window.removeEventListener('load', onLoad)
    }
  }, [])

  return null
}
