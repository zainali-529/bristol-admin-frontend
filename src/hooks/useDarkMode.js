import { useState, useEffect } from 'react'

/**
 * Custom hook to manage dark mode state
 * Persists theme preference to localStorage
 */
export const useDarkMode = () => {
  const [darkMode, setDarkMode] = useState(false)

  // Check for saved theme preference or default to light mode
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const isDark = savedTheme === 'dark'
    setDarkMode(isDark)
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  return {
    darkMode,
    toggleDarkMode,
  }
}

export default useDarkMode

