"use client"

import React, { useRef, useEffect, useCallback } from "react"

const DESIGN_WIDTH = 1920

interface MediaObject {
  id: string
  url: string
  alt?: string
  variants?: {
    thumbnail?: string
    small?: string
    medium?: string
    large?: string
    xlarge?: string
  }
}

interface AnimationSectionProps {
  locale: string
  backgroundImage?: MediaObject | null
}

// Water ripple effect using Canvas
// Performance optimization: use lower resolution for calculations
const RIPPLE_SCALE = 0.5 // Calculate at 50% resolution for better performance

class WaterRipple {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private width: number
  private height: number
  private halfWidth: number
  private halfHeight: number
  private rippleRadius: number
  private rippleMap: Int32Array
  private lastMap: Int32Array
  private texture: ImageData | null = null
  private ripple: ImageData | null = null
  private animationId: number | null = null
  private dropInterval: number | null = null
  private lastFrameTime: number = 0
  private targetFPS: number = 30 // Limit to 30fps for smoother scrolling
  private frameInterval: number = 1000 / 30
  private isVisible: boolean = true

  constructor(canvas: HTMLCanvasElement, image: HTMLImageElement) {
    this.canvas = canvas
    this.ctx = canvas.getContext("2d", { alpha: false })! // Disable alpha for performance
    this.width = canvas.width
    this.height = canvas.height
    this.halfWidth = this.width >> 1
    this.halfHeight = this.height >> 1
    this.rippleRadius = 3

    const size = this.width * (this.height + 2) * 2
    this.rippleMap = new Int32Array(size)
    this.lastMap = new Int32Array(size)

    // Draw the image to canvas and get texture
    this.ctx.drawImage(image, 0, 0, this.width, this.height)
    this.texture = this.ctx.getImageData(0, 0, this.width, this.height)
    this.ripple = this.ctx.getImageData(0, 0, this.width, this.height)

    this.animate = this.animate.bind(this)
  }

  setVisible(visible: boolean) {
    this.isVisible = visible
  }

  drop(x: number, y: number, radius: number = 15, strength: number = 256, isRaw: boolean = false) {
    // If isRaw is true, x and y are already in canvas coordinates
    // Otherwise, normalize from element coordinates to canvas coordinates
    let dropX: number, dropY: number
    if (isRaw) {
      dropX = Math.floor(x)
      dropY = Math.floor(y)
    } else {
      const offsetW = this.canvas.offsetWidth || this.width
      const offsetH = this.canvas.offsetHeight || this.height
      dropX = Math.floor((x / offsetW) * this.width)
      dropY = Math.floor((y / offsetH) * this.height)
    }

    for (let j = -radius; j < radius; j++) {
      for (let k = -radius; k < radius; k++) {
        const dist = Math.sqrt(j * j + k * k)
        if (dist < radius) {
          const px = dropX + k
          const py = dropY + j
          if (px >= 0 && px < this.width && py >= 0 && py < this.height) {
            const idx = (this.width + 2) * (py + 1) + px + 1
            this.rippleMap[idx] += Math.floor(strength * (1 - dist / radius))
          }
        }
      }
    }
  }

  private processRipple() {
    const width = this.width
    const height = this.height
    const w2 = width + 2

    // Swap buffers
    const temp = this.lastMap
    this.lastMap = this.rippleMap
    this.rippleMap = temp

    for (let y = 1; y <= height; y++) {
      const prevRow = (y - 1) * w2
      const currRow = y * w2
      const nextRow = (y + 1) * w2

      for (let x = 1; x <= width; x++) {
        // Wave equation
        let val =
          ((this.lastMap[prevRow + x] +
            this.lastMap[nextRow + x] +
            this.lastMap[currRow + x - 1] +
            this.lastMap[currRow + x + 1]) >>
            1) -
          this.rippleMap[currRow + x]

        // Damping
        val -= val >> 5

        this.rippleMap[currRow + x] = val
      }
    }
  }

  private renderRipple() {
    if (!this.texture || !this.ripple) return

    const width = this.width
    const height = this.height
    const w2 = width + 2
    const textureData = this.texture.data
    const rippleData = this.ripple.data

    for (let y = 1; y <= height; y++) {
      const currRow = y * w2

      for (let x = 1; x <= width; x++) {
        // Calculate displacement
        const dx = this.rippleMap[currRow + x - 1] - this.rippleMap[currRow + x + 1]
        const dy = this.rippleMap[currRow - w2 + x] - this.rippleMap[currRow + w2 + x]

        // Apply displacement with bounds checking
        let sx = x + (dx >> 3)
        let sy = y + (dy >> 3)

        if (sx < 0) sx = 0
        if (sx >= width) sx = width - 1
        if (sy < 0) sy = 0
        if (sy >= height) sy = height - 1

        // Source and destination indices
        const srcIdx = (sy * width + sx) << 2
        const dstIdx = ((y - 1) * width + (x - 1)) << 2

        // Copy pixel with slight shading based on displacement
        const shade = Math.min(255, Math.max(0, 128 + (dx >> 1)))
        const shadeRatio = shade / 128

        rippleData[dstIdx] = Math.min(255, textureData[srcIdx] * shadeRatio)
        rippleData[dstIdx + 1] = Math.min(255, textureData[srcIdx + 1] * shadeRatio)
        rippleData[dstIdx + 2] = Math.min(255, textureData[srcIdx + 2] * shadeRatio)
        rippleData[dstIdx + 3] = textureData[srcIdx + 3]
      }
    }

    this.ctx.putImageData(this.ripple, 0, 0)
  }

  animate(timestamp: number = 0) {
    this.animationId = requestAnimationFrame(this.animate)

    // Skip processing if not visible (saves CPU when scrolled away)
    if (!this.isVisible) return

    // Limit frame rate to reduce CPU usage
    const elapsed = timestamp - this.lastFrameTime
    if (elapsed < this.frameInterval) return

    this.lastFrameTime = timestamp - (elapsed % this.frameInterval)

    this.processRipple()
    this.renderRipple()
  }

  start() {
    this.animate(0)

    // Use canvas internal width/height
    const w = this.width
    const h = this.height

    // Initial drops to show effect immediately (use raw canvas coordinates)
    // Adjusted radius for scaled resolution
    setTimeout(() => {
      this.drop(w * 0.3, h * 0.4, 8, 300, true)
    }, 100)
    setTimeout(() => {
      this.drop(w * 0.7, h * 0.6, 6, 250, true)
    }, 400)
    setTimeout(() => {
      this.drop(w * 0.5, h * 0.3, 9, 350, true)
    }, 800)

    // Auto drop ripples disabled to prevent memory leaks
    // this.dropInterval = window.setInterval(() => {
    //   // Skip if not visible
    //   if (!this.isVisible) return
    //
    //   const x = Math.random() * this.width
    //   const y = Math.random() * this.height
    //   const radius = 5 + Math.random() * 8 // Smaller radius for scaled canvas
    //   const strength = 200 + Math.random() * 300
    //   this.drop(x, y, radius, strength, true)
    //
    //   // Sometimes drop a second ripple nearby for more natural effect
    //   if (Math.random() > 0.6) {
    //     setTimeout(() => {
    //       if (!this.isVisible) return
    //       const x2 = Math.max(0, Math.min(this.width, x + (Math.random() - 0.5) * 100))
    //       const y2 = Math.max(0, Math.min(this.height, y + (Math.random() - 0.5) * 100))
    //       this.drop(x2, y2, 4 + Math.random() * 5, 150 + Math.random() * 200, true)
    //     }, 300 + Math.random() * 400)
    //   }
    // }, 1200)
  }

  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
      this.animationId = null
    }
    if (this.dropInterval) {
      clearInterval(this.dropInterval)
      this.dropInterval = null
    }
  }

  destroy() {
    this.stop()
  }
}

export function AnimationSection({
  locale,
  backgroundImage,
}: AnimationSectionProps) {
  // Full width, no 0.7 scale
  const vw = (px: number) => `${(px / DESIGN_WIDTH) * 100}vw`
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rippleRef = useRef<WaterRipple | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const imageUrl = backgroundImage?.url

  useEffect(() => {
    if (!canvasRef.current || !imageUrl) return

    const canvas = canvasRef.current
    const container = containerRef.current
    let blobUrl: string | null = null

    // Set canvas size based on container - use lower resolution for performance
    const updateCanvasSize = () => {
      if (container) {
        const rect = container.getBoundingClientRect()
        // Use scaled resolution for better performance
        canvas.width = Math.floor(rect.width * RIPPLE_SCALE)
        canvas.height = Math.floor(rect.height * RIPPLE_SCALE)
      }
    }

    const image = new Image()

    // Fetch image as blob to avoid CORS issues with Canvas getImageData
    // CloudFront doesn't return CORS headers, but fetch + blob URL works around this
    fetch(imageUrl)
      .then(response => response.blob())
      .then(blob => {
        blobUrl = URL.createObjectURL(blob)
        image.onload = () => {
          updateCanvasSize()

          // Clean up previous instance
          if (rippleRef.current) {
            rippleRef.current.destroy()
          }

          // Create new ripple effect
          rippleRef.current = new WaterRipple(canvas, image)
          rippleRef.current.start()
        }
        image.src = blobUrl
      })
      .catch(err => {
        console.error('Failed to load animation background image:', err)
      })

    // Handle resize with debounce
    let resizeTimeout: NodeJS.Timeout
    const handleResize = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => {
        if (image.complete && image.naturalWidth > 0) {
          updateCanvasSize()
          if (rippleRef.current) {
            rippleRef.current.destroy()
          }
          rippleRef.current = new WaterRipple(canvas, image)
          rippleRef.current.start()
        }
      }, 200)
    }

    // Use IntersectionObserver to pause animation when not visible
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (rippleRef.current) {
            rippleRef.current.setVisible(entry.isIntersecting)
          }
        })
      },
      { threshold: 0, rootMargin: "100px" }
    )

    if (container) {
      observer.observe(container)
    }

    window.addEventListener("resize", handleResize)

    return () => {
      clearTimeout(resizeTimeout)
      window.removeEventListener("resize", handleResize)
      observer.disconnect()
      if (rippleRef.current) {
        rippleRef.current.destroy()
      }
      // Clean up blob URL to prevent memory leak
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl)
      }
    }
  }, [imageUrl])

  // Handle mouse interaction - scale coordinates to match canvas resolution
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (rippleRef.current && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect()
      const x = (e.clientX - rect.left) * RIPPLE_SCALE
      const y = (e.clientY - rect.top) * RIPPLE_SCALE
      rippleRef.current.drop(x, y, 5 * RIPPLE_SCALE, 180, true)
    }
  }, [])

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (rippleRef.current && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect()
      const x = (e.clientX - rect.left) * RIPPLE_SCALE
      const y = (e.clientY - rect.top) * RIPPLE_SCALE
      rippleRef.current.drop(x, y, 10 * RIPPLE_SCALE, 400, true)
    }
  }, [])

  if (!backgroundImage) {
    return null
  }

  return (
    <section className="relative w-full bg-background">
      {/* Desktop Layout - Full width, no scaling */}
      <div
        ref={containerRef}
        className="hidden lg:block relative w-full overflow-hidden cursor-pointer"
        style={{
          height: vw(922),
        }}
        onMouseMove={handleMouseMove}
        onClick={handleClick}
      >
        {/* Canvas for water ripple effect */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{
            boxShadow: "inset 0 0 100px rgba(0, 0, 0, 0.3)",
          }}
        />

        {/* Overlay shadow for depth */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            boxShadow: "inset 0 0 150px rgba(0, 0, 0, 0.2)",
          }}
        />
      </div>

      {/* Mobile Layout - Simple image display */}
      <div className="lg:hidden relative w-full aspect-video overflow-hidden">
        {imageUrl && (
          <img
            src={imageUrl}
            alt={backgroundImage.alt || "Animation background"}
            className="w-full h-full object-cover"
          />
        )}
      </div>
    </section>
  )
}
