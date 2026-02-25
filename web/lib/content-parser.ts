/**
 * Content Translation Parser
 *
 * Parses Lexical rich text content from Payload CMS contentTranslation field
 * and extracts structured data for rendering product series pages.
 */

import { convertToCDNUrl } from '@/lib/cdn-url'

// Types for Lexical nodes
interface LexicalTextNode {
  type: 'text'
  text: string
  format?: number
}

interface LexicalListItemNode {
  type: 'listitem'
  children: LexicalNode[]
  value?: number
}

interface LexicalListNode {
  type: 'list'
  tag: 'ol' | 'ul'
  children: LexicalListItemNode[]
  listType: 'number' | 'bullet'
}

interface LexicalQuoteNode {
  type: 'quote'
  children: LexicalNode[]
}

interface LexicalParagraphNode {
  type: 'paragraph'
  children: LexicalNode[]
}

interface LexicalHeadingNode {
  type: 'heading'
  tag: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  children: LexicalNode[]
}

interface LexicalHorizontalRuleNode {
  type: 'horizontalrule'
}

interface LexicalImageGalleryNode {
  type: 'custom-image-gallery'
  data: {
    images: Array<{
      image: string // Media ID
      caption?: string
      enableLink?: boolean
      linkUrl?: string
      openInNewTab?: boolean
    }>
    layout?: string
    spacing?: string
    lightbox?: boolean
  }
}

interface LexicalCarouselNode {
  type: 'carousel'
  data: {
    slides: Array<{
      image: { id: string }
      title?: string
      description?: string
      buttonText?: string
      buttonLink?: string
      showButton?: boolean
      openInNewTab?: boolean
    }>
    autoplay?: boolean
    interval?: number
    itemsPerView?: number
  }
}

interface LexicalCtaButtonNode {
  type: 'ctaButton'
  data: {
    url: string
    text: string
    size?: string
    style?: string
    openInNewTab?: boolean
  }
}

type LexicalNode =
  | LexicalTextNode
  | LexicalListNode
  | LexicalListItemNode
  | LexicalQuoteNode
  | LexicalParagraphNode
  | LexicalHeadingNode
  | LexicalHorizontalRuleNode
  | LexicalImageGalleryNode
  | LexicalCarouselNode
  | LexicalCtaButtonNode
  | { type: string; children?: LexicalNode[]; data?: any }

interface LexicalRoot {
  type: 'root'
  children: LexicalNode[]
}

interface ContentTranslation {
  root: LexicalRoot
}

// Parsed section types
export interface HeroCarouselSlide {
  title: string[]  // Support multi-line titles (split by /n)
  description: string
  backgroundImage: string
  productImages: string[]
  buttonText: string
  buttonLink: string
}

export interface HeroCarouselData {
  slides: HeroCarouselSlide[]
}

export interface ProductOverviewData {
  titleLines: string[]    // First 2 lines (96px, olive green)
  subtitleLines: string[] // Last 2 lines (48px, black)
  brandName: string
  description: string
  images: string[]
  ctaButton?: {
    text: string
    url: string
  }
}

export interface TechSpecItem {
  key: string
  value: string
}

export interface AdvantageCard {
  title: string
  content: string
}

export interface AdvantageCategory {
  title: string  // Category title (e.g., "Materials & Processes")
  cards: AdvantageCard[]
}

export interface CoreSellingPointsData {
  title: string
  titleImages: string[]  // Draggable image list in title area
  techSpecImages: string[]  // 2 images on the left of tech spec
  techSpecTitle: string
  techSpecItems: TechSpecItem[]  // key-value pairs
  advantagesTitle: string
  advantagesImages: string[]  // 4 images for 4 categories
  advantagesCategories: AdvantageCategory[]  // 4 categories with expandable cards
}

export interface ApplicationsData {
  images: string[]  // Array of application images for carousel
}

export interface ContactFormData {
  title: string           // "Contact Us Get A Quote"
  backgroundImage: string // Background image for the section
  helperTitle: string     // "We'd love to hear from you!"
  helperText: string      // "Share your needs..."
  productImages: string[] // Tilted product images on the left
}

export interface MoreSeriesItem {
  name: string
  slug: string
  image: string
  link: string
}

export interface MoreSeriesData {
  title: string           // "More series"
  series: MoreSeriesItem[]
}

export interface QuoteData {
  image: string           // Center image
  quoteLeft: string       // Quote text on the left (white)
  quoteRight: string      // Quote text on the right (dark)
  ctaText: string         // CTA button text
  ctaLink: string         // CTA button link
}

export interface ParsedProductSeriesContent {
  heroCarousel?: HeroCarouselData
  productOverview?: ProductOverviewData
  coreSellingPoints?: CoreSellingPointsData
  applications?: ApplicationsData
  contactForm?: ContactFormData
  moreSeries?: MoreSeriesData
  quote?: QuoteData
}

/**
 * Extract text from a Lexical node recursively
 * Preserves line breaks (Shift+Enter creates linebreak nodes in Lexical)
 */
function extractText(node: LexicalNode): string {
  if (node.type === 'text') {
    return (node as LexicalTextNode).text
  }
  // Handle linebreak nodes (Shift+Enter in Lexical editor)
  if (node.type === 'linebreak') {
    return '\n'
  }
  if ('children' in node && Array.isArray(node.children)) {
    return node.children.map(extractText).join('')
  }
  return ''
}

/**
 * Extract items from an ordered/unordered list
 */
function extractListItems(node: LexicalListNode): string[] {
  return node.children
    .filter((child): child is LexicalListItemNode => child.type === 'listitem')
    .map(item => extractText(item))
}

/**
 * Check if a paragraph contains a specific code marker (format 16 = code)
 */
function isCodeMarker(node: LexicalNode, marker: string): boolean {
  if (node.type !== 'paragraph') return false
  const text = extractText(node).trim()
  return text === marker
}

/**
 * Check if a quote contains a specific section marker
 */
function isQuoteMarker(node: LexicalNode, marker: string): boolean {
  if (node.type !== 'quote') return false
  const text = extractText(node).trim()
  return text === marker
}

/**
 * Parse hero-carousel section from content nodes
 */
function parseHeroCarousel(
  nodes: LexicalNode[],
  mediaMap: Map<string, string>
): HeroCarouselData | undefined {
  const titles: string[] = []
  const descriptions: string[] = []
  const backgroundImages: string[] = []
  const productImageSets: Array<{
    images: string[]
    buttonText: string
    buttonLink: string
  }> = []

  let currentField: string | null = null

  for (const node of nodes) {
    // Check for field markers (code format text)
    if (node.type === 'paragraph') {
      const text = extractText(node).trim()
      if (text.startsWith('hero-carousel-')) {
        currentField = text
        continue
      }
    }

    // Parse based on current field
    if (currentField === 'hero-carousel-title' && node.type === 'list') {
      titles.push(...extractListItems(node as LexicalListNode))
    }

    if (currentField === 'hero-carousel-description' && node.type === 'list') {
      descriptions.push(...extractListItems(node as LexicalListNode))
    }

    if (currentField === 'hero-carousel-backgroud-image' && node.type === 'custom-image-gallery') {
      const gallery = node as LexicalImageGalleryNode
      for (const img of gallery.data.images) {
        const url = mediaMap.get(img.image) || `/api/media/${img.image}`
        backgroundImages.push(url)
      }
    }

    if (currentField === 'hero-carousel-image' && node.type === 'carousel') {
      const carousel = node as LexicalCarouselNode
      for (const slide of carousel.data.slides) {
        const imageUrl = mediaMap.get(slide.image.id) || `/api/media/${slide.image.id}`
        productImageSets.push({
          images: [imageUrl],
          buttonText: slide.buttonText || 'View More',
          buttonLink: slide.buttonLink || '#',
        })
      }
    }
  }

  // Build slides by combining data
  const slideCount = Math.max(titles.length, descriptions.length, backgroundImages.length, productImageSets.length)
  if (slideCount === 0) return undefined

  const slides: HeroCarouselSlide[] = []
  for (let i = 0; i < slideCount; i++) {
    // Split title by actual newlines (\n from Shift+Enter) or literal /n for multi-line support
    const rawTitle = titles[i] || ''
    const titleLines = rawTitle.split(/\n|\/n/).map(line => line.trim()).filter(Boolean)

    slides.push({
      title: titleLines.length > 0 ? titleLines : [rawTitle],
      description: descriptions[i] || '',
      backgroundImage: backgroundImages[i] || '',
      productImages: productImageSets[i]?.images || [],
      buttonText: productImageSets[i]?.buttonText || 'View More',
      buttonLink: productImageSets[i]?.buttonLink || '#',
    })
  }

  return { slides }
}

/**
 * Parse product-series-overview section from content nodes
 */
function parseProductOverview(
  nodes: LexicalNode[],
  mediaMap: Map<string, string>
): ProductOverviewData | undefined {
  let titleLines: string[] = []
  let subtitleLines: string[] = []
  let brandName = ''
  let description = ''
  const images: string[] = []
  let ctaButton: { text: string; url: string } | undefined

  for (const node of nodes) {
    // Parse heading (h1) - contains title with /n separator
    // Format: "Line1/n Line2/n Line3/n Line4"
    // First 2 lines = title (96px, olive green)
    // Last 2 lines = subtitle (48px, black)
    if (node.type === 'heading' && 'tag' in node && node.tag === 'h1') {
      const fullTitle = extractText(node)
      const allLines = fullTitle.split(/\n|\/n/).map(p => p.trim()).filter(Boolean)

      if (allLines.length >= 4) {
        // 4+ lines: first 2 are title, rest are subtitle
        titleLines = allLines.slice(0, 2)
        subtitleLines = allLines.slice(2)
      } else if (allLines.length === 3) {
        // 3 lines: first 2 are title, last 1 is subtitle
        titleLines = allLines.slice(0, 2)
        subtitleLines = allLines.slice(2)
      } else if (allLines.length === 2) {
        // 2 lines: first is title, second is subtitle
        titleLines = [allLines[0]]
        subtitleLines = [allLines[1]]
      } else {
        // 1 line: all title
        titleLines = allLines
      }
    }

    // Parse paragraph - contains brand name (bold) and description
    if (node.type === 'paragraph' && 'children' in node && Array.isArray(node.children)) {
      for (const child of node.children) {
        if (child.type === 'text') {
          const textNode = child as LexicalTextNode
          // format 1 = bold
          if (textNode.format === 1) {
            brandName = textNode.text
          } else if (textNode.format === 0 && textNode.text.trim()) {
            description = textNode.text
          }
        }
      }
    }

    // Parse image gallery
    if (node.type === 'custom-image-gallery') {
      const gallery = node as LexicalImageGalleryNode
      for (const img of gallery.data.images) {
        const url = mediaMap.get(img.image) || `/api/media/${img.image}`
        images.push(url)
      }
    }

    // Parse CTA button
    if (node.type === 'ctaButton') {
      const btn = node as LexicalCtaButtonNode
      ctaButton = {
        text: btn.data.text || 'Get A Solution',
        url: btn.data.url || '#',
      }
    }
  }

  if (!titleLines.length && !images.length) return undefined

  return {
    titleLines,
    subtitleLines,
    brandName,
    description,
    images,
    ctaButton,
  }
}

/**
 * Split content into sections based on quote markers (section dividers)
 */
function splitIntoSections(nodes: LexicalNode[]): Map<string, LexicalNode[]> {
  const sections = new Map<string, LexicalNode[]>()
  let currentSection: string | null = null
  let currentNodes: LexicalNode[] = []

  for (const node of nodes) {
    if (node.type === 'quote') {
      // Save previous section
      if (currentSection) {
        sections.set(currentSection, currentNodes)
      }
      // Start new section
      currentSection = extractText(node).trim()
      currentNodes = []
    } else if (node.type === 'horizontalrule') {
      // Horizontal rules also act as section dividers
      if (currentSection) {
        sections.set(currentSection, currentNodes)
        currentSection = null
        currentNodes = []
      }
    } else if (currentSection) {
      currentNodes.push(node)
    }
  }

  // Save last section
  if (currentSection) {
    sections.set(currentSection, currentNodes)
  }

  return sections
}

/**
 * Main parser function
 */
export function parseContentTranslation(
  contentTranslation: ContentTranslation | null | undefined,
  mediaMap: Map<string, string> = new Map(),
  reusableBlocksMap: Map<string, any> = new Map()
): ParsedProductSeriesContent {
  if (!contentTranslation?.root?.children) {
    return {}
  }

  const nodes = contentTranslation.root.children
  const sections = splitIntoSections(nodes)

  const result: ParsedProductSeriesContent = {}

  // Parse hero-carousel section
  const heroCarouselNodes = sections.get('hero-carousel')
  if (heroCarouselNodes) {
    result.heroCarousel = parseHeroCarousel(heroCarouselNodes, mediaMap)
  }

  // Parse product-series-overview section
  const overviewNodes = sections.get('product-series-overview')
  if (overviewNodes) {
    result.productOverview = parseProductOverview(overviewNodes, mediaMap)
  }

  // Parse core-selling-points section
  const coreSellingPointsNodes = sections.get('core-selling-points')
  if (coreSellingPointsNodes) {
    result.coreSellingPoints = parseCoreSellingPoints(coreSellingPointsNodes, mediaMap)
  }

  // Parse applications section
  const applicationsNodes = sections.get('applications')
  if (applicationsNodes) {
    result.applications = parseApplications(applicationsNodes, mediaMap)
  }

  // Parse contact-form section
  const contactFormNodes = sections.get('contact-form')
  if (contactFormNodes) {
    result.contactForm = parseContactForm(contactFormNodes, mediaMap)
  }

  // Parse more-series section
  const moreSeriesNodes = sections.get('more-series')
  if (moreSeriesNodes) {
    result.moreSeries = parseMoreSeries(moreSeriesNodes, mediaMap, reusableBlocksMap)
  }

  // Parse quote section
  const quoteNodes = sections.get('quote')
  if (quoteNodes) {
    result.quote = parseQuote(quoteNodes, mediaMap)
  }

  return result
}

/**
 * Parse core-selling-points section from content nodes
 */
function parseCoreSellingPoints(
  nodes: LexicalNode[],
  mediaMap: Map<string, string>
): CoreSellingPointsData | undefined {
  let title = ''
  const titleImages: string[] = []
  const techSpecImages: string[] = []
  let techSpecTitle = ''
  const techSpecKeys: string[] = []
  const techSpecValues: string[] = []
  let advantagesTitle = ''
  const advantagesImages: string[] = []
  const advantagesCategories: AdvantageCategory[] = []

  let currentField: string | null = null

  for (const node of nodes) {
    // Check for field markers (code format text in paragraph)
    if (node.type === 'paragraph') {
      const text = extractText(node).trim()
      if (text === 'title' || text === 'tech-spec-type' || text === 'product-advantages-and-features' ||
          text === 'tech-spec-type-key' || text === 'tech-spec-type-value') {
        currentField = text
        continue
      }
    }

    // Parse title area
    if (currentField === 'title') {
      // Parse heading for title text
      if (node.type === 'heading') {
        title = extractText(node)
      }
      // Parse image gallery for draggable images
      if (node.type === 'custom-image-gallery') {
        const gallery = node as LexicalImageGalleryNode
        for (const img of gallery.data.images) {
          const url = mediaMap.get(img.image) || `/api/media/${img.image}`
          titleImages.push(url)
        }
      }
    }

    // Parse tech-spec-type area
    if (currentField === 'tech-spec-type') {
      // Parse heading for tech spec title (e.g., "bathroom glass clip")
      if (node.type === 'heading') {
        techSpecTitle = extractText(node)
      }
      // Parse image gallery for left side images
      if (node.type === 'custom-image-gallery') {
        const gallery = node as LexicalImageGalleryNode
        for (const img of gallery.data.images) {
          const url = mediaMap.get(img.image) || `/api/media/${img.image}`
          techSpecImages.push(url)
        }
      }
    }

    // Parse tech-spec-type-key (ordered list of keys)
    if (currentField === 'tech-spec-type-key' && node.type === 'list') {
      const listNode = node as LexicalListNode
      techSpecKeys.push(...extractListItems(listNode))
    }

    // Parse tech-spec-type-value (ordered list of values)
    if (currentField === 'tech-spec-type-value' && node.type === 'list') {
      const listNode = node as LexicalListNode
      techSpecValues.push(...extractListItems(listNode))
    }

    // Parse product-advantages-and-features area
    if (currentField === 'product-advantages-and-features') {
      // Parse heading for advantages title
      if (node.type === 'heading') {
        advantagesTitle = extractText(node)
      }
      // Parse image gallery for category images
      if (node.type === 'custom-image-gallery') {
        const gallery = node as LexicalImageGalleryNode
        for (const img of gallery.data.images) {
          const url = mediaMap.get(img.image) || `/api/media/${img.image}`
          advantagesImages.push(url)
        }
      }
      // Parse list for categories - supports both ordered (ol) and unordered (ul) lists
      //
      // Structure 1: Ordered list with separate title and cards items
      //   ol
      //     1. Materials & Processes (category title - direct text, no nested ul)
      //     2. (empty text, but contains ul with cards)
      //     3. Safety Performance (category title)
      //     4. (contains ul with cards)
      //
      // Structure 2: Nested list (ol or ul) where each item is a category with nested cards
      //   ul/ol
      //     - Materials & Processes (category title + nested ul with cards)
      //         - Card Title 1
      //           - Card Content 1
      //         - Card Title 2
      //           - Card Content 2
      //     - Safety Performance (category title + nested ul with cards)
      //         - Card Title
      //           - Card Content
      if (node.type === 'list') {
        const listNode = node as LexicalListNode

        // Detect structure type by checking first few items
        // Structure 1: alternating title/cards items (title has no nested list, next item has nested list)
        // Structure 2: each item has both title text AND nested list
        let isStructure2 = false
        for (const listItem of listNode.children) {
          if (listItem.type === 'listitem') {
            const hasText = extractDirectText(listItem).length > 0
            let hasNestedList = false
            for (const child of listItem.children) {
              if (child.type === 'list') {
                hasNestedList = true
                break
              }
            }
            // If an item has BOTH text AND nested list, it's Structure 2
            if (hasText && hasNestedList) {
              isStructure2 = true
              break
            }
          }
        }

        if (isStructure2) {
          // Structure 2: Each listitem is a category (title + nested cards)
          for (const listItem of listNode.children) {
            if (listItem.type === 'listitem') {
              const categoryTitle = extractDirectText(listItem)
              const category: AdvantageCategory = { title: categoryTitle, cards: [] }

              // Find nested list containing cards
              for (const child of listItem.children) {
                if (child.type === 'list') {
                  const cards = parseCardsFromList(child as LexicalListNode)
                  category.cards.push(...cards)
                  break
                }
              }

              if (categoryTitle) {
                advantagesCategories.push(category)
              }
            }
          }
        } else {
          // Structure 1: Alternating title/cards items
          let currentCategory: AdvantageCategory | null = null

          for (const listItem of listNode.children) {
            if (listItem.type === 'listitem') {
              const itemTitle = extractDirectText(listItem)

              // Check if this item has a nested bullet list (contains cards)
              let nestedList: LexicalListNode | null = null
              for (const child of listItem.children) {
                if (child.type === 'list') {
                  nestedList = child as LexicalListNode
                  break
                }
              }

              if (nestedList) {
                // This listitem contains cards in a nested list
                const cards = parseCardsFromList(nestedList)
                if (currentCategory) {
                  currentCategory.cards.push(...cards)
                }
              } else if (itemTitle) {
                // This is a category title (has text, no nested list)
                // Save previous category if exists
                if (currentCategory) {
                  advantagesCategories.push(currentCategory)
                }
                // Start new category
                currentCategory = { title: itemTitle, cards: [] }
              }
            }
          }

          // Don't forget to save the last category
          if (currentCategory) {
            advantagesCategories.push(currentCategory)
          }
        }
      }

    }
  }

  // Build tech spec items from keys and values
  const techSpecItems: TechSpecItem[] = []
  for (let i = 0; i < Math.max(techSpecKeys.length, techSpecValues.length); i++) {
    techSpecItems.push({
      key: techSpecKeys[i] || '',
      value: techSpecValues[i] || '',
    })
  }

  if (!title && !titleImages.length && !techSpecItems.length) return undefined

  return {
    title,
    titleImages,
    techSpecImages,
    techSpecTitle,
    techSpecItems,
    advantagesTitle,
    advantagesImages,
    advantagesCategories,
  }
}

/**
 * Extract direct text from a list item (not nested list text)
 */
function extractDirectText(node: LexicalListItemNode): string {
  let text = ''
  for (const child of node.children) {
    if (child.type === 'text') {
      text += (child as LexicalTextNode).text
    } else if (child.type === 'paragraph') {
      text += extractText(child)
    }
  }
  return text.trim()
}

/**
 * Parse cards from a bullet list
 *
 * Supports two structures:
 *
 * Structure A (flat pairs): Title and content are separate list items
 *   ul
 *     - Card Title (bold text, no nested list)
 *     - (listitem with only nested ul containing card content)
 *     - Card Title 2
 *     - (nested content)
 *
 * Structure B (nested): Title and content in same item
 *   ul
 *     - Card Title (has nested ul with content)
 *         - Card content text
 *     - Card Title 2 (has nested ul with content)
 *         - Card content text
 */
function parseCardsFromList(listNode: LexicalListNode): AdvantageCard[] {
  const cards: AdvantageCard[] = []
  let pendingCardTitle: string | null = null

  for (const listItem of listNode.children) {
    if (listItem.type !== 'listitem') continue

    const itemText = extractDirectText(listItem)

    // Check if this item has a nested bullet list
    let nestedContent = ''
    let hasNestedList = false
    for (const child of listItem.children) {
      if (child.type === 'list') {
        hasNestedList = true
        const contentItems = extractListItems(child as LexicalListNode)
        nestedContent = contentItems.join(' ')
        break
      }
    }

    if (itemText && hasNestedList) {
      // Structure B: This item has BOTH title AND nested content
      cards.push({ title: itemText, content: nestedContent })
      pendingCardTitle = null
    } else if (hasNestedList && !itemText) {
      // Structure A: This is a content-only item (for previous title)
      if (pendingCardTitle) {
        cards.push({ title: pendingCardTitle, content: nestedContent })
        pendingCardTitle = null
      }
    } else if (itemText) {
      // This is a title-only item
      // If we had a pending title without content, save it first
      if (pendingCardTitle) {
        cards.push({ title: pendingCardTitle, content: '' })
      }
      pendingCardTitle = itemText
    }
  }

  // Don't forget last pending title
  if (pendingCardTitle) {
    cards.push({ title: pendingCardTitle, content: '' })
  }

  return cards
}

/**
 * Parse applications section from content nodes
 */
function parseApplications(
  nodes: LexicalNode[],
  mediaMap: Map<string, string>
): ApplicationsData | undefined {
  const images: string[] = []

  for (const node of nodes) {
    // Parse image gallery or carousel for application images
    if (node.type === 'custom-image-gallery') {
      const gallery = node as LexicalImageGalleryNode
      for (const img of gallery.data.images) {
        const url = mediaMap.get(img.image) || `/api/media/${img.image}`
        images.push(url)
      }
    }

    if (node.type === 'carousel') {
      const carousel = node as LexicalCarouselNode
      for (const slide of carousel.data.slides) {
        const imageUrl = mediaMap.get(slide.image.id) || `/api/media/${slide.image.id}`
        images.push(imageUrl)
      }
    }
  }

  if (images.length === 0) return undefined

  return { images }
}

/**
 * Parse contact-form section from content nodes
 */
function parseContactForm(
  nodes: LexicalNode[],
  mediaMap: Map<string, string>
): ContactFormData | undefined {
  let title = 'Contact Us Get A Quote'
  let backgroundImage = ''
  let helperTitle = "We'd love to hear from you!"
  let helperText = 'Share your needs, we will provide you with the best solution and quotation.'
  const productImages: string[] = []

  let currentField: string | null = null

  for (const node of nodes) {
    // Check for field markers
    if (node.type === 'paragraph') {
      const text = extractText(node).trim()
      if (text === 'contact-form-title' || text === 'contact-form-helper' ||
          text === 'contact-form-images' || text === 'contact-form-bg-image') {
        currentField = text
        continue
      }
    }

    // Parse title area
    if (currentField === 'contact-form-title') {
      if (node.type === 'heading') {
        title = extractText(node)
      }
    }

    // Parse background image
    if (currentField === 'contact-form-bg-image') {
      // Support singleImage type
      if (node.type === 'singleImage' && 'data' in node) {
        const singleImg = node as { type: 'singleImage'; data: { image: { id: string } } }
        if (singleImg.data?.image?.id) {
          backgroundImage = mediaMap.get(singleImg.data.image.id) || `/api/media/${singleImg.data.image.id}`
        }
      }
      // Also support custom-image-gallery
      if (node.type === 'custom-image-gallery') {
        const gallery = node as LexicalImageGalleryNode
        if (gallery.data.images.length > 0) {
          const img = gallery.data.images[0]
          backgroundImage = mediaMap.get(img.image) || `/api/media/${img.image}`
        }
      }
    }

    // Parse helper text area
    if (currentField === 'contact-form-helper') {
      if (node.type === 'heading') {
        helperTitle = extractText(node)
      }
      if (node.type === 'paragraph') {
        const text = extractText(node).trim()
        if (text && text !== 'contact-form-helper') {
          helperText = text
        }
      }
    }

    // Parse product images (tilted images on the left)
    if (currentField === 'contact-form-images') {
      if (node.type === 'custom-image-gallery') {
        const gallery = node as LexicalImageGalleryNode
        for (const img of gallery.data.images) {
          const url = mediaMap.get(img.image) || `/api/media/${img.image}`
          productImages.push(url)
        }
      }
      if (node.type === 'carousel') {
        const carousel = node as LexicalCarouselNode
        for (const slide of carousel.data.slides) {
          const imageUrl = mediaMap.get(slide.image.id) || `/api/media/${slide.image.id}`
          productImages.push(imageUrl)
        }
      }
    }

    // Parse block nodes (sidebar layout) - extract title, helper text, and images from mainContent
    if (node.type === 'block' && 'fields' in node) {
      const blockNode = node as { type: 'block'; fields: { mainContent?: { root?: { children?: LexicalNode[] } } } }
      const mainContentChildren = blockNode.fields?.mainContent?.root?.children || []
      for (const child of mainContentChildren) {
        // Extract title from h1
        if (child.type === 'heading' && (child as LexicalHeadingNode).tag === 'h1') {
          title = extractText(child)
        }
        // Extract helper title from h2
        if (child.type === 'heading' && (child as LexicalHeadingNode).tag === 'h2') {
          helperTitle = extractText(child)
        }
        // Extract helper text from paragraph (skip empty ones)
        if (child.type === 'paragraph') {
          const text = extractText(child).trim()
          if (text) {
            helperText = text
          }
        }
        // Extract product images
        if (child.type === 'custom-image-gallery') {
          const gallery = child as LexicalImageGalleryNode
          for (const img of gallery.data.images) {
            const url = mediaMap.get(img.image) || `/api/media/${img.image}`
            productImages.push(url)
          }
        }
      }
    }
  }

  return {
    title,
    backgroundImage,
    helperTitle,
    helperText,
    productImages,
  }
}

/**
 * Parse more-series section from content nodes
 * Note: This section uses reusableBlock which contains series data in a carousel
 */
function parseMoreSeries(
  nodes: LexicalNode[],
  mediaMap: Map<string, string>,
  reusableBlocksMap: Map<string, any> = new Map()
): MoreSeriesData | undefined {
  let title = 'More series'
  const series: MoreSeriesItem[] = []

  // Process all nodes (expanded or contained in reusableBlock)
  function processNodes(children: LexicalNode[]) {
    for (const child of children) {
      // Get title from h1 heading
      if (child.type === 'heading' && (child as LexicalHeadingNode).tag === 'h1') {
        title = extractText(child)
      }

      // Parse carousel for series items
      if (child.type === 'carousel' && (child as LexicalCarouselNode).data?.slides) {
        const carousel = child as LexicalCarouselNode
        for (const slide of carousel.data.slides) {
          // Handle various image formats
          const imageId = slide.image?.id ? String(slide.image.id) : 
                          (typeof slide.image === 'string' || typeof slide.image === 'number' ? String(slide.image) : '')
          const imageUrl = imageId ? (mediaMap.get(imageId) || `/api/media/${imageId}`) : ''

          series.push({
            name: slide.title || '',
            slug: slide.buttonLink?.replace('/product-series/', '').replace(/^\//, '') || '',
            image: imageUrl,
            link: slide.buttonLink || '#',
          })
        }
      }
    }
  }

  // Find reusableBlock or direct expanded children
  for (const node of nodes) {
    if (node.type === 'reusableBlock' || node.type === 'seriesReusableBlock') {
      const blockType = node.type
      const blockRef = (node as any).data?.[blockType]
      const blockId = typeof blockRef === 'object' && blockRef !== null ? String(blockRef.id) : String(blockRef)
      const blockContent = reusableBlocksMap.get(blockId)

      if (blockContent?.root?.children) {
        processNodes(blockContent.root.children)
      }
    } else {
      // Handle expanded nodes directly
      processNodes([node])
    }
  }

  return {
    title,
    series,
  }
}

/**
 * Parse quote section from content nodes
 */
function parseQuote(
  nodes: LexicalNode[],
  mediaMap: Map<string, string>
): QuoteData | undefined {
  let image = ''
  const quotes: string[] = []
  let ctaText = ''
  let ctaLink = ''

  for (const node of nodes) {
    // Parse singleImage for center image
    if (node.type === 'singleImage' && 'data' in node) {
      const singleImg = node as { type: 'singleImage'; data: { image: { id: string } } }
      if (singleImg.data?.image?.id) {
        image = mediaMap.get(singleImg.data.image.id) || `/api/media/${singleImg.data.image.id}`
      }
    }

    // Parse image gallery for center image
    if (node.type === 'custom-image-gallery') {
      const gallery = node as LexicalImageGalleryNode
      if (gallery.data.images.length > 0) {
        const img = gallery.data.images[0]
        image = mediaMap.get(img.image) || `/api/media/${img.image}`
      }
    }

    // Parse list for quotes
    if (node.type === 'list') {
      const listNode = node as LexicalListNode
      quotes.push(...extractListItems(listNode))
    }

    // Parse CTA button
    if (node.type === 'ctaButton') {
      const btn = node as LexicalCtaButtonNode
      ctaText = btn.data.text || 'Get professional quote'
      ctaLink = btn.data.url || '#'
    }
  }

  // Split quotes by /n for multi-line support
  const processedQuotes: string[] = []
  for (const quote of quotes) {
    const lines = quote.split(/\n|\/n/).map(line => line.trim()).filter(Boolean)
    processedQuotes.push(lines.join(' '))
  }

  return {
    image,
    quoteLeft: processedQuotes[0] || '',
    quoteRight: processedQuotes[1] || '',
    ctaText,
    ctaLink,
  }
}

/**
 * Build media map from API response
 * Maps media IDs to CDN URLs
 */
export function buildMediaMap(mediaItems: Array<{ id: number | string; url: string }>): Map<string, string> {
  const map = new Map<string, string>()
  for (const item of mediaItems) {
    map.set(String(item.id), convertToCDNUrl(item.url))
  }
  return map
}
