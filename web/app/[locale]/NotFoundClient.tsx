"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { defaultLocale, locales } from "@/i18n.config";
import { ErrorImageWall } from "@/components/ErrorImageWall";

interface NotFoundClientProps {
  preloaderImages?: string[];
  title?: string;
  buttonText?: string;
  buttonLink?: string;
}

export function NotFoundClient({ preloaderImages, title, buttonText, buttonLink }: NotFoundClientProps) {
  const pathname = usePathname();

  // Simple locale detection from pathname
  const segments = pathname.split("/");
  const pathLocale = segments[1];
  const locale = locales.includes(pathLocale as any)
    ? pathLocale
    : defaultLocale;

  // Handle line breaks in title if needed
  const displayTitle = title || "THE PAGE YOU ARE LOOKING\nFOR MIGHT HAVE BEEN\nREMOVED OR TEMPORARILY\nUNAVAILABLE";
  const displayButtonText = buttonText || "BACK TO HOME";
  const displayButtonLink = buttonLink || `/${locale}`;

  return (
    <div
      className="min-h-[calc(100vh-80px)] bg-[#f6f4ed] flex flex-col justify-between relative overflow-hidden font-sans pt-32"
      data-header-theme="light"
    >
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row w-full max-w-[1920px] mx-auto px-8 md:px-16 lg:px-24 xl:px-32 relative z-10">
        {/* Left Side: Text Content */}
        <div className="w-full lg:w-3/5 flex flex-col justify-center items-start h-full pb-20 lg:pb-0 z-20">
          <h1
            className="text-[28px] md:text-[40px] lg:text-[clamp(40px,2vw,50px)] text-[#2D2D2D] uppercase leading-[1.3] mb-12 tracking-wide whitespace-pre-line"
            style={{
              fontFamily: '"Playfair Display", "Times New Roman", Times, serif',
            }}
          >
            {displayTitle}
          </h1>

          <Link
            href={displayButtonLink.startsWith('/') && !displayButtonLink.startsWith(`/${locale}`) ? `/${locale}${displayButtonLink}` : displayButtonLink}
            className="group inline-flex w-fit max-w-full lg:max-w-[50vw] px-10 py-4 bg-[#BFA273] hover:bg-black text-white font-sans font-bold text-sm tracking-[0.1em] rounded-sm transition-colors duration-500"
          >
            <span className="relative block overflow-hidden max-w-full">
              {/* Current Text (rotates clockwise 90deg out) */}
              <span className="block origin-top-right transition-transform duration-500 ease-in-out group-hover:rotate-90 whitespace-nowrap overflow-hidden text-ellipsis">
                {displayButtonText}
              </span>
              {/* Incoming Text (rotates from counter-clockwise 90deg back to 0) */}
              <span aria-hidden="true" className="absolute inset-0 block origin-bottom-left rotate-90 transition-transform duration-500 ease-in-out group-hover:rotate-0 whitespace-nowrap overflow-hidden text-ellipsis">
                {displayButtonText}
              </span>
            </span>
          </Link>
        </div>

        {/* Right Side: Building Illustration */}
        <div className="w-full lg:w-2/5 flex items-start justify-start opacity-90 lg:absolute lg:right-0 lg:top-0 lg:h-full pointer-events-none z-10">
          <ErrorImageWall customImages={preloaderImages} />
        </div>
      </div>
    </div>
  );
}
