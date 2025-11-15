"use client";

import { usePathname } from "next/navigation";
import type { Locale } from "@/i18n.config";
import Footer from "./footer";

type Props = {
  locale: Locale;
};

export default function ConditionalFooter({ locale }: Props) {
  const pathname = usePathname();

  // 只在首页显示 Footer
  // 首页的路径格式: /en, /zh, /es, /fr, /de
  const isHomePage = pathname === `/${locale}` || pathname === "/";

  if (!isHomePage) {
    return null;
  }

  return <Footer locale={locale} />;
}
