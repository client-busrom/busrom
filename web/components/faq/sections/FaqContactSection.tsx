"use client";

import React from "react";
import { motion } from "framer-motion";
import { DynamicForm } from "@/components/forms/DynamicForm";
import { OptimizedImage } from "@/components/ui/OptimizedImage";

const DESIGN_WIDTH = 1920;
const vw = (px: number) => `${(px / DESIGN_WIDTH) * 100}vw`;

interface FaqContactSectionProps {
  data: {
    title: any[];
    formConfig: any;
    image: any;
  };
  locale: string;
}

export function FaqContactSection({ data, locale }: FaqContactSectionProps) {
  return (
    <section 
      className="relative w-full overflow-hidden"
      style={{ 
        height: vw(922),
        background: "linear-gradient(103deg, #645c1d 0%, #fff587 100%)"
      }}
    >
      <div className="flex w-full h-full px-[vw(208)] pt-[vw(38)]">
        {/* Left Side: Content & Form */}
        <div className="flex flex-col w-[vw(710)] relative z-10">
          {/* Titles */}
          <div className="mb-[vw(40)]">
             <h2 
               className="font-black leading-tight mb-[vw(10)] bg-clip-text text-transparent"
               style={{ 
                 fontSize: vw(96), 
                 backgroundImage: "linear-gradient(180deg, #cabc5a 0%, #736a2c 100%)",
                 fontFamily: "var(--font-anaheim), sans-serif",
                 filter: "drop-shadow(0 1px 1px rgba(255,255,255,0.5))"
               }}
             >
               Can't Find
             </h2>
             <h3 
               className="font-black text-[#fff28d] leading-tight"
               style={{ fontSize: vw(60), fontFamily: "var(--font-anaheim), sans-serif" }}
             >
               What You're Looking For?
             </h3>
          </div>

          <p 
            className="text-white font-semibold mb-[vw(50)]"
            style={{ fontSize: vw(24), lineHeight: 1.7, fontFamily: "var(--font-anaheim), sans-serif" }}
          >
            Please Fill Out The Information. The Busrom Team Will Provide You With A Professional Solution Within 24h.
          </p>

          {/* Form */}
          <div 
            className="faq-contact-form-container"
            style={{ width: vw(704) }}
          >
             <style jsx global>{`
                .faq-contact-form-container .dynamic-form-field-input {
                   background: rgba(33, 28, 11, 0.18) !important;
                   border: 1px solid rgba(255, 255, 255, 0.3) !important;
                   border-radius: 15px !important;
                   color: white !important;
                   font-family: var(--font-anaheim), sans-serif !important;
                }
                .faq-contact-form-container .dynamic-form-field-label {
                   color: rgba(255, 255, 255, 0.8) !important;
                   font-family: var(--font-anaheim), sans-serif !important;
                   font-size: 1.0vw !important;
                }
                .faq-contact-form-container .dynamic-form-submit-btn {
                   background: #d1be2e !important;
                   border-radius: 63px !important;
                   height: 3.6vw !important;
                   font-size: 2.1vw !important;
                   font-weight: 600 !important;
                   color: white !important;
                   font-family: var(--font-anaheim), sans-serif !important;
                   margin-top: 2vw !important;
                }
             `}</style>
             <DynamicForm 
                formConfig={data.formConfig} 
                locale={locale} 
                className="grid grid-cols-2 gap-[vw(20)]"
             />
          </div>
        </div>

        {/* Right Side: Decorative Image Collage */}
        <div 
          className="absolute"
          style={{ right: vw(100), top: vw(59) }}
        >
           <div className="relative group overflow-hidden rounded-[30px] shadow-2xl">
              <div 
                className="bg-white/10 backdrop-blur-sm p-[vw(20)] border border-white/20 rounded-[30px]"
                style={{ width: vw(700), height: vw(800) }}
              >
                  <div className="flex gap-[vw(20)] h-[vw(235)] mb-[vw(20)]">
                      <div className="flex-1 bg-white/20 rounded-[30px]"></div>
                      <div className="flex-[0.6] bg-white/50 rounded-[30px]"></div>
                  </div>
                  <div className="w-full h-[vw(500)] bg-white/30 rounded-[30px] relative overflow-hidden">
                     <OptimizedImage
                        image={data.image}
                        className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-700"
                     />
                  </div>
              </div>
           </div>
        </div>
      </div>
    </section>
  );
}
