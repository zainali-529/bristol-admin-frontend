import { Fragment } from 'react'

/**
 * Theme Provider Component
 * Pass-through provider for static theme.
 * Uses CSS variables from index.css; no dynamic API theming.
 */
function ThemeProvider({ children }) {
  return <Fragment>{children}</Fragment>
}

export default ThemeProvider

