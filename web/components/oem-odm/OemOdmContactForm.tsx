"use client"

import React, { useState, useRef, useEffect, useCallback } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { OptimizedImage } from "@/components/ui/OptimizedImage"
import { Turnstile } from "@/components/ui/turnstile"
import type { Locale } from "@/i18n.config"
import { PhoneInput } from "@/components/ui/PhoneInput"

// 设计稿基准尺寸 1920，缩放 70%
const DESIGN_WIDTH = 1920
const SCALE = 0.7

// 响应式尺寸函数（已缩放70%）
const rpx = (designValue: number) => `calc(var(--rpx-contact-form) * ${designValue * SCALE})`

interface MediaObject {
  id: string
  url: string
  alt?: string
  variants?: {
    thumbnail?: string
    small?: string
    medium?: string
    large?: string
    xlarge?: string
  }
  cropFocalPoint?: { x: number; y: number } | null
  width?: number
  height?: number
  enableLink?: boolean
  linkUrl?: string
  openInNewTab?: boolean
}

interface FormField {
  label: string
  fieldName: string
  fieldType: string
  placeholder?: string
  required?: boolean
  order?: number
  options?: Array<{ label: string; value: string }>
}

interface FormConfig {
  id?: string
  name?: string
  displayName?: string
  submitButtonText?: string
  successMessage?: string
  errorMessage?: string
  fields?: FormField[] | Record<string, FormField[]>
  privacyConsentText?: string
  data?: any
}

interface OemOdmContactFormProps {
  title?: string
  description?: string
  image?: MediaObject | null
  formConfig?: FormConfig | null
  locale?: Locale
}

export function OemOdmContactForm({
  title = "Get Your\nExclusive\nPlan",
  description = "Please fill in the following information. Our OEM/ODM experts will provide you with professional solutions and quotations within 24 hours.",
  image,
  formConfig,
  locale = "en",
}: OemOdmContactFormProps) {
  // 处理表单配置数据结构
  const configData = formConfig?.data || formConfig
  const rawFields = configData?.fields
  const fields: FormField[] = Array.isArray(rawFields)
    ? rawFields
    : (rawFields?.[locale] || rawFields?.["en"] || [])
  const sortedFields = [...fields].sort((a, b) => (a.order || 0) - (b.order || 0))

  // Helper function to extract localized string if it's an object
  const getLocalizedString = (val: any) => {
    if (!val) return ""
    if (typeof val === "string") return val
    if (typeof val === "object") {
      return val[locale] || val["en"] || ""
    }
    return ""
  }

  const privacyText = getLocalizedString(configData?.privacyConsentText)
  const submitText = getLocalizedString(configData?.submitButtonText || configData?.data?.submitButtonText) || "Submit Inquiry"

  // 表单数据状态
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const [isGloballyAccepted, setIsGloballyAccepted] = useState(false)
  const STORAGE_KEY = 'busrom_privacy_consent'

  // Check global consent status on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const consent = localStorage.getItem(STORAGE_KEY)
      if (consent === 'true') {
        setIsGloballyAccepted(true)
        setPrivacyAccepted(true)
      }
    }
  }, [])

  // Sync with global storage when accepted in this form
  const handlePrivacyToggle = (checked: boolean) => {
    setPrivacyAccepted(checked)
    if (checked && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, 'true')
      setIsGloballyAccepted(true)
      // Trigger a storage event for other components to update
      window.dispatchEvent(new Event('storage'))
    }
  }

  // Listen for storage events from other components
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

  // Check if we need to show privacy text to determine layout spacing
  const hasPrivacyText = !!privacyText && !isGloballyAccepted
  const containerHeight = hasPrivacyText ? 1742 : 1592
  const innerHeight = hasPrivacyText ? 1725 : 1575
  const captchaTop = hasPrivacyText ? 1480 : 1350
  const submitTop = hasPrivacyText ? 1500 : 1358

  // 文件上传
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Turnstile captcha
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [turnstileSiteKey, setTurnstileSiteKey] = useState<string | null>(null)
  const [turnstileKey, setTurnstileKey] = useState(0)

  // 初始化表单数据
  useEffect(() => {
    if (fields.length > 0) {
      const initialData: Record<string, any> = {}
      fields.forEach((field: FormField) => {
        initialData[field.fieldName] = field.fieldType === 'checkbox' ? [] : ''
      })
      setFormData(initialData)
    }
  }, [fields.length])

  // 获取 Turnstile site key
  useEffect(() => {
    const fetchSiteKey = async () => {
      try {
        const res = await fetch('/api/site-config')
        if (res.ok) {
          const data = await res.json()
          if (data.turnstileSiteKey) {
            setTurnstileSiteKey(data.turnstileSiteKey)
          }
        }
      } catch (error) {
        console.error('Failed to fetch Turnstile site key:', error)
      }
    }
    fetchSiteKey()
  }, [])

  // Turnstile 回调
  const handleTurnstileVerify = useCallback((token: string) => {
    setTurnstileToken(token)
    setError(null)
  }, [])

  const handleTurnstileError = useCallback(() => {
    setTurnstileToken(null)
    setError('Captcha verification failed. Please try again.')
  }, [])

  const handleTurnstileExpire = useCallback(() => {
    setTurnstileToken(null)
  }, [])

  // 处理输入变化
  const handleChange = (fieldName: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }))
  }

  // 处理复选框变化
  const handleCheckboxChange = (fieldName: string, value: string, checked: boolean) => {
    setFormData(prev => {
      const currentValues = Array.isArray(prev[fieldName]) ? prev[fieldName] : []
      if (checked) {
        return { ...prev, [fieldName]: [...currentValues, value] }
      } else {
        return { ...prev, [fieldName]: currentValues.filter((v: string) => v !== value) }
      }
    })
  }

  // 处理文件上传
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadedFiles(Array.from(e.target.files))
    }
  }

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      // 验证必填字段
      const missingFields: string[] = []
      sortedFields.forEach(field => {
        if (field.required) {
          const value = formData[field.fieldName]
          if (!value || (Array.isArray(value) && value.length === 0)) {
            missingFields.push(field.label)
          }
        }
      })

      if (missingFields.length > 0) {
        setError(`Please fill in required fields: ${missingFields.join(", ")}`)
        setSubmitting(false)
        return
      }

      // 验证码检查
      if (turnstileSiteKey && !turnstileToken) {
        setError('Please complete the captcha verification')
        setSubmitting(false)
        return
      }

      // 提交表单
      const res = await fetch("/api/form-submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formId: formConfig?.id || configData?.id,
          formName: configData?.name,
          data: formData,
          locale,
          sourcePage: typeof window !== "undefined" ? window.location.href : "",
          userLocalTime: typeof window !== "undefined" ? new Date().toString() : "",
          turnstileToken,
        }),
      })

      if (res.ok) {
        setSubmitted(true)
        setTurnstileToken(null)
        setTurnstileKey(prev => prev + 1)

        setTimeout(() => {
          setSubmitted(false)
          const resetData: Record<string, any> = {}
          fields.forEach((field: FormField) => {
            resetData[field.fieldName] = field.fieldType === 'checkbox' ? [] : ''
          })
          setFormData(resetData)
          setUploadedFiles([])
        }, 5000)
      } else {
        const errorData = await res.json()
        setError(errorData.error || configData?.errorMessage || "Failed to submit form")
        setTurnstileToken(null)
        setTurnstileKey(prev => prev + 1)
      }
    } catch (err) {
      console.error("Error submitting form:", err)
      setError(configData?.errorMessage || "Failed to submit form")
      setTurnstileToken(null)
      setTurnstileKey(prev => prev + 1)
    } finally {
      setSubmitting(false)
    }
  }

  // 分离字段类型
  const textFields = sortedFields.filter(f => ['text', 'email', 'tel', 'phone'].includes(f.fieldType))
  const selectFields = sortedFields.filter(f => f.fieldType === 'select')
  const textareaFields = sortedFields.filter(f => f.fieldType === 'textarea')
  const checkboxFields = sortedFields.filter(f => f.fieldType === 'checkbox')

  // 没有表单配置时显示提示
  if (!formConfig || fields.length === 0) {
    return (
      <section
        className="relative w-full overflow-hidden"
        style={{ ["--rpx-contact-form" as string]: `calc(100vw / ${DESIGN_WIDTH})` }}
      >
        <div className="hidden md:flex relative w-full items-center justify-center" style={{ height: rpx(1592) }}>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <p className="text-yellow-700">Form configuration not available</p>
          </div>
        </div>
      </section>
    )
  }

  // 提交成功状态
  if (submitted) {
    return (
      <section
        className="relative w-full overflow-hidden"
        style={{ ["--rpx-contact-form" as string]: `calc(100vw / ${DESIGN_WIDTH})` }}
      >
        <div className="hidden md:flex relative w-full items-center justify-center" style={{ height: rpx(1592) }}>
          <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
            <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-anaheim font-bold text-green-700 mb-2">Success!</h3>
            <p className="text-green-600">{configData?.successMessage || "Your inquiry has been submitted successfully!"}</p>
          </div>
        </div>
        <div className="block md:hidden px-5 py-8">
          <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
            <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-anaheim font-bold text-green-700 mb-2">Success!</h3>
            <p className="text-green-600">{configData?.successMessage || "Your inquiry has been submitted successfully!"}</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section
      className="relative w-full overflow-hidden transition-all duration-500 ease-in-out"
      style={{ ["--rpx-contact-form" as string]: `calc(100vw / ${DESIGN_WIDTH})` }}
    >
      {/* ========== PC端布局 ========== */}
      <div className="hidden md:block relative w-full transition-all duration-500 ease-in-out" style={{ height: rpx(containerHeight) }}>
        {/* 居中容器 */}
        <div
          className="absolute left-1/2"
          style={{ transform: "translateX(-50%)", width: rpx(1884) }}
        >
          {/* 白色背景卡片 */}
          <div
            className="absolute transition-all duration-500 ease-in-out"
            style={{
              left: rpx(24),
              top: rpx(17),
              width: rpx(1860),
              height: rpx(innerHeight),
              backgroundColor: "#FFFFFF",
              borderRadius: rpx(30),
              border: "1px solid #cfcaa2",
            }}
          />

          {/* ========== Hero 区域（顶部黑色背景图片） ========== */}
          <div
            className="absolute overflow-hidden"
            style={{
              left: 0,
              top: 0,
              width: rpx(1860),
              height: rpx(426),
              borderRadius: rpx(30),
            }}
          >
            {image ? (
              image.enableLink && image.linkUrl ? (
                <Link href={image.linkUrl} target={image.openInNewTab ? "_blank" : undefined} rel={image.openInNewTab ? "noopener noreferrer" : undefined} className="block absolute inset-0 w-full h-full">
                  <OptimizedImage
                    image={image as any}
                    alt="OEM/ODM Contact"
                    size="xlarge"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </Link>
              ) : (
                <OptimizedImage
                  image={image as any}
                  alt="OEM/ODM Contact"
                  size="xlarge"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )
            ) : (
              <div className="absolute inset-0 bg-black" />
            )}
            <div className="absolute inset-0 bg-black/60" />

            {/* 左侧标题框 */}
            <motion.div
              className="absolute"
              style={{
                left: rpx(123),
                top: rpx(136),
                width: rpx(331),
                height: rpx(242),
                border: "1px solid rgba(255, 255, 255, 0.5)",
              }}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span
                className="absolute font-anaheim font-extrabold text-white whitespace-pre-line"
                style={{
                  left: rpx(26),
                  top: rpx(26),
                  fontSize: rpx(64),
                  lineHeight: rpx(61),
                }}
              >
                {title}
              </span>
            </motion.div>

            {/* 装饰圆圈 - Loading 动画效果 */}
            <div
              className="absolute"
              style={{
                left: rpx(403),
                top: rpx(335),
                width: rpx(134),
                height: rpx(60),
              }}
            >
              <motion.div
                className="absolute rounded-full bg-white"
                style={{ left: 0, top: 0, width: rpx(60), height: rpx(60) }}
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
              />
              <motion.div
                className="absolute rounded-full bg-white/60"
                style={{ left: rpx(25), top: 0, width: rpx(60), height: rpx(60) }}
                animate={{ opacity: [0.6, 0.2, 0.6] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: 0.15 }}
              />
              <motion.div
                className="absolute rounded-full bg-white/30"
                style={{ left: rpx(50), top: 0, width: rpx(60), height: rpx(60) }}
                animate={{ opacity: [0.3, 0.1, 0.3] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: 0.3 }}
              />
              <motion.div
                className="absolute rounded-full bg-white/10"
                style={{ left: rpx(75), top: 0, width: rpx(60), height: rpx(60) }}
                animate={{ opacity: [0.1, 0.4, 0.1] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: 0.45 }}
              />
            </div>

            {/* 黄色装饰线 */}
            <div
              className="absolute"
              style={{
                left: rpx(573),
                top: rpx(256),
                width: rpx(30),
                height: rpx(6),
                backgroundColor: "#FFF49F",
              }}
            />

            {/* 右侧描述文字 */}
            <motion.p
              className="absolute font-anaheim font-semibold text-white"
              style={{
                left: rpx(573),
                top: rpx(270),
                width: rpx(879),
                fontSize: rpx(26),
                lineHeight: rpx(41),
              }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {description}
            </motion.p>
          </div>

          {/* ========== 表单区域 ========== */}
          <form onSubmit={handleSubmit}>
            {/* 表单标题 */}
            <motion.h2
              className="absolute font-anaheim font-extrabold"
              style={{
                left: rpx(127),
                top: rpx(510),
                fontSize: rpx(80),
                lineHeight: rpx(102),
                color: "#6F6200",
              }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {configData?.displayName || "OEM/ODM Requirements"}
            </motion.h2>

            {/* 第一行输入框：Your Name + Your Company */}
            <div
              className="absolute"
              style={{
                left: rpx(127),
                top: rpx(636),
                width: rpx(463),
                height: rpx(74),
                backgroundColor: "#F3F1EA",
                borderRadius: rpx(15),
                border: "1px solid rgba(255, 255, 255, 0.34)",
              }}
            >
              <input
                type="text"
                value={formData[textFields[0]?.fieldName] || ''}
                onChange={(e) => handleChange(textFields[0]?.fieldName, e.target.value)}
                className="w-full h-full font-anaheim font-semibold outline-none bg-transparent"
                style={{
                  paddingLeft: rpx(29),
                  paddingRight: rpx(20),
                  fontSize: rpx(24),
                  color: "#756F3F",
                }}
                placeholder={textFields[0]?.placeholder || textFields[0]?.label || "Your Name"}
                disabled={submitting}
              />
            </div>

            <div
              className="absolute"
              style={{
                left: rpx(640),
                top: rpx(636),
                width: rpx(461),
                height: rpx(74),
                backgroundColor: "#F3F1EA",
                borderRadius: rpx(15),
                border: "1px solid rgba(255, 255, 255, 0.34)",
              }}
            >
              <input
                type="text"
                value={formData[textFields[1]?.fieldName] || ''}
                onChange={(e) => handleChange(textFields[1]?.fieldName, e.target.value)}
                className="w-full h-full font-anaheim font-semibold outline-none bg-transparent"
                style={{
                  paddingLeft: rpx(29),
                  paddingRight: rpx(20),
                  fontSize: rpx(24),
                  color: "#756F3F",
                }}
                placeholder={textFields[1]?.placeholder || textFields[1]?.label || "Your Company / Your Team"}
                disabled={submitting}
              />
            </div>

            {/* 第二行输入框：Your Email + Your Whatsapp */}
            <div
              className="absolute"
              style={{
                left: rpx(127),
                top: rpx(734),
                width: rpx(463),
                height: rpx(74),
                backgroundColor: "#F3F1EA",
                borderRadius: rpx(15),
                border: "1px solid rgba(255, 255, 255, 0.34)",
              }}
            >
              <input
                type="email"
                value={formData[textFields[2]?.fieldName] || ''}
                onChange={(e) => handleChange(textFields[2]?.fieldName, e.target.value)}
                className="w-full h-full font-anaheim font-semibold outline-none bg-transparent"
                style={{
                  paddingLeft: rpx(29),
                  paddingRight: rpx(20),
                  fontSize: rpx(24),
                  color: "#756F3F",
                }}
                placeholder={textFields[2]?.placeholder || textFields[2]?.label || "Your Email"}
                disabled={submitting}
              />
            </div>

            <div
              className="absolute"
              style={{
                left: rpx(640),
                top: rpx(734),
                width: rpx(461),
                height: rpx(74),
                backgroundColor: "#F3F1EA",
                borderRadius: rpx(15),
                border: "1px solid rgba(255, 255, 255, 0.34)",
                overflow: 'visible'
              }}
            >
              <PhoneInput
                id={textFields[3]?.fieldName}
                value={formData[textFields[3]?.fieldName] || ''}
                onChange={(phone) => handleChange(textFields[3]?.fieldName, phone)}
                placeholder={textFields[3]?.placeholder || textFields[3]?.label || "Your Whatsapp"}
                disabled={submitting}
                className="!bg-transparent !border-none !h-full !rounded-none"
                buttonClassName="!bg-transparent !border-r-0 !text-[#756F3F] hover:!bg-black/5 !rounded-none !px-4 !h-full"
                inputClassName="!bg-transparent !text-[#756F3F] !placeholder-[#756F3F]/50 !font-anaheim !font-semibold !text-[1.25vw] !h-full"
                dialCodeClassName="!text-[#756F3F] !text-[1.25vw]"
                containerClassName="!h-full"
              />
            </div>

            {/* The Type Of Cooperation 标签 */}
            <span
              className="absolute font-anaheim font-semibold"
              style={{
                left: rpx(127),
                top: rpx(857),
                fontSize: rpx(23),
                lineHeight: rpx(40),
                color: "#756F3F",
              }}
            >
              {selectFields[0]?.label || "The Type Of Cooperation You are Interested In"}
            </span>

            {/* 下拉选择框 */}
            <div
              className="absolute"
              style={{
                left: rpx(127),
                top: rpx(908),
                width: rpx(974),
                height: rpx(74),
                backgroundColor: "#F3F1EA",
                borderRadius: rpx(15),
                border: "1px solid rgba(255, 255, 255, 0.34)",
              }}
            >
              <select
                value={formData[selectFields[0]?.fieldName] || ''}
                onChange={(e) => handleChange(selectFields[0]?.fieldName, e.target.value)}
                className="w-full h-full font-anaheim font-semibold outline-none bg-transparent appearance-none cursor-pointer"
                style={{
                  paddingLeft: rpx(29),
                  paddingRight: rpx(50),
                  fontSize: rpx(28),
                  color: "#756F3F",
                }}
                disabled={submitting}
              >
                <option value="">{selectFields[0]?.placeholder || "Select..."}</option>
                {selectFields[0]?.options?.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {/* 下拉箭头 */}
              <svg
                className="absolute pointer-events-none"
                style={{ right: rpx(20), top: "50%", transform: "translateY(-50%)", width: rpx(31), height: rpx(14) }}
                viewBox="0 0 31 14"
                fill="none"
              >
                <path d="M15.5138 11.3538L2.24596 0.319738C1.73241 -0.106579 0.899394 -0.106579 0.385165 0.319738C-0.128388 0.747503 -0.128388 1.44023 0.385165 1.86788L14.4787 13.5871C14.5088 13.6191 14.542 13.6504 14.5774 13.6797C15.0917 14.1068 15.9246 14.1068 16.4382 13.6797L30.6144 1.89054C31.1285 1.4629 31.1285 0.770169 30.6144 0.343084C30.1015 -0.0839129 29.2686 -0.0839129 28.7543 0.343084L15.5138 11.3538Z" fill="#756F3F"/>
              </svg>
            </div>

            {/* Textarea - 详细需求描述 */}
            <div
              className="absolute"
              style={{
                left: rpx(127),
                top: rpx(1006),
                width: rpx(974),
                height: rpx(243),
                backgroundColor: "#F3F1EA",
                borderRadius: rpx(15),
                border: "1px solid rgba(255, 255, 255, 0.34)",
              }}
            >
              <textarea
                value={formData[textareaFields[0]?.fieldName] || ''}
                onChange={(e) => handleChange(textareaFields[0]?.fieldName, e.target.value)}
                className="w-full h-full font-anaheim font-semibold outline-none bg-transparent resize-none"
                style={{
                  padding: rpx(24),
                  fontSize: rpx(24),
                  color: "#756F3F",
                }}
                placeholder={textareaFields[0]?.placeholder || textareaFields[0]?.label || "Specific Requirements / Project Description"}
                disabled={submitting}
              />
            </div>

            {/* 上传文件按钮 */}
            <div
              className="absolute flex items-center justify-center cursor-pointer whitespace-nowrap"
              style={{
                left: rpx(141),
                top: rpx(1279),
                width: rpx(248),
                height: rpx(59),
                border: "1px solid #756f3f",
                borderRadius: rpx(33.5),
                gap: rpx(10),
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <svg
                style={{ width: rpx(25), height: rpx(25), flexShrink: 0 }}
                viewBox="0 0 25 25"
                fill="none"
              >
                <path d="M6.90476 0C7.03571 0 7.14286 0.107143 7.14286 0.238095V1.54762C7.14286 1.61077 7.11777 1.67133 7.07312 1.71598C7.02847 1.76063 6.96791 1.78571 6.90476 1.78571H4.7619C3.99496 1.78576 3.25764 2.08187 2.7037 2.6123C2.14977 3.14272 1.82198 3.86652 1.78869 4.63274L1.78571 4.7619V20.2381C1.78576 21.005 2.08187 21.7424 2.6123 22.2963C3.14272 22.8502 3.86652 23.178 4.63274 23.2113L4.7619 23.2143H20.2381C21.005 23.2142 21.7424 22.9181 22.2963 22.3877C22.8502 21.8573 23.178 21.1335 23.2113 20.3673L23.2143 20.2381V4.7619C23.2142 3.99496 22.9181 3.25764 22.3877 2.7037C21.8573 2.14977 21.1335 1.82198 20.3673 1.78869L20.2381 1.78571H18.6905C18.6592 1.78571 18.6282 1.77956 18.5994 1.76759C18.5705 1.75563 18.5442 1.73809 18.5221 1.71598C18.5 1.69387 18.4825 1.66762 18.4705 1.63873C18.4585 1.60985 18.4524 1.57889 18.4524 1.54762V0.238095C18.4524 0.107143 18.5595 0 18.6905 0H20.2381C21.501 0 22.7122 0.501699 23.6053 1.39473C24.4983 2.28776 25 3.49897 25 4.7619V20.2381C25 21.501 24.4983 22.7122 23.6053 23.6053C22.7122 24.4983 21.501 25 20.2381 25H4.7619C3.49897 25 2.28776 24.4983 1.39473 23.6053C0.501699 22.7122 0 21.501 0 20.2381V4.7619C0 3.49897 0.501699 2.28776 1.39473 1.39473C2.28776 0.501699 3.49897 0 4.7619 0H6.90476ZM12.8238 0L12.894 0.00833337C13.0095 0.0291667 13.1202 0.0839286 13.2095 0.173214L18.3821 5.34583C18.4044 5.36798 18.4221 5.39432 18.4342 5.42334C18.4462 5.45235 18.4524 5.48346 18.4524 5.51488V7.36667C18.4524 7.41378 18.4385 7.45985 18.4123 7.49904C18.3862 7.53823 18.349 7.56878 18.3054 7.58681C18.2619 7.60485 18.214 7.60957 18.1678 7.60036C18.1216 7.59116 18.0791 7.56845 18.0458 7.53512L13.6905 3.17976V15.875C13.6905 15.9063 13.6843 15.9372 13.6724 15.9661C13.6604 15.995 13.6428 16.0212 13.6207 16.0434C13.5986 16.0655 13.5724 16.083 13.5435 16.095C13.5146 16.1069 13.4836 16.1131 13.4524 16.1131H12.1429C12.0797 16.1131 12.0191 16.088 11.9745 16.0434C11.9298 15.9987 11.9048 15.9381 11.9048 15.875V3.1619L7.54941 7.51726C7.51611 7.5506 7.47366 7.5733 7.42745 7.58251C7.38124 7.59171 7.33334 7.58699 7.28981 7.56896C7.24628 7.55092 7.20908 7.52037 7.18292 7.48119C7.15676 7.442 7.14282 7.39593 7.14286 7.34881V5.49762C7.14283 5.46634 7.14897 5.43537 7.16092 5.40646C7.17287 5.37756 7.1904 5.35129 7.2125 5.32917L12.3679 0.173214C12.4708 0.0700321 12.6081 0.00836919 12.7536 0H12.8238Z" fill="#756F3F"/>
              </svg>
              <span
                className="font-anaheim font-semibold whitespace-nowrap"
                style={{ fontSize: rpx(24), color: "#756F3F" }}
              >
                {uploadedFiles.length > 0 ? `${uploadedFiles.length} file(s)` : "Upload File"}
              </span>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {/* ========== 右侧 Checkbox 区域 ========== */}
            {checkboxFields.length > 0 && (
              <div
                className="absolute flex flex-col"
                style={{
                  left: rpx(1236),
                  top: rpx(631),
                  width: rpx(491),
                  backgroundColor: "#FBF6E4",
                  borderRadius: rpx(30),
                  border: "1px solid rgba(255, 255, 255, 0.34)",
                  padding: `${rpx(44)} ${rpx(64)} ${rpx(44)} ${rpx(64)}`,
                }}
              >
                {/* Checkbox 标题 */}
                <h3
                  className="font-anaheim font-bold"
                  style={{
                    fontSize: rpx(32),
                    lineHeight: rpx(40),
                    color: "#6F6200",
                    marginBottom: rpx(27),
                  }}
                >
                  {checkboxFields[0]?.label || "Target Product Category"}
                </h3>

                {/* Checkbox 选项列表 */}
                <div
                  className="flex flex-col"
                  style={{ gap: rpx(5) }}
                >
                  {checkboxFields[0]?.options?.map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center cursor-pointer"
                      style={{ height: rpx(46) }}
                    >
                      <div
                        className="relative flex items-center justify-center"
                        style={{
                          width: rpx(18),
                          height: rpx(18),
                          marginRight: rpx(9),
                          flexShrink: 0,
                        }}
                      >
                        <div
                          className="absolute inset-0 rounded-full"
                          style={{
                            border: `1px solid ${(formData[checkboxFields[0]?.fieldName] || []).includes(option.value) ? "#6F6200" : "#9C9667"}`,
                          }}
                        />
                        {(formData[checkboxFields[0]?.fieldName] || []).includes(option.value) && (
                          <div
                            className="rounded-full"
                            style={{
                              width: rpx(10),
                              height: rpx(10),
                              backgroundColor: "#6F6200",
                            }}
                          />
                        )}
                      </div>
                      <input
                        type="checkbox"
                        checked={(formData[checkboxFields[0]?.fieldName] || []).includes(option.value)}
                        onChange={(e) => handleCheckboxChange(checkboxFields[0]?.fieldName, option.value, e.target.checked)}
                        className="hidden"
                      />
                      <span
                        className="font-anaheim font-semibold"
                        style={{
                          fontSize: rpx(23),
                          lineHeight: rpx(40),
                          color: "#6F6200",
                        }}
                      >
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>

                {/* Others 输入框 - 仅在选中 Others 时显示 */}
                {(formData[checkboxFields[0]?.fieldName] || []).some((v: string) =>
                  v.toLowerCase() === 'others' || v.toLowerCase() === 'other'
                ) && (
                  <div style={{ marginTop: rpx(15), width: rpx(363) }}>
                    <textarea
                      value={formData['othersIndicate'] || ''}
                      onChange={(e) => handleChange('othersIndicate', e.target.value)}
                      className="w-full font-anaheim font-medium outline-none resize-y"
                      style={{
                        minHeight: rpx(53),
                        maxHeight: rpx(150),
                        padding: rpx(12),
                        fontSize: rpx(16),
                        color: "#6F6200",
                        backgroundColor: "#F4EDD4",
                        borderRadius: rpx(15),
                      }}
                      placeholder="Please Indicate here"
                      disabled={submitting}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Turnstile 验证码 */}
            {turnstileSiteKey && (
              <div
                className="absolute transition-all duration-500 ease-in-out"
                style={{
                  left: rpx(127),
                  top: rpx(captchaTop),
                }}
              >
                <Turnstile
                  key={turnstileKey}
                  siteKey={turnstileSiteKey}
                  onVerify={handleTurnstileVerify}
                  onError={handleTurnstileError}
                  onExpire={handleTurnstileExpire}
                  theme="light"
                  language={locale === 'zh' ? 'zh-CN' : locale}
                />
              </div>
            )}

            {/* Privacy Consent Checkbox - Only show if not already globally accepted */}
            {privacyText && !isGloballyAccepted && (
              <div
                className="absolute flex items-start gap-4 group cursor-pointer"
                style={{
                  left: rpx(450),
                  top: rpx(1280),
                  width: rpx(600),
                }}
                onClick={() => handlePrivacyToggle(!privacyAccepted)}
              >
                <div
                  className={`flex-shrink-0 border flex items-center justify-center transition-all ${
                    privacyAccepted ? "bg-[#756F3F] border-[#756F3F]" : "border-[#756F3F]/30 bg-transparent"
                  }`}
                  style={{
                    marginTop: rpx(5),
                    width: rpx(24),
                    height: rpx(24),
                    borderRadius: rpx(4),
                  }}
                >
                  {privacyAccepted && (
                    <svg style={{ width: rpx(16), height: rpx(16) }} className="text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <p
                  className="font-anaheim text-left select-none whitespace-pre-line"
                  style={{
                    fontSize: rpx(18),
                    lineHeight: rpx(24),
                    color: "#756F3F",
                  }}
                >
                  {privacyText}
                </p>
              </div>
            )}

            {/* 错误提示 */}
            {error && (
              <div
                className="absolute font-anaheim text-red-600 transition-all duration-500 ease-in-out"
                style={{
                  left: rpx(400),
                  top: rpx(captchaTop),
                  fontSize: rpx(16),
                }}
              >
                {error}
              </div>
            )}

            {/* 提交按钮 */}
            <motion.button
              type="submit"
              disabled={submitting || (!!formConfig?.privacyConsentText && !privacyAccepted)}
              className={`absolute flex items-center justify-center disabled:opacity-50 transition-all duration-500 ease-in-out ${
                (!!formConfig?.privacyConsentText && !privacyAccepted) ? "grayscale opacity-80" : ""
              }`}
              style={{
                left: rpx(450),
                top: rpx(submitTop),
                width: rpx(560),
                minHeight: rpx(113),
                height: "auto",
                paddingTop: rpx(10),
                paddingBottom: rpx(10),
                borderRadius: rpx(63),
                backgroundColor: "#756F3F",
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span
                className="font-anaheim font-semibold text-white text-center whitespace-pre-line"
                style={{ 
                  fontSize: rpx(48),
                  lineHeight: rpx(52),
                }}
              >
                {submitting ? "Submitting..." : (configData?.submitButtonText || "Send Inquiry")}
              </span>
            </motion.button>
          </form>
        </div>
      </div>

      {/* ========== 移动端布局 ========== */}
      <div className="block md:hidden px-5 py-8">
        {/* Hero 区域 */}
        <div className="relative rounded-2xl overflow-hidden mb-6" style={{ minHeight: "200px" }}>
          {image ? (
            image.enableLink && image.linkUrl ? (
              <Link href={image.linkUrl} target={image.openInNewTab ? "_blank" : undefined} rel={image.openInNewTab ? "noopener noreferrer" : undefined} className="block absolute inset-0 w-full h-full">
                <OptimizedImage
                  image={image as any}
                  alt="OEM/ODM Contact"
                  size="large"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </Link>
            ) : (
              <OptimizedImage
                image={image as any}
                alt="OEM/ODM Contact"
                size="large"
                className="absolute inset-0 w-full h-full object-cover"
              />
            )
          ) : (
            <div className="absolute inset-0 bg-black" />
          )}
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative p-6">
            <h2 className="font-anaheim font-extrabold text-white text-3xl mb-4 whitespace-pre-line">{title}</h2>
            <p className="font-anaheim font-semibold text-white text-sm leading-relaxed">{description}</p>
          </div>
        </div>

        {/* 表单区域 */}
        <div className="rounded-2xl p-6" style={{ backgroundColor: "#FFFFFF", border: "1px solid #cfcaa2" }}>
          <h2 className="font-anaheim font-extrabold text-3xl mb-6" style={{ color: "#6F6200" }}>
            {configData?.displayName || "OEM/ODM Requirements"}
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* 文本输入框 */}
            {textFields.map(field => {
              const isPhone = field.fieldType === 'tel' || field.fieldType === 'phone' || field.fieldName.toLowerCase().includes('phone') || field.fieldName.toLowerCase().includes('whatsapp');
              
              if (isPhone) {
                return (
                  <PhoneInput
                    key={field.fieldName}
                    id={`mobile-${field.fieldName}`}
                    value={formData[field.fieldName] || ''}
                    onChange={(phone) => handleChange(field.fieldName, phone)}
                    placeholder={field.placeholder || field.label}
                    disabled={submitting}
                    className="!bg-[#F3F1EA] !border-none !h-12 !rounded-lg"
                    buttonClassName="!bg-transparent !border-r-0 !text-[#756F3F] hover:!bg-black/5 !rounded-l-lg !px-3 !h-full"
                    inputClassName="!bg-transparent !text-[#756F3F] !placeholder-[#756F3F]/50 !font-anaheim !font-semibold !text-base !h-full"
                    dialCodeClassName="!text-[#756F3F] !text-base"
                    containerClassName="!h-12"
                  />
                );
              }

              return (
                <input
                  key={field.fieldName}
                  type={field.fieldType === 'email' ? 'email' : 'text'}
                  value={formData[field.fieldName] || ''}
                  onChange={(e) => handleChange(field.fieldName, e.target.value)}
                  className="w-full h-12 font-anaheim font-semibold outline-none px-4 rounded-lg"
                  style={{ backgroundColor: "#F3F1EA", color: "#756F3F" }}
                  placeholder={field.placeholder || field.label}
                  disabled={submitting}
                />
              );
            })}

            {/* 下拉选择 */}
            {selectFields.map(field => (
              <select
                key={field.fieldName}
                value={formData[field.fieldName] || ''}
                onChange={(e) => handleChange(field.fieldName, e.target.value)}
                className="w-full h-12 font-anaheim font-semibold outline-none px-4 rounded-lg appearance-none"
                style={{ backgroundColor: "#F3F1EA", color: "#756F3F" }}
                disabled={submitting}
              >
                <option value="">{field.placeholder || field.label}</option>
                {field.options?.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            ))}

            {/* Textarea */}
            {textareaFields.map(field => (
              <textarea
                key={field.fieldName}
                value={formData[field.fieldName] || ''}
                onChange={(e) => handleChange(field.fieldName, e.target.value)}
                className="w-full h-32 font-anaheim font-semibold outline-none resize-none p-4 rounded-lg"
                style={{ backgroundColor: "#F3F1EA", color: "#756F3F" }}
                placeholder={field.placeholder || field.label}
                disabled={submitting}
              />
            ))}

            {/* Checkbox */}
            {checkboxFields.map(field => (
              <div key={field.fieldName} className="rounded-xl p-4" style={{ backgroundColor: "#FBF6E4" }}>
                <h3 className="font-anaheim font-bold text-lg mb-3" style={{ color: "#6F6200" }}>{field.label}</h3>
                <div className="flex flex-wrap gap-2">
                  {field.options?.map(option => (
                    <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                      <div
                        className="relative w-4 h-4 rounded-full flex items-center justify-center"
                        style={{ border: `1px solid ${(formData[field.fieldName] || []).includes(option.value) ? "#6F6200" : "#9C9667"}` }}
                      >
                        {(formData[field.fieldName] || []).includes(option.value) && (
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#6F6200" }} />
                        )}
                      </div>
                      <input
                        type="checkbox"
                        checked={(formData[field.fieldName] || []).includes(option.value)}
                        onChange={(e) => handleCheckboxChange(field.fieldName, option.value, e.target.checked)}
                        className="hidden"
                      />
                      <span className="font-anaheim font-semibold text-sm" style={{ color: "#6F6200" }}>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            {/* 上传文件 */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div className="flex items-center justify-center px-4 py-2 rounded-full" style={{ border: "1px solid #756f3f" }}>
                <svg width="16" height="16" viewBox="0 0 25 25" fill="none" className="mr-2">
                  <path d="M12.5 5V20M5 12.5H20" stroke="#756F3F" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <span className="font-anaheim font-semibold text-sm" style={{ color: "#756F3F" }}>
                  {uploadedFiles.length > 0 ? `${uploadedFiles.length} file(s)` : "Upload File"}
                </span>
              </div>
            </div>

            {/* Turnstile */}
            {turnstileSiteKey && (
              <div className="mt-2">
                <Turnstile
                  key={turnstileKey}
                  siteKey={turnstileSiteKey}
                  onVerify={handleTurnstileVerify}
                  onError={handleTurnstileError}
                  onExpire={handleTurnstileExpire}
                  theme="light"
                  size="compact"
                  language={locale === 'zh' ? 'zh-CN' : locale}
                />
              </div>
            )}

            {/* Privacy Consent Checkbox - Mobile */}
            {formConfig?.privacyConsentText && !isGloballyAccepted && (
              <div
                className="flex items-start gap-3 my-2 cursor-pointer group"
                onClick={() => handlePrivacyToggle(!privacyAccepted)}
              >
                <div
                  className={`flex-shrink-0 border flex items-center justify-center mt-1 transition-all ${
                    privacyAccepted ? "bg-[#756F3F] border-[#756F3F]" : "border-gray-300 bg-transparent"
                  }`}
                  style={{
                    width: "18px",
                    height: "18px",
                    borderRadius: "4px",
                  }}
                >
                  {privacyAccepted && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <p className="text-[12px] text-[#756F3F] leading-relaxed text-left whitespace-pre-line select-none">
                  {formConfig.privacyConsentText}
                </p>
              </div>
            )}

            {/* 错误提示 */}
            {error && <div className="text-red-600 text-sm">{error}</div>}

            {/* 提交按钮 */}
            <button
              type="submit"
              disabled={submitting || (!!formConfig?.privacyConsentText && !privacyAccepted)}
              className={`w-full py-4 px-6 rounded-full font-anaheim font-semibold text-white text-xl disabled:opacity-50 h-auto whitespace-pre-line leading-tight ${
                (!!formConfig?.privacyConsentText && !privacyAccepted) ? "grayscale opacity-80" : ""
              }`}
              style={{ backgroundColor: "#756F3F" }}
            >
              {submitting ? "Submitting..." : (configData?.submitButtonText || "Send Inquiry")}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}

export default OemOdmContactForm
