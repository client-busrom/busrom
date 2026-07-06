// @ts-nocheck
"use client";

import React from "react";
import Link from "next/link";
import { useBlogLocale } from "@/components/blog/BlogLexicalRenderer/context";

export function ApplicationCarouselBlock({ node }: { node: any }) {
  const { applications, itemsPerView, showTitle, showDescription } =
    node.data || node.fields || {};
  const locale = useBlogLocale();
  const [items, setItems] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!applications || applications.length === 0) {
      setLoading(false);
      return;
    }

    const ids = applications.map((app: any) =>
      typeof app === "string" ? app : app.id,
    );

    Promise.all(
      ids.map((id: string) =>
        fetch(`/api/applications/${id}?depth=1&locale=${locale}`)
          .then((res) => (res.ok ? res.json() : null))
          .catch(() => null),
      ),
    ).then((results) => {
      setItems(results.filter(Boolean));
      setLoading(false);
    });
  }, [applications, locale]);

  if (loading) {
    return (
      <div className="my-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="aspect-[4/3] bg-brand-main rounded-2xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (items.length === 0) return null;

  const perView = Math.min(Math.max(itemsPerView || 3, 1), 4);
  const gridClass = {
    1: "md:grid-cols-1",
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
    4: "md:grid-cols-4",
  }[perView];

  return (
    <div className="my-8">
      <div className={`grid grid-cols-1 ${gridClass} gap-6`}>
        {items.map((app: any) => {
          const image =
            app.sceneGallery?.[0]?.images?.[0]?.url || app.coverImage?.url || "";
          return (
            <Link
              key={app.id}
              href={`/${locale === "en" ? "" : locale + "/"}applications/${app.slug}`}
              className="group block rounded-2xl overflow-hidden border border-brand-dark-olive/10 bg-white hover:shadow-lg transition-shadow"
            >
              {image && (
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={image}
                    alt={app.name || ""}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              )}
              <div className="p-5">
                {showTitle && app.name && (
                  <h4 className="font-josefin-sans font-bold text-lg mb-2">
                    {app.name}
                  </h4>
                )}
                {showDescription && app.shortDescription && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {app.shortDescription}
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
