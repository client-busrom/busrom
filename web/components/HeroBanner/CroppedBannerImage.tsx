import { FC } from "react";
import { getObjectPosition, getCropStyles, getCropImageUrl } from "@/lib/utils";
import { ServerImage } from "@/components/ui/ServerImage";

interface CroppedBannerImageProps {
  image: any;
  cropData: any;
  alt: string;
  className?: string;
  priority?: boolean;
}

/**
 * 通用的 HeroBanner 裁切图片组件
 * 支持后端传入的 imageCropDataList 裁切数据，并提供 ServerImage 作为兜底
 */
export const CroppedBannerImage: FC<CroppedBannerImageProps> = ({
  image,
  cropData,
  alt,
  className = "",
  priority = false,
}) => {
  const cropStyles = getCropStyles(cropData);

  if (cropStyles && cropData && cropData.croppedAreaPixels) {
    return (
      <div
        className={`absolute inset-0 w-full h-full overflow-hidden ${className}`}
        style={{
          ...cropStyles.container,
          width: "100%",
          height: "100%",
        }}
      >
        <img
          src={getCropImageUrl(image, cropData)}
          alt={alt}
          style={{
            ...cropStyles.image,
            // 背景图需要 cover 整个容器，所以用百分比缩放
            width: `${(cropData.variantWidth / cropData.croppedAreaPixels.width) * 100}%`,
            height: `${(cropData.variantHeight / cropData.croppedAreaPixels.height) * 100}%`,
            left: `${(-cropData.croppedAreaPixels.x / cropData.croppedAreaPixels.width) * 100}%`,
            top: `${(-cropData.croppedAreaPixels.y / cropData.croppedAreaPixels.height) * 100}%`,
            maxWidth: "none", // 确保图片可以超出容器进行裁切
          }}
        />
      </div>
    );
  }

  // 兜底方案：使用普通的 ServerImage 渲染，支持焦点位置
  return (
    <ServerImage
      image={image}
      alt={alt}
      size="large"
      fill
      className={`absolute inset-0 w-full h-full object-cover ${className}`}
      objectPosition={getObjectPosition(image)}
      priority={priority}
    />
  );
};
