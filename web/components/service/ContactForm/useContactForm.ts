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

export const useContactForm = (initialFormConfig: FormConfig | undefined, formName: string, locale?: string) => {
  const [formConfig, setFormConfig] = useState<FormConfig | null>(initialFormConfig || null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(!initialFormConfig);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, boolean>>({});
  const [uploadedAttachments, setUploadedAttachments] = useState<any[]>([]);
  const [pendingFiles, setPendingFiles] = useState<Record<string, File[]>>({});
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
    if (initialFormConfig && initialFormConfig.fields) {
      const initialData: Record<string, any> = {};
      initialFormConfig.fields.forEach((field: FormField) => {
        initialData[field.fieldName] = field.fieldType === "checkbox" ? [] : "";
      });
      setFormData(initialData);
      setSubmissionCount(getSubmissionCount(formName));
      setFormConfig(initialFormConfig);
      setLoading(false);
    }
  }, [initialFormConfig, formName]);

  // Fetch form configuration if not provided or incomplete
  useEffect(() => {
    if (initialFormConfig?.id) return;

    const fetchConfig = async () => {
      if (!formName) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/form-config/${formName}?locale=${locale}`);
        if (res.ok) {
          const config = await res.json();
          setFormConfig(config);
          
          // Initialize data if not already set
          const initialData: Record<string, any> = {};
          config.fields.forEach((field: FormField) => {
            initialData[field.fieldName] = field.fieldType === "checkbox" ? [] : "";
          });
          setFormData(prev => ({ ...initialData, ...prev }));
        }
      } catch (err) {
        console.error("Error fetching form config:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, [formName, locale, initialFormConfig?.id]);

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

  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  const validateFile = (file: File, field: FormField) => {
    const maxSize = field.validation?.maxSize || 5 * 1024 * 1024; // Default 5MB
    if (file.size > maxSize) return `File ${file.name} is too large. Max size is ${Math.round(maxSize / 1024 / 1024)}MB.`;
    const allowedTypes = field.validation?.allowedTypes || [];
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) return `File ${file.name} type is not supported.`;
    return null;
  };

  const handleFileUpload = (fieldName: string, files: FileList | null, field: FormField) => {
    if (!files || files.length === 0) return;

    // 提示用户：由于文件可能很大，我们会在您点击“提交”并验证通过后再进行上传
    const missingFields: string[] = [];
    formConfig?.fields.forEach((f) => {
      if (f.required && f.fieldType !== "file") {
        const value = formData[f.fieldName];
        if (!value || (Array.isArray(value) && value.length === 0)) {
          missingFields.push(f.label);
        }
      }
    });

    if (missingFields.length > 0) {
      setError(`Please fill in required fields (${missingFields.join(", ")}) before selecting files.`);
      return;
    }
    
    // 仅做本地校验，不立即上传
    const newFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const validationError = validateFile(file, field);
      if (validationError) {
        setError(validationError);
        return;
      }
      newFiles.push(file);
    }

    setPendingFiles(prev => ({
      ...prev,
      [fieldName]: newFiles
    }));
    setError(null);
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

      // 2. Upload pending files
      const attachments = [...uploadedAttachments];
      const formId = formConfig?.id || (initialFormConfig as any)?.id;
      if (!formId) {
        setError("Form configuration not loaded. Please refresh and try again.");
        setSubmitting(false);
        return;
      }
      
      const allPendingFiles: Array<{ fieldName: string, file: File }> = [];
      Object.entries(pendingFiles).forEach(([fieldName, files]) => {
        files.forEach(file => allPendingFiles.push({ fieldName, file }));
      });

      if (allPendingFiles.length > 0) {
        // Set uploading state for UI feedback
        const uploadingStates = Object.fromEntries(
          allPendingFiles.map(f => [f.fieldName, true])
        );
        setUploadingFiles(uploadingStates);

        try {
          const uploadPromises = allPendingFiles.map(({ fieldName, file }, index) => {
          return new Promise<any>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            const formDataUpload = new FormData();
            formDataUpload.append("file", file);
            formDataUpload.append("formConfigId", formId);
            formDataUpload.append("fieldName", fieldName);

            xhr.upload.onprogress = (event) => {
              if (event.lengthComputable) {
                const percent = Math.round((event.loaded / event.total) * 100);
                setUploadProgress(prev => ({ ...prev, [`${fieldName}-${index}`]: percent }));
              }
            };

            xhr.onload = () => {
              if (xhr.status >= 200 && xhr.status < 300) {
                const result = JSON.parse(xhr.responseText);
                resolve({ ...result, fieldName });
              } else {
                try {
                  const errorData = JSON.parse(xhr.responseText);
                  reject(new Error(errorData.error || `Upload failed with status ${xhr.status}`));
                } catch {
                  reject(new Error(`Upload failed with status ${xhr.status}`));
                }
              }
            };
            xhr.onerror = () => reject(new Error("Network error"));
            xhr.open("POST", "/api/form-file-upload");
            xhr.send(formDataUpload);
          });
        });

          const results = await Promise.all(uploadPromises);
          attachments.push(...results);
        } finally {
          setUploadingFiles({});
          setUploadProgress({});
          setPendingFiles({});
        }
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
          attachments: attachments,
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
    pendingFiles,
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
    uploadProgress,
  };
};
