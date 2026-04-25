"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { HomeContent } from "@/lib/content-data";
import { cn } from "@/lib/utils";
import { ServerImage } from "@/components/ui/ServerImage";
import { getCropStyles, getCropImageUrl, getObjectPosition } from "@/lib/utils";

type Props = {
  data: HomeContent["seriesIntro"];
};

// --- 常量定义 ---
const SERIES_AUTO_SCROLL_INTERVAL = 30000; // 系列轮播: 30秒
const IMAGE_AUTO_SCROLL_INTERVAL = 5000;   // 图片轮播: 5秒
const VISIBLE_WINDOW_SIZE = 5;  // 显示5个标签
const FOCUS_POSITION = 1;       // 焦点在第二个位置（索引1，从0开始）
const SWIPE_THRESHOLD = 50; // 滑动阈值

export default function SeriesIntro({ data }: Props) {
  const seriesData = data || [];
  const totalSeries = seriesData.length;

  // 系列轮播索引
  const [activeSeriesIndex, setActiveSeriesIndex] = useState(0);
  // 当前系列的图片轮播索引
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  // 视口检测
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false); // 鼠标悬停暂停
  const sectionRef = useRef<HTMLElement>(null);

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

  // 预加载所有系列的图片
  useEffect(() => {
    if (!seriesData || seriesData.length === 0) return;

    // 预加载所有系列的所有图片
    seriesData.forEach((series) => {
      series.images?.forEach((imageObj) => {
        if (imageObj) {
          // 使用中型或大型变体预加载
          const url = imageObj.variants?.medium || imageObj.url;
          if (url && !url.includes('placeholder')) {
            const img = new Image();
            img.src = url;
          }
        }
      });
    });
  }, [seriesData]);

  const seriesIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const imageIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 拖拽状态
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  // 当前激活的系列
  const activeSeries = seriesData[activeSeriesIndex];
  const currentImages = activeSeries?.images || [];
  const totalImages = currentImages.length;

  // 焦点位置偏移量（焦点在第二个位置）
  const VISIBLE_ITEMS_FOCUS_OFFSET = FOCUS_POSITION;

  // --- 系列轮播控制 ---
  const handleSeriesNext = useCallback(() => {
    setActiveSeriesIndex((prevIndex) => (prevIndex + 1) % totalSeries);
    setActiveImageIndex(0);
  }, [totalSeries]);

  const handleSeriesPrev = useCallback(() => {
    setActiveSeriesIndex((prevIndex) => (prevIndex - 1 + totalSeries) % totalSeries);
    setActiveImageIndex(0);
  }, [totalSeries]);

  // 是否正在进行循环跳转（用于禁用动画）
  const [isLooping, setIsLooping] = useState(false);

  // --- 图片轮播控制 (循环) ---
  const handleImageNext = useCallback(() => {
    if (totalImages <= 0) return;

    const nextIndex = activeImageIndex + 1;

    if (nextIndex >= totalImages) {
      // 到达末尾，先滑动到克隆的第一张(索引=totalImages)
      setActiveImageIndex(totalImages);
      // 动画完成后瞬间跳回真正的第一张
      setTimeout(() => {
        setIsLooping(true);
        setActiveImageIndex(0);
        setTimeout(() => setIsLooping(false), 50);
      }, 500);
    } else {
      setActiveImageIndex(nextIndex);
    }
  }, [totalImages, activeImageIndex]);

  const handleImagePrev = useCallback(() => {
    if (totalImages <= 0) return;

    if (activeImageIndex === 0) {
      // 在第一张，直接循环到最后一张
      setActiveImageIndex(totalImages - 1);
    } else {
      setActiveImageIndex(activeImageIndex - 1);
    }
  }, [totalImages, activeImageIndex]);

  // --- 系列自动轮播 (仅在视口内且不悬停时运行) ---
  useEffect(() => {
    if (isDragging || !isVisible || isHovering) return;

    seriesIntervalRef.current = setInterval(handleSeriesNext, SERIES_AUTO_SCROLL_INTERVAL);
    return () => {
      if (seriesIntervalRef.current) clearInterval(seriesIntervalRef.current);
    };
  }, [handleSeriesNext, isDragging, isVisible, isHovering]);

  // --- 图片自动轮播 (仅在视口内且不悬停时运行) ---
  useEffect(() => {
    if (totalImages <= 1 || isDragging || !isVisible || isHovering) return;

    imageIntervalRef.current = setInterval(handleImageNext, IMAGE_AUTO_SCROLL_INTERVAL);
    return () => {
      if (imageIntervalRef.current) clearInterval(imageIntervalRef.current);
    };
  }, [handleImageNext, totalImages, isDragging, isVisible, isHovering]);

  // --- 拖拽/滑动处理 ---
  const handleDragStart = (clientX: number) => {
    setIsDragging(true);
    setDragStartX(clientX);
    setDragOffset(0);
  };

  const handleDragMove = (clientX: number) => {
    if (!isDragging) return;
    const offset = clientX - dragStartX;
    setDragOffset(offset);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;

    // 判断滑动方向并切换
    if (dragOffset > SWIPE_THRESHOLD) {
      handleImagePrev();
    } else if (dragOffset < -SWIPE_THRESHOLD) {
      handleImageNext();
    }

    setIsDragging(false);
    setDragOffset(0);
  };

  // 鼠标事件
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleDragMove(e.clientX);
  };

  const handleMouseUp = () => {
    handleDragEnd();
  };

  const handleMouseLeave = () => {
    if (isDragging) handleDragEnd();
  };

  // 触摸事件
  const handleTouchStart = (e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleDragMove(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    handleDragEnd();
  };

  // 竖形列表透明度计算
  const getOpacity = (distance: number) => {
    const opacity = 1.0 - distance * 0.2;
    return Math.max(0.2, opacity);
  };

  // 准备固定窗口的渲染数据
  const getRenderWindow = () => {
    const window: {
      title: string;
      description: string;
      distanceFromFocus: number;
      isCurrent: boolean;
      originalIndex: number;
    }[] = [];

    // 焦点在第二个位置，所以起始索引 = 当前索引 - 1
    const startIndex = activeSeriesIndex - VISIBLE_ITEMS_FOCUS_OFFSET;

    for (let i = 0; i < VISIBLE_WINDOW_SIZE; i++) {
      let currentIndex = startIndex + i;
      const dataIndex = ((currentIndex % totalSeries) + totalSeries) % totalSeries;

      const item = seriesData[dataIndex];
      if (item) {
        window.push({
          ...item,
          distanceFromFocus: Math.abs(i - VISIBLE_ITEMS_FOCUS_OFFSET),
          isCurrent: dataIndex === activeSeriesIndex,
          originalIndex: dataIndex,
        });
      }
    }
    return window;
  };

  const renderWindow = getRenderWindow();

  // Guard: if no data, don't render
  if (!data || totalSeries === 0) {
    return null;
  }

  return (
    <section
      ref={sectionRef}
      className="py-6 lg:py-8 bg-brand-main"
      data-header-theme="transparent"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="bg-brand-secondary rounded-2xl lg:rounded-3xl p-6 lg:py-20 lg:pl-20 lg:pr-0 overflow-hidden">

          {/* ===== 桌面端布局 (lg+) ===== */}
          <div className="hidden lg:block">
            {/* 上半部分: 标题+描述 | 系列列表 */}
            <div className="flex gap-12 mb-8">
              {/* 左侧: 标题+描述 */}
              <div className="flex-1">
                <h2 className="text-5xl xl:text-6xl font-anaheim font-extrabold mb-6" style={{ color: '#FFFAD3' }}>
                  Product Series Introduction
                </h2>
                {activeSeries && (
                  <p className="text-sm xl:text-base leading-relaxed text-white max-w-2xl mt-2 ml-4">
                    {activeSeries.description}
                  </p>
                )}
              </div>

              {/* 右侧: 系列列表轮播 + 上下切换按钮 */}
              <div className="w-80 flex-shrink-0 flex gap-0">
                {/* 系列列表 */}
                <div className="flex-1">
                  <div className="h-72 overflow-hidden relative">
                    <div className="flex flex-col absolute w-full top-0 left-0">
                      {renderWindow.map((item, idx) => (
                        <button
                          key={`${item.title}-${idx}`}
                          className="w-full text-left py-4 transition-all duration-300 h-14"
                          style={{ opacity: getOpacity(item.distanceFromFocus) }}
                          onClick={() => {
                            setActiveSeriesIndex(item.originalIndex);
                            setActiveImageIndex(0);
                          }}
                        >
                          <span
                            className={cn(
                              "text-lg font-anaheim font-bold transition-colors duration-300",
                              item.isCurrent
                                ? "text-brand-cream"
                                : "text-brand-cream/70 hover:text-brand-cream"
                            )}
                          >
                            {item.title}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 上下切换按钮 - 切换系列 */}
                <div className="flex flex-col gap-3 justify-center -translate-x-8">
                  <button
                    onClick={handleSeriesPrev}
                    className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                    aria-label="Previous series"
                  >
                    <svg className="w-5 h-5 text-brand-cream" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <button
                    onClick={handleSeriesNext}
                    className="w-12 h-12 rounded-full bg-white flex items-center justify-center transition-colors hover:bg-white/90"
                    aria-label="Next series"
                  >
                    <svg className="w-5 h-5 text-brand-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* 下半部分: 按钮+竖排标题 | 图片轮播 */}
            <div className="flex gap-6 items-stretch">
              {/* 左侧: 竖排标题 + 按钮 (横向排列) */}
              <div className="w-36 flex-shrink-0 flex flex-col justify-between py-2">
                {/* 竖排标题 */}
                <div className="flex-1 flex items-center justify-center">
                  <span
                    className="text-xl font-anaheim text-brand-cream whitespace-nowrap"
                    style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                  >
                    {activeSeries?.title || "Series Title"}
                  </span>
                </div>

                {/* 切换按钮 - 横向排列 - 切换图片 */}
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={handleImagePrev}
                    className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                    aria-label="Previous image"
                  >
                    <svg className="w-5 h-5 text-brand-cream" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={handleImageNext}
                    className="w-12 h-12 rounded-full bg-white flex items-center justify-center transition-colors hover:bg-white/90"
                    aria-label="Next image"
                  >
                    <svg className="w-5 h-5 text-brand-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* 右侧: 图片轮播 (循环) */}
              <div
                ref={carouselRef}
                className="flex-1 overflow-hidden rounded-l-2xl cursor-grab active:cursor-grabbing select-none aspect-[21/9]"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <div
                  className={cn(
                    "flex gap-4 h-full transition-transform",
                    (isDragging || isLooping) ? "duration-0" : "duration-500 ease-out"
                  )}
                  style={{
                    // 78% = 75% 卡片宽度 + 3% gap
                    transform: `translateX(calc(-${activeImageIndex * 78}% + ${dragOffset}px))`,
                  }}
                >
                  {/*
                    循环渲染: 在原图后面追加克隆图实现无缝循环
                    结构: [原图1, 原图2, ..., 原图N, 克隆1, 克隆2]
                  */}
                  {[...currentImages, ...currentImages.slice(0, Math.min(2, totalImages))].map((imageObj, idx) => (
                    <div
                      key={`${activeSeries?.title}-img-${idx}`}
                      className="flex-shrink-0 w-[75%] aspect-[2/1] relative rounded-2xl overflow-hidden"
                    >
                      {(() => {
                        const originalIdx = idx % totalImages;
                        const cropData = activeSeries.imageCropDataList?.[originalIdx];
                        const cropStyles = getCropStyles(cropData);
                        if (cropStyles && cropData && cropData.croppedAreaPixels) {
                          return (
                            <div
                              className="absolute inset-0 w-full h-full"
                              style={{
                                ...cropStyles.container,
                                width: "100%",
                                height: "100%",
                              }}
                            >
                              <img
                                src={getCropImageUrl(imageObj, cropData)}
                                alt={imageObj?.altText || `${activeSeries?.title} - Image ${originalIdx + 1}`}
                                style={{
                                  ...cropStyles.image,
                                  width: `${(cropData.variantWidth / cropData.croppedAreaPixels.width) * 100}%`,
                                  height: `${(cropData.variantHeight / cropData.croppedAreaPixels.height) * 100}%`,
                                  left: `${(-cropData.croppedAreaPixels.x / cropData.croppedAreaPixels.width) * 100}%`,
                                  top: `${(-cropData.croppedAreaPixels.y / cropData.croppedAreaPixels.height) * 100}%`,
                                  maxWidth: "none",
                                }}
                              />
                            </div>
                          );
                        }
                        return (
                          <ServerImage
                            image={imageObj}
                            alt={imageObj?.altText || `${activeSeries?.title} - Image ${originalIdx + 1}`}
                            size="medium"
                            fill
                            className="w-full h-full object-cover"
                            objectPosition={getObjectPosition(imageObj)}
                          />
                        );
                      })()}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ===== 移动端布局 (<lg) ===== */}
          <div className="lg:hidden">
            {/* 标题 */}
            <h2 className="text-2xl md:text-3xl font-anaheim font-extrabold mb-4" style={{ color: '#FFFAD3' }}>
              Product Series Introduction
            </h2>

            {/* 当前系列名称 */}
            <div className="mb-4">
              <span className="text-lg font-anaheim font-bold text-brand-cream">
                {activeSeries?.title}
              </span>
            </div>

            {/* 图片轮播 */}
            <div
              className="overflow-hidden rounded-xl mb-4 cursor-grab active:cursor-grabbing select-none"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div
                className={cn(
                  "flex gap-3 transition-transform",
                  isDragging ? "duration-0" : "duration-500 ease-out"
                )}
                style={{
                  transform: `translateX(calc(-${activeImageIndex * 88}% + ${dragOffset}px))`,
                }}
              >
                {currentImages.map((imageObj, idx) => (
                  <div
                    key={`${activeSeries?.title}-mobile-img-${idx}`}
                    className="flex-shrink-0 w-[85%] aspect-[16/9] relative rounded-xl overflow-hidden"
                  >
                    {(() => {
                      const cropData = activeSeries.imageCropDataList?.[idx];
                      const cropStyles = getCropStyles(cropData);
                      if (cropStyles && cropData && cropData.croppedAreaPixels) {
                        return (
                          <div
                            className="absolute inset-0 w-full h-full"
                            style={{
                              ...cropStyles.container,
                              width: "100%",
                              height: "100%",
                            }}
                          >
                            <img
                              src={getCropImageUrl(imageObj, cropData)}
                              alt={imageObj?.altText || `${activeSeries?.title} - Image ${idx + 1}`}
                              style={{
                                ...cropStyles.image,
                                width: `${(cropData.variantWidth / cropData.croppedAreaPixels.width) * 100}%`,
                                height: `${(cropData.variantHeight / cropData.croppedAreaPixels.height) * 100}%`,
                                left: `${(-cropData.croppedAreaPixels.x / cropData.croppedAreaPixels.width) * 100}%`,
                                top: `${(-cropData.croppedAreaPixels.y / cropData.croppedAreaPixels.height) * 100}%`,
                                maxWidth: "none",
                              }}
                            />
                          </div>
                        );
                      }
                      return (
                        <ServerImage
                          image={imageObj}
                          alt={imageObj?.altText || `${activeSeries?.title} - Image ${idx + 1}`}
                          size="medium"
                          fill
                          className="w-full h-full object-cover"
                          objectPosition={getObjectPosition(imageObj)}
                        />
                      );
                    })()}
                  </div>
                ))}
              </div>
            </div>

            {/* 图片指示器 */}
            {totalImages > 1 && (
              <div className="flex justify-center gap-2 mb-4">
                {currentImages.map((_, idx) => (
                  <button
                    key={idx}
                    className={cn(
                      "w-2 h-2 rounded-full transition-colors",
                      idx === activeImageIndex ? "bg-brand-cream" : "bg-brand-cream/30"
                    )}
                    onClick={() => setActiveImageIndex(idx)}
                  />
                ))}
              </div>
            )}

            {/* 描述 */}
            <p className="text-sm text-white leading-relaxed mb-6">
              {activeSeries?.description}
            </p>

            {/* 系列切换按钮 */}
            <div className="flex justify-center gap-6">
              <button
                onClick={handleSeriesPrev}
                className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center"
                aria-label="Previous series"
              >
                <svg className="w-5 h-5 text-brand-cream" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={handleSeriesNext}
                className="w-12 h-12 rounded-full bg-white flex items-center justify-center"
                aria-label="Next series"
              >
                <svg className="w-5 h-5 text-brand-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* 系列指示器 */}
            <div className="flex justify-center gap-1.5 mt-4">
              {seriesData.map((_, idx) => (
                <button
                  key={idx}
                  className={cn(
                    "w-1.5 h-1.5 rounded-full transition-colors",
                    idx === activeSeriesIndex ? "bg-brand-cream" : "bg-brand-cream/30"
                  )}
                  onClick={() => {
                    setActiveSeriesIndex(idx);
                    setActiveImageIndex(0);
                  }}
                />
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
