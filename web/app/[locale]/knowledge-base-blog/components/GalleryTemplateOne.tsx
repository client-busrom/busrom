import React from "react"
import Link from "next/link"
import { OptimizedImage } from "@/components/ui/OptimizedImage"

// Helper to prevent OptimizedImage from crashing on raw IDs (numbers)
const safeImage = (img: any) => (typeof img === 'number' ? null : img)

export function GalleryTemplateOne({ section, items, locale }: any) {
  const localePrefix = locale === "en" ? "" : `/${locale}`
  let fallbackLink = `${localePrefix}/knowledge-base-blogs`;
  let fallbackTag = '';
  if (section.tag) {
    let slug = section.tag?.slug;
    if (!slug && items?.[0]?.tags) {
      const targetId = typeof section.tag === 'object' ? section.tag.id : section.tag;
      const t = items[0].tags.find((t: any) => (t.id || t) === targetId);
      if (t?.slug) slug = t.slug;
    }
    if (slug) {
      fallbackTag = slug;
    }
  }

  return (
    <section className="pb-16 sm:pb-24">
      <div className="mx-auto w-full px-6 lg:max-w-[1024px] xl:max-w-[1280px]">
        <div className="w-full">
          <hr className="border-[#DBD8BD]" />
        </div>

        {/* Force Two-Column Layout with Flex */}
        <div className="flex flex-col lg:flex-row mt-16 sm:mt-24 gap-12">

          {/* LEFT SIDEBAR - 1/3 Width (col-4) */}
          <div className="w-full lg:w-1/3">
            <div className="sticky top-24 text-center lg:text-start">
              <p className="inline-flex items-center text-xs uppercase font-bold tracking-widest text-[#9C9C8C] mb-8">
                <span className="w-2 h-2 rounded-full bg-primary mr-3"></span>
                {section.tagTitle || "Latest Articles"}
              </p>

              <h2 className="text-4xl lg:text-5xl font-prata !leading-[1.2] mb-10 text-[#060C14]">
                {section.introTitle}
              </h2>

              <p className="text-[#4E4C3D] text-sm sm:text-base leading-relaxed uppercase font-light tracking-wide mb-12">
                {section.introDesc}
              </p>

              <div className="hidden lg:block">
                <Link
                  className="inline-flex items-center px-10 py-5 border border-[#DBD8BD] rounded-full uppercase text-[15px] font-black tracking-[0.2em] text-[#060C14] hover:bg-[#060C14] hover:text-white hover:border-[#060C14] transition-colors duration-500 group overflow-hidden"
                  href={section.buttonLink || fallbackLink}
                  onClick={(e) => {
                    if (typeof window !== 'undefined' && !section.buttonLink && fallbackTag) {
                      sessionStorage.setItem('pendingBlogTag', fallbackTag);
                    }
                  }}
                >
                  <span className="relative block overflow-hidden">
                    <span className="flex items-center gap-4 origin-top-right transition-transform duration-500 ease-in-out group-hover:rotate-90 whitespace-nowrap">
                      {section.buttonText || "All Posts"}
                      <svg className="w-3 h-3" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 9L9 1M9 1H1.8M9 1V8.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                      </svg>
                    </span>
                    <span aria-hidden="true" className="absolute inset-0 flex items-center gap-4 origin-bottom-left rotate-90 transition-transform duration-500 ease-in-out group-hover:rotate-0 whitespace-nowrap">
                      {section.buttonText || "All Posts"}
                      <svg className="w-3 h-3" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 9L9 1M9 1H1.8M9 1V8.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                      </svg>
                    </span>
                  </span>
                </Link>
              </div>
            </div>
          </div>

          {/* RIGHT GRID - 2/3 Width (col-8) */}
          <div className="w-full lg:w-2/3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-16">
              {items.map((item: any, idx: number) => (
                <article key={item.id || idx} className="post-card group relative flex flex-col h-full">
                  <Link href={`/${locale}/blog/${item.slug}`} className="absolute inset-0 z-10" aria-label={item.title}></Link>
                  {/* Image Container with Corner Logic */}
                  <div className="relative aspect-[4/3] mb-6 group">
                    <div className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden">
                      <OptimizedImage
                        image={safeImage(item.coverImage)}
                        alt={item.title}
                        size="large"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                      />
                    </div>
                    <span className="absolute top-0 right-0 z-20 flex items-center justify-center bg-[#F6F4ED] rounded-bl-xl pl-2 pb-2 pointer-events-auto">
                      <Link 
                        href={`${localePrefix}/knowledge-base-blogs`}
                        onClick={() => {
                          if (typeof window !== 'undefined' && item.tags?.[0]?.slug) {
                            sessionStorage.setItem('pendingBlogTag', item.tags[0].slug);
                          }
                        }}
                        className="border-2 border-[#756f3f] text-[#060C14] hover:bg-[#756f3f] hover:text-white transition duration-300 rounded-[8px] px-3 py-1 text-[10px] font-bold tracking-widest inline-flex uppercase"
                      >
                        {item.tags?.[0]?.name || "Featured"}
                      </Link>
                      <div className="text-[#F6F4ED] absolute top-0 right-full w-[16px] h-[16px]">
                        <svg width="100%" height="100%" viewBox="0 0 101 101" fill="none" xmlns="http://www.w3.org/2000/svg" className="-scale-x-100">
                          <path fillRule="evenodd" clipRule="evenodd" d="M101 0H0V101H1C1 45.7715 45.7715 1 101 1V0Z" fill="currentColor"></path>
                        </svg>
                      </div>
                      <div className="text-[#F6F4ED] absolute top-full right-0 w-[16px] h-[16px]">
                        <svg width="100%" height="100%" viewBox="0 0 101 101" fill="none" xmlns="http://www.w3.org/2000/svg" className="-scale-x-100">
                          <path fillRule="evenodd" clipRule="evenodd" d="M101 0H0V101H1C1 45.7715 45.7715 1 101 1V0Z" fill="currentColor"></path>
                        </svg>
                      </div>
                    </span>
                  </div>

                  <div className="text-center px-4">
                    <h3 className="text-[26px] font-prata text-[#060C14] leading-[1.4] mb-4 relative z-0 pointer-events-none">
                      <span className="bg-gradient-to-r from-current to-current bg-[length:0%_2px] bg-no-repeat bg-right-bottom transition-[background-size] duration-500 group-hover:bg-[length:100%_2px] group-hover:bg-left-bottom">
                        {item.title}
                      </span>
                    </h3>

                    <div className="flex items-center justify-center gap-3 mb-8">
                      {item.author?.avatar && (
                        <OptimizedImage
                          image={safeImage(item.author.avatar)}
                          alt={item.author.name}
                          size="small"
                          className="w-6 h-6 rounded-full border border-gray-100"
                        />
                      )}
                      <span className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">{item.author?.name || "Nilima"}</span>
                    </div>

                    <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#F5F4E9] group-hover:bg-[#060C14] group-hover:text-white transition-all duration-300 group-hover:rotate-45 relative z-0">
                      <svg width="14" height="14" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1.99902 18.0009L18 1.99991M18 1.99991H3.59912M18 1.99991V16.4008" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"></path>
                      </svg>
                    </span>
                  </div>
                </article>
              ))}
            </div>

            {/* Mobile Button Fallback */}
            <div className="mt-16 text-center lg:hidden">
              <Link
                className="inline-flex items-center px-10 py-5 border border-[#DBD8BD] rounded-full uppercase text-[15px] font-black tracking-[0.2em] text-[#060C14] hover:bg-[#060C14] hover:text-white hover:border-[#060C14] transition-colors duration-500 group overflow-hidden"
                href={section.buttonLink || fallbackLink}
                onClick={(e) => {
                  if (typeof window !== 'undefined' && !section.buttonLink && fallbackTag) {
                    sessionStorage.setItem('pendingBlogTag', fallbackTag);
                  }
                }}
              >
                <span className="relative block overflow-hidden">
                  <span className="flex items-center gap-4 origin-top-right transition-transform duration-500 ease-in-out group-hover:rotate-90 whitespace-nowrap">
                    {section.buttonText || "All Posts"}
                  </span>
                  <span aria-hidden="true" className="absolute inset-0 flex items-center gap-4 origin-bottom-left rotate-90 transition-transform duration-500 ease-in-out group-hover:rotate-0 whitespace-nowrap">
                    {section.buttonText || "All Posts"}
                  </span>
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
