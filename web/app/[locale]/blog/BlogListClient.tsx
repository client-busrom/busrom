"use client"

import { useState, useEffect } from "react"
import type { Locale } from "@/i18n.config"
import Link from "next/link"
import { 
  EyoloCornerBridge, 
  EyoloCornerRound, 
  EyoloScrollBadge, 
  EyoloCircleArrow 
} from "@/components/blog/ReplicaAssets"

interface BlogListClientProps {
  locale: Locale
}

export function BlogListClient({ locale }: BlogListClientProps) {
  const [blogs, setBlogs] = useState<any[]>([])
  const [config, setConfig] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const blogsRes = await fetch(`/api/payload/blogs?locale=${locale}&limit=20&where[status][equals]=published`)
        const blogsData = await blogsRes.json()
        
        if (blogsData.docs && blogsData.docs.length > 0) {
          setBlogs(blogsData.docs)
        } else {
          setBlogs(MOCK_BLOGS(locale))
        }

        const configRes = await fetch(`/api/payload/globals/blog-page-config?locale=${locale}`)
        if (configRes.ok) {
          const configData = await configRes.json()
          setConfig(configData)
        } else {
          setConfig(MOCK_CONFIG(locale))
        }
      } catch (err) {
        console.error("Error fetching blog data:", err)
        setBlogs(MOCK_BLOGS(locale))
        setConfig(MOCK_CONFIG(locale))
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [locale])

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-20 flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-[#ff4848] border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  // Segmenting blogs for Eyolo sections
  const featuredBlog = blogs[0]
  const latestPosts = blogs.slice(1, 5)
  const popularPosts = blogs.slice(5, 9)
  const trendingPosts = blogs.slice(9, 13)
  const postOfTheWeek = blogs[13] || blogs[0]

  return (
    <div className="min-h-screen bg-white font-lexend-deca antialiased selection:bg-[#ff4848] selection:text-white" data-header-theme="light">
      
      {/* 1. HERO BANNER */}
      {featuredBlog && (
        <section className="relative overflow-hidden pt-12">
          <div className="flex justify-end pr-10 lg:pr-40 uppercase text-[10px] font-bold tracking-[0.4em] text-gray-400 mb-2">
             SCROLL TO DISCOVER
          </div>
          <div className="flex justify-end pr-10 lg:pr-40">
             <EyoloCornerBridge className="hidden lg:block h-8 text-[#E7E5D4]" />
          </div>
          <div className="container mx-auto px-6 overflow-hidden">
            <div className="flex flex-col lg:flex-row items-center bg-[#E7E5D4] rounded-t-[40px] lg:rounded-t-none lg:rounded-tl-[80px] relative">
              <div className="lg:w-7/12 p-8 sm:p-12 lg:p-20 relative z-10">
                <div className="flex items-center gap-4 mb-8">
                  <span className="text-[#ff4848] text-xs font-bold uppercase tracking-widest px-4 py-2 border border-[#DCDBD0] rounded-md bg-white">
                    {featuredBlog.categories?.[0]?.name || 'Featured'}
                  </span>
                  <span className="text-gray-400 opacity-40">—</span>
                  <span className="text-sm font-medium text-gray-600">
                    {new Date(featuredBlog.publishedAt).toLocaleDateString()}
                  </span>
                </div>
                <Link href={`/${locale}/blog/${featuredBlog.slug}`} className="hover:text-[#ff4848] transition-colors">
                  <h1 className="text-4xl sm:text-5xl lg:text-7xl font-prata !leading-[1.1] mb-10 text-[#060C14]">
                    {featuredBlog.title}
                  </h1>
                </Link>
                <ul className="flex items-center gap-4 text-xs font-bold uppercase tracking-[0.2em] text-[#060C14] mb-4">
                  <li className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full border border-gray-300 overflow-hidden shadow-sm">
                       <img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop" className="w-full h-full object-cover" alt="Author" />
                    </div>
                    <span>By {featuredBlog.author || 'Busrom Editorial'}</span>
                  </li>
                  <li className="text-gray-300">•</li>
                  <li>06 Min Read</li>
                </ul>
              </div>
              <Link href={`/${locale}/blog/${featuredBlog.slug}`} className="lg:w-5/12 relative w-full h-[450px] lg:h-[750px] overflow-hidden group">
                <img src={featuredBlog.coverImage?.url || featuredBlog.coverImage} className="w-full h-full object-cover lg:rounded-bl-[80px] group-hover:scale-105 transition-transform duration-[2s]" alt={featuredBlog.title} />
                <EyoloCornerRound className="absolute bottom-0 right-[40%] lg:right-auto lg:bottom-auto lg:top-0 lg:left-0 text-[#E7E5D4] w-12 h-12 lg:w-24 lg:h-24 lg:rotate-0 rotate-90" />
                <div className="absolute -bottom-10 left-8 lg:-left-12 z-20">
                   <EyoloScrollBadge />
                </div>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 2. POPULAR TOPICS */}
      <section className="py-24 sm:py-32 overflow-hidden">
        <div className="container mx-auto px-6 text-center">
          <div className="mb-16">
             <h2 className="text-[10px] uppercase font-bold tracking-[0.5em] text-[#ff4848] mb-10 pl-4 relative inline-block after:absolute after:rounded-full after:h-1.5 after:w-1.5 after:bg-[#ff4848] after:left-0 after:top-1/2 after:-translate-y-1/2">
               Popular Topics
             </h2>
          </div>
          <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-6 md:gap-x-12 text-3xl md:text-5xl lg:text-6xl font-prata text-[#060C14] capitalize">
            {config?.categoryTabs?.map((cat: any, idx: number) => (
              <li key={cat.id} className="relative group cursor-pointer transition-all duration-300">
                <Link href={`/${locale}/blog?filter=${cat.id}`} className="hover:text-white transition-all duration-300 relative z-10">
                   <span className="relative z-10 drop-shadow-sm group-hover:drop-shadow-[0_8px_8px_rgba(0,0,0,0.3)]">{cat.name}</span>
                </Link>
                {/* Image Popup */}
                <div className="absolute h-[120px] lg:h-[150px] w-[200px] lg:w-[300px] left-1/2 top-1/2 -translate-x-1/2 -translate-y-[60%] opacity-0 invisible scale-90 -rotate-12 transition-all duration-500 group-hover:opacity-100 group-hover:visible group-hover:scale-100 group-hover:rotate-0 overflow-hidden rounded-xl z-0 pointer-events-none shadow-2xl scale-110">
                   <img src={`https://images.unsplash.com/photo-${1500000000000 + idx * 100000}?w=400&h=300&fit=crop`} className="w-full h-full object-cover scale-125 group-hover:scale-100 transition-all duration-700" alt="Category" />
                   <div className="absolute inset-0 bg-[#060C14]/30" />
                </div>
                {idx !== config.categoryTabs.length - 1 && <span className="ml-8 md:ml-12 opacity-10 text-4xl">/</span>}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 3. LATEST ARTICLES (8/4 Grid) */}
      <section className="py-24 border-t border-[#F0EBE6]">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row">
            <div className="lg:w-4/12 mb-16 lg:mb-0">
               <div className="lg:sticky lg:top-24 lg:pr-12 text-center lg:text-left">
                  <p className="text-[10px] uppercase font-bold tracking-[0.5em] text-[#ff4848] mb-8 pl-4 relative inline-block lg:block after:absolute after:rounded-full after:h-1.5 after:w-1.5 after:bg-[#ff4848] after:left-0 after:top-1/2 after:-translate-y-1/2">
                    Latest Articles
                  </p>
                  <h2 className="text-3xl md:text-5xl font-prata !leading-[1.2] mb-6 text-[#060C14]">
                    Discover. Learn. <br />Transform. Quick
                  </h2>
                  <p className="text-gray-500 text-sm uppercase tracking-widest leading-loose mb-12 max-w-sm">
                    Recent stories of engineering elegance and architectural breakthroughs from our global team.
                  </p>
                  <Link href="#" className="hidden lg:inline-flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.3em] text-[#060C14] group group-hover:gap-6 transition-all duration-300">
                     <span>View All Stories</span>
                     <div className="w-10 h-10 rounded-full border border-[#DCDBD0] flex items-center justify-center group-hover:bg-[#060C14] group-hover:text-white transition-all">
                        <svg width="12" height="12" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg" className="group-hover:rotate-45 transition-transform"><path d="M1.33008 17.4023L17.3301 1.40234M17.3301 1.40234H2.93008M17.3301 1.40234V15.8023" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                     </div>
                  </Link>
               </div>
            </div>
            <div className="lg:w-8/12 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-20">
              {latestPosts.map((post) => (
                <div key={post.id} className="group flex flex-col items-start border-b border-gray-100 pb-12 last:border-0 hover:border-[#ff4848] transition-colors">
                  <Link href={`/${locale}/blog/${post.slug}`} className="block relative w-full aspect-[16/10] overflow-hidden mb-8 rounded-2xl">
                    <img src={post.coverImage?.url || post.coverImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s]" alt={post.title} />
                    <div className="absolute top-4 left-4">
                      <span className="px-4 py-2 bg-white/95 text-[#ff4848] text-[9px] font-bold uppercase tracking-[0.2em] rounded-md shadow-sm">
                        {post.categories?.[0]?.name}
                      </span>
                    </div>
                  </Link>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">{new Date(post.publishedAt).toLocaleDateString()}</span>
                  <Link href={`/${locale}/blog/${post.slug}`}>
                    <h3 className="text-2xl font-prata !leading-tight text-[#060C14] hover:text-[#ff4848] transition-colors mb-4 line-clamp-2">
                      {post.title}
                    </h3>
                  </Link>
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-widest italic">
                    By {post.author || 'Busrom Editorial'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. POPULAR ARTICLES (Dark 5/7 Grid) */}
      <section className="py-24 sm:py-32 bg-[#060C14] text-white overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row">
            <div className="lg:w-5/12 mb-16 lg:mb-0">
               <div className="lg:sticky lg:top-24 lg:pr-12 text-center lg:text-left">
                  <p className="text-[10px] uppercase font-bold tracking-[0.5em] text-[#ff4848] mb-8 pl-4 relative inline-block lg:block after:absolute after:rounded-full after:h-1.5 after:w-1.5 after:bg-[#ff4848] after:left-0 after:top-1/2 after:-translate-y-1/2 text-white">
                    Popular Articles
                  </p>
                  <h2 className="text-3xl md:text-5xl font-prata !leading-[1.2] mb-6 text-white">
                    Business Insights & <br />Product Culture
                  </h2>
                  <p className="text-gray-400 text-sm uppercase tracking-widest leading-loose mb-12 max-w-sm">
                    Deep dives into industry standards, quality control narratives, and leadership visions.
                  </p>
                  <Link href="#" className="inline-flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.3em] text-white hover:text-[#ff4848] transition-all group">
                     <span>SEE ALL POPULAR</span>
                     <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-[#ff4848] group-hover:border-0 transition-all">
                        <svg width="12" height="12" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1.33008 17.4023L17.3301 1.40234M17.3301 1.40234H2.93008M17.3301 1.40234V15.8023" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                     </div>
                  </Link>
               </div>
            </div>
            <div className="lg:w-7/12 space-y-16 lg:space-y-24">
              {popularPosts.map((post, idx) => (
                <div key={post.id} className={`flex flex-col items-center text-center group ${idx % 2 === 0 ? 'lg:mr-32' : 'lg:ml-32'}`}>
                   <Link href={`/${locale}/blog/${post.slug}`} className="block relative w-full aspect-[4/3] rounded-[40px] overflow-hidden mb-10 border border-white/5">
                      <img src={post.coverImage?.url || post.coverImage} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2s]" alt={post.title} />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#060C14]/60 to-transparent" />
                   </Link>
                   <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#ff4848] mb-6">{post.categories?.[0]?.name}</span>
                   <Link href={`/${locale}/blog/${post.slug}`}>
                     <h3 className="text-2xl md:text-3xl font-prata !leading-tight text-white group-hover:text-[#ff4848] transition-colors mb-4 max-w-md mx-auto line-clamp-2">
                       {post.title}
                     </h3>
                   </Link>
                   <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest italic">
                     04 MIN TO READ — {new Date(post.publishedAt).toLocaleDateString()}
                   </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. TRENDING ARTICLES (Scattered Grid) */}
      <section className="py-24 sm:py-32 bg-[#F5F2ED] overflow-hidden">
        <div className="container mx-auto px-6">
           <div className="max-w-4xl mb-24 text-center lg:text-left">
              <p className="text-[10px] uppercase font-bold tracking-[0.5em] text-[#ff4848] mb-8 pl-4 relative inline-block lg:block after:absolute after:rounded-full after:h-1.5 after:w-1.5 after:bg-[#ff4848] after:left-0 after:top-1/2 after:-translate-y-1/2">
                Trending Articles
              </p>
              <h2 className="text-3xl md:text-6xl font-prata !leading-[1.1] text-[#060C14] mb-8">
                Where Knowledge <br />Meets Passion
              </h2>
              <p className="text-[#4E4C3D] text-lg max-w-2xl leading-relaxed uppercase font-light text-sm tracking-widest">
                Our most shared and discussed explorations in glass and stainless steel systems.
              </p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
              {trendingPosts.length >= 1 && (
                <div className="lg:col-span-4 lg:mt-12 order-2 lg:order-1">
                   {/* Column 1: Smaller high portrait */}
                   <PostCardScattered post={trendingPosts[1]} locale={locale} aspect="aspect-[3/4]" />
                   <div className="mt-8 lg:mt-16">
                     <PostCardScattered post={trendingPosts[3]} locale={locale} aspect="aspect-[4/5]" />
                   </div>
                </div>
              )}
              {trendingPosts.length >= 1 && (
                <div className="lg:col-span-8 order-1 lg:order-2">
                   {/* Column 2: Big landscape + offset */}
                   <PostCardScattered post={trendingPosts[0]} locale={locale} aspect="aspect-video" />
                   <div className="mt-8 lg:mt-16 lg:ml-24">
                     <PostCardScattered post={trendingPosts[2]} locale={locale} aspect="aspect-[16/10]" />
                   </div>
                </div>
              )}
           </div>
        </div>
      </section>

      {/* 6. POST OF THE WEEK (Banner with SVG Corners) */}
      {postOfTheWeek && (
        <section className="py-32 bg-[#1A3C34] relative overflow-hidden group">
           {/* Decorative Background Waves Mimic */}
           <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#F5F2ED,transparent_70%)] opacity-30 blur-3xl animate-pulse" />
           </div>

           <div className="container mx-auto px-6 relative z-10">
              <div className="border-t border-white/20 pt-12 flex flex-col lg:flex-row items-center justify-between mb-16">
                 <h2 className="text-[10px] uppercase font-bold tracking-[0.5em] text-[#ff4848] mb-8 lg:mb-0 pl-4 relative after:absolute after:rounded-full after:h-1.5 after:w-1.5 after:bg-[#ff4848] after:left-0 after:top-1/2 after:-translate-y-1/2 text-white">
                   Post Of The Week
                 </h2>
                 <Link href="#" className="hidden sm:flex px-8 py-3 bg-white/10 text-white rounded-md text-[9px] font-bold uppercase tracking-[0.3em] border border-white/10 hover:bg-white hover:text-[#1A3C34] transition-all">
                    Weekly Archive
                 </Link>
              </div>

              <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
                 <div className="lg:w-6/12 relative group">
                    <div className="relative">
                       {/* SVG Corner Category Badge Logic */}
                       <div className="absolute top-0 right-0 z-20 flex">
                          <span className="bg-[#ff4848] text-white px-2 sm:px-4 py-1.5 sm:py-3 text-[10px] sm:text-xs font-bold uppercase tracking-widest relative z-10 rounded-bl-sm italic">
                             {postOfTheWeek.categories?.[0]?.name}
                          </span>
                          {/* Top-Right and Bottom-Left SVG Corners as per Eyolo post.scss */}
                          <EyoloCornerRound className="absolute -left-3 sm:-left-4 top-0 w-3 sm:w-4 h-3 sm:h-4 text-[#ff4848] rotate-90" />
                          <EyoloCornerRound className="absolute right-0 -bottom-3 sm:-bottom-4 w-3 sm:w-4 h-3 sm:h-4 text-[#ff4848] rotate-90" />
                       </div>
                       <img src={postOfTheWeek.coverImage?.url || postOfTheWeek.coverImage} className="w-full aspect-square md:aspect-[4/3] lg:aspect-[3.5/3] object-cover rounded-2xl shadow-2xl" alt={postOfTheWeek.title} />
                    </div>
                 </div>
                 <div className="lg:w-6/12 text-center lg:text-left text-white">
                    <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-[#BBC5BE] mb-8">
                       <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" className="opacity-60"><path d="M12.6663 2.66677H11.333V2.0001C11.333 1.82329 11.2628 1.65372 11.1377 1.5287C11.0127 1.40367 10.8432 1.33344 10.6663 1.33344C10.4895 1.33344 10.32 1.40367 10.1949 1.5287C10.0699 1.65372 9.99967 1.82329 9.99967 2.0001V2.66677H5.99967V2.0001C5.99967 1.82329 5.92944 1.65372 5.80441 1.5287C5.67939 1.40367 5.50982 1.33344 5.33301 1.33344C5.1562 1.33344 4.98663 1.40367 4.8616 1.5287C4.73658 1.65372 4.66634 1.82329 4.66634 2.0001V2.66677H3.33301C2.80257 2.66677 2.29387 2.87748 1.91879 3.25255C1.54372 3.62763 1.33301 4.13633 1.33301 4.66677V12.6668C1.33301 13.1972 1.54372 13.7059 1.91879 14.081C2.29387 14.4561 2.80257 14.6668 3.33301 14.6668H12.6663C13.1968 14.6668 13.7055 14.4561 14.0806 14.081C14.4556 13.7059 14.6663 13.1972 14.6663 12.6668V4.66677C14.6663 4.13633 14.4556 3.62763 14.0806 3.25255C13.7055 2.87748 13.1968 2.66677 12.6663 2.66677ZM13.333 12.6668C13.333 12.8436 13.2628 13.0131 13.1377 13.1382C13.0127 13.2632 12.8432 13.3334 12.6663 13.3334H3.33301C3.1562 13.3334 2.98663 13.2632 2.8616 13.1382C2.73658 13.0131 2.66634 12.8436 2.66634 12.6668V8.0001H13.333V12.6668ZM13.333 6.66677H2.66634V4.66677C2.66634 4.48996 2.73658 4.32039 2.8616 4.19536C2.98663 4.07034 3.1562 4.0001 3.33301 4.0001H4.66634V4.66677C4.66634 4.84358 4.73658 5.01315 4.8616 5.13817C4.98663 5.2632 5.1562 5.33343 5.33301 5.33343C5.50982 5.33343 5.67939 5.2632 5.80441 5.13817C5.92944 5.01315 5.99967 4.84358 5.99967 4.66677V4.0001H9.99967V4.66677C9.99967 4.84358 10.0699 5.01315 10.1949 5.13817C10.32 5.2632 10.4895 5.33343 10.6663 5.33343C10.8432 5.33343 11.0127 5.2632 11.1377 5.13817C11.2628 5.01315 11.333 4.84358 11.333 4.66677V4.0001H12.6663C12.8432 4.0001 13.0127 4.07034 13.1377 4.19536C13.2628 4.32039 13.333 4.48996 13.333 4.66677V6.66677Z"/></svg>
                       {new Date(postOfTheWeek.publishedAt).toLocaleDateString()}
                    </span>
                    <Link href={`/${locale}/blog/${postOfTheWeek.slug}`}>
                      <h3 className="text-3xl md:text-5xl font-prata !leading-[1.2] mb-10 hover:text-[#ff4848] transition-colors">
                        {postOfTheWeek.title}
                      </h3>
                    </Link>
                    <ul className="flex items-center justify-center lg:justify-start gap-4 text-[11px] font-bold uppercase tracking-[0.2em] text-[#90A096] mb-12">
                       <li className="flex items-center gap-3">
                          <img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=60&h=60&fit=crop" className="w-8 h-8 rounded-full border border-white/20" alt="Author" />
                          <span>{postOfTheWeek.author || 'Busrom Team'}</span>
                       </li>
                       <li>•</li>
                       <li>03 MIN TO READ</li>
                    </ul>
                    <Link href={`/${locale}/blog/${postOfTheWeek.slug}`} className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 hover:bg-[#ff4848] transition-all transform hover:rotate-45">
                       <svg width="20" height="20" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1.33008 17.4023L17.3301 1.40234M17.3301 1.40234H2.93008M17.3301 1.40234V15.8023" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </Link>
                 </div>
              </div>
           </div>
        </section>
      )}

      {/* 7. GET IN TOUCH (Contact Section) */}
      <section className="py-24 sm:py-32 bg-[#060C14] text-white overflow-hidden border-t border-white/5">
        <div className="container mx-auto px-6">
           <div className="border-t-2 border-[#2F2F2F] pt-12 mb-16">
              <h2 className="text-4xl sm:text-6xl lg:text-8xl font-prata text-white mb-4">Get In Touch</h2>
           </div>
           
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              <div className="lg:col-span-4">
                 <p className="text-gray-400 text-lg leading-relaxed max-w-sm font-anaheim italic opacity-80">
                    Feel free to reach out with questions or specific project inquiries. Our consultants are ready to help.
                 </p>
              </div>
              
              <div className="lg:col-span-8">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div>
                        <h3 className="text-2xl md:text-4xl font-prata mb-6">Contact</h3>
                        <Link href="tel:+15551234567" className="text-sm font-bold uppercase tracking-[0.3em] hover:text-[#ff4848] transition-all border-b border-transparent hover:border-[#ff4848] pb-1">
                          +1 (555) 123-4567
                        </Link>
                    </div>
                    <div>
                        <h3 className="text-2xl md:text-4xl font-prata mb-6">Email</h3>
                        <Link href="mailto:hello@busrom.com" className="text-sm font-bold uppercase tracking-[0.3em] hover:text-[#ff4848] transition-all border-b border-transparent hover:border-[#ff4848] pb-1">
                          hello@busrom.com
                        </Link>
                    </div>
                 </div>

                 {/* Minimal Footer Policy Links as seen in Ref */}
                 <div className="mt-20 lg:mt-32 pt-12 border-t border-white/5">
                    <ul className="flex flex-wrap gap-8 lg:gap-16 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.4em] text-gray-500">
                       <li className="hover:text-white transition-colors cursor-pointer">About</li>
                       <li className="hover:text-white transition-colors cursor-pointer">Archive</li>
                       <li className="hover:text-white transition-colors cursor-pointer">Privacy Policy</li>
                       <li className="hover:text-white transition-colors cursor-pointer">Terms</li>
                    </ul>
                 </div>
              </div>
           </div>
        </div>
      </section>

    </div>
  )
}

// Sub-component for Scattered Grid
function PostCardScattered({ post, locale, aspect = 'aspect-video' }: { post: any, locale: string, aspect?: string }) {
  return (
    <div className="group flex flex-col items-start">
      <Link href={`/${locale}/blog/${post.slug}`} className={`block relative w-full ${aspect} overflow-hidden mb-8 rounded-2xl`}>
        <img src={post.coverImage?.url || post.coverImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s]" alt={post.title} />
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
      </Link>
      <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#ff4848] mb-4">
         <span>{post.categories?.[0]?.name}</span>
         <span className="text-gray-300 opacity-40">—</span>
         <span className="text-gray-400">{new Date(post.publishedAt).toLocaleDateString()}</span>
      </div>
      <Link href={`/${locale}/blog/${post.slug}`}>
        <h3 className="text-2xl font-prata !leading-tight text-[#060C14] hover:text-[#ff4848] transition-colors mb-4 line-clamp-2">
          {post.title}
        </h3>
      </Link>
      <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest italic">
        By {post.author || 'Editorial'}
      </p>
    </div>
  )
}

// ==================================================================
// MOCK DATA (Extended for Demo)
// ==================================================================

const MOCK_CONFIG = (locale: string) => ({
  categoryTabs: [
    { id: '1', name: locale === 'zh' ? '设计灵感' : 'Design', type: 'Strategy' },
    { id: '2', name: locale === 'zh' ? '工程解析' : 'Lifestyle', type: 'Life' },
    { id: '3', name: locale === 'zh' ? '幕墙方案' : 'Engineering', type: 'Industrial' },
    { id: '4', name: locale === 'zh' ? '支架系统' : 'Products', type: 'Tech' },
    { id: '5', name: locale === 'zh' ? '行业趋势' : 'Trends', type: 'Global' },
  ],
  showAllTab: true,
})

const MOCK_BLOGS = (locale: string) => Array.from({ length: 15 }).map((_, i) => {
  const slugs = [
    'finding-balance-modern-reading', // Template 1 (Eyolo)
    'minimal-review-jules-style',    // Template 2 (Jules)
    'corporate-heavy-reland-style',  // Template 3 (Reland)
  ]
  const slug = slugs[i] || `eyolo-post-demo-${i}`
  
  return {
    id: `post-${i}`,
    slug,
    title: i === 0 ? (locale === 'zh' ? '从 0 到 1：如何打造顶级的极简玻璃幕墙系统' : 'Cloud-Native Cybersecurity Startup Security Raises $60M Fund') : (locale === 'zh' ? `深度解析博斯罗姆第 ${i} 代支架系统` : `Evolution of Modern Structures: Chapter ${i}`),
    excerpt: 'A comprehensive look at structural integrity meets futuristic design standards in global projects.',
    publishedAt: new Date(Date.now() - i * 86400000).toISOString(),
    categories: [{ name: ['Engineering', 'Design', 'Trends', 'Lifestyle', 'Tech'][i % 5] }],
    coverImage: `https://images.unsplash.com/photo-${1500000000000 + i * 1000000}?w=1200&h=800&fit=crop`,
    author: ['Kathryn Jackson', 'Alex Walton', 'Elena Ross'][i % 3]
  }
})
