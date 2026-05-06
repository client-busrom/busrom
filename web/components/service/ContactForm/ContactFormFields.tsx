import React from "react";
import Image from "next/image";
import { PhoneInput, COUNTRIES } from "@/components/ui/PhoneInput";
import { ChevronDown } from "lucide-react";
import { FormField } from "./types";
import { serviceTypeIcons } from "./constants";

interface DesktopFieldProps {
  field: FormField | null | undefined;
  formData: Record<string, any>;
  handleChange: (fieldName: string, value: any) => void;
  handleCheckboxChange: (fieldName: string, value: string, checked: boolean) => void;
  handleFileUpload: (fieldName: string, files: FileList | null, field: FormField) => void;
  uploadedAttachments: any[];
  pendingFiles: Record<string, File[]>;
  uploadingFiles: Record<string, boolean>;
  uploadProgress: Record<string, number>;
  submitting: boolean;
  locale: string;
}

export const DesktopField: React.FC<DesktopFieldProps> = ({
  field,
  formData,
  handleChange,
  handleCheckboxChange,
  handleFileUpload,
  uploadingFiles,
  uploadProgress,
  uploadedAttachments,
  pendingFiles,
  submitting,
  locale,
}) => {
  if (!field) return null;

  const inputBaseStyle: React.CSSProperties = {
    width: "100%",
    height: "50px",
    paddingLeft: "16px",
    paddingRight: "16px",
    borderRadius: "10px",
    backgroundColor: "rgba(33, 28, 11, 0.2)",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    color: "white",
    fontFamily: "var(--font-anaheim)",
    fontWeight: 600,
    fontSize: "16px",
  };

  const textareaStyle: React.CSSProperties = {
    width: "100%",
    height: "100px",
    paddingLeft: "16px",
    paddingRight: "16px",
    paddingTop: "12px",
    paddingBottom: "12px",
    borderRadius: "10px",
    backgroundColor: "rgba(33, 28, 11, 0.2)",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    color: "white",
    fontFamily: "var(--font-anaheim)",
    fontWeight: 600,
    fontSize: "16px",
    resize: "none" as const,
  };

  const checkboxItemStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    height: "50px",
    paddingLeft: "16px",
    paddingRight: "16px",
    borderRadius: "10px",
    backgroundColor: "rgba(33, 28, 11, 0.2)",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    cursor: "pointer",
    transition: "all 0.2s",
  };

  const checkboxItemActiveStyle: React.CSSProperties = {
    ...checkboxItemStyle,
    backgroundColor: "rgba(33, 28, 11, 0.5)",
  };

  switch (field.fieldType) {
    case "text":
    case "email":
    case "tel":
    case "phone":
    case "country": {
      const fieldTypeLower = field.fieldType?.toLowerCase();
      const fieldNameLower = field.fieldName?.toLowerCase();
      const isPhoneField =
        fieldTypeLower === "phone" ||
        fieldTypeLower === "tel" ||
        fieldNameLower?.includes("phone") ||
        fieldNameLower?.includes("whatsapp");
      const isCountryField =
        fieldTypeLower === "country" ||
        fieldNameLower?.includes("country") ||
        fieldNameLower?.includes("region");

      if (isPhoneField) {
        return (
          <div className="dynamic-phone-input" style={{ width: "100%" }}>
            <PhoneInput
              value={formData[field.fieldName] || ""}
              onChange={(phone) => handleChange(field.fieldName, phone)}
              placeholder={field.placeholder?.trim() || field.label}
              required={field.required}
              disabled={submitting}
              className="!bg-[#211C1133] !border-white/30 !rounded-[10px] !h-[50px]"
              buttonClassName="!bg-transparent !border-white/10 !text-white hover:!bg-white/5"
              inputClassName="!bg-transparent !text-white !placeholder-white/50 !font-anaheim !font-semibold !text-base autofill-muted [&:-webkit-autofill]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill:hover]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill:focus]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill:active]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s]"
              dialCodeClassName="!text-white !text-base"
            />
          </div>
        );
      }

      if (isCountryField) {
        return (
          <div className="relative" style={{ width: "100%" }}>
            <select
              id={field.fieldName}
              name={field.fieldName}
              value={formData[field.fieldName] || ""}
              onChange={(e) => handleChange(field.fieldName, e.target.value)}
              required={field.required}
              className="font-anaheim font-semibold appearance-none bg-[#211C1133] border border-white/30 text-white w-full placeholder:text-white/50 focus:outline-none focus:border-white/60 transition-colors"
              style={{
                height: "50px",
                borderRadius: "10px",
                paddingLeft: "16px",
                paddingRight: "32px",
                fontSize: "16px",
              }}
            >
              <option value="" className="text-black">
                Select Country/Region...
              </option>
              {COUNTRIES.map(([name, iso2, dialCode]) => {
                return (
                  <option key={iso2} value={name} className="text-black">
                    {name} (+{dialCode})
                  </option>
                );
              })}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-white/50">
              <ChevronDown size={20} />
            </div>
          </div>
        );
      }

      if (isCountryField) {
        return (
          <div className="relative autofill-muted" style={{ width: "100%" }}>
            <select
              id={field.fieldName}
              name={field.fieldName}
              value={formData[field.fieldName] || ""}
              onChange={(e) => handleChange(field.fieldName, e.target.value)}
              required={field.required}
              className="font-anaheim font-semibold appearance-none bg-[#211C1133] border border-white/30 text-white w-full placeholder:text-white/50 focus:outline-none focus:border-white/60 transition-colors"
              style={{
                height: "50px",
                borderRadius: "10px",
                paddingLeft: "16px",
                paddingRight: "32px",
                fontSize: "16px",
              }}
            >
              <option value="" className="text-black">
                Select Country/Region...
              </option>
              {COUNTRIES.map(([name, iso2, dialCode]) => {
                return (
                  <option key={iso2} value={name} className="text-black">
                    {name} (+{dialCode})
                  </option>
                );
              })}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-white/50">
              <ChevronDown size={20} />
            </div>
          </div>
        );
      }

      return (
        <input
          type={field.fieldType}
          id={field.fieldName}
          name={field.fieldName}
          value={formData[field.fieldName] || ""}
          spellCheck="false"
          onChange={(e) => handleChange(field.fieldName, e.target.value)}
          placeholder={field.placeholder?.trim() || field.label}
          required={field.required}
          style={inputBaseStyle}
          className="placeholder:text-white/50 focus:outline-none focus:border-white/60 transition-colors autofill-muted [&:-webkit-autofill]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill:hover]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill:focus]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill:active]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s]"
        />
      );
    }

    case "textarea":
      return (
        <div
          style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          className="autofill-muted"
        >
          <label
            className="font-anaheim font-semibold text-white"
            style={{ fontSize: "16px" }}
          >
            {field.label}
          </label>
          <textarea
            id={field.fieldName}
            name={field.fieldName}
            value={formData[field.fieldName] || ""}
            spellCheck="false"
            onChange={(e) => handleChange(field.fieldName, e.target.value)}
            placeholder={field.placeholder?.trim() || field.label}
            required={field.required}
            style={textareaStyle}
            className="placeholder:text-white/70 focus:outline-none focus:border-white/60 transition-colors [&:-webkit-autofill]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill:hover]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill:focus]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill:active]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s] resize-none"
          />
        </div>
      );

    case "radio":
      return (
        <div
          style={{ display: "flex", flexDirection: "column", gap: "12px" }}
        >
          <label
            className="font-anaheim font-semibold text-white"
            style={{ fontSize: "16px" }}
          >
            {field.label}
          </label>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px",
            }}
          >
            {field.options?.map((option: any) => {
              const isSelected = formData[field.fieldName] === option.value;
              return (
                <label
                  key={option.value}
                  style={
                    isSelected ? checkboxItemActiveStyle : checkboxItemStyle
                  }
                  className="hover:bg-[#211C0B]/30"
                >
                  <div
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      border: "2px solid",
                      borderColor: isSelected
                        ? "white"
                        : "rgba(255, 255, 255, 0.7)",
                      backgroundColor: isSelected ? "white" : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.2s",
                    }}
                  >
                    {isSelected && (
                      <div
                        style={{
                          width: "12px",
                          height: "12px",
                          borderRadius: "50%",
                          backgroundColor: "#6E6839",
                        }}
                      />
                    )}
                  </div>
                  <span
                    className="font-anaheim font-semibold"
                    style={{
                      fontSize: "16px",
                      color: isSelected
                        ? "white"
                        : "rgba(255, 255, 255, 0.7)",
                    }}
                  >
                    {option.label}
                  </span>
                  <input
                    type="radio"
                    name={field.fieldName}
                    value={option.value}
                    checked={isSelected}
                    onChange={(e) =>
                      handleChange(field.fieldName, e.target.value)
                    }
                    className="hidden"
                  />
                </label>
              );
            })}
          </div>
          {field.options?.some(
            (o: any) =>
              formData[field.fieldName] === o.value && o.hasCustomInput,
          ) && (
            <input
              type="text"
              value={formData[`${field.fieldName}_custom`] || ""}
              spellCheck="false"
              onChange={(e) =>
                handleChange(`${field.fieldName}_custom`, e.target.value)
              }
              placeholder={
                locale === "zh" ? "请详细说明..." : "Please specify..."
              }
              style={inputBaseStyle}
              className="placeholder:text-white/50 focus:outline-none focus:border-white/60 transition-colors mt-2 w-full"
              required
            />
          )}
        </div>
      );

    case "checkbox": {
      // Check if allowMultiple is false - behave like radio
      const isSingleSelect = field.allowMultiple === false;

      return (
        <div
          style={{ display: "flex", flexDirection: "column", gap: "12px" }}
        >
          <label
            className="font-anaheim font-semibold text-white"
            style={{ fontSize: "16px" }}
          >
            {field.label}
          </label>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px",
            }}
          >
            {field.options?.map((option: any) => {
              const isSelected = isSingleSelect
                ? formData[field.fieldName] === option.value
                : (formData[field.fieldName] || []).includes(option.value);

              // Get icon for this option
              const iconSrc = serviceTypeIcons[option.value];

              return (
                <div key={option.value} className="flex flex-col gap-2">
                  <label
                    style={
                      isSelected ? checkboxItemActiveStyle : checkboxItemStyle
                    }
                    className="hover:bg-[#211C0B]/30 h-full"
                  >
                    {/* Icon instead of checkbox/radio indicator */}
                    <div
                      style={{
                        width: "25px",
                        height: "25px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {iconSrc ? (
                        <Image
                          src={iconSrc}
                          alt={option.label}
                          width={28}
                          height={28}
                          style={{
                            width: "20px",
                            height: "20px",
                            opacity: isSelected ? 1 : 0.7,
                          }}
                        />
                      ) : (
                        <div
                          style={{
                             width: "24px",
                             height: "24px",
                             borderRadius: isSingleSelect ? "50%" : "6px",
                            border: "2px solid",
                            borderColor: isSelected
                              ? "white"
                              : "rgba(255, 255, 255, 0.7)",
                            backgroundColor: isSelected
                              ? "white"
                              : "transparent",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "all 0.2s",
                          }}
                        >
                          {isSelected && isSingleSelect && (
                            <div
                              style={{
                                 width: "12px",
                                 height: "12px",
                                borderRadius: "50%",
                                backgroundColor: "#6E6839",
                              }}
                            />
                          )}
                        </div>
                      )}
                    </div>
                    <span
                      className="font-anaheim font-semibold relative"
                      style={{
                        fontSize: "16px",
                        color: isSelected
                          ? "white"
                          : "rgba(255, 255, 255, 0.7)",
                        whiteSpace: "normal",
                        display: "block",
                        lineHeight: "1.2",
                        top: "1px",
                      }}
                    >
                      {option.label}
                    </span>
                    <input
                      type={isSingleSelect ? "radio" : "checkbox"}
                      name={field.fieldName}
                      value={option.value}
                      checked={isSelected}
                      onChange={(e) => {
                        if (isSingleSelect) {
                          handleChange(field.fieldName, e.target.value);
                        } else {
                          handleCheckboxChange(
                            field.fieldName,
                            option.value,
                            e.target.checked,
                          );
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                  {isSelected && option.hasCustomInput && (
                    <input
                      type="text"
                      value={
                        formData[
                          `${field.fieldName}_custom_${option.value}`
                        ] || ""
                      }
                      spellCheck="false"
                      onChange={(e) =>
                        handleChange(
                          `${field.fieldName}_custom_${option.value}`,
                          e.target.value,
                        )
                      }
                      placeholder={
                        locale === "zh"
                          ? "请详细说明..."
                          : "Please specify..."
                      }
                      style={{ ...inputBaseStyle, height: "42px" }}
                      className="placeholder:text-white/50 focus:outline-none focus:border-white/60 transition-colors mt-2 ml-4 !w-[calc(100%-1rem)]"
                      required
                    />
                  )}
                </div>
              );
            })}
          </div>
          {isSingleSelect &&
            field.options?.some(
              (o: any) =>
                formData[field.fieldName] === o.value && o.hasCustomInput,
            ) && (
              <input
                type="text"
                value={formData[`${field.fieldName}_custom`] || ""}
                spellCheck="false"
                onChange={(e) =>
                  handleChange(`${field.fieldName}_custom`, e.target.value)
                }
                placeholder={
                  locale === "zh" ? "请详细说明..." : "Please specify..."
                }
                style={inputBaseStyle}
                className="placeholder:text-white/50 focus:outline-none focus:border-white/60 transition-colors mt-2 w-full"
                required
              />
            )}
        </div>
      );
    }

    case "file":
      return (
        <div
          style={{ display: "flex", flexDirection: "column", gap: "12px" }}
        >
          <label
            htmlFor={field.fieldName}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "63px",
              padding: "10px 16px",
              borderRadius: "10px",
              cursor: "pointer",
            }}
            className="bg-[#211C0B]/50 border border-dashed border-white/30 transition-all duration-200 hover:bg-[#211C0B]/70 hover:border-white/60 hover:scale-[1.02]"
          >
            <span
              className="font-anaheim font-semibold text-white/50 text-center"
              style={{ fontSize: "16px", whiteSpace: "pre-wrap" }}
            >
              {uploadingFiles[field.fieldName]
                ? "Uploading..."
                : (Object.keys(pendingFiles).includes(field.fieldName) && pendingFiles[field.fieldName].length > 0) || 
                  uploadedAttachments.filter(a => a.fieldName === field.fieldName).length > 0
                  ? `${(pendingFiles[field.fieldName]?.length || 0) + uploadedAttachments.filter(a => a.fieldName === field.fieldName).length} file(s) selected`
                  : field.placeholder || "Upload File"}
            </span>
            <input
              type="file"
              id={field.fieldName}
              name={field.fieldName}
              onChange={(e) =>
                handleFileUpload(field.fieldName, e.target.files, field)
              }
              accept={field.validation?.accept}
              multiple={field.validation?.multiple}
              disabled={uploadingFiles[field.fieldName]}
              className="hidden"
            />
          </label>
        </div>
      );

    default:
      return null;
  }
};

interface MobileFieldProps {
  field: FormField | null | undefined;
  formData: Record<string, any>;
  handleChange: (fieldName: string, value: any) => void;
  handleCheckboxChange: (fieldName: string, value: string, checked: boolean) => void;
  handleFileUpload: (fieldName: string, files: FileList | null, field: FormField) => void;
  uploadedAttachments: any[];
  pendingFiles: Record<string, File[]>;
  uploadingFiles: Record<string, boolean>;
  uploadProgress: Record<string, number>;
  submitting: boolean;
  locale: string;
}

export const MobileField: React.FC<MobileFieldProps> = ({
  field,
  formData,
  handleChange,
  handleCheckboxChange,
  handleFileUpload,
  uploadingFiles,
  uploadProgress,
  uploadedAttachments,
  pendingFiles,
  submitting,
  locale,
}) => {
  if (!field) return null;

  switch (field.fieldType) {
    case "text":
    case "email":
    case "tel":
    case "phone":
    case "country": {
      const fieldTypeLower = field.fieldType?.toLowerCase();
      const fieldNameLower = field.fieldName?.toLowerCase();
      const isPhoneField =
        fieldTypeLower === "phone" ||
        fieldTypeLower === "tel" ||
        fieldNameLower?.includes("phone") ||
        fieldNameLower?.includes("whatsapp");
      const isCountryField =
        fieldTypeLower === "country" ||
        fieldNameLower?.includes("country") ||
        fieldNameLower?.includes("region");

      if (isPhoneField) {
        return (
          <div className="dynamic-phone-input" style={{ width: "100%" }}>
            <PhoneInput
              value={formData[field.fieldName] || ""}
              onChange={(phone) => handleChange(field.fieldName, phone)}
              placeholder={field.placeholder?.trim() || field.label}
              required={field.required}
              disabled={submitting}
              className="!bg-[#211C1133] !border-white/30 !rounded-[12px] !h-[52px]"
              buttonClassName="!bg-transparent !border-white/10 !text-white hover:!bg-white/5"
              inputClassName="!bg-transparent !text-white !placeholder-white/50 !font-anaheim !font-semibold !text-base autofill-muted [&:-webkit-autofill]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill:hover]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill:focus]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill:active]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s]"
              dialCodeClassName="!text-white !text-base"
            />
          </div>
        );
      }

      if (isCountryField) {
        return (
          <div className="relative" style={{ width: "100%" }}>
            <select
              id={`mobile-${field.fieldName}`}
              name={field.fieldName}
              value={formData[field.fieldName] || ""}
              onChange={(e) => handleChange(field.fieldName, e.target.value)}
              required={field.required}
              className="font-anaheim font-semibold appearance-none bg-[#211C1133] border border-white/30 text-white w-full h-[52px] px-[16px] rounded-[12px] placeholder:text-white/50 focus:outline-none focus:border-white/60 transition-colors"
            >
              <option value="" className="text-black">
                Select Country/Region...
              </option>
              {COUNTRIES.map(([name, iso2, dialCode]) => {
                return (
                  <option key={iso2} value={name} className="text-black">
                    {name} (+{dialCode})
                  </option>
                );
              })}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-white/50">
              <ChevronDown size={18} />
            </div>
          </div>
        );
      }

      return (
        <input
          type={field.fieldType}
          id={`mobile-${field.fieldName}`}
          name={field.fieldName}
          value={formData[field.fieldName] || ""}
          spellCheck="false"
          onChange={(e) => handleChange(field.fieldName, e.target.value)}
          placeholder={field.placeholder?.trim() || field.label}
          required={field.required}
          className="w-full h-[52px] px-[16px] rounded-[12px] bg-[#211C0B]/20 border border-white/30 text-white font-anaheim font-semibold text-[16px] placeholder:text-white/50 focus:outline-none focus:border-white/60 transition-colors autofill-muted [&:-webkit-autofill]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill:hover]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill:focus]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill:active]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s]"
        />
      );
    }

    case "textarea":
      return (
        <div className="space-y-[12px] autofill-muted">
          <label className="font-anaheim font-semibold text-[16px] text-white">
            {field.label}
          </label>
          <textarea
            id={`mobile-${field.fieldName}`}
            name={field.fieldName}
            value={formData[field.fieldName] || ""}
            spellCheck="false"
            onChange={(e) => handleChange(field.fieldName, e.target.value)}
            placeholder={field.placeholder || field.label}
            required={field.required}
            className="w-full h-[100px] px-[16px] py-[12px] rounded-[12px] bg-[#211C0B]/20 border border-white/30 text-white font-anaheim font-semibold text-[16px] placeholder:text-white/70 focus:outline-none focus:border-white/60 transition-colors resize-none [&:-webkit-autofill]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill:hover]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill:focus]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill:active]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s] resize-none"
          />
        </div>
      );

    case "radio":
      return (
        <div className="space-y-[12px]">
          <label className="font-anaheim font-semibold text-[16px] text-white">
            {field.label}
          </label>
          <div className="grid grid-cols-2 gap-[10px]">
            {field.options?.map((option: any) => {
              const isSelected = formData[field.fieldName] === option.value;
              return (
                <label
                  key={option.value}
                  className={`flex items-center gap-[12px] h-[52px] px-[16px] rounded-[12px] border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-[#211C0B]/50 border-white/30"
                      : "bg-[#211C0B]/20 border-white/30 hover:bg-[#211C0B]/30"
                  }`}
                >
                  <div
                    className={`w-[24px] h-[24px] rounded-full border-2 flex items-center justify-center transition-colors ${
                      isSelected ? "bg-white border-white" : "border-white/70"
                    }`}
                  >
                    {isSelected && (
                      <div className="w-[10px] h-[10px] rounded-full bg-[#6E6839]" />
                    )}
                  </div>
                  <span
                    className={`font-anaheim font-semibold text-[14px] flex-1 ${
                      isSelected ? "text-white" : "text-white/70"
                    }`}
                  >
                    {option.label}
                  </span>
                  <input
                    type="radio"
                    name={field.fieldName}
                    value={option.value}
                    checked={isSelected}
                    onChange={(e) =>
                      handleChange(field.fieldName, e.target.value)
                    }
                    className="hidden"
                  />
                </label>
              );
            })}
          </div>
          {field.options?.some(
            (o: any) =>
              formData[field.fieldName] === o.value && o.hasCustomInput,
          ) && (
            <input
              type="text"
              value={formData[`${field.fieldName}_custom`] || ""}
              spellCheck="false"
              onChange={(e) =>
                handleChange(`${field.fieldName}_custom`, e.target.value)
              }
              placeholder={
                locale === "zh" ? "请详细说明..." : "Please specify..."
              }
              className="w-full h-[52px] px-[16px] rounded-[12px] bg-[#211C0B]/20 border border-white/30 text-white font-anaheim font-semibold text-[16px] placeholder:text-white/50 focus:outline-none focus:border-white/60 transition-colors mt-2"
              required
            />
          )}
        </div>
      );

    case "checkbox": {
      const isSingleSelect = field.allowMultiple === false;

      return (
        <div className="space-y-[12px]">
          <label className="font-anaheim font-semibold text-[16px] text-white">
            {field.label}
          </label>
          <div className="grid grid-cols-2 gap-[10px]">
            {field.options?.map((option: any) => {
              const isSelected = isSingleSelect
                ? formData[field.fieldName] === option.value
                : (formData[field.fieldName] || []).includes(option.value);

              const iconSrc = serviceTypeIcons[option.value];

              return (
                <div key={option.value} className="flex flex-col gap-2">
                  <label
                    className={`flex items-center gap-[12px] h-[52px] px-[16px] rounded-[12px] border cursor-pointer transition-all ${
                      isSelected
                        ? "bg-[#211C0B]/50 border-white/30"
                        : "bg-[#211C0B]/20 border-white/30 hover:bg-[#211C0B]/30"
                    }`}
                  >
                    <div className="w-[24px] h-[24px] flex items-center justify-center">
                      {iconSrc ? (
                        <Image
                          src={iconSrc}
                          alt={option.label}
                          width={20}
                          height={20}
                          className="w-[20px] h-[20px]"
                          style={{ opacity: isSelected ? 1 : 0.7 }}
                        />
                      ) : (
                        <div
                          className={`w-[24px] h-[24px] ${isSingleSelect ? "rounded-full" : "rounded-[4px]"} border-2 flex items-center justify-center transition-colors ${
                            isSelected
                              ? "bg-white border-white"
                              : "border-white/70"
                          }`}
                        >
                          {isSelected && isSingleSelect && (
                            <div className="w-[10px] h-[10px] rounded-full bg-[#6E6839]" />
                          )}
                        </div>
                      )}
                    </div>
                    <span
                      className={`font-anaheim font-semibold text-[14px] flex-1 ${
                        isSelected ? "text-white" : "text-white/70"
                      }`}
                    >
                      {option.label}
                    </span>
                    <input
                      type={isSingleSelect ? "radio" : "checkbox"}
                      name={field.fieldName}
                      value={option.value}
                      checked={isSelected}
                      onChange={(e) => {
                        if (isSingleSelect) {
                          handleChange(field.fieldName, e.target.value);
                        } else {
                          handleCheckboxChange(
                            field.fieldName,
                            option.value,
                            e.target.checked,
                          );
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                  {isSelected && option.hasCustomInput && (
                    <input
                      type="text"
                      value={
                        formData[
                          `${field.fieldName}_custom_${option.value}`
                        ] || ""
                      }
                      onChange={(e) =>
                        handleChange(
                          `${field.fieldName}_custom_${option.value}`,
                          e.target.value,
                        )
                      }
                      placeholder={
                        locale === "zh"
                          ? "请详细说明..."
                          : "Please specify..."
                      }
                      className="w-full h-[52px] px-[16px] rounded-[12px] bg-[#211C0B]/20 border border-white/30 text-white font-anaheim font-semibold text-[16px] placeholder:text-white/50 focus:outline-none focus:border-white/60 transition-colors mt-2 ml-4 !w-[calc(100%-1rem)]"
                      required
                    />
                  )}
                </div>
              );
            })}
          </div>
          {isSingleSelect &&
            field.options?.some(
              (o: any) =>
                formData[field.fieldName] === o.value && o.hasCustomInput,
            ) && (
              <input
                type="text"
                value={formData[`${field.fieldName}_custom`] || ""}
                onChange={(e) =>
                  handleChange(`${field.fieldName}_custom`, e.target.value)
                }
                placeholder={
                  locale === "zh" ? "请详细说明..." : "Please specify..."
                }
                className="w-full h-[52px] px-[16px] rounded-[12px] bg-[#211C0B]/20 border border-white/30 text-white font-anaheim font-semibold text-[16px] placeholder:text-white/50 focus:outline-none focus:border-white/60 transition-colors mt-2"
                required
              />
            )}
        </div>
      );
    }

    case "file":
      return (
        <div className="space-y-[12px]">
          <label
            htmlFor={`mobile-${field.fieldName}`}
            className="flex items-center justify-center min-h-[52px] h-auto py-[12px] px-[16px] rounded-[12px] bg-[#211C0B]/50 border border-dashed border-white/30 cursor-pointer transition-all hover:bg-[#211C0B]/70"
          >
            <span className="font-anaheim font-semibold text-white/50 text-center text-[14px]">
              {uploadingFiles[field.fieldName]
                ? "Uploading..."
                : (Object.keys(pendingFiles).includes(field.fieldName) && pendingFiles[field.fieldName].length > 0) || 
                  uploadedAttachments.filter(a => a.fieldName === field.fieldName).length > 0
                  ? `${(pendingFiles[field.fieldName]?.length || 0) + uploadedAttachments.filter(a => a.fieldName === field.fieldName).length} file(s) selected`
                  : field.placeholder || "Upload File"}
            </span>
            <input
              type="file"
              id={`mobile-${field.fieldName}`}
              name={field.fieldName}
              onChange={(e) =>
                handleFileUpload(field.fieldName, e.target.files, field)
              }
              accept={field.validation?.accept}
              multiple={field.validation?.multiple}
              disabled={uploadingFiles[field.fieldName]}
              className="hidden"
            />
          </label>
        </div>
      );

    default:
      return null;
  }
};
