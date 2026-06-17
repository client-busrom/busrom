'use client'

/**
 * Custom Logo Component for Payload Admin
 *
 * Displays Busrom logo in the admin sidebar
 */

import React from 'react'

export const Logo: React.FC = () => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '20px 16px',
      }}
    >
      {/* Logo Icon - Gold Circle with B */}
      <div
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '8px',
          background: 'linear-gradient(135deg, #A08745 0%, #756F3F 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FFFFFF',
          fontSize: '20px',
          fontWeight: 700,
          fontFamily: 'system-ui, -apple-system, sans-serif',
          boxShadow: '0 2px 8px rgba(160, 135, 69, 0.3)',
          flexShrink: 0,
        }}
      >
        B
      </div>
      {/* Brand Name */}
      <div>
        <div
          style={{
            fontSize: '18px',
            fontWeight: 700,
            color: '#756F3F',
            letterSpacing: '0.5px',
          }}
        >
          BUSROM
        </div>
        <div
          style={{
            fontSize: '11px',
            color: '#978350',
            letterSpacing: '1px',
          }}
        >
          CMS
        </div>
      </div>
    </div>
  )
}

export const Icon: React.FC = () => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0, display: 'block' }}
    >
      <defs>
        <linearGradient id="icon-grad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#A08745" />
          <stop offset="100%" stopColor="#756F3F" />
        </linearGradient>
      </defs>
      <rect width="24" height="24" rx="4" fill="url(#icon-grad)" />
      <text
        x="50%"
        y="50%"
        dominantBaseline="central"
        textAnchor="middle"
        fill="#FFFFFF"
        fontSize="14"
        fontWeight="700"
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        B
      </text>
    </svg>
  )
}

export default Logo
