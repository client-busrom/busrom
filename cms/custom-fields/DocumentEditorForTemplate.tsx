/**
 * Document Editor for DocumentTemplate and ReusableBlock
 *
 * This custom view exports componentBlocks to support all component blocks
 * in DocumentTemplate and ReusableBlock content fields.
 */

// Import base controller and Field component from Keystone
export { controller, Field } from "@keystone-6/fields-document/views";

// Import and export componentBlocks
import * as componentBlocksModule from "../component-blocks";
export const componentBlocks = componentBlocksModule.componentBlocks;
