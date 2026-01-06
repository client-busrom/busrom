/**
 * Custom Scripts Component
 *
 * Renders custom scripts from CMS based on their injection position.
 * - Header scripts: rendered in <head>
 * - Body start scripts: rendered at the beginning of <body>
 * - Footer scripts: rendered at the end of <body>
 */

import { getMatchingScripts, type CustomScript } from '@/lib/api/custom-scripts'

interface CustomScriptsProps {
  path: string
  pageType?: string
  position: 'header' | 'body_start' | 'footer'
}

/**
 * Server component that fetches and renders custom scripts
 */
export async function CustomScripts({ path, pageType, position }: CustomScriptsProps) {
  const scripts = await getMatchingScripts(path, pageType)

  const positionScripts = scripts[position === 'body_start' ? 'bodyStart' : position]

  if (!positionScripts || positionScripts.length === 0) {
    return null
  }

  return (
    <>
      {positionScripts.map(script => (
        <ScriptContent key={script.id} script={script} />
      ))}
    </>
  )
}

/**
 * Render a single script's content
 * Uses dangerouslySetInnerHTML to inject raw HTML/script content
 */
function ScriptContent({ script }: { script: CustomScript }) {
  return (
    <div
      data-script-id={script.id}
      data-script-name={script.name}
      dangerouslySetInnerHTML={{ __html: script.content }}
    />
  )
}

/**
 * Header scripts wrapper for use in layout head
 */
export async function HeaderScripts({ path, pageType }: Omit<CustomScriptsProps, 'position'>) {
  return <CustomScripts path={path} pageType={pageType} position="header" />
}

/**
 * Body start scripts wrapper
 */
export async function BodyStartScripts({ path, pageType }: Omit<CustomScriptsProps, 'position'>) {
  return <CustomScripts path={path} pageType={pageType} position="body_start" />
}

/**
 * Footer scripts wrapper
 */
export async function FooterScripts({ path, pageType }: Omit<CustomScriptsProps, 'position'>) {
  return <CustomScripts path={path} pageType={pageType} position="footer" />
}
