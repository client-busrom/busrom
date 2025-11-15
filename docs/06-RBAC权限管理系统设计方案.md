# 06 RBAC权限管理系统设计方案

**文档版本**: v1.0
**技术栈**: Keystone 6 + PostgreSQL
**最后更新**: 2025-11-05

---

## 文档导航

- [01-数据模型与架构](./01-数据模型与架构.md)
- [02-API接口规范](./02-API接口规范.md)
- [03-CMS后台功能](./03-CMS后台功能.md)
- [04-安全与性能](./04-安全与性能.md)
- [05-部署与验收](./05-部署与验收.md)
- **当前文档**: 06-RBAC权限管理系统设计方案

---

## 📋 目录

1. [系统概述](#系统概述)
2. [数据模型设计](#数据模型设计)
3. [权限颗粒度定义](#权限颗粒度定义)
4. [权限验证逻辑](#权限验证逻辑)
5. [CMS后台界面设计](#cms后台界面设计)
6. [API接口设计](#api接口设计)
7. [初始化数据](#初始化数据)
8. [实施步骤](#实施步骤)

---

## 系统概述

### 当前问题

现有权限系统存在以下局限性:

1. **角色固定**: 只有4个预设角色(admin/editor/reviewer/support),无法动态创建
2. **权限粗粒度**: 只能按角色控制整体访问,无法细化到具体操作
3. **缺乏灵活性**: 无法为特定用户分配特殊权限
4. **维护困难**: 权限逻辑硬编码在代码中,修改需要重新部署

### 新系统目标

实现一个完整的 **基于角色的访问控制系统 (RBAC)**:

- ✅ **动态角色管理**: 超级管理员可在 CMS 中自由创建、编辑、删除角色
- ✅ **细粒度权限控制**: 每个资源支持独立的 Create/Read/Update/Delete 权限
- ✅ **多角色支持**: 用户可同时拥有多个角色,权限自动合并
- ✅ **字段级权限**: 支持对敏感字段的访问控制
- ✅ **权限继承**: 支持角色之间的权限继承关系
- ✅ **可视化管理**: 直观的权限矩阵界面,方便配置和审计
- ✅ **操作审计**: 所有权限变更自动记录到操作日志

### 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                         CMS Admin UI                         │
├─────────────────────────────────────────────────────────────┤
│  角色管理  │  用户管理  │  权限矩阵  │  操作日志  │  审计报告  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    权限验证中间件层                           │
├─────────────────────────────────────────────────────────────┤
│  • GraphQL Query 拦截                                        │
│  • 字段级权限验证                                             │
│  • 操作级权限验证                                             │
│  • 自定义权限 Hook                                           │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      数据模型层                               │
├─────────────────────────────────────────────────────────────┤
│  Permission  │  Role  │  User  │  RolePermission  │  ...     │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    PostgreSQL 数据库                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 数据模型设计

### 1. Permission (权限表)

**用途**: 定义系统所有可用的权限项

**Keystone Schema**:

```typescript
import { list } from '@keystone-6/core';
import { text, select, checkbox, timestamp, relationship } from '@keystone-6/core/fields';

export const Permission = list({
  access: {
    operation: {
      query: ({ session }) => !!session,
      create: ({ session }) => session?.data?.isAdmin === true,
      update: ({ session }) => session?.data?.isAdmin === true,
      delete: ({ session }) => session?.data?.isAdmin === true,
    }
  },

  fields: {
    // ==================== 基础信息 ====================

    resource: select({
      type: 'enum',
      options: [
        // 内容管理
        { label: 'Product (产品)', value: 'Product' },
        { label: 'ProductSeries (产品系列)', value: 'ProductSeries' },
        { label: 'Blog (博客)', value: 'Blog' },
        { label: 'Application (应用案例)', value: 'Application' },
        { label: 'FaqItem (常见问题)', value: 'FaqItem' },

        // 媒体管理
        { label: 'Media (媒体资源)', value: 'Media' },
        { label: 'MediaCategory (媒体分类)', value: 'MediaCategory' },
        { label: 'MediaTag (媒体标签)', value: 'MediaTag' },

        // 网站配置
        { label: 'NavigationMenu (导航菜单)', value: 'NavigationMenu' },
        { label: 'HomeContent (首页内容)', value: 'HomeContent' },
        { label: 'Footer (页脚配置)', value: 'Footer' },
        { label: 'SiteConfig (站点配置)', value: 'SiteConfig' },

        // SEO与脚本
        { label: 'SeoSetting (SEO设置)', value: 'SeoSetting' },
        { label: 'CustomScript (自定义脚本)', value: 'CustomScript' },

        // 表单与日志
        { label: 'ContactForm (联系表单)', value: 'ContactForm' },
        { label: 'ActivityLog (操作日志)', value: 'ActivityLog' },

        // 系统管理
        { label: 'User (用户)', value: 'User' },
        { label: 'Role (角色)', value: 'Role' },
        { label: 'Permission (权限)', value: 'Permission' },
      ],
      validation: { isRequired: true },
      label: 'Resource (资源类型)',
    }),

    action: select({
      type: 'enum',
      options: [
        { label: 'Create (创建)', value: 'create' },
        { label: 'Read (查看)', value: 'read' },
        { label: 'Update (更新)', value: 'update' },
        { label: 'Delete (删除)', value: 'delete' },

        // 特殊操作
        { label: 'Publish (发布)', value: 'publish' },
        { label: 'Export (导出)', value: 'export' },
        { label: 'Import (导入)', value: 'import' },
        { label: 'ManageRoles (管理角色)', value: 'manage_roles' },
        { label: 'ManagePermissions (管理权限)', value: 'manage_permissions' },
        { label: 'InjectCode (注入代码)', value: 'inject_code' },
        { label: 'ViewLogs (查看日志)', value: 'view_logs' },
      ],
      validation: { isRequired: true },
      label: 'Action (操作类型)',
    }),

    // 唯一标识符 (resource:action)
    identifier: text({
      validation: { isRequired: true },
      isIndexed: 'unique',
      label: 'Identifier (唯一标识)',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
        description: '自动生成,格式: {resource}:{action}'
      }
    }),

    // 权限描述
    name: text({
      validation: { isRequired: true },
      label: 'Name (权限名称)',
      ui: {
        description: '如: 创建产品、查看博客、删除用户'
      }
    }),

    description: text({
      ui: { displayMode: 'textarea' },
      label: 'Description (详细说明)',
    }),

    // 权限分类
    category: select({
      type: 'string',
      options: [
        { label: '内容管理', value: 'content_management' },
        { label: '媒体管理', value: 'media_management' },
        { label: '网站配置', value: 'site_configuration' },
        { label: 'SEO与营销', value: 'seo_marketing' },
        { label: '客户服务', value: 'customer_service' },
        { label: '系统管理', value: 'system_management' },
      ],
      defaultValue: 'content_management',
      label: 'Category (权限分类)',
    }),

    // 是否为系统权限(不可删除)
    isSystem: checkbox({
      defaultValue: true,
      label: 'System Permission (系统权限)',
      ui: {
        description: '系统预设权限,不可删除',
        itemView: { fieldMode: 'read' },
      }
    }),

    // 关联的角色
    roles: relationship({
      ref: 'Role.permissions',
      many: true,
      label: 'Assigned Roles (已分配角色)',
      ui: {
        displayMode: 'count',
      }
    }),

    // 元数据
    createdAt: timestamp({
      defaultValue: { kind: 'now' },
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
      }
    }),

    updatedAt: timestamp({
      db: { updatedAt: true },
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
      }
    }),
  },

  ui: {
    listView: {
      initialColumns: ['name', 'resource', 'action', 'category', 'isSystem'],
      initialSort: { field: 'category', direction: 'ASC' },
      pageSize: 100,
    },
    labelField: 'name',
  },

  hooks: {
    // 创建前自动生成 identifier
    resolveInput: async ({ resolvedData, operation }) => {
      if (operation === 'create' || (operation === 'update' && resolvedData.resource && resolvedData.action)) {
        const resource = resolvedData.resource;
        const action = resolvedData.action;

        if (resource && action) {
          resolvedData.identifier = `${resource}:${action}`;
        }
      }

      return resolvedData;
    },

    // 验证唯一性
    validateInput: async ({ resolvedData, addValidationError, operation, context, item }) => {
      if (operation === 'delete' && item.isSystem) {
        addValidationError('System permissions cannot be deleted | 系统权限不可删除');
      }
    },
  }
});
```

**数据示例**:
```json
{
  "id": "perm_001",
  "resource": "Product",
  "action": "create",
  "identifier": "Product:create",
  "name": "创建产品",
  "description": "允许创建新产品",
  "category": "content_management",
  "isSystem": true
}
```

---

### 2. Role (角色表 - 重构版)

**用途**: 定义系统角色及其权限集合

**Keystone Schema**:

```typescript
import { list } from '@keystone-6/core';
import { text, checkbox, timestamp, relationship, integer, json } from '@keystone-6/core/fields';

export const Role = list({
  access: {
    operation: {
      query: ({ session }) => !!session,
      create: ({ session }) => session?.data?.isAdmin === true,
      update: ({ session }) => session?.data?.isAdmin === true,
      delete: ({ session, item }) => {
        // 系统角色不可删除
        if (item.isSystem) return false;
        return session?.data?.isAdmin === true;
      },
    }
  },

  fields: {
    // ==================== 基础信息 ====================

    name: text({
      validation: { isRequired: true },
      isIndexed: 'unique',
      label: 'Role Name (角色名称)',
      ui: {
        description: '如: 产品管理员、SEO专员、客服主管'
      }
    }),

    description: text({
      ui: { displayMode: 'textarea' },
      label: 'Description (角色描述)',
      ui: {
        description: '说明该角色的职责和权限范围'
      }
    }),

    // 角色代码(用于程序判断)
    code: text({
      validation: { isRequired: true },
      isIndexed: 'unique',
      label: 'Role Code (角色代码)',
      ui: {
        description: '英文代码,如: product_admin, seo_specialist'
      }
    }),

    // ==================== 权限配置 ====================

    // 关联的权限
    permissions: relationship({
      ref: 'Permission.roles',
      many: true,
      label: 'Permissions (权限列表)',
      ui: {
        displayMode: 'cards',
        cardFields: ['name', 'resource', 'action', 'category'],
        inlineConnect: true,
        linkToItem: true,
        description: '为该角色分配权限'
      }
    }),

    // 继承的父角色(可选)
    parentRole: relationship({
      ref: 'Role.childRoles',
      label: 'Parent Role (父角色)',
      ui: {
        displayMode: 'select',
        labelField: 'name',
        description: '继承父角色的所有权限'
      }
    }),

    // 子角色
    childRoles: relationship({
      ref: 'Role.parentRole',
      many: true,
      label: 'Child Roles (子角色)',
      ui: {
        displayMode: 'count',
      }
    }),

    // ==================== 用户关联 ====================

    users: relationship({
      ref: 'User.roles',
      many: true,
      label: 'Users (用户列表)',
      ui: {
        displayMode: 'count',
      }
    }),

    // ==================== 角色属性 ====================

    // 是否为系统角色
    isSystem: checkbox({
      defaultValue: false,
      label: 'System Role (系统角色)',
      ui: {
        description: '系统预设角色,不可删除',
        itemView: { fieldMode: 'read' },
      }
    }),

    // 是否启用
    isActive: checkbox({
      defaultValue: true,
      label: 'Active (启用)',
      ui: {
        description: '禁用后,该角色的所有用户将失去对应权限'
      }
    }),

    // 优先级(用于权限冲突解决)
    priority: integer({
      defaultValue: 5,
      validation: { min: 1, max: 10 },
      label: 'Priority (优先级)',
      ui: {
        description: '数字越大优先级越高,用于多角色权限合并时的冲突解决'
      }
    }),

    // ==================== 元数据 ====================

    createdBy: relationship({
      ref: 'User',
      label: 'Created By (创建者)',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
      }
    }),

    createdAt: timestamp({
      defaultValue: { kind: 'now' },
      label: 'Created At (创建时间)',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
      }
    }),

    updatedAt: timestamp({
      db: { updatedAt: true },
      label: 'Updated At (更新时间)',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
      }
    }),
  },

  ui: {
    listView: {
      initialColumns: ['name', 'code', 'isSystem', 'isActive', 'users', 'createdAt'],
      initialSort: { field: 'priority', direction: 'DESC' },
      pageSize: 50,
    },
    labelField: 'name',

    // 字段分组
    itemView: {
      defaultFieldMode: 'edit',
      fieldGroups: [
        {
          label: '基础信息',
          fields: ['name', 'code', 'description']
        },
        {
          label: '权限配置',
          fields: ['permissions', 'parentRole', 'childRoles']
        },
        {
          label: '角色属性',
          fields: ['isSystem', 'isActive', 'priority']
        },
        {
          label: '用户管理',
          fields: ['users']
        }
      ]
    }
  },

  hooks: {
    validateInput: async ({ resolvedData, addValidationError, operation, item }) => {
      // 禁止删除系统角色
      if (operation === 'delete' && item.isSystem) {
        addValidationError('System roles cannot be deleted | 系统角色不可删除');
      }

      // 禁止循环继承
      if (resolvedData.parentRole && operation === 'update') {
        const parentId = resolvedData.parentRole.connect?.id;
        if (parentId === item.id) {
          addValidationError('A role cannot inherit from itself | 角色不能继承自己');
        }
      }
    },

    // 记录角色变更
    afterOperation: async ({ operation, item, context }) => {
      if (['create', 'update', 'delete'].includes(operation)) {
        await context.query.ActivityLog.createOne({
          data: {
            user: { connect: { id: context.session?.itemId } },
            action: operation,
            entity: 'Role',
            entityId: item.id,
            changes: JSON.stringify({
              name: item.name,
              permissions: item.permissions,
            }),
            ipAddress: context.req?.ip,
            userAgent: context.req?.headers['user-agent'],
          }
        });
      }
    }
  }
});
```

**数据示例**:
```json
{
  "id": "role_001",
  "name": "产品管理员",
  "code": "product_admin",
  "description": "负责产品和产品系列的全流程管理",
  "permissions": [
    "perm_product_create",
    "perm_product_read",
    "perm_product_update",
    "perm_product_delete",
    "perm_productseries_read",
    "perm_productseries_update",
    "perm_media_create",
    "perm_media_read"
  ],
  "isSystem": false,
  "isActive": true,
  "priority": 7
}
```

---

### 3. User (用户表 - 升级版)

**用途**: 存储管理员用户信息及角色关联

**Keystone Schema 变更**:

```typescript
import { list } from '@keystone-6/core';
import { text, password, checkbox, timestamp, relationship, json } from '@keystone-6/core/fields';

export const User = list({
  access: {
    operation: {
      query: ({ session }) => !!session,
      create: ({ session }) => session?.data?.isAdmin === true,
      update: ({ session, item }) => {
        // 用户可以修改自己的信息,管理员可以修改所有用户
        return session?.data?.id === item.id || session?.data?.isAdmin === true;
      },
      delete: ({ session }) => session?.data?.isAdmin === true,
    },

    // 字段级权限
    field: {
      // 敏感字段只有管理员和本人可见
      password: ({ session, item }) =>
        session?.data?.id === item?.id || session?.data?.isAdmin === true,
      roles: ({ session }) => session?.data?.isAdmin === true,
      directPermissions: ({ session }) => session?.data?.isAdmin === true,
    }
  },

  fields: {
    // ==================== 基础信息 ====================

    name: text({
      validation: { isRequired: true },
      label: 'Name (姓名)',
    }),

    email: text({
      validation: {
        isRequired: true,
        match: { regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, explanation: '邮箱格式不正确' }
      },
      isIndexed: 'unique',
      label: 'Email (邮箱)',
    }),

    password: password({
      validation: { isRequired: true },
      label: 'Password (密码)',
    }),

    avatar: relationship({
      ref: 'Media',
      label: 'Avatar (头像)',
      ui: {
        displayMode: 'cards',
        cardFields: ['url'],
      }
    }),

    // ==================== 角色与权限 ====================

    // 分配的角色(多对多)
    roles: relationship({
      ref: 'Role.users',
      many: true,
      label: 'Roles (角色列表)',
      ui: {
        displayMode: 'cards',
        cardFields: ['name', 'description', 'isActive'],
        inlineConnect: true,
        linkToItem: true,
        description: '为用户分配一个或多个角色'
      }
    }),

    // 直接分配的权限(可选,用于特殊情况)
    directPermissions: relationship({
      ref: 'Permission',
      many: true,
      label: 'Direct Permissions (直接权限)',
      ui: {
        displayMode: 'cards',
        cardFields: ['name', 'resource', 'action'],
        inlineConnect: true,
        description: '为用户直接分配额外权限,会与角色权限合并'
      }
    }),

    // 是否为超级管理员(快捷标识)
    isAdmin: checkbox({
      defaultValue: false,
      label: 'Super Admin (超级管理员)',
      ui: {
        description: '超级管理员拥有所有权限,不受角色限制'
      }
    }),

    // ==================== 账户状态 ====================

    isActive: checkbox({
      defaultValue: true,
      label: 'Active (启用)',
      ui: {
        description: '禁用后用户无法登录'
      }
    }),

    // 双因素认证
    twoFactorEnabled: checkbox({
      defaultValue: false,
      label: 'Two-Factor Auth (双因素认证)',
    }),

    twoFactorSecret: text({
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
      }
    }),

    // ==================== 登录信息 ====================

    lastLoginAt: timestamp({
      label: 'Last Login (最后登录时间)',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
      }
    }),

    lastLoginIp: text({
      label: 'Last Login IP (最后登录IP)',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
      }
    }),

    loginAttempts: json({
      label: 'Login Attempts (登录尝试记录)',
      defaultValue: [],
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
      }
    }),

    // ==================== 元数据 ====================

    createdAt: timestamp({
      defaultValue: { kind: 'now' },
      label: 'Created At (创建时间)',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
      }
    }),

    updatedAt: timestamp({
      db: { updatedAt: true },
      label: 'Updated At (更新时间)',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
      }
    }),
  },

  ui: {
    listView: {
      initialColumns: ['name', 'email', 'roles', 'isAdmin', 'isActive', 'lastLoginAt'],
      initialSort: { field: 'createdAt', direction: 'DESC' },
      pageSize: 50,
    },
    labelField: 'name',

    // 字段分组
    itemView: {
      defaultFieldMode: 'edit',
      fieldGroups: [
        {
          label: '基础信息',
          fields: ['name', 'email', 'password', 'avatar']
        },
        {
          label: '角色与权限',
          fields: ['roles', 'directPermissions', 'isAdmin']
        },
        {
          label: '账户状态',
          fields: ['isActive', 'twoFactorEnabled']
        },
        {
          label: '登录信息',
          fields: ['lastLoginAt', 'lastLoginIp', 'loginAttempts']
        }
      ]
    }
  },

  hooks: {
    // 更新最后登录时间
    resolveInput: async ({ resolvedData, operation, context }) => {
      if (operation === 'update' && context.session?.itemId) {
        // 这里可以在登录时更新 lastLoginAt
        // 实际实现在认证中间件中处理
      }
      return resolvedData;
    },

    // 记录用户变更
    afterOperation: async ({ operation, item, context }) => {
      if (['create', 'update', 'delete'].includes(operation)) {
        await context.query.ActivityLog.createOne({
          data: {
            user: { connect: { id: context.session?.itemId } },
            action: operation,
            entity: 'User',
            entityId: item.id,
            changes: JSON.stringify({
              name: item.name,
              email: item.email,
              roles: item.roles,
            }),
            ipAddress: context.req?.ip,
            userAgent: context.req?.headers['user-agent'],
          }
        });
      }
    }
  }
});
```

**数据示例**:
```json
{
  "id": "user_001",
  "name": "张三",
  "email": "zhang@busrom.com",
  "roles": ["role_product_admin", "role_media_manager"],
  "directPermissions": ["perm_blog_delete"],
  "isAdmin": false,
  "isActive": true,
  "lastLoginAt": "2025-11-05T10:30:00Z"
}
```

---

## 权限颗粒度定义

### 完整权限矩阵

以下是系统所有资源的权限定义:

| 资源类型 | Create | Read | Update | Delete | 其他权限 | 权限说明 |
|---------|--------|------|--------|--------|---------|---------|
| **内容管理** |
| Product | ✓ | ✓ | ✓ | ✓ | publish | 产品管理 |
| ProductSeries | ✓ | ✓ | ✓ | ✓ | - | 产品系列管理 |
| Blog | ✓ | ✓ | ✓ | ✓ | publish | 博客管理 |
| Application | ✓ | ✓ | ✓ | ✓ | - | 应用案例管理 |
| FaqItem | ✓ | ✓ | ✓ | ✓ | - | FAQ管理 |
| **媒体管理** |
| Media | ✓ | ✓ | ✓ | ✓ | - | 媒体文件管理 |
| MediaCategory | ✓ | ✓ | ✓ | ✓ | - | 媒体分类管理 |
| MediaTag | ✓ | ✓ | ✓ | ✓ | - | 媒体标签管理 |
| **网站配置** |
| NavigationMenu | ✓ | ✓ | ✓ | ✓ | - | 导航菜单管理 |
| HomeContent | - | ✓ | ✓ | - | - | 首页内容编辑 |
| Footer | - | ✓ | ✓ | - | - | 页脚配置编辑 |
| SiteConfig | - | ✓ | ✓ | - | - | 站点配置 |
| **SEO与营销** |
| SeoSetting | ✓ | ✓ | ✓ | ✓ | - | SEO设置 |
| CustomScript | ✓ | ✓ | ✓ | ✓ | inject_code | 自定义脚本 |
| **客户服务** |
| ContactForm | - | ✓ | ✓ | ✓ | export | 表单管理 |
| ActivityLog | - | ✓ | - | ✓ | view_logs | 操作日志 |
| **系统管理** |
| User | ✓ | ✓ | ✓ | ✓ | manage_roles | 用户管理 |
| Role | ✓ | ✓ | ✓ | ✓ | manage_permissions | 角色管理 |
| Permission | ✓ | ✓ | ✓ | ✓ | - | 权限管理 |

### 权限命名规范

权限标识符格式: `{Resource}:{Action}`

示例:
- `Product:create` - 创建产品
- `Product:read` - 查看产品
- `Product:update` - 更新产品
- `Product:delete` - 删除产品
- `Blog:publish` - 发布博客
- `CustomScript:inject_code` - 注入自定义代码

---

## 权限验证逻辑

### 1. 权限计算函数

```typescript
// lib/permissions/calculate-permissions.ts

import { Context } from '.keystone/types';

/**
 * 计算用户的完整权限列表
 * @param userId 用户ID
 * @param context Keystone Context
 * @returns 权限标识符数组
 */
export async function calculateUserPermissions(
  userId: string,
  context: Context
): Promise<string[]> {
  // 1. 查询用户信息
  const user = await context.query.User.findOne({
    where: { id: userId },
    query: `
      id
      isAdmin
      isActive
      roles {
        id
        isActive
        permissions {
          identifier
        }
        parentRole {
          permissions {
            identifier
          }
        }
      }
      directPermissions {
        identifier
      }
    `
  });

  // 用户不存在或未启用
  if (!user || !user.isActive) {
    return [];
  }

  // 超级管理员拥有所有权限
  if (user.isAdmin) {
    return ['*']; // 特殊标识,表示所有权限
  }

  const permissions = new Set<string>();

  // 2. 收集角色权限
  for (const role of user.roles || []) {
    if (!role.isActive) continue;

    // 添加角色的直接权限
    for (const perm of role.permissions || []) {
      permissions.add(perm.identifier);
    }

    // 添加父角色的权限(继承)
    if (role.parentRole) {
      for (const perm of role.parentRole.permissions || []) {
        permissions.add(perm.identifier);
      }
    }
  }

  // 3. 添加直接分配的权限
  for (const perm of user.directPermissions || []) {
    permissions.add(perm.identifier);
  }

  return Array.from(permissions);
}

/**
 * 检查用户是否拥有指定权限
 */
export async function hasPermission(
  userId: string,
  resource: string,
  action: string,
  context: Context
): Promise<boolean> {
  const permissions = await calculateUserPermissions(userId, context);

  // 超级管理员
  if (permissions.includes('*')) {
    return true;
  }

  // 检查具体权限
  const requiredPermission = `${resource}:${action}`;
  return permissions.includes(requiredPermission);
}

/**
 * 检查多个权限(OR逻辑)
 */
export async function hasAnyPermission(
  userId: string,
  permissionsList: Array<{ resource: string; action: string }>,
  context: Context
): Promise<boolean> {
  for (const { resource, action } of permissionsList) {
    if (await hasPermission(userId, resource, action, context)) {
      return true;
    }
  }
  return false;
}

/**
 * 检查多个权限(AND逻辑)
 */
export async function hasAllPermissions(
  userId: string,
  permissionsList: Array<{ resource: string; action: string }>,
  context: Context
): Promise<boolean> {
  for (const { resource, action } of permissionsList) {
    if (!await hasPermission(userId, resource, action, context)) {
      return false;
    }
  }
  return true;
}
```

### 2. 权限缓存机制

```typescript
// lib/permissions/cache.ts

import { createCache } from '@keystone-6/core/dist/lib/cache';

// 创建权限缓存(15分钟过期)
const permissionsCache = createCache({
  ttl: 15 * 60 * 1000, // 15分钟
});

/**
 * 获取用户权限(带缓存)
 */
export async function getCachedUserPermissions(
  userId: string,
  context: Context
): Promise<string[]> {
  const cacheKey = `user_permissions:${userId}`;

  // 尝试从缓存获取
  let permissions = permissionsCache.get(cacheKey);

  if (!permissions) {
    // 缓存未命中,重新计算
    permissions = await calculateUserPermissions(userId, context);
    permissionsCache.set(cacheKey, permissions);
  }

  return permissions;
}

/**
 * 清除用户权限缓存
 */
export function clearUserPermissionsCache(userId: string) {
  const cacheKey = `user_permissions:${userId}`;
  permissionsCache.delete(cacheKey);
}

/**
 * 清除所有权限缓存
 */
export function clearAllPermissionsCache() {
  permissionsCache.clear();
}
```

### 3. Keystone Access Control 集成

```typescript
// lib/permissions/access-control.ts

import { hasPermission } from './calculate-permissions';
import { getCachedUserPermissions } from './cache';

/**
 * 为 Keystone List 生成访问控制规则
 */
export function createAccessControl(resourceName: string) {
  return {
    operation: {
      query: async ({ session, context }: any) => {
        if (!session) return false;
        return await hasPermission(
          session.itemId,
          resourceName,
          'read',
          context
        );
      },

      create: async ({ session, context }: any) => {
        if (!session) return false;
        return await hasPermission(
          session.itemId,
          resourceName,
          'create',
          context
        );
      },

      update: async ({ session, context }: any) => {
        if (!session) return false;
        return await hasPermission(
          session.itemId,
          resourceName,
          'update',
          context
        );
      },

      delete: async ({ session, context }: any) => {
        if (!session) return false;
        return await hasPermission(
          session.itemId,
          resourceName,
          'delete',
          context
        );
      },
    },
  };
}

/**
 * 字段级访问控制
 */
export function createFieldAccess(
  resourceName: string,
  requiredPermissions: string[] = []
) {
  return async ({ session, context }: any) => {
    if (!session) return false;

    // 如果没有指定特殊权限,使用资源的 update 权限
    if (requiredPermissions.length === 0) {
      return await hasPermission(
        session.itemId,
        resourceName,
        'update',
        context
      );
    }

    // 检查是否拥有任一特殊权限
    for (const perm of requiredPermissions) {
      const [resource, action] = perm.split(':');
      if (await hasPermission(session.itemId, resource, action, context)) {
        return true;
      }
    }

    return false;
  };
}
```

### 4. 应用示例

```typescript
// cms/schema/Product.ts

import { list } from '@keystone-6/core';
import { createAccessControl, createFieldAccess } from '../../lib/permissions/access-control';

export const Product = list({
  // 使用新的权限系统
  access: createAccessControl('Product'),

  fields: {
    name: text({ validation: { isRequired: true } }),

    description: text({ ui: { displayMode: 'textarea' } }),

    // 敏感字段:只有特定权限才能编辑
    featured: checkbox({
      access: {
        read: () => true,
        create: createFieldAccess('Product', ['Product:update', 'Product:create']),
        update: createFieldAccess('Product', ['Product:update']),
      }
    }),

    // SEO设置:需要特殊权限
    seoSetting: relationship({
      ref: 'SeoSetting',
      access: {
        read: () => true,
        create: createFieldAccess('Product', ['SeoSetting:create', 'SeoSetting:update']),
        update: createFieldAccess('Product', ['SeoSetting:update']),
      }
    }),

    // ... 其他字段
  },

  hooks: {
    // 发布操作需要特殊权限
    validateInput: async ({ resolvedData, addValidationError, context }) => {
      if (resolvedData.published === true) {
        const hasPublishPerm = await hasPermission(
          context.session.itemId,
          'Product',
          'publish',
          context
        );

        if (!hasPublishPerm) {
          addValidationError('You do not have permission to publish products | 您没有发布产品的权限');
        }
      }
    }
  }
});
```

---

## CMS后台界面设计

### 1. 角色管理页面

**路径**: `/admin/roles`

**功能**:
- 角色列表展示
- 创建/编辑角色
- 权限矩阵配置
- 角色继承配置

**UI设计**:

```typescript
// admin/pages/roles/index.tsx

import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Button, Table, Modal, Form, Checkbox, Select } from '@keystone-ui/core';

export default function RolesManager() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  const { data: rolesData } = useQuery(GET_ROLES);
  const { data: permissionsData } = useQuery(GET_PERMISSIONS);

  const [createRole] = useMutation(CREATE_ROLE);
  const [updateRole] = useMutation(UPDATE_ROLE);

  return (
    <div className="roles-manager">
      <header className="page-header">
        <h1>角色管理</h1>
        <Button
          tone="active"
          onClick={() => {
            setSelectedRole(null);
            setIsModalOpen(true);
          }}
        >
          创建新角色
        </Button>
      </header>

      {/* 角色列表 */}
      <Table>
        <thead>
          <tr>
            <th>角色名称</th>
            <th>角色代码</th>
            <th>用户数量</th>
            <th>权限数量</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {rolesData?.roles.map((role) => (
            <tr key={role.id}>
              <td>
                {role.name}
                {role.isSystem && <span className="badge">系统角色</span>}
              </td>
              <td><code>{role.code}</code></td>
              <td>{role.usersCount}</td>
              <td>{role.permissionsCount}</td>
              <td>
                <StatusBadge active={role.isActive} />
              </td>
              <td>
                <Button
                  size="small"
                  onClick={() => {
                    setSelectedRole(role);
                    setIsModalOpen(true);
                  }}
                >
                  编辑
                </Button>
                {!role.isSystem && (
                  <Button
                    size="small"
                    tone="negative"
                    onClick={() => handleDelete(role.id)}
                  >
                    删除
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* 创建/编辑角色弹窗 */}
      <RoleEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        role={selectedRole}
        permissions={permissionsData?.permissions}
        onSave={handleSaveRole}
      />
    </div>
  );
}
```

### 2. 权限矩阵配置界面

```typescript
// admin/components/PermissionMatrix.tsx

import React from 'react';
import { Checkbox } from '@keystone-ui/core';

interface PermissionMatrixProps {
  permissions: Permission[];
  selectedPermissions: string[];
  onChange: (permissionIds: string[]) => void;
}

export function PermissionMatrix({
  permissions,
  selectedPermissions,
  onChange
}: PermissionMatrixProps) {
  // 按分类分组权限
  const groupedPermissions = groupBy(permissions, 'category');

  const handleToggle = (permissionId: string, checked: boolean) => {
    if (checked) {
      onChange([...selectedPermissions, permissionId]);
    } else {
      onChange(selectedPermissions.filter(id => id !== permissionId));
    }
  };

  return (
    <div className="permission-matrix">
      {Object.entries(groupedPermissions).map(([category, perms]) => (
        <section key={category} className="permission-category">
          <h3>{getCategoryLabel(category)}</h3>

          <table className="matrix-table">
            <thead>
              <tr>
                <th>资源</th>
                <th>创建</th>
                <th>查看</th>
                <th>更新</th>
                <th>删除</th>
                <th>其他</th>
              </tr>
            </thead>
            <tbody>
              {groupByResource(perms).map(([resource, resourcePerms]) => (
                <tr key={resource}>
                  <td><strong>{resource}</strong></td>
                  {['create', 'read', 'update', 'delete', 'other'].map(action => {
                    const perm = resourcePerms.find(p => p.action === action);
                    return (
                      <td key={action}>
                        {perm ? (
                          <Checkbox
                            checked={selectedPermissions.includes(perm.id)}
                            onChange={(e) => handleToggle(perm.id, e.target.checked)}
                          >
                            {action === 'other' && perm.name}
                          </Checkbox>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}
    </div>
  );
}
```

### 3. 用户管理页面

**路径**: `/admin/users`

**功能**:
- 用户列表
- 分配角色
- 查看用户权限
- 启用/禁用用户

```typescript
// admin/pages/users/index.tsx

export default function UsersManager() {
  const { data } = useQuery(GET_USERS);

  return (
    <div className="users-manager">
      <Table>
        <thead>
          <tr>
            <th>用户</th>
            <th>邮箱</th>
            <th>角色</th>
            <th>状态</th>
            <th>最后登录</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {data?.users.map((user) => (
            <tr key={user.id}>
              <td>
                <div className="user-info">
                  <Avatar src={user.avatar?.url} />
                  <span>{user.name}</span>
                  {user.isAdmin && <Badge>超级管理员</Badge>}
                </div>
              </td>
              <td>{user.email}</td>
              <td>
                <RoleTags roles={user.roles} />
              </td>
              <td>
                <StatusBadge active={user.isActive} />
              </td>
              <td>{formatDate(user.lastLoginAt)}</td>
              <td>
                <Button onClick={() => openEditModal(user)}>
                  编辑
                </Button>
                <Button onClick={() => viewPermissions(user)}>
                  查看权限
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
```

### 4. 用户权限预览弹窗

```typescript
// admin/components/UserPermissionsModal.tsx

export function UserPermissionsModal({ user, isOpen, onClose }) {
  const { data } = useQuery(GET_USER_PERMISSIONS, {
    variables: { userId: user.id }
  });

  const permissions = data?.calculateUserPermissions || [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} width="large">
      <Modal.Header>
        <h2>{user.name} 的权限列表</h2>
      </Modal.Header>

      <Modal.Body>
        {user.isAdmin ? (
          <Alert tone="positive">
            该用户是超级管理员,拥有所有权限
          </Alert>
        ) : (
          <>
            <section>
              <h3>角色权限</h3>
              {user.roles.map(role => (
                <div key={role.id} className="role-permissions">
                  <h4>{role.name}</h4>
                  <PermissionList permissions={role.permissions} />
                </div>
              ))}
            </section>

            {user.directPermissions.length > 0 && (
              <section>
                <h3>直接分配的权限</h3>
                <PermissionList permissions={user.directPermissions} />
              </section>
            )}

            <section>
              <h3>有效权限汇总</h3>
              <PermissionSummary permissions={permissions} />
            </section>
          </>
        )}
      </Modal.Body>
    </Modal>
  );
}
```

---

## API接口设计

### 1. GraphQL 查询

```graphql
# 查询所有角色
query GetRoles {
  roles(orderBy: { priority: desc }) {
    id
    name
    code
    description
    isSystem
    isActive
    priority
    permissions {
      id
      identifier
      name
      resource
      action
    }
    usersCount
    createdAt
  }
}

# 查询所有权限
query GetPermissions {
  permissions(orderBy: { category: asc }) {
    id
    identifier
    name
    description
    resource
    action
    category
    isSystem
  }
}

# 查询用户信息(含权限)
query GetUserWithPermissions($id: ID!) {
  user(where: { id: $id }) {
    id
    name
    email
    isAdmin
    isActive
    roles {
      id
      name
      permissions {
        identifier
      }
    }
    directPermissions {
      identifier
    }
  }
}

# 计算用户的完整权限列表
query CalculateUserPermissions($userId: ID!) {
  calculateUserPermissions(userId: $userId)
}
```

### 2. GraphQL Mutation

```graphql
# 创建角色
mutation CreateRole($data: RoleCreateInput!) {
  createRole(data: $data) {
    id
    name
    code
    permissions {
      id
    }
  }
}

# 更新角色权限
mutation UpdateRolePermissions($roleId: ID!, $permissionIds: [ID!]!) {
  updateRole(
    where: { id: $roleId }
    data: {
      permissions: {
        set: $permissionIds
      }
    }
  ) {
    id
    permissions {
      id
      identifier
    }
  }
}

# 为用户分配角色
mutation AssignRolesToUser($userId: ID!, $roleIds: [ID!]!) {
  updateUser(
    where: { id: $userId }
    data: {
      roles: {
        set: $roleIds
      }
    }
  ) {
    id
    roles {
      id
      name
    }
  }
}

# 为用户添加直接权限
mutation AddDirectPermission($userId: ID!, $permissionId: ID!) {
  updateUser(
    where: { id: $userId }
    data: {
      directPermissions: {
        connect: [{ id: $permissionId }]
      }
    }
  ) {
    id
    directPermissions {
      id
      identifier
    }
  }
}
```

### 3. 自定义 GraphQL Resolvers

```typescript
// cms/lib/graphql-extensions.ts

export const extendGraphqlSchema = graphql.extend((base) => ({
  query: {
    // 计算用户权限
    calculateUserPermissions: graphql.field({
      type: graphql.list(graphql.nonNull(graphql.String)),
      args: {
        userId: graphql.arg({ type: graphql.nonNull(graphql.ID) })
      },
      resolve: async (source, { userId }, context) => {
        return await calculateUserPermissions(userId, context);
      }
    }),

    // 检查用户是否有特定权限
    checkPermission: graphql.field({
      type: graphql.Boolean,
      args: {
        userId: graphql.arg({ type: graphql.nonNull(graphql.ID) }),
        resource: graphql.arg({ type: graphql.nonNull(graphql.String) }),
        action: graphql.arg({ type: graphql.nonNull(graphql.String) })
      },
      resolve: async (source, { userId, resource, action }, context) => {
        return await hasPermission(userId, resource, action, context);
      }
    }),
  },

  mutation: {
    // 批量更新角色权限
    bulkUpdateRolePermissions: graphql.field({
      type: base.object('Role'),
      args: {
        roleId: graphql.arg({ type: graphql.nonNull(graphql.ID) }),
        permissionIds: graphql.arg({ type: graphql.list(graphql.nonNull(graphql.ID)) })
      },
      resolve: async (source, { roleId, permissionIds }, context) => {
        const role = await context.query.Role.updateOne({
          where: { id: roleId },
          data: {
            permissions: {
              set: permissionIds.map(id => ({ id }))
            }
          },
          query: 'id name permissions { id identifier }'
        });

        // 清除所有使用该角色的用户的权限缓存
        const users = await context.query.User.findMany({
          where: {
            roles: { some: { id: { equals: roleId } } }
          },
          query: 'id'
        });

        for (const user of users) {
          clearUserPermissionsCache(user.id);
        }

        return role;
      }
    }),
  }
}));
```

---

## 初始化数据

### 系统预设权限

```typescript
// cms/migrations/seed-permissions.ts

import { Context } from '.keystone/types';

export async function seedPermissions(context: Context) {
  console.log('🌱 Seeding permissions...');

  const permissions = [
    // ==================== 内容管理 ====================
    // Product
    { resource: 'Product', action: 'create', name: '创建产品', category: 'content_management' },
    { resource: 'Product', action: 'read', name: '查看产品', category: 'content_management' },
    { resource: 'Product', action: 'update', name: '更新产品', category: 'content_management' },
    { resource: 'Product', action: 'delete', name: '删除产品', category: 'content_management' },
    { resource: 'Product', action: 'publish', name: '发布产品', category: 'content_management' },

    // ProductSeries
    { resource: 'ProductSeries', action: 'create', name: '创建产品系列', category: 'content_management' },
    { resource: 'ProductSeries', action: 'read', name: '查看产品系列', category: 'content_management' },
    { resource: 'ProductSeries', action: 'update', name: '更新产品系列', category: 'content_management' },
    { resource: 'ProductSeries', action: 'delete', name: '删除产品系列', category: 'content_management' },

    // Blog
    { resource: 'Blog', action: 'create', name: '创建博客', category: 'content_management' },
    { resource: 'Blog', action: 'read', name: '查看博客', category: 'content_management' },
    { resource: 'Blog', action: 'update', name: '更新博客', category: 'content_management' },
    { resource: 'Blog', action: 'delete', name: '删除博客', category: 'content_management' },
    { resource: 'Blog', action: 'publish', name: '发布博客', category: 'content_management' },

    // Application
    { resource: 'Application', action: 'create', name: '创建应用案例', category: 'content_management' },
    { resource: 'Application', action: 'read', name: '查看应用案例', category: 'content_management' },
    { resource: 'Application', action: 'update', name: '更新应用案例', category: 'content_management' },
    { resource: 'Application', action: 'delete', name: '删除应用案例', category: 'content_management' },

    // FaqItem
    { resource: 'FaqItem', action: 'create', name: '创建FAQ', category: 'content_management' },
    { resource: 'FaqItem', action: 'read', name: '查看FAQ', category: 'content_management' },
    { resource: 'FaqItem', action: 'update', name: '更新FAQ', category: 'content_management' },
    { resource: 'FaqItem', action: 'delete', name: '删除FAQ', category: 'content_management' },

    // ==================== 媒体管理 ====================
    { resource: 'Media', action: 'create', name: '上传媒体', category: 'media_management' },
    { resource: 'Media', action: 'read', name: '查看媒体', category: 'media_management' },
    { resource: 'Media', action: 'update', name: '更新媒体', category: 'media_management' },
    { resource: 'Media', action: 'delete', name: '删除媒体', category: 'media_management' },

    { resource: 'MediaCategory', action: 'create', name: '创建媒体分类', category: 'media_management' },
    { resource: 'MediaCategory', action: 'read', name: '查看媒体分类', category: 'media_management' },
    { resource: 'MediaCategory', action: 'update', name: '更新媒体分类', category: 'media_management' },
    { resource: 'MediaCategory', action: 'delete', name: '删除媒体分类', category: 'media_management' },

    // ==================== 网站配置 ====================
    { resource: 'NavigationMenu', action: 'create', name: '创建导航菜单', category: 'site_configuration' },
    { resource: 'NavigationMenu', action: 'read', name: '查看导航菜单', category: 'site_configuration' },
    { resource: 'NavigationMenu', action: 'update', name: '更新导航菜单', category: 'site_configuration' },
    { resource: 'NavigationMenu', action: 'delete', name: '删除导航菜单', category: 'site_configuration' },

    { resource: 'HomeContent', action: 'read', name: '查看首页内容', category: 'site_configuration' },
    { resource: 'HomeContent', action: 'update', name: '更新首页内容', category: 'site_configuration' },

    { resource: 'Footer', action: 'read', name: '查看页脚配置', category: 'site_configuration' },
    { resource: 'Footer', action: 'update', name: '更新页脚配置', category: 'site_configuration' },

    { resource: 'SiteConfig', action: 'read', name: '查看站点配置', category: 'site_configuration' },
    { resource: 'SiteConfig', action: 'update', name: '更新站点配置', category: 'site_configuration' },

    // ==================== SEO与营销 ====================
    { resource: 'SeoSetting', action: 'create', name: '创建SEO设置', category: 'seo_marketing' },
    { resource: 'SeoSetting', action: 'read', name: '查看SEO设置', category: 'seo_marketing' },
    { resource: 'SeoSetting', action: 'update', name: '更新SEO设置', category: 'seo_marketing' },
    { resource: 'SeoSetting', action: 'delete', name: '删除SEO设置', category: 'seo_marketing' },

    { resource: 'CustomScript', action: 'create', name: '创建自定义脚本', category: 'seo_marketing' },
    { resource: 'CustomScript', action: 'read', name: '查看自定义脚本', category: 'seo_marketing' },
    { resource: 'CustomScript', action: 'update', name: '更新自定义脚本', category: 'seo_marketing' },
    { resource: 'CustomScript', action: 'delete', name: '删除自定义脚本', category: 'seo_marketing' },
    { resource: 'CustomScript', action: 'inject_code', name: '注入自定义代码', category: 'seo_marketing' },

    // ==================== 客户服务 ====================
    { resource: 'ContactForm', action: 'read', name: '查看联系表单', category: 'customer_service' },
    { resource: 'ContactForm', action: 'update', name: '更新联系表单', category: 'customer_service' },
    { resource: 'ContactForm', action: 'delete', name: '删除联系表单', category: 'customer_service' },
    { resource: 'ContactForm', action: 'export', name: '导出联系表单', category: 'customer_service' },

    { resource: 'ActivityLog', action: 'read', name: '查看操作日志', category: 'customer_service' },
    { resource: 'ActivityLog', action: 'view_logs', name: '查看审计日志', category: 'customer_service' },

    // ==================== 系统管理 ====================
    { resource: 'User', action: 'create', name: '创建用户', category: 'system_management' },
    { resource: 'User', action: 'read', name: '查看用户', category: 'system_management' },
    { resource: 'User', action: 'update', name: '更新用户', category: 'system_management' },
    { resource: 'User', action: 'delete', name: '删除用户', category: 'system_management' },
    { resource: 'User', action: 'manage_roles', name: '管理用户角色', category: 'system_management' },

    { resource: 'Role', action: 'create', name: '创建角色', category: 'system_management' },
    { resource: 'Role', action: 'read', name: '查看角色', category: 'system_management' },
    { resource: 'Role', action: 'update', name: '更新角色', category: 'system_management' },
    { resource: 'Role', action: 'delete', name: '删除角色', category: 'system_management' },
    { resource: 'Role', action: 'manage_permissions', name: '管理角色权限', category: 'system_management' },

    { resource: 'Permission', action: 'create', name: '创建权限', category: 'system_management' },
    { resource: 'Permission', action: 'read', name: '查看权限', category: 'system_management' },
    { resource: 'Permission', action: 'update', name: '更新权限', category: 'system_management' },
    { resource: 'Permission', action: 'delete', name: '删除权限', category: 'system_management' },
  ];

  for (const perm of permissions) {
    const identifier = `${perm.resource}:${perm.action}`;

    // 检查是否已存在
    const existing = await context.query.Permission.findOne({
      where: { identifier },
      query: 'id'
    });

    if (!existing) {
      await context.query.Permission.createOne({
        data: {
          ...perm,
          identifier,
          isSystem: true,
        }
      });
      console.log(`  ✓ Created permission: ${identifier}`);
    }
  }

  console.log('✅ Permissions seeded successfully!');
}
```

### 系统预设角色

```typescript
// cms/migrations/seed-roles.ts

export async function seedRoles(context: Context) {
  console.log('🌱 Seeding roles...');

  const roles = [
    {
      name: '超级管理员',
      code: 'super_admin',
      description: '拥有系统所有权限',
      isSystem: true,
      priority: 10,
      permissions: '*', // 所有权限
    },
    {
      name: '内容编辑',
      code: 'content_editor',
      description: '负责内容的创建和编辑',
      isSystem: true,
      priority: 7,
      permissions: [
        // 内容管理 - 增查改
        'Product:create', 'Product:read', 'Product:update',
        'ProductSeries:read', 'ProductSeries:update',
        'Blog:create', 'Blog:read', 'Blog:update',
        'Application:create', 'Application:read', 'Application:update',
        'FaqItem:create', 'FaqItem:read', 'FaqItem:update',
        // 媒体管理 - 全部
        'Media:create', 'Media:read', 'Media:update', 'Media:delete',
        'MediaCategory:read',
      ]
    },
    {
      name: '内容审核',
      code: 'content_reviewer',
      description: '负责内容的审核和发布',
      isSystem: true,
      priority: 8,
      permissions: [
        // 内容查看和发布
        'Product:read', 'Product:update', 'Product:publish',
        'ProductSeries:read',
        'Blog:read', 'Blog:update', 'Blog:publish',
        'Application:read', 'Application:update',
        'FaqItem:read', 'FaqItem:update',
        // 媒体查看
        'Media:read',
      ]
    },
    {
      name: '客服专员',
      code: 'customer_support',
      description: '负责处理客户咨询',
      isSystem: true,
      priority: 5,
      permissions: [
        // 表单管理
        'ContactForm:read', 'ContactForm:update', 'ContactForm:export',
        // 查看产品信息
        'Product:read',
        'ProductSeries:read',
        'FaqItem:read',
      ]
    },
    {
      name: 'SEO专员',
      code: 'seo_specialist',
      description: '负责网站SEO优化',
      isSystem: true,
      priority: 6,
      permissions: [
        // SEO设置
        'SeoSetting:create', 'SeoSetting:read', 'SeoSetting:update', 'SeoSetting:delete',
        // 自定义脚本
        'CustomScript:create', 'CustomScript:read', 'CustomScript:update', 'CustomScript:delete',
        'CustomScript:inject_code',
        // 内容查看(用于优化)
        'Product:read', 'Blog:read', 'Application:read',
      ]
    },
    {
      name: '媒体管理员',
      code: 'media_manager',
      description: '负责媒体资源管理',
      isSystem: true,
      priority: 6,
      permissions: [
        // 媒体管理 - 全部
        'Media:create', 'Media:read', 'Media:update', 'Media:delete',
        'MediaCategory:create', 'MediaCategory:read', 'MediaCategory:update', 'MediaCategory:delete',
        'MediaTag:create', 'MediaTag:read', 'MediaTag:update', 'MediaTag:delete',
      ]
    },
  ];

  for (const roleData of roles) {
    // 检查是否已存在
    const existing = await context.query.Role.findOne({
      where: { code: roleData.code },
      query: 'id'
    });

    if (existing) {
      console.log(`  ⊙ Role already exists: ${roleData.name}`);
      continue;
    }

    // 获取权限ID
    let permissionIds = [];
    if (roleData.permissions === '*') {
      // 超级管理员:获取所有权限
      const allPermissions = await context.query.Permission.findMany({
        query: 'id'
      });
      permissionIds = allPermissions.map(p => p.id);
    } else {
      // 根据标识符查找权限
      for (const identifier of roleData.permissions) {
        const perm = await context.query.Permission.findOne({
          where: { identifier },
          query: 'id'
        });
        if (perm) {
          permissionIds.push(perm.id);
        }
      }
    }

    // 创建角色
    await context.query.Role.createOne({
      data: {
        name: roleData.name,
        code: roleData.code,
        description: roleData.description,
        isSystem: roleData.isSystem,
        priority: roleData.priority,
        isActive: true,
        permissions: {
          connect: permissionIds.map(id => ({ id }))
        }
      }
    });

    console.log(`  ✓ Created role: ${roleData.name} (${permissionIds.length} permissions)`);
  }

  console.log('✅ Roles seeded successfully!');
}
```

---

## 实施步骤

### Phase 1: 数据模型实施 (1-2天)

1. **创建 Permission 模型**
   - [ ] 编写 Schema 定义
   - [ ] 添加字段验证 Hooks
   - [ ] 测试CRUD操作

2. **重构 Role 模型**
   - [ ] 添加新字段(code, priority, parentRole等)
   - [ ] 建立与 Permission 的关联
   - [ ] 数据迁移脚本

3. **升级 User 模型**
   - [ ] 添加多角色支持
   - [ ] 添加直接权限字段
   - [ ] 添加 isAdmin 快捷字段

### Phase 2: 权限验证逻辑 (2-3天)

1. **实现权限计算函数**
   - [ ] calculateUserPermissions()
   - [ ] hasPermission()
   - [ ] 权限缓存机制

2. **集成到 Keystone Access Control**
   - [ ] createAccessControl() 工具函数
   - [ ] createFieldAccess() 字段级权限
   - [ ] 更新所有 List 的 access 配置

3. **自定义 GraphQL Resolvers**
   - [ ] calculateUserPermissions query
   - [ ] checkPermission query
   - [ ] bulkUpdateRolePermissions mutation

### Phase 3: CMS 后台界面 (3-4天)

1. **角色管理页面**
   - [ ] 角色列表
   - [ ] 创建/编辑角色表单
   - [ ] 权限矩阵配置界面

2. **用户管理页面**
   - [ ] 用户列表(显示角色)
   - [ ] 分配角色功能
   - [ ] 用户权限预览弹窗

3. **权限管理页面**
   - [ ] 权限列表
   - [ ] 创建自定义权限(可选)

### Phase 4: 数据初始化 (1天)

1. **初始化脚本**
   - [ ] seed-permissions.ts
   - [ ] seed-roles.ts
   - [ ] 创建默认超级管理员

2. **数据库迁移**
   - [ ] 执行 Prisma 迁移
   - [ ] 运行初始化脚本
   - [ ] 验证数据完整性

### Phase 5: 测试与文档 (2天)

1. **功能测试**
   - [ ] 权限计算测试
   - [ ] 访问控制测试
   - [ ] 角色继承测试
   - [ ] 多角色合并测试

2. **UI测试**
   - [ ] 角色管理界面
   - [ ] 用户管理界面
   - [ ] 权限矩阵交互

3. **文档编写**
   - [ ] 管理员使用手册
   - [ ] 开发者文档
   - [ ] API文档

---

## 总结

### 系统优势

1. **灵活性**: 超级管理员可在 CMS 中自由创建角色和分配权限,无需修改代码
2. **安全性**: 细粒度权限控制,最小权限原则
3. **可扩展性**: 支持添加新资源和新权限类型
4. **易用性**: 可视化权限矩阵,直观易懂
5. **性能**: 权限缓存机制,减少数据库查询

### 注意事项

1. **角色继承**: 注意避免循环继承
2. **权限缓存**: 角色或用户权限变更时,需清除缓存
3. **系统角色**: 保护系统预设角色,避免误删
4. **审计日志**: 所有权限变更应记录到 ActivityLog

### 后续优化方向

1. **字段级权限**: 更细粒度的字段访问控制
2. **数据级权限**: 基于数据所有权的访问控制
3. **权限模板**: 预设常用角色模板
4. **批量操作**: 批量分配角色/权限
5. **权限报表**: 权限使用统计和审计报告

---

**文档维护**: 开发团队
**最后审核**: 2025-11-05