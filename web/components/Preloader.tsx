"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import gsap from "gsap";

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
}

export function Preloader({ onLoadingComplete }: PreloaderProps) {
  const mountRef = useRef<HTMLDivElement>(null);

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

    // --- 独立材质 ---
    const loadingMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uProgressReveal: { value: 0 },
        uProgressShine: { value: 0 },
        uBaseColor: { value: new THREE.Color("#EBE6D8") },
        uHighlightColor: { value: new THREE.Color("#000000") },
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

    svgLoader.load('/Busrom1.svg', (data) => {
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

    fontLoader.load("https://cdn.jsdelivr.net/npm/three@0.137/examples/fonts/helvetiker_bold.typeface.json", (loadedFont) => {
      font = loadedFont;
      const loadingGeo = new TextGeometry("Busrom", { font, size: 0.15, depth: 0.05, curveSegments: 12 });
      loadingGeo.center();
      loadingText = new THREE.Mesh(loadingGeo, loadingMaterial);
      loadingText.position.y = 0.1;
      scene.add(loadingText);
      loadingMaterial.uniforms.uProgressReveal.value = 1;

      for (let i = 1; i <= 7; i++) {
        textureLoader.load(`/${i}.jpg`);
      }
    });

    // --- 动画逻辑 (保持不变) ---
    const masterTimeline = gsap.timeline({ paused: true });

    const fakeProgress = { value: 0 };
    masterTimeline.to(fakeProgress, {
      value: 100,
      duration: 2.5,
      ease: "power1.out",
      onUpdate: () => {
        if (!font) return;
        if (percentageText) {
          scene.remove(percentageText);
          percentageText.geometry.dispose();
        }
        const percentageGeo = new TextGeometry(`${Math.round(fakeProgress.value)}%`, { font, size: 0.12, depth: 0.05, curveSegments: 12 });
        percentageGeo.center();
        percentageText = new THREE.Mesh(percentageGeo, loadingMaterial);
        percentageText.position.y = -0.1;
        scene.add(percentageText);
      },
    });

    masterTimeline.to(loadingMaterial.uniforms.uOpacity, {
      value: 0,
      duration: 0.5,
      ease: "power2.in",
      onComplete: () => {
        if (loadingText) scene.remove(loadingText);
        if (percentageText) scene.remove(percentageText);
      },
    });

    masterTimeline.call(() => {
      if (!logoMesh) return;
      scene.add(logoMesh);
      gsap.from(logoMesh.scale, { x: 0, y: 0, z: 0, duration: 2, ease: "power2.out" });
      gsap.from(logoMesh.rotation, {
        y: -Math.PI,
        duration: 1.5,
        ease: "power1.inOut",
      });
    });

    masterTimeline.to({}, { duration: 2, onComplete: onLoadingComplete });

    loadingManager.onLoad = () => {
      masterTimeline.play();
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
          const mat = object.material as THREE.ShaderMaterial | THREE.ShaderMaterial[] | THREE.MeshBasicMaterial;
          if (Array.isArray(mat)) {
            mat.forEach((m) => m.dispose());
          } else if (mat) {
            mat.dispose();
          }
        }
      });
      renderer.dispose();
      gsap.killTweensOf("*");
    };
  }, [onLoadingComplete]);

  return <div ref={mountRef} className="fixed inset-0 z-50" style={{ backgroundColor: "#EBE6D8" }}></div>;
}