import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createMediaDirectly() {
  console.log('Creating media record directly in database...');
  
  // Use an existing file in MinIO
  const media = await prisma.media.create({
    data: {
      filename: 'direct-test-image',
      file_id: 'test-image-id-' + Date.now(),
      file_extension: 'jpg',
      status: 'ACTIVE',
      altText: {},
      cropFocalPoint: { x: 50, y: 50 },
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  });
  
  console.log('✅ Media created:', media.id);
  console.log('Now the afterOperation hook should have triggered!');
  console.log('Check the Keystone server logs for hook messages.');
  
  await prisma.$disconnect();
}

createMediaDirectly().catch(console.error);
