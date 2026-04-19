
/**
 * Seed Remaining FAQs Script
 * 
 * Usage:
 * npx tsx scripts/seed-remaining-faqs.ts
 */

import { getPayload } from 'payload'
import config from '../payload.config'

const faqData = [
  // Collaboration & Consultation (Remaining Q4)
  {
    categorySlug: 'collaboration-consultation',
    slug: 'how-can-i-get-a-quotation-or-project-consultation',
    question: 'How Can I Get A Quotation Or Project Consultation?',
    answer: 'You Can Send Your Project Drawings, Specifications, Or Photos Via Our Inquiry Form. Busrom Sales And Technical Team Will Respond Within 24 Hours With Professional Suggestions And Pricing.',
    order: 4
  },
  // Design & Customization
  {
    categorySlug: 'design-customization',
    slug: 'is-it-ok-to-print-my-logo-on-product-or-package',
    question: 'Is It OK To Print My Logo On Product Or Package?',
    answer: 'Of Course. Please Inform Us Formally Before Our Production And Confirm The Design Firstly Based On Our Sample.',
    order: 1
  },
  {
    categorySlug: 'design-customization',
    slug: 'can-busrom-customize-product-dimensions-finishes-or-materials',
    question: 'Can Busrom Customize Product Dimensions, Finishes, Or Materials?',
    answer: 'Absolutely. We support size, surface treatment, and material customization to perfectly fit your architectural or commercial project.',
    order: 2
  },
  {
    categorySlug: 'design-customization',
    slug: 'do-you-provide-design-support-for-engineering-projects',
    question: 'Do You Provide Design Support For Engineering Projects?',
    answer: 'Yes, Our R&D Team Offers Technical Optimization Based On Your Blueprints Or Load-Bearing Requirements, Ensuring Precision And Safety.',
    order: 3
  },
  {
    categorySlug: 'design-customization',
    slug: 'can-you-help-us-develop-new-products-or-components',
    question: 'Can You Help Us Develop New Products Or Components?',
    answer: 'Yes. Busrom Offers OEM / ODM Services, From Prototype Creation To Mass Production, That Help You Transform Ideas Into Market-Ready Products.',
    order: 4
  },
  // Production & Quality
  {
    categorySlug: 'production-quality',
    slug: 'can-you-provide-your-certifications',
    question: 'Can You Provide Your Certifications?',
    answer: 'Our products has passed the durability test and the Corrosion test.',
    order: 1
  },
  {
    categorySlug: 'production-quality',
    slug: 'whats-your-advantage-why-we-choose-you',
    question: 'What\'s Your Advantage? Why We Choose You?',
    answer: 'We Are A Manufacturer Of Glass Door Hardware With 21 Years Of Experience.\n* Perfect R&D \n* Quality: Strict Quality Testing And Control Procedure To Make Sure Superior Quality.\n* Certification: Iso Quality Management System Certification,5s Production Management System.\n* Factory Covers An Area Of 30,000 Square Meters.\n* Automation Productivity Reaches:75%.\n* Sample Orders: Acceptable.\n* Rapid Delivery. (The Fastest Only 1 Day)\n* Providing Excellent After-Sales Service.',
    order: 2
  },
  {
    categorySlug: 'production-quality',
    slug: 'how-long-does-production-take',
    question: 'How Long Does Production Take?',
    answer: 'Typically 3–25 Days Depending On Order Volume And Customization Complexity. Urgent Orders Can Be Handled With Priority Scheduling.',
    order: 3
  },
  {
    categorySlug: 'production-quality',
    slug: 'how-does-busrom-control-product-quality',
    question: 'How Does Busrom Control Product Quality?',
    answer: 'Every Production Stage Is Strictly Monitored, From Raw Material Inspection And Precision Machining To Polishing And Final Assembly And Packaging, Ensuring Consistent Quality Across Batches.',
    order: 4
  },
  // Shipping & Logistic
  {
    categorySlug: 'shipping-logistic',
    slug: 'what-is-your-payment-method',
    question: 'What Is Your Payment Method?',
    answer: 'Generally, 30% T/T Deposit, Balance Before Shipment. For Long-Term Partners Or Large-Volume Orders, Flexible Terms Can Be Discussed.',
    order: 1
  },
  {
    categorySlug: 'shipping-logistic',
    slug: 'what-are-your-shipping-options',
    question: 'What Are Your Shipping Options?',
    answer: 'We Usually Support Sea Transportation Under EXW, FOB, CIF, And DDU Terms To Meet Your Logistics Preferences. (Except For The Specified Mode Of Transport)',
    order: 2
  },
  {
    categorySlug: 'shipping-logistic',
    slug: 'how-do-you-ensure-safe-packaging-and-delivery',
    question: 'How Do You Ensure Safe Packaging And Delivery?',
    answer: 'All Products Are Packed With Foam And Protective Layers. For Outer Packaging, We Use Reinforced Cartons Or Export Wooden Pallets To Prevent Damage.',
    order: 3
  },
  {
    categorySlug: 'shipping-logistic',
    slug: 'can-you-assist-with-export-documentation',
    question: 'Can You Assist With Export Documentation?',
    answer: 'Yes, We Provide All Required Shipping And Customs Documents, Including Invoice, Packing List, Certificate Of Origin, And Bill Of Lading, And Will Send Tracking Details Once Shipped.',
    order: 4
  },
  // After-Sale & Support
  {
    categorySlug: 'after-sale-support',
    slug: 'do-you-provide-after-sales-or-installation-support',
    question: 'Do You Provide After-Sales Or Installation Support?',
    answer: 'Yes. Busrom Provides Online Guidance, Installation Videos, And Remote Technical Assistance According To Your Project Needs.',
    order: 1
  },
  {
    categorySlug: 'after-sale-support',
    slug: 'what-should-i-do-if-i-receive-damaged-or-incorrect-products',
    question: 'What Should I Do If I Receive Damaged Or Incorrect Products?',
    answer: 'Please Contact Our Support Team Within 7 Days Of Receipt, Providing Photos And Order Details. We’ll Resolve It With Replacements Or Compensation Promptly.',
    order: 2
  },
  {
    categorySlug: 'after-sale-support',
    slug: 'do-your-products-have-warranty-coverage',
    question: 'Do Your Products Have Warranty Coverage?',
    answer: 'Yes, Our Products Typically Come With A 3-5 Year Warranty Depending On Type And Usage. Extended Warranty Options Are Available For Large Projects.',
    order: 3
  },
  {
    categorySlug: 'after-sale-support',
    slug: 'can-you-provide-spare-parts-or-maintenance-kits',
    question: 'Can You Provide Spare Parts Or Maintenance Kits?',
    answer: 'For Long-Term Cooperation, We Can Prepare Extra Replacement Parts Or Maintenance Kits To Ensure Ongoing Product Stability At Your Site.',
    order: 4
  }
];

function createLexicalJSON(text: string) {
  const lines = text.split('\n');
  const children = lines.map(line => ({
    type: 'paragraph',
    format: '',
    indent: 0,
    version: 1,
    children: [
      {
        mode: 'normal',
        text: line,
        type: 'text',
        style: '',
        detail: 0,
        format: 0,
        version: 1
      }
    ],
    direction: null,
    textStyle: '',
    textFormat: 0
  }));

  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      children: children,
      direction: null
    }
  };
}

async function seedFAQs() {
  console.log('🌱 Starting FAQ seeding...\n');

  const payload = await getPayload({ config });

  try {
    for (const item of faqData) {
      // Find category ID
      const categoryRes = await payload.find({
        collection: 'categories',
        where: { slug: { equals: item.categorySlug } },
        limit: 1,
      });

      if (categoryRes.docs.length === 0) {
        console.warn(`  ⚠️ Category not found: ${item.categorySlug}. Skipping FAQ: ${item.slug}`);
        continue;
      }

      const categoryId = categoryRes.docs[0].id;

      // Check if item already exists
      const existing = await payload.find({
        collection: 'faq-items',
        where: { slug: { equals: item.slug } },
        limit: 1,
      });

      if (existing.docs.length > 0) {
        await payload.update({
          collection: 'faq-items',
          id: existing.docs[0].id,
          data: {
            question: item.question,
            contentTranslation: createLexicalJSON(item.answer),
            category: categoryId,
            order: item.order,
            status: 'published',
          },
          locale: 'en',
        });
        console.log(`  ✓ Updated FAQ: ${item.slug}`);
      } else {
        await payload.create({
          collection: 'faq-items',
          data: {
            slug: item.slug,
            question: item.question,
            contentTranslation: createLexicalJSON(item.answer),
            category: categoryId,
            order: item.order,
            status: 'published',
          },
          locale: 'en',
        });
        console.log(`  ✓ Created FAQ: ${item.slug}`);
      }
    }

    console.log('\n✅ FAQ seeding complete.');
  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    process.exit(0);
  }
}

seedFAQs();
