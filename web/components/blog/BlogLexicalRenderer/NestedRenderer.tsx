// @ts-nocheck
"use client";

import React from "react";
import { RichText } from "@payloadcms/richtext-lexical/react";
import { useBlogConverters } from "./context";

export function NestedBlogLexicalRenderer({ content }: { content: any }) {
  const converters = useBlogConverters();

  if (!converters) {
    return null;
  }

  return (
    <div className="nested-lexical-content">
      <RichText data={content} converters={converters} />
    </div>
  );
}
