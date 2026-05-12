"use client"

import React from "react"
import { motion } from "framer-motion"

export const MarketingSalesDecorator = () => {
  return (
    <svg width="720" height="117" viewBox="0 0 720 117" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M642.285 1.23882L719.127 115.263" stroke="#978F55" strokeWidth="2" strokeLinecap="round"/>
      <path d="M546.093 1.23871L633.779 115.263" stroke="#978F55" strokeWidth="2" strokeLinecap="round"/>
      <path d="M407.193 0L523.696 116.503" stroke="#978F55" strokeWidth="2" strokeLinecap="round"/>
      <path d="M315.674 1.23871L394.065 115.263" stroke="#978F55" strokeWidth="2" strokeLinecap="round"/>
      <path d="M217.183 1.23882L295.574 115.263" stroke="#978F55" strokeWidth="2" strokeLinecap="round"/>
      <path d="M97.7568 1.23882L190.091 116.502" stroke="#978F55" strokeWidth="2" strokeLinecap="round"/>
      <path d="M0 0.619354L79.166 116.502" stroke="#978F55" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

export const MarketingSalesNextBtn = ({ onClick, disabled, size = "83px" }: { onClick: () => void; disabled?: boolean; size?: string }) => {
  const [hover, setHover] = React.useState(false)

  return (
    <motion.button
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      whileHover={{ scale: 1.2 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      disabled={disabled}
      className="focus:outline-none transition-opacity disabled:opacity-30 flex items-center justify-center rounded-full relative"
      style={{ width: size, height: size }}
    >
      <svg width="100%" height="100%" viewBox="0 0 83 82" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Default State: Outline Circle + Solid Arrow */}
        <motion.circle 
          cx="41.5" cy="41" r="40.5" 
          stroke="white" strokeWidth="1" 
          animate={{ opacity: hover ? 0 : 1 }}
        />
        <motion.path 
          d="M32.0723 27.5225L45.6885 41.0566L32.0723 54.5918L34.3916 56.9551L50.5869 41.0566L34.3916 25.1592L32.0723 27.5225Z" 
          fill="white"
          animate={{ opacity: hover ? 0 : 1 }}
        />

        {/* Hover State: Solid Circle + Cutout Arrow (Even-Odd) */}
        <motion.path 
          fillRule="evenodd" clipRule="evenodd" 
          d="M41.5 0C64.4198 0 83 18.3563 83 41C83 63.6437 64.4198 82 41.5 82C18.5802 82 0 63.6437 0 41C0 18.3563 18.5802 0 41.5 0ZM32.0723 27.5225L45.6885 41.0566L32.0723 54.5918L34.3916 56.9551L50.5869 41.0566L34.3916 25.1592L32.0723 27.5225Z" 
          fill="white"
          initial={{ opacity: 0 }}
          animate={{ opacity: hover ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        />
      </svg>
    </motion.button>
  )
}

export const MarketingSalesPrevBtn = ({ onClick, disabled, size = "83px" }: { onClick: () => void; disabled?: boolean; size?: string }) => {
  const [hover, setHover] = React.useState(false)

  return (
    <motion.button
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      whileHover={{ scale: 1.2 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      disabled={disabled}
      className="focus:outline-none transition-opacity disabled:opacity-30 flex items-center justify-center rounded-full relative"
      style={{ width: size, height: size }}
    >
      <svg width="100%" height="100%" viewBox="0 0 83 82" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Default State */}
        <motion.circle 
          cx="41.5" cy="41" r="40.5" 
          stroke="white" strokeWidth="1" 
          animate={{ opacity: hover ? 0 : 1 }}
        />
        <motion.path 
          d="M50.9281 27.5226L48.6081 25.1592L32.4131 41.057L48.608 56.9547L50.9281 54.5914L37.3117 41.057L50.9281 27.5226Z" 
          fill="white"
          animate={{ opacity: hover ? 0 : 1 }}
        />

        {/* Hover State: Cutout version */}
        <motion.path 
          fillRule="evenodd" clipRule="evenodd" 
          d="M41.5 0C64.4198 0 83 18.3563 83 41C83 63.6437 64.4198 82 41.5 82C18.5802 82 0 63.6437 0 41C0 18.3563 18.5802 0 41.5 0ZM50.9281 27.5226L48.6081 25.1592L32.4131 41.057L48.608 56.9547L50.9281 54.5914L37.3117 41.057L50.9281 27.5226Z" 
          fill="white"
          initial={{ opacity: 0 }}
          animate={{ opacity: hover ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        />
      </svg>
    </motion.button>
  )
}
