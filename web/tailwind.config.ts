/** @type {import('tailwindcss').Config} */
import type { Config } from "tailwindcss"

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

          // 基础文字
          text: {
            main: "#3C3C3C",       // 柔和的黑色 (来自第5点)
            black: "#000000",      // 纯黑 (来自第3, 5, 10点)
            inverse: "#FFFFFF",     // 反色 (来自第2, 6, 8, 9, 15点)
          },

          // 点缀色 - 金色系
          accent: {
            gold: "#A08745",       // (来自第10点 "特殊强调文字")
            "gold-light": "#978350",   // (来自第5点 "副标题")
            border: "#CDC094",     // (来自第3点 "图片边框")
          },

          // 点缀色 - 奶油色系
          cream: {
            DEFAULT: "#FFFAD3",    // (来自第6点 "标题")
            dark: "#DAC99E",      // (来自第6点 "副标题" 和 第17点 "强调事项文字")
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
        // --- Web Fonts (使用 CSS 变量) ---
        'paytone-one': ['var(--font-paytone-one)', 'sans-serif'],
        'poller-one':  ['var(--font-poller-one)', 'serif'],
        'pavanam':     ['var(--font-pavanam)', 'sans-serif'],
        'phudu':       ['var(--font-phudu)', 'sans-serif'],
        'anaheim':     ['var(--font-anaheim)', 'sans-serif'],
        'montserrat':  ['var(--font-montserrat)', 'sans-serif'],
        'bebas-neue':  ['var(--font-bebas-neue)', 'sans-serif'],
        'oswald':      ['var(--font-oswald)', 'sans-serif'],

        // --- 系统字体 (直接使用名字) ---
        'arial':    ['Arial', 'sans-serif'],
        'pingfang': ['"PingFang SC"', 'sans-serif'],
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("tailwind-scrollbar-hide"), // 👈 添加这一行
    require('@tailwindcss/aspect-ratio'),
  ],
}
export default config