"use client"

import { DynamicForm } from "@/components/forms/DynamicForm"
import type { Locale } from "@/i18n.config"

interface DocumentNode {
  type: string
  [key: string]: any
}

interface DocumentRendererProps {
  document: DocumentNode[]
  locale: Locale
  className?: string
}

export function DocumentRenderer({ document, locale, className }: DocumentRendererProps) {
  if (!document || !Array.isArray(document)) {
    return null
  }

  return (
    <div className={className}>
      {document.map((node, index) => (
        <DocumentNode key={index} node={node} locale={locale} />
      ))}
    </div>
  )
}

function DocumentNode({ node, locale }: { node: DocumentNode; locale: Locale }) {
  switch (node.type) {
    case 'paragraph':
      return <Paragraph node={node} />

    case 'heading':
      return <Heading node={node} />

    case 'layout':
      return <Layout node={node} locale={locale} />

    case 'layout-area':
      return <LayoutArea node={node} locale={locale} />

    case 'component-block':
      return <ComponentBlock node={node} locale={locale} />

    case 'link':
      return <Link node={node} />

    case 'list':
      return <List node={node} locale={locale} />

    case 'list-item':
      return <ListItem node={node} locale={locale} />

    case 'code':
      return <CodeBlock node={node} />

    case 'blockquote':
      return <Blockquote node={node} locale={locale} />

    case 'divider':
      return <hr className="my-8 border-brand-accent-border" />

    default:
      // Unknown node type, skip
      return null
  }
}

// Paragraph
function Paragraph({ node }: { node: DocumentNode }) {
  if (!node.children || node.children.length === 0) {
    return <p className="mb-4">&nbsp;</p>
  }

  return (
    <p className="mb-4 text-brand-text-black leading-relaxed">
      {node.children.map((child: any, index: number) => (
        <TextNode key={index} node={child} />
      ))}
    </p>
  )
}

// Heading
function Heading({ node }: { node: DocumentNode }) {
  const level = node.level || 1
  const className = "font-anaheim font-bold text-brand-text-black mb-4"

  const sizeClasses = {
    1: "text-4xl mb-6",
    2: "text-3xl mb-5",
    3: "text-2xl",
    4: "text-xl",
    5: "text-lg",
    6: "text-base",
  }

  const Tag = `h${level}` as keyof JSX.IntrinsicElements

  return (
    <Tag className={`${className} ${sizeClasses[level as keyof typeof sizeClasses]}`}>
      {node.children?.map((child: any, index: number) => (
        <TextNode key={index} node={child} />
      ))}
    </Tag>
  )
}

// Layout (columns)
function Layout({ node, locale }: { node: DocumentNode; locale: Locale }) {
  const layout = node.layout || [1, 1]
  const gridCols = layout.length === 2 ? "grid-cols-1 lg:grid-cols-2" :
                   layout.length === 3 ? "grid-cols-1 lg:grid-cols-3" : "grid-cols-1"

  return (
    <div className={`grid ${gridCols} gap-8 mb-8`}>
      {node.children?.map((child: DocumentNode, index: number) => (
        <DocumentNode key={index} node={child} locale={locale} />
      ))}
    </div>
  )
}

// Layout Area (column content)
function LayoutArea({ node, locale }: { node: DocumentNode; locale: Locale }) {
  return (
    <div>
      {node.children?.map((child: DocumentNode, index: number) => (
        <DocumentNode key={index} node={child} locale={locale} />
      ))}
    </div>
  )
}

// Component Block
function ComponentBlock({ node, locale }: { node: DocumentNode; locale: Locale }) {
  const component = node.component

  switch (component) {
    case 'formBlock':
      // Extract formConfig ID from props
      const formConfigId = node.props?.formConfig?.id

      if (!formConfigId) {
        console.warn('FormBlock component missing formConfig ID')
        return null
      }

      // We need to fetch the form config by ID and get its name
      // For now, we'll use a hook to fetch this
      return <FormBlockRenderer formConfigId={formConfigId} locale={locale} />

    default:
      console.warn(`Unknown component block type: ${component}`)
      return null
  }
}

// Form Block Renderer (fetches form config and renders form)
function FormBlockRenderer({ formConfigId, locale }: { formConfigId: string; locale: Locale }) {
  const [formName, setFormName] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    // Fetch form config to get the form name
    const fetchFormConfig = async () => {
      try {
        // We need to query the form config by ID
        // For simplicity, we'll assume the form name is "contact-us-form"
        // In a real implementation, you'd fetch this from the API
        setFormName('contact-us-form')
      } catch (error) {
        console.error('Error fetching form config:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchFormConfig()
  }, [formConfigId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-8 h-8 border-2 border-brand-secondary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!formName) {
    return null
  }

  return <DynamicForm formName={formName} locale={locale} className="space-y-6" />
}

// Import React for useState
import React from 'react'

// Link
function Link({ node }: { node: DocumentNode }) {
  const href = node.href || '#'

  return (
    <a
      href={href}
      className="text-brand-accent-gold hover:text-brand-text-black underline transition-colors"
      target={href.startsWith('http') ? '_blank' : undefined}
      rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
    >
      {node.children?.map((child: any, index: number) => (
        <TextNode key={index} node={child} />
      ))}
    </a>
  )
}

// List
function List({ node, locale }: { node: DocumentNode; locale: Locale }) {
  const ListTag = node.listType === 'ordered' ? 'ol' : 'ul'
  const className = node.listType === 'ordered'
    ? "list-decimal list-inside mb-4 space-y-2 text-brand-text-black"
    : "list-disc list-inside mb-4 space-y-2 text-brand-text-black"

  return (
    <ListTag className={className}>
      {node.children?.map((child: DocumentNode, index: number) => (
        <DocumentNode key={index} node={child} locale={locale} />
      ))}
    </ListTag>
  )
}

// List Item
function ListItem({ node, locale }: { node: DocumentNode; locale: Locale }) {
  return (
    <li>
      {node.children?.map((child: DocumentNode, index: number) => (
        <DocumentNode key={index} node={child} locale={locale} />
      ))}
    </li>
  )
}

// Code Block
function CodeBlock({ node }: { node: DocumentNode }) {
  const code = node.children?.map((child: any) => child.text).join('') || ''

  return (
    <pre className="bg-gray-100 border border-brand-accent-border p-4 rounded mb-4 overflow-x-auto">
      <code className="text-sm font-mono text-brand-text-black">{code}</code>
    </pre>
  )
}

// Blockquote
function Blockquote({ node, locale }: { node: DocumentNode; locale: Locale }) {
  return (
    <blockquote className="border-l-4 border-brand-accent-gold pl-6 py-2 mb-4 italic text-brand-accent-gold">
      {node.children?.map((child: DocumentNode, index: number) => (
        <DocumentNode key={index} node={child} locale={locale} />
      ))}
    </blockquote>
  )
}

// Text Node (handles inline formatting)
function TextNode({ node }: { node: any }) {
  if (typeof node === 'string') {
    return <>{node}</>
  }

  if (node.type === 'link') {
    return <Link node={node} />
  }

  let text = node.text || ''
  let element = <>{text}</>

  // Apply formatting
  if (node.bold) {
    element = <strong className="font-bold">{element}</strong>
  }
  if (node.italic) {
    element = <em className="italic">{element}</em>
  }
  if (node.underline) {
    element = <u className="underline">{element}</u>
  }
  if (node.strikethrough) {
    element = <s className="line-through">{element}</s>
  }
  if (node.code) {
    element = <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">{element}</code>
  }

  return element
}
