/**
 * TranslationConfig Global - Translation Service Configuration
 *
 * Features:
 * - Select translation service (Google, DeepL, Azure)
 * - Store API key (encrypted)
 * - Configure default source language
 * - Test translation connectivity
 */

import type { GlobalConfig } from 'payload'

export const TranslationConfig: GlobalConfig = {
  slug: 'translation-config',
  label: {
    en: 'Translation Settings',
    zh: '翻译设置',
  },
  admin: {
    group: {
      en: 'CMS Settings',
      zh: 'CMS系统设置',
    },
    description: {
      en: 'Configure translation service for multi-language content',
      zh: '配置多语言内容的翻译服务',
    },
  },
  // versions: true,
  access: {
    read: ({ req }) => {
      // Only authenticated users can read
      return !!req.user
    },
    update: ({ req }) => {
      // Only admin can update
      return req.user?.isAdmin === true
    },
  },
  fields: [
    // ==================================================================
    // Service Selection
    // ==================================================================
    {
      name: 'service',
      type: 'select',
      label: {
        en: 'Translation Service',
        zh: '翻译服务',
      },
      required: true,
      defaultValue: 'google',
      options: [
        { label: 'Google Translate', value: 'google' },
        { label: 'DeepL', value: 'deepl' },
        { label: 'Azure Translator', value: 'azure' },
      ],
      admin: {
        description: {
          en: 'Select the translation service to use',
          zh: '选择要使用的翻译服务',
        },
      },
    },

    // ==================================================================
    // API Configuration
    // ==================================================================
    {
      name: 'apiKey',
      type: 'text',
      label: {
        en: 'API Key',
        zh: 'API 密钥',
      },
      admin: {
        description: {
          en: 'Enter your translation service API key',
          zh: '输入您的翻译服务 API 密钥',
        },
      },
    },
    {
      name: 'apiEndpoint',
      type: 'text',
      label: {
        en: 'Custom API Endpoint',
        zh: '自定义 API 端点',
      },
      admin: {
        description: {
          en: 'Optional: Custom endpoint for self-hosted translation services',
          zh: '可选：自托管翻译服务的自定义端点',
        },
        condition: (data) => data.service === 'azure',
      },
    },

    // ==================================================================
    // Default Settings
    // ==================================================================
    {
      name: 'defaultSourceLang',
      type: 'select',
      label: {
        en: 'Default Source Language',
        zh: '默认源语言',
      },
      defaultValue: 'en',
      options: [
        { label: 'English', value: 'en' },
        { label: '中文', value: 'zh' },
        { label: 'Auto Detect', value: 'auto' },
      ],
      admin: {
        description: {
          en: 'Default language to translate from',
          zh: '默认翻译源语言',
        },
      },
    },

    // ==================================================================
    // Rate Limiting
    // ==================================================================
    {
      type: 'collapsible',
      label: {
        en: 'Rate Limiting',
        zh: '速率限制',
      },
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          name: 'maxRequestsPerMinute',
          type: 'number',
          label: {
            en: 'Max Requests Per Minute',
            zh: '每分钟最大请求数',
          },
          defaultValue: 60,
          admin: {
            description: {
              en: 'Limit translation requests to prevent API quota issues',
              zh: '限制翻译请求以防止 API 配额问题',
            },
          },
        },
        {
          name: 'delayBetweenRequests',
          type: 'number',
          label: {
            en: 'Delay Between Requests (ms)',
            zh: '请求间隔（毫秒）',
          },
          defaultValue: 100,
          admin: {
            description: {
              en: 'Delay between translation requests',
              zh: '翻译请求之间的延迟',
            },
          },
        },
      ],
    },

    // ==================================================================
    // Status
    // ==================================================================
    {
      name: 'isEnabled',
      type: 'checkbox',
      label: {
        en: 'Enable Translation',
        zh: '启用翻译',
      },
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: {
          en: 'Enable or disable the translation feature',
          zh: '启用或禁用翻译功能',
        },
      },
    },
    {
      name: 'lastTestedAt',
      type: 'date',
      label: {
        en: 'Last Tested',
        zh: '上次测试时间',
      },
      admin: {
        position: 'sidebar',
        readOnly: true,
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'lastTestResult',
      type: 'select',
      label: {
        en: 'Last Test Result',
        zh: '上次测试结果',
      },
      options: [
        { label: 'Success | 成功', value: 'success' },
        { label: 'Failed | 失败', value: 'failed' },
        { label: 'Not Tested | 未测试', value: 'not_tested' },
      ],
      defaultValue: 'not_tested',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
  ],
}
