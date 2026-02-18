/**
 * CMS Section Data Parsing Utilities
 * Extracts structured data from Lexical content nodes
 */

import type { Locale } from "@/i18n.config"

// Type definitions
export interface LexicalNode {
  type: string
  children?: LexicalNode[]
  text?: string
  data?: any
  fields?: any
  relationTo?: string
  value?: any
}

export interface LexicalContent {
  root?: {
    children?: LexicalNode[]
  }
}

export interface ParsedSection {
  id?: string
  title?: string
  content: LexicalContent
}

// Helper: Extract text with linebreaks from children nodes
export function extractTextWithLinebreaks(children: LexicalNode[] | undefined): string {
  const parts: string[] = []
  for (const child of children || []) {
    if (child.type === 'text' && child.text) {
      parts.push(child.text)
    } else if (child.type === 'linebreak') {
      parts.push('\n')
    }
  }
  return parts.join('')
}

// Helper: Extract basic section data (title, subtitle, image)
// Supports shift+enter line breaks in title and subtitle
export function extractBasicSectionData(content: LexicalContent) {
  const nodes = content?.root?.children || []
  let title = ''
  let subtitle = ''
  let image: any = null
  let imageLink: { enableLink?: boolean; linkUrl?: string; openInNewTab?: boolean } | null = null

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    const nodeText = node.children?.[0]?.text || ''

    // Check for title marker
    if (node.type === 'paragraph' && nodeText.endsWith('-title')) {
      const nextNode = nodes[i + 1]
      if (nextNode?.type === 'heading' || nextNode?.type === 'paragraph') {
        title = extractTextWithLinebreaks(nextNode.children)
      }
    }

    // Check for subtitle marker
    if (node.type === 'paragraph' && nodeText.endsWith('-subtitle')) {
      const nextNode = nodes[i + 1]
      if (nextNode?.type === 'heading' || nextNode?.type === 'paragraph') {
        subtitle = extractTextWithLinebreaks(nextNode.children)
      }
    }

    // Check for image marker and get the singleImage block
    if (node.type === 'paragraph' && nodeText.endsWith('-image')) {
      const nextNode = nodes[i + 1]
      if (nextNode?.type === 'singleImage' && nextNode?.data?.image) {
        image = nextNode.data.image
        if (nextNode.data?.enableLink) {
          imageLink = {
            enableLink: true,
            linkUrl: nextNode.data.linkUrl,
            openInNewTab: nextNode.data.openInNewTab,
          }
        }
      }
    }
  }

  return { title, subtitle, image, imageLink }
}

// Parse Main Content Strength Section (badges below gallery)
// Supports carousel block for visual editing in CMS
export function parseMainContentStrengthData(content: LexicalContent) {
  const nodes = content?.root?.children || []
  const strengthItems: { icon?: string; image?: any; title: string; subtitle?: string }[] = []

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    const nodeText = node.children?.[0]?.text || ''

    // Check for iconList block (icon + title + subtitle list)
    if (node.type === 'iconList' && node.data?.items) {
      for (const item of node.data.items) {
        strengthItems.push({
          icon: item.icon || undefined,
          title: item.title || '',
          subtitle: item.subtitle || '',
        })
      }
    }

    // Check for carousel block (visual editing in CMS)
    if (node.type === 'carousel' && node.data?.slides) {
      for (const slide of node.data.slides) {
        // Title is the main text, description is the subtitle (supports line breaks)
        const title = slide.title || ''
        // Description can contain line breaks, preserve them
        const subtitle = slide.description || ''
        strengthItems.push({
          image: slide.image || null,
          title,
          subtitle,
        })
      }
    }

    // Fallback: Check for item marker with list (text-based)
    if (node.type === 'paragraph' && nodeText === 'main-content-strength-item') {
      const nextNode = nodes[i + 1]
      if (nextNode?.type === 'list' && nextNode.children) {
        for (const listItem of nextNode.children) {
          if (listItem.type === 'listitem') {
            const text = extractTextWithLinebreaks(listItem.children)
            if (text) {
              const parts = text.split('|')
              if (parts.length >= 2) {
                const iconPart = parts[0].startsWith('icon:') ? parts[0].replace('icon:', '') : 'users'
                const title = parts[0].startsWith('icon:') ? parts[1] : parts[0]
                const subtitle = parts[0].startsWith('icon:') ? parts[2] : parts[1]
                strengthItems.push({ icon: iconPart, title, subtitle })
              } else {
                const lines = text.split('\n')
                strengthItems.push({
                  icon: 'users',
                  title: lines[0] || '',
                  subtitle: lines[1] || '',
                })
              }
            }
          }
        }
      }
    }
  }

  return { items: strengthItems.length > 0 ? strengthItems : undefined }
}

// Parse Product Attributes Section
// Attributes are now embedded in rich text via iconList nodes (product-attributes-item marker)
export function parseProductAttributesData(content: LexicalContent) {
  const { title, image, imageLink } = extractBasicSectionData(content)
  const nodes = content?.root?.children || []
  const attributes: { icon?: string; title: string; description: string }[] = []

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]

    // Read from iconList block (icon + title + subtitle)
    if (node.type === 'iconList' && node.data?.items) {
      for (const item of node.data.items) {
        attributes.push({
          icon: item.icon || undefined,
          title: item.title || '',
          description: item.subtitle || '',
        })
      }
    }

    // Fallback: product-attributes-item marker with list
    if (node.type === 'paragraph' && node.children?.[0]?.text === 'product-attributes-item') {
      const nextNode = nodes[i + 1]
      if (nextNode?.type === 'list' && nextNode.children) {
        for (const listItem of nextNode.children) {
          if (listItem.type === 'listitem') {
            const text = extractTextWithLinebreaks(listItem.children)
            if (text) {
              const parts = text.split('|')
              if (parts.length >= 2) {
                attributes.push({
                  icon: parts[0].startsWith('icon:') ? parts[0].replace('icon:', '') : undefined,
                  title: parts[0].startsWith('icon:') ? (parts[1] || '') : parts[0],
                  description: parts[0].startsWith('icon:') ? (parts[2] || '') : (parts[1] || ''),
                })
              }
            }
          }
        }
      }
    }
  }

  return {
    title: title || 'Product attributes & technical processes',
    image,
    imageLink,
    attributes,
  }
}

// Parse Six Core Strengths Section
export function parseSixCoreStrengthsData(content: LexicalContent) {
  const { title, subtitle, image, imageLink } = extractBasicSectionData(content)
  const nodes = content?.root?.children || []
  const strengthItems: { title: string }[] = []

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    if (node.type === 'paragraph' && node.children?.[0]?.text === 'six-core-strengths-item') {
      const nextNode = nodes[i + 1]
      if (nextNode?.type === 'list' && nextNode.children) {
        for (let j = 0; j < Math.min(6, nextNode.children.length); j++) {
          const listItem = nextNode.children[j]
          // Use extractTextWithLinebreaks to handle linebreaks from shift+enter
          const itemText = extractTextWithLinebreaks(listItem?.children)?.trim()
          if (itemText) {
            strengthItems.push({ title: itemText })
          }
        }
      }
    }
  }

  return { title, subtitle, image, imageLink, items: strengthItems }
}

// Parse Product Features Section
export function parseProductFeaturesData(content: LexicalContent) {
  const { title, image, imageLink } = extractBasicSectionData(content)
  const nodes = content?.root?.children || []
  const featureItems: { title: string }[] = []

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    if (node.type === 'paragraph' && node.children?.[0]?.text === 'product-features-item') {
      const nextNode = nodes[i + 1]
      if (nextNode?.type === 'list' && nextNode.children) {
        for (let j = 0; j < Math.min(6, nextNode.children.length); j++) {
          const listItem = nextNode.children[j]
          const itemText = listItem?.children?.[0]?.text?.trim()
          if (itemText) {
            featureItems.push({ title: itemText })
          }
        }
      }
    }
  }

  return { title, image, imageLink, items: featureItems }
}

// Parse Product Detail Features Section (three-column layout)
export function parseProductDetailFeaturesData(content: LexicalContent) {
  const nodes = content?.root?.children || []
  let leftImage = null
  let imageLink: { enableLink?: boolean; linkUrl?: string; openInNewTab?: boolean } | null = null
  let rightTitle = ''
  const centerItems: { title: string; description?: string }[] = []

  for (const node of nodes) {
    if (node.type === 'block' && node.fields?.blockType === 'threeColumns') {
      // Left column: leftColumn (image)
      const leftChildren = node.fields.leftColumn?.root?.children || []
      for (const leftNode of leftChildren) {
        if (leftNode.type === 'singleImage' && leftNode.data?.image) {
          leftImage = leftNode.data.image
          if (leftNode.data?.enableLink) {
            imageLink = {
              enableLink: true,
              linkUrl: leftNode.data.linkUrl,
              openInNewTab: leftNode.data.openInNewTab,
            }
          }
        }
      }

      // Center column: centerColumn (cards with title + description)
      const centerChildren = node.fields.centerColumn?.root?.children || []
      for (const centerNode of centerChildren) {
        if (centerNode.type === 'list' && centerNode.children) {
          let pendingTitle = ''

          for (const listItem of centerNode.children) {
            if (listItem.type === 'listitem') {
              const firstChild = listItem.children?.[0]

              if (firstChild?.type === 'text' && firstChild.text) {
                if (pendingTitle) {
                  centerItems.push({ title: pendingTitle, description: '' })
                }
                pendingTitle = firstChild.text
              } else if (firstChild?.type === 'list' && firstChild.children?.[0]) {
                const nestedListItem = firstChild.children[0]
                const descText = nestedListItem.children?.[0]?.text || ''
                if (pendingTitle) {
                  centerItems.push({ title: pendingTitle, description: descText })
                  pendingTitle = ''
                }
              }
            }
          }

          if (pendingTitle) {
            centerItems.push({ title: pendingTitle, description: '' })
          }
        }
      }

      // Right column: rightColumn (title)
      const rightChildren = node.fields.rightColumn?.root?.children || []
      for (let i = 0; i < rightChildren.length; i++) {
        const rightNode = rightChildren[i]
        if (rightNode.type === 'paragraph') {
          const text = rightNode.children?.[0]?.text || ''
          if (text.endsWith('-title') && i + 1 < rightChildren.length) {
            const nextNode = rightChildren[i + 1]
            if (nextNode.type === 'paragraph' || nextNode.type === 'heading') {
              rightTitle = extractTextWithLinebreaks(nextNode.children)
              break
            }
          }
        }
      }
    }
  }

  return {
    title: rightTitle || 'Product Detail Features',
    items: centerItems,
    image: leftImage,
    imageLink,
  }
}

// Parse Product Core Advantages Section
export function parseProductCoreAdvantagesData(content: LexicalContent) {
  const nodes = content?.root?.children || []
  let sectionTitle = 'Product Core Advantages'
  const advantageImages: any[] = []
  const advantageItems: { title: string; description?: string }[] = []

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    const nodeText = node.children?.[0]?.text || ''

    // Check for title marker
    if (node.type === 'paragraph' && nodeText === 'product-core-advantages') {
      const nextNode = nodes[i + 1]
      if (nextNode?.type === 'heading' || nextNode?.type === 'paragraph') {
        sectionTitle = extractTextWithLinebreaks(nextNode.children) || sectionTitle
      }
    }

    // Check for image marker
    if (node.type === 'paragraph' && nodeText === 'product-core-advantages-image') {
      for (let j = i + 1; j < nodes.length; j++) {
        const imgNode = nodes[j]
        if (imgNode.type === 'custom-image-gallery' && imgNode.data?.images) {
          for (const imgItem of imgNode.data.images) {
            if (imgItem.image) {
              advantageImages.push(imgItem.image)
            }
          }
          break
        } else if (imgNode.type === 'singleImage' && imgNode.data?.image) {
          advantageImages.push(imgNode.data.image)
        } else if (imgNode.type !== 'singleImage' && imgNode.type !== 'custom-image-gallery') {
          break
        }
      }
    }

    // Check for item marker
    if (node.type === 'paragraph' && nodeText === 'product-core-advantages-item') {
      const nextNode = nodes[i + 1]
      if (nextNode?.type === 'list' && nextNode.children) {
        let pendingTitle = ''
        for (const listItem of nextNode.children) {
          if (listItem.type === 'listitem') {
            const firstChild = listItem.children?.[0]
            if (firstChild?.type === 'text' || ((listItem.children?.length ?? 0) > 0 && listItem.children?.some((c: any) => c.type === 'text'))) {
              if (pendingTitle) {
                advantageItems.push({ title: pendingTitle, description: '' })
              }
              pendingTitle = extractTextWithLinebreaks(listItem.children)
            } else if (firstChild?.type === 'list' && firstChild.children?.[0]) {
              const nestedListItem = firstChild.children[0]
              const descText = extractTextWithLinebreaks(nestedListItem.children)
              if (pendingTitle) {
                advantageItems.push({ title: pendingTitle, description: descText })
                pendingTitle = ''
              }
            }
          }
        }
        if (pendingTitle) {
          advantageItems.push({ title: pendingTitle, description: '' })
        }
      }
    }
  }

  return {
    title: sectionTitle,
    images: advantageImages,
    items: advantageItems,
  }
}

// Parse Product Applications Section
export function parseProductApplicationsData(content: LexicalContent) {
  const nodes = content?.root?.children || []
  let sectionTitle = 'Applicable Scenes'
  const applicationIds: string[] = []

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    const nodeText = node.children?.[0]?.text || ''

    // Check for title marker
    if (node.type === 'paragraph' && nodeText === 'applications-title') {
      const nextNode = nodes[i + 1]
      if (nextNode?.type === 'heading' || nextNode?.type === 'paragraph') {
        sectionTitle = extractTextWithLinebreaks(nextNode.children) || sectionTitle
      }
    }

    // Check for application IDs
    if (node.type === 'paragraph' && nodeText === 'applications-ids') {
      const nextNode = nodes[i + 1]
      if (nextNode?.type === 'list' && nextNode.children) {
        for (const listItem of nextNode.children) {
          const idText = listItem.children?.[0]?.text?.trim()
          if (idText) {
            applicationIds.push(idText)
          }
        }
      }
    }

    // Check for relationship block with applications
    if (node.type === 'relationship' && node.relationTo === 'applications' && node.value) {
      if (Array.isArray(node.value)) {
        node.value.forEach((app: any) => {
          if (app.id) applicationIds.push(String(app.id))
        })
      } else if (node.value.id) {
        applicationIds.push(String(node.value.id))
      }
    }
  }

  return {
    title: sectionTitle,
    applicationIds: applicationIds.length > 0 ? applicationIds : undefined,
  }
}

// Parse Busrom Main Features Section
export function parseBusromMainFeaturesData(content: LexicalContent) {
  const nodes = content?.root?.children || []
  let sectionTitle = 'Busrom Main Features'
  let sectionSubtitle = 'Increase New-Style To Your Life'
  const featureItems: { id: number; title: string }[] = []

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    const nodeText = node.children?.[0]?.text || ''

    // Check for title marker
    if (node.type === 'paragraph' && nodeText === 'busrom-main-features-title') {
      const nextNode = nodes[i + 1]
      if (nextNode?.type === 'heading' || nextNode?.type === 'paragraph') {
        sectionTitle = extractTextWithLinebreaks(nextNode.children) || sectionTitle
      }
    }

    // Check for subtitle marker
    if (node.type === 'paragraph' && nodeText === 'busrom-main-features-subtitle') {
      const nextNode = nodes[i + 1]
      if (nextNode?.type === 'heading' || nextNode?.type === 'paragraph') {
        sectionSubtitle = extractTextWithLinebreaks(nextNode.children) || sectionSubtitle
      }
    }

    // Check for item marker
    if (node.type === 'paragraph' && nodeText === 'busrom-main-features-item') {
      const nextNode = nodes[i + 1]
      if (nextNode?.type === 'list' && nextNode.children) {
        nextNode.children.forEach((listItem: any, idx: number) => {
          const itemText = listItem.children?.[0]?.text?.trim()
          if (itemText) {
            featureItems.push({ id: idx + 1, title: itemText })
          }
        })
      }
    }
  }

  return {
    title: sectionTitle,
    subtitle: sectionSubtitle,
    cards: featureItems.length > 0 ? featureItems : undefined,
  }
}

// Parse About Busrom Section
export function parseAboutBusromData(content: LexicalContent) {
  const nodes = content?.root?.children || []
  let sectionTitle = 'About Busrom'
  let sectionImage = null
  let imageLink: { enableLink?: boolean; linkUrl?: string; openInNewTab?: boolean } | null = null
  const serviceItems: { title: string; description: string }[] = []

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    const nodeText = node.children?.[0]?.text || ''

    // Check for title marker
    if (node.type === 'paragraph' && nodeText === 'about-busrom-title') {
      const nextNode = nodes[i + 1]
      if (nextNode?.type === 'heading' || nextNode?.type === 'paragraph') {
        sectionTitle = extractTextWithLinebreaks(nextNode.children) || sectionTitle
      }
    }

    // Check for image marker
    if (node.type === 'paragraph' && nodeText === 'about-busrom-image') {
      const nextNode = nodes[i + 1]
      if (nextNode?.type === 'singleImage' && nextNode?.data?.image) {
        sectionImage = nextNode.data.image
        if (nextNode.data?.enableLink) {
          imageLink = {
            enableLink: true,
            linkUrl: nextNode.data.linkUrl,
            openInNewTab: nextNode.data.openInNewTab,
          }
        }
      }
    }

    // Check for service items marker
    if (node.type === 'paragraph' && nodeText === 'about-busrom-item') {
      const nextNode = nodes[i + 1]
      if (nextNode?.type === 'list' && nextNode.children) {
        let pendingTitle = ''
        for (const listItem of nextNode.children) {
          if (listItem.type === 'listitem') {
            const firstChild = listItem.children?.[0]
            if (firstChild?.type === 'text' || ((listItem.children?.length ?? 0) > 0 && listItem.children?.some((c: any) => c.type === 'text'))) {
              if (pendingTitle) {
                serviceItems.push({ title: pendingTitle, description: '' })
              }
              pendingTitle = extractTextWithLinebreaks(listItem.children)
            } else if (firstChild?.type === 'list' && firstChild.children) {
              const descLines: string[] = []
              for (const nestedListItem of firstChild.children) {
                if (nestedListItem.type === 'listitem') {
                  const lineText = extractTextWithLinebreaks(nestedListItem.children)
                  if (lineText) {
                    descLines.push(lineText)
                  }
                }
              }
              if (pendingTitle) {
                serviceItems.push({ title: pendingTitle, description: descLines.join('\n') })
                pendingTitle = ''
              }
            }
          }
        }
        if (pendingTitle) {
          serviceItems.push({ title: pendingTitle, description: '' })
        }
      }
    }
  }

  return {
    title: sectionTitle,
    image: sectionImage,
    imageLink,
    services: serviceItems.length > 0 ? serviceItems : undefined,
  }
}

// Parse Busrom Support Section
export function parseBusromSupportData(content: LexicalContent) {
  const nodes = content?.root?.children || []
  let sectionTitle = 'Busrom Support'
  const supportItems: { id: number; title: string; description?: string; icon?: string }[] = []

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    const nodeText = node.children?.[0]?.text || ''

    // Check for title marker
    if (node.type === 'paragraph' && nodeText === 'busrom-support-title') {
      const nextNode = nodes[i + 1]
      if (nextNode?.type === 'heading' || nextNode?.type === 'paragraph') {
        sectionTitle = extractTextWithLinebreaks(nextNode.children) || sectionTitle
      }
    }

    // Check for item marker
    if (node.type === 'paragraph' && nodeText === 'busrom-support-item') {
      const nextNode = nodes[i + 1]
      if (nextNode?.type === 'list' && nextNode.children) {
        let pendingTitle = ''
        for (const listItem of nextNode.children) {
          if (listItem.type === 'listitem') {
            const firstChild = listItem.children?.[0]
            if (firstChild?.type === 'text' || ((listItem.children?.length ?? 0) > 0 && listItem.children?.some((c: any) => c.type === 'text'))) {
              if (pendingTitle) {
                supportItems.push({ id: supportItems.length + 1, title: pendingTitle, description: '' })
              }
              pendingTitle = extractTextWithLinebreaks(listItem.children)
            } else if (firstChild?.type === 'list' && firstChild.children?.[0]) {
              const nestedListItem = firstChild.children[0]
              const descText = extractTextWithLinebreaks(nestedListItem.children)
              if (pendingTitle) {
                supportItems.push({ id: supportItems.length + 1, title: pendingTitle, description: descText })
                pendingTitle = ''
              }
            }
          }
        }
        if (pendingTitle) {
          supportItems.push({ id: supportItems.length + 1, title: pendingTitle, description: '' })
        }
      }
    }
  }

  return {
    title: sectionTitle,
    cards: supportItems.length > 0 ? supportItems : undefined,
  }
}

// Parse Why Choose Us Section
export function parseWhyChooseUsData(content: LexicalContent) {
  const nodes = content?.root?.children || []
  let sectionTitle = 'Why Choose Us'
  let sectionSubtitle = 'Lost Wax Casting Process'
  const processItems: { title: string; image?: any }[] = []

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    const nodeText = node.children?.[0]?.text || ''

    // Check for title marker
    if (node.type === 'paragraph' && nodeText === 'why-choose-us-title') {
      const nextNode = nodes[i + 1]
      if (nextNode?.type === 'heading' || nextNode?.type === 'paragraph') {
        sectionTitle = extractTextWithLinebreaks(nextNode.children) || sectionTitle
      }
    }

    // Check for subtitle marker
    if (node.type === 'paragraph' && nodeText === 'why-choose-us-subtitle') {
      const nextNode = nodes[i + 1]
      if (nextNode?.type === 'heading' || nextNode?.type === 'paragraph') {
        sectionSubtitle = extractTextWithLinebreaks(nextNode.children) || sectionSubtitle
      }
    }

    // Check for process items from carousel
    if (node.type === 'paragraph' && nodeText === 'why-choose-us-item') {
      const nextNode = nodes[i + 1]
      if (nextNode?.type === 'carousel' && nextNode.data?.slides) {
        nextNode.data.slides.forEach((slide: any) => {
          processItems.push({
            title: slide.title || '',
            image: slide.image || null,
          })
        })
      }
    }
  }

  return {
    title: sectionTitle,
    subtitle: sectionSubtitle,
    items: processItems.length > 0 ? processItems : [
      { title: 'Model' },
      { title: 'Wax Shooting' },
      { title: 'Tree' },
      { title: 'Wax Model' },
      { title: 'Shell' },
      { title: 'Dewax' },
      { title: 'Dry' },
      { title: 'Casting' },
      { title: 'Heat Treatment' },
      { title: 'Shot Blasting' },
      { title: 'Inspection' },
      { title: 'Packing' },
    ],
  }
}

// Parse Why Choose Us Reason Section
export function parseWhyChooseUsReasonData(content: LexicalContent) {
  const nodes = content?.root?.children || []
  let nextButtonText = 'NEXT'
  const reasonItems: { title: string; description: string; image?: any }[] = []

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    const nodeText = node.children?.[0]?.text || ''

    // Check for button text marker
    if (node.type === 'paragraph' && nodeText === 'why-choose-us-reason-btn-text') {
      const nextNode = nodes[i + 1]
      if (nextNode?.type === 'paragraph' || nextNode?.type === 'heading') {
        nextButtonText = nextNode.children?.[0]?.text || 'NEXT'
      }
    }

    // Check for items from carousel
    if (node.type === 'paragraph' && nodeText === 'why-choose-us-reason-item') {
      const nextNode = nodes[i + 1]
      if (nextNode?.type === 'carousel' && nextNode.data?.slides) {
        nextNode.data.slides.forEach((slide: any) => {
          reasonItems.push({
            title: slide.title || '',
            description: slide.description || '',
            image: slide.image || null,
          })
        })
      }
    }
  }

  return {
    items: reasonItems.length > 0 ? reasonItems : [
      { title: 'Pioneering Original Design', description: 'At Busrom, innovation is at our core.' },
      { title: 'Premium Quality Materials', description: 'We use only the finest materials.' },
      { title: 'Expert Craftsmanship', description: 'Our skilled artisans ensure perfection.' },
    ],
    nextButtonText,
  }
}

// Parse Product Customization Flow Section
export function parseProductCustomizationFlowData(content: LexicalContent) {
  const nodes = content?.root?.children || []
  let sectionTitle = 'Product\nCustomization Flow'
  const descriptions: string[] = []
  const flowSteps: { id: number; title: string }[] = []

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    const nodeText = node.children?.[0]?.text || ''

    // Check for title marker
    if (node.type === 'paragraph' && nodeText === 'product-customization-flow-title') {
      const nextNode = nodes[i + 1]
      if (nextNode?.type === 'heading' || nextNode?.type === 'paragraph') {
        sectionTitle = extractTextWithLinebreaks(nextNode.children) || sectionTitle
      }
    }

    // Check for description marker
    if (node.type === 'paragraph' && nodeText === 'product-customization-flow-desc') {
      const nextNode = nodes[i + 1]
      if (nextNode?.type === 'list' && nextNode.children) {
        for (const listItem of nextNode.children) {
          if (listItem.type === 'listitem') {
            const textParts: string[] = []
            for (const para of listItem.children || []) {
              for (const child of para.children || []) {
                if (child.type === 'text' && child.text) {
                  textParts.push(child.text)
                }
              }
            }
            if (textParts.length > 0) {
              descriptions.push(textParts.join(''))
            }
          }
        }
      }
    }

    // Check for steps marker
    if (node.type === 'paragraph' && nodeText === 'product-customization-flow-item') {
      const nextNode = nodes[i + 1]
      if (nextNode?.type === 'list' && nextNode.children) {
        let stepId = 1
        for (const listItem of nextNode.children) {
          if (listItem.type === 'listitem') {
            const textParts: string[] = []
            for (const para of listItem.children || []) {
              for (const child of para.children || []) {
                if (child.type === 'text' && child.text) {
                  textParts.push(child.text)
                }
              }
            }
            if (textParts.length > 0) {
              flowSteps.push({ id: stepId++, title: textParts.join('') })
            }
          }
        }
      }
    }
  }

  return {
    title: sectionTitle,
    descriptions: descriptions.length > 0 ? descriptions : undefined,
    steps: flowSteps.length > 0 ? flowSteps : undefined,
  }
}

// Parse Transportation Section
export function parseTransportationData(content: LexicalContent) {
  const nodes = content?.root?.children || []
  let sectionTitle = 'transportation'
  let sectionImage = null
  let imageLink: { enableLink?: boolean; linkUrl?: string; openInNewTab?: boolean } | null = null

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    const nodeText = node.children?.[0]?.text || ''

    // Check for title marker
    if (node.type === 'paragraph' && nodeText === 'transportation-title') {
      const nextNode = nodes[i + 1]
      if (nextNode?.type === 'heading' || nextNode?.type === 'paragraph') {
        sectionTitle = extractTextWithLinebreaks(nextNode.children) || sectionTitle
      }
    }

    // Check for image marker
    if (node.type === 'paragraph' && nodeText === 'transportation-image') {
      const nextNode = nodes[i + 1]
      if (nextNode?.type === 'singleImage' && nextNode?.data?.image) {
        sectionImage = nextNode.data.image
        if (nextNode.data?.enableLink) {
          imageLink = {
            enableLink: true,
            linkUrl: nextNode.data.linkUrl,
            openInNewTab: nextNode.data.openInNewTab,
          }
        }
      }
    }
  }

  return {
    title: sectionTitle,
    image: sectionImage,
    imageLink,
  }
}

// Parse Lexical content into pre-form and post-form sections
export function parseLexicalSections(lexicalContent: any) {
  let preFormSections: ParsedSection[] = []
  let formBlock: any = null
  let postFormSections: ParsedSection[] = []

  if (lexicalContent?.root?.children) {
    const nodes = lexicalContent.root.children
    let currentSection: ParsedSection | null = null
    let foundForm = false

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i]

      // Found the form block (support both 'formBlock' type and block with blockType='form-block')
      // Only use the FIRST formBlock as the separator
      if (!foundForm && (node.type === 'formBlock' || (node.type === 'block' && node.fields?.blockType === 'form-block'))) {
        if (currentSection) {
          preFormSections.push(currentSection)
          currentSection = null
        }
        formBlock = node
        foundForm = true
        continue
      }

      // Before form: collect sections based on quote nodes with text or code
      if (!foundForm) {
        if (node.type === 'quote') {
          const firstChild = node.children?.[0]
          if (firstChild && (firstChild.type === 'text' || firstChild.type === 'code')) {
            const titleText = firstChild.type === 'text'
              ? firstChild.text
              : firstChild.children?.[0]?.text

            const nextNode = nodes[i + 1]
            if (nextNode && (nextNode.type === 'formBlock' || (nextNode.type === 'block' && nextNode.fields?.blockType === 'form-block'))) {
              continue
            }

            if (currentSection) {
              preFormSections.push(currentSection)
            }
            currentSection = {
              title: titleText || 'Section',
              content: {
                root: {
                  type: 'root',
                  format: '',
                  indent: 0,
                  version: 1,
                  children: [],
                  direction: null,
                } as any,
              },
            }
            continue
          }
        }

        if (currentSection && node.type !== 'horizontalrule') {
          (currentSection.content.root!.children as any[]).push(node)
        }
      } else {
        // After form: Parse sections based on horizontalrule + quote pattern
        if (node.type === 'horizontalrule' && i + 1 < nodes.length) {
          const nextNode = nodes[i + 1]
          if (nextNode.type === 'quote') {
            const firstChild = nextNode.children?.[0]
            if (firstChild && (firstChild.type === 'text' || firstChild.type === 'code')) {
              if (currentSection) {
                postFormSections.push(currentSection)
              }
              const sectionId = firstChild.type === 'text'
                ? firstChild.text
                : firstChild.children?.[0]?.text
              currentSection = {
                id: sectionId || 'Section',
                content: {
                  root: {
                    type: 'root',
                    format: '',
                    indent: 0,
                    version: 1,
                    children: [],
                    direction: null,
                  } as any,
                },
              }
              i++
              continue
            }
          }
        }

        if (currentSection && node.type !== 'horizontalrule') {
          (currentSection.content.root!.children as any[]).push(node)
        }
      }
    }

    // Don't forget to add the last section
    if (currentSection) {
      if (!foundForm) {
        preFormSections.push(currentSection)
      } else {
        postFormSections.push(currentSection)
      }
    }
  }

  return { preFormSections, formBlock, postFormSections }
}
