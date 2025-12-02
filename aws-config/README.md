# AWS 配置文件

此目录包含AWS资源的配置文件。

## 文件说明

### s3-bucket-policy.json

S3 Bucket策略，允许公开读取 `form-attachments/` 目录下的文件。

**应用方法**:
```bash
aws s3api put-bucket-policy \
  --bucket busrom-media \
  --policy file://aws-config/s3-bucket-policy.json
```

### s3-lifecycle.json

S3 生命周期策略，自动管理表单附件的存储：
- 30天后转移到 STANDARD_IA（低频访问，降低成本）
- 90天后自动删除

**应用方法**:
```bash
aws s3api put-bucket-lifecycle-configuration \
  --bucket busrom-media \
  --lifecycle-configuration file://aws-config/s3-lifecycle.json
```

**验证配置**:
```bash
# 查看 Bucket 策略
aws s3api get-bucket-policy --bucket busrom-media

# 查看生命周期配置
aws s3api get-bucket-lifecycle-configuration --bucket busrom-media
```

## 注意事项

1. **安全性**: 只有 `form-attachments/` 目录下的文件可公开访问
2. **成本**: 生命周期策略可大幅降低长期存储成本
3. **备份**: 重要文件应在删除前备份

## 相关文档

- [FILE_UPLOAD_IMPLEMENTATION.md](../docs/FILE_UPLOAD_IMPLEMENTATION.md) - 文件上传功能实现
- [AWS_DEPLOYMENT_MIGRATIONS.md](../docs/AWS_DEPLOYMENT_MIGRATIONS.md) - AWS部署指南
- [DEPLOYMENT_CHECKLIST.md](../docs/DEPLOYMENT_CHECKLIST.md) - 部署检查清单
