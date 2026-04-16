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
        // 1. Fetch Global Settings First
        const configRes = await fetch(`/api/payload/globals/knowledge-base-settings?locale=${locale}`)
        let activeConfig = null
        if (configRes.ok) {
          activeConfig = await configRes.json()
          setConfig(activeConfig)
        } else {
          activeConfig = MOCK_SETTINGS(locale)
          setConfig(activeConfig)
        }

        // 2. Fetch Blogs (Generic for Hero if featuredPost not set)
        const blogsRes = await fetch(`/api/payload/blogs?locale=${locale}&limit=10&where[status][equals]=published`)
        const blogsData = await blogsRes.json()
        setBlogs(blogsData.docs || [])

      } catch (err) {
        console.error("Error fetching blog data:", err)
        setConfig(MOCK_SETTINGS(locale))
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

  const hero = {
    tag: config?.heroTitle || (locale === 'zh' ? '本周推荐' : 'FEATURED'),
    post: config?.featuredPost || blogs[0]
  }

  return (
    <div className="min-h-screen bg-white font-lexend-deca antialiased selection:bg-[#ff4848] selection:text-white" data-header-theme="light">
      
      {/* 1. HERO BANNER */}
      {hero.post && (
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
                    {hero.tag}
                  </span>
                  <span className="text-gray-400 opacity-40">—</span>
                  <span className="text-sm font-medium text-gray-600">
                    {hero.post.publishedAt ? new Date(hero.post.publishedAt).toLocaleDateString() : 'Dec 12, 2023'}
                  </span>
                </div>
                <Link href={`/${locale}/blog/${hero.post.slug}`} className="hover:text-[#ff4848] transition-colors">
                  <h1 className="text-4xl sm:text-5xl lg:text-7xl font-prata !leading-[1.1] mb-10 text-[#060C14]">
                    {hero.post.title}
                  </h1>
                </Link>
                <ul className="flex flex-wrap items-center gap-4 text-xs font-bold uppercase tracking-[0.2em] text-[#060C14] mb-4">
                  <li className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full border border-gray-300 overflow-hidden shadow-sm">
                       <img src={hero.post.author?.avatar?.url || "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop"} className="w-full h-full object-cover" alt="Author" />
                    </div>
                    <span>By {hero.post.author?.name || 'Editorial'}</span>
                  </li>
                  <li className="text-gray-300">•</li>
                  <li>06 Min Read</li>
                </ul>
              </div>
              <Link href={`/${locale}/blog/${hero.post.slug}`} className="lg:w-5/12 relative w-full h-[450px] lg:h-[750px] overflow-hidden group">
                <img src={hero.post.coverImage?.url || hero.post.coverImage || 'https://images.unsplash.com/photo-1533227268408-a77e7040d041?w=1200'} className="w-full h-full object-cover lg:rounded-bl-[80px] group-hover:scale-105 transition-transform duration-[2s]" alt={hero.post.title} />
                <EyoloCornerRound className="absolute bottom-0 right-[40%] lg:right-auto lg:bottom-auto lg:top-0 lg:left-0 text-[#E7E5D4] w-12 h-12 lg:w-24 lg:h-24 lg:rotate-0 rotate-90" />
                <div className="absolute -bottom-10 left-8 lg:-left-12 z-20">
                   <EyoloScrollBadge />
                </div>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 2. CATEGORY FILTERS */}
      <section className="py-24 sm:py-32 overflow-hidden">
        <div className="container mx-auto px-6 text-center">
          <div className="mb-16">
             <h2 className="text-[10px] uppercase font-bold tracking-[0.5em] text-[#ff4848] mb-10 pl-4 relative inline-block after:absolute after:rounded-full after:h-1.5 after:w-1.5 after:bg-[#ff4848] after:left-0 after:top-1/2 after:-translate-y-1/2">
               {config?.navTitle || (locale === 'zh' ? '热门分类' : 'Popular Topics')}
             </h2>
          </div>
          <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-6 md:gap-x-12 text-3xl md:text-5xl lg:text-6xl font-prata text-[#060C14] capitalize">
            {config?.showAll && (
              <li className="relative group cursor-pointer transition-all duration-300">
                <Link href={`/${locale}/blog`} className="hover:text-[#ff4848] transition-all duration-300 relative z-10">
                   <span className="relative z-10">{locale === 'zh' ? '全部' : 'All'}</span>
                </Link>
                <span className="ml-8 md:ml-12 opacity-10 text-4xl">/</span>
              </li>
            )}
            {config?.categoryTabs?.map((cat: any, idx: number) => (
              <li key={cat.id || idx} className="relative group cursor-pointer transition-all duration-300">
                <Link href={`/${locale}/blog?category=${cat.slug || cat.id}`} className="hover:text-[#ff4848] transition-all duration-300 relative z-10">
                   <span className="relative z-10">{cat.name}</span>
                </Link>
                <div className="absolute h-[120px] lg:h-[150px] w-[200px] lg:w-[300px] left-1/2 top-1/2 -translate-x-1/2 -translate-y-[60%] opacity-0 invisible scale-90 -rotate-12 transition-all duration-500 group-hover:opacity-100 group-hover:visible group-hover:scale-100 group-hover:rotate-0 overflow-hidden rounded-xl z-0 pointer-events-none shadow-2xl">
                   <img src={cat.coverImage?.url || `https://images.unsplash.com/photo-${1500000000000 + idx * 100000}?w=400&h=300&fit=crop`} className="w-full h-full object-cover scale-125 group-hover:scale-100 transition-all duration-700" alt="Category" />
                   <div className="absolute inset-0 bg-[#060C14]/30" />
                </div>
                {idx !== config.categoryTabs.length - 1 && <span className="ml-8 md:ml-12 opacity-10 text-4xl">/</span>}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 3. DYNAMIC SECTIONS */}
      {config?.sections?.map((section: any, idx: number) => (
        <DynamicSection key={section.id || idx} section={section} locale={locale} />
      ))}

      {/* 4. FOOTER GET IN TOUCH */}
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

// ------------------------------------------------------------------
// Dynamic Section Rendering Engine
// ------------------------------------------------------------------
function DynamicSection({ section, locale }: { section: any, locale: string }) {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSectionContent = async () => {
      try {
        if (section.selectedTag) {
          const tagId = typeof section.selectedTag === 'string' ? section.selectedTag : section.selectedTag.id;
          const res = await fetch(`/api/payload/blogs?locale=${locale}&limit=4&where[tags][contains]=${tagId}&where[status][equals]=published`)
          const data = await res.json()
          setItems(data.docs || [])
        } else {
          // Fallback to latest blogs if no tag selected
          const res = await fetch(`/api/payload/blogs?locale=${locale}&limit=4&where[status][equals]=published`)
          const data = await res.json()
          setItems(data.docs || [])
        }
      } catch (err) {
        console.error("Error fetching section content:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchSectionContent()
  }, [section, locale])

  if (loading) return <div className="py-12 bg-gray-50/50 animate-pulse h-96 mx-auto container rounded-2xl mb-12" />
  if (items.length === 0) return null

  // Switch between templates 1-4
  switch (section.template) {
    case 'template2': return <GalleryTemplateTwo section={section} items={items} locale={locale} />
    case 'template3': return <GalleryTemplateThree section={section} items={items} locale={locale} />
    case 'template4': return <GalleryTemplateFour section={section} items={items} locale={locale} />
    default: return <GalleryTemplateOne section={section} items={items} locale={locale} />
  }
}

// -- Gallery Template 1 (Latest - Vertical Scattered) --
function GalleryTemplateOne({ section, items, locale }: any) {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row justify-between items-start mb-20 gap-10">
          <div className="lg:w-6/12">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.5em] text-[#ff4848] mb-8 pl-4 relative after:absolute after:rounded-full after:h-1.5 after:w-1.5 after:bg-[#ff4848] after:left-0 after:top-1/2 after:-translate-y-1/2">
               {section.tagTitle || (locale === 'zh' ? '最新动态' : 'Latest Articles')}
            </h3>
            <h2 className="text-4xl sm:text-5xl lg:text-7xl font-prata !leading-[1.1] text-[#060C14]">
               {section.introTitle}
            </h2>
          </div>
          <div className="lg:w-4/12 pt-4">
             <p className="text-gray-500 text-lg leading-relaxed mb-8 font-light italic opacity-80">
                {section.introDesc}
             </p>
             {section.buttonText && (
                <Link href={section.buttonLink || `/${locale}/blog?tag=${section.selectedTag?.slug}`} className="group inline-flex items-center gap-6">
                   <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#060C14] group-hover:text-[#ff4848] transition-all border-b border-[#060C14] group-hover:border-[#ff4848] pb-1">
                      {section.buttonText}
                   </span>
                   <EyoloCircleArrow className="w-10 h-10 group-hover:bg-[#ff4848] group-hover:text-white transition-all transform group-hover:rotate-45" />
                </Link>
             )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-24">
           {items.map((item: any, idx: number) => (
              <PostCardScattered key={item.id} post={item} locale={locale} aspect={idx % 2 === 0 ? "aspect-[16/11]" : "aspect-[16/18]"} />
           ))}
        </div>
      </div>
    </section>
  )
}

// -- Gallery Template 2 (Dark Popular) --
function GalleryTemplateTwo({ section, items, locale }: any) {
  return (
     <section className="py-24 bg-[#060C14] text-white">
        <div className="container mx-auto px-6">
           <div className="text-center mb-20">
              <h3 className="text-[10px] uppercase tracking-[0.4em] font-bold text-[#ff4848] mb-6">{section.tagTitle || 'POPULAR STORIES'}</h3>
              <h2 className="text-5xl lg:text-7xl font-prata mb-10">{section.introTitle}</h2>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {items.slice(0, 4).map((p: any) => (
                 <Link key={p.id} href={`/${locale}/blog/${p.slug}`} className="relative h-[600px] overflow-hidden group rounded-3xl">
                    <img src={p.coverImage?.url || p.coverImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s] opacity-70 group-hover:opacity-100" alt={p.title} />
                    <div className="absolute inset-x-0 bottom-0 p-8 pt-20 bg-gradient-to-t from-[#060C14] to-transparent">
                       <p className="text-[9px] font-bold uppercase tracking-widest text-[#ff4848] mb-4">{p.categories?.[0]?.name}</p>
                       <h4 className="text-2xl font-prata leading-tight">{p.title}</h4>
                    </div>
                 </Link>
              ))}
           </div>
        </div>
     </section>
  )
}

// -- Gallery Template 3 (Trending - Pattern) --
function GalleryTemplateThree({ section, items, locale }: any) {
   return (
      <section className="py-24 bg-[#F5F2ED]">
         <div className="container mx-auto px-6">
            <div className="flex justify-between items-end mb-16">
               <h2 className="text-4xl lg:text-6xl font-prata text-[#060C14]">{section.introTitle}</h2>
               {section.buttonText && <Link href={section.buttonLink} className="text-[10px] font-bold tracking-widest border-b border-[#060C14] pb-1 uppercase">{section.buttonText}</Link>}
            </div>
            <div className="space-y-12">
               {items.slice(0, 3).map((p: any, i: number) => (
                  <Link key={p.id} href={`/${locale}/blog/${p.slug}`} className={`flex flex-col md:flex-row gap-8 items-center group ${i % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                     <div className="md:w-7/12 aspect-video overflow-hidden rounded-[20px] lg:rounded-[40px]">
                        <img src={p.coverImage?.url || p.coverImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s]" alt={p.title} />
                     </div>
                     <div className="md:w-5/12 p-4">
                        <span className="text-[#ff4848] text-[10px] font-bold uppercase tracking-widest block mb-4">{p.categories?.[0]?.name}</span>
                        <h4 className="text-3xl lg:text-4xl font-prata mb-6 hover:text-[#ff4848] transition-colors">{p.title}</h4>
                        <p className="text-gray-500 line-clamp-2 italic mb-6">{p.excerpt || 'Discover the structural innovation...'}</p>
                        <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400">
                           <span>{new Date(p.publishedAt).toLocaleDateString()}</span>
                           <span>•</span>
                           <span>BY {p.author?.name || 'EDITORIAL'}</span>
                        </div>
                     </div>
                  </Link>
               ))}
            </div>
         </div>
      </section>
   )
}

// -- Gallery Template 4 (Weekly/Wave) --
function GalleryTemplateFour({ section, items, locale }: any) {
   return (
      <section className="py-24 bg-white relative overflow-hidden">
         {/* Simple background decorative element for 'Wave' feel */}
         <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#ff4848]/10 to-transparent -rotate-12" />
         <div className="container mx-auto px-6 relative z-10">
             <div className="text-center mb-16">
                <h2 className="text-5xl lg:text-8xl font-prata text-[#060C14] mb-4">{section.introTitle}</h2>
                <div className="w-20 h-1 bg-[#ff4848] mx-auto opacity-30" />
             </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {items.slice(0, 3).map((p: any) => (
                   <div key={p.id} className="group cursor-pointer">
                      <div className="relative aspect-[3/4] rounded-[50%_50%_0_0] overflow-hidden mb-8 border border-gray-100 shadow-lg">
                         <img src={p.coverImage?.url || p.coverImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s]" alt={p.title} />
                         <div className="absolute inset-0 bg-white/10 group-hover:bg-transparent transition-all" />
                      </div>
                      <h4 className="text-2xl font-prata text-center group-hover:text-[#ff4848] transition-colors line-clamp-2 px-4">{p.title}</h4>
                   </div>
                ))}
             </div>
         </div>
      </section>
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
         <span className="text-gray-400">{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : 'Dec 2023'}</span>
      </div>
      <Link href={`/${locale}/blog/${post.slug}`}>
        <h3 className="text-2xl font-prata !leading-tight text-[#060C14] hover:text-[#ff4848] transition-colors mb-4 line-clamp-2">
          {post.title}
        </h3>
      </Link>
      <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest italic">
        By {post.author?.name || post.author || 'Editorial'}
      </p>
    </div>
  )
}

// ==================================================================
// MOCK DATA (Extended for Demo)
// ==================================================================

const MOCK_SETTINGS = (locale: string) => ({
  heroTitle: locale === 'zh' ? '博斯罗姆精选' : 'BUSROM FEATURED',
  navTitle: locale === 'zh' ? '热门话题' : 'Trending Topics',
  showAll: true,
  categoryTabs: [
    { id: '1', name: locale === 'zh' ? '设计灵感' : 'Design', type: 'Strategy' },
    { id: '2', name: locale === 'zh' ? '工程解析' : 'Lifestyle', type: 'Life' },
    { id: '3', name: locale === 'zh' ? '幕墙方案' : 'Engineering', type: 'Industrial' },
    { id: '4', name: locale === 'zh' ? '支架系统' : 'Products', type: 'Tech' },
    { id: '5', name: locale === 'zh' ? '行业趋势' : 'Trends', type: 'Global' },
  ],
  sections: [
     { id: 'sec1', template: 'template1', introTitle: 'Modern Structural Engineering', introDesc: 'Exploring the future of architecture with high-performance glass systems.' }
  ]
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
    author: { name: ['Kathryn Jackson', 'Alex Walton', 'Elena Ross'][i % 3] }
  }
})
