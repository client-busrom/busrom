'use client'

import React from 'react'

interface CategoryAdminLabelProps {
  readonly cellData?: any
  readonly rowData?: any
}

export const CategoryAdminLabel: React.FC<CategoryAdminLabelProps> = ({ rowData }) => {
  const adminLabel = rowData?.adminLabel
  if (adminLabel) {
    return <span>{adminLabel}</span>
  }

  const name = rowData?.name
  if (typeof name === 'object' && name !== null) {
    return <span>{name.en || name.zh || 'Untitled'}</span>
  }

  return <span>{name || rowData?.slug || rowData?.id || 'Untitled'}</span>
}
