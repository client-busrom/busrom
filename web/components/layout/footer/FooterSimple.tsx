import Image from "next/image";
import Link from "next/link";
import { FooterApiData } from "./types";
import SocialIcon from "./SocialIcon";
import FooterBottom from "./FooterBottom";
import { cn } from "@/lib/utils";

interface Props {
  footerData: FooterApiData;
  locale: string;
  siteLogoUrl: string | null;
}

export default function FooterSimple({
  footerData,
  locale,
  siteLogoUrl,
}: Props) {
  return (
    <footer
      className="relative bg-brand-secondary text-brand-text-inverse pt-12 pb-[1vw]"
      data-header-theme="dark"
    >
      <div className="container mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* 左侧：Contact Information */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/Busrom2.svg"
                alt="Busrom"
                width={120}
                height={32}
                className="object-contain"
                style={{ height: "auto" }}
              />
            </div>
            <ul className="text-sm font-anaheim space-y-0" style={{ lineHeight: 1.8 }}>
              {footerData.contact.email && (
                <li>
                  {footerData.contact.emailLabel && (
                    <span className="font-semibold">
                      {footerData.contact.emailLabel}
                    </span>
                  )}
                  <a
                    href={`mailto:${footerData.contact.email}`}
                    className="hover:text-brand-primary transition-colors"
                  >
                    {footerData.contact.email}
                  </a>
                </li>
              )}
              {footerData.contact.afterSales && (
                <li>
                  {footerData.contact.afterSalesLabel && (
                    <span className="font-semibold">
                      {footerData.contact.afterSalesLabel}
                    </span>
                  )}
                  <a
                    href={`mailto:${footerData.contact.afterSales}`}
                    className="hover:text-brand-primary transition-colors"
                  >
                    {footerData.contact.afterSales}
                  </a>
                </li>
              )}
              {footerData.contact.whatsapp && (
                <li>
                  {footerData.contact.whatsappLabel && (
                    <span className="font-semibold">
                      {footerData.contact.whatsappLabel}
                    </span>
                  )}
                  <a
                    href={`https://wa.me/${footerData.contact.whatsapp.replace(/[^0-9]/g, "")}`}
                    className="hover:text-brand-primary transition-colors"
                  >
                    {footerData.contact.whatsapp}
                  </a>
                </li>
              )}
              {footerData.contact.address && (
                <li>
                  {footerData.contact.addressLabel && (
                    <span className="font-semibold">
                      {footerData.contact.addressLabel}{" "}
                    </span>
                  )}
                  {footerData.contact.address}
                </li>
              )}
              {footerData.contact.workingHours && (
                <li>
                  {footerData.contact.workingHoursLabel && (
                    <span className="font-semibold">
                      {footerData.contact.workingHoursLabel}{" "}
                    </span>
                  )}
                  {footerData.contact.workingHours}
                </li>
              )}
            </ul>
          </div>

          {/* 右侧：Official Notice */}
          <div className="pl-4">
            <h4 className="font-bold text-lg leading-none font-anaheim pl-3 md:pl-4 pt-1 mb-4">
              {footerData.notice.title}
            </h4>
            <ul className="text-sm font-anaheim space-y-0" style={{ lineHeight: 1.8 }}>
              {footerData.notice.lines.map((line, index) => (
                <li key={index} className="flex items-start">
                  <span className="rounded-full bg-current flex-shrink-0 w-1 h-1 md:w-1.5 md:h-1.5 mr-2 md:mr-2.5 mt-[0.7em]"></span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="h-px bg-brand-text-inverse/30 my-6"></div>

        {/* 第二行：Navigation + Social */}
        <div className="pb-6 flex flex-col md:flex-row justify-between items-center gap-6">
          {footerData.navigationMenus?.length > 0 ? (
            <nav className="flex flex-wrap gap-6 md:gap-10">
              {footerData.navigationMenus.map((menu) => (
                <Link
                  key={menu.slug}
                  href={`/${locale}${menu.link}`}
                  className="text-sm font-anaheim font-semibold hover:text-brand-primary transition-colors"
                >
                  {menu.name}
                </Link>
              ))}
            </nav>
          ) : (
            <div></div>
          )}

          {/* 右侧：社交媒体链接 */}
          {footerData.socialLinks && footerData.socialLinks.length > 0 && (
            <div className="flex items-center gap-4">
              {footerData.socialLinks.map((social: any, index: number) => {
                // 原生品牌默认颜色映射
                const brandColors: Record<string, string> = {
                  facebook: "text-[#1877F2]",
                  instagram: "text-[#E4405F]",
                  twitter: "text-[#1DA1F2]",
                  linkedin: "text-[#0A66C2]",
                  youtube: "text-[#FF0000]",
                  tiktok: "text-white",
                  wechat: "text-[#07C160]",
                  whatsapp: "text-[#25D366]",
                };
                const colorClass = brandColors[social.platform.toLowerCase()] || "text-brand-text-inverse/70";

                return (
                  <a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "transition-all duration-300 hover:opacity-80 hover:scale-110",
                      colorClass
                    )}
                    title={social.platform}
                  >
                    <SocialIcon platform={social.platform} />
                  </a>
                );
              })}
            </div>
          )}
        </div>

        {/* 第三行：Logo + Copyright */}
        <FooterBottom footerData={footerData} siteLogoUrl={siteLogoUrl} />
      </div>
    </footer>
  );
}
