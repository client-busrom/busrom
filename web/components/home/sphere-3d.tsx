// @ts-nocheck
"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";

// Dynamic import Globe component
const Globe = dynamic(
  () => import("react-globe.gl").then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-cyan-400 text-sm">Loading Globe...</div>
      </div>
    )
  }
);

// --- 多语言地点配置 ---
interface LocationData {
  id: string;
  lat: number;
  lng: number;
  name: {
    en: string;
    zh: string;
    ar: string;
  };
  isOrigin?: boolean;
}

// 出发地：广东
const ORIGIN: LocationData = {
  id: "guangdong",
  lat: 23.1291,
  lng: 113.2644,
  name: {
    en: "Guangdong, China",
    zh: "中国广东",
    ar: "قوانغدونغ، الصين",
  },
  isOrigin: true,
};

// 目的地列表
const DESTINATIONS: LocationData[] = [
  {
    id: "new-york",
    lat: 40.7128,
    lng: -74.006,
    name: { en: "New York, USA", zh: "美国纽约", ar: "نيويورك، الولايات المتحدة" },
  },
  {
    id: "los-angeles",
    lat: 34.0522,
    lng: -118.2437,
    name: { en: "Los Angeles, USA", zh: "美国洛杉矶", ar: "لوس أنجلوس، الولايات المتحدة" },
  },
  {
    id: "chicago",
    lat: 41.8781,
    lng: -87.6298,
    name: { en: "Chicago, USA", zh: "美国芝加哥", ar: "شيكاغو، الولايات المتحدة" },
  },
  {
    id: "toronto",
    lat: 43.6532,
    lng: -79.3832,
    name: { en: "Toronto, Canada", zh: "加拿大多伦多", ar: "تورنتو، كندا" },
  },
  {
    id: "vancouver",
    lat: 49.2827,
    lng: -123.1207,
    name: { en: "Vancouver, Canada", zh: "加拿大温哥华", ar: "فانكوفر، كندا" },
  },
  {
    id: "dubai",
    lat: 25.2048,
    lng: 55.2708,
    name: { en: "Dubai, UAE", zh: "阿联酋迪拜", ar: "دبي، الإمارات" },
  },
  {
    id: "riyadh",
    lat: 24.7136,
    lng: 46.6753,
    name: { en: "Riyadh, Saudi Arabia", zh: "沙特利雅得", ar: "الرياض، السعودية" },
  },
  {
    id: "doha",
    lat: 25.2854,
    lng: 51.531,
    name: { en: "Doha, Qatar", zh: "卡塔尔多哈", ar: "الدوحة، قطر" },
  },
];

// --- 样式配置 ---
const CONFIG = {
  arc: {
    color: ["#00FFFF", "#0096FF"],
    strokeWidth: 0.8,
    dashLength: 0.3,
    dashGap: 0.15,
    dashAnimateTime: 1500,
    altitude: 0.25,
  },
  point: {
    color: "#00FFFF",
    radius: 0.6,
    originRadius: 1.0,
    originColor: "#00FF88",
    // 交互区域比显示半径更大
    hitRadius: 1.5,
    originHitRadius: 2.0,
  },
  globe: {
    imageUrl: "//unpkg.com/three-globe/example/img/earth-night.jpg",
    atmosphereColor: "#00C8FF",
    atmosphereAltitude: 0.2,
  },
  initialView: { lat: 23.1291, lng: 113.2644, altitude: 2.5 },
  minAltitude: 1.5,
  maxAltitude: 4,
};

// Props 类型
interface Sphere3DProps {
  locale?: string;
}

// 计算 zoomLevel (0-1), 1 = 最近, 0 = 最远
const altitudeToZoom = (alt: number) => {
  return 1 - (alt - CONFIG.minAltitude) / (CONFIG.maxAltitude - CONFIG.minAltitude);
};

export default function Sphere3D({ locale = "en" }: Sphere3DProps) {
  const globeRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(altitudeToZoom(CONFIG.initialView.altitude));
  const [isGlobeReady, setIsGlobeReady] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<string | null>(null);
  const [isInteractive, setIsInteractive] = useState(false);
  const [isVisible, setIsVisible] = useState(false); // 是否在视口内

  // 根据 locale 获取地名
  const getLocalizedName = useCallback((location: LocationData) => {
    const lang = locale as keyof typeof location.name;
    return location.name[lang] || location.name.en;
  }, [locale]);

  // 生成弧线数据 (从广东到各目的地)
  const arcsData = useMemo(() => {
    return DESTINATIONS.map((dest) => ({
      startLat: ORIGIN.lat,
      startLng: ORIGIN.lng,
      endLat: dest.lat,
      endLng: dest.lng,
    }));
  }, []);

  // 生成点数据 (包含地名，用于悬停显示)
  const pointsData = useMemo(() => {
    return [
      { ...ORIGIN, label: getLocalizedName(ORIGIN) },
      ...DESTINATIONS.map((d) => ({ ...d, label: getLocalizedName(d) })),
    ];
  }, [getLocalizedName]);

  // 监听窗口大小
  useEffect(() => {
    const update = () => {
      setIsMobile(window.innerWidth < 1024);
      if (containerRef.current) {
        setSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // 监听是否在视口内，不在视口时暂停渲染以省电
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

  // 当不在视口内时暂停自转
  useEffect(() => {
    if (!isGlobeReady || !globeRef.current) return;
    const controls = globeRef.current.controls();
    if (controls) {
      controls.autoRotate = isVisible;
    }
  }, [isVisible, isGlobeReady]);

  // 当 globe 准备好时的回调
  const handleGlobeReady = useCallback(() => {
    console.log("Globe is ready!");
    setIsGlobeReady(true);

    const globe = globeRef.current;
    if (!globe) return;

    // 设置初始视角
    globe.pointOfView(CONFIG.initialView, 0);

    // 配置 OrbitControls
    const controls = globe.controls();
    if (controls) {
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.5;
      // 桌面端禁用滚轮缩放（避免与 Lenis 冲突），移动端启用手势缩放
      controls.enableZoom = isMobile;
      // 限制缩放范围
      controls.minDistance = 120;
      controls.maxDistance = 350;
    }
  }, [isMobile]);

  // 更新 controls 交互状态
  useEffect(() => {
    if (!isGlobeReady || !globeRef.current) return;
    const controls = globeRef.current.controls();
    if (controls) {
      if (isMobile) {
        // 移动端：只有进入交互模式才能操作
        controls.enableZoom = isInteractive;
        controls.enableRotate = isInteractive;
        controls.enablePan = isInteractive;
      } else {
        // 桌面端：始终可以拖拽，但禁用滚轮缩放
        controls.enableZoom = false;
        controls.enableRotate = true;
        controls.enablePan = false;
      }
    }
  }, [isMobile, isGlobeReady, isInteractive]);

  const handleZoom = useCallback((delta: number) => {
    if (!globeRef.current) return;
    const pov = globeRef.current.pointOfView();
    const newAlt = Math.max(CONFIG.minAltitude, Math.min(CONFIG.maxAltitude, pov.altitude + delta));
    globeRef.current.pointOfView({ ...pov, altitude: newAlt }, 300);
    setZoomLevel(altitudeToZoom(newAlt));
  }, []);

  const handleReset = useCallback(() => {
    if (!globeRef.current) return;
    globeRef.current.pointOfView(CONFIG.initialView, 1000);
    setZoomLevel(altitudeToZoom(CONFIG.initialView.altitude));
  }, []);

  // 点击点时切换固定显示
  const handlePointClick = useCallback((point: any) => {
    if (!isInteractive && isMobile) return; // 移动端未进入交互模式时不响应
    setSelectedPoint((prev) => (prev === point.id ? null : point.id));
  }, [isInteractive, isMobile]);

  // 进入/退出交互模式
  const enterInteractiveMode = useCallback(() => {
    setIsInteractive(true);
    // 停止 Lenis 滚动
    if (typeof window !== "undefined" && (window as any).lenis) {
      (window as any).lenis.stop();
    }
  }, []);

  const exitInteractiveMode = useCallback(() => {
    setIsInteractive(false);
    setSelectedPoint(null);
    // 恢复 Lenis 滚动
    if (typeof window !== "undefined" && (window as any).lenis) {
      (window as any).lenis.start();
    }
  }, []);

  // 阻止触摸事件冒泡（交互模式下）
  useEffect(() => {
    if (!isMobile) return;

    const container = containerRef.current;
    if (!container) return;

    const preventScroll = (e: TouchEvent) => {
      if (isInteractive) {
        e.stopPropagation();
      }
    };

    container.addEventListener("touchstart", preventScroll, { passive: false });
    container.addEventListener("touchmove", preventScroll, { passive: false });

    return () => {
      container.removeEventListener("touchstart", preventScroll);
      container.removeEventListener("touchmove", preventScroll);
    };
  }, [isMobile, isInteractive]);

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden"
      data-header-theme="transparent"
      style={{ height: "100vh", minHeight: "600px", background: "radial-gradient(ellipse at center, #0a1628 0%, #020408 100%)" }}
    >
      <div ref={containerRef} className="absolute inset-0">
        {/* Loading 状态 */}
        {(size.width === 0 || size.height === 0 || !isGlobeReady) && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
              <div className="text-cyan-400 text-sm">Loading Globe...</div>
            </div>
          </div>
        )}
        {size.width > 0 && size.height > 0 && (
          <Globe
            ref={globeRef}
            width={size.width}
            height={size.height}
            globeImageUrl={CONFIG.globe.imageUrl}
            atmosphereColor={CONFIG.globe.atmosphereColor}
            atmosphereAltitude={CONFIG.globe.atmosphereAltitude}
            backgroundColor="rgba(0,0,0,0)"
            onGlobeReady={handleGlobeReady}
            // 弧线配置
            arcsData={arcsData}
            arcStartLat="startLat"
            arcStartLng="startLng"
            arcEndLat="endLat"
            arcEndLng="endLng"
            arcColor={() => CONFIG.arc.color}
            arcStroke={CONFIG.arc.strokeWidth}
            arcDashLength={CONFIG.arc.dashLength}
            arcDashGap={CONFIG.arc.dashGap}
            arcDashAnimateTime={CONFIG.arc.dashAnimateTime}
            arcAltitude={CONFIG.arc.altitude}
            // 点配置 (悬停显示地名)
            pointsData={pointsData}
            pointLat="lat"
            pointLng="lng"
            pointColor={(d: any) => d.isOrigin ? CONFIG.point.originColor : CONFIG.point.color}
            pointRadius={(d: any) => d.isOrigin ? CONFIG.point.originRadius : CONFIG.point.radius}
            pointAltitude={0.01}
            pointResolution={12}
            // 悬停显示地名 tooltip
            pointLabel={(d: any) => `<div class="globe-label">${d.label}</div>`}
            onPointClick={handlePointClick}
            // 光环层 - 扩大交互区域 + 视觉效果
            ringsData={pointsData}
            ringLat="lat"
            ringLng="lng"
            ringColor={(d: any) => d.isOrigin ? "rgba(0, 255, 136, 0.3)" : "rgba(0, 255, 255, 0.3)"}
            ringMaxRadius={(d: any) => d.isOrigin ? 3 : 2.5}
            ringPropagationSpeed={1}
            ringRepeatPeriod={2000}
            onRingClick={handlePointClick}
            ringLabel={(d: any) => `<div class="globe-label">${d.label}</div>`}
            // HTML elements 层 - 用于固定显示选中的标签
            htmlElementsData={pointsData.filter((d) => d.id === selectedPoint)}
            htmlLat="lat"
            htmlLng="lng"
            htmlAltitude={0.02}
            htmlElement={(d: any) => {
              const el = document.createElement("div");
              el.className = "globe-label globe-label-fixed";
              el.innerHTML = d.label;
              el.onclick = () => setSelectedPoint(null);
              return el;
            }}
            enablePointerInteraction={true}
          />
        )}
      </div>

      {/* 桌面端控件 */}
      {!isMobile && (
        <div className="absolute right-8 top-1/2 -translate-y-1/2 z-10">
          <div className="flex flex-col items-center gap-3 p-3 bg-cyan-950/60 backdrop-blur-md border border-cyan-500/20 rounded-lg">
            <button
              onClick={() => handleZoom(-0.3)}
              className="w-10 h-10 border border-cyan-500/40 hover:border-cyan-400 rounded flex items-center justify-center text-cyan-400 hover:bg-cyan-900/30 transition-all"
            >
              +
            </button>

            <div className="w-[2px] h-16 bg-cyan-500/30 rounded-full relative">
              <div
                className="absolute left-1/2 -translate-x-1/2 w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(0,255,255,0.8)] transition-all"
                style={{ top: `${(1 - zoomLevel) * 100}%`, transform: 'translate(-50%, -50%)' }}
              />
            </div>

            <button
              onClick={() => handleZoom(0.3)}
              className="w-10 h-10 border border-cyan-500/40 hover:border-cyan-400 rounded flex items-center justify-center text-cyan-400 hover:bg-cyan-900/30 transition-all"
            >
              −
            </button>

            <div className="w-6 h-px bg-cyan-500/30" />

            <button
              onClick={handleReset}
              className="w-10 h-10 border border-cyan-500/40 hover:border-cyan-400 rounded flex items-center justify-center text-cyan-400 hover:bg-cyan-900/30 transition-all text-sm"
            >
              ↺
            </button>
          </div>
        </div>
      )}

      {/* 移动端交互控制 */}
      {isMobile && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-3">
          {!isInteractive ? (
            <button
              onClick={enterInteractiveMode}
              className="px-6 py-3 bg-cyan-950/80 backdrop-blur-md border border-cyan-500/40 rounded-full text-cyan-400 text-sm font-medium flex items-center gap-2 active:scale-95 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
              Explore Globe
            </button>
          ) : (
            <>
              <div className="text-cyan-400/60 text-xs uppercase tracking-wider">
                Pinch to zoom • Drag to rotate
              </div>
              <button
                onClick={exitInteractiveMode}
                className="px-6 py-3 bg-cyan-950/80 backdrop-blur-md border border-cyan-500/40 rounded-full text-cyan-400 text-sm font-medium flex items-center gap-2 active:scale-95 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Exit Explore
              </button>
            </>
          )}
        </div>
      )}

      {/* 标题 */}
      <div className="absolute top-24 md:top-32 left-1/2 -translate-x-1/2 text-center z-10 pointer-events-none">
        <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-2">
          GLOBAL NETWORK
        </h2>
        <p className="text-cyan-300/60 text-sm md:text-base uppercase">
          Serving customers worldwide from Guangdong, China
        </p>
      </div>
    </section>
  );
}
