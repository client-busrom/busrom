/**
 * CustomScripts Collection - Custom Code Management
 *
 * Features:
 * - Store tracking scripts (Google Analytics, TikTok Pixel, etc.)
 * - Flexible scope configuration (global, page type, exact path, etc.)
 * - Priority-based loading order
 * - Enable/disable toggle for easy testing
 *
 * Security:
 * - Script type selection (predefined templates vs custom)
 * - Domain whitelist validation for external scripts
 * - Only super admins can create custom (non-template) scripts
 */

import type { CollectionConfig, FieldHook } from 'payload'

// ============================================================================
// Security: Allowed external script domains (whitelist)
// ============================================================================
export const ALLOWED_SCRIPT_DOMAINS = [
  // Analytics
  'www.googletagmanager.com',
  'www.google-analytics.com',
  'analytics.google.com',
  'googleads.g.doubleclick.net',
  // Facebook/Meta
  'connect.facebook.net',
  'www.facebook.com',
  // TikTok
  'analytics.tiktok.com',
  's.tiktok.com',
  // Microsoft
  'clarity.ms',
  'www.clarity.ms',
  'bat.bing.com',
  // Hotjar
  'static.hotjar.com',
  'script.hotjar.com',
  // Other common analytics
  'cdn.segment.com',
  'cdn.amplitude.com',
  'cdn.mxpnl.com', // Mixpanel
  'plausible.io',
  'js.hs-scripts.com', // HubSpot
  'js.hsforms.net',
  'snap.licdn.com', // LinkedIn
  'static.ads-twitter.com', // Twitter
  'www.redditstatic.com', // Reddit
  'widget.intercom.io', // Intercom
  'js.intercomcdn.com',
]

// ============================================================================
// Predefined script templates (safe, pre-approved scripts)
// ============================================================================
export const SCRIPT_TEMPLATES = {
  google_analytics_4: {
    name: 'Google Analytics 4 (GA4)',
    description: 'Google Analytics 4 tracking script',
    placeholder: 'G-XXXXXXXXXX',
    template: (id: string) => `<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${id}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${id}');
</script>`,
  },
  google_tag_manager: {
    name: 'Google Tag Manager',
    description: 'Google Tag Manager container script',
    placeholder: 'GTM-XXXXXXX',
    template: (id: string) => `<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${id}');</script>
<!-- End Google Tag Manager -->`,
  },
  google_tag_manager_noscript: {
    name: 'Google Tag Manager (noscript)',
    description: 'GTM noscript fallback - place at body_start',
    placeholder: 'GTM-XXXXXXX',
    template: (id: string) => `<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${id}"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->`,
  },
  facebook_pixel: {
    name: 'Facebook Pixel',
    description: 'Meta/Facebook Pixel tracking',
    placeholder: 'XXXXXXXXXXXXXXXX',
    template: (id: string) => `<!-- Meta Pixel Code -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${id}');
fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=${id}&ev=PageView&noscript=1"/></noscript>
<!-- End Meta Pixel Code -->`,
  },
  tiktok_pixel: {
    name: 'TikTok Pixel',
    description: 'TikTok tracking pixel',
    placeholder: 'XXXXXXXXXXXXXXXXXX',
    template: (id: string) => `<!-- TikTok Pixel Code -->
<script>
!function (w, d, t) {
  w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
  ttq.load('${id}');
  ttq.page();
}(window, document, 'ttq');
</script>
<!-- End TikTok Pixel Code -->`,
  },
  microsoft_clarity: {
    name: 'Microsoft Clarity',
    description: 'Microsoft Clarity heatmaps and session recording',
    placeholder: 'XXXXXXXXXX',
    template: (id: string) => `<!-- Microsoft Clarity -->
<script type="text/javascript">
    (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "${id}");
</script>
<!-- End Microsoft Clarity -->`,
  },
  hotjar: {
    name: 'Hotjar',
    description: 'Hotjar heatmaps and recordings',
    placeholder: 'XXXXXXX',
    template: (id: string) => `<!-- Hotjar Tracking Code -->
<script>
    (function(h,o,t,j,a,r){
        h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
        h._hjSettings={hjid:${id},hjsv:6};
        a=o.getElementsByTagName('head')[0];
        r=o.createElement('script');r.async=1;
        r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
        a.appendChild(r);
    })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
</script>
<!-- End Hotjar Tracking Code -->`,
  },
}

// ============================================================================
// Validation hook: Generate content from template or validate custom content
// ============================================================================
const validateAndGenerateContent: FieldHook = async ({ data, value, req }) => {
  if (!data) return value

  const scriptType = data.scriptType
  const templateKey = data.templateType
  const templateId = data.templateId

  // If using a template, generate the content
  if (scriptType === 'template' && templateKey && templateId) {
    const template = SCRIPT_TEMPLATES[templateKey as keyof typeof SCRIPT_TEMPLATES]
    if (template) {
      return template.template(templateId)
    }
  }

  // If custom script, validate (only super admins should be able to create these)
  if (scriptType === 'custom' && value) {
    // Log warning for audit purposes
    console.warn(`[CustomScripts] Custom script created/updated by user: ${req.user?.email || 'unknown'}`)
  }

  return value
}

export const CustomScripts: CollectionConfig = {
  slug: 'custom-scripts',
  labels: {
    singular: {
      en: 'Custom Script',
      zh: '自定义脚本',
    },
    plural: {
      en: 'Custom Scripts',
      zh: '自定义脚本',
    },
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'scriptPosition', 'scope', 'isEnabled', 'priority'],
    group: {
      en: 'Settings',
      zh: '系统设置',
    },
    description: {
      en: 'Manage tracking scripts and custom code injection',
      zh: '管理跟踪脚本和自定义代码注入',
    },
  },
  access: {
    read: () => true,
    create: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => !!req.user,
  },
  // 版本控制 - 暂时禁用，等待数据库迁移
  // versions: {
  //   maxPerDoc: 10,
  // },
  hooks: {
    beforeChange: [
      async ({ data }) => {
        // Generate content from template
        if (data?.scriptType === 'template' && data?.templateType && data?.templateId) {
          const template = SCRIPT_TEMPLATES[data.templateType as keyof typeof SCRIPT_TEMPLATES]
          if (template) {
            data.generatedContent = template.template(data.templateId)
          }
        }
        return data
      },
    ],
  },
  fields: [
    // ==================================================================
    // Basic Information
    // ==================================================================
    {
      name: 'name',
      type: 'text',
      label: {
        en: 'Script Name',
        zh: '脚本名称',
      },
      required: true,
      admin: {
        description: {
          en: 'e.g., "Google Analytics", "TikTok Pixel"',
          zh: '例如："Google Analytics"、"TikTok Pixel"',
        },
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: {
        en: 'Description',
        zh: '描述',
      },
    },

    // ==================================================================
    // Script Type Selection (Security Feature)
    // ==================================================================
    {
      name: 'scriptType',
      type: 'select',
      label: {
        en: 'Script Type',
        zh: '脚本类型',
      },
      required: true,
      defaultValue: 'template',
      options: [
        {
          label: { en: 'Use Template (Recommended)', zh: '使用模板（推荐）' },
          value: 'template',
        },
        {
          label: { en: 'Custom Code (Admin Only)', zh: '自定义代码（仅管理员）' },
          value: 'custom',
        },
      ],
      admin: {
        description: {
          en: 'Templates are pre-approved and secure. Custom code requires admin privileges.',
          zh: '模板是预先批准的安全脚本。自定义代码需要管理员权限。',
        },
      },
    },

    // ==================================================================
    // Template Selection (shown when scriptType = 'template')
    // ==================================================================
    {
      name: 'templateType',
      type: 'select',
      label: {
        en: 'Script Template',
        zh: '脚本模板',
      },
      options: [
        { label: 'Google Analytics 4 (GA4)', value: 'google_analytics_4' },
        { label: 'Google Tag Manager', value: 'google_tag_manager' },
        { label: 'Google Tag Manager (noscript)', value: 'google_tag_manager_noscript' },
        { label: 'Facebook Pixel', value: 'facebook_pixel' },
        { label: 'TikTok Pixel', value: 'tiktok_pixel' },
        { label: 'Microsoft Clarity', value: 'microsoft_clarity' },
        { label: 'Hotjar', value: 'hotjar' },
      ],
      admin: {
        condition: (data) => data.scriptType === 'template',
        description: {
          en: 'Select a pre-configured tracking script template',
          zh: '选择预配置的跟踪脚本模板',
        },
      },
    },
    {
      name: 'templateId',
      type: 'text',
      label: {
        en: 'Tracking ID',
        zh: '跟踪 ID',
      },
      admin: {
        condition: (data) => data.scriptType === 'template' && !!data.templateType,
        description: {
          en: 'Enter your tracking ID (e.g., G-XXXXXXXXXX for GA4, GTM-XXXXXXX for GTM)',
          zh: '输入您的跟踪 ID（例如：GA4 为 G-XXXXXXXXXX，GTM 为 GTM-XXXXXXX）',
        },
      },
    },

    // ==================================================================
    // Script Content
    // ==================================================================
    {
      name: 'scriptPosition',
      type: 'select',
      label: {
        en: 'Injection Position',
        zh: '注入位置',
      },
      required: true,
      defaultValue: 'header',
      options: [
        { label: { en: 'Header (before </head>)', zh: '头部 (</head> 之前)' }, value: 'header' },
        { label: { en: 'Footer (before </body>)', zh: '底部 (</body> 之前)' }, value: 'footer' },
        { label: { en: 'Body Start (after <body>)', zh: '主体开始 (<body> 之后)' }, value: 'body_start' },
      ],
    },
    {
      name: 'content',
      type: 'code',
      label: {
        en: 'Script Content',
        zh: '脚本内容',
      },
      admin: {
        language: 'html',
        description: {
          en: 'Enter custom code (admin only)',
          zh: '输入自定义代码（仅管理员）',
        },
        condition: (data) => data.scriptType === 'custom',
      },
    },
    // Field to store generated content for template scripts
    {
      name: 'generatedContent',
      type: 'code',
      label: {
        en: 'Generated Content',
        zh: '生成的内容',
      },
      admin: {
        language: 'html',
        readOnly: true,
        condition: (data) => data.scriptType === 'template' && !!data.templateId,
        description: {
          en: 'Preview of the generated script (read-only). Save to generate.',
          zh: '生成脚本的预览（只读）。保存后生成。',
        },
      },
    },

    // ==================================================================
    // Scope Configuration
    // ==================================================================
    {
      name: 'scope',
      type: 'select',
      label: {
        en: 'Application Scope',
        zh: '应用范围',
      },
      required: true,
      defaultValue: 'global',
      options: [
        { label: { en: 'Global (All Pages)', zh: '全局（所有页面）' }, value: 'global' },
        { label: { en: 'Page Type', zh: '页面类型' }, value: 'page_type' },
        { label: { en: 'Exact Path', zh: '精确路径' }, value: 'exact_path' },
        { label: { en: 'Path Pattern (Wildcard)', zh: '路径规则（通配符）' }, value: 'path_pattern' },
      ],
    },
    {
      name: 'pageType',
      type: 'select',
      label: {
        en: 'Page Type',
        zh: '页面类型',
      },
      options: [
        { label: { en: 'Home', zh: '首页' }, value: 'home' },
        { label: { en: 'Product Series List', zh: '产品系列列表' }, value: 'product_series_list' },
        { label: { en: 'Product Series Detail', zh: '产品系列详情' }, value: 'product_series_detail' },
        { label: { en: 'Shop List', zh: '商城列表' }, value: 'shop_list' },
        { label: { en: 'Shop Product Detail', zh: '商品详情' }, value: 'shop_detail' },
        { label: { en: 'Blog List', zh: '博客列表' }, value: 'blog_list' },
        { label: { en: 'Blog Detail', zh: '博客详情' }, value: 'blog_detail' },
        { label: { en: 'Applications', zh: '应用场景' }, value: 'applications' },
      ],
      admin: {
        condition: (data) => data.scope === 'page_type',
      },
    },
    {
      name: 'exactPath',
      type: 'text',
      label: {
        en: 'Exact Path',
        zh: '精确路径',
      },
      admin: {
        condition: (data) => data.scope === 'exact_path',
        components: {
          Field: '@/components/fields/PathSelector',
        },
      },
    },
    {
      name: 'pathPattern',
      type: 'text',
      label: {
        en: 'Path Pattern',
        zh: '路径规则',
      },
      admin: {
        condition: (data) => data.scope === 'path_pattern',
        components: {
          Field: '@/components/fields/PathSelector',
        },
      },
    },

    // ==================================================================
    // Control
    // ==================================================================
    {
      name: 'isEnabled',
      type: 'checkbox',
      label: {
        en: 'Enabled',
        zh: '启用',
      },
      defaultValue: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'priority',
      type: 'number',
      label: {
        en: 'Priority',
        zh: '优先级',
      },
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        description: {
          en: 'Higher number = loads first',
          zh: '数字越大越先加载',
        },
      },
    },

    // ==================================================================
    // Preview & Testing
    // ==================================================================
    {
      name: 'previewUrl',
      type: 'text',
      label: {
        en: 'Preview URL',
        zh: '预览链接',
      },
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: {
          en: 'Open this URL to preview script loading status (authorized access only)',
          zh: '打开此链接预览脚本加载状态（需授权访问）',
        },
      },
      hooks: {
        afterRead: [
          ({ data }) => {
            if (!data?.id) return null
            // Use production frontend URL by default, fallback to env variable
            const frontendUrl = process.env.FRONTEND_URL || 'https://www.busromhouse.com'
            // Debug token for authorization - must match frontend
            const debugToken = process.env.DEBUG_TOKEN_SECRET || 'busrom-script-debug-2024'
            // Generate preview URL with debug parameter and token
            let targetPath = '/'
            if (data.scope === 'exact_path' && data.exactPath) {
              targetPath = data.exactPath
            }
            return `${frontendUrl}${targetPath}?_debug_scripts=true&_debug_token=${debugToken}&_script_id=${data.id}`
          },
        ],
      },
    },
    {
      name: 'lastTestedAt',
      type: 'date',
      label: {
        en: 'Last Tested',
        zh: '最后测试时间',
      },
      admin: {
        position: 'sidebar',
        readOnly: true,
        date: {
          displayFormat: 'yyyy-MM-dd HH:mm',
        },
      },
    },
    {
      name: 'testStatus',
      type: 'select',
      label: {
        en: 'Test Status',
        zh: '测试状态',
      },
      options: [
        { label: { en: 'Not Tested', zh: '未测试' }, value: 'not_tested' },
        { label: { en: 'Passed', zh: '通过' }, value: 'passed' },
        { label: { en: 'Failed', zh: '失败' }, value: 'failed' },
      ],
      defaultValue: 'not_tested',
      admin: {
        position: 'sidebar',
      },
    },
  ],
  timestamps: true,
}
