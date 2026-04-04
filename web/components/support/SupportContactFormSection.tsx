"use client"

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Upload } from "lucide-react"
import { cn } from "@/lib/utils"
import { OptimizedImage } from "@/components/ui/OptimizedImage"
import { PhoneInput, COUNTRIES } from "@/components/ui/PhoneInput"
import { ChevronDown } from 'lucide-react'

const DESIGN_WIDTH = 1920
const vw = (px: number) => `${(px / DESIGN_WIDTH) * 100}vw`

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

interface SupportContactFormSectionProps {
  title?: string
  description?: string
  images?: (MediaObject | null)[]
  formConfig?: any
  locale?: string
}

export function SupportContactFormSection({
  title = "Request Technical Marketing Support",
  description = "Please complete the form for your request support. Providing detailed information helps us assist you efficiently and our support team will contact you within 24 business hours.",
  images = [],
  formConfig,
  locale = "en",
}: SupportContactFormSectionProps) {
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [fileName, setFileName] = useState<string>("")
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  
  const [fetchedFormConfig, setFetchedFormConfig] = useState<any>(null)
  
  const getLocalizedString = useCallback((value: any, locale: string) => {
    if (!value) return null
    if (typeof value === 'string') return value
    if (typeof value === 'object') {
      return value[locale] || value['en'] || Object.values(value)[0] || null
    }
    return null
  }, [])

  // Fetch full config if needed
  useEffect(() => {
    const configId = formConfig?.id
    if (!configId) return

    const fetchFullConfig = async () => {
      try {
        const res = await fetch(`/api/form-configs/${configId}?locale=${locale}`)
        if (res.ok) {
          const data = await res.json()
          setFetchedFormConfig(data)
        }
      } catch (error) {
        console.error("Failed to fetch full form config:", error)
      }
    }
    fetchFullConfig()
  }, [formConfig?.id, locale])

  const mergedConfig = useMemo(() => ({
    ...formConfig,
    ...fetchedFormConfig
  }), [formConfig, fetchedFormConfig])

  const validImages = useMemo(() => {
    return images.filter((img): img is MediaObject => !!img?.url)
  }, [images])

  // Image Carousel Logic
  useEffect(() => {
    if (validImages.length <= 1) return
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % validImages.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [validImages.length])

  const handleInputChange = (fieldName: string, value: string) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedFile(file)
      setFileName(file.name)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus("idle")

    const formId = formConfig?.id
    if (!formId) {
      console.error("Missing formId")
      setIsSubmitting(false)
      return
    }

    try {
      // 1. Upload file if exists
      let fileUrl = ""
      if (uploadedFile) {
        const fileFormData = new FormData()
        fileFormData.append("file", uploadedFile)
        fileFormData.append("formConfigId", formId)
        fileFormData.append("fieldName", "attachment")

        try {
          const uploadRes = await fetch("/api/form-file-upload", {
            method: "POST",
            body: fileFormData,
          })

          if (uploadRes.ok) {
            const uploadResult = await uploadRes.json()
            fileUrl = uploadResult.fileUrl
          }
        } catch (e) {
          console.error("FileUpload error:", e)
        }
      }

      // 2. Submit formal data
      const submissionData = {
        formId,
        formName: formConfig?.name || "Support Contact Form",
        data: {
          ...formData,
          ...(fileUrl ? { attachment: fileUrl } : {}),
        },
        locale,
        sourcePage: typeof window !== "undefined" ? window.location.href : "",
        userLocalTime: new Date().toString(),
      }

      const response = await fetch("/api/form-submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
      })

      if (!response.ok) throw new Error("Submission failed")

      setSubmitStatus("success")
      setFormData({})
      setFileName("")
      setUploadedFile(null)
      setTimeout(() => setSubmitStatus("idle"), 5000)
    } catch (error) {
      console.error(error)
      setSubmitStatus("error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const fields = useMemo(() => {
    const rawFields = mergedConfig?.fields || mergedConfig?.data?.fields
    const f = rawFields?.[locale] || rawFields?.["en"] || (Array.isArray(rawFields) ? rawFields : [])
    return [...f].sort((a, b) => (a.order || 0) - (b.order || 0))
  }, [mergedConfig, locale])

  const submitText = useMemo(() => {
    if (isSubmitting) return getLocalizedString(mergedConfig?.submittingText, locale) || "..."
    if (submitStatus === 'success') return getLocalizedString(mergedConfig?.successMessage, locale) || "OK"
    if (submitStatus === 'error') return getLocalizedString(mergedConfig?.errorMessage, locale) || "Error"
    return getLocalizedString(mergedConfig?.submitButtonText, locale) || "Submit"
  }, [isSubmitting, submitStatus, mergedConfig, locale, getLocalizedString])

  return (
    <section id="contact-form" className="relative w-full overflow-hidden" 
             style={{ height: vw(922), background: "linear-gradient(118.81deg, #9A9357 0%, #373100 100%)" }}>
      
      {/* Left Side: Images + Decorative + Text */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        
        {/* Bottom Layer: Clip Path Background Carousel (lvler) */}
        <div className="absolute" style={{ left: vw(396), top: vw(75), width: vw(771.21), height: vw(755.38) }}>
           {/* Definition of the clip path */}
           <svg width="0" height="0" className="absolute">
              <defs>
                <clipPath id="lvler-clip" clipPathUnits="objectBoundingBox">
                   <path d="M190.00684 0c106.99618 0 193.73428 169.09642 193.73437 377.6875 0 207.77667-86.06161 376.36719-192.48144 377.68066l-1.25293 0.00782 0-303.59082c-17.58527 172.34222-95.32349 302.42968-188.75391 303.583l-1.25293 0.00782 0-755.37598c93.98679 0 172.34215 130.47629 190.00684 303.58594l0-303.58594z m581.20312 755.37598l-1.25293-0.00782c-106.31604-1.31237-192.31293-169.57562-192.48047-377.07324l0 377.08106-1.25293-0.00782c-106.41983-1.31347-192.48242-169.90399-192.48242-377.68066 0.00009-208.59108 86.73917-377.6875 193.73535-377.6875l0 377.07617c0.16938-208.31003 86.84174-377.07617 193.7334-377.07617l0 755.37598z" 
                         transform="scale(0.00129666 0.00132384)" />
                </clipPath>
              </defs>
           </svg>

           {/* The actual carousel container clipped by CSS */}
           <div className="w-full h-full relative overflow-hidden" style={{ clipPath: "url(#lvler-clip)" }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentImageIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1 }}
                  className="w-full h-full"
                >
                  {validImages[currentImageIndex] && (
                    <OptimizedImage
                      image={validImages[currentImageIndex]}
                      alt="Support"
                      className="w-full h-full object-cover"
                      width={1000}
                      height={1000}
                      priority
                    />
                  )}
                </motion.div>
              </AnimatePresence>
              {/* Dark overlay gradient matching lvler fill */}
              <div className="absolute inset-0 pointer-events-none" 
                   style={{ background: "linear-gradient(297.41deg, rgba(0,0,0,0) 32.3%, rgba(0,0,0,1) 100%)" }} />
           </div>
        </div>

        {/* Middle Layer: Diagonal Icons */}
         <div className="absolute z-[10]" style={{ left: vw(126), top: vw(260), width: vw(120), height: vw(160) }}>
            <svg width="100%" height="100%" viewBox="0 0 24.576 49.088" fill="none" preserveAspectRatio="none">
              <path d="M24.576 0c-3.02933 8.192-6.05867 16.384-9.088 24.576-2.98667 8.14933-5.99467 16.32-9.024 24.51201l-6.464 0c3.02933-8.192 6.03733-16.36267 9.024-24.51201 3.02933-8.192 6.05867-16.384 9.088-24.576l6.464 0z" fill="#FFE83C" />
            </svg>
         </div>
         <div className="absolute" style={{ left: vw(445), top: vw(620), width: vw(60), height: vw(90) }}>
            <svg width="100%" height="100%" viewBox="0 0 24.576 49.088" fill="none" preserveAspectRatio="none">
              <path d="M24.576 0c-3.02933 8.192-6.05867 16.384-9.088 24.576-2.98667 8.14933-5.99467 16.32-9.024 24.51201l-6.464 0c3.02933-8.192 6.03733-16.36267 9.024-24.51201 3.02933-8.192 6.05867-16.384 9.088-24.576l6.464 0z" fill="#FFE83C" fillOpacity="0.65" />
            </svg>
         </div>

        {/* Top Layer: Text */}
        <div className="absolute pointer-events-auto" style={{ left: vw(153), top: vw(177), width: vw(863) }}>
           <h2 className="text-white font-normal text-left" 
               style={{ 
                 fontFamily: "var(--font-kaushan-script), cursive", 
                 fontSize: vw(96), 
                 lineHeight: 1.32,
                 textShadow: "0px 4px 10px rgba(0,0,0,0.3)",
                 whiteSpace: "pre-wrap"
               }}>
             {(() => {
               const rawTitle = (getLocalizedString(mergedConfig?.displayName, locale) || title || "")
                 .replace(/\\n/g, '\n');
               return rawTitle.split('\n').map((line: string, i: number) => (
                 <span key={i} style={{ 
                   display: 'block', 
                   paddingLeft: i > 0 ? '1em' : 0 
                 }}>
                   {line.replace(/ /g, "\u00A0")}
                 </span>
               ));
             })()}
           </h2>
           <p className="text-white normal-case text-left" 
              style={{ 
                fontFamily: "var(--font-outfit), sans-serif", 
                fontSize: vw(22.8), 
                lineHeight: 1.31, 
                marginTop: vw(92),
                maxWidth: vw(658),
                whiteSpace: "pre-wrap"
              }}>
              {(getLocalizedString(mergedConfig?.description, locale) || description || "").replace(/\\n/g, '\n').replace(/ /g, "\u00A0")}
           </p>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="relative z-20" style={{ marginLeft: vw(1289), marginTop: vw(91), width: vw(486) }}>
         <form onSubmit={handleSubmit} className="flex flex-col" style={{ gap: vw(12) }}>
            {fields.map((field) => {
                 const isTextarea = field.fieldType === 'textarea' || field.fieldName.toLowerCase().includes('message')
                 if (isTextarea) return null
                 
                 const fName = field.fieldName.toLowerCase()
                 const isPhone = fName.includes('phone') || fName.includes('whatsapp') || field.fieldType === 'tel'
                 
                    if (isPhone) {
                      return (
                        <div key={field.fieldName} className="dynamic-phone-input" style={{ width: '100%', height: vw(63) }}>
                          <PhoneInput
                            value={formData[field.fieldName] || ''}
                            onChange={(v) => handleInputChange(field.fieldName, v)}
                            placeholder={`${field.label}${field.required ? " *" : ""}`}
                            containerClassName="!h-full !w-full"
                            style={{ height: '100%', borderRadius: vw(15) }}
                            className={cn(
                              "!bg-[#746D37] border border-white/34 !h-full"
                            )}
                            buttonClassName="!bg-transparent !px-[1vw] hover:!bg-white/10 !h-full !border-r !border-white/20"
                            chevronClassName="!text-white !w-[1.2vw] !h-[1.2vw] !ml-[0.2vw]"
                            dialCodeClassName={cn(
                              "!text-white !font-anaheim !font-semibold",
                              `!text-[${vw(20)}] !ml-[0.5vw]`
                            )}
                            inputClassName={cn(
                              "!bg-transparent !text-white placeholder:!text-white/50 !font-anaheim !font-semibold",
                              `!text-[${vw(20)}] !px-[1vw] !h-full`
                            )}
                          />
                        </div>
                      )
                    }

                 return (
                   <input
                     key={field.fieldName}
                     type={field.fieldType === 'email' ? 'email' : 'text'}
                     placeholder={`${field.label}${field.required ? " *" : ""}`}
                     className="bg-[#746D37] border border-white/34 text-white font-[family-name:var(--font-anaheim)] font-semibold placeholder:text-white/50 focus:outline-none"
                     style={{ height: vw(63), borderRadius: vw(15), paddingLeft: vw(24), fontSize: vw(20) }}
                     value={formData[field.fieldName] || ""}
                     onChange={(e) => handleInputChange(field.fieldName, e.target.value)}
                     required={field.required}
                   />
                 )
            })}

            {fields.filter(f => f.fieldType === 'textarea' || f.fieldName.toLowerCase().includes('message')).map(field => (
              <textarea 
                key={field.fieldName}
                placeholder={`${field.label}${field.required ? " *" : ""}`}
                value={formData[field.fieldName] || ""}
                onChange={(e) => handleInputChange(field.fieldName, e.target.value)}
                className="bg-[#746D37] border border-white/34 text-white font-[family-name:var(--font-anaheim)] font-semibold placeholder:text-white/50 resize-none focus:outline-none"
                style={{ height: vw(127), borderRadius: vw(15), paddingLeft: vw(24), paddingTop: vw(14), fontSize: vw(20) }}
                required={field.required}
              />
            ))}

            {/* Upload */}
            <div className="flex justify-end pr-4">
              <label className="flex items-center cursor-pointer border border-[#756F3F] rounded-full px-6 py-2 transition-colors hover:bg-black/10" 
                     style={{ height: vw(59), borderRadius: vw(33.5) }}>
                <input type="file" className="hidden" onChange={handleFileChange} />
                <Upload className="text-[#756F3F]" size={20} />
                <span className="text-[#756F3F] font-anaheim font-semibold ml-2" style={{ fontSize: vw(24) }}>
                  {fileName || getLocalizedString(mergedConfig?.uploadFileText, locale) || "Upload File"}
                </span>
              </label>
            </div>

            {/* Submit */}
            <button
               type="submit"
               disabled={isSubmitting}
               className="bg-[#564D03] text-white font-anaheim font-bold uppercase transition-all hover:bg-[#3d3602] disabled:opacity-50"
               style={{ height: vw(83), borderRadius: vw(63), fontSize: vw(32), marginTop: vw(10) }}
            >
               {submitText}
            </button>
         </form>
      </div>
    </section>
  )
}
