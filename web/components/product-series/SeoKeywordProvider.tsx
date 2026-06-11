'use client';

import React, { createContext, useContext, useRef } from 'react';

const SeoKeywordContext = createContext<() => string>(() => '');

export interface SeoKeywordProviderProps {
  keywords: string[];
  fallback: string;
  startIndex?: number;
  children: React.ReactNode;
}

/**
 * A Context Provider that distributes an array of SEO keywords sequentially.
 * Each time `useSeoAlt()` is called, it returns the next keyword in the array.
 * If the array is empty, it returns the fallback string.
 */
export const SeoKeywordProvider = ({ keywords, fallback, startIndex = 0, children }: SeoKeywordProviderProps) => {
  const index = useRef(startIndex);
  
  const getAlt = () => {
    if (!keywords || keywords.length === 0) return fallback;
    const word = keywords[index.current % keywords.length];
    index.current++;
    return word;
  };

  return <SeoKeywordContext.Provider value={getAlt}>{children}</SeoKeywordContext.Provider>;
};

/**
 * Hook to get the next SEO keyword for use as an image alt attribute.
 * Must be used within a <SeoKeywordProvider>.
 */
export const useSeoAlt = () => {
  return useContext(SeoKeywordContext);
};
