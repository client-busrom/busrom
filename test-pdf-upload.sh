#!/bin/bash

echo "========================================="
echo "测试 PDF 文件上传"
echo "========================================="
echo ""

# 创建一个简单的 PDF 文件用于测试
echo "1. 创建测试 PDF 文件..."
echo "%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/Resources <<
/Font <<
/F1 <<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
>>
>>
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj
4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
100 700 Td
(Test PDF) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000317 00000 n
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
409
%%EOF" > /tmp/test-upload.pdf

echo "✅ 测试 PDF 文件已创建: /tmp/test-upload.pdf"
echo ""

# 检查文件的魔法数字
echo "2. 检查文件魔法数字..."
xxd -l 16 /tmp/test-upload.pdf
echo ""

# 获取 FormConfig ID (contact-us-form)
echo "3. 获取 FormConfig ID..."
FORM_CONFIG_ID=$(curl -s http://localhost:3000/api/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { formConfigs(where: { slug: { equals: \"contact-us-form\" } }) { id name } }"
  }' | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$FORM_CONFIG_ID" ]; then
  echo "❌ 无法获取 FormConfig ID"
  exit 1
fi

echo "✅ FormConfig ID: $FORM_CONFIG_ID"
echo ""

# 上传文件
echo "4. 上传 PDF 文件..."
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -X POST http://localhost:3001/api/form-file-upload \
  -F "file=@/tmp/test-upload.pdf" \
  -F "formConfigId=$FORM_CONFIG_ID" \
  -F "fieldName=file")

HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS/d')

echo "HTTP状态: $HTTP_STATUS"
echo "响应:"
echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
echo ""

if [ "$HTTP_STATUS" = "200" ]; then
  echo "✅ PDF 上传成功！"

  # 检查 S3 中的文件
  echo ""
  echo "5. 检查 S3 中的文件..."
  docker exec busrom-minio mc ls --recursive local/busrom-media/form-attachments/ | tail -1

  # 检查 TempFileUpload 记录
  echo ""
  echo "6. 检查 TempFileUpload 记录..."
  docker exec busrom-postgres psql -U busrom -d busrom_cms -c "SELECT \"fileName\", \"fileType\", status FROM \"TempFileUpload\" ORDER BY \"uploadedAt\" DESC LIMIT 1;"
else
  echo "❌ PDF 上传失败"
fi

echo ""
echo "========================================="

# 清理测试文件
rm -f /tmp/test-upload.pdf
