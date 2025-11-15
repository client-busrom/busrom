/**
 * Product Detail Page Skeleton
 *
 * 产品详情页骨架屏，在数据加载时显示
 */

export function ProductDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 pt-20" data-header-theme="light">
      <div className="container mx-auto px-4 py-8">
        {/* Main Section: Gallery (3/5) + Product Info (2/5) */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-12">
          {/* Left Column - Gallery Skeleton (3/5 width) */}
          <div className="lg:col-span-3">
            <div className="space-y-4">
              {/* Main Image Skeleton */}
              <div className="relative w-full h-[400px] md:h-[500px] lg:h-[550px] bg-gray-200 rounded-lg overflow-hidden animate-pulse">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer"></div>
              </div>

              {/* Thumbnail Navigation Skeleton */}
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="flex-1 flex gap-2 overflow-hidden">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="flex-shrink-0 w-20 h-20 bg-gray-200 rounded-lg animate-pulse"
                    ></div>
                  ))}
                </div>
                <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Right Column - Product Info Skeleton (2/5 width) */}
          <div className="lg:col-span-2 space-y-6">
            {/* SKU Skeleton */}
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>

            {/* Product Name Skeleton */}
            <div className="space-y-2">
              <div className="h-8 w-3/4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-5 w-1/2 bg-gray-200 rounded animate-pulse"></div>
            </div>

            {/* Short Description Skeleton */}
            <div className="space-y-2">
              <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-4/5 bg-gray-200 rounded animate-pulse"></div>
            </div>

            {/* Specifications Skeleton */}
            <div className="border-t border-gray-200 pt-6 space-y-4">
              <div className="h-6 w-40 bg-gray-200 rounded animate-pulse"></div>
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                  <div className="flex gap-2">
                    <div className="h-8 w-20 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="h-8 w-24 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="h-8 w-20 bg-gray-200 rounded-full animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Form Skeleton */}
            <div className="border-t border-gray-200 pt-6 space-y-4">
              <div className="h-6 w-36 bg-gray-200 rounded animate-pulse"></div>
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-10 w-full bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
              ))}
              <div className="h-12 w-full bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Collapsible Sections Skeleton */}
        <div className="lg:w-3/5 mb-12 space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 bg-gray-200 rounded-lg animate-pulse"
            ></div>
          ))}
        </div>

        {/* Related Products Skeleton */}
        <div>
          <div className="h-8 w-48 bg-gray-200 rounded mb-6 animate-pulse"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-[3/4] bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-5 w-full bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-10 w-full bg-gray-200 rounded-lg animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
