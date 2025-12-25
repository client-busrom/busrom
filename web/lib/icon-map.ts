/**
 * Dynamic Icon Map
 *
 * 用于从 CMS 动态加载图标，只包含实际使用的图标
 * 避免导入整个 lucide-react 库 (500+ 图标, ~580KB)
 *
 * 如果需要添加新图标，在这里导入并添加到 iconMap
 */

import {
  // 箭头和方向
  ArrowUp,
  ArrowRight,
  ArrowLeft,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  ExternalLink,

  // 状态和信息
  Check,
  CheckCircle,
  Info,
  AlertTriangle,
  AlertCircle,
  HelpCircle,

  // 通用
  Menu,
  X,
  Search,
  Settings,
  Globe,

  // 业务相关
  Factory,
  ShieldCheck,
  Lightbulb,
  Users,
  Target,
  Sparkles,
  Cpu,
  Gauge,
  Waves,
  EyeOff,
  Component,

  // 文档
  Book,
  FileText,
  File,

  // 其他常用
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Star,
  Heart,
  Share,
  Download,
  Upload,
  Link,
  Image,
  Video,
  Play,
  Pause,

  // Type
  type LucideIcon,
} from 'lucide-react'

/**
 * 图标名称到组件的映射
 * CMS 中存储图标名称（如 "ArrowRight"），这里映射到实际组件
 */
export const iconMap: Record<string, LucideIcon> = {
  // 箭头和方向
  ArrowUp,
  ArrowRight,
  ArrowLeft,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  ExternalLink,

  // 状态和信息
  Check,
  CheckCircle,
  Info,
  AlertTriangle,
  AlertCircle,
  HelpCircle,

  // 通用
  Menu,
  X,
  Search,
  Settings,
  Globe,

  // 业务相关
  Factory,
  ShieldCheck,
  Lightbulb,
  Users,
  Target,
  Sparkles,
  Cpu,
  Gauge,
  Waves,
  EyeOff,
  Component,

  // 文档
  Book,
  FileText,
  File,

  // 其他常用
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Star,
  Heart,
  Share,
  Download,
  Upload,
  Link,
  Image,
  Video,
  Play,
  Pause,
}

/**
 * 根据图标名称获取图标组件（同步版本）
 * @param iconName - 图标名称（如 "ArrowRight"）
 * @param fallback - 找不到时的默认图标
 */
export function getIcon(iconName: string | undefined, fallback: LucideIcon = HelpCircle): LucideIcon {
  if (!iconName) return fallback
  return iconMap[iconName] || fallback
}

export type { LucideIcon }
