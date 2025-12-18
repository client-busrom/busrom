"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { MainFormData } from "@/lib/content-data";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
// lg 断点 (1024px) - 与 Tailwind 一致
const LG_BREAKPOINT = 1024;

// ------------------------------------------------------------------
// 类型定义
// ------------------------------------------------------------------
type Props = {
  data: MainFormData;
};

// ------------------------------------------------------------------
// 表单样式常量 (基于 Figma 1920x1136 设计)
// ------------------------------------------------------------------
const formLabelClasses = "block font-anaheim font-bold text-brand-form-input-text";

const formInputClasses = `
  mt-1 block w-full bg-transparent text-brand-form-input-text
  placeholder:text-muted-foreground
  border-0 rounded-none border-b border-white
  focus:outline-none focus:ring-0 focus:border-primary
`;

const formButtonClasses = `
  flex mx-auto rounded-full bg-brand-form-button-bg text-brand-text-inverse
  hover:bg-brand-form-button-bg/90 font-anaheim font-semibold
`;

// ------------------------------------------------------------------
// MainForm 组件
// ------------------------------------------------------------------
export default function MainForm({ data }: Props) {
  const [scrollY, setScrollY] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const leftImageRef = useRef<HTMLDivElement>(null);
  const rightImageRef = useRef<HTMLDivElement>(null);
  const [leftVisible, setLeftVisible] = useState(false);
  const [rightVisible, setRightVisible] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false); // lg 及以上

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
  const imageCardContainerClass = `bg-[var(--card-default-background)] w-full aspect-[404/837] relative overflow-hidden`;

  // 滚动视差动画逻辑
  // 左侧：从上往下移动进入，往下移出
  // 右侧：从下往上移动进入，往上移出
  const getSlideInTransform = (index: number) => {
    if (!sectionRef.current) return `translateY(0)`;

    const element = sectionRef.current;
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    // progress: 0 = 板块刚进入视口底部, 1 = 板块顶部到达视口顶部
    const progress = Math.max(0, Math.min(1, (windowHeight - rect.top) / (windowHeight + rect.height)));
    // 移动幅度：500px
    const maxOffset = 500;

    if (index === 0) {
      // 左侧：从上方进入，滚动时往下移动，出场继续往下
      const offset = (1 - progress * 2) * maxOffset;
      return `translateY(${offset}px)`;
    } else if (index === 2) {
      // 右侧：从下方进入，滚动时往上移动，出场继续往上
      const offset = (1 - progress * 2) * maxOffset;
      return `translateY(${-offset}px)`;
    }
    return `translateY(0)`;
  };

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
        <div className="flex flex-col lg:flex-row gap-12 max-w-6xl mx-auto lg:items-center items-center">
          {/* 左侧 - 图片 */}
          <div
            ref={leftImageRef}
            className={cn(
              "lg:w-[30%] w-[50%]",
              // lg 以下 (手机/平板) 淡入效果
              !isDesktop && "transition-opacity duration-700 ease-out",
              !isDesktop && (leftVisible ? "opacity-100" : "opacity-0")
            )}
            style={
              // lg 及以上 (桌面端) 保持原有视差效果
              isDesktop
                ? { transform: getSlideInTransform(0), transition: "transform 0.5s ease-out" }
                : undefined
            }
          >
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
                <OptimizedImage image={data.image1} alt={data.image1?.altText || data.designTextLeft} size="large" className="object-cover w-full h-full absolute inset-0" />
              </div>

              {/* 2. 顶层手机框 (z-20) */}
              <Image src="/iPhoneFrame.svg" alt="iPhone Frame" fill className="object-cover z-20" />
            </div>
            {/* 3. 文字遮罩 (z-30) */}
            <div className="w-full p-8 z-30 flex justify-center">
              <p className="text-white text-center text-xl lg:text-xl text-stroke-black font-anaheim font-bold whitespace-nowrap lg:whitespace-normal">{data.designTextLeft}</p>
            </div>
          </div>

          {/* 中间 - 表单 */}
          {/* 宽度 477/1920 ≈ 24.8%, 但需要加上左右padding，实际容器更宽 */}
          <div
            className="w-[80%] lg:w-auto"
            style={{ width: "clamp(320px, 35vw, 560px)" }}
          >
            <div className={cardContainerClass}>
            <form
              className="flex flex-col"
              style={{ gap: "clamp(12px, 1.2vw, 24px)" }}
            >
              {/* Name - y=198 */}
              <div>
                <Label
                  htmlFor="name"
                  className={formLabelClasses}
                  style={{ fontSize: "clamp(10px, 1.04vw, 20px)" }}
                >
                  {data.placeholderName}
                </Label>
                <Input
                  type="text"
                  id="name"
                  placeholder={""}
                  className={formInputClasses}
                  style={{ fontSize: "clamp(10px, 1.04vw, 20px)" }}
                />
              </div>
              {/* Email - y=301 */}
              <div>
                <Label
                  htmlFor="email"
                  className={formLabelClasses}
                  style={{ fontSize: "clamp(10px, 1.04vw, 20px)" }}
                >
                  {data.placeholderEmail}
                </Label>
                <Input
                  type="email"
                  id="email"
                  placeholder={""}
                  className={formInputClasses}
                  style={{ fontSize: "clamp(10px, 1.04vw, 20px)" }}
                />
              </div>
              {/* WhatsApp - y=404 */}
              <div>
                <Label
                  htmlFor="whatsapp"
                  className={formLabelClasses}
                  style={{ fontSize: "clamp(10px, 1.04vw, 20px)" }}
                >
                  {data.placeholderWhatsapp}
                </Label>
                <Input
                  type="tel"
                  id="whatsapp"
                  placeholder={""}
                  className={formInputClasses}
                  style={{ fontSize: "clamp(10px, 1.04vw, 20px)" }}
                />
              </div>
              {/* Company - y=507 */}
              <div>
                <Label
                  htmlFor="company"
                  className={formLabelClasses}
                  style={{ fontSize: "clamp(10px, 1.04vw, 20px)" }}
                >
                  {data.placeholderCompany}
                </Label>
                <Input
                  type="text"
                  id="company"
                  placeholder={""}
                  className={formInputClasses}
                  style={{ fontSize: "clamp(10px, 1.04vw, 20px)" }}
                />
              </div>
              {/* Message - y=610 */}
              <div>
                <Label
                  htmlFor="message"
                  className={formLabelClasses}
                  style={{ fontSize: "clamp(10px, 1.04vw, 20px)" }}
                >
                  {data.placeholderMessage}
                </Label>
                <Textarea
                  id="message"
                  placeholder={""}
                  className={cn(formInputClasses, "min-h-[40px]")}
                  style={{ fontSize: "clamp(10px, 1.04vw, 20px)" }}
                />
              </div>
              {/* Verify Code - y=713 */}
              <div>
                <Label
                  htmlFor="verify"
                  className={formLabelClasses}
                  style={{ fontSize: "clamp(10px, 1.04vw, 20px)" }}
                >
                  {data.placeholderVerify}
                </Label>
                <Input
                  type="text"
                  id="verify"
                  placeholder={""}
                  className={formInputClasses}
                  style={{ fontSize: "clamp(10px, 1.04vw, 20px)" }}
                />
              </div>
              {/* Submit Button - y=842, 宽度 331px, 高度 68px */}
              <div style={{ marginTop: "clamp(20px, 2.1vw, 40px)" }}>
                <Button
                  type="submit"
                  className={formButtonClasses}
                  style={{
                    width: "clamp(165px, 17.2vw, 331px)",
                    height: "clamp(34px, 3.5vw, 68px)",
                    fontSize: "clamp(16px, 1.67vw, 32px)",
                  }}
                >
                  {data.buttonText}
                </Button>
              </div>
            </form>
            </div>
          </div>

          {/* 右侧 - 图片 */}
          <div
            ref={rightImageRef}
            className={cn(
              "lg:w-[30%] w-[50%]",
              // lg 以下 (手机/平板) 淡入效果
              !isDesktop && "transition-opacity duration-700 ease-out delay-150",
              !isDesktop && (rightVisible ? "opacity-100" : "opacity-0")
            )}
            style={
              // lg 及以上 (桌面端) 保持原有视差效果
              isDesktop
                ? { transform: getSlideInTransform(2), transition: "transform 0.5s ease-out" }
                : undefined
            }
          >
            {/* 3. 文字遮罩 (z-30) */}
            <div className="relative w-full p-8 z-30 flex justify-center">
              <p className="text-white text-center text-xl lg:text-xl text-stroke-black font-anaheim font-bold whitespace-nowrap lg:whitespace-normal">{data.designTextRight}</p>
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
                <OptimizedImage image={data.image2} alt={data.image2?.altText || data.designTextRight} size="large" className="object-cover w-full h-full absolute inset-0" />
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