import Image from "next/image";
import { FooterApiData } from "./types";

interface Props {
  footerData: FooterApiData | null;
  content: any; // Fallback mock content
}

export default function FooterContact({ footerData, content }: Props) {
  return (
    <div className="w-full lg:w-[55%]">
      {/* Logo */}
      <div className="mb-4 lg:mb-6">
        <Image
          src="/Busrom2.svg"
          alt="Busrom Logo"
          width={345}
          height={90}
          className="object-contain w-[140px] lg:w-[160px] xl:w-[180px]"
          style={{ height: "auto" }}
        />
      </div>

      {/* 联系信息 */}
      <ul className="font-anaheim font-medium text-brand-text-inverse text-sm md:text-base lg:text-lg space-y-0.5 md:space-y-1 leading-relaxed mb-4 md:mb-6">
        {(footerData?.contact?.email || content.contact.email) && (
          <li>
            {(footerData?.contact?.emailLabel || content.contact.emailLabel) && (
              <span>{footerData?.contact?.emailLabel || content.contact.emailLabel} </span>
            )}
            {footerData?.contact?.email || content.contact.email}
          </li>
        )}
        {(footerData?.contact?.afterSales || content.contact.afterSales) && (
          <li>
            {(footerData?.contact?.afterSalesLabel || content.contact.afterSalesLabel) && (
              <span>{footerData?.contact?.afterSalesLabel || content.contact.afterSalesLabel} </span>
            )}
            {footerData?.contact?.afterSales || content.contact.afterSales}
          </li>
        )}
        {(footerData?.contact?.whatsapp || content.contact.whatsapp) && (
          <li>
            {(footerData?.contact?.whatsappLabel || content.contact.whatsappLabel) && (
              <span>{footerData?.contact?.whatsappLabel || content.contact.whatsappLabel} </span>
            )}
            {footerData?.contact?.whatsapp || content.contact.whatsapp}
          </li>
        )}
        {(footerData?.contact?.address) && (
          <li>
            {footerData.contact.addressLabel && <span>{footerData.contact.addressLabel} </span>}
            {footerData.contact.address}
          </li>
        )}
        {(footerData?.contact?.workingHours) && (
          <li>
            {footerData.contact.workingHoursLabel && <span>{footerData.contact.workingHoursLabel} </span>}
            {footerData.contact.workingHours}
          </li>
        )}
      </ul>

      {/* 官方声明 */}
      <div className="bg-brand-footer-emphasis-bg text-brand-footer-emphasis-text font-anaheim font-semibold p-3 md:p-4 pl-6 md:pl-8">
        <h4 className="font-bold text-base md:text-lg lg:text-xl leading-loose">
          {footerData?.notice?.title || content.notice.title}
        </h4>
        <ul className="text-xs md:text-sm lg:text-base leading-loose space-y-0">
          {(footerData?.notice?.lines || content.notice.lines).map((line: string, index: number) => (
            <li key={index} className="flex items-start">
              <span className="rounded-full bg-current flex-shrink-0 w-1 h-1 md:w-1.5 md:h-1.5 -ml-3 md:-ml-4 mr-2 md:mr-2.5 mt-[0.75em]"></span>
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
