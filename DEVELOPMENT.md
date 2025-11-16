# 开发指南 / Development Guide

本文档说明如何设置开发环境并进行功能开发。

## 📋 目录

- [环境设置](#环境设置)
- [分支策略](#分支策略)
- [开发流程](#开发流程)
- [数据库迁移](#数据库迁移)
- [部署流程](#部署流程)

## 🚀 环境设置

### 1. 克隆仓库

```bash
git clone https://github.com/client-busrom/busrom.git
cd busrom
```

### 2. 安装依赖

```bash
# 安装所有工作区的依赖
npm install
```

### 3. 配置环境变量

#### Web 应用 (Next.js)

```bash
cd web
cp .env.example .env.local
# 编辑 .env.local 填入真实值
```

#### CMS 管理后台 (Keystone)

```bash
cd cms
cp .env.example .env
# 编辑 .env 填入真实值
```

**重要环境变量：**

| 变量 | 说明 | 示例 |
|------|------|------|
| `DATABASE_URL` | PostgreSQL 连接字符串 | `postgresql://user:pass@localhost:5432/busrom_dev` |
| `SESSION_SECRET` | 会话密钥 | 使用 `openssl rand -base64 32` 生成 |
| `CLOUDINARY_*` | 图片存储服务 | 从 Cloudinary 控制台获取 |

### 4. 设置数据库

```bash
# 确保 PostgreSQL 正在运行
# macOS: brew services start postgresql@14

# 创建数据库
createdb busrom_dev

# 运行迁移
cd cms
npx prisma migrate dev
```

### 5. 启动开发服务器

```bash
# 在项目根目录
npm run dev

# CMS: http://localhost:3000/admin
# Web: http://localhost:3001
```

## 🌿 分支策略

### 分支说明

- **`main`** - 生产环境分支
  - 只包含稳定、经过测试的代码
  - 运营人员在此分支的部署上填充数据
  - ⚠️ 不要直接在此分支开发！

- **`develop`** - 开发分支
  - 所有新功能的集成分支
  - 你的日常开发在这里进行
  - 定期合并到 `main`

- **`feature/*`** - 功能分支
  - 从 `develop` 创建
  - 单个功能的开发隔离环境
  - 完成后合并回 `develop`

### 分支保护规则

`main` 分支已设置保护：
- 需要 Pull Request 审核
- 需要状态检查通过
- 不允许直接推送

## 💻 开发流程

### 开始新功能

```bash
# 1. 切换到 develop 分支并更新
git checkout develop
git pull origin develop

# 2. 创建功能分支
git checkout -b feature/功能名称

# 3. 进行开发
# ... 编码、测试 ...

# 4. 提交更改
git add .
git commit -m "feat: 添加XXX功能"

# 5. 推送分支
git push origin feature/功能名称
```

### 创建 Pull Request

1. 访问 GitHub 仓库
2. 点击 "Pull requests" > "New pull request"
3. Base: `develop` ← Compare: `feature/功能名称`
4. 填写 PR 描述
5. 创建 PR 并等待审核/自己审核
6. 合并到 `develop`

### 发布到生产环境

```bash
# 定期（如每周）将 develop 合并到 main
git checkout main
git pull origin main
git merge develop
git push origin main

# 这会触发生产部署
```

## 🗄️ 数据库迁移

### 创建迁移

当你更改 Keystone schema 时：

```bash
cd cms
npx prisma migrate dev --name 描述性名称
```

### ✅ 安全的数据库更改

- ✅ 添加新表/模型
- ✅ 添加可选字段
- ✅ 添加带默认值的字段

### ⚠️ 危险的数据库更改

- ❌ 删除字段（会丢失数据）
- ❌ 重命名字段（需要数据迁移脚本）
- ❌ 更改字段类型
- ❌ 添加必填字段（无默认值）

**规则：所有数据库更改必须向后兼容！**

### 应用迁移到生产环境

```bash
# ⚠️ 在应用前先备份生产数据库！

# SSH 到生产服务器
cd /path/to/cms
npx prisma migrate deploy
```

## 🚀 部署流程

### 开发环境

自动部署：每次推送到 `develop` 分支

### 生产环境

1. **准备发布**
   ```bash
   git checkout main
   git pull origin main
   git merge develop
   ```

2. **检查清单**
   - [ ] 所有测试通过
   - [ ] 在开发环境验证过
   - [ ] 数据库迁移已测试
   - [ ] 已备份生产数据库

3. **部署**
   ```bash
   git push origin main
   # GitHub Actions 会自动构建和部署
   ```

4. **验证**
   - 检查生产网站是否正常
   - 测试关键功能
   - 查看错误日志

## 🔐 安全注意事项

### 环境变量

- ❌ **永远不要**将 `.env` 文件提交到 Git
- ✅ 只提交 `.env.example`
- ✅ 使用强密码和随机生成的密钥
- ✅ 生产环境使用不同的密钥

### 数据库访问

- 生产数据库应该只能从应用服务器访问
- 使用强密码
- 定期备份

### API 密钥

- 不要在客户端代码中暴露 API 密钥
- 使用 `NEXT_PUBLIC_` 前缀的变量会暴露到客户端
- 敏感操作在服务端进行

## 🆘 常见问题

### 数据库连接失败

```bash
# 检查 PostgreSQL 是否运行
pg_isready

# 检查数据库是否存在
psql -l | grep busrom

# 检查 .env 中的 DATABASE_URL
```

### 迁移失败

```bash
# 重置本地数据库（⚠️ 会删除所有数据）
cd cms
npx prisma migrate reset

# 或手动删除并重建
dropdb busrom_dev
createdb busrom_dev
npx prisma migrate dev
```

### 端口已被占用

```bash
# 查找占用端口的进程
lsof -i :3000
lsof -i :3001

# 杀死进程
kill -9 <PID>
```

## 📚 相关资源

- [Next.js 文档](https://nextjs.org/docs)
- [Keystone 文档](https://keystonejs.com/docs)
- [Prisma 文档](https://www.prisma.io/docs)
- [项目 Wiki](https://github.com/client-busrom/busrom/wiki)

## 🤝 联系方式

如有问题，请：
1. 查看本文档
2. 搜索已有的 GitHub Issues
3. 创建新的 Issue
4. 联系团队成员

---

最后更新：2025-01-16
