// @ts-nocheck
/**
 * Document Template Feature
 *
 * Allows inserting pre-made content templates into richText fields.
 * Used in Products, ProductSeries, Pages, Blogs, etc.
 *
 * Features:
 * - Toolbar button to open template selector modal
 * - Category filtering
 * - Template preview
 * - Usage tracking
 * - Deep cloning of Lexical content (preserves all nodes and formatting)
 */

export { DocumentTemplateFeature } from './feature.server'
export { INSERT_DOCUMENT_TEMPLATE_COMMAND } from './plugin'
