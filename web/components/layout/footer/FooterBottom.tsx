import React from "react";
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

  // 过滤出有效的法律链接（同时有 label 和 url）
  const validLegalLinks = footerData?.legalLinks?.filter((link: any) => link && link.label && link.url) || [];

  if (centered) {
    // 首页版本：垂直居中结构
    return (
      <div className="relative text-center text-white/80 text-sm mb-8 pt-8 font-anaheim flex flex-col sm:flex-row justify-center items-center gap-y-2 sm:gap-y-0 sm:gap-x-3 leading-[1.8]">
        <span>{footerData?.copyrightText ? footerData.copyrightText : `© ${currentYear} Busrom. All rights reserved.`}</span>
        {validLegalLinks.length > 0 && (
          <div className="flex flex-wrap justify-center items-center gap-x-3">
            <span className="text-white/40 hidden sm:inline">•</span>
            {validLegalLinks.map((link: any, idx: number) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span className="text-white/40">•</span>}
                <a href={link.url} target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-brand-primary transition-colors">
                  {link.label}
                </a>
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    );
  }

  // 普通页版本：Logo + 版权（上下结构，居中）
  return (
    <div className="pt-16 flex flex-col items-center gap-[20px]">
      <Image
        src={siteLogoUrl || "/Busrom1.svg"}
        alt="Busrom Logo"
        width={116}
        height={91}
        className="object-contain"
        style={{ width: "120px", height: "auto" }}
        unoptimized={!!siteLogoUrl}
      />
      <div className="text-brand-text-inverse/60 text-sm font-anaheim flex flex-col sm:flex-row justify-center items-center gap-y-2 sm:gap-y-0 sm:gap-x-3 leading-[1.8]">
        <span>{footerData?.copyrightText ? footerData.copyrightText : `© ${currentYear} Busrom. All rights reserved.`}</span>
        {validLegalLinks.length > 0 && (
          <div className="flex flex-wrap justify-center items-center gap-x-3">
            <span className="text-brand-text-inverse/40 hidden sm:inline">•</span>
            {validLegalLinks.map((link: any, idx: number) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span className="text-brand-text-inverse/40">•</span>}
                <a href={link.url} target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-brand-primary transition-colors">
                  {link.label}
                </a>
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
