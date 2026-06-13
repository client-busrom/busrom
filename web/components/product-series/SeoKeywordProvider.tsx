'use client';

import React, { createContext, useContext, useRef } from 'react';
import type { KeywordDistribution } from '@/lib/api/seo-settings';

interface SeoContextValue {
  getImgAlt: () => string;
  getAriaLabel: () => string;
  getDataAttr: () => string;
  getAriaDesc: () => string;
  getSrOnly: () => string;
}

const SeoKeywordContext = createContext<SeoContextValue>({
  getImgAlt: () => '',
  getAriaLabel: () => '',
  getDataAttr: () => '',
  getAriaDesc: () => '',
  getSrOnly: () => '',
});

export interface SeoKeywordProviderProps {
  distribution?: KeywordDistribution;
  keywords?: string[]; // Legacy fallback
  fallback?: string;
  totalImages?: number; // Legacy fallback
  children: React.ReactNode;
}

export const SeoKeywordProvider = ({ distribution, keywords, fallback = '', totalImages = 30, children }: SeoKeywordProviderProps) => {
  const indices = useRef({ img: 0, aria: 0, data: 0, desc: 0, sr: 0 });

  const getChunkedKeyword = (list: string[] | undefined, refKey: keyof typeof indices.current, defaultVal: string = '', elementsCount: number = 30) => {
    if (!list || list.length === 0) return defaultVal;
    
    // Calculate how many keywords to pack into one element to ensure most of the list gets used
    const chunkSize = Math.max(1, Math.ceil(list.length / elementsCount));
    const start = (indices.current[refKey] * chunkSize) % list.length;
    const chunk = list.slice(start, start + chunkSize);
    
    indices.current[refKey]++;
    return chunk.join(', ');
  };

  const contextValue: SeoContextValue = {
    getImgAlt: () => {
      if (keywords && keywords.length > 0) return getChunkedKeyword(keywords, 'img', fallback, totalImages);
      return getChunkedKeyword(distribution?.imgAlts, 'img', fallback, totalImages);
    },
    getAriaLabel: () => getChunkedKeyword(distribution?.ariaLabels, 'aria', '', 20), // Assume ~20 buttons/links
    getDataAttr: () => getChunkedKeyword(distribution?.dataAttributes, 'data', '', 5), // Assume ~5 layout elements
    getAriaDesc: () => getChunkedKeyword(distribution?.ariaDescribedby, 'desc', '', 15),
    getSrOnly: () => getChunkedKeyword(distribution?.srOnlyLabels, 'sr', '', 10),
  };

  return <SeoKeywordContext.Provider value={contextValue}>{children}</SeoKeywordContext.Provider>;
};

export const useSeoAlt = () => {
  const ctx = useContext(SeoKeywordContext);
  return ctx.getImgAlt;
};

export const useSeoAriaLabel = () => useContext(SeoKeywordContext).getAriaLabel();
export const useSeoDataAttr = () => useContext(SeoKeywordContext).getDataAttr();
export const useSeoAriaDesc = () => useContext(SeoKeywordContext).getAriaDesc();
export const useSeoSrOnly = () => useContext(SeoKeywordContext).getSrOnly();
