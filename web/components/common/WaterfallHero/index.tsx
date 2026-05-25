import { getWaterfallConfig } from "@/lib/api/waterfall-config";
import WaterfallHeroClient from "./WaterfallHeroClient";
import { convertToCDNUrl } from "@/lib/cdn-url";

interface WaterfallHeroWrapperProps {
  pageData: any;
  locale: string;
}

export default async function WaterfallHeroWrapper({ pageData, locale }: WaterfallHeroWrapperProps) {
  if (!pageData || !pageData.enableWaterfall) {
    return null;
  }

  // Fetch the configuration
  const config = await getWaterfallConfig(locale);

  // Extract images
  let images: string[] = [];

  if (pageData.waterfallImageMode === "manual" && pageData.waterfallMedia) {
    images = pageData.waterfallMedia
      .map((media: any) => {
        let variant = 'original';
        let url = media?.url;
        if (media?.sizes?.card?.url) { url = media.sizes.card.url; variant = 'card'; }
        else if (media?.sizes?.tablet?.url) { url = media.sizes.tablet.url; variant = 'tablet'; }
        else if (media?.sizes?.thumbnail?.url) { url = media.sizes.thumbnail.url; variant = 'thumbnail'; }

        if (url) {
          return convertToCDNUrl(url);
        }
        return null;
      })
      .filter(Boolean);
  } else if (pageData.waterfallImageMode === "randomFromCases" && pageData.waterfallApplications) {
    let selectedImages: string[] = [];
    let allOtherImages: string[] = [];

    // Keep apps in their original order as selected in the CMS
    const apps = pageData.waterfallApplications || [];
    
    apps.forEach((app: any) => {
      let appImages: string[] = [];
      if (app?.sceneGallery) {
        app.sceneGallery.forEach((scene: any) => {
          if (scene?.images) {
            scene.images.forEach((img: any) => {
              let variant = 'original';
              let url = img?.url;
              if (img?.sizes?.card?.url) { url = img.sizes.card.url; variant = 'card'; }
              else if (img?.sizes?.tablet?.url) { url = img.sizes.tablet.url; variant = 'tablet'; }
              else if (img?.sizes?.thumbnail?.url) { url = img.sizes.thumbnail.url; variant = 'thumbnail'; }

              if (url) {
                appImages.push(convertToCDNUrl(url)!);
              }
            });
          }
        });
      }
      
      if (appImages.length > 0) {
        // Shuffle this specific app's images
        const shuffledAppImages = appImages.sort(() => 0.5 - Math.random());
        // Try to pick exactly 1 image from this app
        if (selectedImages.length < 5) {
          selectedImages.push(shuffledAppImages[0]);
        }
        // Put all remaining images from this app into the fallback pool
        allOtherImages.push(...shuffledAppImages.slice(1));
      }
    });

    // If we picked less than 5 images (e.g. they only selected 3 apps), fill the rest randomly
    if (selectedImages.length < 5) {
      const needed = 5 - selectedImages.length;
      const shuffledOthers = allOtherImages.sort(() => 0.5 - Math.random());
      selectedImages.push(...shuffledOthers.slice(0, needed));
    }

    images = selectedImages;
  }

  // Ensure we have exactly 5 images or empty slots if less
  const finalImages = [...images, null, null, null, null, null].slice(0, 5);

  return (
    <WaterfallHeroClient
      config={config}
      images={finalImages}
      title={pageData.waterfallTitle}
      subtitle={pageData.waterfallSubtitle}
    />
  );
}
