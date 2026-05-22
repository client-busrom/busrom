"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { defaultLocale, locales } from "@/i18n.config";
import { ErrorImageWall } from "@/components/ErrorImageWall";

interface NotFoundClientProps {
  preloaderImages?: string[];
}

export function NotFoundClient({ preloaderImages }: NotFoundClientProps) {
  const pathname = usePathname();

  // Simple locale detection from pathname
  const segments = pathname.split("/");
  const pathLocale = segments[1];
  const locale = locales.includes(pathLocale as any)
    ? pathLocale
    : defaultLocale;

  const currentYear = new Date().getFullYear();

  return (
    <div
      className="min-h-[calc(100vh-80px)] bg-[#FAF9F5] flex flex-col justify-between relative overflow-hidden font-sans pt-24"
      data-header-theme="light"
    >
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row w-full max-w-[1920px] mx-auto px-8 md:px-16 lg:px-24 xl:px-32 relative z-10">
        {/* Left Side: Text Content */}
        <div className="w-full lg:w-3/5 flex flex-col justify-center items-start h-full pb-20 lg:pb-0 z-20">
          <h1
            className="text-[32px] md:text-[48px] lg:text-[clamp(48px,2.4vw,60px)] text-[#2D2D2D] uppercase leading-[1.3] mb-12 tracking-wide"
            style={{
              fontFamily: '"Playfair Display", "Times New Roman", Times, serif',
            }}
          >
            THE PAGE YOU ARE LOOKING
            <br />
            FOR MIGHT HAVE BEEN
            <br />
            REMOVED OR TEMPORARILY
            <br />
            UNAVAILABLE
          </h1>

          <Link
            href={`/${locale}`}
            className="px-10 py-4 bg-[#BFA273] text-white font-sans font-bold text-sm tracking-[0.1em] rounded-sm hover:bg-[#A88A5C] transition-colors duration-300"
          >
            BACK TO HOME
          </Link>
        </div>

        {/* Right Side: Building Illustration */}
        <div className="w-full lg:w-2/5 flex items-end justify-end opacity-90 lg:absolute lg:right-0 lg:bottom-0 lg:h-full pointer-events-none z-10">
          <ErrorImageWall customImages={preloaderImages} />
        </div>
      </div>

      {/* Footer */}
      <div className="w-full max-w-[1920px] mx-auto px-8 md:px-16 lg:px-24 xl:px-32 pb-8 z-20 relative">
        <p className="text-[#888888] text-xs font-sans tracking-wide">
          Copyright &copy; Busrom {currentYear}. All Rights Reserved
        </p>
      </div>
    </div>
  );
}
