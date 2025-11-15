"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { HomeContent } from "@/lib/content-data";
import { cn } from "@/lib/utils";
import Image from "next/image";

type Props = {
  data: HomeContent["seriesIntro"];
};

// --- 常量定义 ---
const SERIES_AUTO_SCROLL_INTERVAL = 30000; // 系列轮播: 30秒
const IMAGE_AUTO_SCROLL_INTERVAL = 3000;   // 图片轮播: 3秒
const VISIBLE_WINDOW_SIZE = 7;

// 卡片轮播所需的计算常量
const VISIBLE_CARDS_IN_ROW = 1.2;
const CARD_ASPECT_RATIO = 5 / 3;
const CARD_GUTTER = 16;

export default function SeriesIntro({ data }: Props) {
  const seriesData = data || [];
  const totalSeries = seriesData.length;

  // 系列轮播索引 (30s切换)
  const [activeSeriesIndex, setActiveSeriesIndex] = useState(0);
  // 当前系列的图片轮播索引 (3s切换)
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const seriesIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const imageIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 当前激活的系列
  const activeSeries = seriesData[activeSeriesIndex];
  const currentImages = activeSeries?.images || [];
  const totalImages = currentImages.length;

  // 卡片尺寸状态
  const [cardDimensions, setCardDimensions] = useState({
    width: 0,
    height: 0,
    minHeight: 400,
    isInitialized: false,
  });

  const carouselContainerRef = useRef<HTMLDivElement | null>(null);

  const VISIBLE_ITEMS_CENTER_OFFSET = Math.floor(VISIBLE_WINDOW_SIZE / 2);

  // --- 系列轮播控制 ---
  const handleSeriesNext = useCallback(() => {
    setActiveSeriesIndex((prevIndex) => (prevIndex + 1) % totalSeries);
    setActiveImageIndex(0); // 切换系列时重置图片索引
  }, [totalSeries]);

  const handleSeriesPrev = useCallback(() => {
    setActiveSeriesIndex((prevIndex) => (prevIndex - 1 + totalSeries) % totalSeries);
    setActiveImageIndex(0); // 切换系列时重置图片索引
  }, [totalSeries]);

  // --- 图片轮播控制 ---
  const handleImageNext = useCallback(() => {
    if (totalImages > 0) {
      setActiveImageIndex((prevIndex) => (prevIndex + 1) % totalImages);
    }
  }, [totalImages]);

  // --- 系列自动轮播 (30秒) ---
  useEffect(() => {
    const startInterval = () => {
      seriesIntervalRef.current = setInterval(handleSeriesNext, SERIES_AUTO_SCROLL_INTERVAL);
    };
    const stopInterval = () => {
      if (seriesIntervalRef.current) {
        clearInterval(seriesIntervalRef.current);
      }
    };
    startInterval();
    return () => stopInterval();
  }, [handleSeriesNext]);

  // --- 图片自动轮播 (3秒) ---
  useEffect(() => {
    if (totalImages <= 1) return; // 如果只有一张图片,不需要轮播

    const startInterval = () => {
      imageIntervalRef.current = setInterval(handleImageNext, IMAGE_AUTO_SCROLL_INTERVAL);
    };
    const stopInterval = () => {
      if (imageIntervalRef.current) {
        clearInterval(imageIntervalRef.current);
      }
    };
    startInterval();
    return () => stopInterval();
  }, [handleImageNext, totalImages]);

  // 尺寸计算逻辑
  const calculateCardDimensions = useCallback(() => {
    if (carouselContainerRef.current) {
      const containerWidth = carouselContainerRef.current.clientWidth;
      const newCardWidth = containerWidth / VISIBLE_CARDS_IN_ROW;
      const newCardHeight = newCardWidth / CARD_ASPECT_RATIO;

      setCardDimensions({
        width: newCardWidth,
        height: newCardHeight,
        minHeight: cardDimensions.minHeight,
        isInitialized: true,
      });
    }
  }, [cardDimensions.minHeight]);

  // 监听窗口尺寸变化
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      calculateCardDimensions();
    }, 50);

    window.addEventListener("resize", calculateCardDimensions);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", calculateCardDimensions);
    };
  }, [calculateCardDimensions]);

  // 竖形列表透明度计算
  const getOpacity = (distance: number) => {
    const opacity = 1.0 - distance * 0.2;
    return Math.max(0, opacity);
  };

  // 准备固定窗口的渲染数据
  const getRenderWindow = () => {
    const window: {
      title: string;
      description: string;
      distanceFromCenter: number;
      isCurrent: boolean;
    }[] = [];

    const startIndex = activeSeriesIndex - VISIBLE_ITEMS_CENTER_OFFSET;

    for (let i = 0; i < VISIBLE_WINDOW_SIZE; i++) {
      let currentIndex = startIndex + i;
      const dataIndex = ((currentIndex % totalSeries) + totalSeries) % totalSeries;

      const item = seriesData[dataIndex];
      if (item) {
        window.push({
          ...item,
          distanceFromCenter: Math.abs(i - VISIBLE_ITEMS_CENTER_OFFSET),
          isCurrent: dataIndex === activeSeriesIndex,
        });
      }
    }
    return window;
  };

  const renderWindow = getRenderWindow();

  // 使用动态计算的尺寸
  const currentCardWidth = cardDimensions.width || 0;
  const currentCardHeight = cardDimensions.height || cardDimensions.minHeight;
  const containerTotalWidth = totalImages * currentCardWidth;

  // 控制按钮
  const ControlButtons = (
    <div className="flex flex-row space-x-16 justify-center w-full mt-2">
      <button
        onClick={handleSeriesPrev}
        className="text-brand-cream/80 hover:text-brand-cream transition"
        aria-label="Previous series"
      >
        <img
          src="/btnLeft1.svg"
          alt="Previous"
          className="w-10 h-10 md:w-16 md:h-16 transition-opacity group-hover:opacity-80"
        />
      </button>

      <button
        onClick={handleSeriesNext}
        className="text-brand-cream/80 hover:text-brand-cream transition"
        aria-label="Next series"
      >
        <img
          src="/btnRight1.svg"
          alt="Next"
          className="w-10 h-10 md:w-16 md:h-16 transition-opacity group-hover:opacity-80"
        />
      </button>
    </div>
  );

  return (
    <section className="py-8 bg-brand-main" data-header-theme="transparent">
      <div className="container mx-auto p-6 md:p-8 lg:p-10 bg-brand-secondary rounded-xl border border-brand-cream">
        {/* --- 上半部分：文字/导航 --- */}
        <div className="flex flex-col md:flex-row gap-8 md:gap-16">
          {/* 左侧：介绍文本 */}
          <div className="w-full md:w-2/3 text-brand-cream space-y-4 md:h-[16rem] md:flex md:flex-col">
            <p className="text-xs text-brand-cream-dark font-anaheim font-medium">
              Product Series Introduction copy Product Series Introduction
            </p>
            <h3 className="text-3xl md:text-4xl font-anaheim font-extrabold">
              Product Series Introduction
            </h3>
            {activeSeries && (
              <p className="text-md font-light text-brand-text-inverse">
                {activeSeries.description}
              </p>
            )}
          </div>

          {/* 右侧：竖形系列导航 */}
          <div className="w-full md:w-1/3 h-[12rem] md:h-[16rem] overflow-hidden relative">
            <div className="flex flex-col absolute w-full top-1/2 left-0 -translate-y-1/2">
              {renderWindow.map((item) => (
                <button
                  key={item.title}
                  className="w-full text-left py-2 transition-opacity duration-500 h-8 md:h-12 flex items-center"
                  style={{ opacity: getOpacity(item.distanceFromCenter) }}
                  onClick={() => {
                    const newIndex = seriesData.findIndex((s) => s.title === item.title);
                    setActiveSeriesIndex(newIndex);
                    setActiveImageIndex(0); // 重置图片索引
                  }}
                >
                  <span
                    className={cn(
                      "text-sm md:text-md font-bold transition-colors duration-500",
                      item.isCurrent
                        ? "text-brand-cream"
                        : "text-brand-cream/80 hover:text-brand-cream"
                    )}
                  >
                    {item.title}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* --- 下半部分：图片轮播 + 标题 + 按钮 --- */}
        <div className="flex flex-col mt-2 md:mt-16">
          <div
            className="flex md:flex-row items-center relative"
            style={{ minHeight: `${currentCardHeight}px` }}
          >
            {/* 1. 左侧：旋转标题容器 (桌面端) */}
            <div
              className={cn(
                "flex-shrink-0 relative h-full",
                "hidden md:flex md:w-1/3 md:flex-col md:justify-start md:items-end",
                "w-full bottom-[50px] right-[-100px]"
              )}
            >
              <div className="absolute right-[100px] bottom-4 -translate-y-1 transform -rotate-90 origin-right z-10 pl-8">
                <span className="text-xl font-anaheim font-regular text-brand-cream whitespace-nowrap">
                  {activeSeries ? activeSeries.title : "Series Title"}
                </span>
              </div>
            </div>

            {/* 2. 右侧：图片轮播容器 */}
            <div
              ref={carouselContainerRef}
              className={cn("w-full md:w-2/3 md:ml-4 overflow-hidden")}
              style={{ minHeight: `${currentCardHeight}px` }}
            >
              <div
                className="flex transition-transform duration-500 ease-in-out h-full"
                style={{
                  width: `${containerTotalWidth + totalImages * CARD_GUTTER}px`,
                  transform: `translateX(-${activeImageIndex * (currentCardWidth + CARD_GUTTER) + CARD_GUTTER}px)`,
                }}
              >
                {currentImages.map((imageObj, idx) => (
                  <div
                    key={`${activeSeries?.title}-${idx}`}
                    className="flex-shrink-0 relative h-full ml-4"
                    style={{
                      width: `${currentCardWidth}px`,
                      maxHeight: `${currentCardHeight}px`,
                    }}
                  >
                    <div
                      className="shadow-xl relative"
                      style={{
                        height: `${currentCardHeight}px`,
                        width: `${currentCardWidth}px`,
                      }}
                    >
                      <Image
                        src={imageObj?.url || "/placeholder.jpg"}
                        alt={imageObj?.altText || activeSeries?.title || "Series image"}
                        fill
                        className="rounded-lg object-cover"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* --- 3. 移动端标题 --- */}
          <div className="mt-2 text-center md:hidden">
            <span className="text-2xl font-anaheim font-extrabold text-brand-cream">
              {activeSeries ? activeSeries.title : "Series Title"}
            </span>
          </div>

          {/* --- 4. 系列切换按钮 --- */}
          {ControlButtons}
        </div>
      </div>
    </section>
  );
}
