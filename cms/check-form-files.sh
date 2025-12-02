#!/bin/bash

echo "========================================="
echo "Web前端上传的表单附件文件分析"
echo "========================================="
echo ""

echo "📂 S3中的文件列表："
echo ""
docker exec busrom-minio mc ls --recursive local/busrom-media/form-attachments/ 2>/dev/null

echo ""
echo "========================================="
echo "📊 文件统计："
echo ""

# 统计文件数量
file_count=$(docker exec busrom-minio mc ls --recursive local/busrom-media/form-attachments/ 2>/dev/null | wc -l)
echo "总文件数: $file_count"

# 计算总大小
total_size=$(docker exec busrom-minio mc ls --recursive local/busrom-media/form-attachments/ 2>/dev/null | awk '{sum+=$4} END {print sum/1024/1024 " MB"}')
echo "总大小: $total_size"

echo ""
echo "========================================="
echo "🔍 文件上传时间分析："
echo ""

# 获取最早和最晚的文件
echo "最早上传: $(docker exec busrom-minio mc ls --recursive local/busrom-media/form-attachments/ 2>/dev/null | head -1 | awk '{print $1, $2}')"
echo "最晚上传: $(docker exec busrom-minio mc ls --recursive local/busrom-media/form-attachments/ 2>/dev/null | tail -1 | awk '{print $1, $2}')"

echo ""
echo "========================================="
echo "📋 FormSubmission表中的附件记录："
echo ""

docker exec busrom-postgres psql -U busrom -d busrom_cms -c "
SELECT
  COUNT(*) as total_submissions,
  COUNT(CASE WHEN attachments::text != '[]' THEN 1 END) as with_attachments,
  COUNT(CASE WHEN attachments::text = '[]' OR attachments IS NULL THEN 1 END) as without_attachments
FROM \"FormSubmission\"
" 2>/dev/null

echo ""
echo "========================================="
echo "⚠️  状态分析："
echo ""

# 检查是否有TempFileUpload记录
temp_count=$(docker exec busrom-postgres psql -U busrom -d busrom_cms -t -c "SELECT COUNT(*) FROM \"TempFileUpload\"" 2>/dev/null | tr -d ' ')

if [ "$temp_count" = "0" ]; then
  echo "❌ TempFileUpload表中无记录"
  echo "   这些文件是在跟踪系统实现之前上传的"
  echo ""
  echo "🔧 建议操作："
  echo "   这些是【孤儿文件】，因为："
  echo "   1. 未在FormSubmission中找到对应的附件记录"
  echo "   2. 未在TempFileUpload中跟踪"
  echo "   3. 只是测试时上传，但从未提交表单"
  echo ""
  echo "   可以安全删除这些测试文件："
  echo "   docker exec busrom-minio mc rm --recursive --force local/busrom-media/form-attachments/"
else
  echo "✅ TempFileUpload表中有 $temp_count 条记录"
fi

echo ""
echo "========================================="
