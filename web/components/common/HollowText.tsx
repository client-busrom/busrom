"use client"

import React, { useId } from "react"

/**
 * HollowText Component
 * Implements a "True Outside Stroke" effect using SVG Filters.
 */
interface HollowTextProps {
  children: React.ReactNode
  strokeColor?: string
  strokeWidth?: number
  fillColor?: string
  className?: string
  style?: React.CSSProperties
}

export function HollowText({ 
  children, 
  strokeColor = "white", 
  strokeWidth = 1.2, 
  fillColor,
  className = "",
  style = {}
}: HollowTextProps) {
  const uniqueId = useId()
  const filterId = "true-outline-" + uniqueId.replace(/:/g, "")

  return (
    <>
      {/* Hidden SVG Filter Definition */}
      <svg width="0" height="0" className="absolute pointer-events-none" aria-hidden="true">
        <defs>
          <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
            {/* 1. Extract and Dilate (Grow) Alpha channel */}
            <feMorphology in="SourceAlpha" operator="dilate" radius={strokeWidth} result="dilated" />
            
            {/* 2. Create the outline area by subtracting source alpha if hollow */}
            {!fillColor ? (
              <feComposite in="dilated" in2="SourceAlpha" operator="out" result="outline" />
            ) : (
              <feOffset in="dilated" result="outline" />
            )}
            
            {/* 3. Color the outline */}
            <feFlood floodColor={strokeColor} result="outline-color" />
            <feComposite in="outline-color" in2="outline" operator="in" result="colored-outline" />

            {/* 4. If solid, merge original graphic on top of outline */}
            {fillColor ? (
              <feMerge>
                <feMergeNode in="colored-outline" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            ) : (
              <feOffset in="colored-outline" />
            )}
          </filter>
        </defs>
      </svg>

      <span 
        className={className}
        style={{ 
          color: fillColor || "transparent",
          ...style,
          filter: `url(#${filterId})`
        }}
      >
        {children}
      </span>
    </>
  )
}
