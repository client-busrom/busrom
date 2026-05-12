"use client"

import React, { useState, Fragment } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { HollowText } from "@/components/common/HollowText"
import { SupportProcessLineSvg } from "./SupportProcessLineSvg"

const DESIGN_WIDTH = 1920
const vw = (px: number) => `calc(${px} * min(100vw, 1920px) / 1920)`
const ITEM_ICONS = [
  "M91.64063 0c2.14844 0 5.13672 1.23585 6.66015 2.74219l20 19.87207c1.52339 1.5063 2.75383 4.48019 2.75391 6.60449l0 22.44043c0 2.12432-1.75781 3.8623-3.90625 3.8623l-2.51953 0c-2.14844 0-3.90625-1.73798-3.90625-3.8623l0-16.91699c0-2.12432-1.75782-3.8623-3.90625-3.86231l-12.79297 0c-2.14837 0-3.90614-1.73807-3.90625-3.8623l0-12.90039c0-2.12432-1.75781-3.8623-3.90625-3.86231l-72.40235 0c-2.14844 0-3.90625 1.73798-3.90625 3.86231l0 132.5c0.00026 2.12411 1.75797 3.8623 3.90625 3.8623l63.35938 0.03809c2.14835 0 3.92563 1.73811 3.92578 3.8623l0 2.06641c0.01953 2.12433-1.73828 3.8623-3.88672 3.8623l-73.30078 0c-2.14844 0-3.90625-1.73797-3.90625-3.8623l0-152.58399c0-2.12432 1.75781-3.8623 3.90625-3.8623l87.73437 0z m6.83593 63.20801c1.50386-1.50624 4.00391-1.5257 5.52735-0.01953l40.64453 39.86035c1.52342 1.48703 1.52344 3.93995 0.01953 5.44629l-2.07031 2.04687c-1.5234 1.50623-4.00391 1.50637-5.52735 0.01953l-27.7539-27.15332c-1.52336-1.48685-2.77343-0.98457-2.77344 1.13965l0 71.89844c0 2.12433-1.75781 3.8623-3.90625 3.8623l-2.92969 0c-2.14844 0-3.90625-1.73797-3.90625-3.8623l0-71.72461c-0.00001-2.1243-1.23048-2.62643-2.73437-1.12012l-26.875 26.94043c-1.50385 1.50622-3.98438 1.52568-5.50782 0.01953l-2.07031-2.04785c-1.52322-1.50635-1.52336-3.9588-0.01953-5.48437l39.88281-39.82129z m-62.14843 37.02148c2.14844 0 3.90625 1.73799 3.90624 3.86231l0 2.89648c0 2.12432-1.75781 3.86231-3.90625 3.86231l-11.60156 0c-2.14844 0-3.90625-1.73799-3.90625-3.86231l0-2.89648c0-2.12432 1.75781-3.86231 3.90625-3.86231l11.60156 0z m20.68359-30.7832c2.14844 0 3.90625 1.73798 3.90625 3.8623l0 2.89649c0 2.12432-1.75781 3.86231-3.90625 3.8623l-32.28516 0c-2.14844 0-3.90625-1.73798-3.90625-3.8623l0-2.89649c0-2.12432 1.75781-3.86231 3.90625-3.8623l32.28516 0z m40.11719-29.52832c2.14844 0 3.90625 1.73798 3.90625 3.8623l0 2.89649c0 2.12432-1.75782 3.8623-3.90625 3.8623l-72.40235 0c-2.14844 0-3.90625-1.73798-3.90625-3.8623l0-2.89649c0-2.12432 1.75781-3.8623 3.90625-3.8623l72.40235 0z",
  "M27.02051 7.24414c3.3705 0.00002 6.10156 2.70073 6.10156 6.0332-0.00023 3.33248-2.7314 6.03221-6.10156 6.03223-8.1705 0-14.8181 6.73362-14.81836 15.00879l0 111.52148c0.00023 8.2752 6.64784 15.00879 14.81836 15.00879l48.90918 0c3.37006 0.0002 6.10044 2.70018 6.10058 6.03223 0 3.33256-2.73044 6.033-6.10058 6.0332l-48.90918 0c-14.89935 0-27.02027-12.14572-27.02051-27.07422l0-111.52148c0.00015-14.92837 12.1211-27.07422 27.02051-27.07422z m81.3916 91.2666c18.22221 0 33.04878 14.65929 33.04883 32.67676 0 6.94026-2.21663 13.37015-5.96289 18.66797l12.90527 12.76074c2.38318 2.35466 2.38318 6.17561 0 8.53027-1.19157 1.17812-2.75261 1.76758-4.31348 1.76758-1.56086-0.00006-3.12193-0.58941-4.31347-1.76758l-12.97266-12.82617c-5.26134 3.4981-11.58882 5.54492-18.3916 5.54492-18.22209-0.00018-33.04785-14.66014-33.04785-32.67773 0.00005-18.01756 14.82579-32.67657 33.04785-32.67676z m0.00098 12.06543c-11.49518 0-20.84565 9.245-20.84571 20.61133 0 11.36638 9.3503 20.61133 20.84571 20.61133 11.49501-0.00023 20.8457-9.2451 20.8457-20.61133-0.00005-11.36599-9.35053-20.61109-20.8457-20.61133z m14.83398-103.33203c14.8972 0.00016 27.0181 12.14584 27.01855 27.07422l0 65.20117c0 3.33266-2.73127 6.03317-6.10156 6.0332-3.37051 0-6.10156-2.70072-6.10156-6.0332l0-65.20117c-0.00026-8.27506-6.64706-15.00863-14.81543-15.00879-3.37038 0-6.10134-2.69993-6.10156-6.03223 0-3.33268 2.73124-6.0332 6.10156-6.0332z m-63.04004 71.58594c2.84797-1.74572 6.57573-0.89772 8.36719 1.88672 0.16489 0.24545 2.59447 3.74121 6.49902 3.74121 4.0115-0.00022 6.64389-3.77073 6.67481-3.81543 1.86888-2.73361 5.63638-3.50771 8.43066-1.69336 2.78822 1.81647 3.6066 5.47907 1.80566 8.25976-2.24025 3.45812-8.32354 9.31429-16.91113 9.31446-8.63138 0-14.63926-5.8991-16.83008-9.38477-1.77734-2.82985-0.8978-6.54891 1.96387-8.30859z m-8.88379-27.2002c3.37014 0.00016 6.10052 2.6997 6.10059 6.03223l0 5.88574c-0.00014 3.33227-2.73049 6.03207-6.10059 6.03223-3.37023 0-6.10142-2.69986-6.10156-6.03223l0-5.88574c0.00007-3.33263 2.73129-6.03223 6.10156-6.03223z m47.62012 0c3.37013 0.00016 6.10032 2.6997 6.10059 6.03223l0 5.88574c-0.00015 3.33227-2.7305 6.03207-6.10059 6.03223-3.37043 0-6.10142-2.69986-6.10156-6.03223l0-5.88574c0.00007-3.33263 2.73129-6.03223 6.10156-6.03223z m-5.50684-51.62988c8.97097 0 16.26928 7.2169 16.26953 16.08691 0 8.87022-7.29841 16.08789-16.26953 16.0879l-36.60742 0c-8.97081-0.00013-16.26953-7.21774-16.26953-16.0879 0.00025-8.86994 7.29868-16.08679 16.26953-16.08691l36.60742 0z m-36.60742 12.06543c-2.20425 0.00013-4.06712 1.842-4.06738 4.02148 0 2.17968 1.86298 4.02233 4.06738 4.02247l36.60742 0c2.2045 0 4.06738-1.8427 4.06739-4.02247-0.00026-2.17956-1.86304-4.02148-4.06739-4.02148l-36.60742 0z",
  "M89.39258 109.08594c1.80446 0 3.26758 1.44626 3.26758 3.23047-0.00008 1.78414-1.46317 3.23047-3.26758 3.23047l-42.25195 0c-1.80425 0-3.26751-1.44633-3.26758-3.23047 0-1.78421 1.46329-3.23047 3.26758-3.23047l42.25195 0z m18.1084-29.8418c1.80446 0 3.26757 1.44627 3.26757 3.23047-0.00018 1.78404-1.46324 3.23047-3.26757 3.23047l-60.36035 0c-1.80434 0-3.26739-1.44643-3.26758-3.23047 0-1.7842 1.46312-3.23047 3.26757-3.23047l60.36036 0z m9.05468-29.8418c1.80417 0.00016 3.26661 1.44653 3.26661 3.23047-0.00003 1.78392-1.46247 3.23031-3.26661 3.23047l-69.41503 0c-1.80428 0-3.26755-1.44645-3.26758-3.23047 0-1.78404 1.46329-3.23047 3.26758-3.23047l69.41503 0z m1.83301-49.40234c2.62728 0.00001 4.76465 2.11412 4.76465 4.71191l0 11.72559 15.42871 0c2.62718 0.00014 4.76465 2.11404 4.76465 4.71191l0 98.23243-0.00586 0.09765c-0.55057 9.04981-3.65106 16.81917-9.21484 23.0918-4.50029 5.07341-10.60669 9.15196-18.14844 12.12207-12.93112 5.09222-26.4791 5.48828-30.32324 5.48828-0.54597 0-0.89893-0.00801-1.03614-0.01172l-59.66015 0c-2.62724 0-4.76457-2.11304-4.76465-4.71094l0-11.72656-15.42871 0c-2.6271-0.00009-4.76448-2.11334-4.76465-4.71094l0-134.30957c0-2.59774 2.13728-4.71181 4.76465-4.71191l113.62402 0z m-91.66113 153.70898l57.99219 0 0.05468 0.00196c0.00942 0.00026 0.32121 0.00976 0.87989 0.00976 3.55008 0 16.05468-0.36277 27.90527-5.02929 14.55512-5.73182 22.37788-15.6577 23.25293-29.50489l0-96.28808-110.08496 0 0 130.81054z m-20.19336-16.4375l13.65918 0 0-116.12207c0-2.5978 2.13736-4.71191 4.76465-4.71191l91.66113 0 0-9.97656-110.08496 0 0 130.81054z",
  "M59.40219 0.34765c2.10582 0.00002 4.56293 0.69392 5.96681 2.08203l26.67382 26.37402c1.75487 1.73517 2.45683 4.51217 1.75489 6.94141l-7.01953 21.16894 72.65135 71.14161c1.40387 1.38811 2.10544 3.12326 2.10547 4.8584 0 1.73514-0.70163 3.47028-2.10547 4.8584l-20.00585 19.78125c-1.40381 1.38793-3.15839 2.08199-4.91309 2.08203-1.75487 0-3.51016-0.69389-4.91406-2.08203l-72.2998-71.48926-21.41016 6.94043c-0.7019 0.34698-1.40357 0.34766-2.10547 0.34765-1.75486 0-3.51017-0.69391-4.91406-2.08203l-26.67383-26.375c-1.75474-1.73511-2.45639-3.8173-2.10547-5.89941l3.86035-29.84473c0.35096-2.42911 2.10588-4.85853 4.5625-5.55273 2.80779-0.69407 5.61623 0.00018 7.3711 1.73535l11.93262 11.79883 9.47656-9.37012-11.93359-11.79883c-2.10571-2.08219-2.45681-4.8589-1.75489-7.28809 0.70198-2.42918 2.80847-4.16371 5.61621-4.51074l30.1836-3.81738z m23.51563 130.83106l-26.32324 26.02734c-1.40389 1.38814-3.15919 2.08301-4.91407 2.08301-1.75476-0.00007-3.50927-0.69494-4.91308-2.08301l-24.21777-23.94531c-2.8074-2.77624-2.80758-6.94065 0-9.7168l25.97265-26.37403 34.39551 34.0088z m30.88575-129.09669c2.45688-2.77591 7.01948-2.77615 9.82714 0l41.41406 40.9502c13.33699 13.18729 13.33699 35.05064 0 48.58496-1.40382 1.38791-3.15837 2.08201-4.91309 2.08203-1.75486 0-3.51016-0.69389-4.91406-2.08203l-20.35644-20.47559-6.66797 6.59375-24.56835-24.29199 6.66894-6.59375-15.79395-15.61621c-2.80776-2.77624-2.80771-6.94053 0-9.7168l19.30372-19.43457z"
]

interface SupportRequestProcessSectionProps {
  titleNodes?: any[]
  subtitleNodes?: any[]
  items?: any[]
}

export function SupportRequestProcessSection({
  titleNodes = [],
  subtitleNodes = [],
  items = []
}: SupportRequestProcessSectionProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const renderNodes = (nodes: any[]): React.ReactNode => {
    if (!nodes || nodes.length === 0) return null
    return nodes.map((node, i) => {
      if (node.type === "linebreak") return <br key={i} />
      if (node.type === "text") {
        const isBold = (node.format & 1) !== 0
        if (isBold) {
          return (
            <HollowText 
              key={i} 
              strokeColor="currentColor" 
              strokeWidth={1}
              style={{ fontSize: "inherit", whiteSpace: "pre-wrap" }}
            >
              {node.text}
            </HollowText>
          )
        }
        return (
          <span 
            key={i} 
            className="font-bold whitespace-pre-wrap" 
            style={{ color: "inherit" }}
          >
            {node.text}
          </span>
        )
      }
      if (node.children) {
        return <Fragment key={i}>{renderNodes(node.children)}</Fragment>
      }
      return null
    })
  }

  const bounceTransition = {
    duration: 1.5,
    repeat: Infinity,
    repeatType: "reverse",
    ease: "easeInOut"
  } as const

  const itemPositions = [
    { x: 170, y: 310 },
    { x: 580, y: 450 },
    { x: 990, y: 310 },
    { x: 1400, y: 450 }
  ]

  return (
    <section className="relative w-full bg-[#f6f4ed] overflow-hidden">
      {/* --- DESKTOP HEIGHT SETTER --- */}
      <div className="hidden md:block" style={{ height: vw(1000) }} />

      {/* --- DESKTOP CONTENT (md and above) --- */}
      <div className="hidden md:block absolute inset-0 w-full h-full">
        {/* 1. Background Decorator */}
        <motion.div 
          className="absolute z-0 opacity-100 flex items-center justify-center" 
          style={{ 
              left: vw(314), 
              top: vw(0), 
              width: vw(191), 
              height: vw(191)
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <svg 
              width="100%" 
              height="100%" 
              viewBox="0 0 169 183" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="overflow-visible"
          >
              <path d="M71.1468 3.49792C79.3936 -1.16571 89.4814 -1.1657 97.7282 3.49793L155.166 35.9792C163.637 40.77 168.875 49.7492 168.875 59.4815V123.482C168.875 133.215 163.637 142.194 155.166 146.985L97.7282 179.466C89.4814 184.13 79.3936 184.13 71.1468 179.466L13.7093 146.985C5.23771 142.194 -7.62939e-06 133.215 -7.62939e-06 123.482V59.4815C-7.62939e-06 49.7492 5.23772 40.77 13.7093 35.9792L71.1468 3.49792Z" fill="#ECEAD8" fill-opacity="0.71"/>
          </svg>
        </motion.div>

        {/* Title Area */}
        <div className="relative z-10" style={{ paddingLeft: vw(154), paddingTop: vw(67) }}>
          <h3 
              className="font-josefin-sans font-bold text-[#756f3f]" 
              style={{ fontSize: vw(60), lineHeight: 1 }}
          >
              {renderNodes(titleNodes)}
          </h3>
          {subtitleNodes.length > 0 && (
            <div style={{ marginTop: vw(-76), marginLeft: vw(240) }}>
                <h2 
                    className="font-josefin-sans font-bold text-[#494106]" 
                    style={{ 
                        fontSize: vw(96), 
                        lineHeight: 0.96,
                        textShadow: "0px 1px 1px #464010"
                    }}
                >
                    {renderNodes(subtitleNodes)}
                </h2>
            </div>
          )}
        </div>

        {/* Items Rail */}
        <div className="absolute w-full h-full" style={{ top: 0, left: 0 }}>
          {/* Connector Line - Placed Behind */}
          <div 
              className="absolute z-0" 
              style={{ 
                  left: vw(130), 
                  top: vw(220), 
                  width: vw(1660), 
                  height: vw(686),
                  padding: vw(10) // Safety margin
              }}
          >
              <SupportProcessLineSvg />
          </div>

          {/* 4 Items */}
          {items.slice(0, 4).map((item, idx) => {
              const isActive = activeIndex === idx
              const pos = itemPositions[idx]
              const isTopText = idx === 1 || idx === 3 // Item 2 and 4
              const HEX_H = 404
              const VIEW_W = 350 // Viewbox width for regular hexagon
              
              return (
                  <motion.div
                      key={item.id}
                      onMouseEnter={() => setActiveIndex(idx)}
                      onMouseLeave={() => setActiveIndex(null)}
                      onClick={() => setActiveIndex(idx)}
                      initial={{ y: 0 }}
                      animate={{ y: -20 }}
                      transition={bounceTransition}
                      className={`absolute cursor-pointer flex flex-col items-center ${isActive ? "drop-shadow-2xl" : ""}`}
                      style={{ 
                          left: vw(pos.x), 
                          top: vw(pos.y),
                          width: vw(VIEW_W),
                          zIndex: isActive ? 30 : 10
                      }}
                  >
                      {/* Background Container (STATIC REGULAR HEXAGON) */}
                      <div className="relative" style={{ width: vw(VIEW_W), height: vw(HEX_H) }}>
                           <svg viewBox={`0 0 ${VIEW_W} ${HEX_H}`} className="w-full h-full overflow-visible">
                              <motion.path
                                  d={`M${VIEW_W/2} 0 L${VIEW_W} ${HEX_H/4} L${VIEW_W} ${3*HEX_H/4} L${VIEW_W/2} ${HEX_H} L0 ${3*HEX_H/4} L0 ${HEX_H/4} Z`}
                                  animate={{
                                      stroke: isActive ? "#aba368" : "transparent",
                                      strokeWidth: isActive ? 4 : 0,
                                      scale: isActive ? 1.02 : 1
                                  }}
                                  fill={idx % 2 === 0 ? "#e3deb3" : "#e9deb6"}
                                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                              />
                           </svg>

                          {/* Icon Overlay (STATIC) */}
                           <div 
                              className="absolute inset-0 flex items-center justify-center pointer-events-none"
                              style={{ paddingTop: vw(10) }}
                           >
                              <svg 
                                  viewBox="0 0 180 180" 
                                  className="w-[40%] h-[40%]"
                              >
                                  <motion.path 
                                      animate={{
                                          fill: isActive ? "#756f3f" : "#998f6a"
                                      }}
                                      d={ITEM_ICONS[idx]} 
                                  />
                              </svg>
                           </div>
                      </div>

                      {/* Description / Content - Conditional Positioning */}
                      <div 
                          className="absolute w-full pointer-events-none flex justify-center"
                          style={{ 
                              left: 0,
                              top: isTopText ? vw(-120) : vw(450),
                              width: vw(VIEW_W)
                          }}
                      >
                          <AnimatePresence mode="wait">
                              {isActive && (
                                  <motion.div
                                      key="active-desc"
                                      initial={{ opacity: 0, y: isTopText ? 20 : -20 }}
                                      animate={{ 
                                          opacity: 1, 
                                          y: isTopText ? [-5, 5, -5] : [5, -5, 5] 
                                      }}
                                      exit={{ opacity: 0, y: isTopText ? 20 : -20 }}
                                      transition={{
                                          opacity: { duration: 0.3 },
                                          y: {
                                              duration: 1.5,
                                              repeat: Infinity,
                                              repeatType: "reverse",
                                              ease: "easeInOut"
                                          }
                                      }}
                                      className="font-lobster text-[#fda900] text-center drop-shadow-sm px-4"
                                      style={{ fontSize: vw(36), lineHeight: 1.1, width: vw(350) }}
                                  >
                                      {renderNodes(item.content)}
                                  </motion.div>
                              )}
                          </AnimatePresence>
                      </div>
                  </motion.div>
              )
          })}
        </div>
      </div>

      {/* --- MOBILE VIEW (Below md) --- */}
      <div className="md:hidden flex flex-col items-center py-16 px-6 space-y-12 bg-[#f6f4ed]">
        {/* Mobile Header */}
        <div className="text-center space-y-4">
            <h3 className="font-josefin-sans font-bold text-[#756f3f] text-2xl">
                {renderNodes(titleNodes)}
            </h3>
            <h2 className="font-josefin-sans font-bold text-[#494106] text-5xl leading-tight">
                {renderNodes(subtitleNodes)}
            </h2>
        </div>

        {/* Mobile Vertical Items */}
        <div className="w-full max-w-sm space-y-10">
            {items.slice(0, 4).map((item, idx) => (
                <div key={item.id} className="flex items-center space-x-6">
                    {/* Mini Hexagon Icon */}
                    <div className="relative flex-shrink-0 w-24 h-28 flex items-center justify-center drop-shadow-lg">
                        <svg viewBox="0 0 100 115.47" className="absolute inset-0 w-full h-full">
                            <path 
                                d="M50 0 L100 28.87 L100 86.6 L50 115.47 L0 86.6 L0 28.87 Z" 
                                fill={idx % 2 === 0 ? "#e3deb3" : "#e9deb6"}
                            />
                        </svg>
                        <svg viewBox="0 0 180 180" className="relative z-10 w-10 h-10">
                            <path fill="#756f3f" d={ITEM_ICONS[idx]} />
                        </svg>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                        <div className="font-lobster text-[#fda900] text-2xl leading-tight">
                            {renderNodes(item.content)}
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </section>
  )
}
