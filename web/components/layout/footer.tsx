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

  // Form config for multi-language messages
  const [formConfig, setFormConfig] = useState<{
    errorCaptchaMessage?: string;
    errorRequiredFields?: string;
    errorNetworkMessage?: string;
    successMessage?: string;
  } | null>(null);

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
        setSubmitStatus('success');
        setFormData({ name: '', email: '', message: '' });
        setTurnstileToken(null);
        setTurnstileKey(prev => prev + 1); // Reset Turnstile widget
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

  if (showForm) {
    // 首页版本：显示表单
    return (
      <footer
        className="
          relative bg-gray-900 text-white min-h-[100vh]
          flex flex-col justify-end
        "
        data-header-theme="transparent"
      >
        {/* 背景图片 - 使用 CSS 背景代替 fill Image 避免 CLS */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/BusromFooterBg.png)' }}
          aria-hidden="true"
        />

        {/* 卡片容器 (自定义底部距离) */}
        <div
          className="
            relative z-10 bg-brand-secondary
            p-6 sm:p-8 md:p-12 lg:p-16
            w-[92%] sm:w-[88%] md:w-[85%] lg:w-[80%]
            mx-auto mb-8 md:mb-16 mt-8
          "
          style={{
            borderRadius: 'calc(var(--rpx) * 84)', // Figma: 84px cornerRadius
          }}
        >
          {/* 使用 Flex 布局 + 垂直分隔线 */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">

            {/* 左侧：占 55% */}
            <div className="w-full lg:w-[55%]">
              {/* Logo */}
              <div className="mb-6 md:mb-8">
                <Image
                  src="/Busrom2.svg"
                  alt="Busrom Logo"
                  width={150}
                  height={40}
                  className="object-contain w-[120px] md:w-[150px]"
                />
              </div>

              {/* 联系信息 - Figma: 32px at 1920px, scaled down for better readability */}
              <ul
                className="space-y-1 md:space-y-2 mb-6 md:mb-8 font-anaheim font-medium text-brand-text-inverse text-sm md:text-base lg:text-lg"
              >
                <li>Email: {content.contact.email}</li>
                <li>After-sales: {content.contact.afterSales}</li>
                <li>WhatsApp: {content.contact.whatsapp}</li>
              </ul>

              {/* 官方声明 - Figma: title 28px, content 20px at 1920px */}
              <div className="w-full lg:w-[80%] bg-brand-footer-emphasis-bg text-brand-footer-emphasis-text font-anaheim font-semibold p-3 md:p-4 rounded-lg">
                <h4 className="font-bold mb-2 text-base md:text-lg lg:text-xl">
                  {content.notice.title}
                </h4>
                <div className="space-y-1 md:space-y-2 text-xs md:text-sm lg:text-base leading-relaxed">
                  {content.notice.lines.map((line, index) => (
                    <p key={index}>{line}</p>
                  ))}
                </div>
              </div>
            </div>

            {/* 白色的垂直分隔线 - 仅桌面端显示 */}
            <div className="hidden lg:block w-px bg-white/50 h-64"></div>

            {/* 水平分隔线 - 仅移动端显示 */}
            <div className="lg:hidden w-full h-px bg-white/30 my-6"></div>

            {/* 右侧：占 40% - 表单 */}
            <div className="w-full lg:w-2/5 lg:px-4">
              {/* Figma: 80px at 1920px, scaled down proportionally */}
              <h3 className="font-bold font-anaheim text-white text-3xl md:text-4xl lg:text-5xl mb-6 md:mb-8">
                {content.form.title}
              </h3>

              <form className="space-y-3 md:space-y-4" onSubmit={handleSubmit}>
                {/* Name - Figma: 32px at 1920px */}
                <div>
                  <Input
                    type="text"
                    id="footer-name"
                    placeholder={content.form.placeholders.name}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={cn(formInputClasses, "text-sm md:text-base lg:text-lg")}
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
                    className={cn(formInputClasses, "text-sm md:text-base lg:text-lg")}
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
                    className={cn(formInputClasses, "min-h-[40px] text-sm md:text-base lg:text-lg")}
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

                {/* Status messages */}
                {submitStatus === 'success' && (
                  <div className="text-green-400 text-sm">
                    {formConfig?.successMessage || (locale === 'zh' ? '提交成功！我们会尽快与您联系。' : 'Submitted successfully! We will contact you soon.')}
                  </div>
                )}
                {submitStatus === 'error' && errorMessage && (
                  <div className="text-red-400 text-sm">{errorMessage}</div>
                )}

                {/* Submit Button - Figma: 32px at 1920px */}
                <div className="mt-6 md:mt-8 lg:mt-16">
                  <Button
                    type="submit"
                    className={cn(formButtonClasses, "w-full sm:w-1/2 lg:w-1/3 text-sm md:text-base lg:text-lg")}
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? (locale === 'zh' ? '提交中...' : 'Submitting...')
                      : content.form.buttonText}
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
    );
  }

  // 其他页面版本：隐藏表单，显示四列布局
  return (
    <footer
      className="relative bg-brand-secondary text-brand-text-inverse py-12"
      data-header-theme="dark"
    >
      <div className="container mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* 第一列：Contact Information */}
          <div>
            <h4 className="font-bold text-lg mb-4 font-anaheim">{content.contact.title}</h4>
            <ul className="space-y-2 text-sm font-anaheim">
              <li>
                <span className="font-semibold">{content.contact.emailLabel}:</span>
                <br />
                <a href={`mailto:${content.contact.email}`} className="hover:text-brand-primary transition-colors">
                  {content.contact.email}
                </a>
              </li>
              <li>
                <span className="font-semibold">{content.contact.afterSalesLabel}:</span>
                <br />
                <a href={`mailto:${content.contact.afterSales}`} className="hover:text-brand-primary transition-colors">
                  {content.contact.afterSales}
                </a>
              </li>
              <li>
                <span className="font-semibold">{content.contact.whatsappLabel}:</span>
                <br />
                <a href={`https://wa.me/${content.contact.whatsapp.replace(/[^0-9]/g, '')}`} className="hover:text-brand-primary transition-colors">
                  {content.contact.whatsapp}
                </a>
              </li>
            </ul>
          </div>

          {/* 第二列：Official Notice */}
          <div>
            <h4 className="font-bold text-lg mb-4 font-anaheim">{content.notice.title}</h4>
            <div className="text-xs space-y-2 font-anaheim">
              {content.notice.lines.map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
          </div>

          {/* 第三列：导航链接 */}
          <div>
            <h4 className="font-bold text-lg mb-4 font-anaheim">Navigation</h4>
            <ul className="space-y-2 text-sm font-anaheim">
              {content.column3Menus?.map((menu) => (
                <li key={menu.slug}>
                  <Link
                    href={`/${locale}${menu.link}`}
                    className="hover:text-brand-primary transition-colors"
                  >
                    {menu.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 第四列：导航链接 */}
          <div>
            <h4 className="font-bold text-lg mb-4 font-anaheim">Quick Links</h4>
            <ul className="space-y-2 text-sm font-anaheim">
              {content.column4Menus?.map((menu) => (
                <li key={menu.slug}>
                  <Link
                    href={`/${locale}${menu.link}`}
                    className="hover:text-brand-primary transition-colors"
                  >
                    {menu.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 版权 */}
        <div className="text-center text-brand-text-inverse/60 text-sm mt-12 pt-8 border-t border-brand-text-inverse/20">
          © {new Date().getFullYear()} Busrom. All rights reserved.
        </div>
      </div>
    </footer>
  );
}