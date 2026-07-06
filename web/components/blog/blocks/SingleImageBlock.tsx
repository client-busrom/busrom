// @ts-nocheck
"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useBlogContentData } from "@/components/blog/BlogLexicalRenderer/context";
import { getCmsUrl } from "@/components/blog/BlogLexicalRenderer/utils";

export function SingleImageBlock({ node }: { node: any }) {
  const { image, caption, alignment, size, enableLink, linkUrl, openInNewTab } =
    node.data || node.fields || {};
  const [mediaData, setMediaData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  const { media: contextMediaData = {} } = useBlogContentData();

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
}
