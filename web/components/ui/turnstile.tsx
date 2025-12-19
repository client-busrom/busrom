"use client";

import { useEffect, useRef, useCallback } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: TurnstileOptions
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
      getResponse: (widgetId: string) => string | undefined;
    };
    onTurnstileLoad?: () => void;
  }
}

interface TurnstileOptions {
  sitekey: string;
  callback?: (token: string) => void;
  "error-callback"?: () => void;
  "expired-callback"?: () => void;
  theme?: "light" | "dark" | "auto";
  size?: "normal" | "compact";
  language?: string;
  tabindex?: number;
  action?: string;
  cData?: string;
  "response-field"?: boolean;
  "response-field-name"?: string;
}

export interface TurnstileProps {
  siteKey: string;
  onVerify?: (token: string) => void;
  onSuccess?: (token: string) => void; // Alias for onVerify
  onError?: () => void;
  onExpire?: () => void;
  theme?: "light" | "dark" | "auto";
  size?: "normal" | "compact";
  language?: string;
  className?: string;
}

export function Turnstile({
  siteKey,
  onVerify,
  onSuccess,
  onError,
  onExpire,
  theme = "auto",
  size = "normal",
  language = "auto",
  className,
}: TurnstileProps) {
  // Support both onVerify and onSuccess (alias)
  const handleVerify = onVerify || onSuccess;
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const scriptLoadedRef = useRef(false);

  const renderWidget = useCallback(() => {
    if (!containerRef.current || !window.turnstile || widgetIdRef.current) {
      return;
    }

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      callback: handleVerify,
      "error-callback": onError,
      "expired-callback": onExpire,
      theme,
      size,
      language,
    });
  }, [siteKey, handleVerify, onError, onExpire, theme, size, language]);

  useEffect(() => {
    // Check if script is already loaded
    if (window.turnstile) {
      renderWidget();
      return;
    }

    // Check if script tag already exists
    const existingScript = document.querySelector(
      'script[src*="challenges.cloudflare.com/turnstile"]'
    );
    if (existingScript) {
      // Wait for it to load
      window.onTurnstileLoad = renderWidget;
      return;
    }

    // Load the Turnstile script
    if (!scriptLoadedRef.current) {
      scriptLoadedRef.current = true;
      window.onTurnstileLoad = renderWidget;

      const script = document.createElement("script");
      script.src =
        "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    return () => {
      // Cleanup widget on unmount
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [renderWidget]);

  // Reset widget when siteKey changes
  useEffect(() => {
    if (widgetIdRef.current && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current);
    }
  }, [siteKey]);

  return (
    <div
      ref={containerRef}
      className={className}
      data-testid="turnstile-widget"
    />
  );
}

export function useTurnstileReset() {
  const reset = useCallback((widgetId: string) => {
    if (window.turnstile && widgetId) {
      window.turnstile.reset(widgetId);
    }
  }, []);

  return reset;
}
