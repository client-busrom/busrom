/**
 * Navigation Sort Button Component
 *
 * This component renders a button in the NavigationMenu list view
 * that links to the drag-and-drop sorting interface
 */

import React from 'react'
import { Button } from '@keystone-ui/button'

export function NavigationSortButton() {
  const handleClick = () => {
    window.location.href = '/navigation-manager'
  }

  return (
    <Button
      tone="active"
      weight="bold"
      onClick={handleClick}
      style={{ marginBottom: '16px' }}
    >
      🔀 Drag & Drop Sort Menu Items
    </Button>
  )
}
