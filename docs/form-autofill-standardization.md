# Form UI Standardization & Chrome Autofill Override Guide

This document outlines the standardized approach for implementing form input styles and handling Chrome/Safari autofill overrides across the Busrom project.

## 1. Design Tokens Reference

### Transparent/Gradient Theme (e.g., FAQ Section)
- **Background**: `#211c0b2e` (18% Opacity Dark Olive)
- **Border/Stroke**: `1px solid #ffffff57` (34% Opacity White)
- **Text Color**: `#FFFFFF` (100% Opacity - for user input and autofill)
- **Placeholder Color**: `rgba(255, 255, 255, 0.5)`
- **Font**: Anaheim (600 Weight)

### Opaque/Solid Theme (e.g., Application Section)
- **Background**: `#D4CBAF` (Opaque Beige)
- **Border**: None (or matching solid color)
- **Text Color**: `#463B17` (Dark Brown)
- **Font**: Montserrat (Semi-bold)

---

## 2. Chrome Autofill Override Strategies

Chrome (and Safari) applies a default yellow background (`#E8F0FE`) and black text to autofilled fields. Use the following strategies based on the input's background transparency.

### Strategy A: For Semi-Transparent or Gradient Backgrounds
**Use Case**: When the input background is not 100% opaque (e.g., `#211c0b2e`).
**Method**: The "Transition Delay" hack.

```css
/* Suppression of browser default background */
input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus {
  /* 1. Force the custom text color (color property is often ignored) */
  -webkit-text-fill-color: [YOUR_TEXT_COLOR] !important;
  
  /* 2. Prevent background-color change by setting an infinite transition */
  transition: background-color 5000000s ease-in-out 0s !important;
  
  /* 3. Set autofill background to transparent to reveal element's actual background */
  background-color: transparent !important;
  
  /* 4. Ensure font remains consistent */
  font-family: inherit !important;
}
```

### Strategy B: For Opaque/Solid Backgrounds
**Use Case**: When the input background is a solid color (e.g., `#D4CBAF`).
**Method**: The "Box-Shadow Inset" hack.

```css
input:-webkit-autofill {
  /* 1. Force the custom text color */
  -webkit-text-fill-color: [YOUR_TEXT_COLOR] !important;
  
  /* 2. Cover the yellow background with a solid inset shadow */
  -webkit-box-shadow: 0 0 0px 1000px [SOLID_BG_COLOR] inset !important;
  
  /* 3. Use transition as a fallback/stability measure */
  transition: background-color 5000000s ease-in-out 0s !important;
}
```

---

## 3. Best Practices

1.  **Text Fill Color**: Always use `-webkit-text-fill-color` instead of `color`.
2.  **Global Selectors**: For composite components (like `PhoneInput`), use `:global()` selectors to ensure internal native `<input>` elements receive these styles.
3.  **WhatsApp Input**: For split inputs (Country Code + Number), wrap them in a container with `overflow: hidden` and move the absolute-positioned dropdown *outside* the clipped container to maintain perfect corner radius alignment while keeping functionality.
4.  **Wait for Transition**: The `5000000s` transition ensures the user never sees the color flip back to yellow during a standard session.

---

## 4. Implementation Example (SCSS/CSS-in-JS)

```javascript
/* Standardized CSS for FaqContactSection.tsx */
.faq-input-el:-webkit-autofill,
.faq-input-el:-webkit-autofill:hover,
.faq-input-el:-webkit-autofill:focus {
  -webkit-text-fill-color: #FFFFFF !important;
  transition: background-color 5000000s ease-in-out 0s !important;
  background-color: transparent !important;
  font-family: var(--font-anaheim), sans-serif !important;
}
```

---

## 5. WhatsApp / Phone Field Refactoring Pattern

To gain full control over the visual style, especially with complex borders and autofill issues, we use an **Atomic Layout Pattern** instead of a bundled component.

### The Problem
- **Black-box components** make it hard to style the inner `input` or handle rounded corners correctly during autofill.
- `overflow: hidden` on the main container clips the country selector dropdown.

### The Solution: Atomic Refactoring
1.  **Structure**: Manually build a `flex` container.
2.  **Clipping Layer**: Use a middle container with `overflow: hidden` and the required `border-radius`. This ensures that any background color (including Chrome's yellow or our solid overrides) is perfectly clipped.
3.  **Dropdown Handling**: Place the absolute-positioned `CountrySelectorList` **outside** the `overflow: hidden` container but within a `relative` root.

### Reference Structure (React/TSX)
```tsx
<div className="relative" ref={countrySelectorRef}> {/* Root for Dropdown Positioning & Click-Outside */}
  
  {/* The Clipping & Styling Layer */}
  <div className="flex items-stretch overflow-hidden w-full" 
       style={{ borderRadius: '15px', border: '1px solid #ffffff57', background: '#211c0b2e' }}>
    
    {/* 1. Country Selector Trigger */}
    <button type="button" className="...">
       <CountryFlag ... />
       <span>+1</span>
    </button>
    
    {/* 2. Atomic Input Field */}
    <input type="tel" className="faq-input-el flex-1 bg-transparent border-none outline-none" />
  </div>

  {/* 3. Dropdown (Positioned outside the overflow-hidden div) */}
  {isOpen && (
    <div className="absolute left-0 bottom-full mb-2 z-[100]">
      <CountrySelectorList ... />
    </div>
  )}
</div>
```

### Key Refactoring Rules
- **Inherit Autofill**: Always give the inner `input` the same class (e.g., `.faq-input-el`) as other fields to ensure a consistent autofill transition.
- **Z-Index**: Ensure the dropdown has a high `z-index` (e.g., `100`) to overlay other form elements.

---

## 6. Privacy Consent Text Standard

Across all contact forms, the privacy consent text (the text next to the checkbox) must follow these size standards for visual consistency:

### Desktop (Viewport > 768px)
- **Font Size**: `14px` (Standardized from 16px)
- **Line Height**: `relaxed` (approx. 1.5 - 1.6) or specifically set to `vw(18)` in some designs.

### Mobile (Viewport <= 768px)
- **Font Size**: `12px` or `mvw(14)` depending on the specific layout design.
- **Line Height**: `relaxed` or `mvw(18)`.

### Common Implementation Patterns
- **Tailwind**: Use `text-sm` (instead of `text-base`) for the paragraph element on desktop.
- **Style Object**: `style={{ fontSize: isMobile ? "12px" : "14px" }}`.
- **Color**: 
  - Standard: Typically uses a lowered opacity (e.g., `text-gray-500` or `text-[#4B3A02]/80`).
  - **Premium (Transparent Theme)**: Uses `#FFFFFF` (100% opacity) for maximum readability against dark/gradient backgrounds.
