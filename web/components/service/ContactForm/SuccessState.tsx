import React from "react";
import { FormConfig } from "./types";

interface SuccessStateProps {
  formConfig: FormConfig | null;
  vw?: (px: number) => string;
  isMobile?: boolean;
}

export const SuccessState: React.FC<SuccessStateProps> = ({ formConfig, vw, isMobile }) => {
  if (isMobile) {
    return (
      <div className="bg-white/20 backdrop-blur-sm rounded-[12px] p-6 text-center">
        <svg
          className="w-12 h-12 text-[#FFF071] mx-auto mb-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="text-lg font-anaheim font-bold text-white mb-2">Success!</h3>
        <p className="text-white/80 text-sm">
          {formConfig?.successMessage || "Your request has been submitted successfully. Our team will contact you soon."}
        </p>
      </div>
    );
  }

  return (
    <div
      className="bg-white/20 backdrop-blur-md border border-white/20 flex flex-col items-center justify-center text-center"
      style={{
        borderRadius: vw?.(40),
        padding: `${vw?.(80)} ${vw?.(40)}`,
        height: "100%",
      }}
    >
      <div
        className="flex items-center justify-center bg-[#FFF071] rounded-full"
        style={{
          width: vw?.(120),
          height: vw?.(120),
          marginBottom: vw?.(40),
        }}
      >
        <svg
          style={{ width: vw?.(60), height: vw?.(60) }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="#6E6839"
          strokeWidth={3}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h3
        className="font-anaheim font-bold text-white"
        style={{ fontSize: vw?.(48), marginBottom: vw?.(24) }}
      >
        Success!
      </h3>
      <p
        className="font-anaheim font-medium text-white/80"
        style={{ fontSize: vw?.(24), lineHeight: 1.5, maxWidth: vw?.(500) }}
      >
        {formConfig?.successMessage || "Your request has been submitted successfully. Our team will contact you soon."}
      </p>
    </div>
  );
};
