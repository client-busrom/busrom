import type React from "react";
import type { Metadata } from "next";
import { Suspense } from "react";
import localFont from "next/font/local";
import { Agbalumo, Fredericka_the_Great, Amiri, Black_Han_Sans, Berkshire_Swash, Cherry_Bomb_One, Amarante, Quicksand, Lemon, Lobster, Katibeh, Prata, Lexend_Deca, Anton, Abhaya_Libre, Tenor_Sans, Kavivanar } from "next/font/google";
import dynamic from "next/dynamic";
import "../globals.css";
import ScrollToTop from "@/components/ScrollToTop";
import ScrollToTopOnRouteChange from "@/components/ScrollToTopOnRouteChange";
import { isValidLocale, defaultLocale, locales } from "@/i18n.config";
import Header from "@/components/layout/header";
import ConditionalFooter from "@/components/layout/conditional-footer";
import { ClientLayoutWrapper } from "@/components/ClientLayoutWrapper";
import { getPreloaderConfig } from "@/lib/api/preloader-config";
import { headers } from "next/headers";
import { getNavigation } from "@/lib/api/navigation";
import NextTopLoader from "nextjs-toploader";
import { GlobalScripts } from "@/components/GlobalScripts";
import { ScriptDebugger } from "@/components/ScriptDebugger";
import { OrganizationSchema } from "@/components/seo/OrganizationSchema";
import { getSiteConfig, getMediaUrl } from "@/lib/api/site-config";
import { getAlternateLanguages } from "@/lib/seo-utils";
import { getFooterData } from "@/lib/api/footer";
import { getContactPopup } from "@/lib/api/contact-popup";

// 延迟加载 LenisProvider（包含 GSAP），不阻塞首屏渲染
const LenisProvider = dynamic(
  () => import("@/components/lenis-provider").then(mod => ({ default: mod.LenisProvider })),
  { loading: () => null }
);

// --- 配置所有字体 ---
const paytoneOne = localFont({
  src: "../../public/fonts/PaytoneOne-Regular.woff2",
  weight: "400",
  variable: "--font-paytone-one",
  display: "swap",
  preload: true,
});

const anaheim = localFont({
  src: "../../public/fonts/Anaheim-Variable.woff2",
  weight: "400 800",
  variable: "--font-anaheim",
  display: "swap",
  preload: true,
});

const inter = localFont({
  src: "../../public/fonts/Inter-VariableFont.woff2",
  weight: "100 900",
  variable: "--font-inter",
  display: "swap",
  preload: false,
});

const montserrat = localFont({
  src: "../../public/fonts/Montserrat-VariableFont_wght.woff2",
  weight: "100 900",
  variable: "--font-montserrat",
  display: "swap",
  preload: false,
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

const limelight = localFont({
  src: "../../public/fonts/Limelight-Regular.ttf",
  weight: "400",
  variable: "--font-limelight",
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
  preload: true,
});

const fontPrata = Prata({
  weight: "400",
  variable: "--font-prata",
  display: "swap",
  subsets: ["latin"],
  preload: false,
});

const fontLexendDeca = Lexend_Deca({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-lexend-deca",
  display: "swap",
  subsets: ["latin"],
  preload: false,
});

const anton = Anton({
  weight: "400",
  variable: "--font-anton",
  display: "swap",
  subsets: ["latin"],
  preload: false,
});

const abhayaLibre = Abhaya_Libre({
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-abhaya-libre",
  display: "swap",
  subsets: ["latin"],
  preload: false,
});

const tenorSans = Tenor_Sans({
  weight: "400",
  variable: "--font-tenor-sans",
  display: "swap",
  subsets: ["latin"],
  preload: false,
});

const agbalumo = Agbalumo({
  weight: "400",
  variable: "--font-agbalumo",
  display: "swap",
  subsets: ["latin"],
  preload: false,
});

const kavivanar = Kavivanar({
  weight: "400",
  variable: "--font-kavivanar",
  display: "swap",
  subsets: ["latin"],
  preload: false,
});

const bagelFatOne = localFont({
  src: "../../public/fonts/BagelFatOne-Regular.ttf",
  weight: "400",
  variable: "--font-bagel-fat-one",
  display: "swap",
  preload: false,
});

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

const gwendolyn = localFont({
  src: "../../public/fonts/Gwendolyn-Bold.ttf",
  weight: "700",
  variable: "--font-gwendolyn",
  display: "swap",
  preload: false,
});

const academyEngraved = localFont({
  src: "../../public/fonts/AcademyEngravedLetPlain.ttf",
  weight: "400",
  variable: "--font-academy-engraved",
  display: "swap",
  preload: false,
});

const acme = localFont({
  src: "../../public/fonts/Acme-Regular.ttf",
  weight: "400",
  variable: "--font-acme",
  display: "swap",
  preload: false,
});

export function generateStaticParams() {
  return locales.map(locale => ({ locale }));
}

export async function generateMetadata(): Promise<Metadata> {
  const siteConfig = await getSiteConfig()
  const faviconUrl = getMediaUrl(siteConfig.favicon)
  const logoUrl = getMediaUrl(siteConfig.logo)
  const finalFaviconUrl = faviconUrl || '/favicon-gold-b.svg'

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.busromhouse.com'
  
  const alternates = getAlternateLanguages('/')

  return {
    metadataBase: new URL(siteUrl),
    description: siteConfig.siteDescription || 'Busrom - Premium architectural hardware manufacturer specializing in glass fittings, door hardware, and custom OEM/ODM solutions for global projects.',
    alternates: {
      canonical: './',
      languages: alternates,
    },
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: 'any' },
        { url: finalFaviconUrl, type: 'image/svg+xml' },
        { url: '/favicon-gold-b.svg', type: 'image/svg+xml' },
      ],
      shortcut: '/favicon.ico',
      apple: [
        { url: finalFaviconUrl, type: 'image/svg+xml' },
        { url: '/favicon-gold-b.svg', type: 'image/svg+xml' },
      ],
    },
    openGraph: {
      type: 'website',
      siteName: siteConfig.siteName || 'Busrom',
      ...(logoUrl && { images: [{ url: logoUrl, width: 1200, height: 630, alt: siteConfig.siteName }] }),
    },
    twitter: {
      card: 'summary_large_image',
      ...(logoUrl && { images: [logoUrl] }),
    },
    verification: {
      ...(process.env.GOOGLE_SITE_VERIFICATION 
          ? { google: process.env.GOOGLE_SITE_VERIFICATION.includes(',') 
                ? process.env.GOOGLE_SITE_VERIFICATION.split(',').map(s => s.trim()) 
                : process.env.GOOGLE_SITE_VERIFICATION } 
          : {}),
      ...(process.env.YANDEX_VERIFICATION ? { yandex: process.env.YANDEX_VERIFICATION } : {}),
      other: {
        ...(process.env.NAVER_SITE_VERIFICATION ? { 'naver-site-verification': process.env.NAVER_SITE_VERIFICATION } : {}),
      }
    },
    other: {
      'msapplication-TileImage': finalFaviconUrl,
      'msapplication-TileColor': '#756F3F',
    },
    manifest: '/manifest.json',
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
  
  const headersList = await headers();
  const userAgent = headersList.get("user-agent") || "";
  const isBotOrPerfTest = /bot|googlebot|crawler|spider|robot|crawling|lighthouse|speed insights|speed-insights|ptst|chrome-lighthouse|gtmetrix|pingdom/i.test(userAgent);

  const [preloaderConfig, initialNavigation, footerData, contactPopupData] = await Promise.all([
    getPreloaderConfig(),
    getNavigation(validLocale),
    getFooterData(validLocale),
    getContactPopup(validLocale),
  ]);

  return (
    <html
      lang={validLocale}
      suppressHydrationWarning
      className={`
        ${paytoneOne.variable}
        ${anaheim.variable}
        ${inter.variable}
        ${montserrat.variable}
        ${bebasNeue.variable}
        ${oswald.variable}
        ${jomhuria.variable}
        ${josefinSans.variable}
        ${joan.variable}
        ${lilitaOne.variable}
        ${kaushanScript.variable}
        ${moul.variable}
        ${orbitron.variable}
        ${limelight.variable}
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
        ${fontPrata.variable}
        ${fontLexendDeca.variable}
        ${anton.variable}
        ${abhayaLibre.variable}
        ${agbalumo.variable}
        ${tenorSans.variable}
        ${bagelFatOne.variable}
        ${pollerOne.variable}
        ${pavanam.variable}
        ${phudu.variable}
        ${gwendolyn.variable}
        ${academyEngraved.variable}
        ${acme.variable}
        ${kavivanar.variable}
        antialiased
      `}
    >
      <head>
        <link rel="preconnect" href="https://cdn.busromhouse.com" />
        <link rel="dns-prefetch" href="https://cdn.busromhouse.com" />
        <link rel="preconnect" href="https://d2kqew3hn5wphn.cloudfront.net" />
        <link rel="dns-prefetch" href="https://d2kqew3hn5wphn.cloudfront.net" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <Suspense fallback={null}>
          <OrganizationSchema locale={validLocale} />
        </Suspense>
        <Suspense fallback={null}>
          <GlobalScripts position="header" />
        </Suspense>
      </head>
      <body className="font-outfit antialiased selection:bg-black selection:text-white" style={{
        // 初始锁定滚动条，等待 Preloader 结束（如果是爬虫或不需要动画，则不锁定）
        overflow: (preloaderConfig.enabled && !isBotOrPerfTest) ? 'hidden' : 'auto'
      }}>
        <Suspense fallback={null}>
          <ScriptDebugger />
          <GlobalScripts position="body_start" />
        </Suspense>
        <ClientLayoutWrapper preloaderConfig={preloaderConfig} isBotOrPerfTest={isBotOrPerfTest}>
          <NextTopLoader color="#D58A00" showSpinner={false} height={3} shadow="0 0 10px #D58A00,0 0 5px #D58A00" />
          <LenisProvider easingKey={"easeOutQuad"} />
          <div className="flex flex-col min-h-screen">
            <Header locale={validLocale} initialNavigation={initialNavigation} contactPopupData={contactPopupData} />
            {children}
            <Suspense fallback={null}>
              <ScrollToTopOnRouteChange />
              <ScrollToTop />
            </Suspense>
            <ConditionalFooter locale={validLocale} ssrData={footerData} />
          </div>
          <Suspense fallback={null}>
            <GlobalScripts position="footer" />
          </Suspense>
          <Suspense fallback={null}>
            <ScriptDebugger />
          </Suspense>
        </ClientLayoutWrapper>
      </body>
    </html>
  );
}
