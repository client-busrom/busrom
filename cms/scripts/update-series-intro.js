/**
 * Update SeriesIntro data in database
 *
 * Usage:
 *   DATABASE_URL="..." node scripts/update-series-intro.js
 */

const fetch = require('node-fetch')

const KEYSTONE_URL = process.env.KEYSTONE_URL || 'http://localhost:3000'

const seriesIntroData = [
  {
    productSeriesSlug: "glass-standoff",
    title: {en: "Glass Standoff", zh: "广告螺丝"},
    description: {
      en: "Designed for glass panel fixing, Busrom Glass Standoff Series is made of high strength stainless steel, precision CNC machined and polished, which not only ensures stable load bearing, but also has an elegant and modern metal texture. Widely used in curtain walls, partitions, stair railings and other scenarios, providing safe and reliable support for glass installation.",
      zh: "专为玻璃板固定而设计，博斯诺广告螺丝系列采用高强度不锈钢材质，经精密数控加工和抛光处理，不仅确保稳定的承重能力，还具有优雅现代的金属质感。广泛应用于幕墙、隔断、楼梯栏杆等场景，为玻璃安装提供安全可靠的支撑。"
    }
  },
  {
    productSeriesSlug: "glass-connected-fitting",
    title: {en: "Glass Connected Fitting", zh: "玻璃栏杆扶手连接件"},
    description: {
      en: "The Glass Connected Fitting Series provides flexible solutions for the assembly of multiple glass panels, including right angles, T-pieces, crosses and adjustable joints. The products adopt precision casting and turning technology, with high assembly precision and solid interface, and are widely used in glass curtain walls, staircase handrails and partitions.",
      zh: "玻璃栏杆扶手连接件系列为多块玻璃板的组装提供灵活的解决方案，包括直角、T型、十字型和可调节接头。产品采用精密铸造和车削技术，组装精度高，接口牢固，广泛应用于玻璃幕墙、楼梯扶手和隔断。"
    }
  },
  {
    productSeriesSlug: "glass-fence-spigot",
    title: {en: "Glass Fence Spigot", zh: "玻璃护栏支架底座"},
    description: {
      en: "Used in systems such as glass railings and fences, the Busrom Glass Fence Spigot features a thickened base design and high-strength bolted joints to provide superior resistance to bending and bursting. The multiple-plated or sandblasted surfaces resist rust and moisture and blend seamlessly with a variety of architectural styles.",
      zh: "用于玻璃栏杆和围栏等系统，博斯诺玻璃护栏支架底座采用加厚底座设计和高强度螺栓连接，提供卓越的抗弯曲和爆裂性能。多层电镀或喷砂表面处理可防锈防潮，与各种建筑风格完美融合。"
    }
  },
  {
    productSeriesSlug: "guardrail-glass-clip",
    title: {en: "Guardrail Glass Clip", zh: "护栏玻璃夹"},
    description: {
      en: "Busrom Guardrail Glass Clips are known for their simple and compact shape and precise clamping force. The product is made of aviation-grade stainless steel, which is passivated and coated through multiple passivation processes, taking into account both corrosion resistance and visual aesthetics. It is suitable for staircase guardrail, glass partition and other installation scenarios, easy to install and strong performance.",
      zh: "博斯诺护栏玻璃夹以其简洁紧凑的造型和精准的夹持力而闻名。产品采用航空级不锈钢材质，经过多道钝化工艺进行钝化和涂层处理，兼顾耐腐蚀性和视觉美观。适用于楼梯护栏、玻璃隔断等安装场景，安装方便，性能强劲。"
    }
  },
  {
    productSeriesSlug: "bathroom-glass-clip",
    title: {en: "Bathroom Glass Clip", zh: "浴室玻璃夹"},
    description: {
      en: "Busrom Bathroom Glass Clips are designed for bathroom environments with superior corrosion resistance and moisture protection. The product is made of aviation-grade stainless steel with specialized coating for humid conditions. Perfect for shower enclosures, bathroom partitions, and glass door installations.",
      zh: "博斯诺浴室玻璃夹专为浴室环境设计，具有卓越的耐腐蚀性和防潮保护。产品采用航空级不锈钢材质，配以专业的潮湿环境涂层处理。适用于淋浴房、浴室隔断和玻璃门安装。"
    }
  },
  {
    productSeriesSlug: "glass-hinge",
    title: {en: "Glass Hinge", zh: "玻璃铰链"},
    description: {
      en: "Busrom Glass Hinge Series is designed for shower enclosures and glass doors, with a built-in silent cushioning mechanism and stainless steel shaft to ensure smooth, noiseless opening and closing. The hinges are waterproof and rustproof to withstand frequent use and humid environments, providing both safety and durability.",
      zh: "博斯诺玻璃铰链系列专为淋浴房和玻璃门设计，内置静音缓冲机构和不锈钢轴芯，确保平滑、无噪音的开关操作。铰链具有防水防锈功能，可承受频繁使用和潮湿环境，兼具安全性和耐用性。"
    }
  },
  {
    productSeriesSlug: "sliding-door-kit",
    title: {en: "Sliding Door Kit", zh: "移门滑轮套装"},
    description: {
      en: "Busrom Sliding Door Kit integrates high-precision silent rollers, limiters, clamps, hooks and floor track guides, all components are made of high-quality aircraft grade stainless steel, to ensure the door is pushed and pulled smoothly and without shaking. It is suitable for sliding doors in bathrooms, shower rooms, interior partitions, and office scenarios.",
      zh: "博斯诺移门滑轮套装集成了高精度静音滚轮、限位器、夹具、挂钩和地轨导轨，所有组件均采用优质航空级不锈钢制成，确保推拉门平稳无晃动。适用于浴室、淋浴房、室内隔断和办公场景的移门。"
    }
  },
  {
    productSeriesSlug: "bathroom-door-handle",
    title: {en: "Bathroom & Door Handle", zh: "浴室及大门拉手"},
    description: {
      en: "Our Bathroom & Door Handle Series covers a wide range of shapes such as straight and curved, with materials ranging from brass to stainless steel available, and surface treatments supporting a variety of effects such as chrome plating, brushed, black titanium, and so on. Whether it's a shower door, interior sliding door, or exterior door, they all provide a comfortable grip and high-end texture.",
      zh: "我们的浴室及大门拉手系列涵盖直型、弯型等多种造型，材质从黄铜到不锈钢可选，表面处理支持电镀、拉丝、黑钛等多种效果。无论是淋浴门、室内移门还是外门，都能提供舒适的握感和高端质感。"
    }
  },
  {
    productSeriesSlug: "hidden-hook",
    title: {en: "Hidden Hook", zh: "隐藏式挂钩"},
    description: {
      en: "Busrom Hidden Hooks are cleverly integrated into the wall where you want them to be, with a simple, screwless appearance, silent and silent when opened, and blending in with the wall when closed. Suitable for checkrooms, bathrooms, entrance halls, display areas and other scenarios, taking into account the load-bearing capacity and aesthetic design, bringing a minimalist and practical storage experience to the space.",
      zh: "博斯诺隐藏式挂钩巧妙地融入您想要的墙面位置，外观简洁无螺丝，开启时静音无声，关闭时与墙面融为一体。适用于衣帽间、浴室、玄关、展示区等场景，兼顾承重能力和美学设计，为空间带来极简实用的收纳体验。"
    }
  }
]

async function graphqlRequest(query, variables = {}) {
  try {
    const response = await fetch(`${KEYSTONE_URL}/api/graphql`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables }),
    })
    const json = await response.json()
    if (json.errors) {
      throw new Error(`GraphQL Error: ${JSON.stringify(json.errors, null, 2)}`)
    }
    return json.data
  } catch (error) {
    console.error('GraphQL Request Failed:', error.message)
    throw error
  }
}

async function main() {
  console.log('Updating SeriesIntro data...')
  console.log(`Keystone URL: ${KEYSTONE_URL}\n`)

  // First, fetch all ProductSeries to get their IDs
  const seriesQuery = `
    query {
      productSeriesItems {
        id
        slug
      }
    }
  `
  const seriesResult = await graphqlRequest(seriesQuery)
  const seriesMap = {}
  seriesResult.productSeriesItems.forEach(series => {
    seriesMap[series.slug] = series.id
  })
  console.log('ProductSeries found:', Object.keys(seriesMap).join(', '))

  // Fetch existing SeriesIntro items
  const existingQuery = `
    query {
      seriesIntros {
        id
        internalLabel
        title
        productSeries {
          id
          slug
        }
      }
    }
  `
  const existingResult = await graphqlRequest(existingQuery)
  const existingItems = existingResult.seriesIntros || []
  console.log(`\nFound ${existingItems.length} existing SeriesIntro items`)

  // Create a map of productSeriesSlug -> existing SeriesIntro
  const existingMap = {}
  existingItems.forEach(item => {
    if (item.productSeries?.slug) {
      existingMap[item.productSeries.slug] = item
    }
  })

  let updated = 0
  let created = 0

  for (let i = 0; i < seriesIntroData.length; i++) {
    const item = seriesIntroData[i]
    const seriesId = seriesMap[item.productSeriesSlug]

    if (!seriesId) {
      console.log(`Skipping: ProductSeries '${item.productSeriesSlug}' not found`)
      continue
    }

    const existing = existingMap[item.productSeriesSlug]

    if (existing) {
      // Update existing
      const mutation = `
        mutation UpdateSeriesIntro($where: SeriesIntroWhereUniqueInput!, $data: SeriesIntroUpdateInput!) {
          updateSeriesIntro(where: $where, data: $data) {
            id
            internalLabel
          }
        }
      `

      try {
        await graphqlRequest(mutation, {
          where: { id: existing.id },
          data: {
            title: item.title,
            description: item.description,
          }
        })
        updated++
        console.log(`Updated: ${item.title.en}`)
      } catch (error) {
        console.error(`Failed to update: ${item.title.en}`, error.message)
      }
    } else {
      // Create new
      const mutation = `
        mutation CreateSeriesIntro($data: SeriesIntroCreateInput!) {
          createSeriesIntro(data: $data) {
            id
            internalLabel
          }
        }
      `

      try {
        await graphqlRequest(mutation, {
          data: {
            internalLabel: `${item.title.en} Series Introduction`,
            title: item.title,
            description: item.description,
            images: {tags: [], images: []},
            productSeries: { connect: { id: seriesId } },
            status: 'PUBLISHED',
          }
        })
        created++
        console.log(`Created: ${item.title.en}`)
      } catch (error) {
        console.error(`Failed to create: ${item.title.en}`, error.message)
      }
    }
  }

  console.log(`\nComplete! Updated: ${updated}, Created: ${created}`)
}

main().catch(console.error)
