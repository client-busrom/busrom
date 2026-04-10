# Application Media Resolution Strategies (v2.0)

This document outlines the standardized rendering methodologies for "Application" (Case Study) media across the platform, updated to reflect the high-performance Server-Side selection strategy.

## 1. Synchronous Strategy (Static Content)

**Used in**: `ImageGallery` component and SSR-resolved Lexical blocks.

### Workflow

- **Driven by**: `media-resolver.ts` -> `resolveAllMedia` function.
- **Timing**: Server-side, during initial page generation (SSR/SSG).
- **Logic**:
  - Proactively fetches application data during node traversal.
  - Implements **Double-Random (Scene -> Image)** strategy: first picks a random scene, then a random image from that scene. This prevents scenes with many images from dominating the display and is more memory-efficient.
- **Data Shape**: `mediaData` dictionary contains pre-resolved media objects.

## 2. Server-Side Optimized Strategy (Dynamic Carousels)

**Used in**: `ApplicationCasesSection`, `ApplicationsSection` (One-Stop), `ApplicationMoreCasesSection`, `SupportApplicationsSection`.

### High-Performance Pipeline

Instead of "Fetch-and-Filter" on the client, we use a "Slim-Response" architecture:

- **Backend Selection (`/api/applications/route.ts`)**:
  - The API performs the **Double-Random** selection internally.
  - **Payload Thinning**: It returns only a single, pre-selected `image` object per application.
  - **Efficiency**: Avoids creating large flattened arrays in memory, reducing backend GC pressure.
  - **JSON Reduction**: Removes heavy `sceneGallery` and full collections, reducing payload size by ~90%.
- **Rich Media Objects**:
  - The client receives a full media object containing `variants` (sizes), enabling `OptimizedImage` to pull the correct WebP variant (e.g., `xlarge` for hero blocks).

## 3. Core Logic: Server-Side Randomization

The selection logic previously in `getRandomAppImage` (frontend) is now standard.

- **Strategy**: Use query parameters `ids=1,2,3` to fetch specific items.
- **Benefit**: Extreme precision; returns only what the editor selected.
- **Mode**: `cross-fade` (default AnimatePresence without `wait`).
- **Duration**: `0.8s` (matching the high-end feel).
- **Transition**: `[0.32, 0.72, 0, 1]` cubic-bezier.

### Implementation Checklist

1. **Backend**:
   - `/api/applications`: Ensure `depth=2` and randomization logic is active.
   - Response thinning: Only return `id`, `name`, `slug`, `shortDescription`, and `image`.
2. **Frontend**:
   - Navigation throttling: Minimum 150ms between slide changes.
   - Image optimization: Use `OptimizedImage` with `variants`.
   - Stable Keys: Always use `item.id + index`.
3. **Validation**:
   - Check Network tab: All images should be WebP variants.
   - Verify Payload: Ensure `sceneGallery` images are randomized server-side.

## 4. Interaction & Rendering Performance

To eliminate "Jank" during rapid navigation in carousels, the following rules are enforced:

### A. Stable Component Keys

**Never use indices as keys.** Always use `item.id + index`.
- Allows React to reuse DOM nodes during transitions.
- Prevents image flickering and redundant decodes.

### B. Interaction Throttling

- **Cooldown**: 150ms - 250ms throttling on navigation buttons.
- Prevents UI layout thrashing when users rapid-click arrows.

### C. Eager Optimization

- **Loading**: Use `loading="eager"` for the immediate carousel items.
- **Sizes**: Map `OptimizedImage` sizes to match visual weight (e.g., `xlarge` for main hero images, `large` for grid items).

### D. OEM/ODM & Service Overview

- **Interaction**: Throttled (250ms) using `useRef`.
- **Navigation**: Interaction-throttled to prevent rapid-fire jank.
- **Loading**: `loading="eager"` for the current and adjacent slides.
- **Data Flow**: `OurStoryTemplate` -> `StoryApplicationsSection` via `app.image` priority.

## 5. Key Improvements (Summary)

- **Selection Logic**: Moved from Client -> Server (API Level).
- **Payload**: JSON response optimized for 1:1 card mapping.
- **Stability**: Ref-based click locking + stable React keys.
- **Media Delivery**: Mandatory use of rich `image` objects with WebP variants.
