/**
 * Upload all product images to S3 using Node.js AWS SDK
 * This bypasses system proxy issues that affect AWS CLI
 */

const { S3Client, PutObjectCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readFile = promisify(fs.readFile);

// Configuration
const BUCKET = 'busrom-media-production';
const REGION = 'us-east-1';
const PRODUCTS_DIR = '/Users/cerfbaleine/workspace/products';
const CONCURRENCY = 10; // Number of parallel uploads

const s3 = new S3Client({ region: REGION });

// Get all image files recursively
function getAllFiles(dir, files = []) {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      getAllFiles(fullPath, files);
    } else if (/\.(jpg|jpeg|png|webp|gif)$/i.test(item) && !item.startsWith('.')) {
      files.push(fullPath);
    }
  }
  return files;
}

// Get content type based on extension
function getContentType(filename) {
  const ext = path.extname(filename).toLowerCase();
  const types = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
  };
  return types[ext] || 'application/octet-stream';
}

// Upload a single file
async function uploadFile(localPath, retries = 3) {
  const key = path.relative(PRODUCTS_DIR, localPath);

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const fileContent = await readFile(localPath);
      const command = new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: fileContent,
        ContentType: getContentType(localPath),
      });

      await s3.send(command);
      return { success: true, key };
    } catch (error) {
      if (attempt === retries) {
        return { success: false, key, error: error.message };
      }
      // Wait before retry
      await new Promise(r => setTimeout(r, 1000 * attempt));
    }
  }
}

// Process files in batches with concurrency limit
async function uploadBatch(files, startIdx, batchSize) {
  const batch = files.slice(startIdx, startIdx + batchSize);
  const results = await Promise.all(batch.map(f => uploadFile(f)));
  return results;
}

async function main() {
  console.log('Scanning for image files...');
  const files = getAllFiles(PRODUCTS_DIR);
  console.log(`Found ${files.length} image files to upload\n`);

  let uploaded = 0;
  let failed = 0;
  const failedFiles = [];
  const startTime = Date.now();

  // Process in batches
  for (let i = 0; i < files.length; i += CONCURRENCY) {
    const results = await uploadBatch(files, i, CONCURRENCY);

    for (const result of results) {
      if (result.success) {
        uploaded++;
      } else {
        failed++;
        failedFiles.push(result);
      }
    }

    // Progress report every 100 files
    if ((uploaded + failed) % 100 === 0 || i + CONCURRENCY >= files.length) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      const rate = (uploaded / elapsed * 60).toFixed(1);
      console.log(`Progress: ${uploaded}/${files.length} uploaded (${failed} failed) - ${rate} files/min`);
    }
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n=== Upload Complete ===`);
  console.log(`Total: ${uploaded} uploaded, ${failed} failed`);
  console.log(`Time: ${totalTime}s`);

  if (failedFiles.length > 0) {
    console.log(`\nFailed files:`);
    failedFiles.slice(0, 10).forEach(f => console.log(`  - ${f.key}: ${f.error}`));
    if (failedFiles.length > 10) {
      console.log(`  ... and ${failedFiles.length - 10} more`);
    }
  }

  // Verify count in S3
  console.log('\nVerifying S3 count...');
  let s3Count = 0;
  let token = undefined;
  do {
    const res = await s3.send(new ListObjectsV2Command({ Bucket: BUCKET, ContinuationToken: token }));
    s3Count += res.KeyCount || 0;
    token = res.NextContinuationToken;
  } while (token);

  console.log(`S3 bucket now has ${s3Count} files`);
}

main().catch(console.error);
