#!/bin/bash

# Test creating a media record directly via GraphQL
# This simulates what happens when you upload through the UI

echo "Testing media creation via GraphQL..."

# Create a small test image
echo "Creating test image..."
convert -size 100x100 xc:blue /tmp/test-upload.jpg 2>/dev/null || {
  # Fallback: create a dummy file if imagemagick is not available
  dd if=/dev/urandom of=/tmp/test-upload.jpg bs=1024 count=10 2>/dev/null
}

# Upload to MinIO first
echo "Uploading to MinIO..."
docker exec busrom-minio mc cp /tmp/test-upload.jpg local/busrom-media/test-hook-upload.jpg

# Now create the media record via GraphQL
# The hook should trigger after this
echo "Creating media record via GraphQL..."
curl -s -X POST http://localhost:3000/api/graphql \
  -H 'Content-Type: application/json' \
  -d '{
    "query": "mutation { createMedia(data: { filename: \"test-hook-upload\", file: { upload: null }, status: \"ACTIVE\" }) { id filename } }"
  }' | python3 -m json.tool

echo ""
echo "Check the Keystone logs for hook execution messages!"
