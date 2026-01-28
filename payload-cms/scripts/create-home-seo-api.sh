#!/bin/bash

# Create 10 SEO settings for homepage via REST API
# Note: This requires authentication. Run this after logging into Payload Admin

API_URL="http://localhost:3002/api"
COLLECTION="seo-settings"

echo "🚀 Creating 10 homepage SEO settings via API..."
echo ""

# Function to create SEO setting
create_seo() {
  local data=$1
  echo "$data" | jq -c '.' | curl -s -X POST "${API_URL}/${COLLECTION}" \
    -H "Content-Type: application/json" \
    -d @- | jq -r 'if .errors then "❌ Error: " + (.errors[0].message // "Unknown error") else "✅ Created: " + .doc.identifier end'
}

echo "Note: You need to be authenticated in Payload Admin first."
echo "If you see '401 Unauthorized', please:"
echo "  1. Open http://localhost:3002/admin in your browser"
echo "  2. Log in to Payload Admin"
echo "  3. Run this script again from the browser console using fetch()"
echo ""
echo "Or use the manual creation method below..."
echo ""

# Just output the JSON data for manual creation
cat << 'EOF'

═══════════════════════════════════════════════════════════════
MANUAL CREATION: Copy these JSON objects into Payload Admin
Open: http://localhost:3002/admin/collections/seo-settings/create
═══════════════════════════════════════════════════════════════

1. home-primary-exact (Priority: exact_path - HIGHEST)
{
  "identifier": "home-primary-exact",
  "scope": "exact_path",
  "exactPath": "/",
  "metaTitle": "Busrom - Premium Glass Hardware Manufacturer | Global Leader",
  "metaDescription": "Leading manufacturer of premium glass hardware products. Specializing in glass clamps, door handles, hinges and architectural hardware for global markets.",
  "metaKeywords": "glass hardware manufacturer, glass clamps supplier, premium glass fittings, stainless steel hardware, architectural glass hardware",
  "ogTitle": "Busrom Glass Hardware - Premium Quality Solutions",
  "ogDescription": "Global leader in manufacturing high-quality glass hardware products",
  "robotsIndex": true,
  "robotsFollow": true
}

2. home-keywords-glass-clamps
{
  "identifier": "home-keywords-glass-clamps",
  "scope": "exact_path",
  "exactPath": "/",
  "metaTitle": "Glass Clamps & Standoffs | Busrom Hardware Solutions",
  "metaDescription": "High-quality glass clamps, standoffs, and mounting hardware for commercial and residential applications.",
  "metaKeywords": "glass clamps, glass standoffs, glass mounting hardware, glass railing clamps, glass balustrade fittings, point fixing glass, spider glass fittings, frameless glass clamps"
}

3. home-keywords-bathroom
{
  "identifier": "home-keywords-bathroom",
  "scope": "exact_path",
  "exactPath": "/",
  "metaTitle": "Bathroom Hardware & Shower Accessories | Busrom",
  "metaDescription": "Premium bathroom hardware including shower door hinges, handles, and glass accessories.",
  "metaKeywords": "bathroom hardware, shower door hinges, bathroom accessories, glass shower hardware, bathroom glass fittings, shower door handles, bathroom door hardware, shower glass clamps, frameless shower hardware"
}

4. home-keywords-oem-odm
{
  "identifier": "home-keywords-oem-odm",
  "scope": "exact_path",
  "exactPath": "/",
  "metaTitle": "OEM ODM Glass Hardware Factory | Custom Manufacturing",
  "metaDescription": "Professional OEM ODM glass hardware manufacturing services with custom design capabilities and bulk production.",
  "metaKeywords": "OEM glass hardware, ODM hardware manufacturer, custom glass fittings, glass hardware factory, wholesale glass hardware, bulk hardware supplier, hardware manufacturing, custom hardware design, contract manufacturing"
}

5. home-keywords-materials
{
  "identifier": "home-keywords-materials",
  "scope": "exact_path",
  "exactPath": "/",
  "metaTitle": "Stainless Steel Glass Hardware | Durable Premium Quality",
  "metaDescription": "Durable 304 and 316 stainless steel glass hardware for modern architecture and interior design.",
  "metaKeywords": "stainless steel hardware, 304 stainless steel fittings, 316 stainless steel hardware, marine grade hardware, corrosion resistant hardware, modern glass hardware, contemporary glass fittings, rust-proof hardware, weather resistant fittings"
}

6. home-type-keywords-doors (Priority: page_type)
{
  "identifier": "home-type-keywords-doors",
  "scope": "page_type",
  "pageType": "home",
  "metaTitle": "Glass Door Hardware & Handles | Busrom Solutions",
  "metaDescription": "Complete range of glass door hardware, handles, locks and accessories.",
  "metaKeywords": "glass door hardware, door handles, glass door locks, sliding door hardware, pivot door fittings, door handles stainless steel, glass door accessories, commercial door hardware, residential door hardware"
}

7. home-type-keywords-railings
{
  "identifier": "home-type-keywords-railings",
  "scope": "page_type",
  "pageType": "home",
  "metaTitle": "Glass Railing Systems & Balustrades | Busrom",
  "metaDescription": "Premium glass railing systems, balustrades and safety barriers.",
  "metaKeywords": "glass railing systems, glass balustrades, staircase glass railings, balcony glass railings, deck railing hardware, safety glass barriers, frameless glass railings, railing mounting brackets, glass handrail systems"
}

8. home-type-keywords-connectors
{
  "identifier": "home-type-keywords-connectors",
  "scope": "page_type",
  "pageType": "home",
  "metaTitle": "Glass Connectors & Brackets | Structural Hardware",
  "metaDescription": "Structural glass connectors, brackets and fixing systems for architectural applications.",
  "metaKeywords": "glass connectors, structural hardware, glass brackets, fixing systems, architectural brackets, glass to glass connectors, glass to wall brackets, structural glass fittings, point fixed glazing"
}

9. home-pattern-keywords-finish (Priority: path_pattern)
{
  "identifier": "home-pattern-keywords-finish",
  "scope": "path_pattern",
  "pathPattern": "/*",
  "metaTitle": "Polished & Brushed Finish Hardware | Busrom",
  "metaDescription": "Available in mirror polished, brushed satin, and matte black finishes.",
  "metaKeywords": "polished hardware, brushed finish hardware, mirror polish stainless steel, satin finish hardware, matte black hardware, chrome finish hardware, powder coated hardware, surface finishes, decorative hardware finishes"
}

10. home-global-keywords-quality (Priority: global - LOWEST)
{
  "identifier": "home-global-keywords-quality",
  "scope": "global",
  "metaTitle": "Global Glass Hardware Supplier | Busrom Quality Assurance",
  "metaDescription": "ISO certified glass hardware manufacturer with worldwide shipping and quality guarantee.",
  "metaKeywords": "ISO certified manufacturer, quality assurance, worldwide shipping, global supplier, certified hardware, quality control, international shipping, bulk orders, wholesale pricing, factory direct"
}

═══════════════════════════════════════════════════════════════
EXPECTED RESULT AFTER CREATION:
═══════════════════════════════════════════════════════════════

Priority Matching (web/lib/api/seo-settings.ts):
  exact_path (priority 4): Settings #1-5 ✓
  path_pattern (priority 3): Setting #9 ✓
  page_type (priority 2): Settings #6-8 ✓
  global (priority 1): Setting #10 ✓

On Homepage (http://localhost:3000/en):

  1. Meta Tags (from highest priority #1):
     <title>Busrom - Premium Glass Hardware Manufacturer | Global Leader</title>
     <meta name="description" content="Leading manufacturer of premium glass hardware products...">

  2. Hidden Titles (from #2-5, skipping #1):
     <div class="seo-hidden">
       <span data-seo-title>Glass Clamps & Standoffs | Busrom Hardware Solutions</span>
       <span data-seo-title>Bathroom Hardware & Shower Accessories | Busrom</span>
       <span data-seo-title>OEM ODM Glass Hardware Factory | Custom Manufacturing</span>
       <span data-seo-title>Stainless Steel Glass Hardware | Durable Premium Quality</span>
     </div>

  3. Hidden Keywords (from ALL 10 settings, distributed):
     <style>:root {
       --seo-header: "glass hardware manufacturer glass clamps supplier...";
       --seo-main: "premium glass fittings stainless steel hardware...";
       --seo-product: "glass standoffs glass mounting hardware...";
       --seo-sidebar: "bathroom hardware shower door hinges...";
       --seo-footer: "ISO certified manufacturer quality assurance...";
     }</style>

  4. Zone Markers:
     <span data-seo-zone="header"></span>  <!-- ::after shows --seo-header -->
     <span data-seo-zone="main"></span>    <!-- ::after shows --seo-main -->
     <span data-seo-zone="product"></span> <!-- ::after shows --seo-product -->
     <span data-seo-zone="sidebar"></span> <!-- ::after shows --seo-sidebar -->
     <span data-seo-zone="footer"></span>  <!-- ::after shows --seo-footer -->

═══════════════════════════════════════════════════════════════
VERIFICATION STEPS:
═══════════════════════════════════════════════════════════════

1. Create all 10 settings in Payload Admin
2. Visit http://localhost:3000/en
3. Right-click → View Page Source
4. Search for:
   - "Busrom - Premium Glass Hardware" (meta title from #1)
   - "seo-hidden" (should contain 4 hidden titles from #2-5)
   - "--seo-header" (should see CSS variables)
   - "data-seo-zone" (should see 5 zone markers)

EOF
