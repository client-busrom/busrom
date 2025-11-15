# Component Blocks

This directory contains all custom component blocks for the Document Field.

## Structure

```
component-blocks/
├── index.ts                 # Main entry point, exports all component blocks
├── types.ts                 # TypeScript type definitions
├── README.md                # This file
└── components/              # Individual component block implementations
    ├── single-image.tsx
    ├── image-gallery.tsx
    ├── video-embed.tsx
    ├── cta-button.tsx
    ├── quote.tsx
    ├── notice-box.tsx
    ├── hero.tsx
    ├── carousel.tsx
    ├── checklist.tsx
    ├── divider.tsx
    ├── document-template.tsx
    └── reusable-block.tsx
```

## Usage

Component blocks are imported in the document field configuration:

```typescript
import { componentBlocks } from './component-blocks'

content: document({
  componentBlocks,
  ui: {
    views: './custom-fields/DocumentEditorWithTemplate',
  },
})
```

## Adding New Component Blocks

1. Create a new file in `components/` directory
2. Export the component block using `component()` from `@keystone-6/fields-document/component-blocks`
3. Import and add it to `index.ts`
4. Add corresponding frontend renderer in `web/lib/document-renderer.tsx`

## Component Block Types

### Standard Components (10)
1. **Single Image** - Display a single image with caption
2. **Image Gallery** - Display multiple images in various layouts
3. **Video Embed** - Embed YouTube or Vimeo videos
4. **CTA Button** - Call-to-action button with link
5. **Quote** - Blockquote with attribution
6. **Notice Box** - Info/success/warning/error notices
7. **Hero** - Hero section with image and CTA
8. **Carousel** - Carousel of images or content
9. **Checklist** - Interactive checklist
10. **Divider** - Horizontal divider line

### Special Components (2)
11. **Document Template** - Insert pre-made templates
12. **Reusable Block** - Reference reusable content blocks
