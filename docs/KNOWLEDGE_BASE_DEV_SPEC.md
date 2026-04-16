# Knowledge Base (Blog) System Development Specification

## 1. Overview
The Knowledge Base system is driven by a Payload CMS Global configuration (`knowledge-base-settings`). It allows dynamic layout control for the List Page and feature toggles for the Detail Page (Sidebar and Footer).

## 2. Backend Data Structure (Payload CMS)

### Global: `knowledge-base-settings`
- **Slug**: `knowledge-base-settings`
- **Tabs**:
    - **List Page**: Contains Hero configuration, Category Navigation (Popular Topics), and `layoutSections` (Dynamic Blocks).
    - **Sidebar**: Global settings for the blog detail sidebar components (TOC, Share, Search, Categories, Recommended, Follow).
    - **Footer**: Global settings for the blog detail footer sections (Category Guide, Prev/Next, Bottom Recommendations).

### Collection: `Blogs`
- **Slug**: `blogs`
- **Key Fields**:
    - `templateType`: String (`template1`, `template2`, `template3`). Determines which UI template to use for the detail page.
    - `content`: Lexical rich text.
    - `tags`: Relationship to `blog-tags`.
    - `categories`: Relationship to `categories`.

---

## 3. Frontend Implementation Guidelines

### 3.1 List Page (`BlogListClient.tsx`)
1. **Hero Section**: Fetches `heroTagTitle` and `featuredPost` from Global settings. Fallbacks to the latest post if not set.
2. **Category Nav**: Renders `categoryTabs` from Global. Categories are filtered by `type: 'blog'`.
3. **Dynamic Sections**: Iterates through `layoutSections` (Blocks). Each block maps to one of 4 visual templates:
    - **Template 1**: Vertical list with sticky intro (Latest).
    - **Template 2**: Dark theme vertical list (Popular).
    - **Template 3**: Scattered grid layout (Trending).
    - **Template 4**: Highlighted banner (Post of the Week).
4. **Data Fetching**: If a section has a `selectedTag`, the frontend fetches the top 4/8 posts associated with that tag.

### 3.2 Detail Page (`BlogDetailClient.tsx`)
1. **Template Selection**: Read `templateType` from the blog post data.
2. **Global Components**:
    - **Sidebar**: The visibility of sidebar units (e.g., TOC, Search) is controlled by the Global settings' "Applicable Templates" field.
    - **Footer**: Similar to sidebar, footer sections are toggled based on the current template's eligibility.
3. **Contextual Logic**:
    - **Prev/Next**: Fetches adjacent posts based on `publishedAt` date.
    - **Recommendations**: Combines manual selections from Global with automatic "related by tag" fallback.

---

## 4. Technical Constants & Endpoints
- **API (Global)**: `/api/payload/globals/knowledge-base-settings`
- **API (Blogs)**: `/api/payload/blogs`
- **Standard Locales**: `en`, `zh`
- **Image Handling**: Use `next/image` via the `Media` collection URL.

## 5. Deployment & Maintenance
- **Permissions**: Ensure the `knowledge-base-settings` global has appropriate access control for the `content-manager` role.
- **Cache**: Implement revalidation logic when the Global settings are updated in the CMS.
