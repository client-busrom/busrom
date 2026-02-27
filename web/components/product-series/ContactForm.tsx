"use client"

import * as React from "react"
import { Upload } from "lucide-react"
import { OptimizedImage } from "@/components/ui/OptimizedImage"
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

// Image switch interval in milliseconds
const IMAGE_SWITCH_INTERVAL = 4000
// Animation duration for fold/unfold effect
const ANIMATION_DURATION = 600

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

  // Image carousel state - 6 images split into 3 groups of 2
  const [currentGroupIndex, setCurrentGroupIndex] = React.useState(0)
  const [isAnimating, setIsAnimating] = React.useState(false)
  const [isFolded, setIsFolded] = React.useState(false)

  // Calculate number of groups (pairs of images)
  const imageGroups = React.useMemo(() => {
    const groups: Array<[string, string]> = []
    for (let i = 0; i < productImages.length; i += 2) {
      if (productImages[i] && productImages[i + 1]) {
        groups.push([productImages[i], productImages[i + 1]])
      } else if (productImages[i]) {
        // If odd number of images, pair last one with first
        groups.push([productImages[i], productImages[0] || productImages[i]])
      }
    }
    return groups.length > 0 ? groups : [[productImages[0] || '', productImages[1] || '']]
  }, [productImages])

  // Track which images to display (separate from currentGroupIndex for animation timing)
  const [displayedGroupIndex, setDisplayedGroupIndex] = React.useState(0)
  // Track mask visibility for card flip effect
  const [showMask, setShowMask] = React.useState(false)

  // Auto-switch images with fold animation
  React.useEffect(() => {
    if (imageGroups.length <= 1) return

    const interval = setInterval(() => {
      // Step 1: Start fold animation (old images fold inward)
      setIsAnimating(true)
      setIsFolded(true)

      // Step 2: After fold completes, show mask to cover images
      setTimeout(() => {
        setShowMask(true)

        // Step 3: After mask appears, switch images
        setTimeout(() => {
          setCurrentGroupIndex(prev => (prev + 1) % imageGroups.length)
          setDisplayedGroupIndex(prev => (prev + 1) % imageGroups.length)

          // Step 4: Hide mask to reveal new images
          setTimeout(() => {
            setShowMask(false)

            // Step 5: Unfold with new images
            setTimeout(() => {
              setIsFolded(false)

              // Step 6: Animation complete
              setTimeout(() => {
                setIsAnimating(false)
              }, ANIMATION_DURATION)
            }, 100)
          }, 150)
        }, 150)
      }, ANIMATION_DURATION)
    }, IMAGE_SWITCH_INTERVAL)

    return () => clearInterval(interval)
  }, [imageGroups.length])

  // Get current image pair to display
  const currentImages = imageGroups[displayedGroupIndex] || [productImages[0], productImages[1]]

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
        <OptimizedImage
          image={backgroundImage}
          alt=""
          size="xlarge"
          className="absolute inset-0 w-full h-full object-cover"
          containerClassName="absolute inset-0"
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
      {/* 双层文字叠加效果：底层白色描边镂空字 + 顶层带光泽动画的填充字 */}
      <h2
        className="absolute font-josefin-sans font-bold whitespace-nowrap"
        style={{
          left: px(153 - SECTION_X_OFFSET),
          top: vw(80),
          fontSize: vw(86),
          lineHeight: vw(109),
        }}
      >
        {/* 底层：白色描边镂空字，向右下偏移形成立体感 */}
        <span
          className="absolute text-transparent"
          style={{
            WebkitTextStroke: '2px rgba(255, 255, 255, 0.6)',
            top: vw(4),
            left: vw(4),
          }}
        >
          {title || "Contact Us Get A Quote"}
        </span>
        {/* 顶层：带光泽扫过动画的填充字 */}
        <span className="relative text-shine">
          {title || "Contact Us Get A Quote"}
        </span>
      </h2>

      {/* Left Tilted Product Image 1 - Rectangle 728 */}
      {/* Fold animation: rotate + translate to center, stack with image 2 */}
      {currentImages[0] && (
        <div
          className="absolute overflow-hidden"
          style={{
            left: px(147 - SECTION_X_OFFSET),
            top: vw(232.5),
            width: vw(306),
            height: vw(399),
            // Folded: rotate to 0 + move right and up to overlap with image 2
            transform: isFolded
              ? `translate(${(131.5 / DESIGN_WIDTH) * 100}vw, ${(-18 / DESIGN_WIDTH) * 100}vw) rotate(6deg)`
              : "translate(0, 0) rotate(-3.23deg)",
            transformOrigin: "center center",
            borderRadius: vw(30),
            transition: `transform ${ANIMATION_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1)`,
            zIndex: 1,
          }}
        >
          <OptimizedImage
            image={currentImages[0]}
            alt=""
            size="thumbnail"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Mask overlay - brand color */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundColor: "#756F3F",
              opacity: showMask ? 1 : 0,
              transition: "opacity 150ms ease-in-out",
              borderRadius: vw(30),
            }}
          />
        </div>
      )}

      {/* Left Tilted Product Image 2 - Rectangle 729 */}
      {/* Fold animation: rotate + translate to center, stack with image 1 */}
      {currentImages[1] && (
        <div
          className="absolute overflow-hidden"
          style={{
            left: px(410 - SECTION_X_OFFSET),
            top: vw(190.2),
            width: vw(306),
            height: vw(411),
            // Folded: rotate to 0 + move left and down to overlap with image 1
            transform: isFolded
              ? `translate(${(-131.5 / DESIGN_WIDTH) * 100}vw, ${(18 / DESIGN_WIDTH) * 100}vw) rotate(6deg)`
              : "translate(0, 0) rotate(15.15deg)",
            transformOrigin: "center center",
            borderRadius: vw(30),
            transition: `transform ${ANIMATION_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1)`,
            zIndex: 2,
          }}
        >
          <OptimizedImage
            image={currentImages[1]}
            alt=""
            size="thumbnail"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Mask overlay - brand color */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundColor: "#756F3F",
              opacity: showMask ? 1 : 0,
              transition: "opacity 150ms ease-in-out",
              borderRadius: vw(30),
            }}
          />
        </div>
      )}

      {/* Helper Title - "We'd love to hear from you!" */}
      <h3
        className="absolute font-inter font-semibold animate-pulse-scale"
        style={{
          left: px(800 - SECTION_X_OFFSET),
          top: vw(304),
          width: px(391),
          fontSize: vw(40),
          lineHeight: vw(58),
          color: "#FFFF95",
          transformOrigin: "left center",
          zIndex: 10,
        }}
      >
        {helperTitle || "We'd love to hear from you!"}
      </h3>

      {/* Helper Text */}
      <p
        className="absolute font-inter"
        style={{
          left: px(800 - SECTION_X_OFFSET),
          top: vw(436),
          width: px(391),
          fontSize: vw(20),
          lineHeight: vw(33),
          color: "#FFFF95",
          zIndex: 10,
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
          className="flex items-center justify-center gap-2 cursor-pointer self-end transition-all duration-300 hover:opacity-100 hover:bg-white/20 hover:border-white"
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
          className="flex items-center justify-center text-white font-anaheim font-semibold transition-all duration-300 hover:scale-110 disabled:opacity-70 animate-pulse-scale"
          style={{
            width: vw(486),
            height: vw(83),
            backgroundColor: "#9C9032",
            borderRadius: vw(63),
            fontSize: vw(32),
            marginTop: vw(10),
            boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#C4B440"
            e.currentTarget.style.boxShadow = "0 8px 30px rgba(196, 180, 64, 0.5)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#9C9032"
            e.currentTarget.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.2)"
          }}
        >
          {isSubmitting ? "Sending..." : "Send Inquiry"}
        </button>
      </form>
    </section>
  )
}

export default ContactForm
