// @ts-nocheck
"use client";

import React from "react";
import type { Locale } from "@/i18n.config";

/**
 * Media & Block Context for sharing pre-fetched data
 */
export const MediaContext = React.createContext<{
  media?: Record<string, any>;
  reusableBlocks?: Record<string, any>;
}>({ media: {}, reusableBlocks: {} });

export const useBlogContentData = () => React.useContext(MediaContext);

/**
 * Locale Context
 *
 * Passed down from the blog template so that blocks like FormBlock can fetch
 * localized config / labels without prop drilling through every converter.
 */
export const LocaleContext = React.createContext<Locale>("en");

export const useBlogLocale = () => React.useContext(LocaleContext);

/**
 * Converters Context
 *
 * Holds the fully merged converter map so that nested renderers can
 * recursively render with the same converters.
 */
export const ConvertersContext = React.createContext<any>(null);

export const useBlogConverters = () => React.useContext(ConvertersContext);
