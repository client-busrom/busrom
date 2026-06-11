import React from "react"
import Link from "next/link"
import { OptimizedImage } from "@/components/ui/OptimizedImage"

// Helper to prevent OptimizedImage from crashing on raw IDs (numbers)
const safeImage = (img: any) => (typeof img === 'number' ? null : img)

export function GalleryTemplateFour({ section, items, locale }: any) {
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
    <section className="py-24 bg-[#E7E5D4] overflow-hidden relative">
      <div className="mx-auto w-full px-6 lg:max-w-[1024px] xl:max-w-[1280px] relative z-10">

        {/* Header with Top Border */}
        <div className="border-t border-[#627669]/30 pt-10 mb-16">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-8">
            <div className="text-center sm:text-left">
              <h2 className="inline-flex items-center text-xs uppercase font-bold tracking-[0.3em] text-[#060C14] mb-6">
                <span className="w-2 h-2 rounded-full bg-primary mr-4"></span>
                {section.tagTitle || "Selected Articles"}
              </h2>
              {section.introTitle && (
                <h3 className="text-4xl lg:text-5xl font-prata !leading-[1.2] mb-6 text-[#060C14]">
                  {section.introTitle}
                </h3>
              )}
              {section.introDesc && (
                <p className="text-[#4E4C3D] text-sm sm:text-base leading-relaxed uppercase font-light tracking-wide max-w-2xl">
                  {section.introDesc}
                </p>
              )}
            </div>

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
                  {section.buttonText || "Discover More"}
                  <svg className="w-3 h-3" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 9L9 1M9 1H1.8M9 1V8.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                </span>
                <span aria-hidden="true" className="absolute inset-0 flex items-center gap-4 origin-bottom-left rotate-90 transition-transform duration-500 ease-in-out group-hover:rotate-0 whitespace-nowrap">
                  {section.buttonText || "Discover More"}
                  <svg className="w-3 h-3" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 9L9 1M9 1H1.8M9 1V8.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                </span>
              </span>
            </Link>
          </div>
        </div>

        {/* Map over ALL items for large-scale display */}
        <div className="flex flex-col gap-20">
          {items.map((item: any, idx: number) => {
            const isRight = idx % 2 !== 0;
            return (
            <article
              key={item.id || idx}
              className={`grid grid-cols-1 lg:grid-cols-12 items-center transition-all duration-500 group relative`}
            >
              <Link href={`${localePrefix}/knowledge-base-blog/${item.slug}`} className="absolute inset-0 z-10 rounded-xl lg:rounded-2xl" aria-label={item.title}></Link>
              {/* Image Box - 6 Columns */}
              <div className={`lg:col-span-6 aspect-square lg:aspect-auto self-stretch py-4 lg:py-0 ${isRight ? 'lg:order-2' : 'lg:order-1'}`}>
                <div className="relative h-full group">
                  <div className="absolute inset-0 w-full h-full overflow-hidden rounded-xl lg:rounded-2xl">
                    <OptimizedImage
                      image={safeImage(item.coverImage)}
                      alt={item.title}
                      size="xlarge"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                    />
                  </div>
                  <span className={`absolute z-20 flex items-center justify-center pointer-events-auto
                    top-4 right-4 rounded-xl p-1 bg-white
                    lg:top-0 lg:p-0 lg:pb-2 lg:rounded-none lg:bg-[#E7E5D4]
                    ${isRight 
                      ? 'lg:left-0 lg:right-auto lg:rounded-br-xl lg:pr-2' 
                      : 'lg:right-0 lg:left-auto lg:rounded-bl-xl lg:pl-2'}
                  `}>
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
                    <div className={`hidden lg:block text-[#E7E5D4] absolute top-0 w-[16px] h-[16px] ${isRight ? 'left-full' : 'right-full'}`}>
                      <svg width="100%" height="100%" viewBox="0 0 101 101" fill="none" xmlns="http://www.w3.org/2000/svg" className={isRight ? '' : '-scale-x-100'}>
                        <path fillRule="evenodd" clipRule="evenodd" d="M101 0H0V101H1C1 45.7715 45.7715 1 101 1V0Z" fill="currentColor"></path>
                      </svg>
                    </div>
                    <div className={`hidden lg:block text-[#E7E5D4] absolute top-full w-[16px] h-[16px] ${isRight ? 'left-0' : 'right-0'}`}>
                      <svg width="100%" height="100%" viewBox="0 0 101 101" fill="none" xmlns="http://www.w3.org/2000/svg" className={isRight ? '' : '-scale-x-100'}>
                        <path fillRule="evenodd" clipRule="evenodd" d="M101 0H0V101H1C1 45.7715 45.7715 1 101 1V0Z" fill="currentColor"></path>
                      </svg>
                    </div>
                  </span>
                </div>
              </div>

              {/* Content Box - 6 Columns */}
              <div className={`lg:col-span-6 p-10 sm:p-16 lg:p-24 text-center lg:text-start ${isRight ? 'lg:order-1' : 'lg:order-2'}`}>
                <div className="flex flex-col">
                  <h3 className="text-[26px] font-prata text-[#060C14] !leading-[1.2] mb-10 relative z-0 pointer-events-none">
                    <span className="bg-gradient-to-r from-current to-current bg-[length:0%_2px] bg-no-repeat bg-right-bottom transition-[background-size] duration-500 group-hover:bg-[length:100%_2px] group-hover:bg-left-bottom">
                      {item.title}
                    </span>
                  </h3>

                    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 mb-12">
                      <div className="flex items-center gap-3">
                        {item.author?.avatar && (
                          <OptimizedImage
                            image={safeImage(item.author.avatar)}
                            alt={item.author.name}
                            size="small"
                            objectFit="contain"
                            className="w-10 h-10"
                          />
                        )}
                        <span className="text-[12px] font-black text-[#060C14] uppercase tracking-widest">{item.author?.name || "Admin"}</span>
                      </div>
                    </div>

                  <span
                    className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#060C14] text-white group-hover:bg-primary transition-all duration-300 group-hover:rotate-45 relative z-0"
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1.99902 18.0009L18 1.99991M18 1.99991H3.59912M18 1.99991V16.4008" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                  </span>
                </div>
              </div>
            </article>
            );
          })}
        </div>
      </div>

      {/* Wave Background Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-20 Style_waveBg__bNstF"></div>
    </section>
  )
}
