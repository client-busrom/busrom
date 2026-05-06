"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Upload } from "lucide-react";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { cn } from "@/lib/utils";


interface RichTextSegment {
  text: string;
  bold?: boolean;
}

interface FormField {
  fieldName: string;
  fieldType: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
  order?: number;
}

interface FormConfig {
  id: string;
  name: string;
  fields: any; // Change to any to handle nested/localized structures
  submitButtonText?: string;
  successMessage?: string;
  errorMessage?: string;
  data?: { fields: any };
}

interface Props {
  locale?: string;
  bgImage?: string;
  displayImage?: string;
  logoImage?: string;
  richText?: RichTextSegment[];
  formId?: string;
  formConfig?: any;
}

// Precision CSS Values (Global Constants)
const CARD_W = 1380;
const CARD_H = 800;
const LEFT_W = 490;
const RIGHT_W = 730;
const PADDING_L = 50;
const PADDING_R = 50;
const GAP_Y = 14;
const GAP_X = 33;
const INPUT_PX = 24;
const MARGIN_TOP_L = 75;
const MARGIN_TOP_R = 87;

// Custom Dropdown for "Beautification"
function CustomDropdown({
  field,
  value,
  onChange,
}: {
  field: FormField;
  value: string;
  onChange: (v: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = field.options?.find((opt) => opt.value === value);
  const isScenario =
    field.fieldName.includes("scenario") || field.label?.includes("Scenario");

  return (
    <div ref={containerRef} className="relative w-full font-montserrat">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between cursor-pointer font-semibold text-white transition-all hover:bg-black/10"
        style={{
          height: isMobile ? "48px" : "50px",
          backgroundColor: "rgba(33, 28, 11, 0.2)",
          paddingLeft: isMobile ? "16px" : "17px",
          paddingRight: isMobile ? "16px" : "17px",
          borderRadius: "10px",
        }}
      >
        <span
          className={
            !value && !isScenario
              ? "text-white/50 truncate flex-1"
              : "text-white truncate flex-1"
          }
          style={{ fontSize: "16px" }}
        >
          {selectedOption
            ? selectedOption.label
            : isScenario && field.options?.[0]
              ? field.options[0].label
              : field.label || field.placeholder}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={isMobile ? 16 : 20} className="text-white" />
        </motion.div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute left-0 w-full bg-[#34311c] z-[100] shadow-xl overflow-hidden border border-white/10"
            style={{
              top: isMobile ? "52px" : "39px",
              borderRadius: "10px",
            }}
          >
            <div
              className="max-h-[200px] overflow-y-auto"
              style={{
                paddingTop: isMobile ? "4px" : "4px",
                paddingBottom: isMobile ? "4px" : "4px",
              }}
            >
              {field.options?.map((opt) => (
                <div
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center px-6 hover:bg-white/10 cursor-pointer text-white font-medium transition-colors"
                  style={{
                    height: isMobile ? "40px" : "32px",
                    fontSize: isMobile ? "14px" : "11px",
                    paddingLeft: isMobile ? "16px" : "17px",
                    paddingRight: isMobile ? "16px" : "17px",
                  }}
                >
                  <span className="truncate flex-1">{opt.label}</span>
                  {value === opt.value && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ApplicationContactFormSection({
  locale = "en",
  bgImage,
  displayImage,
  logoImage,
  richText,
  formId,
  formConfig: propFormConfig,
}: Props) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [fileName, setFileName] = useState("");
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  const formConfig = useMemo(() => {
    return propFormConfig;
  }, [propFormConfig]);

  const privacyText =
    formConfig?.privacyText ||
    formConfig?.data?.privacyText ||
    formConfig?.privacyConsentText ||
    formConfig?.data?.privacyConsentText;

  const handlePrivacyToggle = (val: boolean) => {
    setPrivacyAccepted(val);
  };

  // Handle initial form data state from fields
  useEffect(() => {
    if (formConfig) {
      const rawFields = formConfig?.fields || formConfig?.data?.fields;
      if (rawFields) {
        const fieldsArr = Array.isArray(rawFields)
          ? rawFields
          : rawFields[locale] || rawFields["en"] || [];
        const initialData: Record<string, any> = {};
        if (Array.isArray(fieldsArr)) {
          fieldsArr.forEach((f: FormField) => {
            const isScenario =
              f.fieldName.includes("scenario") || f.label?.includes("Scenario");
            if (isScenario && f.options?.[0]) {
              initialData[f.fieldName] = f.options[0].value;
            } else {
              initialData[f.fieldName] = "";
            }
          });
          setFormData(initialData);
        }
      }
    }
  }, [formConfig, locale]);

  const handleInputChange = (fieldName: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setFormData((prev) => ({ ...prev, upload: file }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/form-submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formId,
          formName: formConfig?.name || "app-form",
          data: formData,
          locale,
          sourcePage: window.location.href,
        }),
      });
      if (res.ok) setSubmitStatus("success");
    } catch (err) {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderSegment = (segment: RichTextSegment, idx: number) => {
    if (segment.bold) {
      return (
        <span
          key={idx}
          className="text-[#D6CD88] font-cherry-bomb not-italic text-[1.12em] tracking-tight inline whitespace-pre-line"
          style={{
            WebkitTextStroke: `1.5px #514a0d`,
            paintOrder: "stroke fill",
          }}
        >
          {segment.text}
        </span>
      );
    }
    return (
      <span key={idx} className="font-cherry-bomb inline whitespace-pre-line">
        {segment.text}
      </span>
    );
  };

  const renderField = (field: FormField) => {
    const commonStyles: React.CSSProperties = {
      height: isMobile ? "48px" : "50px",
      backgroundColor: "rgba(33, 28, 11, 0.2)",
      paddingLeft: isMobile ? "16px" : "17px",
      paddingRight: isMobile ? "16px" : "17px",
      borderRadius: "10px",
      display: "flex",
      alignItems: "center",
      color: "white",
    };

    if (field.fieldType === "select") {
      const isScenario =
        field.fieldName.includes("scenario") ||
        field.label?.includes("Scenario");
      return (
        <div
          key={field.fieldName}
          className="flex flex-col font-montserrat"
          style={{ gap: isScenario ? (isMobile ? "8px" : "7px") : 0 }}
        >
          {isScenario && (
            <span
              className="font-bold text-black"
              style={{ fontSize: "16px" }}
            >
              {field.label}
            </span>
          )}
          <CustomDropdown
            field={field}
            value={formData[field.fieldName] || ""}
            onChange={(v) => handleInputChange(field.fieldName, v)}
          />
        </div>
      );
    }

    if (
      field.fieldName.includes("phone") ||
      field.fieldType === "tel" ||
      field.fieldType === "phone"
    ) {
      return (
        <div key={field.fieldName} className="font-montserrat">
          <PhoneInput
            value={formData[field.fieldName] || ""}
            onChange={(val) => handleInputChange(field.fieldName, val)}
            placeholder={field.placeholder?.trim() || field.label}
            style={{
              height: isMobile ? "48px" : "50px",
              borderRadius: isMobile ? "10px" : "10px",
            }}
            className="!bg-[rgba(33,28,11,0.2)] border-none"
            buttonClassName={cn(
              isMobile ? "!pl-[4.1vw] !pr-1" : "!pl-[17px] !pr-2",
            )}
            inputClassName={cn(
              "!bg-transparent !text-white !font-montserrat !font-semibold !placeholder-white/50 !pl-2 [&:-webkit-autofill]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill:hover]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill:focus]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill:active]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s]",
              `![font-size:16px]`,
            )}
            dialCodeClassName={cn(
              "!text-white !font-montserrat !font-semibold [&:-webkit-autofill]:[-webkit-text-fill-color:white!important]",
              `![font-size:16px]`,
            )}
            chevronClassName="!text-white"
          />
        </div>
      );
    }

    if (field.fieldType === "textarea") {
      return (
        <div
          key={field.fieldName}
          className="flex flex-col font-montserrat"
          style={{ gap: isMobile ? "8px" : "7px" }}
        >
          <span
            className="font-bold text-black"
            style={{ fontSize: "16px" }}
          >
            {field.label}
          </span>
          <textarea
            placeholder={field.placeholder?.trim() || field.label}
            className="w-full font-semibold text-white placeholder:text-white/50 outline-none resize-none"
            spellCheck="false"
            style={{
              height: isMobile ? "120px" : "91px",
              backgroundColor: "rgba(33, 28, 11, 0.2)",
              borderRadius: "10px",
              fontSize: "16px",
              paddingLeft: isMobile ? "16px" : "17px",
              paddingRight: isMobile ? "16px" : "17px",
              paddingTop: isMobile ? "14px" : "13px",
            }}
            value={formData[field.fieldName] || ""}
            onChange={(e) => handleInputChange(field.fieldName, e.target.value)}
          />
        </div>
      );
    }

    return (
      <div
        key={field.fieldName}
        className="flex flex-col font-montserrat"
        style={{ gap: isMobile ? "8px" : "7px" }}
      >
        <div style={commonStyles}>
          <input
            type={field.fieldType === "email" ? "email" : "text"}
            placeholder={field.placeholder?.trim() || field.label}
            spellCheck="false"
            className="w-full font-semibold text-white placeholder:text-white/50 outline-none !bg-transparent [&:-webkit-autofill]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill:hover]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill:focus]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill:active]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s]"
            style={{ fontSize: "16px" }}
            value={formData[field.fieldName] || ""}
            onChange={(e) => handleInputChange(field.fieldName, e.target.value)}
          />
        </div>
      </div>
    );
  };

  const sortedFields = useMemo(() => {
    const rawFields = formConfig?.fields || formConfig?.data?.fields;
    if (!rawFields) return [];

    const fieldsArr = Array.isArray(rawFields)
      ? rawFields
      : rawFields[locale] || rawFields["en"] || [];

    if (!Array.isArray(fieldsArr)) return [];

    return [...fieldsArr]
      .filter(
        (f) =>
          !f.fieldName?.toLowerCase().includes("upload") &&
          !f.label?.toLowerCase().includes("upload"),
      )
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [formConfig, locale]);

  const uploadField = useMemo(() => {
    const rawFields = formConfig?.fields || formConfig?.data?.fields;
    if (!rawFields) return null;
    const fieldsArr = Array.isArray(rawFields)
      ? rawFields
      : rawFields[locale] || rawFields["en"] || [];
    return fieldsArr.find(
      (f: any) =>
        f.fieldType === "file" ||
        f.fieldName?.toLowerCase().includes("upload") ||
        f.label?.toLowerCase().includes("upload"),
    );
  }, [formConfig, locale]);

  const submitButtonText =
    formConfig?.submitButtonText ||
    formConfig?.data?.submitButtonText ||
    (locale === "zh" ? "提交申请" : "Submit Application");

  const submittingText =
    formConfig?.submittingText ||
    formConfig?.data?.submittingText ||
    (locale === "zh" ? "发送中..." : "Sending...");

  const uploadLabel =
    fileName ||
    uploadField?.label ||
    uploadField?.placeholder ||
    (locale === "zh" ? "上传文件" : "Upload File");

  const successMessage =
    formConfig?.successMessage ||
    formConfig?.data?.successMessage ||
    (locale === "zh" ? "提交成功！" : "Submitted successfully!");

  const errorMessage =
    formConfig?.errorMessage ||
    formConfig?.data?.errorMessage ||
    (locale === "zh" ? "提交失败，请重试。" : "Submission failed, please try again.");

  return (
    <section
      className="relative w-full flex items-start justify-center select-none z-20"
      style={{
        minHeight: "756px",
        height: "auto",
        backgroundColor: "#000000",
        paddingBottom: "154px",
      }}
    >

      <div className="absolute inset-0">
        {bgImage ? (
          <img
            src={bgImage}
            alt="Bg"
            className="w-full h-full object-cover blur-[8px]"
          />
        ) : (
          <div className="w-full h-full bg-[#756F3F]" />
        )}
      </div>
      {logoImage && (
        <div
          className="absolute w-full flex justify-center z-0 pointer-events-none"
          style={{ bottom: isMobile ? "-40px" : "-112px" }}
        >
          <img
            src={logoImage}
            alt="Logo"
            className={cn(
              "object-contain",
              isMobile ? "w-[120%] max-w-none opacity-50" : "w-[96%]",
            )}
          />
        </div>
      )}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        className={cn(
          "relative z-10 flex backdrop-blur-[15px] mx-auto autofill-muted",
          isMobile ? "flex-col mt-[40px]" : "flex-row items-stretch mt-[60px]",
        )}
        style={{
          width: isMobile ? "92vw" : "1036px",
          maxWidth: isMobile ? "800px" : "none",
          minHeight: isMobile ? "auto" : "560px",
          height: "auto",
          borderRadius: isMobile ? "30px" : "41px",
          backgroundColor: "rgba(255, 255, 255, 0.92)",
          paddingLeft: isMobile ? "20px" : "35px",
          paddingRight: isMobile ? "20px" : "35px",
          paddingTop: isMobile ? "30px" : "53px",
          paddingBottom: isMobile ? "30px" : "35px",
        }}
      >
        {/* LEFT COMPONENT */}
        <div
          className={cn("flex flex-col", isMobile ? "items-center text-center" : "")}
          style={{
            width: isMobile ? "100%" : "343px",
            marginBottom: isMobile ? "30px" : 0,
          }}
        >
          <div
            className="font-cherry-bomb font-black text-[#1D1A02] leading-[1.4] whitespace-pre-line block"
            style={{ fontSize: isMobile ? "24px" : "25px", width: "100%" }}
          >
            {(() => {
              // Filter out the marker text if it's accidentally included in segments
              const displaySegments = (richText || []).filter(
                (s) =>
                  s.text &&
                  s.text.trim().toLowerCase() !== "contact-form-title",
              );

              if (
                displaySegments.length > 0 &&
                displaySegments.some((s) => s.text && s.text.trim())
              ) {
                return displaySegments.map((segment, i) =>
                  renderSegment(segment, i),
                );
              }
              return (
                <span>
                  Whether For{" "}
                  <span className="text-[#D6CD88] font-bold">
                    Engineering Solutions
                  </span>{" "}
                  Or Innovative Customization.
                </span>
              );
            })()}
          </div>

          <div
            className={cn(
              "overflow-hidden rounded-[35px] border-4 border-[#F6F4ED]",
              isMobile ? "mt-5" : "mt-auto",
            )}
            style={{
              width: isMobile ? "100%" : "343px",
              height: isMobile ? "200px" : "220px",
              marginBottom: 0,
            }}
          >
            {displayImage ? (
              <img
                src={displayImage}
                alt="Form"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-[#E5E7EB]" />
            )}
          </div>
        </div>

        {/* RIGHT FORM */}
        <div
          className="flex flex-col"
          style={{
            width: isMobile ? "100%" : "600px",
            marginLeft: isMobile ? 0 : "23px",
          }}
        >
          <form onSubmit={handleSubmit} className="flex flex-col h-full">
            <div
              className={cn(
                "grid w-full",
                isMobile ? "grid-cols-1" : "grid-cols-2"
              )}
              style={{
                gap: isMobile ? "12px" : "7px",
                columnGap: isMobile ? "12px" : "16px",
              }}
            >
              {(sortedFields || []).map((field: FormField, index: number) => {
                const isFullWidth = index >= 4 || field.fieldType === "textarea";
                return (
                  <div
                    key={field.fieldName}
                    className={cn(isFullWidth && !isMobile ? "col-span-2" : "col-span-1")}
                  >
                    {renderField(field)}
                  </div>
                );
              })}
            </div>

            <div
              className="flex flex-col md:flex-row md:items-center"
              style={{
                marginTop: isMobile ? "16px" : "12px",
                gap: isMobile ? "12px" : "15px",
              }}
            >
              <div className="flex flex-col">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.jpg,.png"
                />
                <label
                  htmlFor="file-upload"
                  className="flex items-center justify-center cursor-pointer transition-all border border-[#B2A224] text-[#B2A224] hover:bg-[#B2A224] hover:text-white group"
                  style={{
                    height: isMobile ? "44px" : "34px",
                    paddingLeft: isMobile ? "24px" : "22px",
                    paddingRight: isMobile ? "24px" : "22px",
                    borderRadius: "9999px",
                    gap: isMobile ? "8px" : "7px",
                    width: isMobile ? "100%" : "auto",
                  }}
                >
                  <svg
                    width={isMobile ? "18" : "14"}
                    height={isMobile ? "18" : "14"}
                    viewBox="0 0 25 25"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="currentColor flex-shrink-0"
                  >
                    <path
                      d="M6.90476 0C7.03571 0 7.14286 0.107143 7.14286 0.238095V1.54762C7.14286 1.61077 7.11777 1.67133 7.07312 1.71598C7.02847 1.76063 6.96791 1.78571 6.90476 1.78571H4.7619C3.99496 1.78576 3.25764 2.08187 2.7037 2.6123C2.14977 3.14272 1.82198 3.86652 1.78869 4.63274L1.78571 4.7619V20.2381C1.78576 21.005 2.08187 21.7424 2.6123 22.2963C3.14272 22.8502 3.86652 23.178 4.63274 23.2113L4.7619 23.2143H20.2381C21.005 23.2142 21.7424 22.9181 22.2963 22.3877C22.8502 21.8573 23.178 21.1335 23.2113 20.3673L23.2143 20.2381V4.7619C23.2142 3.99496 22.9181 3.25764 22.3877 2.7037C21.8573 2.14977 21.1335 1.82198 20.3673 1.78869L20.2381 1.78571H18.6905C18.6592 1.78571 18.6282 1.77956 18.5994 1.76759C18.5705 1.75563 18.5442 1.73809 18.5221 1.71598C18.5 1.69387 18.4825 1.66762 18.4705 1.63873C18.4585 1.60985 18.4524 1.57889 18.4524 1.54762V0.238095C18.4524 0.107143 18.5595 0 18.6905 0H20.2381C21.501 0 22.7122 0.501699 23.6053 1.39473C24.4983 2.28776 25 3.49897 25 4.7619V20.2381C25 21.501 24.4983 22.7122 23.6053 23.6053C22.7122 24.4983 21.501 25 20.2381 25H4.7619C3.49897 25 2.28776 24.4983 1.39473 23.6053C0.501699 22.7122 0 21.501 0 20.2381V4.7619C0 3.49897 0.501699 2.28776 1.39473 1.39473C2.28776 0.501699 3.49897 0 4.7619 0H6.90476ZM12.8238 0L12.894 0.00833337C13.0095 0.0291667 13.1202 0.0839286 13.2095 0.173214L18.3821 5.34583C18.4044 5.36798 18.4221 5.39432 18.4342 5.42334C18.4462 5.45235 18.4524 5.48346 18.4524 5.51488V7.36667C18.4524 7.41378 18.4385 7.45985 18.4123 7.49904C18.3862 7.53823 18.349 7.56878 18.3054 7.58681C18.2619 7.60485 18.214 7.60957 18.1678 7.60036C18.1216 7.59116 18.0791 7.56845 18.0458 7.53512L13.6905 3.17976V15.875C13.6905 15.9063 13.6843 15.9372 13.6724 15.9661C13.6604 15.995 13.6428 16.0212 13.6207 16.0434C13.5986 16.0655 13.5724 16.083 13.5435 16.095C13.5146 16.1069 13.4836 16.1131 13.4524 16.1131H12.1429C12.0797 16.1131 12.0191 16.088 11.9745 16.0434C11.9298 15.9987 11.9048 15.9381 11.9048 15.875V3.1619L7.54941 7.51726C7.51611 7.5506 7.47366 7.5733 7.42745 7.58251C7.38124 7.59171 7.33334 7.58699 7.28981 7.56896C7.24628 7.55092 7.20908 7.52037 7.18292 7.48119C7.15676 7.442 7.14282 7.39593 7.14286 7.34881V5.49762C7.14283 5.46634 7.14897 5.43537 7.16092 5.40646C7.17287 5.37756 7.1904 5.35129 7.2125 5.32917L12.3679 0.173214C12.4708 0.0700321 12.6081 0.00836919 12.7536 0H12.8238Z"
                      fill="currentColor"
                    />
                  </svg>
                  <span
                    className="font-bold whitespace-nowrap"
                    style={{ fontSize: isMobile ? "14px" : "11px" }}
                  >
                    {uploadLabel}
                  </span>
                </label>
              </div>

              {privacyText && (
                <label className="flex items-start gap-2 cursor-pointer group">
                  <div className="relative mt-0.5">
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      checked={privacyAccepted}
                      onChange={(e) => setPrivacyAccepted(e.target.checked)}
                    />
                    <div className="w-4 h-4 border-2 border-[#B2A224] rounded flex items-center justify-center transition-colors peer-checked:bg-[#B2A224]">
                      {privacyAccepted && (
                        <svg
                          className="w-3 h-3 text-white"
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
                  </div>
                  <span
                    className="text-[#5E552C] opacity-70 group-hover:opacity-100 transition-opacity"
                    style={{ fontSize: isMobile ? "12px" : "10px" }}
                  >
                    {privacyText}
                  </span>
                </label>
              )}
            </div>

            <div
              className="flex flex-col"
              style={{ marginTop: isMobile ? "24px" : "22px" }}
            >
              <motion.button
                type="submit"
                animate={
                  !isSubmitting
                    ? { rotate: [0, -3, 3, -3, 3, 0] }
                    : { rotate: 0 }
                }
                whileHover={{ scale: 1.02, rotate: 0 }}
                style={{ transformOrigin: "center" }}
                transition={{
                  rotate: {
                    duration: 0.5,
                    repeat: Infinity,
                    repeatDelay: 2,
                    ease: "linear",
                  },
                }}
                disabled={isSubmitting || (!!privacyText && !privacyAccepted)}
                className={cn(
                  "w-full bg-[#B2A224] text-white py-4 rounded-full font-anaheim font-bold hover:bg-[#9A8C1E] transition-colors flex items-center justify-center disabled:opacity-50",
                  isMobile ? "text-[18px]" : "text-[20px]",
                  !!privacyText && !privacyAccepted && "grayscale opacity-80",
                )}
              >
                {isSubmitting ? submittingText : submitButtonText}
              </motion.button>
              {submitStatus === "success" && (
                <p className="text-green-700 text-center font-bold mt-2">
                  {successMessage}
                </p>
              )}
              {submitStatus === "error" && (
                <p className="text-red-700 text-center font-bold mt-2">
                  {errorMessage}
                </p>
              )}
            </div>
          </form>
        </div>
      </motion.div>
    </section>
  );
}
