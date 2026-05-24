import { getPreloaderConfig } from "@/lib/api/preloader-config";
import { NotFoundClient } from "./NotFoundClient";

export default async function NotFound() {
  const config = await getPreloaderConfig();

  const preloaderImages =
    config?.images?.filter((item): item is NonNullable<typeof item> => item !== null).map((item) => item.src) || [];

  return <NotFoundClient preloaderImages={preloaderImages} />;
}
