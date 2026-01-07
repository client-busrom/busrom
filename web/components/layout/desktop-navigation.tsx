"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { Link } from "@/lib/navigation"
import { cn } from "@/lib/utils"
import type { NavItem } from "@/types/navigation"
import { Settings, Globe, HelpCircle, Info, Book, FileText, ArrowRight, ChevronDown } from "lucide-react"

interface DesktopNavigationProps {
  navigationItems: NavItem[]
  theme: "transparent" | "light" | "dark"
  onMenuOpen?: (isOpen: boolean) => void
}

// Icon 映射
const iconMap: Record<string, any> = {
  Settings,
  Globe,
  HelpCircle,
  Info,
  Book,
  FileText,
  Default: ArrowRight,
}

const getIcon = (iconName?: string) => {
  if (!iconName) return null
  const IconComponent = iconMap[iconName] || iconMap.Default
  return <IconComponent className="w-5 h-5" />
}

// 从 URL 中提取产品 slug
const getProductSlug = (url: string): string | null => {
  const match = url.match(/\/(products|shop)\/([^/?]+)/)
  return match ? match[2] : null
}

// 获取产品图片
const getProductImage = (url: string, apiImage?: { url: string; filename: string }): string | null => {
  if (apiImage?.url) {
    const originalUrl = apiImage.url
    const variantUrl = originalUrl.replace(/(\.[^.]+)$/, '-768x512.webp')
    return variantUrl
  }
  return null
}

export function DesktopNavigation({ navigationItems, theme, onMenuOpen }: DesktopNavigationProps) {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // 通知父组件菜单展开状态
  useEffect(() => {
    onMenuOpen?.(activeMenuId !== null)
  }, [activeMenuId, onMenuOpen])

  // 按 order 排序所有菜单项
  const sortedItems = [...navigationItems]
    .sort((a, b) => a.order - b.order)

  // 点击菜单项
  const handleMenuClick = (item: NavItem, e: React.MouseEvent) => {
    // Product 和 Shop 点击直接跳转（悬停展开子菜单）
    // 其他有子菜单的项点击切换展开状态
    const isProductOrShop = item.url === '/products' || item.url === '/shop'

    if (item.childMenus && item.childMenus.length > 0 && !isProductOrShop) {
      e.preventDefault()
      setActiveMenuId(activeMenuId === item.id ? null : item.id)
    } else {
      // 没有子菜单或是 Product/Shop，关闭当前展开的菜单并跳转
      setActiveMenuId(null)
    }
  }

  // 悬停打开子菜单
  const handleMouseEnter = (item: NavItem) => {
    if (item.childMenus && item.childMenus.length > 0) {
      setActiveMenuId(item.id)
    }
  }

  // 悬停离开关闭子菜单
  const handleMouseLeave = () => {
    setActiveMenuId(null)
  }

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setActiveMenuId(null)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // 计算文字颜色
  const textColor = theme === "transparent" ? "text-white" : "text-brand-text-main"
  const hoverColor = theme === "transparent" ? "hover:text-white/80" : "hover:text-brand-secondary"

  // 获取当前激活的菜单项
  const activeItem = activeMenuId ? navigationItems.find(item => item.id === activeMenuId) : null

  return (
    <>
      <div ref={menuRef} className="flex items-center gap-6" onMouseLeave={handleMouseLeave}>
        {sortedItems.map((item) => {
          const hasChildren = item.childMenus && item.childMenus.length > 0
          const isActive = activeMenuId === item.id

          return (
            <div
              key={item.id}
              className="relative"
              onMouseEnter={() => handleMouseEnter(item)}
            >
              <Link
                href={item.url}
                onClick={(e) => handleMenuClick(item, e)}
                className={cn(
                  "relative flex items-center gap-1 text-sm font-montserrat font-bold transition-colors py-2",
                  textColor,
                  hoverColor,
                  isActive && "text-brand-secondary"
                )}
              >
                {item.label}
                {/* 箭头图标（有子菜单时显示） */}
                {hasChildren && (
                  <ChevronDown
                    className={cn(
                      "w-4 h-4 transition-transform duration-200",
                      isActive && "rotate-180"
                    )}
                  />
                )}
                {/* 下划线指示器（有子菜单且激活时显示） */}
                {hasChildren && (
                  <span
                    className={cn(
                      "absolute bottom-0 left-0 w-full h-0.5 bg-current transition-transform duration-200 origin-left",
                      isActive ? "scale-x-100" : "scale-x-0"
                    )}
                  />
                )}
              </Link>
            </div>
          )
        })}
      </div>

      {/* 二级菜单下拉 - 全屏宽度 */}
      <AnimatePresence>
        {activeItem && activeItem.childMenus && activeItem.childMenus.length > 0 && (
          <>
            {/* 背景遮罩 - 从 header 下方开始 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/30"
              style={{ top: "46px" }}
              onClick={() => setActiveMenuId(null)}
            />

            {/* 下拉菜单 - 紧贴 header 底部 */}
            <motion.div
              ref={dropdownRef}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="fixed left-0 right-0 z-[55] bg-brand-main shadow-lg"
              style={{ top: "46px", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
              onWheel={(e) => e.stopPropagation()}
              onMouseEnter={() => setActiveMenuId(activeMenuId)}
              onMouseLeave={handleMouseLeave}
            >
              <div className="container mx-auto px-4 lg:px-[66px] py-6 max-h-[70vh] overflow-y-auto scrollbar-hide">
                {(() => {
                  // PRODUCT_CARDS 类型 - 产品卡片网格
                  if (activeItem.type === 'PRODUCT_CARDS') {
                    const isProductMenu = activeItem.url === '/products'
                    const isShopMenu = activeItem.url === '/shop'

                    return (
                      <div className="grid gap-2.5 grid-cols-1 lg:grid-cols-4">
                        {activeItem.childMenus.map((child, index) => {
                          const imageUrl = getProductImage(child.url, child.image)
                          const isProductFirstRow = isProductMenu && index < 2
                          const isShopFirstCard = isShopMenu && index === 0

                          return (
                            <div
                              key={child.id}
                              className={cn(
                                "group relative w-full h-[360px] overflow-hidden rounded-lg bg-muted cursor-pointer",
                                isProductFirstRow && "lg:col-span-2",
                                isShopFirstCard && "lg:col-span-2"
                              )}
                            >
                              <div className="absolute inset-0 overflow-hidden">
                                {imageUrl ? (
                                  <Image
                                    key={`${activeItem.id}-${child.id}-${imageUrl}`}
                                    src={imageUrl}
                                    alt={child.label}
                                    fill
                                    sizes="(max-width: 1024px) 100vw, (max-width: 1280px) 50vw, 33vw"
                                    className="object-cover transition-transform duration-500 group-hover:scale-125"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center border-2 border-dashed border-border">
                                    <span className="text-muted-foreground text-xs">No Image</span>
                                  </div>
                                )}
                              </div>

                              <div className="absolute top-4 left-4 z-10">
                                <p className="text-lg font-montserrat font-bold text-white drop-shadow-lg">
                                  {child.label}
                                </p>
                              </div>

                              <div className="absolute bottom-0 left-0 right-0 flex gap-2 p-4 translate-y-full opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                                <Link
                                  href={isShopMenu ? `/shop?series=${getProductSlug(child.url)}` : child.url}
                                  className="flex-1 py-2 px-4 text-center text-sm font-montserrat font-bold bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                                  onClick={() => setActiveMenuId(null)}
                                >
                                  Learn More
                                </Link>
                                <Link
                                  href={child.inquiryLink || '/contact-us'}
                                  className="flex-1 py-2 px-4 text-center text-sm font-montserrat font-bold bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
                                  onClick={() => setActiveMenuId(null)}
                                >
                                  Inquiry
                                </Link>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )
                  }

                  // SUBMENU 类型 - 带图标的菜单
                  if (activeItem.type === 'SUBMENU') {
                    return (
                      <div className="grid grid-cols-4 gap-4 max-w-4xl mx-auto">
                        {activeItem.childMenus.map((child) => (
                          <Link
                            key={child.id}
                            href={child.url}
                            className="group flex flex-col items-center justify-center gap-3 p-6 rounded-lg transition-colors"
                            onClick={() => setActiveMenuId(null)}
                          >
                            <div className="text-muted-foreground group-hover:text-brand-accent-gold transition-colors">
                              {getIcon(child.icon)}
                            </div>
                            <span className="text-lg font-montserrat font-bold text-muted-foreground group-hover:text-brand-accent-gold text-center transition-colors">
                              {child.label}
                            </span>
                          </Link>
                        ))}
                      </div>
                    )
                  }

                  // STANDARD 类型 - 普通列表
                  return (
                    <div className="grid grid-cols-4 gap-2 max-w-4xl mx-auto">
                      {activeItem.childMenus.map((child) => (
                        <Link
                          key={child.id}
                          href={child.url}
                          className="group px-4 py-3 rounded-md transition-colors"
                          onClick={() => setActiveMenuId(null)}
                        >
                          <span className="text-lg font-montserrat font-bold text-muted-foreground group-hover:text-brand-accent-gold transition-colors">
                            {child.label}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )
                })()}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
