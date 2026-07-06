// @ts-nocheck
"use client";

import React from "react";

export function ChecklistBlock({ node }: { node: any }) {
  const { title, items, style } = node.data || node.fields || {};

  if (!items || items.length === 0) return null;

  const listClass =
    style === "number"
      ? "list-decimal"
      : style === "bullet"
        ? "list-disc"
        : "list-none";

  return (
    <div className="my-8">
      {title && (
        <h4 className="font-josefin-sans font-bold text-xl mb-4">{title}</h4>
      )}
      <ul className={`pl-0 space-y-3 ${listClass}`}>
        {items.map((item: any, index: number) => (
          <li key={index} className="flex items-start gap-3">
            {style !== "number" && style !== "bullet" && (
              <span
                className={`mt-1 w-5 h-5 rounded flex items-center justify-center shrink-0 ${item.checked ? "bg-brand-secondary text-white" : "border-2 border-brand-secondary"}`}
              >
                {item.checked && (
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </span>
            )}
            <span className="text-[16px] leading-[1.7]">{item.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
