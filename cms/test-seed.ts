/**
 * Test script to verify ProductSeries seeding with sudo
 */

import { getContext } from '@keystone-6/core/context';
import config from './keystone';
import * as PrismaModule from '.prisma/client';

async function main() {
  const context = getContext(config, PrismaModule);

  try {
    console.log('🧪 Testing ProductSeries creation with sudo...\n');

    // Test creating a ProductSeries with sudo
    const series = await context.sudo().query.ProductSeries.createOne({
      data: {
        slug: 'test-series',
        name: { en: 'Test Series', zh: '测试系列' },
        description: { en: 'Test description', zh: '测试描述' },
        status: 'ACTIVE',
        order: 1,
      },
      query: 'id slug',
    });

    console.log('✅ Successfully created ProductSeries with sudo:');
    console.log('   ID:', series.id);
    console.log('   Slug:', series.slug);

    // Clean up
    await context.sudo().query.ProductSeries.deleteOne({
      where: { id: series.id },
    });

    console.log('\n✅ Test passed! Sudo context works for seeding.\n');
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  } finally {
    await context.prisma.$disconnect();
  }
}

main();
