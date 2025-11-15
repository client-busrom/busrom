# RBAC权限管理系统 - 实施总结

**完成时间**: 2025-11-05
**状态**: ✅ 核心功能已完成 (Phase 1, 2, 4)

---

## 已完成的工作

### ✅ Phase 1: 数据模型创建

#### 1. Permission 模型 (`cms/schemas/Permission.ts`)
- 定义了系统所有权限
- 支持资源(Resource)和操作(Action)的组合
- 自动生成唯一标识符(identifier)
- 支持权限分类(6大类别)
- 系统权限不可删除

**关键字段**:
- `resource`: 资源类型 (Product, Blog, User, etc.)
- `action`: 操作类型 (create, read, update, delete, etc.)
- `identifier`: 唯一标识 (格式: `{resource}:{action}`)
- `category`: 权限分类
- `isSystem`: 系统权限标识

#### 2. Role 模型 (升级版 - `cms/schemas/User.ts`)
- 支持动态创建角色
- 多对多关联 Permission
- 支持角色继承 (parentRole/childRoles)
- 优先级系统 (priority 1-10)
- 系统角色不可删除

**关键字段**:
- `name`: 角色名称
- `code`: 角色代码 (唯一)
- `permissions`: 关联的权限列表
- `parentRole`: 父角色(继承)
- `users`: 拥有此角色的用户
- `isSystem`: 系统角色标识
- `isActive`: 启用状态
- `priority`: 优先级

#### 3. User 模型 (升级版 - `cms/schemas/User.ts`)
- 支持多角色 (`roles`: many-to-many)
- 支持直接权限 (`directPermissions`: many-to-many)
- 超级管理员标识 (`isAdmin`)
- 账户状态管理
- 双因素认证支持
- 登录追踪

**关键字段**:
- `roles`: 用户的角色列表 (多个)
- `directPermissions`: 直接分配的权限
- `isAdmin`: 超级管理员标识
- `status`: 账户状态 (ACTIVE/INACTIVE)
- `lastLoginAt`, `lastLoginIp`: 登录追踪

---

### ✅ Phase 2: 权限验证逻辑

#### 1. 权限计算函数 (`cms/lib/permissions/calculate-permissions.ts`)

**核心函数**:
```typescript
// 计算用户的完整权限列表
calculateUserPermissions(userId, context): Promise<string[]>

// 检查用户是否有特定权限
hasPermission(userId, resource, action, context): Promise<boolean>

// 检查多个权限 (OR逻辑)
hasAnyPermission(userId, permissionsList, context): Promise<boolean>

// 检查多个权限 (AND逻辑)
hasAllPermissions(userId, permissionsList, context): Promise<boolean>

// 获取用户可访问的资源列表
getAccessibleResources(userId, action, context): Promise<string[]>
```

**权限计算逻辑**:
1. 检查用户是否为超级管理员 → 返回 `['*']`
2. 收集所有激活角色的权限
3. 包含父角色的权限(继承)
4. 添加直接分配的权限
5. 返回唯一权限列表

#### 2. 权限缓存机制 (`cms/lib/permissions/cache.ts`)

**缓存策略**:
- TTL: 15分钟
- 存储: 内存缓存 (Map)
- Key格式: `user_permissions:{userId}`
- 自动清理过期缓存 (每5分钟)

**核心函数**:
```typescript
// 获取缓存的用户权限
getCachedUserPermissions(userId, context): Promise<string[]>

// 清除单个用户的缓存
clearUserPermissionsCache(userId): void

// 清除角色关联的所有用户缓存
clearRolePermissionsCache(roleId, context): Promise<void>

// 清除所有缓存
clearAllPermissionsCache(): void

// 获取缓存统计
getCacheStats()
```

#### 3. 访问控制辅助函数 (`cms/lib/permissions/access-control.ts`)

**核心函数**:
```typescript
// 为 Keystone List 创建访问控制
createAccessControl(resourceName): ListAccessControl

// 字段级访问控制
createFieldAccess(resourceName, requiredPermissions): FieldAccessControl

// 自定义访问控制
createCustomAccessControl(checkPermission): ListAccessControl

// 仅超级管理员可访问
adminOnlyAccess(): ListAccessControl

// 仅已认证用户可访问
authenticatedAccess(): ListAccessControl
```

**使用示例**:
```typescript
// 产品模型使用 RBAC 权限
export const Product = list({
  access: createAccessControl('Product'),
  fields: {
    // 普通字段
    name: text(),

    // 受限字段(需要特定权限)
    featured: checkbox({
      access: createFieldAccess('Product', ['Product:update'])
    }),

    // SEO字段(需要SEO权限)
    seoSetting: relationship({
      access: createFieldAccess('Product', ['SeoSetting:update'])
    })
  }
})
```

---

### ✅ Phase 4: 数据初始化

#### 初始化脚本 (`cms/migrations/seed-permissions-system.ts`)

**包含内容**:

1. **系统权限** (147个权限):
   - 内容管理: Product, ProductSeries, Blog, Application, FaqItem
   - 媒体管理: Media, MediaCategory, MediaTag, Category
   - 网站配置: NavigationMenu, HomeContent, Footer, SiteConfig
   - SEO与营销: SeoSetting, CustomScript
   - 客户服务: ContactForm, ActivityLog
   - 系统管理: User, Role, Permission

2. **预设角色** (6个):
   - **超级管理员**: 所有权限 (147个)
   - **内容编辑**: 内容增查改 + 媒体管理 (23个权限)
   - **内容审核**: 内容查改 + 发布权限 (11个权限)
   - **客服专员**: 表单管理 + 内容查看 (6个权限)
   - **SEO专员**: SEO设置 + 自定义脚本 + 内容查看 (11个权限)
   - **媒体管理员**: 媒体资源全权限 (16个权限)

**集成位置**:
- `cms/keystone.ts` → `db.onConnect` 钩子
- 首次启动时自动执行
- 幂等性:已存在的数据不会重复创建

---

## 待完成的工作

### ⏳ Phase 3: CMS后台界面

需要创建以下管理界面:

1. **角色管理页面** (`/admin/roles`)
   - 角色列表
   - 创建/编辑角色
   - 权限矩阵配置
   - 角色继承配置

2. **用户管理页面** (`/admin/users`)
   - 用户列表(显示角色)
   - 分配角色
   - 用户权限预览

3. **权限管理页面** (`/admin/permissions`)
   - 权限列表
   - 按分类查看

### ⏳ Phase 5: 更新所有 List 的访问控制

需要将所有现有的 Keystone List 更新为使用新的 RBAC 系统:

```typescript
// 示例:更新 Product 模型
import { createAccessControl, createFieldAccess } from '../lib/permissions'

export const Product = list({
  // 使用 RBAC 访问控制
  access: createAccessControl('Product'),

  fields: {
    // 字段定义...
  }
})
```

**需要更新的模型** (19个):
- ✅ User, Role, Permission (已完成)
- ⏳ Product, ProductSeries
- ⏳ Blog, Application, FaqItem
- ⏳ Media, MediaCategory, MediaTag, Category
- ⏳ NavigationMenu, HomeContent, Footer, SiteConfig
- ⏳ SeoSetting, CustomScript
- ⏳ ContactForm, ActivityLog

---

## 如何启动系统

### 1. 数据库迁移

由于添加了新的模型字段,需要进行数据库迁移:

```bash
# 方式1: 启动 CMS 开发服务器(会提示迁移)
npm run dev:cms

# 当提示 "Do you want to continue?" 时输入 'y'
```

**预期的Schema变更**:
- 新增 `Permission` 表
- `Role` 表新增字段: `code`, `priority`, `isSystem`, `isActive`, `parentRoleId`
- `User` 表变更: `role` → `roles` (单对多变为多对多)
- 新增 `User_roles` 连接表
- 新增 `User_directPermissions` 连接表
- 新增 `Role_permissions` 连接表

### 2. 首次启动

系统会自动执行初始化:

```
🔍 Checking for seed data initialization...

✓ Media system already initialized
✓ Product system already initialized
✓ Navigation system already initialized

🌱 Seeding permissions...
  ✓ Created permission: Product:create
  ✓ Created permission: Product:read
  ... (147 permissions)
✅ 147 permissions initialized!

🌱 Seeding roles...
  ✓ Created role: 超级管理员 (147 permissions)
  ✓ Created role: 内容编辑 (23 permissions)
  ... (6 roles)
✅ 6 roles initialized!

✅ RBAC Permissions System Initialized!
```

### 3. 创建第一个管理员

如果数据库是全新的,会提示创建第一个用户:

```
Create First User
Email: admin@busrom.com
Password: ********
Name: Admin
```

这个用户会自动设置为超级管理员 (`isAdmin: true`)。

---

## 使用指南

### 为用户分配角色

1. 登录 CMS: `http://localhost:3000`
2. 导航到 `Users` 管理页面
3. 编辑用户
4. 在 "Roles & Permissions" 部分:
   - 选择一个或多个角色
   - (可选)添加直接权限

### 创建自定义角色

1. 导航到 `Roles` 管理页面
2. 点击 "Create Role"
3. 填写:
   - Name: 角色名称 (如 "产品管理员")
   - Code: 唯一代码 (如 "product_admin")
   - Description: 角色描述
   - Permissions: 选择权限
   - Priority: 优先级 (1-10)
4. 保存

### 查看用户权限

```typescript
import { getCachedUserPermissions } from './lib/permissions'

const permissions = await getCachedUserPermissions(userId, context)
console.log('User permissions:', permissions)
// Output: ['Product:create', 'Product:read', 'Media:create', ...]
```

### 检查权限

```typescript
import { hasPermission } from './lib/permissions'

const canCreate = await hasPermission(userId, 'Product', 'create', context)
if (canCreate) {
  // 允许创建产品
}
```

---

## 架构图

```
┌─────────────────────────────────────────────────────────────┐
│                      CMS Admin UI                            │
├─────────────────────────────────────────────────────────────┤
│  Users | Roles | Permissions | Products | Media | ...       │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│             Access Control Layer (RBAC)                      │
├─────────────────────────────────────────────────────────────┤
│  • createAccessControl()                                     │
│  • createFieldAccess()                                       │
│  • hasPermission()                                           │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│            Permission Calculation + Caching                  │
├─────────────────────────────────────────────────────────────┤
│  • calculateUserPermissions()                                │
│  • getCachedUserPermissions()                                │
│  • Cache TTL: 15 minutes                                     │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    Data Models                               │
├─────────────────────────────────────────────────────────────┤
│  User ←→ Role ←→ Permission                                  │
│    ↓       ↓                                                 │
│  directPermissions                                           │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                 PostgreSQL Database                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 性能优化

1. **权限缓存**: 15分钟TTL,减少数据库查询
2. **角色继承**: 一次查询获取所有权限(包括父角色)
3. **批量检查**: 使用 `hasAnyPermission` / `hasAllPermissions`
4. **超级管理员快速路径**: 直接返回 `['*']`,跳过权限查询

---

## 安全考虑

1. **系统权限/角色保护**: `isSystem: true` 的项不可删除
2. **字段级权限**: 敏感字段(如 roles, directPermissions)仅管理员可见
3. **操作审计**: 所有 User/Role 变更记录到 ActivityLog
4. **缓存失效**: 权限变更时自动清除相关缓存
5. **Session数据**: 包含 `isAdmin` 和 `roles` 信息,减少查询

---

## 下一步建议

1. **完成 Phase 5**: 更新所有 List 使用新的权限系统
2. **实现 Phase 3**: 开发 CMS 管理界面
3. **测试**: 创建不同角色的用户,测试权限隔离
4. **文档**: 为团队编写权限管理操作手册
5. **监控**: 添加权限检查失败的日志和告警

---

**文档维护**: 开发团队
**最后更新**: 2025-11-05
