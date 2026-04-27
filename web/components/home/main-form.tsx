"use client";

import { useState, useEffect, useRef, useCallback, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { MainFormData } from "@/lib/content-data";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { Turnstile } from "@/components/ui/turnstile";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { HollowText } from "@/components/common/HollowText";

// lg 断点 (1024px) - 与 Tailwind 一致
const LG_BREAKPOINT = 1024;

// Helper: 获取提交次数
const getSubmissionCount = (): number => {
  if (typeof window === "undefined") return 0;
  return parseInt(sessionStorage.getItem("main_form_submissions") || "0", 10);
};

// Helper: 增加提交次数
const incrementSubmissionCount = (): void => {
  if (typeof window === "undefined") return;
  const current = getSubmissionCount();
  sessionStorage.setItem("main_form_submissions", String(current + 1));
};

// ------------------------------------------------------------------
// 类型定义
// ------------------------------------------------------------------
type Props = {
  data: MainFormData;
  locale?: string;
};

// ------------------------------------------------------------------
// 表单样式常量 (基于 Figma 1920x1136 设计)
// ------------------------------------------------------------------
const formLabelClasses = "block font-anaheim font-bold text-brand-form-input-text";

const formInputClasses = `
  mt-1 block w-full bg-transparent text-brand-form-input-text
  placeholder:text-white/50 font-anaheim font-bold text-base
  !border-0 !border-b !border-white !rounded-none
  !outline-none !ring-0 !shadow-none
  focus:!outline-none focus:!ring-0 focus:!border-b focus:!border-white focus:!shadow-none
  focus-visible:!outline-none focus-visible:!ring-0 focus-visible:!ring-offset-0
  autofill:bg-transparent autofill:text-brand-form-input-text
  [&:-webkit-autofill]:bg-transparent
  [&:-webkit-autofill]:[-webkit-text-fill-color:inherit]
  [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s]
`;

const formButtonClasses = `
  flex mx-auto rounded-full bg-brand-form-button-bg text-brand-text-inverse
  hover:bg-brand-form-button-bg/90 font-anaheim font-semibold
`;

// ------------------------------------------------------------------
// MainForm 组件
// ------------------------------------------------------------------
// 表单字段配置类型
interface FormField {
  fieldName: string;
  label: string;
  placeholder?: string;
  fieldType: 'text' | 'email' | 'phone' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'number' | 'date' | 'file';
  required?: boolean;
  width?: 'full' | 'half' | 'third';
  order?: number;
  options?: { value: string; label: string }[];
}

// 表单配置类型
interface FormConfig {
  name?: string;
  fields?: FormField[];
  submitButtonText: string;
  submittingText: string;
  successMessage: string;
  errorRequiredFields: string;
  errorNetworkMessage: string;
  errorCaptchaMessage: string;
  privacyConsentText?: string;
}

// Turnstile 配置类型
interface TurnstileConfig {
  enabled: boolean;
  siteKey: string;
  threshold: number;
}

export default function MainForm({ data, locale = "en" }: Props) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const leftImageRef = useRef<HTMLDivElement>(null);
  const rightImageRef = useRef<HTMLDivElement>(null);
  const [leftVisible, setLeftVisible] = useState(false);
  const [rightVisible, setRightVisible] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false); // lg 及以上
  const [isVisible, setIsVisible] = useState(false); // 表单是否进入视口

  // 表单配置 (从 FormConfig API 获取)
  const [formConfig, setFormConfig] = useState<FormConfig | null>(null);

  // 获取字段 label - 优先使用 formConfig 中的配置
  const getFieldLabel = (fieldName: string, fallbackLabel: string): string => {
    if (formConfig?.fields && Array.isArray(formConfig.fields)) {
      // 兼容处理：某些配置可能把 whatsapp 叫成 phone，或者大小写不同
      const searchNames = [fieldName.toLowerCase()];
      if (fieldName.toLowerCase() === "whatsapp") searchNames.push("phone", "mobile");
      
      const field = formConfig.fields.find(f => searchNames.includes(f.fieldName?.toLowerCase()));
      if (field?.label) {
        return field.label;
      }
    }
    return fallbackLabel;
  };

  // 获取字段 placeholder
  const getFieldPlaceholder = (fieldName: string, fallbackPlaceholder?: string): string | undefined => {
    if (formConfig?.fields && Array.isArray(formConfig.fields)) {
      const searchNames = [fieldName.toLowerCase()];
      if (fieldName.toLowerCase() === "whatsapp") searchNames.push("phone", "mobile", "tel");
      if (fieldName.toLowerCase() === "name") searchNames.push("fullname", "contact");
      
      // 1. 精确/兼容名匹配
      let field = formConfig.fields.find(f => searchNames.includes(f.fieldName?.toLowerCase()));
      
      // 2. 如果没找到，尝试包含匹配 (例如 "your_email" 匹配 "email")
      if (!field) {
        field = formConfig.fields.find(f => {
          const fName = f.fieldName?.toLowerCase() || "";
          return searchNames.some(s => fName.includes(s) || s.includes(fName));
        });
      }

      if (field?.placeholder !== undefined && field?.placeholder !== null) {
        return field.placeholder;
      }
    }
    return fallbackPlaceholder;
  };

  // 检查字段是否必填
  const isFieldRequired = (fieldName: string, defaultRequired: boolean = false): boolean => {
    if (formConfig?.fields) {
      const field = formConfig.fields.find(f => f.fieldName === fieldName);
      if (field !== undefined) {
        return field.required ?? defaultRequired;
      }
    }
    return defaultRequired;
  };
  // Turnstile 配置 (从 SiteConfig 获取)
  const [turnstileConfig, setTurnstileConfig] = useState<TurnstileConfig | null>(null);

  // 表单状态
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    whatsapp: "",
    company: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  // Turnstile 验证码状态
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const STORAGE_KEY = 'busrom_privacy_consent';
  const [isGloballyAccepted, setIsGloballyAccepted] = useState(false);

  // 挂载时检查全局同意状态
  useEffect(() => {
    const accepted = localStorage.getItem(STORAGE_KEY) === 'true';
    if (accepted) {
      setPrivacyAccepted(true);
      setIsGloballyAccepted(true);
    }
  }, []);

  const handlePrivacyToggle = (val: boolean) => {
    setPrivacyAccepted(val);
    if (val) {
      localStorage.setItem(STORAGE_KEY, 'true');
      setIsGloballyAccepted(true);
    } else {
      localStorage.removeItem(STORAGE_KEY);
      setIsGloballyAccepted(false);
    }
  };
  const [submissionCount, setSubmissionCount] = useState(0);

  // 是否需要显示验证码
  const shouldShowCaptcha = !!(turnstileConfig?.enabled &&
    turnstileConfig?.siteKey &&
    submissionCount >= (turnstileConfig.threshold - 1));

  // 延迟加载配置 - 只在表单进入视口时才获取
  const [configLoaded, setConfigLoaded] = useState(false);

  // 获取表单配置和 Turnstile 配置 - 延迟到表单可见时
  useEffect(() => {
    if (!isVisible || configLoaded) return;

    const fetchConfigs = async () => {
      try {
        // 并行获取表单配置和 Turnstile 配置
        const [formRes, turnstileRes] = await Promise.all([
          fetch(`/api/form-config/main-form?locale=${locale}`),
          fetch('/api/site-config/turnstile'),
        ]);

        if (formRes.ok) {
          const config = await formRes.json();
          setFormConfig(config);
          console.log(`[MainForm] Loaded config for "${locale}":`, config);
        }

        if (turnstileRes.ok) {
          const config = await turnstileRes.json();
          setTurnstileConfig(config);
        }

        setConfigLoaded(true);
      } catch (err) {
        console.error("Error fetching configs:", err);
      }
    };
    fetchConfigs();
  }, [locale, isVisible, configLoaded]);

  // 初始化提交次数
  useEffect(() => {
    setSubmissionCount(getSubmissionCount());
  }, []);


  // Turnstile 回调
  const handleTurnstileVerify = useCallback((token: string) => {
    setTurnstileToken(token);
    setError(null);
  }, []);

  const handleTurnstileError = useCallback(() => {
    setTurnstileToken(null);
    setError(formConfig?.errorCaptchaMessage || "Captcha verification failed");
  }, [formConfig?.errorCaptchaMessage]);

  const handleTurnstileExpire = useCallback(() => {
    setTurnstileToken(null);
  }, []);

  // 表单输入处理
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // 表单提交
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    // 验证必填字段
    if (!formData.name || !formData.email) {
      setError(formConfig?.errorRequiredFields || "Please fill in name and email");
      setSubmitting(false);
      return;
    }

    // 检查验证码
    if (shouldShowCaptcha && !turnstileToken) {
      setError(formConfig?.errorCaptchaMessage || "Please complete the captcha verification");
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/form-submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formName: formConfig?.name || "main-form",
          data: formData,
          locale,
          privacyAccepted,
          turnstileToken: shouldShowCaptcha ? turnstileToken : undefined,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
        incrementSubmissionCount();
        setSubmissionCount((prev) => prev + 1);

        // 5秒后重置表单
        setTimeout(() => {
          setSubmitted(false);
          setFormData({ name: "", email: "", whatsapp: "", company: "", message: "" });
          setTurnstileToken(null);
        }, 5000);
      } else {
        const errorData = await res.json();
        setError(errorData.error || formConfig?.errorNetworkMessage || "Submission failed");
        setTurnstileToken(null);
      }
    } catch (err) {
      setError(formConfig?.errorNetworkMessage || "Network error, please try again");
      setTurnstileToken(null);
    } finally {
      setSubmitting(false);
    }
  };


  // 检测是否为桌面端 (lg 及以上)
  useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${LG_BREAKPOINT}px)`);
    const onChange = () => {
      setIsDesktop(window.innerWidth >= LG_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsDesktop(window.innerWidth >= LG_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  // 检测表单是否进入视口 - 用于延迟加载配置
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || isVisible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" } // 提前 200px 开始加载
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [isVisible]);

  // 移动端/平板淡入效果的 Intersection Observer (lg 以下)
  useEffect(() => {
    if (isDesktop) return;

    const observerOptions = {
      threshold: 0.3,
      rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.target === leftImageRef.current && entry.isIntersecting) {
          setLeftVisible(true);
        }
        if (entry.target === rightImageRef.current && entry.isIntersecting) {
          setRightVisible(true);
        }
      });
    }, observerOptions);

    if (leftImageRef.current) observer.observe(leftImageRef.current);
    if (rightImageRef.current) observer.observe(rightImageRef.current);

    return () => observer.disconnect();
  }, [isDesktop]);

  // Guard: if no data, don't render
  if (!data) {
    return null;
  }

  // 表单容器样式
  const cardContainerClass = `bg-brand-form-bg rounded-2xl px-8 py-12`;

  // 固定的宽高比容器 (404x837)
  const imageCardContainerClass = `bg-transparent w-full aspect-[404/837] relative rounded-[3rem] shadow-[0_0_20px_rgba(255,255,255,0.3),0_0_60px_rgba(255,255,255,0.15),0_0_120px_rgba(255,255,255,0.1)]`;

  // 滚动视差动画逻辑（优化版：直接操纵 DOM，避免触发整个表单的 React Re-render）
  useEffect(() => {
    if (!isDesktop) return;

    let ticking = false;
    const updateTransforms = () => {
      if (!sectionRef.current) return;

      const element = sectionRef.current;
      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // progress: 0 = 板块刚进入视口底部, 1 = 板块顶部到达视口顶部
      const progress = Math.max(0, Math.min(1, (windowHeight - rect.top) / (windowHeight + rect.height)));
      const maxOffset = 500;

      // 左侧：从上方进入，往下移动
      if (leftImageRef.current) {
        const offsetLeft = (1 - progress * 2) * maxOffset;
        leftImageRef.current.style.transform = `translateY(${offsetLeft}px)`;
      }

      // 右侧：从下方进入，往上移动
      if (rightImageRef.current) {
        const offsetRight = (1 - progress * 2) * maxOffset;
        rightImageRef.current.style.transform = `translateY(${-offsetRight}px)`;
      }
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateTransforms();
          ticking = false;
        });
        ticking = true;
      }
    };

    // 初始化执行一次
    updateTransforms();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isDesktop]);

  // ------------------------------------------------------------------
  // JSX 渲染
  // ------------------------------------------------------------------
  return (
    <section
      ref={sectionRef}
      className="py-32 md:py-40 bg-brand-secondary text-brand-text-inverse overflow-hidden duration-500"
      data-header-theme="transparent"
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 max-w-6xl mx-auto lg:items-center items-center">
          {/* 左侧 - 图片 */}
          <div
            ref={leftImageRef}
            className={cn(
              "lg:w-[30%] w-[60%] will-change-transform",
              // lg 以下 (手机/平板) 淡入效果
              !isDesktop && "transition-opacity duration-700 ease-out",
              !isDesktop && (leftVisible ? "opacity-100" : "opacity-0")
            )}
            style={isDesktop ? { transform: 'translateY(500px)' } : undefined}
          >
            <div className={imageCardContainerClass}>
              {/* 1. 底层手机框 (z-10) */}
              <Image src="/iPhoneFrame.svg" alt="iPhone Frame" fill className="object-cover z-10" />

              {/* 2. 顶层内容图片 (z-20) + SVG Mask */}
              <div
                className="absolute z-20"
                style={{
                  top: "1.4%",
                  bottom: "1.4%",
                  left: "3.6%",
                  right: "3.6%",
                  maskImage: "url('/iPhoneFrame-image.svg')",
                  maskSize: "100% 100%",
                  maskRepeat: "no-repeat",
                  WebkitMaskImage: "url('/iPhoneFrame-image.svg')",
                  WebkitMaskSize: "100% 100%",
                  WebkitMaskRepeat: "no-repeat",
                }}
              >
                <OptimizedImage image={data.image1} alt={data.image1?.altText || data.designTextLeft} size="medium" className="object-cover w-full h-full absolute inset-0" />
              </div>
            </div>
            {/* 3. 文字遮罩 (z-30) */}
            <div className="w-full p-4 lg:p-8 z-30 flex justify-center">
              <div className="relative inline-block">
                {/* 背景空心描边层 - 偏移 2px */}
                <div className="absolute left-[2px] top-[2px] w-full pointer-events-none">
                  <HollowText strokeColor="#f6f4ed" strokeWidth={1}>
                    <span className="text-base lg:text-xl font-anaheim font-bold block text-center leading-tight">{data.designTextLeft}</span>
                  </HollowText>
                </div>
                {/* 原本的文字 */}
                <p className="text-white text-center text-base lg:text-xl text-stroke-black font-anaheim font-bold relative z-10">
                  {data.designTextLeft}
                </p>
              </div>
            </div>
          </div>

          {/* 中间 - 表单 */}
          {/* 宽度 477/1920 ≈ 24.8%, 但需要加上左右padding，实际容器更宽 */}
          <div
            className="w-full lg:w-auto order-first lg:order-none"
            style={{ width: isDesktop ? "clamp(320px, 35vw, 560px)" : "100%" }}
          >
            <div className={cardContainerClass}>
              {/* 提交成功状态 */}
              {submitted ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4 text-white">✓</div>
                  <p className="text-white text-lg font-anaheim whitespace-pre-line">
                    {formConfig?.successMessage || "Your message has been sent successfully!"}
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="flex flex-col"
                  style={{ gap: "clamp(12px, 1.2vw, 24px)" }}
                >
                  {/* Name */}
                  <div>
                    <Label
                      htmlFor="name"
                      className={formLabelClasses}
                      style={{ fontSize: "clamp(10px, 1.04vw, 20px)" }}
                    >
                      {getFieldLabel("name", data.placeholderName)} {isFieldRequired("name", true) && <span className="text-red-400">*</span>}
                    </Label>
                    <Input
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder={getFieldPlaceholder("name", data.placeholderName)}
                      className={formInputClasses}
                      required={isFieldRequired("name", true)}
                    />
                  </div>
                  {/* Email */}
                  <div>
                    <Label
                      htmlFor="email"
                      className={formLabelClasses}
                      style={{ fontSize: "clamp(10px, 1.04vw, 20px)" }}
                    >
                      {getFieldLabel("email", data.placeholderEmail)} {isFieldRequired("email", true) && <span className="text-red-400">*</span>}
                    </Label>
                    <Input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder={getFieldPlaceholder("email", data.placeholderEmail)}
                      className={formInputClasses}
                      required={isFieldRequired("email", true)}
                    />
                  </div>
                  {/* WhatsApp */}
                  <div>
                    <Label
                      htmlFor="whatsapp"
                      className={formLabelClasses}
                      style={{ fontSize: "clamp(10px, 1.04vw, 20px)" }}
                    >
                      {getFieldLabel("whatsapp", data.placeholderWhatsapp)} {isFieldRequired("whatsapp") && <span className="text-red-400">*</span>}
                    </Label>
                    <PhoneInput
                      id="whatsapp"
                      value={formData.whatsapp}
                      onChange={(phone) => handleInputChange("whatsapp", phone)}
                      placeholder={getFieldPlaceholder("whatsapp", data.placeholderWhatsapp)}
                      required={isFieldRequired("whatsapp")}
                      disabled={submitting}
                      className="!bg-transparent !border-0 !border-b !border-white !rounded-none !h-[45px]"
                      buttonClassName="!bg-transparent !border-0 !border-r !border-white/20 !text-brand-form-input-text hover:!bg-white/5 !rounded-none !px-0 !mr-2"
                      inputClassName="!bg-transparent !text-brand-form-input-text !placeholder-white/50 !font-anaheim !font-bold !text-base"
                      dialCodeClassName="!text-brand-form-input-text !text-base"
                      chevronClassName="!text-brand-form-input-text"
                      containerClassName="mt-1"
                    />
                  </div>
                  {/* Company */}
                  <div>
                    <Label
                      htmlFor="company"
                      className={formLabelClasses}
                      style={{ fontSize: "clamp(10px, 1.04vw, 20px)" }}
                    >
                      {getFieldLabel("company", data.placeholderCompany)} {isFieldRequired("company") && <span className="text-red-400">*</span>}
                    </Label>
                    <Input
                      type="text"
                      id="company"
                      value={formData.company}
                      onChange={(e) => handleInputChange("company", e.target.value)}
                      placeholder={getFieldPlaceholder("company", data.placeholderCompany)}
                      className={formInputClasses}
                      required={isFieldRequired("company")}
                    />
                  </div>
                  {/* Message */}
                  <div>
                    <Label
                      htmlFor="message"
                      className={formLabelClasses}
                      style={{ fontSize: "clamp(10px, 1.04vw, 20px)" }}
                    >
                      {getFieldLabel("message", data.placeholderMessage)} {isFieldRequired("message") && <span className="text-red-400">*</span>}
                    </Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleInputChange("message", e.target.value)}
                      placeholder={getFieldPlaceholder("message", data.placeholderMessage)}
                      className={cn(formInputClasses, "min-h-[40px]")}
                      required={isFieldRequired("message")}
                    />
                  </div>

                  {/* Turnstile 验证码 */}
                  {shouldShowCaptcha && turnstileConfig?.siteKey && (
                    <div className="flex justify-center my-2">
                      <Turnstile
                        siteKey={turnstileConfig.siteKey}
                        onVerify={handleTurnstileVerify}
                        onError={handleTurnstileError}
                        onExpire={handleTurnstileExpire}
                        theme="dark"
                        size="normal"
                        language={locale === "zh" ? "zh-CN" : locale}
                      />
                    </div>
                  )}

                  {/* 错误提示 */}
                  {error && (
                    <div className="text-red-400 text-sm text-center">
                      {error}
                    </div>
                  )}

                  {/* 同意隐私勾选框 - 仅在本地没记号时展示 */}
                  {formConfig?.privacyConsentText && !isGloballyAccepted && (
                    <div className="flex items-start gap-2 mb-4 group cursor-pointer" onClick={() => handlePrivacyToggle(!privacyAccepted)}>
                      <div className={cn(
                        "mt-1 flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-all",
                        privacyAccepted ? "bg-brand-form-button-bg border-brand-form-button-bg" : "border-white/50 bg-transparent"
                      )}>
                        {privacyAccepted && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <p className="text-[10px] leading-tight text-white/70 text-left whitespace-pre-line select-none">
                        {formConfig.privacyConsentText}
                      </p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div style={{ marginTop: "clamp(10px, 1vw, 20px)" }}>
                    <Button
                      type="submit"
                      disabled={submitting || (shouldShowCaptcha && !turnstileToken) || (!!formConfig?.privacyConsentText && !privacyAccepted)}
                      className={cn(formButtonClasses, "disabled:opacity-50 disabled:cursor-not-allowed whitespace-pre-line")}
                      style={{
                        width: "clamp(165px, 17.2vw, 331px)",
                        minHeight: "clamp(34px, 3.5vw, 68px)",
                        padding: "8px 20px",
                        fontSize: "clamp(14px, 1.45vw, 24px)", 
                        lineHeight: "1.2",
                        height: "auto",
                      }}
                    >
                      {submitting ? (formConfig?.submittingText || "Submitting...") : (formConfig?.submitButtonText || data.buttonText || "Submit")}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* 右侧 - 图片 */}
          <div
            ref={rightImageRef}
            className={cn(
              "lg:w-[30%] w-[60%] will-change-transform",
              // lg 以下 (手机/平板) 淡入效果
              !isDesktop && "transition-opacity duration-700 ease-out delay-150",
              !isDesktop && (rightVisible ? "opacity-100" : "opacity-0")
            )}
            style={isDesktop ? { transform: 'translateY(-500px)' } : undefined}
          >
            {/* 3. 文字遮罩 (z-30) */}
            <div className="w-full p-4 lg:p-8 z-30 flex justify-center">
              <div className="relative inline-block">
                {/* 背景空心描边层 - 偏移 2px */}
                <div className="absolute left-[2px] top-[2px] w-full pointer-events-none">
                  <HollowText strokeColor="#f6f4ed" strokeWidth={1}>
                    <span className="text-base lg:text-xl font-anaheim font-bold block text-center leading-tight">{data.designTextRight}</span>
                  </HollowText>
                </div>
                {/* 原本的文字 */}
                <p className="text-white text-center text-base lg:text-xl text-stroke-black font-anaheim font-bold relative z-10">
                  {data.designTextRight}
                </p>
              </div>
            </div>
            <div className={imageCardContainerClass}>
              {/* 1. 底层手机框 (z-10) */}
              <Image src="/iPhoneFrame.svg" alt="iPhone Frame" fill className="object-cover z-10" />

              {/* 2. 顶层内容图片 (z-20) + SVG Mask */}
              <div
                className="absolute z-20"
                style={{
                  top: "1.4%",
                  bottom: "1.4%",
                  left: "3.6%",
                  right: "3.6%",
                  maskImage: "url('/iPhoneFrame-image.svg')",
                  maskSize: "100% 100%",
                  maskRepeat: "no-repeat",
                  WebkitMaskImage: "url('/iPhoneFrame-image.svg')",
                  WebkitMaskSize: "100% 100%",
                  WebkitMaskRepeat: "no-repeat",
                }}
              >
                <OptimizedImage image={data.image2} alt={data.image2?.altText || data.designTextRight} size="medium" className="object-cover w-full h-full absolute inset-0" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}