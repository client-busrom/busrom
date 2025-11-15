/**
 * Document Editor with Translation Features
 *
 * Custom field component for the Document Editor that adds:
 * 1. "Copy from English" button - Copies English content structure
 * 2. "AI Translate" button - Translates all text nodes to target language
 *
 * Used in ProductSeriesContentTranslation to streamline translation workflow.
 */

import React, { useState } from "react";
import { FieldProps } from "@keystone-6/core/types";
import { FieldContainer, FieldLabel } from "@keystone-ui/fields";
import { Stack } from "@keystone-ui/core";

// Import the controller and Field component from the default document field
import { controller as baseController, Field as DocumentField } from "@keystone-6/fields-document/views";

// Import component blocks
import * as componentBlocksModule from "../component-blocks";

// ==================================================================
// Component Block Translation Whitelist
// ==================================================================
// Define which fields in component blocks should be translated
// Format: { componentName: [field1, field2, ...] }
// Note: Component names are in camelCase (e.g., "singleImage", not "single-image")
const COMPONENT_TRANSLATABLE_FIELDS: Record<string, string[]> = {
  "singleImage": ["text"], // Only translate caption, not image reference
  "imageGallery": ["caption"], // Only translate gallery caption (NOT array items - handled separately)
  "carousel": ["caption"], // Only translate carousel caption (NOT array items - handled separately)
  "quote": [], // Quote uses child fields (title, content, attribution)
  "notice": [], // Notice uses child content (content)
  "ctaButton": ["text"], // Translate button text (NOT url - keep original)
  "videoEmbed": ["caption"], // Only translate video caption
  "hero": [], // Hero uses child fields (title, content, cta.text) - NOT regular props
  "checklist": [], // Checklist uses child content, not props
  "reusableBlockReference": [], // Don't translate block references
  "documentTemplate": [], // Don't translate template references
};

// GraphQL query for fetching templates
const GET_TEMPLATES_QUERY = `
  query GetDocumentTemplates($where: DocumentTemplateWhereInput) {
    documentTemplates(where: $where, orderBy: { updatedAt: desc }) {
      id
      key
      name
      description
      category
      content {
        document
      }
    }
  }
`;

// ==================================================================
// Helper: Extract translatable texts from Document structure
// ==================================================================
// Extracts:
// 1. Plain text nodes
// 2. Whitelisted fields from component blocks (e.g., image captions)
// 3. Text fields in arrays (e.g., gallery captions, carousel items)
// Preserves: Image references, media IDs, and other non-text data
function extractTexts(document: any[]): string[] {
  const texts: string[] = [];

  // Helper: Extract text from a value (handles strings and nested arrays/objects)
  function extractFromValue(value: any, path: string = "") {
    if (typeof value === "string" && value.trim()) {
      console.log(`[extractTexts] Extracting ${path}: "${value.substring(0, 50)}..."`);
      texts.push(value);
    } else if (Array.isArray(value)) {
      // Handle arrays (like imageGallery.images, carousel.items)
      value.forEach((item, idx) => {
        if (item && typeof item === "object") {
          // Extract text fields from each array item
          Object.entries(item).forEach(([key, val]) => {
            // Skip relationship fields (have 'id' property)
            if (val && typeof val === "object" && "id" in val) {
              return; // Skip image/media references
            }
            extractFromValue(val, `${path}[${idx}].${key}`);
          });
        }
      });
    }
  }

  function traverse(node: any) {
    if (!node) return;

    // Handle component blocks - extract ALL text fields from props
    if (node.type === "component-block") {
      const componentName = node.component;
      const translatableFields = COMPONENT_TRANSLATABLE_FIELDS[componentName] || [];

      console.log(`[extractTexts] Component block: ${componentName}`);

      if (node.props) {
        // Extract from whitelisted fields
        translatableFields.forEach((fieldName) => {
          const fieldValue = node.props[fieldName];
          extractFromValue(fieldValue, fieldName);
        });

        // Also scan ALL props for arrays with text fields (like imageGallery.images, carousel.items)
        Object.entries(node.props).forEach(([propName, propValue]) => {
          if (Array.isArray(propValue)) {
            // This handles imageGallery.images[].caption, carousel.items[].text, etc.
            extractFromValue(propValue, propName);
          }
        });
      }

      // For components with child fields (noticeBox, quote), traverse children
      // These use fields.child() which stores content in children nodes
      if (Array.isArray(node.children)) {
        node.children.forEach(traverse);
      }

      return;
    }

    // Handle component-block-prop and component-inline-prop
    // These are special nodes used by fields.child() in noticeBox, quote, etc.
    if (node.type === "component-block-prop" || node.type === "component-inline-prop") {
      console.log(`[extractTexts] Child field: ${node.type}, propPath:`, node.propPath);
      // Traverse into the child content
      if (Array.isArray(node.children)) {
        node.children.forEach(traverse);
      }
      return;
    }

    // Extract text from regular text nodes
    if (node.text !== undefined && typeof node.text === "string" && node.text.trim()) {
      texts.push(node.text);
    }

    // Recursively traverse children (for paragraphs, headings, lists, etc.)
    if (Array.isArray(node.children)) {
      node.children.forEach(traverse);
    }
  }

  if (Array.isArray(document)) {
    document.forEach(traverse);
  }

  console.log(`[extractTexts] Extracted ${texts.length} text segments`);
  return texts;
}

// ==================================================================
// Helper: Replace translatable texts in Document structure
// ==================================================================
// Replaces:
// 1. Plain text nodes
// 2. Whitelisted fields in component blocks (e.g., image captions)
// 3. Text fields in arrays (e.g., gallery captions, carousel items)
// Preserves: Image references, media IDs, component structure
function replaceTexts(document: any[], translations: string[]): any[] {
  let textIndex = 0;

  // Helper: Replace text in a value (handles strings and nested arrays/objects)
  function replaceInValue(value: any, path: string = ""): any {
    if (typeof value === "string" && value.trim()) {
      const translatedText = translations[textIndex++] || value;
      console.log(`[replaceTexts] ${path}: "${value.substring(0, 30)}..." → "${translatedText.substring(0, 30)}..."`);
      return translatedText;
    } else if (Array.isArray(value)) {
      // Handle arrays (like imageGallery.images, carousel.items)
      return value.map((item, idx) => {
        if (item && typeof item === "object") {
          const updatedItem = { ...item };
          // Replace text fields in each array item
          Object.entries(updatedItem).forEach(([key, val]) => {
            // Skip relationship fields (have 'id' property)
            if (val && typeof val === "object" && "id" in val) {
              return; // Keep image/media references unchanged
            }
            updatedItem[key] = replaceInValue(val, `${path}[${idx}].${key}`);
          });
          return updatedItem;
        }
        return item;
      });
    }
    return value;
  }

  function traverse(node: any): any {
    if (!node) return node;

    // Handle component blocks - replace ALL text fields
    if (node.type === "component-block") {
      const componentName = node.component;
      const translatableFields = COMPONENT_TRANSLATABLE_FIELDS[componentName] || [];

      console.log(`[replaceTexts] Component block: ${componentName}`);

      const updatedNode: any = { ...node };

      if (node.props) {
        const updatedProps = { ...node.props };

        // Replace text in whitelisted fields
        translatableFields.forEach((fieldName) => {
          const fieldValue = updatedProps[fieldName];
          updatedProps[fieldName] = replaceInValue(fieldValue, fieldName);
        });

        // Also replace text in ALL array props (like imageGallery.images, carousel.items)
        Object.entries(updatedProps).forEach(([propName, propValue]) => {
          if (Array.isArray(propValue)) {
            updatedProps[propName] = replaceInValue(propValue, propName);
          }
        });

        updatedNode.props = updatedProps;
      }

      // For components with child fields (noticeBox, quote), traverse children
      if (Array.isArray(node.children)) {
        updatedNode.children = node.children.map(traverse);
      }

      return updatedNode;
    }

    // Handle component-block-prop and component-inline-prop
    // These are special nodes used by fields.child() in noticeBox, quote, etc.
    if (node.type === "component-block-prop" || node.type === "component-inline-prop") {
      console.log(`[replaceTexts] Child field: ${node.type}, propPath:`, node.propPath);
      // Traverse into the child content
      if (Array.isArray(node.children)) {
        return {
          ...node,
          children: node.children.map(traverse),
        };
      }
      return node;
    }

    // Replace text in regular text nodes
    if (node.text !== undefined && typeof node.text === "string") {
      if (node.text.trim()) {
        const translatedText = translations[textIndex++] || node.text;
        return { ...node, text: translatedText };
      }
      return node;
    }

    // Recursively traverse children (for paragraphs, headings, lists, etc.)
    if (Array.isArray(node.children)) {
      return {
        ...node,
        children: node.children.map(traverse),
      };
    }

    return node;
  }

  if (Array.isArray(document)) {
    return document.map(traverse);
  }

  return document;
}

export const Field = ({ field, value, onChange, autoFocus, itemValue }: FieldProps<typeof baseController>) => {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [existingLocales, setExistingLocales] = useState<string[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Extract locale from itemValue
  // itemValue contains all the field values of the current item
  // locale is now a text field (using custom LocaleSelectField)
  const localeValue = (itemValue as any)?.locale?.value;
  const currentLocale = typeof localeValue === "string" ? localeValue : localeValue?.value || null;

  // Auto-detect parent type and extract parent ID
  // Supports ProductSeries, Product, Blog, and Application
  const { parentType, parentId, parentField } = React.useMemo(() => {
    let type: "productSeries" | "product" | "blog" | "application" | "reusableBlock" | null = null;
    let id: string | null = null;
    let field: string | null = null;

    // Helper function to extract ID from field value
    const extractIdFromField = (fieldValue: any): string | null => {
      if (!fieldValue) return null;

      if (typeof fieldValue === "string") {
        return fieldValue;
      } else if (fieldValue.currentIds) {
        if (fieldValue.currentIds instanceof Set) {
          const idsArray = Array.from(fieldValue.currentIds);
          return idsArray.length > 0 ? String(idsArray[0]) : null;
        } else if (typeof fieldValue.currentIds === "object") {
          const ids = Object.keys(fieldValue.currentIds);
          return ids.length > 0 ? ids[0] : null;
        }
      } else if (fieldValue.initialIds) {
        if (fieldValue.initialIds instanceof Set) {
          const idsArray = Array.from(fieldValue.initialIds);
          return idsArray.length > 0 ? String(idsArray[0]) : null;
        } else if (typeof fieldValue.initialIds === "object") {
          const ids = Object.keys(fieldValue.initialIds);
          return ids.length > 0 ? ids[0] : null;
        }
      } else if (fieldValue.value?.id) {
        // This is the case for relationship fields with {kind: 'one', id: '...', value: {id: '...', label: '...'}}
        // The outer 'id' is the current item's ID, but 'value.id' is the related item's ID
        return fieldValue.value.id;
      } else if (fieldValue.data?.id) {
        return fieldValue.data.id;
      } else if (fieldValue.value?.data?.id) {
        return fieldValue.value.data.id;
      } else if (fieldValue.id && !fieldValue.data && !fieldValue.currentIds && !fieldValue.value) {
        return fieldValue.id;
      }
      return null;
    };

    // PRIORITY 1: Check for relationship fields first (most reliable)
    // This works for inline edit mode

    // Check for reusableBlock field
    console.log("[DocumentEditorWithTranslation] itemValue keys:", Object.keys(itemValue || {}));
    console.log("[DocumentEditorWithTranslation] Full itemValue:", itemValue);

    const reusableBlockField = (itemValue as any)?.reusableBlock;
    if (reusableBlockField) {
      console.log("[DocumentEditorWithTranslation] reusableBlockField RAW:", reusableBlockField);
      const reusableBlockValue = reusableBlockField?.kind === "value" ? reusableBlockField.value : reusableBlockField;
      console.log("[DocumentEditorWithTranslation] reusableBlockValue after kind check:", reusableBlockValue);
      const fieldId = extractIdFromField(reusableBlockValue);

      if (fieldId) {
        type = "reusableBlock";
        field = "reusableBlock";
        id = fieldId;
        console.log("[DocumentEditorWithTranslation] Using reusableBlock field data:", id);
      } else {
        console.log("[DocumentEditorWithTranslation] Failed to extract ID from reusableBlock field");
      }
    } else {
      console.log("[DocumentEditorWithTranslation] No reusableBlock field found in itemValue");
    }

    // Check for blog field
    if (!id) {
      const blogField = (itemValue as any)?.blog;
      if (blogField) {
        const blogValue = blogField?.kind === "value" ? blogField.value : blogField;
        const fieldId = extractIdFromField(blogValue);

        if (fieldId) {
          type = "blog";
          field = "blog";
          id = fieldId;
          console.log("[DocumentEditorWithTranslation] Using blog field data:", id);
        }
      }
    }

    // Check for application field
    if (!id) {
      const applicationField = (itemValue as any)?.application;
      if (applicationField) {
        const applicationValue = applicationField?.kind === "value" ? applicationField.value : applicationField;
        const fieldId = extractIdFromField(applicationValue);

        if (fieldId) {
          type = "application";
          field = "application";
          id = fieldId;
          console.log("[DocumentEditorWithTranslation] Using application field data:", id);
        }
      }
    }

    // PRIORITY 2: If no field detected, try URL detection (fallback)
    if (!id) {
      const productSeriesUrlMatch = window.location.pathname.match(/\/product-series\/([a-f0-9-]+)/);
      const productUrlMatch = window.location.pathname.match(/\/products\/([a-f0-9-]+)/);
      const blogUrlMatch = window.location.pathname.match(/\/blogs\/([a-f0-9-]+)/);
      const applicationUrlMatch = window.location.pathname.match(/\/applications\/([a-f0-9-]+)/);
      const reusableBlockUrlMatch = window.location.pathname.match(/\/reusable-blocks\/([a-f0-9-]+)/);

      if (reusableBlockUrlMatch && reusableBlockUrlMatch[1] !== "create") {
        type = "reusableBlock";
        field = "reusableBlock";
        id = reusableBlockUrlMatch[1];
        console.log("[DocumentEditorWithTranslation] Detected from URL - ReusableBlock:", id);
      } else if (productSeriesUrlMatch && productSeriesUrlMatch[1] !== "create") {
        type = "productSeries";
        field = "productSeries";
        id = productSeriesUrlMatch[1];
        console.log("[DocumentEditorWithTranslation] Detected from URL - ProductSeries:", id);
      } else if (productUrlMatch && productUrlMatch[1] !== "create") {
        type = "product";
        field = "product";
        id = productUrlMatch[1];
        console.log("[DocumentEditorWithTranslation] Detected from URL - Product:", id);
      } else if (blogUrlMatch && blogUrlMatch[1] !== "create") {
        type = "blog";
        field = "blog";
        id = blogUrlMatch[1];
        console.log("[DocumentEditorWithTranslation] Detected from URL - Blog:", id);
      } else if (applicationUrlMatch && applicationUrlMatch[1] !== "create") {
        type = "application";
        field = "application";
        id = applicationUrlMatch[1];
        console.log("[DocumentEditorWithTranslation] Detected from URL - Application:", id);
      }
    }

    // Check for productSeries field
    if (!id) {
      const productSeriesField = (itemValue as any)?.productSeries;
      if (productSeriesField) {
        const productSeriesValue = productSeriesField?.kind === "value" ? productSeriesField.value : productSeriesField;
        const fieldId = extractIdFromField(productSeriesValue);

        if (fieldId) {
          type = "productSeries";
          field = "productSeries";
          id = fieldId;
          console.log("[DocumentEditorWithTranslation] Using productSeries field data:", id);
        }
      }
    }

    // Check for product field
    if (!id) {
      const productField = (itemValue as any)?.product;
      if (productField) {
        const productValue = productField?.kind === "value" ? productField.value : productField;
        const fieldId = extractIdFromField(productValue);

        if (fieldId) {
          type = "product";
          field = "product";
          id = fieldId;
          console.log("[DocumentEditorWithTranslation] Using product field data:", id);
        }
      }
    }

    console.log("[DocumentEditorWithTranslation] Final computed:", { type, id, field });
    return { parentType: type, parentId: id, parentField: field };
  }, [itemValue]);

  console.log("[DocumentEditorWithTranslation] Current locale:", currentLocale);
  console.log("[DocumentEditorWithTranslation] Locale value:", localeValue);
  console.log("[DocumentEditorWithTranslation] Parent info:", { parentType, parentId, parentField });
  // Fetch existing translations for this parent entity
  React.useEffect(() => {
    if (parentId && parentType) {
      fetchExistingLocales();
    }
  }, [parentId, parentType]);

  async function fetchExistingLocales() {
    if (!parentId || !parentType) return;

    try {
      // Build query dynamically based on parent type
      const queryConfig = {
        productSeries: {
          typeName: "productSeriesContentTranslations",
          fieldName: "productSeries",
          varName: "productSeriesId",
        },
        product: {
          typeName: "productContentTranslations",
          fieldName: "product",
          varName: "productId",
        },
        blog: {
          typeName: "blogContentTranslations",
          fieldName: "blog",
          varName: "blogId",
        },
        application: {
          typeName: "applicationContentTranslations",
          fieldName: "application",
          varName: "applicationId",
        },
        reusableBlock: {
          typeName: "reusableBlockContentTranslations",
          fieldName: "reusableBlock",
          varName: "reusableBlockId",
        },
      };

      const config = queryConfig[parentType];
      const { typeName: translationsTypeName, fieldName: parentFieldName, varName } = config;

      const query = `
        query GetExistingLocales($${varName}: ID!) {
          ${translationsTypeName}(
            where: {
              ${parentFieldName}: { id: { equals: $${varName} } }
            }
          ) {
            locale
          }
        }
      `;

      const response = await fetch("/api/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          variables: { [varName]: parentId },
        }),
      });

      const result = await response.json();
      console.log("[DocumentEditorWithTranslation] GraphQL response:", result);
      console.log("[DocumentEditorWithTranslation] Query variables:", { [varName]: parentId });

      const { data } = result;
      const locales = data?.[translationsTypeName]?.map((t: any) => t.locale) || [];
      setExistingLocales(locales);
      console.log("[DocumentEditorWithTranslation] Existing locales:", locales);
    } catch (err) {
      console.error("Failed to fetch existing locales:", err);
    }
  }

  /**
   * Hydrate relationship fields in component blocks
   *
   * GraphQL returns only IDs for relationships. This function fetches the full data
   * and reconstructs the relationship structure that Keystone expects.
   */
  async function hydrateRelationships(document: any[]): Promise<any[]> {
    const mediaIds = new Set<string>();
    const formConfigIds = new Set<string>();

    // Collect all relationship IDs from component blocks (recursively)
    function collectIds(node: any) {
      if (!node) return;

      // Handle component blocks
      if (node.type === "component-block" && node.props) {
        console.log("[collectIds] Found component-block:", node.component);

        // Check all props for relationship fields
        Object.entries(node.props).forEach(([key, value]: [string, any]) => {
          // Single relationship: { id: "..." }
          if (value && typeof value === "object" && value.id && typeof value.id === "string" && !value.data) {
            console.log(`[collectIds] Found single relationship in ${key}:`, value.id);

            // Determine type based on prop name
            if (key === 'formConfig') {
              formConfigIds.add(value.id);
            } else {
              mediaIds.add(value.id);
            }
          }
          // Array of objects with relationships: [{ image: { id: "..." } }]
          if (Array.isArray(value)) {
            value.forEach((item: any, idx: number) => {
              if (item && typeof item === "object") {
                Object.entries(item).forEach(([subKey, subValue]: [string, any]) => {
                  if (subValue && typeof subValue === "object" && subValue.id && typeof subValue.id === "string" && !subValue.data) {
                    console.log(`[collectIds] Found array relationship in ${key}[${idx}].${subKey}:`, subValue.id);
                    mediaIds.add(subValue.id);
                  }
                });
              }
            });
          }
        });
      }

      // Recursively traverse children (handles layout, layout-area, paragraphs, etc.)
      if (Array.isArray(node.children)) {
        node.children.forEach(collectIds);
      }
    }

    if (Array.isArray(document)) {
      document.forEach(collectIds);
    }

    console.log("[hydrateRelationships] Found media IDs:", Array.from(mediaIds));
    console.log("[hydrateRelationships] Found formConfig IDs:", Array.from(formConfigIds));

    // If no relationships found, return original document
    if (mediaIds.size === 0 && formConfigIds.size === 0) {
      return document;
    }

    // Fetch all relationship data
    try {
      const mediaDataArray: any[] = [];
      const formConfigDataArray: any[] = [];

      // Fetch each media item individually
      for (const mediaId of Array.from(mediaIds)) {
        // Note: For ID fields in Keystone, we need to pass the value directly in 'where'
        // Not using { equals: $id }, just: where: { id: $id }
        const mediaQuery = `
          query GetMediaItem {
            media(where: { id: "${mediaId}" }) {
              id
              filename
              file {
                url
              }
            }
          }
        `;

        const response = await fetch("/api/graphql", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: mediaQuery,
          }),
        });

        const result = await response.json();

        if (result.errors) {
          console.error(`[hydrateRelationships] Error fetching media ${mediaId}:`, result.errors);
          console.error(`[hydrateRelationships] Full response:`, result);
          continue;
        }

        // Note: media query with specific ID returns a single object, not an array
        if (result.data?.media) {
          mediaDataArray.push(result.data.media);
          console.log(`[hydrateRelationships] ✅ Fetched media:`, result.data.media.filename);
        }
      }

      // Fetch each FormConfig item individually
      for (const formConfigId of Array.from(formConfigIds)) {
        const formConfigQuery = `
          query GetFormConfig {
            formConfig(where: { id: "${formConfigId}" }) {
              id
              name
              location
              fields
            }
          }
        `;

        const response = await fetch("/api/graphql", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: formConfigQuery,
          }),
        });

        const result = await response.json();

        if (result.errors) {
          console.error(`[hydrateRelationships] Error fetching formConfig ${formConfigId}:`, result.errors);
          console.error(`[hydrateRelationships] Full response:`, result);
          continue;
        }

        if (result.data?.formConfig) {
          formConfigDataArray.push(result.data.formConfig);
          console.log(`[hydrateRelationships] ✅ Fetched formConfig:`, result.data.formConfig.name);
        }
      }

      const mediaMap = new Map(mediaDataArray.map((m: any) => [m.id, m]));
      const formConfigMap = new Map(formConfigDataArray.map((f: any) => [f.id, f]));
      console.log("[hydrateRelationships] Fetched media data:", mediaMap.size, "items");
      console.log("[hydrateRelationships] Fetched formConfig data:", formConfigMap.size, "items");

      // Hydrate relationships in document
      function hydrateNode(node: any): any {
        if (!node) return node;

        if (node.type === "component-block" && node.props) {
          const hydratedProps = { ...node.props };

          Object.entries(hydratedProps).forEach(([key, value]: [string, any]) => {
            // Single relationship
            if (value && typeof value === "object" && value.id && !value.data) {
              // Check if it's a FormConfig relationship
              const formConfigData = formConfigMap.get(value.id);
              if (formConfigData) {
                hydratedProps[key] = {
                  id: value.id,
                  label: formConfigData.name,
                  data: formConfigData,
                };
                console.log(`[hydrateRelationships] Hydrated formConfig ${key}:`, hydratedProps[key].label);
              } else {
                // Otherwise check if it's a Media relationship
                const mediaData = mediaMap.get(value.id);
                if (mediaData) {
                  hydratedProps[key] = {
                    id: value.id,
                    label: mediaData.filename,
                    data: mediaData,
                  };
                  console.log(`[hydrateRelationships] Hydrated media ${key}:`, hydratedProps[key].label);
                }
              }
            }
            // Array of objects with relationships
            if (Array.isArray(value)) {
              hydratedProps[key] = value.map((item: any) => {
                if (item && typeof item === "object") {
                  const hydratedItem = { ...item };
                  Object.entries(hydratedItem).forEach(([subKey, subValue]: [string, any]) => {
                    if (subValue && typeof subValue === "object" && subValue.id && !subValue.data) {
                      const mediaData = mediaMap.get(subValue.id);
                      if (mediaData) {
                        hydratedItem[subKey] = {
                          id: subValue.id,
                          label: mediaData.filename,
                          data: mediaData,
                        };
                      }
                    }
                  });
                  return hydratedItem;
                }
                return item;
              });
            }
          });

          return {
            ...node,
            props: hydratedProps,
            children: node.children ? node.children.map(hydrateNode) : node.children,
          };
        }

        if (Array.isArray(node.children)) {
          return {
            ...node,
            children: node.children.map(hydrateNode),
          };
        }

        return node;
      }

      return document.map(hydrateNode);
    } catch (error) {
      console.error("[hydrateRelationships] Error:", error);
      return document; // Return original on error
    }
  }

  /**
   * Copy from source language (default: English)
   *
   * Fetches the source language translation and copies its content structure
   */
  async function copyFromSourceLanguage(sourceLang: string = "en") {
    console.log("[copyFromSourceLanguage] Called with sourceLang:", sourceLang);
    console.log("[copyFromSourceLanguage] parentId:", parentId, "parentType:", parentType);

    if (!parentId || !parentType) {
      console.error("[copyFromSourceLanguage] No parent available!");
      const entityNames = {
        productSeries: "Product Series",
        product: "Product",
        blog: "Blog",
        application: "Application",
      };
      const entityName = parentType ? entityNames[parentType] : "parent entity";
      setError(`⚠️ Please save this translation first, or select a ${entityName} before copying`);
      return;
    }

    setIsLoading(true);
    setError("");
    setStatus(`Fetching ${sourceLang.toUpperCase()} content...`);

    try {
      // Build query dynamically based on parent type
      const queryConfig = {
        productSeries: {
          typeName: "productSeriesContentTranslations",
          fieldName: "productSeries",
          varName: "productSeriesId",
        },
        product: {
          typeName: "productContentTranslations",
          fieldName: "product",
          varName: "productId",
        },
        blog: {
          typeName: "blogContentTranslations",
          fieldName: "blog",
          varName: "blogId",
        },
        application: {
          typeName: "applicationContentTranslations",
          fieldName: "application",
          varName: "applicationId",
        },
        reusableBlock: {
          typeName: "reusableBlockContentTranslations",
          fieldName: "reusableBlock",
          varName: "reusableBlockId",
        },
      };

      const config = queryConfig[parentType];
      const { typeName: translationsTypeName, fieldName: parentFieldName, varName } = config;

      // All types use 'content' field name
      const contentFieldName = 'content';

      // Use GraphQL to fetch source language content
      const query = `
        query GetSourceContent($${varName}: ID!, $locale: String!) {
          ${translationsTypeName}(
            where: {
              ${parentFieldName}: { id: { equals: $${varName} } }
              locale: { equals: $locale }
            }
          ) {
            ${contentFieldName} {
              document
            }
            locale
          }
        }
      `;

      const response = await fetch("/api/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          variables: {
            [varName]: parentId,
            locale: sourceLang,
          },
        }),
      });

      const { data, errors } = await response.json();

      if (errors) {
        throw new Error(errors[0]?.message || "GraphQL query failed");
      }
      console.log(data);
      const sourceTranslations = data?.[translationsTypeName];
      if (!sourceTranslations || sourceTranslations.length === 0) {
        setError(`⚠️ ${sourceLang.toUpperCase()} version not found. Please create it first.`);
        setIsLoading(false);
        return;
      }

      // Extract the document from the content/description field
      const sourceContent = sourceTranslations[0][contentFieldName]?.document;

      console.log("[copyFromSourceLanguage] ===== SOURCE CONTENT ANALYSIS =====");
      console.log("[copyFromSourceLanguage] Full source content:", JSON.stringify(sourceContent, null, 2));

      // Check for component blocks
      if (Array.isArray(sourceContent)) {
        sourceContent.forEach((node, idx) => {
          if (node.type === "component-block") {
            console.log(`[copyFromSourceLanguage] Component block #${idx}:`, {
              type: node.component,
              props: node.props,
            });
          }
        });
      }
      console.log("[copyFromSourceLanguage] ===================================");

      if (sourceContent && Array.isArray(sourceContent)) {
        // Hydrate relationship fields (restore image data from IDs)
        setStatus(`Hydrating media references...`);
        const hydratedContent = await hydrateRelationships(sourceContent);

        console.log("[copyFromSourceLanguage] ===== HYDRATED CONTENT =====");
        console.log("[copyFromSourceLanguage] Sample hydrated block:",
          hydratedContent.find((n: any) => n.type === "component-block" ||
            n.children?.some((c: any) => c.type === "layout-area"))
        );
        console.log("[copyFromSourceLanguage] ================================");

        onChange?.(hydratedContent);
        setStatus(`✅ ${sourceLang.toUpperCase()} content copied successfully!`);
        setTimeout(() => setStatus(""), 3000);
      } else {
        setError(`⚠️ ${sourceLang.toUpperCase()} content is empty`);
      }
    } catch (err) {
      console.error("Copy from source language error:", err);
      setError(`❌ Failed to copy: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * AI Translate
   *
   * Extracts all text nodes, sends to translation API, and replaces them
   */
  async function translateContent(sourceLang: string) {
    if (!currentLocale) {
      setError("⚠️ Please select a language first");
      return;
    }

    const targetLocale = typeof currentLocale === 'string' ? currentLocale : currentLocale?.value || 'unknown';

    if (sourceLang === targetLocale) {
      setError(`⚠️ Source and target languages are the same (${sourceLang.toUpperCase()})`);
      return;
    }

    if (!value || !Array.isArray(value) || value.length === 0) {
      setError("⚠️ Content is empty. Please copy source content first or enter content manually.");
      return;
    }

    setIsLoading(true);
    setError("");
    setStatus("Extracting text...");

    try {
      // Extract all text nodes
      const texts = extractTexts(value);

      if (texts.length === 0) {
        setError("⚠️ No text found to translate");
        setIsLoading(false);
        return;
      }

      setStatus(`Translating ${texts.length} text segments from ${sourceLang.toUpperCase()} to ${targetLocale.toUpperCase()}...`);

      // Get saved API key and service from localStorage
      const apiKey = localStorage.getItem("keystoneTranslatorApiKey");
      const service = localStorage.getItem("keystoneTranslatorService") || "google";

      if (!apiKey) {
        setError("⚠️ Please configure API key first (go to any MultilingualJSONField and set up translation)");
        setIsLoading(false);
        return;
      }

      // Call translation API
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          texts,
          targetLang: targetLocale,
          sourceLang: sourceLang,
          service,
          apiKey,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Translation failed");
      }

      const data = await response.json();

      if (!data.success || !Array.isArray(data.translations)) {
        throw new Error("Invalid translation response");
      }

      // Replace text nodes with translations
      const translatedDocument = replaceTexts(value, data.translations);
      onChange?.(translatedDocument);

      setStatus(`✅ Successfully translated from ${sourceLang.toUpperCase()} to ${targetLocale.toUpperCase()}!`);
      setTimeout(() => setStatus(""), 3000);
    } catch (err) {
      console.error("Translation error:", err);
      setError(`❌ Translation failed: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * Template Insertion
   */
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [showJsonViewer, setShowJsonViewer] = useState(false);

  async function fetchTemplates() {
    setLoadingTemplates(true);
    try {
      const response = await fetch("/api/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: GET_TEMPLATES_QUERY,
          variables: {
            where: {
              status: { equals: "active" },
            },
          },
        }),
      });

      const { data, errors } = await response.json();

      if (errors) {
        throw new Error(errors[0]?.message || "Failed to fetch templates");
      }

      setTemplates(data?.documentTemplates || []);
    } catch (err) {
      console.error("Failed to fetch templates:", err);
      setError(`❌ Failed to fetch templates: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setLoadingTemplates(false);
    }
  }

  function insertTemplate(template: any) {
    if (!template.content?.document) {
      setError("❌ This template has no content to insert");
      return;
    }

    try {
      // Get current document value
      const currentValue = value || [];

      // Parse template content
      const templateContent = Array.isArray(template.content.document)
        ? template.content.document
        : JSON.parse(JSON.stringify(template.content.document));

      // Insert template content at the end
      const newValue = [...currentValue, ...templateContent];

      // Update the field value
      onChange?.(newValue);

      setShowTemplateSelector(false);
      setStatus(`✅ Template "${template.name}" inserted successfully!`);
      setTimeout(() => setStatus(""), 3000);

      console.log("✅ Template inserted successfully:", template.name);
    } catch (err) {
      console.error("❌ Error inserting template:", err);
      setError(`❌ Failed to insert template: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  }

  /**
   * Show language selector for copying from different languages
   */
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showTranslateMenu, setShowTranslateMenu] = useState(false);

  // All available languages for copying and translating
  const sourceLanguages = [
    { code: "en", label: "🇬🇧 English" },
    { code: "zh", label: "🇨🇳 中文" },
    { code: "es", label: "🇪🇸 Español" },
    { code: "pt", label: "🇵🇹 Português" },
    { code: "fr", label: "🇫🇷 Français" },
    { code: "de", label: "🇩🇪 Deutsch" },
    { code: "nl", label: "🇳🇱 Nederlands" },
    { code: "da", label: "🇩🇰 Dansk" },
    { code: "no", label: "🇳🇴 Norsk" },
    { code: "sv", label: "🇸🇪 Svenska" },
    { code: "fi", label: "🇫🇮 Suomi" },
    { code: "is", label: "🇮🇸 Íslenska" },
    { code: "cs", label: "🇨🇿 Čeština" },
    { code: "hu", label: "🇭🇺 Magyar" },
    { code: "pl", label: "🇵🇱 Polski" },
    { code: "sk", label: "🇸🇰 Slovenčina" },
    { code: "it", label: "🇮🇹 Italiano" },
    { code: "ar", label: "🇸🇦 العربية" },
    { code: "ber", label: "🇲🇦 Tamazight" },
    { code: "ku", label: "🇮🇶 Kurdî" },
    { code: "fa", label: "🇮🇷 فارسی" },
    { code: "tr", label: "🇹🇷 Türkçe" },
    { code: "he", label: "🇮🇱 עברית" },
    { code: "az", label: "🇦🇿 Azərbaycan" },
  ];

  // Show copy/translate buttons for all languages (no restrictions)
  const showCopyButton = currentLocale;
  const showTranslateButton = currentLocale;

  const containerStyle = isFullscreen
    ? {
        position: "fixed" as const,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "white",
        zIndex: 99999,
        overflow: "auto",
        padding: "20px",
      }
    : {};

  return (
    <div style={containerStyle}>
      <FieldContainer>

        <Stack gap="medium">
        {/* Debug info - show parent entity ID */}
        {parentId && (
          <div
            style={{
              padding: "8px 12px",
              background: "#f0f9ff",
              border: "1px solid #0ea5e9",
              borderRadius: "4px",
              fontSize: "12px",
              color: "#0c4a6e",
              marginBottom: "8px",
            }}
          >
            📦 {parentType === "productSeries" ? "Product Series" : parentType === "product" ? "Product" : parentType === "blog" ? "Blog" : parentType === "reusableBlock" ? "Reusable Block" : "Application"} ID: <code style={{ background: "#e0f2fe", padding: "2px 6px", borderRadius: "3px" }}>{parentId}</code>
            {existingLocales.length > 0 && (
              <span style={{ marginLeft: "8px" }}>| Available translations: {existingLocales.map((l) => l.toUpperCase()).join(", ")}</span>
            )}
            {existingLocales.length === 0 && (
              <span style={{ marginLeft: "8px", color: "#dc2626" }}>| ⚠️ No existing translations found</span>
            )}
          </div>
        )}

        {/* Translation Action Buttons */}
        {showCopyButton && (
          <div
            style={{
              display: "flex",
              gap: "12px",
              padding: "12px",
              background: "#f8f9fa",
              borderRadius: "6px",
              border: "1px solid #e2e8f0",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            {/* Copy from Language Dropdown */}
            <div style={{ position: "relative" }}>
              <button
                type="button"
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                disabled={isLoading}
                style={{
                  padding: "8px 16px",
                  background: isLoading ? "#cbd5e1" : "#3b82f6",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  fontWeight: 500,
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                📋 Copy from... ▼
              </button>

              {/* Language dropdown menu */}
              {showLanguageMenu && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    marginTop: "4px",
                    background: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "4px",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                    zIndex: 1000,
                    minWidth: "200px",
                  }}
                >
                  {sourceLanguages.map((lang) => {
                    const isCurrentLocale = lang.code === currentLocale;
                    // Only disable if we know for sure the language doesn't exist
                    // If existingLocales is empty but we have parentId, it might still be loading
                    const doesNotExist = !!(parentId && existingLocales.length > 0 && !existingLocales.includes(lang.code));
                    const isDisabled = isLoading || isCurrentLocale || doesNotExist;

                    return (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => {
                          if (!isDisabled) {
                            copyFromSourceLanguage(lang.code);
                            setShowLanguageMenu(false);
                          }
                        }}
                        disabled={isDisabled}
                        style={{
                          width: "100%",
                          padding: "10px 16px",
                          background: isDisabled ? "#f1f5f9" : "white",
                          color: isDisabled ? "#94a3b8" : "#334155",
                          border: "none",
                          textAlign: "left",
                          cursor: isDisabled ? "not-allowed" : "pointer",
                          fontSize: "14px",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                        onMouseEnter={(e) => {
                          if (!isDisabled) {
                            e.currentTarget.style.background = "#f1f5f9";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isDisabled) {
                            e.currentTarget.style.background = "white";
                          }
                        }}
                      >
                        {lang.label}
                        {isCurrentLocale && " (current)"}
                        {doesNotExist && " (not created yet)"}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* AI Translate Button with Source Language Selector */}
            {showTranslateButton && (
              <div style={{ position: "relative" }}>
                <button
                  type="button"
                  onClick={() => setShowTranslateMenu(!showTranslateMenu)}
                  disabled={isLoading}
                  style={{
                    padding: "8px 16px",
                    background: isLoading ? "#cbd5e1" : "#10b981",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: isLoading ? "not-allowed" : "pointer",
                    fontWeight: 500,
                    fontSize: "14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  🌐 AI Translate from... ▼
                </button>

                {/* Translation source language dropdown menu */}
                {showTranslateMenu && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      marginTop: "4px",
                      background: "white",
                      border: "1px solid #e2e8f0",
                      borderRadius: "4px",
                      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                      zIndex: 1000,
                      minWidth: "200px",
                      maxHeight: "400px",
                      overflow: "auto",
                    }}
                  >
                    {sourceLanguages.map((lang) => {
                      const targetLocaleStr = typeof currentLocale === 'string' ? currentLocale : currentLocale?.value || '';
                      const isCurrentLocale = lang.code === targetLocaleStr;
                      // Only disable if it's the current locale (can't translate from same to same)
                      const doesNotExist = !!(parentId && existingLocales.length > 0 && !existingLocales.includes(lang.code));
                      const isDisabled = isLoading || isCurrentLocale;

                      return (
                        <button
                          key={lang.code}
                          type="button"
                          onClick={() => {
                            if (!isDisabled) {
                              translateContent(lang.code);
                              setShowTranslateMenu(false);
                            }
                          }}
                          disabled={isDisabled}
                          style={{
                            width: "100%",
                            padding: "10px 16px",
                            background: isDisabled ? "#f1f5f9" : "white",
                            color: isDisabled ? "#94a3b8" : "#334155",
                            border: "none",
                            textAlign: "left",
                            cursor: isDisabled ? "not-allowed" : "pointer",
                            fontSize: "14px",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                          onMouseEnter={(e) => {
                            if (!isDisabled) {
                              e.currentTarget.style.background = "#f1f5f9";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isDisabled) {
                              e.currentTarget.style.background = "white";
                            }
                          }}
                        >
                          {lang.label} → {targetLocaleStr.toUpperCase()}
                          {isCurrentLocale && " (same language)"}
                          {doesNotExist && " (not available)"}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Insert Template Button */}
            <button
              type="button"
              onClick={() => {
                setShowTemplateSelector(true);
                fetchTemplates();
              }}
              disabled={isLoading}
              style={{
                padding: "8px 16px",
                background: isLoading ? "#cbd5e1" : "#f59e0b",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: isLoading ? "not-allowed" : "pointer",
                fontWeight: 500,
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              📋 Insert Template
            </button>

            {/* Fullscreen Button */}
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              style={{
                padding: "8px 16px",
                background: isFullscreen ? "#6366f1" : "#6b7280",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: 500,
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
              title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? "⬇️ Exit Fullscreen" : "⬆️ Fullscreen"}
            </button>

            {/* JSON Viewer Button */}
            <button
              type="button"
              onClick={() => setShowJsonViewer(!showJsonViewer)}
              style={{
                padding: "8px 16px",
                background: showJsonViewer ? "#8b5cf6" : "#6b7280",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: 500,
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
              title={showJsonViewer ? "Hide JSON" : "View JSON Structure"}
            >
              {showJsonViewer ? "🔍 Hide JSON" : "🔍 View JSON"}
            </button>

            {/* Current locale indicator */}
            {currentLocale && (
              <div
                style={{
                  marginLeft: "auto",
                  padding: "6px 12px",
                  background: "#e0f2fe",
                  color: "#0c4a6e",
                  borderRadius: "4px",
                  fontSize: "13px",
                  fontWeight: 500,
                }}
              >
                Current: {typeof currentLocale === 'string' ? currentLocale.toUpperCase() : currentLocale?.value?.toUpperCase() || 'N/A'}
              </div>
            )}
          </div>
        )}

        {/* Status/Error Messages */}
        {(status || error) && (
          <div
            style={{
              padding: "10px 14px",
              background: error ? "#fee2e2" : "#d1fae5",
              color: error ? "#991b1b" : "#065f46",
              borderRadius: "4px",
              fontSize: "13px",
              fontWeight: 500,
            }}
          >
            {error || status}
          </div>
        )}

        {/* JSON Viewer */}
        {showJsonViewer && (() => {
          // Analyze component blocks
          const componentBlocks: any[] = [];
          if (Array.isArray(value)) {
            value.forEach((node, idx) => {
              if (node.type === "component-block") {
                componentBlocks.push({ index: idx, ...node });
              }
            });
          }

          return (
            <div
              style={{
                padding: "16px",
                background: "#1e1e1e",
                color: "#d4d4d4",
                borderRadius: "6px",
                border: "1px solid #444",
                fontSize: "12px",
                fontFamily: "Consolas, Monaco, 'Courier New', monospace",
                maxHeight: "500px",
                overflow: "auto",
                position: "relative",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "12px",
                  paddingBottom: "8px",
                  borderBottom: "1px solid #444",
                }}
              >
                <span style={{ fontWeight: "bold", color: "#569cd6" }}>
                  📋 Document JSON Structure
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(value, null, 2));
                    setStatus("✅ JSON copied to clipboard!");
                    setTimeout(() => setStatus(""), 2000);
                  }}
                  style={{
                    padding: "4px 12px",
                    background: "#3b82f6",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "11px",
                  }}
                >
                  📋 Copy JSON
                </button>
              </div>

              {/* Component Blocks Summary */}
              {componentBlocks.length > 0 && (
                <div
                  style={{
                    marginBottom: "16px",
                    padding: "12px",
                    background: "#2d2d30",
                    borderRadius: "4px",
                    border: "1px solid #3e3e42",
                  }}
                >
                  <div style={{ fontWeight: "bold", color: "#4ec9b0", marginBottom: "8px" }}>
                    📦 Component Blocks ({componentBlocks.length})
                  </div>
                  {componentBlocks.map((block, idx) => (
                    <div
                      key={idx}
                      style={{
                        marginBottom: "8px",
                        padding: "8px",
                        background: "#1e1e1e",
                        borderRadius: "3px",
                        fontSize: "11px",
                      }}
                    >
                      <div style={{ color: "#dcdcaa" }}>
                        #{block.index}: <span style={{ color: "#4fc1ff" }}>{block.component}</span>
                      </div>
                      <div style={{ color: "#9cdcfe", marginTop: "4px" }}>
                        Props: {JSON.stringify(block.props).substring(0, 100)}
                        {JSON.stringify(block.props).length > 100 ? "..." : ""}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                {JSON.stringify(value, null, 2)}
              </pre>
            </div>
          );
        })()}

        {/* Document Editor (using Keystone's default document field component) */}
        <div>
          <DocumentField
            field={field}
            value={value}
            onChange={onChange}
            autoFocus={autoFocus}
            itemValue={itemValue}
            forceValidation={false}
          />
        </div>

        {/* Template Selector Modal */}
      {showTemplateSelector && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
          onClick={() => setShowTemplateSelector(false)}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              maxWidth: "800px",
              width: "90%",
              maxHeight: "80vh",
              overflow: "auto",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: "24px",
                borderBottom: "1px solid #e0e0e0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                position: "sticky",
                top: 0,
                backgroundColor: "white",
                zIndex: 1,
              }}
            >
              <h2 style={{ margin: 0, fontSize: "24px" }}>📋 Select Template</h2>
              <button
                onClick={() => setShowTemplateSelector(false)}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#e0e0e0",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                ✕ Close
              </button>
            </div>

            <div style={{ padding: "24px" }}>
              {loadingTemplates && (
                <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
                  Loading templates...
                </div>
              )}

              {!loadingTemplates && templates.length === 0 && (
                <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
                  No templates found. Create some templates first!
                </div>
              )}

              {!loadingTemplates && templates.length > 0 && (() => {
                // Group templates by category
                const groupedTemplates = templates.reduce((acc: any, template: any) => {
                  const category = template.category || "other";
                  if (!acc[category]) {
                    acc[category] = [];
                  }
                  acc[category].push(template);
                  return acc;
                }, {});

                return Object.entries(groupedTemplates).map(([category, categoryTemplates]: [string, any]) => (
                  <div key={category} style={{ marginBottom: "32px" }}>
                    <h3
                      style={{
                        fontSize: "16px",
                        fontWeight: "bold",
                        marginBottom: "16px",
                        color: "#666",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {category.replace("-", " ")}
                    </h3>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
                        gap: "16px",
                      }}
                    >
                      {categoryTemplates.map((template: any) => (
                        <div
                          key={template.id}
                          onClick={() => insertTemplate(template)}
                          style={{
                            border: "2px solid #e0e0e0",
                            borderRadius: "8px",
                            padding: "16px",
                            cursor: "pointer",
                            transition: "all 0.2s",
                            backgroundColor: "white",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = "#f59e0b";
                            e.currentTarget.style.transform = "translateY(-2px)";
                            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = "#e0e0e0";
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow = "none";
                          }}
                        >
                          <div
                            style={{
                              fontWeight: "bold",
                              fontSize: "16px",
                              marginBottom: "8px",
                              color: "#333",
                            }}
                          >
                            {template.name}
                          </div>
                          {template.description && (
                            <div
                              style={{
                                fontSize: "14px",
                                color: "#666",
                                marginBottom: "8px",
                                lineHeight: "1.4",
                              }}
                            >
                              {template.description}
                            </div>
                          )}
                          <div
                            style={{
                              fontSize: "12px",
                              color: "#999",
                              fontFamily: "monospace",
                            }}
                          >
                            {template.key}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      )}
      </Stack>
    </FieldContainer>
    </div>
  );
};

// Export controller and componentBlocks
// Keystone expects both controller and componentBlocks to be exported from the custom view
export const controller = baseController;
export const componentBlocks = componentBlocksModule.componentBlocks;
