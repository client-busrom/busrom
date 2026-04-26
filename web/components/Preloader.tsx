"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import gsap from "gsap";
import type { PreloaderConfigData } from "@/lib/api/preloader-config";

// GLSL 着色器代码 (用于文字)
const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const fragmentShader = `
  uniform float uProgressReveal;
  uniform float uProgressShine;
  uniform vec3 uBaseColor;
  uniform vec3 uHighlightColor;
  uniform float uOpacity;

  varying vec2 vUv;

  void main() {
    float alpha = step(vUv.x, uProgressReveal);
    if (alpha < 0.5) discard;
    float shineWidth = 0.2;
    float shinePosition = uProgressShine * (1.0 + shineWidth) - shineWidth;
    float gradientFactor = smoothstep(shinePosition - shineWidth, shinePosition, vUv.x) - smoothstep(shinePosition, shinePosition + shineWidth, vUv.x);
    vec3 finalColor = mix(uBaseColor, uHighlightColor, gradientFactor);
    gl_FragColor = vec4(finalColor, uOpacity);
  }
`;


interface PreloaderProps {
  onLoadingComplete: () => void;
  config: PreloaderConfigData;
}

export function Preloader({ onLoadingComplete, config }: PreloaderProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const completedRef = useRef(false);

  useEffect(() => {
    const mountNode = mountRef.current;
    if (!mountNode) return;

    // --- 场景设置 ---
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    camera.position.z = 2;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountNode.appendChild(renderer.domElement);

    // --- 独立材质 (使用 CMS 配置的颜色) ---
    const loadingMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uProgressReveal: { value: 0 },
        uProgressShine: { value: 0 },
        uBaseColor: { value: new THREE.Color(config.textColor) },
        uHighlightColor: { value: new THREE.Color(config.highlightColor) },
        uOpacity: { value: 1.0 },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
    });

    // --- 资源加载 ---
    const loadingManager = new THREE.LoadingManager();
    const fontLoader = new FontLoader(loadingManager);
    const textureLoader = new THREE.TextureLoader(loadingManager); 
    const svgLoader = new SVGLoader(loadingManager); 

    let font: any = null;
    let loadingText: THREE.Mesh | null = null;
    let percentageText: THREE.Mesh | null = null;
    let logoMesh: THREE.Group | null = null;

    // Load logo SVG
    // Note: Three.js SVGLoader has issues with cross-origin SVGs, so we always use local file
    // The CMS logo field is reserved for future use (e.g., displaying in a regular <img> tag)
    const logoUrl = '/Busrom1.svg';
    svgLoader.load(logoUrl, (data) => {
      const paths = data.paths;
      const group = new THREE.Group();

      for (let i = 0; i < paths.length; i++) {
          const path = paths[i];
          const fillColor = path.userData?.style.fill;
          const material = new THREE.MeshBasicMaterial({ color: new THREE.Color().setStyle(fillColor).convertSRGBToLinear(), opacity: path.userData?.style.fillOpacity, transparent: true, side: THREE.DoubleSide, depthWrite: false });
          const shapes = SVGLoader.createShapes(path);
          for (let j = 0; j < shapes.length; j++) {
              const shape = shapes[j];
              const extrudeSettings = { depth: 24, bevelEnabled: false };
              const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
              const mesh = new THREE.Mesh(geometry, material);
              group.add(mesh);
          }
      }
      
      const box = new THREE.Box3().setFromObject(group);
      const center = box.getCenter(new THREE.Vector3());      
      group.children.forEach((mesh) => {
          if (mesh instanceof THREE.Mesh) {
            mesh.geometry.translate(-center.x, -center.y, -center.z);
          }
      });

      group.scale.set(0.01, -0.01, 0.01);
      group.position.set(0, 0, 0);
      logoMesh = group;
  });

    // --- 图片加载进度跟踪 ---
    let imagesLoaded = 0;
    const totalImages = config.images.length;
    const realProgress = { value: 0 };
    let allImagesLoaded = false;
    let fontAndLogoReady = false;
    let lastDisplayedPercent = -1; // 避免重复更新相同的百分比
    let minTimeElapsed = false; // 最小显示时间标记
    const MIN_LOADING_TIME = 1500; // 最小加载时间 1.5 秒

    // 设置最小显示时间
    setTimeout(() => {
      minTimeElapsed = true;
      checkAndStartEndAnimation();
    }, MIN_LOADING_TIME);

    // --- 新增：硬超时机制 (Hard Timeout) ---
    // 为中国大陆等网络环境优化的“兜底”逻辑：如果 6 秒后还没加载完，强制解锁
    const HARD_TIMEOUT = 8000; 
    setTimeout(() => {
      if (!allImagesLoaded || !fontAndLogoReady) {
        console.warn("[Preloader] Hard timeout reached. Forcing site entry...");
        allImagesLoaded = true;
        fontAndLogoReady = true;
        minTimeElapsed = true;
        realProgress.value = 100;
        updatePercentageDisplay();
        checkAndStartEndAnimation();
      }
    }, HARD_TIMEOUT);

    // 更新百分比文字显示 - 只在百分比变化时更新
    const updatePercentageDisplay = () => {
      if (!font) return;
      const currentPercent = Math.round(realProgress.value);
      if (currentPercent === lastDisplayedPercent) return; // 跳过相同百分比
      lastDisplayedPercent = currentPercent;

      if (percentageText) {
        scene.remove(percentageText);
        percentageText.geometry.dispose();
      }
      const percentageGeo = new TextGeometry(`${currentPercent}%`, { font, size: 0.12, depth: 0.05, curveSegments: 12 });
      percentageGeo.center();
      percentageText = new THREE.Mesh(percentageGeo, loadingMaterial);
      percentageText.position.y = -0.1;
      scene.add(percentageText);
    };


    // 检查是否可以开始结束动画
    const checkAndStartEndAnimation = () => {
      // 已经完成过则直接跳过
      if (completedRef.current) return;

      // 需要满足三个条件：图片加载完成、字体和Logo准备好、最小时间已过
      if (allImagesLoaded && fontAndLogoReady && minTimeElapsed) {
        completedRef.current = true; // 锁定状态
        
        // 确保进度显示为 100%
        realProgress.value = 100;
        updatePercentageDisplay();

        // 开始结束动画
        setTimeout(() => {
          if (endTimeline) endTimeline.play();
        }, 300); // 短待延迟让用户看到 100%
      }
    };

    // 加载图片并跟踪进度
    const loadImagesWithProgress = () => {
      if (totalImages === 0) {
        allImagesLoaded = true;
        checkAndStartEndAnimation();
        return;
      }

      // 启动平滑进度动画（在最小时间内从 0 到 100）
      gsap.to(realProgress, {
        value: 100,
        duration: MIN_LOADING_TIME / 1000,
        ease: "power1.out",
        onUpdate: updatePercentageDisplay,
      });

      config.images.forEach((img) => {
        const image = new Image();
        const handleLoad = () => {
          imagesLoaded++;
          if (imagesLoaded >= totalImages) {
            allImagesLoaded = true;
            checkAndStartEndAnimation();
          }
        };
        image.onload = handleLoad;
        image.onerror = handleLoad; // 即使加载失败也计入进度
        image.src = img.src;
      });
    };

    fontLoader.load("/helvetiker_bold.typeface.json", (loadedFont) => {
      font = loadedFont;
      const loadingGeo = new TextGeometry("Busrom", { font, size: 0.15, depth: 0.05, curveSegments: 12 });
      loadingGeo.center();
      loadingText = new THREE.Mesh(loadingGeo, loadingMaterial);
      loadingText.position.y = 0.1;
      scene.add(loadingText);
      loadingMaterial.uniforms.uProgressReveal.value = 1;

      // 显示初始 0%
      updatePercentageDisplay();

      // 开始加载图片
      loadImagesWithProgress();
    });

    // --- 结束动画 (图片加载完成后播放) ---
    const endTimeline = gsap.timeline({ paused: true });

    endTimeline.to(loadingMaterial.uniforms.uOpacity, {
      value: 0,
      duration: 0.5,
      ease: "power2.in",
      onComplete: () => {
        if (loadingText) scene.remove(loadingText);
        if (percentageText) scene.remove(percentageText);
      },
    });

    endTimeline.call(() => {
      if (!logoMesh) return;
      scene.add(logoMesh);
      gsap.from(logoMesh.scale, { x: 0, y: 0, z: 0, duration: config.logoAnimationDuration, ease: "power2.out" });
      gsap.from(logoMesh.rotation, {
        y: -Math.PI,
        duration: config.logoAnimationDuration * 0.75,
        ease: "power1.inOut",
      });
    });

    endTimeline.to({}, { duration: config.logoAnimationDuration, onComplete: onLoadingComplete });

    // 字体和 Logo 加载完成的回调
    loadingManager.onLoad = () => {
      fontAndLogoReady = true;
      checkAndStartEndAnimation();
    };

    gsap.to(loadingMaterial.uniforms.uProgressShine, {
      value: 1,
      duration: 2,
      ease: "power1.inOut",
      repeat: -1,
      repeatDelay: 0.5,
    });

    // --- 渲染循环与窗口大小调整 (保持不变) ---
    let animationFrameId: number;
    const animate = () => {
      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      if (!mountNode) return;
      const w = mountNode.clientWidth;
      const h = mountNode.clientHeight;
      renderer.setSize(w, h);
      const aspect = w / h;
      camera.left = -1 * aspect;
      camera.right = 1 * aspect;
      camera.top = 1;
      camera.bottom = -1;
      camera.updateProjectionMatrix();
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    // --- 清理 (保持不变) ---
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      if (mountNode && renderer.domElement) {
        mountNode.removeChild(renderer.domElement);
      }
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach((m) => m.dispose());
            } else {
              object.material.dispose();
            }
          }
        }
      });
      renderer.dispose();
      // Force release WebGL context
      const extension = renderer.getContext().getExtension('WEBGL_lose_context');
      if (extension) extension.loseContext();
      renderer.forceContextLoss();
      gsap.killTweensOf("*");
      console.log("[Preloader] Cleanup/Unmounted");
    };
  }, [onLoadingComplete, config]);

  return <div ref={mountRef} className="fixed inset-0 z-50" style={{ backgroundColor: config.backgroundColor }}></div>;
}