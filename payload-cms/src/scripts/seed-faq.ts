// @ts-nocheck
import { getPayload } from 'payload'
import config from '../../payload.config.ts'
import { sql } from '@payloadcms/db-postgres'

const seedFaq = async () => {
  const payload = await getPayload({ config })

  console.log('--- Cleaning up FAQ Items & Categories (ROUND 2 - REAL DATA) ---')
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
    const newCat = await payload.create({
      collection: 'categories',
      data: {
        name: catName,
        type: 'FAQ',
        status: 'published',
        order: 0,
        showInShop: true,
      },
      locale: 'en'
    });
    catMap.set(catName, newCat.id);
    console.log(`Created Category [ID: ${newCat.id}]: ${catName}`);
  }

  // Real data provided by user
  const originalData = [
    { q: "How Does Busrom Control Product Quality?", ans: {"root":{"type":"root","format":"","indent":0,"version":1,"children":[{"type":"paragraph","format":"","indent":0,"version":1,"children":[{"mode":"normal","text":"Every Production Stage Is Strictly Monitored, From Raw Material Inspection And Precision Machining To Polishing And Final Assembly And Packaging, Ensuring Consistent Quality Across Batches.","type":"text","style":"","detail":0,"format":0,"version":1}],"direction":null,"textStyle":"","textFormat":0},{"type":"horizontalrule","version":1},{"type":"paragraph","format":"right","indent":0,"version":1,"children":[{"mode":"normal","text":"Busrom","type":"text","style":"","detail":0,"format":1,"version":1}],"direction":null,"textStyle":"","textFormat":1}],"direction":null,"textFormat":1}}},
    { q: "How Long Does Production Take?", ans: {"root":{"type":"root","format":"","indent":0,"version":1,"children":[{"type":"paragraph","format":"","indent":0,"version":1,"children":[{"mode":"normal","text":"Typically 3–25 Days Depending On Order Volume And Customization Complexity. Urgent Orders Can Be Handled With Priority Scheduling.","type":"text","style":"","detail":0,"format":0,"version":1}],"direction":null,"textStyle":"","textFormat":0},{"type":"horizontalrule","version":1},{"type":"paragraph","format":"right","indent":0,"version":1,"children":[{"mode":"normal","text":"Busrom","type":"text","style":"","detail":0,"format":1,"version":1}],"direction":null,"textStyle":"","textFormat":1}],"direction":null,"textFormat":1}}},
    { q: "What's Your Advantage? Why We Choose You?", ans: {"root":{"type":"root","format":"","indent":0,"version":1,"children":[{"type":"paragraph","format":"left","indent":0,"version":1,"children":[{"mode":"normal","text":"We Are A Manufacturer Of Glass Door Hardware With 21 Years Of Experience.","type":"text","style":"","detail":0,"format":1,"version":1}],"direction":null,"textStyle":"","textFormat":1},{"type":"quote","format":"left","indent":0,"version":1,"children":[{"mode":"normal","text":"* Perfect R&D  ","type":"text","style":"","detail":0,"format":0,"version":1}],"direction":null},{"type":"quote","format":"left","indent":0,"version":1,"children":[{"mode":"normal","text":"* Quality: Strict Quality Testing And Control Procedure To Make Sure Superior Quality.","type":"text","style":"","detail":0,"format":0,"version":1}],"direction":null},{"type":"quote","format":"left","indent":0,"version":1,"children":[{"mode":"normal","text":"* Certification: ISO Quality Management System Certification, 5s Production Management System.","type":"text","style":"","detail":0,"format":0,"version":1}],"direction":null},{"type":"quote","format":"left","indent":0,"version":1,"children":[{"mode":"normal","text":"* Factory Covers An Area Of 30,000 Square Meters.","type":"text","style":"","detail":0,"format":0,"version":1}],"direction":null},{"type":"quote","format":"left","indent":0,"version":1,"children":[{"mode":"normal","text":"* Automation Productivity Reaches:75%.","type":"text","style":"","detail":0,"format":0,"version":1}],"direction":null},{"type":"quote","format":"left","indent":0,"version":1,"children":[{"mode":"normal","text":"* Sample Orders: Acceptable.","type":"text","style":"","detail":0,"format":0,"version":1}],"direction":null},{"type":"quote","format":"left","indent":0,"version":1,"children":[{"mode":"normal","text":"* Rapid Delivery. (The Fastest Only 1 Day)","type":"text","style":"","detail":0,"format":0,"version":1}],"direction":null},{"type":"quote","format":"","indent":0,"version":1,"children":[{"mode":"normal","text":"* Providing Excellent After-Sales Service","type":"text","style":"","detail":0,"format":0,"version":1},{"mode":"normal","text":".","type":"text","style":"","detail":0,"format":1,"version":1}],"direction":null},{"type":"horizontalrule","version":1},{"type":"paragraph","format":"right","indent":0,"version":1,"children":[{"mode":"normal","text":"Busrom","type":"text","style":"","detail":0,"format":1,"version":1}],"direction":null,"textStyle":"","textFormat":1}],"direction":null,"textFormat":1}}},
    { q: "Can You Provide Your Certifications?", ans: {"root":{"type":"root","format":"","indent":0,"version":1,"children":[{"type":"paragraph","format":"","indent":0,"version":1,"children":[{"mode":"normal","text":"Our Products Have Passed The Durability And Corrosion Test.","type":"text","style":"","detail":0,"format":0,"version":1}],"direction":null,"textStyle":"","textFormat":0},{"type":"horizontalrule","version":1},{"type":"paragraph","format":"right","indent":0,"version":1,"children":[{"mode":"normal","text":"Busrom","type":"text","style":"","detail":0,"format":1,"version":1}],"direction":null,"textStyle":"","textFormat":1}],"direction":null,"textFormat":1}}},
    { q: "Can You Help Us Develop New Products Or Components?", ans: {"root":{"type":"root","format":"","indent":0,"version":1,"children":[{"type":"paragraph","format":"","indent":0,"version":1,"children":[{"mode":"normal","text":"Yes. Busrom Offers OEM / ODM Services, From Prototype Creation To Mass Production, That Help You Transform Ideas Into Market-Ready Products.","type":"text","style":"","detail":0,"format":0,"version":1}],"direction":null,"textStyle":"","textFormat":0},{"type":"horizontalrule","version":1},{"type":"paragraph","format":"right","indent":0,"version":1,"children":[{"mode":"normal","text":"Busrom","type":"text","style":"","detail":0,"format":1,"version":1}],"direction":null,"textStyle":"","textFormat":1}],"direction":null,"textFormat":1}}},
    { q: "Do You Provide Design Support For Engineering Projects?", ans: {"root":{"type":"root","format":"","indent":0,"version":1,"children":[{"type":"paragraph","format":"","indent":0,"version":1,"children":[{"mode":"normal","text":"Yes. Our R&D Team Offers Technical Optimization Based On Your Blueprints Or Load-Bearing Requirements, Ensuring Precision And Safety.","type":"text","style":"","detail":0,"format":0,"version":1}],"direction":null,"textStyle":"","textFormat":0},{"type":"horizontalrule","version":1},{"type":"paragraph","format":"right","indent":0,"version":1,"children":[{"mode":"normal","text":"Busrom","type":"text","style":"","detail":0,"format":1,"version":1}],"direction":null,"textStyle":"","textFormat":1}],"direction":null,"textFormat":1}}},
    { q: "Can You Provide Spare Parts Or Maintenance Kits?", ans: {"root":{"type":"root","format":"","indent":0,"version":1,"children":[{"type":"paragraph","format":"","indent":0,"version":1,"children":[{"mode":"normal","text":"For Long-Term Cooperation, We Can Prepare Extra Replacement Parts Or Maintenance Kits To Ensure Ongoing Product Stability At Your Site.","type":"text","style":"","detail":0,"format":0,"version":1}],"direction":null,"textStyle":"","textFormat":0},{"type":"horizontalrule","version":1},{"type":"paragraph","format":"right","indent":0,"version":1,"children":[{"mode":"normal","text":"Busrom","type":"text","style":"","detail":0,"format":1,"version":1}],"direction":null,"textStyle":"","textFormat":1}],"direction":null,"textFormat":1}}},
    { q: "Do Your Products Have Warranty Coverage?", ans: {"root":{"type":"root","format":"","indent":0,"version":1,"children":[{"type":"paragraph","format":"","indent":0,"version":1,"children":[{"mode":"normal","text":"Yes, Our Products Typically Come With A 3-5 Year Warranty, Depending On Type And Usage. Extended Warranty Options Are Available For Large Projects.","type":"text","style":"","detail":0,"format":0,"version":1}],"direction":null,"textStyle":"","textFormat":0},{"type":"horizontalrule","version":1},{"type":"paragraph","format":"right","indent":0,"version":1,"children":[{"mode":"normal","text":"Busrom","type":"text","style":"","detail":0,"format":1,"version":1}],"direction":null,"textStyle":"","textFormat":1}],"direction":null,"textFormat":1}}},
    { q: "What Should I Do If I Receive Damaged Or Incorrect Products?", ans: {"root":{"type":"root","format":"","indent":0,"version":1,"children":[{"type":"paragraph","format":"","indent":0,"version":1,"children":[{"mode":"normal","text":"Please Contact Our Support Team Within 7 Days Of Receipt, Providing Photos And Order Details. We’ll Resolve It With Replacements Or Compensation Promptly.","type":"text","style":"","detail":0,"format":0,"version":1}],"direction":null,"textStyle":"","textFormat":0},{"type":"horizontalrule","version":1},{"type":"paragraph","format":"right","indent":0,"version":1,"children":[{"mode":"normal","text":"Busrom","type":"text","style":"","detail":0,"format":1,"version":1}],"direction":null,"textStyle":"","textFormat":1}],"direction":null,"textFormat":1}}},
    { q: "Do You Provide After-Sales Or Installation Support?", ans: {"root":{"type":"root","format":"","indent":0,"version":1,"children":[{"type":"paragraph","format":"","indent":0,"version":1,"children":[{"mode":"normal","text":"Yes. Busrom Provides Online Guidance, Installation Videos, And Remote Technical Assistance According To Your Project Needs.","type":"text","style":"","detail":0,"format":0,"version":1}],"direction":null,"textStyle":"","textFormat":0},{"type":"horizontalrule","version":1},{"type":"paragraph","format":"right","indent":0,"version":1,"children":[{"mode":"normal","text":"Busrom","type":"text","style":"","detail":0,"format":1,"version":1}],"direction":null,"textStyle":"","textFormat":1}],"direction":null,"textFormat":1}}},
    { q: "Can You Assist With Export Documentation?", ans: {"root":{"type":"root","format":"","indent":0,"version":1,"children":[{"type":"paragraph","format":"","indent":0,"version":1,"children":[{"mode":"normal","text":"Yes, We Provide All Required Shipping And Customs Documents, Including Invoice, Packing List, Certificate Of Origin, And Bill Of Lading, And Will Send Tracking Details Once Shipped.","type":"text","style":"","detail":0,"format":0,"version":1}],"direction":null,"textStyle":"","textFormat":0},{"type":"horizontalrule","version":1},{"type":"paragraph","format":"right","indent":0,"version":1,"children":[{"mode":"normal","text":"Busrom","type":"text","style":"","detail":0,"format":1,"version":1}],"direction":null,"textStyle":"","textFormat":1}],"direction":null,"textFormat":1}}},
    { q: "How Do You Ensure Safe Packaging And Delivery?", ans: {"root":{"type":"root","format":"","indent":0,"version":1,"children":[{"type":"paragraph","format":"","indent":0,"version":1,"children":[{"mode":"normal","text":"All Products Are Packed With Foam And Protective Layers. For Outer Packaging, We Use Reinforced Cartons Or Export Wooden Pallets To Prevent Damage.","type":"text","style":"","detail":0,"format":0,"version":1}],"direction":null,"textStyle":"","textFormat":0},{"type":"horizontalrule","version":1},{"type":"paragraph","format":"right","indent":0,"version":1,"children":[{"mode":"normal","text":"Busrom","type":"text","style":"","detail":0,"format":1,"version":1}],"direction":null,"textStyle":"","textFormat":1}],"direction":null,"textFormat":1}}},
    { q: "What Are Your Shipping Options?", ans: {"root":{"type":"root","format":"","indent":0,"version":1,"children":[{"type":"paragraph","format":"","indent":0,"version":1,"children":[{"mode":"normal","text":"We Usually Support Sea Transportation Under EXW, FOB, CIF, And DDU Terms To Meet Your Logistics Preferences, Except For Specified Transport Methods.","type":"text","style":"","detail":0,"format":0,"version":1}],"direction":null,"textStyle":"","textFormat":0},{"type":"horizontalrule","version":1},{"type":"paragraph","format":"right","indent":0,"version":1,"children":[{"mode":"normal","text":"Busrom","type":"text","style":"","detail":0,"format":1,"version":1}],"direction":null,"textStyle":"","textFormat":1}],"direction":null,"textFormat":1}}},
    { q: "What Is Your Payment Method?", ans: {"root":{"type":"root","format":"","indent":0,"version":1,"children":[{"type":"paragraph","format":"","indent":0,"version":1,"children":[{"mode":"normal","text":"Generally, 30% T/T Deposit, Balance Before Shipment. For Long-Term Partners Or Large-Volume Orders, Flexible Terms Can Be Discussed.","type":"text","style":"","detail":0,"format":0,"version":1}],"direction":null,"textStyle":"","textFormat":0},{"type":"horizontalrule","version":1},{"type":"paragraph","format":"right","indent":0,"version":1,"children":[{"mode":"normal","text":"Busrom","type":"text","style":"","detail":0,"format":1,"version":1}],"direction":null,"textStyle":"","textFormat":1}],"direction":null,"textFormat":1}}},
    { q: "Can Busrom Customize Product Dimensions, Finishes, Or Materials?", ans: {"root":{"type":"root","format":"","indent":0,"version":1,"children":[{"type":"paragraph","format":"","indent":0,"version":1,"children":[{"mode":"normal","text":"Absolutely. We support Customization Of Size, Surface Treatment, And Material To Perfectly Fit Your Architectural Or Commercial Project.","type":"text","style":"","detail":0,"format":0,"version":1}],"direction":null,"textStyle":"","textFormat":0},{"type":"horizontalrule","version":1},{"type":"paragraph","format":"right","indent":0,"version":1,"children":[{"mode":"normal","text":"Busrom","type":"text","style":"","detail":0,"format":1,"version":1}],"direction":null,"textStyle":"","textFormat":1}],"direction":null,"textFormat":1}}},
    { q: "Is It OK To Print My Logo On Product Or Package?", ans: {"root":{"type":"root","format":"","indent":0,"version":1,"children":[{"type":"paragraph","format":"","indent":0,"version":1,"children":[{"mode":"normal","text":"Of Course. We can print your logo on the product or the packaging. Please Inform Us Formally Before Our Production And Confirm The Design Firstly Based On Our Sample. We Will Check The Details And Provide You With The Best Solution.","type":"text","style":"","detail":0,"format":0,"version":1}],"direction":null,"textStyle":"","textFormat":0},{"type":"horizontalrule","version":1},{"type":"paragraph","format":"right","indent":0,"version":1,"children":[{"mode":"normal","text":"Busrom","type":"text","style":"","detail":0,"format":1,"version":1}],"direction":null,"textStyle":"","textFormat":1}],"direction":null}}},
    { q: "How Can I Get A Quotation Or Project Consultation?", ans: {"root":{"type":"root","format":"","indent":0,"version":1,"children":[{"type":"paragraph","format":"","indent":0,"version":1,"children":[{"mode":"normal","text":"You Can Send Your Project Drawings, Specifications, Or Photos Via Our Inquiry Form. Busrom Sales And Technical Team Will Respond Within 24 Hours With Professional Suggestions And Pricing.","type":"text","style":"","detail":0,"format":0,"version":1}],"direction":null,"textStyle":"","textFormat":0},{"type":"horizontalrule","version":1},{"type":"paragraph","format":"right","indent":0,"version":1,"children":[{"mode":"normal","text":"Busrom","type":"text","style":"","detail":0,"format":1,"version":1}],"direction":null,"textStyle":"","textFormat":1}],"direction":null,"textFormat":1}}},
    { q: "Do you Have A List Of The Hot-Selling Products?", ans: {"root":{"type":"root","format":"","indent":0,"version":1,"children":[{"type":"paragraph","format":"","indent":0,"version":1,"children":[{"mode":"normal","text":"We Are Specialized In Manufacturing Shower Door Hardware, Gating Hardware, Stair Handrails And Railing Hardware And Glass Engineering Hardware. What Kind Of Products Are You More Interested In? Let Me Give You A Detailed Introduction. Looking For Your Feedback For Further Discussion.","type":"text","style":"","detail":0,"format":0,"version":1}],"direction":null,"textStyle":"","textFormat":0},{"type":"horizontalrule","version":1},{"type":"paragraph","format":"right","indent":0,"version":1,"children":[{"mode":"normal","text":"Busrom","type":"text","style":"","detail":0,"format":1,"version":1}],"direction":null,"textStyle":"","textFormat":1}],"direction":null}}},
    { q: "Can Your Company Provide Free Sampling?", ans: {"root":{"type":"root","format":"","indent":0,"version":1,"children":[{"type":"paragraph","format":"","indent":0,"version":1,"children":[{"mode":"normal","text":"We Are Honored To Offer You Samples. New Clients Are Expected To Pay For The Courier Cost, The Samples Are Free For You, This Charge Will Be Deducted From The Payment For Formal Order.","type":"text","style":"","detail":0,"format":0,"version":1}],"direction":null,"textStyle":"","textFormat":0},{"type":"horizontalrule","version":1},{"type":"paragraph","format":"right","indent":0,"version":1,"children":[{"mode":"normal","text":"Busrom","type":"text","style":"","detail":0,"format":1,"version":1}],"direction":null,"textStyle":"","textFormat":1}],"direction":null,"textFormat":1}}},
    { q: "Can I Get The Sample?", ans: {"root":{"type":"root","format":"","indent":0,"version":1,"children":[{"type":"paragraph","format":"","indent":0,"version":1,"children":[{"mode":"normal","text":"Regular Products ( Such As Glass Standoff, Shower Hinge, Glass Clamp, Sliding Door Hardware,etc.) Are Accepted By Sample Order. Please Inform Us Of The Product Model Numbers And Your Requirements About It, I Will Confirm It For You As Soon As Possible.","type":"text","style":"","detail":0,"format":0,"version":1}],"direction":null,"textStyle":"","textFormat":0},{"type":"horizontalrule","version":1},{"type":"paragraph","format":"right","indent":0,"version":1,"children":[{"mode":"normal","text":"Busrom","type":"text","style":"","detail":0,"format":1,"version":1}],"direction":null,"textStyle":"","textFormat":1}],"direction":null,"textFormat":1}}}
  ];

  let order = 1;
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

  const ansMap = new Map();
  originalData.forEach(d => ansMap.set(d.q, d.ans));

  console.log('--- SEEDING REAL FAQ DATA ---')
  for (const item of faqData) {
    const catId = catMap.get(item.cat);
    const content = ansMap.get(item.q);
    
    await payload.create({
      collection: 'faq-items',
      data: {
        adminLabel: item.s,
        question: item.q,
        contentTranslation: content,
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
