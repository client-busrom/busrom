"use client"

import React, { useState, useEffect, useRef, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, ChevronDown } from "lucide-react"
import { OptimizedImage } from "@/components/ui/OptimizedImage"
import { Turnstile } from "@/components/ui/turnstile"
import { cn } from "@/lib/utils"
import { PhoneInput, COUNTRIES } from "@/components/ui/PhoneInput"

const DESIGN_WIDTH = 1920
const vw = (px: number) => `${(px / DESIGN_WIDTH) * 100}vw`
const DEFAULT_TEXTAREA_HEIGHT = 166 

interface MediaObject {
  id: string
  url: string
  alt?: string
}

interface FormField {
  fieldName: string
  fieldType: string
  label: string
  placeholder?: string
  required: boolean
  order: number
}

interface FormConfigData {
  id: string
  name: string
  fields: Record<string, FormField[]>
}

interface StoryContactFormSectionProps {
  data: {
    title: string
    subtitle: string
    description: string
    locale: string
    images: (MediaObject | null)[]
    formConfig?: {
      id?: string
      data?: FormConfigData
      privacyConsentText?: string
      submitButtonText?: string
      submittingText?: string
    } | null
  }
}

export function StoryContactFormSection({ data }: StoryContactFormSectionProps) {
  const { title, subtitle, description, formConfig, images = [], locale = "en" } = data

  const [formData, setFormData] = useState<Record<string, string>>({})
  const [fileName, setFileName] = useState<string>("")
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const [isGloballyAccepted, setIsGloballyAccepted] = useState(false)
  const STORAGE_KEY = 'busrom_privacy_consent'

  // Image Gallery State
  const validImages = images.filter((img): img is MediaObject => img !== null && img !== undefined)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Turnstile & Submit states
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [turnstileSiteKey, setTurnstileSiteKey] = useState<string | null>(null)
  const [turnstileKey, setTurnstileKey] = useState(0)
  const [fetchedFormConfig, setFetchedFormConfig] = useState<any>(null)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [extraHeight, setExtraHeight] = useState(0)

  const getLocalizedString = (value: any, loc: string) => {
    if (!value) return null;
    if (typeof value === 'string') return value;
    if (typeof value === 'object') {
      return value[loc] || value['en'] || Object.values(value)[0] || null;
    }
    return null;
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const consent = localStorage.getItem(STORAGE_KEY)
      if (consent === 'true') {
        setIsGloballyAccepted(true)
        setPrivacyAccepted(true)
      }
    }
  }, [])

  const handlePrivacyToggle = (checked: boolean) => {
    setPrivacyAccepted(checked)
    if (checked && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, 'true')
      window.dispatchEvent(new Event('storage'))
    }
  }

  useEffect(() => {
    const handleStorageChange = () => {
      const consent = localStorage.getItem(STORAGE_KEY)
      if (consent === 'true') {
        setIsGloballyAccepted(true)
        setPrivacyAccepted(true)
      }
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const currentHeight = entry.contentRect.height
        const defaultHeightPx = (DEFAULT_TEXTAREA_HEIGHT / DESIGN_WIDTH) * window.innerWidth
        const extra = Math.max(0, currentHeight - defaultHeightPx)
        setExtraHeight(extra)
      }
    })
    observer.observe(textarea)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const fetchFullConfig = async () => {
      const configId = formConfig?.id || (typeof formConfig === 'string' ? formConfig : null);
      if (!configId) return;
      try {
        const res = await fetch(`/api/form-configs/${configId}?locale=${locale}`);
        if (res.ok) {
          const fetchedData = await res.json();
          setFetchedFormConfig(fetchedData);
        }
      } catch (error) {
        console.error("Failed to fetch full form config:", error);
      }
    };
    fetchFullConfig();
  }, [formConfig?.id, locale]);

  const mergedConfig = useMemo(() => {
    return {
      ...formConfig,
      ...fetchedFormConfig,
      privacyConsentText: fetchedFormConfig?.privacyConsentText || formConfig?.privacyConsentText,
      submitButtonText: fetchedFormConfig?.submitButtonText || formConfig?.submitButtonText || "Submit",
    };
  }, [formConfig, fetchedFormConfig]);

  const effectivePrivacyText = useMemo(() => {
    return getLocalizedString(mergedConfig?.privacyConsentText, locale || 'en');
  }, [mergedConfig, locale]);

  const effectiveSubmitText = useMemo(() => {
    return getLocalizedString(mergedConfig?.submitButtonText, locale || 'en');
  }, [mergedConfig, locale]);

  useEffect(() => {
    const fetchSiteKey = async () => {
      try {
        const res = await fetch("/api/site-config")
        if (res.ok) {
          const siteData = await res.json()
          if (siteData.turnstileSiteKey) {
            setTurnstileSiteKey(siteData.turnstileSiteKey)
          }
        }
      } catch (error) {
        console.error("Failed to fetch Turnstile site key:", error)
      }
    }
    fetchSiteKey()
  }, [])

  // Auto layout
  useEffect(() => {
    if (validImages.length <= 1) return
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % validImages.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [validImages.length, currentImageIndex])

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => prev > 0 ? prev - 1 : validImages.length - 1)
  }

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => prev < validImages.length - 1 ? prev + 1 : 0)
  }

  const configData = mergedConfig?.data || mergedConfig
  const fields = configData?.fields?.[locale] || configData?.fields?.["en"] || (Array.isArray(configData?.fields) ? configData.fields : [])
  const sortedFields = [...fields].sort((a: FormField, b: FormField) => (a.order || 0) - (b.order || 0))

  const handleInputChange = (fieldName: string, value: string) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }))
    if (submitStatus === "error") {
      setSubmitStatus("idle")
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedFile(file)
      setFileName(file.name)
    }
  }

  const handleTurnstileSuccess = (token: string) => {
    setTurnstileToken(token)
    if (submitStatus === "error") {
      setSubmitStatus("idle")
      setErrorMessage("")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (turnstileSiteKey && !turnstileToken) {
      setSubmitStatus("error")
      setErrorMessage(locale === "zh" ? "请完成人机验证" : "Please complete the captcha verification")
      return
    }

    setIsSubmitting(true)
    setSubmitStatus("idle")
    setErrorMessage("")

    try {
      let fileUrl = ""
      const formId = mergedConfig?.id || configData?.id
      if (uploadedFile && formId) {
        const fileFormData = new FormData()
        fileFormData.append("file", uploadedFile)
        fileFormData.append("formConfigId", formId)
        fileFormData.append("fieldName", "attachment")

        // Wait... standard file upload takes fieldName "attachment" ...
        const uploadRes = await fetch("/api/form-file-upload", {
          method: "POST",
          body: fileFormData,
        })
        if (uploadRes.ok) {
          const uploadResult = await uploadRes.json()
          fileUrl = uploadResult.fileUrl
        }
      }

      const submissionData = {
        formId: formId,
        formName: mergedConfig?.name || configData?.name || "contact-form",
        data: {
          ...formData,
          ...(fileUrl ? { attachment: fileUrl } : {}),
        },
        locale,
        sourcePage: typeof window !== "undefined" ? window.location.href : "",
        userLocalTime: typeof window !== "undefined" ? new Date().toString() : "",
        turnstileToken,
      }

      const response = await fetch("/api/form-submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to submit form")
      }

      setSubmitStatus("success")
      setFormData({})
      setFileName("")
      setUploadedFile(null)
      setTurnstileToken(null)
      setTurnstileKey((prev) => prev + 1)
      setTimeout(() => setSubmitStatus("idle"), 5000)
    } catch (error) {
      setSubmitStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "Failed to submit form.")
      setTurnstileToken(null)
      setTurnstileKey((prev) => prev + 1)
    } finally {
      setIsSubmitting(false)
    }
  }

  const titleLines = title.split("\n")

  return (
    <section 
      id="contact-form"
      className="relative w-full overflow-hidden" 
      style={{ 
        height: `calc(${vw(983)} + ${extraHeight}px)`,
        background: "linear-gradient(to bottom, #756f3f 0%, #dbd076 100%)"
      }}
    >
      <div className="relative z-10 w-full h-full max-w-[1920px] mx-auto">
         {/* 1. Left Content */}
         <div className="absolute" style={{ left: vw(153), top: vw(315) }}>
            <h2 className="font-josefin-sans font-semibold uppercase flex flex-col" style={{ fontSize: vw(128), lineHeight: 0.99 }}>
               {titleLines[0] && (
                 <span style={{ WebkitTextStroke: "2px #ffffff", color: "transparent" }}>
                   {titleLines[0]}
                 </span>
               )}
               {titleLines[1] && (
                 <span className="text-white">
                   {titleLines[1]}
                 </span>
               )}
            </h2>
         </div>

         {/* Small contact form title */}
         {subtitle && (
           <div className="absolute" style={{ left: vw(412), top: vw(195) }}>
             <h3 className="font-josefin-sans font-medium text-white" style={{ fontSize: vw(40), lineHeight: 1.775 }}>
               {subtitle}
             </h3>
           </div>
         )}

         {/* Description */}
         <p 
           className="absolute font-josefin-sans font-medium" 
           style={{ 
             left: vw(155), top: vw(612), width: vw(444), 
             fontSize: vw(20), lineHeight: 1.35, color: "#fff287" 
           }}
         >
            {description}
         </p>

         {/* 2. Center Image Gallery (Group 259) */}
         <div className="absolute flex items-center justify-center" style={{ left: vw(521), top: vw(167), width: vw(751), height: vw(643) }}>
            {/* Ellipse 110 */}
            <div 
              className="absolute rounded-full" 
              style={{ 
                left: 0, 
                top: 0, 
                width: vw(291), 
                height: vw(291), 
                backgroundColor: "rgba(255, 232, 86, 0.6)",
                mixBlendMode: "multiply",
                zIndex: 2
              }} 
            />
            {/* Main Image */}
            <div 
              className="absolute rounded-full overflow-hidden" 
              style={{ left: vw(108), top: 0, width: vw(643), height: vw(643), zIndex: 1 }}
            >
              <AnimatePresence mode="wait">
                {validImages[currentImageIndex] && (
                  <motion.div
                    key={currentImageIndex}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full h-full"
                  >
                    <OptimizedImage
                      src={validImages[currentImageIndex].url}
                      alt={validImages[currentImageIndex].alt || "Gallery Image"}
                      fill
                      className="object-cover"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Pagination Controls */}
            {validImages.length > 1 && (
              <>
                {/* Prev Btn */}
                <button 
                  onClick={handlePrevImage}
                  className="absolute z-10 hover:scale-110 transition-transform flex items-center justify-center"
                  style={{ 
                    left: vw(-207), 
                    top: vw(95), 
                    width: vw(76), 
                    height: vw(76), 
                    border: `${vw(1)} solid white`, 
                    transform: "rotate(45deg)",
                  }}
                >
                  <div style={{ transform: "rotate(-45deg)" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                  </div>
                </button>
                {/* Next Btn */}
                <button 
                  onClick={handleNextImage}
                  className="absolute z-10 hover:scale-110 transition-transform flex items-center justify-center"
                  style={{ 
                    left: vw(716), 
                    top: vw(672), 
                    width: vw(76), 
                    height: vw(76), 
                    border: `${vw(1)} solid #d3c976`, 
                    transform: "rotate(-45deg)",
                  }}
                >
                  <div style={{ transform: "rotate(45deg)" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d3c976" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </div>
                </button>
              </>
            )}
         </div>

         {/* 3. Right Form Area */}
         <form 
           onSubmit={handleSubmit}
           className="absolute flex flex-col"
           style={{ left: vw(1359), top: vw(206), width: vw(366), gap: vw(20) }}
         >
            {sortedFields.length > 0 ? (
              <>
                {sortedFields.map((field) => {
                  const isTextarea = field.fieldType === "textarea" || field.fieldName === "message"
                  if (isTextarea) {
                    return (
                      <textarea
                        key={field.fieldName}
                        ref={textareaRef}
                        placeholder={`${field.placeholder || field.label}${field.required ? " *" : ""}`}
                        value={formData[field.fieldName] || ""}
                        onChange={(e) => handleInputChange(field.fieldName, e.target.value)}
                        className="font-anaheim font-semibold text-white placeholder:text-white/50 resize-y outline-none focus:border-white transition-colors"
                        style={{
                          width: vw(366), minHeight: vw(103), maxHeight: vw(250), borderRadius: vw(15),
                          backgroundColor: "#746d37", border: "1px solid rgba(255, 255, 255, 0.34)",
                          paddingLeft: vw(23), paddingRight: vw(23), paddingTop: vw(20),
                          fontSize: vw(20), lineHeight: vw(24),
                        }}
                        required={field.required}
                        disabled={isSubmitting}
                      />
                    )
                  }

                  const fieldTypeLower = field.fieldType?.toLowerCase()
                  const fieldNameLower = field.fieldName?.toLowerCase()
                  const isPhoneField = fieldTypeLower === 'phone' || fieldTypeLower === 'tel' || fieldNameLower?.includes('phone') || fieldNameLower?.includes('whatsapp')
                  const isCountryField = fieldTypeLower === 'country' || fieldNameLower?.includes('country') || fieldNameLower?.includes('region')

                  if (isPhoneField) {
                    return (
                      <div key={field.fieldName} className="dynamic-phone-input w-full">
                        <PhoneInput
                          value={formData[field.fieldName] || ''}
                          onChange={(phone) => handleInputChange(field.fieldName, phone)}
                          placeholder={`${field.placeholder || field.label}${field.required ? " *" : ""}`}
                          required={field.required}
                          disabled={isSubmitting}
                          className="!bg-[#746d37] !border-white/34 !rounded-[15px] !h-[63px] md:!h-[3.28vw]"
                          buttonClassName="!bg-transparent !border-white/10 !text-white hover:!bg-white/5"
                          inputClassName="!bg-transparent !text-white !placeholder-white/50 !font-anaheim !font-semibold !text-[20px]"
                          dialCodeClassName="!text-white"
                        />
                      </div>
                    )
                  }

                  if (isCountryField) {
                    return (
                      <div key={field.fieldName} className="relative">
                        <select
                          id={field.fieldName}
                          name={field.fieldName}
                          value={formData[field.fieldName] || ''}
                          onChange={(e) => handleInputChange(field.fieldName, e.target.value)}
                          required={field.required}
                          className="font-anaheim font-semibold appearance-none bg-[#746d37] border border-white/34 text-white w-full placeholder:text-white/50 focus:outline-none focus:border-white transition-colors"
                          style={{
                            height: vw(63), borderRadius: vw(15), paddingLeft: vw(23), paddingRight: vw(40), fontSize: vw(20),
                          }}
                        >
                          <option value="" className="text-black">Select Country/Region...</option>
                          {COUNTRIES.map(([name, iso2, dialCode]) => (
                            <option key={iso2} value={name} className="text-black">{name} (+{dialCode})</option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-white/50">
                          <ChevronDown size={20} />
                        </div>
                      </div>
                    )
                  }

                  return (
                    <input
                      key={field.fieldName}
                      type={field.fieldType === "email" ? "email" : "text"}
                      placeholder={`${field.placeholder || field.label}${field.required ? " *" : ""}`}
                      value={formData[field.fieldName] || ""}
                      onChange={(e) => handleInputChange(field.fieldName, e.target.value)}
                      className="font-anaheim font-semibold text-white placeholder:text-white/50 outline-none focus:border-white transition-colors"
                      style={{
                        width: vw(366), height: vw(63), borderRadius: vw(15), backgroundColor: "#746d37",
                        border: "1px solid rgba(255, 255, 255, 0.34)", paddingLeft: vw(23), fontSize: vw(20),
                      }}
                      required={field.required}
                      disabled={isSubmitting}
                    />
                  )
                })}
              </>
            ) : (
              // Default Form Fields if backend form config is missing
              <>
                <input type="text" placeholder="Your Name *" required value={formData.name || ""} onChange={(e) => handleInputChange("name", e.target.value)} className="w-[366px] h-[63px] bg-[#746d37] border border-white/34 rounded-[15px] px-[23px] text-white placeholder:text-white/50 outline-none" style={{ width: vw(366), height: vw(63), borderRadius: vw(15), paddingLeft: vw(23), fontSize: vw(20) }} />
                <input type="email" placeholder="Your Email *" required value={formData.email || ""} onChange={(e) => handleInputChange("email", e.target.value)} className="w-[366px] h-[63px] bg-[#746d37] border border-white/34 rounded-[15px] px-[23px] text-white placeholder:text-white/50 outline-none" style={{ width: vw(366), height: vw(63), borderRadius: vw(15), paddingLeft: vw(23), fontSize: vw(20) }} />
                <input type="text" placeholder="Your WhatsApp" value={formData.whatsapp || ""} onChange={(e) => handleInputChange("whatsapp", e.target.value)} className="w-[366px] h-[63px] bg-[#746d37] border border-white/34 rounded-[15px] px-[23px] text-white placeholder:text-white/50 outline-none" style={{ width: vw(366), height: vw(63), borderRadius: vw(15), paddingLeft: vw(23), fontSize: vw(20) }} />
                <textarea placeholder="Message" rows={4} value={formData.message || ""} onChange={(e) => handleInputChange("message", e.target.value)} className="w-[366px] min-h-[103px] bg-[#746d37] border border-white/34 rounded-[15px] px-[23px] py-[20px] text-white placeholder:text-white/50 outline-none resize-y" style={{ width: vw(366), minHeight: vw(103), borderRadius: vw(15), paddingLeft: vw(23), paddingTop: vw(20), fontSize: vw(20) }} />
              </>
            )}

            {/* Turnstile */}
            {turnstileSiteKey && (
              <div style={{ marginTop: vw(5) }}>
                <Turnstile
                  key={turnstileKey}
                  siteKey={turnstileSiteKey}
                  onVerify={handleTurnstileSuccess}
                  onError={() => setTurnstileToken(null)}
                  onExpire={() => setTurnstileToken(null)}
                  theme="dark"
                  size="compact"
                  language={locale === "zh" ? "zh-CN" : locale}
                />
              </div>
            )}

             {/* Privacy Checkbox */}
             {effectivePrivacyText && !isGloballyAccepted && (
              <div className="flex items-start gap-2 mt-2 cursor-pointer" onClick={() => handlePrivacyToggle(!privacyAccepted)}>
                <div className={cn(
                  "mt-1 flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-all",
                  privacyAccepted ? "bg-[#564d03] border-[#564d03]" : "border-white/30 bg-transparent"
                )}>
                  {privacyAccepted && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                </div>
                <p className="text-[12px] leading-relaxed text-white/70 whitespace-pre-line select-none flex-1">
                  {effectivePrivacyText}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
               type="submit"
               disabled={isSubmitting || (!!effectivePrivacyText && !isGloballyAccepted && !privacyAccepted)}
               className="w-full bg-[#564d03] text-white font-anaheim font-semibold text-center uppercase transition-all duration-300 hover:bg-black disabled:opacity-50"
               style={{ 
                 marginTop: vw(23), // to push the button down exactly as in design 
                 width: vw(366), 
                 height: vw(83), 
                 borderRadius: vw(63), 
                 fontSize: vw(32),
                 lineHeight: vw(43)
               }}
            >
               {isSubmitting ? (formConfig?.submittingText || "Submitting...") : submitStatus === "success" ? (locale === 'zh' ? '已提交!' : 'Submitted') : effectiveSubmitText}
            </button>

            {/* Error Status */}
            {submitStatus === "error" && (
              <div className="text-red-300 text-sm mt-2 font-anaheim">
                {errorMessage}
              </div>
            )}
         </form>
      </div>
    </section>
  )
}
