# 批量上传快速开始 🚀

使用 AWS CLI 批量上传图片到 MinIO/S3，然后批量导入到 CMS。

## ⚡ 快速开始（5 分钟）

### 1. 启动服务

```bash
# 启动 MinIO 和 PostgreSQL
docker-compose up -d

# 启动 CMS（会自动初始化数据）
cd cms
npm run dev
```

### 2. 配置 AWS CLI

```bash
cd ..
npm run setup-minio

# 或直接运行脚本
./scripts/setup-aws-cli-for-minio.sh
```

### 3. 上传图片到 MinIO

```bash
# 上传单个产品系列
aws s3 sync ~/workspace/products/01-glass-standoff/product-images/s01/ \
  s3://busrom-media/01-glass-standoff/product-images/s01/ \
  --endpoint-url http://localhost:9000 \
  --profile minio \
  --exclude "*.DS_Store"
```

### 4. 导入到 CMS

**方式 A: 使用现有配置文件**

```bash
# 导入单个配置
npm run batch-import scripts/metadata/glass-standoff-s01.json
```

**方式 B: 自动生成所有配置**

```bash
# 1. 先上传所有图片
aws s3 sync ~/workspace/products/ \
  s3://busrom-media/ \
  --endpoint-url http://localhost:9000 \
  --profile minio \
  --exclude "*.DS_Store"

# 2. 自动生成配置文件
npm run generate-configs

# 3. 批量导入所有
for config in scripts/metadata/*.json; do
  npm run batch-import "$config"
done
```

### 5. 验证结果

访问 http://localhost:3000/media 查看导入的图片。

## 📚 详细文档

- [完整使用指南](docs/BATCH_UPLOAD_AWS_CLI_GUIDE.md)
- [Metadata 配置说明](scripts/metadata/README.md)
- [最终数据结构](docs/FINAL_SEED_STRUCTURE.md)

## 💡 核心概念

### 工作流程

```
图片文件 --[AWS CLI]--> MinIO S3 --[导入脚本]--> CMS 数据库
                                                  ├── Category
                                                  ├── Tags
                                                  └── Metadata
```

### 目录结构

```
products/                           MinIO S3
└── 01-glass-standoff/         →   └── 01-glass-standoff/
    ├── product-images/                ├── product-images/
    │   ├── s01/                       │   ├── s01/
    │   ├── s02/                       │   ├── s02/
    │   └── general/                   │   └── general/
    └── scene-images/                  └── scene-images/
```

### Metadata 配置

```json
{
  "s3Prefix": "01-glass-standoff/product-images/s01/",
  "primaryCategory": "product-image",
  "tags": ["series-glass-standoff"],
  "defaultMetadata": {
    "seriesNumber": 1,
    "specs": ["50mm", "不锈钢"],
    "colors": ["银色"]
  }
}
```

## 🛠️ 常用命令

### AWS CLI 命令

```bash
# 列出所有文件
aws s3 ls s3://busrom-media/ \
  --endpoint-url http://localhost:9000 \
  --profile minio \
  --recursive

# 上传文件夹
aws s3 sync ./local-folder/ s3://busrom-media/remote-folder/ \
  --endpoint-url http://localhost:9000 \
  --profile minio

# 删除文件
aws s3 rm s3://busrom-media/path/to/file.jpg \
  --endpoint-url http://localhost:9000 \
  --profile minio
```

### 导入命令

```bash
# 自动生成配置
npm run generate-configs

# 导入单个配置
npm run batch-import scripts/metadata/your-config.json

# 批量导入
for config in scripts/metadata/*.json; do
  npm run batch-import "$config"
done
```

## 📋 可用的 Category 和 Tag

### MediaCategory (12个)

- `product-image` - 产品图
- `scene-image` - 场景图
- `actual-photo` - 实拍图
- `dimension-image` - 尺寸图
- `installation-image` - 安装图
- `detail-image` - 细节图
- `combined-image` - 组合展示图
- `multi-style-image` - 多款式图
- `color-display` - 颜色展示
- `common-image` - 通用图
- `manufacturing` - 生产图
- `package-image` - 包装图

### 产品系列 Tag (10个)

- `series-glass-standoff` - 玻璃固定夹
- `series-glass-connected-fitting` - 玻璃连接件
- `series-glass-fence-spigot` - 玻璃栏杆立柱
- `series-guardrail-glass-clip` - 护栏玻璃夹
- `series-bathroom-glass-clip` - 浴室玻璃夹
- `series-glass-hinge` - 玻璃合页
- `series-sliding-door-kit` - 滑动门套件
- `series-bathroom-handle` - 浴室拉手
- `series-door-handle` - 门拉手
- `series-hidden-hook` - 隐藏式挂钩

完整列表见 [FINAL_SEED_STRUCTURE.md](docs/FINAL_SEED_STRUCTURE.md)

## ⚠️ 注意事项

1. **文件名唯一性**: 文件名将作为 `file_id`，必须唯一
2. **图片尺寸**: 导入后 `width` 和 `height` 为 null，需后续更新
3. **图片变体**: 此方法不生成变体，如需要可使用其他脚本
4. **MinIO vs S3**: 本地开发用 MinIO，生产环境用 AWS S3

## 🐛 故障排除

### MinIO 连接失败

```bash
# 检查 MinIO 状态
docker-compose ps

# 重启 MinIO
docker-compose restart minio

# 查看日志
docker-compose logs -f minio
```

### 导入失败

```bash
# 检查 seed 数据是否初始化
# 访问 http://localhost:3000 查看 MediaCategory 和 MediaTag

# 重新运行 CMS
cd cms
npm run dev
```

### AWS CLI 配置问题

```bash
# 重新配置
npm run setup-minio

# 检查配置文件
cat ~/.aws/credentials
cat ~/.aws/config
```

## 📞 获取帮助

- 查看完整文档: [BATCH_UPLOAD_AWS_CLI_GUIDE.md](docs/BATCH_UPLOAD_AWS_CLI_GUIDE.md)
- 查看配置说明: [metadata/README.md](scripts/metadata/README.md)
- 查看数据结构: [FINAL_SEED_STRUCTURE.md](docs/FINAL_SEED_STRUCTURE.md)
