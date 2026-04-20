import { getPayload } from 'payload'
import config from '../../payload.config'
import { sql } from '@payloadcms/db-postgres'

const seedFaq = async () => {
  const payload = await getPayload({ config })

  console.log('--- Cleaning up local FAQ Items & Categories ---')
  await payload.delete({ collection: 'faq-items', where: { id: { exists: true } } })
  await payload.delete({ collection: 'categories', where: { type: { equals: 'FAQ' } } })

  console.log('--- Resetting Database ID Sequences ---')
  try {
    await payload.db.drizzle.execute(sql`ALTER SEQUENCE faq_items_id_seq RESTART WITH 1`);
    await payload.db.drizzle.execute(sql`ALTER SEQUENCE categories_id_seq RESTART WITH 1`);
  } catch (e) {}

  const categories = [
    'Collaboration & Consultation',
    'Design & Customization',
    'Production & Quality',
    'Shipping & Logistic',
    'After-Sale & Support'
  ];

  const catMap = new Map();
  for (const catName of categories) {
    // @ts-ignore
    const newCat = await payload.create({
      collection: 'categories',
      data: {
        name: catName,
        type: 'FAQ',
        status: 'published',
        order: 0,
        showInShop: true,
      },
      locale: 'en' // Strictly seeding to English
    });
    catMap.set(catName, newCat.id);
    console.log(`Created Category [ID: ${newCat.id}]: ${catName}`);
  }

  const faqData = [
    { cat: 'Collaboration & Consultation', q: 'Can I Get The Sample?', s: 'faq-sample' },
    { cat: 'Collaboration & Consultation', q: 'Can Your Company Provide Free Sampling?', s: 'faq-free-sampling' },
    { cat: 'Collaboration & Consultation', q: 'Do You Have A List Of The Hot-Selling Products?', s: 'faq-hot-selling-list' },
    { cat: 'Collaboration & Consultation', q: 'How Can I Get A Quotation Or Project Consultation?', s: 'faq-quotation-consult' },
    { cat: 'Design & Customization', q: 'Is It OK To Print My Logo On Product Or Package?', s: 'faq-logo-printing' },
    { cat: 'Design & Customization', q: 'Can Busrom Customize Product Dimensions, Finishes, Or Materials?', s: 'faq-customization-options' },
    { cat: 'Design & Customization', q: 'Do You Provide Design Support For Engineering Projects?', s: 'faq-design-support' },
    { cat: 'Design & Customization', q: 'Can You Help Us Develop New Products Or Components?', s: 'faq-new-product-development' },
    { cat: 'Production & Quality', q: 'Can You Provide Your Certifications?', s: 'faq-certifications' },
    { cat: 'Production & Quality', q: 'What\'s Your Advantage? Why We Choose You?', s: 'faq-advantages' },
    { cat: 'Production & Quality', q: 'How Long Does Production Take?', s: 'faq-production-time' },
    { cat: 'Production & Quality', q: 'How Does Busrom Control Product Quality?', s: 'faq-quality-control' },
    { cat: 'Shipping & Logistic', q: 'What Is Your Payment Method?', s: 'faq-payment-method' },
    { cat: 'Shipping & Logistic', q: 'What Are Your Shipping Options?', s: 'faq-shipping-options' },
    { cat: 'Shipping & Logistic', q: 'How Do You Ensure Safe Packaging And Delivery?', s: 'faq-packaging-safety' },
    { cat: 'Shipping & Logistic', q: 'Can You Assist With Export Documentation?', s: 'faq-export-docs' },
    { cat: 'After-Sale & Support', q: 'Do You Provide After-Sales Or Installation Support?', s: 'faq-after-sales-support' },
    { cat: 'After-Sale & Support', q: 'What Should I Do If I Receive Damaged Or Incorrect Products?', s: 'faq-damaged-products' },
    { cat: 'After-Sale & Support', q: 'Do Your Products Have Warranty Coverage?', s: 'faq-warranty' },
    { cat: 'After-Sale & Support', q: 'Can You Provide Spare Parts Or Maintenance Kits?', s: 'faq-spare-parts' }
  ];

  console.log('--- Seeding FAQ Items ---')
  let order = 1;
  for (const item of faqData) {
    const catId = catMap.get(item.cat);
    // @ts-ignore
    await payload.create({
      collection: 'faq-items',
      data: {
        adminLabel: item.s,
        question: item.q,
        answer: {
          root: {
            type: 'root',
            format: '',
            indent: 0,
            version: 1,
            children: [{
              type: 'paragraph',
              children: [{ text: `Answer content for: ${item.q}`, type: 'text' }]
            }]
          }
        },
        category: catId,
        status: 'published',
        order: order++,
      },
      locale: 'en'
    });
    console.log(`Seeding FAQ [${item.cat}]: ${item.q}`);
  }

  process.exit(0)
}

seedFaq().catch(console.error)
