"use client";

import { usePathname } from "next/navigation";
import type { Locale } from "@/i18n.config";
import Footer from "./footer";

type Props = {
  locale: Locale;
};

export default function ConditionalFooter({ locale }: Props) {
  const pathname = usePathname();

  // 判断是否是首页
  // 首页的路径格式: /en, /zh, /es, /fr, /de
  const isHomePage = pathname === `/${locale}` || pathname === "/";

  // 首页显示表单版Footer，其他页面显示四列布局版Footer
  return <Footer locale={locale} showForm={isHomePage} />;
}
