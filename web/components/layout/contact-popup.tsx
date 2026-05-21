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
        "flex gap-3 items-center bg-[#F5F5F5] rounded-lg py-3 pl-3 pr-4 transition-colors w-full",
        "hover:bg-[#EBEBEB]"
      )}
    >
      {/* Icon */}
      <div className="w-[5.5rem] h-[5.5rem] flex-shrink-0 overflow-hidden rounded-md">
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
      <div className="flex flex-col gap-1 flex-grow text-left min-w-0">
        <div className="text-base font-bold text-black leading-tight">
          {option.title}
        </div>
        {option.description && (
          <div className="text-sm font-medium text-[#6B6B6B] leading-snug">
            {option.description}
          </div>
        )}
      </div>

      {/* Arrow */}
      <div className="flex items-center flex-shrink-0">
        <ChevronRight className="w-4 h-4 text-[#C4C4C4]" />
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

          {/* Modal - slides from top */}
          <motion.div
            initial={{ opacity: 0, y: "-100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "-100%" }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="fixed top-0 left-0 right-0 z-[90] flex justify-center overflow-y-auto overflow-x-hidden"
            style={{ maxHeight: "95vh" }}
          >
            <div className="bg-white w-full max-w-[31.75rem] relative overflow-hidden rounded-b-lg">
              {/* Close button */}
              <button
                type="button"
                onClick={onClose}
                className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>

              {/* Content */}
              <div className="px-6 pt-10 pb-6 flex flex-col gap-3">
                {/* Title */}
                <h2 className="text-xl font-bold text-center text-[#333] max-w-[90%] mx-auto break-words">
                  {data.title}
                </h2>

                {/* Options */}
                <div className="flex flex-col gap-2">
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
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default ContactPopup;
