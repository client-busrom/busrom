"use client"

import { useState } from "react"
import type { Locale } from "@/i18n.config"
import { FormBlock } from "./FormBlock"

// Type definitions for content nodes
interface TextNode {
  text: string
  bold?: boolean
  italic?: boolean
  underline?: boolean
}

interface BaseNode {
  type: string
  children: (TextNode | BaseNode)[]
}

interface BlockquoteNode extends BaseNode {
  type: "blockquote"
}

interface CodeNode extends BaseNode {
  type: "code"
}

interface ParagraphNode extends BaseNode {
  type: "paragraph"
}

interface DividerNode extends BaseNode {
  type: "divider"
}

interface ComponentBlockNode extends BaseNode {
  type: "component-block"
  component: string
  props: any
}

type ContentNode = BlockquoteNode | CodeNode | ParagraphNode | DividerNode | ComponentBlockNode

// Section that contains a title and content blocks
interface ContentSection {
  title: string
  content: ContentNode[]
}

interface ContentRendererProps {
  content: ContentNode[]
  locale: Locale
}

// Parse content into sections (before form, form, after form)
function parseContentSections(content: ContentNode[]) {
  const preFormSections: ContentSection[] = []
  let formBlock: ComponentBlockNode | null = null
  const postFormContent: ContentNode[] = []

  let currentSection: ContentSection | null = null
  let foundForm = false

  for (let i = 0; i < content.length; i++) {
    const node = content[i]

    // Found the form block
    if (node.type === "component-block" && node.component === "formBlock") {
      if (currentSection) {
        preFormSections.push(currentSection)
        currentSection = null
      }
      formBlock = node as ComponentBlockNode
      foundForm = true
      continue
    }

    // Before form: collect blockquote sections
    if (!foundForm) {
      // Check if this is a blockquote with code (section title)
      if (
        node.type === "blockquote" &&
        node.children[0]?.type === "code" &&
        node.children[0].children[0]?.text
      ) {
        // Save previous section if exists
        if (currentSection) {
          preFormSections.push(currentSection)
        }

        // Start new section
        const titleText = (node.children[0].children[0] as TextNode).text
        currentSection = {
          title: titleText,
          content: [],
        }
        continue
      }

      // Add content to current section
      if (currentSection && node.type !== "divider") {
        currentSection.content.push(node)
      }
    } else {
      // After form: collect all content
      postFormContent.push(node)
    }
  }

  // Save last pre-form section
  if (currentSection && !foundForm) {
    preFormSections.push(currentSection)
  }

  return { preFormSections, formBlock, postFormContent }
}

// Render a text node with formatting
function renderTextNode(node: TextNode, index: number) {
  let text = node.text

  if (node.bold) {
    return <strong key={index}>{text}</strong>
  }
  if (node.italic) {
    return <em key={index}>{text}</em>
  }
  if (node.underline) {
    return <u key={index}>{text}</u>
  }

  return <span key={index}>{text}</span>
}

// Render a content node
function renderContentNode(node: ContentNode, index: number): React.ReactNode {
  switch (node.type) {
    case "paragraph":
      return (
        <p key={index} className="mb-4 text-gray-700 leading-relaxed">
          {node.children.map((child, i) =>
            typeof child === "object" && "text" in child ? renderTextNode(child, i) : renderContentNode(child, i)
          )}
        </p>
      )

    case "blockquote":
      return (
        <blockquote key={index} className="border-l-4 border-brand-secondary pl-4 italic text-gray-600 mb-4">
          {node.children.map((child, i) => renderContentNode(child, i))}
        </blockquote>
      )

    case "code":
      return (
        <code key={index} className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
          {node.children.map((child, i) =>
            typeof child === "object" && "text" in child ? child.text : renderContentNode(child, i)
          )}
        </code>
      )

    case "divider":
      return <hr key={index} className="my-8 border-gray-200" />

    default:
      return null
  }
}

// Modal component for displaying section content
function SectionModal({
  title,
  content,
  isOpen,
  onClose,
}: {
  title: string
  content: ContentNode[]
  isOpen: boolean
  onClose: () => void
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50" onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors text-2xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="p-6">{content.map((node, i) => renderContentNode(node, i))}</div>
      </div>
    </div>
  )
}

// Main content renderer component
export function ContentRenderer({ content, locale }: ContentRendererProps) {
  const [openModalIndex, setOpenModalIndex] = useState<number | null>(null)

  const { preFormSections, formBlock, postFormContent } = parseContentSections(content)

  // Debug logging
  console.log("ContentRenderer parsed:", {
    preFormSectionsCount: preFormSections.length,
    hasFormBlock: !!formBlock,
    formBlock,
    postFormContentCount: postFormContent.length,
  })

  return (
    <div className="space-y-8">
      {/* Pre-form collapsible sections */}
      {preFormSections.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {preFormSections.map((section, index) => (
            <button
              key={index}
              onClick={() => setOpenModalIndex(index)}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:border-brand-secondary hover:shadow-md transition-all text-left group"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-brand-secondary transition-colors">
                  {section.title}
                </h3>
                <svg
                  className="w-5 h-5 text-gray-400 group-hover:text-brand-secondary transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Modals for pre-form sections */}
      {preFormSections.map((section, index) => (
        <SectionModal
          key={index}
          title={section.title}
          content={section.content}
          isOpen={openModalIndex === index}
          onClose={() => setOpenModalIndex(null)}
        />
      ))}

      {/* Form block */}
      {formBlock && (
        <div className="bg-gray-50 rounded-lg p-8">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Product Inquiry</h2>
            {formBlock.props?.formConfig ? (
              <FormBlock formConfig={formBlock.props.formConfig} locale={locale} />
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <p className="text-yellow-700">Form configuration missing</p>
                <pre className="text-xs mt-2 overflow-auto">{JSON.stringify(formBlock, null, 2)}</pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Post-form content (details) */}
      {postFormContent.length > 0 && (
        <div className="bg-white rounded-lg p-8">
          <div className="prose max-w-none">{postFormContent.map((node, i) => renderContentNode(node, i))}</div>
        </div>
      )}
    </div>
  )
}
