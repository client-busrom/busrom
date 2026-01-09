"use client"

import React, { useMemo } from "react"
import { ServiceValueSection } from "@/components/service/ServiceValueSection"
import { BrandServicesSection } from "@/components/service/BrandServicesSection"
import { ContactFormSection } from "@/components/service/ContactFormSection"
import { ApplicationsSection } from "@/components/service/ApplicationsSection"
import { SimpleCtaSection } from "@/components/service/SimpleCtaSection"

interface MediaObject {
  id: string
  url: string
  alt?: string
  variants?: {
    thumbnail?: string
    small?: string
    medium?: string
    large?: string
    xlarge?: string
  }
  cropFocalPoint?: { x: number; y: number } | null
  width?: number
  height?: number
}

interface CarouselSlide {
  title: string
  description: string
  caption?: string
  link?: string
  image: MediaObject | null
}

interface ServiceOverviewTemplateProps {
  locale: string
  pageContent: {
    title: string
    content?: {
      root?: {
        children?: any[]
      }
      document?: any[]
    } | null
    contentTranslation?: {
      root?: {
        children?: any[]
      }
    } | null
    mediaData?: Record<string, MediaObject>
  }
}

// Helper function to extract data after a specific marker
function extractAfterMarker(children: any[], markerId: string): any[] {
  let foundMarker = false
  const result: any[] = []

  for (const node of children) {
    // Look for paragraph with marker text (format 16 = code style)
    if (node.type === "paragraph" || node.type === "quote") {
      const text = node.children?.[0]?.text || ""
      if (text === markerId) {
        foundMarker = true
        continue
      }
      // If we find a new marker, stop
      if (foundMarker && node.children?.[0]?.format === 16 && text.includes("-")) {
        break
      }
    }

    if (foundMarker) {
      result.push(node)
    }
  }

  return result
}

// Helper function to extract carousel data from Lexical content after a marker
function extractCarouselAfterMarker(
  children: any[],
  markerId: string,
  mediaData: Record<string, MediaObject>
): CarouselSlide[] {
  const nodesAfterMarker = extractAfterMarker(children, markerId)

  for (const node of nodesAfterMarker) {
    if (node.type === "carousel" && node.data?.slides) {
      return node.data.slides.map((slide: any) => {
        const imageId = typeof slide.image === "string"
          ? slide.image
          : slide.image?.id

        return {
          title: slide.title || "",
          description: slide.description || "",
          caption: slide.caption || "",
          link: slide.link || "",
          image: imageId ? (mediaData[imageId] || null) : null,
        }
      })
    }
  }
  return []
}

// Helper function to extract single image after a marker
function extractImageAfterMarker(
  children: any[],
  markerId: string,
  mediaData: Record<string, MediaObject>
): MediaObject | null {
  const nodesAfterMarker = extractAfterMarker(children, markerId)

  for (const node of nodesAfterMarker) {
    if (node.type === "singleImage" && node.data?.image) {
      const image = node.data.image
      const imageId = typeof image === "string" ? image : image?.id
      if (imageId && mediaData[imageId]) {
        return mediaData[imageId]
      }
    }
  }
  return null
}

// Helper function to extract images from gallery after a marker
function extractGalleryImagesAfterMarker(
  children: any[],
  markerId: string,
  mediaData: Record<string, MediaObject>
): MediaObject[] {
  const nodesAfterMarker = extractAfterMarker(children, markerId)
  const images: MediaObject[] = []

  for (const node of nodesAfterMarker) {
    if (node.type === "custom-image-gallery" && node.data?.images) {
      for (const img of node.data.images) {
        const imageId = typeof img.image === "string" ? img.image : img.image?.id
        if (imageId && mediaData[imageId]) {
          images.push(mediaData[imageId])
        }
      }
      break
    }
  }
  return images
}

// Helper function to extract section title from Lexical content
function extractSectionTitle(children: any[], sectionId: string): string | null {
  let foundSection = false

  for (const node of children) {
    // Look for quote with section ID
    if (node.type === "quote") {
      const text = node.children?.[0]?.text || ""
      if (text === sectionId) {
        foundSection = true
        continue
      }
    }

    // After finding the section marker, look for heading
    if (foundSection && node.type === "heading") {
      return node.children?.[0]?.text || null
    }
  }

  return null
}

// Helper function to extract text after a marker (for descriptions)
function extractTextAfterMarker(children: any[], markerId: string): string | null {
  const nodesAfterMarker = extractAfterMarker(children, markerId)

  for (const node of nodesAfterMarker) {
    if (node.type === "paragraph" && node.children?.[0]?.text) {
      return node.children[0].text
    }
  }
  return null
}

// Helper function to extract text from listitem children (handles linebreak)
function extractListItemText(children: any[]): string {
  if (!children) return ""
  return children
    .map((child: any) => {
      if (child.type === "text") return child.text || ""
      if (child.type === "linebreak") return "\n"
      return ""
    })
    .join("")
}

// Helper function to extract brand service categories from nested list
interface ServiceItem {
  title: string
  description: string
  images?: MediaObject[]
}

interface ServiceCategory {
  title: string
  items: ServiceItem[]
}

// Helper function to extract images for a specific service item marker
function extractItemImages(
  children: any[],
  categoryIndex: number,
  itemIndex: number,
  mediaData: Record<string, MediaObject>
): MediaObject[] {
  // Marker format: brand-service-item-{category}-{item} (1-indexed)
  const markerId = `brand-service-item-${categoryIndex + 1}-${itemIndex + 1}`
  const nodesAfterMarker = extractAfterMarker(children, markerId)

  for (const node of nodesAfterMarker) {
    if (node.type === "custom-image-gallery" && node.data?.images) {
      const images: MediaObject[] = []
      for (const img of node.data.images) {
        const imageId = typeof img.image === "string" ? img.image : img.image?.id
        if (imageId && mediaData[imageId]) {
          images.push(mediaData[imageId])
        }
      }
      return images
    }
  }
  return []
}

function extractBrandServiceCategories(
  children: any[],
  mediaData: Record<string, any>
): ServiceCategory[] {
  const categories: ServiceCategory[] = []

  // Find the list after "brand-service-item" marker
  const nodesAfterMarker = extractAfterMarker(children, "brand-service-item")

  for (const node of nodesAfterMarker) {
    if (node.type === "list" && node.tag === "ol") {
      // Process top-level list items
      const listItems = node.children || []
      let currentCategory: ServiceCategory | null = null
      let categoryIndex = 0

      for (const listItem of listItems) {
        if (listItem.type !== "listitem") continue

        const firstChild = listItem.children?.[0]

        // Check if this is a category title (has text/linebreak children directly)
        if (firstChild?.type === "text" || firstChild?.type === "linebreak") {
          // This is a category title
          if (currentCategory) {
            categories.push(currentCategory)
            categoryIndex++
          }
          currentCategory = {
            title: extractListItemText(listItem.children),
            items: [],
          }
        }
        // Check if this contains nested list (items for current category)
        else if (firstChild?.type === "list") {
          if (currentCategory) {
            // Process nested list for items
            const nestedListItems = firstChild.children || []
            let currentItem: ServiceItem | null = null
            let itemIndex = 0

            for (const nestedItem of nestedListItems) {
              if (nestedItem.type !== "listitem") continue

              const nestedFirstChild = nestedItem.children?.[0]

              // Item title (indent=1, has text directly)
              if (nestedFirstChild?.type === "text") {
                if (currentItem) {
                  // Get images for the previous item before pushing
                  currentItem.images = extractItemImages(children, categoryIndex, itemIndex - 1, mediaData)
                  currentCategory.items.push(currentItem)
                }
                currentItem = {
                  title: extractListItemText(nestedItem.children),
                  description: "",
                }
                itemIndex++
              }
              // Item description (indent=1, contains nested list with description at indent=2)
              else if (nestedFirstChild?.type === "list") {
                if (currentItem) {
                  const descListItem = nestedFirstChild.children?.[0]
                  if (descListItem?.type === "listitem") {
                    currentItem.description = extractListItemText(descListItem.children)
                  }
                }
              }
            }

            // Push last item with images
            if (currentItem) {
              currentItem.images = extractItemImages(children, categoryIndex, itemIndex - 1, mediaData)
              currentCategory.items.push(currentItem)
            }
          }
        }
      }

      // Push last category
      if (currentCategory) {
        categories.push(currentCategory)
      }

      break // Only process first list
    }
  }

  return categories
}

export function ServiceOverviewTemplate({ locale, pageContent }: ServiceOverviewTemplateProps) {
  // API transforms contentTranslation to content, so check both
  const contentChildren = useMemo(() =>
    pageContent.content?.root?.children || pageContent.contentTranslation?.root?.children || [],
    [pageContent]
  )

  const mediaData = pageContent.mediaData || {}

  // Extract Service Value section data
  const { serviceValueTitle, serviceValueBgImage, serviceValueSlides } = useMemo(() => {
    const title = extractSectionTitle(contentChildren, "service-value") || "Service Value"
    const bgImage = extractImageAfterMarker(contentChildren, "service-value-image-bg", mediaData)
    const slides = extractCarouselAfterMarker(contentChildren, "service-value-item", mediaData)

    return {
      serviceValueTitle: title,
      serviceValueBgImage: bgImage,
      serviceValueSlides: slides,
    }
  }, [contentChildren, mediaData])

  // Extract Brand Services section data
  const brandServicesData = useMemo(() => {
    const title = extractSectionTitle(contentChildren, "brand-service") || "Brand Services"
    const description = extractTextAfterMarker(contentChildren, "brand-service-description") ||
      "Our service blends creative strategy with flawless execution to define your story, design your identity, and amplify your presence."

    // Get images from gallery after "brand-service-image" marker
    const galleryImages = extractGalleryImagesAfterMarker(contentChildren, "brand-service-image", mediaData)
    const topImage = galleryImages[0] || null
    const bottomImage = galleryImages[1] || null

    const categories = extractBrandServiceCategories(contentChildren, mediaData)

    // If no categories from CMS, use placeholder data
    const finalCategories = categories.length > 0 ? categories : [
      {
        title: "Pre-Purchase Support",
        items: [
          { title: "Project Consultation & Requirements Gathering", description: "Our team works closely with you to understand your specific needs and project requirements." },
          { title: "Transparent Quotation List", description: "The Busrom team will provide a detailed breakdown of product unit prices, packaging fees, estimated shipping costs, and applicable taxes." },
          { title: "Customization & OEM/ODM", description: "We offer flexible customization options to meet your unique branding and product requirements." },
          { title: "Free Samples & Inspection", description: "Request free samples to evaluate quality before committing to larger orders." },
          { title: "Multi-Channel Communication", description: "Stay connected with our team through multiple communication channels for seamless collaboration." },
        ],
      },
      {
        title: "Purchase Support",
        items: [
          { title: "Order Processing", description: "Streamlined order processing for efficient fulfillment." },
          { title: "Quality Assurance", description: "Rigorous quality checks at every stage of production." },
          { title: "Production Updates", description: "Regular updates on your order's production status." },
          { title: "Shipping Coordination", description: "Professional logistics coordination for timely delivery." },
          { title: "Documentation Support", description: "Complete documentation for customs and compliance." },
        ],
      },
      {
        title: "Post-Purchase Support",
        items: [
          { title: "Technical Support", description: "Expert technical assistance for all your product needs." },
          { title: "Warranty Service", description: "Comprehensive warranty coverage for peace of mind." },
          { title: "Spare Parts Supply", description: "Ready access to spare parts and components." },
          { title: "Maintenance Guide", description: "Detailed maintenance instructions for product longevity." },
          { title: "Feedback Collection", description: "We value your feedback to continuously improve our services." },
        ],
      },
    ]

    return {
      title,
      description,
      decorativeImages: {
        top: topImage,
        bottom: bottomImage,
      },
      categories: finalCategories,
    }
  }, [contentChildren, mediaData])

  // Extract Contact Form section data
  const contactFormData = useMemo(() => {
    const bgImage = extractImageAfterMarker(contentChildren, "contact-form-bg-image", mediaData)
    const formTitle = extractTextAfterMarker(contentChildren, "contact-form-title")
    const formDescription = extractTextAfterMarker(contentChildren, "contact-form-description")

    return {
      backgroundImage: bgImage,
      title: formTitle,
      description: formDescription,
    }
  }, [contentChildren, mediaData])

  // Extract Applications section data
  const applicationsData = useMemo(() => {
    // Extract title list after "applications-title" marker
    const nodesAfterMarker = extractAfterMarker(contentChildren, "applications-title")
    let titleLine1 = "Busrom"
    let titleLine2 = "For You"
    let highlightText = "Cases"

    for (const node of nodesAfterMarker) {
      if (node.type === "list") {
        const items = node.children || []
        if (items[0]?.children) {
          // First item might have multiple lines
          const text = extractListItemText(items[0].children)
          const lines = text.split("\n").map((l: string) => l.trim()).filter(Boolean)
          if (lines.length >= 2) {
            titleLine1 = lines[0]
            titleLine2 = lines[1]
          } else if (lines.length === 1) {
            titleLine1 = lines[0]
          }
        }
        if (items[1]?.children) {
          highlightText = extractListItemText(items[1].children).trim()
        }
        break
      }
    }

    // Extract fast link after "applications-fast-link" marker
    const linkNodes = extractAfterMarker(contentChildren, "applications-fast-link")
    let viewMoreLink = "/applications"
    let viewMoreText = "VIEW MORE"

    for (const node of linkNodes) {
      if (node.type === "fast-link" && node.data) {
        viewMoreText = node.data.title || "VIEW MORE"
        viewMoreLink = node.data.link || "/applications"
        break
      }
    }

    // Extract application IDs from applicationCarousel block after "applications-fast-link" marker
    // The applicationCarousel node is placed after the fast-link, not directly after "applications"
    const carouselNodes = extractAfterMarker(contentChildren, "applications-fast-link")
    let applicationIds: string[] = []

    for (const node of carouselNodes) {
      if (node.type === "applicationCarousel" && node.data?.applications) {
        applicationIds = node.data.applications.map((app: string | { id: string | number }) =>
          typeof app === "string" ? app : String(app.id)
        )
        break
      }
    }

    return {
      titleLine1,
      titleLine2,
      highlightText,
      viewMoreLink,
      viewMoreText,
      applicationIds,
    }
  }, [contentChildren])

  // Extract Simple CTA section data
  const simpleCtaData = useMemo(() => {
    const title = extractTextAfterMarker(contentChildren, "simple-cta-title") || "Transform Ideas into Reality"
    const description = extractTextAfterMarker(contentChildren, "simple-cta-description") ||
      "Busrom's business scope covers 100+ countries, not only has the ability to do private service for our wholesalers and dealers but also offers bespoke plans for designers, builders, and homeowners."
    const ctaText = extractTextAfterMarker(contentChildren, "simple-cta-text") || "Talk to Our Specialists for Tailored Solutions."
    const buttonText = extractTextAfterMarker(contentChildren, "simple-cta-button-text") || "Get Started"
    const buttonLink = extractTextAfterMarker(contentChildren, "simple-cta-button-link") || "/contact-us"

    // Get images from gallery after "simple-cta-image" marker
    const images = extractGalleryImagesAfterMarker(contentChildren, "simple-cta-image", mediaData)

    return {
      title,
      description,
      ctaText,
      buttonText,
      buttonLink,
      images,
    }
  }, [contentChildren, mediaData])

  return (
    <div className="min-h-screen bg-background" data-header-theme="dark">
      {/* Service Value Section */}
      <ServiceValueSection
        title={serviceValueTitle}
        slides={serviceValueSlides}
        backgroundImage={serviceValueBgImage}
        autoplay={true}
        interval={5}
      />

      {/* Brand Services Section */}
      <BrandServicesSection
        title={brandServicesData.title}
        description={brandServicesData.description}
        categories={brandServicesData.categories}
        decorativeImages={brandServicesData.decorativeImages}
      />

      {/* Contact Form Section */}
      <ContactFormSection
        locale={locale as any}
        formName="service-overview-form"
        backgroundImage={contactFormData.backgroundImage}
      />

      {/* Applications Section */}
      <ApplicationsSection
        locale={locale}
        titleLine1={applicationsData.titleLine1}
        titleLine2={applicationsData.titleLine2}
        highlightText={applicationsData.highlightText}
        viewMoreLink={applicationsData.viewMoreLink.startsWith('/') ? `/${locale}${applicationsData.viewMoreLink}` : applicationsData.viewMoreLink}
        viewMoreText={applicationsData.viewMoreText}
        applicationIds={applicationsData.applicationIds}
      />

      {/* Simple CTA Section */}
      <SimpleCtaSection
        locale={locale}
        title={simpleCtaData.title}
        description={simpleCtaData.description}
        ctaText={simpleCtaData.ctaText}
        buttonText={simpleCtaData.buttonText}
        buttonLink={simpleCtaData.buttonLink}
        images={simpleCtaData.images}
      />
    </div>
  )
}
