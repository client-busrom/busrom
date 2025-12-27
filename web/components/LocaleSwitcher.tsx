"use client"

import { useState, useRef, useEffect } from "react"
import { Check, ChevronDown, Globe } from "lucide-react"
import { useUserPreferences } from "@/hooks/useUserPreferences"
import {
  countries,
  languages,
  getCountryByCode,
  getLanguageByCode,
  getAllCountries,
  type Country,
  type Language,
} from "@/lib/countries-languages"
import { cn } from "@/lib/utils"
import { usePathname, useRouter, replaceLocaleInPath } from "@/lib/navigation"
import { Button } from "@/components/ui/button"
import { CountryFlag } from "@/components/ui/CountryFlag"
import { locales } from "@/i18n.config"

// 定义 Header 传入的主题类型
type HeaderTheme = "transparent" | "light" | "dark";

interface LocaleSwitcherProps {
  activeTheme: HeaderTheme; // Header 的当前主题
}

export default function LocaleSwitcher({ activeTheme }: LocaleSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const countryListRef = useRef<HTMLDivElement>(null); // Ref for country list
  const languageListRef = useRef<HTMLDivElement>(null); // Ref for language list
  const { preferences, isLoaded, updatePreferences } = useUserPreferences()
  const pathname = usePathname()
  const router = useRouter()

  // 临时状态，用于下拉菜单中的选择
  const [tempCountryCode, setTempCountryCode] = useState(preferences.country)
  const [tempLanguageCode, setTempLanguageCode] = useState(preferences.language)

  // 同步临时状态
  useEffect(() => {
    if (isLoaded) {
      setTempCountryCode(preferences.country)
      setTempLanguageCode(preferences.language)
    }
  }, [preferences, isLoaded])

  // 获取当前显示的对象
  const selectedCountry = getCountryByCode(preferences.country)
  const selectedLanguage = getLanguageByCode(preferences.language)

  // 点击外部关闭下拉菜单
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        // 重置临时状态并关闭
        setTempCountryCode(preferences.country)
        setTempLanguageCode(preferences.language)
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [preferences]) // 依赖 preferences 确保重置时使用最新的

  // --- 阻止 Lenis 滚动冲突 ---
  useEffect(() => {
    const countryListEl = countryListRef.current;
    const languageListEl = languageListRef.current;

    const stopPropagation = (event: WheelEvent | TouchEvent) => {
      event.stopPropagation();
    };

    if (isOpen && countryListEl && languageListEl) {
      countryListEl.addEventListener('wheel', stopPropagation);
      languageListEl.addEventListener('wheel', stopPropagation);
      countryListEl.addEventListener('touchmove', stopPropagation);
      languageListEl.addEventListener('touchmove', stopPropagation);
    }

    // 清理函数
    return () => {
      if (countryListEl && languageListEl) {
        countryListEl.removeEventListener('wheel', stopPropagation);
        languageListEl.removeEventListener('wheel', stopPropagation);
        countryListEl.removeEventListener('touchmove', stopPropagation);
        languageListEl.removeEventListener('touchmove', stopPropagation);
      }
    };
  }, [isOpen]); // 只依赖 isOpen

  // 更新临时国家选择
  const handleTempCountrySelect = (countryCode: string) => {
    setTempCountryCode(countryCode)
  }

  // 更新临时语言选择
  const handleTempLanguageSelect = (languageCode: string) => {
    setTempLanguageCode(languageCode)
  }

  // 点击确认按钮
  const handleConfirm = () => {
    try {
      const originalLanguage = preferences.language;

      // 一次性保存国家和语言偏好（避免状态覆盖问题）
      updatePreferences({
        country: tempCountryCode,
        language: tempLanguageCode,
      })

      // 关闭弹窗
      setIsOpen(false)

      // 语言变化时跳转页面
      // CMS 会自动 fallback 到英文如果某语言没有翻译
      if (tempLanguageCode !== originalLanguage && locales.includes(tempLanguageCode as any)) {
        const newPath = replaceLocaleInPath(pathname, tempLanguageCode)
        router.push(newPath)
      }
    } catch (error) {
      console.error('[LocaleSwitcher] Error in handleConfirm:', error)
      setIsOpen(false)
    }
  }

  // 加载状态 - 使用相同尺寸的占位符避免 CLS
  if (!isLoaded) {
    return (
      <div className={cn(
        "flex items-center space-x-1.5 opacity-50 min-w-[120px]",
        activeTheme === 'transparent' ? 'text-white' : 'text-brand-text-main'
      )}>
        <Globe className="w-5 h-4" />
        <span className="text-sm font-anaheim font-medium">Loading...</span>
        <ChevronDown className="w-4 h-4" />
      </div>
    )
  }

  // 动态计算按钮文字颜色
  const buttonTextColor = activeTheme === 'transparent' ? 'text-white' : 'text-brand-text-main';

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 触发按钮 - 无背景无边框，固定最小宽度避免 CLS */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
            "flex items-center space-x-1.5 group transition-opacity hover:opacity-80 min-w-[120px]",
            buttonTextColor
        )}
        aria-label="Select country and language"
      >
        <CountryFlag countryCode={selectedCountry?.code || "US"} className="w-5 h-4 rounded-sm" />
        <span className="text-sm font-anaheim font-medium">
          {selectedCountry?.shortName} / {selectedLanguage?.nativeName}
        </span>
        <ChevronDown className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")} />
      </button>

      {/* 下拉菜单 */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-[400px] bg-background rounded-lg shadow-lg border border-border z-[100]">
          <div className="flex max-h-80"> {/* 设置最大高度 */}
            {/* 左列：国家 */}
            <div ref={countryListRef} className="w-1/2 overflow-y-auto p-2 border-r border-border scrollbar-hide">
              <h3 className="px-2 py-2 text-xs font-anaheim font-semibold text-muted-foreground uppercase tracking-wider">Country</h3>
              <div className="space-y-1">
                {getAllCountries().map((country) => (
                  <button
                    key={country.code}
                    onClick={() => handleTempCountrySelect(country.code)}
                    className={cn(
                      "w-full flex items-center justify-between space-x-2 px-2 py-1.5 text-left rounded-md transition-colors text-sm font-anaheim",
                      tempCountryCode === country.code
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent text-foreground",
                    )}
                  >
                    <div className="flex items-center space-x-2">
                      <CountryFlag countryCode={country.code} className="w-5 h-4 rounded-sm" />
                      <span>{country.name}</span>
                    </div>
                    {tempCountryCode === country.code && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </div>

            {/* 右列：语言 */}
            <div ref={languageListRef} className="w-1/2 overflow-y-auto p-2 scrollbar-hide">
              <h3 className="px-2 py-2 text-xs font-anaheim font-semibold text-muted-foreground uppercase tracking-wider">Language</h3>
              <div className="space-y-1">
                {languages.map((language) => (
                  <button
                    key={language.code}
                    onClick={() => handleTempLanguageSelect(language.code)}
                    className={cn(
                      "w-full flex items-center justify-between px-2 py-1.5 text-left rounded-md transition-colors text-sm font-anaheim",
                      tempLanguageCode === language.code
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent text-foreground",
                    )}
                  >
                    <span>{language.name} ({language.nativeName})</span>
                    {tempLanguageCode === language.code && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 确认按钮 */}
          <div className="border-t border-border p-3 flex justify-end">
            <Button size="sm" onClick={handleConfirm} className="font-anaheim">
              Confirm
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}