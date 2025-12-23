#!/bin/bash
# Migrate S3 files to /media/ directory using aws s3 sync for better performance
# Usage: ./scripts/migrate-s3-to-media.sh [--dry-run]

S3_BUCKET="busrom-media-production"
DRY_RUN=""

if [[ "$1" == "--dry-run" ]]; then
    DRY_RUN="--dryrun"
    echo "🔍 DRY RUN MODE - No changes will be made"
fi

echo "🚀 S3 Media Migration Script"
echo ""

# Get list of top-level directories (product series)
echo "📂 Finding directories to migrate..."
DIRS=$(aws s3 ls s3://${S3_BUCKET}/ | grep "PRE" | awk '{print $2}' | grep -v "media/" | grep -v "variants/")

echo "   Directories to migrate:"
echo "$DIRS" | while read dir; do
    if [[ -n "$dir" ]]; then
        count=$(aws s3 ls s3://${S3_BUCKET}/${dir} --recursive | wc -l | xargs)
        echo "   - ${dir} ($count files)"
    fi
done

echo ""
echo "📦 Step 1: Copy files to /media/ directory..."

# For each directory, copy files to /media/ with flattened structure
for dir in $DIRS; do
    if [[ -n "$dir" ]]; then
        echo "   Processing ${dir}..."
        # List all files and copy each to media/
        aws s3 ls s3://${S3_BUCKET}/${dir} --recursive | awk '{print $4}' | while read file; do
            if [[ -n "$file" ]]; then
                filename=$(basename "$file")
                if [[ -n "$DRY_RUN" ]]; then
                    echo "   Would copy: $file -> media/$filename"
                else
                    aws s3 cp "s3://${S3_BUCKET}/${file}" "s3://${S3_BUCKET}/media/${filename}" --quiet
                fi
            fi
        done
    fi
done

echo ""
echo "🗑️  Step 2: Delete old directories..."

for dir in $DIRS; do
    if [[ -n "$dir" ]]; then
        if [[ -n "$DRY_RUN" ]]; then
            echo "   Would delete: s3://${S3_BUCKET}/${dir}"
        else
            echo "   Deleting ${dir}..."
            aws s3 rm "s3://${S3_BUCKET}/${dir}" --recursive --quiet
        fi
    fi
done

echo ""
echo "🗑️  Step 3: Delete variants directory..."
if [[ -n "$DRY_RUN" ]]; then
    count=$(aws s3 ls s3://${S3_BUCKET}/variants/ --recursive 2>/dev/null | wc -l | xargs)
    echo "   Would delete $count files from variants/"
else
    aws s3 rm "s3://${S3_BUCKET}/variants/" --recursive --quiet 2>/dev/null
    echo "   ✓ Deleted variants/"
fi

echo ""
echo "✅ S3 migration complete!"

if [[ -n "$DRY_RUN" ]]; then
    echo ""
    echo "ℹ️  This was a dry run. Run without --dry-run to apply changes."
fi
