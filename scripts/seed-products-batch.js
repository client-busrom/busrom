/**
 * Batch Product Seeding Script
 * Creates 10 products per series (90 total) with random attributes and images
 */

const GRAPHQL_ENDPOINT = process.env.CMS_URL || 'http://localhost:3000/api/graphql';

// Product Series data (from database)
const SERIES_DATA = [
  { id: 'e1022faa-c669-4156-869b-7cca8a857827', slug: 'glass-standoff', nameEn: 'Glass Standoff', nameZh: '广告螺丝', prefix: 'GS', mediaPrefix: 'glass-standoff' },
  { id: '95daf2d6-a271-4382-ac77-828a081802e8', slug: 'glass-connected-fitting', nameEn: 'Glass Connected Fitting', nameZh: '玻璃栏杆扶手连接件', prefix: 'GCF', mediaPrefix: 'glass-connected-fitting' },
  { id: '0416facf-0104-4ebd-828e-900bffbc6417', slug: 'glass-fence-spigot', nameEn: 'Glass Fence Spigot', nameZh: '玻璃护栏支架底座', prefix: 'GFS', mediaPrefix: 'glass-fence-spigot' },
  { id: 'b96a723f-1f59-400e-8f1b-0d294d238899', slug: 'guardrail-glass-clip', nameEn: 'Guardrail Glass Clip', nameZh: '护栏系列', prefix: 'GGC', mediaPrefix: 'guardrail-glass-clip' },
  { id: '0bd1d0f1-d6d3-4e61-a68e-c3661cdb18ff', slug: 'bathroom-glass-clip', nameEn: 'Bathroom Glass Clip', nameZh: '浴室系列', prefix: 'BGC', mediaPrefix: 'bathroom-glass-clip' },
  { id: 'fe29d76d-5d33-4947-a478-24872e4549b1', slug: 'glass-hinge', nameEn: 'Glass Hinge', nameZh: '浴室夹', prefix: 'GH', mediaPrefix: 'glass-hinge' },
  { id: 'b48d81ee-aef4-47b1-be54-8763ed0d2302', slug: 'sliding-door-kit', nameEn: 'Sliding Door Kit', nameZh: '移门滑轮套装', prefix: 'SDK', mediaPrefix: 'sliding-door-kit' },
  { id: 'd989ba5c-bf20-4b0f-878b-8898b318c767', slug: 'bathroom-door-handle', nameEn: 'Bathroom & Door Handle', nameZh: '浴室&大门拉手', prefix: 'BDH', mediaPrefix: 'bathroom-door-handle' },
  { id: '0da66122-a615-4815-a6b5-0ed8f8279953', slug: 'hidden-hook', nameEn: 'Hidden Hook', nameZh: '挂钩', prefix: 'HH', mediaPrefix: 'hidden-hook' },
];

// Random attribute options
const MATERIALS = [
  { en: '304 Stainless Steel', zh: '304不锈钢' },
  { en: '316 Stainless Steel', zh: '316不锈钢' },
  { en: 'Brass', zh: '黄铜' },
  { en: 'Aluminum Alloy', zh: '铝合金' },
  { en: 'Zinc Alloy', zh: '锌合金' },
];

const FINISHES = [
  { en: 'Brushed Silver', zh: '拉丝银' },
  { en: 'Mirror Polish', zh: '镜面抛光' },
  { en: 'Matte Black', zh: '哑光黑' },
  { en: 'Titanium Gold', zh: '钛金' },
  { en: 'Rose Gold', zh: '玫瑰金' },
  { en: 'Black Titanium', zh: '黑钛' },
  { en: 'Champagne Gold', zh: '香槟金' },
];

const GLASS_THICKNESS = ['6mm', '8mm', '10mm', '12mm', '15mm', '19mm'];
const LOAD_CAPACITY = ['50kg', '80kg', '100kg', '150kg', '200kg'];

// Product name templates per series
const PRODUCT_TEMPLATES = {
  'glass-standoff': [
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
  'glass-connected-fitting': [
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
  'glass-fence-spigot': [
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
  'guardrail-glass-clip': [
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
  'bathroom-glass-clip': [
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
  'glass-hinge': [
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
  'sliding-door-kit': [
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
  'bathroom-door-handle': [
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
  'hidden-hook': [
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
};

// Helper functions
function randomPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomPickN(arr, n) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
}

function generateSKU(prefix, index) {
  return `${prefix}-${String(index + 1).padStart(3, '0')}`;
}

function generateSlug(seriesSlug, index) {
  return `${seriesSlug}-${String(index + 1).padStart(3, '0')}`;
}

// Fetch all media files for a series
async function fetchMediaForSeries(mediaPrefix) {
  const query = `
    query {
      mediaFiles {
        id
        filename
        fileUrl
      }
    }
  `;

  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });

  const result = await response.json();
  if (result.errors) {
    console.error('Error fetching media:', result.errors);
    return [];
  }

  // Filter media by series prefix
  return result.data.mediaFiles.filter(m =>
    m.filename && m.filename.startsWith(mediaPrefix) && m.fileUrl
  );
}

async function createProduct(productData) {
  const mutation = `
    mutation CreateProduct($data: ProductCreateInput!) {
      createProduct(data: $data) {
        id
        sku
        name
      }
    }
  `;

  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: mutation,
      variables: { data: productData },
    }),
  });

  const result = await response.json();
  if (result.errors) {
    console.error('Error creating product:', result.errors);
    throw new Error(result.errors[0].message);
  }
  return result.data.createProduct;
}

async function main() {
  console.log('Starting batch product creation...\n');
  console.log('Fetching media files...');

  // Fetch all media first
  const allMedia = {};
  for (const series of SERIES_DATA) {
    const media = await fetchMediaForSeries(series.mediaPrefix);
    allMedia[series.slug] = media;
    console.log(`  ${series.nameEn}: ${media.length} images`);
  }

  let totalCreated = 0;

  for (const series of SERIES_DATA) {
    console.log(`\n=== Creating products for: ${series.nameEn} (${series.nameZh}) ===`);

    const templates = PRODUCT_TEMPLATES[series.slug];
    const seriesMedia = allMedia[series.slug] || [];

    // Separate white background images (for mainImage) and scene images (for showImage)
    const whiteImages = seriesMedia.filter(m => m.filename.includes('_white_'));
    const sceneImages = seriesMedia.filter(m => m.filename.includes('_scene_'));
    const allImages = seriesMedia.length > 0 ? seriesMedia : [];

    for (let i = 0; i < 10; i++) {
      const template = templates[i];
      const material = randomPick(MATERIALS);
      const finish = randomPick(FINISHES);
      const glassThickness = randomPick(GLASS_THICKNESS);
      const loadCapacity = randomPick(LOAD_CAPACITY);

      // Pick random images
      const mainImage = whiteImages.length > 0
        ? randomPick(whiteImages)
        : (allImages.length > 0 ? randomPick(allImages) : null);
      const showImage = sceneImages.length > 0
        ? randomPick(sceneImages)
        : (allImages.length > 0 ? randomPick(allImages) : null);

      const productData = {
        sku: generateSKU(series.prefix, i),
        slug: generateSlug(series.slug, i),
        name: JSON.stringify({ en: template.en, zh: template.zh }),
        shortDescription: JSON.stringify({
          en: `High-quality ${template.en.toLowerCase()} made from ${material.en.toLowerCase()} with ${finish.en.toLowerCase()} finish.`,
          zh: `采用${material.zh}材质，${finish.zh}表面处理的优质${template.zh}。`,
        }),
        description: JSON.stringify({
          en: `Premium ${template.en.toLowerCase()} from Busrom's ${series.nameEn} series. Crafted from durable ${material.en.toLowerCase()} with a beautiful ${finish.en.toLowerCase()} finish. Suitable for glass thickness ${glassThickness}. Load capacity: ${loadCapacity}. Perfect for modern architectural applications.`,
          zh: `Busrom ${series.nameZh}系列的优质${template.zh}。采用耐用的${material.zh}材质，配以精美的${finish.zh}表面处理。适用于${glassThickness}厚度的玻璃。承重能力：${loadCapacity}。完美适用于现代建筑应用。`,
        }),
        attributes: JSON.stringify({
          brand: { en: 'Busrom', zh: 'Busrom' },
          series: { en: series.nameEn, zh: series.nameZh },
          model: generateSKU(series.prefix, i),
          material: material,
          finish: finish,
          glassThickness: glassThickness,
          loadCapacity: loadCapacity,
        }),
        specifications: JSON.stringify({
          material: material,
          finish: finish,
          glassThickness: glassThickness,
          loadCapacity: loadCapacity,
          warranty: { en: '5 Years', zh: '5年质保' },
          origin: { en: 'China', zh: '中国' },
        }),
        series: { connect: { id: series.id } },
        isFeatured: i < 2, // First 2 products per series are featured
        order: i + 1,
        status: 'PUBLISHED',
      };

      // Add images if available
      if (mainImage) {
        productData.mainImage = JSON.stringify({ id: mainImage.id });
      }
      if (showImage) {
        productData.showImage = JSON.stringify({ id: showImage.id });
      }

      try {
        const created = await createProduct(productData);
        const imageSuffix = mainImage ? ` [img: ${mainImage.filename.substring(0, 30)}...]` : ' [no image]';
        console.log(`  Created: ${created.sku} - ${JSON.parse(created.name).en}${imageSuffix}`);
        totalCreated++;
      } catch (error) {
        console.error(`  Failed to create product ${i + 1}:`, error.message);
      }
    }
  }

  console.log(`\n=== Completed ===`);
  console.log(`Total products created: ${totalCreated}`);
}

main().catch(console.error);
