/**
 * Component Blocks for Document Field
 *
 * This file exports all component blocks that can be used in the Document Editor.
 *
 * Component blocks are custom structured content blocks that can be inserted
 * into documents via the "+" button in the toolbar.
 */

// Standard Components (11)
import { singleImage } from './components/single-image'
import { imageGallery } from './components/image-gallery'
import { videoEmbed } from './components/video-embed'
import { ctaButton } from './components/cta-button'
import { notice } from './components/notice-box'
import { hero } from './components/hero'
import { carousel } from './components/carousel'
import { checklist } from './components/checklist'
import { formBlock } from './components/form-block'

// New Components (2)
import { linkJump } from './components/link-jump'
import { marqueeLinks } from './components/marquee-links'

// Special Components (1)
// Note: documentTemplate has been removed - use "Insert Template" button in toolbar instead
import { reusableBlockReference } from './components/reusable-block-reference'

export const componentBlocks = {
  // Standard components - all now use FilteredMediaSelector for image selection
  singleImage,
  imageGallery,
  videoEmbed,
  ctaButton,
  notice,
  hero,
  carousel,
  checklist,
  formBlock,

  // New components
  linkJump,
  marqueeLinks,

  // Special components
  reusableBlockReference,
}
