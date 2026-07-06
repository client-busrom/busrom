// @ts-nocheck
"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";
import { useBlogContentData } from "@/components/blog/BlogLexicalRenderer/context";
import { getCmsUrl } from "@/components/blog/BlogLexicalRenderer/utils";

export function CarouselBlock({ node }: { node: any }) {
  const { slides, autoplay, interval } = node.data || node.fields || {};
  const [api, setApi] = React.useState<any>();
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(true);
  const [mediaCache, setMediaCache] = React.useState<Record<string, any>>({});
  const [loading, setLoading] = React.useState(true);

  const { media: contextMediaData = {} } = useBlogContentData();

  // Fetch media data for slide images
  React.useEffect(() => {
    if (!slides || slides.length === 0) {
      setLoading(false);
      return;
    }

    const fetchMedia = async () => {
      const cmsUrl = getCmsUrl();
      const newCache: Record<string, any> = {};

      await Promise.all(
        slides.map(async (slide: any) => {
          const imageId =
            typeof slide.image === "string" || typeof slide.image === "number"
              ? slide.image
              : slide.image?.id;

          if (!imageId || mediaCache[imageId] || slide.image?.url) return;

          // Check context first
          const contextImage =
            contextMediaData[imageId] ||
            Object.values(contextMediaData).find(
              (m: any) => String(m.id) === String(imageId),
            );
          if (contextImage) {
            newCache[imageId] = contextImage;
            return;
          }

          try {
            const res = await fetch(`${cmsUrl}/api/media/${imageId}?depth=0`);
            if (res.ok) {
              const data = await res.json();
              newCache[imageId] = data;
            }
          } catch (err) {
            console.error(`Failed to fetch media ${imageId}:`, err);
          }
        }),
      );

      if (Object.keys(newCache).length > 0) {
        setMediaCache((prev) => ({ ...prev, ...newCache }));
      }
      setLoading(false);
    };

    fetchMedia();
  }, [slides, contextMediaData]);

  React.useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
    };

    api.on("select", onSelect);
    api.on("reInit", onSelect);
    onSelect();

    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  }, [api]);

  // Auto-play functionality
  React.useEffect(() => {
    if (!api || !autoplay) return;

    const intervalId = setInterval(
      () => {
        if (api.canScrollNext()) {
          api.scrollNext();
        } else {
          api.scrollTo(0); // Loop back to start
        }
      },
      (interval || 5) * 1000,
    );

    return () => clearInterval(intervalId);
  }, [api, autoplay, interval]);

  if (!slides || slides.length === 0) return null;

  return (
    <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen py-8 pb-20 my-8">
      <div className="overflow-hidden">
        {/* Gradient masks */}
        <div className="hidden lg:block absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-brand-main to-transparent z-10 pointer-events-none"></div>
        <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-brand-main to-transparent z-10 pointer-events-none"></div>

        <Carousel
          setApi={setApi}
          opts={{
            align: "center",
            loop: true,
            dragFree: false,
            slidesToScroll: 1,
          }}
          plugins={[WheelGesturesPlugin()]}
          className="w-full"
        >
          <CarouselContent className="-ml-6">
            {slides.map((slide: any, index: number) => {
              const imageId =
                typeof slide.image === "string" ||
                typeof slide.image === "number"
                  ? slide.image
                  : slide.image?.id;
              const mediaData = imageId ? mediaCache[imageId] : slide.image;
              // Prefer variants: desktop (1920px) > tablet (1024px) > card (768px)
              const imageUrl =
                mediaData?.variants?.desktop?.url ||
                mediaData?.variants?.tablet?.url ||
                mediaData?.variants?.card?.url ||
                mediaData?.variants?.thumbnail?.url ||
                mediaData?.url;

              return (
                <CarouselItem key={index} className="pl-6 basis-auto">
                  <div className="space-y-4">
                    {(imageUrl || loading) && (
                      <div className="relative w-64 h-64 md:w-[488px] md:h-[488px] rounded-2xl overflow-hidden">
                        {loading ? (
                          <div className="w-full h-full bg-gray-200 animate-pulse" />
                        ) : imageUrl ? (
                          <Image
                            src={imageUrl}
                            alt={slide.title || slide.description || ""}
                            width={488}
                            height={488}
                            className="object-cover w-full h-full"
                            unoptimized
                          />
                        ) : null}
                      </div>
                    )}

                    <div className="space-y-3 max-w-[256px] md:max-w-[488px]">
                      {slide.title && (
                        <div className="font-bold text-brand-text-black text-lg whitespace-pre-wrap">
                          {slide.title}
                        </div>
                      )}

                      {slide.description && (
                        <div className="text-brand-text-main text-sm leading-relaxed whitespace-pre-wrap">
                          {slide.description}
                        </div>
                      )}

                      {slide.showButton &&
                        slide.buttonText &&
                        slide.buttonLink && (
                          <div>
                            <Link
                              href={slide.buttonLink}
                              target={slide.openInNewTab ? "_blank" : undefined}
                              rel={
                                slide.openInNewTab
                                  ? "noopener noreferrer"
                                  : undefined
                              }
                              className="inline-block px-6 py-2 bg-brand-secondary text-white rounded-lg hover:bg-brand-secondary/90 transition-colors font-medium text-sm"
                            >
                              {slide.buttonText}
                            </Link>
                          </div>
                        )}
                    </div>
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>
        </Carousel>
      </div>

      {/* Navigation buttons */}
      <div className="absolute bottom-4 right-4 flex gap-2 z-20">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full border-[#756F3F] text-[#756F3F] hover:bg-[#756F3F] hover:text-white"
          onClick={() => api?.scrollPrev()}
          disabled={!canScrollPrev}
        >
          <ChevronLeft className="h-8 w-8" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full border-[#756F3F] text-[#756F3F] hover:bg-[#756F3F] hover:text-white"
          onClick={() => api?.scrollNext()}
          disabled={!canScrollNext}
        >
          <ChevronRight className="h-8 w-8" />
        </Button>
      </div>
    </div>
  );
}
