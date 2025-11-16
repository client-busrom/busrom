/**
 * Document Renderer Configuration
 *
 * DEPRECATED: This file is not currently in use due to React 19 incompatibility.
 *
 * TODO: Re-enable when @keystone-6/document-renderer supports React 19
 */

import React from 'react'
import type { JSX } from 'react'
// Commented out due to React 19 incompatibility
// import { DocumentRendererProps } from '@keystone-6/document-renderer'
import { NoticeBox } from './NoticeBox'
import { ContactFormBlock } from '../ContactFormBlock'
import Image from 'next/image'
import * as LucideIcons from 'lucide-react'
import Link from 'next/link'

// Temporary type definition to replace DocumentRendererProps
type DocumentRendererProps = {
  componentBlocks?: Record<string, (props: any) => JSX.Element | null>
  renderers?: Record<string, (props: any) => JSX.Element | null>
}

/**
 * Helper function to get Lucide icon component
 */
function getLucideIcon(iconName: string) {
  const Icon = (LucideIcons as any)[iconName]
  return Icon || LucideIcons.HelpCircle
}

/**
 * Component Block Renderers
 *
 * Maps component block names to their rendering functions.
 */
export const componentBlockRenderers: DocumentRendererProps['componentBlocks'] = {
  /**
   * Link Jump Renderer
   *
   * Renders a link with a single icon on the left side (for both title and link).
   */
  linkJump: (props) => {
    const { iconType, lucideIconName, mediaIconId, title, linkText, linkUrl, openInNewTab } = props

    const renderIcon = () => {
      if (iconType === 'lucide') {
        const IconComponent = getLucideIcon(lucideIconName as string)
        return <IconComponent size={24} className="text-gray-700 flex-shrink-0" />
      } else if (mediaIconId) {
        // For media icons, you'll need to fetch the media URL from your CMS
        // This is a placeholder - implement based on your data structure
        return (
          <div className="w-6 h-6 flex-shrink-0 relative">
            <Image
              src={mediaIconId as string}
              alt="icon"
              fill
              className="object-cover rounded"
            />
          </div>
        )
      }
      return null
    }

    return (
      <div className="my-6">
        <div className="flex gap-3 items-center p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
          {/* Left side: Icon (vertically centered) */}
          <div>
            {renderIcon()}
          </div>

          {/* Right side: Title and Link */}
          <div className="flex-1 flex flex-col gap-1">
            {/* Title */}
            {title && (
              <div className="font-semibold text-gray-900">
                {title}
              </div>
            )}

            {/* Link */}
            <div>
              <Link
                href={linkUrl as string}
                target={openInNewTab ? '_blank' : undefined}
                rel={openInNewTab ? 'noopener noreferrer' : undefined}
                className="text-blue-600 hover:text-blue-800 underline font-medium"
              >
                {linkText}
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  },

  /**
   * Marquee Links Renderer
   *
   * Renders an auto-scrolling marquee of link items.
   */
  marqueeLinks: (props) => {
    const { speed, items } = props

    const speedMap = {
      slow: 30,
      medium: 20,
      fast: 10,
    }

    const animationDuration = speedMap[speed as keyof typeof speedMap] || speedMap.medium

    return (
      <div className="my-8 overflow-hidden bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg py-4">
        <div
          className="flex gap-6 animate-marquee"
          style={{
            animation: `marquee ${animationDuration}s linear infinite`,
          }}
        >
          {/* Render items twice for seamless loop */}
          {[...items, ...items].map((item: any, index: number) => {
            const { iconType, lucideIconName, mediaIconId, linkText, linkUrl, openInNewTab } = item

            const renderIcon = () => {
              if (iconType === 'lucide') {
                const IconComponent = getLucideIcon(lucideIconName)
                return <IconComponent size={20} className="text-purple-600 flex-shrink-0" />
              } else if (mediaIconId) {
                return (
                  <div className="w-5 h-5 flex-shrink-0 relative">
                    <Image
                      src={mediaIconId}
                      alt="icon"
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                )
              }
              return null
            }

            return (
              <div
                key={index}
                className="flex items-center gap-2 pr-4 border-r-2 border-purple-200 flex-shrink-0"
              >
                {renderIcon()}
                <Link
                  href={linkUrl}
                  target={openInNewTab ? '_blank' : undefined}
                  rel={openInNewTab ? 'noopener noreferrer' : undefined}
                  className="font-medium text-purple-700 hover:text-purple-900 whitespace-nowrap"
                >
                  {linkText}
                </Link>
              </div>
            )
          })}
        </div>

        <style jsx>{`
          @keyframes marquee {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }
        `}</style>
      </div>
    )
  },
  /**
   * Notice Box Renderer
   *
   * Renders info/success/warning/error notice boxes with lucide-react icons.
   */
  notice: (props) => {
    const { intent } = props

    return (
      <NoticeBox intent={intent as 'info' | 'success' | 'warning' | 'error'}>
        {props.content}
      </NoticeBox>
    )
  },

  /**
   * Single Image Renderer
   *
   * Renders a single image with optional caption.
   */
  singleImage: (props) => {
    const { image, imageSrc, text, alt } = props
    const imageUrl = image?.data?.file?.url || imageSrc

    if (!imageUrl) return null

    return (
      <figure className="my-8">
        <div className="relative w-full aspect-video">
          <Image
            src={imageUrl}
            alt={alt || text || 'Image'}
            fill
            className="object-cover rounded-lg"
          />
        </div>
        {text && (
          <figcaption className="mt-2 text-sm text-center text-gray-600">
            {text}
          </figcaption>
        )}
      </figure>
    )
  },

  /**
   * Image Gallery Renderer
   *
   * Renders a grid of images with captions.
   */
  imageGallery: (props) => {
    const { images, caption } = props

    if (!images || images.length === 0) return null

    return (
      <div className="my-8">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((item: any, index: number) => {
            const imageUrl = item.image?.data?.file?.url
            if (!imageUrl) return null

            return (
              <div key={index} className="relative aspect-square">
                <Image
                  src={imageUrl}
                  alt={item.caption || `Image ${index + 1}`}
                  fill
                  className="object-cover rounded-lg"
                />
                {item.caption && (
                  <p className="mt-1 text-xs text-gray-600">{item.caption}</p>
                )}
              </div>
            )
          })}
        </div>
        {caption && (
          <p className="mt-4 text-sm text-center text-gray-600">{caption}</p>
        )}
      </div>
    )
  },

  /**
   * Hero Renderer
   *
   * Renders a hero section with image, title, content, and optional CTA.
   */
  hero: (props) => {
    const { image, imageSrc, title, content, cta } = props
    const imageUrl = image?.data?.file?.url || imageSrc

    return (
      <div className="my-12 rounded-xl overflow-hidden border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
        {imageUrl && (
          <div className="relative w-full h-64">
            <Image
              src={imageUrl}
              alt="Hero"
              fill
              className="object-cover"
            />
          </div>
        )}
        <div className="p-8">
          <h2 className="text-3xl font-bold text-blue-900 mb-4">{title}</h2>
          <div className="text-gray-700 mb-6 prose prose-sm max-w-none">
            {content}
          </div>
          {cta && cta.text && cta.href && (
            <a
              href={cta.href}
              className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              {cta.text}
            </a>
          )}
        </div>
      </div>
    )
  },

  /**
   * CTA Button Renderer
   *
   * Renders a call-to-action button.
   */
  ctaButton: (props) => {
    const { text, url, variant } = props

    const variantStyles = {
      primary: 'bg-blue-600 hover:bg-blue-700 text-white',
      secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
      outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50',
    }

    return (
      <div className="my-6">
        <a
          href={url}
          className={`inline-block px-6 py-3 font-semibold rounded-lg transition-colors ${
            variantStyles[variant as keyof typeof variantStyles] || variantStyles.primary
          }`}
        >
          {text}
        </a>
      </div>
    )
  },

  /**
   * Video Embed Renderer
   *
   * Renders an embedded video with optional caption.
   */
  videoEmbed: (props) => {
    const { url, caption } = props

    if (!url) return null

    // Extract video ID from YouTube URL
    const getYouTubeId = (url: string) => {
      const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/)
      return match?.[1]
    }

    const videoId = getYouTubeId(url)

    return (
      <div className="my-8">
        <div className="relative w-full aspect-video rounded-lg overflow-hidden">
          {videoId ? (
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          ) : (
            <video src={url} controls className="w-full h-full" />
          )}
        </div>
        {caption && (
          <p className="mt-2 text-sm text-center text-gray-600">{caption}</p>
        )}
      </div>
    )
  },

  /**
   * Carousel Renderer
   *
   * Renders a carousel/slider of images with optional buttons.
   */
  carousel: (props) => {
    const { items, caption } = props

    if (!items || items.length === 0) return null

    return (
      <div className="my-8">
        <div className="overflow-x-auto flex gap-4 pb-4 snap-x snap-mandatory">
          {items.map((item: any, index: number) => {
            const imageUrl = item.image?.data?.file?.url
            if (!imageUrl) return null

            return (
              <div key={index} className="flex-shrink-0 w-80 snap-center">
                <div className="relative aspect-video">
                  <Image
                    src={imageUrl}
                    alt={item.text || `Slide ${index + 1}`}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
                {item.title && (
                  <h3 className="mt-3 font-semibold text-gray-900">{item.title}</h3>
                )}
                {item.text && (
                  <p className="mt-2 text-sm text-gray-700">{item.text}</p>
                )}
                {/* Button - renders below description, left-aligned */}
                {item.showButton && item.buttonText && item.buttonLink && (
                  <div className="mt-3">
                    <Link
                      href={item.buttonLink}
                      target={item.buttonOpenInNewTab ? '_blank' : undefined}
                      rel={item.buttonOpenInNewTab ? 'noopener noreferrer' : undefined}
                      className="inline-block px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {item.buttonText}
                    </Link>
                  </div>
                )}
              </div>
            )
          })}
        </div>
        {caption && (
          <p className="mt-4 text-sm text-center text-gray-600">{caption}</p>
        )}
      </div>
    )
  },

  /**
   * Checklist Renderer
   *
   * Renders a checklist with checkable items.
   */
  checklist: (props) => {
    return (
      <ul className="my-6 space-y-2">
        {props.items?.map((item: any, index: number) => (
          <li key={index} className="flex items-start gap-3">
            <span className="flex-shrink-0 mt-1">
              {item.checked ? (
                <span className="text-green-600">✓</span>
              ) : (
                <span className="text-gray-400">○</span>
              )}
            </span>
            <span>{item.content}</span>
          </li>
        ))}
      </ul>
    )
  },

  /**
   * Reusable Block Reference Renderer
   *
   * Note: This requires fetching the reusable block data from GraphQL.
   * You'll need to implement this based on your data fetching strategy.
   */
  reusableBlockReference: (props) => {
    // TODO: Implement reusable block fetching and rendering
    return (
      <div className="my-4 p-4 bg-gray-100 rounded-lg text-gray-600">
        Reusable Block: {props.block?.data?.name || 'Unknown'}
      </div>
    )
  },

  /**
   * Form Block Renderer
   *
   * Renders a contact form based on FormConfig from CMS.
   * Simply pass the formConfig reference and it renders the complete form.
   */
  formBlock: (props) => {
    return <ContactFormBlock formConfig={props.formConfig} />
  },
}

/**
 * Block Renderers
 *
 * Customizes how standard blocks are rendered.
 */
export const blockRenderers: DocumentRendererProps['renderers'] = {
  block: {
    // Customize paragraph rendering
    paragraph: ({ children, textAlign }) => {
      return (
        <p className={`mb-4 ${textAlign ? `text-${textAlign}` : ''}`}>
          {children}
        </p>
      )
    },

    // Customize heading rendering
    heading: ({ level, children, textAlign }) => {
      const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements
      const sizes = {
        1: 'text-4xl font-bold mb-6',
        2: 'text-3xl font-bold mb-5',
        3: 'text-2xl font-semibold mb-4',
        4: 'text-xl font-semibold mb-3',
        5: 'text-lg font-semibold mb-2',
        6: 'text-base font-semibold mb-2',
      }

      return (
        <HeadingTag
          className={`${sizes[level as keyof typeof sizes]} ${
            textAlign ? `text-${textAlign}` : ''
          }`}
        >
          {children}
        </HeadingTag>
      )
    },

    // Customize blockquote rendering
    blockquote: ({ children }) => {
      return (
        <blockquote className="my-6 pl-6 border-l-4 border-gray-300 italic text-gray-700">
          {children}
        </blockquote>
      )
    },

    // Customize code block rendering
    code: ({ children }) => {
      return (
        <pre className="my-4 p-4 bg-gray-900 text-gray-100 rounded-lg overflow-x-auto">
          <code>{children}</code>
        </pre>
      )
    },

    // Customize list rendering
    list: ({ type, children }) => {
      if (type === 'ordered') {
        return <ol className="my-4 ml-6 list-decimal space-y-2">{children}</ol>
      }
      return <ul className="my-4 ml-6 list-disc space-y-2">{children}</ul>
    },

    // Customize divider rendering
    divider: () => {
      return <hr className="my-8 border-gray-300" />
    },
  },

  inline: {
    // Customize bold rendering
    bold: ({ children }) => {
      return <strong className="font-bold">{children}</strong>
    },

    // Customize italic rendering
    italic: ({ children }) => {
      return <em className="italic">{children}</em>
    },

    // Customize code rendering
    code: ({ children }) => {
      return (
        <code className="px-1.5 py-0.5 bg-gray-100 text-gray-800 rounded text-sm font-mono">
          {children}
        </code>
      )
    },

    // Customize link rendering
    link: ({ children, href }) => {
      return (
        <a
          href={href}
          className="text-blue-600 hover:text-blue-800 underline"
          target={href.startsWith('http') ? '_blank' : undefined}
          rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
        >
          {children}
        </a>
      )
    },
  },
}
