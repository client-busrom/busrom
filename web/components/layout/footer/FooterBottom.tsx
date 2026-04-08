import Image from "next/image";
import SocialIcon from "./SocialIcon";
import { FooterApiData } from "./types";

interface Props {
  footerData: FooterApiData | null;
  siteLogoUrl: string | null;
  centered?: boolean;
}

export default function FooterBottom({ footerData, siteLogoUrl, centered = false }: Props) {
  const currentYear = new Date().getFullYear();

  if (centered) {
    // 首页版本：垂直居中结构
    return (
      <div className="relative text-center text-white/80 text-sm mb-8 pt-8">
        © {currentYear} Busrom. All rights reserved.
      </div>
    );
  }

  // 普通页版本：Logo + 版权（居中） | 社交媒体链接（右侧）
  return (
    <div className="pt-16 flex flex-col md:flex-row justify-between items-center gap-4">
      {/* 左侧占位 - 保持社交链接右对齐 */}
      <div className="hidden md:block md:flex-1"></div>

      {/* 中间：Logo + 版权（上下结构，居中） */}
      <div className="flex flex-col items-center gap-[20px]">
        <Image
          src={siteLogoUrl || "/Busrom1.svg"}
          alt="Busrom Logo"
          width={60}
          height={18}
          className="object-contain"
          style={{ width: "auto", height: "auto" }}
          unoptimized={!!siteLogoUrl}
        />
        {footerData?.copyrightText && (
          <span className="text-brand-text-inverse/60 text-sm font-anaheim">
            {footerData.copyrightText}
          </span>
        )}
      </div>

      {/* 右侧：社交媒体链接 */}
      <div className="md:flex-1 flex justify-end">
        {footerData?.socialLinks && footerData.socialLinks.length > 0 && (
          <div className="flex items-center gap-4">
            {footerData.socialLinks.map((social, index) => (
              <a
                key={index}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-text-inverse/70 hover:text-brand-primary transition-colors"
                title={social.platform}
              >
                <SocialIcon platform={social.platform} />
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
