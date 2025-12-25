// components/home/StaticServiceFeatures.tsx
// 纯静态服务特色展示 - 无 JS，无 "use client"
// 用于 SSG/SSR 首屏渲染，提升 LCP 和 TBT

import type { HomeContent } from "@/lib/content-data";
import { cn } from "@/lib/utils";
import { OptimizedImage } from "@/components/ui/OptimizedImage";

type Props = {
  data: HomeContent["serviceFeatures"];
};

/**
 * 静态版服务特色展示
 * - 只显示第一个 feature（无轮播）
 * - 无动画、无自动播放
 * - 纯 HTML + CSS，零 JS 执行
 */
export default function StaticServiceFeatures({ data }: Props) {
  if (!data || !data.features || data.features.length === 0) {
    return null;
  }

  const features = data.features;
  const activeFeature = features[0]; // 静态版只显示第一个

  return (
    <section className="py-16 lg:py-24 bg-brand-main" data-header-theme="light">
      <div className="container mx-auto px-4">
        {/* 主容器：米色圆角背景 */}
        <div
          className={cn(
            "relative overflow-hidden rounded-[20px] lg:rounded-[30px]",
            "bg-[#F0EBDB]",
            "w-full max-w-[1860px] mx-auto"
          )}
        >
          {/* 装饰性模糊椭圆 - 只在桌面端显示 */}
          <div
            className="hidden lg:block absolute pointer-events-none"
            style={{
              left: "62px",
              top: "197px",
              width: "1571px",
              height: "392px",
              background:
                "linear-gradient(to bottom, rgba(255,255,255,1), rgba(218,201,142,1))",
              filter: "blur(67px)",
              borderRadius: "50%",
            }}
          />

          {/* 内容布局：桌面左右，移动上下 */}
          <div className="relative z-10 flex flex-col lg:flex-row py-8 lg:py-12">
            {/* === 左侧固定内容区域 === */}
            <div
              className={cn(
                "flex flex-col justify-center",
                "px-6 py-8",
                "lg:px-10 lg:py-0 lg:w-[380px] lg:flex-shrink-0",
                "xl:px-14 xl:w-[440px]",
                "2xl:px-[80px] 2xl:w-[520px]"
              )}
            >
              {/* 主标题 */}
              <h2
                className={cn(
                  "font-anaheim font-extrabold text-black",
                  "text-2xl leading-tight",
                  "lg:text-[32px] lg:leading-[42px]",
                  "xl:text-[40px] xl:leading-[52px]",
                  "2xl:text-[48px] 2xl:leading-[62px]"
                )}
              >
                {data.title.split("\n").map((line, i) => (
                  <span key={i}>
                    {line}
                    {i < data.title.split("\n").length - 1 && <br />}
                  </span>
                ))}
              </h2>

              {/* 副标题 */}
              <p
                className={cn(
                  "font-anaheim font-medium text-[#756F3F]",
                  "text-sm leading-relaxed mt-4",
                  "lg:text-[14px] lg:leading-[22px] lg:mt-4",
                  "xl:text-[16px] xl:leading-[24px]",
                  "2xl:text-[18px] 2xl:leading-[28px]",
                  "max-w-[320px]"
                )}
              >
                {data.subtitle}
              </p>
            </div>

            {/* === 右侧内容区域 === */}
            <div
              className={cn(
                "flex-1 flex items-stretch",
                "px-4 lg:px-0",
                "lg:pr-4 xl:pr-6 2xl:pr-10"
              )}
            >
              {/* 白色圆角卡片 */}
              <div
                className={cn(
                  "bg-white rounded-[20px] lg:rounded-[24px]",
                  "w-full",
                  "lg:h-[420px] xl:h-[480px] 2xl:h-[560px]",
                  "flex flex-col",
                  "shadow-lg"
                )}
              >
                {/* 卡片内容区域 */}
                <div className="flex-1 flex flex-col lg:flex-row p-4 lg:p-0">
                  {/* 文字内容区 */}
                  <div
                    className={cn(
                      "flex flex-col justify-start flex-shrink-0",
                      "lg:w-[340px] lg:pt-[50px] lg:pl-[30px] lg:pr-4",
                      "xl:w-[380px] xl:pt-[60px] xl:pl-[40px]",
                      "2xl:w-[440px] 2xl:pt-[70px] 2xl:pl-[50px]"
                    )}
                  >
                    {/* 装饰线条 */}
                    <div className="bg-[#7E7A4F] w-[50px] h-[10px] lg:w-[60px] lg:h-[11px] 2xl:w-[73px] 2xl:h-[13px] mb-4 lg:mb-6" />

                    {/* 标题 */}
                    <h3
                      className={cn(
                        "font-anaheim font-extrabold text-black",
                        "text-xl leading-tight mb-3",
                        "lg:text-[22px] lg:leading-[28px] lg:mb-3",
                        "xl:text-[26px] xl:leading-[32px]",
                        "2xl:text-[32px] 2xl:leading-[40px] 2xl:mb-4"
                      )}
                    >
                      {activeFeature.title}
                    </h3>

                    {/* 描述 */}
                    <p
                      className={cn(
                        "font-anaheim font-medium text-black",
                        "text-sm leading-relaxed",
                        "lg:text-[12px] lg:leading-[18px]",
                        "xl:text-[14px] xl:leading-[20px]",
                        "2xl:text-[16px] 2xl:leading-[24px]"
                      )}
                    >
                      {activeFeature.description}
                    </p>
                  </div>

                  {/* 图片区域 */}
                  <div className="flex-1 relative min-h-[200px] lg:min-h-0">
                    {activeFeature.images && activeFeature.images.length > 0 && (
                      <div className="absolute inset-0 p-4 lg:p-6">
                        <div className="relative w-full h-full rounded-xl overflow-hidden">
                          <OptimizedImage
                            image={activeFeature.images[0]}
                            alt={activeFeature.title}
                            size="large"
                            width={800}
                            height={600}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 底部进度指示器 - 静态版显示第一个选中 */}
                <div className="flex-shrink-0 px-4 lg:px-8 pb-6 lg:pb-8">
                  <div className="flex gap-2">
                    {features.map((_, index) => (
                      <div
                        key={index}
                        className={cn(
                          "h-1 rounded-full transition-all",
                          index === 0
                            ? "bg-[#756F3F] flex-[2]"
                            : "bg-[#D9D9D9] flex-1"
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
