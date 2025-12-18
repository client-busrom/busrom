'use client'

/**
 * Admin Styles Provider
 *
 * Injects CSS to customize admin UI based on current route.
 * Hides unnecessary actions on the account page.
 */

import React, { useEffect } from 'react'
import { usePathname } from 'next/navigation'

// CSS to hide unwanted buttons on account page
const accountPageCSS = `
  /* Hide "Copy to locale" in the popup menu - be specific to doc controls */
  .doc-controls [class*="copyLocale"],
  .doc-controls button[aria-label*="Copy to"] {
    display: none !important;
  }

  /* Hide duplicate/delete in document actions popup - only in doc controls */
  .doc-controls .popup-button-list__button--delete,
  .doc-controls .popup-button-list__button--duplicate {
    display: none !important;
  }

  /* Hide the "Create New" link in doc header only */
  .doc-header__create-new {
    display: none !important;
  }

  /* Hide API URL display */
  .doc-controls .api-url {
    display: none !important;
  }
`

export const AdminStylesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname()
  const isAccountPage = pathname?.includes('/admin/account')

  useEffect(() => {
    const styleId = 'admin-account-styles'
    let styleElement = document.getElementById(styleId) as HTMLStyleElement | null

    if (isAccountPage) {
      // Add styles when on account page
      if (!styleElement) {
        styleElement = document.createElement('style')
        styleElement.id = styleId
        styleElement.textContent = accountPageCSS
        document.head.appendChild(styleElement)
      }
    } else {
      // Remove styles when not on account page
      if (styleElement) {
        styleElement.remove()
      }
    }

    // Cleanup on unmount
    return () => {
      const el = document.getElementById(styleId)
      if (el && !isAccountPage) {
        el.remove()
      }
    }
  }, [isAccountPage])

  return <>{children}</>
}

export default AdminStylesProvider
