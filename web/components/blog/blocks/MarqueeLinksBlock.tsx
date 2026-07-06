// @ts-nocheck
"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { IconifyIcon } from "@/components/ui/IconifyIcon";
import { useBlogContentData } from "@/components/blog/BlogLexicalRenderer/context";

export function MarqueeLinksBlock({ node }: { node: any }) {
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

  const { media: contextMediaData = {} } = useBlogContentData();
  const fetchingRef = React.useRef<Record<string, boolean>>({});

  // Fetch media data for icons that are media IDs
  React.useEffect(() => {
    if (!links || links.length === 0) return;

    const fetchMedia = async () => {
      const newCache: Record<string, any> = {};
      const linksToFetch = links.filter((link: any) => {
        const iconId =
          typeof link.icon === "string" || typeof link.icon === "number"
            ? link.icon
            : link.icon?.id;
        return iconId && !mediaCache[iconId] && !fetchingRef.current[iconId];
      });

      if (linksToFetch.length === 0) return;

      await Promise.all(
        linksToFetch.map(async (link: any) => {
          const iconId =
            typeof link.icon === "string" || typeof link.icon === "number"
              ? link.icon
              : link.icon?.id;

          // Double check context first
          const contextImage =
            contextMediaData[iconId] ||
            Object.values(contextMediaData).find(
              (m: any) => String(m.id) === String(iconId),
            );

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
            console.error(
              `[BlogLexicalRenderer] Failed to fetch media ${iconId}:`,
              err,
            );
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
}
