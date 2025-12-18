/**
 * Import local product files to CMS Media records
 *
 * This script:
 * 1. Scans local products folder for image files
 * 2. Creates Media records in CMS database
 * 3. Uses file path to determine tags (series, category)
 *
 * Run:
 *   DATABASE_URL="..." CDN_DOMAIN="d2kqew3hn5wphn.cloudfront.net" node scripts/import-local-to-cms.js
 */

const { PrismaClient } = require('../cms/node_modules/.prisma/client');
const path = require('path');
const fs = require('fs');

// Configuration
const PRODUCTS_DIR = process.env.PRODUCTS_DIR || '/Users/cerfbaleine/workspace/products';
const CDN_DOMAIN = process.env.CDN_DOMAIN || 'd2kqew3hn5wphn.cloudfront.net';

const prisma = new PrismaClient();

// Series name mapping (folder name -> slug)
const SERIES_MAP = {
  'bathroom-door-handle': 'series-bathroom-door-handle',
  'glass-fence-spigot': 'series-glass-fence-spigot',
  'glass-hinge': 'series-glass-hinge',
  'glass-standoff': 'series-glass-standoff',
  'guardrail-glass-clip': 'series-guardrail-glass-clip',
  'hidden-hook': 'series-hidden-hook',
  'handrail-bracket': 'series-handrail-bracket',
  'robe-hook': 'series-robe-hook',
  'sliding-door-kit': 'series-sliding-door-kit',
};

// Category mapping (folder name -> slug)
const CATEGORY_MAP = {
  'effect': 'type-effect',
  'product': 'type-product',
  'scene': 'type-scene',
  'showcase': 'type-showcase',
  'size': 'type-size',
  'white': 'type-white',
};

// Get all image files recursively
function getAllFiles(dir, files = []) {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      getAllFiles(fullPath, files);
    } else if (/\.(jpg|jpeg|png|webp|gif)$/i.test(item) && !item.startsWith('.')) {
      files.push({
        fullPath,
        key: path.relative(PRODUCTS_DIR, fullPath),
        size: stat.size,
      });
    }
  }
  return files;
}

/**
 * Get tags from file key (relative path)
 * Example: glass-standoff/white/glass-standoff_white_001.jpg
 *   -> ['series-glass-standoff', 'type-white']
 */
function getTagsFromKey(key) {
  const parts = key.split(path.sep);
  const tags = [];

  if (parts.length >= 2) {
    const seriesFolder = parts[0];
    const categoryFolder = parts[1];

    // Add series tag
    if (SERIES_MAP[seriesFolder]) {
      tags.push(SERIES_MAP[seriesFolder]);
    }

    // Add category tag
    if (CATEGORY_MAP[categoryFolder]) {
      tags.push(CATEGORY_MAP[categoryFolder]);
    }
  }

  return tags;
}

/**
 * Get file extension
 */
function getExtension(filename) {
  const ext = path.extname(filename).toLowerCase();
  return ext.replace('.', '');
}

// Cache for tag IDs
const tagCache = new Map();

/**
 * Create or find tag filter IDs (with caching)
 */
async function ensureTagFilters(tags) {
  const tagIds = [];

  for (const tagSlug of tags) {
    // Check cache first
    if (tagCache.has(tagSlug)) {
      tagIds.push(tagCache.get(tagSlug));
      continue;
    }

    // Find existing tag
    let tag = await prisma.mediaTag.findUnique({
      where: { slug: tagSlug },
    });

    if (!tag) {
      // Create tag if not exists
      console.log(`Creating tag: ${tagSlug}`);
      tag = await prisma.mediaTag.create({
        data: {
          slug: tagSlug,
          name: tagSlug.replace(/-/g, ' ').replace(/^(series|type) /, ''),
        },
      });
    }

    tagCache.set(tagSlug, tag.id);
    tagIds.push(tag.id);
  }

  return tagIds;
}

/**
 * Create Media record
 */
async function createMediaRecord(fileInfo) {
  const { key, size } = fileInfo;
  const filename = path.basename(key);
  const ext = getExtension(filename);

  // Check if already exists by filename
  const existing = await prisma.media.findFirst({
    where: { filename },
  });

  if (existing) {
    return { skipped: true, filename };
  }

  // Get tags
  const tags = getTagsFromKey(key);
  const tagIds = await ensureTagFilters(tags);

  // Generate fileUrl - use forward slashes for URL
  const urlKey = key.replace(/\\/g, '/');
  const fileUrl = `https://${CDN_DOMAIN}/${urlKey}`;

  // Get mime type
  const mimeTypes = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'webp': 'image/webp',
    'gif': 'image/gif',
  };

  // Create record
  const record = await prisma.media.create({
    data: {
      filename,
      fileUrl,
      fileKey: urlKey,
      fileSize: size || 0,
      mimeType: mimeTypes[ext] || 'image/jpeg',
      tags: { connect: tagIds.map(id => ({ id })) },
      tagsFilter: { connect: tagIds.map(id => ({ id })) },
    },
  });

  return { created: true, filename, id: record.id };
}

/**
 * Main function
 */
async function main() {
  console.log('=== Local to CMS Media Import ===');
  console.log(`Products dir: ${PRODUCTS_DIR}`);
  console.log(`CDN: ${CDN_DOMAIN}`);
  console.log('');

  // Scan local files
  console.log('Scanning local files...');
  const files = getAllFiles(PRODUCTS_DIR);
  console.log(`Found ${files.length} image files\n`);

  // Process each file
  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (let i = 0; i < files.length; i++) {
    try {
      const result = await createMediaRecord(files[i]);

      if (result.skipped) {
        skipped++;
      } else if (result.created) {
        created++;
      }

      // Progress report
      if ((created + skipped) % 100 === 0) {
        console.log(`Progress: ${created} created, ${skipped} skipped, ${errors} errors (${i + 1}/${files.length})`);
      }
    } catch (error) {
      errors++;
      console.error(`Error processing ${files[i].key}: ${error.message}`);
    }
  }

  console.log('\n=== Import Complete ===');
  console.log(`Created: ${created}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Errors: ${errors}`);
  console.log(`Total processed: ${files.length}`);

  // Verify count
  const totalMedia = await prisma.media.count();
  console.log(`\nTotal Media records in database: ${totalMedia}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
