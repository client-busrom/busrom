/**
 * Layout Blocks for Lexical Rich Text Editor
 *
 * These blocks provide container layouts with nested rich text editors.
 * Content features (images, videos, CTAs, etc.) have been moved to Custom Features.
 */

// Layout Blocks (像 Keystone document layout)
export { TwoColumns } from './TwoColumns'
export { ThreeColumns } from './ThreeColumns'
export { Sidebar } from './Sidebar'
export { Container } from './Container'
export { FluidLayout } from './FluidLayout'
export { AuthorCard } from './AuthorCard'

// Export as array for easy configuration
import { TwoColumns } from './TwoColumns'
import { ThreeColumns } from './ThreeColumns'
import { Sidebar } from './Sidebar'
import { Container } from './Container'
import { FluidLayout } from './FluidLayout'
import { AuthorCard } from './AuthorCard'

export const contentBlocks = [
  // Layout Blocks - 类似 Keystone document layout
  TwoColumns,
  ThreeColumns,
  Sidebar,
  Container,
  FluidLayout,
]

export const blogBlocks = [
  ...contentBlocks,
  AuthorCard,
]

/**
 * NOTE: All content blocks have been converted to Custom Features:
 * - SingleImage → SingleImageFeature
 * - ImageGallery → ImageGalleryFeature
 * - VideoEmbed → VideoEmbedFeature
 * - CtaButton → CtaButtonFeature
 * - Notice → NoticeFeature
 * - Hero → HeroFeature
 * - Carousel → CarouselFeature
 * - Checklist → (removed, use ChecklistFeature from Payload)
 * - FormBlock → FormBlockFeature
 * - LinkJump → LinkJumpFeature
 * - MarqueeLinks → MarqueeLinksFeature
 * - ReusableBlockReference → ReusableBlockFeature
 *
 * These are now inserted via the toolbar dropdown instead of the slash menu.
 */
