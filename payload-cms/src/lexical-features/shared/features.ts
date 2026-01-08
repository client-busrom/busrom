// @ts-nocheck
/**
 * Shared Lexical Features Configuration
 *
 * Provides reusable feature sets for different contexts:
 * - Full features: For top-level editors (allows everything including layout blocks)
 * - Nested features: For layout blocks (prevents infinite nesting)
 */

import {
  // Text Formatting
  BoldFeature,
  ItalicFeature,
  UnderlineFeature,
  StrikethroughFeature,
  SubscriptFeature,
  SuperscriptFeature,
  InlineCodeFeature,
  // Structure
  ParagraphFeature,
  HeadingFeature,
  BlockquoteFeature,
  HorizontalRuleFeature,
  // Lists
  UnorderedListFeature,
  OrderedListFeature,
  ChecklistFeature,
  // Rich Content
  LinkFeature,
  UploadFeature,
  RelationshipFeature,
  // Toolbar
  FixedToolbarFeature,
  InlineToolbarFeature,
  // Layout
  AlignFeature,
  IndentFeature,
} from '@payloadcms/richtext-lexical'

// Custom Features
import { ImageGalleryFeature } from '../image-gallery'
import { SingleImageFeature } from '../single-image'
import { VideoEmbedFeature } from '../video-embed'
import { CtaButtonFeature } from '../cta-button'
import { NoticeFeature } from '../notice'
import { HeroFeature } from '../hero'
import { LinkJumpFeature } from '../link-jump'
import { CarouselFeature } from '../carousel'
import { MarqueeLinksFeature } from '../marquee-links'
import { FormBlockFeature } from '../form-block'
import { ReusableBlockFeature } from '../reusable-block'
import { DocumentTemplateFeature } from '../document-template'
import { BlocksToolbarDropdownFeature } from '../blocks-toolbar-dropdown'
import { ApplicationCarouselFeature } from '../application-carousel'

/**
 * Get base text formatting and structure features
 * Used as foundation for all editors
 */
export const getBaseFeatures = () => [
  // Text Formatting
  BoldFeature(),
  ItalicFeature(),
  UnderlineFeature(),
  StrikethroughFeature(),
  SubscriptFeature(),
  SuperscriptFeature(),
  InlineCodeFeature(),

  // Structure
  ParagraphFeature(),
  HeadingFeature({
    enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
  }),
  BlockquoteFeature(),
  HorizontalRuleFeature(),

  // Lists
  UnorderedListFeature(),
  OrderedListFeature(),
  ChecklistFeature(),

  // Rich Content
  LinkFeature({
    enabledCollections: ['pages', 'products', 'blogs'],
  }),
  UploadFeature({
    collections: {
      media: {
        fields: [
          {
            name: 'caption',
            type: 'text',
            label: 'Caption',
          },
        ],
      },
    },
  }),
  RelationshipFeature({
    enabledCollections: ['products', 'product-series', 'blogs', 'pages'],
  }),

  // Toolbar
  FixedToolbarFeature(),
  InlineToolbarFeature(),

  // Layout
  AlignFeature(),
  IndentFeature(),
]

/**
 * Get custom content features (leaf nodes only - no containers)
 * Used in nested editors to prevent infinite nesting
 */
export const getCustomContentFeatures = () => [
  ImageGalleryFeature(),
  SingleImageFeature(),
  VideoEmbedFeature(),
  CtaButtonFeature(),
  NoticeFeature(),
  HeroFeature(),
  LinkJumpFeature(),
  CarouselFeature(),
  MarqueeLinksFeature(),
  FormBlockFeature(),
  ReusableBlockFeature(),
  ApplicationCarouselFeature(),
]

/**
 * Get features for nested editors (inside layout blocks)
 * Includes base features + custom content features + toolbar dropdown + document templates
 * DOES NOT include BlocksFeature to prevent infinite nesting
 */
export const getNestedFeatures = () => [
  ...getBaseFeatures(),
  ...getCustomContentFeatures(),
  DocumentTemplateFeature(), // 文档模板功能
  BlocksToolbarDropdownFeature(), // 工具栏右侧自定义块按钮（不含布局块）
]

/**
 * Get all features for top-level editors
 * Includes base features + custom content features + document templates + layout blocks
 * Note: Layout blocks (BlocksFeature) are configured separately in payload.config.ts
 */
export const getFullFeatures = () => [
  ...getBaseFeatures(),
  ...getCustomContentFeatures(),
  DocumentTemplateFeature(), // 文档模板功能
  // BlocksFeature is added in payload.config.ts
]
