"use client"

import { useEffect, useState } from "react"
import { ArrowUp } from "lucide-react"
import { cn } from "@/lib/utils"

const ScrollToTop = () => {
  const [visible, setVisible] = useState(false)

  const handleScroll = () => {
    if (window.scrollY > 300) {
      setVisible(true)
    } else {
      setVisible(false)
    }
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  useEffect(() => {
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <button
      onClick={scrollToTop}
      className={cn(
        "fixed z-50 flex items-center justify-center rounded-full bg-[#756F3F] text-white shadow-lg transition-opacity",
        "w-12 h-12 bottom-6 right-6", // Mobile values
        "lg:w-[2.5vw] lg:h-[2.5vw] lg:bottom-[2vw] lg:right-[0.5vw]", // Desktop vw values
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
      aria-label="Scroll to top"
    >
      <ArrowUp className="w-5 h-5 lg:w-[1.25vw] lg:h-[1.25vw]" />
    </button>
  )
}

export default ScrollToTop
