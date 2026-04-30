"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { IconifyIcon } from "@/components/ui/IconifyIcon";
import type { Locale } from "@/i18n.config";

// 设计稿基准尺寸 1920
const DESIGN_WIDTH = 1920;

// 响应式尺寸函数（不缩放，因为这是全屏板块）
const rpx = (designValue: number) =>
  `calc(var(--rpx-applications) * ${designValue})`;

interface MediaObject {
  id: string;
  url: string;
  alt?: string;
  variants?: {
    thumbnail?: string;
    small?: string;
    medium?: string;
    large?: string;
    xlarge?: string;
  };
  cropFocalPoint?: { x: number; y: number } | null;
  width?: number;
  height?: number;
}

interface ApplicationItem {
  id: string;
  title: string;
  description?: string;
  image: MediaObject | null;
  link?: string;
}

interface QuickLink {
  title: string;
  url: string;
  icon?: any;
  newTab?: boolean;
}

interface OemOdmApplicationsProps {
  title?: string;
  applicationIds?: number[];
  locale?: Locale;
  findOutMore?: QuickLink | null;
  nextText?: string;
}

export function OemOdmApplications({
  title = "Applications",
  applicationIds = [],
  locale = "en",
  findOutMore,
  nextText = "Next",
}: OemOdmApplicationsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 根据 IDs 获取 Applications 数据
  useEffect(() => {
    const fetchApplications = async () => {
      if (applicationIds.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `/api/applications?ids=${applicationIds.join(",")}&locale=${locale}`,
        );
        if (res.ok) {
          const data = await res.json();
          // 转换 API 返回的数据格式
          const transformedApps: ApplicationItem[] = (data.docs || []).map(
            (app: any) => {
              return {
                id: String(app.id),
                title: app.name || "",
                description: app.shortDescription || "",
                image: app.image,
                link: app.slug ? `/application/${app.slug}` : undefined,
              };
            },
          );

          // 按照传入的 ids 顺序排序
          const orderedApps = applicationIds
            .map((id) => transformedApps.find((app) => app.id === String(id)))
            .filter(Boolean) as ApplicationItem[];

          setApplications(orderedApps);
        }
      } catch (error) {
        console.error("Failed to fetch applications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [applicationIds, locale]);

  // 预加载所有图片
  useEffect(() => {
    if (applications.length > 0) {
      applications.forEach((app) => {
        if (app.image?.url) {
          const img = new Image();
          img.src = app.image.url;
        }
      });
    }
  }, [applications]);

  // 获取下一个索引
  const nextIndex =
    applications.length > 1 ? (currentIndex + 1) % applications.length : 0;

  const lastClickTime = useRef(0);

  // 切换到下一个
  const handleNext = () => {
    const now = Date.now();
    if (now - lastClickTime.current < 250) return;
    lastClickTime.current = now;
    setCurrentIndex((prev) => (prev + 1) % applications.length);
  };

  // 点击跳转到当前应用详情
  const handleClick = () => {
    const now = Date.now();
    if (now - lastClickTime.current < 250) return;
    if (applications[currentIndex]?.link) {
      window.location.href = applications[currentIndex].link;
    }
  };

  // 跳转到快速链接
  const handleQuickLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (findOutMore?.url) {
      if (findOutMore.newTab) {
        window.open(findOutMore.url, "_blank");
      } else {
        window.location.href = findOutMore.url;
      }
    } else {
      handleClick();
    }
  };

  // 加载中状态
  if (loading) {
    return (
      <section
        className="relative w-full overflow-hidden"
        style={{
          ["--rpx-applications" as string]: `calc(100vw / ${DESIGN_WIDTH})`,
        }}
      >
        <div
          className="hidden md:flex relative w-full items-center justify-center"
          style={{ height: rpx(1086) }}
        >
          <div className="w-12 h-12 border-2 border-[#D9D9D9] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </section>
    );
  }

  // 没有应用时不显示板块
  if (!applications || applications.length === 0) {
    return null;
  }

  const currentApp = applications[currentIndex];
  const nextApp = applications[nextIndex];

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        ["--rpx-applications" as string]: `calc(100vw / ${DESIGN_WIDTH})`,
      }}
    >
      {/* ========== PC端布局 ========== */}
      <div
        className="hidden md:block relative w-full cursor-pointer overflow-hidden"
        style={{ height: rpx(1086) }}
        onClick={handleClick}
      >
        {/* 背景大图 - 当前应用 */}
        <AnimatePresence mode="popLayout">
          <motion.div
            key={currentIndex}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >
            {currentApp.image ? (
              <OptimizedImage
                image={currentApp.image as any}
                alt={currentApp.title || "Application"}
                size="large"
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-[#D9D9D9]" />
            )}
          </motion.div>
        </AnimatePresence>

        {/* 底部渐变遮罩 */}
        <div
          className="absolute"
          style={{
            left: 0,
            bottom: 0,
            width: "100%",
            height: rpx(642),
            background:
              "linear-gradient(to top, rgba(0,0,0,0.74), rgba(0,0,0,0))",
          }}
        />

        {/* 左下角 Find Out More */}
        <div
          className="absolute flex items-center group cursor-pointer"
          style={{
            left: rpx(200),
            bottom: rpx(100),
            gap: rpx(20),
          }}
          onClick={handleQuickLinkClick}
        >
          {/* 圆形箭头图标 或 自定义图标 */}
          {findOutMore?.icon ? (
            <motion.div 
              style={{ width: rpx(110), height: rpx(110) }} 
              className={`flex items-center justify-center ${typeof findOutMore.icon === 'string' ? 'border border-white rounded-full' : ''}`}
              animate={{
                x: [0, 10, 0],
                y: [0, -10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              {typeof findOutMore.icon === 'string' ? (
                <IconifyIcon name={findOutMore.icon} size={rpx(32)} color="white" />
              ) : (
                <OptimizedImage
                  image={findOutMore.icon}
                  alt=""
                  className="w-full h-full object-contain"
                />
              )}
            </motion.div>
          ) : (
            <motion.svg
              style={{ width: rpx(150), height: rpx(150) }}
              viewBox="0 0 205 205"
              fill="none"
              animate={{
                x: [0, 10, 0],
                y: [0, -10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <path
                d="M77.3663 116.717C77.4784 116.911 77.6281 117.081 77.8069 117.217C77.9857 117.353 78.19 117.452 78.4083 117.509C78.6265 117.566 78.8544 117.58 79.0789 117.55C79.3034 117.519 79.5202 117.445 79.7167 117.331L124.669 91.3784L120.62 106.12C120.499 106.56 120.559 107.027 120.785 107.419C121.011 107.811 121.386 108.096 121.827 108.211C122.268 108.326 122.739 108.262 123.136 108.033C123.533 107.804 123.824 107.428 123.944 106.989L129.091 88.248C129.151 88.0304 129.167 87.8038 129.139 87.5809C129.11 87.3581 129.038 87.1435 128.926 86.9493C128.814 86.7551 128.664 86.5852 128.485 86.4493C128.306 86.3133 128.102 86.214 127.884 86.157L109.08 81.2437C108.862 81.1866 108.634 81.173 108.409 81.2036C108.185 81.2341 107.968 81.3083 107.772 81.4218C107.575 81.5353 107.402 81.6859 107.264 81.8651C107.125 82.0443 107.023 82.2485 106.963 82.466C106.903 82.6836 106.887 82.9102 106.915 83.1331C106.944 83.3559 107.016 83.5705 107.128 83.7647C107.24 83.9588 107.39 84.1288 107.569 84.2647C107.748 84.4007 107.952 84.5 108.17 84.557L122.962 88.4216L78.0096 114.375C77.8131 114.488 77.6405 114.639 77.5018 114.818C77.3631 114.997 77.2609 115.201 77.2012 115.419C77.1414 115.636 77.1253 115.863 77.1536 116.086C77.1819 116.308 77.2542 116.523 77.3663 116.717Z"
                fill="white"
              />
              <circle
                cx="102.315"
                cy="102.315"
                r="74.8999"
                transform="rotate(-120 102.315 102.315)"
                stroke="white"
                strokeWidth="2"
              />
            </motion.svg>
          )}
          <span
            className="font-anaheim font-semibold text-white group-hover:underline underline-offset-4"
            style={{ fontSize: rpx(24), lineHeight: rpx(47) }}
          >
            {findOutMore?.title || "Find out more"}
          </span>
        </div>

        {/* 分页指示点 - 直接绝对定位 */}
        <div
          className="absolute flex items-center"
          style={{
            left: rpx(1125),
            bottom: rpx(361 + 27),
            gap: rpx(10),
          }}
        >
          {applications.map((_, index) => (
            <div
              key={index}
              className="rounded-full bg-white transition-all duration-300 cursor-pointer"
              style={{
                width: rpx(index === currentIndex ? 12 : 8),
                height: rpx(index === currentIndex ? 12 : 8),
                opacity: index === currentIndex ? 1 : 0.6,
              }}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(index);
              }}
            />
          ))}
        </div>

        {/* 白色竖线 */}
        <div
          className="absolute bg-white"
          style={{
            left: rpx(1104),
            bottom: rpx(127),
            width: rpx(2),
            height: rpx(234),
          }}
        />

        {/* 下一个应用预览图 (Rectangle 4) */}
        <div
          className="absolute overflow-hidden"
          style={{
            left: rpx(1125),
            bottom: rpx(127),
            width: rpx(360),
            height: rpx(234),
          }}
        >
          {nextApp?.image ? (
            <OptimizedImage
              image={nextApp.image as any}
              alt={nextApp.title || "Next"}
              size="medium"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-[#D9D9D9]" />
          )}
        </div>

        {/* Next 按钮区域 (Rectangle 5 - 白色边框方块 + 文字 + 箭头) */}
        <motion.div
          className="absolute cursor-pointer flex items-center justify-center"
          style={{
            left: rpx(1503),
            bottom: rpx(127),
            width: rpx(234),
            height: rpx(234),
            border: "1px solid white",
            gap: rpx(12),
          }}
          onClick={(e) => {
            e.stopPropagation();
            handleNext();
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {/* Next 文字 */}
          <span
            className="font-anaheim font-semibold text-white"
            style={{
              fontSize: rpx(24),
              lineHeight: rpx(47),
            }}
          >
            {nextText}
          </span>
          {/* 箭头 - 水平移动动画 */}
          <motion.svg
            style={{
              width: rpx(31),
              height: rpx(16),
            }}
            viewBox="0 0 31 16"
            fill="none"
            animate={{ x: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <path
              d="M-3.49691e-07 8C-3.44589e-07 8.11673 0.0232786 8.23231 0.0685077 8.34016C0.113737 8.448 0.18003 8.54599 0.263602 8.62853C0.347175 8.71107 0.44639 8.77655 0.555582 8.82122C0.664775 8.86589 0.781807 8.88888 0.899996 8.88888L27.9272 8.88888L22.2634 14.4824C22.0946 14.6491 21.9998 14.8752 21.9998 15.111C21.9998 15.3468 22.0946 15.5729 22.2634 15.7396C22.4322 15.9063 22.6612 16 22.8999 16C23.1386 16 23.3676 15.9063 23.5364 15.7396L30.7363 8.6286C30.8199 8.54606 30.8862 8.44806 30.9315 8.3402C30.9767 8.23235 31 8.11674 31 8C31 7.88325 30.9767 7.76765 30.9315 7.65979C30.8862 7.55194 30.8199 7.45394 30.7363 7.3714L23.5364 0.260373C23.4528 0.177824 23.3535 0.112343 23.2443 0.0676669C23.1351 0.0229911 23.0181 -1.00615e-06 22.8999 -1.00099e-06C22.7817 -9.95819e-07 22.6646 0.0229911 22.5554 0.067667C22.4462 0.112343 22.347 0.177824 22.2634 0.260373C22.1798 0.342922 22.1135 0.440923 22.0683 0.548779C22.0231 0.656634 21.9998 0.772234 21.9998 0.888976C21.9998 1.00572 22.0231 1.12132 22.0683 1.22917C22.1135 1.33703 22.1798 1.43503 22.2634 1.51758L27.9272 7.11112L0.899996 7.11112C0.781807 7.11112 0.664775 7.13411 0.555582 7.17878C0.44639 7.22345 0.347175 7.28893 0.263602 7.37147C0.18003 7.45401 0.113737 7.552 0.0685077 7.65984C0.0232786 7.76768 -3.60334e-07 7.88327 -3.49691e-07 8Z"
              fill="white"
            />
          </motion.svg>
        </motion.div>
      </div>

      {/* ========== 移动端布局 ========== */}
      <div className="block md:hidden relative w-full">
        {/* 当前应用大图 */}
        <div className="relative w-full aspect-[16/10]">
          {currentApp.image ? (
            <OptimizedImage
              image={currentApp.image as any}
              alt={currentApp.title || "Application"}
              size="large"
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-[#D9D9D9]" />
          )}

          {/* 底部渐变 */}
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent" />

          {/* 底部内容 */}
          <div className="absolute bottom-4 left-4 right-4">
            {/* 分页点 */}
            <div className="flex gap-2 mb-4">
              {applications.map((_, index) => (
                <div
                  key={index}
                  className="rounded-full bg-white transition-all duration-300"
                  style={{
                    width: index === currentIndex ? 10 : 6,
                    height: index === currentIndex ? 10 : 6,
                    opacity: index === currentIndex ? 1 : 0.6,
                  }}
                  onClick={() => setCurrentIndex(index)}
                />
              ))}
            </div>

            {/* Find out more */}
            <div
              className="flex items-center gap-2 cursor-pointer active:opacity-70"
              onClick={handleQuickLinkClick}
            >
              {findOutMore?.icon ? (
                <motion.div 
                  style={{ width: 30, height: 30 }} 
                  className={`flex items-center justify-center ${typeof findOutMore.icon === 'string' ? 'border border-white rounded-full' : ''}`}
                  animate={{
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  {typeof findOutMore.icon === 'string' ? (
                    <IconifyIcon name={findOutMore.icon} size={24} color="white" />
                  ) : (
                    <OptimizedImage
                      image={findOutMore.icon}
                      alt=""
                      className="w-full h-full object-contain"
                    />
                  )}
                </motion.div>
              ) : (
                <svg width="40" height="40" viewBox="0 0 205 205" fill="none">
                  <path
                    d="M77.3663 116.717C77.4784 116.911 77.6281 117.081 77.8069 117.217C77.9857 117.353 78.19 117.452 78.4083 117.509C78.6265 117.566 78.8544 117.58 79.0789 117.55C79.3034 117.519 79.5202 117.445 79.7167 117.331L124.669 91.3784L120.62 106.12C120.499 106.56 120.559 107.027 120.785 107.419C121.011 107.811 121.386 108.096 121.827 108.211C122.268 108.326 122.739 108.262 123.136 108.033C123.533 107.804 123.824 107.428 123.944 106.989L129.091 88.248C129.151 88.0304 129.167 87.8038 129.139 87.5809C129.11 87.3581 129.038 87.1435 128.926 86.9493C128.814 86.7551 128.664 86.5852 128.485 86.4493C128.306 86.3133 128.102 86.214 127.884 86.157L109.08 81.2437C108.862 81.1866 108.634 81.173 108.409 81.2036C108.185 81.2341 107.968 81.3083 107.772 81.4218C107.575 81.5353 107.402 81.6859 107.264 81.8651C107.125 82.0443 107.023 82.2485 106.963 82.466C106.903 82.6836 106.887 82.9102 106.915 83.1331C106.944 83.3559 107.016 83.5705 107.128 83.7647C107.24 83.9588 107.39 84.1288 107.569 84.2647C107.748 84.4007 107.952 84.5 108.17 84.557L122.962 88.4216L78.0096 114.375C77.8131 114.488 77.6405 114.639 77.5018 114.818C77.3631 114.997 77.2609 115.201 77.2012 115.419C77.1414 115.636 77.1253 115.863 77.1536 116.086C77.1819 116.308 77.2542 116.523 77.3663 116.717Z"
                    fill="white"
                  />
                  <circle
                    cx="102.315"
                    cy="102.315"
                    r="74.8999"
                    transform="rotate(-120 102.315 102.315)"
                    stroke="white"
                    strokeWidth="2"
                  />
                </svg>
              )}
              <span className="font-anaheim font-semibold text-white text-sm">
                {findOutMore?.title || "Find out more"}
              </span>
            </div>
          </div>

          {/* Next 按钮 */}
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 text-white"
            onClick={handleNext}
          >
            <span className="font-anaheim font-semibold text-sm">Next</span>
            <svg width="10" height="18" viewBox="0 0 16 31" fill="none">
              <path
                d="M1 1L14 15.5L1 30"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}

export default OemOdmApplications;
