/**
 * Busrom Website - Home Page Content (English)
 * Data structure follows REST API specification
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
// Type Definitions
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
// English Content Data
// ====================================================================

export const homeContent_EN: HomeContentData = {
  locale: 'en',

  // Module 1: Hero Banner
  heroBanner: [
    {
      title: 'Glass Standoff',
      features: [
        'Customized Minimalist Modern Glass Standoff',
        'Redefining Transparency & Modern Design',
        'Invisible Strength',
        'Adjustable Flexibility',
        'Superior Durability',
      ],
      images: [
        createImageObject('1.jpg', 'Glass Standoff main view'),
        createImageObject(
          'banner-test/bannerTest1.svg',
          'Glass Standoff detail illustration',
          { hasThumbnail: false }
        ),
        createImageObject('3.jpg', 'Glass Standoff installation example'),
        createImageObject('4.jpg', 'Glass Standoff in modern architecture'),
      ],
    },
    {
      title: 'Glass Connected Fitting',
      features: [
        'Durable Built Tough Glass Connected Fitting',
        'For A Clear And Secure Structure',
        'High Load-bearing',
        'Durability',
        'Safety',
      ],
      images: [
        createImageObject('2.jpg', 'Glass Connected Fitting main view'),
        createImageObject('5.jpg', 'Glass Connected Fitting detail'),
        createImageObject('7.jpg', 'Glass Connected Fitting application'),
        createImageObject('8.jpg', 'Glass Connected Fitting installation'),
      ],
    },
    {
      title: 'Glass Fence Spigot',
      features: [
        'Architectural Glass Fence Spigot',
        'The Art of Invisible Support',
        'Salt-spray Resistant',
        'Effortless Installation',
        'Unmatched Stability',
      ],
      images: [
        createImageObject('3.jpg', 'Glass Fence Spigot main view'),
        createImageObject('1.jpg', 'Glass Fence Spigot outdoor setting'),
        createImageObject('5.jpg', 'Glass Fence Spigot close-up'),
        createImageObject('9.jpg', 'Glass Fence Spigot in use'),
      ],
    },
    {
      title: 'Glass Clip (Railing)',
      features: [
        'Luxury Invisible \n Glass Railing Clip',
        'Small Footprint & Strong Hold',
        'Anti-Impact',
        'Easy Installation',
        'Full Vertical Manufacturing',
      ],
      images: [
        createImageObject('4.jpg', 'Glass Railing Clip main view'),
        createImageObject('6.jpg', 'Glass Railing Clip detail'),
        createImageObject('2.jpg', 'Glass Railing Clip application'),
        createImageObject('8.jpg', 'Glass Railing Clip installation'),
      ],
    },
    {
      title: 'Glass Clip (Bathroom)',
      features: [
        'Design-forward \n Waterproof Bathroom Glass Clip',
        'Minimal Contact & Maximum Glass',
        'High Quality',
        'Corrosion-resistant',
        'Flexible Compatibility',
      ],
      images: [
        createImageObject('5.jpg', 'Bathroom Glass Clip main view'),
        createImageObject('3.jpg', 'Bathroom Glass Clip in shower'),
        createImageObject('7.jpg', 'Bathroom Glass Clip detail'),
        createImageObject('1.jpg', 'Bathroom Glass Clip installation'),
      ],
    },
    {
      title: 'Glass Hinge',
      features: [
        'Curated \n Details Glass Hinge',
        'Swing Open The Invisible',
        'Silent Operation',
        'Adjustable Design',
        'Aviation-grade Material',
      ],
      images: [
        createImageObject('6.jpg', 'Glass Hinge main view'),
        createImageObject('9.jpg', 'Glass Hinge mechanism'),
        createImageObject('4.jpg', 'Glass Hinge in door'),
        createImageObject('2.jpg', 'Glass Hinge detail'),
      ],
    },
    {
      title: 'Sliding Door Kit',
      features: [
        'Silent Soft-\nClose Sliding Door Kit',
        'For Silent Glide & Perfect Divide',
        'Space Saving',
        'Durable Pulley',
        'Silent Slide',
      ],
      images: [
        createImageObject('7.jpg', 'Sliding Door Kit main view'),
        createImageObject('8.jpg', 'Sliding Door Kit track system'),
        createImageObject('1.jpg', 'Sliding Door Kit in bathroom'),
        createImageObject('3.jpg', 'Sliding Door Kit detail'),
      ],
    },
    {
      title: 'Bathroom & Door Handle',
      features: [
        'Opulent Simplicity Bathroom \n & Door Handle',
        'Turn Every Touch Into Elegance',
        'All-Weather Design',
        'High Strength & Hardness',
        'Easy Maintenance',
      ],
      images: [
        createImageObject('8.jpg', 'Bathroom & Door Handle main view'),
        createImageObject('5.jpg', 'Bathroom Handle close-up'),
        createImageObject('2.jpg', 'Door Handle detail'),
        createImageObject('6.jpg', 'Handle installation'),
      ],
    },
    {
      title: 'Hidden Hook',
      features: [
        'Elegant \n Streamlined \n Hidden Hook',
        'Hidden Mounting & Strong Load-Bearing',
        'Removable Design',
        'Quick Setup',
        'Invisible Storage',
      ],
      images: [
        createImageObject('9.jpg', 'Hidden Hook main view'),
        createImageObject('7.jpg', 'Hidden Hook in use'),
        createImageObject('4.jpg', 'Hidden Hook detail'),
        createImageObject('1.jpg', 'Hidden Hook installation'),
      ],
    },
  ],

  // Module 2: Product Series Carousel
  productSeriesCarousel: [
    {
      key: 'glass-standoff',
      order: 1,
      name: 'Glass Standoff',
      image: createImageObject(
        'homeProductSeries/glass_standoff.png',
        'Glass Standoff Series'
      ),
      href: '/product/glass-standoff',
    },
    {
      key: 'glass-connected-fitting',
      order: 2,
      name: 'Glass Connected Fitting',
      image: createImageObject(
        'homeProductSeries/glass_connected_fitting.png',
        'Glass Connected Fitting Series'
      ),
      href: '/product/glass-connected-fitting',
    },
    {
      key: 'glass-fence-spigot',
      order: 3,
      name: 'Glass Fence Spigot',
      image: createImageObject(
        'homeProductSeries/glass_fence_spigot.png',
        'Glass Fence Spigot Series'
      ),
      href: '/product/glass-fence-spigot',
    },
    {
      key: 'glass-clip-railing',
      order: 4,
      name: 'Glass Clip (Railing)',
      image: createImageObject(
        'homeProductSeries/glass_clip_outdoor.png',
        'Glass Railing Clip Series'
      ),
      href: '/product/glass-clip',
    },
    {
      key: 'glass-clip-bathroom',
      order: 5,
      name: 'Glass Clip (Bathroom)',
      image: createImageObject(
        'homeProductSeries/glass_clip_washroom.png',
        'Bathroom Glass Clip Series'
      ),
      href: '/product/glass-clip',
    },
    {
      key: 'glass-hinge',
      order: 6,
      name: 'Glass Hinge',
      image: createImageObject(
        'homeProductSeries/glass_hinge.png',
        'Glass Hinge Series'
      ),
      href: '/product/glass-hinge',
    },
    {
      key: 'sliding-door-kit',
      order: 7,
      name: 'Sliding Door Kit',
      image: createImageObject(
        'homeProductSeries/sliding_door_kit.png',
        'Sliding Door Kit Series'
      ),
      href: '/product/sliding-door-kit',
    },
    {
      key: 'bathroom-door-handle',
      order: 8,
      name: 'Bathroom & Door Handle',
      image: createImageObject(
        'homeProductSeries/bathroom_&_door_handle.png',
        'Bathroom & Door Handle Series'
      ),
      href: '/product/bathroom-door-handle',
    },
    {
      key: 'hidden-hook',
      order: 9,
      name: 'Hidden Hook',
      image: createImageObject(
        'homeProductSeries/hidden_hook.png',
        'Hidden Hook Series'
      ),
      href: '/product/hidden-hook',
    },
  ],

  // Module 3: Service Features
  serviceFeatures: {
    title: 'Premium Architectural Glass Hardware',
    subtitle:
      'Fully Customized Glass Hardware by Busrom (Serving USA, CA, UK, AU, KSA, UAE, and clients worldwide to create the ideal indoor & outdoor space.)',
    features: [
      {
        title: 'Any Size, Any Structure, Any Shape',
        shortTitle: 'Any Size',
        description:
          "Whether it's framed or frameless partitions, or even load-bearing curtain walls, we can customize glass hardware to match any size and structure.",
        images: [
          createImageObject('1.jpg', 'Custom size glass hardware'),
          createImageObject('2.jpg', 'Various structure options'),
          createImageObject('3.jpg', 'Flexible shape designs'),
          createImageObject('4.jpg', 'Custom hardware examples'),
        ],
      },
      {
        title: 'Flexible Installation',
        shortTitle: 'Flexible Installation',
        description:
          "Whether it's frameless glass, tiled walls, metal frames, or renovation projects, Busrom's glass hardware adapts to every setting. From indoor bathrooms to poolside decks, our solutions install quickly and with minimal fuss.",
        images: [
          createImageObject('1.jpg', 'Flexible installation method'),
          createImageObject('2.jpg', 'Easy installation process'),
        ],
      },
      {
        title: "A Color That's So You",
        shortTitle: "A Color That's So You",
        description:
          "From classic brushed stainless steel and matte black to any RAL color or custom PVD finish, Busrom's bespoke craftsmanship elevates projects into the crowning touch of any space. Durable coatings resist corrosion and wear, maintaining their aesthetic appeal for years to come.",
        images: [
          createImageObject('1.jpg', 'Brushed stainless steel finish'),
          createImageObject('2.jpg', 'Matte black coating'),
          createImageObject('3.jpg', 'Custom RAL colors'),
          createImageObject('4.jpg', 'PVD finish options'),
          createImageObject('5.jpg', 'Polished chrome finish'),
          createImageObject('6.jpg', 'Antique brass finish'),
        ],
      },
      {
        title: 'OEM / ODM & Project Customization',
        shortTitle: 'OEM / ODM',
        description:
          'From prototype to mass production, we support drawing-based customization, small-batch runs, and full OEM/ODM services.',
        images: [
          createImageObject('1.jpg', 'OEM customization process'),
          createImageObject('2.jpg', 'ODM project examples'),
        ],
      },
      {
        title: 'Global Quality Standards & After-Sales Support',
        shortTitle: 'Global Quality Standards',
        description:
          'Strict QC, worldwide shipping, and responsive spare-part and technical support for project continuity.',
        images: [
          createImageObject('6.jpg', 'Quality control process'),
          createImageObject('7.jpg', 'Global shipping network'),
        ],
      },
    ],
  },

  // Module 4: 3D Sphere (Empty)
  sphere3d: {},

  // Module 5: Simple CTA
  simpleCta: {
    title: 'Ready to Start',
    title2: 'Your Project?',
    subtitle: "Let's Build Something Exceptional!",
    description:
      "Connect with Busrom's Team for precision hardware and complete solutions tailored to your project.",
    buttonText: 'Contact Us Now！',
    images: [
      createImageObject('1.jpg', 'Contact Busrom team'),
      createImageObject('2.jpg', 'Start your project'),
      createImageObject('3.jpg', 'Build with Busrom'),
    ],
  },

  // Module 6: Series Introduction
  seriesIntro: [
    {
      title: 'Glass Standoff',
      description:
        'Designed for glass panel fixing, Busrom Glass Standoff Series is made of high strength stainless steel, precision CNC machined and polished, which not only ensures stable load bearing, but also has an elegant and modern metal texture. Widely used in curtain walls, partitions, stair railings and other scenarios, providing safe and reliable support for glass installation.',
      images: [ createImageObject('1.jpg', 'Glass Standoff Series'),],
      href: '/product/glass-standoff',
    },
    {
      title: 'Glass Connected Fitting',
      description:
        'The Glass Connected Fitting Series provides flexible solutions for the assembly of multiple glass panels, including right angles, T-pieces, crosses and adjustable joints. The products adopt precision casting and turning technology, with high assembly precision and solid interface, and are widely used in glass curtain walls, staircase handrails and partitions.',
      images: [ createImageObject('2.jpg', 'Glass Connected Fitting Series'),],
      href: '/product/glass-connected-fitting',
    },
    {
      title: 'Glass Fence Spigot',
      description:
        'Used in systems such as glass railings and fences, the Busrom Glass Fence Spigot features a thickened base design and high-strength bolted joints to provide superior resistance to bending and bursting. The multiple-plated or sandblasted surfaces resist rust and moisture and blend seamlessly with a variety of architectural styles.',
      images: [ createImageObject('3.jpg', 'Glass Fence Spigot Series'),],
      href: '/product/glass-fence-spigot',
    },
    {
      title: 'Glass Railing & Bathroom Clip',
      description:
        'Busrom Glass Clips are known for their simple and compact shape and precise clamping force. The product is made of aviation-grade stainless steel, which is passivated and coated through multiple passivation processes, taking into account both corrosion resistance and visual aesthetics. It is suitable for staircase guardrail, glass partition, bathroom wall and other installation scenarios, easy to install and strong performance.',
      images: [ createImageObject('4.jpg', 'Glass Clip Series'),],
      href: '/product/glass-clip',
    },
    {
      title: 'Glass Hinge',
      description:
        'Busrom Glass Hinge Series is designed for shower enclosures and glass doors, with a built-in silent cushioning mechanism and stainless steel shaft to ensure smooth, noiseless opening and closing. The hinges are waterproof and rustproof to withstand frequent use and humid environments, providing both safety and durability.',
      images: [ createImageObject('5.jpg', 'Glass Hinge Series'),],
      href: '/product/glass-hinge',
    },
    {
      title: 'Sliding Door Kit',
      description:
        'Busrom Sliding Door Kit integrates high-precision silent rollers, limiters, clamps, hooks and floor track guides, all components are made of high-quality aircraft grade stainless steel, to ensure the door is pushed and pulled smoothly and without shaking. It is suitable for sliding doors in bathrooms, shower rooms, interior partitions, and office scenarios.',
      images: [ createImageObject('6.jpg', 'Sliding Door Kit Series'),],
      href: '/product/sliding-door-kit',
    },
    {
      title: 'Bathroom & Door Handle',
      description:
        'Our Bathroom & Door Handle Series covers a wide range of shapes such as straight and curved, with materials ranging from brass to stainless steel available, and surface treatments supporting a variety of effects such as chrome plating, brushed, black titanium, and so on. Whether it\'s a shower door, interior sliding door, or exterior door, they all provide a comfortable grip and high-end texture.',
      images: [ createImageObject('7.jpg', 'Bathroom & Door Handle Series'),],
      href: '/product/bathroom-door-handle',
    },
    {
      title: 'Hidden Hook',
      description:
        'Busrom Hidden Hooks are cleverly integrated into the wall where you want them to be, with a simple, screwless appearance, silent and silent when opened, and blending in with the wall when closed. Suitable for checkrooms, bathrooms, entrance halls, display areas and other scenarios, taking into account the load-bearing capacity and aesthetic design, bringing a minimalist and practical storage experience to the space.',
      images: [ createImageObject('8.jpg', 'Hidden Hook Series'),],
      href: '/product/hidden-hook',
    },
  ],

  // Module 7: Featured Products
  featuredProducts: {
    title: 'Featured Products',
    description:
      'Explore a curated selection of our top-rated products, engineered for precision and designed for elegance.',
    viewAllButton: 'View All Products',
    categories: 'Product Categories',
    series: [
      {
        seriesTitle: 'Glass Standoff',
        products: [
          {
            image: createImageObject(
              'placeholder-standoff-1.jpg',
              'Minimalist Standoff'
            ),
            title: 'Minimalist Standoff',
            features: ['Ø50mm', 'SS316', 'Brushed Finish'],
          },
          {
            image: createImageObject(
              'placeholder-standoff-2.jpg',
              'Adjustable Standoff'
            ),
            title: 'Adjustable Standoff',
            features: ['Adjustable', 'SS304', 'Matte Black'],
          },
          {
            image: createImageObject(
              'placeholder-standoff-3.jpg',
              'Heavy-Duty Standoff'
            ),
            title: 'Heavy-Duty Standoff',
            features: ['Ø70mm', 'SS316L', 'Polished'],
          },
        ],
      },
      {
        seriesTitle: 'Glass Connected Fitting',
        products: [
          {
            image: createImageObject(
              'placeholder-fitting-1.jpg',
              'Flush Mount Connector'
            ),
            title: 'Flush Mount Connector',
            features: ['Wall-to-Glass', 'Fixed Angle', 'Zinc Alloy'],
          },
          {
            image: createImageObject(
              'placeholder-fitting-2.jpg',
              'Adjustable Corner'
            ),
            title: 'Adjustable Corner',
            features: ['90° to 180°', 'SS304', 'Heavy Load'],
          },
          {
            image: createImageObject(
              'placeholder-fitting-3.jpg',
              'T-Shape Adaptor'
            ),
            title: 'T-Shape Adaptor',
            features: ['T-Connection', 'SS316', 'Mirror Polish'],
          },
        ],
      },
      {
        seriesTitle: 'Glass Fence Spigot',
        products: [
          {
            image: createImageObject(
              'placeholder-spigot-1.jpg',
              'Square Core Drill'
            ),
            title: 'Square Core Drill',
            features: ['No Holes Needed', 'High Grip', 'Anodized Black'],
          },
          {
            image: createImageObject(
              'placeholder-spigot-2.jpg',
              'Round Deck Mount'
            ),
            title: 'Round Deck Mount',
            features: ['Bolt Down', 'Adjustable Tilt', 'Marine Grade'],
          },
          {
            image: createImageObject(
              'placeholder-spigot-3.jpg',
              'Slimline Spigot'
            ),
            title: 'Slimline Spigot',
            features: ['Low Profile', 'SS2205', 'Satin Finish'],
          },
        ],
      },
      {
        seriesTitle: 'Glass Clip',
        products: [
          {
            image: createImageObject(
              'placeholder-clip-1.jpg',
              'D-Shape Wall Clip'
            ),
            title: 'D-Shape Wall Clip',
            features: ['6-12mm Glass', 'Fixed 90°', 'Easy Installation'],
          },
          {
            image: createImageObject(
              'placeholder-clip-2.jpg',
              'Adjustable Corner Clip'
            ),
            title: 'Adjustable Corner Clip',
            features: ['1/4" Adjustment', 'SS316', 'Indoor/Outdoor'],
          },
          {
            image: createImageObject(
              'placeholder-clip-3.jpg',
              'Flat Base Clip'
            ),
            title: 'Flat Base Clip',
            features: ['Floor/Base Mount', 'Heavy Duty', 'Stainless Steel'],
          },
        ],
      },
      {
        seriesTitle: 'Glass Hinge',
        products: [
          {
            image: createImageObject(
              'placeholder-hinge-1.jpg',
              'Shower Hinge 90°'
            ),
            title: 'Shower Hinge 90°',
            features: ['Self-Closing', 'Glass-to-Wall', 'Brass Core'],
          },
          {
            image: createImageObject(
              'placeholder-hinge-2.jpg',
              'Offset Pivot Hinge'
            ),
            title: 'Offset Pivot Hinge',
            features: ['Heavy Door', 'Silent Swing', 'Stainless Steel'],
          },
          {
            image: createImageObject(
              'placeholder-hinge-3.jpg',
              'Free Swing Hinge 180°'
            ),
            title: 'Free Swing Hinge 180°',
            features: ['Double Action', 'No Hold Open', 'Matte Finish'],
          },
        ],
      },
      {
        seriesTitle: 'Sliding Door Kit',
        products: [
          {
            image: createImageObject(
              'placeholder-sliding-1.jpg',
              'Soft Close System'
            ),
            title: 'Soft Close System',
            features: ['Silent Operation', '150kg Load', 'Aluminum Track'],
          },
          {
            image: createImageObject(
              'placeholder-sliding-2.jpg',
              'Exposed Roller Kit'
            ),
            title: 'Exposed Roller Kit',
            features: ['Barn Style', 'Carbon Steel', 'Vintage Look'],
          },
          {
            image: createImageObject(
              'placeholder-sliding-3.jpg',
              'Pocket Door Kit'
            ),
            title: 'Pocket Door Kit',
            features: ['Space Saving', 'Top Hung', 'Adjustable Stopper'],
          },
        ],
      },
      {
        seriesTitle: 'Glass Railing',
        products: [
          {
            image: createImageObject(
              'placeholder-railing-1.jpg',
              'Post Railing Base'
            ),
            title: 'Post Railing Base',
            features: ['Side Mount', 'Adjustable Height', 'SS316'],
          },
          {
            image: createImageObject(
              'placeholder-railing-2.jpg',
              'Top Mount Balustrade'
            ),
            title: 'Top Mount Balustrade',
            features: ['Square Design', 'No Weld Required', 'Brushed Finish'],
          },
          {
            image: createImageObject(
              'placeholder-railing-3.jpg',
              'Handrail Bracket'
            ),
            title: 'Handrail Bracket',
            features: ['Round Tube Support', 'Concealed Fixing', 'Heavy Duty'],
          },
        ],
      },
      {
        seriesTitle: 'Bathroom Handle',
        products: [
          {
            image: createImageObject(
              'placeholder-handle-1.jpg',
              'Ladder Style Pull'
            ),
            title: 'Ladder Style Pull',
            features: ['Back-to-Back', '1200mm Length', 'Polished Chrome'],
          },
          {
            image: createImageObject(
              'placeholder-handle-2.jpg',
              'Knob Set Round'
            ),
            title: 'Knob Set Round',
            features: ['Privacy Lock', 'Satin Finish', 'Durable'],
          },
          {
            image: createImageObject(
              'placeholder-handle-3.jpg',
              'Finger Pull Flush'
            ),
            title: 'Finger Pull Flush',
            features: ['Sliding Door', 'Recessed Mount', 'Minimalist'],
          },
        ],
      },
      {
        seriesTitle: 'Hidden Hook',
        products: [
          {
            image: createImageObject(
              'placeholder-hook-1.jpg',
              'Retractable Coat Hook'
            ),
            title: 'Retractable Coat Hook',
            features: ['Fold Away', 'Zinc Alloy', 'High Capacity'],
          },
          {
            image: createImageObject(
              'placeholder-hook-2.jpg',
              'Wall Mounted Rack'
            ),
            title: 'Wall Mounted Rack',
            features: ['4 Hooks', 'Aluminum', 'Modern Design'],
          },
          {
            image: createImageObject(
              'placeholder-hook-3.jpg',
              'Heavy Duty Utility Hook'
            ),
            title: 'Heavy Duty Utility Hook',
            features: ['Garage Use', 'Stainless Steel', 'Corrosion Resistant'],
          },
        ],
      },
    ],
  },

  // Module 8: Brand Advantages
  brandAdvantages: {
    advantages: [
      'Performance & Innovation & Refined Design',
      'Ultra Pursue',
      'Carefully Developed Structure & Parts',
      'Strictly Selected Aviation-grade Materials',
      'Precision Performance & Premium Finishes',
      'Clean Aesthetics & Hidden Fixings',
      'IP-rated Components and Water or Electrical Separation for Wet Areas',
      'Smart-Ready Integration',
      'From Single-unit Orders To OEM/ODM',
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
    image: createImageObject('test.png', 'Busrom Brand Advantages'),
  },

  // Module 9: OEM/ODM
  oemOdm: {
    oem: {
      title: 'OEM',
      bgImage: createImageObject('1.jpg', 'OEM background'),
      image: createImageObject('2.jpg', 'OEM services'),
      description: [
        'At Busrom, we work closely with designers, retailers, and manufacturers to deliver end-to-end OEM/ODM services. We seamlessly integrate your ideas into glass hardware and provide bespoke glass solutions tailored to your needs.',
        'Ready to turn your concept into a producible product? Send us your vision — the Busrom team will get back to you within 24 hours with a personalized partnership proposal.',
      ],
    },
    odm: {
      title: 'ODM',
      bgImage: createImageObject('3.jpg', 'ODM background'),
      image: createImageObject('4.jpg', 'ODM services'),
      description: [
        'Fully Customized Structure & Size & Color',
        'Complete Solution - Just The Way You Want Them',
      ],
    },
  },

  // Module 10: Quote Steps
  quoteSteps: {
    title: 'Design Project Solutions',
    title2: 'Just Easy 5 Steps',
    subtitle: 'From concept to reality, made simple.',
    description:
      "We offer both standard and fully customized services, along with design recommendations and expert support, so you can easily visualize and refine your project's glass hardware before manufacturing begins — ensuring the final result is every bit as stunning as you imagined.",
    steps: [
      {
        text: 'Send Details (Size & Structure & Color)',
        image: createImageObject('1.jpg', 'Step 1: Send Details'),
      },
      {
        text: 'Get A Free Quote',
        image: createImageObject('2.jpg', 'Step 2: Get Quote'),
      },
      {
        text: 'Confirm The Final Plan',
        image: createImageObject('3.jpg', 'Step 3: Confirm Plan'),
      },
      {
        text: 'Production Begins',
        image: createImageObject('4.jpg', 'Step 4: Production'),
      },
      {
        text: 'Worldwide Delivery',
        image: createImageObject('5.jpg', 'Step 5: Delivery'),
      },
    ],
  },

  // Module 11: Main Form
  mainForm: {
    placeholderName: 'Your Name',
    placeholderEmail: 'Your Email',
    placeholderWhatsapp: 'WhatsApp Number',
    placeholderCompany: 'Company Name',
    placeholderMessage: 'Message',
    placeholderVerify: 'Verify Code',
    buttonText: 'Send',
    designTextLeft: 'Premium Architectural Glass Hardware',
    designTextRight: 'Customized Structure and Color',
    image1: createImageObject('10.jpg', 'Contact form visual'),
    image2: createImageObject('11.jpg', 'Get in touch with Busrom'),
  },

  // Module 12: Why Choose Busrom
  whyChooseBusrom: {
    title: 'Why Choose',
    title2: 'Busrom',
    reasons: [
      {
        title: 'Original & Proprietary Design',
        description: 'Exclusive hardware that blends form and function.',
        image: createImageObject(
          'why-choose-us/1.jpg',
          'Original proprietary design'
        ),
      },
      {
        title: 'Relentless Quality & Integration',
        description:
          'Strict material selection, testing, and smart-home readiness for reliable safety, function, and finish.',
        image: createImageObject(
          'why-choose-us/2.jpg',
          'Quality and integration'
        ),
      },
      {
        title: 'Factory-direct Production',
        description:
          'Full vertical manufacturing for tighter quality control, faster lead times, and better pricing.',
        image: createImageObject(
          'why-choose-us/3.jpg',
          'Factory-direct production'
        ),
      },
      {
        title: 'Years of Global Expertise',
        description:
          'Experienced teams and market insight that deliver durable, high-performance components.',
        image: createImageObject('why-choose-us/4.jpg', 'Global expertise'),
      },
      {
        title: 'Collaborative R&D Partnership',
        description:
          'Co-engineer custom solutions that turn your concepts into production-ready reality.',
        image: createImageObject('why-choose-us/5.jpg', 'R&D partnership'),
      },
    ],
  },

  // Module 13: Case Studies
  caseStudies: {
    title: 'Application Case Studies',
    description:
      'See how Busrom hardware brings ambitious architectural visions to life across the globe.',
    applications: [
      {
        items: [
          {
            series: 'Glass Standoff',
            slug: 'lakeview-villa-staircase',
            image: createImageObject(
              'case-studies/1.jpg',
              'Lakeview Villa Staircase - Glass Standoff Application'
            ),
          },
          {
            series: 'Glass Connected Fitting',
            slug: 'skycrest-tower-balustrades',
            image: createImageObject(
              'case-studies/2.jpg',
              'Skycrest Tower Balustrades - Glass Connected Fitting'
            ),
          },
          {
            series: 'Glass Fence Spigot',
            slug: 'azure-hotel-showers',
            image: createImageObject(
              'case-studies/3.jpg',
              'Azure Hotel Shower Enclosures'
            ),
          },
        ],
      },
      {
        items: [
          {
            series: 'Glass Clip',
            slug: 'city-museum-glass-wall',
            image: createImageObject(
              'case-studies/4.jpg',
              'City Museum Structural Glass Wall'
            ),
          },
          {
            series: 'Glass Hinge',
            slug: 'lux-boutique-shelving',
            image: createImageObject(
              'case-studies/5.jpg',
              'LUX Boutique Shelving System'
            ),
          },
          {
            series: 'Sliding Door Kit',
            slug: 'airport-railings',
            image: createImageObject(
              'case-studies/6.jpg',
              'International Airport Railings'
            ),
          },
        ],
      },
      {
        items: [
          {
            series: 'Bathroom Handle',
            slug: 'heritage-building-doors',
            image: createImageObject(
              'case-studies/7.jpg',
              'Heritage Building Glass Doors'
            ),
          },
          {
            series: 'Hidden Hook',
            slug: 'corporate-hq-partitions',
            image: createImageObject(
              'case-studies/8.jpg',
              'Corporate HQ Partition Walls'
            ),
          },
          {
            series: 'Glass Standoff',
            slug: 'lakeview-villa-staircase',
            image: createImageObject(
              'case-studies/1.jpg',
              'Lakeview Villa Additional View'
            ),
          },
        ],
      },
    ],
  },

  // Module 14: Brand Analysis
  brandAnalysis: {
    analysis: {
      title: 'Bus',
      title2: 'rom',
      text: 'Buffer & Bridge',
      text2: 'Room & Space',
    },
    centers: [
      {
        title: 'Brand Center',
        description:
          "At Busrom, we don't just create structures — we turn dreams into reality. Our vision is to make every glass installation safe without sacrificing elegance, so you'll never have to worry about finding the right solution again.",
      },
      {
        title: 'Project Center',
        description:
          "Here we bring together Busrom's selected engineering cases from around the world. whether it is a commercial,residential or public project, we are committed to providing professional, efficient and customized indoor & outdoor space solutions.",
      },
      {
        title: 'Service Center',
        description:
          'On journey to excellence, Busrom is always your trusted partner. Our professional Team deliver worry-free service experience, saving your time, energy, and money.',
      },
    ],
  },

  // Module 15: Brand Value
  brandValue: {
    title: 'Brand value',
    subtitle: 'embodiment',
    param1: {
      title: '',
      description: 'More Than Glass Hardware',
      image: createImageObject(
        'BrandValue/BusromBrandValue1.png',
        'More than glass hardware'
      ),
    },
    param2: {
      title: '',
      description: 'Precision details for every glass space',
      image: createImageObject(
        'BrandValue/BusromBrandValue2.png',
        'Precision details'
      ),
    },
    slogan: {
      title: 'Our Slogan',
      description: 'Craft Your Glass Details',
      image: createImageObject(
        'BrandValue/BusromBrandValue3.png',
        'Busrom slogan'
      ),
    },
    value: {
      title: 'Our Value',
      description:
        'Precision · Safety · Design — Support That Protects Both Form and Function',
      image: createImageObject(
        'BrandValue/BusromBrandValue4.png',
        'Busrom core values'
      ),
    },
    vision: {
      title: 'Our Vision',
      description:
        'Millions of Spaces — Safer and More Opening to Enjoy Our Products',
      image: createImageObject(
        'BrandValue/BusromBrandValue5.png',
        'Busrom vision'
      ),
    },
  },

  // Module 16: Footer
  footer: {
    form: {
      title: 'Contact Us',
      placeholders: {
        name: 'Name',
        email: 'Email',
        message: 'Message',
      },
      buttonText: 'Submit',
    },
    contact: {
      title: 'Busrom',
      emailLabel: 'Email',
      email: 'info@busromhouse.com',
      afterSalesLabel: 'After Sales',
      afterSales: 'support@busromhouse.com',
      whatsappLabel: 'WhatsApp',
      whatsapp: '+86 13426931306',
    },
    notice: {
      title: 'Official Notice',
      lines: [
        'Official Email Contact: info@busromhouse.com.',
        'Any contact from non-official sources is unauthorized and may be fraudulent—do not engage or make payments.',
        'For verification or any questions, contact us via the official email or through our website at www.busromhouse.com',
        'Busrom Team',
      ],
    },
  },
};