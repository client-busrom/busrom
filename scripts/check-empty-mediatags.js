const { PrismaClient } = require('../cms/node_modules/.prisma/client');
const prisma = new PrismaClient();

async function main() {
  const allTags = await prisma.mediaTag.findMany({
    orderBy: { createdAt: 'desc' }
  });

  console.log('Total MediaTag records:', allTags.length);

  const emptyNameTags = allTags.filter(tag => {
    if (!tag.name) return true;
    if (typeof tag.name === 'object') {
      const values = Object.values(tag.name);
      return values.length === 0 || values.every(v => !v || v === '');
    }
    return false;
  });

  console.log('\nEmpty name records:', emptyNameTags.length);
  console.log(JSON.stringify(emptyNameTags, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
