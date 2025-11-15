import type React from "react";
import { Suspense } from "react";
import { Anaheim, Bebas_Neue, Inter, Montserrat, Oswald, Pavanam, Paytone_One, Phudu, Poller_One } from "next/font/google";
import "../globals.css";
// 注意：你这里使用了 dir, 可能是为 next-intl 准备的，但你的 page.tsx 没用，我们暂时保持原样
import ScrollToTop from "@/components/ScrollToTop";
import ScrollToTopOnRouteChange from "@/components/ScrollToTopOnRouteChange";
import { isValidLocale, defaultLocale } from "@/i18n.config";
import Header from "@/components/layout/header";
import ConditionalFooter from "@/components/layout/conditional-footer";
// 👈 导入我们新创建的 Wrapper
import { ClientLayoutWrapper } from "@/components/ClientLayoutWrapper";
import { LenisProvider } from "@/components/lenis-provider";

// --- 配置所有 Google Fonts ---
const paytoneOne = Paytone_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-paytone-one",
  display: "swap",
});

const pollerOne = Poller_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-poller-one",
  display: "swap",
});

const pavanam = Pavanam({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pavanam",
  display: "swap",
});

const phudu = Phudu({
  weight: "600",
  subsets: ["latin"],
  variable: "--font-phudu",
  display: "swap",
});

const anaheim = Anaheim({
  // [核心] 加载 Anaheim 需要的所有字重
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-anaheim",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-montserrat",
  display: "swap",
});

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas-neue",
  display: "swap",
});

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-oswald",
  display: "swap",
});

const inter = Inter({ subsets: ["latin"] });

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
      font-sans
    `}
    >
      <body className={inter.className}>
        {/* 👇 使用 ClientLayoutWrapper 包裹你的所有内容 */}
        <ClientLayoutWrapper>
          <LenisProvider easingKey={"easeOutQuad"} />
          <div className="flex flex-col min-h-screen">
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
