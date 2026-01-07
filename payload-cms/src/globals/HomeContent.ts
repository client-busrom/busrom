/**
 * HomeContent Global - Homepage Section Configuration
 *
 * 用途: 首页各区块的启用/禁用和排序配置
 */

import type { GlobalConfig } from 'payload'

export const HomeContent: GlobalConfig = {
  slug: 'home-content',
  label: {
    en: 'Home Content',
    zh: '首页内容配置',
  },
  admin: {
    group: {
      en: 'Website Settings',
      zh: '网站设置',
    },
  },
  // versions: true,
  access: {
    read: () => true,
    update: ({ req }) => !!req.user,
  },
  fields: [
    // Section configurations as array
    {
      name: 'sections',
      type: 'array',
      label: {
        en: 'Homepage Sections',
        zh: '首页区块',
      },
      admin: {
        description: {
          en: 'Configure homepage section display order and status',
          zh: '配置首页各区块的显示顺序和状态',
        },
      },
      fields: [
        {
          name: 'sectionType',
          type: 'select',
          label: {
            en: 'Section Type',
            zh: '区块类型',
          },
          required: true,
          options: [
            { label: 'Hero Banner | 主视觉横幅', value: 'hero_banner' },
            { label: 'Product Series Carousel | 产品系列轮播', value: 'product_series_carousel' },
            { label: 'Service Features | 服务特点', value: 'service_features' },
            { label: '3D Sphere | 3D球体', value: 'sphere_3d' },
            { label: 'Simple CTA | 简单CTA', value: 'simple_cta' },
            { label: 'Series Introduction | 系列介绍', value: 'series_intro' },
            { label: 'Featured Products | 精选产品', value: 'featured_products' },
            { label: 'Brand Advantages | 品牌优势', value: 'brand_advantages' },
            { label: 'OEM/ODM | OEM/ODM服务', value: 'oem_odm' },
            { label: 'Quote Steps | 获取报价五步曲', value: 'quote_steps' },
            { label: 'Main Form | 主表单配置', value: 'main_form' },
            { label: 'Why Choose Busrom | 为什么选择Busrom', value: 'why_choose_busrom' },
            { label: 'Case Studies | 应用案例', value: 'case_studies' },
            { label: 'Brand Analysis | 品牌分析', value: 'brand_analysis' },
            { label: 'Brand Value | 品牌价值', value: 'brand_value' },
          ],
        },
        {
          name: 'enabled',
          type: 'checkbox',
          label: {
            en: 'Enabled',
            zh: '启用',
          },
          defaultValue: true,
        },
        {
          name: 'order',
          type: 'number',
          label: {
            en: 'Order',
            zh: '排序',
          },
          defaultValue: 1,
          min: 1,
          max: 20,
        },
      ],
    },
  ],
}
