"use client";

import { useState, useEffect, useRef, useCallback, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { trackUetConversion } from "@/lib/analytics/uet";
import type { MainFormData } from "@/lib/content-data";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { Turnstile } from "@/components/ui/turnstile";
import { LexicalRenderer } from "@/components/lexical/LexicalRenderer";
import { HollowText } from "@/components/common/HollowText";
import Magnetic from "@/components/common/Magnetic";
import { COUNTRIES } from "@/components/ui/PhoneInput";
import { CountrySelectorList } from "@/components/ui/CountryCodePicker";
import { CountryFlag } from "@/components/ui/CountryFlag";
import { motion } from "framer-motion";

// lg 断点 (1024px) - 与 Tailwind 一致
const LG_BREAKPOINT = 1024;

// CMS 中首页主表单的 name（与 FormConfigs 集合一致）
const FORM_NAME = "home-page-main-inquiry-form";

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
  headerTheme?: string;
  className?: string;
};

// ------------------------------------------------------------------
// 表单样式常量 (基于 Figma 1920x1136 设计)
// ------------------------------------------------------------------
const formLabelClasses = "block font-anaheim font-bold text-white";

const formInputClasses = `
  mt-1 block w-full bg-transparent text-white
  placeholder:text-white/50 font-anaheim font-bold text-base
  !border-0 !border-b !border-white !rounded-none
  !outline-none !ring-0 !shadow-none
  focus:!outline-none focus:!ring-0 focus:!border-b focus:!border-white focus:!shadow-none
  focus-visible:!outline-none focus-visible:!ring-0 focus-visible:!ring-offset-0
  autofill:bg-transparent autofill:text-white
  caret-color: white !important;
  [&::selection]:bg-[#756f3f] [&::selection]:text-white
  [&:-webkit-autofill]:bg-transparent
  [&:-webkit-autofill]:[-webkit-text-fill-color:white!important]
  [&:-webkit-autofill]:[box-shadow:0_0_0_1000px_#BFB672_inset!important]
  [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s!important]
  [&:-webkit-autofill]:[caret-color:white!important]
  [&:-webkit-autofill:hover]:[-webkit-text-fill-color:white!important]
  [&:-webkit-autofill:hover]:[box-shadow:0_0_0_1000px_#BFB672_inset!important]
  [&:-webkit-autofill:hover]:[caret-color:white!important]
  [&:-webkit-autofill:focus]:[-webkit-text-fill-color:white!important]
  [&:-webkit-autofill:focus]:[box-shadow:0_0_0_1000px_#BFB672_inset!important]
  [&:-webkit-autofill:focus]:[caret-color:white!important]
  [&:-webkit-autofill:active]:[-webkit-text-fill-color:white!important]
  [&:-webkit-autofill:active]:[box-shadow:0_0_0_1000px_#BFB672_inset!important]
  [&:-webkit-autofill:active]:[caret-color:white!important]
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
  fieldType:
    | "text"
    | "email"
    | "phone"
    | "textarea"
    | "select"
    | "checkbox"
    | "radio"
    | "number"
    | "date"
    | "file";
  required?: boolean;
  width?: "full" | "half" | "third";
  order?: number;
  options?: { value: string; label: string }[];
}

// 表单配置类型
interface FormConfig {
  id?: number;
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

export default function MainForm({
  data,
  locale = "en",
  headerTheme,
  className,
}: Props) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const leftImageRef = useRef<HTMLDivElement>(null);
  const rightImageRef = useRef<HTMLDivElement>(null);
  const [leftVisible, setLeftVisible] = useState(false);
  const [rightVisible, setRightVisible] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false); // lg 及以上
  const [isVisible, setIsVisible] = useState(false); // 表单是否进入视口

  // 表单配置 - 优先使用 props 传过来的数据，没有再调接口
  // depth=1 时 formConfig 只是关系 ID 字符串（如 "1"），不是真正的配置对象，需要丢弃
  const [formConfig, setFormConfig] = useState<FormConfig | null>(() => {
    const raw = data.formConfig;
    // 只有包含 fields/name 的真对象才有效；字符串 ID 无效
    if (raw && typeof raw === 'object' && !Array.isArray(raw) && (raw.fields || raw.name)) {
      return raw;
    }
    return null;
  });

  // 获取字段 label - 优先使用 formConfig 中的配置
  const getFieldLabel = (fieldName: string, fallbackLabel: string): string => {
    if (formConfig?.fields && Array.isArray(formConfig.fields)) {
      // 兼容处理：某些配置可能把 whatsapp 叫成 phone，或者大小写不同
      const searchNames = [fieldName.toLowerCase()];
      if (fieldName.toLowerCase() === "whatsapp")
        searchNames.push("phone", "mobile");

      const field = formConfig.fields.find((f) =>
        searchNames.includes(f.fieldName?.toLowerCase()),
      );
      if (field?.label) {
        return field.label;
      }
    }
    return fallbackLabel;
  };

  // 获取字段 placeholder
  const getFieldPlaceholder = (
    fieldName: string,
    fallbackPlaceholder?: string,
  ): string | undefined => {
    if (formConfig?.fields && Array.isArray(formConfig.fields)) {
      const searchNames = [fieldName.toLowerCase()];
      if (fieldName.toLowerCase() === "whatsapp")
        searchNames.push("phone", "mobile", "tel");
      if (fieldName.toLowerCase() === "name")
        searchNames.push("fullname", "contact");

      // 1. 精确/兼容名匹配
      let field = formConfig.fields.find((f) =>
        searchNames.includes(f.fieldName?.toLowerCase()),
      );

      // 2. 如果没找到，尝试包含匹配 (例如 "your_email" 匹配 "email")
      if (!field) {
        field = formConfig.fields.find((f) => {
          const fName = f.fieldName?.toLowerCase() || "";
          return searchNames.some(
            (s) => fName.includes(s) || s.includes(fName),
          );
        });
      }

      if (field?.placeholder !== undefined && field?.placeholder !== null) {
        return field.placeholder;
      }
    }
    return fallbackPlaceholder;
  };

  // 检查字段是否必填
  const isFieldRequired = (
    fieldName: string,
    defaultRequired: boolean = false,
  ): boolean => {
    if (formConfig?.fields) {
      const field = formConfig.fields.find((f) => f.fieldName === fieldName);
      if (field !== undefined) {
        return field.required ?? defaultRequired;
      }
    }
    return defaultRequired;
  };
  // Turnstile 配置 (从 SiteConfig 获取)
  const [turnstileConfig, setTurnstileConfig] =
    useState<TurnstileConfig | null>(null);

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

  const STORAGE_KEY = "busrom_privacy_consent";
  const [isGloballyAccepted, setIsGloballyAccepted] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(
    COUNTRIES.find((c) => c[1] === "US") || COUNTRIES[0],
  );
  const [openCountrySelector, setOpenCountrySelector] = useState(false);
  const countrySelectorRef = useRef<HTMLDivElement>(null);

  // 挂载时检查全局同意状态
  useEffect(() => {
    const accepted = localStorage.getItem(STORAGE_KEY) === "true";
    if (accepted) {
      setPrivacyAccepted(true);
      setIsGloballyAccepted(true);
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (
        countrySelectorRef.current &&
        !countrySelectorRef.current.contains(event.target as Node)
      ) {
        setOpenCountrySelector(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handlePrivacyToggle = (val: boolean) => {
    setPrivacyAccepted(val);
    if (val) {
      localStorage.setItem(STORAGE_KEY, "true");
      setIsGloballyAccepted(true);
    } else {
      localStorage.removeItem(STORAGE_KEY);
      setIsGloballyAccepted(false);
    }
  };
  const [submissionCount, setSubmissionCount] = useState(0);

  // 是否需要显示验证码
  const shouldShowCaptcha = !!(
    turnstileConfig?.enabled &&
    turnstileConfig?.siteKey &&
    submissionCount >= turnstileConfig.threshold - 1
  );

  // 延迟加载配置 - 只在表单进入视口时才获取
  const [configLoaded, setConfigLoaded] = useState(false);

  // 获取表单配置和 Turnstile 配置 - 延迟到表单可见时
  useEffect(() => {
    if (!isVisible) return;
    // 如果已经有配置了，就没必要重复加载
    if (formConfig && configLoaded) return;

    const fetchConfigs = async () => {
      try {
        // 并行获取表单配置和 Turnstile 配置
        const [formRes, turnstileRes] = await Promise.all([
          fetch(`/api/form-config/${FORM_NAME}?locale=${locale}`),
          fetch("/api/site-config/turnstile"),
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

  const handlePhoneChange = (field: string, value: string) => {
    const digits = value.replace(/\D/g, "");
    setFormData((prev) => ({
      ...prev,
      [field]: digits ? `+${selectedCountry[2]}${digits}` : "",
    }));
  };

  // 表单提交
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    console.log('[MainForm submit] formConfig:', JSON.stringify(formConfig));
    console.log('[MainForm submit] formId:', formConfig?.id, 'formName:', formConfig?.name);

    // 验证必填字段
    if (!formData.name || !formData.email) {
      setError(
        formConfig?.errorRequiredFields || "Please fill in name and email",
      );
      setSubmitting(false);
      return;
    }

    // 检查验证码
    if (shouldShowCaptcha && !turnstileToken) {
      setError(
        formConfig?.errorCaptchaMessage ||
          "Please complete the captcha verification",
      );
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/form-submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formId: formConfig?.id,
          formName: formConfig?.name || FORM_NAME,
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

        // Push success event to Google Tag Manager
        if (typeof window !== "undefined" && (window as any).dataLayer) {
          (window as any).dataLayer.push({
            event: "form_submit_success",
            form_id: formConfig?.name || FORM_NAME,
            form_name: formConfig?.name || FORM_NAME,
          });
        }
        trackUetConversion("Submit", "Request_Quote", 5, "Lead");

        // 5秒后重置表单
        setTimeout(() => {
          setSubmitted(false);
          setFormData({
            name: "",
            email: "",
            whatsapp: "",
            company: "",
            message: "",
          });
          setTurnstileToken(null);
        }, 5000);
      } else {
        const errorData = await res.json();
        setError(
          errorData.error ||
            formConfig?.errorNetworkMessage ||
            "Submission failed",
        );
        setTurnstileToken(null);
      }
    } catch (err) {
      setError(
        formConfig?.errorNetworkMessage || "Network error, please try again",
      );
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
      { rootMargin: "200px" }, // 提前 200px 开始加载
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

  // 滚动视差动画逻辑（极致优化版）
  useEffect(() => {
    if (!isDesktop || !isVisible) return; // 只有在桌面端且进入视口时才监听

    let ticking = false;
    const updateTransforms = () => {
      if (!sectionRef.current) return;

      const element = sectionRef.current;
      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // 如果板块已经完全离开视口（上方或下方），停止计算
      if (rect.bottom < 0 || rect.top > windowHeight) return;

      // progress: 0 = 板块刚进入视口底部, 1 = 板块顶部到达视口顶部
      const progress = Math.max(
        0,
        Math.min(1, (windowHeight - rect.top) / (windowHeight + rect.height)),
      );
      const maxOffset = 500;

      // 使用 transform3d 触发 GPU 加速
      if (leftImageRef.current) {
        const offsetLeft = (1 - progress * 2) * maxOffset;
        leftImageRef.current.style.transform = `translate3d(0, ${offsetLeft}px, 0)`;
      }

      if (rightImageRef.current) {
        const offsetRight = (1 - progress * 2) * maxOffset;
        rightImageRef.current.style.transform = `translate3d(0, ${-offsetRight}px, 0)`;
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

    window.addEventListener("scroll", handleScroll, { passive: true });
    updateTransforms(); // 初始执行

    return () => window.removeEventListener("scroll", handleScroll);
  }, [isDesktop, isVisible]); // 增加 isVisible 依赖

  // ------------------------------------------------------------------
  // JSX 渲染
  // ------------------------------------------------------------------
  return (
    <section
      ref={sectionRef}
      className={cn(
        "py-32 md:py-40 bg-brand-secondary text-brand-text-inverse overflow-hidden",
        className,
      )}
      data-header-theme={headerTheme}
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
              !isDesktop && (leftVisible ? "opacity-100" : "opacity-0"),
            )}
            style={isDesktop ? { transform: "translateY(500px)" } : undefined}
          >
            <div className={imageCardContainerClass}>
              {/* 1. 底层手机框 (z-10) */}
              <Image
                src="/iPhoneFrame.svg"
                alt="iPhone Frame"
                fill
                className="object-cover z-10"
              />

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
                <OptimizedImage
                  image={data.image1}
                  alt={data.image1?.altText || data.designTextLeft}
                  size="medium"
                  className="object-cover w-full h-full absolute inset-0"
                />
              </div>
            </div>
            {/* 3. 文字遮罩 (z-30) */}
            <div className="w-full p-4 lg:p-8 z-30 flex justify-center">
              <div className="relative inline-block">
                {/* 背景空心描边层 - 偏移 2px (移动端 1px) */}
                <div className="absolute left-[1px] top-[1px] lg:left-[2px] lg:top-[2px] w-full pointer-events-none">
                  <HollowText strokeColor="#f6f4ed" strokeWidth={1}>
                    <span className="text-base lg:text-xl font-anaheim font-bold block text-center leading-tight">
                      {data.designTextLeft}
                    </span>
                  </HollowText>
                </div>
                {/* 原本的文字 */}
                <p className="text-white text-center text-base lg:text-xl text-stroke-black font-anaheim font-bold relative z-10 leading-tight">
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
                    {formConfig?.successMessage ||
                      "Your message has been sent successfully!"}
                  </p>
                </div>
              ) : (
                <form
                  id={formConfig?.name || FORM_NAME}
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
                      {getFieldLabel("name", data.placeholderName)}{" "}
                      {isFieldRequired("name", true) && (
                        <span className="text-red-400">*</span>
                      )}
                    </Label>
                    <Input
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      placeholder={getFieldPlaceholder(
                        "name",
                        data.placeholderName,
                      )}
                      className={formInputClasses}
                      required={isFieldRequired("name", true)}
                      spellCheck="false"
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                    />
                  </div>
                  {/* Email */}
                  <div>
                    <Label
                      htmlFor="email"
                      className={formLabelClasses}
                      style={{ fontSize: "clamp(10px, 1.04vw, 20px)" }}
                    >
                      {getFieldLabel("email", data.placeholderEmail)}{" "}
                      {isFieldRequired("email", true) && (
                        <span className="text-red-400">*</span>
                      )}
                    </Label>
                    <Input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      placeholder={getFieldPlaceholder(
                        "email",
                        data.placeholderEmail,
                      )}
                      className={formInputClasses}
                      required={isFieldRequired("email", true)}
                      spellCheck="false"
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                    />
                  </div>
                  {/* WhatsApp */}
                  <div>
                    <Label
                      htmlFor="whatsapp"
                      className={formLabelClasses}
                      style={{ fontSize: "clamp(10px, 1.04vw, 20px)" }}
                    >
                      {getFieldLabel("whatsapp", data.placeholderWhatsapp)}{" "}
                      {isFieldRequired("whatsapp") && (
                        <span className="text-red-400">*</span>
                      )}
                    </Label>
                    <div
                      className={cn(
                        "flex items-stretch bg-transparent border-b border-white relative transition-all mt-1 h-[45px]",
                        openCountrySelector ? "z-20" : "z-0"
                      )}
                      ref={countrySelectorRef}
                    >
                      <button
                        type="button"
                        onClick={() => setOpenCountrySelector(!openCountrySelector)}
                        disabled={submitting}
                        className="flex items-center gap-2 pr-2 hover:bg-white/5 transition-colors border-r border-white/20 flex-shrink-0"
                      >
                        <div className="w-5 h-3 md:w-6 md:h-4 flex-shrink-0">
                          <CountryFlag
                            countryCode={selectedCountry[1]}
                            className="w-full h-full rounded-[1px] object-cover"
                          />
                        </div>
                        <span className="text-white font-anaheim font-bold text-base">
                          +{selectedCountry[2]}
                        </span>
                      </button>

                      <input
                        type="tel"
                        id="whatsapp"
                        value={
                          formData.whatsapp?.replace(
                            `+${selectedCountry[2]}`,
                            "",
                          ) || ""
                        }
                        onChange={(e) =>
                          handlePhoneChange("whatsapp", e.target.value)
                        }
                        placeholder={getFieldPlaceholder(
                          "whatsapp",
                          data.placeholderWhatsapp,
                        )}
                        disabled={submitting}
                        className="flex-1 bg-transparent px-3 outline-none font-anaheim font-bold text-base text-white placeholder:text-white/50 caret-white [&::selection]:bg-[#756f3f] [&::selection]:text-white [&:-webkit-autofill]:[caret-color:white!important] [&:-webkit-autofill]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill]:[box-shadow:0_0_0px_1000px_#BFB672_inset!important] [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s!important]"
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck="false"
                      />

                      {openCountrySelector && (
                        <div className="absolute left-0 top-full mt-2 z-[100]">
                          <CountrySelectorList
                            onSelect={(country) => {
                              setSelectedCountry(country);
                              setOpenCountrySelector(false);
                            }}
                            onClose={() => setOpenCountrySelector(false)}
                            className="shadow-2xl"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Company */}
                  <div>
                    <Label
                      htmlFor="company"
                      className={formLabelClasses}
                      style={{ fontSize: "clamp(10px, 1.04vw, 20px)" }}
                    >
                      {getFieldLabel("company", data.placeholderCompany)}{" "}
                      {isFieldRequired("company") && (
                        <span className="text-red-400">*</span>
                      )}
                    </Label>
                    <Input
                      type="text"
                      id="company"
                      value={formData.company}
                      onChange={(e) =>
                        handleInputChange("company", e.target.value)
                      }
                      placeholder={getFieldPlaceholder(
                        "company",
                        data.placeholderCompany,
                      )}
                      className={formInputClasses}
                      required={isFieldRequired("company")}
                      spellCheck="false"
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                    />
                  </div>
                  {/* Message */}
                  <div>
                    <Label
                      htmlFor="message"
                      className={formLabelClasses}
                      style={{ fontSize: "clamp(10px, 1.04vw, 20px)" }}
                    >
                      {getFieldLabel("message", data.placeholderMessage)}{" "}
                      {isFieldRequired("message") && (
                        <span className="text-red-400">*</span>
                      )}
                    </Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) =>
                        handleInputChange("message", e.target.value)
                      }
                      placeholder={getFieldPlaceholder(
                        "message",
                        data.placeholderMessage,
                      )}
                      className={cn(formInputClasses, "min-h-[40px] resize-none overflow-y-auto")}
                      required={isFieldRequired("message")}
                      spellCheck="false"
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
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

                  {/* 同意隐私勾选框 - 只要配置了文案就常显 */}
                  {formConfig?.privacyConsentText && (
                    <div
                      className="flex items-start gap-2 group cursor-pointer"
                      onClick={() => handlePrivacyToggle(!privacyAccepted)}
                    >
                      <div
                        className={cn(
                          "mt-1 flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-all",
                          privacyAccepted
                            ? "bg-brand-form-button-bg border-brand-form-button-bg"
                            : "border-white/50 bg-transparent",
                        )}
                      >
                        {privacyAccepted && (
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
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
                      <p 
                        className={cn(
                          "text-[12px] md:text-[14px] leading-tight text-left whitespace-pre-line select-none transition-opacity duration-300",
                          privacyAccepted ? "text-white opacity-100" : "text-white opacity-70"
                        )}
                      >
                        {formConfig.privacyConsentText}
                      </p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div style={{ marginTop: "clamp(10px, 1vw, 20px)" }}>
                    <Magnetic strength={0.15}>
                      <motion.div
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
                      >
                        <Button
                          type="submit"
                          disabled={
                            submitting ||
                            (shouldShowCaptcha && !turnstileToken) ||
                            (!!formConfig?.privacyConsentText &&
                              !privacyAccepted)
                          }
                          className={cn(
                            formButtonClasses,
                            "disabled:opacity-50 disabled:cursor-not-allowed whitespace-pre-line",
                          )}
                          style={{
                            width: "clamp(165px, 17.2vw, 331px)",
                            minHeight: "clamp(34px, 3.5vw, 68px)",
                            padding: "8px 20px",
                            fontSize: "clamp(14px, 1.45vw, 24px)",
                            lineHeight: "1.2",
                            height: "auto",
                          }}
                        >
                          {submitting
                            ? formConfig?.submittingText || "Submitting..."
                            : formConfig?.submitButtonText ||
                              data.buttonText ||
                              "Submit"}
                        </Button>
                      </motion.div>
                    </Magnetic>
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
              !isDesktop &&
                "transition-opacity duration-700 ease-out delay-150",
              !isDesktop && (rightVisible ? "opacity-100" : "opacity-0"),
            )}
            style={isDesktop ? { transform: "translateY(-500px)" } : undefined}
          >
            {/* 3. 文字遮罩 (z-30) */}
            <div className="w-full p-4 lg:p-8 z-30 flex justify-center">
              <div className="relative inline-block">
                {/* 背景空心描边层 - 偏移 2px (移动端 1px) */}
                <div className="absolute left-[1px] top-[1px] lg:left-[2px] lg:top-[2px] w-full pointer-events-none">
                  <HollowText strokeColor="#f6f4ed" strokeWidth={1}>
                    <span className="text-base lg:text-xl font-anaheim font-bold block text-center leading-tight">
                      {data.designTextRight}
                    </span>
                  </HollowText>
                </div>
                {/* 原本的文字 */}
                <p className="text-white text-center text-base lg:text-xl text-stroke-black font-anaheim font-bold relative z-10 leading-tight">
                  {data.designTextRight}
                </p>
              </div>
            </div>
            <div className={imageCardContainerClass}>
              {/* 1. 底层手机框 (z-10) */}
              <Image
                src="/iPhoneFrame.svg"
                alt="iPhone Frame"
                fill
                className="object-cover z-10"
              />

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
                <OptimizedImage
                  image={data.image2}
                  alt={data.image2?.altText || data.designTextRight}
                  size="medium"
                  className="object-cover w-full h-full absolute inset-0"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
