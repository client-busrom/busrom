# 🔧 Busrom网站后端开发PRD (Keystone 6)

**文档版本**: v2.0  
**技术栈**: Keystone 6 + PostgreSQL + AWS S3/MinIO + Nginx  
**最后更新**: 2025-11-03

---

## 📋 技术架构确认

### 后端技术栈
- **CMS框架**: Keystone 6
- **数据库**: PostgreSQL
- **图片/视频存储**: 
  - 生产环境：AWS S3 + CloudFront CDN
  - 开发环境：MinIO (Docker) + Nginx反代
- **部署**: AWS EC2
- **语言**: Node.js + TypeScript

### 已完成的核心数据模型
```
✅ Media (媒体资源)
✅ MediaCategory (媒体分类)
✅ MediaTag (媒体标签)
✅ Category (分类)
✅ ProductSeries (产品系列)
✅ Product (产品)
✅ Blog (博客)
✅ Application (应用案例)
✅ FaqItem (常见问题)
```

### 待补充的数据模型
```
🔲 ContactForm (联系表单)
🔲 CustomScript (自定义代码)
🔲 SeoSetting (SEO设置)
🔲 SiteConfig (站点配置)
🔲 NavigationMenu (导航菜单)
🔲 HomeContent (首页内容配置)
🔲 User (管理员用户)
🔲 Role (角色权限)
🔲 ActivityLog (操作日志)
```

---

## 📊 完整数据模型定义 (Keystone Schema)

### 1. ContactForm (联系表单提交)

**用途**: 存储所有用户通过前端表单提交的咨询/询价数据

**Keystone Schema**:
```typescript
import { list } from '@keystone-6/core';
import { text, timestamp, select, relationship, checkbox } from '@keystone-6/core/fields';

export const ContactForm = list({
  access: {
    operation: {
      query: ({ session }) => !!session, // 仅登录用户可查看
      create: () => true, // 公开接口可创建
      update: ({ session }) => !!session,
      delete: ({ session }) => session?.data?.role === 'admin',
    }
  },
  
  fields: {
    // 基础信息
    name: text({
      validation: { isRequired: true },
      db: { isNullable: false },
      label: '姓名',
    }),
    
    email: text({
      validation: { 
        isRequired: true,
        match: { regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, explanation: '邮箱格式不正确' }
      },
      db: { isNullable: false },
      label: '邮箱',
    }),
    
    whatsapp: text({
      label: 'WhatsApp',
    }),
    
    companyName: text({
      label: '公司名称',
    }),
    
    message: text({
      validation: { isRequired: true },
      db: { isNullable: false },
      ui: { displayMode: 'textarea' },
      label: '留言内容',
    }),
    
    // 关联产品（用于询价）
    relatedProduct: relationship({
      ref: 'Product',
      label: '关联产品',
      ui: {
        displayMode: 'select',
        labelField: 'name',
      }
    }),
    
    // 元数据
    submittedAt: timestamp({
      defaultValue: { kind: 'now' },
      label: '提交时间',
      ui: { 
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' }
      }
    }),
    
    status: select({
      type: 'enum',
      options: [
        { label: '未读', value: 'unread' },
        { label: '已读', value: 'read' },
        { label: '已回复', value: 'replied' },
        { label: '已关闭', value: 'closed' },
      ],
      defaultValue: 'unread',
      label: '处理状态',
      ui: { displayMode: 'segmented-control' }
    }),
    
    // 技术字段
    ipAddress: text({
      label: 'IP地址',
      ui: { 
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' }
      }
    }),
    
    userAgent: text({
      label: '浏览器信息',
      ui: { 
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' }
      }
    }),
    
    // 管理员备注
    adminNote: text({
      ui: { displayMode: 'textarea' },
      label: '管理员备注',
    }),
    
    // 邮件发送状态
    emailSent: checkbox({
      defaultValue: false,
      label: '已发送邮件通知',
    }),
  },
  
  ui: {
    listView: {
      initialColumns: ['name', 'email', 'status', 'submittedAt'],
      initialSort: { field: 'submittedAt', direction: 'DESC' },
      pageSize: 50,
    },
    labelField: 'name',
  },
  
  hooks: {
    // 创建后发送邮件通知
    afterOperation: async ({ operation, item, context }) => {
      if (operation === 'create') {
        // TODO: 触发邮件发送逻辑
        // await sendEmailNotification(item);
      }
    }
  }
});
```

**前端API调用示例**:
```typescript
// POST /api/contact
const response = await fetch('/api/graphql', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: `
      mutation CreateContactForm($data: ContactFormCreateInput!) {
        createContactForm(data: $data) {
          id
          name
          email
          submittedAt
        }
      }
    `,
    variables: {
      data: {
        name: "张三",
        email: "zhang@example.com",
        whatsapp: "+86 138 0000 0000",
        companyName: "ABC公司",
        message: "我想了解Glass Standoff产品的定制服务",
        relatedProduct: { connect: { id: "product-id-123" } },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      }
    }
  })
});
```

---

### 2. CustomScript (自定义代码管理)

**用途**: 存储运营人员配置的全局/单页追踪代码（Google Analytics、TikTok Pixel等）

**Keystone Schema**:

```typescript
import { list } from '@keystone-6/core';
import { 
  text, 
  select, 
  checkbox, 
  timestamp, 
  relationship,
  integer 
} from '@keystone-6/core/fields';

export const CustomScript = list({
  access: {
    operation: {
      query: ({ session }) => !!session,
      create: ({ session }) => session?.data?.role === 'admin',
      update: ({ session }) => session?.data?.role === 'admin',
      delete: ({ session }) => session?.data?.role === 'admin',
    }
  },
  
  fields: {
    // ==================== 基础信息 ====================
    name: text({
      validation: { isRequired: true },
      label: '脚本名称',
      db: { isNullable: false },
      ui: {
        description: '如: Google Analytics, TikTok Pixel, Facebook Pixel'
      }
    }),
    
    description: text({
      ui: { displayMode: 'textarea' },
      label: '描述/备注',
    }),
    
    // ==================== 脚本内容 ====================
    scriptPosition: select({
      type: 'enum',
      options: [
        { label: 'Header (前)', value: 'header' },
        { label: 'Footer (前)', value: 'footer' },
        { label: 'Body开始 (后)', value: 'body_start' },
      ],
      validation: { isRequired: true },
      defaultValue: 'header',
      label: '注入位置',
    }),
    
    content: text({
      ui: { displayMode: 'textarea' },
      validation: { isRequired: true },
      label: '脚本内容',
      db: { isNullable: false },
      ui: {
        description: '请输入完整的标签或其他代码'
      }
    }),
    
    // ==================== 应用范围（核心优化部分）====================
    
    scope: select({
      type: 'enum',
      options: [
        { label: '全局（所有页面）', value: 'global' },
        { label: '页面类型', value: 'page_type' },
        { label: '精确路径', value: 'exact_path' },
        { label: '路径规则（通配符）', value: 'path_pattern' },
        { label: '关联内容', value: 'related_content' },
      ],
      validation: { isRequired: true },
      defaultValue: 'global',
      label: '应用范围',
      ui: {
        displayMode: 'segmented-control',
        description: '决定脚本在哪些页面加载'
      }
    }),
    
    // ---------- 选项1: 页面类型 ----------
    pageType: select({
      type: 'enum',
      options: [
        { label: '首页', value: 'home' },
        
        // 产品相关
        { label: '产品系列列表页 (/product)', value: 'product_series_list' },
        { label: '产品系列详情页 (/product/[series])', value: 'product_series_detail' },
        
        // 商店相关
        { label: '商店列表页 (/shop)', value: 'shop_list' },
        { label: '商店产品详情页 (/shop/[sku])', value: 'shop_detail' },
        
        // 博客相关
        { label: '博客列表页 (/about-us/blog)', value: 'blog_list' },
        { label: '博客详情页 (/about-us/blog/[slug])', value: 'blog_detail' },
        
        // 案例相关
        { label: '案例列表页 (/service/application)', value: 'application_list' },
        { label: '案例详情页 (/service/application/[id])', value: 'application_detail' },
        
        // 服务相关
        { label: '服务概览页 (/service)', value: 'service_overview' },
        { label: '一站式服务页 (/service/one-stop-shop)', value: 'service_one_stop' },
        { label: 'FAQ页面 (/service/faq)', value: 'service_faq' },
        
        // 关于我们相关
        { label: '我们的故事 (/about-us/story)', value: 'about_story' },
        { label: '支持页面 (/about-us/support)', value: 'about_support' },
        
        // 其他
        { label: '联系我们页面 (/contact-us)', value: 'contact' },
        { label: '隐私政策 (/privacy-policy)', value: 'privacy_policy' },
        { label: '欺诈提醒 (/fraud-notice)', value: 'fraud_notice' },
      ],
      label: '页面类型',
      ui: {
        description: '当"应用范围"选择"页面类型"时生效'
      }
    }),
    
    // ---------- 选项2: 精确路径 ----------
    exactPath: text({
      label: '精确路径',
      ui: {
        description: '如: /about-us/story, /service/faq。当"应用范围"选择"精确路径"时生效'
      }
    }),
    
    // ---------- 选项3: 路径规则（通配符）----------
    pathPattern: text({
      label: '路径规则（支持通配符）',
      ui: {
        description: '如: /shop/*, /blog/*, /product/glass-*。当"应用范围"选择"路径规则"时生效'
      }
    }),
    
    // ---------- 选项4: 关联具体内容 ----------
    relatedProduct: relationship({
      ref: 'Product',
      label: '关联产品',
      ui: {
        displayMode: 'select',
        labelField: 'name',
        description: '当"应用范围"选择"关联内容"且目标是产品时填写'
      }
    }),
    
    relatedBlog: relationship({
      ref: 'Blog',
      label: '关联博客',
      ui: {
        displayMode: 'select',
        labelField: 'title',
        description: '当"应用范围"选择"关联内容"且目标是博客时填写'
      }
    }),
    
    relatedApplication: relationship({
      ref: 'Application',
      label: '关联案例',
      ui: {
        displayMode: 'select',
        labelField: 'name',
        description: '当"应用范围"选择"关联内容"且目标是案例时填写'
      }
    }),
    
    relatedProductSeries: relationship({
      ref: 'ProductSeries',
      label: '关联产品系列',
      ui: {
        displayMode: 'select',
        labelField: 'name',
        description: '当"应用范围"选择"关联内容"且目标是产品系列时填写'
      }
    }),
    
    // ==================== 高级选项 ====================
    
    enabled: checkbox({
      defaultValue: false,
      label: '是否启用',
      ui: {
        description: '关闭后不会加载此脚本'
      }
    }),
    
    priority: integer({
      defaultValue: 5,
      label: '加载优先级',
      ui: {
        description: '数字越小优先级越高（1-10），影响脚本在页面中的加载顺序'
      },
      validation: {
        min: 1,
        max: 10
      }
    }),
    
    async: checkbox({
      defaultValue: false,
      label: '异步加载（async）',
      ui: {
        description: '适用于不需要立即执行的脚本，提升页面性能'
      }
    }),
    
    defer: checkbox({
      defaultValue: false,
      label: '延迟加载（defer）',
      ui: {
        description: '脚本在页面解析完成后执行，适用于依赖DOM的脚本'
      }
    }),
    
    // ==================== 版本管理 ====================
    
    version: text({
      defaultValue: '1.0',
      label: '版本号',
    }),
    
    changelog: text({
      ui: { displayMode: 'textarea' },
      label: '更新日志',
    }),
    
    // ==================== 元数据 ====================
    
    createdAt: timestamp({
      defaultValue: { kind: 'now' },
      ui: { 
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' }
      }
    }),
    
    updatedAt: timestamp({
      db: { updatedAt: true },
      ui: { 
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' }
      }
    }),
    
    lastTestedAt: timestamp({
      label: '最后测试时间',
      ui: {
        description: '记录最后一次验证脚本正常工作的时间'
      }
    }),
  },
  
  // ==================== UI配置 ====================
  
  ui: {
    listView: {
      initialColumns: ['name', 'scope', 'enabled', 'priority', 'updatedAt'],
      initialSort: { field: 'priority', direction: 'ASC' },
      pageSize: 50,
    },
    labelField: 'name',
    
    // 字段分组
    itemView: {
      defaultFieldMode: 'edit',
      fieldGroups: [
        {
          label: '基础信息',
          fields: ['name', 'description']
        },
        {
          label: '脚本内容',
          fields: ['content', 'scriptPosition']
        },
        {
          label: '应用范围',
          fields: [
            'scope', 
            'pageType', 
            'exactPath', 
            'pathPattern',
            'relatedProduct',
            'relatedBlog',
            'relatedApplication',
            'relatedProductSeries'
          ],
          description: '根据"应用范围"的选择，填写对应的字段'
        },
        {
          label: '高级选项',
          fields: ['enabled', 'priority', 'async', 'defer']
        },
        {
          label: '版本信息',
          fields: ['version', 'changelog', 'lastTestedAt']
        }
      ]
    }
  },
  
  // ==================== Hooks ====================
  
  hooks: {
    // 保存前验证
    validateInput: async ({ resolvedData, addValidationError, operation }) => {
      // 1. 验证脚本内容安全性
      if (resolvedData.content) {
        const validation = validateScript(resolvedData.content);
        if (!validation.valid) {
          validation.errors.forEach(error => {
            addValidationError(error);
          });
        }
      }
      
      // 2. 根据scope验证必填字段
      if (resolvedData.scope) {
        switch (resolvedData.scope) {
          case 'page_type':
            if (!resolvedData.pageType) {
              addValidationError('选择"页面类型"范围时，必须指定页面类型');
            }
            break;
          
          case 'exact_path':
            if (!resolvedData.exactPath) {
              addValidationError('选择"精确路径"范围时，必须填写路径');
            }
            break;
          
          case 'path_pattern':
            if (!resolvedData.pathPattern) {
              addValidationError('选择"路径规则"范围时，必须填写规则');
            }
            break;
          
          case 'related_content':
            const hasRelated = resolvedData.relatedProduct || 
                               resolvedData.relatedBlog || 
                               resolvedData.relatedApplication ||
                               resolvedData.relatedProductSeries;
            if (!hasRelated) {
              addValidationError('选择"关联内容"范围时，必须关联至少一个内容');
            }
            break;
        }
      }
      
      // 3. 验证async和defer不能同时启用
      if (resolvedData.async && resolvedData.defer) {
        addValidationError('async和defer不能同时启用');
      }
    },
    
    // 创建/更新后清除缓存
    afterOperation: async ({ operation, item }) => {
      if (['create', 'update', 'delete'].includes(operation)) {
        // 清除脚本缓存
        await clearCache('custom-scripts-*');
      }
    }
  }
});

// ==================== 辅助函数 ====================

function validateScript(content: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  // 危险模式检查
  const dangerousPatterns = [
    { pattern: /eval\(/g, message: '❌ 不允许使用 eval()' },
    { pattern: /]*src=["'](?!https:\/\/)/gi, message: '❌ 外部脚本必须使用HTTPS' },
    { pattern: /document\.write/g, message: '❌ 不允许使用 document.write' },
    { pattern: /innerHTML\s*=/g, message: '⚠️ 慎用 innerHTML，建议使用 textContent' },
    { pattern: /onclick\s*=/gi, message: '❌ 不允许内联事件处理器（onclick等）' },
    { pattern: /onerror\s*=/gi, message: '❌ 不允许内联事件处理器（onerror等）' },
  ];
  
  for (const { pattern, message } of dangerousPatterns) {
    if (pattern.test(content)) {
      errors.push(message);
    }
  }
  
  // 白名单域名检查
  const allowedDomains = [
    'www.googletagmanager.com',
    'www.google-analytics.com',
    'connect.facebook.net',
    'analytics.tiktok.com',
    'cdn.jsdelivr.net',
    'unpkg.com',
  ];
  
  const scriptTagRegex = /]*src=["'](https:\/\/[^"']+)["']/gi;
  let match;
  
  while ((match = scriptTagRegex.exec(content)) !== null) {
    try {
      const url = new URL(match[1]);
      if (!allowedDomains.some(domain => url.hostname.includes(domain))) {
        errors.push(`⚠️ 域名 ${url.hostname} 不在白名单中，请确认安全性`);
      }
    } catch {
      errors.push('❌ 无效的脚本URL');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
```

**前端API调用示例**:
```typescript
// GET /api/scripts/global
const response = await fetch('/api/graphql', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: `
      query GetGlobalScripts {
        customScripts(
          where: { 
            enabled: { equals: true },
            type: { in: ["global_header", "global_footer"] }
          },
          orderBy: { priority: asc }
        ) {
          id
          type
          content
          priority
        }
      }
    `
  })
});
```

---

#### 前端集成方式

##### 1. 创建脚本获取函数

```typescript
// lib/custom-scripts.ts
import { fetchGraphQL } from './api';

export interface CustomScript {
  id: string;
  name: string;
  content: string;
  scriptPosition: 'header' | 'footer' | 'body_start';
  scope: 'global' | 'page_type' | 'exact_path' | 'path_pattern' | 'related_content';
  pageType?: string;
  exactPath?: string;
  pathPattern?: string;
  relatedProduct?: { sku: string };
  relatedBlog?: { slug: string };
  relatedApplication?: { id: string };
  relatedProductSeries?: { slug: string };
  priority: number;
  async: boolean;
  defer: boolean;
  enabled: boolean;
}

/**
 * 获取当前页面应该加载的脚本
 */
export async function getScriptsForPage(
  currentPath: string,
  pageContext?: {
    type?: string;
    productSku?: string;
    blogSlug?: string;
    applicationId?: string;
    seriesSlug?: string;
  }
): Promise {
  const { data } = await fetchGraphQL(`
    query GetCustomScripts {
      customScripts(
        where: { enabled: { equals: true } },
        orderBy: { priority: asc }
      ) {
        id
        name
        content
        scriptPosition
        scope
        pageType
        exactPath
        pathPattern
        relatedProduct { sku }
        relatedBlog { slug }
        relatedApplication { id }
        relatedProductSeries { slug }
        priority
        async
        defer
      }
    }
  `);
  
  const scripts: CustomScript[] = data.customScripts;
  
  // 过滤出适用于当前页面的脚本
  return scripts.filter(script => {
    switch (script.scope) {
      case 'global':
        return true; // 全局脚本在所有页面加载
      
      case 'page_type':
        return script.pageType === pageContext?.type;
      
      case 'exact_path':
        return currentPath === script.exactPath;
      
      case 'path_pattern':
        return matchPathPattern(currentPath, script.pathPattern);
      
      case 'related_content':
        return (
          (script.relatedProduct?.sku === pageContext?.productSku) ||
          (script.relatedBlog?.slug === pageContext?.blogSlug) ||
          (script.relatedApplication?.id === pageContext?.applicationId) ||
          (script.relatedProductSeries?.slug === pageContext?.seriesSlug)
        );
      
      default:
        return false;
    }
  });
}

/**
 * 路径通配符匹配
 */
function matchPathPattern(path: string, pattern: string): boolean {
  // 将通配符模式转换为正则表达式
  const regexPattern = pattern
    .replace(/\*/g, '.*')
    .replace(/\?/g, '.');
  
  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(path);
}

/**
 * 渲染脚本标签
 */
export function renderScriptTag(script: CustomScript): string {
  // 如果已经是完整的标签，直接返回
  if (script.content.trim().startsWith('<script')) {
    return script.content;
  }
  
  // 否则包裹成标签
  const attrs = [];
  if (script.async) attrs.push('async');
  if (script.defer) attrs.push('defer');
  
  return `\n${script.content}\n`;
}
```

---

##### 2. 在Next.js Layout中集成

```typescript
// app/layout.tsx
import { getScriptsForPage, renderScriptTag } from '@/lib/custom-scripts';

export default async function RootLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  // 获取全局脚本
  const globalScripts = await getScriptsForPage('/', { type: 'home' });
  
  const headerScripts = globalScripts
    .filter(s => s.scriptPosition === 'header')
    .map(renderScriptTag)
    .join('\n');
  
  const footerScripts = globalScripts
    .filter(s => s.scriptPosition === 'footer')
    .map(renderScriptTag)
    .join('\n');
  
  const bodyStartScripts = globalScripts
    .filter(s => s.scriptPosition === 'body_start')
    .map(renderScriptTag)
    .join('\n');
  
  return (
    
      
        {/* 其他head内容 */}
        <dangerouslySetInnerHTML={{ __html: headerScripts }} />
      
      
        <dangerouslySetInnerHTML={{ __html: bodyStartScripts }} />
        {children}
        <dangerouslySetInnerHTML={{ __html: footerScripts }} />
      
    
  );
}
```

---

##### 3. 在动态页面中集成

```typescript
// app/shop/[sku]/page.tsx
import { getScriptsForPage } from '@/lib/custom-scripts';

export default async function ProductDetailPage({ 
  params 
}: { 
  params: { sku: string } 
}) {
  const product = await getProduct(params.sku);
  
  // 获取适用于此页面的脚本
  const scripts = await getScriptsForPage(`/shop/${params.sku}`, {
    type: 'shop_detail',
    productSku: params.sku
  });
  
  const pageScripts = scripts
    .filter(s => s.scriptPosition === 'header')
    .map(renderScriptTag)
    .join('\n');
  
  return (
    <>
      {/* 页面特定的脚本 */}
      
        <dangerouslySetInnerHTML={{ __html: pageScripts }} />
      
      
      {/* 页面内容 */}
      
        {product.name}
        {/* ... */}
      
    </>
  );
}
```

---

##### 4. 博客详情页示例

```typescript
// app/about-us/blog/[slug]/page.tsx
export default async function BlogDetailPage({ 
  params 
}: { 
  params: { slug: string } 
}) {
  const blog = await getBlog(params.slug);
  
  const scripts = await getScriptsForPage(`/about-us/blog/${params.slug}`, {
    type: 'blog_detail',
    blogSlug: params.slug
  });
  
  // 渲染脚本...
}
```

---

#### 使用场景示例

##### 场景1: 全局Google Analytics

```
名称: Google Analytics
应用范围: 全局
脚本位置: Header
内容:
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

---

##### 场景2: 产品详情页TikTok Pixel

```
名称: TikTok Pixel - 产品详情页
应用范围: 页面类型
页面类型: 商店产品详情页 (/shop/[sku])
脚本位置: Header
内容:
<script>
  !function (w, d, t) {
    w.TiktokAnalyticsObject=t;
    var ttq=w[t]=w[t]||[];
    ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];
    // ... TikTok Pixel代码
  }(window, document, 'ttq');
  
  ttq.track('ViewContent', {
    content_type: 'product',
    content_id: '{{product.sku}}' // 后端动态替换
  });
</script>
```

---

##### 场景3: 特定产品的跟踪代码

```
名称: Glass Standoff系列特殊跟踪
应用范围: 关联内容
关联产品系列: Glass Standoff
脚本位置: Footer
内容:
<script>
  console.log('User viewing Glass Standoff series');
  // 自定义埋点逻辑
</script>
```

---

##### 场景4: 博客文章的社交分享追踪

```
名称: 博客社交分享追踪
应用范围: 页面类型
页面类型: 博客详情页 (/about-us/blog/[slug])
脚本位置: Footer
内容:
<script>
  document.querySelectorAll('.share-button').forEach(btn => {
    btn.addEventListener('click', (e) => {
      gtag('event', 'share', {
        'event_category': 'blog',
        'event_label': window.location.pathname
      });
    });
  });
</script>
```

---

##### 场景5: FAQ页面的Hotjar录屏

```
名称: Hotjar - FAQ页面
应用范围: 精确路径
精确路径: /service/faq
脚本位置: Header
内容:
<script>
  (function(h,o,t,j,a,r){
    h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
    h._hjSettings={hjid:XXXXXX,hjsv:6};
    // ... Hotjar代码
  })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
</script>
```

---

##### 场景6: 所有博客文章的Disqus评论

```
名称: Disqus评论系统
应用范围: 路径规则
路径规则: /about-us/blog/*
脚本位置: Footer
延迟加载: ✅ 启用
内容:
<script>
  var disqus_config = function () {
    this.page.url = window.location.href;
    this.page.identifier = window.location.pathname;
  };
  
  (function() {
    var d = document, s = d.createElement('script');
    s.src = 'https://busrom.disqus.com/embed.js';
    s.setAttribute('data-timestamp', +new Date());
    (d.head || d.body).appendChild(s);
  })();
</script>
```

---

#### 后台管理界面优化

##### 智能表单联动

```typescript
// admin/pages/custom-script-form.tsx
export function CustomScriptForm() {
  const [scope, setScope] = useState('global');
  
  return (
    
      <select value={scope} onChange={e => setScope(e.target.value)}>
        全局
        页面类型
        精确路径
        路径规则
        关联内容
      
      
      {/* 根据scope显示不同的字段 */}
      {scope === 'page_type' && (
        
          首页
          商店产品详情页
          {/* ... */}
        
      )}
      
      {scope === 'exact_path' && (
        
      )}
      
      {scope === 'path_pattern' && (
        
      )}
      
      {scope === 'related_content' && (
        <>
          
          
          
        </>
      )}
    
  );
}
```

---

### 3. SeoSetting (SEO设置)

**用途**: 全局SEO配置 + 单页SEO设置

**Keystone Schema**:
```typescript
export const SeoSetting = list({
  access: {
    operation: {
      query: () => true, // 前端需要读取
      create: ({ session }) => session?.data?.role === 'admin',
      update: ({ session }) => session?.data?.role === 'admin',
      delete: ({ session }) => session?.data?.role === 'admin',
    }
  },
  
  fields: {
    // 标识（用于区分全局或单页设置）
    identifier: text({
      validation: { isRequired: true },
      db: { isNullable: false, isUnique: true },
      label: '标识符',
      ui: {
        description: '全局设置使用 "global"，单页使用页面slug如 "home", "about-us"'
      }
    }),
    
    // 基础SEO字段
    title: text({
      validation: { 
        isRequired: true,
        length: { max: 60 }
      },
      label: 'SEO标题',
      ui: {
        description: '建议50-60个字符，会显示在搜索结果和浏览器标签'
      }
    }),
    
    description: text({
      validation: { 
        isRequired: true,
        length: { max: 160 }
      },
      ui: { displayMode: 'textarea' },
      label: 'SEO描述',
      ui: {
        description: '建议120-160个字符，会显示在搜索结果摘要'
      }
    }),
    
    keywords: text({
      label: 'SEO关键词',
      ui: {
        description: '多个关键词用逗号分隔，如: glass standoff, architectural hardware'
      }
    }),
    
    // Open Graph (社交分享)
    ogTitle: text({
      label: 'OG标题',
      ui: {
        description: '社交分享标题，为空则使用SEO标题'
      }
    }),
    
    ogDescription: text({
      ui: { displayMode: 'textarea' },
      label: 'OG描述',
    }),
    
    ogImage: relationship({
      ref: 'Media',
      label: 'OG分享图片',
      ui: {
        displayMode: 'cards',
        cardFields: ['url', 'altText'],
        inlineCreate: { fields: ['url', 'altText'] },
      }
    }),
    
    // 结构化数据
    schemaType: select({
      type: 'string',
      options: [
        { label: 'Organization (组织)', value: 'Organization' },
        { label: 'Product (产品)', value: 'Product' },
        { label: 'Article (文章)', value: 'Article' },
        { label: 'WebPage (网页)', value: 'WebPage' },
        { label: 'FAQPage (FAQ页面)', value: 'FAQPage' },
      ],
      label: 'Schema.org类型',
    }),
    
    schemaData: text({
      ui: { displayMode: 'textarea' },
      label: '结构化数据(JSON-LD)',
      ui: {
        description: '自定义JSON-LD格式的结构化数据'
      }
    }),
    
    // 多语言支持（预留）
    hreflangLinks: text({
      ui: { displayMode: 'textarea' },
      label: 'Hreflang链接',
      ui: {
        description: 'JSON格式，如: [{"lang": "en", "url": "/en/"}, {"lang": "zh", "url": "/zh/"}]'
      }
    }),
    
    // Robots控制
    robotsIndex: checkbox({
      defaultValue: true,
      label: '允许搜索引擎索引',
    }),
    
    robotsFollow: checkbox({
      defaultValue: true,
      label: '允许跟踪链接',
    }),
    
    // 规范链接
    canonicalUrl: text({
      label: '规范URL',
      ui: {
        description: '指定页面的规范版本，用于去重'
      }
    }),
    
    updatedAt: timestamp({
      db: { updatedAt: true },
    }),
  },
  
  ui: {
    listView: {
      initialColumns: ['identifier', 'title', 'robotsIndex', 'updatedAt'],
    },
    labelField: 'identifier',
  },
});
```

**前端API调用示例**:
```typescript
// app/product/[slug]/page.tsx
export async function generateMetadata({ params }) {
  const seoData = await fetch('/api/graphql', {
    method: 'POST',
    body: JSON.stringify({
      query: `
        query GetSeoSetting($identifier: String!) {
          seoSetting(where: { identifier: $identifier }) {
            title
            description
            keywords
            ogTitle
            ogDescription
            ogImage { url }
            schemaData
            canonicalUrl
          }
        }
      `,
      variables: { identifier: `product-${params.slug}` }
    })
  });
  
  return {
    title: seoData.title,
    description: seoData.description,
    keywords: seoData.keywords?.split(','),
    openGraph: {
      title: seoData.ogTitle || seoData.title,
      description: seoData.ogDescription || seoData.description,
      images: [seoData.ogImage?.url],
    },
    alternates: {
      canonical: seoData.canonicalUrl
    }
  };
}
```

---

### 4. SiteConfig (站点全局配置)

**用途**: 存储网站通用设置（公司信息、联系方式、LOGO、API密钥等）

**Keystone Schema**:
```typescript
export const SiteConfig = list({
  access: {
    operation: {
      query: () => true, // 前端需要读取
      create: ({ session }) => session?.data?.role === 'admin',
      update: ({ session }) => session?.data?.role === 'admin',
      delete: () => false, // 禁止删除
    }
  },
  
  // 单例模式：只允许存在一条配置记录
  isSingleton: true,
  
  fields: {
    // 公司基本信息
    siteName: text({
      validation: { isRequired: true },
      label: '网站名称',
      defaultValue: 'Busrom'
    }),
    
    companyName: text({
      validation: { isRequired: true },
      label: '公司全称',
      defaultValue: 'Busrom Hardware Co., Ltd.'
    }),
    
    logo: relationship({
      ref: 'Media',
      label: '网站LOGO',
    }),
    
    favicon: relationship({
      ref: 'Media',
      label: '网站图标(Favicon)',
    }),
    
    // 联系信息
    email: text({
      validation: { 
        match: { regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ }
      },
      label: '联系邮箱',
    }),
    
    phone: text({
      label: '联系电话',
    }),
    
    whatsapp: text({
      label: 'WhatsApp号码',
    }),
    
    wechat: text({
      label: '微信号',
    }),
    
    address: text({
      ui: { displayMode: 'textarea' },
      label: '公司地址',
    }),
    
    // 社交媒体链接
    facebookUrl: text({ label: 'Facebook链接' }),
    instagramUrl: text({ label: 'Instagram链接' }),
    linkedinUrl: text({ label: 'LinkedIn链接' }),
    youtubeUrl: text({ label: 'YouTube链接' }),
    twitterUrl: text({ label: 'Twitter链接' }),
    
    // 第三方服务API密钥
    googleAnalyticsId: text({
      label: 'Google Analytics ID',
      ui: {
        description: '如: G-XXXXXXXXXX'
      }
    }),
    
    googleSearchConsoleKey: text({
      label: 'Google Search Console验证码',
    }),
    
    tiktokPixelId: text({
      label: 'TikTok Pixel ID',
    }),
    
    // 邮件服务配置
    smtpHost: text({ label: 'SMTP服务器' }),
    smtpPort: text({ label: 'SMTP端口' }),
    smtpUser: text({ label: 'SMTP用户名' }),
    smtpPassword: text({ 
      label: 'SMTP密码',
      ui: { displayMode: 'password' }
    }),
    
    emailFromAddress: text({
      label: '发件人邮箱',
      defaultValue: 'noreply@busrom.com'
    }),
    
    emailFromName: text({
      label: '发件人名称',
      defaultValue: 'Busrom Team'
    }),
    
    // 表单通知配置
    formNotificationEmails: text({
      label: '表单通知邮箱',
      ui: {
        description: '多个邮箱用逗号分隔'
      }
    }),
    
    enableAutoReply: checkbox({
      defaultValue: false,
      label: '启用表单自动回复',
    }),
    
    autoReplyTemplate: text({
      ui: { displayMode: 'textarea' },
      label: '自动回复邮件模板',
      defaultValue: `Dear {name},

Thank you for contacting Busrom. We have received your message and will get back to you within 24 hours.

Best regards,
Busrom Team`
    }),
    
    // 站点功能开关
    maintenanceMode: checkbox({
      defaultValue: false,
      label: '维护模式',
      ui: {
        description: '开启后网站显示维护页面'
      }
    }),
    
    enableCaptcha: checkbox({
      defaultValue: true,
      label: '启用验证码',
    }),
    
    recaptchaSiteKey: text({
      label: 'reCAPTCHA站点密钥',
    }),
    
    recaptchaSecretKey: text({
      label: 'reCAPTCHA密钥',
      ui: { displayMode: 'password' }
    }),
    
    // SEO配置
    defaultLanguage: select({
      type: 'string',
      options: [
        { label: 'English', value: 'en' },
        { label: '简体中文', value: 'zh-CN' },
        { label: 'Español', value: 'es' },
      ],
      defaultValue: 'en',
      label: '默认语言',
    }),
    
    enableIndexNow: checkbox({
      defaultValue: true,
      label: '启用IndexNow协议',
    }),
    
    indexNowKey: text({
      label: 'IndexNow API密钥',
    }),
    
    updatedAt: timestamp({
      db: { updatedAt: true },
    }),
  },
  
  ui: {
    labelField: 'siteName',
  },
});
```

**前端API调用示例**:
```typescript
// 获取站点配置（用于Header/Footer）
const siteConfig = await fetch('/api/graphql', {
  method: 'POST',
  body: JSON.stringify({
    query: `
      query GetSiteConfig {
        siteConfig {
          siteName
          companyName
          logo { url altText }
          email
          phone
          whatsapp
          facebookUrl
          linkedinUrl
          googleAnalyticsId
        }
      }
    `
  })
});
```

---

### 5. NavigationMenu (导航菜单管理)

**用途**: 可视化配置网站头部/底部导航菜单

**Keystone Schema**:
```typescript
export const NavigationMenu = list({
  access: {
    operation: {
      query: () => true,
      create: ({ session }) => !!session,
      update: ({ session }) => !!session,
      delete: ({ session }) => session?.data?.role === 'admin',
    }
  },
  
  fields: {
    label: text({
      validation: { isRequired: true },
      label: '菜单名称',
    }),
    
    url: text({
      label: '链接地址',
      ui: {
        description: '如: /product, /about-us, https://external.com'
      }
    }),
    
    position: select({
      type: 'string',
      options: [
        { label: '头部导航', value: 'header' },
        { label: '底部导航', value: 'footer' },
        { label: '移动端菜单', value: 'mobile' },
      ],
      validation: { isRequired: true },
      label: '菜单位置',
    }),
    
    parentMenu: relationship({
      ref: 'NavigationMenu.childMenus',
      label: '父级菜单',
      ui: {
        description: '设置后将成为二级菜单'
      }
    }),
    
    childMenus: relationship({
      ref: 'NavigationMenu.parentMenu',
      many: true,
      label: '子菜单',
    }),
    
    order: select({
      type: 'integer',
      options: Array.from({ length: 20 }, (_, i) => ({
        label: `${i + 1}`,
        value: i + 1
      })),
      defaultValue: 1,
      label: '排序',
    }),
    
    icon: text({
      label: '图标名称',
      ui: {
        description: '使用Lucide图标名称，如: Home, ShoppingCart'
      }
    }),
    
    openInNewTab: checkbox({
      defaultValue: false,
      label: '在新标签页打开',
    }),
    
    enabled: checkbox({
      defaultValue: true,
      label: '是否显示',
    }),
    
    // 权限控制（预留）
    requireAuth: checkbox({
      defaultValue: false,
      label: '需要登录',
    }),
  },
  
  ui: {
    listView: {
      initialColumns: ['label', 'position', 'order', 'enabled'],
      initialSort: { field: 'order', direction: 'ASC' },
    },
    labelField: 'label',
  },
});
```

**前端API调用示例**:
```typescript
// components/Header.tsx
const { data } = await fetch('/api/graphql', {
  method: 'POST',
  body: JSON.stringify({
    query: `
      query GetHeaderMenu {
        navigationMenus(
          where: { 
            position: { equals: "header" },
            enabled: { equals: true },
            parentMenu: { equals: null }
          },
          orderBy: { order: asc }
        ) {
          id
          label
          url
          icon
          openInNewTab
          childMenus(orderBy: { order: asc }) {
            id
            label
            url
            icon
          }
        }
      }
    `
  })
});
```

---

### 6. HomeContent (首页内容配置)

**用途**: 存储首页各个动态区块的配置数据（Hero Banner、服务特点、品牌价值等）

**Keystone Schema**:
```typescript
export const HomeContent = list({
  access: {
    operation: {
      query: () => true,
      create: ({ session }) => !!session,
      update: ({ session }) => !!session,
      delete: ({ session }) => session?.data?.role === 'admin',
    }
  },
  
  fields: {
    section: select({
      type: 'string',
      options: [
        { label: 'Hero Banner', value: 'hero_banner' },
        { label: '服务特点', value: 'service_features' },
        { label: '品牌优势', value: 'brand_advantages' },
        { label: 'OEM/ODM', value: 'oem_odm' },
        { label: '获取报价五步曲', value: 'quote_steps' },
        { label: '品牌分析', value: 'brand_analysis' },
        { label: '品牌价值', value: 'brand_value' },
        { label: '简单CTA', value: 'simple_cta' },
      ],
      validation: { isRequired: true },
      db: { isUnique: true },
      label: '区块类型',
    }),
    
    enabled: checkbox({
      defaultValue: true,
      label: '是否显示',
    }),
    
    order: select({
      type: 'integer',
      options: Array.from({ length: 20 }, (_, i) => ({
        label: `${i + 1}`,
        value: i + 1
      })),
      defaultValue: 1,
      label: '排序',
    }),
    
    // JSON格式存储区块数据
    content: text({
      ui: { displayMode: 'textarea' },
      label: '区块内容(JSON)',
      ui: {
        description: '存储该区块的所有配置数据，格式见文档'
      }
    }),
    
    updatedAt: timestamp({
      db: { updatedAt: true },
    }),
  },
  
  ui: {
    listView: {
      initialColumns: ['section', 'enabled', 'order', 'updatedAt'],
      initialSort: { field: 'order', direction: 'ASC' },
    },
    labelField: 'section',
  },
});
```

**数据示例**:

**Hero Banner内容格式**:
```json
{
  "slides": [
    {
      "image": "/uploads/hero-1.jpg",
      "features": [
        "Premium Glass Hardware",
        "Custom Manufacturing",
        "Global Shipping",
        "ISO Certified",
        "24/7 Support"
      ],
      "link": "/product/glass-standoff"
    },
    {
      "image": "/uploads/hero-2.jpg",
      "features": ["..."]
    }
  ]
}
```

**服务特点内容格式**:
```json
{
  "title": "Why Choose Busrom",
  "subtitle": "Your Trusted Partner",
  "features": [
    {
      "title": "Custom Manufacturing",
      "shortTitle": "Custom",
      "description": "Tailored solutions for your unique needs",
      "image": "/uploads/feature-1.jpg"
    },
    {
      "title": "Quality Assurance",
      "shortTitle": "Quality",
      "description": "ISO 9001 certified production",
      "image": "/uploads/feature-2.jpg"
    }
  ]
}
```

**前端API调用示例**:
```typescript
// app/page.tsx (首页)
const homeData = await fetch('/api/graphql', {
  method: 'POST',
  body: JSON.stringify({
    query: `
      query GetHomeContent {
        homeContents(
          where: { enabled: { equals: true } },
          orderBy: { order: asc }
        ) {
          section
          content
        }
      }
    `
  })
});

// 解析并使用
const heroBanner = JSON.parse(
  homeData.homeContents.find(c => c.section === 'hero_banner')?.content
);
```

---

### 7. User (管理员用户)

**Keystone默认提供，需自定义字段**:
```typescript
export const User = list({
  access: {
    operation: {
      query: ({ session }) => !!session,
      create: ({ session }) => session?.data?.role === 'admin',
      update: ({ session, item }) => 
        session?.data?.id === item.id || session?.data?.role === 'admin',
      delete: ({ session }) => session?.data?.role === 'admin',
    }
  },
  
  fields: {
    name: text({
      validation: { isRequired: true },
      label: '姓名',
    }),
    
    email: text({
      validation: { 
        isRequired: true,
        match: { regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ }
      },
      isIndexed: 'unique',
      label: '邮箱',
    }),
    
    password: password({
      validation: { isRequired: true },
      label: '密码',
    }),
    
    role: select({
      type: 'string',
      options: [
        { label: '超级管理员', value: 'admin' },
        { label: '内容编辑', value: 'editor' },
        { label: '内容审核', value: 'reviewer' },
        { label: '客服', value: 'support' },
      ],
      defaultValue: 'editor',
      label: '角色',
    }),
    
    avatar: relationship({
      ref: 'Media',
      label: '头像',
    }),
    
    twoFactorEnabled: checkbox({
      defaultValue: false,
      label: '启用双因素认证',
    }),
    
    lastLoginAt: timestamp({
      label: '最后登录时间',
    }),
    
    createdAt: timestamp({
      defaultValue: { kind: 'now' },
    }),
  },
  
  ui: {
    listView: {
      initialColumns: ['name', 'email', 'role', 'lastLoginAt'],
    },
    labelField: 'name',
  },
});
```

---

### 8. ActivityLog (操作日志)

**用途**: 审计所有后台操作，包括内容修改、删除、登录等

**Keystone Schema**:
```typescript
export const ActivityLog = list({
  access: {
    operation: {
      query: ({ session }) => session?.data?.role === 'admin',
      create: () => true, // 系统自动创建
      update: () => false, // 禁止修改
      delete: ({ session }) => session?.data?.role === 'admin',
    }
  },
  
  fields: {
    user: relationship({
      ref: 'User',
      label: '操作用户',
    }),
    
    action: select({
      type: 'string',
      options: [
        { label: '创建', value: 'create' },
        { label: '更新', value: 'update' },
        { label: '删除', value: 'delete' },
        { label: '登录', value: 'login' },
        { label: '登出', value: 'logout' },
      ],
      validation: { isRequired: true },
      label: '操作类型',
    }),
    
    entity: text({
      label: '实体类型',
      ui: {
        description: '如: Product, Blog, ContactForm'
      }
    }),
    
    entityId: text({
      label: '实体ID',
    }),
    
    changes: text({
      ui: { displayMode: 'textarea' },
      label: '修改内容(JSON)',
    }),
    
    ipAddress: text({
      label: 'IP地址',
    }),
    
    userAgent: text({
      label: '浏览器信息',
    }),
    
    timestamp: timestamp({
      defaultValue: { kind: 'now' },
      label: '操作时间',
    }),
  },
  
  ui: {
    listView: {
      initialColumns: ['user', 'action', 'entity', 'timestamp'],
      initialSort: { field: 'timestamp', direction: 'DESC' },
      pageSize: 100,
    },
    labelField: 'action',
  },
  
  // 禁止在UI中创建
  ui: {
    createView: {
      defaultFieldMode: 'hidden',
    },
  },
});
```

---

## 🔌 完整API接口规范

### 通用接口规范

**基础URL**: `https://api.busrom.com/api/graphql`

**认证方式**: 
- 公开接口：无需认证
- 管理接口：需要JWT Token（通过Keystone Session）

**响应格式**:
```json
{
  "data": { ... },
  "errors": [ ... ]
}
```

---

### 1. 首页数据接口

**Endpoint**: `POST /api/graphql`

**Query**:
```graphql
query GetHomeData {
  # Hero Banner
  homeContent(where: { section: "hero_banner" }) {
    content
    enabled
  }
  
  # 产品系列轮播
  productSeries(
    where: { featured: { equals: true } },
    orderBy: { order: asc },
    take: 8
  ) {
    id
    slug
    name
    description
    coverImage {
      url
      altText
      width
      height
    }
  }
  
  # 精选产品
  products(
    where: { featured: { equals: true } },
    take: 12
  ) {
    id
    sku
    name
    images(take: 1) {
      url
      altText
    }
    series {
      name
    }
    specifications
  }
  
  # 精选案例
  applications(
    where: { featured: { equals: true } },
    take: 6
  ) {
    id
    slug
    name
    mainImage {
      url
      altText
    }
    summary
  }
  
  # 服务特点
  homeContent(where: { section: "service_features" }) {
    content
  }
  
  # 品牌优势
  homeContent(where: { section: "brand_advantages" }) {
    content
  }
}
```

**响应示例**:
```json
{
  "data": {
    "homeContent": {
      "content": "{\"title\":\"Why Choose Busrom\",...}",
      "enabled": true
    },
    "productSeries": [
      {
        "id": "clxxx",
        "slug": "glass-standoff",
        "name": "Glass Standoff",
        "description": "Premium stainless steel glass standoffs",
        "coverImage": {
          "url": "https://cdn.busrom.com/uploads/glass-standoff.jpg",
          "altText": "Glass Standoff Series",
          "width": 1200,
          "height": 800
        }
      }
    ],
    "products": [...],
    "applications": [...]
  }
}
```

---

### 2. 产品系列接口

**2.1 获取所有产品系列**

**Query**:
```graphql
query GetProductSeries($skip: Int, $take: Int) {
  productSeries(
    skip: $skip,
    take: $take,
    orderBy: { order: asc }
  ) {
    id
    slug
    name
    description
    coverImage {
      url
      altText
    }
    productCount
  }
  
  productSeriesCount
}
```

**2.2 获取单个产品系列详情**

**Query**:
```graphql
query GetProductSeriesDetail($slug: String!) {
  productSeries(where: { slug: $slug }) {
    id
    name
    description
    detailedDescription
    coverImage {
      url
      altText
    }
    gallery {
      url
      altText
    }
    features
    applications
    specifications
    
    # 关联产品
    products(orderBy: { order: asc }) {
      id
      sku
      name
      images(take: 1) {
        url
        altText
      }
      specifications
    }
    
    # SEO
    seoSetting {
      title
      description
      keywords
      ogImage { url }
    }
  }
}
```

---

### 3. 产品（SKU）接口

**3.1 获取产品列表（支持筛选）**

**Query**:
```graphql
query GetProducts(
  $skip: Int,
  $take: Int,
  $category: ID,
  $series: ID,
  $search: String
) {
  products(
    skip: $skip,
    take: $take,
    where: {
      AND: [
        { category: { id: { equals: $category } } },
        { series: { id: { equals: $series } } },
        {
          OR: [
            { name: { contains: $search, mode: insensitive } },
            { sku: { contains: $search, mode: insensitive } }
          ]
        }
      ]
    },
    orderBy: { order: asc }
  ) {
    id
    sku
    name
    images(take: 1) {
      url
      altText
    }
    category {
      name
    }
    series {
      name
    }
    specifications
    featured
  }
  
  productsCount(where: { ... })
}
```

**3.2 获取产品详情**

**Query**:
```graphql
query GetProductDetail($sku: String!) {
  product(where: { sku: $sku }) {
    id
    sku
    name
    description
    detailedDescription
    
    images {
      url
      altText
      width
      height
    }
    
    category {
      id
      name
      slug
    }
    
    series {
      id
      name
      slug
    }
    
    specifications
    features
    dimensions
    materials
    finishes
    
    # 关联案例
    relatedApplications {
      id
      slug
      name
      mainImage {
        url
        altText
      }
    }
    
    # 推荐产品
    relatedProducts(take: 4) {
      id
      sku
      name
      images(take: 1) {
        url
      }
    }
    
    # SEO
    seoSetting {
      title
      description
      keywords
      schemaData
    }
  }
}
```

---

### 4. 博客接口

**4.1 获取博客列表**

**Query**:
```graphql
query GetBlogs(
  $skip: Int,
  $take: Int,
  $category: ID,
  $tag: String
) {
  blogs(
    skip: $skip,
    take: $take,
    where: {
      status: { equals: "published" },
      category: { id: { equals: $category } },
      tags: { some: { name: { equals: $tag } } }
    },
    orderBy: { publishedAt: desc }
  ) {
    id
    slug
    title
    summary
    coverImage {
      url
      altText
    }
    author {
      name
      avatar { url }
    }
    publishedAt
    category {
      name
      slug
    }
    tags {
      name
    }
    readTime
  }
  
  blogsCount(where: { status: { equals: "published" } })
}
```

**4.2 获取博客详情**

**Query**:
```graphql
query GetBlogDetail($slug: String!) {
  blog(where: { slug: $slug }) {
    id
    slug
    title
    summary
    content
    coverImage {
      url
      altText
    }
    author {
      name
      avatar { url }
      bio
    }
    publishedAt
    updatedAt
    category {
      name
      slug
    }
    tags {
      name
    }
    readTime
    
    # SEO
    seoSetting {
      title
      description
      keywords
      ogImage { url }
      schemaData
    }
    
    # 相关文章
    relatedBlogs(take: 3) {
      id
      slug
      title
      coverImage { url }
      publishedAt
    }
  }
}
```

---

### 5. 应用案例接口

**5.1 获取案例列表**

**Query**:
```graphql
query GetApplications($skip: Int, $take: Int) {
  applications(
    skip: $skip,
    take: $take,
    where: { status: { equals: "published" } },
    orderBy: { publishedAt: desc }
  ) {
    id
    slug
    name
    summary
    mainImage {
      url
      altText
    }
    client
    industry
    publishedAt
  }
  
  applicationsCount(where: { status: { equals: "published" } })
}
```

**5.2 获取案例详情**

**Query**:
```graphql
query GetApplicationDetail($slug: String!) {
  application(where: { slug: $slug }) {
    id
    slug
    name
    summary
    
    # 案例主图
    mainImage {
      url
      altText
      width
      height
    }
    
    # 案例图库
    gallery {
      url
      altText
    }
    
    # 案例详情（支持动态字段）
    client
    industry
    projectDate
    location
    
    # 可选字段
    background
    challenge
    solution
    result
    testimonial
    
    # 使用的产品
    productsUsed {
      id
      sku
      name
      images(take: 1) {
        url
      }
    }
    
    publishedAt
    
    # SEO
    seoSetting {
      title
      description
      schemaData
    }
  }
}
```

---

### 6. FAQ接口

**Query**:
```graphql
query GetFaqs {
  faqItems(
    where: { published: { equals: true } },
    orderBy: { order: asc }
  ) {
    id
    category {
      name
    }
    question
    answer
    order
  }
  
  # 按分类分组
  categories {
    name
    faqs(where: { published: { equals: true } }) {
      id
      question
      answer
    }
  }
}
```

---

### 7. 表单提交接口

**7.1 提交联系表单**

**Mutation**:
```graphql
mutation SubmitContactForm($data: ContactFormCreateInput!) {
  createContactForm(data: $data) {
    id
    name
    email
    submittedAt
  }
}
```

**Variables**:
```json
{
  "data": {
    "name": "张三",
    "email": "zhang@example.com",
    "whatsapp": "+86 138 0000 0000",
    "companyName": "ABC公司",
    "message": "我想了解Glass Standoff产品的定制服务",
    "relatedProduct": {
      "connect": { "id": "clxxx" }
    },
    "ipAddress": "192.168.1.1",
    "userAgent": "Mozilla/5.0..."
  }
}
```

**前端调用示例**:
```typescript
// components/ContactForm.tsx
const handleSubmit = async (formData) => {
  try {
    const response = await fetch('/api/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          mutation SubmitContactForm($data: ContactFormCreateInput!) {
            createContactForm(data: $data) {
              id
              name
              submittedAt
            }
          }
        `,
        variables: {
          data: {
            name: formData.name,
            email: formData.email,
            whatsapp: formData.whatsapp,
            companyName: formData.companyName,
            message: formData.message,
            ipAddress: await getClientIP(),
            userAgent: navigator.userAgent
          }
        }
      })
    });
    
    const result = await response.json();
    
    if (result.data?.createContactForm) {
      toast.success('感谢您的留言，我们会尽快回复！');
    }
  } catch (error) {
    toast.error('提交失败，请稍后重试');
  }
};
```

**7.2 后台查询表单**

**Query**:
```graphql
query GetContactForms(
  $skip: Int,
  $take: Int,
  $status: String
) {
  contactForms(
    skip: $skip,
    take: $take,
    where: { status: { equals: $status } },
    orderBy: { submittedAt: desc }
  ) {
    id
    name
    email
    whatsapp
    companyName
    message
    relatedProduct {
      sku
      name
    }
    submittedAt
    status
    ipAddress
    emailSent
  }
  
  contactFormsCount(where: { status: { equals: $status } })
}
```

---

### 8. 站点配置接口

**Query**:
```graphql
query GetSiteConfig {
  siteConfig {
    siteName
    companyName
    logo {
      url
      altText
    }
    favicon {
      url
    }
    email
    phone
    whatsapp
    address
    facebookUrl
    linkedinUrl
    instagramUrl
    googleAnalyticsId
    enableCaptcha
    recaptchaSiteKey
  }
}
```

---

### 9. 导航菜单接口

**Query**:
```graphql
query GetNavigation($position: String!) {
  navigationMenus(
    where: {
      position: { equals: $position },
      enabled: { equals: true },
      parentMenu: { equals: null }
    },
    orderBy: { order: asc }
  ) {
    id
    label
    url
    icon
    openInNewTab
    childMenus(orderBy: { order: asc }) {
      id
      label
      url
      icon
    }
  }
}
```

---

### 10. SEO相关接口

**10.1 获取Sitemap数据**

**Query**:
```graphql
query GetSitemapData {
  # 所有产品系列
  productSeries(where: { status: { equals: "published" } }) {
    slug
    updatedAt
  }
  
  # 所有产品
  products(where: { status: { equals: "published" } }) {
    sku
    updatedAt
  }
  
  # 所有博客
  blogs(where: { status: { equals: "published" } }) {
    slug
    updatedAt
  }
  
  # 所有案例
  applications(where: { status: { equals: "published" } }) {
    slug
    updatedAt
  }
}
```

**后端实现**:
```typescript
// app/sitemap.xml/route.ts
export async function GET() {
  const data = await fetchSitemapData();
  
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${data.productSeries.map(s => `
    <url>
      <loc>https://busrom.com/product/${s.slug}</loc>
      <lastmod>${s.updatedAt}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.8</priority>
    </url>
  `).join('')}
  
  ${data.products.map(p => `
    <url>
      <loc>https://busrom.com/shop/${p.sku}</loc>
      <lastmod>${p.updatedAt}</lastmod>
      <changefreq>monthly</changefreq>
      <priority>0.6</priority>
    </url>
  `).join('')}
  
  ${data.blogs.map(b => `
    <url>
      <loc>https://busrom.com/blog/${b.slug}</loc>
      <lastmod>${b.updatedAt}</lastmod>
      <changefreq>monthly</changefreq>
      <priority>0.7</priority>
    </url>
  `).join('')}
</urlset>`;
  
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400', // 缓存24小时
    }
  });
}
```

**10.2 IndexNow推送接口**

**实现逻辑**:
```typescript
// lib/indexnow.ts
export async function submitToIndexNow(urls: string[]) {
  const siteConfig = await getSiteConfig();
  
  if (!siteConfig.enableIndexNow || !siteConfig.indexNowKey) {
    return;
  }
  
  // 提交到Bing IndexNow
  await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      host: 'busrom.com',
      key: siteConfig.indexNowKey,
      keyLocation: `https://busrom.com/${siteConfig.indexNowKey}.txt`,
      urlList: urls
    })
  });
}

// Keystone Hook中调用
export const Product = list({
  hooks: {
    afterOperation: async ({ operation, item }) => {
      if (operation === 'create' || operation === 'update') {
        await submitToIndexNow([
          `https://busrom.com/shop/${item.sku}`
        ]);
      }
    }
  }
});
```

---

## 🎨 CMS后台功能详细说明

### 1. 内容管理模块

**1.1 富文本编辑器配置**

Keystone 6使用的是 `document` 字段类型，支持富文本编辑：

```typescript
import { document } from '@keystone-6/fields-document';

export const Blog = list({
  fields: {
    content: document({
      formatting: true, // 加粗、斜体、下划线
      dividers: true, // 分隔线
      links: true, // 链接
      layouts: [
        [1, 1], // 两列布局
        [1, 1, 1], // 三列布局
      ],
      ui: {
        views: './custom-document-views', // 自定义组件
      }
    }),
  }
});
```

**自定义组件**（如图片、视频插入）:
```typescript
// custom-document-views/image-block.tsx
export const ImageBlock = {
  label: 'Image',
  schema: {
    media: relationship({ ref: 'Media' }),
    caption: text(),
  },
  Component: ({ media, caption }) => (
    <figure>
      <img src={media.url} alt={media.altText} />
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  ),
};
```

---

**1.2 多图上传功能**

使用 `relationship` + `many: true` 实现：

```typescript
export const Product = list({
  fields: {
    images: relationship({
      ref: 'Media',
      many: true,
      ui: {
        displayMode: 'cards',
        cardFields: ['url', 'altText'],
        inlineCreate: { fields: ['file', 'altText'] },
        inlineEdit: { fields: ['altText'] },
        linkToItem: true,
        inlineConnect: true,
      }
    }),
  }
});
```

**自定义上传处理**（S3集成）:
```typescript
// keystone.ts
import { S3Client } from '@aws-sdk/client-s3';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';

export default config({
  storage: {
    my_s3_files: {
      kind: 's3',
      type: 'file',
      bucketName: process.env.S3_BUCKET_NAME,
      region: process.env.S3_REGION,
      accessKeyId: process.env.S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
      signed: { expiry: 5000 },
    },
    my_s3_images: {
      kind: 's3',
      type: 'image',
      bucketName: process.env.S3_BUCKET_NAME,
      region: process.env.S3_REGION,
      accessKeyId: process.env.S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
      signed: { expiry: 5000 },
      // 自动生成缩略图
      generateUrl: (filename) => `https://cdn.busrom.com/${filename}`,
    }
  },
  
  lists: {
    Media: list({
      fields: {
        file: image({ 
          storage: 'my_s3_images',
        }),
        // ... 其他字段
      },
      hooks: {
        // 上传后生成多尺寸版本
        afterOperation: async ({ operation, item }) => {
          if (operation === 'create') {
            await generateImageVariants(item.file.url);
          }
        }
      }
    })
  }
});
```

---

### 2. 媒体管理模块

**2.1 媒体库界面优化**

```typescript
export const Media = list({
  ui: {
    listView: {
      initialColumns: ['file', 'altText', 'category', 'createdAt'],
      initialSort: { field: 'createdAt', direction: 'DESC' },
      pageSize: 50,
    },
    // 自定义缩略图视图
    itemView: {
      defaultFieldMode: 'edit',
    }
  },
  
  fields: {
    file: image({
      storage: 'my_s3_images',
    }),
    
    altText: text({
      validation: { isRequired: true },
      label: 'Alt文本 (SEO)',
    }),
    
    category: relationship({
      ref: 'MediaCategory.media',
      label: '分类',
    }),
    
    tags: relationship({
      ref: 'MediaTag.media',
      many: true,
      label: '标签',
    }),
    
    // 自动生成的元数据
    width: integer({
      ui: { 
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' }
      }
    }),
    
    height: integer({
      ui: { 
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' }
      }
    }),
    
    fileSize: integer({
      label: '文件大小 (bytes)',
      ui: { 
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' }
      }
    }),
    
    mimeType: text({
      ui: { 
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' }
      }
    }),
    
    // 优化后的URL（WebP、缩略图等）
    variants: json({
      label: '多尺寸版本',
      ui: { 
        views: './custom-views/variants-display',
        createView: { fieldMode: 'hidden' },
      }
    }),
    
    createdAt: timestamp({
      defaultValue: { kind: 'now' },
    }),
  },
  
  hooks: {
    // 上传后自动提取元数据和生成变体
    afterOperation: async ({ operation, item, context }) => {
      if (operation === 'create') {
        const metadata = await extractImageMetadata(item.file.url);
        const variants = await generateImageVariants(item.file.url);
        
        await context.query.Media.updateOne({
          where: { id: item.id },
          data: {
            width: metadata.width,
            height: metadata.height,
            fileSize: metadata.fileSize,
            mimeType: metadata.mimeType,
            variants: variants,
          }
        });
      }
    }
  }
});
```

**图片优化逻辑**:
```typescript
// lib/image-optimizer.ts
import sharp from 'sharp';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export async function generateImageVariants(originalUrl: string) {
  const s3 = new S3Client({ region: process.env.S3_REGION });
  const originalBuffer = await downloadImage(originalUrl);
  
  const variants = {
    thumbnail: await generateVariant(originalBuffer, 150, 150),
    small: await generateVariant(originalBuffer, 400, null),
    medium: await generateVariant(originalBuffer, 800, null),
    large: await generateVariant(originalBuffer, 1200, null),
    webp: await generateWebP(originalBuffer),
  };
  
  // 上传所有变体到S3
  for (const [size, buffer] of Object.entries(variants)) {
    const key = `variants/${size}/${getFilename(originalUrl)}`;
    await s3.send(new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: size === 'webp' ? 'image/webp' : 'image/jpeg',
    }));
    
    variants[size] = `https://cdn.busrom.com/${key}`;
  }
  
  return variants;
}

async function generateVariant(buffer: Buffer, width: number, height: number) {
  return sharp(buffer)
    .resize(width, height, { 
      fit: 'inside',
      withoutEnlargement: true
    })
    .jpeg({ quality: 85 })
    .toBuffer();
}

async function generateWebP(buffer: Buffer) {
  return sharp(buffer)
    .webp({ quality: 90 })
    .toBuffer();
}
```

---

### 3. 栏目/导航管理

**拖拽排序功能**（使用Keystone的order字段 + 自定义UI）:

```typescript
// 前端自定义页面：admin/pages/navigation-manager.tsx
import { useMutation, useQuery } from '@apollo/client';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext } from '@dnd-kit/sortable';

export default function NavigationManager() {
  const { data } = useQuery(GET_NAVIGATION_MENUS);
  const [updateOrder] = useMutation(UPDATE_MENU_ORDER);
  
  const handleDragEnd = async (event) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      const oldIndex = items.findIndex(i => i.id === active.id);
      const newIndex = items.findIndex(i => i.id === over.id);
      
      const newOrder = arrayMove(items, oldIndex, newIndex);
      
      // 批量更新排序
      await updateOrder({
        variables: {
          updates: newOrder.map((item, index) => ({
            id: item.id,
            order: index + 1
          }))
        }
      });
    }
  };
  
  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items}>
        {items.map(item => (
          <SortableMenuItem key={item.id} item={item} />
        ))}
      </SortableContext>
    </DndContext>
  );
}
```

---

### 4. SEO设置面板

**全局SEO配置UI**:

```typescript
// 在SiteConfig中集成SEO设置
export const SiteConfig = list({
  isSingleton: true,
  
  ui: {
    // 自定义页面布局
    itemView: {
      defaultFieldMode: 'edit',
    }
  },
  
  fields: {
    // ... 其他字段
    
    // SEO区块
    seoTitle: text({
      label: '默认SEO标题模板',
      ui: {
        description: '使用 {page} 作为页面名称占位符。如: {page} | Busrom'
      },
      defaultValue: '{page} | Busrom - Premium Glass Hardware'
    }),
    
    seoDescription: text({
      ui: { displayMode: 'textarea' },
      label: '默认SEO描述',
      defaultValue: 'Busrom offers premium glass standoffs, architectural hardware, and custom manufacturing solutions worldwide.'
    }),
    
    seoKeywords: text({
      label: '全局关键词',
      defaultValue: 'glass standoff, architectural hardware, glass railing, custom manufacturing'
    }),
    
    // Robots.txt配置
    robotsTxtContent: text({
      ui: { displayMode: 'textarea' },
      label: 'Robots.txt内容',
      defaultValue: `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Sitemap: https://busrom.com/sitemap.xml`
    }),
  }
});
```

**动态生成Robots.txt**:
```typescript
// app/robots.txt/route.ts
import { getSiteConfig } from '@/lib/api';

export async function GET() {
  const config = await getSiteConfig();
  
  return new Response(config.robotsTxtContent, {
    headers: {
      'Content-Type': 'text/plain',
    }
  });
}
```

---

### 5. 自定义代码插入界面

**后台UI设计**（预览功能）:

```typescript
// admin/pages/custom-scripts.tsx
export default function CustomScriptsManager() {
  const [preview, setPreview] = useState(false);
  const [scriptContent, setScriptContent] = useState('');
  
  return (
    <div className="grid grid-cols-2 gap-4">
      {/* 左侧编辑区 */}
      <div>
        <label>脚本内容</label>
        <textarea
          value={scriptContent}
          onChange={(e) => setScriptContent(e.target.value)}
          className="font-mono"
          rows={20}
        />
        
        <div className="mt-4">
          <button onClick={() => validateScript(scriptContent)}>
            验证脚本安全性
          </button>
          <button onClick={() => setPreview(true)}>
            预览效果
          </button>
        </div>
      </div>
      
      {/* 右侧预览区 */}
      <div>
        <label>实时预览</label>
        <iframe
          srcDoc={`
            <!DOCTYPE html>
            <html>
              <head>
                ${scriptContent}
              </head>
              <body>
                <h1>这是预览页面</h1>
                <p>脚本将在此页面加载</p>
              </body>
            </html>
          `}
          sandbox="allow-scripts"
          className="w-full h-96 border"
        />
      </div>
    </div>
  );
}
```

**脚本安全验证**:
```typescript
// lib/script-validator.ts
export function validateScript(content: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  // 检查危险模式
  const dangerousPatterns = [
    { pattern: /eval\(/g, message: '不允许使用 eval()' },
    { pattern: /<script[^>]*src=["'](?!https:\/\/)/gi, message: '外部脚本必须使用HTTPS' },
    { pattern: /document\.write/g, message: '不允许使用 document.write' },
    { pattern: /innerHTML\s*=/g, message: '不允许直接设置 innerHTML' },
  ];
  
  for (const { pattern, message } of dangerousPatterns) {
    if (pattern.test(content)) {
      errors.push(message);
    }
  }
  
  // 白名单检查：只允许来自可信CDN的脚本
  const allowedDomains = [
    'www.googletagmanager.com',
    'www.google-analytics.com',
    'connect.facebook.net',
    'analytics.tiktok.com',
  ];
  
  const scriptTagRegex = /<script[^>]*src=["'](https:\/\/[^"']+)["']/gi;
  let match;
  
  while ((match = scriptTagRegex.exec(content)) !== null) {
    const url = new URL(match[1]);
    if (!allowedDomains.some(domain => url.hostname.includes(domain))) {
      errors.push(`不允许的域名: ${url.hostname}`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
```

---

### 6. 表单管理界面

**后台列表视图**（带筛选和导出）:

```typescript
// 在Keystone Admin UI中自定义列表视图
export const ContactForm = list({
  ui: {
    listView: {
      initialColumns: ['name', 'email', 'status', 'submittedAt'],
      initialSort: { field: 'submittedAt', direction: 'DESC' },
      pageSize: 50,
    },
    
    // 自定义列表页面
    views: {
      list: './admin/views/contact-forms-list',
    }
  },
  
  fields: {
    // ... 字段定义
  }
});
```

**自定义列表页面**（添加导出功能）:
```typescript
// admin/views/contact-forms-list.tsx
import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { CSVLink } from 'react-csv';

export default function ContactFormsList() {
  const [statusFilter, setStatusFilter] = useState('all');
  
  const { data } = useQuery(GET_CONTACT_FORMS, {
    variables: { 
      where: statusFilter !== 'all' 
        ? { status: { equals: statusFilter } }
        : {}
    }
  });
  
  // 准备CSV数据
  const csvData = data?.contactForms.map(form => ({
    姓名: form.name,
    邮箱: form.email,
    WhatsApp: form.whatsapp,
    公司: form.companyName,
    留言: form.message,
    状态: form.status,
    提交时间: form.submittedAt,
    IP地址: form.ipAddress,
  }));
  
  return (
    <div>
      {/* 筛选器 */}
      <div className="flex gap-4 mb-4">
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">全部</option>
          <option value="unread">未读</option>
          <option value="read">已读</option>
          <option value="replied">已回复</option>
        </select>
        
        <CSVLink 
          data={csvData}
          filename={`contact-forms-${new Date().toISOString()}.csv`}
          className="btn-primary"
        >
          导出CSV
        </CSVLink>
      </div>
      
      {/* 表单列表 */}
      <table>
        <thead>
          <tr>
            <th>姓名</th>
            <th>邮箱</th>
            <th>状态</th>
            <th>提交时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {data?.contactForms.map(form => (
            <tr key={form.id}>
              <td>{form.name}</td>
              <td>{form.email}</td>
              <td>
                <StatusBadge status={form.status} />
              </td>
              <td>{formatDate(form.submittedAt)}</td>
              <td>
                <button onClick={() => markAsRead(form.id)}>
                  标记已读
                </button>
                <button onClick={() => openReplyModal(form)}>
                  回复
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

**邮件通知配置**:
```typescript
// lib/email-sender.ts
import nodemailer from 'nodemailer';

export async function sendContactFormNotification(form: ContactForm) {
  const config = await getSiteConfig();
  
  if (!config.smtpHost) {
    console.error('SMTP未配置');
    return;
  }
  
  const transporter = nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort,
    secure: config.smtpPort === 465,
    auth: {
      user: config.smtpUser,
      pass: config.smtpPassword,
    }
  });
  
  // 发送给管理员
  await transporter.sendMail({
    from: `"${config.emailFromName}" <${config.emailFromAddress}>`,
    to: config.formNotificationEmails,
    subject: `新的询价 - ${form.name}`,
    html: `
      <h2>收到新的咨询表单</h2>
      <p><strong>姓名:</strong> ${form.name}</p>
      <p><strong>邮箱:</strong> ${form.email}</p>
      <p><strong>WhatsApp:</strong> ${form.whatsapp || 'N/A'}</p>
      <p><strong>公司:</strong> ${form.companyName || 'N/A'}</p>
      <p><strong>留言:</strong></p>
      <p>${form.message}</p>
      <hr>
      <p><strong>提交时间:</strong> ${form.submittedAt}</p>
      <p><strong>IP地址:</strong> ${form.ipAddress}</p>
      <p><a href="https://admin.busrom.com/contact-forms/${form.id}">查看详情</a></p>
    `
  });
  
  // 发送自动回复给客户（如果启用）
  if (config.enableAutoReply) {
    await transporter.sendMail({
      from: `"${config.emailFromName}" <${config.emailFromAddress}>`,
      to: form.email,
      subject: 'Thank you for contacting Busrom',
      text: config.autoReplyTemplate.replace('{name}', form.name)
    });
  }
  
  // 更新表单状态
  await updateContactForm(form.id, { emailSent: true });
}
```

---

### 7. 用户权限管理

**基于角色的访问控制（RBAC）**:

```typescript
// lib/access-control.ts
export const accessRules = {
  // 超级管理员：所有权限
  admin: {
    canCreate: true,
    canRead: true,
    canUpdate: true,
    canDelete: true,
    canManageUsers: true,
    canManageSettings: true,
    canInjectCode: true,
  },
  
  // 内容编辑：编辑内容
  editor: {
    canCreate: true,
    canRead: true,
    canUpdate: true,
    canDelete: false,
    canManageUsers: false,
    canManageSettings: false,
    canInjectCode: false,
  },
  
  // 内容审核：查看和审核
  reviewer: {
    canCreate: false,
    canRead: true,
    canUpdate: true,
    canDelete: false,
    canManageUsers: false,
    canManageSettings: false,
    canInjectCode: false,
  },
  
  // 客服：查看表单
  support: {
    canCreate: false,
    canRead: true,
    canUpdate: false,
    canDelete: false,
    canManageUsers: false,
    canManageSettings: false,
    canInjectCode: false,
  }
};

// 应用到List配置
export const Product = list({
  access: {
    operation: {
      query: ({ session }) => !!session, // 登录即可查看
      create: ({ session }) => accessRules[session?.data?.role]?.canCreate,
      update: ({ session }) => accessRules[session?.data?.role]?.canUpdate,
      delete: ({ session }) => accessRules[session?.data?.role]?.canDelete,
    },
    
    // 字段级权限
    field: {
      featured: ({ session }) => session?.data?.role === 'admin',
      seoSetting: ({ session }) => 
        ['admin', 'editor'].includes(session?.data?.role),
    }
  },
  
  fields: {
    // ... 字段定义
  }
});
```

**操作日志记录**:
```typescript
// keystone.ts
export default config({
  lists: {
    // ... 其他lists
  },
  
  // 全局Hook记录所有操作
  extendGraphqlSchema: (schema) => {
    schema.mutation('logActivity', {
      type: 'ActivityLog',
      args: {
        action: { type: 'String!' },
        entity: { type: 'String!' },
        entityId: { type: 'String!' },
      },
      resolve: async (root, args, context) => {
        return context.query.ActivityLog.createOne({
          data: {
            user: { connect: { id: context.session.itemId } },
            action: args.action,
            entity: args.entity,
            entityId: args.entityId,
            ipAddress: context.req.ip,
            userAgent: context.req.headers['user-agent'],
          }
        });
      }
    });
  },
  
  // 全局Hook
  hooks: {
    validateInput: async ({ resolvedData, context, operation, item }) => {
      // 敏感操作需要确认
      if (operation === 'delete' && 
          ['Product', 'ProductSeries', 'Blog'].includes(item.__typename)) {
        // 记录删除操作
        await context.graphql.run({
          query: `
            mutation LogDelete($data: ActivityLogCreateInput!) {
              createActivityLog(data: $data) { id }
            }
          `,
          variables: {
            data: {
              user: { connect: { id: context.session.itemId } },
              action: 'delete',
              entity: item.__typename,
              entityId: item.id,
              changes: JSON.stringify(item),
            }
          }
        });
      }
    }
  }
});
```

---

### 8. 系统设置面板

**统一配置界面**（使用Keystone的Singleton）:

```typescript
export const SiteConfig = list({
  isSingleton: true,
  
  ui: {
    label: '站点设置',
    description: '网站全局配置',
    
    // 分组显示字段
    itemView: {
      defaultFieldMode: 'edit',
      fieldGroups: [
        {
          label: '基本信息',
          fields: ['siteName', 'companyName', 'logo', 'favicon']
        },
        {
          label: '联系方式',
          fields: ['email', 'phone', 'whatsapp', 'wechat', 'address']
        },
        {
          label: '社交媒体',
          fields: ['facebookUrl', 'linkedinUrl', 'instagramUrl']
        },
        {
          label: '邮件服务',
          fields: [
            'smtpHost', 'smtpPort', 'smtpUser', 'smtpPassword',
            'emailFromAddress', 'emailFromName',
            'formNotificationEmails', 'enableAutoReply', 'autoReplyTemplate'
          ]
        },
        {
          label: '第三方服务',
          fields: [
            'googleAnalyticsId', 'googleSearchConsoleKey',
            'tiktokPixelId', 'recaptchaSiteKey', 'recaptchaSecretKey'
          ]
        },
        {
          label: 'SEO配置',
          fields: [
            'defaultLanguage', 'enableIndexNow', 'indexNowKey'
          ]
        },
        {
          label: '功能开关',
          fields: ['maintenanceMode', 'enableCaptcha']
        }
      ]
    }
  },
  
  fields: {
    // ... 所有字段定义（见前文）
  },
  
  hooks: {
    // 配置修改后触发相关任务
    afterOperation: async ({ operation, item, context }) => {
      if (operation === 'update') {
        // 清除缓存
        await clearCache('site-config');
        
        // 如果SEO配置变更，重新生成sitemap
        if (item.enableIndexNow !== undefined) {
          await regenerateSitemap();
        }
      }
    }
  }
});
```

**配置预览功能**:
```typescript
// admin/pages/settings-preview.tsx
export default function SettingsPreview() {
  const { data } = useQuery(GET_SITE_CONFIG);
  
  return (
    <div className="grid grid-cols-2 gap-8">
      {/* 左侧：配置表单 */}
      <div>
        <ConfigForm config={data.siteConfig} />
      </div>
      
      {/* 右侧：实时预览 */}
      <div>
        <h3>预览效果</h3>
        
        <div className="preview-header">
          <img src={data.siteConfig.logo?.url} alt="Logo" />
          <span>{data.siteConfig.siteName}</span>
        </div>
        
        <div className="preview-footer">
          <p>联系邮箱: {data.siteConfig.email}</p>
          <p>联系电话: {data.siteConfig.phone}</p>
          <div className="social-links">
            {data.siteConfig.facebookUrl && (
              <a href={data.siteConfig.facebookUrl}>Facebook</a>
            )}
            {data.siteConfig.linkedinUrl && (
              <a href={data.siteConfig.linkedinUrl}>LinkedIn</a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## 🔐 安全与性能实现

### 1. 表单安全措施

**集成reCAPTCHA v3**:

```typescript
// lib/recaptcha.ts
export async function verifyRecaptcha(token: string): Promise<boolean> {
  const config = await getSiteConfig();
  
  if (!config.enableCaptcha) {
    return true; // 验证码未启用，直接通过
  }
  
  const response = await fetch(
    'https://www.google.com/recaptcha/api/siteverify',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: config.recaptchaSecretKey,
        response: token,
      })
    }
  );
  
  const data = await response.json();
  
  return data.success && data.score >= 0.5; // 分数阈值
}

// 在表单提交时调用
export const ContactForm = list({
  hooks: {
    validateInput: async ({ resolvedData, addValidationError, context }) => {
      const recaptchaToken = context.req.headers['x-recaptcha-token'];
      
      if (!recaptchaToken) {
        addValidationError('缺少验证码');
        return;
      }
      
      const isValid = await verifyRecaptcha(recaptchaToken);
      
      if (!isValid) {
        addValidationError('验证码验证失败');
      }
    }
  }
});
```

**请求频率限制**:
```typescript
// lib/rate-limiter.ts
import { RateLimiterMemory } from 'rate-limiter-flexible';

const rateLimiter = new RateLimiterMemory({
  points: 3, // 3次请求
  duration: 60, // 每60秒
});

export async function checkRateLimit(ip: string): Promise<boolean> {
  try {
    await rateLimiter.consume(ip);
    return true;
  } catch {
    return false;
  }
}

// 在Keystone中间件中应用
export default config({
  server: {
    extendExpressApp: (app, createContext) => {
      app.use('/api/contact', async (req, res, next) => {
        const allowed = await checkRateLimit(req.ip);
        
        if (!allowed) {
          return res.status(429).json({
            error: '请求过于频繁，请稍后再试'
          });
        }
        
        next();
      });
    }
  }
});
```

---

### 2. 缓存策略

**Redis缓存集成**:

```typescript
// lib/cache.ts
import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT),
  password: process.env.REDIS_PASSWORD,
});

export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 3600
): Promise<T> {
  // 尝试从缓存获取
  const cached = await redis.get(key);
  
  if (cached) {
    return JSON.parse(cached);
  }
  
  // 缓存未命中，获取数据
  const data = await fetcher();
  
  // 写入缓存
  await redis.setex(key, ttl, JSON.stringify(data));
  
  return data;
}

export async function clearCache(pattern: string) {
  const keys = await redis.keys(pattern);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}
```

**应用到API查询**:
```typescript
// app/api/home/route.ts
export async function GET() {
  const homeData = await getCached(
    'home-data',
    async () => {
      return await fetch('/api/graphql', {
        method: 'POST',
        body: JSON.stringify({
          query: GET_HOME_DATA_QUERY
        })
      }).then(r => r.json());
    },
    3600 // 缓存1小时
  );
  
  return Response.json(homeData);
}
```

**自动清除缓存**:
```typescript
// Keystone Hook
export const Product = list({
  hooks: {
    afterOperation: async ({ operation }) => {
      if (['create', 'update', 'delete'].includes(operation)) {
        // 清除相关缓存
        await clearCache('home-data');
        await clearCache('product-*');
      }
    }
  }
});
```

---

### 3. 数据库优化

**索引策略**:
```typescript
export const Product = list({
  fields: {
    sku: text({
      validation: { isRequired: true },
      isIndexed: 'unique', // 唯一索引
    }),
    
    name: text({
      isIndexed: true, // 普通索引（用于搜索）
    }),
    
    series: relationship({
      ref: 'ProductSeries.products',
      // 自动在外键上创建索引
    }),
    
    createdAt: timestamp({
      defaultValue: { kind: 'now' },
      db: {
        isIndexed: true, // 时间字段索引（用于排序）
      }
    }),
  },
  
  // 数据库层面的约束
  db: {
    indexes: [
      {
        name: 'product_series_category_idx',
        fields: ['seriesId', 'categoryId'], // 复合索引
      },
      {
        name: 'product_featured_idx',
        fields: ['featured', 'order'], // 精选产品查询优化
      }
    ]
  }
});
```

**避免N+1查询**:
```typescript
// 使用GraphQL DataLoader
import DataLoader from 'dataloader';

const productSeriesLoader = new DataLoader(async (ids: string[]) => {
  const series = await context.query.ProductSeries.findMany({
    where: { id: { in: ids } }
  });
  
  return ids.map(id => series.find(s => s.id === id));
});

// 在resolver中使用
const products = await context.query.Product.findMany({
  where: { featured: true }
});

// 批量加载关联的系列
const seriesIds = products.map(p => p.seriesId);
const series = await productSeriesLoader.loadMany(seriesIds);
```

---

### 4. 图片优化和CDN

**MinIO本地开发配置**:
```yaml
# docker-compose.yml
version: '3.8'

services:
  minio:
    image: minio/minio:latest
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    volumes:
      - minio_data:/data
    command: server /data --console-address ":9001"
  
  nginx:
    image: nginx:alpine
    ports:
      - "8080:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - minio

volumes:
  minio_data:
```

**Nginx反代配置**:
```nginx
# nginx.conf
http {
  upstream minio_cdn {
    server minio:9000;
  }
  
  # 缓存配置
  proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=cdn_cache:10m max_size=1g inactive=7d;
  
  server {
    listen 80;
    server_name localhost;
    
    location / {
      proxy_pass http://minio_cdn;
      proxy_set_header Host $host;
      
      # 缓存控制
      proxy_cache cdn_cache;
      proxy_cache_valid 200 7d;
      proxy_cache_valid 404 1h;
      
      # 添加缓存状态头
      add_header X-Cache-Status $upstream_cache_status;
      
      # 图片压缩
      gzip on;
      gzip_types image/jpeg image/png image/webp;
      gzip_comp_level 6;
      
      # 缓存头
      expires 7d;
      add_header Cache-Control "public, immutable";
    }
  }
}
```

**生产环境AWS S3 + CloudFront**:
```typescript
// keystone.ts (生产配置)
export default config({
  storage: {
    s3_images: {
      kind: 's3',
      type: 'image',
      bucketName: process.env.S3_BUCKET_NAME,
      region: process.env.S3_REGION,
      accessKeyId: process.env.S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
      
      // CloudFront CDN URL
      generateUrl: (filename) => 
        `https://cdn.busrom.com/${filename}`,
      
      // 上传时的元数据
      s3Options: {
        CacheControl: 'max-age=31536000, public, immutable',
        ContentType: 'image/jpeg',
      }
    }
  }
});
```

---

## 📝 开发清单和里程碑

### Week 1-2: 基础架构 ✅

- [ ] Keystone 6项目初始化
- [ ] PostgreSQL数据库配置
- [ ] S3/MinIO存储集成
- [ ] 完善已有数据模型（Product, ProductSeries, Blog等）
- [ ] 新增数据模型（ContactForm, CustomScript, SeoSetting, SiteConfig等）
- [ ] 基础API测试

### Week 3-4: CMS核心功能 🔲

- [ ] 富文本编辑器配置
- [ ] 多图上传和媒体管理
- [ ] 图片优化pipeline（多尺寸、WebP）
- [ ] 导航菜单管理界面
- [ ] 首页内容配置系统
- [ ] SEO设置界面

### Week 5: 表单和邮件系统 🔲

- [ ] 表单提交接口
- [ ] 邮件通知系统（SMTP集成）
- [ ] reCAPTCHA集成
- [ ] 请求频率限制
- [ ] 后台表单管理界面
- [ ] CSV导出功能

### Week 6: 高级功能 🔲

- [ ] 自定义代码管理
- [ ] 脚本安全验证
- [ ] 代码预览功能
- [ ] 操作日志系统
- [ ] 权限管理完善
- [ ] 双因素认证（可选）

### Week 7: SEO自动化 🔲

- [ ] Sitemap自动生成
- [ ] Robots.txt动态配置
- [ ] Google Indexing API集成
- [ ] IndexNow协议实现
- [ ] 结构化数据生成
- [ ] Open Graph标签支持

### Week 8: 性能优化和测试 🔲

- [ ] Redis缓存层部署
- [ ] 数据库索引优化
- [ ] API响应压缩
- [ ] CDN配置（CloudFront）
- [ ] 负载测试
- [ ] 安全审计

### Week 9-10: 部署和监控 🔲

- [ ] AWS EC2生产环境部署
- [ ] CloudWatch监控配置
- [ ] 日志收集系统
- [ ] 自动备份策略
- [ ] CI/CD流程设置
- [ ] 文档完善

---

## 🚀 部署指南

### 开发环境启动

```bash
# 1. 启动MinIO和Nginx
docker-compose up -d

# 2. 数据库迁移
npx keystone dev --reset-db

# 3. 启动Keystone
npm run dev
```

### 生产环境部署

```bash
# 1. 构建
npm run build

# 2. 数据库迁移
npx keystone deploy

# 3. 启动生产服务器
npm run start
```

### 环境变量配置

```env
# .env.production
DATABASE_URL="postgresql://user:pass@rds.amazonaws.com:5432/busrom"
SESSION_SECRET="your-super-secret-session-key"

# AWS S3
S3_BUCKET_NAME="busrom-media"
S3_REGION="us-east-1"
S3_ACCESS_KEY_ID="AKIA..."
S3_SECRET_ACCESS_KEY="..."

# Redis
REDIS_HOST="redis.busrom.internal"
REDIS_PORT="6379"
REDIS_PASSWORD="..."

# SMTP
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="noreply@busrom.com"
SMTP_PASSWORD="..."

# 第三方服务
GOOGLE_ANALYTICS_ID="G-XXXXXXXXXX"
RECAPTCHA_SECRET_KEY="..."
INDEX_NOW_KEY="..."

# 应用配置
NODE_ENV="production"
PORT="3000"
FRONTEND_URL="https://busrom.com"
ADMIN_URL="https://admin.busrom.com"
```

---

## ✅ 验收标准

### 功能完整性
- [ ] 所有数据模型已创建并测试
- [ ] API接口文档完整且可用
- [ ] CMS后台功能完整
- [ ] 表单提交和邮件通知正常
- [ ] SEO自动化功能正常

### 性能指标
- [ ] API响应时间 < 200ms
- [ ] 图片加载时间 < 1s
- [ ] 数据库查询优化完成
- [ ] Redis缓存命中率 > 80%

### 安全标准
- [ ] HTTPS强制启用
- [ ] SQL注入防护测试通过
- [ ] XSS防护测试通过
- [ ] CSRF防护启用
- [ ] 权限控制测试通过

### SEO要求
- [ ] Sitemap自动生成
- [ ] Meta标签完整
- [ ] 结构化数据正确
- [ ] IndexNow推送成功
- [ ] Google Search Console验证通过

---

**文档维护**: 开发团队  
**最后审核**: 2025-11-03  
**版本历史**: v2.0 (Keystone 6详细版)