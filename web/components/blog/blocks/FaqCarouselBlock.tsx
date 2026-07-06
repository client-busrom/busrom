// @ts-nocheck
"use client";

import React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useBlogLocale } from "@/components/blog/BlogLexicalRenderer/context";

export function FaqCarouselBlock({ node }: { node: any }) {
  const { items } = node.data || node.fields || {};
  const locale = useBlogLocale();
  const [faqItems, setFaqItems] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!items || items.length === 0) {
      setLoading(false);
      return;
    }

    const ids = items
      .map((item: any) =>
        typeof item.faq === "string" ? item.faq : item.faq?.id,
      )
      .filter(Boolean);

    if (ids.length === 0) {
      setLoading(false);
      return;
    }

    const params = new URLSearchParams({
      locale,
      depth: "1",
      limit: String(ids.length),
    });
    ids.forEach((id: string) => params.append("where[id][in][]", id));

    fetch(`/api/faq-items?${params.toString()}`)
      .then((res) => (res.ok ? res.json() : { docs: [] }))
      .then((data) => {
        setFaqItems(data.docs || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [items, locale]);

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

  if (faqItems.length === 0) return null;

  return (
    <div className="my-8">
      <Carousel
        opts={{
          align: "start",
          loop: faqItems.length > 1,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-4">
          {faqItems.map((faq: any) => (
            <CarouselItem
              key={faq.id}
              className="pl-4 md:basis-1/2 lg:basis-1/3"
            >
              <div className="h-full p-6 rounded-2xl bg-brand-main border border-brand-dark-olive/10">
                <h4 className="font-josefin-sans font-bold text-lg mb-3">
                  {faq.question}
                </h4>
                <p className="text-sm text-gray-700 line-clamp-4">
                  {faq.answer?.root?.children?.[0]?.text || ""}
                </p>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex -left-4" />
        <CarouselNext className="hidden md:flex -right-4" />
      </Carousel>
    </div>
  );
}
