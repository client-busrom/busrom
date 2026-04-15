import type { Locale } from "@/i18n.config"
import { LexicalRenderer } from "@/components/lexical/LexicalRenderer"
import Link from "next/link"

interface BlogTemplateProps {
  blog: any
  locale: Locale
  formatDate: (date: string) => string
}

export function BlogTemplateThree({ blog, locale, formatDate }: BlogTemplateProps) {
  // Reference: https://reland-nextjs.vercel.app/blog-details
  // "Modern Corporate Detail" with sand background, 8:4 grid, and structured sidebar
  
  return (
    <article className="min-h-screen bg-[#fbfcf4] font-montserrat antialiased text-[#060C14] pb-24">
      <div className="container mx-auto px-6 lg:px-12 pt-16 lg:pt-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          
          {/* LEFT COLUMN: Main Content */}
          <div className="lg:col-span-8">
            <header className="mb-10">
              <h1 className="text-[32px] md:text-[44px] font-bold font-vidaloka leading-tight mb-6">
                Apartments designed by the leading interior experts
              </h1>
              <div className="flex items-center gap-4 text-sm font-medium text-gray-400">
                <span>May 19, 2026</span>
                <span>•</span>
                <span>Nicole Willis</span>
              </div>
            </header>

            {/* Featured Image */}
            <div className="mb-12 rounded-2xl overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80" 
                alt="Featured Apartment" 
                className="w-full h-auto object-cover"
              />
            </div>

            {/* Body Content */}
            <div className="prose prose-lg max-w-none text-[#060C14]/80 leading-relaxed space-y-8">
              <p className="text-xl md:text-[22px] text-[#060C14] leading-[1.6]">
                Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est
              </p>
              
              <p>
                Denouncing pleasure and praising pain was born and I will give you a complete account of the system, and expound the actual teachings of the great explorer of the truth, the master-builder of human happiness. No one rejects, dislikes, or avoids pleasure itself, because it is pleasure, but because those who do not know how to pursue pleasure rationally encounter consequences
              </p>

              <blockquote className="border-l-4 border-[#060C14] pl-8 my-12 italic text-2xl font-vidaloka text-[#060C14]">
                Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor
              </blockquote>

              <p>
                Voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum
              </p>

              <p>
                Nor again is there anyone who loves or pursues or desires to obtain pain of itself, because it is pain, but because occasionally circumstances occur in which toil and pain can procure him some great pleasure. To take a trivial example, which of us ever undertakes laborious physical exercise, except to obtain
              </p>
            </div>

            {/* Social Share Buttons */}
            <div className="mt-16 flex items-center gap-4">
              {[
                { name: 'Facebook', color: '#3b5998' },
                { name: 'Twitter', color: '#1da1f2' },
                { name: 'Pinterest', color: '#bd081c' },
                { name: 'LinkedIn', color: '#0077b5' }
              ].map(social => (
                <button key={social.name} className="px-6 py-2 rounded-full border border-gray-100 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors">
                  {social.name}
                </button>
              ))}
            </div>

            {/* Author Bio Box */}
            <div className="mt-16 p-8 md:p-12 bg-[#f9faf1] rounded-3xl flex flex-col md:flex-row gap-8 items-start">
              <div className="w-24 h-24 rounded-full overflow-hidden shrink-0 mt-1">
                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop" alt="Nicole Willis" className="w-full h-full object-cover" />
              </div>
              <div className="space-y-4">
                <p className="text-gray-500 leading-relaxed italic pr-4">
                  Eam soluta dicunt cu. Est ad oporteat appellantur, per dicta pertinax cu. Iusto quando conceptam vim ad, an sed explicari appellantur. Accumsan pericula usu an, in pri dolorum denique. Cu movet debitis cum
                </p>
                <div>
                  <h4 className="text-xl font-bold">Nicole Willis</h4>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mt-1">Writer</p>
                </div>
              </div>
            </div>

            {/* Post Navigation */}
            <div className="mt-16 grid grid-cols-2 gap-8 border-t border-gray-100 pt-12">
               <div>
                 <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Prev post</p>
                 <Link href="#" className="text-lg font-bold hover:text-gray-600 transition-colors">
                   7 Home Trends That Will Shape Your House In
                 </Link>
               </div>
               <div className="text-right">
                 <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Next post</p>
                 <Link href="#" className="text-lg font-bold hover:text-gray-600 transition-colors">
                   Skills That You Can Learn In The Real Estate Market
                 </Link>
               </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Sidebar */}
          <aside className="lg:col-span-4 space-y-16">
            
            {/* Search Box */}
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search your article here..." 
                className="w-full bg-white border-none rounded-2xl px-6 py-5 text-sm focus:outline-none shadow-sm placeholder:text-gray-300"
              />
              <div className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </div>
            </div>

            {/* Categories */}
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-8">Categories</h4>
              <ul className="space-y-4">
                {['Architecture', 'House', 'Property', 'Real Estate', 'Residence'].map(cat => (
                  <li key={cat}>
                    <Link href="#" className="text-sm font-semibold hover:text-gray-500 transition-colors flex items-center gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-200"></span>
                      {cat}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Popular Posts */}
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-8">Popular posts</h4>
              <div className="space-y-8">
                {[
                  { title: "7 Home Trends That Will Shape Your House In", date: "June 9, 2026", author: "Nicole Willis" },
                  { title: "Skills That You Can Learn In The Real Estate Market", date: "june 26, 2026", author: "Nicole Willis" },
                  { title: "Advertising Relationships Vs Business Decisions", date: "March 15, 2026", author: "Nicole Willis" }
                ].map(post => (
                  <div key={post.title} className="space-y-2 group cursor-pointer">
                    <h5 className="text-sm font-bold leading-snug group-hover:text-gray-600 transition-colors">{post.title}</h5>
                    <div className="flex items-center gap-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      <span>{post.date}</span>
                      <span>{post.author}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Follow Us */}
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-8">Follow Us</h4>
              <div className="flex flex-wrap gap-3">
                {['Facebook', 'Twitter', 'Instagram', 'Youtube'].map(s => (
                  <button key={s} className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm hover:scale-110 transition-transform">
                    <span className="text-[8px] font-black uppercase">{s[0]}</span>
                  </button>
                ))}
              </div>
            </div>

          </aside>
        </div>
      </div>

      {/* Recommended Posts (Full Width Section) */}
      <div className="container mx-auto px-6 lg:px-12 mt-24 pt-20 border-t border-gray-100">
        <h3 className="text-3xl font-vidaloka mb-12">Popular posts</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            { title: "7 Home Trends That Will Shape Your House In", date: "June 9, 2026", img: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400&q=80" },
            { title: "space solutions and small apartment ideas", date: "August 14, 2026", img: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&q=80" },
            { title: "Skills That You Can Learn In The Real Estate Market", date: "june 26, 2026", img: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80" }
          ].map(item => (
            <div key={item.title} className="space-y-5 group cursor-pointer">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-sm">
                <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              </div>
              <h4 className="text-lg font-bold leading-snug group-hover:text-gray-600 transition-colors">{item.title}</h4>
              <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">{item.date}</p>
            </div>
          ))}
        </div>
      </div>
    </article>
  )
}
