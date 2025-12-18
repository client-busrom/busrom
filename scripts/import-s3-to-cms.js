/**
 * Import S3 files to CMS Media records
 *
 * This script:
 * 1. Lists all files in S3 bucket
 * 2. Creates Media records in CMS database based on file paths
 * 3. Uses file path to determine tags (series, category)
 *
 * Run from cms directory:
 *   node ../scripts/import-s3-to-cms.js
 */

const { S3Client, ListObjectsV2Command, HeadObjectCommand } = require('@aws-sdk/client-s3');
// Load Prisma from cms directory
const { PrismaClient } = require('../cms/node_modules/.prisma/client');
const path = require('path');
const crypto = require('crypto');

// Configuration
const S3_BUCKET = process.env.S3_BUCKET_NAME || 'busrom-media-production';
const S3_REGION = process.env.S3_REGION || 'us-east-1';
const CDN_DOMAIN = process.env.CDN_DOMAIN || 'd2kqew3hn5wphn.cloudfront.net';

const s3 = new S3Client({ region: S3_REGION });
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

/**
 * List all S3 objects
 */
async function listAllS3Objects() {
  const objects = [];
  let continuationToken;

  do {
    const command = new ListObjectsV2Command({
      Bucket: S3_BUCKET,
      ContinuationToken: continuationToken,
    });

    const response = await s3.send(command);

    if (response.Contents) {
      objects.push(...response.Contents);
    }

    continuationToken = response.NextContinuationToken;
  } while (continuationToken);

  return objects;
}

/**
 * Get tags from S3 key (file path)
 * Example: glass-standoff/white/glass-standoff_white_001.jpg
 *   -> ['series-glass-standoff', 'type-white']
 */
function getTagsFromKey(key) {
  const parts = key.split('/');
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

/**
 * Generate a unique CUID-like ID
 */
function generateCuid() {
  const timestamp = Date.now().toString(36);
  const random = crypto.randomBytes(8).toString('hex');
  return `c${timestamp}${random}`.slice(0, 25);
}

/**
 * Get tag type from slug prefix
 */
function getTagTypeFromSlug(slug) {
  if (slug.startsWith('series-')) return 'PRODUCT_SERIES';
  if (slug.startsWith('type-')) return 'FUNCTION_TYPE';
  if (slug.startsWith('func-')) return 'FUNCTION_TYPE';
  if (slug.startsWith('scene-')) return 'SCENE_TYPE';
  if (slug.startsWith('spec-')) return 'SPEC';
  if (slug.startsWith('color-')) return 'COLOR';
  return 'CUSTOM';
}

/**
 * Get display name from slug
 */
function getDisplayNameFromSlug(slug) {
  // Remove prefix and convert to title case
  const name = slug
    .replace(/^(series|type|func|scene|spec|color)-/, '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
  return name;
}

/**
 * Create or find tag filter IDs
 */
async function ensureTagFilters(tags) {
  const tagIds = [];

  for (const tagSlug of tags) {
    // Find existing tag
    let tag = await prisma.mediaTag.findUnique({
      where: { slug: tagSlug },
    });

    if (!tag) {
      // Create tag if not exists
      const tagType = getTagTypeFromSlug(tagSlug);
      const displayName = getDisplayNameFromSlug(tagSlug);

      console.log(`Creating tag: ${tagSlug} (type: ${tagType}, name: ${displayName})`);
      tag = await prisma.mediaTag.create({
        data: {
          slug: tagSlug,
          name: { en: displayName },
          type: tagType,
        },
      });
    }

    tagIds.push(tag.id);
  }

  return tagIds;
}

/**
 * Create Media record
 */
async function createMediaRecord(s3Object) {
  const key = s3Object.Key;
  const filename = path.basename(key);
  const ext = getExtension(filename);

  // Skip non-image files
  if (!['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) {
    return null;
  }

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

  // Generate fileUrl
  const fileUrl = `https://${CDN_DOMAIN}/${key}`;

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
      fileKey: key,
      fileSize: s3Object.Size || 0,
      mimeType: mimeTypes[ext] || 'image/jpeg',
      tags: { connect: tagIds.map(id => ({ id })) },
      tagsFilter: tags,
    },
  });

  return { created: true, filename, id: record.id };
}

/**
 * Main function
 */
async function main() {
  console.log('=== S3 to CMS Media Import ===');
  console.log(`Bucket: ${S3_BUCKET}`);
  console.log(`Region: ${S3_REGION}`);
  console.log(`CDN: ${CDN_DOMAIN}`);
  console.log('');

  // List all S3 objects
  console.log('Listing S3 objects...');
  const objects = await listAllS3Objects();
  console.log(`Found ${objects.length} objects in S3\n`);

  // Process each object
  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (let i = 0; i < objects.length; i++) {
    try {
      const result = await createMediaRecord(objects[i]);

      if (result === null) {
        // Non-image file
        continue;
      } else if (result.skipped) {
        skipped++;
      } else if (result.created) {
        created++;
      }

      // Progress report
      if ((created + skipped) % 100 === 0) {
        console.log(`Progress: ${created} created, ${skipped} skipped, ${errors} errors (${i + 1}/${objects.length})`);
      }
    } catch (error) {
      errors++;
      console.error(`Error processing ${objects[i].Key}: ${error.message}`);
    }
  }

  console.log('\n=== Import Complete ===');
  console.log(`Created: ${created}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Errors: ${errors}`);
  console.log(`Total processed: ${objects.length}`);

  // Verify count
  const totalMedia = await prisma.media.count();
  console.log(`\nTotal Media records in database: ${totalMedia}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
