import { getPreloaderConfig } from "@/lib/api/preloader-config";
import { NotFoundClient } from "./NotFoundClient";

export default async function NotFound() {
  const config = await getPreloaderConfig();

  // Extract image URLs, preferring smaller sizes if available
  const preloaderImages =
    config?.images?.map((item) => item.src).filter(Boolean) || [];

  return <NotFoundClient preloaderImages={preloaderImages} />;
}
