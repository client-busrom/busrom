/**
 * 批量创建产品脚本 - 带图片随机选择
 * 每个系列创建10个产品，共90个产品
 *
 * Usage:
 * npx tsx cms/scripts/seed-products-with-images.ts
 */

// 必须在导入 keystone 配置之前设置环境变量
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://busrom:busrom_dev_password@localhost:5432/busrom_cms'

import { getContext } from '@keystone-6/core/context'
import config from '../keystone'
import * as PrismaModule from '.prisma/client'

// 使用实际的 ProductSeries ID（从数据库查询的）
const seriesConfig = [
  {
    seriesId: 'e1022faa-c669-4156-869b-7cca8a857827',
    seriesNameEn: 'Glass Standoff',
    seriesNameZh: '广告螺丝',
    skuPrefix: 'GS',
    mediaPrefix: 'glass-standoff',
    namePrefix: { en: 'Glass Standoff', zh: '玻璃广告螺丝' },
    shortDesc: {
      en: 'Stylish adjustable glass standoff for modern glass panel installation.',
      zh: '时尚可调节玻璃广告螺丝,适用于现代玻璃面板安装。'
    }
  },
  {
    seriesId: '95daf2d6-a271-4382-ac77-828a081802e8',
    seriesNameEn: 'Glass Connected Fitting',
    seriesNameZh: '玻璃栏杆扶手连接件',
    skuPrefix: 'GCF',
    mediaPrefix: 'glass-connected-fitting',
    namePrefix: { en: 'Glass Connected Fitting', zh: '玻璃栏杆扶手连接件' },
    shortDesc: {
      en: 'Eco-friendly durable stair fence glass connected fitting for modern architecture.',
      zh: '环保耐用的楼梯栅栏玻璃连接件,适用于现代建筑。'
    }
  },
  {
    seriesId: '0416facf-0104-4ebd-828e-900bffbc6417',
    seriesNameEn: 'Glass Fence Spigot',
    seriesNameZh: '玻璃护栏支架底座',
    skuPrefix: 'GFS',
    mediaPrefix: 'glass-fence-spigot',
    namePrefix: { en: 'Glass Fence Spigot', zh: '玻璃护栏支架底座' },
    shortDesc: {
      en: 'Premium glass fence spigot for pool fencing and balustrade systems.',
      zh: '优质玻璃护栏支架底座，适用于泳池围栏和栏杆系统。'
    }
  },
  {
    seriesId: 'b96a723f-1f59-400e-8f1b-0d294d238899',
    seriesNameEn: 'Guardrail Glass Clip',
    seriesNameZh: '护栏系列',
    skuPrefix: 'GGC',
    mediaPrefix: 'guardrail-glass-clip',
    namePrefix: { en: 'Guardrail Glass Clip', zh: '护栏玻璃夹' },
    shortDesc: {
      en: 'Heavy-duty guardrail glass clip for commercial and residential applications.',
      zh: '重型护栏玻璃夹，适用于商业和住宅应用。'
    }
  },
  {
    seriesId: '0bd1d0f1-d6d3-4e61-a68e-c3661cdb18ff',
    seriesNameEn: 'Bathroom Glass Clip',
    seriesNameZh: '浴室系列',
    skuPrefix: 'BGC',
    mediaPrefix: 'bathroom-glass-clip',
    namePrefix: { en: 'Bathroom Glass Clip', zh: '浴室玻璃夹' },
    shortDesc: {
      en: 'Corrosion-resistant bathroom glass clip for shower enclosures.',
      zh: '耐腐蚀浴室玻璃夹，适用于淋浴房。'
    }
  },
  {
    seriesId: 'fe29d76d-5d33-4947-a478-24872e4549b1',
    seriesNameEn: 'Glass Hinge',
    seriesNameZh: '浴室夹',
    skuPrefix: 'GH',
    mediaPrefix: 'glass-hinge',
    namePrefix: { en: 'Glass Hinge', zh: '玻璃铰链' },
    shortDesc: {
      en: 'Premium glass hinge for shower doors and glass partitions.',
      zh: '优质玻璃铰链，适用于淋浴门和玻璃隔断。'
    }
  },
  {
    seriesId: 'b48d81ee-aef4-47b1-be54-8763ed0d2302',
    seriesNameEn: 'Sliding Door Kit',
    seriesNameZh: '移门滑轮套装',
    skuPrefix: 'SDK',
    mediaPrefix: 'sliding-door-kit',
    namePrefix: { en: 'Sliding Door Kit', zh: '移门滑轮套装' },
    shortDesc: {
      en: 'Complete sliding door hardware kit for barn doors and interior doors.',
      zh: '完整的移门五金套装，适用于谷仓门和室内门。'
    }
  },
  {
    seriesId: 'd989ba5c-bf20-4b0f-878b-8898b318c767',
    seriesNameEn: 'Bathroom & Door Handle',
    seriesNameZh: '浴室&大门拉手',
    skuPrefix: 'BDH',
    mediaPrefix: 'bathroom-door-handle',
    namePrefix: { en: 'Door Handle', zh: '门拉手' },
    shortDesc: {
      en: 'Elegant bathroom and door handle for modern interiors.',
      zh: '优雅的浴室和大门拉手，适用于现代室内设计。'
    }
  },
  {
    seriesId: '0da66122-a615-4815-a6b5-0ed8f8279953',
    seriesNameEn: 'Hidden Hook',
    seriesNameZh: '挂钩',
    skuPrefix: 'HH',
    mediaPrefix: 'hidden-hook',
    namePrefix: { en: 'Hidden Hook', zh: '隐藏挂钩' },
    shortDesc: {
      en: 'Minimalist hidden hook for towels and robes.',
      zh: '简约隐藏挂钩，适用于毛巾和浴袍。'
    }
  }
]

// 产品名称模板
const productNames: Record<string, Array<{ en: string; zh: string }>> = {
  'GS': [
    { en: 'Round Head Standoff', zh: '圆头广告钉' },
    { en: 'Flat Head Standoff', zh: '平头广告钉' },
    { en: 'Conical Standoff', zh: '锥形广告钉' },
    { en: 'Adjustable Standoff', zh: '可调节广告钉' },
    { en: 'Sign Standoff', zh: '标识广告钉' },
    { en: 'Decorative Standoff', zh: '装饰广告钉' },
    { en: 'Heavy Duty Standoff', zh: '重型广告钉' },
    { en: 'Mini Standoff', zh: '迷你广告钉' },
    { en: 'Edge Grip Standoff', zh: '边缘夹持广告钉' },
    { en: 'Cable Standoff', zh: '缆绳广告钉' },
  ],
  'GCF': [
    { en: 'Handrail Bracket', zh: '扶手支架' },
    { en: 'Wall Mount Connector', zh: '墙面连接件' },
    { en: 'Corner Connector', zh: '转角连接件' },
    { en: 'T-Shape Connector', zh: 'T型连接件' },
    { en: 'Cross Connector', zh: '十字连接件' },
    { en: 'End Cap', zh: '端盖' },
    { en: 'Adjustable Elbow', zh: '可调弯头' },
    { en: 'Flange Connector', zh: '法兰连接件' },
    { en: 'Tube Connector', zh: '管件连接件' },
    { en: 'Ball Connector', zh: '球形连接件' },
  ],
  'GFS': [
    { en: 'Core Drill Spigot', zh: '核心钻孔夹' },
    { en: 'Square Base Spigot', zh: '方形底座夹' },
    { en: 'Round Base Spigot', zh: '圆形底座夹' },
    { en: 'Side Mount Spigot', zh: '侧装夹' },
    { en: 'Deck Mount Spigot', zh: '甲板安装夹' },
    { en: 'Fascia Mount Spigot', zh: '面板安装夹' },
    { en: 'Adjustable Spigot', zh: '可调节夹' },
    { en: 'Mini Spigot', zh: '迷你夹' },
    { en: 'Heavy Duty Spigot', zh: '重型夹' },
    { en: 'Frameless Spigot', zh: '无框夹' },
  ],
  'GGC': [
    { en: 'Square Glass Clip', zh: '方形玻璃夹' },
    { en: 'Round Glass Clip', zh: '圆形玻璃夹' },
    { en: 'D-Shape Glass Clip', zh: 'D型玻璃夹' },
    { en: 'Corner Glass Clip', zh: '转角玻璃夹' },
    { en: 'Adjustable Glass Clip', zh: '可调玻璃夹' },
    { en: 'Heavy Load Glass Clip', zh: '重载玻璃夹' },
    { en: 'Mini Glass Clip', zh: '迷你玻璃夹' },
    { en: 'Flat Back Glass Clip', zh: '平背玻璃夹' },
    { en: 'Curved Glass Clip', zh: '弧形玻璃夹' },
    { en: 'Double Sided Glass Clip', zh: '双面玻璃夹' },
  ],
  'BGC': [
    { en: 'Shower Glass Clip', zh: '淋浴玻璃夹' },
    { en: 'Bathroom Door Clip', zh: '浴室门夹' },
    { en: '90 Degree Clip', zh: '90度夹' },
    { en: '180 Degree Clip', zh: '180度夹' },
    { en: 'Wall to Glass Clip', zh: '墙对玻璃夹' },
    { en: 'Glass to Glass Clip', zh: '玻璃对玻璃夹' },
    { en: 'U-Channel Clip', zh: 'U型槽夹' },
    { en: 'Pivot Clip', zh: '枢轴夹' },
    { en: 'Fixed Panel Clip', zh: '固定面板夹' },
    { en: 'Adjustable Bathroom Clip', zh: '可调浴室夹' },
  ],
  'GH': [
    { en: 'Shower Door Hinge', zh: '淋浴门铰链' },
    { en: '90 Degree Hinge', zh: '90度铰链' },
    { en: '180 Degree Hinge', zh: '180度铰链' },
    { en: 'Pivot Hinge', zh: '枢轴铰链' },
    { en: 'Wall Mount Hinge', zh: '墙装铰链' },
    { en: 'Glass to Glass Hinge', zh: '玻璃对玻璃铰链' },
    { en: 'Self-Closing Hinge', zh: '自闭铰链' },
    { en: 'Lift-Off Hinge', zh: '可拆卸铰链' },
    { en: 'Heavy Duty Hinge', zh: '重型铰链' },
    { en: 'Soft Close Hinge', zh: '缓冲铰链' },
  ],
  'SDK': [
    { en: 'Barn Door Hardware Kit', zh: '谷仓门五金套装' },
    { en: 'Bypass Sliding Kit', zh: '双联推拉套装' },
    { en: 'Pocket Door Kit', zh: '隐藏门套装' },
    { en: 'Soft Close Sliding Kit', zh: '缓冲推拉套装' },
    { en: 'Heavy Duty Sliding Kit', zh: '重型推拉套装' },
    { en: 'Mini Sliding Kit', zh: '迷你推拉套装' },
    { en: 'Glass Sliding Door Kit', zh: '玻璃推拉门套装' },
    { en: 'Wooden Door Sliding Kit', zh: '木门推拉套装' },
    { en: 'Double Track Kit', zh: '双轨套装' },
    { en: 'Ceiling Mount Kit', zh: '吊顶安装套装' },
  ],
  'BDH': [
    { en: 'Pull Handle', zh: '拉手' },
    { en: 'Towel Bar Handle', zh: '毛巾杆拉手' },
    { en: 'Ladder Handle', zh: '梯形拉手' },
    { en: 'C-Shape Handle', zh: 'C型拉手' },
    { en: 'Square Handle', zh: '方形拉手' },
    { en: 'Round Handle', zh: '圆形拉手' },
    { en: 'H-Shape Handle', zh: 'H型拉手' },
    { en: 'Back to Back Handle', zh: '背对背拉手' },
    { en: 'Single Sided Handle', zh: '单面拉手' },
    { en: 'Knob Handle', zh: '球形拉手' },
  ],
  'HH': [
    { en: 'Wall Mount Hook', zh: '墙挂钩' },
    { en: 'Robe Hook', zh: '浴袍钩' },
    { en: 'Towel Hook', zh: '毛巾钩' },
    { en: 'Double Hook', zh: '双钩' },
    { en: 'Triple Hook', zh: '三联钩' },
    { en: 'Folding Hook', zh: '折叠钩' },
    { en: 'Swivel Hook', zh: '旋转钩' },
    { en: 'Coat Hook', zh: '衣帽钩' },
    { en: 'Door Hook', zh: '门后钩' },
    { en: 'Heavy Duty Hook', zh: '重型钩' },
  ],
}

// 属性选项
const materials = [
  { en: '304 Stainless Steel', zh: '304不锈钢' },
  { en: '316 Stainless Steel', zh: '316不锈钢' },
  { en: 'Brass', zh: '黄铜' },
  { en: 'Aluminum Alloy', zh: '铝合金' },
  { en: 'Zinc Alloy', zh: '锌合金' },
]

const finishes = [
  { en: 'Brushed Silver', zh: '拉丝银' },
  { en: 'Mirror Polish', zh: '镜面抛光' },
  { en: 'Matte Black', zh: '哑光黑' },
  { en: 'Titanium Gold', zh: '钛金' },
  { en: 'Rose Gold', zh: '玫瑰金' },
  { en: 'Black Titanium', zh: '黑钛' },
  { en: 'Champagne Gold', zh: '香槟金' },
]

const glassThickness = ['6mm', '8mm', '10mm', '12mm', '15mm', '19mm']
const loadCapacity = ['50kg', '80kg', '100kg', '150kg', '200kg']

function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

interface MediaItem {
  id: string
  filename: string | null
  fileUrl: string | null
}

async function main() {
  console.log('🚀 开始批量创建产品（带图片）...\n')

  // 使用 Keystone context API
  const context = getContext(config, PrismaModule)
  const sudoContext = context.sudo()

  // 获取所有 Media
  console.log('📷 获取 Media 数据...')
  const allMedia = await sudoContext.query.Media.findMany({
    query: 'id filename fileUrl',
  }) as MediaItem[]
  console.log(`   找到 ${allMedia.length} 张图片\n`)

  // 按系列分类 Media
  const mediaByPrefix: Record<string, MediaItem[]> = {}
  for (const series of seriesConfig) {
    mediaByPrefix[series.mediaPrefix] = allMedia.filter(
      (m) => m.filename && m.filename.startsWith(series.mediaPrefix) && m.fileUrl
    )
    console.log(`   ${series.seriesNameEn}: ${mediaByPrefix[series.mediaPrefix].length} 张图片`)
  }

  let successCount = 0
  let errorCount = 0

  for (const series of seriesConfig) {
    console.log(`\n=== 创建 ${series.seriesNameEn} (${series.seriesNameZh}) 产品 ===`)

    const seriesMedia = mediaByPrefix[series.mediaPrefix] || []
    const whiteImages = seriesMedia.filter((m) => m.filename?.includes('_white_'))
    const sceneImages = seriesMedia.filter((m) => m.filename?.includes('_scene_'))

    const names = productNames[series.skuPrefix] || []

    for (let i = 0; i < 10; i++) {
      const name = names[i] || { en: `${series.namePrefix.en} Model ${i + 1}`, zh: `${series.namePrefix.zh}型号${i + 1}` }
      const material = randomPick(materials)
      const finish = randomPick(finishes)
      const glass = randomPick(glassThickness)
      const load = randomPick(loadCapacity)

      // 随机选择图片
      // mainImage = 场景图 (scene) - 用于 FeaturedProducts 展示
      // showImage = 白底图 (white) - 用于产品列表展示
      const mainImage = sceneImages.length > 0
        ? randomPick(sceneImages)
        : (seriesMedia.length > 0 ? randomPick(seriesMedia) : null)
      const showImage = whiteImages.length > 0
        ? randomPick(whiteImages)
        : (seriesMedia.length > 0 ? randomPick(seriesMedia) : null)

      const sku = `${series.skuPrefix}-${String(i + 1).padStart(3, '0')}`
      const slug = `${series.skuPrefix.toLowerCase()}-${String(i + 1).padStart(3, '0')}`

      try {
        // 检查产品是否已存在
        const existing = await sudoContext.query.Product.findMany({
          where: { sku: { equals: sku } },
          query: 'id',
        })

        if (existing.length > 0) {
          console.log(`  ⚠️ 产品 ${sku} 已存在，跳过`)
          continue
        }

        const productData: any = {
          sku,
          slug,
          name: { en: name.en, zh: name.zh },
          shortDescription: series.shortDesc,
          description: {
            en: `Premium ${name.en.toLowerCase()} from Busrom's ${series.seriesNameEn} series. Crafted from durable ${material.en.toLowerCase()} with a beautiful ${finish.en.toLowerCase()} finish. Suitable for glass thickness ${glass}. Load capacity: ${load}.`,
            zh: `Busrom ${series.seriesNameZh}系列的优质${name.zh}。采用耐用的${material.zh}材质，配以精美的${finish.zh}表面处理。适用于${glass}厚度的玻璃。承重能力：${load}。`
          },
          attributes: {
            brand: { en: 'Busrom', zh: 'Busrom' },
            series: { en: series.seriesNameEn, zh: series.seriesNameZh },
            model: sku,
            material: material,
            finish: finish,
            glassThickness: glass,
            loadCapacity: load,
          },
          specifications: {
            material: material,
            finish: finish,
            glassThickness: glass,
            loadCapacity: load,
            warranty: { en: '5 Years', zh: '5年质保' },
            origin: { en: 'China', zh: '中国' },
          },
          series: { connect: { id: series.seriesId } },
          isFeatured: i < 3, // 前3个产品设为推荐
          order: i + 1,
          status: 'PUBLISHED',
        }

        // 如果有图片，设置图片 ID
        // mainImage 是 MultipleMediaField，需要数组格式: [{ id: "..." }]
        // showImage 是 SingleMediaField，需要单个对象格式: { id: "..." }
        if (mainImage) {
          productData.mainImage = [{ id: mainImage.id }]
        }
        if (showImage) {
          productData.showImage = { id: showImage.id }
        }

        const product = await sudoContext.query.Product.createOne({
          data: productData,
          query: 'id sku',
        })

        successCount++
        const imgInfo = mainImage ? `[${mainImage.filename?.substring(0, 25)}...]` : '[无图]'
        console.log(`  ✅ ${sku} - ${name.en} ${imgInfo}`)
      } catch (error: any) {
        errorCount++
        console.error(`  ❌ ${sku} 创建失败: ${error.message}`)
      }
    }
  }

  console.log('\n📊 创建完成!')
  console.log(`✅ 成功: ${successCount}`)
  console.log(`❌ 失败: ${errorCount}`)
  console.log(`📦 总计: ${successCount + errorCount}`)
}

main()
  .then(() => {
    console.log('\n✅ 脚本执行完成')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ 脚本执行失败:', error)
    process.exit(1)
  })
