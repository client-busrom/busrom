import { useState, useEffect, useCallback, FormEvent } from "react";
import { FormField, FormConfig } from "./types";
import { STORAGE_KEY, serviceTypeIcons } from "./constants";

export const getSubmissionCount = (formName: string): number => {
  if (typeof window === "undefined") return 0;
  const key = `form_submissions_${formName}`;
  return parseInt(sessionStorage.getItem(key) || "0", 10);
};

export const incrementSubmissionCount = (formName: string): void => {
  if (typeof window === "undefined") return;
  const key = `form_submissions_${formName}`;
  const current = getSubmissionCount(formName);
  sessionStorage.setItem(key, String(current + 1));
};

export const useContactForm = (initialFormConfig: FormConfig | undefined, formName: string) => {
  const [formConfig, setFormConfig] = useState<FormConfig | null>(initialFormConfig || null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(!initialFormConfig);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, boolean>>({});
  const [uploadedAttachments, setUploadedAttachments] = useState<any[]>([]);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [isGloballyAccepted, setIsGloballyAccepted] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [submissionCount, setSubmissionCount] = useState(0);

  const shouldShowCaptcha = !!(
    formConfig?.captchaEnabled &&
    formConfig.captchaSiteKey &&
    submissionCount >= formConfig.captchaThreshold - 1
  );

  useEffect(() => {
    if (initialFormConfig) {
      const initialData: Record<string, any> = {};
      initialFormConfig.fields?.forEach((field: FormField) => {
        initialData[field.fieldName] = field.fieldType === "checkbox" ? [] : "";
      });
      setFormData(initialData);
      setSubmissionCount(getSubmissionCount(formName));
    }
  }, [initialFormConfig, formName]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const consent = localStorage.getItem(STORAGE_KEY);
      if (consent === "true") {
        setIsGloballyAccepted(true);
        setPrivacyAccepted(true);
      }
    }
  }, []);

  const handlePrivacyToggle = (checked: boolean) => {
    setPrivacyAccepted(checked);
    if (checked && typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, "true");
      window.dispatchEvent(new Event("storage"));
    }
  };

  useEffect(() => {
    const handleStorageChange = () => {
      const consent = localStorage.getItem(STORAGE_KEY);
      if (consent === "true") {
        setIsGloballyAccepted(true);
        setPrivacyAccepted(true);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleTurnstileVerify = useCallback((token: string) => {
    setTurnstileToken(token);
    setError(null);
  }, []);

  const handleTurnstileError = useCallback(() => {
    setTurnstileToken(null);
    setError("Captcha verification failed. Please try again.");
  }, []);

  const handleTurnstileExpire = useCallback(() => {
    setTurnstileToken(null);
  }, []);

  const handleChange = (fieldName: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleCheckboxChange = (fieldName: string, value: string, checked: boolean) => {
    setFormData((prev) => {
      const currentValues = Array.isArray(prev[fieldName]) ? prev[fieldName] : [];
      if (checked) {
        return { ...prev, [fieldName]: [...currentValues, value] };
      } else {
        return { ...prev, [fieldName]: currentValues.filter((v: string) => v !== value) };
      }
    });
  };

  const handleFileUpload = async (fieldName: string, files: FileList | null, field: FormField) => {
    if (!files || files.length === 0) return;
    setUploadingFiles((prev) => ({ ...prev, [fieldName]: true }));
    setError(null);
    try {
      const uploadedFiles: any[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formDataUpload = new FormData();
        formDataUpload.append("file", file);
        formDataUpload.append("formConfigId", formConfig?.id || "");
        formDataUpload.append("fieldName", fieldName);
        const response = await fetch("/api/form-file-upload", { method: "POST", body: formDataUpload });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Upload failed");
        }
        const result = await response.json();
        uploadedFiles.push({
          fieldName,
          fileName: result.fileName,
          fileUrl: result.fileUrl,
          fileSize: result.fileSize,
          fileType: result.fileType,
          uploadedAt: result.uploadedAt,
        });
      }
      setFormData((prev) => {
        if (field.validation?.multiple) {
          const existingUrls = Array.isArray(prev[fieldName]) ? prev[fieldName] : [];
          return { ...prev, [fieldName]: [...existingUrls, ...uploadedFiles.map((f) => f.fileUrl)] };
        } else {
          return { ...prev, [fieldName]: uploadedFiles[0]?.fileUrl || "" };
        }
      });
      setUploadedAttachments((prev) => [...prev, ...uploadedFiles]);
    } catch (err) {
      console.error("File upload error:", err);
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingFiles((prev) => ({ ...prev, [fieldName]: false }));
    }
  };

  const handleSubmit = async (e: FormEvent, locale: string) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const missingFields: string[] = [];
      formConfig?.fields.forEach((field) => {
        if (field.required) {
          const value = formData[field.fieldName];
          if (!value || (Array.isArray(value) && value.length === 0)) {
            missingFields.push(field.label);
          }
        }
      });

      if (missingFields.length > 0) {
        setError(formConfig?.errorRequiredFields || `Please fill in required fields: ${missingFields.join(", ")}`);
        setSubmitting(false);
        return;
      }

      if (shouldShowCaptcha && !turnstileToken) {
        setError(formConfig?.errorCaptchaMessage || "Please complete the captcha verification");
        setSubmitting(false);
        return;
      }

      const processedData = { ...formData };
      formConfig?.fields.forEach((field) => {
        const optionsWithCustom = field.options?.filter((o: any) => o.hasCustomInput) || [];
        if (optionsWithCustom.length > 0) {
          if (field.fieldType === "checkbox" && Array.isArray(processedData[field.fieldName])) {
            processedData[field.fieldName] = processedData[field.fieldName].map((val: string) => {
              const hasCustom = optionsWithCustom.some((o: any) => o.value === val);
              if (hasCustom) {
                const customVal = processedData[`${field.fieldName}_custom_${val}`];
                if (customVal) return `${val} (${customVal})`;
              }
              return val;
            });
            optionsWithCustom.forEach((o: any) => {
              delete processedData[`${field.fieldName}_custom_${o.value}`];
            });
          } else if (["radio", "select", "checkbox"].includes(field.fieldType)) {
            const val = processedData[field.fieldName];
            const hasCustom = optionsWithCustom.some((o: any) => o.value === val);
            if (hasCustom) {
              const customVal = processedData[`${field.fieldName}_custom`];
              if (customVal) processedData[field.fieldName] = `${val} (${customVal})`;
            }
            delete processedData[`${field.fieldName}_custom`];
          }
        }
      });

      const res = await fetch("/api/form-submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formId: formConfig?.id,
          formName: formConfig?.name,
          data: processedData,
          attachments: uploadedAttachments,
          locale,
          sourcePage: window.location.href,
          turnstileToken: shouldShowCaptcha ? turnstileToken : undefined,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
        incrementSubmissionCount(formName);
        setSubmissionCount((prev) => prev + 1);
        setTimeout(() => {
          setSubmitted(false);
          const resetData: Record<string, any> = {};
          formConfig?.fields.forEach((field) => {
            resetData[field.fieldName] = field.fieldType === "checkbox" ? [] : "";
          });
          setFormData(resetData);
          setUploadedAttachments([]);
          setTurnstileToken(null);
        }, 5000);
      } else {
        const errorData = await res.json();
        setError(errorData.error || formConfig?.errorMessage || "Failed to submit form");
        setTurnstileToken(null);
      }
    } catch (err) {
      console.error("Error submitting form:", err);
      setError(formConfig?.errorNetworkMessage || formConfig?.errorMessage || "Failed to submit form");
      setTurnstileToken(null);
    } finally {
      setSubmitting(false);
    }
  };

  const getFieldsByType = () => {
    if (!formConfig || !Array.isArray(formConfig.fields))
      return { nameEmail: [], serviceType: null, description: null, file: null };

    const sorted = [...formConfig.fields].sort((a, b) => (a.order || 0) - (b.order || 0));
    return {
      nameEmail: sorted.filter(f => ["text", "email", "tel", "phone"].includes(f.fieldType)),
      serviceType: sorted.find(f => f.fieldType === "checkbox"),
      description: sorted.find(f => f.fieldType === "textarea"),
      file: sorted.find(f => f.fieldType === "file"),
    };
  };

  return {
    formConfig,
    formData,
    loading,
    submitting,
    submitted,
    error,
    uploadingFiles,
    uploadedAttachments,
    privacyAccepted,
    isGloballyAccepted,
    turnstileToken,
    submissionCount,
    shouldShowCaptcha,
    handlePrivacyToggle,
    handleTurnstileVerify,
    handleTurnstileError,
    handleTurnstileExpire,
    handleChange,
    handleCheckboxChange,
    handleFileUpload,
    handleSubmit,
    getFieldsByType,
  };
};
