# 03 CMS后台功能

**文档版本**: v2.0
**技术栈**: Keystone 6 Admin UI
**最后更新**: 2025-11-04

---

## 文档导航

- [01-数据模型与架构](./01-数据模型与架构.md)
- [02-API接口规范](./02-API接口规范.md)
- **当前文档**: 03-CMS后台功能
- [04-安全与性能](./04-安全与性能.md)
- [05-部署与验收](./05-部署与验收.md)

---

## 🎨 CMS后台功能详细说明

### 1. 内容管理模块

**1.1 富文本编辑器配置**

Keystone 6使用的是 `document` 字段类型,支持富文本编辑:

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

**自定义组件**(如图片、视频插入):
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

使用 `relationship` + `many: true` 实现:

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

**自定义上传处理**(S3集成):
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

    // 优化后的URL(WebP、缩略图等)
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

**拖拽排序功能**(使用Keystone的order字段 + 自定义UI):

```typescript
// 前端自定义页面:admin/pages/navigation-manager.tsx
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

**后台UI设计**(预览功能):

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

  // 白名单检查:只允许来自可信CDN的脚本
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

**后台列表视图**(带筛选和导出):

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

**自定义列表页面**(添加导出功能):
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

  // 发送自动回复给客户(如果启用)
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

**基于角色的访问控制(RBAC)**:

```typescript
// lib/access-control.ts
export const accessRules = {
  // 超级管理员:所有权限
  admin: {
    canCreate: true,
    canRead: true,
    canUpdate: true,
    canDelete: true,
    canManageUsers: true,
    canManageSettings: true,
    canInjectCode: true,
  },

  // 内容编辑:编辑内容
  editor: {
    canCreate: true,
    canRead: true,
    canUpdate: true,
    canDelete: false,
    canManageUsers: false,
    canManageSettings: false,
    canInjectCode: false,
  },

  // 内容审核:查看和审核
  reviewer: {
    canCreate: false,
    canRead: true,
    canUpdate: true,
    canDelete: false,
    canManageUsers: false,
    canManageSettings: false,
    canInjectCode: false,
  },

  // 客服:查看表单
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

**统一配置界面**(使用Keystone的Singleton):

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
    // ... 所有字段定义(见前文)
  },

  hooks: {
    // 配置修改后触发相关任务
    afterOperation: async ({ operation, item, context }) => {
      if (operation === 'update') {
        // 清除缓存
        await clearCache('site-config');

        // 如果SEO配置变更,重新生成sitemap
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
      {/* 左侧:配置表单 */}
      <div>
        <ConfigForm config={data.siteConfig} />
      </div>

      {/* 右侧:实时预览 */}
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

## 下一步

CMS后台功能配置完成,接下来了解安全与性能优化:
- [04-安全与性能](./04-安全与性能.md) - 学习如何保障系统安全和性能

---

**文档维护**: 开发团队
**最后审核**: 2025-11-04
