import type { Locale } from "@/i18n.config"
import Link from "next/link"

interface BlogTemplateProps {
  blog: any
  locale: Locale
  formatDate: (date: string) => string
}

export function BlogTemplateTwo({ blog, locale, formatDate }: BlogTemplateProps) {
  // Reference: https://www.julesacree.com/all/2023-full-kitchen-tour
  // The "Jules Vibe": Warm neutrals (#F4F1ED), Charcoal text (#474642), Terracotta accents (#B06E4E).
  
  return (
    <article className="min-h-screen bg-[#F4F1ED] text-[#474642] pb-32 font-sans selection:bg-[#DCAC96]/30 antialiased">
      {/* 1. Centered Header Section */}
      <header className="max-w-[1000px] mx-auto px-6 pt-[128px] pb-20 text-center">
        <div className="uppercase tracking-[4.5px] text-[10px] font-extrabold text-[#B06E4E] mb-8">
          {blog.categories?.[0]?.name || 'Mindful Home'}
        </div>
        
        <h1 className="text-[48px] font-serif leading-[1.2] mb-[50px] text-[#474642] tracking-tight max-w-[1000px] mx-auto font-medium">
          {blog.title}
        </h1>
        
        <div className="text-[12px] font-bold uppercase tracking-[3px] text-[#474642]/50">
          BY {blog.author?.toUpperCase() || 'JULES ACREE'} &nbsp; | &nbsp; {formatDate(blog.publishedAt)}
        </div>
      </header>

      {/* 2. Featured Image Container */}
      {blog.coverImage && (
        <div className="max-w-[1000px] mx-auto px-6 mb-[60px]">
          <div className="aspect-[16/9] relative overflow-hidden shadow-sm">
             <img 
               src={blog.coverImage} 
               alt={blog.title} 
               className="w-full h-full object-cover transition-transform duration-[2s] hover:scale-105" 
             />
          </div>
        </div>
      )}

      {/* 3. Narrative Column - Strict 1000px width, Content Left Aligned */}
      <main className="max-w-[1000px] mx-auto px-6 leading-[1.85] text-[17px] text-[#474642]/95">
        <div className="space-y-10">
          <p>
            Welcome to my kitchen! I’m excited to dive in and do a full on, in-depth kitchen tour today. 
          </p>
          
          <p>
            I will walk you through everything from the custom woodworking, my favorite appliances, my coffee and matcha corner, and speak more on the decor and choices we made to bring the space to life. I&apos;ll be sure to link* as much as I can below! (*may contain affiliate links)
          </p>

          <p className="italic">
            Be sure to watch the full video to catch all of the deets!
          </p>

          {/* 4. Signature Salmon Button - Centered */}
          <div className="flex justify-center py-12">
            <Link 
              href="#" 
              className="bg-[#DCAC96] text-white px-14 py-5 rounded-full text-[13px] font-mono tracking-[3px] font-bold hover:bg-[#B06E4E] transition-all duration-500 shadow-md uppercase active:scale-95"
            >
              Watch Full Tour
            </Link>
          </div>

          <section>
            <h2 className="text-[32px] font-serif font-medium text-[#474642] mb-8 mt-24 pb-0 tracking-tight">
              Island
            </h2>
            <p className="mb-8">
              First we&apos;ll start with the island. I really love our island. It fits four people comfortably and we customized it to warm up the space. 
            </p>
            <p>
              <span className="text-[#B06E4E] font-bold uppercase tracking-wider text-[15px]">Custom Woodworking:</span> When we first moved into the house, the island was white drywall. We knew that we wanted to add wood to help add some depth to the kitchen and ground the space a little bit more. We ended up finding a woodworker here in Austin and we installed white oak panels around the entire thing.
            </p>
          </section>

          <div className="my-20 aspect-video bg-white/30 overflow-hidden shadow-sm">
             <img 
              src="https://images.unsplash.com/photo-1556912177-f547c12dd3ee?auto=format&fit=crop&q=80&w=1200" 
              alt="Island Detail" 
              className="w-full h-full object-cover"
            />
          </div>

          <section>
            <h2 className="text-[32px] font-serif font-medium text-[#474642] mb-8 mt-24 pb-0 tracking-tight">
              The Fridge
            </h2>
            <p>
              <span className="text-[#B06E4E] font-bold uppercase tracking-wider text-[15px]">Fridge Drawer:</span> We decided to go with the Dacor brand for all of our appliances. The fridge has been a game-changer with its flex-zone drawer where I keep all of our favorite beverages and snacks organized and within reach.
            </p>
          </section>

          <div className="my-20 aspect-[4/5] bg-white/30 overflow-hidden shadow-sm max-w-[600px] mx-auto">
             <img 
              src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800" 
              alt="Fridge Setup" 
              className="w-full h-full object-cover"
            />
          </div>

          <section>
            <h2 className="text-[32px] font-serif font-medium text-[#474642] mb-8 mt-24 pb-0 tracking-tight">
              Coffee & Matcha Corner
            </h2>
            <p>
              It wouldn&apos;t be a kitchen tour without showing my favorite nook. This is where I start every morning. I love having everything in one place, from the espresso machine to my favorite matcha bowls.
            </p>
          </section>

          <div className="my-20 aspect-video bg-white/30 overflow-hidden shadow-sm">
             <img 
              src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=1200" 
              alt="Coffee Corner" 
              className="w-full h-full object-cover"
            />
          </div>

          <section>
            <h2 className="text-[32px] font-serif font-medium text-[#474642] mb-8 mt-24 pb-0 tracking-tight">
              Dining Area
            </h2>
            <p>
              <span className="text-[#B06E4E] font-bold uppercase tracking-wider text-[15px]">Dining Table:</span> This is where we host most of our friends. It fits 8 people comfortably and the light fixture above adds that cozy, intentional touch to every meal.
            </p>
          </section>
        </div>

        {/* Categories/Tags below content */}
        <div className="mt-32 pt-12 border-t border-[#474642]/15 flex flex-wrap gap-6 items-center">
            <span className="text-[10px] uppercase font-extrabold tracking-[2px] text-[#474642]/40">POSTED IN:</span>
            <span className="text-[13px] font-bold text-[#B06E4E] hover:text-[#474642] cursor-pointer uppercase tracking-widest transition-colors">
              Mindful Home
            </span>
            <span className="text-[13px] font-bold text-[#B06E4E] hover:text-[#474642] cursor-pointer uppercase tracking-widest transition-colors">
              Intentional Living
            </span>
        </div>

        {/* 5. Minimalist Footer Pagination Fix */}
        <footer className="mt-40 pt-20 border-t border-[#474642]/10 flex flex-col items-center">
            <Link 
              href={`/${locale}/blog`} 
              className="group flex flex-col items-center gap-6 text-[#B06E4E] no-underline"
            >
               <span className="uppercase tracking-[5px] text-[11px] font-extrabold group-hover:text-[#474642] transition-colors">Explore more</span>
               <div className="w-16 h-[2px] bg-[#B06E4E] group-hover:w-32 transition-all duration-1000 ease-in-out group-hover:bg-[#474642]"></div>
            </Link>
        </footer>
      </main>
    </article>
  )
}
