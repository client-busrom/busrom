"use client"

import React, { useState, useEffect, useCallback, useRef } from "react"
import { Upload, CheckCircle, Info, ChevronLeft, ChevronRight } from "lucide-react"
import { OptimizedImage } from "@/components/ui/OptimizedImage"
import { Turnstile } from "@/components/ui/turnstile"

// 设计稿基准尺寸
const DESIGN_WIDTH = 1920
const SECTION_HEIGHT = 922
const DEFAULT_TEXTAREA_HEIGHT = 100 // 默认 textarea 高度

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

// 副标题文本片段，支持加粗标记
interface SubtitleSegment {
  text: string
  bold?: boolean
}

interface ContactFormSectionProps {
  // 主要内容区域
  verticalTitle?: string  // 竖排文字 "Get A Quote"
  title?: string          // 横排标题 "Warmly Welcome To Send Us Inquiry!"
  subtitle?: SubtitleSegment[]  // 副标题，支持加粗片段
  // 左下角轮播图
  images?: (MediaObject | null)[]
  // 表单配置（从侧边栏 formBlock 获取）
  formConfig?: {
    id?: string
    data?: FormConfigData
  } | null
  // 底部提示（无序列表）
  tips?: string[]
  // locale
  locale?: string
}

const defaultSubtitle: SubtitleSegment[] = [
  { text: "Based On Your " },
  { text: "Specific Needs", bold: true },
  { text: ", We Will Provide A Customized Quote Or Solution And Send It Directly To Your Email." },
]

export function ContactFormSection({
  verticalTitle = "Get A Quote",
  title = "Warmly Welcome To Send Us Inquiry!",
  subtitle = defaultSubtitle,
  images = [],
  formConfig,
  tips = [],
  locale = "en",
}: ContactFormSectionProps) {
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [fileName, setFileName] = useState<string>("")
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isHoveringControl, setIsHoveringControl] = useState(false)

  // Textarea 高度追踪
  const [extraHeight, setExtraHeight] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // 监听 textarea 高度变化（拉伸）
  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const currentHeight = entry.contentRect.height
        // 计算默认高度（vw 转 px）
        const defaultHeightPx = (DEFAULT_TEXTAREA_HEIGHT / DESIGN_WIDTH) * window.innerWidth
        const extra = Math.max(0, currentHeight - defaultHeightPx)
        setExtraHeight(extra)
      }
    })

    observer.observe(textarea)
    return () => observer.disconnect()
  }, [])

  // Turnstile
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [turnstileSiteKey, setTurnstileSiteKey] = useState<string | null>(null)
  const [turnstileKey, setTurnstileKey] = useState(0)

  // Fetch Turnstile site key
  useEffect(() => {
    const fetchSiteKey = async () => {
      try {
        const res = await fetch("/api/site-config")
        if (res.ok) {
          const data = await res.json()
          if (data.turnstileSiteKey) {
            setTurnstileSiteKey(data.turnstileSiteKey)
          }
        }
      } catch (error) {
        console.error("Failed to fetch Turnstile site key:", error)
      }
    }
    fetchSiteKey()
  }, [])

  // 过滤掉 null 值的有效图片（提前计算用于 useEffect）
  const validImagesForEffect = images.filter((img): img is MediaObject => img !== null && img !== undefined)

  // 用于重置自动轮播计时器的 key
  const [autoPlayKey, setAutoPlayKey] = useState(0)

  // 轮播图自动切换
  useEffect(() => {
    if (validImagesForEffect.length <= 1) return
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % validImagesForEffect.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [validImagesForEffect.length, autoPlayKey])

  // 轮播图手动切换 - 重置自动轮播计时器
  const handlePrevImage = () => {
    setCurrentImageIndex((prev) =>
      prev > 0 ? prev - 1 : validImagesForEffect.length - 1
    )
    setAutoPlayKey((prev) => prev + 1) // 重置计时器
  }

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev < validImagesForEffect.length - 1 ? prev + 1 : 0
    )
    setAutoPlayKey((prev) => prev + 1) // 重置计时器
  }

  // vw 尺寸计算
  const vw = (v: number) => `${(v / DESIGN_WIDTH) * 100}vw`

  // 获取表单字段配置
  const configData = formConfig?.data
  const fields = configData?.fields?.[locale] || configData?.fields?.["en"] || []
  const sortedFields = [...fields].sort((a, b) => (a.order || 0) - (b.order || 0))

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

    // Validate Turnstile if enabled
    if (turnstileSiteKey && !turnstileToken) {
      setSubmitStatus("error")
      setErrorMessage(locale === "zh" ? "请完成人机验证" : "Please complete the captcha verification")
      return
    }

    setIsSubmitting(true)
    setSubmitStatus("idle")
    setErrorMessage("")

    try {
      // 如果有文件，先上传文件
      let fileUrl = ""
      if (uploadedFile && configData?.id) {
        const fileFormData = new FormData()
        fileFormData.append("file", uploadedFile)
        fileFormData.append("formConfigId", configData.id)
        fileFormData.append("fieldName", "attachment")

        const uploadRes = await fetch("/api/form-file-upload", {
          method: "POST",
          body: fileFormData,
        })

        if (uploadRes.ok) {
          const uploadResult = await uploadRes.json()
          fileUrl = uploadResult.fileUrl
        }
      }

      // 提交表单
      const submissionData = {
        formId: configData?.id,
        formName: configData?.name || "contact-form",
        data: {
          ...formData,
          ...(fileUrl ? { attachment: fileUrl } : {}),
        },
        locale,
        sourcePage: typeof window !== "undefined" ? window.location.href : "",
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

      // 5秒后重置状态
      setTimeout(() => {
        setSubmitStatus("idle")
      }, 5000)
    } catch (error) {
      console.error("Form submission error:", error)
      setSubmitStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "Failed to submit form. Please try again.")
      setTurnstileToken(null)
      setTurnstileKey((prev) => prev + 1)
    } finally {
      setIsSubmitting(false)
    }
  }

  // 渲染副标题，加粗部分使用双层效果：底层 FFA600 + 上层透明带 825500 描边
  const renderSubtitle = () => {
    return subtitle.map((segment, index) => {
      if (segment.bold) {
        return (
          <span key={index} className="relative inline-block">
            {/* 底层 - FFA600 实心文字 */}
            <span style={{ color: "#FFA600" }}>{segment.text}</span>
            {/* 上层 - 透明文字 + 825500 外描边 */}
            <span
              className="absolute inset-0"
              style={{
                color: "transparent",
                WebkitTextStroke: "1px #825500",
              }}
            >
              {segment.text}
            </span>
          </span>
        )
      }
      return <span key={index}>{segment.text}</span>
    })
  }

  // 过滤掉 null 值的有效图片
  const validImages = images.filter((img): img is MediaObject => img !== null && img !== undefined)

  // section 高度：基础高度 + textarea 额外高度
  const sectionHeight = `calc(${vw(SECTION_HEIGHT)} + ${extraHeight}px)`

  return (
    <section
      id="contact-form"
      className="relative w-full"
      style={{
        height: sectionHeight,
        background: "linear-gradient(180deg, #FFF9E8 0%, #F9E8A7 100%)",
      }}
    >
      {/* 左侧深色渐变条 */}
      <div
        className="absolute"
        style={{
          left: vw(1),
          top: 0,
          width: vw(322),
          height: "100%",
          background: "linear-gradient(180deg, #FAF3BB 0%, #B8AF6C 100%)",
        }}
      />

      {/* 左侧标题区域 */}
      <div
        className="absolute"
        style={{
          left: vw(373),
          top: vw(70),
          width: vw(520),
        }}
      >
        {/* 标题阴影层 */}
        <h2
          className="absolute font-moul"
          style={{
            top: vw(4),
            fontSize: vw(40),
            lineHeight: vw(52),
            color: "#4B3A02",
          }}
        >
          {title}
        </h2>
        {/* 标题主层 */}
        <h2
          className="relative font-moul"
          style={{
            fontSize: vw(40),
            lineHeight: vw(52),
            color: "#B08B07",
          }}
        >
          {title}
        </h2>
      </div>

      {/* 副标题 */}
      <p
        className="absolute font-moul"
        style={{
          left: vw(372),
          top: vw(210),
          width: vw(520),
          fontSize: vw(26),
          lineHeight: vw(40),
          color: "#4B3A02",
        }}
      >
        {renderSubtitle()}
      </p>

      {/* 右侧表单区域 - 使用 flex 布局实现自适应 */}
      <form
        onSubmit={handleSubmit}
        className="absolute flex flex-col"
        style={{
          left: vw(1188),
          top: vw(80),
          width: vw(486),
          gap: vw(12),  // 输入框之间的间距（收缩）
        }}
      >
        {/* 动态渲染表单字段 */}
        {sortedFields.length > 0 ? (
          <>
            {sortedFields.slice(0, 4).map((field) => {
              const isTextarea = field.fieldType === "textarea" || field.fieldName === "message"
              if (isTextarea) return null
              return (
                <input
                  key={field.fieldName}
                  type={field.fieldType === "email" ? "email" : "text"}
                  placeholder={`${field.placeholder || field.label}${field.required ? " *" : ""}`}
                  value={formData[field.fieldName] || ""}
                  onChange={(e) => handleInputChange(field.fieldName, e.target.value)}
                  className="font-anaheim font-semibold placeholder:text-white/95"
                  style={{
                    width: vw(486),
                    height: vw(50),
                    borderRadius: vw(12),
                    backgroundColor: "#B4A25F",
                    border: "1px solid rgba(255, 255, 255, 0.34)",
                    paddingLeft: vw(24),
                    fontSize: vw(18),
                    lineHeight: vw(36),
                    color: "white",
                  }}
                  required={field.required}
                  disabled={isSubmitting}
                />
              )
            })}
            {/* Textarea - 不显示 Message Note 标签 */}
            {sortedFields.filter(f => f.fieldType === "textarea" || f.fieldName === "message").map(field => (
              <textarea
                key={field.fieldName}
                ref={textareaRef}
                placeholder={field.placeholder || field.label}
                value={formData[field.fieldName] || ""}
                onChange={(e) => handleInputChange(field.fieldName, e.target.value)}
                className="font-anaheim font-semibold placeholder:text-white/95 resize-y"
                style={{
                  width: vw(486),
                  minHeight: vw(100),
                  maxHeight: vw(250),
                  borderRadius: vw(12),
                  backgroundColor: "#B4A25F",
                  border: "1px solid rgba(255, 255, 255, 0.34)",
                  paddingLeft: vw(24),
                  paddingRight: vw(24),
                  paddingTop: vw(14),
                  fontSize: vw(18),
                  lineHeight: vw(22),
                  color: "white",
                }}
                required={field.required}
                disabled={isSubmitting}
              />
            ))}
          </>
        ) : (
          // 默认表单字段（当没有 CMS 配置时）
          <>
            <input
              type="text"
              placeholder="Your Name / Company Name *"
              value={formData.name || ""}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="font-anaheim font-semibold placeholder:text-white/95"
              style={{
                width: vw(486), height: vw(50), borderRadius: vw(12),
                backgroundColor: "#B4A25F", border: "1px solid rgba(255, 255, 255, 0.34)",
                paddingLeft: vw(24), fontSize: vw(18), lineHeight: vw(36), color: "white",
              }}
              required
              disabled={isSubmitting}
            />
            <input
              type="email"
              placeholder="Your Email *"
              value={formData.email || ""}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="font-anaheim font-semibold placeholder:text-white/95"
              style={{
                width: vw(486), height: vw(50), borderRadius: vw(12),
                backgroundColor: "#B4A25F", border: "1px solid rgba(255, 255, 255, 0.34)",
                paddingLeft: vw(24), fontSize: vw(18), lineHeight: vw(36), color: "white",
              }}
              required
              disabled={isSubmitting}
            />
            <input
              type="text"
              placeholder="Your WhatsApp / WeChat"
              value={formData.whatsapp || ""}
              onChange={(e) => handleInputChange("whatsapp", e.target.value)}
              className="font-anaheim font-semibold placeholder:text-white/95"
              style={{
                width: vw(486), height: vw(50), borderRadius: vw(12),
                backgroundColor: "#B4A25F", border: "1px solid rgba(255, 255, 255, 0.34)",
                paddingLeft: vw(24), fontSize: vw(18), lineHeight: vw(36), color: "white",
              }}
              disabled={isSubmitting}
            />
            <input
              type="text"
              placeholder="Country / Region"
              value={formData.country || ""}
              onChange={(e) => handleInputChange("country", e.target.value)}
              className="font-anaheim font-semibold placeholder:text-white/95"
              style={{
                width: vw(486), height: vw(50), borderRadius: vw(12),
                backgroundColor: "#B4A25F", border: "1px solid rgba(255, 255, 255, 0.34)",
                paddingLeft: vw(24), fontSize: vw(18), lineHeight: vw(36), color: "white",
              }}
              disabled={isSubmitting}
            />
            <textarea
              ref={textareaRef}
              placeholder="Please Briefly Describe Your Project Requirements Or Customization Ideas."
              value={formData.message || ""}
              onChange={(e) => handleInputChange("message", e.target.value)}
              className="font-anaheim font-semibold placeholder:text-white/95 resize-y"
              style={{
                width: vw(486), minHeight: vw(100), maxHeight: vw(250), borderRadius: vw(12),
                backgroundColor: "#B4A25F", border: "1px solid rgba(255, 255, 255, 0.34)",
                paddingLeft: vw(24), paddingRight: vw(24), paddingTop: vw(14),
                fontSize: vw(18), lineHeight: vw(22), color: "white",
              }}
              disabled={isSubmitting}
            />
          </>
        )}

        {/* Upload File 按钮 - 在 textarea 下方右侧 */}
        <div className="flex justify-end" style={{ marginTop: vw(8) }}>
          <label
            className="flex items-center cursor-pointer group transition-colors duration-300 hover:bg-[#6B5500]"
            style={{
              width: vw(248),
              height: vw(59),
              borderRadius: vw(33.5),
              border: "1px solid #6B5500",
              backgroundColor: "transparent",
            }}
          >
            <input
              type="file"
              onChange={handleFileChange}
              className="hidden"
              disabled={isSubmitting}
            />
            <Upload
              className="absolute transition-colors duration-300 group-hover:text-white"
              style={{
                marginLeft: vw(46),
                width: vw(25),
                height: vw(25),
                color: "#6B5500",
              }}
              strokeWidth={2}
            />
            <span
              className="font-anaheim font-semibold truncate transition-colors duration-300 group-hover:text-white"
              style={{
                marginLeft: vw(84),
                width: vw(150),
                fontSize: vw(24),
                lineHeight: vw(40),
                color: "#6B5500",
              }}
            >
              {fileName || "Upload File"}
            </span>
          </label>
        </div>

        {/* Turnstile 验证 */}
        {turnstileSiteKey && (
          <div style={{ marginTop: vw(10) }}>
            <Turnstile
              key={turnstileKey}
              siteKey={turnstileSiteKey}
              onVerify={handleTurnstileSuccess}
              onError={() => setTurnstileToken(null)}
              onExpire={() => setTurnstileToken(null)}
              theme="light"
              size="compact"
              language={locale === "zh" ? "zh-CN" : locale}
            />
          </div>
        )}

        {/* Submit 按钮 */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="font-anaheim font-semibold text-white transition-all duration-300 disabled:opacity-50 hover:bg-[#5A4800] hover:scale-[1.02] hover:shadow-lg"
          style={{
            width: vw(486),
            height: vw(83),
            borderRadius: vw(63),
            backgroundColor: submitStatus === "success" ? "#4CAF50" : "#7B6100",
            fontSize: vw(32),
            lineHeight: vw(40),
            marginTop: vw(10),
          }}
        >
          {isSubmitting ? "Submitting..." : submitStatus === "success" ? "Submitted!" : "Submit Your Project"}
        </button>

        {/* 错误提示 */}
        {submitStatus === "error" && (
          <div
            className="font-anaheim text-red-600"
            style={{
              width: vw(486),
              fontSize: vw(16),
            }}
          >
            {errorMessage}
          </div>
        )}

        {/* 底部提示信息 */}
        {tips.length > 0 && (
          <div
            className="flex flex-col"
            style={{
              marginLeft: vw(24),
              width: vw(430),
              gap: vw(14),
              marginTop: vw(10),
            }}
          >
          {tips.map((tip, index) => (
            <div
              key={index}
              className="flex items-start gap-2"
            >
            {index < 2 ? (
              <CheckCircle
                style={{
                  width: vw(19),
                  height: vw(19),
                  color: "#735F0A",
                  marginTop: vw(3),
                  flexShrink: 0,
                }}
                strokeWidth={2}
              />
            ) : (
              <Info
                style={{
                  width: vw(19),
                  height: vw(19),
                  color: "#735F0A",
                  marginTop: vw(3),
                  flexShrink: 0,
                }}
                strokeWidth={2}
              />
            )}
            <span
              className="font-anaheim font-medium text-black"
              style={{
                fontSize: vw(20),
                lineHeight: vw(25),
              }}
            >
              {tip}
            </span>
          </div>
          ))}
        </div>
        )}
      </form>

      {/* 左下角图片区域 */}
      <div
        className="absolute overflow-hidden"
        style={{
          left: vw(4),
          top: vw(420),
          width: vw(780),
          height: vw(340),
          borderRadius: vw(260),
          backgroundColor: "#D9D9D9",
        }}
      >
        {/* 轮播图 */}
        {validImages.length > 0 && validImages[currentImageIndex] && (
          <OptimizedImage
            image={validImages[currentImageIndex] as any}
            alt="Contact form image"
            size="xlarge"
            className="w-full h-full object-cover transition-opacity duration-500"
            objectPosition={
              validImages[currentImageIndex]?.cropFocalPoint
                ? `${validImages[currentImageIndex].cropFocalPoint!.x}% ${validImages[currentImageIndex].cropFocalPoint!.y}%`
                : "center"
            }
          />
        )}

        {/* 圆环装饰 - 在图片内部 */}
        <div
          className="absolute rounded-full border-2"
          style={{
            left: vw(420),
            top: vw(290),
            width: vw(140),
            height: vw(140),
            borderColor: "white",
          }}
        />
      </div>

      {/* 竖排文字 - 两层：底层深色，上层白色（被图片区域裁切） */}
      {/* 底层 - 深色文字（完整显示） */}
      <span
        className="absolute font-moul whitespace-nowrap"
        style={{
          left: vw(180),
          top: vw(580),
          width: vw(80),
          height: vw(600),
          fontSize: vw(80),
          lineHeight: vw(75),
          transform: "rotate(-90deg)",
          transformOrigin: "top left",
          color: "#302C06",
        }}
      >
        {verticalTitle}
      </span>
      {/* 上层 - 白色文字（只在图片区域显示） */}
      <div
        className="absolute overflow-hidden pointer-events-none"
        style={{
          left: vw(4),
          top: vw(420),
          width: vw(780),
          height: vw(340),
          borderRadius: vw(260),
        }}
      >
        <span
          className="absolute font-moul whitespace-nowrap"
          style={{
            left: vw(176),
            top: vw(160),
            width: vw(80),
            height: vw(600),
            fontSize: vw(80),
            lineHeight: vw(75),
            transform: "rotate(-90deg)",
            transformOrigin: "top left",
            color: "white",
          }}
        >
          {verticalTitle}
        </span>
      </div>

      {/* 轮播控制区域 */}
      {validImages.length > 1 && (
        <>
          {/* 圆环控制器 - 悬停显示箭头 */}
          <div
            className="absolute rounded-full border group cursor-pointer"
            style={{
              left: vw(424),
              top: vw(710),
              width: vw(140),
              height: vw(140),
              borderColor: "#464010",
            }}
            onMouseEnter={() => setIsHoveringControl(true)}
            onMouseLeave={() => setIsHoveringControl(false)}
          >
            {/* 默认状态 - 中间小圆点 */}
            <div
              className={`absolute rounded-full bg-[#464010] transition-opacity duration-300 ${isHoveringControl ? "opacity-0" : "opacity-100"}`}
              style={{
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                width: vw(24),
                height: vw(24),
              }}
            />
            {/* 悬停状态 - 左右箭头 */}
            <div
              className={`absolute inset-0 flex items-center justify-between px-4 transition-opacity duration-300 ${isHoveringControl ? "opacity-100" : "opacity-0"}`}
            >
              {/* 左箭头 */}
              <button
                onClick={handlePrevImage}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#464010]/10 transition-colors"
              >
                <ChevronLeft
                  className="w-6 h-6"
                  style={{ color: "#464010" }}
                  strokeWidth={2}
                />
              </button>
              {/* 右箭头 */}
              <button
                onClick={handleNextImage}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#464010]/10 transition-colors"
              >
                <ChevronRight
                  className="w-6 h-6"
                  style={{ color: "#464010" }}
                  strokeWidth={2}
                />
              </button>
            </div>
          </div>

          {/* 进度条背景 */}
          <div
            className="absolute"
            style={{
              left: vw(140),
              top: vw(800),
              width: vw(240),
              height: vw(3),
              backgroundColor: "#464010",
              opacity: 0.3,
              borderRadius: vw(2),
            }}
          />
          {/* 进度条前景 */}
          <div
            className="absolute transition-all duration-100"
            style={{
              left: vw(140),
              top: vw(800),
              width: `calc(${vw(240)} * ${(currentImageIndex + 1) / validImages.length})`,
              height: vw(3),
              backgroundColor: "#464010",
              borderRadius: vw(2),
            }}
          />
          {/* 进度条末端装饰 */}
          <div
            className="absolute"
            style={{
              left: vw(368),
              top: vw(798),
              width: vw(14),
              height: vw(6),
              backgroundColor: "#464010",
              borderRadius: vw(2),
            }}
          />
        </>
      )}

      {/* 无轮播时的装饰元素 */}
      {validImages.length <= 1 && (
        <>
          <div
            className="absolute rounded-full border"
            style={{
              left: vw(424),
              top: vw(710),
              width: vw(140),
              height: vw(140),
              borderColor: "#464010",
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              left: vw(482),
              top: vw(768),
              width: vw(20),
              height: vw(20),
              backgroundColor: "#464010",
            }}
          />
          <div
            className="absolute"
            style={{
              left: vw(140),
              top: vw(800),
              width: vw(240),
              height: vw(1),
              backgroundColor: "#464010",
            }}
          />
          <div
            className="absolute"
            style={{
              left: vw(368),
              top: vw(798),
              width: vw(14),
              height: vw(5),
              backgroundColor: "#464010",
            }}
          />
        </>
      )}
    </section>
  )
}
