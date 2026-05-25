import type { Locale } from "@/i18n.config";

const PAYLOAD_URL = process.env.CMS_GRAPHQL_URL
  ? process.env.CMS_GRAPHQL_URL.replace("/api/graphql", "")
  : process.env.CMS_URL || process.env.NEXT_PUBLIC_CMS_URL || "http://localhost:3002";

import { convertToCDNUrl } from "@/lib/cdn-url";

export interface NotFoundPageConfig {
  id: string;
  pageType: "other" | "product_details" | "product_links" | "knowledge_base";
  text: string;
  buttonText: string;
  buttonLink: string;
  mediaSelection: "manual" | "random";
  manualMedia?: any[]; // Relationship to media
  applications?: any[]; // Applications populated by depth
  extractedImages?: string[]; // Added property for convenient use
}

export async function getNotFoundPageConfig(
  locale: Locale,
  pageType: NotFoundPageConfig["pageType"]
): Promise<NotFoundPageConfig | null> {
  try {
    const res = await fetch(
      `${PAYLOAD_URL}/api/not-found-pages?locale=${locale}&where[pageType][equals]=${pageType}&depth=3`,
      {
        next: { revalidate: 60 },
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (data.docs && data.docs.length > 0) {
      const config = data.docs[0] as NotFoundPageConfig;
      const extractedImages: string[] = [];

      if (config.mediaSelection === "manual" && config.manualMedia) {
        config.manualMedia.forEach((img: any) => {
          if (img?.url) extractedImages.push(convertToCDNUrl(img.url));
        });
      } else if (config.mediaSelection === "random" && config.applications) {
        // Extract images from applications
        config.applications.forEach((app: any) => {
          if (app.sceneGallery && Array.isArray(app.sceneGallery)) {
            app.sceneGallery.forEach((scene: any) => {
              if (scene.images && Array.isArray(scene.images)) {
                scene.images.forEach((img: any) => {
                  if (img?.url) extractedImages.push(convertToCDNUrl(img.url));
                });
              }
            });
          }
        });
      }

      config.extractedImages = extractedImages;
      return config;
    }
    return null;
  } catch (err) {
    console.error(`Error fetching not-found-pages config for ${pageType}:`, err);
    return null;
  }
}
