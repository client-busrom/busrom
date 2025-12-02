# 本地测试指南 - 从头开始测试超级管理员注册流程

## 背景

由于之前在本地开发时一直使用已有的超级管理员账号测试,导致 `/init` 注册流程在 AWS 部署时出现问题。现在需要在本地完整测试从初始注册开始的完整流程,确保所有 bug 都被修复后再部署到 AWS。

## 前置条件检查

### 1. 环境配置文件检查

**cms/.env 配置**
- ✅ DATABASE_URL: `postgresql://busrom:busrom_dev_password@localhost:5432/busrom_cms`
- ✅ USE_MINIO: `true` (使用本地 MinIO)
- ✅ S3_ENDPOINT: `http://localhost:9000`
- ✅ CDN_DOMAIN: `http://localhost:8080`
- ⚠️  NODE_ENV: 当前设置为 `production`,建议改为 `development` 以便更好的调试

**web/.env.local 配置**
- ✅ CMS_GRAPHQL_URL: `http://localhost:3000/api/graphql`
- ✅ NEXT_PUBLIC_CDN_DOMAIN: `http://localhost:8080`

**docker-compose.yml**
- ✅ PostgreSQL: localhost:5432
- ✅ MinIO: localhost:9000 (API), localhost:9001 (Console)
- ✅ Nginx CDN: localhost:8080

## 测试步骤

### 步骤 1: 启动 Docker 服务

```bash
# 1. 重启 Docker Desktop (如遇到文件系统问题)
# 从 macOS 应用菜单重启 Docker Desktop

# 2. 启动所有 Docker 服务
cd /Users/cerfbaleine/workspace/busrom-work
docker-compose up -d

# 3. 验证服务健康状态
docker ps --filter "name=busrom"

# 4. 检查日志(如有问题)
docker-compose logs -f
```

预期结果:
- ✅ busrom-postgres: Up (healthy)
- ✅ busrom-minio: Up (healthy)
- ✅ busrom-cdn: Up (healthy)

### 步骤 2: 启动 CMS 服务

```bash
cd /Users/cerfbaleine/workspace/busrom-work/cms
npm run dev
```

等待服务启动,看到类似信息:
```
✅ Keystone Admin UI: http://localhost:3000
✅ GraphQL API:        http://localhost:3000/api/graphql
```

### 步骤 3: 清空所有现有用户

**方法 1: 通过 API 端点清空(推荐)**

访问: http://localhost:3000/force-clear-users

应该看到响应:
```
SUCCESS: Deleted X users. Remaining: 0
```

**方法 2: 通过数据库直接清空(备选)**

```bash
docker exec -it busrom-postgres psql -U busrom -d busrom_cms -c "DELETE FROM \"User\";"
```

### 步骤 4: 验证数据库已清空

访问: http://localhost:3000/init

预期结果:
- ✅ 页面正常显示注册表单
- ✅ 页面标题显示 "Create First User" 或类似文字
- ❌ 如果跳转到登录页面,说明数据库未清空成功

### 步骤 5: 注册新的超级管理员

在 `/init` 页面填写:
- **Name**: Test Admin
- **Email**: admin@test.com
- **Password**: TestAdmin123!

点击创建用户。

预期结果:
- ✅ 用户创建成功
- ✅ 自动跳转到 Keystone 管理界面
- ✅ 显示欢迎信息或仪表盘

### 步骤 6: 测试超级管理员登录

1. 退出当前登录(如已登录)
2. 访问: http://localhost:3000
3. 使用刚注册的账号登录:
   - Email: admin@test.com
   - Password: TestAdmin123!

预期结果:
- ✅ 登录成功
- ✅ 可以访问所有管理界面
- ✅ 侧边栏显示所有菜单项

### 步骤 7: 测试用户权限管理功能

这是之前出问题的核心功能,需要仔细测试:

#### 7.1 创建新用户

1. 进入 "Users" 菜单
2. 点击 "Create User"
3. 填写用户信息:
   - Name: Test User 1
   - Email: user1@test.com
   - Password: TestUser123!
   - Role: 选择 "Editor" 或其他角色

预期结果:
- ✅ 用户创建成功
- ✅ 可以在用户列表中看到新用户

#### 7.2 修改用户权限

1. 在用户列表中点击刚创建的用户
2. 修改用户的 Role
3. 保存更改

预期结果:
- ✅ 权限修改成功
- ✅ 更改立即生效

#### 7.3 测试不同角色的权限

1. 退出超级管理员账号
2. 使用新创建的普通用户登录
3. 检查该用户能访问的菜单和功能

预期结果:
- ✅ 普通用户只能看到被授权的菜单
- ✅ 无权访问的功能会被正确阻止

#### 7.4 测试用户删除

1. 重新登录超级管理员账号
2. 删除测试用户
3. 验证用户已被删除

预期结果:
- ✅ 用户删除成功
- ✅ 用户列表中不再显示该用户

### 步骤 8: 测试其他核心功能

根据你之前修复的 bug,测试以下功能:

- [ ] 媒体文件上传 (测试 MinIO 集成)
- [ ] 内容创建和编辑
- [ ] 导航菜单管理
- [ ] 翻译功能
- [ ] 任何其他最近修改的功能

### 步骤 9: 检查控制台日志

在整个测试过程中,监控:

1. **CMS 服务日志** (终端输出)
2. **浏览器控制台** (F12 -> Console)
3. **Docker 日志** (如需要)

查找:
- ❌ 任何错误信息
- ⚠️  任何警告信息
- 🐛 异常行为

## 常见问题排查

### 问题 1: Docker 服务 unhealthy

```bash
# 重启 Docker Desktop
# 或者重建容器
docker-compose down -v
docker-compose up -d
```

### 问题 2: /init 页面跳转到登录页面

说明数据库中仍有用户,需要彻底清空:

```bash
# 方法 1: 使用 force-clear-users 端点
curl http://localhost:3000/force-clear-users

# 方法 2: 直接清空数据库
docker exec -it busrom-postgres psql -U busrom -d busrom_cms -c "DELETE FROM \"User\";"
```

### 问题 3: 登录后无法访问管理界面

检查:
1. 用户的 role 字段是否正确设置
2. 权限配置是否正确
3. Session 是否正常工作

### 问题 4: MinIO 连接失败

```bash
# 检查 MinIO 状态
docker logs busrom-minio

# 访问 MinIO Console
# http://localhost:9001
# 用户名: minioadmin
# 密码: minioadmin123

# 检查 bucket 是否存在
docker exec busrom-minio mc ls local/
```

## 测试完成后

### 清理测试数据(可选)

如果需要重新测试:

```bash
# 清空用户
curl http://localhost:3000/force-clear-users

# 或完全重置数据库
docker-compose down -v
docker-compose up -d
cd cms && npm run dev
```

### 准备部署到 AWS

当所有测试通过后:

1. ✅ 提交所有代码更改到 git
2. ✅ 推送到 GitHub
3. ✅ 在 AWS 中重新创建 RDS 数据库 (推荐)
4. ✅ 触发 GitHub Actions 部署
5. ✅ 在 AWS 环境中重复相同的测试流程

## 注意事项

⚠️  **重要提醒**:

1. **本地测试使用 MinIO**,AWS 使用真实 S3,确保代码对两者都兼容
2. **环境变量差异**: 本地和 AWS 的配置不同,部署时需要检查
3. **数据库**: AWS RDS 和本地 Docker PostgreSQL 可能有微小差异
4. **CDN**: 本地使用 Nginx,AWS 使用 CloudFront,URL 格式需要正确处理
5. **NODE_ENV**: 本地可以用 development,AWS 必须用 production

## 测试检查清单

- [ ] Docker 服务全部健康运行
- [ ] 成功清空所有用户
- [ ] 可以访问 /init 页面
- [ ] 成功注册超级管理员
- [ ] 超级管理员可以正常登录
- [ ] 可以创建新用户
- [ ] 可以修改用户权限
- [ ] 不同角色的权限隔离正确
- [ ] 可以删除用户
- [ ] 媒体上传功能正常
- [ ] 没有控制台错误
- [ ] 所有核心功能正常工作

完成所有检查后,即可放心部署到 AWS!
