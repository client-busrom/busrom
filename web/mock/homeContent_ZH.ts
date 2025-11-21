/**
 * Busrom 网站 - 首页内容 (中文)
 * 数据结构遵循 REST API 规范
 */

// Helper function to create ImageObject
const createImageObject = (
  path: string,
  altText: string,
  options?: {
    hasThumbnail?: boolean;
    cropFocalPoint?: {x: number, y: number },
  }
): ImageObject => {
  const {
    hasThumbnail = false,
    cropFocalPoint = {x: 50, y: 50},
  } = options || {};

  // Ensure path starts with '/' for Next.js Image component
  const normalizedPath = path.startsWith('http://') || path.startsWith('https://') || path.startsWith('/')
    ? path
    : `/${path}`;

  return {
    // url: `https://s3.amazonaws.com/busrom/${path}`,
    url: normalizedPath,
    altText,
    ...(hasThumbnail &&
      (path.endsWith('.jpg') || path.endsWith('.png')) && {
        thumbnailUrl: `https://s3.amazonaws.com/busrom/${path.replace(
          /\.(jpg|png)$/,
          '-thumb.$1'
        )}`,
      }),
    cropFocalPoint,
  };
};

// ====================================================================
// 类型定义
// ====================================================================

/**
 * ImageObject - 统一的图片格式，支持 SEO 和焦点裁剪
 *
 * 焦点裁剪说明：
 * - cropFocalPoint: 图片的焦点位置，用于任意比例裁剪时保持焦点可见
 *   - x: 横向位置 (0-100)，0=最左，50=居中，100=最右
 *   - y: 纵向位置 (0-100)，0=最上，50=居中，100=最下
 *
 * 使用方法：
 * objectPosition: `${cropFocalPoint.x}% ${cropFocalPoint.y}%`
 */
interface ImageObject {
  url: string;
  altText: string;
  thumbnailUrl?: string;
  cropFocalPoint?: { x: number; y: number };
}

interface HeroBannerItem {
  title: string;
  features: string[];
  images: ImageObject[];
}

interface ProductSeriesItem {
  key: string;
  order: number;
  name: string;
  image: ImageObject;
  href: string;
}

interface ServiceFeature {
  title: string;
  shortTitle: string;
  description: string;
  images: ImageObject[];
}

interface ServiceFeaturesData {
  title: string;
  subtitle: string;
  features: ServiceFeature[];
}

interface SimpleCtaData {
  title: string;
  title2: string;
  subtitle: string;
  description: string;
  buttonText: string;
  images: ImageObject[];
}

interface SeriesIntroItem {
  title: string;
  description: string;
  images: ImageObject[];
  href: string;
}

interface FeaturedProduct {
  image: ImageObject;
  title: string;
  features: string[];
}

interface FeaturedProductSeries {
  seriesTitle: string;
  products: FeaturedProduct[];
}

interface FeaturedProductsData {
  title: string;
  description: string;
  viewAllButton: string;
  categories: string;
  series: FeaturedProductSeries[];
}

interface BrandAdvantagesData {
  advantages: string[];
  icons: string[];
  image: ImageObject;
}

interface OemOdmItem {
  title: string;
  bgImage: ImageObject;
  image: ImageObject;
  description: string[];
}

interface OemOdmData {
  oem: OemOdmItem;
  odm: OemOdmItem;
}

interface QuoteStep {
  text: string;
  image: ImageObject;
}

interface QuoteStepsData {
  title: string;
  title2: string;
  subtitle: string;
  description: string;
  steps: QuoteStep[];
}

interface MainFormData {
  placeholderName: string;
  placeholderEmail: string;
  placeholderWhatsapp: string;
  placeholderCompany: string;
  placeholderMessage: string;
  placeholderVerify: string;
  buttonText: string;
  designTextLeft: string;
  designTextRight: string;
  image1: ImageObject | null;
  image2: ImageObject | null;
}

interface WhyChooseReason {
  title: string;
  description: string;
  image: ImageObject;
}

interface WhyChooseBusromData {
  title: string;
  title2: string;
  reasons: WhyChooseReason[];
}

interface CaseStudyItem {
  series: string;
  slug: string;
  image: ImageObject;
}

interface CaseStudyApplication {
  items: CaseStudyItem[];
}

interface CaseStudiesData {
  title: string;
  description: string;
  applications: CaseStudyApplication[];
}

interface BrandAnalysisInfo {
  title: string;
  title2: string;
  text: string;
  text2: string;
}

interface BrandCenter {
  title: string;
  description: string;
}

interface BrandAnalysisData {
  analysis: BrandAnalysisInfo;
  centers: BrandCenter[];
}

interface BrandValueItem {
  title: string;
  description: string;
  image: ImageObject;
}

interface BrandValueData {
  title: string;
  subtitle: string;
  param1: BrandValueItem;
  param2: BrandValueItem;
  slogan: BrandValueItem;
  value: BrandValueItem;
  vision: BrandValueItem;
}

interface FooterFormConfig {
  title: string;
  placeholders: {
    name: string;
    email: string;
    message: string;
  };
  buttonText: string;
}

interface FooterContactInfo {
  title: string;
  emailLabel: string;
  email: string;
  afterSalesLabel: string;
  afterSales: string;
  whatsappLabel: string;
  whatsapp: string;
}

interface FooterNotice {
  title: string;
  lines: string[];
}

interface FooterData {
  form: FooterFormConfig;
  contact: FooterContactInfo;
  notice: FooterNotice;
}

interface HomeContentData {
  locale: string;
  heroBanner: HeroBannerItem[];
  productSeriesCarousel: ProductSeriesItem[];
  serviceFeatures: ServiceFeaturesData;
  sphere3d: Record<string, never>;
  simpleCta: SimpleCtaData;
  seriesIntro: SeriesIntroItem[];
  featuredProducts: FeaturedProductsData;
  brandAdvantages: BrandAdvantagesData;
  oemOdm: OemOdmData;
  quoteSteps: QuoteStepsData;
  mainForm: MainFormData;
  whyChooseBusrom: WhyChooseBusromData;
  caseStudies: CaseStudiesData;
  brandAnalysis: BrandAnalysisData;
  brandValue: BrandValueData;
  footer: FooterData;
}

// ====================================================================
// 中文内容数据
// ====================================================================

export const homeContent_ZH: HomeContentData = {
  locale: 'zh',

  // 模块 1: 大轮播海报
  heroBanner: [
    {
      title: '玻璃支撑件',
      features: [
        '定制极简现代玻璃支撑件',
        '重新定义透明度与现代设计',
        '隐形强度',
        '可调灵活性',
        '卓越耐用性',
      ],
      images: [
        createImageObject('1.jpg', '玻璃支撑件主视图'),
        createImageObject('banner-test/bannerTest1.svg', '玻璃支撑件细节插图', { hasThumbnail: false }),
        createImageObject('3.jpg', '玻璃支撑件安装示例'),
        createImageObject('4.jpg', '玻璃支撑件在现代建筑中的应用'),
      ],
    },
    {
      title: '玻璃连接件',
      features: [
        '耐用坚固的玻璃连接件',
        '为了清晰且安全的结构',
        '高承重能力',
        '耐久性',
        '安全性',
      ],
      images: [
        createImageObject('2.jpg', '玻璃连接件主视图'),
        createImageObject('5.jpg', '玻璃连接件细节'),
        createImageObject('7.jpg', '玻璃连接件应用'),
        createImageObject('8.jpg', '玻璃连接件安装'),
      ],
    },
    {
      title: '玻璃围栏立柱',
      features: [
        '建筑级玻璃围栏立柱',
        '隐形支撑的艺术',
        '耐盐雾',
        '安装简便',
        '无与伦比的稳定性',
      ],
      images: [
        createImageObject('3.jpg', '玻璃围栏立柱主视图'),
        createImageObject('1.jpg', '玻璃围栏立柱户外环境'),
        createImageObject('5.jpg', '玻璃围栏立柱特写'),
        createImageObject('9.jpg', '玻璃围栏立柱使用场景'),
      ],
    },
    {
      title: '玻璃栏杆夹',
      features: [
        '奢华隐形\n玻璃栏杆夹',
        '占地小 & 牢固抓握',
        '抗冲击',
        '易于安装',
        '全垂直化生产',
      ],
      images: [
        createImageObject('4.jpg', '玻璃栏杆夹主视图'),
        createImageObject('6.jpg', '玻璃栏杆夹细节'),
        createImageObject('2.jpg', '玻璃栏杆夹应用'),
        createImageObject('8.jpg', '玻璃栏杆夹安装'),
      ],
    },
    {
      title: '浴室玻璃夹',
      features: [
        '设计前卫的\n防水浴室玻璃夹',
        '最小接触面积 & 最大化玻璃视野',
        '高品质',
        '耐腐蚀',
        '灵活兼容性',
      ],
      images: [
        createImageObject('5.jpg', '浴室玻璃夹主视图'),
        createImageObject('3.jpg', '浴室玻璃夹在淋浴房中'),
        createImageObject('7.jpg', '浴室玻璃夹细节'),
        createImageObject('1.jpg', '浴室玻璃夹安装'),
      ],
    },
    {
      title: '玻璃合页',
      features: [
        '精心打造\n细节的玻璃合页',
        '开启无形之门',
        '静音操作',
        '可调节设计',
        '航空级材料',
      ],
      images: [
        createImageObject('6.jpg', '玻璃合页主视图'),
        createImageObject('9.jpg', '玻璃合页机械结构'),
        createImageObject('4.jpg', '玻璃合页在门上的应用'),
        createImageObject('2.jpg', '玻璃合页细节'),
      ],
    },
    {
      title: '移门套件',
      features: [
        '静音\n缓关移门套件',
        '实现静谧滑动与完美空间分隔',
        '节省空间',
        '耐用滑轮',
        '静音滑动',
      ],
      images: [
        createImageObject('7.jpg', '移门套件主视图'),
        createImageObject('8.jpg', '移门套件轨道系统'),
        createImageObject('1.jpg', '移门套件在浴室中'),
        createImageObject('3.jpg', '移门套件细节'),
      ],
    },
    {
      title: '浴室及门拉手',
      features: [
        '华丽简约的浴室\n及门拉手',
        '让每次触摸尽显优雅',
        '全天候设计',
        '高强度与硬度',
        '易于维护',
      ],
      images: [
        createImageObject('8.jpg', '浴室及门拉手主视图'),
        createImageObject('5.jpg', '浴室拉手特写'),
        createImageObject('2.jpg', '门拉手细节'),
        createImageObject('6.jpg', '拉手安装'),
      ],
    },
    {
      title: '隐藏式挂钩',
      features: [
        '优雅\n流线型\n隐藏式挂钩',
        '隐藏式安装 & 强大承重',
        '可拆卸设计',
        '快速安装',
        '隐形收纳',
      ],
      images: [
        createImageObject('9.jpg', '隐藏式挂钩主视图'),
        createImageObject('7.jpg', '隐藏式挂钩使用场景'),
        createImageObject('4.jpg', '隐藏式挂钩细节'),
        createImageObject('1.jpg', '隐藏式挂钩安装'),
      ],
    },
  ],

  // 模块 2: 产品系列轮播
  productSeriesCarousel: [
    {
      key: 'glass-standoff',
      order: 1,
      name: '玻璃广告螺丝',
      image: createImageObject(
        'homeProductSeries/glass_standoff.png',
        '玻璃广告螺丝系列'
      ),
      href: '/product/glass-standoff',
    },
    {
      key: 'glass-connected-fitting',
      order: 2,
      name: '玻璃连接件',
      image: createImageObject(
        'homeProductSeries/glass_connected_fitting.png',
        '玻璃连接件系列'
      ),
      href: '/product/glass-connected-fitting',
    },
    {
      key: 'glass-fence-spigot',
      order: 3,
      name: '玻璃立柱',
      image: createImageObject(
        'homeProductSeries/glass_fence_spigot.png',
        '玻璃立柱系列'
      ),
      href: '/product/glass-fence-spigot',
    },
    {
      key: 'glass-clip-railing',
      order: 4,
      name: '玻璃夹(护栏系列)',
      image: createImageObject(
        'homeProductSeries/glass_clip_outdoor.png',
        '玻璃护栏夹系列'
      ),
      href: '/product/glass-clip',
    },
    {
      key: 'glass-clip-bathroom',
      order: 5,
      name: '玻璃夹(浴室系列)',
      image: createImageObject(
        'homeProductSeries/glass_clip_washroom.png',
        '浴室玻璃夹系列'
      ),
      href: '/product/glass-clip',
    },
    {
      key: 'glass-hinge',
      order: 6,
      name: '玻璃合页',
      image: createImageObject(
        'homeProductSeries/glass_hinge.png',
        '玻璃合页系列'
      ),
      href: '/product/glass-hinge',
    },
    {
      key: 'sliding-door-kit',
      order: 7,
      name: '推拉门套件',
      image: createImageObject(
        'homeProductSeries/sliding_door_kit.png',
        '推拉门套件系列'
      ),
      href: '/product/sliding-door-kit',
    },
    {
      key: 'bathroom-door-handle',
      order: 8,
      name: '浴室及大门拉手',
      image: createImageObject(
        'homeProductSeries/bathroom_&_door_handle.png',
        '浴室及大门拉手系列'
      ),
      href: '/product/bathroom-door-handle',
    },
    {
      key: 'hidden-hook',
      order: 9,
      name: '隐藏式挂钩',
      image: createImageObject(
        'homeProductSeries/hidden_hook.png',
        '隐藏式挂钩系列'
      ),
      href: '/product/hidden-hook',
    },
  ],

  // 模块 3: 服务特点
  serviceFeatures: {
    title: '高端建筑玻璃五金',
    subtitle:
      'Busrom 提供全定制玻璃五金(服务美国、加拿大、英国、澳大利亚、沙特阿拉伯、阿联酋及全球客户,打造理想的室内外空间。)',
    features: [
      {
        title: '任意尺寸、任意结构、任意形状',
        shortTitle: '任意尺寸',
        description:
          '无论是带框还是无框隔断,甚至是承重幕墙,我们都能定制匹配任意尺寸和结构的玻璃五金。',
        images: [
          createImageObject('1.jpg', '定制尺寸玻璃五金'),
          createImageObject('2.jpg', '各种结构选项'),
          createImageObject('3.jpg', '灵活的形状设计'),
          createImageObject('4.jpg', '定制五金示例'),
        ],
      },
      {
        title: '灵活安装',
        shortTitle: '灵活安装',
        description:
          '无论是无框玻璃、瓷砖墙面、金属框架还是翻新项目,Busrom 的玻璃五金都能适应各种环境。从室内浴室到池畔露台,我们的解决方案安装快捷,麻烦最少。',
        images: [
          createImageObject('1.jpg', '灵活安装方式'),
          createImageObject('2.jpg', '简便安装过程'),
        ],
      },
      {
        title: '专属色彩',
        shortTitle: '专属色彩',
        description:
          '从经典的拉丝不锈钢和哑光黑,到任意 RAL 颜色或定制 PVD 表面,Busrom 的定制工艺将项目提升为点睛之笔。耐用的涂层抗腐蚀和磨损,长久保持美观。',
        images: [
          createImageObject('1.jpg', '拉丝不锈钢表面'),
          createImageObject('2.jpg', '哑光黑涂层'),
          createImageObject('3.jpg', '定制 RAL 颜色'),
          createImageObject('4.jpg', 'PVD 表面选项'),
          createImageObject('5.jpg', '抛光铬面'),
          createImageObject('6.jpg', '古铜色表面'),
        ],
      },
      {
        title: 'OEM / ODM 及项目定制',
        shortTitle: 'OEM / ODM',
        description:
          '从原型到批量生产,我们支持来图定制、小批量试产以及完整的 OEM/ODM 服务。',
        images: [
          createImageObject('1.jpg', 'OEM 定制流程'),
          createImageObject('2.jpg', 'ODM 项目案例'),
        ],
      },
      {
        title: '全球质量标准与售后支持',
        shortTitle: '全球质量标准',
        description:
          '严格的质量控制,全球配送,以及响应迅速的备件和技术支持,确保项目连续性。',
        images: [
          createImageObject('6.jpg', '质量控制流程'),
          createImageObject('7.jpg', '全球配送网络'),
        ],
      },
    ],
  },

  // 模块 4: 3D 球体 (空)
  sphere3d: {},

  // 模块 5: 简易 CTA
  simpleCta: {
    title: '准备好开始',
    title2: '您的项目了吗?',
    subtitle: '让我们共筑卓越!',
    description:
      '联系 Busrom 团队,获取为您的项目量身定制的精密五金和完整解决方案。',
    buttonText: '立即联系我们!',
    images: [
      createImageObject('1.jpg', '联系 Busrom 团队'),
      createImageObject('2.jpg', '启动您的项目'),
      createImageObject('3.jpg', '与 Busrom 共建'),
    ],
  },

  // 模块 6: 系列产品介绍
  seriesIntro: [
    {
      title: '玻璃广告螺丝',
      description:
        '专为玻璃面板固定而设计,Busrom 玻璃广告螺丝系列采用高强度不锈钢,经精密CNC加工和抛光,不仅确保稳定的承重,更具有优雅现代的金属质感。广泛应用于幕墙、隔断、楼梯栏杆等场景,为玻璃安装提供安全可靠的支撑。',
      images: [ createImageObject('1.jpg', '玻璃广告螺丝系列'),],
      href: '/product/glass-standoff',
    },
    {
      title: '玻璃连接件',
      description:
        '玻璃连接件系列为多块玻璃面板的组装提供灵活的解决方案,包括直角、T型、十字和可调角度接头。产品采用精密铸造和车削工艺,装配精度高,接口牢固,广泛应用于玻璃幕墙、楼梯扶手和隔断。',
      images: [ createImageObject('2.jpg', '玻璃连接件系列'),],
      href: '/product/glass-connected-fitting',
    },
    {
      title: '玻璃立柱',
      description:
        'Busrom 玻璃围栏立柱用于玻璃栏杆和围栏系统,采用加厚底座设计和高强度螺栓连接,提供卓越的抗弯和抗爆裂性能。多重电镀或喷砂表面处理,能抵抗锈蚀和潮湿,并与各种建筑风格无缝融合。',
      images: [ createImageObject('3.jpg', '玻璃立柱系列'),],
      href: '/product/glass-fence-spigot',
    },
    {
      title: '玻璃护栏及浴室夹',
      description:
        'Busrom 玻璃夹以其简约小巧的造型和精准的夹持力而闻名。产品选用航空级不锈钢,经过多道钝化工艺处理和涂层,兼顾了耐腐蚀性与视觉美感。适用于楼梯护栏、玻璃隔断、浴室墙体等安装场景,安装简便,性能稳固。',
      images: [ createImageObject('4.jpg', '玻璃夹系列'),],
      href: '/product/glass-clip',
    },
    {
      title: '玻璃合页',
      description:
        'Busrom 玻璃合页系列专为淋浴房和玻璃门设计,内置静音缓冲机制和不锈钢转轴,确保开合顺滑无噪音。合页经过防水防锈处理,能承受高频使用和潮湿环境,兼具安全与耐用性。',
      images: [ createImageObject('5.jpg', '玻璃合页系列'),],
      href: '/product/glass-hinge',
    },
    {
      title: '推拉门套件',
      description:
        'Busrom 推拉门套件集成了高精度静音滚轮、限位器、夹具、挂钩和地轨导向件,所有部件均由优质航空级不锈钢制成,确保门体推拉平稳、无晃动。适用于浴室、淋浴房、室内隔断及办公场景的推拉门。',
      images: [ createImageObject('6.jpg', '推拉门套件系列'),],
      href: '/product/sliding-door-kit',
    },
    {
      title: '浴室及大门拉手',
      description:
        '我们的浴室及大门拉手系列涵盖了直型、弯型等多种造型,材质从黄铜到不锈钢一应俱全,表面处理支持镀铬、拉丝、黑钛等多种效果。无论是淋浴门、室内推拉门还是室外大门,都能提供舒适的握感和高端的质感。',
      images: [ createImageObject('7.jpg', '浴室及大门拉手系列'),],
      href: '/product/bathroom-door-handle',
    },
    {
      title: '隐藏式挂钩',
      description:
        'Busrom 隐藏式挂钩巧妙地融入您希望的墙面,外观简洁无螺丝,开启时静音无声,闭合时与墙面融为一体。适用于衣帽间、浴室、玄关、展示区等场景,兼顾了承重能力与美学设计,为空间带来极简实用的收纳体验。',
      images: [ createImageObject('8.jpg', '隐藏式挂钩系列'),],
      href: '/product/hidden-hook',
    },
  ],

  // 模块 7: 精选产品
  featuredProducts: {
    title: '精选产品',
    description: '探索我们精心挑选的顶级产品,专为精密工程和优雅设计而生。',
    viewAllButton: '查看所有产品',
    categories: '产品分类',
    series: [
      {
        seriesTitle: '玻璃固定件',
        products: [
          {
            image: createImageObject(
              'placeholder-standoff-1.jpg',
              '极简主义固定件'
            ),
            title: '极简主义固定件',
            features: ['Ø50mm', 'SS316不锈钢', '拉丝处理'],
          },
          {
            image: createImageObject(
              'placeholder-standoff-2.jpg',
              '可调节固定件'
            ),
            title: '可调节固定件',
            features: ['可调节设计', 'SS304不锈钢', '哑光黑'],
          },
          {
            image: createImageObject(
              'placeholder-standoff-3.jpg',
              '重型固定件'
            ),
            title: '重型固定件',
            features: ['Ø70mm', 'SS316L不锈钢', '抛光'],
          },
        ],
      },
      {
        seriesTitle: '玻璃连接配件',
        products: [
          {
            image: createImageObject(
              'placeholder-fitting-1.jpg',
              '齐平安插连接件'
            ),
            title: '齐平安插连接件',
            features: ['墙对玻璃连接', '固定角度', '锌合金'],
          },
          {
            image: createImageObject(
              'placeholder-fitting-2.jpg',
              '可调转角连接'
            ),
            title: '可调转角连接',
            features: ['90°至180°', 'SS304不锈钢', '高承重'],
          },
          {
            image: createImageObject(
              'placeholder-fitting-3.jpg',
              'T型连接适配器'
            ),
            title: 'T型连接适配器',
            features: ['T型连接', 'SS316不锈钢', '镜面抛光'],
          },
        ],
      },
      {
        seriesTitle: '玻璃栅栏夹',
        products: [
          {
            image: createImageObject(
              'placeholder-spigot-1.jpg',
              '方形地插式底座'
            ),
            title: '方形地插式底座',
            features: ['无需钻孔', '高抓力设计', '黑色阳极氧化'],
          },
          {
            image: createImageObject(
              'placeholder-spigot-2.jpg',
              '圆形甲板安装'
            ),
            title: '圆形甲板安装',
            features: ['螺栓固定', '倾斜可调', '海洋级不锈钢'],
          },
          {
            image: createImageObject('placeholder-spigot-3.jpg', '纤细型底座'),
            title: '纤细型底座',
            features: ['低调轮廓', 'SS2205双相钢', '缎面处理'],
          },
        ],
      },
      {
        seriesTitle: '玻璃夹',
        products: [
          {
            image: createImageObject('placeholder-clip-1.jpg', 'D型墙夹'),
            title: 'D型墙夹',
            features: ['6-12mm玻璃适用', '固定90°', '安装便捷'],
          },
          {
            image: createImageObject('placeholder-clip-2.jpg', '可调转角夹'),
            title: '可调转角夹',
            features: ['1/4" 微调', 'SS316不锈钢', '室内/室外'],
          },
          {
            image: createImageObject('placeholder-clip-3.jpg', '平底座夹'),
            title: '平底座夹',
            features: ['地板/底部安装', '超重型', '不锈钢'],
          },
        ],
      },
      {
        seriesTitle: '玻璃合页',
        products: [
          {
            image: createImageObject('placeholder-hinge-1.jpg', '90° 淋浴房合页'),
            title: '90° 淋浴房合页',
            features: ['自动回位', '玻璃到墙连接', '黄铜内芯'],
          },
          {
            image: createImageObject('placeholder-hinge-2.jpg', '偏置枢轴合页'),
            title: '偏置枢轴合页',
            features: ['重型门适用', '静音摆动', '不锈钢'],
          },
          {
            image: createImageObject(
              'placeholder-hinge-3.jpg',
              '180° 自由摆动合页'
            ),
            title: '180° 自由摆动合页',
            features: ['双向开启', '无定位功能', '哑光处理'],
          },
        ],
      },
      {
        seriesTitle: '移门套件',
        products: [
          {
            image: createImageObject('placeholder-sliding-1.jpg', '缓关系统套件'),
            title: '缓关系统套件',
            features: ['静音运行', '150kg 承重', '铝合金导轨'],
          },
          {
            image: createImageObject('placeholder-sliding-2.jpg', '外露式滑轮套件'),
            title: '外露式滑轮套件',
            features: ['谷仓门风格', '碳钢材质', '复古外观'],
          },
          {
            image: createImageObject('placeholder-sliding-3.jpg', '暗藏式移门套件'),
            title: '暗藏式移门套件',
            features: ['节省空间', '顶部悬挂', '可调限位器'],
          },
        ],
      },
      {
        seriesTitle: '玻璃栏杆',
        products: [
          {
            image: createImageObject('placeholder-railing-1.jpg', '立柱栏杆底座'),
            title: '立柱栏杆底座',
            features: ['侧面安装', '高度可调', 'SS316不锈钢'],
          },
          {
            image: createImageObject('placeholder-railing-2.jpg', '顶部安装栏板'),
            title: '顶部安装栏板',
            features: ['方形设计', '无需焊接', '拉丝处理'],
          },
          {
            image: createImageObject('placeholder-railing-3.jpg', '扶手支架'),
            title: '扶手支架',
            features: ['圆形管支撑', '隐藏式固定', '重型'],
          },
        ],
      },
      {
        seriesTitle: '浴室门把手',
        products: [
          {
            image: createImageObject('placeholder-handle-1.jpg', '梯形对拉把手'),
            title: '梯形对拉把手',
            features: ['背对背安装', '1200mm 长度', '亮光镀铬'],
          },
          {
            image: createImageObject('placeholder-handle-2.jpg', '圆形旋钮套装'),
            title: '圆形旋钮套装',
            features: ['带隐私锁', '缎面处理', '经久耐用'],
          },
          {
            image: createImageObject('placeholder-handle-3.jpg', '嵌入式拉手'),
            title: '嵌入式拉手',
            features: ['移门专用', '内嵌安装', '极简风格'],
          },
        ],
      },
      {
        seriesTitle: '隐藏挂钩',
        products: [
          {
            image: createImageObject('placeholder-hook-1.jpg', '伸缩式衣钩'),
            title: '伸缩式衣钩',
            features: ['可折叠收纳', '锌合金', '高承载力'],
          },
          {
            image: createImageObject('placeholder-hook-2.jpg', '壁挂式挂架'),
            title: '壁挂式挂架',
            features: ['4个挂钩', '铝合金材质', '现代设计'],
          },
          {
            image: createImageObject('placeholder-hook-3.jpg', '重型多用途挂钩'),
            title: '重型多用途挂钩',
            features: ['车库使用', '不锈钢', '耐腐蚀'],
          },
        ],
      },
    ],
  },

  // 模块 8: 品牌优势
  brandAdvantages: {
    advantages: [
      '性能、创新与精致设计',
      '极致追求',
      '精心研发的结构与部件',
      '严格挑选的航空级材料',
      '精密的性能与高端的表面处理',
      '简洁的美学与隐藏式固定',
      'IP防护等级组件与潮湿区域的水电分离',
      '智能家居集成准备',
      '从单个订单到OEM/ODM',
    ],
    icons: [
      'Sparkles',
      'Target',
      'Component',
      'ShieldCheck',
      'Gauge',
      'EyeOff',
      'Waves',
      'Cpu',
      'Factory',
    ],
    image: createImageObject('test.png', 'Busrom 品牌优势'),
  },

  // 模块 9: OEM/ODM
  oemOdm: {
    oem: {
      title: 'OEM',
      bgImage: createImageObject('1.jpg', 'OEM 背景'),
      image: createImageObject('2.jpg', 'OEM 服务'),
      description: [
        '在 Busrom,我们与设计师、零售商和制造商密切合作,提供端到端的 OEM/ODM 服务。我们将您的创意无缝融入玻璃五金,并提供满足您需求的定制玻璃解决方案。',
        '准备好将您的概念转化为可生产的产品了吗?请将您的构想发送给我们——Busrom 团队将在24小时内回复您,并提供个性化的合作方案。',
      ],
    },
    odm: {
      title: 'ODM',
      bgImage: createImageObject('3.jpg', 'ODM 背景'),
      image: createImageObject('4.jpg', 'ODM 服务'),
      description: ['完全定制的结构、尺寸与颜色', '完整解决方案 - 正合您意'],
    },
  },

  // 模块 10: 报价步骤
  quoteSteps: {
    title: '设计项目解决方案',
    title2: '仅需轻松 5 步',
    subtitle: '从概念到现实,一切都变得简单。',
    description:
      '我们提供标准服务与完全定制化服务,以及专业的设计建议与技术支持,确保您在制造开始前就能轻松预览并完善玻璃五金项目,最终效果与您想象的一样惊艳。',
    steps: [
      {
        text: '发送详细信息(尺寸、结构与颜色)',
        image: createImageObject('1.jpg', '步骤 1: 发送详细信息'),
      },
      {
        text: '获取免费报价',
        image: createImageObject('2.jpg', '步骤 2: 获取报价'),
      },
      {
        text: '确认最终方案',
        image: createImageObject('3.jpg', '步骤 3: 确认方案'),
      },
      {
        text: '开始生产制造',
        image: createImageObject('4.jpg', '步骤 4: 生产制造'),
      },
      {
        text: '全球配送服务',
        image: createImageObject('5.jpg', '步骤 5: 全球配送'),
      },
    ],
  },

  // 模块 11: 主表单
  mainForm: {
    placeholderName: '您的姓名',
    placeholderEmail: '您的邮箱',
    placeholderWhatsapp: 'WhatsApp 号码',
    placeholderCompany: '公司名称',
    placeholderMessage: '留言信息',
    placeholderVerify: '验证码',
    buttonText: '发送',
    designTextLeft: '高端建筑玻璃五金',
    designTextRight: '定制结构与颜色',
    image1: createImageObject('10.jpg', '联系表单视觉'),
    image2: createImageObject('11.jpg', '与 Busrom 取得联系'),
  },

  // 模块 12: 为什么选择 Busrom
  whyChooseBusrom: {
    title: '为什么选择',
    title2: 'Busrom',
    reasons: [
      {
        title: '原创与专有设计',
        description: '融合形式与功能的独家五金。',
        image: createImageObject('why-choose-us/1.jpg', '原创专有设计'),
      },
      {
        title: '不懈的质量与集成',
        description:
          '严格的材料选择、测试和智能家居集成准备,确保可靠的安全、功能和表面处理。',
        image: createImageObject('why-choose-us/2.jpg', '质量与集成'),
      },
      {
        title: '工厂直供生产',
        description:
          '全垂直制造,实现更严格的质量控制、更快的交货时间和更优的价格。',
        image: createImageObject('why-choose-us/3.jpg', '工厂直供生产'),
      },
      {
        title: '多年的全球专业经验',
        description:
          '经验丰富的团队和市场洞察力,提供耐用、高性能的组件。',
        image: createImageObject('why-choose-us/4.jpg', '全球专业经验'),
      },
      {
        title: '协作研发伙伴关系',
        description: '共同设计定制解决方案,将您的概念变为可生产的现实。',
        image: createImageObject('why-choose-us/5.jpg', '研发伙伴关系'),
      },
    ],
  },

  // 模块 13: 应用案例
  caseStudies: {
    title: '应用案例轮播',
    description: '查看 Busrom 五金如何在全球范围内将雄心勃勃的建筑愿景变为现实。',
    applications: [
      {
        items: [
          {
            series: '玻璃固定件',
            slug: 'lakeview-villa-staircase',
            image: createImageObject(
              'case-studies/1.jpg',
              '湖景别墅玻璃楼梯 - 玻璃固定件应用'
            ),
          },
          {
            series: '玻璃连接件',
            slug: 'skycrest-tower-balustrades',
            image: createImageObject(
              'case-studies/2.jpg',
              '天际塔玻璃栏杆 - 玻璃连接件'
            ),
          },
          {
            series: '玻璃立柱',
            slug: 'azure-hotel-showers',
            image: createImageObject('case-studies/3.jpg', '蔚蓝酒店淋浴房'),
          },
        ],
      },
      {
        items: [
          {
            series: '玻璃夹',
            slug: 'city-museum-glass-wall',
            image: createImageObject('case-studies/4.jpg', '城市博物馆结构玻璃幕墙'),
          },
          {
            series: '玻璃合页',
            slug: 'lux-boutique-shelving',
            image: createImageObject('case-studies/5.jpg', 'LUX 精品店货架系统'),
          },
          {
            series: '推拉门套件',
            slug: 'airport-railings',
            image: createImageObject('case-studies/6.jpg', '国际机场栏杆'),
          },
        ],
      },
      {
        items: [
          {
            series: '浴室门把手',
            slug: 'heritage-building-doors',
            image: createImageObject('case-studies/7.jpg', '历史建筑玻璃门'),
          },
          {
            series: '隐藏挂钩',
            slug: 'corporate-hq-partitions',
            image: createImageObject('case-studies/8.jpg', '企业总部玻璃隔断墙'),
          },
          {
            series: '玻璃固定件',
            slug: 'lakeview-villa-staircase',
            image: createImageObject('case-studies/1.jpg', '湖景别墅其他视图'),
          },
        ],
      },
    ],
  },

  // 模块 14: 品牌分析
  brandAnalysis: {
    analysis: {
      title: 'Bus',
      title2: 'rom',
      text: '缓冲 (Buffer) & 桥梁 (Bridge)',
      text2: '房间 (Room) & 空间 (Space)',
    },
    centers: [
      {
        title: '品牌中心',
        description:
          '在 Busrom,我们不仅创造结构——我们将梦想变为现实。我们的愿景是让每一次玻璃安装都安全而不失优雅,因此您再也不必担心找不到合适的解决方案。',
      },
      {
        title: '项目中心',
        description:
          '在这里,我们汇集了 Busrom 在全球范围内的精选工程案例。无论是商业、住宅还是公共项目,我们都致力于提供专业、高效和定制化的室内外空间解决方案。',
      },
      {
        title: '服务中心',
        description:
          '在追求卓越的旅程中,Busrom 始终是您值得信赖的伙伴。我们的专业团队提供无忧的服务体验,为您节省时间、精力和金钱。',
      },
    ],
  },

  // 模块 15: 品牌价值
  brandValue: {
    title: 'Brand value',
    subtitle: 'embodiment',
    param1: {
      title: '',
      description: '不止于玻璃五金',
      image: createImageObject(
        'BrandValue/BusromBrandValue1.png',
        '不止于玻璃五金'
      ),
    },
    param2: {
      title: '',
      description: '为每个玻璃空间打造精密细节',
      image: createImageObject(
        'BrandValue/BusromBrandValue2.png',
        '精密细节'
      ),
    },
    slogan: {
      title: '我们的标语',
      description: '精琢玻璃细节',
      image: createImageObject('BrandValue/BusromBrandValue3.png', 'Busrom 标语'),
    },
    value: {
      title: '我们的价值观',
      description: '精密 · 安全 · 设计 — 守护形式与功能的支持',
      image: createImageObject(
        'BrandValue/BusromBrandValue4.png',
        'Busrom 核心价值观'
      ),
    },
    vision: {
      title: '我们的愿景',
      description: '让千万空间 — 更安全、更开放地享用我们的产品',
      image: createImageObject('BrandValue/BusromBrandValue5.png', 'Busrom 愿景'),
    },
  },

  // 模块 16: 页脚
  footer: {
    form: {
      title: '联系我们',
      placeholders: {
        name: '姓名',
        email: '邮箱',
        message: '留言',
      },
      buttonText: '提交',
    },
    contact: {
      title: '联系方式',
      emailLabel: '邮箱',
      email: 'info@busromhouse.com',
      afterSalesLabel: '售后支持',
      afterSales: 'support@busromhouse.com',
      whatsappLabel: 'WhatsApp',
      whatsapp: '+86 13426931306',
    },
    notice: {
      title: '官方声明',
      lines: [
        '官方邮箱联系: info@busromhouse.com。',
        '任何来自非官方渠道的联系均未经授权,并可能存在欺诈风险——请勿接触或付款。',
        '如需核实或有任何疑问,请通过官方邮箱或我们的网站 www.busromhouse.com 联系我们。',
        'Busrom 团队',
      ],
    },
    column3Menus: [
      { slug: 'product', name: '产品', link: '/product' },
      { slug: 'service', name: '服务', link: '/service' },
      { slug: 'about-us', name: '关于我们', link: '/about-us' },
    ],
    column4Menus: [
      { slug: 'contact-us', name: '联系我们', link: '/contact-us' },
      { slug: 'shop', name: '商店', link: '/shop' },
    ],
  },
};