'use client'

import { useEffect } from 'react'

export function BundleAnalyzer() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
      // Report bundle chunks loaded
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name.includes('chunk')) {
            console.log(`📦 Chunk loaded: ${entry.name} (${Math.round(entry.duration)}ms)`)
          }
        }
      })

      try {
        observer.observe({ type: 'navigation', buffered: true })
        observer.observe({ type: 'resource', buffered: true })
      } catch (e) {
        console.warn('Bundle analyzer: Performance Observer not supported')
      }

      return () => observer.disconnect()
    }
  }, [])

  return null
}