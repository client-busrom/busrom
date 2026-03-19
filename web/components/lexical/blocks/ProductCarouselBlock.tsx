"use client"

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Package, ChevronLeft, ChevronRight } from 'lucide-react'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'

export const ProductCarouselBlock = ({ node, locale }: any) => {
  const { items, autoplay, interval, itemsPerView } = node.data || {}
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!items || items.length === 0) {
      setLoading(false)
      return
    }

    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products/carousel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items, locale })
        })
        if (response.ok) {
          const data = await response.json()
          setProducts(data.products || [])
        }
      } catch (err) {
        console.error('Failed to fetch carousel products:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [items, locale])

  if (loading) {
    return (
      <div className="my-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="aspect-[3/4] bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  if (products.length === 0) return null

  return (
    <div className="my-12">
      <Carousel
        opts={{
          align: 'start',
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-4">
          {products.map((product, index) => {
            const settings = product._carouselItem || {}
            // Shuffle highlights for random display
            const highlights = product.productAttributes?.highlights || []
            const shuffledHighlights = [...highlights].sort(() => 0.5 - Math.random())
              .slice(0, settings.highlightsCount || 3)
            const basisClassMap: Record<number, string> = {
              1: 'lg:basis-full',
              2: 'lg:basis-1/2',
              3: 'lg:basis-1/3',
              4: 'lg:basis-1/4',
              5: 'lg:basis-1/5',
              6: 'lg:basis-1/6',
            }
            const basisClass = basisClassMap[(itemsPerView || 3) as number] || 'lg:basis-1/3'

            return (
              <CarouselItem key={index} className={`pl-4 basis-full md:basis-1/2 ${basisClass}`}>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden group h-full flex flex-col">
                  {/* Image Area */}
                  <div className="aspect-square relative overflow-hidden bg-gray-50">
                    {product.showImage ? (
                      <Image
                        src={product.showImage.url}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        unoptimized
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-300">
                        <Package size={48} />
                      </div>
                    )}
                  </div>

                  {/* Content Area */}
                  <div className="p-6 flex flex-col flex-1">
                    {settings.showCategory && product.category?.name && (
                      <div className="text-[10px] font-bold uppercase tracking-widest text-brand-accent-gold mb-1">
                        {product.category.name}
                      </div>
                    )}
                    
                    {settings.showName && (
                      <h4 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-brand-accent-gold transition-colors">
                        {product.name}
                      </h4>
                    )}
                    
                    {settings.showDescription && product.shortDescription && (
                      <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                        {product.shortDescription}
                      </p>
                    )}

                    {/* Highlights */}
                    {settings.showHighlights && shuffledHighlights.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-6 mt-auto">
                        {shuffledHighlights.map((h: any, idx: number) => (
                          <span key={idx} className="text-[10px] font-bold uppercase tracking-wider bg-brand-accent-gold/10 text-brand-secondary px-2.5 py-1 rounded-full border border-brand-accent-gold/20">
                            {h.text}
                          </span>
                        ))}
                      </div>
                    )}

                    {settings.showButton && (
                      <Link
                        href={`/shop/${product.slug}`}
                        target={settings.openInNewTab ? '_blank' : undefined}
                        className="inline-flex items-center text-brand-secondary font-bold text-sm uppercase tracking-widest hover:text-brand-accent-gold transition-colors mt-auto"
                      >
                        {settings.buttonText || 'View Details'} →
                      </Link>
                    )}
                  </div>
                </div>
              </CarouselItem>
            )
          })}
        </CarouselContent>
        <div className="flex justify-end gap-2 mt-6">
          <CarouselPrevious className="static translate-y-0" />
          <CarouselNext className="static translate-y-0" />
        </div>
      </Carousel>
    </div>
  )
}
