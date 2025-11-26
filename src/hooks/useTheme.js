import { useState, useEffect } from 'react'
import apiService from '@/services/api'

/**
 * Custom hook to fetch and apply theme from API
 * Automatically applies CSS variables when theme changes
 */
export const useTheme = () => {
  const [theme, setTheme] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchTheme()
  }, [])

  const fetchTheme = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await apiService.getActiveTheme()
      
      if (response.data.success) {
        const themeData = response.data.data
        setTheme(themeData)
        applyTheme(themeData)
      }
    } catch (err) {
      console.error('Error fetching theme:', err)
      setError(err.message)
      // Use default theme on error
      applyDefaultTheme()
    } finally {
      setLoading(false)
    }
  }

  const applyTheme = (themeData) => {
    if (!themeData || !themeData.cssVariables) return

    const root = document.documentElement
    
    // Apply all CSS variables
    Object.entries(themeData.cssVariables).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })

    // Apply typography if available
    if (themeData.typography) {
      if (themeData.typography.fontFamily) {
        root.style.setProperty('font-family', themeData.typography.fontFamily)
      }
    }

    // Apply border radius if available
    if (themeData.borderRadius) {
      if (themeData.borderRadius.md) {
        root.style.setProperty('--radius', themeData.borderRadius.md)
      }
      if (themeData.borderRadius.sm) {
        root.style.setProperty('--radius-sm', themeData.borderRadius.sm)
      }
      if (themeData.borderRadius.lg) {
        root.style.setProperty('--radius-lg', themeData.borderRadius.lg)
      }
      if (themeData.borderRadius.xl) {
        root.style.setProperty('--radius-xl', themeData.borderRadius.xl)
      }
    }
  }

  const applyDefaultTheme = () => {
    // Default theme fallback
    const root = document.documentElement
    const defaultPrimary = '#AE613A'
    
    root.style.setProperty('--primary', defaultPrimary)
    root.style.setProperty('--primary-100', defaultPrimary)
    root.style.setProperty('--primary-80', 'rgba(174, 97, 58, 0.8)')
    root.style.setProperty('--primary-60', 'rgba(174, 97, 58, 0.6)')
    root.style.setProperty('--primary-40', 'rgba(174, 97, 58, 0.4)')
    root.style.setProperty('--primary-30', 'rgba(174, 97, 58, 0.3)')
    root.style.setProperty('--primary-20', 'rgba(174, 97, 58, 0.2)')
    root.style.setProperty('--primary-10', 'rgba(174, 97, 58, 0.1)')
    root.style.setProperty('--primary-5', 'rgba(174, 97, 58, 0.05)')
    root.style.setProperty('--ring', defaultPrimary)
  }

  const refreshTheme = () => {
    fetchTheme()
  }

  return {
    theme,
    loading,
    error,
    refreshTheme
  }
}

export default useTheme

