import Link from "next/link";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { safeImage } from "../BlogListClient";
import type { Locale } from "@/i18n.config";

interface HeroBannerProps {
  hero: {
    tag: string;
    post: any;
  };
  locale: Locale;
}

export function HeroBanner({ hero, locale }: HeroBannerProps) {
  if (!hero.post) return null;

  const localePrefix = locale === 'en' ? '' : `/${locale}`;

  return (
    <section className="pt-24 lg:pt-[3vw]">
      <div className="mx-auto w-full px-3 md:px-6 lg:max-w-[1024px] xl:max-w-[1280px]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
          {/* LEFT COLUMN - HEADER & METADATA (7 Columns) */}
          <div className="lg:col-span-7 flex flex-col justify-end lg:pt-[100px]">
            {/* Article Metadata Card with Bridge */}
            <article className="lg:min-h-[358px] lg:max-h-[566px] w-full transition-all duration-500 bg-[#756f3f] group relative rounded-xl md:rounded-2xl rounded-tr-none md:rounded-tr-none text-center px-4 sm:px-8 md:px-12 py-10 sm:py-16 mt-4 sm:mt-8 lg:mt-0 flex flex-col justify-center shadow-xl">
              {/* The exact bridge SVG from the snippet, now matching card color to stretch upwards */}
              <style dangerouslySetInnerHTML={{
                __html: `
                .hero-tag-scroll-area {
                  scrollbar-width: thin;
                  scrollbar-color: transparent transparent;
                  transition: scrollbar-color 0.3s;
                }
                .hero-tag-scroll-area:hover, .hero-tag-scroll-area:active {
                  scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
                }
                .hero-tag-scroll-area::-webkit-scrollbar {
                  width: 4px;
                }
                .hero-tag-scroll-area::-webkit-scrollbar-track {
                  background: transparent;
                }
                .hero-tag-scroll-area::-webkit-scrollbar-thumb {
                  background: transparent;
                  border-radius: 4px;
                }
                .hero-tag-scroll-area:hover::-webkit-scrollbar-thumb,
                .hero-tag-scroll-area:active::-webkit-scrollbar-thumb {
                  background: rgba(255, 255, 255, 0.3);
                }
              `}} />

              <div className="absolute -top-[31px] right-0 flex items-end max-w-[calc(100%-32px)] z-20">
                <svg
                  className="text-[#756f3f] relative -right-px flex-shrink-0"
                  width="86"
                  height="32"
                  viewBox="0 0 86 32"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M85.3511 32H0C8.17473 32 15.7118 28.9386 19.7164 23.9923L32.6592 8.00769C36.6639 3.06146 44.2025 0 52.3758 0H85.3511V32Z"
                    fill="currentColor"
                  ></path>
                </svg>
                <div className="h-8 bg-[#756f3f] rounded-tr-xl md:rounded-tr-2xl flex items-start pr-4 pl-2 max-w-[60vw] sm:max-w-[320px]">
                  {/* Featured Badge */}
                  <div className="relative text-[16px] font-bold tracking-widest pl-7 pr-2 py-[6px] after:absolute after:rounded-full after:content-[''] after:h-[8px] after:w-[8px] after:bg-[#ff4848] after:left-[13px] after:top-1/2 after:-translate-y-1/2 text-white bg-white/10 backdrop-blur-md rounded-[16px] border border-white/10 mt-[15px]">
                    <div
                      className="hero-tag-scroll-area overflow-y-auto overflow-x-hidden overscroll-contain pr-2 break-words whitespace-normal"
                      data-lenis-prevent="true"
                      style={{ maxHeight: '44px', lineHeight: '22px' }}
                    >
                      {hero.tag || "Featured Post"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Stretched link for the entire card (z-10). It sits below the tag (z-20) */}
              <Link href={`${localePrefix}/knowledge-base-blog/${hero.post.slug}`} className="absolute inset-0 z-10" aria-label={hero.post.title}></Link>

              <div className="mt-6 text-white">

                <h3 className="text-3xl sm:text-4xl text-white !leading-normal line-clamp-3 relative z-0 pointer-events-none">
                  <span className="bg-gradient-to-r from-white to-white bg-[length:0%_2px] bg-no-repeat bg-right-bottom transition-[background-size] duration-500 group-hover:bg-[length:100%_2px] group-hover:bg-left-bottom">
                    {hero.post.title}
                  </span>
                </h3>

                <ul className="flex flex-wrap items-center justify-center gap-3 gap-y-1 text-sm mt-6 mb-4">
                  <li className="flex items-center">
                    {hero.post.author?.avatar && (
                      <OptimizedImage
                        image={safeImage(hero.post.author.avatar)}
                        alt={hero.post.author.name}
                        size="small"
                        className="h-6 w-6 rounded-full mr-2 object-cover"
                      />
                    )}
                    {hero.post.author?.name || "Kathryn Jackson"}
                  </li>
                </ul>

                <Link
                  className="h-12 sm:h-14 w-12 sm:w-14 m-auto flex items-center justify-center text-white group-hover:text-white group-hover:bg-white/10 bg-white/30 sm:bg-transparent rounded-full transition-all duration-300 p-[17px] sm:p-0 group-hover:rotate-45 relative z-10"
                  href={`${localePrefix}/knowledge-base-blog/${hero.post.slug}`}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M1.99902 18.0009L18 1.99991M18 1.99991H3.59912M18 1.99991V16.4008"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>
                  </svg>
                </Link>
              </div>
            </article>
          </div>

          {/* RIGHT COLUMN - SIMPLE IMAGE & CATEGORY (5 Columns) */}
          <div className="lg:col-span-5 relative hidden lg:flex flex-col h-full ml-0 lg:ml-4">
            <Link href={`${localePrefix}/knowledge-base-blog/${hero.post.slug}`} className="absolute inset-0 z-10" aria-label={hero.post.title}></Link>
            {/* Image with Parallax & Hover Effect */}
            <div className="absolute inset-0 w-full h-full rounded-[16px] lg:rounded-[32px] overflow-hidden group">
              <OptimizedImage
                image={safeImage(hero.post.coverImage)}
                alt={hero.post.title}
                size="large"
                priority
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none rounded-[16px] lg:rounded-[32px]"></div>
            </div>
            <span className="absolute top-0 right-0 z-20 flex items-center justify-center bg-[#F6F4ED] rounded-bl-[16px] lg:rounded-bl-[32px] pl-[10px] pb-[10px] lg:pl-[24px] lg:pb-[24px] pointer-events-auto">
              <Link
                href={`${localePrefix}/knowledge-base-blogs`}
                onClick={() => {
                  if (typeof window !== 'undefined' && hero.post.tags?.[0]?.slug) {
                    sessionStorage.setItem('pendingBlogTag', hero.post.tags[0].slug);
                  }
                }}
                className="border-2 border-[#756f3f] transition duration-300 hover:text-white hover:border-[#756f3f] text-dark bg-transparent hover:bg-[#756f3f] rounded-[8px] px-5 py-2 text-[14px] font-bold tracking-widest inline-flex"
              >
                {hero.post.tags?.[0]?.name || "Featured"}
              </Link>

              {/* Corner Left (left of the badge) */}
              <div className="text-[#F6F4ED] absolute top-0 right-full w-[16px] h-[16px]">
                <svg width="100%" height="100%" viewBox="0 0 101 101" fill="none" xmlns="http://www.w3.org/2000/svg" className="-scale-x-100">
                  <path fillRule="evenodd" clipRule="evenodd" d="M101 0H0V101H1C1 45.7715 45.7715 1 101 1V0Z" fill="currentColor"></path>
                </svg>
              </div>

              {/* Corner Bottom (below the badge) */}
              <div className="text-[#F6F4ED] absolute top-full right-0 w-[16px] h-[16px]">
                <svg width="100%" height="100%" viewBox="0 0 101 101" fill="none" xmlns="http://www.w3.org/2000/svg" className="-scale-x-100">
                  <path fillRule="evenodd" clipRule="evenodd" d="M101 0H0V101H1C1 45.7715 45.7715 1 101 1V0Z" fill="currentColor"></path>
                </svg>
              </div>
            </span>

            {/* Squircle Category Badge (Bottom Right) */}
            <span className="absolute bottom-0 right-0 z-20 flex items-center justify-center bg-[#F6F4ED] rounded-tl-xl md:rounded-tl-2xl pl-2 pt-2">
              <Link
                href={
                  hero.post.categories?.[0]?.slug
                    ? `${localePrefix}/knowledge-base-blogs/${hero.post.categories[0].slug}`
                    : `${localePrefix}/knowledge-base-blogs`
                }
                className="border-2 border-[#756f3f] transition duration-300 hover:text-white hover:border-[#756f3f] text-dark bg-transparent hover:bg-[#756f3f] rounded-[8px] px-5 py-2 text-[14px] font-bold tracking-widest inline-flex"
              >
                {hero.post.categories?.[0]?.name || "security"}
              </Link>

              {/* Corner Left */}
              <div className="text-[#F6F4ED] absolute bottom-0 right-full w-[16px] h-[16px]">
                <svg width="100%" height="100%" viewBox="0 0 101 101" fill="none" xmlns="http://www.w3.org/2000/svg" className="rotate-180">
                  <path fillRule="evenodd" clipRule="evenodd" d="M101 0H0V101H1C1 45.7715 45.7715 1 101 1V0Z" fill="currentColor"></path>
                </svg>
              </div>

              {/* Corner Top */}
              <div className="text-[#F6F4ED] absolute bottom-full right-0 w-[16px] h-[16px]">
                <svg width="100%" height="100%" viewBox="0 0 101 101" fill="none" xmlns="http://www.w3.org/2000/svg" className="rotate-180">
                  <path fillRule="evenodd" clipRule="evenodd" d="M101 0H0V101H1C1 45.7715 45.7715 1 101 1V0Z" fill="currentColor"></path>
                </svg>
              </div>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
