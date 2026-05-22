"use client";

import { useState, useEffect, useRef } from "react";
import type { HomeContent } from "@/lib/content-data";
import { AnimatedLinkButton } from "@/components/ui/animated-link-button";
import { LucideIcon, HelpCircle, Lightbulb, ShieldCheck, Factory, Globe, Users } from "lucide-react";
import { IconifyIcon } from "@/components/ui/IconifyIcon";
import { cn } from "@/lib/utils";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { HollowText } from "@/components/common/HollowText";

type Props = {
  data: HomeContent["whyChooseBusrom"];
  headerTheme?: string;
  className?: string;
};

// 设计稿基准尺寸
const DESIGN_WIDTH = 1920;
const DESIGN_HEIGHT = 922;

// 布局配置 - 基于 Figma JSON
const LAYOUT = {
  // 左右边距
  paddingLeft: 150,
  paddingRight: 150,

  // 标题区域
  header: {
    titleY: 68,
    titleFontSize: 80,
    titleLineHeight: 95,
  },

  // VIEW MORE 按钮
  viewMore: {
    y: 92,
  },

  // 手风琴卡片区域
  accordion: {
    y: 248,
    width: 1600,
    height: 646,
    cardCollapsedWidth: 272,
    cardExpandedWidth: 437,
    cardBorderRadius: 30,
    gap: 18,
  },

  // 展开卡片内容
  expandedContent: {
    titleFontSize: 32,
    titleLineHeight: 34,
    descFontSize: 20,
    descLineHeight: 27,
    iconSize: 78,
  },
};

// 图标映射 - 根据 reason title 匹配对应图标
const iconMap: { [key: string]: LucideIcon } = {
  "Original & Proprietary Design": Lightbulb,
  "Relentless Quality & Integration": ShieldCheck,
  "Factory-direct Production": Factory,
  "Years of Global Expertise": Globe,
  "Collaborative R&D Partnership": Users,
  // 中文映射
  "原创与专有设计": Lightbulb,
  "严格质量与整合": ShieldCheck,
  "工厂直接生产": Factory,
  "多年全球专业经验": Globe,
  "合作研发伙伴关系": Users,
  default: HelpCircle,
};

// 自动轮播间隔（毫秒）
const CAROUSEL_INTERVAL_MS = 3000;

export default function WhyChooseBusrom({ data, headerTheme, className }: Props) {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isHovering, setIsHovering] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  const reasonsLength = data?.reasons?.length || 0;

  // 视口检测 - 不在视口时暂停轮播省电
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  // 自动轮播的核心逻辑 (仅在视口内运行)
  useEffect(() => {
    if (isHovering || reasonsLength === 0 || !isVisible) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }
    timerRef.current = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % reasonsLength);
    }, CAROUSEL_INTERVAL_MS);
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isHovering, reasonsLength, isVisible]);

  // vw 转换函数
  const vw = (px: number) => `${(px / DESIGN_WIDTH) * 100}vw`;

  // Guard: if no data, don't render
  if (!data || !data.reasons || data.reasons.length === 0) {
    return null;
  }

  return (
    <section ref={sectionRef} className={cn("py-12 lg:py-0 bg-brand-main", className)} data-header-theme={headerTheme}>
      <style jsx>{`
        @keyframes custom-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-custom-float {
          animation: custom-float 3s ease-in-out infinite;
          display: inline-block;
          will-change: transform;
          backface-visibility: hidden;
        }
      `}</style>
      <div className="container mx-auto px-4 lg:px-0" style={{ maxWidth: '100%' }}>

        {/* ==================== 移动端布局 ==================== */}
        <div className="lg:hidden">
          <div className="mb-6">
            <h2 className="font-anaheim font-extrabold text-2xl text-brand-text-black flex flex-wrap gap-x-2">
              <span
                style={{
                  color: "#000000",
                  WebkitTextStroke: "0.8px #756f3f",
                  paintOrder: "stroke fill",
                }}
              >
                {data.title}
              </span>
              <span className="animate-custom-float">
                <HollowText strokeColor="#756f3f" strokeWidth={0.8}>
                  {data.title2}
                </HollowText>
              </span>
            </h2>
          </div>

          {/* 垂直堆叠卡片 */}
          <div className="grid grid-cols-1 gap-6">
            {data.reasons.map((reason, index) => {
              const IconComponent = iconMap[reason.title] || iconMap.default;
              return (
                <div
                  key={reason.title}
                  className="relative w-full aspect-video rounded-lg overflow-hidden shadow-lg"
                >
                  <OptimizedImage
                    image={data.reasons[index].image}
                    alt={data.reasons[index].image?.altText || reason.title}
                    size="small"
                    className="object-cover object-center z-0 absolute inset-0 w-full h-full"
                  />
                  <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  <div className="relative z-20 h-full p-6 flex flex-col items-center justify-end text-center">
                    <div className="w-12 h-12 mb-2 flex items-center justify-center">
                      {reason.icon ? (
                        <IconifyIcon name={reason.icon} size={32} color="white" />
                      ) : (
                        <IconComponent className="w-8 h-8 text-white" />
                      )}
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-1">{reason.title}</h3>
                    <p className="text-white/90 text-sm">{reason.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ==================== 桌面端布局 ==================== */}
        <div
          className="hidden lg:block"
          style={{
            paddingLeft: vw(LAYOUT.paddingLeft),
            paddingRight: vw(LAYOUT.paddingRight),
            paddingTop: vw(LAYOUT.header.titleY),
            paddingBottom: vw(60),
          }}
        >
          {/* 顶部区域 - Header */}
          <div className="flex justify-between items-end">
            {/* 左侧标题 */}
            <h2
              className="font-anaheim font-extrabold flex flex-wrap gap-x-4 items-baseline"
              style={{
                fontSize: vw(LAYOUT.header.titleFontSize),
                lineHeight: vw(LAYOUT.header.titleLineHeight),
              }}
            >
              <span
                style={{
                  color: '#000000',
                  WebkitTextStroke: `calc(4 * var(--rpx)) #756f3f`,
                  paintOrder: 'stroke fill',
                }}
              >
                {data.title}
              </span>{' '}
              <span className="animate-custom-float">
                <HollowText
                  strokeColor="#756f3f"
                  strokeWidth={1.2}
                >
                  {data.title2}
                </HollowText>
              </span>
            </h2>

            {/* 右侧 VIEW MORE */}
            <AnimatedLinkButton href={data.viewMoreButtonUrl || '#'}>
              {data.viewMoreButtonText || 'VIEW MORE INFORMATION'}
              <span className="ml-2 inline-block transition-transform duration-300 group-hover:translate-x-1">
                »
              </span>
            </AnimatedLinkButton>
          </div>

          {/* 手风琴卡片区域 */}
          <div
            className="flex"
            style={{
              marginTop: vw(LAYOUT.accordion.y - LAYOUT.header.titleY - LAYOUT.header.titleLineHeight),
              height: vw(LAYOUT.accordion.height),
              gap: vw(LAYOUT.accordion.gap),
            }}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            {data.reasons.map((reason, index) => {
              const isExpanded = activeIndex === index;
              const IconComponent = iconMap[reason.title] || iconMap.default;

              return (
                <div
                  key={reason.title}
                  className="relative overflow-hidden transition-all duration-500 ease-in-out cursor-pointer group"
                  style={{
                    width: isExpanded ? vw(LAYOUT.accordion.cardExpandedWidth) : vw(LAYOUT.accordion.cardCollapsedWidth),
                    borderRadius: vw(LAYOUT.accordion.cardBorderRadius),
                    boxShadow: isExpanded ? '0 4px 15px rgba(0, 0, 0, 0.5)' : 'none',
                  }}
                  onMouseEnter={() => setActiveIndex(index)}
                >
                  {/* 背景图 */}
                  <OptimizedImage
                    image={data.reasons[index].image}
                    alt={data.reasons[index].image?.altText || reason.title}
                    size="medium"
                    className="object-cover object-center z-0 transition-transform duration-500 ease-in-out group-hover:scale-105 absolute inset-0 w-full h-full"
                  />

                  {/* 阴影渐变 */}
                  <div
                    className={cn(
                      "absolute bottom-0 left-0 w-full z-10",
                      "transition-opacity ease-in-out",
                      isExpanded
                        ? "opacity-100 duration-200 delay-300"
                        : "opacity-0 duration-200"
                    )}
                    style={{
                      height: '63%',
                      background: 'linear-gradient(to top, rgba(0,0,0,0.86) 0%, rgba(0,0,0,0) 100%)',
                    }}
                  />

                  {/* 渐显的文字内容 */}
                  <div
                    className={cn(
                      "absolute bottom-0 left-0 w-full z-20",
                      "flex flex-col items-center justify-end text-center",
                      "transition-opacity ease-in-out",
                      isExpanded
                        ? "opacity-100 duration-200 delay-300"
                        : "opacity-0 duration-200"
                    )}
                    style={{
                      padding: vw(30),
                      paddingBottom: vw(50),
                    }}
                  >
                    {/* 图标 */}
                    <div
                      className="flex items-center justify-center"
                      style={{
                        width: vw(LAYOUT.expandedContent.iconSize),
                        height: vw(LAYOUT.expandedContent.iconSize),
                        marginBottom: vw(30),
                      }}
                    >
                      {reason.icon ? (
                        <IconifyIcon name={reason.icon} size={78} color="white" className="w-full h-full" />
                      ) : (
                        <IconComponent className="w-full h-full text-white" />
                      )}
                    </div>
                    {/* 标题 */}
                    <h3
                      className="font-anaheim font-bold text-white text-center"
                      style={{
                        fontSize: vw(LAYOUT.expandedContent.titleFontSize),
                        lineHeight: vw(LAYOUT.expandedContent.titleLineHeight),
                        marginBottom: vw(28),
                      }}
                    >
                      {reason.title}
                    </h3>
                    {/* 描述 */}
                    <p
                      className="font-anaheim font-medium text-white text-center"
                      style={{
                        fontSize: vw(LAYOUT.expandedContent.descFontSize),
                        lineHeight: vw(LAYOUT.expandedContent.descLineHeight),
                      }}
                    >
                      {reason.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}