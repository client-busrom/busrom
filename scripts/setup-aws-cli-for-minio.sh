#!/bin/bash

##############################################################################
# 配置 AWS CLI 使用本地 MinIO
##############################################################################
# 此脚本配置 AWS CLI 使其可以连接到本地 MinIO S3
# 运行后可以使用标准的 AWS CLI 命令上传文件到 MinIO
##############################################################################

set -e

echo "════════════════════════════════════════════════════════════════"
echo "  配置 AWS CLI 连接本地 MinIO"
echo "════════════════════════════════════════════════════════════════"
echo ""

# 检查 AWS CLI 是否安装
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI 未安装"
    echo ""
    echo "请安装 AWS CLI:"
    echo "  macOS:  brew install awscli"
    echo "  Linux:  pip install awscli"
    echo ""
    exit 1
fi

echo "✅ AWS CLI 已安装: $(aws --version)"
echo ""

# 配置 MinIO profile
echo "📝 配置 MinIO profile..."
echo ""

aws configure set aws_access_key_id minioadmin --profile minio
aws configure set aws_secret_access_key minioadmin123 --profile minio
aws configure set region us-east-1 --profile minio

echo "✅ MinIO profile 配置完成"
echo ""

# 显示配置信息
echo "════════════════════════════════════════════════════════════════"
echo "  配置信息"
echo "════════════════════════════════════════════════════════════════"
echo "Profile:            minio"
echo "Endpoint:           http://localhost:9000"
echo "Bucket:             busrom-media"
echo "Access Key:         minioadmin"
echo "Secret Key:         minioadmin123"
echo "Region:             us-east-1"
echo ""

# 测试连接
echo "🔍 测试连接..."
if aws s3 ls --endpoint-url http://localhost:9000 --profile minio &> /dev/null; then
    echo "✅ 连接成功！"
    echo ""
    echo "📦 可用的 buckets:"
    aws s3 ls --endpoint-url http://localhost:9000 --profile minio
else
    echo "❌ 连接失败"
    echo ""
    echo "请确保 MinIO 正在运行:"
    echo "  docker-compose up -d"
    exit 1
fi

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "  使用示例"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "# 上传单个文件"
echo "aws s3 cp image.jpg s3://busrom-media/test/ \\"
echo "  --endpoint-url http://localhost:9000 \\"
echo "  --profile minio"
echo ""
echo "# 批量上传文件夹"
echo "aws s3 sync ./images/ s3://busrom-media/01-glass-standoff/product-images/s01/ \\"
echo "  --endpoint-url http://localhost:9000 \\"
echo "  --profile minio"
echo ""
echo "# 列出文件"
echo "aws s3 ls s3://busrom-media/01-glass-standoff/ \\"
echo "  --endpoint-url http://localhost:9000 \\"
echo "  --profile minio \\"
echo "  --recursive"
echo ""
echo "════════════════════════════════════════════════════════════════"
