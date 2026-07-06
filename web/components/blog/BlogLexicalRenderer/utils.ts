// @ts-nocheck
"use client";

/**
 * Helper to get CMS URL for fetching media / related data.
 */
export const getCmsUrl = () => {
  if (typeof window !== "undefined") {
    // Client-side: use public CMS URL
    return process.env.NEXT_PUBLIC_CMS_URL || "https://cms.busromhouse.com";
  }
  // Server-side: use internal URL if available
  return (
    process.env.CMS_URL ||
    process.env.NEXT_PUBLIC_CMS_URL ||
    "https://cms.busromhouse.com"
  );
};

/**
 * Filter out undefined values from a converter object.
 */
export const filterUndefined = (obj: any) => {
  if (!obj) return {};
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== undefined),
  );
};
