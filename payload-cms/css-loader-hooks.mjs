/**
 * ESM loader hooks to handle CSS imports
 * Returns empty module for .css and .scss files
 */

const CSS_STUB_URL = 'data:text/javascript,export default {}'

export async function resolve(specifier, context, nextResolve) {
  // Intercept CSS/SCSS imports before they reach other loaders
  if (specifier.endsWith('.css') || specifier.endsWith('.scss')) {
    return {
      shortCircuit: true,
      url: CSS_STUB_URL,
    }
  }
  return nextResolve(specifier, context)
}

export async function load(url, context, nextLoad) {
  // Handle our stub URL (with or without tsx query params)
  if (url.startsWith(CSS_STUB_URL)) {
    return {
      shortCircuit: true,
      format: 'module',
      source: 'export default {}',
    }
  }
  // Handle any CSS files that got through resolve
  if (url.endsWith('.css') || url.endsWith('.scss') || url.includes('.css?') || url.includes('.scss?')) {
    return {
      shortCircuit: true,
      format: 'module',
      source: 'export default {}',
    }
  }
  return nextLoad(url, context)
}
