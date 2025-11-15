"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { Link } from "@/lib/navigation"
import { cn } from "@/lib/utils"
import type { NavItem } from "@/types/navigation"
import { Settings, Globe, HelpCircle, Info, Book, FileText, ArrowRight } from "lucide-react"

interface DesktopMenuProps {
  isOpen: boolean
  onClose: () => void
  navigationItems: NavItem[]
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

// 产品图片映射（临时占位图）
const productImageMap: Record<string, string> = {
  "glass-standoff": "/1.jpg",
  "glass-connected-fitting": "/2.jpg",
  "glass-fence-spigot": "/3.jpg",
  "guardrail-glass-clip": "/4.jpg",
  "bathroom-glass-clip": "/5.jpg",
  "glass-hinge": "/6.jpg",
  "sliding-door-kit": "/7.jpg",
  "bathroom-handle": "/8.jpg",
  "door-handle": "/9.jpg",
  "hidden-hook": "/10.jpg",
}

// 从 URL 中提取产品 slug（支持 /products/ 和 /shop/ 路径）
const getProductSlug = (url: string): string | null => {
  const match = url.match(/\/(products|shop)\/([^/?]+)/)
  return match ? match[2] : null
}

// 获取产品图片（优先使用 API 返回的图片，否则使用映射）
const getProductImage = (url: string, apiImage?: { url: string; filename: string }): string | null => {
  if (apiImage?.url) {
    console.log('Using API image:', apiImage.url)
    return apiImage.url
  }
  const slug = getProductSlug(url)
  const mappedImage = slug ? productImageMap[slug] : null
  console.log('Product URL:', url, 'Slug:', slug, 'Mapped image:', mappedImage)
  return mappedImage
}

export function DesktopMenu({ isOpen, onClose, navigationItems = [] }: DesktopMenuProps) {
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null)

  // 处理一级菜单悬停
  const handleMenuHover = (menuId: string) => {
    const item = navigationItems.find(i => i.id === menuId)
    // 如果该菜单有子菜单，或者当前没有打开任何子菜单，则更新
    if (item?.childMenus && item.childMenus.length > 0) {
      setHoveredMenu(menuId)
    } else if (!hoveredMenu) {
      // 如果当前没有打开子菜单，且悬停的菜单没有子菜单，保持 null
      setHoveredMenu(null)
    }
    // 如果有子菜单打开，且悬停到没有子菜单的项，则关闭子菜单
    else {
      setHoveredMenu(null)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 背景遮罩 - 点击关闭 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="hidden lg:block fixed inset-0 z-40 bg-black/30"
            onClick={onClose}
          />

          {/* 菜单面板 - 从顶部滑下 */}
          <motion.div
            initial={{ y: "-100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "-100%", opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="hidden lg:block fixed top-[64px] left-0 right-0 z-50 bg-background/95 backdrop-blur-md shadow-xl"
            style={{ maxHeight: "70vh" }}
            onMouseLeave={() => setHoveredMenu(null)} // 鼠标完全离开菜单区域时关闭子菜单
            onWheel={(e) => e.stopPropagation()} // 阻止滚动事件冒泡
          >
            <div className="container mx-auto px-4 lg:px-[66px] py-6 max-h-[70vh] overflow-y-auto scrollbar-hide">
                {/* 一级菜单 */}
                <div className="flex justify-center items-center gap-12 pb-6 border-b border-border">
                  {navigationItems.map((item) => (
                    <div
                      key={item.id}
                      className="relative"
                      onMouseEnter={() => handleMenuHover(item.id)}
                    >
                      <Link
                        href={item.url}
                        className={cn(
                          "text-xl font-oswald font-semibold tracking-wide text-muted-foreground transition-colors py-2 block uppercase",
                          hoveredMenu === item.id && "text-brand-accent-gold"
                        )}
                      >
                        {item.label}
                      </Link>
                    </div>
                  ))}
                </div>

                {/* 二级菜单 - 悬停时显示 */}
                <AnimatePresence mode="wait">
                  {hoveredMenu && navigationItems.find(item => item.id === hoveredMenu)?.childMenus && (
                    <motion.div
                      key={hoveredMenu}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="pt-6">
                      {(() => {
                        const activeItem = navigationItems.find(item => item.id === hoveredMenu)
                        if (!activeItem?.childMenus) return null

                        // PRODUCT_CARDS 类型 - 产品卡片网格
                        if (activeItem.type === 'PRODUCT_CARDS') {
                          // 判断是 product 还是 shop（通过 url 判断）
                          const isProductMenu = activeItem.url === '/products'
                          const isShopMenu = activeItem.url === '/shop'

                          console.log('Active menu:', activeItem.label, 'URL:', activeItem.url, 'isProduct:', isProductMenu, 'isShop:', isShopMenu)

                          return (
                            <div className={cn(
                              "grid gap-2.5",
                              // 移动端始终单列
                              "grid-cols-1",
                              // lg 及以上使用桌面端布局
                              "lg:grid-cols-4"
                            )}>
                              {activeItem.childMenus.map((child, index) => {
                                const imageUrl = getProductImage(child.url, child.image)

                                // Product 布局：第一行两张大卡片（各占2列）
                                const isProductFirstRow = isProductMenu && index < 2
                                // Shop 布局：第一张大卡片（占2列）
                                const isShopFirstCard = isShopMenu && index === 0

                                return (
                                  <div
                                    key={child.id}
                                    className={cn(
                                      "group relative w-full h-[360px] overflow-hidden rounded-lg bg-muted cursor-pointer",
                                      // lg 及以上应用特殊布局
                                      isProductFirstRow && "lg:col-span-2",
                                      isShopFirstCard && "lg:col-span-2"
                                    )}
                                  >
                                    {/* 图片容器 */}
                                    <div className="absolute inset-0 overflow-hidden">
                                      {imageUrl ? (
                                        <Image
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

                                    {/* 标题文字 - 左上角 */}
                                    <div className="absolute top-4 left-4 z-10">
                                      <p className="text-lg font-semibold text-white drop-shadow-lg">
                                        {child.label}
                                      </p>
                                    </div>

                                    {/* 底部按钮组 - 悬停时从底部出现 */}
                                    <div className="absolute bottom-0 left-0 right-0 flex gap-2 p-4 translate-y-full opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                                      <Link
                                        href={isShopMenu ? `/shop?series=${getProductSlug(child.url)}` : child.url}
                                        className="flex-1 py-2 px-4 text-center text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        Learn More
                                      </Link>
                                      <Link
                                        href={child.inquiryLink || '/contact-us'}
                                        className="flex-1 py-2 px-4 text-center text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
                                        onClick={(e) => e.stopPropagation()}
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
                                >
                                  <div className="text-muted-foreground group-hover:text-brand-accent-gold transition-colors">
                                    {getIcon(child.icon)}
                                  </div>
                                  <span className="text-lg font-medium text-muted-foreground group-hover:text-brand-accent-gold text-center transition-colors">
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
                              >
                                <span className="text-lg font-medium text-muted-foreground group-hover:text-brand-accent-gold transition-colors">
                                  {child.label}
                                </span>
                              </Link>
                            ))}
                          </div>
                        )
                      })()}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
