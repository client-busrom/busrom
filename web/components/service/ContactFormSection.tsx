"use client";

import React from "react";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { Turnstile } from "@/components/ui/turnstile";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

import {
  ContactFormSectionProps,
  FormField,
  RichText,
} from "./ContactForm/types";
import { useContactForm } from "./ContactForm/useContactForm";
import { DesktopField, MobileField } from "./ContactForm/ContactFormFields";
import { HollowText } from "@/components/common/HollowText";

export function ContactFormSection({
  locale,
  formName,
  formConfig: initialFormConfig,
  backgroundImage,
  title = [] as RichText[],
  description = "",
  footerNote = "",
  displayName,
  subtitle = "",
  info = [] as string[],
}: ContactFormSectionProps) {
  const {
    formConfig,
    formData,
    loading,
    submitting,
    submitted,
    error,
    uploadingFiles,
    uploadedAttachments,
    pendingFiles,
    privacyAccepted,
    isGloballyAccepted,
    turnstileToken,
    uploadProgress,
    shouldShowCaptcha,
    handlePrivacyToggle,
    handleTurnstileVerify,
    handleTurnstileError,
    handleTurnstileExpire,
    handleChange,
    handleCheckboxChange,
    handleFileUpload,
    handleSubmit,
    getFieldsByType,
  } = useContactForm(initialFormConfig, formName || "service-inquiry", locale);

  const fields = getFieldsByType();

  // Custom styled input field for desktop
  const renderField = (field: FormField | null | undefined) => {
    return (
      <DesktopField
        key={field?.fieldName}
        field={field}
        formData={formData}
        handleChange={handleChange}
        handleCheckboxChange={handleCheckboxChange}
        handleFileUpload={handleFileUpload}
        uploadingFiles={uploadingFiles}
        uploadProgress={uploadProgress}
        uploadedAttachments={uploadedAttachments}
        pendingFiles={pendingFiles}
        submitting={submitting}
        locale={locale}
      />
    );
  };

  const renderMobileField = (field: FormField | null | undefined) => {
    return (
      <MobileField
        field={field}
        formData={formData}
        handleChange={handleChange}
        handleCheckboxChange={handleCheckboxChange}
        handleFileUpload={handleFileUpload}
        uploadingFiles={uploadingFiles}
        uploadProgress={uploadProgress}
        uploadedAttachments={uploadedAttachments}
        pendingFiles={pendingFiles}
        submitting={submitting}
        locale={locale}
      />
    );
  };

  const renderContactItem = (text: string) => {
    // 检测邮箱
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;
    const emailMatch = text.match(emailRegex);
    if (emailMatch) {
      const email = emailMatch[0];
      const parts = text.split(email);
      return (
        <>
          {parts[0]}
          <a
            href={`mailto:${email}`}
            className="underline decoration-1 underline-offset-4 hover:text-[#FFEF72] transition-colors"
          >
            {email}
          </a>
          {parts[1]}
        </>
      );
    }

    // 检测电话 (匹配常见的电话格式)
    const phoneRegex = /(\+?[0-9][0-9\s-]{6,15}[0-9])/g;
    const phoneMatch = text.match(phoneRegex);
    // 只有在明确包含电话关键词或加号时才作为电话处理，避免误伤
    if (
      phoneMatch &&
      (text.toLowerCase().includes("tel") ||
        text.toLowerCase().includes("phone") ||
        text.includes("+"))
    ) {
      const phone = phoneMatch[0];
      const parts = text.split(phone);
      return (
        <>
          {parts[0]}
          <a
            href={`tel:${phone.replace(/\s/g, "")}`}
            className="underline decoration-1 underline-offset-4 hover:text-[#FFEF72] transition-colors"
          >
            {phone}
          </a>
          {parts[1]}
        </>
      );
    }

    return text;
  };

  return (
    <section
      id="contact-form"
      className="relative w-full overflow-hidden"
      style={{ minHeight: "645px" }}
    >
      {/* ==================== Mobile Layout ==================== */}
      <div className="lg:hidden relative">
        {/* Background */}
        <div className="absolute inset-0 bg-[#6E6839]">
          {backgroundImage &&
            (backgroundImage?.enableLink && backgroundImage?.linkUrl ? (
              <Link
                href={backgroundImage.linkUrl as any}
                target={backgroundImage?.openInNewTab ? "_blank" : undefined}
                rel={
                  backgroundImage?.openInNewTab
                    ? "noopener noreferrer"
                    : undefined
                }
                className="block w-full h-full"
              >
                <OptimizedImage
                  image={backgroundImage as any}
                  alt="Contact form background"
                  size="large"
                  className="w-full h-full object-cover opacity-50"
                />
              </Link>
            ) : (
              <OptimizedImage
                image={backgroundImage as any}
                alt="Contact form background"
                size="large"
                className="w-full h-full object-cover opacity-50"
              />
            ))}
          {/* Mobile Content */}
        <div className="relative px-5 py-12 flex flex-col items-center">
          {/* Header */}
          <div className="mb-14 text-center max-w-[640px] w-full">
            <h2 className="font-anaheim font-extrabold text-[42px] leading-[1.1] text-white mb-4 whitespace-pre-line">
              {title.map((segment, idx) =>
                segment.hollow ? (
                  <HollowText key={idx} strokeColor="#FFEF72" strokeWidth={0.8}>
                    {segment.text}
                  </HollowText>
                ) : (
                  <span
                    key={idx}
                    style={{
                      WebkitTextStroke: "2px #FFEF72",
                      paintOrder: "stroke fill",
                    }}
                  >
                    {segment.text}
                  </span>
                ),
              )}
            </h2>

            {(subtitle || displayName) && (
              <p className="font-anaheim font-bold text-[18px] text-[#FFF071] leading-tight">
                {subtitle || displayName}
              </p>
            )}
            {description && (
              <p className="font-anaheim text-white/80 text-[14px] mt-4 leading-relaxed">
                {description}
              </p>
            )}
          </div>

          {/* Form wrapper for tablet width control */}
          <div className="w-full max-w-[640px]">
            {/* Form */}
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            ) : submitted ? (
              <div className="bg-white/20 backdrop-blur-sm rounded-[12px] p-6 text-center">
                <svg
                  className="w-12 h-12 text-[#FFF071] mx-auto mb-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="font-anaheim font-bold text-[24px] text-white mb-2">
                  {locale === "zh" ? "提交成功！" : "Success!"}
                </h3>
                <p className="font-anaheim text-white/80 text-[16px]">
                  {formConfig?.successMessage ||
                    (locale === "zh"
                      ? "您的消息已成功发送！"
                      : "Your message has been sent successfully!")}
                </p>
              </div>
            ) : (
              <form
                onSubmit={(e) => handleSubmit(e, locale)}
                className="space-y-[12px]"
              >
                {fields.nameEmail.slice(0, 2).map((field) => (
                  <div key={field.fieldName}>{renderMobileField(field)}</div>
                ))}
                {fields.serviceType && renderMobileField(fields.serviceType)}
                {fields.description && renderMobileField(fields.description)}
                {fields.file && renderMobileField(fields.file)}

                {shouldShowCaptcha && formConfig?.captchaSiteKey && (
                  <div className="flex justify-center py-3">
                    <Turnstile
                      siteKey={formConfig.captchaSiteKey}
                      onVerify={handleTurnstileVerify}
                      onError={handleTurnstileError}
                      onExpire={handleTurnstileExpire}
                      theme={formConfig.captchaTheme}
                      size="compact"
                      language={locale === "zh" ? "zh-CN" : locale}
                    />
                  </div>
                )}

                {error && (
                  <div className="bg-red-500/20 border border-red-500/50 rounded-[12px] p-3 text-red-200 text-sm">
                    {error}
                  </div>
                )}

                {formConfig?.privacyConsentText && (
                  <div
                    className="flex items-center gap-3 py-2 cursor-pointer"
                    onClick={() => handlePrivacyToggle(!privacyAccepted)}
                  >
                    <div
                      className={cn(
                        "w-5 h-5 shrink-0 rounded border-2 border-white/30 flex items-center justify-center transition-all",
                        privacyAccepted && "bg-[#B2A224] border-[#B2A224]",
                      )}
                    >
                      {privacyAccepted && (
                        <svg
                          className="w-3.5 h-3.5 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                    <p className="text-[13px] leading-relaxed text-white/80 select-none">
                      {formConfig.privacyConsentText}
                    </p>
                  </div>
                )}

                <motion.button
                  initial={{ rotate: 0, scale: 1 }}
                  animate={{ rotate: [0, -3, 3, -3, 3, 0] }}
                  whileHover={{
                    rotate: 0,
                    scale: 1.08,
                    transition: { scale: { duration: 0.3, ease: "easeOut" } },
                  }}
                  transition={{
                    rotate: {
                      duration: 0.5,
                      repeat: Infinity,
                      repeatDelay: 2,
                      ease: "easeInOut",
                    },
                  }}
                  type="submit"
                  disabled={
                    submitting ||
                    (shouldShowCaptcha && !turnstileToken) ||
                    (!!formConfig?.privacyConsentText && !privacyAccepted)
                  }
                  className={cn(
                    "w-full min-h-[52px] py-3 rounded-[100px] bg-[#B2A224] text-white font-anaheim font-semibold text-[16px] leading-tight hover:bg-[#9A8C1E] transition-all flex items-center justify-center text-center",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    !!formConfig?.privacyConsentText &&
                      !privacyAccepted &&
                      "grayscale",
                  )}
                >
                  {submitting
                    ? formConfig?.submittingText ||
                      (locale === "zh" ? "发送中..." : "Sending...")
                    : formConfig?.submitButtonText ||
                      (locale === "zh" ? "提交咨询" : "Send Inquiry")}
                </motion.button>
              </form>
            )}

            {/* Contact Info & Tips (Unordered Lists) */}
            <div className="mt-6 pt-5 border-t border-white/20 space-y-6">
              {/* contact-form-info */}
              {info && info.length > 0 && (
                <ul className="space-y-2">
                  {info.map((item, index) => (
                    <li
                      key={index}
                      className="font-anaheim font-semibold text-[18px] text-white"
                    >
                      {renderContactItem(item)}
                    </li>
                  ))}
                </ul>
              )}

              {/* contact-form-tips */}
              {footerNote && (
                <p className="font-anaheim font-semibold text-[11px] leading-[18px] text-white/70 whitespace-pre-line">
                  {footerNote}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>

      {/* ==================== Desktop Layout ==================== */}
      <div
        className="hidden lg:block relative w-full"
        style={{ minHeight: "645px" }}
      >
        {/* Background */}
        <div className="absolute inset-0 bg-[#6E6839]">
          {backgroundImage && (
            <OptimizedImage
              image={backgroundImage as any}
              alt="Contact form background"
              size="xlarge"
              className="w-full h-full object-cover opacity-50"
            />
          )}
          <div
            className="absolute inset-0"
            style={{ backdropFilter: `blur(5px)` }}
          />
        </div>

        {/* Content Wrapper */}
        <div
          className="relative z-10 mx-auto py-[42px]"
          style={{ width: "1344px" }}
        >
          <div
            className="mx-auto flex overflow-hidden"
            style={{
              width: "1120px",
              minHeight: "560px",
              borderRadius: "36px",
              backdropFilter: `blur(13px)`,
              background: "rgba(117, 111, 63, 0.36)",
              padding: "39px 0",
              position: "relative",
            }}
          >
            {/* Background Glow */}
            <svg
              className="absolute pointer-events-none"
              style={{
                left: "-713px",
                top: "182px",
                width: "1521px",
                height: "1580px",
              }}
              viewBox="0 0 2173 2257"
              fill="none"
            >
              <defs>
                <radialGradient
                  id="contactGlow"
                  cx="50%"
                  cy="50%"
                  r="50%"
                  fx="50%"
                  fy="50%"
                >
                  <stop offset="0%" stopColor="#CFBE38" stopOpacity="0.93" />
                  <stop offset="100%" stopColor="#998D2D" stopOpacity="0" />
                </radialGradient>
              </defs>
              <ellipse
                cx="1086.5"
                cy="1128.5"
                rx="1086.5"
                ry="1128.26"
                fill="url(#contactGlow)"
              />
            </svg>

            <div className="relative w-full flex">
              {/* Left Column */}
              <div
                style={{ width: "476px", flexShrink: 0, paddingLeft: "67px" }}
              >
                <h2
                  className="font-anaheim font-extrabold text-white whitespace-pre-line"
                  style={{
                    fontSize: "56px",
                    lineHeight: "67px",
                    marginBottom: "7px",
                  }}
                >
                  {title.map((segment, idx) =>
                    segment.hollow ? (
                      <HollowText
                        key={idx}
                        strokeColor="#FFEF72"
                        strokeWidth={1.5}
                      >
                        {segment.text}
                      </HollowText>
                    ) : (
                      <span
                        key={idx}
                        style={{
                          WebkitTextStroke: "1.1px #FFEF72",
                          paintOrder: "stroke fill",
                        }}
                      >
                        {segment.text}
                      </span>
                    ),
                  )}
                </h2>

                {(subtitle || formConfig?.displayName || displayName) && (
                  <p
                    className="font-anaheim font-extrabold"
                    style={{
                      marginTop: "14px",
                      fontSize: "28px",
                      lineHeight: "38px",
                      color: "#FFF071",
                    }}
                  >
                    {subtitle || formConfig?.displayName || displayName}
                  </p>
                )}

                {(formConfig?.description || description) && (
                  <p
                    className="font-anaheim font-normal text-white"
                    style={{
                      marginTop: "32px",
                      width: "333px",
                      fontSize: "17px",
                      lineHeight: "25px",
                    }}
                  >
                    {formConfig?.description || description}
                  </p>
                )}

                {/* contact-form-info List */}
                {info && info.length > 0 && (
                  <ul style={{ marginTop: "56px" }} className="space-y-4">
                    {info.map((item, index) => (
                      <li
                        key={index}
                        className="font-anaheim font-semibold text-white"
                        style={{ fontSize: "25px" }}
                      >
                        {renderContactItem(item)}
                      </li>
                    ))}
                  </ul>
                )}

                {/* contact-form-tips */}
                {footerNote && (
                  <p
                    className="font-anaheim font-semibold text-white/70 whitespace-pre-line"
                    style={{
                      marginTop: "56px",
                      width: "300px",
                      fontSize: "11px",
                      lineHeight: "18px",
                    }}
                  >
                    {footerNote}
                  </p>
                )}
              </div>

              {/* Right Column */}
              <div
                style={{ flex: 1, paddingRight: "67px", paddingLeft: "35px" }}
              >
                <h3
                  className="font-anaheim font-semibold text-white"
                  style={{
                    fontSize: "30px",
                    lineHeight: "43px",
                    marginBottom: "30px",
                  }}
                >
                  {subtitle}
                </h3>

                {loading ? (
                  <div className="flex items-center justify-center p-12">
                    <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : submitted ? (
                  <div
                    className="bg-white/20 backdrop-blur-sm p-12 text-center"
                    style={{ borderRadius: "11px" }}
                  >
                    <h3 className="text-2xl font-bold text-white mb-4">
                      {locale === "zh" ? "提交成功！" : "Success!"}
                    </h3>
                    <p className="text-white/80">
                      {formConfig?.successMessage ||
                        (locale === "zh"
                          ? "您的消息已成功发送！"
                          : "Your message has been sent successfully!")}
                    </p>
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => handleSubmit(e, locale)}
                    className="flex flex-col"
                    style={{ gap: "14px" }}
                  >
                    <div className="grid grid-cols-2" style={{ gap: "14px" }}>
                      {fields.nameEmail.slice(0, 2).map((field) => (
                        <div key={field.fieldName}>{renderField(field)}</div>
                      ))}
                    </div>

                    {fields.serviceType && renderField(fields.serviceType)}
                    {fields.description && renderField(fields.description)}
                    {fields.file && renderField(fields.file)}

                    {shouldShowCaptcha && formConfig?.captchaSiteKey && (
                      <div className="flex justify-center">
                        <Turnstile
                          siteKey={formConfig.captchaSiteKey}
                          onVerify={handleTurnstileVerify}
                          onError={handleTurnstileError}
                          onExpire={handleTurnstileExpire}
                          theme={formConfig.captchaTheme}
                          size={formConfig.captchaSize}
                          language={locale === "zh" ? "zh-CN" : locale}
                        />
                      </div>
                    )}

                    {error && (
                      <div className="bg-red-500/20 p-4 rounded-xl text-red-200 text-sm">
                        {error}
                      </div>
                    )}

                    {formConfig?.privacyConsentText && (
                      <div
                        className="flex items-center gap-3 my-2 cursor-pointer"
                        onClick={() => handlePrivacyToggle(!privacyAccepted)}
                      >
                        <div
                          className={cn(
                            "flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-all",
                            privacyAccepted
                              ? "bg-white border-white"
                              : "border-white/30",
                          )}
                        >
                          {privacyAccepted && (
                            <svg
                              className="w-3.5 h-3.5 text-[#6E6839]"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={4}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </div>
                        <p className="text-[14px] leading-relaxed text-white/80 select-none">
                          {formConfig.privacyConsentText}
                        </p>
                      </div>
                    )}

                    <motion.button
                      initial={{ rotate: 0, scale: 1 }}
                      animate={{ rotate: [0, -3, 3, -3, 3, 0] }}
                      whileHover={{
                        rotate: 0,
                        scale: 1.08,
                        transition: {
                          scale: { duration: 0.3, ease: "easeOut" },
                        },
                      }}
                      transition={{
                        rotate: {
                          duration: 0.5,
                          repeat: Infinity,
                          repeatDelay: 2,
                          ease: "linear",
                        },
                      }}
                      type="submit"
                      disabled={
                        submitting ||
                        (!!formConfig?.privacyConsentText && !privacyAccepted)
                      }
                      className={cn(
                        "w-full bg-[#B2A224] text-white font-anaheim font-bold hover:bg-[#9A8C1E] transition-colors flex items-center justify-center text-center",
                        "disabled:opacity-50 disabled:cursor-not-allowed",
                        !!formConfig?.privacyConsentText &&
                          !privacyAccepted &&
                          "grayscale",
                      )}
                      style={{
                        borderRadius: "70px",
                        fontSize: "22px",
                        minHeight: "67px",
                        paddingTop: "14px",
                        paddingBottom: "14px",
                        paddingLeft: "28px",
                        paddingRight: "28px",
                        lineHeight: 1.2,
                        transformOrigin: "center",
                      }}
                    >
                      {submitting
                        ? formConfig?.submittingText ||
                          (locale === "zh" ? "发送中..." : "Sending...")
                        : formConfig?.submitButtonText ||
                          (locale === "zh" ? "提交咨询" : "Send Inquiry")}
                    </motion.button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
