// @ts-nocheck
"use client";

import React from "react";
import { useBlogLocale } from "@/components/blog/BlogLexicalRenderer/context";

export function FaqSelectionBlock({ node }: { node: any }) {
  const { categories } = node.data || node.fields || {};
  const locale = useBlogLocale();
  const [faqMap, setFaqMap] = React.useState<Record<string, any>>({});
  const [activeCategory, setActiveCategory] = React.useState<number>(0);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!categories || categories.length === 0) {
      setLoading(false);
      return;
    }

    const ids: string[] = [];
    categories.forEach((cat: any) => {
      cat.questions?.forEach((q: any) => {
        const id = typeof q.faqItem === "string" ? q.faqItem : q.faqItem?.id;
        if (id) ids.push(id);
      });
    });

    if (ids.length === 0) {
      setLoading(false);
      return;
    }

    const params = new URLSearchParams({
      locale,
      depth: "1",
      limit: String(ids.length),
    });
    ids.forEach((id) => params.append("where[id][in][]", id));

    fetch(`/api/faq-items?${params.toString()}`)
      .then((res) => (res.ok ? res.json() : { docs: [] }))
      .then((data) => {
        const map: Record<string, any> = {};
        (data.docs || []).forEach((doc: any) => {
          map[doc.id] = doc;
        });
        setFaqMap(map);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [categories, locale]);

  if (loading) {
    return (
      <div className="my-8 space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-16 bg-brand-main rounded-xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!categories || categories.length === 0) return null;

  const activeCat = categories[activeCategory];

  return (
    <div className="my-8">
      <div className="flex flex-wrap gap-3 mb-6">
        {categories.map((cat: any, idx: number) => (
          <button
            key={idx}
            onClick={() => setActiveCategory(idx)}
            className={`px-5 py-2 rounded-full text-sm font-josefin-sans font-bold transition-colors ${
              idx === activeCategory
                ? "bg-brand-secondary text-white"
                : "bg-brand-main text-brand-text-main hover:bg-brand-cream"
            }`}
          >
            {cat.category?.adminLabel || cat.category}
          </button>
        ))}
      </div>

      {activeCat && (
        <div className="space-y-4">
          {activeCat.questions?.map((q: any, idx: number) => {
            const faq =
              faqMap[typeof q.faqItem === "string" ? q.faqItem : q.faqItem?.id];
            if (!faq) return null;
            return (
              <details
                key={idx}
                className="group rounded-xl border border-brand-dark-olive/10 bg-white open:bg-brand-main"
              >
                <summary className="flex items-center justify-between p-5 cursor-pointer list-none font-josefin-sans font-bold">
                  {faq.question}
                  <span className="transition-transform group-open:rotate-180">
                    ▼
                  </span>
                </summary>
                <div className="px-5 pb-5 text-[16px] leading-[1.7]">
                  {faq.answer?.root?.children?.[0]?.text || ""}
                </div>
              </details>
            );
          })}
        </div>
      )}
    </div>
  );
}
