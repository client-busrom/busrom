"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { cn } from "@/lib/utils";

// ------------------------------------------------------------------
// 类型定义 (保持不变)
// ------------------------------------------------------------------
type MainFormData = {
  placeholders: {
    name: string;
    email: string;
    whatsapp: string;
    company: string;
    message: string;
    verify: string;
  };
  buttonText: string;
  designText: {
    left: string;
    right: string;
  };
  images: string[];
};

type Props = {
  data: MainFormData;
};

// ------------------------------------------------------------------
// 【已提取】表单样式常量
// ------------------------------------------------------------------
const formLabelClasses = "block text-sm font-anaheim font-bold text-brand-form-input-text";

const formInputClasses = `
  mt-1 block w-full bg-transparent text-brand-form-input-text
  placeholder:text-muted-foreground
  border-0 rounded-none border-b border-brand-form-input-border 
  focus:outline-none focus:ring-0 focus:border-primary
`;

const formButtonClasses = `
  flex w-4/5 mx-auto rounded-full bg-brand-form-button-bg text-brand-text-inverse 
  hover:bg-brand-form-button-bg/90 pt-6 pb-6 mt-16
`;

// ------------------------------------------------------------------
// MainForm 组件
// ------------------------------------------------------------------
export default function MainForm({ data }: Props) {
  const [scrollY, setScrollY] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 【已修改】简化了 cardContainerClass，因为 p-8 在你的代码中被覆盖了
  const cardContainerClass = `bg-brand-form-bg rounded-2xl px-8 py-16`;

  // 固定的宽高比容器 (404x837)
  const imageCardContainerClass = `bg-[var(--card-default-background)] w-full aspect-[404/837] relative overflow-hidden`;

  // 动画逻辑 (保持不变)
  const getSlideInTransform = (index: number) => {
    if (!sectionRef.current) return `translateY(0)`;

    const element = sectionRef.current;
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    const progress = Math.max(0, Math.min(1, (windowHeight - rect.top) / windowHeight));
    const offset = (1 - progress) * 100;

    if (index === 0) {
      return `translateY(${-offset}px)`;
    } else if (index === 2) {
      return `translateY(${offset}px)`;
    }
    return `translateY(0)`;
  };

  // ------------------------------------------------------------------
  // JSX 渲染
  // ------------------------------------------------------------------
  return (
    <section
      ref={sectionRef}
      className={`py-20 bg-brand-secondary text-brand-text-inverse overflow-hidden duration-500`}
      data-header-theme="transparent"
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-12 max-w-6xl mx-auto lg:items-stretch items-center">
          {/* 左侧 - 图片 (保持不变) */}
          <div className="lg:w-[30%] w-[50%]" style={{ transform: getSlideInTransform(0), transition: "transform 0.5s ease-out" }}>
            <div className={imageCardContainerClass}>
              {/* 1. 底层内容图片 (z-10) */}
              <div
                className="absolute overflow-hidden lg:rounded-[48px] md:rounded-[54px] sm:rounded-[30px] rounded-[24px] z-10"
                style={{
                  top: "1.4%",
                  bottom: "1.4%",
                  left: "3.6%",
                  right: "3.6%",
                }}
              >
                <Image src={data.image1?.url || "/placeholder.jpg"} alt={data.image1?.altText || data.designTextLeft} fill className="object-cover w-full h-full" />
              </div>

              {/* 2. 顶层手机框 (z-20) */}
              <Image src="/iPhoneFrame.svg" alt="iPhone Frame" fill className="object-cover z-20" />
            </div>
            {/* 3. 文字遮罩 (z-30) */}
            <div className="w-full p-8 z-30">
              <p className="text-white text-center text-xl text-stroke-black font-anaheim font-bold">{data.designTextLeft}</p>
            </div>
          </div>

          {/* 【已重构】中间 - 表单 */}
          <div className="lg:w-[40%] w-[80%] mt-8">
            <div className={cardContainerClass}>
              <form className="space-y-2">
                {/* Name */}
                <div>
                  <Label htmlFor="name" className={formLabelClasses}>
                    {data.placeholderName}
                  </Label>
                  <Input type="text" id="name" placeholder={""} className={formInputClasses} />
                </div>
                {/* Email */}
                <div>
                  <Label htmlFor="email" className={formLabelClasses}>
                    {data.placeholderEmail}
                  </Label>
                  <Input type="email" id="email" placeholder={""} className={formInputClasses} />
                </div>
                {/* WhatsApp */}
                <div>
                  <Label htmlFor="whatsapp" className={formLabelClasses}>
                    {data.placeholderWhatsapp}
                  </Label>
                  <Input type="tel" id="whatsapp" placeholder={""} className={formInputClasses} />
                </div>
                {/* Company */}
                <div>
                  <Label htmlFor="company" className={formLabelClasses}>
                    {data.placeholderCompany}
                  </Label>
                  <Input type="text" id="company" placeholder={""} className={formInputClasses} />
                </div>
                {/* Message */}
                <div>
                  <Label htmlFor="message" className={formLabelClasses}>
                    {data.placeholderMessage}
                  </Label>
                  <Textarea id="message" placeholder={""} className={cn(formInputClasses,"min-h-[40px]")} />
                </div>
                {/* Verify Code */}
                <div>
                  <Label htmlFor="verify" className={formLabelClasses}>
                    {data.placeholderVerify}
                  </Label>
                  <Input type="text" id="verify" placeholder={""} className={formInputClasses} />
                </div>
                {/* Submit Button */}
                <div className="mt-16"> {/* <--- 在这里应用你的 margin-top */}
              <Button type="submit" className={formButtonClasses}>
                {data.buttonText}
              </Button>
            </div>
              </form>
            </div>
          </div>

          {/* 右侧 - 图片 (保持不变) */}
          <div className="lg:w-[30%] w-[50%]" style={{ transform: getSlideInTransform(2), transition: "transform 0.5s ease-out" }}>
            {/* 3. 文字遮罩 (z-30) */}
            <div className="relative w-full p-8 z-30">
              <p className="text-white text-center text-xl text-stroke-black font-anaheim font-bold">{data.designTextRight}</p>
            </div>
            <div className={cn(imageCardContainerClass, "bottom-0")}>
              {/* 1. 底层内容图片 (z-10) */}
              <div
                className="absolute overflow-hidden lg:rounded-[48px] md:rounded-[54px] sm:rounded-[30px] rounded-[24px] z-10"
                style={{
                  top: "1.4%",
                  bottom: "1.4%",
                  left: "3.6%",
                  right: "3.6%",
                }}
              >
                <Image src={data.image2?.url || "/placeholder.jpg"} alt={data.image2?.altText || data.designTextRight} fill className="object-cover w-full h-full" />
              </div>

              {/* 2. 顶层手机框 (z-20) */}
              <Image src="/iPhoneFrame.svg" alt="iPhone Frame" fill className="object-cover z-20" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}