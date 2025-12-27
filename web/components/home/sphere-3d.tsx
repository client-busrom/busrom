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

// 目的地列表 - 全球主要市场
const DESTINATIONS: LocationData[] = [
  // ========== 北美 ==========
  // United States - 热门城市
  { id: "new-york", lat: 40.7128, lng: -74.006, name: { en: "New York, USA", zh: "美国纽约", ar: "نيويورك، أمريكا" } },
  { id: "los-angeles", lat: 34.0522, lng: -118.2437, name: { en: "Los Angeles, USA", zh: "美国洛杉矶", ar: "لوس أنجلوس، أمريكا" } },
  { id: "chicago", lat: 41.8781, lng: -87.6298, name: { en: "Chicago, USA", zh: "美国芝加哥", ar: "شيكاغو، أمريكا" } },
  { id: "miami", lat: 25.7617, lng: -80.1918, name: { en: "Miami, USA", zh: "美国迈阿密", ar: "ميامي، أمريكا" } },
  { id: "houston", lat: 29.7604, lng: -95.3698, name: { en: "Houston, USA", zh: "美国休斯顿", ar: "هيوستن، أمريكا" } },
  // Canada - 热门城市
  { id: "toronto", lat: 43.6532, lng: -79.3832, name: { en: "Toronto, Canada", zh: "加拿大多伦多", ar: "تورنتو، كندا" } },
  { id: "vancouver", lat: 49.2827, lng: -123.1207, name: { en: "Vancouver, Canada", zh: "加拿大温哥华", ar: "فانكوفر، كندا" } },

  // ========== 南美 ==========
  { id: "mexico-city", lat: 19.4326, lng: -99.1332, name: { en: "Mexico City, Mexico", zh: "墨西哥城", ar: "مكسيكو سيتي، المكسيك" } },
  { id: "brasilia", lat: -15.7975, lng: -47.8919, name: { en: "Brasília, Brazil", zh: "巴西利亚", ar: "برازيليا، البرازيل" } },
  { id: "bogota", lat: 4.711, lng: -74.0721, name: { en: "Bogotá, Colombia", zh: "波哥大", ar: "بوغوتا، كولومبيا" } },
  { id: "georgetown", lat: 6.8013, lng: -58.1551, name: { en: "Georgetown, Guyana", zh: "乔治敦", ar: "جورج تاون، غيانا" } },
  { id: "nassau", lat: 25.0343, lng: -77.3963, name: { en: "Nassau, Bahamas", zh: "拿骚", ar: "ناسو، جزر البهاما" } },
  { id: "panama-city", lat: 8.9824, lng: -79.5199, name: { en: "Panama City, Panama", zh: "巴拿马城", ar: "بنما سيتي، بنما" } },
  { id: "montevideo", lat: -34.9011, lng: -56.1645, name: { en: "Montevideo, Uruguay", zh: "蒙得维的亚", ar: "مونتيفيديو، أوروغواي" } },
  { id: "santiago", lat: -33.4489, lng: -70.6693, name: { en: "Santiago, Chile", zh: "圣地亚哥", ar: "سانتياغو، تشيلي" } },
  { id: "san-jose", lat: 9.9281, lng: -84.0907, name: { en: "San José, Costa Rica", zh: "圣何塞", ar: "سان خوسيه، كوستاريكا" } },
  { id: "buenos-aires", lat: -34.6037, lng: -58.3816, name: { en: "Buenos Aires, Argentina", zh: "布宜诺斯艾利斯", ar: "بوينس آيرس، الأرجنتين" } },
  { id: "santo-domingo", lat: 18.4861, lng: -69.9312, name: { en: "Santo Domingo, Dominican Republic", zh: "圣多明各", ar: "سانتو دومينغو، جمهورية الدومينيكان" } },
  { id: "port-of-spain", lat: 10.6596, lng: -61.5086, name: { en: "Port of Spain, Trinidad", zh: "西班牙港", ar: "بورت أوف سبين، ترينيداد" } },

  // ========== 欧洲 ==========
  { id: "vienna", lat: 48.2082, lng: 16.3738, name: { en: "Vienna, Austria", zh: "维也纳", ar: "فيينا، النمسا" } },
  { id: "brussels", lat: 50.8503, lng: 4.3517, name: { en: "Brussels, Belgium", zh: "布鲁塞尔", ar: "بروكسل، بلجيكا" } },
  { id: "prague", lat: 50.0755, lng: 14.4378, name: { en: "Prague, Czech Republic", zh: "布拉格", ar: "براغ، التشيك" } },
  { id: "copenhagen", lat: 55.6761, lng: 12.5683, name: { en: "Copenhagen, Denmark", zh: "哥本哈根", ar: "كوبنهاغن، الدنمارك" } },
  { id: "berlin", lat: 52.52, lng: 13.405, name: { en: "Berlin, Germany", zh: "柏林", ar: "برلين، ألمانيا" } },
  { id: "budapest", lat: 47.4979, lng: 19.0402, name: { en: "Budapest, Hungary", zh: "布达佩斯", ar: "بودابست، المجر" } },
  { id: "dublin", lat: 53.3498, lng: -6.2603, name: { en: "Dublin, Ireland", zh: "都柏林", ar: "دبلن، أيرلندا" } },
  { id: "reykjavik", lat: 64.1466, lng: -21.9426, name: { en: "Reykjavik, Iceland", zh: "雷克雅未克", ar: "ريكيافيك، آيسلندا" } },
  { id: "rome", lat: 41.9028, lng: 12.4964, name: { en: "Rome, Italy", zh: "罗马", ar: "روما، إيطاليا" } },
  { id: "luxembourg", lat: 49.6116, lng: 6.1319, name: { en: "Luxembourg", zh: "卢森堡", ar: "لوكسمبورغ" } },
  { id: "amsterdam", lat: 52.3676, lng: 4.9041, name: { en: "Amsterdam, Netherlands", zh: "阿姆斯特丹", ar: "أمستردام، هولندا" } },
  { id: "oslo", lat: 59.9139, lng: 10.7522, name: { en: "Oslo, Norway", zh: "奥斯陆", ar: "أوسلو، النرويج" } },
  { id: "warsaw", lat: 52.2297, lng: 21.0122, name: { en: "Warsaw, Poland", zh: "华沙", ar: "وارسو، بولندا" } },
  { id: "bratislava", lat: 48.1486, lng: 17.1077, name: { en: "Bratislava, Slovakia", zh: "布拉迪斯拉发", ar: "براتيسلافا، سلوفاكيا" } },
  { id: "madrid", lat: 40.4168, lng: -3.7038, name: { en: "Madrid, Spain", zh: "马德里", ar: "مدريد، إسبانيا" } },
  { id: "stockholm", lat: 59.3293, lng: 18.0686, name: { en: "Stockholm, Sweden", zh: "斯德哥尔摩", ar: "ستوكهولم، السويد" } },
  { id: "bern", lat: 46.9481, lng: 7.4474, name: { en: "Bern, Switzerland", zh: "伯尔尼", ar: "برن، سويسرا" } },
  { id: "london", lat: 51.5074, lng: -0.1278, name: { en: "London, UK", zh: "伦敦", ar: "لندن، المملكة المتحدة" } },
  { id: "helsinki", lat: 60.1699, lng: 24.9384, name: { en: "Helsinki, Finland", zh: "赫尔辛基", ar: "هلسنكي، فنلندا" } },

  // ========== 非洲 ==========
  { id: "victoria", lat: -4.6191, lng: 55.4513, name: { en: "Victoria, Seychelles", zh: "维多利亚", ar: "فيكتوريا، سيشل" } },
  { id: "port-louis", lat: -20.1609, lng: 57.5012, name: { en: "Port Louis, Mauritius", zh: "路易港", ar: "بورت لويس، موريشيوس" } },
  { id: "libreville", lat: 0.4162, lng: 9.4673, name: { en: "Libreville, Gabon", zh: "利伯维尔", ar: "ليبرفيل، الغابون" } },
  { id: "malabo", lat: 3.7504, lng: 8.7371, name: { en: "Malabo, Equatorial Guinea", zh: "马拉博", ar: "مالابو، غينيا الاستوائية" } },
  { id: "cairo", lat: 30.0444, lng: 31.2357, name: { en: "Cairo, Egypt", zh: "开罗", ar: "القاهرة، مصر" } },
  { id: "gaborone", lat: -24.6282, lng: 25.9231, name: { en: "Gaborone, Botswana", zh: "哈博罗内", ar: "غابورون، بوتسوانا" } },
  { id: "algiers", lat: 36.7538, lng: 3.0588, name: { en: "Algiers, Algeria", zh: "阿尔及尔", ar: "الجزائر العاصمة" } },
  { id: "pretoria", lat: -25.7479, lng: 28.2293, name: { en: "Pretoria, South Africa", zh: "比勒陀利亚", ar: "بريتوريا، جنوب أفريقيا" } },
  { id: "tripoli", lat: 32.8872, lng: 13.1913, name: { en: "Tripoli, Libya", zh: "的黎波里", ar: "طرابلس، ليبيا" } },
  { id: "tunis", lat: 36.8065, lng: 10.1815, name: { en: "Tunis, Tunisia", zh: "突尼斯", ar: "تونس العاصمة" } },
  { id: "mbabane", lat: -26.3054, lng: 31.1367, name: { en: "Mbabane, Eswatini", zh: "姆巴巴纳", ar: "مباباني، إيسواتيني" } },
  { id: "windhoek", lat: -22.5609, lng: 17.0658, name: { en: "Windhoek, Namibia", zh: "温得和克", ar: "ويندهوك، ناميبيا" } },
  { id: "praia", lat: 14.933, lng: -23.5133, name: { en: "Praia, Cabo Verde", zh: "普拉亚", ar: "برايا، الرأس الأخضر" } },
  { id: "rabat", lat: 34.0209, lng: -6.8416, name: { en: "Rabat, Morocco", zh: "拉巴特", ar: "الرباط، المغرب" } },
  { id: "luanda", lat: -8.839, lng: 13.2894, name: { en: "Luanda, Angola", zh: "罗安达", ar: "لواندا، أنغولا" } },

  // ========== 中东（首都） ==========
  { id: "abu-dhabi", lat: 24.4539, lng: 54.3773, name: { en: "Abu Dhabi, UAE", zh: "阿布扎比", ar: "أبو ظبي، الإمارات" } },
  { id: "riyadh", lat: 24.7136, lng: 46.6753, name: { en: "Riyadh, Saudi Arabia", zh: "利雅得", ar: "الرياض، السعودية" } },
  { id: "doha", lat: 25.2854, lng: 51.531, name: { en: "Doha, Qatar", zh: "多哈", ar: "الدوحة، قطر" } },
  { id: "manama", lat: 26.2285, lng: 50.5860, name: { en: "Manama, Bahrain", zh: "麦纳麦", ar: "المنامة، البحرين" } },
  { id: "kuwait-city", lat: 29.3759, lng: 47.9774, name: { en: "Kuwait City, Kuwait", zh: "科威特城", ar: "مدينة الكويت" } },
  { id: "jerusalem", lat: 31.7683, lng: 35.2137, name: { en: "Jerusalem, Israel", zh: "耶路撒冷", ar: "القدس، إسرائيل" } },
  { id: "ankara", lat: 39.9334, lng: 32.8597, name: { en: "Ankara, Turkey", zh: "安卡拉", ar: "أنقرة، تركيا" } },
  { id: "muscat", lat: 23.5880, lng: 58.3829, name: { en: "Muscat, Oman", zh: "马斯喀特", ar: "مسقط، عمان" } },
  { id: "baku", lat: 40.4093, lng: 49.8671, name: { en: "Baku, Azerbaijan", zh: "巴库", ar: "باكو، أذربيجان" } },
  { id: "beirut", lat: 33.8938, lng: 35.5018, name: { en: "Beirut, Lebanon", zh: "贝鲁特", ar: "بيروت، لبنان" } },
  { id: "amman", lat: 31.9454, lng: 35.9284, name: { en: "Amman, Jordan", zh: "安曼", ar: "عمان، الأردن" } },
  { id: "tehran", lat: 35.6892, lng: 51.3890, name: { en: "Tehran, Iran", zh: "德黑兰", ar: "طهران، إيران" } },
  { id: "baghdad", lat: 33.3152, lng: 44.3661, name: { en: "Baghdad, Iraq", zh: "巴格达", ar: "بغداد، العراق" } },

  // ========== 澳洲及太平洋 ==========
  { id: "canberra", lat: -35.2809, lng: 149.1300, name: { en: "Canberra, Australia", zh: "堪培拉", ar: "كانبرا، أستراليا" } },
  { id: "sydney", lat: -33.8688, lng: 151.2093, name: { en: "Sydney, Australia", zh: "悉尼", ar: "سيدني، أستراليا" } },
  { id: "wellington", lat: -41.2865, lng: 174.7762, name: { en: "Wellington, New Zealand", zh: "惠灵顿", ar: "ولينغتون، نيوزيلندا" } },
  { id: "ngerulmud", lat: 7.5006, lng: 134.6243, name: { en: "Ngerulmud, Palau", zh: "恩吉鲁穆德", ar: "نغيرولمود، بالاو" } },
  { id: "yaren", lat: -0.5477, lng: 166.9209, name: { en: "Yaren, Nauru", zh: "亚伦", ar: "يارين، ناورو" } },
  { id: "suva", lat: -18.1416, lng: 178.4419, name: { en: "Suva, Fiji", zh: "苏瓦", ar: "سوفا، فيجي" } },
  { id: "funafuti", lat: -8.5211, lng: 179.1962, name: { en: "Funafuti, Tuvalu", zh: "富纳富提", ar: "فونافوتي، توفالو" } },
  { id: "nukualofa", lat: -21.2114, lng: -175.1998, name: { en: "Nukuʻalofa, Tonga", zh: "努库阿洛法", ar: "نوكوالوفا، تونغا" } },
  { id: "apia", lat: -13.8333, lng: -171.7500, name: { en: "Apia, Samoa", zh: "阿皮亚", ar: "آبيا، ساموا" } },
  { id: "majuro", lat: 7.0897, lng: 171.3803, name: { en: "Majuro, Marshall Islands", zh: "马朱罗", ar: "ماجورو، جزر مارشال" } },
  { id: "palikir", lat: 6.9248, lng: 158.1610, name: { en: "Palikir, Micronesia", zh: "帕利基尔", ar: "باليكير، ميكرونيزيا" } },
  { id: "tarawa", lat: 1.3290, lng: 172.9790, name: { en: "Tarawa, Kiribati", zh: "塔拉瓦", ar: "تاراوا، كيريباتي" } },
  { id: "port-vila", lat: -17.7338, lng: 168.3273, name: { en: "Port Vila, Vanuatu", zh: "维拉港", ar: "بورت فيلا، فانواتو" } },
  { id: "port-moresby", lat: -9.4438, lng: 147.1803, name: { en: "Port Moresby, Papua New Guinea", zh: "莫尔兹比港", ar: "بورت مورسبي، بابوا غينيا الجديدة" } },
  { id: "honiara", lat: -9.4456, lng: 159.9729, name: { en: "Honiara, Solomon Islands", zh: "霍尼亚拉", ar: "هونيارا، جزر سليمان" } },
];

// --- 样式配置 ---
const CONFIG = {
  arc: {
    color: ["#00FFFF", "#0096FF"],
    strokeWidth: 0.4,      // 更细的线条
    dashLength: 0.02,      // 短线段
    dashGap: 0.06,         // 小间隔
    dashAnimateTime: 3000, // 快速流动
    altitude: 0.25,
  },
  point: {
    color: "#00FFFF",
    radius: 0.8,           // 稍大一点，更容易点击
    originRadius: 1.0,     // 起点稍大
    originColor: "#00FF88",
  },
  globe: {
    imageUrl: "//unpkg.com/three-globe/example/img/earth-blue-marble.jpg",
    atmosphereColor: "#87CEEB",
    atmosphereAltitude: 0.15,
  },
  initialView: { lat: 23.1291, lng: 113.2644, altitude: 3.1 },
  minAltitude: 1.2,
  maxAltitude: 5,
};

// Props 类型
interface Sphere3DProps {
  locale?: string;
  data?: {
    title: string;
    description: string;
  } | null;
}

// 计算 zoomLevel (0-1), 1 = 最近, 0 = 最远
const altitudeToZoom = (alt: number) => {
  return 1 - (alt - CONFIG.minAltitude) / (CONFIG.maxAltitude - CONFIG.minAltitude);
};

// 默认标题（fallback）
const DEFAULT_TITLE = "GLOBAL NETWORK";
const DEFAULT_DESCRIPTION = "Serving customers worldwide from Guangdong, China";

export default function Sphere3D({ locale = "en", data }: Sphere3DProps) {
  // 使用后端数据，fallback 到默认值
  const title = data?.title || DEFAULT_TITLE;
  const description = data?.description || DEFAULT_DESCRIPTION;
  const globeRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(altitudeToZoom(CONFIG.initialView.altitude));
  const [isGlobeReady, setIsGlobeReady] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<string | null>(null);
  const [isInteractive, setIsInteractive] = useState(false);
  const [isVisible, setIsVisible] = useState(true); // 是否在视口内（默认 true，避免初始不渲染）

  // 根据 locale 获取地名
  const getLocalizedName = useCallback((location: LocationData) => {
    const lang = locale as keyof typeof location.name;
    return location.name[lang] || location.name.en;
  }, [locale]);

  // 弧线数据 - 只在选中某个地点时显示从广东到该地点的连线
  const arcsData = useMemo(() => {
    if (!selectedPoint || selectedPoint === ORIGIN.id) {
      return [];
    }
    const selectedDest = DESTINATIONS.find((d) => d.id === selectedPoint);
    if (!selectedDest) return [];

    return [{
      startLat: ORIGIN.lat,
      startLng: ORIGIN.lng,
      endLat: selectedDest.lat,
      endLng: selectedDest.lng,
    }];
  }, [selectedPoint]);

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

  // 监听是否在视口内
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
        // 离开视口时清除选中状态
        if (!entry.isIntersecting) {
          setSelectedPoint(null);
        }
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

  // 组件卸载时清理 WebGL 资源
  useEffect(() => {
    return () => {
      if (globeRef.current) {
        // 清理 Three.js renderer
        const renderer = globeRef.current.renderer?.();
        if (renderer) {
          renderer.dispose();
          renderer.forceContextLoss();
        }
        // 清理 scene
        const scene = globeRef.current.scene?.();
        if (scene) {
          scene.traverse((object: any) => {
            if (object.geometry) object.geometry.dispose();
            if (object.material) {
              if (Array.isArray(object.material)) {
                object.material.forEach((m: any) => m.dispose());
              } else {
                object.material.dispose();
              }
            }
          });
        }
        globeRef.current = null;
      }
    };
  }, []);

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
      // 放宽 OrbitControls 限制，让 handleZoom 通过 altitude 来控制范围
      controls.minDistance = 50;
      controls.maxDistance = 1000;
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
        {/* Globe 始终渲染，避免重复初始化导致卡顿；离开视口时只暂停动画 */}
        {size.width > 0 && size.height > 0 && (
          <Globe
            ref={globeRef}
            width={size.width}
            height={size.height}
            globeImageUrl={CONFIG.globe.imageUrl}
            backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
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
            arcAltitudeAutoScale={0.5}
            arcAltitude={(d: any) => {
              // 根据两点间距离动态计算弧线高度
              const lat1 = d.startLat * Math.PI / 180;
              const lat2 = d.endLat * Math.PI / 180;
              const dLng = (d.endLng - d.startLng) * Math.PI / 180;
              // 大圆距离（弧度）
              const dist = Math.acos(
                Math.sin(lat1) * Math.sin(lat2) +
                Math.cos(lat1) * Math.cos(lat2) * Math.cos(dLng)
              );
              // 距离越远，弧线越高（最小0.2，最大0.6）
              return Math.min(0.6, Math.max(0.2, dist / Math.PI * 0.8));
            }}
            arcsTransitionDuration={300}
            // 点配置 (悬停显示地名)
            pointsData={pointsData}
            pointLat="lat"
            pointLng="lng"
            pointColor={(d: any) => d.isOrigin ? CONFIG.point.originColor : CONFIG.point.color}
            pointRadius={(d: any) => d.isOrigin ? CONFIG.point.originRadius : CONFIG.point.radius}
            pointAltitude={0.01}
            pointResolution={12}
            pointLabel={(d: any) => `<div class="globe-label">${d.label}</div>`}
            onPointClick={(point: any) => {
              if (!isInteractive && isMobile) return;
              setSelectedPoint((prev) => (prev === point.id ? null : point.id));
            }}
            // 光环层 - 暂时禁用来测试内存
            ringsData={[]}
            // HTML elements 层 - 选中时显示固定标签
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
      <div className="absolute top-12 md:top-20 left-1/2 -translate-x-1/2 text-center z-10 pointer-events-none">
        <h2 className="text-3xl md:text-4xl font-montserrat font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-2">
          {title}
        </h2>
        <p className="text-cyan-300/60 text-sm md:text-base font-montserrat font-bold">
          {description}
        </p>
      </div>
    </section>
  );
}
