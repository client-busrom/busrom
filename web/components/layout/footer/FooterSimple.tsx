import Image from "next/image";
import Link from "next/link";
import { FooterApiData } from "./types";
import SocialIcon from "./SocialIcon";
import FooterBottom from "./FooterBottom";

interface Props {
  footerData: FooterApiData;
  locale: string;
  siteLogoUrl: string | null;
}

export default function FooterSimple({ footerData, locale, siteLogoUrl }: Props) {
  return (
    <footer
      className="relative bg-brand-secondary text-brand-text-inverse pt-12 pb-[40px]"
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
            <ul className="space-y-2 text-sm font-anaheim">
              {footerData.contact.email && (
                <li>
                  {footerData.contact.emailLabel && <span className="font-semibold">{footerData.contact.emailLabel}</span>}
                  <a href={`mailto:${footerData.contact.email}`} className="hover:text-brand-primary transition-colors">
                    {footerData.contact.email}
                  </a>
                </li>
              )}
              {footerData.contact.afterSales && (
                <li>
                  {footerData.contact.afterSalesLabel && <span className="font-semibold">{footerData.contact.afterSalesLabel}</span>}
                  <a href={`mailto:${footerData.contact.afterSales}`} className="hover:text-brand-primary transition-colors">
                    {footerData.contact.afterSales}
                  </a>
                </li>
              )}
              {footerData.contact.whatsapp && (
                <li>
                  {footerData.contact.whatsappLabel && <span className="font-semibold">{footerData.contact.whatsappLabel}</span>}
                  <a href={`https://wa.me/${footerData.contact.whatsapp.replace(/[^0-9]/g, '')}`} className="hover:text-brand-primary transition-colors">
                    {footerData.contact.whatsapp}
                  </a>
                </li>
              )}
              {footerData.contact.address && (
                <li>
                  {footerData.contact.addressLabel && <span className="font-semibold">{footerData.contact.addressLabel} </span>}
                  {footerData.contact.address}
                </li>
              )}
            </ul>
          </div>

          {/* 右侧：Official Notice */}
          <div className="pl-4">
            <h4 className="font-bold text-lg leading-loose font-anaheim">{footerData.notice.title}</h4>
            <ul className="text-sm leading-loose space-y-0 font-anaheim">
              {footerData.notice.lines.map((line, index) => (
                <li key={index} className="flex items-start">
                  <span className="rounded-full bg-current flex-shrink-0 w-1 h-1 -ml-4 mr-2.5 mt-[0.75em]"></span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="h-px bg-brand-text-inverse/30 my-6"></div>

        {/* 第二行：Navigation */}
        {footerData.navigationMenus?.length > 0 && (
          <div className="pb-6">
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
          </div>
        )}

        {/* 第三行：Logo + Social */}
        <FooterBottom footerData={footerData} siteLogoUrl={siteLogoUrl} />
      </div>
    </footer>
  );
}
