"use client";

import { useMemo } from "react";
import type { Locale } from "@/i18n.config";
import { getHomeContent } from "@/lib/content-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";

// 【已添加】导入 Label, Textarea, 和 cn
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Props = {
  locale: Locale;
};

const formInputClasses = `
  mt-1 block w-full bg-transparent text-brand-form-input-text font-anaheim font-semibold
  placeholder:text-brand-text-inverse
  border-0 rounded-none border-b border-[#56511C]
  focus:outline-none focus:ring-0 focus:border-primary
`;

const formButtonClasses = `
  w-1/3 rounded-full bg-brand-footer-button-bg
  text-brand-footer-button-text font-anaheim font-semibold
  hover:bg-brand-footer-button-bg/90 pt-2 pb-2 mt-8
`;
// ---

export default function Footer({ locale }: Props) {
  const content = useMemo(() => getHomeContent(locale).footer, [locale]);

  return (
    <footer 
      className="
        relative bg-gray-900 text-white min-h-[100vh]
        flex flex-col justify-end
      "
      data-header-theme="transparent"
    >
      {/* 背景图片 */}
      <Image
        src={"/BusromFooterBg.png"}
        alt={"FooterBg"}
        fill
        sizes="100vw"
        className="object-cover z-0"
      />

      {/* 卡片容器 (自定义底部距离) */}
      <div 
        className="
          relative z-10 bg-brand-secondary rounded-lg p-16 w-[80%]
          mx-auto mb-16 mt-8
        "
      >
        {/* 【已修改】使用 Flex 布局 + 垂直分隔线 */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          
          {/* 【已修改】左侧：占 60% (3/5) */}
          <div className="w-full md:w-[55%]">
            {/* Replace h3 with Image component */}
            <div className="mb-8"> {/* Keep the bottom margin */}
              <Image
                src="/Busrom2.svg" // Make sure this path is correct (relative to /public)
                alt="Busrom Logo"  // Use relevant alt text
                width={150}        // Adjust width as needed
                height={40}         // Adjust height as needed
                className="object-contain" // Use contain for SVGs
              />
            </div>

            {/* Rest of the content remains the same */}
            <ul className="space-y-2 mb-8 font-anaheim font-medium text-brand-text-inverse">
              <li>Email: {content.contact.email}</li>
              <li>After-sales: {content.contact.afterSales}</li>
              <li>WhatsApp: {content.contact.whatsapp}</li>
            </ul>

            <div className="w-[80%] bg-brand-footer-emphasis-bg text-brand-footer-emphasis-text font-anaheim font-semibold p-4 rounded-lg">
              <h4 className="font-bold mb-2">{content.notice.title}</h4>
              <div className="text-xs space-y-2">
                {content.notice.lines.map((line, index) => (
                  <p key={index}>{line}</p>
                ))}
              </div>
            </div>
          </div>

          {/* 【已添加】白色的垂直分隔线 */}
          <div className="hidden md:block w-px bg-white/50 h-64"></div>

          {/* 【已修改】右侧：占 40% (2/5) */}
          <div className="w-full md:w-2/5 px-4 md:mt-0 mt-8">
            <h3 className="text-4xl font-bold mb-8 font-anaheim font-bold">{content.form.title}</h3>
            
            <form className="space-y-4">
              
              {/* Name */}
              <div>
                <Input 
                  type="text" 
                  id="footer-name" 
                  placeholder={content.form.placeholders.name}
                  className={formInputClasses} 
                />
              </div>

              {/* Email */}
              <div>
                <Input 
                  type="email" 
                  id="footer-email" 
                  placeholder={content.form.placeholders.email}
                  className={formInputClasses} 
                />
              </div>

              {/* Message */}
              <div>
                <Textarea
                  id="footer-message"
                  placeholder={content.form.placeholders.message}
                  className={cn(formInputClasses, "min-h-[40px]")} 
                />
              </div>

              {/* Submit Button */}
              <div className="mt-16">
                <Button type="submit" className={formButtonClasses}>
                  {content.form.buttonText}
                </Button>
              </div>
              
            </form>
          </div>
        </div>
      </div>
        {/* 版权 */}
        <div className="relative text-center text-white/80 text-sm mb-8 pt-8">
          © {new Date().getFullYear()} Busrom. All rights reserved.
        </div>
    </footer>
  );
}