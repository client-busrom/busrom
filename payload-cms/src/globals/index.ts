/**
 * Globals Index
 *
 * Export all globals from a single file
 *
 * IMPORTANT: The order here determines the navigation sidebar order in Payload Admin
 * Keep this order in sync with the frontend HomePageClient.tsx component order
 */

// Site Configuration
export { HomeContent } from './HomeContent'
export { Footer } from './Footer'
export { SiteConfig } from './SiteConfig'

// Homepage Sections (按前端 HomePageClient.tsx 顺序排列)
// Note: HeroBanner (1) and SeriesIntro (6) are Collections, not Globals
export { ProductSeriesCarousel } from './ProductSeriesCarousel'  // 2
export { ServiceFeatures } from './ServiceFeatures'              // 3
export { Sphere3d } from './Sphere3d'                            // 4
export { SimpleCta } from './SimpleCta'                          // 5
export { FeaturedProducts } from './FeaturedProducts'            // 7
export { BrandAdvantages } from './BrandAdvantages'              // 8
export { OemOdm } from './OemOdm'                                // 9
export { QuoteSteps } from './QuoteSteps'                        // 10
export { MainForm } from './MainForm'                            // 11
export { WhyChooseBusrom } from './WhyChooseBusrom'              // 12
export { CaseStudies } from './CaseStudies'                      // 13
export { BrandAnalysis } from './BrandAnalysis'                  // 14
export { BrandValue } from './BrandValue'                        // 15

// More globals to be added:
// export { ContactConfig } from './ContactConfig'
// export { SocialConfig } from './SocialConfig'
// export { EmailConfig } from './EmailConfig'
// export { SeoConfig } from './SeoConfig'
