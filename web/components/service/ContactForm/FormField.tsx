import React from "react";
import Image from "next/image";
import { PhoneInput, COUNTRIES } from "@/components/ui/PhoneInput";
import { ChevronDown } from "lucide-react";
import { FormField as FormFieldType } from "./types";
import { serviceTypeIcons } from "./constants";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  field: FormFieldType;
  formData: Record<string, any>;
  handleChange: (fieldName: string, value: any) => void;
  handleCheckboxChange: (
    fieldName: string,
    value: string,
    checked: boolean,
  ) => void;
  handleFileUpload: (
    fieldName: string,
    files: FileList | null,
    field: FormFieldType,
  ) => void;
  uploadingFiles: Record<string, boolean>;
  uploadedAttachments: any[];
  submitting: boolean;
  locale: string;
  isMobile?: boolean;
  vw?: (px: number) => string;
}

export const FormField: React.FC<FormFieldProps> = ({
  field,
  formData,
  handleChange,
  handleCheckboxChange,
  handleFileUpload,
  uploadingFiles,
  uploadedAttachments,
  submitting,
  locale,
  isMobile,
  vw = (px: number) => `${px}px`,
}) => {
  const inputBaseStyle: React.CSSProperties = {
    backgroundColor: "rgba(33, 28, 11, 0.2)",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    color: "white",
    width: "100%",
    height: vw(90),
    borderRadius: vw(12),
    padding: `0 ${vw(28)}`,
    fontSize: vw(22),
    fontWeight: 600,
  };

  const checkboxItemStyle: React.CSSProperties = {
    backgroundColor: "rgba(33, 28, 11, 0.2)",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    borderRadius: vw(12),
    display: "flex",
    alignItems: "center",
    padding: `0 ${vw(24)}`,
    height: vw(85),
    gap: vw(20),
    cursor: "pointer",
    transition: "all 0.2s",
  };

  const checkboxItemActiveStyle: React.CSSProperties = {
    ...checkboxItemStyle,
    backgroundColor: "rgba(33, 28, 11, 0.5)",
  };

  // Mobile Classes
  const mobileInputClass =
    "w-full h-[52px] px-[16px] rounded-[12px] bg-[#211C0B]/20 border border-white/30 text-white font-anaheim font-semibold text-[16px] placeholder:text-white/50 focus:outline-none focus:border-white/60 transition-colors";
  const mobileTextareaClass =
    "w-full h-[100px] px-[16px] py-[12px] rounded-[12px] bg-[#211C0B]/20 border border-white/30 text-white font-anaheim font-semibold text-[16px] placeholder:text-white/50 focus:outline-none focus:border-white/60 transition-colors resize-none";
  const mobileCheckboxItemClass =
    "flex items-center gap-[12px] h-[52px] px-[16px] rounded-[12px] bg-[#211C0B]/20 border border-white/30 cursor-pointer transition-all hover:bg-[#211C0B]/30";
  const mobileCheckboxItemActiveClass =
    "flex items-center gap-[12px] h-[52px] px-[16px] rounded-[12px] bg-[#211C0B]/50 border border-white/30 cursor-pointer";

  const renderDesktop = () => {
    switch (field.fieldType) {
      case "text":
      case "email":
      case "tel":
      case "phone":
      case "country": {
        const isPhoneField =
          field.fieldType === "phone" ||
          field.fieldType === "tel" ||
          field.fieldName.toLowerCase().includes("phone") ||
          field.fieldName.toLowerCase().includes("whatsapp");
        const isCountryField =
          field.fieldType === "country" ||
          field.fieldName.toLowerCase().includes("country") ||
          field.fieldName.toLowerCase().includes("region");

        if (isPhoneField) {
          return (
            <div
              className="dynamic-phone-input w-full"
              style={{ height: vw(90) }}
            >
              <PhoneInput
                value={formData[field.fieldName] || ""}
                onChange={(phone) => handleChange(field.fieldName, phone)}
                placeholder={field.placeholder || field.label}
                required={field.required}
                disabled={submitting}
                className="!bg-[#211C1133] !border-white/30 !rounded-[12px] !h-full"
                buttonClassName="!bg-transparent !border-white/10 !text-white hover:!bg-white/5"
                inputClassName="!bg-transparent !text-white !placeholder-white/50 !font-anaheim !font-semibold [&:-webkit-autofill]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill:hover]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill:focus]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill:active]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s]"
                dialCodeClassName="!text-white"
              />
            </div>
          );
        }

        if (isCountryField) {
          return (
            <div className="relative w-full">
              <select
                id={field.fieldName}
                name={field.fieldName}
                value={formData[field.fieldName] || ""}
                onChange={(e) => handleChange(field.fieldName, e.target.value)}
                required={field.required}
                style={inputBaseStyle}
                className="font-anaheim font-semibold appearance-none placeholder:text-white/50 focus:outline-none focus:border-white/60 transition-colors"
              >
                <option value="" className="text-black">
                  Select Country/Region...
                </option>
                {COUNTRIES.map(([name, iso2, dialCode]) => (
                  <option key={iso2} value={name} className="text-black">
                    {name} (+{dialCode})
                  </option>
                ))}
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
            id={field.fieldName}
            name={field.fieldName}
            value={formData[field.fieldName] || ""}
            spellCheck="false"
            onChange={(e) => handleChange(field.fieldName, e.target.value)}
            placeholder={field.placeholder || field.label}
            required={field.required}
            style={inputBaseStyle}
            className="placeholder:text-white/50 focus:outline-none focus:border-white/60 transition-colors [&:-webkit-autofill]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill:hover]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill:focus]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill:active]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s]"
          />
        );
      }

      case "textarea":
        return (
          <textarea
            id={field.fieldName}
            name={field.fieldName}
            value={formData[field.fieldName] || ""}
            spellCheck="false"
            onChange={(e) => handleChange(field.fieldName, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            style={{
              ...inputBaseStyle,
              height: vw(260),
              paddingTop: vw(28),
              resize: "none",
            }}
            className="placeholder:text-white/50 focus:outline-none focus:border-white/60 transition-colors [&:-webkit-autofill]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill:hover]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill:focus]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill:active]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s]"
          />
        );

      case "checkbox": {
        const isSingleSelect = field.allowMultiple === false;
        return (
          <div
            style={{ display: "flex", flexDirection: "column", gap: vw(16) }}
          >
            <label
              className="font-anaheim font-semibold text-white"
              style={{ fontSize: vw(23) }}
            >
              {field.label}
            </label>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: vw(14),
              }}
            >
              {field.options?.map((option) => {
                const isSelected = isSingleSelect
                  ? formData[field.fieldName] === option.value
                  : (formData[field.fieldName] || []).includes(option.value);
                const iconSrc = serviceTypeIcons[option.value];
                return (
                  <div key={option.value} className="flex flex-col gap-2">
                    <label
                      style={
                        isSelected ? checkboxItemActiveStyle : checkboxItemStyle
                      }
                      className="hover:bg-[#211C0B]/30 h-full"
                    >
                      <div
                        style={{
                          width: vw(36),
                          height: vw(36),
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
                              width: vw(28),
                              height: vw(28),
                              opacity: isSelected ? 1 : 0.7,
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: vw(34),
                              height: vw(34),
                              borderRadius: isSingleSelect ? "50%" : vw(6),
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
                                  width: vw(16),
                                  height: vw(16),
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
                          fontSize: vw(22),
                          color: isSelected
                            ? "white"
                            : "rgba(255, 255, 255, 0.7)",
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
                        onChange={(e) =>
                          isSingleSelect
                            ? handleChange(field.fieldName, e.target.value)
                            : handleCheckboxChange(
                                field.fieldName,
                                option.value,
                                e.target.checked,
                              )
                        }
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
                        style={{ ...inputBaseStyle, height: vw(60) }}
                        className="placeholder:text-white/50 focus:outline-none focus:border-white/60 mt-2 ml-4 !w-[calc(100%-1rem)]"
                        required
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      }

      case "file":
        return (
          <div
            style={{ display: "flex", flexDirection: "column", gap: vw(16) }}
          >
            <label
              htmlFor={field.fieldName}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: vw(90),
                borderRadius: vw(15),
                cursor: "pointer",
              }}
              className="bg-[#211C0B]/50 border border-dashed border-white/30 transition-all duration-200 hover:bg-[#211C0B]/70 hover:border-white/60 hover:scale-[1.02]"
            >
              <span
                className="font-anaheim font-semibold text-white/50"
                style={{ fontSize: vw(20) }}
              >
                {uploadingFiles[field.fieldName]
                  ? "Uploading..."
                  : uploadedAttachments.filter(
                        (a) => a.fieldName === field.fieldName,
                      ).length > 0
                    ? `${uploadedAttachments.filter((a) => a.fieldName === field.fieldName).length} file(s) uploaded`
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

  const renderMobile = () => {
    switch (field.fieldType) {
      case "text":
      case "email":
      case "tel":
      case "phone":
      case "country": {
        const isPhoneField =
          field.fieldType === "phone" ||
          field.fieldType === "tel" ||
          field.fieldName.toLowerCase().includes("phone") ||
          field.fieldName.toLowerCase().includes("whatsapp");
        const isCountryField =
          field.fieldType === "country" ||
          field.fieldName.toLowerCase().includes("country") ||
          field.fieldName.toLowerCase().includes("region");

        if (isPhoneField) {
          return (
            <div className="dynamic-phone-input w-full">
              <PhoneInput
                value={formData[field.fieldName] || ""}
                onChange={(phone) => handleChange(field.fieldName, phone)}
                placeholder={field.placeholder || field.label}
                required={field.required}
                disabled={submitting}
                className="!bg-[#211C1133] !border-white/30 !rounded-[12px] !h-[52px]"
                buttonClassName="!bg-transparent !border-white/10 !text-white hover:!bg-white/5"
                inputClassName="!bg-transparent !text-white !placeholder-white/50 !font-anaheim !font-semibold !text-base [&:-webkit-autofill]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill:hover]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill:focus]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill:active]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s]"
                dialCodeClassName="!text-white !text-base"
              />
            </div>
          );
        }

        if (isCountryField) {
          return (
            <div className="relative w-full">
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
                {COUNTRIES.map(([name, iso2, dialCode]) => (
                  <option key={iso2} value={name} className="text-black">
                    {name} (+{dialCode})
                  </option>
                ))}
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
            placeholder={field.placeholder || field.label}
            required={field.required}
            className={cn(
              mobileInputClass,
              "[&:-webkit-autofill]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill:hover]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill:focus]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill:active]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s]",
            )}
          />
        );
      }

      case "textarea":
        return (
          <div className="space-y-[12px]">
            <label className="font-anaheim font-semibold text-[16px] text-white">
              {field.label}
            </label>
            <textarea
              id={`mobile-${field.fieldName}`}
              name={field.fieldName}
              value={formData[field.fieldName] || ""}
              spellCheck="false"
              onChange={(e) => handleChange(field.fieldName, e.target.value)}
              placeholder={field.placeholder}
              required={field.required}
              className={cn(
                mobileTextareaClass,
                "[&:-webkit-autofill]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill:hover]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill:focus]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill:active]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s]",
              )}
            />
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
              {field.options?.map((option) => {
                const isSelected = isSingleSelect
                  ? formData[field.fieldName] === option.value
                  : (formData[field.fieldName] || []).includes(option.value);
                const iconSrc = serviceTypeIcons[option.value];
                return (
                  <label
                    key={option.value}
                    className={
                      isSelected
                        ? mobileCheckboxItemActiveClass
                        : mobileCheckboxItemClass
                    }
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
                          className={`w-[24px] h-[24px] ${isSingleSelect ? "rounded-full" : "rounded-[4px]"} border-2 flex items-center justify-center transition-colors ${isSelected ? "bg-white border-white" : "border-white/70"}`}
                        >
                          {isSelected && isSingleSelect && (
                            <div className="w-[10px] h-[10px] rounded-full bg-[#6E6839]" />
                          )}
                        </div>
                      )}
                    </div>
                    <span
                      className={`font-anaheim font-semibold text-[14px] flex-1 ${isSelected ? "text-white" : "text-white/70"}`}
                    >
                      {option.label}
                    </span>
                    <input
                      type={isSingleSelect ? "radio" : "checkbox"}
                      name={field.fieldName}
                      value={option.value}
                      checked={isSelected}
                      onChange={(e) =>
                        isSingleSelect
                          ? handleChange(field.fieldName, e.target.value)
                          : handleCheckboxChange(
                              field.fieldName,
                              option.value,
                              e.target.checked,
                            )
                      }
                      className="hidden"
                    />
                  </label>
                );
              })}
            </div>
          </div>
        );
      }

      case "file":
        return (
          <div className="space-y-[12px]">
            <label
              htmlFor={`mobile-${field.fieldName}`}
              className="flex items-center justify-center h-[52px] rounded-[12px] bg-[#211C0B]/50 border border-dashed border-white/30 cursor-pointer transition-all hover:bg-[#211C0B]/70"
            >
              <span className="font-anaheim font-semibold text-white/50 text-[14px]">
                {uploadingFiles[field.fieldName]
                  ? "Uploading..."
                  : uploadedAttachments.filter(
                        (a) => a.fieldName === field.fieldName,
                      ).length > 0
                    ? `${uploadedAttachments.filter((a) => a.fieldName === field.fieldName).length} file(s) uploaded`
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

  return isMobile ? renderMobile() : renderDesktop();
};
