/**
 * Shop Page Skeleton
 *
 * 商店页面骨架屏，在数据加载时显示
 */

export function ShopPageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 pt-20" data-header-theme="light">
      <div className="container mx-auto px-4 py-8">
        {/* Page Title Skeleton */}
        <div className="mb-8">
          <div className="h-10 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-5 w-64 bg-gray-200 rounded animate-pulse"></div>
        </div>

        {/* Filters/Categories Skeleton */}
        <div className="mb-8 flex gap-3 overflow-x-auto pb-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-10 w-28 bg-gray-200 rounded-full animate-pulse flex-shrink-0"
            ></div>
          ))}
        </div>

        {/* Product Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-white rounded-lg overflow-hidden border border-gray-200">
              {/* Image Skeleton */}
              <div className="relative aspect-[3/4] bg-gray-200 animate-pulse">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer"></div>
              </div>

              {/* Content Skeleton */}
              <div className="p-4 space-y-3">
                <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-5 w-full bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-10 w-full bg-gray-200 rounded-lg animate-pulse mt-4"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Skeleton */}
        <div className="mt-12 flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-10 w-10 bg-gray-200 rounded animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    </div>
  )
}
