# Application Media Resolution Strategies (v2.0)

This document outlines the standardized rendering methodologies for "Application" (Case Study) media across the platform, updated to reflect the high-performance Server-Side selection strategy.

## 1. Synchronous Strategy (Static Content)

**Used in**: `ImageGallery` component and SSR-resolved Lexical blocks.

### Workflow

- **Driven by**: `media-resolver.ts` -> `resolveAllMedia` function.
- **Timing**: Server-side, during initial page generation (SSR/SSG).
- **Logic**:
  - Proactively fetches application data during node traversal.
  - Implements **Global Pool Random** strategy: flattens all images into one large pool for the entire gallery.
- **Data Shape**: `mediaData` dictionary contains pre-resolved media objects.

## 2. Server-Side Optimized Strategy (Dynamic Carousels)

**Used in**: `ApplicationCasesSection`, `ApplicationsSection` (One-Stop), `ApplicationMoreCasesSection`, `SupportApplicationsSection`.

### High-Performance Pipeline

Instead of "Fetch-and-Filter" on the client, we use a "Slim-Response" architecture:

- **Backend Selection (`/api/applications/route.ts`)**:
  - The API performs the "Flat Pool" random selection internally.
  - **Payload Thinning**: It returns only a single, pre-selected `image` object per application.
  - **JSON Reduction**: Removes heavy `sceneGallery` and full collections, reducing payload size by ~90%.
- **Rich Media Objects**:
  - The client receives a full media object containing `variants` (sizes), enabling `OptimizedImage` to pull the correct WebP variant (e.g., `xlarge` for hero blocks).

## 3. Core Logic: Server-Side Randomization

The selection logic previously in `getRandomAppImage` (frontend) is now standard in backend API routes to ensure:

1.  **Network Efficiency**: No unnecessary data transfer.
2.  **Visual Variety**: Each fetch provides a fresh random image from the pool.
3.  **Consistency**: Unified selection logic (sceneGallery -> root images -> mainImage).

## 4. Interaction & Rendering Performance

To eliminate "Jank" during rapid navigation in carousels, the following rules are enforced:

### A. Stable Component Keys

**Never use indices as keys.** Always use `item.id + index`.
-   Allows React to reuse DOM nodes during transitions.
-   Prevents image flickering and redundant decodes.

### B. Interaction Throttling

-   **Cooldown**: 150ms - 250ms throttling on navigation buttons.
-   Prevents UI layout thrashing when users rapid-click arrows.

### C. Eager Optimization

-   **Loading**: Use `loading="eager"` for the immediate carousel items.
-   **Sizes**: Map `OptimizedImage` sizes to match visual weight (e.g., `xlarge` for main hero images, `large` for grid items).

## 5. Key Improvements (Summary)

-   **Selection Logic**: Moved from Client -> Server (API Level).
-   **Payload**: JSON response optimized for 1:1 card mapping.
-   **Stability**: Ref-based click locking + stable React keys.
-   **Media Delivery**: Mandatory use of rich `image` objects with WebP variants.
