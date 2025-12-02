/**
 * 批量创建产品脚本 V2 - 正确的contentTranslation结构
 */

const { PrismaClient } = require('../node_modules/.prisma/client')
const prisma = new PrismaClient()

const FORM_CONFIG_ID = 'be109138-9057-4a52-8857-da94d9d49055'

// 创建标准contentTranslation结构
function createContent(locale, desc, tech, delivery, assembly, detail) {
  const labels = locale === 'zh' ? 
    { describe: '描述', technical: '技术信息', deliver: '送货', assembly: '集会', detail: 'Detail' } :
    { describe: 'describe', technical: 'Technical Information', deliver: 'deliver goods', assembly: 'assembly', detail: 'Detail' }
  
  const splicedText = locale === 'zh' ? '会在底部拼接' : 'It will be spliced at the bottom.'
  const detailPageText = locale === 'zh' ? 
    '表单之前的内容用弹窗的形式展现,表单之后的按详情页板块形式展现。' :
    'The content before the form is displayed in a pop-up window, and the content after the form is displayed in the form of a details page section.'
  
  return [
    { type: 'paragraph', children: [{ text: '' }] },
    { type: 'blockquote', children: [{ type: 'code', children: [{ text: labels.describe }] }] },
    { type: 'paragraph', children: [{ text: desc }] },
    { type: 'divider', children: [{ text: '' }] },
    { type: 'blockquote', children: [{ type: 'code', children: [{ text: labels.technical }] }] },
    { type: 'paragraph', children: [{ text: tech }] },
    { type: 'paragraph', children: [{ text: splicedText }, { bold: true, text: 'Product Attributes' }] },
    { type: 'divider', children: [{ text: '' }] },
    { type: 'blockquote', children: [{ type: 'code', children: [{ text: labels.deliver }] }] },
    { type: 'paragraph', children: [{ text: delivery }] },
    { type: 'divider', children: [{ text: '' }] },
    { type: 'blockquote', children: [{ type: 'code', children: [{ text: labels.assembly }] }] },
    { type: 'paragraph', children: [{ text: assembly }] },
    { type: 'divider', children: [{ text: '' }] },
    {
      type: 'component-block',
      props: { formConfig: { id: FORM_CONFIG_ID } },
      children: [{ type: 'component-inline-prop', children: [{ text: '' }] }],
      component: 'formBlock'
    },
    { type: 'divider', children: [{ text: '' }] },
    { type: 'blockquote', children: [{ type: 'code', children: [{ text: labels.detail }] }] },
    { type: 'paragraph', children: [{ text: detailPageText }] },
    { type: 'paragraph', children: [{ text: detail }] }
  ]
}

const seriesData = [
  {
    id: 'e6d7094b-a6ed-4ad1-978f-c27f1c6fee2e',
    prefix: 'GS',
    nameEn: 'Glass Standoff',
    nameZh: '玻璃广告螺丝',
    shortEn: 'Stylish adjustable glass standoff for modern glass panel installation.',
    shortZh: '时尚可调节玻璃广告螺丝,适用于现代玻璃面板安装。',
    descEn: 'The Busrom stylish adjustable glass standoff series is inspired by craftsmanship and aesthetic simplicity.',
    descZh: 'Busrom时尚可调节玻璃广告螺丝系列源于工艺灵感和美学简约。',
    techEn: 'Adopting high-quality aircraft carrier-grade stainless steel with excellent corrosion resistance.',
    techZh: '采用优质航母级不锈钢,具有出色的耐腐蚀性和承重能力。',
    deliveryEn: 'Fast delivery within 3-7 business days. All products are carefully packaged.',
    deliveryZh: '3-7个工作日内快速发货。所有产品均经过精心包装。',
    assemblyEn: 'Easy installation with included mounting hardware. No special tools required.',
    assemblyZh: '安装简便,附带安装五金件。无需特殊工具。',
    detailEn: 'Ultra-Strong Load-Bearing capacity meets international standards. Suitable for Glass Curtain Wall System.',
    detailZh: '超强承重能力符合国际标准。适用于玻璃幕墙系统。'
  },
  {
    id: '9f60d428-8830-4083-b981-6cc50d83c7c8',
    prefix: 'GCF',
    nameEn: 'Glass Connected Fitting',
    nameZh: '玻璃栏杆扶手连接件',
    shortEn: 'Eco-friendly durable stair fence glass connected fitting.',
    shortZh: '环保耐用的楼梯栅栏玻璃连接件。',
    descEn: 'Busrom glass connected fitting covers various modular fittings for flexible assembly.',
    descZh: 'Busrom玻璃连接件涵盖多种模块化配件,可灵活组装。',
    techEn: 'High-strength aluminum alloys complying with RoHS and REACH standards.',
    techZh: '采用符合RoHS和REACH标准的高强度铝合金。',
    deliveryEn: 'Standard shipping 5-10 business days. Expedited options available.',
    deliveryZh: '标准运输5-10个工作日。可选加急选项。',
    assemblyEn: 'Modular design allows quick assembly without professional tools.',
    assemblyZh: '模块化设计允许无需专业工具快速组装。',
    detailEn: 'Superior load-bearing with anti-loosening design. For staircase guardrail and partitions.',
    detailZh: '卓越承重和防松脱设计。适用于楼梯护栏和隔断。'
  },
  {
    id: 'f903bd99-a6ba-473f-830d-58bc49120969',
    prefix: 'GFS',
    nameEn: 'Glass Fence Spigot',
    nameZh: '玻璃护栏支架底座',
    shortEn: 'Luxury weatherproof glass fence spigot.',
    shortZh: '豪华防风雨玻璃护栏支架底座。',
    descEn: 'Designed for high-end outdoor and indoor glass balustrade systems.',
    descZh: '专为高端室内外玻璃栏杆系统设计。',
    techEn: 'High-Strength base with special heat treatment.',
    techZh: '高强度底座,采用特殊热处理。',
    deliveryEn: 'Premium packaging. Delivery in 7-14 business days.',
    deliveryZh: '高级包装。7-14个工作日内交付。',
    assemblyEn: 'Professional installation recommended.',
    assemblyZh: '建议专业安装。',
    detailEn: 'Waterproofing design for outdoor use. Perfect for gardens and pools.',
    detailZh: '防水设计,适用于户外。适用于花园和泳池。'
  },
  {
    id: 'f8f37547-4c30-447d-bdbd-016bd5516ed9',
    prefix: 'GGC',
    nameEn: 'Guardrail Glass Clip',
    nameZh: '护栏玻璃夹',
    shortEn: 'Modern stainless steel glass clip.',
    shortZh: '现代不锈钢玻璃夹。',
    descEn: 'Safe and reliable solution for fixing glass panels.',
    descZh: '安全可靠的玻璃面板固定解决方案。',
    techEn: 'Aviation-grade stainless steel with ±0.05mm tolerance.',
    techZh: '航空级不锈钢,公差±0.05mm。',
    deliveryEn: 'Quick shipping within 3-5 business days.',
    deliveryZh: '3-5个工作日内快速发货。',
    assemblyEn: 'Simple installation with anti-slip pads.',
    assemblyZh: '防滑垫设计,安装简单。',
    detailEn: 'Superior weight-bearing. For stairs and fences.',
    detailZh: '超强承重。适用于楼梯和栏杆。'
  },
  {
    id: 'ba511efd-2567-4b36-a14d-2c368eb219f7',
    prefix: 'BGC',
    nameEn: 'Bathroom Glass Clip',
    nameZh: '浴室玻璃夹',
    shortEn: 'Glass clip for bathroom applications.',
    shortZh: '浴室应用玻璃夹。',
    descEn: 'Designed for modern bathrooms with superior quality.',
    descZh: '专为现代浴室设计,质量卓越。',
    techEn: 'Corrosion resistant for humid environments.',
    techZh: '耐腐蚀,适用于潮湿环境。',
    deliveryEn: 'Waterproof packaging. 4-7 business days.',
    deliveryZh: '防水包装。4-7个工作日。',
    assemblyEn: 'Frameless effect achievable.',
    assemblyZh: '可实现无框效果。',
    detailEn: 'Tested for wet environment performance. 6-12mm glass.',
    detailZh: '经过潮湿环境性能测试。6-12mm玻璃。'
  },
  {
    id: '3a9325e4-bf14-4e34-9dea-2c8bd1379cd9',
    prefix: 'GH',
    nameEn: 'Glass Hinge',
    nameZh: '玻璃铰链',
    shortEn: 'Durable glass hinge for shower enclosures.',
    shortZh: '耐用玻璃铰链,适用于淋浴房。',
    descEn: 'Perfect for shower enclosures with quiet operation.',
    descZh: '淋浴房完美搭配,静音操作。',
    techEn: 'Medical grade stainless steel with anti-corrosion treatment.',
    techZh: '医用级不锈钢,防腐处理。',
    deliveryEn: 'Secure packaging. 5-8 business days.',
    deliveryZh: '安全包装。5-8个工作日。',
    assemblyEn: 'Built-in cushioning for smooth closing.',
    assemblyZh: '内置缓冲,平稳关闭。',
    detailEn: 'Over 200,000 cycles tested. For shower and glass doors.',
    detailZh: '超过20万次循环测试。适用于淋浴和玻璃门。'
  },
  {
    id: 'a61a6f29-a8a2-4f57-924b-52648dd918e4',
    prefix: 'SDK',
    nameEn: 'Sliding Door Kit',
    nameZh: '移门滑轮套装',
    shortEn: 'Luxury frameless glass sliding door kit.',
    shortZh: '豪华无框玻璃移门套装。',
    descEn: 'For minimalist luxury spaces with visual transparency.',
    descZh: '为极简奢华空间设计,视觉通透。',
    techEn: 'Silent roller with imported bearings.',
    techZh: '静音滚轮,进口轴承。',
    deliveryEn: 'Complete kit. 7-10 business days.',
    deliveryZh: '套装完整。7-10个工作日。',
    assemblyEn: 'Hidden installation design.',
    assemblyZh: '隐藏式安装设计。',
    detailEn: 'Smooth silent operation. For shower and partitions.',
    detailZh: '平滑静音操作。适用于淋浴和隔断。'
  },
  {
    id: 'ec3c3299-f70f-4d33-974f-4e3b9e628c19',
    prefix: 'BDH',
    nameEn: 'Bathroom & Door Handle',
    nameZh: '浴室&大门拉手',
    shortEn: 'Minimalist bathroom and door handle with ergonomic design.',
    shortZh: '极简浴室及大门拉手,人体工学设计。',
    descEn: 'Clean lines and exquisite details for bathroom spaces and main doors.',
    descZh: '简洁线条和精致细节,为浴室空间及大门。',
    techEn: 'Aviation-grade stainless steel. Multiple finishes available.',
    techZh: '航空级不锈钢。多种表面处理可选。',
    deliveryEn: 'Protective packaging. 4-6 business days.',
    deliveryZh: '保护性包装。4-6个工作日。',
    assemblyEn: '22° grip angle ergonomic design.',
    assemblyZh: '22°握持角度人体工学设计。',
    detailEn: 'Weatherability tested. For shower, bathroom and main doors.',
    detailZh: '耐候性测试。适用于淋浴、浴室和大门。'
  },
  {
    id: 'b02e4dd7-170b-46e1-a478-31543b8a33f8',
    prefix: 'HH',
    nameEn: 'Hidden Hook',
    nameZh: '隐藏挂钩',
    shortEn: 'High-end rotating hidden hook.',
    shortZh: '高端旋转隐藏挂钩。',
    descEn: 'Minimalist screwless shape perfectly hidden in the wall.',
    descZh: '极简无螺丝造型,完美隐藏在墙壁中。',
    techEn: 'Precision-cast stainless steel with silent rotation.',
    techZh: '精密铸造不锈钢,静音旋转。',
    deliveryEn: 'Individual packaging. 3-5 business days.',
    deliveryZh: '独立包装。3-5个工作日。',
    assemblyEn: 'Invisible integration flush with wall.',
    assemblyZh: '与墙面齐平的隐形融合。',
    detailEn: 'Supports over 90kg weight. For checkrooms and bathrooms.',
    detailZh: '支持超过90kg重量。适用于衣帽间和浴室。'
  },
]

const materials = ['304 Stainless Steel', '316 Stainless Steel', 'Brass', 'Aluminum Alloy']
const materialsZh = ['304不锈钢', '316不锈钢', '黄铜', '铝合金']
const finishes = ['Brushed', 'Mirror', 'Matte Black', 'Titanium', 'Rose Gold', 'Black Titanium']
const finishesZh = ['拉丝', '镜光', '哑黑', '钛金', '玫瑰金', '黑钛']

function generateProducts() {
  const products = []
  seriesData.forEach((s, idx) => {
    for (let i = 1; i <= 10; i++) {
      const finishIdx = (i - 1) % finishes.length
      const materialIdx = Math.floor((i - 1) / 2) % materials.length
      products.push({
        sku: `${s.prefix}-${String(i).padStart(3, '0')}`,
        slug: `${s.prefix.toLowerCase()}-${String(i).padStart(3, '0')}`,
        name: { en: `${s.nameEn} Model ${i}`, zh: `${s.nameZh}型号${i}` },
        shortDescription: { en: s.shortEn, zh: s.shortZh },
        description: {},
        attributes: {
          en: [
            { key: 'Brand', value: 'Busrom', isShow: true },
            { key: 'Product Series', value: s.nameEn, isShow: true },
            { key: 'Model', value: `Model ${i}`, isShow: true },
            { key: 'Material', value: materials[materialIdx], isShow: true },
            { key: 'Surface Finish', value: finishes[finishIdx], isShow: true },
            { key: 'Glass Thickness', value: '8-12mm', isShow: true }
          ],
          zh: [
            { key: '品牌', value: 'Busrom', isShow: true },
            { key: '产品系列', value: s.nameZh, isShow: true },
            { key: '型号', value: `型号${i}`, isShow: true },
            { key: '材质', value: materialsZh[materialIdx], isShow: true },
            { key: '表面处理', value: finishesZh[finishIdx], isShow: true },
            { key: '玻璃厚度', value: '8-12mm', isShow: true }
          ]
        },
        specifications: {},
        showImage: null,
        mainImage: null,
        series: s.id,
        isFeatured: i <= 2,
        order: idx * 10 + i,
        status: 'PUBLISHED',
        contentEn: createContent('en', s.descEn, s.techEn, s.deliveryEn, s.assemblyEn, s.detailEn),
        contentZh: createContent('zh', s.descZh, s.techZh, s.deliveryZh, s.assemblyZh, s.detailZh)
      })
    }
  })
  return products
}

async function main() {
  console.log('🚀 开始批量创建产品...\n')
  const products = generateProducts()
  let successCount = 0, errorCount = 0
  
  for (const p of products) {
    try {
      const product = await prisma.product.create({
        data: {
          sku: p.sku, slug: p.slug, name: p.name, shortDescription: p.shortDescription,
          description: p.description, attributes: p.attributes, specifications: p.specifications,
          showImage: p.showImage, mainImage: p.mainImage, isFeatured: p.isFeatured,
          order: p.order, status: p.status, series: { connect: { id: p.series } }
        }
      })
      await prisma.productContentTranslation.create({
        data: { locale: 'en', content: p.contentEn, product: { connect: { id: product.id } } }
      })
      await prisma.productContentTranslation.create({
        data: { locale: 'zh', content: p.contentZh, product: { connect: { id: product.id } } }
      })
      successCount++
      console.log(`✅ ${p.sku} (${successCount}/${products.length})`)
    } catch (error) {
      errorCount++
      console.error(`❌ ${p.sku}:`, error.message)
    }
  }
  console.log(`\n📊 完成! ✅${successCount} ❌${errorCount} 📦${products.length}`)
}

main().then(() => prisma.$disconnect()).catch(e => { console.error(e); prisma.$disconnect(); process.exit(1) })

