/**
 * Seed Script: HeroBannerItem
 *
 * Populates HeroBannerItem table with 9 hero banner items from mock data
 * Images need to be manually replaced after seeding
 */

// Import from root .prisma/client since we're in cms/scripts
import { PrismaClient } from '../../node_modules/.prisma/client'

const prisma = new PrismaClient()

const heroBannerData = [
  {
    order: 1,
    title: { en: 'Glass Standoff', zh: '玻璃支撑件' },
    feature1: { en: 'Customized Minimalist Modern Glass Standoff', zh: '定制极简现代玻璃支撑件' },
    feature2: { en: 'Redefining Transparency & Modern Design', zh: '重新定义透明度与现代设计' },
    feature3: { en: 'Invisible Strength', zh: '隐形强度' },
    feature4: { en: 'Adjustable Flexibility', zh: '可调灵活性' },
    feature5: { en: 'Superior Durability', zh: '卓越耐用性' },
  },
  {
    order: 2,
    title: { en: 'Glass Connected Fitting', zh: '玻璃连接件' },
    feature1: { en: 'Durable Built Tough Glass Connected Fitting', zh: '耐用坚固的玻璃连接件' },
    feature2: { en: 'For A Clear And Secure Structure', zh: '为了清晰且安全的结构' },
    feature3: { en: 'High Load-bearing', zh: '高承重能力' },
    feature4: { en: 'Durability', zh: '耐久性' },
    feature5: { en: 'Safety', zh: '安全性' },
  },
  {
    order: 3,
    title: { en: 'Glass Fence Spigot', zh: '玻璃围栏立柱' },
    feature1: { en: 'Architectural Glass Fence Spigot', zh: '建筑级玻璃围栏立柱' },
    feature2: { en: 'The Art of Invisible Support', zh: '隐形支撑的艺术' },
    feature3: { en: 'Salt-spray Resistant', zh: '耐盐雾' },
    feature4: { en: 'Effortless Installation', zh: '安装简便' },
    feature5: { en: 'Unmatched Stability', zh: '无与伦比的稳定性' },
  },
  {
    order: 4,
    title: { en: 'Glass Clip (Railing)', zh: '玻璃栏杆夹' },
    feature1: { en: 'Luxury Invisible \n Glass Railing Clip', zh: '奢华隐形\n玻璃栏杆夹' },
    feature2: { en: 'Small Footprint & Strong Hold', zh: '占地小 & 牢固抓握' },
    feature3: { en: 'Anti-Impact', zh: '抗冲击' },
    feature4: { en: 'Easy Installation', zh: '易于安装' },
    feature5: { en: 'Full Vertical Manufacturing', zh: '全垂直化生产' },
  },
  {
    order: 5,
    title: { en: 'Glass Clip (Bathroom)', zh: '浴室玻璃夹' },
    feature1: { en: 'Design-forward \n Waterproof Bathroom Glass Clip', zh: '设计前卫的\n防水浴室玻璃夹' },
    feature2: { en: 'Minimal Contact & Maximum Glass', zh: '最小接触面积 & 最大化玻璃视野' },
    feature3: { en: 'High Quality', zh: '高品质' },
    feature4: { en: 'Corrosion-resistant', zh: '耐腐蚀' },
    feature5: { en: 'Flexible Compatibility', zh: '灵活兼容性' },
  },
  {
    order: 6,
    title: { en: 'Glass Hinge', zh: '玻璃合页' },
    feature1: { en: 'Curated \n Details Glass Hinge', zh: '精心打造\n细节的玻璃合页' },
    feature2: { en: 'Swing Open The Invisible', zh: '开启无形之门' },
    feature3: { en: 'Silent Operation', zh: '静音操作' },
    feature4: { en: 'Adjustable Design', zh: '可调节设计' },
    feature5: { en: 'Aviation-grade Material', zh: '航空级材料' },
  },
  {
    order: 7,
    title: { en: 'Sliding Door Kit', zh: '移门套件' },
    feature1: { en: 'Silent Soft-\nClose Sliding Door Kit', zh: '静音\n缓关移门套件' },
    feature2: { en: 'For Silent Glide & Perfect Divide', zh: '实现静谧滑动与完美空间分隔' },
    feature3: { en: 'Space Saving', zh: '节省空间' },
    feature4: { en: 'Durable Pulley', zh: '耐用滑轮' },
    feature5: { en: 'Silent Slide', zh: '静音滑动' },
  },
  {
    order: 8,
    title: { en: 'Bathroom & Door Handle', zh: '浴室及门拉手' },
    feature1: { en: 'Opulent Simplicity Bathroom \n & Door Handle', zh: '华丽简约的浴室\n及门拉手' },
    feature2: { en: 'Turn Every Touch Into Elegance', zh: '让每次触摸尽显优雅' },
    feature3: { en: 'All-Weather Design', zh: '全天候设计' },
    feature4: { en: 'High Strength & Hardness', zh: '高强度与硬度' },
    feature5: { en: 'Easy Maintenance', zh: '易于维护' },
  },
  {
    order: 9,
    title: { en: 'Hidden Hook', zh: '隐藏式挂钩' },
    feature1: { en: 'Elegant \n Streamlined \n Hidden Hook', zh: '优雅\n流线型\n隐藏式挂钩' },
    feature2: { en: 'Hidden Mounting & Strong Load-Bearing', zh: '隐藏式安装 & 强大承重' },
    feature3: { en: 'Removable Design', zh: '可拆卸设计' },
    feature4: { en: 'Quick Setup', zh: '快速安装' },
    feature5: { en: 'Invisible Storage', zh: '隐形收纳' },
  },
]

async function main() {
  console.log('🌱 Seeding HeroBannerItems...')

  // Get a placeholder media (first available media)
  const placeholderMedia = await prisma.media.findFirst({
    select: { id: true, filename: true }
  })

  if (!placeholderMedia) {
    console.error('❌ No media found! Please upload at least one media file first.')
    process.exit(1)
  }

  console.log(`📷 Using placeholder media: ${placeholderMedia.filename} (${placeholderMedia.id})`)

  // Clear existing HeroBannerItems
  const deleteResult = await prisma.heroBannerItem.deleteMany({})
  console.log(`🗑️  Deleted ${deleteResult.count} existing HeroBannerItems`)

  // Create all 9 hero banner items
  let created = 0
  for (const item of heroBannerData) {
    const result = await prisma.heroBannerItem.create({
      data: {
        order: item.order,
        title: item.title,
        feature1: item.feature1,
        feature2: item.feature2,
        feature3: item.feature3,
        feature4: item.feature4,
        feature5: item.feature5,
        // Use placeholder media for all 4 images (you'll replace these manually)
        image1: placeholderMedia.id,
        image2: placeholderMedia.id,
        image3: placeholderMedia.id,
        image4: placeholderMedia.id,
        status: 'PUBLISHED',
        enabled: true,
        publishedAt: new Date(),
      },
    })
    created++
    console.log(`✅ Created HeroBannerItem ${created}/9: ${item.title.en}`)
  }

  console.log(`\n🎉 Successfully seeded ${created} HeroBannerItems!`)
  console.log(`⚠️  Remember to manually replace the placeholder images in the CMS admin UI`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding HeroBannerItems:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
