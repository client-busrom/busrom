"use client";

import React from "react";
import { OptimizedImage } from "@/components/ui/OptimizedImage";

interface FraudQuoteGuideProps {
  quoteGuide: any;
  locale: string;
}

export function FraudQuoteGuide({ quoteGuide, locale }: FraudQuoteGuideProps) {
  if (!quoteGuide) return null;

  return (
    <section className="w-full bg-[#f6f4ed] overflow-hidden">
      <div className="flex flex-col md:flex-row w-full h-[60vh] min-h-[450px]">
        {quoteGuide.slides.map((slide: any, idx: number) => (
          <a
            key={idx}
            href={slide.buttonLink}
            target={slide.openInNewTab ? "_blank" : "_self"}
            rel={slide.openInNewTab ? "noopener noreferrer" : undefined}
            className="group relative flex-1 hover:flex-[1.8] transition-all duration-700 ease-in-out overflow-hidden cursor-pointer"
          >
            {slide.image && (
              <OptimizedImage
                image={slide.image}
                alt={slide.title}
                size="large"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110"
              />
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-700" />
            <div className="absolute inset-0 p-8 md:p-12 lg:p-16 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/20 to-transparent">
              <div className="translate-y-8 group-hover:translate-y-0 transition-transform duration-700">
                <h4 className="text-white text-3xl md:text-4xl font-bold mb-4">
                  {slide.title}
                </h4>
                <p className="text-white/60 mb-8 opacity-0 group-hover:opacity-100 transition-opacity duration-700 line-clamp-3">
                  {slide.description}
                </p>
                <div
                  className="inline-block border-b-2 border-white pb-1 text-[11px] font-black uppercase tracking-widest text-white"
                >
                  {slide.buttonText ||
                    (locale === "zh" ? "了解更多" : "Learn More")}
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
