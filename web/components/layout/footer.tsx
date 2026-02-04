"use client";

import { useMemo, useState, useEffect } from "react";
import type { Locale } from "@/i18n.config";
import { getHomeContent } from "@/lib/content-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import Link from "next/link";

// 【已添加】导入 Label, Textarea, 和 cn
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Turnstile } from "@/components/ui/turnstile";

// Footer 数据类型
interface FooterApiData {
  contact: {
    title: string;
    emailLabel: string;
    email: string;
    afterSalesLabel: string;
    afterSales: string;
    whatsappLabel: string;
    whatsapp: string;
  };
  notice: {
    title: string;
    lines: string[];
  };
  navigationMenus: Array<{
    slug: string;
    name: string;
    link: string;
  }>;
  socialLinks: Array<{
    platform: string;
    url: string;
  }>;
  copyrightText?: string;
}

// 成功弹窗组件 - 使用品牌设计风格
function SuccessModal({
  isOpen,
  onClose,
  message
}: {
  isOpen: boolean;
  onClose: () => void;
  message: string;
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-brand-main rounded-[30px] py-8 px-12 min-w-[400px] max-w-[90vw] mx-4 shadow-2xl border border-brand-accent-border flex items-center gap-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 成功图标 - 使用品牌金色 */}
        <div className="w-16 h-16 flex-shrink-0 bg-brand-secondary/10 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-brand-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* 消息内容 */}
        <p className="text-brand-text-main font-anaheim text-lg font-medium leading-relaxed flex-1">
          {message}
        </p>

        {/* 关闭按钮 - 使用品牌色 */}
        <Button
          onClick={onClose}
          className="bg-brand-secondary hover:bg-brand-secondary/90 text-brand-text-inverse font-anaheim font-semibold px-8 py-2 rounded-full text-base flex-shrink-0"
        >
          OK
        </Button>
      </div>
    </div>
  );
}

type Props = {
  locale: Locale;
  showForm?: boolean; // true表示首页（显示表单），false表示其他页面（显示四列布局）
};

// Note: fontSize is applied via inline style below to use rpx()
const formInputClasses = `
  mt-1 block w-full bg-transparent text-brand-form-input-text font-anaheim font-semibold
  placeholder:text-brand-text-inverse
  border-0 rounded-none border-b border-[#56511C]
  focus:outline-none focus:ring-0 focus:border-primary
  focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0
`;

const formButtonClasses = `
  w-1/3 rounded-full bg-brand-footer-button-bg
  text-brand-footer-button-text font-anaheim font-semibold
  hover:bg-brand-footer-button-bg/90 pt-2 pb-2 mt-8
`;

// Responsive px based on 1920px design width
const rpx = (designValue: number) => `calc(var(--rpx) * ${designValue})`;
// ---

export default function Footer({ locale, showForm = true }: Props) {
  const content = useMemo(() => getHomeContent(locale).footer, [locale]);

  // Form state
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileSiteKey, setTurnstileSiteKey] = useState<string | null>(null);
  const [turnstileKey, setTurnstileKey] = useState(0); // For resetting Turnstile
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Form config for multi-language messages
  const [formConfig, setFormConfig] = useState<{
    errorCaptchaMessage?: string;
    errorRequiredFields?: string;
    errorNetworkMessage?: string;
    successMessage?: string;
    submitButtonText?: string;
    submittingText?: string;
  } | null>(null);

  // Footer API data (for non-home pages)
  const [footerData, setFooterData] = useState<FooterApiData | null>(null);

  // Fetch footer data from API (for non-home pages)
  useEffect(() => {
    if (!showForm) {
      const fetchFooterData = async () => {
        try {
          const response = await fetch(`/api/footer?locale=${locale}`);
          if (response.ok) {
            const data = await response.json();
            setFooterData(data);
          }
        } catch (error) {
          console.error('Failed to fetch footer data:', error);
        }
      };
      fetchFooterData();
    }
  }, [locale, showForm]);

  // Fetch Turnstile site key from SiteConfig and form config
  useEffect(() => {
    const fetchConfigs = async () => {
      try {
        const [siteRes, formRes] = await Promise.all([
          fetch('/api/site-config'),
          fetch(`/api/form-config/footer-form?locale=${locale}`)
        ]);

        if (siteRes.ok) {
          const data = await siteRes.json();
          if (data.turnstileSiteKey) {
            setTurnstileSiteKey(data.turnstileSiteKey);
          }
        }

        if (formRes.ok) {
          const data = await formRes.json();
          setFormConfig(data);
        }
      } catch (error) {
        console.error('Failed to fetch configs:', error);
      }
    };
    fetchConfigs();
  }, [locale]);

  // Handle Turnstile success - clear error if captcha error was showing
  const handleTurnstileSuccess = (token: string) => {
    setTurnstileToken(token);
    // Clear captcha-related error
    if (submitStatus === 'error') {
      setSubmitStatus('idle');
      setErrorMessage('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Default messages (fallback if formConfig not loaded)
    const defaultMessages = {
      errorRequiredFields: locale === 'zh' ? '请填写所有字段' : 'Please fill in all fields',
      errorCaptchaMessage: locale === 'zh' ? '请完成人机验证' : 'Please complete the captcha verification',
      errorNetworkMessage: locale === 'zh' ? '网络错误，请重试' : 'Network error, please try again',
      successMessage: locale === 'zh' ? '提交成功！我们会尽快与您联系。' : 'Submitted successfully! We will contact you soon.',
    };

    // Validate
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setSubmitStatus('error');
      setErrorMessage(formConfig?.errorRequiredFields || defaultMessages.errorRequiredFields);
      return;
    }

    // Validate Turnstile if enabled
    if (turnstileSiteKey && !turnstileToken) {
      setSubmitStatus('error');
      setErrorMessage(formConfig?.errorCaptchaMessage || defaultMessages.errorCaptchaMessage);
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const response = await fetch('/api/form-submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formName: 'footer-form',
          data: formData,
          locale,
          turnstileToken,
        }),
      });

      if (response.ok) {
        setSubmitStatus('idle'); // Reset to idle, we'll show modal instead
        setFormData({ name: '', email: '', message: '' });
        setTurnstileToken(null);
        setTurnstileKey(prev => prev + 1); // Reset Turnstile widget
        setShowSuccessModal(true); // Show success modal
      } else {
        const data = await response.json();
        setSubmitStatus('error');
        setErrorMessage(data.error || (locale === 'zh' ? '提交失败，请重试' : 'Submission failed, please try again'));
        setTurnstileToken(null);
        setTurnstileKey(prev => prev + 1); // Reset Turnstile widget on error
      }
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage(formConfig?.errorNetworkMessage || defaultMessages.errorNetworkMessage);
      setTurnstileToken(null);
      setTurnstileKey(prev => prev + 1);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 成功消息（从后端配置或默认）
  const successMessage = formConfig?.successMessage || (locale === 'zh' ? '提交成功！我们会尽快与您联系。' : 'Submitted successfully! We will contact you soon.');

  if (showForm) {
    // 首页版本：显示表单
    return (
      <>
        {/* 成功弹窗 */}
        <SuccessModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          message={successMessage}
        />

        <footer
          className="
            relative bg-gray-900 text-white
            flex flex-col justify-end
          "
          style={{ minHeight: 'calc(var(--rpx) * 1000)' }} // Reduced from Figma: 1581px
          data-header-theme="transparent"
        >
        {/* 背景图片 - 使用 CSS 背景代替 fill Image 避免 CLS */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/BusromFooterBg.webp)' }}
          aria-hidden="true"
        />

        {/* 卡片容器 - lg以上固定宽度居中，不随屏幕放大 */}
        <div
          className="
            relative z-10 bg-brand-secondary
            w-[92%] sm:w-[88%] md:w-[90%] lg:w-[820px] xl:w-[1000px] 2xl:w-[1200px]
            mx-auto
            mt-[280px] sm:mt-[320px] md:mt-[380px] lg:mt-[200px] xl:mt-[100px] 2xl:mt-0
            mb-8 md:mb-12 lg:mb-20
            p-6 sm:p-8 md:p-10 lg:py-16 lg:px-16 xl:py-20 xl:px-20
            rounded-[40px] sm:rounded-[50px] md:rounded-[60px] lg:rounded-[60px]
          "
        >
          {/* 使用 Flex 布局 + 垂直分隔线 */}
          <div className="flex flex-col lg:flex-row lg:items-stretch lg:justify-between lg:gap-8 xl:gap-12">

            {/* 左侧 */}
            <div className="w-full lg:w-[55%]">
              {/* Logo */}
              <div className="mb-4 lg:mb-6">
                <Image
                  src="/Busrom2.svg"
                  alt="Busrom Logo"
                  width={345}
                  height={90}
                  className="object-contain w-[140px] lg:w-[160px] xl:w-[180px] h-auto"
                />
              </div>

              {/* 联系信息 */}
              <ul className="font-anaheim font-medium text-brand-text-inverse text-sm md:text-base lg:text-lg space-y-0.5 md:space-y-1 leading-relaxed mb-4 md:mb-6">
                <li>Email: {content.contact.email}</li>
                <li>After-sales: {content.contact.afterSales}</li>
                <li>WhatsApp: {content.contact.whatsapp}</li>
              </ul>

              {/* 官方声明 */}
              <div className="bg-brand-footer-emphasis-bg text-brand-footer-emphasis-text font-anaheim font-semibold p-3 md:p-4 pl-6 md:pl-8">
                <h4 className="font-bold text-base md:text-lg lg:text-xl leading-normal mb-2 lg:mb-3">
                  {content.notice.title}
                </h4>
                <ul className="text-xs md:text-sm lg:text-base leading-loose space-y-0">
                  {content.notice.lines.map((line, index) => (
                    <li key={index} className="flex items-start">
                      <span className="rounded-full bg-current flex-shrink-0 w-1 h-1 md:w-1.5 md:h-1.5 mt-1.5 md:mt-2 -ml-3 md:-ml-4 mr-2 md:mr-2.5"></span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 垂直分隔线 */}
            <div className="hidden lg:block w-px self-stretch bg-[#E3DEBB]"></div>

            {/* 水平分隔线 - 仅移动端显示 */}
            <div className="lg:hidden w-full h-px bg-white/30 my-6"></div>

            {/* 右侧：表单 */}
            <div className="w-full lg:w-[40%]">
              {/* 标题 - 双层文字叠加效果 */}
              <h3 className="relative font-bold font-anaheim text-4xl md:text-5xl lg:text-5xl xl:text-6xl mb-8 lg:mb-12">
                {/* 底层：白色描边，向右下偏移2px */}
                <span
                  className="absolute text-transparent"
                  style={{
                    WebkitTextStroke: '1px white',
                    top: '2px',
                    left: '2px',
                  }}
                >
                  {content.form.title}
                </span>
                {/* 顶层：白色填充 */}
                <span className="relative text-white">
                  {content.form.title}
                </span>
              </h3>

              <form className="flex flex-col gap-6 lg:gap-8" onSubmit={handleSubmit}>
                {/* Name */}
                <div>
                  <Input
                    type="text"
                    id="footer-name"
                    placeholder={content.form.placeholders.name}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={cn(formInputClasses, "text-base md:text-lg lg:text-xl xl:text-2xl")}
                    disabled={isSubmitting}
                  />
                </div>

                {/* Email */}
                <div>
                  <Input
                    type="email"
                    id="footer-email"
                    placeholder={content.form.placeholders.email}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={cn(formInputClasses, "text-base md:text-lg lg:text-xl xl:text-2xl")}
                    disabled={isSubmitting}
                  />
                </div>

                {/* Message */}
                <div>
                  <Textarea
                    id="footer-message"
                    placeholder={content.form.placeholders.message}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className={cn(formInputClasses, "min-h-[60px] text-base md:text-lg lg:text-xl xl:text-2xl")}
                    disabled={isSubmitting}
                  />
                </div>

                {/* Turnstile Captcha */}
                {turnstileSiteKey && (
                  <div className="mt-4">
                    <Turnstile
                      key={turnstileKey}
                      siteKey={turnstileSiteKey}
                      onVerify={handleTurnstileSuccess}
                      onError={() => setTurnstileToken(null)}
                      onExpire={() => setTurnstileToken(null)}
                      theme="dark"
                      language={locale === 'zh' ? 'zh-CN' : locale}
                    />
                  </div>
                )}

                {/* Error message */}
                {submitStatus === 'error' && errorMessage && (
                  <div className="text-red-400 text-sm">{errorMessage}</div>
                )}

                {/* Submit Button */}
                <div className="mt-6 lg:mt-8">
                  <Button
                    type="submit"
                    className={cn(
                      formButtonClasses,
                      "text-base md:text-lg lg:text-xl xl:text-2xl font-semibold",
                      "px-20 md:px-28 lg:px-36",
                      "h-12 md:h-14 lg:h-16",
                      "rounded-full"
                    )}
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? (formConfig?.submittingText || (locale === 'zh' ? '提交中...' : 'Submitting...'))
                      : (formConfig?.submitButtonText || content.form.buttonText)}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* 版权 */}
        <div className="relative text-center text-white/80 text-sm mb-8 pt-8">
          © {new Date().getFullYear()} Busrom. All rights reserved.
        </div>
      </footer>
      </>
    );
  }

  // 其他页面版本：只使用 API 数据，不 fallback 到 mock
  if (!footerData) {
    // 数据还在加载中，显示最小化的 footer
    return (
      <footer
        className="relative bg-brand-secondary text-brand-text-inverse py-12"
        data-header-theme="dark"
      >
        <div className="container mx-auto px-8">
          <div className="flex justify-center">
            <Image
              src="/Busrom1.svg"
              alt="Busrom Logo"
              width={80}
              height={24}
              className="object-contain"
            />
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer
      className="relative bg-brand-secondary text-brand-text-inverse py-12"
      data-header-theme="dark"
    >
      <div className="container mx-auto px-8">
        {/* 第一行：Contact Information | Official Notice */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* 左侧：Contact Information */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/Busrom2.svg"
                alt="Busrom"
                width={120}
                height={32}
                className="object-contain"
              />
            </div>
            <ul className="space-y-2 text-sm font-anaheim">
              {footerData.contact.email && (
                <li>
                  {footerData.contact.emailLabel && <span className="font-semibold">{footerData.contact.emailLabel}</span>}
                  <a href={`mailto:${footerData.contact.email}`} className="hover:text-brand-primary transition-colors">
                    {footerData.contact.email}
                  </a>
                </li>
              )}
              {footerData.contact.afterSales && (
                <li>
                  {footerData.contact.afterSalesLabel && <span className="font-semibold">{footerData.contact.afterSalesLabel}</span>}
                  <a href={`mailto:${footerData.contact.afterSales}`} className="hover:text-brand-primary transition-colors">
                    {footerData.contact.afterSales}
                  </a>
                </li>
              )}
              {footerData.contact.whatsapp && (
                <li>
                  {footerData.contact.whatsappLabel && <span className="font-semibold">{footerData.contact.whatsappLabel}</span>}
                  <a href={`https://wa.me/${footerData.contact.whatsapp.replace(/[^0-9]/g, '')}`} className="hover:text-brand-primary transition-colors">
                    {footerData.contact.whatsapp}
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* 右侧：Official Notice */}
          <div className="pl-4">
            {footerData.notice.title && <h4 className="font-bold text-lg mb-4 font-anaheim">{footerData.notice.title}</h4>}
            {footerData.notice.lines && footerData.notice.lines.length > 0 && (
              <ul className="text-sm leading-loose space-y-0 font-anaheim">
                {footerData.notice.lines.map((line, index) => (
                  <li key={index} className="flex items-start">
                    <span className="rounded-full bg-current flex-shrink-0 w-1.5 h-1.5 mt-2 -ml-4 mr-2.5"></span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* 分隔线 */}
        <div className="h-px bg-brand-text-inverse/30 my-6"></div>

        {/* 第二行：Navigation（横向排列，居左对齐） */}
        {footerData.navigationMenus && footerData.navigationMenus.length > 0 && (
          <div className="pb-6">
            <nav className="flex flex-wrap gap-6 md:gap-10">
              {footerData.navigationMenus.map((menu) => (
                <Link
                  key={menu.slug}
                  href={`/${locale}${menu.link}`}
                  className="text-sm font-anaheim font-semibold hover:text-brand-primary transition-colors"
                >
                  {menu.name}
                </Link>
              ))}
            </nav>
          </div>
        )}

        {/* 第三行：Logo+版权（居中） | 社交媒体链接 */}
        <div className="pt-16 flex flex-col md:flex-row justify-between items-center gap-4">
          {/* 左侧占位 - 保持社交链接右对齐 */}
          <div className="hidden md:block md:flex-1"></div>

          {/* 中间：Logo + 版权（上下结构，居中） */}
          <div className="flex flex-col items-center gap-[20px]">
            <Image
              src="/Busrom1.svg"
              alt="Busrom Logo"
              width={60}
              height={18}
              className="object-contain"
            />
            {footerData.copyrightText && (
              <span className="text-brand-text-inverse/60 text-sm font-anaheim">
                {footerData.copyrightText}
              </span>
            )}
          </div>

          {/* 右侧：社交媒体链接 */}
          <div className="md:flex-1 flex justify-end">
            {footerData.socialLinks && footerData.socialLinks.length > 0 && (
              <div className="flex items-center gap-4">
                {footerData.socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-text-inverse/70 hover:text-brand-primary transition-colors"
                    title={social.platform}
                  >
                    <SocialIcon platform={social.platform} />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}

// 社交媒体图标组件
function SocialIcon({ platform }: { platform: string }) {
  const iconClass = "w-5 h-5";

  switch (platform) {
    case 'facebook':
      return (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      );
    case 'instagram':
      return (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      );
    case 'twitter':
      return (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      );
    case 'linkedin':
      return (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      );
    case 'youtube':
      return (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      );
    case 'tiktok':
      return (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
        </svg>
      );
    case 'wechat':
      return (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
          <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.007-.27-.018-.406-.032zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z"/>
        </svg>
      );
    case 'whatsapp':
      return (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      );
    default:
      return (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
        </svg>
      );
  }
}