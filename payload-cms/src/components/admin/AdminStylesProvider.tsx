'use client'

/**
 * Admin Styles Provider
 *
 * Injects CSS to customize admin UI based on current route.
 * Hides unnecessary actions on the account page.
 * Styles global elements like list selection toolbar buttons.
 */

import React, { useEffect } from 'react'
import { usePathname } from 'next/navigation'

// Global CSS for all admin pages
const globalAdminCSS = `
  /* ================================================================== */
  /* Fix breadcrumb icon cropping */
  /* ================================================================== */
  .step-nav__home, .step-nav__home span {
    overflow: visible !important;
  }
  .step-nav__home span {
    display: inline-flex !important;
    align-items: center;
    justify-content: center;
  }

  /* ================================================================== */
  /* List Selection Toolbar Buttons Styling (编辑 / 删除 按钮美化与防误触) */
  /* ================================================================== */
  .list-selection .edit-many button,
  .list-selection .delete-many button,
  .list-selection .publish-many button,
  .list-selection .unpublish-many button,
  .list-selection button.list-selection__button {
    display: inline-flex !important;
    align-items: center;
    justify-content: center;
    padding: 6px 16px !important;
    margin-left: 12px !important;
    border-radius: 6px !important;
    font-weight: 500 !important;
    font-size: 13px !important;
    text-decoration: none !important;
    transition: all 0.2s ease !important;
    cursor: pointer !important;
    border: 1px solid transparent !important;
    line-height: 1.5 !important;
    height: auto !important;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05) !important;
  }

  /* Default Action Button Styling (Edit / Publish / etc. - Neutral/Primary Outline) */
  .list-selection .edit-many button,
  .list-selection .publish-many button,
  .list-selection .unpublish-many button,
  .list-selection button.list-selection__button {
    background-color: var(--theme-elevation-100) !important;
    color: var(--theme-elevation-800) !important;
    border-color: var(--theme-elevation-200) !important;
  }
  .list-selection .edit-many button:hover,
  .list-selection .publish-many button:hover,
  .list-selection .unpublish-many button:hover,
  .list-selection button.list-selection__button:hover {
    background-color: var(--theme-elevation-200) !important;
    color: var(--theme-elevation-900) !important;
    border-color: var(--theme-elevation-300) !important;
    transform: translateY(-1px);
  }

  /* Delete Button Styling Override (Danger Outline/Solid) */
  .list-selection .delete-many button {
    background-color: var(--theme-error-50, #fff2f0) !important;
    color: var(--theme-error-500, #ff4d4f) !important;
    border-color: var(--theme-error-200, #ffccc7) !important;
  }
  .list-selection .delete-many button:hover {
    background-color: var(--theme-error-500, #ff4d4f) !important;
    color: #ffffff !important;
    border-color: var(--theme-error-500, #ff4d4f) !important;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(255, 77, 79, 0.2) !important;
  }
`

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
    // 1. Global Admin Styles (always injected)
    const globalStyleId = 'admin-global-styles'
    let globalStyleEl = document.getElementById(globalStyleId) as HTMLStyleElement | null
    if (!globalStyleEl) {
      globalStyleEl = document.createElement('style')
      globalStyleEl.id = globalStyleId
      globalStyleEl.textContent = globalAdminCSS
      document.head.appendChild(globalStyleEl)
    }

    // 2. Account Page Styles
    const accountStyleId = 'admin-account-styles'
    let accountStyleEl = document.getElementById(accountStyleId) as HTMLStyleElement | null

    if (isAccountPage) {
      // Add styles when on account page
      if (!accountStyleEl) {
        accountStyleEl = document.createElement('style')
        accountStyleEl.id = accountStyleId
        accountStyleEl.textContent = accountPageCSS
        document.head.appendChild(accountStyleEl)
      }
    } else {
      // Remove styles when not on account page
      if (accountStyleEl) {
        accountStyleEl.remove()
      }
    }

    // Cleanup account styles on unmount
    return () => {
      const el = document.getElementById(accountStyleId)
      if (el && !isAccountPage) {
        el.remove()
      }
    }
  }, [isAccountPage])

  return <>{children}</>
}

export default AdminStylesProvider

