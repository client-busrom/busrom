// @ts-nocheck
"use client";

import React from "react";
import { NestedBlogLexicalRenderer } from "@/components/blog/BlogLexicalRenderer/NestedRenderer";

export function TwoColumnsBlock({ node }: { node: any }) {
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
        {leftColumn && <NestedBlogLexicalRenderer content={leftColumn} />}
      </div>
      <div className="space-y-4">
        {rightColumn && <NestedBlogLexicalRenderer content={rightColumn} />}
      </div>
    </div>
  );
}

/**
 * Three Columns Layout Block
 */
export function ThreeColumnsBlock({ node }: { node: any }) {
  const { leftColumn, centerColumn, rightColumn, gap, columnRatio } =
    node.data || node.fields || {};

  const gapClass = {
    small: "gap-4",
    normal: "gap-8",
    large: "gap-12",
  }[gap || "normal"];

  const ratioClass = {
    "1:1:1": "md:grid-cols-3",
    "2:1:1": "md:grid-cols-[2fr_1fr_1fr]",
    "1:2:1": "md:grid-cols-[1fr_2fr_1fr]",
    "1:1:2": "md:grid-cols-[1fr_1fr_2fr]",
  }[columnRatio || "1:1:1"];

  return (
    <div className={`grid grid-cols-1 ${ratioClass} my-8 ${gapClass}`}>
      <div className="space-y-4">
        {leftColumn && <NestedBlogLexicalRenderer content={leftColumn} />}
      </div>
      <div className="space-y-4">
        {centerColumn && <NestedBlogLexicalRenderer content={centerColumn} />}
      </div>
      <div className="space-y-4">
        {rightColumn && <NestedBlogLexicalRenderer content={rightColumn} />}
      </div>
    </div>
  );
}

/**
 * Container Block
 *
 * Wraps nested rich text with configurable max-width, padding, background,
 * border and shadow.
 */
export function ContainerBlock({ node }: { node: any }) {
  const { content, maxWidth, padding, backgroundColor, border, shadow } =
    node.data || node.fields || {};

  const maxWidthClass = {
    small: "max-w-[640px]",
    medium: "max-w-[768px]",
    large: "max-w-[1024px]",
    xlarge: "max-w-[1280px]",
    full: "max-w-none",
  }[maxWidth || "medium"];

  const paddingClass = {
    none: "p-0",
    small: "p-4",
    normal: "p-6 md:p-8",
    large: "p-8 md:p-12",
  }[padding || "normal"];

  const backgroundStyles: Record<string, string> = {
    none: "transparent",
    "light-gray": "#f3f4f6",
    white: "#ffffff",
    primary: "#F6F4ED",
    secondary: "#756F3F",
  };

  return (
    <div className="my-8">
      <div
        className={`mx-auto ${maxWidthClass} ${paddingClass} ${border ? "border border-brand-dark-olive/20" : ""} ${shadow ? "shadow-lg" : ""} rounded-2xl`}
        style={{
          backgroundColor: backgroundStyles[backgroundColor || "none"],
        }}
      >
        {content && <NestedBlogLexicalRenderer content={content} />}
      </div>
    </div>
  );
}

/**
 * Sidebar Layout Block
 */
export function SidebarBlock({ node }: { node: any }) {
  const {
    mainContent,
    sidebarContent,
    sidebarPosition,
    sidebarWidth,
    gap,
    sidebarStyle,
  } = node.data || node.fields || {};

  const isLeft = sidebarPosition === "left";

  const gapClass = {
    small: "gap-4",
    normal: "gap-8",
    large: "gap-12",
  }[gap || "normal"];

  const widthClass = {
    small: "md:basis-1/4",
    medium: "md:basis-1/3",
    large: "md:basis-[40%]",
  }[sidebarWidth || "medium"];

  const styleClasses: Record<string, string> = {
    default: "",
    bordered: "border border-brand-dark-olive/20 rounded-2xl p-6",
    background: "bg-brand-main rounded-2xl p-6",
    card: "bg-white border border-brand-dark-olive/10 rounded-2xl p-6 shadow-md",
  };

  return (
    <div
      className={`flex flex-col ${isLeft ? "md:flex-row-reverse" : "md:flex-row"} ${gapClass} my-8`}
    >
      <div className="flex-1 min-w-0 space-y-4">
        {mainContent && <NestedBlogLexicalRenderer content={mainContent} />}
      </div>
      <aside
        className={`w-full ${widthClass} shrink-0 space-y-4 ${styleClasses[sidebarStyle || "default"]}`}
      >
        {sidebarContent && (
          <NestedBlogLexicalRenderer content={sidebarContent} />
        )}
      </aside>
    </div>
  );
}

/**
 * Fluid Layout Block
 *
 * Supports two modes:
 * 1. sideBySide: Traditional flex columns
 * 2. float: True CSS float wrapping
 */
export function FluidLayoutBlock({ node }: { node: any }) {
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
            <NestedBlogLexicalRenderer content={content} />
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
          <NestedBlogLexicalRenderer content={content} />
        </div>
      )}
    </div>
  );
}
