
# Home Content REST API Documentation

## Overview

这份文档描述了 Busrom 网站首页内容的 REST API 规范。

### 架构决策 (重要⚠️)

**为什么需要REST API转换层?**

Keystone GraphQL返回的数据包含:
- ✅ **多语言字段**: 所有文本都是JSON格式 `{en: "...", zh: "...", ...}` (24种语言)
- ✅ **复杂的图片结构**: 包含variants(6种尺寸)和多语言altText
- ✅ **嵌套的关系数据**: 多层级的关联数据结构

**直接在组件中使用会导致**:
- ❌ 每个组件都需要调用`getLocalizedContent(field, locale)`提取文本
- ❌ 每个组件都需要调用`getOptimizedImageUrl(image, size)`选择图片
- ❌ 组件代码复杂,充斥着数据转换逻辑
- ❌ Mock数据难以维护(需要模拟完整的GraphQL结构)

**REST API转换层的优势**:
- ✅ 组件接收简单的单语言数据,代码简洁
- ✅ 数据转换逻辑集中在一处,易于维护
- ✅ Mock数据直接模拟API响应,开发高效
- ✅ 当Keystone schema变化时,只需修改API层

### 数据流向

```
Keystone GraphQL (多语言+复杂结构)
  ↓
Next.js API Route (/app/api/home/route.ts)
  ↓ 使用 lib/localization.ts 提取单语言
  ↓ 使用 lib/image-utils.ts 选择图片variant
  ↓ 返回扁平化的单语言JSON
React组件 (简单数据结构)
```

这份文档描述了**转换后**的REST API响应格式,也就是React组件实际接收到的数据结构。

## Base URL

```
/api/home
```

## Authentication

目前为公开端点，无需认证。

---

## Common Data Types

### ImageObject

所有图片使用统一的 `ImageObject` 格式以支持 SEO 和裁剪控制：

```typescript
interface ImageObject {
  url: string;                 // S3 完整 URL
  altText: string;             // 当前语言的 Alt 文本
  thumbnailUrl?: string;       // S3 缩略图 URL (可选)
  cropFocalPoint: {
    x?: string;   // 横向位置 (0-100)，0=最左，50=居中，100=最右
    y?: string;   // 纵向位置 (0-100)，0=最上，50=居中，100=最下
  }
}
```

### 裁剪对齐说明

- cropFocalPoint: 图片的焦点位置，用于任意比例裁剪时保持焦点可见
  - x: 横向位置 (0-100)，0=最左，50=居中，100=最右
  - y: 纵向位置 (0-100)，0=最上，50=居中，100=最下

### LocaleParameter

通过 query string 指定语言：
- `?locale=en` - 英文
- `?locale=zh` - 中文

---

## Endpoints

### 1. Get Complete Home Content

获取首页所有内容（单个语言）。

**Request:**
```http
GET /api/home?locale=en
```

**Query Parameters:**
| Parameter | Type   | Required | Default | Description |
|-----------|--------|----------|---------|-------------|
| locale    | string | No       | en      | 语言代码 (en, zh) |

**Response: 200 OK**

```json
{
  "locale": "en",
  "heroBanner": [...],
  "productSeriesCarousel": [...],
  "serviceFeatures": {...},
  "sphere3d": {...},
  "simpleCta": {...},
  "seriesIntro": [...],
  "featuredProducts": {...},
  "brandAdvantages": {...},
  "oemOdm": {...},
  "quoteSteps": {...},
  "mainForm": {...},
  "whyChooseBusrom": {...},
  "caseStudies": {...},
  "brandAnalysis": {...},
  "brandValue": {...},
  "footer": {...}
}
```

---

### 2. Get Hero Banner

获取首页大轮播内容。

**Request:**
```http
GET /api/home/hero-banner?locale=en
```

**Response: 200 OK**

```json
{
  "locale": "en",
  "data": [
    {
      "title": "Glass Standoff",
      "features": [
        "Customized Minimalist Modern Glass Standoff",
        "Redefining Transparency & Modern Design",
        "Invisible Strength",
        "Adjustable Flexibility",
        "Superior Durability"
      ],
      "images": [
        {
          "url": "https://s3.amazonaws.com/.../1.jpg",
          "altText": "Glass Standoff main view",
          "thumbnailUrl": "https://s3.amazonaws.com/.../1-thumb.jpg"
        },
        {
          "url": "https://s3.amazonaws.com/.../banner-test/bannerTest1.svg",
          "altText": "Glass Standoff detail view"
        },
        {
          "url": "https://s3.amazonaws.com/.../3.jpg",
          "altText": "Glass Standoff installation"
        },
        {
          "url": "https://s3.amazonaws.com/.../4.jpg",
          "altText": "Glass Standoff in use"
        }
      ]
    }
    // ... 其他 8 个轮播项
  ]
}
```

**Data Schema:**

```typescript
interface HeroBannerItem {
  title: string;
  features: string[];
  images: ImageObject[]; // 4 张图片
}

interface HeroBannerResponse {
  locale: string;
  data: HeroBannerItem[];
}
```

---

### 3. Get Product Series Carousel

获取产品系列轮播内容。

**Request:**
```http
GET /api/home/product-series?locale=en
```

**Response: 200 OK**

```json
{
  "locale": "en",
  "data": [
    {
      "key": "glass-standoff",
      "order": 1,
      "name": "Glass Standoff",
      "image": {
        "url": "https://s3.amazonaws.com/.../glass_standoff.png",
        "altText": "Glass Standoff Series",
        "thumbnailUrl": "https://s3.amazonaws.com/.../glass_standoff-thumb.png"
      },
      "href": "/product/glass-standoff"
    }
    // ... 其他 9 个产品系列
  ]
}
```

**Data Schema:**

```typescript
interface ProductSeriesItem {
  key: string;
  order: number;
  name: string;
  image: ImageObject;
  href: string;
}

interface ProductSeriesResponse {
  locale: string;
  data: ProductSeriesItem[];
}
```

---

### 4. Get Service Features

获取服务特点内容。

**Request:**
```http
GET /api/home/service-features?locale=en
```

**Response: 200 OK**

```json
{
  "locale": "en",
  "data": {
    "title": "Premium Architectural Glass Hardware",
    "subtitle": "Fully Customized Glass Hardware by Busrom...",
    "features": [
      {
        "title": "Any Size, Any Structure, Any Shape",
        "shortTitle": "Any Size",
        "description": "Whether it's framed or frameless partitions...",
        "images": [
          {
            "url": "https://s3.amazonaws.com/.../1.jpg",
            "altText": "Custom size glass hardware"
          },
          {
            "url": "https://s3.amazonaws.com/.../2.jpg",
            "altText": "Various structure options"
          }
          // ... 更多图片
        ]
      }
      // ... 其他 4 个特点
    ]
  }
}
```

**Data Schema:**

```typescript
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

interface ServiceFeaturesResponse {
  locale: string;
  data: ServiceFeaturesData;
}
```

---

### 5. Get 3D Sphere

获取 3D 球体内容（目前为空对象）。

**Request:**
```http
GET /api/home/sphere-3d?locale=en
```

**Response: 200 OK**

```json
{
  "locale": "en",
  "data": {}
}
```

---

### 6. Get Simple CTA

获取简易 CTA 引导内容。

**Request:**
```http
GET /api/home/simple-cta?locale=en
```

**Response: 200 OK**

```json
{
  "locale": "en",
  "data": {
    "title": "Ready to Start",
    "title2": "Your Project?",
    "subtitle": "Let's Build Something Exceptional!",
    "description": "Connect with Busrom's Team for precision hardware...",
    "buttonText": "Contact Us Now！",
    "images": [
      {
        "url": "https://s3.amazonaws.com/.../1.jpg",
        "altText": "Contact Busrom team"
      },
      {
        "url": "https://s3.amazonaws.com/.../2.jpg",
        "altText": "Start your project"
      },
      {
        "url": "https://s3.amazonaws.com/.../3.jpg",
        "altText": "Build with Busrom"
      }
    ]
  }
}
```

**Data Schema:**

```typescript
interface SimpleCtaData {
  title: string;
  title2: string;
  subtitle: string;
  description: string;
  buttonText: string;
  images: ImageObject[];
}

interface SimpleCtaResponse {
  locale: string;
  data: SimpleCtaData;
}
```

---

### 7. Get Series Introduction

获取系列产品介绍内容。

**Request:**
```http
GET /api/home/series-intro?locale=en
```

**Response: 200 OK**

```json
{
  "locale": "en",
  "data": [
    {
      "title": "Glass Standoff",
      "description": "Designed for glass panel fixing, Busrom Glass Standoff Series...",
      "images": [
        {
        "url": "https://s3.amazonaws.com/.../1.jpg",
        "altText": "Glass Standoff Series"
        }
        // ... 更多图片
      ],
      "href": "/product/glass-standoff"
    }
    // ... 其他 9 个系列
  ]
}
```

**Data Schema:**

```typescript
interface SeriesIntroItem {
  title: string;
  description: string;
  images: ImageObject[];
  href: string;
}

interface SeriesIntroResponse {
  locale: string;
  data: SeriesIntroItem[];
}
```

---

### 8. Get Featured Products

获取精选产品内容。

**Request:**
```http
GET /api/home/featured-products?locale=en
```

**Response: 200 OK**

```json
{
  "locale": "en",
  "data": {
    "title": "Featured Products",
    "description": "Explore a curated selection of our top-rated products...",
    "viewAllButton": "View All Products",
    "categories": "Product Categories",
    "series": [
      {
        "seriesTitle": "Glass Standoff",
        "products": [
          {
            "image": {
              "url": "https://s3.amazonaws.com/.../placeholder-standoff-1.jpg",
              "altText": "Minimalist Standoff"
            },
            "title": "Minimalist Standoff",
            "features": ["Ø50mm", "SS316", "Brushed Finish"]
          }
          // ... 每个系列 3 个产品
        ]
      }
      // ... 其他 9 个系列
    ]
  }
}
```

**Data Schema:**

```typescript
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

interface FeaturedProductsResponse {
  locale: string;
  data: FeaturedProductsData;
}
```

---

### 9. Get Brand Advantages

获取品牌优势内容。

**Request:**
```http
GET /api/home/brand-advantages?locale=en
```

**Response: 200 OK**

```json
{
  "locale": "en",
  "data": {
    "advantages": [
      "Performance & Innovation & Refined Design",
      "Ultra Pursue",
      "Carefully Developed Structure & Parts",
      "Strictly Selected Aviation-grade Materials",
      "Precision Performance & Premium Finishes",
      "Clean Aesthetics & Hidden Fixings",
      "IP-rated Components and Water or Electrical Separation for Wet Areas",
      "Smart-Ready Integration",
      "From Single-unit Orders To OEM/ODM"
    ],
    "icons": [
      "Sparkles",
      "Target",
      "Component",
      "ShieldCheck",
      "Gauge",
      "EyeOff",
      "Waves",
      "Cpu",
      "Factory"
    ],
    "image": {
      "url": "https://s3.amazonaws.com/.../test.png",
      "altText": "Busrom Brand Advantages"
    }
  }
}
```

**Data Schema:**

```typescript
interface BrandAdvantagesData {
  advantages: string[];
  icons: string[]; // Lucide React 图标名称
  image: ImageObject;
}

interface BrandAdvantagesResponse {
  locale: string;
  data: BrandAdvantagesData;
}
```

---

### 10. Get OEM/ODM Information

获取 OEM/ODM 合作信息。

**Request:**
```http
GET /api/home/oem-odm?locale=en
```

**Response: 200 OK**

```json
{
  "locale": "en",
  "data": {
    "oem": {
      "title": "OEM",
      "bgImage": {
        "url": "https://s3.amazonaws.com/.../1.jpg",
        "altText": "OEM background"
      },
      "image": {
        "url": "https://s3.amazonaws.com/.../2.jpg",
        "altText": "OEM services"
      },
      "description": [
        "At Busrom, we work closely with designers, retailers...",
        "Ready to turn your concept into a producible product?..."
      ]
    },
    "odm": {
      "title": "ODM",
      "bgImage": {
        "url": "https://s3.amazonaws.com/.../3.jpg",
        "altText": "ODM background"
      },
      "image": {
        "url": "https://s3.amazonaws.com/.../4.jpg",
        "altText": "ODM services"
      },
      "description": [
        "Fully Customized Structure & Size & Color",
        "Complete Solution - Just The Way You Want Them"
      ]
    }
  }
}
```

**Data Schema:**

```typescript
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

interface OemOdmResponse {
  locale: string;
  data: OemOdmData;
}
```

---

### 11. Get Quote Steps

获取报价流程步骤。

**Request:**
```http
GET /api/home/quote-steps?locale=en
```

**Response: 200 OK**

```json
{
  "locale": "en",
  "data": {
    "title": "Design Project Solutions",
    "title2": "Just Easy 5 Steps",
    "subtitle": "From concept to reality, made simple.",
    "description": "We offer both standard and fully customized services...",
    "steps": [
      {
        "text": "Send Details (Size & Structure & Color)",
        "image": {
          "url": "https://s3.amazonaws.com/.../1.jpg",
          "altText": "Step 1: Send Details"
        }
      },
      {
        "text": "Get A Free Quote",
        "image": {
          "url": "https://s3.amazonaws.com/.../2.jpg",
          "altText": "Step 2: Get Quote"
        }
      }
      // ... 其他 3 个步骤
    ]
  }
}
```

**Data Schema:**

```typescript
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

interface QuoteStepsResponse {
  locale: string;
  data: QuoteStepsData;
}
```

---

### 12. Get Main Form Configuration

获取主表单配置（扁平化结构）。

**Request:**
```http
GET /api/home/main-form?locale=en
```

**Response: 200 OK**

```json
{
  "locale": "en",
  "data": {
    "placeholderName": "Your Name",
    "placeholderEmail": "Your Email",
    "placeholderWhatsapp": "WhatsApp Number",
    "placeholderCompany": "Company Name",
    "placeholderMessage": "Message",
    "placeholderVerify": "Verify Code",
    "buttonText": "Send",
    "designTextLeft": "Premium Architectural Glass Hardware",
    "designTextRight": "Customized Structure and Color",
    "image1": {
      "url": "https://s3.amazonaws.com/.../10.jpg",
      "altText": "Contact form visual"
    },
    "image2": {
      "url": "https://s3.amazonaws.com/.../11.jpg",
      "altText": "Get in touch with Busrom"
    }
  }
}
```

**Data Schema:**

```typescript
interface MainFormData {
  // 表单占位符
  placeholderName: string;
  placeholderEmail: string;
  placeholderWhatsapp: string;
  placeholderCompany: string;
  placeholderMessage: string;
  placeholderVerify: string;

  // 按钮文字
  buttonText: string;

  // 设计文字
  designTextLeft: string;
  designTextRight: string;

  // 图片
  image1: ImageObject | null;
  image2: ImageObject | null;
}

interface MainFormResponse {
  locale: string;
  data: MainFormData;
}
```

---

### 13. Get Why Choose Busrom

获取"为什么选择 Busrom"内容。

**Request:**
```http
GET /api/home/why-choose-busrom?locale=en
```

**Response: 200 OK**

```json
{
  "locale": "en",
  "data": {
    "title": "Why Choose",
    "title2": "Busrom",
    "reasons": [
      {
        "title": "Original & Proprietary Design",
        "description": "Exclusive hardware that blends form and function.",
        "image": {
          "url": "https://s3.amazonaws.com/.../why-choose-us/1.jpg",
          "altText": "Original proprietary design"
        }
      }
      // ... 其他 4 个原因
    ]
  }
}
```

**Data Schema:**

```typescript
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

interface WhyChooseBusromResponse {
  locale: string;
  data: WhyChooseBusromData;
}
```

---

### 14. Get Case Studies

获取应用案例内容。

**Request:**
```http
GET /api/home/case-studies?locale=en
```

**Response: 200 OK**

```json
{
  "locale": "en",
  "data": {
    "title": "Application Case Studies",
    "description": "See how Busrom hardware brings ambitious architectural visions...",
    "applications": [
      {
        "items": [
          {
            "series": "Glass Standoff",
            "slug": "lakeview-villa-staircase",
            "image": {
              "url": "https://s3.amazonaws.com/.../case-studies/1.jpg",
              "altText": "Lakeview Villa Staircase"
            },
          },
          {
            "series": "Glass Standoff",
            "slug": "lakeview-villa-staircase",
            "image": {
              "url": "https://s3.amazonaws.com/.../case-studies/1.jpg",
              "altText": "Lakeview Villa Staircase"
            },
          },
          {
            "series": "Glass Standoff",
            "slug": "lakeview-villa-staircase",
            "image": {
              "url": "https://s3.amazonaws.com/.../case-studies/1.jpg",
              "altText": "Lakeview Villa Staircase"
            },
          },
        ]
        
        
      }
      // ... 其他 9 个案例
    ]
  }
}
```

**Data Schema:**

```typescript
interface CaseStudyApplication {
  items: CaseStudyItem[];
}

interface CaseStudyItem {
  series: string;
  slug: string;
  image: ImageObject;
}

interface CaseStudiesData {
  title: string;
  description: string;
  applications: CaseStudyApplication[];
}

interface CaseStudiesResponse {
  locale: string;
  data: CaseStudiesData;
}
```

---

### 15. Get Brand Analysis

获取品牌分析内容。

**Request:**
```http
GET /api/home/brand-analysis?locale=en
```

**Response: 200 OK**

```json
{
  "locale": "en",
  "data": {
    "analysis": {
      "title": "Bus",
      "title2": "rom",
      "text": "Bus--Buffer & Bridge",
      "text2": "rom--Room & Space"
    },
    "centers": [
      {
        "title": "Brand Center",
        "description": "At Busrom, we don't just create structures..."
      },
      {
        "title": "Project Center",
        "description": "Here we bring together Busrom's selected engineering cases..."
      },
      {
        "title": "Service Center",
        "description": "On journey to excellence, Busrom is always your trusted partner..."
      }
    ]
  }
}
```

**Data Schema:**

```typescript
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

interface BrandAnalysisResponse {
  locale: string;
  data: BrandAnalysisData;
}
```

---

### 16. Get Brand Value

获取品牌价值体现内容。

**Request:**
```http
GET /api/home/brand-value?locale=en
```

**Response: 200 OK**

```json
{
  "locale": "en",
  "data": {
    "title": "Brand value",
    "subtitle": "embodiment",
    "param1": {
      "title": "",
      "description": "More Than Glass Hardware",
      "image": {
        "url": "https://s3.amazonaws.com/.../BrandValue/BusromBrandValue1.png",
        "altText": "More than glass hardware"
      }
    },
    "param2": {
      "title": "",
      "description": "Precision details for every glass space",
      "image": {
        "url": "https://s3.amazonaws.com/.../BrandValue/BusromBrandValue2.png",
        "altText": "Precision details"
      }
    },
    "slogan": {
      "title": "Our Slogan",
      "description": "Craft Your Glass Details",
      "image": {
        "url": "https://s3.amazonaws.com/.../BrandValue/BusromBrandValue3.png",
        "altText": "Busrom slogan"
      }
    },
    "value": {
      "title": "Our Value",
      "description": "Precision · Safety · Design — Support That Protects Both Form and Function",
      "image": {
        "url": "https://s3.amazonaws.com/.../BrandValue/BusromBrandValue4.png",
        "altText": "Busrom core values"
      }
    },
    "vision": {
      "title": "Our Vision",
      "description": "Millions of Spaces — Safer and More Opening to Enjoy Our Products",
      "image": {
        "url": "https://s3.amazonaws.com/.../BrandValue/BusromBrandValue5.png",
        "altText": "Busrom vision"
      }
    }
  }
}
```

**Data Schema:**

```typescript
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

interface BrandValueResponse {
  locale: string;
  data: BrandValueData;
}
```

---

### 17. Get Footer Configuration

获取页脚配置内容（联系表单、联系信息、官方声明）。

**CMS 字段映射:**
- Footer 模型是 Singleton
- 所有字段使用 `MultilingualJSONField`（支持24语言自动翻译）
- 字段结构已扁平化，便于管理

**Request:**
```http
GET /api/home/footer?locale=en
```

**Response: 200 OK**

```json
{
  "locale": "en",
  "data": {
    "form": {
      "title": "Contact Us",
      "placeholders": {
        "name": "Your Name",
        "email": "Your Email",
        "message": "Your Message"
      },
      "buttonText": "Send Message"
    },
    "contact": {
      "title": "Contact Us",
      "emailLabel": "Email",
      "email": "info@busromhouse.com",
      "afterSalesLabel": "After Sales",
      "afterSales": "support@busromhouse.com",
      "whatsappLabel": "WhatsApp",
      "whatsapp": "+86 13426931306"
    },
    "notice": {
      "title": "Official Notice",
      "lines": [
        "Official Email Contact: info@busromhouse.com.",
        "Any contact from non-official sources is unauthorized and fraudulent.",
        "For verification or any questions, contact us via the official email above.",
        "Busrom Team"
      ]
    }
  }
}
```

**Data Schema:**

```typescript
interface FooterFormConfig {
  title: string;              // 来自 formTitle
  placeholders: {
    name: string;            // 来自 formPlaceholderName
    email: string;           // 来自 formPlaceholderEmail
    message: string;         // 来自 formPlaceholderMessage
  };
  buttonText: string;        // 来自 formButtonText
}

interface FooterContactInfo {
  title: string;             // 来自 contactTitle
  emailLabel: string;        // 来自 contactEmailLabel
  email: string;             // 来自 contactEmail
  afterSalesLabel: string;   // 来自 afterSalesLabel
  afterSales: string;        // 来自 afterSalesEmail
  whatsappLabel: string;     // 来自 whatsappLabel
  whatsapp: string;          // 来自 whatsappNumber
}

interface FooterNotice {
  title: string;             // 来自 officialNoticeTitle
  lines: string[];           // 来自 [officialNoticeLine1, officialNoticeLine2, officialNoticeLine3, officialNoticeLine4]
}

interface FooterData {
  form: FooterFormConfig;
  contact: FooterContactInfo;
  notice: FooterNotice;
}

interface FooterResponse {
  locale: string;
  data: FooterData;
}
```

**CMS 字段清单 (Footer 单例模型):**

```typescript
// 表单配置 (5个字段)
formTitle: MultilingualJSON              // 表单标题
formPlaceholderName: MultilingualJSON    // 姓名占位符
formPlaceholderEmail: MultilingualJSON   // 邮箱占位符
formPlaceholderMessage: MultilingualJSON // 留言占位符
formButtonText: MultilingualJSON         // 按钮文字

// 联系信息 (7个字段)
contactTitle: MultilingualJSON           // 联系标题
contactEmailLabel: MultilingualJSON      // 邮箱标签
contactEmail: MultilingualJSON           // 联系邮箱
afterSalesLabel: MultilingualJSON        // 售后标签
afterSalesEmail: MultilingualJSON        // 售后邮箱
whatsappLabel: MultilingualJSON          // WhatsApp标签
whatsappNumber: MultilingualJSON         // WhatsApp号码

// 官方声明 (5个字段)
officialNoticeTitle: MultilingualJSON    // 声明标题
officialNoticeLine1: MultilingualJSON    // 第1行
officialNoticeLine2: MultilingualJSON    // 第2行
officialNoticeLine3: MultilingualJSON    // 第3行
officialNoticeLine4: MultilingualJSON    // 第4行

// 状态字段
internalLabel: string                    // 内部标识
enabled: boolean                         // 是否启用
status: 'DRAFT' | 'PUBLISHED'           // 发布状态
publishedAt: Date                        // 发布时间
updatedAt: Date                          // 更新时间
```

**API 实现逻辑:**

```typescript
// 后端需要将扁平化的字段转换为嵌套结构
const footer = await context.query.Footer.findOne({
  where: { status: { equals: 'PUBLISHED' } }
});

const response = {
  locale,
  data: {
    form: {
      title: footer.formTitle[locale],
      placeholders: {
        name: footer.formPlaceholderName[locale],
        email: footer.formPlaceholderEmail[locale],
        message: footer.formPlaceholderMessage[locale],
      },
      buttonText: footer.formButtonText[locale],
    },
    contact: {
      title: footer.contactTitle[locale],
      emailLabel: footer.contactEmailLabel[locale],
      email: footer.contactEmail[locale],
      afterSalesLabel: footer.afterSalesLabel[locale],
      afterSales: footer.afterSalesEmail[locale],
      whatsappLabel: footer.whatsappLabel[locale],
      whatsapp: footer.whatsappNumber[locale],
    },
    notice: {
      title: footer.officialNoticeTitle[locale],
      lines: [
        footer.officialNoticeLine1[locale],
        footer.officialNoticeLine2[locale],
        footer.officialNoticeLine3[locale],
        footer.officialNoticeLine4[locale],
      ].filter(Boolean), // 过滤掉空行
    },
  },
};
```

---

## Error Responses

### 400 Bad Request

```json
{
  "error": {
    "code": "INVALID_LOCALE",
    "message": "Invalid locale parameter. Supported locales: en, zh",
    "timestamp": "2025-11-04T12:00:00.000Z"
  }
}
```

### 404 Not Found

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "The requested resource was not found",
    "timestamp": "2025-11-04T12:00:00.000Z"
  }
}
```

### 500 Internal Server Error

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An internal server error occurred",
    "timestamp": "2025-11-04T12:00:00.000Z"
  }
}
```

---

## Implementation Notes

### Frontend (Next.js) Implementation

在前端创建 API 路由来转换 GraphQL 到 REST：

```typescript
// app/api/home/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const locale = searchParams.get('locale') || 'en';
  
  // 验证 locale
  if (!['en', 'zh'].includes(locale)) {
    return NextResponse.json(
      {
        error: {
          code: 'INVALID_LOCALE',
          message: 'Invalid locale parameter. Supported locales: en, zh',
          timestamp: new Date().toISOString()
        }
      },
      { status: 400 }
    );
  }
  
  try {
    // 调用 GraphQL API
    const graphqlResponse = await fetch(process.env.GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          query GetHomeContent($locale: String!) {
            homeContent(locale: $locale) {
              heroBanner { ... }
              productSeriesCarousel { ... }
              # ... 其他字段
            }
          }
        `,
        variables: { locale }
      })
    });
    
    const data = await graphqlResponse.json();
    
    // 转换图片格式
    const transformedData = transformImagesInData(data);
    
    return NextResponse.json({
      locale,
      ...transformedData
    });
    
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An internal server error occurred',
          timestamp: new Date().toISOString()
        }
      },
      { status: 500 }
    );
  }
}

function transformImagesInData(data: any): any {
  // 递归转换所有图片字段为 ImageObject 格式
  // 实现细节...
}
```

### Image Transformation

所有原始图片路径需要转换为完整的 ImageObject：

```typescript
function transformImage(
  imagePath: string, 
  altText: string, 
  locale: string
): ImageObject {
  return {
    url: `${process.env.S3_BASE_URL}/${imagePath}`,
    altText: altText,
    thumbnailUrl: imagePath.includes('.jpg') || imagePath.includes('.png')
      ? `${process.env.S3_BASE_URL}/${imagePath.replace(/\.(jpg|png)$/, '-thumb.$1')}`
      : undefined
  };
}
```

### Caching Strategy

建议实现缓存策略以提升性能：

```typescript
// 使用 Next.js 的缓存
export const revalidate = 3600; // 1 小时

// 或使用 Redis
import { redis } from '@/lib/redis';

const cacheKey = `home:${locale}`;
const cached = await redis.get(cacheKey);

if (cached) {
  return NextResponse.json(JSON.parse(cached));
}

// ... 获取数据后缓存
await redis.set(cacheKey, JSON.stringify(data), 'EX', 3600);
```

---

## Testing Examples

### Using cURL

```bash
# 获取英文完整内容
curl -X GET "http://localhost:3000/api/home?locale=en"

# 获取中文轮播图
curl -X GET "http://localhost:3000/api/home/hero-banner?locale=zh"

# 获取产品系列
curl -X GET "http://localhost:3000/api/home/product-series?locale=en"
```

### Using JavaScript Fetch

```javascript
// 获取完整首页内容
const response = await fetch('/api/home?locale=en');
const data = await response.json();

// 获取特定模块
const heroBanner = await fetch('/api/home/hero-banner?locale=zh')
  .then(res => res.json());
```

---

## Versioning

当前版本: **v1**

如需版本控制，可在 URL 中添加版本号：

```
/api/v1/home?locale=en
/api/v2/home?locale=en
```

---

## Rate Limiting

建议实现速率限制：

- 每个 IP: 100 请求/分钟
- 完整内容端点: 10 请求/分钟
- 模块端点: 30 请求/分钟

---

## SEO Considerations

### Alt Text 生成规则

为所有图片提供有意义的 alt text：

1. **产品图片**: `{产品名称} - {特性描述}`
2. **案例图片**: `{项目名称} - {视角描述}`
3. **功能图片**: `{功能标题} - {场景描述}`

### 缩略图规则

- 宽度: 400px
- 格式: WebP (降级为 JPEG)
- 质量: 80%
- 命名: `{original-name}-thumb.{ext}`

---

## Migration Checklist

从当前 TypeScript 对象迁移到 REST API：

- [ ] 在 Keystone 6 中定义数据模型
- [ ] 创建 GraphQL schema
- [ ] 实现 Next.js API 路由
- [ ] 转换所有图片路径为 S3 URLs
- [ ] 为所有图片添加 alt text
- [ ] 实现缓存策略
- [ ] 添加错误处理
- [ ] 实现速率限制
- [ ] 编写单元测试
- [ ] 更新前端组件以使用 API

---