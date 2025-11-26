import { useEffect } from 'react'
import { useTheme } from '@/hooks/useTheme'

/**
 * Theme Provider Component
 * Fetches theme from API and applies it to the application
 * Should be placed at the root of your app
 */
function ThemeProvider({ children }) {
  const { loading, error } = useTheme()

  useEffect(() => {
    if (error) {
      console.warn('Theme loading error, using default theme:', error)
    }
  }, [error])

  // Show loading state if needed (optional)
  if (loading) {
    return children // Or return a loading spinner
  }

  return <>{children}</>
}

export default ThemeProvider

