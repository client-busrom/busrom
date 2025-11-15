/**
 * Basic Document Editor
 *
 * Simple re-export of the default Keystone Document field.
 * Used for DocumentTemplate and ReusableBlock schemas where
 * translation features are not needed.
 *
 * NOTE: This should NOT export componentBlocks because DocumentTemplate
 * and ReusableBlock use JSON fields, not document fields.
 */

export { controller, Field } from "@keystone-6/fields-document/views";
