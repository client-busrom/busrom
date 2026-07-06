// @ts-nocheck
"use client";

// @ts-nocheck
/**
 * Blog-specific Lexical Content Renderer
 *
 * Independent from `web/components/lexical/LexicalRenderer.tsx` so that blog
 * templates can have their own block implementations without affecting other
 * pages.
 */

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { IconifyIcon } from "@/components/ui/IconifyIcon";
import {
  RichText,
  defaultJSXConverters,
} from "@payloadcms/richtext-lexical/react";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical";
import type { JSXConverters } from "@payloadcms/richtext-lexical/react";
import type { Locale } from "@/i18n.config";

import { ProductCarouselBlock } from "@/components/lexical/blocks/ProductCarouselBlock";

import {
  ApplicationCarouselBlock,
  AuthorCardBlock,
  CarouselBlock,
  ChecklistBlock,
  ContainerBlock,
  FaqCarouselBlock,
  FaqSelectionBlock,
  FluidLayoutBlock,
  FormBlock,
  IconListBlock,
  ImageGalleryBlock,
  MarqueeLinksBlock,
  SidebarBlock,
  SingleImageBlock,
  ThreeColumnsBlock,
  TwoColumnsBlock,
} from "@/components/blog/blocks";

import {
  ConvertersContext,
  LocaleContext,
  MediaContext,
  useBlogContentData,
  useBlogLocale,
} from "./BlogLexicalRenderer/context";
import { filterUndefined } from "./BlogLexicalRenderer/utils";

interface BlogLexicalRendererProps {
  content: SerializedEditorState;
  className?: string;
  mediaData?: Record<string, any>;
  reusableBlocks?: Record<string, any>;
  locale: Locale;
}

// ---------------------------------------------------------------------------
// Small inline blocks (kept here because they are tiny and shared-style)
// ---------------------------------------------------------------------------

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

const VideoEmbedBlock = ({ node }: any) => {
  const { videoUrl, caption } = node.data || node.fields || {};

  if (!videoUrl) return null;

  return (
    <figure className="my-6">
      <div className="relative w-full aspect-video rounded-lg overflow-hidden">
        <iframe
          src={videoUrl}
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

// ReusableBlock is kept inline because it recursively renders with
// BlogLexicalRenderer, which avoids circular imports.
const ReusableBlock = ({ node }: any) => {
  const data = node.data || node.fields || {};
  const block =
    data.reusableBlock ||
    data.productReusableBlock ||
    data.productDetailReusableBlock ||
    data.seriesReusableBlock;
  const { media = {}, reusableBlocks = {} } = useBlogContentData();
  const locale = useBlogLocale();

  if (!block) return null;

  const blockId = typeof block === "object" ? block.id : block;
  const blockData = reusableBlocks[blockId];

  if (!blockData || !blockData.contentTranslation) {
    return null;
  }

  return (
    <div className="reusable-block-wrapper my-8">
      <BlogLexicalRenderer
        content={blockData.contentTranslation}
        mediaData={media}
        reusableBlocks={reusableBlocks}
        locale={locale}
      />
    </div>
  );
};

// ---------------------------------------------------------------------------
// Link interceptor for tag links
// ---------------------------------------------------------------------------

const TagInterceptLink = ({
  finalUrl,
  isExternal,
  children,
}: {
  finalUrl: string;
  isExternal: boolean;
  children: React.ReactNode;
}) => {
  const router = useRouter();
  const isTagLink = finalUrl.includes("/knowledge-base-blogs?tag=");

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    if (isTagLink) {
      const match = finalUrl.match(/\?tag=([^&]+)/);
      if (match && match[1]) {
        e.preventDefault();
        sessionStorage.setItem("pendingBlogTag", match[1]);
        router.push("/knowledge-base-blogs");
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

// ---------------------------------------------------------------------------
// Converters
// ---------------------------------------------------------------------------

const customConverters: JSXConverters = {
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
      ? textContent.toLowerCase().trim().replace(/\s+/g, "-")
      : undefined;

    return <Tag id={id}>{nodesToJSX({ nodes: node.children })}</Tag>;
  },

  h1: ({ node, nodesToJSX }: any) => {
    const textContent = node?.children?.map((c: any) => c.text).join("") || "";
    const id = textContent
      ? textContent.toLowerCase().trim().replace(/\s+/g, "-")
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
      ? textContent.toLowerCase().trim().replace(/\s+/g, "-")
      : undefined;
    return (
      <h2 id={id} className="text-2xl font-montserrat font-bold mt-16 mb-8">
        {nodesToJSX({ nodes: node.children })}
      </h2>
    );
  },

  h3: ({ node, nodesToJSX }: any) => {
    const textContent = node?.children?.map((c: any) => c.text).join("") || "";
    const id = textContent
      ? textContent.toLowerCase().trim().replace(/\s+/g, "-")
      : undefined;
    return (
      <h3 id={id} className="text-xl font-montserrat font-bold mt-10 mb-4">
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
    const isExternal = finalUrl.startsWith("http");

    return (
      <TagInterceptLink finalUrl={finalUrl} isExternal={isExternal}>
        {nodesToJSX({ nodes: node.children })}
      </TagInterceptLink>
    );
  },

  upload: ({ node }: any) => {
    const { value, relationTo } = node;
    const { media = {} } = useBlogContentData();

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
  formBlock: FormBlock,
  applicationCarousel: ApplicationCarouselBlock,
  faqCarousel: FaqCarouselBlock,
  faqSelection: FaqSelectionBlock,

  reusableBlock: ReusableBlock,
  "reusable-block": ReusableBlock,
  productReusableBlock: ReusableBlock,
  productDetailReusableBlock: ReusableBlock,
  seriesReusableBlock: ReusableBlock,

  // Blocks (type: "block" nodes with blockType)
  blocks: {
    reusableBlock: ReusableBlock,
    "reusable-block": ReusableBlock,
    productReusableBlock: ReusableBlock,
    productDetailReusableBlock: ReusableBlock,
    seriesReusableBlock: ReusableBlock,
    fluidLayout: FluidLayoutBlock,
    twoColumns: TwoColumnsBlock,
    threeColumns: ThreeColumnsBlock,
    container: ContainerBlock,
    sidebar: SidebarBlock,
    checklist: ChecklistBlock,
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
    formBlock: FormBlock,
    applicationCarousel: ApplicationCarouselBlock,
    faqCarousel: FaqCarouselBlock,
    faqSelection: FaqSelectionBlock,
  },
};

const baseConverters = {
  ...filterUndefined(defaultJSXConverters),
  ...filterUndefined(customConverters),
  blocks: {
    ...filterUndefined((defaultJSXConverters as any)?.blocks),
    ...filterUndefined(customConverters.blocks),
  },
};

// ---------------------------------------------------------------------------
// Main renderer
// ---------------------------------------------------------------------------

export const BlogLexicalRenderer = React.memo(function BlogLexicalRenderer({
  content,
  className = "",
  mediaData = {},
  reusableBlocks = {},
  locale,
}: BlogLexicalRendererProps) {
  const converters = baseConverters;

  if (!RichText) {
    return (
      <div className="p-4 border-2 border-red-500 bg-red-50 text-red-700 rounded-lg">
        CRITICAL ERROR: RichText component is undefined. Path:
        @payloadcms/richtext-lexical/react
      </div>
    );
  }

  return (
    <ConvertersContext.Provider value={converters}>
      <LocaleContext.Provider value={locale}>
        <MediaContext.Provider value={{ media: mediaData, reusableBlocks }}>
          <div
            className={`blog-content-wrapper
              font-montserrat text-[#000000]
              [&_p]:text-[16px] [&_p]:leading-[1.7] [&_p]:mb-2
              [&_ul]:pl-10 [&_ul]:mb-2 [&_ul]:list-disc [&_ul]:space-y-2
              [&_ol]:pl-10 [&_ol]:mb-2 [&_ol]:list-decimal [&_ol]:space-y-2
              [&_li]:text-[16px] [&_li]:leading-[1.7]
              [&_figure]:max-w-[94%] [&_figure]:md:max-w-full [&_figure]:mx-auto
              [&_figure_div]:md:rounded-3xl [&_figure_div]:rounded-2xl
              [&_figure_img]:max-h-[70vh] [&_figure_img]:md:max-h-none [&_figure_img]:object-cover [&_figure_img]:md:object-contain
              [&_h1]:text-[43.2px] [&_h1]:font-bold [&_h1]:leading-tight [&_h1]:mb-6 [&_h1]:mt-16
              [&_h2]:text-[26px] [&_h2]:font-bold [&_h2]:leading-tight [&_h2]:mb-6 [&_h2]:mt-12
              [&_h3]:text-[22px] [&_h3]:font-bold [&_h3]:leading-tight [&_h3]:mb-4 [&_h3]:mt-10
              [&_strong]:font-bold [&_em]:italic
              ${className}`}
          >
            <RichText data={content} converters={converters} />
          </div>
        </MediaContext.Provider>
      </LocaleContext.Provider>
    </ConvertersContext.Provider>
  );
});

// Re-export nested renderer and hooks for block authors
export { NestedBlogLexicalRenderer } from "./BlogLexicalRenderer/NestedRenderer";

export {
  useBlogContentData,
  useBlogLocale,
} from "./BlogLexicalRenderer/context";
