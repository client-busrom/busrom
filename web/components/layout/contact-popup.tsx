"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "@/lib/navigation";
import type { ContactPopupData, ContactPopupOption } from "@/lib/api/contact-popup";
import { OptimizedImage } from "@/components/ui/OptimizedImage";

interface ContactPopupProps {
  data: ContactPopupData | null;
  isOpen: boolean;
  onClose: () => void;
  onChatClick?: () => void;
}

function getLinkHref(option: ContactPopupOption): string {
  switch (option.linkType) {
    case "phone":
      return `tel:${option.linkUrl}`;
    case "email":
      return option.linkUrl.startsWith("mailto:")
        ? option.linkUrl
        : `mailto:${option.linkUrl}`;
    case "chat":
      return "#";
    case "url":
    default:
      return option.linkUrl || "#";
  }
}

function ContactOptionCard({
  option,
  onChatClick,
}: {
  option: ContactPopupOption;
  onChatClick?: () => void;
}) {
  const href = getLinkHref(option);
  const isChat = option.linkType === "chat";
  const isExternal = option.linkType === "url" && (href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:"));

  const cardContent = (
    <div
      className={cn(
        "flex gap-3 items-center bg-[#F5F5F5] rounded-lg py-3 pl-2 pr-6 transition-colors w-full",
        "hover:bg-[#EBEBEB] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black"
      )}
    >
      {/* Icon */}
      <div className="w-[5.5rem] h-[5.5rem] max-w-[5.5rem] max-h-[5.5rem] flex-shrink-0 overflow-hidden rounded-md">
        {option.icon?.url ? (
          <OptimizedImage
            image={option.icon as any}
            alt={option.icon.alt || option.title}
            size="thumbnail"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400 text-xs">No Icon</span>
          </div>
        )}
      </div>

      {/* Text Content */}
      <div className="flex flex-col gap-1.5 flex-grow text-left min-w-0">
        <div className="text-[18px] font-bold text-black leading-tight">
          {option.title}
        </div>
        {option.description && (
          <div
            className="text-[16px] font-medium text-gray-500 leading-relaxed whitespace-pre-line"
            dangerouslySetInnerHTML={{ __html: option.description.replace(/\n/g, '<br/>') }}
          />
        )}
      </div>

      {/* Arrow (Custom SVG to match premium narrow style) */}
      <div className="flex items-center flex-shrink-0">
        <svg aria-hidden="true" focusable="false" width="15" height="25" viewBox="0 0 11 18" fill="none" className="text-gray-300">
          <path d="M10.0587 7.916C10.6447 8.5 10.6467 9.446 10.0647 10.034L3.10771 17.056C2.81471 17.352 2.42871 17.5 2.04271 17.5C1.66071 17.5 1.27871 17.355 0.98671 17.065C0.39771 16.482 0.39471 15.533 0.97771 14.944L6.88181 8.984L0.94081 3.062C0.35481 2.478 0.35281 1.5279 0.93781 0.941001C1.52181 0.354001 2.47381 0.353001 3.05881 0.938001L10.0587 7.916Z" fill="currentColor"></path>
        </svg>
      </div>
    </div>
  );

  if (isChat) {
    return (
      <button
        type="button"
        onClick={onChatClick}
        className="block w-full text-left cursor-pointer outline-none"
      >
        {cardContent}
      </button>
    );
  }

  if (option.linkType === "url" && !isExternal) {
    return (
      <Link
        href={href}
        className="block w-full"
        target={option.openInNewTab ? "_blank" : undefined}
        rel={option.openInNewTab ? "noopener noreferrer" : undefined}
      >
        {cardContent}
      </Link>
    );
  }

  return (
    <a
      href={href}
      className="block w-full"
      target={option.openInNewTab ? "_blank" : undefined}
      rel={option.openInNewTab ? "noopener noreferrer" : undefined}
    >
      {cardContent}
    </a>
  );
}

export function ContactPopup({ data, isOpen, onClose, onChatClick }: ContactPopupProps) {
  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleChatClick = useCallback(() => {
    onChatClick?.();
    onClose();
  }, [onChatClick, onClose]);

  if (!data) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[80] bg-black/70"
            onClick={onClose}
          />

          {/* Modal - Centered */}
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[90] flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="bg-white w-full max-w-[31.75rem] max-h-[95vh] md:max-h-[80vh] relative overflow-hidden rounded-3xl shadow-2xl flex flex-col pointer-events-auto"
              style={{ fontFamily: 'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"' }}
            >
              {/* Close button - absolute and prominent */}
              <button
                type="button"
                onClick={onClose}
                className="absolute top-4 right-4 md:top-5 md:right-5 z-10 bg-black text-white rounded-full w-[2.125rem] h-[2.125rem] md:w-[3.25rem] md:h-[3.25rem] flex justify-center items-center transition-colors shadow-sm"
                aria-label="Close"
              >
                <X className="w-4 h-4 md:w-8 md:h-8" strokeWidth={2.5} />
              </button>

              {/* Scrollable Content */}
              <div className="overflow-y-auto w-full h-full" data-lenis-prevent>
                <div className="px-6 pt-16 pb-8 flex flex-col gap-sm">
                  {/* Title */}
                  <h2 className="text-[32px] md:text-[40px] font-bold text-center text-[#1A1A1A] max-w-[90%] mx-auto break-words leading-[1.15]">
                    {data.title}
                  </h2>

                  {/* Options */}
                  <div className="flex flex-col gap-3 mt-2">
                    {data.options.map((option) => (
                      <ContactOptionCard
                        key={option.id}
                        option={option}
                        onChatClick={handleChatClick}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default ContactPopup;
