import type React from "react";
import { Suspense } from "react";
import localFont from "next/font/local";
import "../globals.css";
import ScrollToTop from "@/components/ScrollToTop";
import ScrollToTopOnRouteChange from "@/components/ScrollToTopOnRouteChange";
import { isValidLocale, defaultLocale } from "@/i18n.config";
import Header from "@/components/layout/header";
import ConditionalFooter from "@/components/layout/conditional-footer";
import { ClientLayoutWrapper } from "@/components/ClientLayoutWrapper";
import { LenisProvider } from "@/components/lenis-provider";
import { getPreloaderConfig } from "@/lib/api/preloader-config";

// --- 配置所有本地字体 ---
const paytoneOne = localFont({
  src: "../../public/fonts/PaytoneOne-Regular.woff2",
  weight: "400",
  variable: "--font-paytone-one",
  display: "swap",
});

const pollerOne = localFont({
  src: "../../public/fonts/PollerOne-Regular.woff2",
  weight: "400",
  variable: "--font-poller-one",
  display: "swap",
});

const pavanam = localFont({
  src: "../../public/fonts/Pavanam-Regular.woff2",
  weight: "400",
  variable: "--font-pavanam",
  display: "swap",
});

const phudu = localFont({
  src: "../../public/fonts/Phudu-Variable.woff2",
  weight: "400 900",
  variable: "--font-phudu",
  display: "swap",
});

const anaheim = localFont({
  src: "../../public/fonts/Anaheim-Variable.woff2",
  weight: "400 800",
  variable: "--font-anaheim",
  display: "swap",
});

const montserrat = localFont({
  src: "../../public/fonts/Montserrat-VariableFont_wght.woff2",
  weight: "100 900",
  variable: "--font-montserrat",
  display: "swap",
});

const bebasNeue = localFont({
  src: "../../public/fonts/BebasNeue-Regular.woff2",
  weight: "400",
  variable: "--font-bebas-neue",
  display: "swap",
});

const oswald = localFont({
  src: "../../public/fonts/Oswald-VariableFont_wght.woff2",
  weight: "100 900",
  variable: "--font-oswald",
  display: "swap",
});

const inter = localFont({
  src: "../../public/fonts/Inter-VariableFont.woff2",
  weight: "100 900",
  variable: "--font-inter",
  display: "swap",
});

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "zh" }, { locale: "es" }, { locale: "fr" }, { locale: "de" }];
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

  // Fetch preloader configuration from CMS (server-side)
  const preloaderConfig = await getPreloaderConfig();

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
      font-sans
    `}
    >
      <body className={`${inter.className} overflow-x-hidden`}>
        {/* 👇 使用 ClientLayoutWrapper 包裹你的所有内容 */}
        <ClientLayoutWrapper preloaderConfig={preloaderConfig}>
          <LenisProvider easingKey={"easeOutQuad"} />
          <div className="flex flex-col min-h-screen overflow-x-hidden">
            <Header locale={validLocale} />
            {children}
            <Suspense fallback={null}>
              <ScrollToTopOnRouteChange />
              <ScrollToTop />
            </Suspense>
            <ConditionalFooter locale={validLocale} />
          </div>
        </ClientLayoutWrapper>
      </body>
    </html>
  );
}
