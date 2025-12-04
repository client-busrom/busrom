const { S3Client, ListObjectsV2Command, DeleteObjectsCommand } = require('@aws-sdk/client-s3');

const s3 = new S3Client({ region: 'us-east-1' });
const bucket = 'busrom-media-production';

async function deleteAllObjects() {
  let totalDeleted = 0;
  let continuationToken = undefined;

  do {
    const listCmd = new ListObjectsV2Command({
      Bucket: bucket,
      ContinuationToken: continuationToken
    });

    const listRes = await s3.send(listCmd);

    if (!listRes.Contents || listRes.Contents.length === 0) {
      console.log('No more objects to delete');
      break;
    }

    const objects = listRes.Contents.map(obj => ({ Key: obj.Key }));

    const deleteCmd = new DeleteObjectsCommand({
      Bucket: bucket,
      Delete: { Objects: objects }
    });

    await s3.send(deleteCmd);
    totalDeleted += objects.length;
    console.log('Deleted', totalDeleted, 'objects...');

    continuationToken = listRes.NextContinuationToken;
  } while (continuationToken);

  console.log('Total deleted:', totalDeleted, 'objects');
}

deleteAllObjects().catch(console.error);
