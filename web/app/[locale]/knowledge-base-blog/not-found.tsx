import { getPreloaderConfig } from "@/lib/api/preloader-config";
import { getNotFoundPageConfig } from "@/lib/api/not-found-pages";
import { NotFoundClient } from "../NotFoundClient";
import { defaultLocale } from "@/i18n.config";

export default async function NotFound() {
  const locale = defaultLocale; 
  
  const [config, notFoundConfig] = await Promise.all([
    getPreloaderConfig(),
    getNotFoundPageConfig(locale, "knowledge_base")
  ]);

  const customImages = notFoundConfig?.extractedImages?.length 
    ? notFoundConfig.extractedImages 
    : config?.images?.filter((item): item is NonNullable<typeof item> => item !== null).map((item) => item.src) || [];

  return (
    <NotFoundClient 
      preloaderImages={customImages} 
      title={notFoundConfig?.text}
      buttonText={notFoundConfig?.buttonText}
      buttonLink={notFoundConfig?.buttonLink}
    />
  );
}
