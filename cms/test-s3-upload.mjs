import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: 'us-east-1',
  credentials: {
    accessKeyId: 'minioadmin',
    secretAccessKey: 'minioadmin123',
  },
  endpoint: 'http://localhost:9000',
  forcePathStyle: true,
});

async function testUpload() {
  try {
    console.log('Testing S3 upload to variants folder...');
    
    const testData = Buffer.from('test image data');
    const key = 'variants/thumbnail/test.jpg';
    
    await s3Client.send(
      new PutObjectCommand({
        Bucket: 'busrom-media',
        Key: key,
        Body: testData,
        ContentType: 'image/jpeg',
      })
    );
    
    console.log(`✅ Successfully uploaded to: ${key}`);
  } catch (error) {
    console.error('❌ Upload failed:', error.message);
    console.error('Error code:', error.Code);
  }
}

testUpload();
