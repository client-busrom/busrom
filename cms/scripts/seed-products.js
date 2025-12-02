/**
 * 批量创建产品脚本
 * 根据产品资料创建100个产品,每个系列10个
 */

const { PrismaClient } = require('../node_modules/.prisma/client')

const prisma = new PrismaClient()

// 产品系列配置
const seriesConfig = [
  {
    seriesId: 'e6d7094b-a6ed-4ad1-978f-c27f1c6fee2e',
    seriesNameEn: 'Glass Standoff',
    seriesNameZh: '广告螺丝',
    skuPrefix: 'GS',
    namePrefix: { en: 'Glass Standoff', zh: '玻璃广告螺丝' },
    shortDesc: {
      en: 'Stylish adjustable glass standoff for modern glass panel installation.',
      zh: '时尚可调节玻璃广告螺丝,适用于现代玻璃面板安装。'
    },
    content: {
      en: [
        { type: 'paragraph', children: [{ text: '' }] },
        { type: 'blockquote', children: [{ type: 'code', children: [{ text: 'Product Description' }] }] },
        {
          type: 'paragraph',
          children: [{ text: 'The Busrom stylish adjustable glass standoff series is inspired by craftsmanship and aesthetic simplicity, providing a safe, reliable and modern solution for fixing all types of glass panels.' }]
        },
        { type: 'divider', children: [{ text: '' }] },
        { type: 'blockquote', children: [{ type: 'code', children: [{ text: 'Material & Processes' }] }] },
        {
          type: 'paragraph',
          children: [{ text: 'Preferred Material: Adopting high-quality aircraft carrier-grade stainless steel with excellent corrosion resistance and load-bearing capacity, adapting to a variety of indoor and outdoor environments.' }]
        },
        { type: 'divider', children: [{ text: '' }] },
        { type: 'blockquote', children: [{ type: 'code', children: [{ text: 'Safety Performance' }] }] },
        {
          type: 'paragraph',
          children: [{ text: 'Ultra-Strong Load-Bearing: Each Glass Standoff has a super strong weight-bearing capacity that meets international standards and has been repeatedly tested to ensure long-term stability without loosening.' }]
        }
      ],
      zh: [
        { type: 'paragraph', children: [{ text: '' }] },
        { type: 'blockquote', children: [{ type: 'code', children: [{ text: '产品描述' }] }] },
        {
          type: 'paragraph',
          children: [{ text: 'Busrom时尚可调节玻璃广告螺丝系列源于工艺灵感和美学简约,为各类玻璃面板的固定提供安全、可靠且现代的解决方案。' }]
        },
        { type: 'divider', children: [{ text: '' }] },
        { type: 'blockquote', children: [{ type: 'code', children: [{ text: '材质与工艺' }] }] },
        {
          type: 'paragraph',
          children: [{ text: '首选材质:采用优质航母级不锈钢,具有出色的耐腐蚀性和承重能力,适应各种室内外环境。' }]
        },
        { type: 'divider', children: [{ text: '' }] },
        { type: 'blockquote', children: [{ type: 'code', children: [{ text: '安全性能' }] }] },
        {
          type: 'paragraph',
          children: [{ text: '超强承重:每个玻璃广告螺丝都具有超强的承重能力,符合国际标准,经过反复测试,确保长期稳定不松动。' }]
        }
      ]
    }
  },
  {
    seriesId: '9f60d428-8830-4083-b981-6cc50d83c7c8',
    seriesNameEn: 'Glass Connected Fitting',
    seriesNameZh: '玻璃栏杆扶手连接件',
    skuPrefix: 'GCF',
    namePrefix: { en: 'Glass Connected Fitting', zh: '玻璃栏杆扶手连接件' },
    shortDesc: {
      en: 'Eco-friendly durable stair fence glass connected fitting for modern architecture.',
      zh: '环保耐用的楼梯栅栏玻璃连接件,适用于现代建筑。'
    },
    content: {
      en: [
        { type: 'paragraph', children: [{ text: '' }] },
        { type: 'blockquote', children: [{ type: 'code', children: [{ text: 'Product Description' }] }] },
        {
          type: 'paragraph',
          children: [{ text: 'Busrom glass connected fitting, which is specially designed for the assembly of multiple glass panels, covers a variety of modular fittings such as right-angled pieces, T-pieces, cross pieces and adjustable joints.' }]
        },
        { type: 'divider', children: [{ text: '' }] },
        { type: 'blockquote', children: [{ type: 'code', children: [{ text: 'Eco-Friendly Material' }] }] },
        {
          type: 'paragraph',
          children: [{ text: 'High-strength aluminum alloys that comply with RoHS and REACH standards are used, and 100% of the raw materials can be recycled and reused.' }]
        }
      ],
      zh: [
        { type: 'paragraph', children: [{ text: '' }] },
        { type: 'blockquote', children: [{ type: 'code', children: [{ text: '产品描述' }] }] },
        {
          type: 'paragraph',
          children: [{ text: 'Busrom玻璃连接件专为多块玻璃面板的组装设计,涵盖直角件、T型件、十字件和可调节接头等多种模块化配件。' }]
        },
        { type: 'divider', children: [{ text: '' }] },
        { type: 'blockquote', children: [{ type: 'code', children: [{ text: '环保材质' }] }] },
        {
          type: 'paragraph',
          children: [{ text: '采用符合RoHS和REACH标准的高强度铝合金,100%原材料可回收再利用,减少资源浪费。' }]
        }
      ]
    }
  },
  {
    seriesId: 'f903bd99-a6ba-473f-830d-58bc49120969',
    seriesNameEn: 'Glass Fence Spigot',
    seriesNameZh: '玻璃护栏支架底座',
    skuPrefix: 'GFS',
    namePrefix: { en: 'Glass Fence Spigot', zh: '玻璃护栏支架底座' },
    shortDesc: {
      en: 'Luxury weatherproof glass fence spigot for high-end outdoor and indoor systems.',
      zh: '豪华防风雨玻璃护栏支架底座,适用于高端室内外系统。'
    },
    content: {
      en: [
        { type: 'paragraph', children: [{ text: '' }] },
        { type: 'blockquote', children: [{ type: 'code', children: [{ text: 'Product Description' }] }] },
        {
          type: 'paragraph',
          children: [{ text: 'Designed for high-end outdoor and indoor glass balustrade systems, Busrom Glass Fence Spigot combines robust construction with elegant styling.' }]
        }
      ],
      zh: [
        { type: 'paragraph', children: [{ text: '' }] },
        { type: 'blockquote', children: [{ type: 'code', children: [{ text: '产品描述' }] }] },
        {
          type: 'paragraph',
          children: [{ text: '专为高端室内外玻璃栏杆系统设计,Busrom玻璃护栏支架底座结合坚固的结构和优雅的造型。' }]
        }
      ]
    }
  },
  {
    seriesId: 'f8f37547-4c30-447d-bdbd-016bd5516ed9',
    seriesNameEn: 'Guardrail Glass Clip',
    seriesNameZh: '护栏系列',
    skuPrefix: 'GGC',
    namePrefix: { en: 'Guardrail Glass Clip', zh: '护栏玻璃夹' },
    shortDesc: {
      en: 'Modern stainless steel glass clip for guardrail and staircase applications.',
      zh: '现代不锈钢玻璃夹,适用于护栏和楼梯应用。'
    },
    content: {
      en: [
        { type: 'paragraph', children: [{ text: '' }] },
        { type: 'blockquote', children: [{ type: 'code', children: [{ text: 'Product Description' }] }] },
        {
          type: 'paragraph',
          children: [{ text: 'The Busrom Glass Clip Series is designed for modern architectural spaces, offering the safest, most reliable solution for fixing glass panels.' }]
        }
      ],
      zh: [
        { type: 'paragraph', children: [{ text: '' }] },
        { type: 'blockquote', children: [{ type: 'code', children: [{ text: '产品描述' }] }] },
        {
          type: 'paragraph',
          children: [{ text: 'Busrom玻璃夹系列专为现代建筑空间设计,以卓越的质量提供最安全、最可靠的玻璃面板固定解决方案。' }]
        }
      ]
    }
  },
  {
    seriesId: 'ba511efd-2567-4b36-a14d-2c368eb219f7',
    seriesNameEn: 'Bathroom Glass Clip',
    seriesNameZh: '浴室系列',
    skuPrefix: 'BGC',
    namePrefix: { en: 'Bathroom Glass Clip', zh: '浴室玻璃夹' },
    shortDesc: {
      en: 'Modern stainless steel glass clip for bathroom and shower applications.',
      zh: '现代不锈钢玻璃夹,适用于浴室和淋浴应用。'
    },
    content: {
      en: [
        { type: 'paragraph', children: [{ text: '' }] },
        { type: 'blockquote', children: [{ type: 'code', children: [{ text: 'Product Description' }] }] },
        {
          type: 'paragraph',
          children: [{ text: 'The Busrom Glass Clip Series is designed for modern bathrooms with superior quality and craftsmanship.' }]
        }
      ],
      zh: [
        { type: 'paragraph', children: [{ text: '' }] },
        { type: 'blockquote', children: [{ type: 'code', children: [{ text: '产品描述' }] }] },
        {
          type: 'paragraph',
          children: [{ text: 'Busrom玻璃夹系列专为现代浴室设计,以卓越的质量和工艺。' }]
        }
      ]
    }
  },
  {
    seriesId: '3a9325e4-bf14-4e34-9dea-2c8bd1379cd9',
    seriesNameEn: 'Glass Hinge',
    seriesNameZh: '浴室夹',
    skuPrefix: 'GH',
    namePrefix: { en: 'Glass Hinge', zh: '玻璃铰链' },
    shortDesc: {
      en: 'Durable anti-moisture and anti-corrosion glass hinge for shower enclosures.',
      zh: '耐用防潮防腐玻璃铰链,适用于淋浴房。'
    },
    content: {
      en: [
        { type: 'paragraph', children: [{ text: '' }] },
        { type: 'blockquote', children: [{ type: 'code', children: [{ text: 'Product Description' }] }] },
        {
          type: 'paragraph',
          children: [{ text: 'Designed for high-frequency use and wet environments, the Busrom Glass Hinge Series combines superior durability with a quiet experience.' }]
        }
      ],
      zh: [
        { type: 'paragraph', children: [{ text: '' }] },
        { type: 'blockquote', children: [{ type: 'code', children: [{ text: '产品描述' }] }] },
        {
          type: 'paragraph',
          children: [{ text: '专为高频使用和潮湿环境设计,Busrom玻璃铰链系列结合卓越的耐用性和安静的体验。' }]
        }
      ]
    }
  },
  {
    seriesId: 'a61a6f29-a8a2-4f57-924b-52648dd918e4',
    seriesNameEn: 'Sliding Door Kit',
    seriesNameZh: '移门滑轮套装',
    skuPrefix: 'SDK',
    namePrefix: { en: 'Sliding Door Kit', zh: '移门滑轮套装' },
    shortDesc: {
      en: 'Luxury frameless glass sliding door kit for modern spaces.',
      zh: '豪华无框玻璃移门套装,适用于现代空间。'
    },
    content: {
      en: [
        { type: 'paragraph', children: [{ text: '' }] },
        { type: 'blockquote', children: [{ type: 'code', children: [{ text: 'Product Description' }] }] },
        {
          type: 'paragraph',
          children: [{ text: 'Busrom Sliding Door Kit is designed for spaces that pursue minimalist luxury and high-end quality.' }]
        }
      ],
      zh: [
        { type: 'paragraph', children: [{ text: '' }] },
        { type: 'blockquote', children: [{ type: 'code', children: [{ text: '产品描述' }] }] },
        {
          type: 'paragraph',
          children: [{ text: 'Busrom移门滑轮套装专为追求极简奢华和高端品质的空间设计。' }]
        }
      ]
    }
  },
  {
    seriesId: 'ec3c3299-f70f-4d33-974f-4e3b9e628c19',
    seriesNameEn: 'Bathroom & Door Handle',
    seriesNameZh: '浴室&大门拉手',
    skuPrefix: 'BDH',
    namePrefix: { en: 'Bathroom & Door Handle', zh: '浴室&大门拉手' },
    shortDesc: {
      en: 'Modern minimalist bathroom and door handle with ergonomic design.',
      zh: '现代极简浴室及大门拉手,符合人体工学设计。'
    },
    content: {
      en: [
        { type: 'paragraph', children: [{ text: '' }] },
        { type: 'blockquote', children: [{ type: 'code', children: [{ text: 'Product Description' }] }] },
        {
          type: 'paragraph',
          children: [{ text: 'Busrom Bathroom & Door Handle combines clean lines and exquisite details to create a minimalist and luxurious handle experience for bathroom spaces and main doors.' }]
        }
      ],
      zh: [
        { type: 'paragraph', children: [{ text: '' }] },
        { type: 'blockquote', children: [{ type: 'code', children: [{ text: '产品描述' }] }] },
        {
          type: 'paragraph',
          children: [{ text: 'Busrom浴室&大门拉手结合简洁的线条和精致的细节,为浴室空间及大门打造极简奢华的拉手体验。' }]
        }
      ]
    }
  },
  {
    seriesId: 'b02e4dd7-170b-46e1-a478-31543b8a33f8',
    seriesNameEn: 'Hidden Hook',
    seriesNameZh: '挂钩',
    skuPrefix: 'HH',
    namePrefix: { en: 'Hidden Hook', zh: '隐藏挂钩' },
    shortDesc: {
      en: 'High-end decorative rotating hidden hook for modern spaces.',
      zh: '高端装饰旋转隐藏挂钩,适用于现代空间。'
    },
    content: {
      en: [
        { type: 'paragraph', children: [{ text: '' }] },
        { type: 'blockquote', children: [{ type: 'code', children: [{ text: 'Product Description' }] }] },
        {
          type: 'paragraph',
          children: [{ text: 'Busrom Hidden Hook breaks the traditional design with its minimalist screwless shape and intelligent rotating mechanism.' }]
        }
      ],
      zh: [
        { type: 'paragraph', children: [{ text: '' }] },
        { type: 'blockquote', children: [{ type: 'code', children: [{ text: '产品描述' }] }] },
        {
          type: 'paragraph',
          children: [{ text: 'Busrom隐藏挂钩以其极简无螺丝造型和智能旋转机制打破传统设计。' }]
        }
      ]
    }
  }
]

// 表面处理选项
const surfaceFinishes = ['Brushed', 'Mirror', 'Matte Black', 'Titanium', 'Rose Gold', 'Black Titanium']
const surfaceFinishesZh = ['拉丝', '镜光', '哑黑', '钛金', '玫瑰金', '黑钛']

// 材质选项
const materials = ['304 Stainless Steel', '316 Stainless Steel', 'Brass', 'Aluminum Alloy']
const materialsZh = ['304不锈钢', '316不锈钢', '黄铜', '铝合金']

// 生成产品数据
function generateProducts() {
  const products = []

  for (let seriesIndex = 0; seriesIndex < seriesConfig.length; seriesIndex++) {
    const series = seriesConfig[seriesIndex]

    for (let i = 1; i <= 10; i++) {
      const surfaceFinishIndex = (i - 1) % surfaceFinishes.length
      const materialIndex = Math.floor((i - 1) / 2) % materials.length

      const sku = `${series.skuPrefix}-${String(i).padStart(3, '0')}`
      const slug = `${series.skuPrefix.toLowerCase()}-${String(i).padStart(3, '0')}`

      const product = {
        sku,
        slug,
        name: {
          en: `${series.namePrefix.en} Model ${i}`,
          zh: `${series.namePrefix.zh}型号${i}`
        },
        shortDescription: series.shortDesc,
        description: {}, // 前端暂时不用full description
        attributes: {
          en: [
            { key: 'Brand', value: 'Busrom', isShow: true },
            { key: 'Product Series', value: series.seriesNameEn, isShow: true },
            { key: 'Model', value: `Model ${i}`, isShow: true },
            { key: 'Material', value: materials[materialIndex], isShow: true },
            { key: 'Surface Finish', value: surfaceFinishes[surfaceFinishIndex], isShow: true },
            { key: 'Glass Thickness', value: '8-12mm', isShow: true }
          ],
          zh: [
            { key: '品牌', value: 'Busrom', isShow: true },
            { key: '产品系列', value: series.seriesNameZh, isShow: true },
            { key: '型号', value: `型号${i}`, isShow: true },
            { key: '材质', value: materialsZh[materialIndex], isShow: true },
            { key: '表面处理', value: surfaceFinishesZh[surfaceFinishIndex], isShow: true },
            { key: '玻璃厚度', value: '8-12mm', isShow: true }
          ]
        },
        specifications: {},
        showImage: null,
        mainImage: null,
        series: series.seriesId,
        isFeatured: i <= 2, // 每个系列前2个设为推荐
        order: seriesIndex * 10 + i,
        status: 'PUBLISHED',
        contentTranslations: {
          en: series.content.en,
          zh: series.content.zh
        }
      }

      products.push(product)
    }
  }

  return products
}

async function main() {
  console.log('🚀 开始批量创建产品...\n')

  const products = generateProducts()
  let successCount = 0
  let errorCount = 0

  for (const productData of products) {
    try {
      // 创建产品
      const product = await prisma.product.create({
        data: {
          sku: productData.sku,
          slug: productData.slug,
          name: productData.name,
          shortDescription: productData.shortDescription,
          description: productData.description,
          attributes: productData.attributes,
          specifications: productData.specifications,
          showImage: productData.showImage,
          mainImage: productData.mainImage,
          series: {
            connect: { id: productData.series }
          },
          isFeatured: productData.isFeatured,
          order: productData.order,
          status: productData.status
        }
      })

      // 创建contentTranslations - 英文
      await prisma.productContentTranslation.create({
        data: {
          locale: 'en',
          content: productData.contentTranslations.en,
          product: {
            connect: { id: product.id }
          }
        }
      })

      // 创建contentTranslations - 中文
      await prisma.productContentTranslation.create({
        data: {
          locale: 'zh',
          content: productData.contentTranslations.zh,
          product: {
            connect: { id: product.id }
          }
        }
      })

      successCount++
      console.log(`✅ 成功创建产品: ${productData.sku} (${successCount}/${products.length})`)
    } catch (error) {
      errorCount++
      console.error(`❌ 创建产品失败: ${productData.sku}`)
      console.error(error)
    }
  }

  console.log('\n📊 批量创建完成!')
  console.log(`✅ 成功: ${successCount}`)
  console.log(`❌ 失败: ${errorCount}`)
  console.log(`📦 总计: ${products.length}`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
