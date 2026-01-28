-- Direct PostgreSQL insert for 10 SEO settings
-- Run: psql -U busrom -d busrom_payload -f scripts/seed-seo-direct-db.sql

-- Delete existing home SEO settings first
DELETE FROM "seo-settings"
WHERE "exactPath" = '/'
   OR "pageType" = 'home'
   OR "scope" = 'global'
   OR ("scope" = 'path_pattern' AND "pathPattern" = '/*');

-- Insert 10 SEO settings for homepage testing

-- #1: exact_path (HIGHEST priority - used for meta tags)
INSERT INTO "seo-settings" (
  "identifier", "scope", "exactPath", "metaTitle", "metaDescription", "metaKeywords",
  "ogTitle", "ogDescription", "robotsIndex", "robotsFollow",
  "includeInSitemap", "sitemapPriority", "sitemapChangefreq",
  "updatedAt", "createdAt"
) VALUES (
  'home-primary-exact',
  'exact_path',
  '/',
  'Busrom - Premium Glass Hardware Manufacturer | Global Leader',
  'Leading manufacturer of premium glass hardware products. Specializing in glass clamps, door handles, hinges and architectural hardware for global markets.',
  'glass hardware manufacturer, glass clamps supplier, premium glass fittings, stainless steel hardware, architectural glass hardware',
  'Busrom Glass Hardware - Premium Quality Solutions',
  'Global leader in manufacturing high-quality glass hardware products',
  true,
  true,
  true,
  0.8,
  'weekly',
  NOW(),
  NOW()
);

-- #2: exact_path
INSERT INTO "seo-settings" (
  "identifier", "scope", "exactPath", "metaTitle", "metaDescription", "metaKeywords",
  "updatedAt", "createdAt"
) VALUES (
  'home-keywords-glass-clamps',
  'exact_path',
  '/',
  'Glass Clamps & Standoffs | Busrom Hardware Solutions',
  'High-quality glass clamps, standoffs, and mounting hardware for commercial and residential applications.',
  'glass clamps, glass standoffs, glass mounting hardware, glass railing clamps, glass balustrade fittings, point fixing glass, spider glass fittings, frameless glass clamps',
  NOW(),
  NOW()
);

-- #3: exact_path
INSERT INTO "seo-settings" (
  "identifier", "scope", "exactPath", "metaTitle", "metaDescription", "metaKeywords",
  "updatedAt", "createdAt"
) VALUES (
  'home-keywords-bathroom',
  'exact_path',
  '/',
  'Bathroom Hardware & Shower Accessories | Busrom',
  'Premium bathroom hardware including shower door hinges, handles, and glass accessories.',
  'bathroom hardware, shower door hinges, bathroom accessories, glass shower hardware, bathroom glass fittings, shower door handles, bathroom door hardware, shower glass clamps, frameless shower hardware',
  NOW(),
  NOW()
);

-- #4: exact_path
INSERT INTO "seo-settings" (
  "identifier", "scope", "exactPath", "metaTitle", "metaDescription", "metaKeywords",
  "updatedAt", "createdAt"
) VALUES (
  'home-keywords-oem-odm',
  'exact_path',
  '/',
  'OEM ODM Glass Hardware Factory | Custom Manufacturing',
  'Professional OEM ODM glass hardware manufacturing services with custom design capabilities and bulk production.',
  'OEM glass hardware, ODM hardware manufacturer, custom glass fittings, glass hardware factory, wholesale glass hardware, bulk hardware supplier, hardware manufacturing, custom hardware design, contract manufacturing',
  NOW(),
  NOW()
);

-- #5: exact_path
INSERT INTO "seo-settings" (
  "identifier", "scope", "exactPath", "metaTitle", "metaDescription", "metaKeywords",
  "updatedAt", "createdAt"
) VALUES (
  'home-keywords-materials',
  'exact_path',
  '/',
  'Stainless Steel Glass Hardware | Durable Premium Quality',
  'Durable 304 and 316 stainless steel glass hardware for modern architecture and interior design.',
  'stainless steel hardware, 304 stainless steel fittings, 316 stainless steel hardware, marine grade hardware, corrosion resistant hardware, modern glass hardware, contemporary glass fittings, rust-proof hardware, weather resistant fittings',
  NOW(),
  NOW()
);

-- #6: page_type
INSERT INTO "seo-settings" (
  "identifier", "scope", "pageType", "metaTitle", "metaDescription", "metaKeywords",
  "updatedAt", "createdAt"
) VALUES (
  'home-type-keywords-doors',
  'page_type',
  'home',
  'Glass Door Hardware & Handles | Busrom Solutions',
  'Complete range of glass door hardware, handles, locks and accessories.',
  'glass door hardware, door handles, glass door locks, sliding door hardware, pivot door fittings, door handles stainless steel, glass door accessories, commercial door hardware, residential door hardware',
  NOW(),
  NOW()
);

-- #7: page_type
INSERT INTO "seo-settings" (
  "identifier", "scope", "pageType", "metaTitle", "metaDescription", "metaKeywords",
  "updatedAt", "createdAt"
) VALUES (
  'home-type-keywords-railings',
  'page_type',
  'home',
  'Glass Railing Systems & Balustrades | Busrom',
  'Premium glass railing systems, balustrades and safety barriers.',
  'glass railing systems, glass balustrades, staircase glass railings, balcony glass railings, deck railing hardware, safety glass barriers, frameless glass railings, railing mounting brackets, glass handrail systems',
  NOW(),
  NOW()
);

-- #8: page_type
INSERT INTO "seo-settings" (
  "identifier", "scope", "pageType", "metaTitle", "metaDescription", "metaKeywords",
  "updatedAt", "createdAt"
) VALUES (
  'home-type-keywords-connectors',
  'page_type',
  'home',
  'Glass Connectors & Brackets | Structural Hardware',
  'Structural glass connectors, brackets and fixing systems for architectural applications.',
  'glass connectors, structural hardware, glass brackets, fixing systems, architectural brackets, glass to glass connectors, glass to wall brackets, structural glass fittings, point fixed glazing',
  NOW(),
  NOW()
);

-- #9: path_pattern
INSERT INTO "seo-settings" (
  "identifier", "scope", "pathPattern", "metaTitle", "metaDescription", "metaKeywords",
  "updatedAt", "createdAt"
) VALUES (
  'home-pattern-keywords-finish',
  'path_pattern',
  '/*',
  'Polished & Brushed Finish Hardware | Busrom',
  'Available in mirror polished, brushed satin, and matte black finishes.',
  'polished hardware, brushed finish hardware, mirror polish stainless steel, satin finish hardware, matte black hardware, chrome finish hardware, powder coated hardware, surface finishes, decorative hardware finishes',
  NOW(),
  NOW()
);

-- #10: global (LOWEST priority)
INSERT INTO "seo-settings" (
  "identifier", "scope", "metaTitle", "metaDescription", "metaKeywords",
  "updatedAt", "createdAt"
) VALUES (
  'home-global-keywords-quality',
  'global',
  'Global Glass Hardware Supplier | Busrom Quality Assurance',
  'ISO certified glass hardware manufacturer with worldwide shipping and quality guarantee.',
  'ISO certified manufacturer, quality assurance, worldwide shipping, global supplier, certified hardware, quality control, international shipping, bulk orders, wholesale pricing, factory direct',
  NOW(),
  NOW()
);

-- Verify the inserts
SELECT
  id,
  identifier,
  scope,
  "exactPath",
  "pageType",
  "metaTitle"
FROM "seo-settings"
WHERE identifier LIKE 'home-%'
ORDER BY
  CASE scope
    WHEN 'exact_path' THEN 4
    WHEN 'path_pattern' THEN 3
    WHEN 'page_type' THEN 2
    WHEN 'global' THEN 1
  END DESC,
  identifier;
