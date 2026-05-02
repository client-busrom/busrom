import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Turnstile } from "@/components/ui/turnstile";
import { cn } from "@/lib/utils";
import { FormConfig } from "./types";

interface Props {
  locale: string;
  formConfig: FormConfig | null;
  content: any;
  turnstileSiteKey: string | null;
  onSuccess: (message: string) => void;
}

const formInputClasses = `
  mt-1 block w-full bg-transparent text-white font-anaheim font-semibold
  placeholder:text-brand-text-inverse
  border-0 rounded-none border-b border-[#56511C]
  focus:outline-none focus:ring-0 focus:border-primary
  focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0
`;

const formButtonClasses = `
  w-1/3 rounded-full bg-brand-footer-button-bg
  text-brand-footer-button-text font-anaheim font-semibold
  hover:bg-brand-footer-button-bg/90
  transition-all duration-300
  hover:scale-110 active:scale-95
`;

export default function FooterForm({
  locale,
  formConfig,
  content,
  turnstileSiteKey,
  onSuccess,
}: Props) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileKey, setTurnstileKey] = useState(0);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const STORAGE_KEY = "busrom_privacy_consent";
  const [isGloballyAccepted, setIsGloballyAccepted] = useState(false);

  // 挂载时检查全局同意状态
  useEffect(() => {
    const accepted = localStorage.getItem(STORAGE_KEY) === "true";
    if (accepted) {
      setPrivacyAccepted(true);
      setIsGloballyAccepted(true);
    }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const defaultMessages = {
      errorRequiredFields:
        locale === "zh" ? "请填写所有字段" : "Please fill in all fields",
      errorCaptchaMessage:
        locale === "zh"
          ? "请完成人机验证"
          : "Please complete the captcha verification",
      errorNetworkMessage:
        locale === "zh"
          ? "网络错误，请重试"
          : "Network error, please try again",
    };

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.message.trim()
    ) {
      setSubmitStatus("error");
      setErrorMessage(
        formConfig?.errorRequiredFields || defaultMessages.errorRequiredFields,
      );
      return;
    }

    if (formConfig?.privacyConsentText && !privacyAccepted) {
      setSubmitStatus("error");
      setErrorMessage(
        locale === "zh"
          ? "请查看并同意隐私条款"
          : "Please agree to the privacy policy",
      );
      return;
    }

    if (turnstileSiteKey && !turnstileToken) {
      setSubmitStatus("error");
      setErrorMessage(
        formConfig?.errorCaptchaMessage || defaultMessages.errorCaptchaMessage,
      );
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus("idle");
    setErrorMessage("");

    try {
      const response = await fetch("/api/form-submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formName: formConfig?.name || "footer-form",
          data: formData,
          locale,
          privacyAccepted,
          turnstileToken,
        }),
      });

      if (response.ok) {
        setFormData({ name: "", email: "", message: "" });
        setTurnstileToken(null);
        setTurnstileKey((prev) => prev + 1);
        const successMsg =
          formConfig?.successMessage ||
          (locale === "zh" ? "提交成功！" : "Submitted successfully!");
        onSuccess(successMsg);
      } else {
        const data = await response.json();
        setSubmitStatus("error");
        setErrorMessage(
          data.error || (locale === "zh" ? "提交失败" : "Submission failed"),
        );
        setTurnstileKey((prev) => prev + 1);
      }
    } catch (error) {
      setSubmitStatus("error");
      setErrorMessage(
        formConfig?.errorNetworkMessage || defaultMessages.errorNetworkMessage,
      );
      setTurnstileKey((prev) => prev + 1);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full lg:w-[45%]">
      <h3 className="relative font-bold font-anaheim text-4xl md:text-5xl lg:text-5xl xl:text-6xl mb-8 lg:mb-12">
        <span
          className="absolute text-transparent"
          style={{ WebkitTextStroke: "1px white", top: "2px", left: "2px" }}
        >
          {content.form.title}
        </span>
        <span className="relative text-white">{content.form.title}</span>
      </h3>

      <form className="flex flex-col gap-6 lg:gap-8" onSubmit={handleSubmit}>
        <Input
          placeholder={`${content.form.placeholders.name} *`}
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className={cn(
            formInputClasses,
            "text-base md:text-lg lg:text-xl xl:text-2xl",
          )}
          disabled={isSubmitting}
        />
        <Input
          type="email"
          placeholder={`${content.form.placeholders.email} *`}
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className={cn(
            formInputClasses,
            "text-base md:text-lg lg:text-xl xl:text-2xl",
          )}
          disabled={isSubmitting}
        />
        <Textarea
          placeholder={`${content.form.placeholders.message} *`}
          value={formData.message}
          onChange={(e) =>
            setFormData({ ...formData, message: e.target.value })
          }
          className={cn(
            formInputClasses,
            "min-h-[80px] text-base md:text-lg lg:text-xl xl:text-2xl",
          )}
          disabled={isSubmitting}
        />

        {turnstileSiteKey && (
          <div className="mt-4">
            <Turnstile
              key={turnstileKey}
              siteKey={turnstileSiteKey}
              onVerify={(token) => setTurnstileToken(token)}
              theme="dark"
              language={locale === "zh" ? "zh-CN" : locale}
            />
          </div>
        )}

        {submitStatus === "error" && errorMessage && (
          <div className="text-red-400 text-sm">{errorMessage}</div>
        )}

        <div className="flex flex-col gap-8">
          {formConfig?.privacyConsentText && (
            <div
              className="flex items-start gap-3 cursor-pointer group"
              onClick={() => handlePrivacyToggle(!privacyAccepted)}
            >
              <div
                className={cn(
                  "mt-1 flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center",
                  privacyAccepted
                    ? "bg-brand-footer-button-bg border-brand-footer-button-bg"
                    : "border-white/30 bg-transparent",
                )}
              >
                {privacyAccepted && (
                  <svg
                    className="w-3 h-3 text-brand-footer-button-text"
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
              <p className="text-[10px] sm:text-[11px] leading-relaxed text-white/60 max-w-[450px] select-none whitespace-pre-line">
                {formConfig.privacyConsentText}
              </p>
            </div>
          )}

          <Button
            type="submit"
            className={cn(
              formButtonClasses,
              "text-base md:text-lg lg:text-xl xl:text-2xl h-auto py-3 w-auto min-w-[200px] rounded-full",
              !!formConfig?.privacyConsentText &&
                !privacyAccepted &&
                "opacity-50 grayscale cursor-not-allowed",
            )}
            disabled={
              isSubmitting ||
              (!!formConfig?.privacyConsentText && !privacyAccepted)
            }
          >
            {isSubmitting
              ? formConfig?.submittingText || "..."
              : formConfig?.submitButtonText || content.form.buttonText}
          </Button>
        </div>
      </form>
    </div>
  );
}
