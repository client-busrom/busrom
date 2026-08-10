// @ts-nocheck
"use client";

/**
 * Payload CMS Lexical Content Renderer
 *
 * Renders Lexical EditorState JSON using Payload's official rendering approach
 * with custom JSX converters for our custom node types.
 */

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { IconifyIcon } from "@/components/ui/IconifyIcon";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";
import {
  RichText,
  defaultJSXConverters,
} from "@payloadcms/richtext-lexical/react";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical";
import type { JSXConverters } from "@payloadcms/richtext-lexical/react";

import { ProductCarouselBlock } from "./blocks/ProductCarouselBlock";

interface LexicalRendererProps {
  content: SerializedEditorState;
  className?: string;
  mediaData?: Record<string, any>;
  reusableBlocks?: Record<string, any>;
}

/**
 * Media & Block Context for sharing pre-fetched data
 */
const MediaContext = React.createContext<{
  media?: Record<string, any>;
  reusableBlocks?: Record<string, any>;
}>({ media: {}, reusableBlocks: {} });

const useContentData = () => React.useContext(MediaContext);

/**
 * Block Component Definitions
 */

// Helper to get CMS URL for fetching media
const getCmsUrl = () => {
  if (typeof window !== "undefined") {
    // Client-side: use public CMS URL
    return process.env.NEXT_PUBLIC_CMS_URL || "https://cms.busromhouse.com";
  }
  // Server-side: use internal URL if available
  return (
    process.env.CMS_URL ||
    process.env.NEXT_PUBLIC_CMS_URL ||
    "https://cms.busromhouse.com"
  );
};

// Client component to handle image gallery with media fetching
const ImageGalleryBlock = ({ node }: any) => {
  const { images, layout, spacing, lightbox } = node.data || node.fields || {};
  const [mediaCache, setMediaCache] = React.useState<Record<string, any>>({});
  const [loading, setLoading] = React.useState(true);

  const { media: contextMediaData = {} } = useContentData();

  // Fetch media data for image IDs
  React.useEffect(() => {
    if (!images || images.length === 0) {
      setLoading(false);
      return;
    }

    const fetchMedia = async () => {
      const cmsUrl = getCmsUrl();
      const newCache: Record<string, any> = {};

      await Promise.all(
        images.map(async (item: any) => {
          // Handle both string ID and object with id
          const imageId =
            typeof item.image === "string" || typeof item.image === "number"
              ? item.image
              : item.image?.id;

          if (!imageId || mediaCache[imageId]) return;

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
  }, [images, contextMediaData]);

  if (!images || images.length === 0) return null;

  // Layout configurations (matches Payload CMS feature config)
  const layoutClasses = {
    "grid-2": "grid-cols-1 md:grid-cols-2",
    "grid-3": "grid-cols-2 md:grid-cols-3",
    "grid-4": "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
    masonry: "columns-2 md:columns-3 lg:columns-4",
  }[layout || "grid-3"];

  // Spacing configurations
  const spacingClasses = {
    small: "gap-2",
    normal: "gap-4",
    large: "gap-6",
  }[spacing || "normal"];

  const isMasonry = layout === "masonry";

  if (loading) {
    return (
      <div className={`my-6 grid ${layoutClasses} ${spacingClasses}`}>
        {images.map((_: any, index: number) => (
          <div
            key={index}
            className="aspect-square bg-gray-200 rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`my-6 ${isMasonry ? layoutClasses : `grid ${layoutClasses} ${spacingClasses}`}`}
    >
      {images.map((item: any, index: number) => {
        // Handle both string ID and object with id/url
        const imageId =
          typeof item.image === "string" || typeof item.image === "number"
            ? item.image
            : item.image?.id;
        const mediaData = imageId ? mediaCache[imageId] : item.image;

        // Try different variant names: desktop (1920px) > tablet (1024px) > card (768px)
        // Never use original URL directly - always prefer variants
        const imageUrl =
          mediaData?.variants?.desktop?.url ||
          mediaData?.variants?.tablet?.url ||
          mediaData?.variants?.card?.url ||
          mediaData?.variants?.thumbnail?.url ||
          mediaData?.url; // Last resort fallback

        if (!imageUrl) {
          return (
            <div
              key={index}
              className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-sm"
            >
              Image not found
            </div>
          );
        }

        const imageElement = (
          <div
            key={index}
            className={`relative ${isMasonry ? "mb-4 break-inside-avoid" : "aspect-square"} rounded-lg overflow-hidden group ${lightbox ? "cursor-pointer" : ""}`}
          >
            <Image
              src={imageUrl}
              alt={
                item.caption || mediaData?.alt || `Gallery image ${index + 1}`
              }
              width={mediaData?.width || 800}
              height={mediaData?.height || 800}
              className={`w-full ${isMasonry ? "h-auto" : "h-full"} object-cover transition-transform ${lightbox ? "group-hover:scale-105" : ""}`}
              unoptimized
            />
            {item.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-2 text-sm">
                {item.caption}
              </div>
            )}
          </div>
        );

        if (item.enableLink && item.linkUrl) {
          return (
            <Link
              key={index}
              href={item.linkUrl}
              target={item.openInNewTab ? "_blank" : undefined}
              rel={item.openInNewTab ? "noopener noreferrer" : undefined}
            >
              {imageElement}
            </Link>
          );
        }

        return imageElement;
      })}
    </div>
  );
};

const SingleImageBlock = ({ node }: any) => {
  const { image, caption, alignment, size, enableLink, linkUrl, openInNewTab } =
    node.data || node.fields || {};
  const [mediaData, setMediaData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  const { media: contextMediaData = {} } = useContentData();

  // Fetch media data if image is an ID
  React.useEffect(() => {
    const imageId =
      typeof image === "string" || typeof image === "number"
        ? image
        : image?.id;
    if (!imageId) {
      setLoading(false);
      return;
    }

    // 1. Check if image already has url (Payload sometimes includes it)
    if (image?.url) {
      setMediaData(image);
      setLoading(false);
      return;
    }

    // 2. Check Context (Passed from parent like BlogTemplateOne)
    const contextImage =
      contextMediaData[imageId] ||
      Object.values(contextMediaData).find(
        (m: any) => String(m.id) === String(imageId),
      );
    if (contextImage) {
      setMediaData(contextImage);
      setLoading(false);
      return;
    }

    // 3. Fallback to fetch
    const fetchMedia = async () => {
      try {
        const cmsUrl = getCmsUrl();
        const res = await fetch(`${cmsUrl}/api/media/${imageId}?depth=0`);
        if (res.ok) {
          const data = await res.json();
          setMediaData(data);
        }
      } catch (err) {
        console.error(`Failed to fetch media ${imageId}:`, err);
      }
      setLoading(false);
    };

    fetchMedia();
  }, [image, contextMediaData]);

  // Size configurations (matches Payload CMS feature config)
  const sizeClasses = {
    small: "max-w-xs", // 300px
    medium: "max-w-2xl", // 600px
    large: "max-w-4xl", // 900px
    full: "max-w-full", // 100%
  }[size || "large"];

  // Alignment configurations
  const alignmentClasses = {
    left: "mr-auto",
    center: "mx-auto",
    right: "ml-auto",
  }[alignment || "center"];

  if (loading) {
    return (
      <figure className={`my-6 ${alignmentClasses}`}>
        <div
          className={`relative w-full ${sizeClasses} aspect-video bg-gray-200 rounded-lg animate-pulse`}
        />
      </figure>
    );
  }

  // Try different variant names: desktop (1920px) > tablet (1024px) > card (768px)
  // Never use original URL directly - always prefer variants
  const imageUrl =
    mediaData?.variants?.desktop?.url ||
    mediaData?.variants?.tablet?.url ||
    mediaData?.variants?.card?.url ||
    mediaData?.variants?.thumbnail?.url ||
    mediaData?.url; // Last resort fallback

  if (!imageUrl) return null;

  const imageContent = (
    <div
      className={`relative w-full ${sizeClasses} rounded-lg overflow-hidden`}
    >
      <Image
        src={imageUrl}
        alt={caption || mediaData?.alt || ""}
        width={mediaData?.width || 1920}
        height={mediaData?.height || 1080}
        className="w-full h-auto object-contain"
        unoptimized
      />
    </div>
  );

  return (
    <figure className={`my-6 ${alignmentClasses}`}>
      {enableLink && linkUrl ? (
        <Link
          href={linkUrl}
          target={openInNewTab ? "_blank" : undefined}
          rel={openInNewTab ? "noopener noreferrer" : undefined}
        >
          {imageContent}
        </Link>
      ) : (
        imageContent
      )}
      {caption && (
        <figcaption className="text-sm text-gray-600 mt-2 text-center">
          {caption}
        </figcaption>
      )}
    </figure>
  );
};

// Convert platform video URLs to embeddable URLs (YouTube, Vimeo, Bilibili, Instagram)
const getVideoEmbedUrl = (url: string): string => {
  if (!url) return "";
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  const bili = url.match(/bilibili\.com\/video\/(BV[\w]+)/);
  if (bili) return `https://player.bilibili.com/player.html?bvid=${bili[1]}`;
  const ig = url.match(/instagram\.com\/(p|reels?|tv)\/([\w-]+)/);
  if (ig)
    return `https://www.instagram.com/${ig[1] === "reels" ? "reel" : ig[1]}/${ig[2]}/embed`;
  // Already an embed/player URL or unknown platform: use as-is
  return url;
};

const VideoEmbedBlock = ({ node }: any) => {
  const data = node.data || node.fields || {};
  // CMS lexical node stores `url`; legacy Keystone format used `videoUrl`
  const videoUrl = data.url || data.videoUrl;
  const caption = data.caption;

  if (!videoUrl) return null;

  return (
    <figure className="my-6">
      <div className="relative w-full aspect-video rounded-lg overflow-hidden">
        <iframe
          src={getVideoEmbedUrl(videoUrl)}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      {caption && (
        <figcaption className="text-sm text-gray-600 mt-2 text-center">
          {caption}
        </figcaption>
      )}
    </figure>
  );
};

const CtaButtonBlock = ({ node }: any) => {
  const { text, url, variant, size } = node.data || node.fields || {};

  const variantClasses = {
    primary: "bg-brand-secondary text-white hover:bg-brand-secondary/90",
    secondary: "bg-brand-accent-gold text-white hover:bg-brand-accent-gold/90",
    outline:
      "border-2 border-brand-secondary text-brand-secondary hover:bg-brand-secondary hover:text-white",
  }[variant || "primary"];

  const sizeClasses = {
    small: "px-4 py-2 text-sm",
    medium: "px-6 py-3 text-base",
    large: "px-8 py-4 text-lg",
  }[size || "medium"];

  return (
    <div className="my-6">
      <Link
        href={url || "#"}
        className={`inline-block rounded-lg transition-colors font-medium ${variantClasses} ${sizeClasses}`}
      >
        {text}
      </Link>
    </div>
  );
};

const NoticeBlock = ({ node }: any) => {
  const { type, title, content } = node.data || node.fields || {};

  const typeStyles = {
    info: "bg-blue-50 border-blue-500 text-blue-900",
    warning: "bg-yellow-50 border-yellow-500 text-yellow-900",
    error: "bg-red-50 border-red-500 text-red-900",
    success: "bg-green-50 border-green-500 text-green-900",
  }[type || "info"];

  return (
    <div className={`border-l-4 p-4 rounded-r my-6 ${typeStyles}`}>
      {title && <div className="font-bold mb-2">{title}</div>}
      {content && <div>{content}</div>}
    </div>
  );
};

const LinkJumpBlock = ({ node }: any) => {
  const { title, linkText, linkUrl, openInNewTab } =
    node.data || node.fields || {};

  return (
    <div className="my-6 flex justify-center w-full">
      <Link
        href={linkUrl || "#"}
        target={openInNewTab ? "_blank" : undefined}
        rel={openInNewTab ? "noopener noreferrer" : undefined}
        className="group relative inline-flex items-center justify-between bg-[#756f3f] rounded-full border border-white/10 transition-all duration-300 hover:scale-105 h-[56px] lg:h-[72px] pl-6 lg:pl-10 pr-2 gap-x-4 lg:gap-x-12"
      >
        <span className="font-josefin-sans font-medium text-white tracking-wider text-sm lg:text-xl">
          {linkText || title}
        </span>

        <div className="bg-white rounded-full flex items-center justify-center shrink-0 w-[40px] h-[40px] lg:w-[56px] lg:h-[56px]">
          <svg
            className="w-4 h-4 lg:w-6 lg:h-6"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7 17L17 7M17 7H7M17 7V17"
              stroke="#756f3f"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </Link>
    </div>
  );
};

const CarouselBlock = ({ node }: any) => {
  const { slides, autoplay, interval, itemsPerView } =
    node.data || node.fields || {};
  const [api, setApi] = React.useState<any>();
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(true);
  const [mediaCache, setMediaCache] = React.useState<Record<string, any>>({});
  const [loading, setLoading] = React.useState(true);

  const { media: contextMediaData = {} } = useContentData();

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
};

const ReusableBlock = ({ node }: any) => {
  const data = node.data || node.fields || {};
  const block = data.reusableBlock || data.productReusableBlock || data.productDetailReusableBlock || data.seriesReusableBlock;
  const { reusableBlocks = {} } = useContentData();

  if (!block) return null;

  const blockId = typeof block === 'object' ? block.id : block;
  const blockData = reusableBlocks[blockId];

  if (!blockData || !blockData.contentTranslation) {
    return null;
  }

  return (
    <div className="reusable-block-wrapper my-8">
      <LexicalRenderer content={blockData.contentTranslation} />
    </div>
  );
};

const HeroBlock = ({ node }: any) => {
  const { title, subtitle, backgroundImage, ctaText, ctaUrl } =
    node.data || node.fields || {};
  // Prefer variants: desktop (1920px) > tablet (1024px) > card (768px)
  const bgUrl =
    backgroundImage?.variants?.desktop?.url ||
    backgroundImage?.variants?.tablet?.url ||
    backgroundImage?.variants?.card?.url ||
    backgroundImage?.variants?.thumbnail?.url ||
    backgroundImage?.url;

  return (
    <div className="relative w-full h-[400px] md:h-[600px] my-8 rounded-2xl overflow-hidden">
      {bgUrl && (
        <Image src={bgUrl} alt={title || ""} fill className="object-cover" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
        {title && (
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            {title}
          </h1>
        )}
        {subtitle && (
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl">
            {subtitle}
          </p>
        )}
        {ctaText && ctaUrl && (
          <Link
            href={ctaUrl}
            className="px-8 py-4 bg-brand-secondary text-white rounded-lg hover:bg-brand-secondary/90 transition-colors font-bold text-lg"
          >
            {ctaText}
          </Link>
        )}
      </div>
    </div>
  );
};

const MarqueeLinksBlock = ({ node }: any) => {
  const { speed, links, theme } = node.data || node.fields || {};
  const [isPaused, setIsPaused] = React.useState(false);
  const [mediaCache, setMediaCache] = React.useState<Record<string, any>>({});
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [repeatCount, setRepeatCount] = React.useState(10); // Default repeat count

  // Calculate how many times to repeat items to fill the screen
  React.useEffect(() => {
    if (!containerRef.current || !links || links.length === 0) return;

    // Estimate: each item is roughly 200px wide, we need at least 2x screen width
    const screenWidth = window.innerWidth;
    const estimatedItemWidth = 200;
    const totalItemsWidth = links.length * estimatedItemWidth;
    const neededRepeats = Math.ceil((screenWidth * 2.5) / totalItemsWidth);
    setRepeatCount(Math.max(neededRepeats, 5)); // At least 5 repeats
  }, [links]);

  const { media: contextMediaData = {} } = useContentData();
  const fetchingRef = React.useRef<Record<string, boolean>>({});

  // Fetch media data for icons that are media IDs
  React.useEffect(() => {
    if (!links || links.length === 0) return;

    const fetchMedia = async () => {
      const newCache: Record<string, any> = {};
      const linksToFetch = links.filter((link: any) => {
        const iconId = typeof link.icon === "string" || typeof link.icon === "number" ? link.icon : link.icon?.id;
        return iconId && !mediaCache[iconId] && !fetchingRef.current[iconId];
      });

      if (linksToFetch.length === 0) return;

      await Promise.all(
        linksToFetch.map(async (link: any) => {
          const iconId = typeof link.icon === "string" || typeof link.icon === "number" ? link.icon : link.icon?.id;
          
          // Double check context first
          const contextImage = contextMediaData[iconId] || 
            Object.values(contextMediaData).find((m: any) => String(m.id) === String(iconId));
          
          if (contextImage) {
            newCache[iconId] = contextImage;
            return;
          }

          fetchingRef.current[iconId] = true;
          try {
            // Use local proxy to avoid CORS issues
            const res = await fetch(`/api/payload/media/${iconId}?depth=0`);
            if (res.ok) {
              const data = await res.json();
              newCache[iconId] = data;
            }
          } catch (err) {
            console.error(`[LexicalRenderer] Failed to fetch media ${iconId}:`, err);
          }
          // Note: we keep fetchingRef[iconId] true even on failure to avoid repeated retries
        }),
      );

      if (Object.keys(newCache).length > 0) {
        setMediaCache((prev) => ({ ...prev, ...newCache }));
      }
    };

    fetchMedia();
  }, [links, contextMediaData]); // links is already stable if passed from parent

  const speedDuration =
    {
      slow: "60s",
      medium: "40s",
      fast: "20s",
    }[speed as "slow" | "medium" | "fast"] || "40s";

  const isDark = theme === "dark";
  // Dark theme: dark background, white text, gold icons
  // Light theme: cream/beige background with slight contrast, dark text, gold icons
  const bgClass = isDark ? "bg-[#bfb672]" : "bg-[#ebe6d7]";
  const textClass = isDark ? "text-white" : "text-black";
  const iconClass = isDark
    ? "text-brand-accent-gold"
    : "text-brand-accent-gold";
  const dividerClass = isDark ? "bg-white/30" : "bg-brand-secondary/25";

  if (!links || links.length === 0) return null;

  // Render a single link item
  const renderLinkItem = (link: any, keyPrefix: string, idx: number) => {
    const iconId =
      typeof link.icon === "string" || typeof link.icon === "number"
        ? link.icon
        : link.icon?.id;
    const mediaData = iconId ? mediaCache[iconId] : null;
    const iconUrl = mediaData?.variants?.thumbnail?.url || mediaData?.url;

    return (
      <div key={`${keyPrefix}-${idx}`} className="flex items-center shrink-0">
        <Link
          href={link.url || "#"}
          className="flex items-center gap-3 px-6 hover:opacity-70 transition-opacity whitespace-nowrap"
        >
          {link.iconName ? (
            <div className={`${iconClass} flex-shrink-0`}>
              <IconifyIcon
                name={link.iconName}
                size={20}
                color="currentColor"
              />
            </div>
          ) : iconUrl ? (
            <div className="w-5 h-5 rounded overflow-hidden flex-shrink-0">
              <Image
                src={iconUrl}
                alt={link.title}
                width={20}
                height={20}
                className="w-full h-full object-cover"
                unoptimized
              />
            </div>
          ) : null}
          <span
            className={`${textClass} text-[16px] font-montserrat font-medium`}
          >
            {link.title}
          </span>
        </Link>
        <div className={`w-px h-5 ${dividerClass}`}></div>
      </div>
    );
  };

  // Create repeated items array
  const repeatedItems = React.useMemo(() => {
    const items: React.ReactNode[] = [];
    for (let r = 0; r < repeatCount; r++) {
      links.forEach((link: any, idx: number) => {
        items.push(renderLinkItem(link, `r${r}`, idx));
      });
    }
    return items;
  }, [links, repeatCount, mediaCache, iconClass, textClass, dividerClass]);

  return (
    <div
      ref={containerRef}
      className={`relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen overflow-hidden ${bgClass} py-3`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Infinite scroll container */}
      <div className="flex">
        {/* First track */}
        <div
          className="flex shrink-0 items-center animate-marquee"
          style={{
            animationDuration: speedDuration,
            animationPlayState: isPaused ? "paused" : "running",
          }}
        >
          {repeatedItems}
        </div>
        {/* Second track - identical copy for seamless loop */}
        <div
          className="flex shrink-0 items-center animate-marquee"
          style={{
            animationDuration: speedDuration,
            animationPlayState: isPaused ? "paused" : "running",
          }}
        >
          {repeatedItems}
        </div>
      </div>
    </div>
  );
};

const TwoColumnsBlock = ({ node }: any) => {
  const { leftColumn, rightColumn, gap, columnRatio, verticalAlign } =
    node.data || node.fields || {};

  const gapClass = {
    small: "gap-4",
    normal: "gap-8",
    large: "gap-12",
  }[gap || "normal"];

  // Column ratio classes
  const ratioClass = {
    "1:1": "md:grid-cols-2",
    "2:1": "md:grid-cols-[2fr_1fr]",
    "1:2": "md:grid-cols-[1fr_2fr]",
    "3:1": "md:grid-cols-[3fr_1fr]",
    "1:3": "md:grid-cols-[1fr_3fr]",
  }[columnRatio || "1:1"];

  // Vertical alignment classes
  const alignClass = {
    top: "items-start",
    center: "items-center",
    bottom: "items-end",
  }[verticalAlign || "top"];

  return (
    <div
      className={`grid grid-cols-1 ${ratioClass} ${gapClass} ${alignClass} my-8`}
    >
      <div className="space-y-4">
        {leftColumn && <NestedLexicalRenderer content={leftColumn} />}
      </div>
      <div className="space-y-4">
        {rightColumn && <NestedLexicalRenderer content={rightColumn} />}
      </div>
    </div>
  );
};

/**
 * Fluid Layout Block
 *
 * Supports two modes:
 * 1. sideBySide: Traditional flex columns
 * 2. float: True CSS float wrapping
 */
const FluidLayoutBlock = ({ node }: any) => {
  const { image, imagePosition, imageWidth, content, layoutType } =
    node.fields || node.data || {};

  const imageUrl = image?.url || "";
  const isRight = imagePosition === "right";
  const widthStr = imageWidth?.toString() || "40";
  const isFloat = layoutType === "float";

  // Responsive width mapping
  const widthClass =
    {
      "25": "md:w-1/4",
      "33": "md:w-1/3",
      "40": "md:w-2/5",
      "50": "md:w-1/2",
      "60": "md:w-3/5",
      "75": "md:w-3/4",
    }[widthStr] || "md:w-2/5";

  // Content width for sideBySide
  const contentWidthClass =
    {
      "25": "md:w-3/4",
      "33": "md:w-2/3",
      "40": "md:w-3/5",
      "50": "md:w-1/2",
      "60": "md:w-2/5",
      "75": "md:w-1/4",
    }[widthStr] || "md:w-3/5";

  if (isFloat) {
    return (
      <div className="flow-root my-10 clear-both">
        {imageUrl && (
          <div
            className={`w-full ${widthClass} ${isRight ? "md:float-right md:ml-10" : "md:float-left md:mr-10"} mb-6 rounded-3xl overflow-hidden shadow-sm`}
          >
            <img
              src={imageUrl}
              alt={image?.alt || ""}
              className="w-full h-auto object-cover"
            />
          </div>
        )}
        {content && (
          <div className="nested-content-wrapper">
            <NestedLexicalRenderer content={content} />
          </div>
        )}
      </div>
    );
  }

  // sideBySide (Flex layout with vertical centering)
  return (
    <div
      className={`flex flex-col ${isRight ? "md:flex-row-reverse" : "md:flex-row"} md:items-center gap-10 my-10`}
    >
      {imageUrl && (
        <div
          className={`w-full ${widthClass} flex-shrink-0 rounded-3xl overflow-hidden shadow-sm`}
        >
          <img
            src={imageUrl}
            alt={image?.alt || ""}
            className="w-full h-auto object-cover"
          />
        </div>
      )}
      {content && (
        <div className={`w-full ${contentWidthClass} nested-content-wrapper`}>
          <NestedLexicalRenderer content={content} />
        </div>
      )}
    </div>
  );
};

/**
 * Author Card Block
 */
const AuthorCardBlock = ({ node }: any) => {
  const { author, displayFields, customBio, backgroundColor } =
    node.data || node.fields || {};

  if (!author) return null;

  // Helper to check if a field should be displayed
  const isVisible = (field: string) => displayFields?.includes(field);

  const { name, avatar, role, bio, socialLinks } = author;
  const displayBio = customBio || bio;
  const imageUrl = avatar?.url || "";

  // Social icons mapping
  const socialIcons: Record<string, string> = {
    instagram: "ant-design:instagram-filled",
    linkedin: "entypo-social:linkedin-with-circle",
    twitter: "ant-design:twitter-circle-filled",
    facebook: "entypo-social:facebook-with-circle",
    pinterest: "entypo-social:pinterest-with-circle",
    youtube: "ant-design:youtube-filled",
    website: "gg:website",
  };

  return (
    <div
      className="my-12 p-8 md:p-12 rounded-[32px] flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12"
      style={{ backgroundColor: backgroundColor || "#fbfcf4" }}
    >
      {/* Avatar */}
      {isVisible("avatar") && imageUrl && (
        <div className="shrink-0">
          <div className="w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-white shadow-sm">
            <img src={imageUrl} alt={name} className="w-full h-auto" />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center">
        {/* Bio / Quote */}
        {isVisible("bio") && displayBio && (
          <p className="font-josefin-sans text-[#474642] text-lg md:text-xl leading-relaxed italic mb-8 opacity-80">
            "{displayBio}"
          </p>
        )}

        <div className="mt-auto">
          {/* Name */}
          {isVisible("name") && (
            <h4 className="font-josefin-sans font-bold text-[#b06e4e] text-lg uppercase tracking-wider mb-1">
              {name}
            </h4>
          )}

          {/* Role */}
          {isVisible("role") && role && (
            <p className="font-josefin-sans text-[#756f3f] text-sm uppercase tracking-[0.2em] font-medium">
              {role}
            </p>
          )}

          {/* Social Links */}
          {isVisible("socialLinks") &&
            socialLinks &&
            socialLinks.length > 0 && (
              <div className="flex gap-4 mt-6">
                {socialLinks.map((link: any, idx: number) => (
                  <a
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#b06e4e] hover:opacity-70 transition-opacity"
                  >
                    <IconifyIcon
                      name={socialIcons[link.platform] || "gg:link"}
                      size={24}
                    />
                  </a>
                ))}
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

/**
 * Icon List Block - renders icon + title + subtitle items
 */
function IconListBlock({ node }: { node: any }) {
  const items = node?.data?.items || [];
  if (items.length === 0) return null;

  return (
    <div className="flex flex-wrap justify-start items-start gap-x-8 gap-y-6 py-6">
      {items.slice(0, 8).map((item: any, index: number) => {
        const itemContent = (
          <div className="flex flex-col items-center text-center group cursor-pointer transition-all duration-300">
            <div
              className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center mb-2 transition-all duration-300 border border-[#5d6b4a] group-hover:!bg-[#060C14] group-hover:!border-[#060C14]"
              style={{
                borderRadius:
                  item.borderStyle === "circle"
                    ? "50%"
                    : item.borderStyle === "square"
                      ? "12px"
                      : "0",
                backgroundColor: "transparent",
              }}
            >
              {item.icon && (
                <div className="transition-colors duration-300 text-[#5d6b4a] group-hover:text-white">
                  <IconifyIcon name={item.icon} size={24} />
                </div>
              )}
            </div>
            {item.title && (
              <p className="font-josefin-sans font-bold text-[11px] md:text-xs text-[#3a3a3a] leading-tight whitespace-pre-line group-hover:text-[#060C14] transition-colors max-w-[80px]">
                {item.title}
              </p>
            )}
            {item.subtitle && (
              <p className="font-josefin-sans text-[10px] text-gray-400 leading-tight mt-1 opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0">
                {item.subtitle}
              </p>
            )}
          </div>
        );

        const wrapperClass = "shrink-0 min-w-[60px] md:min-w-[80px]";

        if (item.enableLink && item.url) {
          return (
            <Link
              key={index}
              href={item.url}
              target={item.openInNewTab ? "_blank" : undefined}
              rel={item.openInNewTab ? "noopener noreferrer" : undefined}
              className={wrapperClass}
            >
              {itemContent}
            </Link>
          );
        }

        return (
          <div key={index} className={wrapperClass}>
            {itemContent}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Custom JSX Converters for our Lexical nodes
 */
const TagInterceptLink = ({ finalUrl, isExternal, children }: any) => {
  const router = useRouter();
  const isTagLink = finalUrl.includes('/knowledge-base-blogs?tag=');

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    if (isTagLink) {
      const match = finalUrl.match(/\?tag=([^&]+)/);
      if (match && match[1]) {
        e.preventDefault();
        sessionStorage.setItem('pendingBlogTag', match[1]);
        router.push('/knowledge-base-blogs');
      }
    }
  };

  return (
    <Link
      href={finalUrl}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className="text-[#B06E4E] underline underline-offset-8 decoration-1 decoration-[#B06E4E]/40 font-semibold hover:text-[#756F3F] hover:decoration-[#756F3F] transition-all"
      onClick={handleClick}
    >
      {children}
    </Link>
  );
};

export const customConverters: JSXConverters = {
  text: ({ node }: any) => {
    let text = node.text;
    const format = node.format || 0;

    // Standard Lexical formats
    if (format & 1)
      text = (
        <strong key="bold" className="font-montserrat font-bold">
          {text}
        </strong>
      );
    if (format & 2) text = <em key="italic">{text}</em>;
    if (format & 4)
      text = (
        <span key="strikethrough" style={{ textDecoration: "line-through" }}>
          {text}
        </span>
      );
    if (format & 8)
      text = (
        <span key="underline" style={{ textDecoration: "underline" }}>
          {text}
        </span>
      );
    if (format & 16) text = <code key="code">{text}</code>;
    if (format & 32) text = <sub key="sub">{text}</sub>;
    if (format & 64) text = <sup key="sup">{text}</sup>;

    // Handle TextStateFeature ($ property) provided by Payload CMS
    const state = node.$;
    if (state) {
      const styles: React.CSSProperties = {};
      if (state.color) {
        const colorMap: Record<string, string> = {
          "brand-primary": "#756F3F",
          "brand-secondary": "#B06E4E",
          "brand-cream": "#F4F1ED",
          "brand-red": "#D8A484",
          white: "#FFFFFF",
        };
        if (colorMap[state.color]) {
          styles.color = colorMap[state.color];
        }
      }
      if (Object.keys(styles).length > 0) {
        text = (
          <span key="custom-color" style={styles}>
            {text}
          </span>
        );
      }
    }

    return text;
  },
  heading: ({ node, nodesToJSX }: any) => {
    const Tag = (node.tag?.toLowerCase() || "h2") as any;
    const textContent = node.children?.map((c: any) => c.text).join("") || "";
    const id = textContent
      ? textContent
          .toLowerCase()
          .trim()
          .replace(/\s+/g, "-")
      : undefined;

    return (
      <Tag
        id={id}
      >
        {nodesToJSX({ nodes: node.children })}
      </Tag>
    );
  },
  h1: ({ node, nodesToJSX }: any) => {
    const textContent = node?.children?.map((c: any) => c.text).join("") || "";
    const id = textContent
      ? textContent
          .toLowerCase()
          .trim()
          .replace(/\s+/g, "-")
      : undefined;
    return (
      <h1
        id={id}
        className="text-3xl font-montserrat font-bold mb-6 mt-12"
      >
        {nodesToJSX({ nodes: node.children })}
      </h1>
    );
  },
  h2: ({ node, nodesToJSX }: any) => {
    const textContent = node?.children?.map((c: any) => c.text).join("") || "";
    const id = textContent
      ? textContent
          .toLowerCase()
          .trim()
          .replace(/\s+/g, "-")
      : undefined;
    return (
      <h2
        id={id}
        className="text-2xl font-montserrat font-bold mt-16 mb-8"
      >
        {nodesToJSX({ nodes: node.children })}
      </h2>
    );
  },
  h3: ({ node, nodesToJSX }: any) => {
    const textContent = node?.children?.map((c: any) => c.text).join("") || "";
    const id = textContent
      ? textContent
          .toLowerCase()
          .trim()
          .replace(/\s+/g, "-")
      : undefined;
    return (
      <h3
        id={id}
        className="text-xl font-montserrat font-bold mt-10 mb-4"
      >
        {nodesToJSX({ nodes: node.children })}
      </h3>
    );
  },
  list: ({ node, nodesToJSX }: any) => {
    const Tag = node.listType === "number" ? "ol" : "ul";
    return (
      <Tag
        className={`mb-4 pl-8 ${node.listType === "number" ? "list-decimal" : "list-disc"} space-y-1`}
      >
        {nodesToJSX({ nodes: node.children })}
      </Tag>
    );
  },
  listitem: ({ node, nodesToJSX }: any) => {
    return (
      <li className="leading-normal">
        {nodesToJSX({ nodes: node.children })}
      </li>
    );
  },
  quote: ({ node, nodesToJSX }: any) => {
    return (
      <div className="relative my-24 ml-0 group">
        <div className="relative inline-block w-full">
          {/* 1. Content Layer */}
          <blockquote
            className="relative z-10 px-6 pt-[28px] md:px-[48px] md:pt-[8px] font-prata text-[22px] text-[#060C14] leading-[1.625]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg fill='none' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 42'%3E%3Cpath d='M14.9 20.4h-11c.2-11 2.4-12.7 9-16.7q1.2-.8.6-2.2c-.4-.8-1.4-1-2.2-.6C3.4 5.6.7 8.4.7 22v12.6c0 4 3.2 7.2 7.2 7.2h7a7 7 0 0 0 7.2-7.2v-7a7 7 0 0 0-7.2-7.2m25.2 0h-11c.3-11 2.4-12.7 9.1-16.7A1.6 1.6 0 1 0 36.5 1C28.6 5.6 26 8.4 26 22v12.6c0 4 3.2 7.2 7.2 7.2h7a7 7 0 0 0 7.2-7.2v-7a7 7 0 0 0-7.2-7.2' fill='%23415620' opacity='0.5'/%3E%3C/svg%3E")`,
              backgroundSize: "28px 24px",
              backgroundPosition: "28px 28px",
              backgroundRepeat: "no-repeat",
            }}
          >
            {/* 2. Precision Assembly Frame */}
            <div className="absolute inset-0 pointer-events-none z-0">
              {/* -- CORNERS (12x12 strict dimension) -- */}
              {/* TL */}
              <div className="absolute top-0 left-0 w-[12px] h-[12px] border-t-2 border-l-2 border-[#C9C5AA] rounded-tl-[12px]" />
              {/* TR */}
              <div className="absolute top-0 right-0 w-[12px] h-[12px] border-t-2 border-r-2 border-[#C9C5AA] rounded-tr-[12px]" />
              {/* BR: Drops exactly 2px below main container to align with SVG ink start */}
              <div className="absolute -bottom-[2px] right-0 w-[12px] h-[12px] border-b-2 border-r-2 border-[#C9C5AA] rounded-br-[12px]" />
              {/* BL: Drops exactly 33px below main container to align with SVG ink end */}
              <div className="absolute -bottom-[33px] left-0 w-[12px] h-[12px] border-b-2 border-l-2 border-[#C9C5AA] rounded-bl-[12px]" />

              {/* -- STRAIGHT LINES (1px seamless overlaps) -- */}
              <div className="absolute top-0 left-[11px] right-[11px] h-[2px] bg-[#C9C5AA]" />
              <div className="absolute top-[11px] bottom-[9px] right-0 w-[2px] bg-[#C9C5AA]" />
              <div className="absolute top-[11px] -bottom-[22px] left-0 w-[2px] bg-[#C9C5AA]" />

              {/* Bottom Right Line */}
              <div className="absolute top-full left-[365px] right-[11px] h-[2px] bg-[#C9C5AA]" />
              {/* Ledge Line (Matches BL corner at 31px below, ending into SVG) */}
              <div className="absolute top-[calc(100%+31px)] left-[11px] w-[270px] h-[2px] bg-[#C9C5AA]" />

              {/* -- SVG BRIDGE -- */}
              <div className="absolute top-full left-[280px] w-[86px] h-[34px]">
                <svg
                  width="86"
                  height="34"
                  viewBox="0 0 86 34"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="absolute top-0 left-0"
                >
                  <path
                    d="M0 0h85.5c-8.2 0-15.9 3-19.9 8l-13 16c-4 5-11.5 8-19.6 8H0z"
                    fill="transparent"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M84.9 0H86v2h-1.2c-2.7 0-6 0-9.5 1.1-4 1.3-8.6 4.1-13 10.5-5 7.7-9.2 12.8-14.7 15.8S35.6 33.3 26 33H0v-2h26c9.5.3 15.6-.6 20.6-3.4s9-7.4 14-15.1c4.7-6.7 9.6-9.9 14-11.3C78.7-.1 82.3 0 85 0"
                    fill="#c9c5aa"
                  />
                </svg>
              </div>
            </div>

            <div className="relative z-10">
              {nodesToJSX({ nodes: node.children })}
            </div>
          </blockquote>
        </div>
      </div>
    );
  },
  paragraph: ({ node, nodesToJSX }: any) => {
    return (
      <p className="mb-4 leading-relaxed text-inherit">
        {nodesToJSX({ nodes: node.children })}
      </p>
    );
  },
  link: ({ node, nodesToJSX }: any) => {
    const { fields, url } = node as any;
    const finalUrl = fields?.url || url || "#";
    // Always open in new tab as per client request
    const isExternal = finalUrl.startsWith('http');

    return (
      <TagInterceptLink finalUrl={finalUrl} isExternal={isExternal}>
        {nodesToJSX({ nodes: node.children })}
      </TagInterceptLink>
    );
  },
  upload: ({ node }: any) => {
    const { value, relationTo } = node;
    const { media = {} } = useContentData();

    // Support both pre-hydrated object and ID-based lookup from context
    const mediaObj = typeof value === "object" ? value : media[value];
    const imageUrl = mediaObj?.url || mediaObj?.sizes?.large?.url || "";

    if (!imageUrl || relationTo !== "media") return null;

    return (
      <figure className="my-10">
        <div className="relative w-full rounded-3xl overflow-hidden shadow-sm">
          <img
            src={imageUrl}
            alt={mediaObj?.alt || ""}
            className="w-full h-auto object-contain"
          />
        </div>
        {node.fields?.caption && (
          <figcaption className="text-center text-sm text-gray-500 mt-4 font-montserrat italic">
            {node.fields.caption}
          </figcaption>
        )}
      </figure>
    );
  },
  // Feature Nodes (Custom Top-level Nodes)
  singleImage: SingleImageBlock,
  "single-image": SingleImageBlock,
  imageGallery: ImageGalleryBlock,
  "custom-image-gallery": ImageGalleryBlock,
  "image-gallery": ImageGalleryBlock,
  linkJump: LinkJumpBlock,
  iconList: IconListBlock,
  videoEmbed: VideoEmbedBlock,
  ctaButton: CtaButtonBlock,
  marqueeLinks: MarqueeLinksBlock,
  carousel: CarouselBlock,
  productCarousel: ProductCarouselBlock,
  hero: HeroBlock,
  notice: NoticeBlock,

  reusableBlock: ReusableBlock,
  "reusable-block": ReusableBlock,
  productReusableBlock: ReusableBlock,
  "productReusableBlock": ReusableBlock,
  productDetailReusableBlock: ReusableBlock,
  "productDetailReusableBlock": ReusableBlock,
  seriesReusableBlock: ReusableBlock,
  "seriesReusableBlock": ReusableBlock,

  // Blocks (type: "block" nodes with blockType)
  // Maintaining full backward compatibility for older pages
  blocks: {
    reusableBlock: ReusableBlock,
    "reusable-block": ReusableBlock,
    productReusableBlock: ReusableBlock,
    productDetailReusableBlock: ReusableBlock,
    seriesReusableBlock: ReusableBlock,
    fluidLayout: FluidLayoutBlock,
    twoColumns: TwoColumnsBlock,
    threeColumns: (props: any) => (
      <div>Three Columns Block (Not implemented)</div>
    ),
    container: (props: any) => <div>Container Block (Not implemented)</div>,
    authorCard: AuthorCardBlock,
    singleImage: SingleImageBlock,
    "single-image": SingleImageBlock,
    imageGallery: ImageGalleryBlock,
    "image-gallery": ImageGalleryBlock,
    "custom-image-gallery": ImageGalleryBlock,
    videoEmbed: VideoEmbedBlock,
    "video-embed": VideoEmbedBlock,
    ctaButton: CtaButtonBlock,
    "cta-button": CtaButtonBlock,
    linkJump: LinkJumpBlock,
    "link-jump": LinkJumpBlock,
    iconList: IconListBlock,
    "icon-list": IconListBlock,
    carousel: CarouselBlock,
    marqueeLinks: MarqueeLinksBlock,
    "marquee-links": MarqueeLinksBlock,
    productCarousel: ProductCarouselBlock,
    "product-carousel": ProductCarouselBlock,
    hero: HeroBlock,
    notice: NoticeBlock,
  },
};

// Helper to filter out undefined values from converters
const filterUndefined = (obj: any) => {
  if (!obj) return {};
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== undefined),
  );
};

// Base converters defined outside to prevent recreation
const baseConverters = {
  ...filterUndefined(defaultJSXConverters),
  ...filterUndefined(customConverters),
  blocks: {
    ...filterUndefined((defaultJSXConverters as any)?.blocks),
    ...filterUndefined(customConverters.blocks),
  },
};

/**
 * Main Lexical Renderer Component
 */
export const LexicalRenderer = React.memo(function LexicalRenderer({
  content,
  className = "",
  mediaData = {},
  reusableBlocks = {},
}: LexicalRendererProps) {

  // Use static baseConverters to prevent unnecessary RichText re-renders
  const converters = baseConverters;

  // FINAL SAFETY CHECK: If RichText is undefined, we have a major import issue
  if (!RichText) {
    return (
      <div className="p-4 border-2 border-red-500 bg-red-50 text-red-700 rounded-lg">
        CRITICAL ERROR: RichText component is undefined. Path:
        @payloadcms/richtext-lexical/react
      </div>
    );
  }

  return (
    <MediaContext.Provider value={{ media: mediaData, reusableBlocks }}>
      <div className={`lexical-content prose prose-stone max-w-none ${className}`}>
        <RichText data={content} converters={converters} />
      </div>
    </MediaContext.Provider>
  );
});

/**
 * Nested Lexical Renderer
 *
 * Used for rendering nested rich text content (e.g., inside TwoColumnsBlock).
 * Includes all custom converters for proper block rendering.
 */
function NestedLexicalRenderer({ content }: { content: any }) {
  // Helper to filter out undefined values from converters
  const filterUndefined = (obj: any) => {
    if (!obj) return {};
    return Object.fromEntries(
      Object.entries(obj).filter(([_, v]) => v !== undefined),
    );
  };

  // Build full converters including all custom blocks
  const converters: any = {
    ...filterUndefined(defaultJSXConverters),
    ...filterUndefined(customConverters),
    blocks: {
      ...filterUndefined((defaultJSXConverters as any)?.blocks),
      ...filterUndefined(customConverters.blocks),
    },
  };

  return (
    <div className="nested-lexical-content">
      <RichText data={content} converters={converters} />
    </div>
  );
}
