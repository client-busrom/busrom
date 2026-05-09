'use client'
import React from 'react'

/**
 * RowSpacer
 * A simple UI component that takes up all available space in a flex row,
 * pushing subsequent items to the right.
 */
export const RowSpacer: React.FC = () => {
  return <div style={{ flexGrow: 1 }} />
}

export default RowSpacer
