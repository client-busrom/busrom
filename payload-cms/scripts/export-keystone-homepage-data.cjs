/**
 * Export all homepage data from Keystone CMS database
 * Run with: node scripts/export-keystone-homepage-data.js > keystone-homepage-data.json
 */

const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'busrom_cms',
  user: 'busrom',
  password: 'busrom_dev_password',
});

async function exportData() {
  await client.connect();

  const data = {
    heroBannerItems: [],
    serviceFeatures: null,
    brandAdvantages: null,
    brandAnalysis: null,
    brandValue: null,
    oemOdm: null,
    featuredProducts: null,
    mainForm: null,
    caseStudies: null,
    quoteSteps: null,
    whyChooseBusrom: null,
    simpleCta: null,
    sphere3d: null,
    productSeriesCarousel: null,
    footer: null,
    navigationMenus: [],
  };

  // HeroBannerItems
  const heroBannerResult = await client.query(`
    SELECT * FROM "HeroBannerItem" ORDER BY "order"
  `);
  data.heroBannerItems = heroBannerResult.rows;

  // ServiceFeaturesConfig
  const serviceFeaturesResult = await client.query(`
    SELECT * FROM "ServiceFeaturesConfig" LIMIT 1
  `);
  data.serviceFeatures = serviceFeaturesResult.rows[0];

  // BrandAdvantages
  const brandAdvantagesResult = await client.query(`
    SELECT * FROM "BrandAdvantages" LIMIT 1
  `);
  data.brandAdvantages = brandAdvantagesResult.rows[0];

  // BrandAnalysis
  const brandAnalysisResult = await client.query(`
    SELECT * FROM "BrandAnalysis" LIMIT 1
  `);
  data.brandAnalysis = brandAnalysisResult.rows[0];

  // BrandValue
  const brandValueResult = await client.query(`
    SELECT * FROM "BrandValue" LIMIT 1
  `);
  data.brandValue = brandValueResult.rows[0];

  // OemOdm
  const oemOdmResult = await client.query(`
    SELECT * FROM "OemOdm" LIMIT 1
  `);
  data.oemOdm = oemOdmResult.rows[0];

  // FeaturedProducts
  const featuredProductsResult = await client.query(`
    SELECT * FROM "FeaturedProducts" LIMIT 1
  `);
  data.featuredProducts = featuredProductsResult.rows[0];

  // MainForm
  const mainFormResult = await client.query(`
    SELECT * FROM "MainForm" LIMIT 1
  `);
  data.mainForm = mainFormResult.rows[0];

  // CaseStudies
  const caseStudiesResult = await client.query(`
    SELECT * FROM "CaseStudies" LIMIT 1
  `);
  data.caseStudies = caseStudiesResult.rows[0];

  // QuoteSteps
  const quoteStepsResult = await client.query(`
    SELECT * FROM "QuoteSteps" LIMIT 1
  `);
  data.quoteSteps = quoteStepsResult.rows[0];

  // WhyChooseBusrom
  const whyChooseBusromResult = await client.query(`
    SELECT * FROM "WhyChooseBusrom" LIMIT 1
  `);
  data.whyChooseBusrom = whyChooseBusromResult.rows[0];

  // SimpleCta
  const simpleCtaResult = await client.query(`
    SELECT * FROM "SimpleCta" LIMIT 1
  `);
  data.simpleCta = simpleCtaResult.rows[0];

  // Sphere3d
  const sphere3dResult = await client.query(`
    SELECT * FROM "Sphere3d" LIMIT 1
  `);
  data.sphere3d = sphere3dResult.rows[0];

  // ProductSeriesCarousel
  const productSeriesCarouselResult = await client.query(`
    SELECT * FROM "ProductSeriesCarousel" LIMIT 1
  `);
  data.productSeriesCarousel = productSeriesCarouselResult.rows[0];

  // Footer
  const footerResult = await client.query(`
    SELECT * FROM "Footer" LIMIT 1
  `);
  data.footer = footerResult.rows[0];

  // NavigationMenus (with depth: 2 to include relations)
  const navigationMenusResult = await client.query(`
    SELECT
      nm.*,
      parent.slug as "parentSlug"
    FROM "NavigationMenu" nm
    LEFT JOIN "NavigationMenu" parent ON nm.parent = parent.id
    ORDER BY nm."order"
  `);

  // Fetch mediaTags for each menu
  for (const menu of navigationMenusResult.rows) {
    const mediaTagsResult = await client.query(`
      SELECT mt.id, mt.slug, mt.name, mt.type
      FROM "MediaTag" mt
      JOIN "NavigationMenu_mediaTags" nmt ON mt.id = nmt."B"
      WHERE nmt."A" = $1
    `, [menu.id]);

    menu.mediaTags = mediaTagsResult.rows;
  }

  data.navigationMenus = navigationMenusResult.rows;

  await client.end();

  console.log(JSON.stringify(data, null, 2));
}

exportData().catch(console.error);
