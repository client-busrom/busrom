import Image from "next/image";
import { FooterApiData } from "./types";

interface Props {
  footerData: FooterApiData | null;
  content: any; // Fallback mock content
}

export default function FooterContact({ footerData, content }: Props) {
  return (
    <div className="w-full lg:w-[60%]">
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
      <ul
        className="font-anaheim font-medium text-brand-text-inverse text-sm md:text-base lg:text-lg"
        style={{ lineHeight: 1.8 }}
      >
        {(footerData?.contact?.email || content.contact.email) && (
          <li>
            {(footerData?.contact?.emailLabel ||
              content.contact.emailLabel) && (
              <span>
                {footerData?.contact?.emailLabel ||
                  content.contact.emailLabel}{" "}
              </span>
            )}
            {footerData?.contact?.email || content.contact.email}
          </li>
        )}
        {(footerData?.contact?.afterSales || content.contact.afterSales) && (
          <li>
            {(footerData?.contact?.afterSalesLabel ||
              content.contact.afterSalesLabel) && (
              <span>
                {footerData?.contact?.afterSalesLabel ||
                  content.contact.afterSalesLabel}{" "}
              </span>
            )}
            {footerData?.contact?.afterSales || content.contact.afterSales}
          </li>
        )}
        {(footerData?.contact?.whatsapp || content.contact.whatsapp) && (
          <li>
            {(footerData?.contact?.whatsappLabel ||
              content.contact.whatsappLabel) && (
              <span>
                {footerData?.contact?.whatsappLabel ||
                  content.contact.whatsappLabel}{" "}
              </span>
            )}
            {footerData?.contact?.whatsapp || content.contact.whatsapp}
          </li>
        )}
        {footerData?.contact?.address && (
          <li>
            {footerData.contact.addressLabel && (
              <span>{footerData.contact.addressLabel} </span>
            )}
            {footerData.contact.address}
          </li>
        )}
        {footerData?.contact?.workingHours && (
          <li>
            {footerData.contact.workingHoursLabel && (
              <span>{footerData.contact.workingHoursLabel} </span>
            )}
            {footerData.contact.workingHours}
          </li>
        )}
      </ul>

      {/* 官方声明 */}
      <div className="bg-brand-footer-emphasis-bg text-brand-footer-emphasis-text font-anaheim font-semibold px-6 py-4 md:px-8 md:py-5 lg:px-6 lg:py-6 xl:w-[90%] 2xl:w-[80%] my-6 md:my-8 lg:my-10">
        <h4
          className="font-bold text-base md:text-lg lg:text-xl mb-2 pl-3 md:pl-4"
          style={{ lineHeight: 1 }}
        >
          {footerData?.notice?.title || content.notice.title}
        </h4>
        <ul
          className="text-xs md:text-sm lg:text-base"
          style={{ lineHeight: 1.8 }}
        >
          {(footerData?.notice?.lines || content.notice.lines).map(
            (line: string, index: number) => (
              <li key={index} className="flex items-start">
                <span className="rounded-full bg-current flex-shrink-0 w-1 h-1 md:w-1.5 md:h-1.5 mr-2 md:mr-2.5 mt-[0.65em]"></span>
                <span>{line}</span>
              </li>
            ),
          )}
        </ul>
      </div>
    </div>
  );
}
