import type React from "react";
import { Suspense } from "react";
import localFont from "next/font/local";
import dynamic from "next/dynamic";
import "../globals.css";
import ScrollToTop from "@/components/ScrollToTop";
import ScrollToTopOnRouteChange from "@/components/ScrollToTopOnRouteChange";
import { isValidLocale, defaultLocale, locales } from "@/i18n.config";
import Header from "@/components/layout/header";
import ConditionalFooter from "@/components/layout/conditional-footer";
import { ClientLayoutWrapper } from "@/components/ClientLayoutWrapper";
import { getPreloaderConfig } from "@/lib/api/preloader-config";
import { getNavigation } from "@/lib/api/navigation";
import { GlobalScripts } from "@/components/GlobalScripts";
import { ScriptDebugger } from "@/components/ScriptDebugger";

// 延迟加载 LenisProvider（包含 GSAP），不阻塞首屏渲染
const LenisProvider = dynamic(
  () => import("@/components/lenis-provider").then(mod => ({ default: mod.LenisProvider })),
  { loading: () => null }
);

// --- 配置所有本地字体 ---
// 首屏关键字体 - 优先加载
const paytoneOne = localFont({
  src: "../../public/fonts/PaytoneOne-Regular.woff2",
  weight: "400",
  variable: "--font-paytone-one",
  display: "swap",
  preload: true, // Logo 字体 - 首屏必需
});

const anaheim = localFont({
  src: "../../public/fonts/Anaheim-Variable.woff2",
  weight: "400 800",
  variable: "--font-anaheim",
  display: "swap",
  preload: true, // 主要正文字体 - 首屏必需
});

const inter = localFont({
  src: "../../public/fonts/Inter-VariableFont.woff2",
  weight: "100 900",
  variable: "--font-inter",
  display: "swap",
  preload: false, // 延迟加载 - 343KB 太大，影响 Speed Index
});

// 非首屏字体 - 按需加载
const pollerOne = localFont({
  src: "../../public/fonts/PollerOne-Regular.woff2",
  weight: "400",
  variable: "--font-poller-one",
  display: "swap",
  preload: false,
});

const pavanam = localFont({
  src: "../../public/fonts/Pavanam-Regular.woff2",
  weight: "400",
  variable: "--font-pavanam",
  display: "swap",
  preload: false,
});

const phudu = localFont({
  src: "../../public/fonts/Phudu-Variable.woff2",
  weight: "400 900",
  variable: "--font-phudu",
  display: "swap",
  preload: false,
});

const montserrat = localFont({
  src: "../../public/fonts/Montserrat-VariableFont_wght.woff2",
  weight: "100 900",
  variable: "--font-montserrat",
  display: "swap",
  preload: false, // 非首屏字体，按需加载
});

const bebasNeue = localFont({
  src: "../../public/fonts/BebasNeue-Regular.woff2",
  weight: "400",
  variable: "--font-bebas-neue",
  display: "swap",
  preload: false,
});

const oswald = localFont({
  src: "../../public/fonts/Oswald-VariableFont_wght.woff2",
  weight: "100 900",
  variable: "--font-oswald",
  display: "swap",
  preload: false,
});

const jomhuria = localFont({
  src: "../../public/fonts/Jomhuria-Regular.ttf",
  weight: "400",
  variable: "--font-jomhuria",
  display: "swap",
  preload: false,
});

const josefinSans = localFont({
  src: "../../public/fonts/JosefinSans-VariableFont_wght.ttf",
  weight: "100 700",
  variable: "--font-josefin-sans",
  display: "swap",
  preload: false,
});

const joan = localFont({
  src: "../../public/fonts/Joan-Regular.woff",
  weight: "400",
  variable: "--font-joan",
  display: "swap",
  preload: false,
});

const lilitaOne = localFont({
  src: "../../public/fonts/LilitaOne-Regular.woff",
  weight: "400",
  variable: "--font-lilita-one",
  display: "swap",
  preload: false,
});

export function generateStaticParams() {
  // 动态生成所有支持的 locale 参数
  return locales.map(locale => ({ locale }));
}

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params;
  const validLocale = isValidLocale(locale) ? locale : defaultLocale;

  // 并行获取 preloader 配置和导航数据，避免串行等待
  const [preloaderConfig, initialNavigation] = await Promise.all([
    getPreloaderConfig(),
    getNavigation(validLocale),
  ]);

  return (
    <html
      lang={validLocale}
      className={`
      ${paytoneOne.variable}
      ${pollerOne.variable}
      ${pavanam.variable}
      ${phudu.variable}
      ${anaheim.variable}
      ${montserrat.variable}
      ${bebasNeue.variable}
      ${oswald.variable}
      ${inter.variable}
      ${jomhuria.variable}
      ${josefinSans.variable}
      ${joan.variable}
      ${lilitaOne.variable}
      font-sans
    `}
    >
      <head>
        {/* CDN 预连接 - 加速图片加载 */}
        <link rel="preconnect" href="https://d2kqew3hn5wphn.cloudfront.net" />
        <link rel="dns-prefetch" href="https://d2kqew3hn5wphn.cloudfront.net" />
        {/* 全局自定义脚本 - Header */}
        <Suspense fallback={null}>
          <GlobalScripts position="header" />
        </Suspense>
      </head>
      <body className={`font-sans overflow-x-hidden`}>
        {/* 全局自定义脚本 - Body Start */}
        <Suspense fallback={null}>
          <GlobalScripts position="body_start" />
        </Suspense>
        {/* 👇 使用 ClientLayoutWrapper 包裹你的所有内容 */}
        <ClientLayoutWrapper preloaderConfig={preloaderConfig}>
          <LenisProvider easingKey={"easeOutQuad"} />
          <div className="flex flex-col min-h-screen overflow-x-hidden">
            <Header locale={validLocale} initialNavigation={initialNavigation} />
            {children}
            <Suspense fallback={null}>
              <ScrollToTopOnRouteChange />
              <ScrollToTop />
            </Suspense>
            <ConditionalFooter locale={validLocale} />
          </div>
          {/* 全局自定义脚本 - Footer */}
          <Suspense fallback={null}>
            <GlobalScripts position="footer" />
          </Suspense>
          {/* Script Debugger - only visible in debug mode */}
          <Suspense fallback={null}>
            <ScriptDebugger />
          </Suspense>
        </ClientLayoutWrapper>
      </body>
    </html>
  );
}
