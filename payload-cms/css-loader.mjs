/**
 * Custom ESM loader to ignore CSS imports
 * Used for running payload CLI commands (migrate, etc.)
 *
 * Usage: node --import ./css-loader.mjs <command>
 */

import { register } from 'node:module'
import { pathToFileURL } from 'node:url'

register('./css-loader-hooks.mjs', pathToFileURL('./'))
