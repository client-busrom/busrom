"use client";

// 假设 HomeContent["oemOdm"] 的类型现在是这样
import type { HomeContent } from "@/lib/content-data";
import Image from "next/image";

type Props = {
  data: HomeContent["oemOdm"]; // 旧类型
};

export default function OemOdm({ data }: Props) {
  const { oem: OEM, odm: ODM } = data;

  // --- 定义 clip-path 变量 ---
  // polygon(左上, 右上, 右下, 左下)
  // 左图: 从 (0,0) 到 (顶部65%, 0), 到 (底部35%, 100%), 到 (0, 100%)
  const clipPathLeft = "polygon(0% 0%, 58% 0%, 40% 100%, 0% 100%)";
  // 右图: 从 (顶部65%, 0) 到 (100%, 0), 到 (100%, 100%), 到 (底部35%, 100%)
  const clipPathRight = "polygon(58% 0%, 100% 0%, 100% 100%, 40% 100%)";

  return (
    <section className="relative bg-brand-main text-white overflow-hidden min-h-screen flex items-center" data-header-theme="light">
      {/* --- 1. 底层: 背景图片 --- */}

      {/* OEM 背景 (左侧 60%) */}
      {/* 【已修改】添加 w-[60%] 和 clip-path */}
      <div className="absolute inset-y-0 left-0 w-[100%] z-0" style={{ clipPath: clipPathLeft }}>
        <Image
          src={OEM.bgImage.url}
          alt={OEM.bgImage.altText || "OEM Background"}
          fill
          sizes="60vw" // 调整 sizes
          className="object-cover"
        />
        {/* 黑色遮罩层 */}
        <div className="absolute inset-0 bg-black/50 z-1"></div>
      </div>

      {/* ODM 背景 (右侧 60%) */}
      {/* 【已修改】添加 w-[60%] 和 clip-path */}
      <div
        className="absolute inset-y-0 right-0 w-[100%] z-10" // z-10 确保它在视觉上覆盖左侧的重叠部分
        style={{ clipPath: clipPathRight }}
      >
        <Image
          src={ODM.bgImage.url}
          alt={ODM.bgImage.altText || "ODM Background"}
          fill
          sizes="60vw" // 调整 sizes
          className="object-cover"
        />
        {/* 黑色遮罩层 */}
        <div className="absolute inset-0 bg-black/50 z-1"></div>
      </div>

      <Image src="/BusromLightning.svg" alt="Background Split" fill className="hidden md:block object-cover z-20 pointer-events-none" />

      {/* --- 3. 顶层: 内容网格 --- */}
      <div className="relative z-30 container mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 lg:gap-24 items-stretch p-8 md:p-12 lg:p-16">
        {/* Left Column: OEM Content */}
        <div className="flex flex-col w-[60%] h-[600px]">
          <h2 className="text-right text-6xl md:text-8xl font-extrabold font-anaheim mb-6">{OEM.title}</h2>
          <div className="space-y-4 text-right md:text-xs flex-grow">
            {OEM.description.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
          {/* Image Container */}
          <div className="relative mt-24 w-full aspect-video aspect-[4/3] rounded-2xl mt-auto overflow-hidden border-[7px] border-[#FFFAD3]">
            {" "}
            {/* Added overflow-hidden */}
            <Image src={OEM.image.url} alt={OEM.image.altText || OEM.title} fill sizes="(max-width: 768px) 90vw, 40vw" className="object-cover" />
          </div>
        </div>

        {/* Right Column: ODM Content */}
        <div className="flex flex-col w-[60%] h-full justify-self-end">
          {/* Image Container */}
          <div className="relative w-full aspect-video aspect-[4/3] rounded-2xl mb-24 overflow-hidden border-[7px] border-[#FFFAD3]">
            <Image src={ODM.image.url} alt={ODM.image.altText || ODM.title} fill sizes="(max-width: 768px) 90vw, 40vw" className="object-cover" />
          </div>
          <h2 className="text-6xl md:text-8xl font-extrabold font-anaheim mb-6">{ODM.title}</h2>
          <div className="space-y-4 text-base md:text-sm flex-grow">
            {ODM.description.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
