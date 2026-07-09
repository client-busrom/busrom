import Link from "next/link";
import { OptimizedImage } from "@/components/ui/OptimizedImage";

function isBlogVisible(post: any): boolean {
  if (!post || !post.publishedAt) return false
  return new Date(post.publishedAt).getTime() <= Date.now()
}

export function PopularTopics({
  config,
  locale,
  allLabel,
  blogs,
  categoryTabs,
  hydratedPosts,
}: any) {
  const safeImage = (img: any) => {
    if (!img) return "";
    if (typeof img === "string") return img;
    if (img.url) return img.url;
    return "";
  };

  const localePrefix = locale === "en" ? "" : `/${locale}`;

  return (
    <section className="bg-transparent py-24 sm:py-32 overflow-hidden">
      <div className="mx-auto w-full px-6 max-w-[1280px]">
        <div className="mb-14 text-center">
          <h2 className="text-base uppercase font-lexend-deca font-bold pl-4 relative after:absolute after:rounded-full -mt-1 after:content-[''] after:h-2 after:w-2 after:bg-[#ff4848] after:left-0 after:top-2 w-fit mx-auto">
            {config?.navTitle || "POPULAR TOPICS"}
          </h2>
        </div>

        <ul className="text-center flex flex-wrap justify-center gap-x-3 gap-y-4 sm:gap-6 lg:gap-8 [&>li]:text-2xl sm:[&>li]:text-3xl lg:[&>li]:text-4xl [&>li]:cursor-pointer font-prata text-black [&>li]:capitalize">
          {/* ALL Category */}
          <li className="relative group transition-all duration-300 list-none">
            <Link
              href={`${localePrefix}/knowledge-base-blogs`}
              className="inline-block relative"
            >
              <span
                className={`transition-all duration-100 relative z-30 group-hover:text-white group-hover:drop-shadow-lg`}
              >
                {allLabel || "all"}
              </span>
              {/* Floating Preview Image */}
              <span className="absolute h-[100px] lg:h-[130px] w-[200px] lg:w-[250px] left-1/2 top-[35%] -translate-x-1/2 -translate-y-1/2 opacity-0 invisible scale-90 -rotate-12 transition-all duration-300 group-hover:opacity-100 group-hover:visible group-hover:scale-100 overflow-hidden rounded-2xl z-20 pointer-events-none mt-4 group-hover:mt-0 shadow-2xl">
                <OptimizedImage
                  image={safeImage(blogs[0]?.coverImage)}
                  alt="All Categories"
                  size="small"
                  className="object-cover h-full w-full scale-125 group-hover:scale-100 transition-all duration-300"
                />
              </span>
            </Link>
            <span className="ml-3 sm:ml-6 lg:ml-8 opacity-30 text-[36px] font-light">
              /
            </span>
          </li>

          {categoryTabs.map((tab: any, idx: number) => {
            const postsList =
              tab.blogPosts?.docs ||
              (Array.isArray(tab.blogPosts) ? tab.blogPosts : []);
            const previewId =
              typeof postsList[0] === "object" && postsList[0] !== null
                ? postsList[0].id
                : postsList[0];

            let previewPost = previewId
              ? blogs.find((b: any) => String(b.id) === String(previewId)) ||
              hydratedPosts[previewId]
              : null;

            // If previewPost is still missing but we had a fallback object from earlier bad types
            if (!previewPost && typeof postsList[0] === "object") {
              previewPost = postsList[0];
            }

            // Never preview a future-dated blog
            if (previewPost && !isBlogVisible(previewPost)) {
              previewPost = null;
            }

            return (
              <li
                key={tab.id}
                className="relative group transition-all duration-300 list-none"
              >
                <Link
                  href={`${localePrefix}/knowledge-base-blogs/${tab.slug}`}
                  className="inline-block relative"
                >
                  <span
                    className={`transition-all duration-100 relative z-30 group-hover:text-white group-hover:drop-shadow-lg`}
                  >
                    {tab.name}
                  </span>
                  {/* Floating Preview Image */}
                  {previewPost?.coverImage && (
                    <span className="absolute h-[100px] lg:h-[130px] w-[200px] lg:w-[250px] left-1/2 top-[35%] -translate-x-1/2 -translate-y-1/2 opacity-0 invisible scale-90 -rotate-12 transition-all duration-300 group-hover:opacity-100 group-hover:visible group-hover:scale-100 overflow-hidden rounded-2xl z-20 pointer-events-none mt-4 group-hover:mt-0 shadow-2xl">
                      <OptimizedImage
                        image={safeImage(previewPost?.coverImage)}
                        alt={tab.name}
                        size="small"
                        className="object-cover h-full w-full scale-125 group-hover:scale-100 transition-all duration-300"
                      />
                    </span>
                  )}
                </Link>
                {idx < categoryTabs.length - 1 && (
                  <span className="ml-3 sm:ml-6 lg:ml-8 opacity-30 text-[36px] font-light">
                    /
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
