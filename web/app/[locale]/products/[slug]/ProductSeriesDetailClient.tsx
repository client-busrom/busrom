"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import type { Locale } from "@/i18n.config";
import {
  parseContentTranslation,
  type ParsedProductSeriesContent,
} from "@/lib/content-parser";
import { HeroCarousel } from "@/components/product-series/HeroCarousel";
import { ProductOverview } from "@/components/product-series/ProductOverview";
import {
  ProductTechSpecs,
  SERIES_COLORS,
  getSeriesColorConfig,
} from "@/components/product-series/ProductTechSpecs";
import { ProductAdvantages } from "@/components/product-series/ProductAdvantages";
import { Applications } from "@/components/product-series/Applications";
import { ContactForm } from "@/components/product-series/ContactForm";
import { MoreSeries } from "@/components/product-series/MoreSeries";
import { Quote } from "@/components/product-series/Quote";
import { ErrorImageWall } from "@/components/ErrorImageWall";

import { Link } from "@/lib/navigation";

interface ProductSeriesData {
  id: string;
  slug: string;
  name: string;
  description: string;
  featuredImage: string | null;
  order: number;
  status: string;
  contentTranslation: any;
  mediaData?: Record<string, any>;
  reusableBlocks?: Record<string, any>;
  locale: string;
}

interface ProductSeriesDetailClientProps {
  locale: Locale;
  slug: string;
  initialData?: ProductSeriesData | null;
  seoKeywords?: string[];
}

export function ProductSeriesDetailClient({
  locale,
  slug,
  initialData,
  seoKeywords = [],
}: ProductSeriesDetailClientProps) {
  const [seriesData, setSeriesData] = useState<ProductSeriesData | null>(
    initialData || null,
  );
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);

  // Check for debug query param to show color toggle
  const searchParams = useSearchParams();
  const isDebugMode = searchParams.get("debug-color") !== null;

  // Manage active color key for demo/testing toggle
  const [activeColorKey, setActiveColorKey] = useState<string>("");

  // Get current active color config for displaying on the button
  const currentColorConfig = useMemo(() => {
    return getSeriesColorConfig(activeColorKey || seriesData?.name || slug);
  }, [activeColorKey, seriesData?.name, slug]);

  // Handler to cycle through all available series colors
  const toggleSeriesColor = () => {
    const keys = Object.keys(SERIES_COLORS);
    const matchEntry = Object.entries(SERIES_COLORS).find(
      ([k, v]) => v.name === currentColorConfig.name,
    );
    const currentIndex = matchEntry ? keys.indexOf(matchEntry[0]) : 0;
    const nextIndex = (currentIndex + 1) % keys.length;
    setActiveColorKey(keys[nextIndex]);
  };

  useEffect(() => {
    if (initialData) return;

    const fetchSeriesContent = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/product-series/${slug}?locale=${locale}`);

        if (!res.ok) {
          throw new Error(`Failed to fetch product series: ${res.statusText}`);
        }

        const data = await res.json();
        setSeriesData(data);
      } catch (err) {
        console.error("Error fetching product series content:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load product series",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSeriesContent();
  }, [locale, slug]);

  // Parse content translation
  const parsedContent = useMemo<ParsedProductSeriesContent>(() => {
    if (!seriesData?.contentTranslation) return {};

    // Build media map from mediaData (full objects)
    const mediaMap = new Map<string, any>();
    if (seriesData.mediaData) {
      Object.entries(seriesData.mediaData).forEach(([id, data]) => {
        mediaMap.set(id, data);
      });
    }

    // Build reusable blocks map
    const reusableBlocksMap = new Map<string, any>();
    if (seriesData.reusableBlocks) {
      Object.entries(seriesData.reusableBlocks).forEach(([id, content]) => {
        reusableBlocksMap.set(id, content);
      });
    }

    return parseContentTranslation(
      seriesData.contentTranslation,
      mediaMap,
      reusableBlocksMap,
    );
  }, [seriesData]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black" data-header-theme="transparent">
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-12 h-12 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !seriesData) {
    return (
      <div
        className="min-h-screen bg-background pt-20"
        data-header-theme="light"
      >
        <div className="container mx-auto px-6 md:px-8 lg:px-16 py-12">
          <div className="text-center py-20">
            <div className="inline-block w-16 h-px bg-brand-accent-border mb-6"></div>
            <h1 className="text-brand-text-black text-3xl font-anaheim font-extrabold mb-3">
              Product Series Not Found
            </h1>
            <p className="text-brand-accent-gold text-base mb-6">
              {error || "The product series you're looking for doesn't exist."}
            </p>
            <Link
              href="/products"
              className="inline-block px-8 py-3 bg-brand-text-black text-white font-anaheim font-bold text-sm uppercase tracking-wider hover:bg-brand-accent-gold transition-colors"
            >
              View All Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Check if there's any content to display
  const hasContent =
    parsedContent.heroCarousel ||
    parsedContent.productOverview ||
    parsedContent.coreSellingPoints ||
    parsedContent.productTechSpecs ||
    parsedContent.productAdvantages ||
    parsedContent.applications ||
    parsedContent.contactForm ||
    parsedContent.moreSeries ||
    parsedContent.quote;

  // Extract custom images for the Image Wall if available
  const seriesImages = useMemo(() => {
    if (!seriesData?.mediaData) return undefined;
    const urls: string[] = [];
    Object.values(seriesData.mediaData).forEach((media: any) => {
      const url = media?.sizes?.card?.url || media?.sizes?.tablet?.url || media?.sizes?.thumbnail?.url || media?.url;
      if (url) urls.push(url);
    });
    return urls.length > 0 ? urls : undefined;
  }, [seriesData]);

  // Empty content state
  if (!hasContent) {
    return (
      <div
        className="min-h-[calc(100vh-80px)] bg-[#FAF9F5] flex flex-col justify-between relative overflow-hidden font-sans pt-24"
        data-header-theme="light"
      >
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col lg:flex-row w-full max-w-[1920px] mx-auto px-8 md:px-16 lg:px-24 xl:px-32 relative z-10">
          {/* Left Side: Text Content */}
          <div className="w-full lg:w-3/5 flex flex-col justify-center items-start lg:pr-12 xl:pr-24 h-full pb-20 lg:pb-0 z-20">
            <h1
              className="text-[32px] md:text-[40px] lg:text-[clamp(32px,2.4vw,46px)] text-[#2D2D2D] uppercase leading-[1.3] mb-12 tracking-wide"
              style={{
                fontFamily:
                  '"Playfair Display", "Times New Roman", Times, serif',
              }}
            >
              {seriesData.name || "Product Series"}
              <br />
              IS CURRENTLY BEING PREPARED.
              <br />
              PLEASE CHECK BACK LATER.
            </h1>

            <Link
              href="/products"
              className="px-10 py-4 bg-[#BFA273] text-white font-sans font-bold text-sm tracking-[0.1em] rounded-sm hover:bg-[#A88A5C] transition-colors duration-300"
            >
              VIEW ALL PRODUCTS
            </Link>
          </div>

          {/* Right Side: Building Illustration */}
          <div className="w-full lg:w-2/5 flex items-end justify-end opacity-90 lg:absolute lg:right-0 lg:bottom-0 lg:h-full pointer-events-none z-10">
            <ErrorImageWall customImages={seriesImages} />
          </div>
        </div>

        {/* Footer */}
        <div className="w-full max-w-[1920px] mx-auto px-8 md:px-16 lg:px-24 xl:px-32 pb-8 z-20 relative">
          <p className="text-[#888888] text-xs font-sans tracking-wide">
            Copyright &copy; Busrom {new Date().getFullYear()}. All Rights
            Reserved
          </p>
        </div>
      </div>
    );
  }

  // Render product series content with sections
  return (
      <div className="min-h-screen bg-background" data-header-theme="light">
        <h1 className="sr-only">{seriesData.name} - Busrom Hardware</h1>

        {/* Hero Carousel Section */}
        {parsedContent.heroCarousel && (
        <HeroCarousel data={parsedContent.heroCarousel} />
      )}

      {/* Product Overview Section */}
      {parsedContent.productOverview && (
        <ProductOverview data={parsedContent.productOverview} />
      )}

      {/* Product Tech Specs Section (First Screen) */}
      {parsedContent.productTechSpecs && (
        <ProductTechSpecs
          data={parsedContent.productTechSpecs}
          seriesName={activeColorKey || seriesData.name}
          currentSlug={slug}
        />
      )}

      {/* Product Advantages Section (Second Screen) */}
      {parsedContent.productAdvantages && (
        <ProductAdvantages
          data={parsedContent.productAdvantages}
          seriesName={activeColorKey || seriesData.name}
          currentSlug={slug}
        />
      )}

      {/* Applications Section */}
      {parsedContent.applications && (
        <Applications data={parsedContent.applications} />
      )}

      {/* Contact Form Section */}
      {parsedContent.contactForm && (
        <ContactForm data={parsedContent.contactForm} />
      )}

      {/* More Series Section */}
      {parsedContent.moreSeries && (
        <MoreSeries data={parsedContent.moreSeries} currentSlug={slug} />
      )}

      {/* Quote Section */}
      {parsedContent.quote && <Quote data={parsedContent.quote} />}

      {/* Premium Floating Color Toggle Button — debug mode only */}
      {isDebugMode && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-white/90 backdrop-blur-md p-2 rounded-full shadow-2xl border border-black/10 transition-all duration-300 hover:scale-105">
          <button
            onClick={toggleSeriesColor}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-inter font-bold transition-all duration-300 text-white shadow-md active:scale-95"
            style={{ backgroundColor: currentColorConfig.rgb }}
            title="点击切换系列渐变主题色"
          >
            <span
              className="flex w-4 h-4 rounded-full border border-white/50 shadow-inner"
              style={{ backgroundColor: currentColorConfig.dark }}
            />
            <span>
              🎨 配色切换: {currentColorConfig.name} (
              {currentColorConfig.rgb.toUpperCase()})
            </span>
          </button>
        </div>
      )}
    </div>
    
  );
}
