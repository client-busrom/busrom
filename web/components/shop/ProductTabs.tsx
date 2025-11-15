"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import type { ProductAttribute } from "@/lib/types/product"

interface ProductTabsProps {
  description: any // Document JSON
  attributes?: ProductAttribute[]
  specifications?: any
  locale: string
}

type TabId = "description" | "specifications" | "attributes" | "certifications"

export function ProductTabs({
  description,
  attributes,
  specifications,
  locale,
}: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("description")

  const tabs: Array<{ id: TabId; label: string }> = [
    { id: "description", label: "Description" },
    { id: "specifications", label: "Specifications" },
    { id: "attributes", label: "Attributes" },
    { id: "certifications", label: "Certifications" },
  ]

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Tab Headers */}
      <div className="flex border-b border-gray-200 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-6 py-4 font-medium text-sm whitespace-nowrap transition-colors",
              "border-b-2 -mb-px",
              activeTab === tab.id
                ? "border-brand-secondary text-brand-secondary"
                : "border-transparent text-gray-600 hover:text-gray-900"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {/* Description Tab */}
        {activeTab === "description" && (
          <div className="prose max-w-none">
            {description ? (
              // TODO: Render Document JSON content
              // For now, show as plain text
              <div className="text-gray-700">
                {typeof description === "string"
                  ? description
                  : JSON.stringify(description, null, 2)}
              </div>
            ) : (
              <p className="text-gray-500 italic">No description available</p>
            )}
          </div>
        )}

        {/* Specifications Tab */}
        {activeTab === "specifications" && (
          <div>
            {specifications && Object.keys(specifications).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(specifications).map(([key, value]) => (
                  <div key={key} className="flex py-2 border-b border-gray-100 last:border-0">
                    <span className="font-medium text-gray-700 w-1/3">{key}:</span>
                    <span className="text-gray-600 w-2/3">{String(value)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No specifications available</p>
            )}
          </div>
        )}

        {/* Attributes Tab */}
        {activeTab === "attributes" && (
          <div>
            {attributes && attributes.length > 0 ? (
              <div className="space-y-4">
                {attributes.map((attr, index) => {
                  const key = attr.key?.[locale] || attr.key?.["en"] || "Attribute"
                  const value = attr.value?.[locale] || attr.value?.["en"] || "-"

                  return (
                    <div key={index} className="flex py-2 border-b border-gray-100 last:border-0">
                      <span className="font-medium text-gray-700 w-1/3">{key}:</span>
                      <span className="text-gray-600 w-2/3">{value}</span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-gray-500 italic">No attributes available</p>
            )}
          </div>
        )}

        {/* Certifications Tab */}
        {activeTab === "certifications" && (
          <div>
            <p className="text-gray-500 italic">
              Certification information coming soon
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
