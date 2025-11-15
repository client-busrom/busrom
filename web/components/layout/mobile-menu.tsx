"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ChevronDown } from "lucide-react"
import Image from "next/image"
import { Link, usePathname } from "@/lib/navigation"
import type { NavItem } from "@/types/navigation"

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
  navigationItems: NavItem[]
}

// 产品图片映射（临时占位图）
const productImageMap: Record<string, string> = {
  "glass-standoff": "/homeProductSeries/glass_standoff.png",
  "glass-connected-fitting": "/homeProductSeries/glass_connected_fitting.png",
  "glass-fence-spigot": "/homeProductSeries/glass_fence_spigot.png",
  "guardrail-glass-clip": "/homeProductSeries/glass_clip_outdoor.png",
  "bathroom-glass-clip": "/homeProductSeries/glass_clip_washroom.png",
  "glass-hinge": "/homeProductSeries/glass_hinge.png",
  "sliding-door-kit": "/homeProductSeries/sliding_door_kit.png",
  "bathroom-handle": "/homeProductSeries/bathroom_&_door_handle.png",
  "door-handle": "/homeProductSeries/bathroom_&_door_handle.png",
  "hidden-hook": "/homeProductSeries/hidden_hook.png",
}

// 从 URL 中提取产品 slug（支持 /products/ 和 /shop/ 路径）
const getProductSlug = (url: string): string | null => {
  const match = url.match(/\/(products|shop)\/([^/?]+)/)
  return match ? match[2] : null
}

// 获取产品图片（优先使用 API 返回的图片，否则使用映射）
const getProductImage = (url: string, apiImage?: { url: string; filename: string }): string | null => {
  if (apiImage?.url) return apiImage.url
  const slug = getProductSlug(url)
  return slug ? productImageMap[slug] || null : null
}

const variants = {
  open: { opacity: 1, x: 0 },
  closed: { opacity: 0, x: "100%" },
}

const subMenuVariants = {
  hidden: { opacity: 0, height: 0, transition: { duration: 0.2 } },
  visible: { opacity: 1, height: "auto", transition: { duration: 0.3 } },
}

export function MobileMenu({ isOpen, onClose, navigationItems = [] }: MobileMenuProps) {
  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null)
  const pathname = usePathname()
  const prevPathnameRef = useRef(pathname)
  const menuContentRef = useRef<HTMLDivElement>(null)

  // 锁定 body 滚动
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }
    return () => {
      document.body.style.overflow = "auto"
    }
  }, [isOpen])

  // 阻止 Lenis 滚动冲突
  useEffect(() => {
    const menuEl = menuContentRef.current

    const stopPropagation = (event: WheelEvent | TouchEvent) => {
      event.stopPropagation()
    }

    if (isOpen && menuEl) {
      menuEl.addEventListener('wheel', stopPropagation, { passive: false })
      menuEl.addEventListener('touchmove', stopPropagation, { passive: false })
    }

    return () => {
      if (menuEl) {
        menuEl.removeEventListener('wheel', stopPropagation)
        menuEl.removeEventListener('touchmove', stopPropagation)
      }
    }
  }, [isOpen])

  // 路由变化时关闭菜单
  useEffect(() => {
    if (isOpen && pathname !== prevPathnameRef.current) {
      onClose()
    }
    prevPathnameRef.current = pathname
  }, [pathname, isOpen, onClose])

  const handleToggleSubMenu = (id: string) => {
    setOpenSubMenu(openSubMenu === id ? null : id)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 背景遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={onClose}
          />

          {/* 侧边菜单 */}
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={variants}
            transition={{ duration: 0.3 }}
            className="fixed top-0 right-0 w-[85%] max-w-sm h-full z-50 bg-background shadow-xl lg:hidden"
          >
            <div className="flex flex-col h-full">
              {/* 头部 - 关闭按钮 */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <h2 className="text-lg font-bold text-foreground">Menu</h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-accent transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* 菜单内容 */}
              <div ref={menuContentRef} className="flex-1 overflow-y-auto px-6 py-4">
                <div className="space-y-2">
                  {navigationItems.map((item) => (
                    <div key={item.id}>
                      {/* 没有子菜单的项 */}
                      {(!item.childMenus || item.childMenus.length === 0) && (
                        <Link
                          href={item.url}
                          className="block px-4 py-3 text-base font-medium text-foreground hover:bg-accent rounded-lg transition-colors"
                        >
                          {item.label}
                        </Link>
                      )}

                      {/* 有子菜单的项 */}
                      {item.childMenus && item.childMenus.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2">
                            {/* 主链接 - 点击进入页面 */}
                            <Link
                              href={item.url}
                              className="flex-1 px-4 py-3 text-base font-medium text-foreground hover:bg-accent rounded-lg transition-colors"
                            >
                              {item.label}
                            </Link>

                            {/* 下拉按钮 - 点击展开子菜单 */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleToggleSubMenu(item.id)
                              }}
                              className="p-3 text-foreground hover:bg-accent rounded-lg transition-colors"
                              aria-label="Toggle submenu"
                            >
                              <ChevronDown
                                className={`w-5 h-5 transform transition-transform duration-200 ${
                                  openSubMenu === item.id ? "rotate-180" : ""
                                }`}
                              />
                            </button>
                          </div>

                          {/* 子菜单 */}
                          <AnimatePresence initial={false}>
                            {openSubMenu === item.id && (
                              <motion.div
                                initial="hidden"
                                animate="visible"
                                exit="hidden"
                                variants={subMenuVariants}
                                className="mt-1 ml-4 pl-4 border-l-2 border-border overflow-hidden"
                              >
                                {item.childMenus.map((child) => {
                                  const imageUrl = getProductImage(child.url, child.image)
                                  const isShopMenu = item.url === '/shop'
                                  const childUrl = isShopMenu
                                    ? `/shop?series=${getProductSlug(child.url)}`
                                    : child.url

                                  return (
                                    <Link
                                      key={child.id}
                                      href={childUrl}
                                      className="flex items-center gap-3 px-3 py-2 text-sm text-foreground/80 hover:text-foreground hover:bg-accent/50 rounded-md transition-colors"
                                    >
                                      {imageUrl ? (
                                        <div className="relative w-10 h-10 flex-shrink-0 rounded overflow-hidden bg-muted">
                                          <Image
                                            src={imageUrl}
                                            alt={child.label}
                                            fill
                                            className="object-cover"
                                          />
                                        </div>
                                      ) : (
                                        <div className="w-10 h-10 flex-shrink-0 rounded bg-muted flex items-center justify-center border border-dashed border-border">
                                          <span className="text-[10px] text-muted-foreground">No img</span>
                                        </div>
                                      )}
                                      <span>{child.label}</span>
                                    </Link>
                                  )
                                })}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
