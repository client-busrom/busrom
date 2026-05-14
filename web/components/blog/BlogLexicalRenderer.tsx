"use client";

import { LexicalRenderer } from "@/components/lexical/LexicalRenderer";

interface BlogLexicalRendererProps {
  content: any;
  mediaData?: any;
}

/**
 * Specialized renderer for Blog Posts
 * 
 * Standardizes typography across all blog templates:
 * - Font: Montserrat (via global class or inherited)
 * - Color: #000000
 * - Body Size: 16px
 * - Line Height: 1.7 (27.2px)
 * - Paragraph Spacing: 16px (mb-4)
 * - List Item Spacing: 8px (mb-2 via space-y-2)
 */
export function BlogLexicalRenderer({ content, mediaData }: BlogLexicalRendererProps) {
  return (
    <div className="blog-content-wrapper 
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
    ">
      <LexicalRenderer content={content} mediaData={mediaData} />
    </div>
  );
}
