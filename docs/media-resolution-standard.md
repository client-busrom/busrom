# Media Resolution & Application Data Standards

## 1. Application Collection Structure (Payload CMS)

The `applications` collection is structured as a **Media Atlas (图集)**, not a single-image showcase.

- **Collection Slug**: `applications`
- **Core Media Field**: `sceneGallery` (Array)
  - `sceneName`: Localized title for the scene.
  - `images`: Relationship to `media` collection (`hasMany: true`).
  
**CRITICAL**: There is NO `mainImage` field at the root level of the `applications` collection.

## 2. Image Selection Algorithm (The "Double-Random" Rule)

When a single "preview" or "cover" image is required for an Application (e.g., in a carousel or grid list), the following algorithm MUST be used to ensure visual variety, avoid scene-dominance bias, and minimize server-side memory overhead:

1. **Scene Selection**: Randomly pick one scene from the `sceneGallery` array that contains at least one image ($O(1)$ complexity).
2. **Image Selection**: From the selected scene, randomly pick one image from its `images` array ($O(1)$ complexity).

### Rationale

- **Scene Balance**: Each scene (e.g., "Living Room", "Kitchen") gets equal exposure regardless of how many photos it contains.
- **Memory Efficiency**: Avoids creating temporary "flat" arrays in memory, reducing Garbage Collection (GC) pressure on the server/BFF.

### Fallback

If the first random pick fails (e.g., empty array), move to the next available scene/image. If all are empty, return `undefined`.

### Reference Implementation (JS/TS)

```typescript
function getRandomAppImage(application: any) {
  const gallery = application.sceneGallery || [];
  const validScenes = gallery.filter(scene => scene.images && scene.images.length > 0);
  
  if (validScenes.length === 0) return undefined;
  
  // 1. Random Scene
  const randomScene = validScenes[Math.floor(Math.random() * validScenes.length)];
  
  // 2. Random Image
  const images = randomScene.images;
  const randomImage = images[Math.floor(Math.random() * images.length)];
  
  return randomImage; // This object reflects the normalized MediaObject
}
```

## 3. CDN Strategy & Normalization

All media URLs (including those inside `sceneGallery`) MUST be processed via `convertToCDNUrl`.

- **Domestic (CN)**: `https://cdn.busromhouse.com`
- **Global**: `https://d2kqew3hn5wphn.cloudfront.net`
- **Logic Location**: 
  - **API Level**: Prefer normalizing in `/api/applications` or `/api/products` using the `cdn_strategy` cookie.
  - **Template Level**: Use `convertToCDNUrl` as a safety wrapper for any absolute URLs or manual fallbacks.

## 4. Maintenance Notes
- DO NOT use `application.mainImage` as it does not exist in the schema.
- DO NOT default to `sceneGallery[0].images[0]` as it defeats the purpose of the dynamic showcase.
