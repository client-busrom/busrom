// @ts-nocheck
"use client";

import React from "react";
import { DynamicForm } from "@/components/forms/DynamicForm";
import { useBlogLocale } from "@/components/blog/BlogLexicalRenderer/context";
import type { Locale } from "@/i18n.config";

function FormBlockInner({ node, locale }: { node: any; locale: Locale }) {
  const { formConfig, displayTitle } = node.data || node.fields || {};
  const [config, setConfig] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const configId =
    typeof formConfig === "string" || typeof formConfig === "number"
      ? formConfig
      : formConfig?.id;

  React.useEffect(() => {
    if (!configId) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    fetch(`/api/form-configs/${configId}?locale=${locale}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Form config load failed: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!cancelled) {
          setConfig(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error("[FormBlock] Failed to load form config:", err);
          setError(err.message || "Failed to load form");
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [configId, locale]);

  if (loading) {
    return (
      <div className="my-8 p-8 rounded-2xl bg-brand-main animate-pulse">
        <div className="h-6 w-1/3 bg-brand-dark-olive/10 rounded mb-6" />
        <div className="space-y-4">
          <div className="h-10 bg-brand-dark-olive/10 rounded" />
          <div className="h-10 bg-brand-dark-olive/10 rounded" />
          <div className="h-24 bg-brand-dark-olive/10 rounded" />
        </div>
      </div>
    );
  }

  if (error || !config) {
    return (
      <div className="my-8 p-6 rounded-2xl bg-red-50 border border-red-200 text-red-700">
        {error || "Form configuration not found"}
      </div>
    );
  }

  return (
    <div className="my-8">
      {displayTitle && config.displayName && (
        <h4 className="font-josefin-sans font-bold text-xl mb-4">
          {config.displayName}
        </h4>
      )}
      <DynamicForm formConfig={config} locale={locale} />
    </div>
  );
}

export function FormBlock({ node }: { node: any }) {
  const locale = useBlogLocale();
  return <FormBlockInner node={node} locale={locale} />;
}
