# Fix: Product Series Carousel Infinite Requests

## Problem Description

When opening the Product Series Carousel field in Payload CMS admin, the page would make excessive/infinite API requests, causing performance issues and potential server overload.

## Root Causes

### 1. MultilingualCarouselItems Component

**File:** `/src/components/fields/MultilingualCarouselItems/index.tsx`

**Issues:**

1. **useEffect dependency loops (Lines 36-87)**
   - Multiple `useEffect` hooks were updating state based on other state changes
   - No initialization guard, causing effects to run immediately on mount
   - localStorage save effects running on every state change, even during initialization

2. **Specific problematic patterns:**
   ```typescript
   // Problem 1: Runs on mount and triggers saves
   useEffect(() => {
     // Load from localStorage
     setSourceLanguage(...)
     setSelectedLanguages(...)
   }, [])

   // Problem 2: Saves immediately, even during initialization
   useEffect(() => {
     localStorage.setItem('payloadTranslatorLanguages', ...)
   }, [selectedLanguages]) // Triggered by the load above!

   // Problem 3: Updates state on dependency change
   useEffect(() => {
     setSelectedLanguages(prev => prev.filter(...))
   }, [sourceLanguage]) // Can trigger chain reaction
   ```

### 2. MediaPicker Component

**File:** `/src/components/fields/MediaPicker/index.tsx`

**Issues:**

1. **useCallback dependency issue (Line 190-194)**
   ```typescript
   // Problem: fetchMedia recreates on ANY state change
   const fetchMedia = useCallback(async () => {
     // ... fetch logic
   }, [page, search, categoryFilter, /* 7+ dependencies */])

   // This effect runs whenever fetchMedia reference changes
   useEffect(() => {
     if (isOpen) {
       fetchMedia()
     }
   }, [isOpen, fetchMedia]) // fetchMedia changes constantly!
   ```

2. **Multiple instances**
   - Each carousel item has 2 MediaPicker instances (image + sceneImage)
   - With 9 carousel items, that's 18 MediaPicker instances
   - Each one potentially fetching categories, tags, and selected media

## Solutions

### 1. Shared Cache for Media Filters

**New File:** `/src/lib/media-filters-cache.ts`

Created a global cache system to prevent duplicate requests for categories and tags:

```typescript
// Features:
// - In-memory cache with 5-minute TTL
// - Request deduplication (if request is ongoing, wait for it)
// - Automatic cleanup after requests complete
// - Prefetch capability for warming up cache

export async function fetchMediaCategories(): Promise<MediaCategory[]>
export async function fetchMediaTags(): Promise<MediaTag[]>
```

**Impact:**
- **Before:** 18 MediaPicker instances = 36 requests (18 categories + 18 tags)
- **After:** 18 MediaPicker instances = 2 requests (1 category + 1 tag, shared by all)
- **Reduction:** 94% fewer requests!

### 2. MultilingualCarouselItems Fixes

1. **Added initialization guard:**
   ```typescript
   const [isInitialized, setIsInitialized] = useState(false)

   useEffect(() => {
     const timer = setTimeout(() => setIsInitialized(true), 100)
     return () => clearTimeout(timer)
   }, [])
   ```

2. **Prevented saves during initialization:**
   ```typescript
   useEffect(() => {
     if (isInitialized && typeof window !== 'undefined') {
       localStorage.setItem('payloadTranslatorSourceLang', sourceLanguage)
     }
   }, [sourceLanguage, isInitialized])
   ```

3. **Prevented auto-deselect during initialization:**
   ```typescript
   useEffect(() => {
     if (isInitialized) {
       setSelectedLanguages(prev => prev.filter(lang => lang !== sourceLanguage))
     }
   }, [sourceLanguage, isInitialized])
   ```

### 3. MediaPicker Fixes

1. **Removed fetchMedia from dependencies:**
   ```typescript
   // Before: Depended on fetchMedia callback
   useEffect(() => {
     if (isOpen) {
       fetchMedia()
     }
   }, [isOpen, fetchMedia])

   // After: Directly depend on the filter states
   useEffect(() => {
     if (isOpen) {
       fetchMedia()
     }
   }, [isOpen, page, search, categoryFilter, /* all filters */])
   ```

2. **Improved selectedMedia fetching:**
   - Added explicit `setSelectedMedia([])` for empty cases
   - Better error handling

## Testing

To verify the fix:

1. Clear browser cache and reload
2. Open Payload CMS admin
3. Navigate to Homepage → Product Series Carousel
4. Open browser DevTools → Network tab
5. Click to expand the carousel items field

**Expected behavior:**

Initial load should show:
- ✅ **1 request** for `/api/media-categories?limit=100&sort=order`
- ✅ **1 request** for `/api/media-tags?limit=100&sort=name`
- ✅ **0 duplicate** requests (all instances share the cache)

**Before the fix:**
- ❌ **18 requests** for media-categories
- ❌ **18 requests** for media-tags
- ❌ Total: 36 redundant requests

**After the fix:**
- ✅ **1 request** for media-categories
- ✅ **1 request** for media-tags
- ✅ Total: 2 requests (94% reduction!)

6. **Test filter changes:**
   - Change search query
   - Change category filter
   - Switch between locales
   - **Expected:** Only 1 request per filter change
   - **No repeated** category/tag fetches (cache is reused)

## Files Modified

- **New:** `/src/lib/media-filters-cache.ts` - Shared cache for media filters
- `/src/components/fields/MediaPicker/index.tsx` - Use shared cache
- `/src/components/fields/MultilingualCarouselItems/index.tsx` - Fix useEffect loops

## Related Documentation

- [MEDIA_CACHING_OPTIMIZATION.md](./MEDIA_CACHING_OPTIMIZATION.md) - Detailed documentation on the caching system

## Related Issues

This fix also prevents:
- Excessive localStorage writes
- Unnecessary React re-renders
- Server load from repeated API calls
- Potential rate limiting issues

## Prevention Guidelines

### For React Hooks:

1. **Always guard initialization effects:**
   ```typescript
   const [isInitialized, setIsInitialized] = useState(false)

   useEffect(() => {
     // Delay to avoid running effects during initial state setup
     const timer = setTimeout(() => setIsInitialized(true), 100)
     return () => clearTimeout(timer)
   }, [])
   ```

2. **Avoid useCallback in useEffect dependencies:**
   ```typescript
   // ❌ BAD: Callback will recreate frequently
   const fetchData = useCallback(() => {...}, [dep1, dep2, dep3])
   useEffect(() => {
     fetchData()
   }, [fetchData])

   // ✅ GOOD: Depend on actual values
   useEffect(() => {
     fetchData()
   }, [dep1, dep2, dep3])
   ```

3. **Be careful with state updates in effects:**
   ```typescript
   // ❌ BAD: Can cause loops
   useEffect(() => {
     setState(prevState => transform(prevState))
   }, [otherState])

   // ✅ GOOD: Add guards
   useEffect(() => {
     if (isInitialized && shouldUpdate) {
       setState(prevState => transform(prevState))
     }
   }, [otherState, isInitialized, shouldUpdate])
   ```

4. **Monitor multiple instances:**
   - If a component renders multiple times, multiply all effects
   - Consider lazy loading or memoization
   - Use React DevTools Profiler to check render counts

## Status

✅ **Fixed** - Both components now have proper effect management and won't cause infinite requests.

---

**Fixed Date:** 2025-12-16
**Issue:** Product Series Carousel infinite requests
**Severity:** High (Performance impact, server load)
