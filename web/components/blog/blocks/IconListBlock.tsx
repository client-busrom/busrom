// @ts-nocheck
"use client";

import React from "react";
import Link from "next/link";
import { IconifyIcon } from "@/components/ui/IconifyIcon";

export function IconListBlock({ node }: { node: any }) {
  const items = node?.data?.items || [];
  if (items.length === 0) return null;

  return (
    <div className="flex flex-wrap justify-start items-start gap-x-8 gap-y-6 py-6">
      {items.slice(0, 8).map((item: any, index: number) => {
        const itemContent = (
          <div className="flex flex-col items-center text-center group cursor-pointer transition-all duration-300">
            <div
              className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center mb-2 transition-all duration-300 border border-[#5d6b4a] group-hover:!bg-[#060C14] group-hover:!border-[#060C14]"
              style={{
                borderRadius:
                  item.borderStyle === "circle"
                    ? "50%"
                    : item.borderStyle === "square"
                      ? "12px"
                      : "0",
                backgroundColor: "transparent",
              }}
            >
              {item.icon && (
                <div className="transition-colors duration-300 text-[#5d6b4a] group-hover:text-white">
                  <IconifyIcon name={item.icon} size={24} />
                </div>
              )}
            </div>
            {item.title && (
              <p className="font-josefin-sans font-bold text-[11px] md:text-xs text-[#3a3a3a] leading-tight whitespace-pre-line group-hover:text-[#060C14] transition-colors max-w-[80px]">
                {item.title}
              </p>
            )}
            {item.subtitle && (
              <p className="font-josefin-sans text-[10px] text-gray-400 leading-tight mt-1 opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0">
                {item.subtitle}
              </p>
            )}
          </div>
        );

        const wrapperClass = "shrink-0 min-w-[60px] md:min-w-[80px]";

        if (item.enableLink && item.url) {
          return (
            <Link
              key={index}
              href={item.url}
              target={item.openInNewTab ? "_blank" : undefined}
              rel={item.openInNewTab ? "noopener noreferrer" : undefined}
              className={wrapperClass}
            >
              {itemContent}
            </Link>
          );
        }

        return (
          <div key={index} className={wrapperClass}>
            {itemContent}
          </div>
        );
      })}
    </div>
  );
}
