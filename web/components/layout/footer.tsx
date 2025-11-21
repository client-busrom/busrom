"use client";

import { useMemo } from "react";
import type { Locale } from "@/i18n.config";
import { getHomeContent } from "@/lib/content-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import Link from "next/link";

// 【已添加】导入 Label, Textarea, 和 cn
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Props = {
  locale: Locale;
  showForm?: boolean; // true表示首页（显示表单），false表示其他页面（显示四列布局）
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

export default function Footer({ locale, showForm = true }: Props) {
  const content = useMemo(() => getHomeContent(locale).footer, [locale]);

  if (showForm) {
    // 首页版本：显示表单
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
          {/* 使用 Flex 布局 + 垂直分隔线 */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">

            {/* 左侧：占 55% */}
            <div className="w-full md:w-[55%]">
              {/* Logo */}
              <div className="mb-8">
                <Image
                  src="/Busrom2.svg"
                  alt="Busrom Logo"
                  width={150}
                  height={40}
                  className="object-contain"
                />
              </div>

              {/* 联系信息 */}
              <ul className="space-y-2 mb-8 font-anaheim font-medium text-brand-text-inverse">
                <li>Email: {content.contact.email}</li>
                <li>After-sales: {content.contact.afterSales}</li>
                <li>WhatsApp: {content.contact.whatsapp}</li>
              </ul>

              {/* 官方声明 */}
              <div className="w-[80%] bg-brand-footer-emphasis-bg text-brand-footer-emphasis-text font-anaheim font-semibold p-4 rounded-lg">
                <h4 className="font-bold mb-2">{content.notice.title}</h4>
                <div className="text-xs space-y-2">
                  {content.notice.lines.map((line, index) => (
                    <p key={index}>{line}</p>
                  ))}
                </div>
              </div>
            </div>

            {/* 白色的垂直分隔线 */}
            <div className="hidden md:block w-px bg-white/50 h-64"></div>

            {/* 右侧：占 40% - 表单 */}
            <div className="w-full md:w-2/5 px-4 md:mt-0 mt-8">
              <h3 className="text-4xl font-bold mb-8 font-anaheim">{content.form.title}</h3>

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

  // 其他页面版本：隐藏表单，显示四列布局
  return (
    <footer
      className="relative bg-brand-secondary text-brand-text-inverse py-12"
      data-header-theme="dark"
    >
      <div className="container mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* 第一列：Contact Information */}
          <div>
            <h4 className="font-bold text-lg mb-4 font-anaheim">{content.contact.title}</h4>
            <ul className="space-y-2 text-sm font-anaheim">
              <li>
                <span className="font-semibold">{content.contact.emailLabel}:</span>
                <br />
                <a href={`mailto:${content.contact.email}`} className="hover:text-brand-primary transition-colors">
                  {content.contact.email}
                </a>
              </li>
              <li>
                <span className="font-semibold">{content.contact.afterSalesLabel}:</span>
                <br />
                <a href={`mailto:${content.contact.afterSales}`} className="hover:text-brand-primary transition-colors">
                  {content.contact.afterSales}
                </a>
              </li>
              <li>
                <span className="font-semibold">{content.contact.whatsappLabel}:</span>
                <br />
                <a href={`https://wa.me/${content.contact.whatsapp.replace(/[^0-9]/g, '')}`} className="hover:text-brand-primary transition-colors">
                  {content.contact.whatsapp}
                </a>
              </li>
            </ul>
          </div>

          {/* 第二列：Official Notice */}
          <div>
            <h4 className="font-bold text-lg mb-4 font-anaheim">{content.notice.title}</h4>
            <div className="text-xs space-y-2 font-anaheim">
              {content.notice.lines.map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
          </div>

          {/* 第三列：导航链接 */}
          <div>
            <h4 className="font-bold text-lg mb-4 font-anaheim">Navigation</h4>
            <ul className="space-y-2 text-sm font-anaheim">
              {content.column3Menus?.map((menu) => (
                <li key={menu.slug}>
                  <Link
                    href={`/${locale}${menu.link}`}
                    className="hover:text-brand-primary transition-colors"
                  >
                    {menu.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 第四列：导航链接 */}
          <div>
            <h4 className="font-bold text-lg mb-4 font-anaheim">Quick Links</h4>
            <ul className="space-y-2 text-sm font-anaheim">
              {content.column4Menus?.map((menu) => (
                <li key={menu.slug}>
                  <Link
                    href={`/${locale}${menu.link}`}
                    className="hover:text-brand-primary transition-colors"
                  >
                    {menu.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 版权 */}
        <div className="text-center text-brand-text-inverse/60 text-sm mt-12 pt-8 border-t border-brand-text-inverse/20">
          © {new Date().getFullYear()} Busrom. All rights reserved.
        </div>
      </div>
    </footer>
  );
}