import type React from "react";
import type { Metadata } from "next";
import { Suspense } from "react";
import localFont from "next/font/local";
import { Fredericka_the_Great, Amiri, Black_Han_Sans, Berkshire_Swash, Cherry_Bomb_One, Amarante, Quicksand, Lemon, Lobster, Katibeh } from "next/font/google";
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
import NextTopLoader from "nextjs-toploader";
import { GlobalScripts } from "@/components/GlobalScripts";
import { ScriptDebugger } from "@/components/ScriptDebugger";
import { OrganizationSchema } from "@/components/seo/OrganizationSchema";
import { getSiteConfig, getMediaUrl } from "@/lib/api/site-config";

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

const kaushanScript = localFont({
  src: "../../public/fonts/KaushanScript-Regular.ttf",
  weight: "400",
  variable: "--font-kaushan-script",
  display: "swap",
  preload: false,
});

const moul = localFont({
  src: "../../public/fonts/Moul-Regular.ttf",
  weight: "400",
  variable: "--font-moul",
  display: "swap",
  preload: false,
});

const orbitron = localFont({
  src: "../../public/fonts/Orbitron-Medium.ttf",
  weight: "500",
  variable: "--font-orbitron",
  display: "swap",
  preload: false,
});

const frederickaTheGreat = Fredericka_the_Great({
  weight: "400",
  variable: "--font-fredericka",
  display: "swap",
  subsets: ["latin"],
  preload: false,
});

const amiri = Amiri({
  weight: "400",
  variable: "--font-amiri",
  display: "swap",
  subsets: ["arabic", "latin"],
  preload: false,
});

const blackHanSans = Black_Han_Sans({
  weight: "400",
  variable: "--font-black-han-sans",
  display: "swap",
  subsets: ["latin"],
  preload: false,
});

const berkshireSwash = Berkshire_Swash({
  weight: "400",
  variable: "--font-berkshire",
  display: "swap",
  subsets: ["latin"],
  preload: false,
});

const cherryBomb = Cherry_Bomb_One({
  weight: "400",
  variable: "--font-cherry-bomb",
  display: "swap",
  subsets: ["latin"],
  preload: false,
});

const amarante = Amarante({
  weight: "400",
  variable: "--font-amarante",
  display: "swap",
  subsets: ["latin"],
  preload: true,
});

const lemon = Lemon({
  weight: "400",
  variable: "--font-lemon",
  display: "swap",
  subsets: ["latin"],
  preload: false,
});

const quicksand = Quicksand({
  weight: ["400", "500", "600", "700"],
  variable: "--font-quicksand",
  display: "swap",
  subsets: ["latin"],
  preload: false,
});

const lobster = Lobster({
  weight: "400",
  variable: "--font-lobster",
  display: "swap",
  subsets: ["latin"],
  preload: false,
});

const katibeh = Katibeh({
  weight: "400",
  variable: "--font-katibeh",
  display: "swap",
  subsets: ["latin"],
  preload: false,
});

export function generateStaticParams() {
  // 动态生成所有支持的 locale 参数
  return locales.map(locale => ({ locale }));
}

/**
 * Generate dynamic metadata including favicon from CMS
 */
export async function generateMetadata(): Promise<Metadata> {
  const siteConfig = await getSiteConfig()
  const faviconUrl = getMediaUrl(siteConfig.favicon)
  const logoUrl = getMediaUrl(siteConfig.logo)

  // Use CMS favicon or fallback to local favicon-gold-b.svg
  const finalFaviconUrl = faviconUrl || '/favicon-gold-b.svg'

  const icons: Metadata['icons'] = {
    icon: [
      // Standard .ico for broad compatibility (search engines, legacy browsers)
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
      // SVG for modern browsers (sharp at any size)
      { url: finalFaviconUrl, type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.ico',
    apple: finalFaviconUrl,
  }

  return {
    icons,
    openGraph: {
      ...(logoUrl && { images: [{ url: logoUrl }] }),
    },
  }
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
      ${kaushanScript.variable}
      ${moul.variable}
      ${orbitron.variable}
      ${frederickaTheGreat.variable}
      ${amiri.variable}
      ${blackHanSans.variable}
      ${berkshireSwash.variable}
      ${cherryBomb.variable}
      ${amarante.variable}
      ${quicksand.variable}
      ${lemon.variable}
      ${lobster.variable}
      ${katibeh.variable}
      font-sans
    `}
    >
      <head>
        {/* CDN 预连接 - 加速图片加载 */}
        <link rel="preconnect" href="https://cdn.busromhouse.com" />
        <link rel="dns-prefetch" href="https://cdn.busromhouse.com" />
        <link rel="preconnect" href="https://d2kqew3hn5wphn.cloudfront.net" />
        <link rel="dns-prefetch" href="https://d2kqew3hn5wphn.cloudfront.net" />
        {/* Organization Schema for Google Search logo */}
        <Suspense fallback={null}>
          <OrganizationSchema locale={validLocale} />
        </Suspense>
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
          <NextTopLoader color="#D58A00" showSpinner={false} height={3} shadow="0 0 10px #D58A00,0 0 5px #D58A00" />
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
