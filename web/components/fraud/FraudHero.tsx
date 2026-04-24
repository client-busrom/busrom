"use client";

import React from "react";
import { RichText } from "@payloadcms/richtext-lexical/react";
import { OptimizedImage } from "@/components/ui/OptimizedImage";

interface FraudHeroProps {
  hero: any;
  fraudConverters: any;
}

export function FraudHero({ hero, fraudConverters }: FraudHeroProps) {
  if (!hero) return null;

  return (
    <section className="relative min-h-[70vh] flex items-center justify-center pt-32 pb-20 overflow-hidden">
      {hero.image && (
        <div className="absolute inset-0 z-0">
          <OptimizedImage
            image={hero.image}
            alt="Fraud Notice Hero"
            className="w-full h-full object-cover"
            size="xlarge"
          />
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
        </div>
      )}

      <div className="container mx-auto px-6 relative z-10 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 flex justify-center text-white">
            <RichText
              data={{ root: { children: hero.title } } as any}
              converters={{
                ...fraudConverters,
                paragraph: ({ nodesToJSX, node }: any) => (
                  <h1 className="font-montserrat font-bold text-white text-5xl md:text-8xl tracking-tighter uppercase m-0 drop-shadow-2xl">
                    {nodesToJSX({ nodes: node.children })}
                  </h1>
                ),
              }}
            />
          </div>
          <div className="mb-12 mx-auto">
            <RichText
              data={{ root: { children: hero.description } } as any}
              converters={{
                ...fraudConverters,
                paragraph: ({ nodesToJSX, node }: any) => (
                  <p className="font-montserrat text-white/90 m-0 text-xl md:text-[28px] font-bold leading-relaxed drop-shadow-lg">
                    {nodesToJSX({ nodes: node.children })}
                  </p>
                ),
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
