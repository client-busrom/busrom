import {
  Diamond,
  FileText,
  Clock,
  CheckSquare,
  MessageSquare,
  User,
  BarChart3,
  Package,
  Truck,
  Calendar,
  Shield,
  Headphones,
  RefreshCw,
  Star,
} from "lucide-react"

// Icon mapping using lucide-react icons
export const iconMap: Record<string, React.FC<{ className?: string; strokeWidth?: number }>> = {
  // Pre-Purchase Support
  consultation: Diamond,
  quotation: FileText,
  customization: Clock,
  samples: CheckSquare,
  communication: MessageSquare,

  // Purchase Support
  dedicated: User,
  reporting: BarChart3,
  packaging: Package,
  shipping: Truck,
  delivery: Calendar,

  // Post-Purchase Support
  quality: Shield,
  afterSales: Headphones,
  returnExchange: RefreshCw,
  followUp: Star,
}

// Get icon based on title keywords
export const getIconForItem = (title: string): React.FC<{ className?: string; strokeWidth?: number }> => {
  const titleLower = title.toLowerCase()

  // Pre-Purchase Support
  if (titleLower.includes("consultation") || titleLower.includes("requirements gathering")) return iconMap.consultation
  if (titleLower.includes("quotation") || titleLower.includes("transparent")) return iconMap.quotation
  if (titleLower.includes("customization") || titleLower.includes("oem") || titleLower.includes("odm")) return iconMap.customization
  if (titleLower.includes("sample") || titleLower.includes("inspection")) return iconMap.samples
  if (titleLower.includes("multi-channel") || titleLower.includes("communication")) return iconMap.communication

  // Purchase Support
  if (titleLower.includes("dedicated") || titleLower.includes("one-on-one") || titleLower.includes("consultant")) return iconMap.dedicated
  if (titleLower.includes("reporting") || titleLower.includes("production")) return iconMap.reporting
  if (titleLower.includes("packaging") || titleLower.includes("protection")) return iconMap.packaging
  if (titleLower.includes("shipping") || titleLower.includes("transportation") || titleLower.includes("customs")) return iconMap.shipping
  if (titleLower.includes("delivery") || titleLower.includes("flexible")) return iconMap.delivery

  // Post-Purchase Support
  if (titleLower.includes("quality") || titleLower.includes("assurance") || titleLower.includes("commitment")) return iconMap.quality
  if (titleLower.includes("after-sales") || titleLower.includes("comprehensive")) return iconMap.afterSales
  if (titleLower.includes("return") || titleLower.includes("exchange")) return iconMap.returnExchange
  if (titleLower.includes("follow-up") || titleLower.includes("satisfaction") || titleLower.includes("tracking")) return iconMap.followUp

  // Default fallback
  return Diamond
}
