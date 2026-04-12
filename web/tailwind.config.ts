/** @type {import('tailwindcss').Config} */
import type { Config } from "tailwindcss"
import tailwindcssAnimate from "tailwindcss-animate"
import tailwindScrollbarHide from "tailwind-scrollbar-hide"
import tailwindcssAspectRatio from "@tailwindcss/aspect-ratio"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // --- 1. shadcn/ui 语义化颜色 (由 globals.css 驱动) ---
        // 这些保持不变，它们会神奇地自动引用你的新 CSS 变量
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        // --- 2. 你的完整品牌调色板 (Figma 规范) ---
        // 你将使用这些类来构建你的自定义板块
        brand: {
          // 主色 / 副色
          main: "#F6F4ED",       // 主选色
          secondary: "#756F3F",    // 副选色 (深色背景)
          "dark-olive": "#464010", // 深橄榄色 (描边/边框)
          "light-olive": "#827A3C", // 浅橄榄色
          "olive-dark": "#46400F", // 深橄榄色变体
          "olive-mid": "#989260",  // 中等橄榄色

          // 基础文字
          text: {
            main: "#3C3C3C",       // 柔和的黑色 (来自第5点)
            black: "#000000",      // 纯黑 (来自第3, 5, 10点)
            inverse: "#FFFFFF",     // 反色 (来自第2, 6, 8, 9, 15点)
            "dark-brown": "#3D3708", // 深棕色文字
          },

          // 点缀色 - 金色系
          accent: {
            gold: "#A08745",       // (来自第10点 "特殊强调文字")
            "gold-light": "#978350",   // (来自第5点 "副标题")
            border: "#CDC094",     // (来自第3点 "图片边框")
            orange: "#FF7C02",     // 橙色强调
            "gold-bright": "#B8AD52", // 亮金色
          },

          // 点缀色 - 奶油色系
          cream: {
            DEFAULT: "#FFFAD3",    // (来自第6点 "标题")
            dark: "#DAC99E",      // (来自第6点 "副标题" 和 第17点 "强调事项文字")
            light: "#FDF3BC",     // 浅奶油色 (卡片背景)
            border: "#C3BD8B",    // 奶油色边框
          },

          // 点缀色 - 黄色系
          yellow: {
            DEFAULT: "#FCE638",   // 主黄色
            bright: "#FFEE6A",    // 亮黄色 (hover效果)
            "card-bg": "#646336", // 卡片背景深色
            "card-border": "#fce638", // 卡片边框
          },

          // 点缀色 - 橙色系
          orange: {
            DEFAULT: "#D58A00",   // 主橙色
          },

          // 特殊表单色 (来自第12点)
          form: {
            bg: "#BFB672",
            "input-border": "#FFFFFF",
            "input-text": "#2B1F00",
            "button-bg": "#684D07",
            "title-stroke": "#363109", // (描边)
          },

          // 页尾特殊色 (来自第17点)
          footer: {
            "button-bg": "#D4CC8E",
            "button-text": "#625D2F",
            "emphasis-bg": "#625D2F",
            "emphasis-text": "#D2CC9E", // (注意: 你写的是 #D2CC9E，我猜可能是 #DAC99E?)
          },

          // 卡片/遮罩透明色
          overlay: {
            "olive-60": "rgba(141, 132, 58, 0.6)",  // 橄榄色遮罩 60%
            "cream-38": "rgba(255, 245, 168, 0.38)", // 奶油色遮罩 38%
            "cream-54": "rgba(255, 245, 168, 0.54)", // 奶油色遮罩 54%
            "cream-30": "rgba(255, 245, 168, 0.30)", // 奶油色遮罩 30%
          }
        }
      },
      // --- (其余配置保持不变) ---
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        // --- 基础字体 (优化: 使用系统字体栈作为 fallback，减少首屏阻塞) ---
        'sans': [
          'var(--font-anaheim)',  // 首选: Anaheim (24KB, preload)
          'ui-sans-serif',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],

        // --- Web Fonts (使用 CSS 变量) ---
        'paytone-one': ['var(--font-paytone-one)', 'sans-serif'],
        'poller-one':  ['var(--font-poller-one)', 'serif'],
        'pavanam':     ['var(--font-pavanam)', 'sans-serif'],
        'phudu':       ['var(--font-phudu)', 'sans-serif'],
        'anaheim':     ['var(--font-anaheim)', 'sans-serif'],
        'montserrat':  ['var(--font-montserrat)', 'sans-serif'],
        'bebas-neue':  ['var(--font-bebas-neue)', 'sans-serif'],
        'oswald':      ['var(--font-oswald)', 'sans-serif'],
        'inter':       ['var(--font-inter)', 'sans-serif'],  // 需要时显式使用
        'jomhuria':    ['var(--font-jomhuria)', 'sans-serif'],
        'josefin-sans': ['var(--font-josefin-sans)', 'sans-serif'],
        'joan':          ['var(--font-joan)', 'serif'],
        'lilita-one':    ['var(--font-lilita-one)', 'sans-serif'],
        'kaushan-script': ['var(--font-kaushan-script)', 'cursive'],
        'cherry-bomb': ['var(--font-cherry-bomb)', 'cursive'],
        'moul':            ['var(--font-moul)', 'sans-serif'],
        'orbitron':        ['var(--font-orbitron)', 'sans-serif'],
        'berkshire-swash': ['var(--font-berkshire)', 'cursive'],
        'amiri': ['var(--font-amiri)', 'serif'],
        'amarante': ['var(--font-amarante)', 'Amarante', 'serif'],
        'quicksand': ['var(--font-quicksand)', 'sans-serif'],
        'lemon': ['var(--font-lemon)', 'serif'],
        'lobster': ['var(--font-lobster)', 'cursive'],
        'bagel-fat-one': ['var(--font-bagel-fat-one)', 'cursive'],
        'limelight': ['var(--font-limelight)', 'cursive'],
        'katibeh': ['var(--font-katibeh)', 'cursive'],
        'kavivanar': ['Kavivanar', 'cursive'],

        // --- 系统字体 (直接使用名字) ---
        'arial':       ['Arial', 'sans-serif'],
        'arial-black': ['"Arial Black"', 'sans-serif'],
        'pingfang':    ['"PingFang SC"', 'sans-serif'],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "marquee": {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "marquee-reverse": {
          "0%": { transform: "translateX(-50%)" },
          "100%": { transform: "translateX(0%)" },
        },
        "ball-bounce": {
          "0%, 100%": { transform: "translateX(0) translateY(-50%)" },
          "50%": { transform: "translateX(calc(100% + 2vw)) translateY(-50%)" },
        },
        "bounce-around": {
          "0%": {
            transform: "translate(0, 0)",
          },
          "20%": {
            transform: "translate(-150px, 200px)",
          },
          "40%": {
            transform: "translate(100px, 350px)",
          },
          "60%": {
            transform: "translate(-100px, 150px)",
          },
          "80%": {
            transform: "translate(50px, -50px)",
          },
          "100%": {
            transform: "translate(0, 0)",
          },
        },
        "pulse-scale": {
          "0%, 100%": {
            transform: "scale(1)",
          },
          "50%": {
            transform: "scale(1.05)",
          },
        },
        "bounce-slow": {
          "0%, 100%": {
            transform: "translateY(0) scale(1)",
          },
          "50%": {
            transform: "translateY(-10px) scale(1.05)",
          },
        },
        "ping-slow": {
          "0%": {
            transform: "scale(1)",
            opacity: "0.6",
          },
          "75%, 100%": {
            transform: "scale(1.5)",
            opacity: "0",
          },
        },
        // Arrow animations for Why Choose Us section
        "arrow-right": {
          "0%": {
            transform: "rotate(0deg) translateX(calc(var(--arrow-distance) * -1))",
            opacity: "0",
          },
          "20%": {
            opacity: "1",
          },
          "80%": {
            opacity: "1",
          },
          "100%": {
            transform: "rotate(0deg) translateX(var(--arrow-distance))",
            opacity: "0",
          },
        },
        "arrow-left": {
          "0%": {
            transform: "rotate(180deg) translateX(calc(var(--arrow-distance) * -1))",
            opacity: "0",
          },
          "20%": {
            opacity: "1",
          },
          "80%": {
            opacity: "1",
          },
          "100%": {
            transform: "rotate(180deg) translateX(var(--arrow-distance))",
            opacity: "0",
          },
        },
        "arrow-down": {
          "0%": {
            transform: "rotate(90deg) translateX(calc(var(--arrow-distance) * -1))",
            opacity: "0",
          },
          "20%": {
            opacity: "1",
          },
          "80%": {
            opacity: "1",
          },
          "100%": {
            transform: "rotate(90deg) translateX(var(--arrow-distance))",
            opacity: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "marquee": "marquee 20s linear infinite",
        "marquee-reverse": "marquee-reverse 20s linear infinite",
        "ball-bounce": "ball-bounce 2.5s ease-in-out infinite",
        "bounce-around": "bounce-around 12s ease-in-out infinite",
        "pulse-scale": "pulse-scale 2s ease-in-out infinite",
        "bounce-slow": "bounce-slow 1.5s ease-in-out infinite",
        "ping-slow": "ping-slow 2s ease-out infinite",
        "arrow-right": "arrow-right 1.2s ease-in-out infinite",
        "arrow-left": "arrow-left 1.2s ease-in-out infinite",
        "arrow-down": "arrow-down 1.2s ease-in-out infinite",
      },
    },
  },
  plugins: [
    tailwindcssAnimate,
    tailwindScrollbarHide,
    tailwindcssAspectRatio,
  ],
}
export default config