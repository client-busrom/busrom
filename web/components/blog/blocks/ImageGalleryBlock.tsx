// @ts-nocheck
"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useBlogContentData } from "@/components/blog/BlogLexicalRenderer/context";
import { getCmsUrl } from "@/components/blog/BlogLexicalRenderer/utils";

export function ImageGalleryBlock({ node }: { node: any }) {
  const { images, layout, spacing, lightbox } = node.data || node.fields || {};
  const [mediaCache, setMediaCache] = React.useState<Record<string, any>>({});
  const [loading, setLoading] = React.useState(true);

  const { media: contextMediaData = {} } = useBlogContentData();

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
}
