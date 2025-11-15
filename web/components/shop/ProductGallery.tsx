"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import type { ImageObject } from "@/lib/content-data"
import useEmblaCarousel from 'embla-carousel-react'
import { WheelGesturesPlugin } from 'embla-carousel-wheel-gestures'

interface ProductGalleryProps {
  images: ImageObject[]
  productName: string
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalIndex, setModalIndex] = useState(0)

  // Main carousel
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      axis: 'x',
    },
    [WheelGesturesPlugin()]
  )

  // Thumbnail carousel
  const [emblaThumbnailRef, emblaThumbnailApi] = useEmblaCarousel({
    containScroll: 'keepSnaps',
    dragFree: true,
    axis: 'x',
  })

  // Modal carousel
  const [emblaModalRef, emblaModalApi] = useEmblaCarousel(
    {
      loop: true,
      axis: 'x',
    },
    [WheelGesturesPlugin()]
  )

  // Sync main carousel with selected index
  useEffect(() => {
    if (!emblaApi) return

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap())
    }

    emblaApi.on('select', onSelect)
    onSelect()

    return () => {
      emblaApi.off('select', onSelect)
    }
  }, [emblaApi])

  // Sync modal carousel with modal index
  useEffect(() => {
    if (!emblaModalApi) return

    const onSelect = () => {
      setModalIndex(emblaModalApi.selectedScrollSnap())
    }

    emblaModalApi.on('select', onSelect)
    onSelect()

    return () => {
      emblaModalApi.off('select', onSelect)
    }
  }, [emblaModalApi])

  // Sync thumbnail carousel with main carousel
  useEffect(() => {
    if (!emblaThumbnailApi || !emblaApi) return

    const scrollToThumbnail = () => {
      const selected = emblaApi.selectedScrollSnap()
      emblaThumbnailApi.scrollTo(selected)
    }

    emblaApi.on('select', scrollToThumbnail)
    scrollToThumbnail()

    return () => {
      emblaApi.off('select', scrollToThumbnail)
    }
  }, [emblaApi, emblaThumbnailApi])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isModalOpen])

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">
        No images available
      </div>
    )
  }

  const currentImage = images[selectedIndex]
  const imageUrl = currentImage?.variants?.large || currentImage?.url
  const focalPoint = currentImage?.cropFocalPoint || { x: 50, y: 50 }

  const goToPrevious = () => {
    emblaApi?.scrollPrev()
  }

  const goToNext = () => {
    emblaApi?.scrollNext()
  }

  const openModal = (index: number) => {
    setModalIndex(index)
    setIsModalOpen(true)
    // Scroll modal carousel to the selected index
    setTimeout(() => {
      emblaModalApi?.scrollTo(index)
    }, 0)
  }

  const goToNextModal = () => {
    emblaModalApi?.scrollNext()
  }

  const goToPreviousModal = () => {
    emblaModalApi?.scrollPrev()
  }

  const onThumbnailClick = (index: number) => {
    emblaApi?.scrollTo(index)
  }

  return (
    <>
      <div className="space-y-4">
        {/* Main Image Carousel */}
        <div className="relative group">
          <div className="overflow-hidden rounded-lg" ref={emblaRef}>
            <div className="flex">
              {images.map((image, index) => {
                const imgUrl = image?.variants?.large || image?.url
                const imgFocalPoint = image?.cropFocalPoint || { x: 50, y: 50 }

                return (
                  <div
                    key={index}
                    className="flex-[0_0_100%] min-w-0"
                  >
                    <div
                      className="relative w-full h-[400px] md:h-[500px] lg:h-[550px] bg-gray-100 cursor-pointer"
                      onClick={() => openModal(index)}
                    >
                      <Image
                        src={imgUrl}
                        alt={image.altText || productName}
                        fill
                        sizes="(max-width: 768px) 100vw, 60vw"
                        className="object-cover"
                        style={{
                          objectPosition: `${imgFocalPoint.x}% ${imgFocalPoint.y}%`,
                        }}
                        priority={index === 0}
                        unoptimized
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Expand Icon */}
          <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm rounded-full p-2 z-10">
            <svg
              className="w-5 h-5 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
              />
            </svg>
          </div>

          {/* Navigation arrows (visible on hover) */}
          {images.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white backdrop-blur-sm rounded-full p-3 transition-all opacity-0 hover:opacity-100 group-hover:opacity-100 z-10"
                aria-label="Previous image"
              >
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white backdrop-blur-sm rounded-full p-3 transition-all opacity-0 hover:opacity-100 group-hover:opacity-100 z-10"
                aria-label="Next image"
              >
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Image counter */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1 text-white text-sm z-10">
              {selectedIndex + 1} / {images.length}
            </div>
          )}
        </div>

      {/* Thumbnail Navigation */}
      {images.length > 1 && (
        <div className="relative">
          <div className="flex items-center gap-2">
            {/* Previous Button */}
            <button
              onClick={goToPrevious}
              className="flex-shrink-0 p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={images.length <= 1}
              aria-label="Previous thumbnail"
            >
              <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Thumbnails with Embla */}
            <div className="flex-1 overflow-hidden" ref={emblaThumbnailRef}>
              <div className="flex gap-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => onThumbnailClick(index)}
                    className={cn(
                      "relative flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all",
                      selectedIndex === index
                        ? "border-brand-secondary ring-2 ring-brand-secondary ring-offset-2"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <Image
                      src={image.variants?.thumbnail || image.url}
                      alt={image.altText || `${productName} ${index + 1}`}
                      fill
                      sizes="56px"
                      className="object-cover"
                      unoptimized
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Next Button */}
            <button
              onClick={goToNext}
              className="flex-shrink-0 p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={images.length <= 1}
              aria-label="Next thumbnail"
            >
              <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>

    {/* Full-Screen Modal */}
    {isModalOpen && (
      <div
        className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
        onClick={() => setIsModalOpen(false)}
      >
        {/* Close Button */}
        <button
          onClick={() => setIsModalOpen(false)}
          className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full p-3 transition-colors"
          aria-label="Close modal"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Image Counter */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm z-10">
          {modalIndex + 1} / {images.length}
        </div>

        {/* Previous Button */}
        {images.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              goToPreviousModal()
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full p-4 transition-colors z-10"
            aria-label="Previous image"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Main Image Carousel */}
        <div
          className="relative w-full h-full flex items-center justify-center p-16"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="overflow-hidden w-full h-full" ref={emblaModalRef}>
            <div className="flex h-full">
              {images.map((image, index) => (
                <div key={index} className="flex-[0_0_100%] min-w-0 h-full">
                  <div className="relative w-full h-full">
                    <Image
                      src={image.variants?.xlarge || image.url}
                      alt={image.altText || `${productName} ${index + 1}`}
                      fill
                      sizes="100vw"
                      className="object-contain"
                      style={
                        image.cropFocalPoint
                          ? {
                              objectPosition: `${image.cropFocalPoint.x}% ${image.cropFocalPoint.y}%`,
                            }
                          : undefined
                      }
                      priority={index === modalIndex}
                      unoptimized
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Next Button */}
        {images.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              goToNextModal()
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full p-4 transition-colors z-10"
            aria-label="Next image"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        {/* Thumbnail Strip */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 max-w-4xl z-10">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide px-4">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation()
                    emblaModalApi?.scrollTo(index)
                  }}
                  className={cn(
                    "relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all",
                    modalIndex === index
                      ? "border-white ring-2 ring-white ring-offset-2 ring-offset-black/50"
                      : "border-white/30 hover:border-white/60"
                  )}
                >
                  <Image
                    src={image.variants?.thumbnail || image.url}
                    alt={image.altText || `${productName} ${index + 1}`}
                    fill
                    sizes="64px"
                    className="object-cover"
                    unoptimized
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    )}
    </>
  )
}
