# One-Stop Shop Implementation Memory

This document serves as a "Memory" for the architectural and design decisions made during the One-Stop Shop project refinement.

## 1. Data Extraction Logic (The "Territory" Pattern)
**File**: `OneStopShopTemplate.tsx`
**Problem**: CMS content from Lexical often lacks explicit structural metadata, leading to "data bleeding" between sections where titles from one section are incorrectly captured by another.
**Solution**:
- **Physical Separators**: Use `/line` (`horizontalrule`) or `/quote` (`quote`) nodes as strict boundaries.
- **Chunking**: The `extractSection` function flattens the Lexical tree and splits it into discrete "territories" based on these separators.
- **Targeted Lookup**: For any given section marker (e.g., `brand-highlights-item`), the engine first identifies which "territory" it belongs to and only extracts titles and items from within that specific chunk.

## 2. Premium Title Rendering (Stroke + Fill)
**Pattern**: Used in `ProductSeriesShowcaseSection.tsx` and `BrandHighlightsSection.tsx`.
**Technique**:
- **Double Layering**: For color-shifting effects, use two layers of titles. One is masked within an overflow-hidden card to change color as elements move underneath.
- **CSS Stroke**:
  ```css
  WebkitTextStroke: "2px #756F3F",
  paintOrder: "stroke fill",
  color: "#F6F4ED"
  ```
- **Paint Order**: Setting `paintOrder: "stroke fill"` is critical. It ensures the stroke is rendered *behind* the fill, preventing the stroke from thickening the font internally and preserving legibility.

## 3. Brand Highlights Animation ("Flying" Transition)
**Component**: `BrandHighlightsSection.tsx`
**Logic**:
- **Shared Element Illusion**: Uses `framer-motion` to animate the transition between the thumbnail preview (bottom-left) and the main showcase (right).
- **Coordinate Calculation**:
  - `flyOffsetX = -1018`
  - `flyOffsetY = 605`
  - `flyScale = 0.363` (Calculated from `282px / 777px`)
- **Interaction**: Clicking "Next" triggers a "flying" effect where the new item enters from the thumbnail's coordinates and scales up to the main position.

## 4. CMS Format Mapping
**Rule**:
- **Bold (Lexical format 1)**: Mapped to the "Premium" title line (Stroked/Gold).
- **Normal**: Mapped to the "Sub-title" line (Solid Black).
- **Markers (format 16)**: Automatically filtered out from UI rendering to prevent internal IDs from appearing on the frontend.

## 5. Responsive Design Standards
- **70% Scale Container**: Many sections use a `transform: scale(0.7)` container with an origin-top to match high-fidelity Figma designs on desktop.
- **Negative Margin Correction**: To prevent excessive white space caused by scaling, a negative `marginBottom` (e.g., `-362px`) is applied to the scaled container.
