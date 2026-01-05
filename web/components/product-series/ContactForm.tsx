"use client"

import * as React from "react"
// Using native img instead of next/image to avoid CDN caching issues
import { Upload } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ContactFormData } from "@/lib/content-parser"

/**
 * Contact Form Section
 *
 * Based on Figma design:
 * - Full width background image with blur overlay
 * - Title on the left side
 * - 4 input fields on the right (stacked vertically)
 * - Helper text in the middle
 * - Two tilted product images on the left
 * - Upload file button and Send Inquiry button
 */

// Design constants
const DESIGN_WIDTH = 1920
const DESIGN_HEIGHT = 696
const SECTION_X_OFFSET = 30  // The group starts at x=30

interface ContactFormProps {
  data: ContactFormData
  className?: string
}

export function ContactForm({ data, className }: ContactFormProps) {
  if (!data) return null

  const { title = '', backgroundImage = '', helperTitle = '', helperText = '', productImages = [] } = data

  // Form state
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    whatsapp: "",
    message: "",
  })
  const [file, setFile] = React.useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Track form height to adjust section height
  const formRef = React.useRef<HTMLFormElement>(null)
  const [sectionHeight, setSectionHeight] = React.useState(0)

  React.useEffect(() => {
    const formEl = formRef.current
    if (!formEl) return

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        // Section height = form top (107) + form height + bottom padding (50)
        const formTop = (107 / DESIGN_WIDTH) * window.innerWidth
        const bottomPadding = (50 / DESIGN_WIDTH) * window.innerWidth
        const formHeight = entry.contentRect.height
        const minDesignHeight = (DESIGN_HEIGHT / DESIGN_WIDTH) * window.innerWidth
        const calculatedHeight = formTop + formHeight + bottomPadding
        setSectionHeight(Math.max(minDesignHeight, calculatedHeight))
      }
    })

    observer.observe(formEl)
    return () => observer.disconnect()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // TODO: Implement form submission
    console.log("Form submitted:", formData, file)

    setTimeout(() => {
      setIsSubmitting(false)
    }, 1000)
  }

  // Helper to calculate position relative to design
  const px = (value: number) => `${(value / DESIGN_WIDTH) * 100}%`
  const vw = (value: number) => `${(value / DESIGN_WIDTH) * 100}vw`

  // Input style constants
  const inputBg = "rgba(255, 250, 203, 0.25)"
  const inputBorder = "1px solid rgba(255, 255, 255, 0.34)"

  return (
    <section
      className={cn("relative w-full overflow-hidden", className)}
      style={{
        height: sectionHeight > 0 ? sectionHeight : vw(DESIGN_HEIGHT),
        marginLeft: px(SECTION_X_OFFSET),
        marginRight: px(SECTION_X_OFFSET),
        width: `calc(100% - ${px(SECTION_X_OFFSET * 2)})`,
        borderRadius: vw(30),
      }}
    >
      {/* Background Image - Rectangle 395 */}
      {backgroundImage && (
        <img
          src={backgroundImage}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ borderRadius: vw(30) }}
        />
      )}

      {/* Blur Overlay - Rectangle 727 */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.09)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
          borderRadius: vw(30),
          mixBlendMode: "darken",
        }}
      />

      {/* Title - "Contact Us Get A Quote" at x=153, y=80 (relative to section y=5791) */}
      <h2
        className="absolute font-josefin-sans font-bold text-white whitespace-nowrap"
        style={{
          left: px(153 - SECTION_X_OFFSET),
          top: vw(80),
          fontSize: vw(86),
          lineHeight: vw(109),
        }}
      >
        {title || "Contact Us Get A Quote"}
      </h2>

      {/* Left Tilted Product Image 1 - Rectangle 728, Figma rotation: 3.23deg -> CSS: -3.23deg */}
      {productImages && productImages[0] && (
        <div
          className="absolute overflow-hidden"
          style={{
            left: px(147 - SECTION_X_OFFSET),
            top: vw(232.5),  // 6023.5 - 5791
            width: vw(306),
            height: vw(399),
            transform: "rotate(-3.23deg)",
            borderRadius: vw(30),
          }}
        >
          <img
            src={productImages[0]}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      )}

      {/* Left Tilted Product Image 2 - Rectangle 729, Figma rotation: -15.15deg -> CSS: 15.15deg */}
      {productImages && productImages[1] && (
        <div
          className="absolute overflow-hidden"
          style={{
            left: px(410 - SECTION_X_OFFSET),
            top: vw(190.2),  // 5981.2 - 5791
            width: vw(306),
            height: vw(411),
            transform: "rotate(15.15deg)",
            borderRadius: vw(30),
          }}
        >
          <img
            src={productImages[1]}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      )}

      {/* Helper Title - "We'd love to hear from you!" at x=720, y=304 */}
      <h3
        className="absolute font-inter font-semibold"
        style={{
          left: px(720 - SECTION_X_OFFSET),
          top: vw(304),  // 6095 - 5791
          width: px(391),
          fontSize: vw(40),
          lineHeight: vw(58),
          color: "#FFFF95",  // rgb(1, 1, 0.584) ≈ yellow
        }}
      >
        {helperTitle || "We'd love to hear from you!"}
      </h3>

      {/* Helper Text at x=720, y=436 */}
      <p
        className="absolute font-inter"
        style={{
          left: px(720 - SECTION_X_OFFSET),
          top: vw(436),  // 6227 - 5791
          width: px(391),
          fontSize: vw(20),
          lineHeight: vw(33),
          color: "#FFFF95",
        }}
      >
        {helperText || "Share your needs, we will provide you with the best solution and quotation."}
      </p>

      {/* Form Container - using flex layout for dynamic height */}
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="absolute flex flex-col"
        style={{
          left: px(1251 - SECTION_X_OFFSET),
          top: vw(107),
          width: vw(486),
          gap: vw(20),
        }}
      >
        {/* Input 1: Name */}
        <input
          type="text"
          name="name"
          placeholder="Your Name / Company Name"
          value={formData.name}
          onChange={handleInputChange}
          className="bg-transparent text-white/95 placeholder-white/95 outline-none font-anaheim font-semibold"
          style={{
            fontSize: vw(20),
            paddingLeft: vw(29),
            height: vw(63),
            backgroundColor: inputBg,
            border: inputBorder,
            borderRadius: vw(15),
          }}
        />

        {/* Input 2: Email */}
        <input
          type="email"
          name="email"
          placeholder="Your Email"
          value={formData.email}
          onChange={handleInputChange}
          className="bg-transparent text-white/95 placeholder-white/95 outline-none font-anaheim font-semibold"
          style={{
            fontSize: vw(20),
            paddingLeft: vw(29),
            height: vw(63),
            backgroundColor: inputBg,
            border: inputBorder,
            borderRadius: vw(15),
          }}
        />

        {/* Input 3: WhatsApp */}
        <input
          type="text"
          name="whatsapp"
          placeholder="Your WhatsApp / Phone"
          value={formData.whatsapp}
          onChange={handleInputChange}
          className="bg-transparent text-white/95 placeholder-white/95 outline-none font-anaheim font-semibold"
          style={{
            fontSize: vw(20),
            paddingLeft: vw(29),
            height: vw(63),
            backgroundColor: inputBg,
            border: inputBorder,
            borderRadius: vw(15),
          }}
        />

        {/* Input 4: Message (textarea) */}
        <textarea
          name="message"
          placeholder="Message"
          value={formData.message}
          onChange={handleInputChange}
          className="bg-transparent text-white/95 placeholder-white/95 outline-none font-anaheim font-semibold resize-y overflow-hidden"
          style={{
            fontSize: vw(20),
            paddingLeft: vw(29),
            paddingTop: vw(16),
            paddingBottom: vw(16),
            minHeight: vw(63),
            backgroundColor: inputBg,
            border: inputBorder,
            borderRadius: vw(15),
          }}
        />

        {/* Upload File Button */}
        <label
          className="flex items-center justify-center gap-2 cursor-pointer self-end"
          style={{
            width: vw(256),
            height: vw(58),
            border: "1px solid rgba(255, 255, 255, 0.46)",
            borderRadius: vw(33.5),
            opacity: 0.61,
            marginTop: vw(10),
          }}
        >
          <input
            type="file"
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          />
          {/* Upload Icon */}
          <Upload
            className="text-white"
            style={{
              width: vw(25),
              height: vw(25),
            }}
          />
          <span
            className="font-anaheim font-semibold text-white"
            style={{ fontSize: vw(24) }}
          >
            {file ? file.name.substring(0, 10) + "..." : "Upload File"}
          </span>
        </label>

        {/* Send Inquiry Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center justify-center text-white font-anaheim font-semibold transition-all hover:brightness-110 disabled:opacity-70"
          style={{
            width: vw(486),
            height: vw(83),
            backgroundColor: "#9C9032",
            borderRadius: vw(63),
            fontSize: vw(32),
            marginTop: vw(10),
          }}
        >
          {isSubmitting ? "Sending..." : "Send Inquiry"}
        </button>
      </form>
    </section>
  )
}

export default ContactForm
