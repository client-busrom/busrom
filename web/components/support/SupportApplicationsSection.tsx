"use client"

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import useEmblaCarousel from 'embla-carousel-react'
import AutoScroll from 'embla-carousel-auto-scroll'
import { OptimizedImage } from "@/components/ui/OptimizedImage"

const vw = (px: number) => `calc(${px} * var(--app-scale, 1) * min(100vw, 1920px) / 1920)`

interface SupportApplicationsSectionProps {
  title?: string
  items?: any[]
  carouselConfig?: any
  applicationIds?: number[]
  locale?: string
}

const ITEM_CONFIGS = [
  { width: 480, height: 922, imagePos: { left: 93, top: 400, width: 265, height: 227 } },
  { width: 450, height: 922, imagePos: { left: 33, top: 420, width: 351, height: 285 } },
  { width: 500, height: 922, imagePos: { left: 70, top: 380, width: 360, height: 260 } },
  { width: 491, height: 922, imagePos: { left: 80, top: 300, width: 290, height: 243 } },
]

export const SupportApplicationsSection: React.FC<SupportApplicationsSectionProps> = ({ 
  items = [],
  carouselConfig,
  applicationIds = [],
  locale = 'en'
}) => {
  const [fetchedApplications, setFetchedApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { 
        loop: true, 
        dragFree: true,
        containScroll: false
    }, 
    [
        AutoScroll({ 
            playOnInit: true, 
            speed: 1, 
            stopOnInteraction: false,
            stopOnMouseEnter: true,
            startDelay: 1000
        })
    ]
  )

  const resumeTimeoutRef = React.useRef<any>(null)

  const handleInteraction = useCallback(() => {
    const autoScroll = emblaApi?.plugins()?.autoScroll
    if (!autoScroll) return

    autoScroll.stop()
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current)
    
    resumeTimeoutRef.current = setTimeout(() => {
        autoScroll.play()
    }, 1000)
  }, [emblaApi])

  const handlePrev = useCallback(() => {
    if (emblaApi) {
        emblaApi.scrollPrev()
        handleInteraction()
    }
  }, [emblaApi, handleInteraction])

  const handleNext = useCallback(() => {
    if (emblaApi) {
        emblaApi.scrollNext()
        handleInteraction()
    }
  }, [emblaApi, handleInteraction])

  // Listen for pointer down to catch drags
  useEffect(() => {
    if (!emblaApi) return
    emblaApi.on('pointerDown', handleInteraction)
    return () => {
        emblaApi.off('pointerDown', handleInteraction)
        if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current)
    }
  }, [emblaApi, handleInteraction])

  useEffect(() => {
    if (items && items.length > 0) {
      setLoading(false)
      return
    }

    const fetchApps = async () => {
      const ids = applicationIds.length > 0 ? applicationIds : (carouselConfig?.applications?.map((a: any) => a.id).filter(Boolean) || [])
      if (ids.length === 0) {
        setLoading(false)
        return
      }
      
      try {
        const res = await fetch(`/api/applications?ids=${ids.join(",")}&locale=${locale}`)
        if (res.ok) {
          const data = await res.json()
          const transformedApps = (data.docs || []).map((app: any) => ({
            id: String(app.id),
            title: app.name || "",
            image: app.image,
          }))
          const ordered = ids
            .map((id: any) => transformedApps.find((app: any) => String(app.id) === String(id)))
            .filter(Boolean)
          setFetchedApplications(ordered)
        }
      } catch (err) {
        console.error("Failed to fetch applications:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchApps()
  }, [applicationIds?.join(','), locale, items?.length])

  const validItems = useMemo(() => {
    if (items && items.length > 0) return items
    return fetchedApplications
  }, [fetchedApplications, items])

  const displayItems = useMemo(() => {
    if (validItems.length === 0) return []
    
    let list = [...validItems]
    const baseCount = validItems.length
    
    // 1. Ensure enough items for smooth loop (at least 8)
    while (list.length < 8) {
        list = [...list, ...validItems]
    }
    
    // 2. Pad to a multiple of 4 to maintain the item1-item4 background sequence
    const remainder = list.length % 4
    if (remainder !== 0) {
        const needed = 4 - remainder
        for (let i = 0; i < needed; i++) {
            list.push(validItems[i % baseCount])
        }
    }
    
    return list
  }, [validItems])

  if (loading) return (
    <div className="py-[120px] flex justify-center items-center bg-[#f6f4ed] min-h-[400px]">
      <div className="w-10 h-10 border-2 border-[#766D26] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (validItems.length === 0) return null

  return (
    <section id="applications" className="bg-[#f6f4ed] overflow-hidden relative select-none [--app-scale:2.8] md:[--app-scale:1]" style={{ paddingTop: vw(20), paddingBottom: vw(100) }}>
      <div className="embla overflow-hidden relative" ref={emblaRef}>
        <div className="embla__container flex">
          {displayItems.map((item, index) => {
            const styleIdx = index % 4
            const config = ITEM_CONFIGS[styleIdx]
            return (
              <div 
                key={`${item.id || index}-${index}`} 
                className="embla__slide relative flex-shrink-0" 
                style={{ 
                  width: vw(config.width), 
                  height: vw(922),
                  marginLeft: index === 0 ? 0 : vw(-1)
                }}
              >
                <img src={`/images/support/item${styleIdx + 1}.svg`} alt="" draggable={false} className="absolute top-0 left-0 w-full h-full object-contain pointer-events-none z-[5] select-none" />
                <motion.div 
                  className="absolute pointer-events-auto cursor-pointer"
                  onClick={() => {
                    emblaApi?.scrollTo(index)
                    handleInteraction()
                  }}
                  style={{ 
                    left: vw(config.imagePos.left), top: vw(config.imagePos.top), width: vw(config.imagePos.width), height: vw(config.imagePos.height),
                    maskImage: `url(/images/support/image${styleIdx + 1}.svg)`, WebkitMaskImage: `url(/images/support/image${styleIdx + 1}.svg)`,
                    maskSize: "contain", WebkitMaskSize: "contain", maskRepeat: "no-repeat", WebkitMaskRepeat: "no-repeat", zIndex: 10,
                    willChange: "transform, opacity"
                  }}
                  animate={{ rotate: [index % 2 === 0 ? -0.5 : 0.5, index % 2 === 0 ? 0.5 : -0.5, index % 2 === 0 ? -0.5 : 0.5] }}
                  transition={{ 
                    duration: 7,
                    delay: (index % 5) * 0.5,
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                >
                  <OptimizedImage 
                    image={item.image} 
                    alt={item.title} 
                    className="w-full h-full object-cover transition-all duration-500 select-none pointer-events-none" 
                    size="small"
                    loading="eager"
                  />
                </motion.div>
              </div>
            )
          })}
        </div>
      </div>

      <button className="absolute left-[2vw] bottom-[5%] md:bottom-[1/3] -translate-y-1/2 z-30 group flex items-center justify-center transition-all duration-300" style={{ width: vw(141), height: vw(141) }} onClick={handlePrev}>
        <div className="absolute inset-0 rounded-full bg-[#f1ebc8] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        <svg width={vw(79)} height={vw(51)} viewBox="0 0 79 51" fill="none" className="relative z-10 transition-transform duration-300 group-hover:scale-110">
          <path d="M60.4319 30.9718C60.1094 30.6201 59.4905 31.0405 59.8133 31.4061C61.065 32.8201 62.7709 33.7088 63.8394 35.2949C64.5915 36.4138 65.2093 37.4755 66.5346 37.9356C67.1232 38.1411 67.5391 37.2621 66.9428 37.0452C65.4922 36.5136 64.9552 35.0995 63.9929 34.0213C62.9412 32.847 61.5008 32.1374 60.4319 30.9718Z" fill="#756F3F"/><path fillRule="evenodd" clipRule="evenodd" d="M3.97427 16.8459C2.37941 17.6315 0.986399 17.8992 0.289642 19.6535C-1.52339 24.2197 5.66177 28.2188 8.34026 30.5798C12.8334 34.5383 17.4879 38.3324 21.8273 42.4598C24.5414 45.042 26.7635 48.0775 30.0994 49.8097C31.4799 50.5267 32.9246 49.4761 33.2673 48.144C33.9683 45.42 33.2119 40.0022 36.0793 38.4067C37.3362 37.7023 44.159 39.9162 45.481 40.1119C49.8935 40.7733 54.3286 41.3037 58.7255 42.0831C62.0591 42.6734 66.5158 44.4623 69.899 44.0549C76.8341 43.2199 77.579 31.2128 78.8841 25.4947C79.0433 24.795 78.7126 24.0009 78.1682 23.5572C74.3589 20.456 67.7145 20.2996 62.9632 19.866C62.7505 19.8409 62.534 19.8612 62.3296 19.9255C62.1255 19.9897 61.9376 20.0968 61.7777 20.239C57.4896 19.5026 53.1724 18.9137 48.9393 18.2106C43.9107 17.378 39.8367 17.8363 39.541 12.3447C39.3471 8.72551 40.799 5.23051 40.5386 1.65468C40.4847 0.914169 39.8297 0.0812961 39.0484 0.0233351C32.8364 -0.433875 25.5549 5.94521 20.4009 8.8354C15.0184 11.8534 9.46938 14.143 3.97427 16.8459ZM7.42547 24.1953C5.25749 21.3215 4.31978 21.8037 8.14958 19.4414C11.5577 17.3385 35.7673 3.2529 36.5399 3.92155C38.1521 5.31838 34.397 14.833 35.405 17.4786C35.9177 18.8248 36.7466 19.4249 37.9749 20.131C42.8205 22.9189 51.7162 22.3034 57.2312 23.0086C61.6414 23.5656 67.2378 25.2636 71.9991 25.1273C72.8994 25.7363 73.5605 26.5392 73.7979 27.6111C73.9932 28.4913 73.6286 29.946 73.1192 31.3845C72.3283 30.879 71.6417 30.2211 70.8604 29.6663C69.5744 28.7542 68.1592 28.0936 67.054 26.9418C66.7279 26.6027 66.2787 27.1667 66.5905 27.5035C67.7774 28.7824 69.3489 29.4919 70.6992 30.5634C71.4115 31.1283 72.0588 31.7352 72.8099 32.2101C72.3844 33.2982 71.9233 34.3118 71.6113 34.9727C71.5599 35.0756 71.5116 35.1438 71.4621 35.2445C68.8117 33.4027 66.5424 31.1146 64.0882 29.0347C63.7777 28.7709 63.3902 29.2479 63.6879 29.5199C66.1134 31.735 68.3166 34.1733 71.0205 36.0653C68.9174 39.7903 66.8836 39.3524 62.2265 38.47C61.5506 38.3424 60.8713 38.2441 60.1951 38.1243C58.585 36.6673 57.1097 35.0844 55.6084 33.5135C55.2911 33.1821 54.8416 33.7367 55.1552 34.0644C56.3651 35.3405 57.5599 36.6324 58.7919 37.8864C55.158 37.2705 51.5162 36.7189 47.8655 36.185C46.1277 35.9308 42.0895 34.6098 38.4455 34.0034C38.4213 33.9416 38.3798 33.8876 38.3261 33.8486C35.9844 32.5309 33.277 31.4905 31.4821 29.4098C31.2572 29.1502 30.8115 29.449 31.0345 29.724C32.4969 31.5238 34.5831 32.637 36.6001 33.761C35.0981 33.6286 33.7852 33.7147 32.8416 34.1266C31.2228 33.1961 29.5997 32.3606 28.3022 30.9121C27.9712 30.5436 27.33 30.9772 27.6604 31.3627C28.8066 32.7004 30.315 33.8721 31.9129 34.7548C31.3938 35.2253 30.9852 35.8251 30.6563 36.5069C29.4853 35.7847 28.2922 35.0978 27.071 34.4577C26.6307 34.2268 26.3156 34.9243 26.75 35.1579C27.9787 35.8159 29.1764 36.5254 30.3432 37.2863C29.6011 39.2949 29.3887 41.8094 29.2132 44.0147C24.4365 40.6455 20.047 35.0743 15.8329 31.4847C13.2264 29.2639 9.48513 26.9253 7.42547 24.1953Z" fill="#756F3F" />
        </svg>
      </button>

      <button className="absolute right-[2vw] bottom-[5%] md:bottom-[1/3] -translate-y-1/2 z-30 group flex items-center justify-center transition-all duration-300" style={{ width: vw(141), height: vw(141) }} onClick={handleNext}>
        <div className="absolute inset-0 rounded-full bg-[#f1ebc8] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        <svg width={vw(79)} height={vw(51)} viewBox="0 0 79 51" fill="none" className="relative z-10 transition-transform duration-300 group-hover:scale-110 rotate-180">
          <path d="M60.4319 30.9718C60.1094 30.6201 59.4905 31.0405 59.8133 31.4061C61.065 32.8201 62.7709 33.7088 63.8394 35.2949C64.5915 36.4138 65.2093 37.4755 66.5346 37.9356C67.1232 38.1411 67.5391 37.2621 66.9428 37.0452C65.4922 36.5136 64.9552 35.0995 63.9929 34.0213C62.9412 32.847 61.5008 32.1374 60.4319 30.9718Z" fill="#756F3F"/><path fillRule="evenodd" clipRule="evenodd" d="M3.97427 16.8459C2.37941 17.6315 0.986399 17.8992 0.289642 19.6535C-1.52339 24.2197 5.66177 28.2188 8.34026 30.5798C12.8334 34.5383 17.4879 38.3324 21.8273 42.4598C24.5414 45.042 26.7635 48.0775 30.0994 49.8097C31.4799 50.5267 32.9246 49.4761 33.2673 48.144C33.9683 45.42 33.2119 40.0022 36.0793 38.4067C37.3362 37.7023 44.159 39.9162 45.481 40.1119C49.8935 40.7733 54.3286 41.3037 58.7255 42.0831C62.0591 42.6734 66.5158 44.4623 69.899 44.0549C76.8341 43.2199 77.579 31.2128 78.8841 25.4947C79.0433 24.795 78.7126 24.0009 78.1682 23.5572C74.3589 20.456 67.7145 20.2996 62.9632 19.866C62.7505 19.8409 62.534 19.8612 62.3296 19.9255C62.1255 19.9897 61.9376 20.0968 61.7777 20.239C57.4896 19.5026 53.1724 18.9137 48.9393 18.2106C43.9107 17.378 39.8367 17.8363 39.541 12.3447C39.3471 8.72551 40.799 5.23051 40.5386 1.65468C40.4847 0.914169 39.8297 0.0812961 39.0484 0.0233351C32.8364 -0.433875 25.5549 5.94521 20.4009 8.8354C15.0184 11.8534 9.46938 14.143 3.97427 16.8459ZM7.42547 24.1953C5.25749 21.3215 4.31978 21.8037 8.14958 19.4414C11.5577 17.3385 35.7673 3.2529 36.5399 3.92155C38.1521 5.31838 34.397 14.833 35.405 17.4786C35.9177 18.8248 36.7466 19.4249 37.9749 20.131C42.8205 22.9189 51.7162 22.3034 57.2312 23.0086C61.6414 23.5656 67.2378 25.2636 71.9991 25.1273C72.8994 25.7363 73.5605 26.5392 73.7979 27.6111C73.9932 28.4913 73.6286 29.946 73.1192 31.3845C72.3283 30.879 71.6417 30.2211 70.8604 29.6663C69.5744 28.7542 68.1592 28.0936 67.054 26.9418C66.7279 26.6027 66.2787 27.1667 66.5905 27.5035C67.7774 28.7824 69.3489 29.4919 70.6992 30.5634C71.4115 31.1283 72.0588 31.7352 72.8099 32.2101C72.3844 33.2982 71.9233 34.3118 71.6113 34.9727C71.5599 35.0756 71.5116 35.1438 71.4621 35.2445C68.8117 33.4027 66.5424 31.1146 64.0882 29.0347C63.7777 28.7709 63.3902 29.2479 63.6879 29.5199C66.1134 31.735 68.3166 34.1733 71.0205 36.0653C68.9174 39.7903 66.8836 39.3524 62.2265 38.47C61.5506 38.3424 60.8713 38.2441 60.1951 38.1243C58.585 36.6673 57.1097 35.0844 55.6084 33.5135C55.2911 33.1821 54.8416 33.7367 55.1552 34.0644C56.3651 35.3405 57.5599 36.6324 58.7919 37.8864C55.158 37.2705 51.5162 36.7189 47.8655 36.185C46.1277 35.9308 42.0895 34.6098 38.4455 34.0034C38.4213 33.9416 38.3798 33.8876 38.3261 33.8486C35.9844 32.5309 33.277 31.4905 31.4821 29.4098C31.2572 29.1502 30.8115 29.449 31.0345 29.724C32.4969 31.5238 34.5831 32.637 36.6001 33.761C35.0981 33.6286 33.7852 33.7147 32.8416 34.1266C31.2228 33.1961 29.5997 32.3606 28.3022 30.9121C27.9712 30.5436 27.33 30.9772 27.6604 31.3627C28.8066 32.7004 30.315 33.8721 31.9129 34.7548C31.3938 35.2253 30.9852 35.8251 30.6563 36.5069C29.4853 35.7847 28.2922 35.0978 27.071 34.4577C26.6307 34.2268 26.3156 34.9243 26.75 35.1579C27.9787 35.8159 29.1764 36.5254 30.3432 37.2863C29.6011 39.2949 29.3887 41.8094 29.2132 44.0147C24.4365 40.6455 20.047 35.0743 15.8329 31.4847C13.2264 29.2639 9.48513 26.9253 7.42547 24.1953Z" fill="#756F3F" />
        </svg>
      </button>
    </section>
  )
}

export default SupportApplicationsSection
