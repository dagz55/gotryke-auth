'use client'

import { useEffect } from 'react'

export default function AuthRedirector() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    const originalFetch = window.fetch

    // Avoid double-patching
    if ((window as any).__gotrykeFetchPatched) return
    ;(window as any).__gotrykeFetchPatched = true

    window.fetch = async (...args) => {
      const response = await originalFetch(...args as Parameters<typeof fetch>)
      try {
        const reqUrl = typeof args[0] === 'string' ? args[0] : (args[0] as Request).url
        if (reqUrl.includes('/api/auth/signin')) {
          if (response.ok) {
            // Clone to avoid locking the body
            const clone = response.clone()
            clone.json().then((data) => {
              if (data?.success) {
                // Force immediate navigation; don't wait for listeners
                setTimeout(() => {
                  window.location.href = '/dashboard'
                }, 150)
              }
            }).catch(() => {})
          }
        }
      } catch {
        // no-op
      }
      return response
    }

    return () => {
      window.fetch = originalFetch
      ;(window as any).__gotrykeFetchPatched = false
    }
  }, [])

  return null
}


