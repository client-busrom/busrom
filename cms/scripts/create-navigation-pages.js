/**
 * Script to create Pages and PageContentTranslations for navigation menu items
 *
 * Creates pages for:
 * - Service submenu items
 * - About Us submenu items
 * - Application list page
 * - Blog list page
 */

const { PrismaClient } = require('../node_modules/.prisma/client');
const prisma = new PrismaClient();

// Page definitions based on navigation menu structure
const pagesToCreate = [
  // Service pages
  {
    slug: 'service-overview',
    path: '/service/overview',
    pageType: 'FREEFORM',
    template: '',
    title: { en: 'Service Overview', zh: '服务概览' },
    status: 'PUBLISHED',
    contentEn: 'Service Overview page\nComing soon...',
  },
  {
    slug: 'one-stop-shop',
    path: '/service/one-stop',
    pageType: 'FREEFORM',
    template: '',
    title: { en: 'One-Stop Shop', zh: '一站式服务' },
    status: 'PUBLISHED',
    contentEn: 'One-Stop Shop page\nComing soon...',
  },
  {
    slug: 'faq',
    path: '/service/faq',
    pageType: 'FREEFORM',
    template: '',
    title: { en: 'FAQ', zh: '常见问题' },
    status: 'PUBLISHED',
    contentEn: 'FAQ page\nComing soon...',
  },
  {
    slug: 'oem-odm',
    path: '/service/oem-odm',
    pageType: 'FREEFORM',
    template: '',
    title: { en: 'OEM/ODM', zh: 'OEM/ODM定制' },
    status: 'PUBLISHED',
    contentEn: 'OEM/ODM page\nComing soon...',
  },

  // About Us pages
  {
    slug: 'our-story',
    path: '/about/story',
    pageType: 'FREEFORM',
    template: '',
    title: { en: 'Our Story', zh: '我们的故事' },
    status: 'PUBLISHED',
    contentEn: 'Our Story page\nComing soon...',
  },
  {
    slug: 'support',
    path: '/support',
    pageType: 'FREEFORM',
    template: '',
    title: { en: 'Support', zh: '技术支持' },
    status: 'PUBLISHED',
    contentEn: 'Support page\nComing soon...',
  },
  {
    slug: 'privacy-policy',
    path: '/privacy-policy',
    pageType: 'FREEFORM',
    template: '',
    title: { en: 'Privacy Policy', zh: '隐私政策' },
    status: 'PUBLISHED',
    contentEn: 'Privacy Policy page\nComing soon...',
  },
  {
    slug: 'fraud-notice',
    path: '/fraud-notice',
    pageType: 'FREEFORM',
    template: '',
    title: { en: 'Fraud Notice', zh: '防诈骗声明' },
    status: 'PUBLISHED',
    contentEn: 'Fraud Notice page\nComing soon...',
  },

  // List pages with templates
  {
    slug: 'applications',
    path: '/applications',
    pageType: 'TEMPLATE',
    template: 'APPLICATION_LIST',
    title: { en: 'Applications', zh: '应用案例' },
    status: 'PUBLISHED',
    contentEn: 'Applications list page\nComing soon...',
  },
  {
    slug: 'blog',
    path: '/blog',
    pageType: 'TEMPLATE',
    template: 'BLOG_LIST',
    title: { en: 'Blog', zh: '博客' },
    status: 'PUBLISHED',
    contentEn: 'Blog list page\nComing soon...',
  },
];

async function main() {
  console.log('🚀 Starting page creation...\n');

  let created = 0;
  let skipped = 0;

  for (const pageData of pagesToCreate) {
    try {
      // Check if page already exists
      const existing = await prisma.page.findUnique({
        where: { slug: pageData.slug }
      });

      if (existing) {
        console.log(`⏭️  Skipped: ${pageData.slug} (already exists)`);
        skipped++;
        continue;
      }

      // Create page
      const page = await prisma.page.create({
        data: {
          slug: pageData.slug,
          path: pageData.path,
          pageType: pageData.pageType,
          template: pageData.template,
          title: pageData.title,
          status: pageData.status,
          isSystem: false,
          order: 0,
        }
      });

      // Create English content translation
      await prisma.pageContentTranslation.create({
        data: {
          locale: 'en',
          content: [
            {
              type: 'paragraph',
              children: [
                {
                  text: pageData.contentEn
                }
              ]
            }
          ],
          pageId: page.id,
        }
      });

      console.log(`✅ Created: ${pageData.slug} (${page.id})`);
      created++;

    } catch (error) {
      console.error(`❌ Error creating ${pageData.slug}:`, error.message);
    }
  }

  console.log('\n📊 Summary:');
  console.log(`   Created: ${created}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Total: ${pagesToCreate.length}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('\n✨ Done!');
  })
  .catch(async (e) => {
    console.error('Fatal error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
