/**
 * Merge bathroom-handle and door-handle into bathroom-door-handle
 * Uses GraphQL API - can run from local machine
 *
 * Run with:
 * GRAPHQL_ENDPOINT="https://cms.busromhouse.com/api/graphql" \
 * AUTH_TOKEN="your-session-token" \
 * node scripts/merge-handle-series-graphql.js
 */

const GRAPHQL_ENDPOINT = process.env.GRAPHQL_ENDPOINT || 'https://cms.busromhouse.com/api/graphql';
const AUTH_TOKEN = process.env.AUTH_TOKEN;

// IDs from production database
const OLD_MEDIA_TAGS = {
  'series-bathroom-handle': '64eeaf68-cfc4-4368-99a5-9bb47964eb45',
  'series-door-handle': '54e6463c-f3d6-4f0e-880f-a14a0ff2dcbc',
};

const OLD_PRODUCT_SERIES = {
  'bathroom-handle': 'fece235f-2673-4543-9209-9378535e5e62',
  'door-handle': 'f1df15ef-01dc-42a4-a638-c335bf852c3e',
};

async function graphql(query, variables = {}) {
  const headers = {
    'Content-Type': 'application/json',
  };
  if (AUTH_TOKEN) {
    headers['Cookie'] = `keystonejs-session=${AUTH_TOKEN}`;
  }

  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables }),
  });

  const result = await response.json();
  if (result.errors) {
    console.error('GraphQL Errors:', JSON.stringify(result.errors, null, 2));
    throw new Error(result.errors[0].message);
  }
  return result.data;
}

async function main() {
  console.log('🚀 Starting merge: bathroom-handle + door-handle → bathroom-door-handle\n');
  console.log(`   Endpoint: ${GRAPHQL_ENDPOINT}`);
  console.log(`   Auth: ${AUTH_TOKEN ? 'Yes' : 'No (read-only mode)'}\n`);

  if (!AUTH_TOKEN) {
    console.log('⚠️  No AUTH_TOKEN provided. Running in read-only mode.\n');
  }

  // Step 1: Check current state
  console.log('📊 Step 1: Checking current state...');

  const tagsQuery = `
    query {
      bathroomHandle: mediaTags(where: { id: { equals: "${OLD_MEDIA_TAGS['series-bathroom-handle']}" } }) {
        id slug mediaCount
      }
      doorHandle: mediaTags(where: { id: { equals: "${OLD_MEDIA_TAGS['series-door-handle']}" } }) {
        id slug mediaCount
      }
      newTag: mediaTags(where: { slug: { equals: "series-bathroom-door-handle" } }) {
        id slug mediaCount
      }
    }
  `;

  const tagsData = await graphql(tagsQuery);
  const bathroomCount = tagsData.bathroomHandle[0]?.mediaCount || 0;
  const doorCount = tagsData.doorHandle[0]?.mediaCount || 0;
  const existingNewTag = tagsData.newTag[0];

  console.log(`   - series-bathroom-handle: ${bathroomCount} media files`);
  console.log(`   - series-door-handle: ${doorCount} media files`);
  console.log(`   - Total to merge: ${bathroomCount + doorCount} media files`);

  if (existingNewTag) {
    console.log(`   - series-bathroom-door-handle already exists: ${existingNewTag.mediaCount} media files`);
  }
  console.log('');

  if (!AUTH_TOKEN) {
    console.log('❌ Cannot proceed without AUTH_TOKEN. Please provide authentication.\n');
    console.log('To get your session token:');
    console.log('1. Login to https://cms.busromhouse.com');
    console.log('2. Open DevTools → Application → Cookies');
    console.log('3. Copy the value of "keystonejs-session"');
    console.log('4. Run: AUTH_TOKEN="your-token" node scripts/merge-handle-series-graphql.js');
    return;
  }

  // Step 2: Create new MediaTag
  console.log('📝 Step 2: Creating new MediaTag...');

  let newMediaTagId;
  if (existingNewTag) {
    newMediaTagId = existingNewTag.id;
    console.log(`   ✅ MediaTag already exists: ${newMediaTagId}\n`);
  } else {
    const createTagMutation = `
      mutation {
        createMediaTag(data: {
          slug: "series-bathroom-door-handle"
          name: { en: "Bathroom & Door Handle", zh: "浴室&大门拉手" }
          type: "PRODUCT_SERIES"
          order: 8
        }) {
          id slug
        }
      }
    `;
    const createTagData = await graphql(createTagMutation);
    newMediaTagId = createTagData.createMediaTag.id;
    console.log(`   ✅ Created MediaTag: ${newMediaTagId}\n`);
  }

  // Step 3: Create new ProductSeries
  console.log('📝 Step 3: Creating new ProductSeries...');

  const checkSeriesQuery = `
    query {
      productSeriesItems(where: { slug: { equals: "bathroom-door-handle" } }) {
        id slug
      }
      existingSeries: productSeriesItems(where: { slug: { equals: "bathroom-handle" } }) {
        id description featuredImage order
      }
    }
  `;
  const seriesData = await graphql(checkSeriesQuery);

  let newProductSeriesId;
  if (seriesData.productSeriesItems.length > 0) {
    newProductSeriesId = seriesData.productSeriesItems[0].id;
    console.log(`   ✅ ProductSeries already exists: ${newProductSeriesId}\n`);
  } else {
    const existingSeries = seriesData.existingSeries[0];
    const createSeriesMutation = `
      mutation($description: JSON, $featuredImage: JSON) {
        createProductSeries(data: {
          slug: "bathroom-door-handle"
          name: { en: "Bathroom & Door Handle", zh: "浴室&大门拉手" }
          description: $description
          featuredImage: $featuredImage
          order: ${existingSeries?.order || 8}
          status: "PUBLISHED"
        }) {
          id slug
        }
      }
    `;
    const createSeriesData = await graphql(createSeriesMutation, {
      description: existingSeries?.description || {},
      featuredImage: existingSeries?.featuredImage || null,
    });
    newProductSeriesId = createSeriesData.createProductSeries.id;
    console.log(`   ✅ Created ProductSeries: ${newProductSeriesId}\n`);
  }

  // Step 4: Get all media IDs for bathroom-handle
  console.log('🔄 Step 4: Fetching media for bathroom-handle...');

  const bathroomMediaQuery = `
    query {
      mediaFiles(where: { tags: { some: { id: { equals: "${OLD_MEDIA_TAGS['series-bathroom-handle']}" } } } }, take: 1000) {
        id filename
      }
    }
  `;
  const bathroomMediaData = await graphql(bathroomMediaQuery);
  const bathroomMediaIds = bathroomMediaData.mediaFiles.map(m => m.id);
  console.log(`   Found ${bathroomMediaIds.length} media files\n`);

  // Step 5: Get all media IDs for door-handle
  console.log('🔄 Step 5: Fetching media for door-handle...');

  const doorMediaQuery = `
    query {
      mediaFiles(where: { tags: { some: { id: { equals: "${OLD_MEDIA_TAGS['series-door-handle']}" } } } }, take: 1000) {
        id filename
      }
    }
  `;
  const doorMediaData = await graphql(doorMediaQuery);
  const doorMediaIds = doorMediaData.mediaFiles.map(m => m.id);
  console.log(`   Found ${doorMediaIds.length} media files\n`);

  // Step 6: Update media tags (batch update)
  console.log('🔄 Step 6: Updating media tags...');

  const allMediaIds = [...bathroomMediaIds, ...doorMediaIds];
  let updated = 0;

  for (const mediaId of allMediaIds) {
    const updateMutation = `
      mutation {
        updateMedia(where: { id: "${mediaId}" }, data: {
          tags: {
            disconnect: [
              { id: "${OLD_MEDIA_TAGS['series-bathroom-handle']}" },
              { id: "${OLD_MEDIA_TAGS['series-door-handle']}" }
            ]
            connect: [{ id: "${newMediaTagId}" }]
          }
          tagsFilter: {
            disconnect: [
              { id: "${OLD_MEDIA_TAGS['series-bathroom-handle']}" },
              { id: "${OLD_MEDIA_TAGS['series-door-handle']}" }
            ]
            connect: [{ id: "${newMediaTagId}" }]
          }
        }) {
          id
        }
      }
    `;

    try {
      await graphql(updateMutation);
      updated++;
      if (updated % 50 === 0) {
        console.log(`   ... processed ${updated}/${allMediaIds.length}`);
      }
    } catch (error) {
      console.error(`   ❌ Failed to update media ${mediaId}:`, error.message);
    }
  }
  console.log(`   ✅ Updated ${updated} media files\n`);

  // Step 7: Archive old MediaTags
  console.log('📦 Step 7: Archiving old MediaTags...');

  const archiveTagsMutation = `
    mutation {
      tag1: updateMediaTag(where: { id: "${OLD_MEDIA_TAGS['series-bathroom-handle']}" }, data: {
        slug: "series-bathroom-handle-archived"
        order: 999
      }) { id }
      tag2: updateMediaTag(where: { id: "${OLD_MEDIA_TAGS['series-door-handle']}" }, data: {
        slug: "series-door-handle-archived"
        order: 999
      }) { id }
    }
  `;
  await graphql(archiveTagsMutation);
  console.log('   ✅ Archived old MediaTags\n');

  // Step 8: Archive old ProductSeries
  console.log('📦 Step 8: Archiving old ProductSeries...');

  const archiveSeriesMutation = `
    mutation {
      series1: updateProductSeries(where: { id: "${OLD_PRODUCT_SERIES['bathroom-handle']}" }, data: {
        status: "ARCHIVED"
      }) { id }
      series2: updateProductSeries(where: { id: "${OLD_PRODUCT_SERIES['door-handle']}" }, data: {
        status: "ARCHIVED"
      }) { id }
    }
  `;
  await graphql(archiveSeriesMutation);
  console.log('   ✅ Archived old ProductSeries\n');

  // Step 9: Verify final state
  console.log('✅ Step 9: Verifying final state...');

  const verifyQuery = `
    query {
      newTag: mediaTags(where: { id: { equals: "${newMediaTagId}" } }) {
        id slug mediaCount
      }
    }
  `;
  const verifyData = await graphql(verifyQuery);
  const finalCount = verifyData.newTag[0]?.mediaCount || 0;

  console.log(`   - series-bathroom-door-handle: ${finalCount} media files`);
  console.log('\n🎉 Merge completed successfully!');
}

main().catch(console.error);
