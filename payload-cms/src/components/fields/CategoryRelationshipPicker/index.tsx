'use client'

import React from 'react'
import { RelationshipPicker } from '../RelationshipPicker'

export const CategoryRelationshipPicker: React.FC<any> = (props) => {
  return <RelationshipPicker {...props} adminLabelField="adminLabel" />
}
