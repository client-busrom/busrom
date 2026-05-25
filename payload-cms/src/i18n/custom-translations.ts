/**
 * Custom Translations for Payload CMS Admin UI
 *
 * These translations extend Payload's built-in i18n system.
 * They can be used in custom components via the `useTranslation` hook:
 *
 *   import { useTranslation } from '@payloadcms/ui'
 *   const { t } = useTranslation()
 *   t('custom:translationCenter:title')
 *
 * Note: Payload's field `label` and `description` support direct i18n objects
 * like { en: '...', zh: '...' }, so those don't need this system.
 * This is mainly for custom React components.
 */

export const customTranslationsEn = {
  general: {
    status: 'Status',
    published: 'Published',
    draft: 'Draft',
    archived: 'Archived',
  },
  custom: {
    // ========================================================================
    // Translation Center Component
    // ========================================================================
    translationCenter: {
      title: 'Translation Center',
      triggerButton: 'Translation Center',
      triggerHint: 'translatable fields',
      saveFirst: 'Save first',
      notAvailable: 'Not available',
      loading: 'Loading...',

      // Controls
      sourceLanguage: 'Source Language',
      targetLanguages: 'Target Languages',
      selectAll: 'All',
      selectEmpty: 'Has Empty',
      clearSelection: 'Clear',
      overwriteExisting: 'Overwrite existing content',

      // Buttons
      translate: 'Translate',
      translating: 'Translating...',
      translateCount: 'Translate ({{count}} langs)',
      saveAll: 'Save All',
      saving: 'Saving...',
      close: 'Close',

      // Status messages
      selectTargetLanguages: 'Please select target languages',
      translateSuccess: 'Translated',
      translateFailed: 'Translation failed',
      saveSuccess: 'Saved to',
      saveFailed: 'Save failed',
      loadFailed: 'Failed to load data',
      partialSave: 'Partial save',
      noChanges: 'No changes to save',
      sourceEmpty: 'The source language content is empty',
      sourceEmptyConfirm: 'The source language ({{locale}}) has no content for the following fields:\n\n{{fields}}\n\nTranslating from an empty source will produce empty results and may overwrite existing translations.\n\nAre you sure you want to continue?',
      sourceEmptyRichText: 'The current locale ({{locale}}) has no content in this field. Translating/copying from an empty source will produce empty results and may overwrite existing translations.\n\nPlease switch to a locale that has content first.',
      languages: 'languages',
      fieldLanguageCombinations: 'field-language combinations',

      // Field labels
      empty: 'Empty',
      source: 'SRC',

      // Additional field labels for pages
      heroText: 'Hero Text',
      heroSubtitle: 'Hero Subtitle',
      waterfallTitle: 'Waterfall Title',
      waterfallSubtitle: 'Waterfall Subtitle',
      excerpt: 'Excerpt',
      subtitle: 'Subtitle',
      ctaText: 'CTA Text',
      description: 'Description',
      feature: 'Feature',
      feature1: 'Feature 1',
      feature2: 'Feature 2',
      feature3: 'Feature 3',
      feature4: 'Feature 4',
      feature5: 'Feature 5',
      ctaButtonText: 'CTA Button Text',
      fieldTitle: 'Title',
      text: 'Text',
      name: 'Name',
      image: 'Image',
      icon: 'Icon',
      // Knowledge Base Settings
      heroTagTitle: 'Hero Tag Title',
      navTagTitle: 'Nav Tag Title',
      shareTitle: 'Share Title',
      searchPlaceholder: 'Search Placeholder',
      categoryListTitle: 'Category List Title',
      recommendedBlogsTitle: 'Recommended Blogs Title',
      followUsTitle: 'Follow Us Title',
      bottomRecommendedTitle: 'Bottom Recommended Title',
    },

    // ========================================================================
    // Form Fields Translation Center Component
    // ========================================================================
    formFieldsTranslation: {
      title: 'Form Fields Translation Center',
      triggerButton: 'Form Fields Translation',
      fields: 'fields',
      noFields: 'No form fields found. Add fields first.',
      label: 'Label',
      placeholder: 'Placeholder',
      options: 'Options',
      items: 'items',
      success: 'success',
      failed: 'failed',
      loadFailed: 'Failed to load form fields data',
      noChanges: 'No changes to save',
    },
    knowledgeSectionsTranslation: {
      title: 'Knowledge Sections Translation',
      trigger: 'Translate Sections Content',
      triggerHint: 'Quickly translate all text content within blocks across all supported languages.',
      saveAll: 'Save All Section Translations',
      noFields: 'No translatable fields found in sections. Please save sections first.',
      batchTranslate: 'Batch Translate Content',
      noChanges: 'No changes to save',
    },

    // ========================================================================
    // Auto Draft Component
    // ========================================================================
    autoDraft: {
      foundDraft: 'Unsaved draft found',
      restore: 'Restore',
      dismiss: 'Dismiss',
      savedAt: 'Draft saved at',
      restoreNote: 'Note: Draft data is stored locally. If needed, please re-enter the content.',
    },

    // ========================================================================
    // Media Picker Component
    // ========================================================================
    mediaPicker: {
      selectMedia: 'Select Media',
      selectImage: 'Select Image',
      addMore: 'Add More',
      changeImage: 'Change Image',
      uploadNew: 'Upload New',
      removeMedia: 'Remove',
      noMediaSelected: 'No media selected',
      dragAndDrop: 'Drag and drop files here',
      orClickToUpload: 'or click to upload',
      selectMediaFiles: 'Select Media Files',
      clearFilters: 'Clear Filters',
      confirm: 'Confirm',
      selected: 'selected',
      files: 'files',
      // Pagination
      firstPage: 'First',
      prevPage: 'Previous',
      nextPage: 'Next',
      lastPage: 'Last',
      page: 'Page',
      of: 'of',
      // View modes
      gridView: 'Grid View',
      listView: 'List View',
    },

    // ========================================================================
    // Multi-Locale Field Component
    // ========================================================================
    multiLocaleField: {
      switchLanguage: 'Switch language',
      currentLocale: 'Current: {{locale}}',
      allLanguages: 'All Languages',
      emptyLanguages: 'Empty Languages',
      filledLanguages: 'Filled Languages',
    },

    // ========================================================================
    // Common Actions
    // ========================================================================
    actions: {
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      create: 'Create',
      duplicate: 'Duplicate',
      preview: 'Preview',
      publish: 'Publish',
      unpublish: 'Unpublish',
      archive: 'Archive',
      restore: 'Restore',
    },

    // ========================================================================
    // Common Messages
    // ========================================================================
    messages: {
      confirmDelete: 'Are you sure you want to delete this item?',
      saveSuccess: 'Successfully saved',
      saveFailed: 'Failed to save',
      deleteSuccess: 'Successfully deleted',
      deleteFailed: 'Failed to delete',
      loading: 'Loading...',
      noResults: 'No results found',
      required: 'This field is required',
    },

    // ========================================================================
    // Field Labels (for custom components)
    // ========================================================================
    fields: {
      name: 'Name',
      productName: 'Product Title',
      seriesName: 'Series Name',
      pageTitle: 'Page Title',
      blogTitle: 'Blog Title',
      question: 'Question',
      recommendationTitle: 'Recommendation Widget Title',
      tocTitle: 'TOC Widget Title',
      shareTitle: 'Share Widget Title',
      placeholder: 'Search Placeholder',
      prevLabel: 'Previous Post Label',
      nextLabel: 'Next Post Label',
      applicationName: 'Application Name',
      shortDescription: 'Short Description',
      description: 'Description',
      content: 'Content',
      displayName: 'Display Name',
      submitButtonText: 'Submit Button Text',
      submittingText: 'Submitting Text',
      successMessage: 'Success Message',
      errorRequiredFields: 'Required Fields Error',
      errorNetworkMessage: 'Network Error Message',
      errorCaptchaMessage: 'Captcha Error Message',
      autoReplySubject: 'Auto Reply Subject',
      metaTitle: 'Meta Title',
      metaDescription: 'Meta Description',
      metaKeywords: 'Meta Keywords',
      ogTitle: 'OG Title',
      ogDescription: 'OG Description',
      altText: 'Alt Text',
      sceneName: 'Scene Name',
      tagName: 'Tag Name',
      title: 'Title',
      answer: 'Answer',
      label: 'Label',
      address: 'Address',
      copyrightText: 'Copyright Text',
    },

    // ========================================================================
    // Permission Resources
    // ========================================================================
    permissionResources: {
      USER: 'Users',
      ROLE: 'Roles',
      PERMISSION: 'Permissions',
      AUDIT_LOG: 'Audit Log',
      PRODUCT: 'Products',
      PRODUCT_SERIES: 'Product Series',
      PAGE: 'Pages',
      BLOG: 'Blogs',
      KNOWLEDGE_BASE_SETTINGS: 'KB Settings',
      APPLICATION: 'Applications',
      CATEGORY: 'Categories',
      FAQ_ITEM: 'FAQ Items',
      REUSABLE_BLOCK: 'Reusable Blocks',
      DOCUMENT_TEMPLATE: 'Document Templates',
      NAVIGATION_MENU: 'Navigation Menus',
      HERO_BANNER_ITEM: 'Hero Banner Items',
      MEDIA: 'Media',
      MEDIA_CATEGORY: 'Media Categories',
      MEDIA_TAG: 'Media Tags',
      FORM_CONFIG: 'Form Configs',
      FORM_SUBMISSION: 'Form Submissions',
      HOME_CONTENT: 'Home Content',
      FOOTER: 'Footer',
      HOMEPAGE_GLOBAL: 'Homepage Globals',
      SITE_CONFIG: 'Site Config',
      SEO_SETTING: 'SEO Settings',
      CUSTOM_SCRIPT: 'Custom Scripts',
      EMAIL_CONFIG: 'Email Config',
      CONTACT_CONFIG: 'Contact Config',
      SOCIAL_CONFIG: 'Social Config',
      TRANSLATION_CONFIG: 'Translation Config',
    },

    // ========================================================================
    // Permission Actions
    // ========================================================================
    permissionActions: {
      CREATE: 'Create',
      READ: 'Read',
      UPDATE: 'Update',
      DELETE: 'Delete',
      PUBLISH: 'Publish',
      EXPORT: 'Export',
      IMPORT: 'Import',
      MANAGE: 'Manage',
    },

    // ========================================================================
    // Permission Categories
    // ========================================================================
    permissionCategories: {
      USER: 'Users & Access',
      NAVIGATION: 'Navigation',
      WEBSITE_PAGES: 'Website Pages',
      PRODUCTS: 'Products',
      CONTENT: 'Content Management',
      MEDIA: 'Media Library',
      FORMS: 'Forms',
      ADVANCED: 'Advanced',
      WEBSITE_SETTINGS: 'Website Settings',
      CMS_SETTINGS: 'CMS Settings',
    },

    // ========================================================================
    // Translation Settings Component
    // ========================================================================
    translationSettings: {
      title: 'My Translation Settings',
      description: 'Configure your personal translation API settings. These settings are stored locally in your browser, so each team member can use their own API key to avoid rate limiting.',
      note: 'Note: Settings are stored in your browser\'s localStorage. If you clear browser data or use a different browser/device, you\'ll need to configure again.',
      service: 'Translation Service',
      apiKey: 'API Key',
      apiKeyHintGoogle: 'Get your API key from Google Cloud Console',
      apiKeyHintDeepL: 'Get your API key from DeepL Pro account',
      apiKeyHintAzure: 'Get your API key from Azure Portal',
      endpoint: 'Custom Endpoint (Optional)',
      endpointPlaceholder: 'https://api.cognitive.microsofttranslator.com',
      enabled: 'Enable My Personal Settings',
      enabledHint: 'When enabled, your personal API key will be used instead of the global settings',
      save: 'Save Settings',
      test: 'Test Connection',
      testing: 'Testing...',
      clear: 'Clear Settings',
      saved: 'Settings saved successfully!',
      enterKeyFirst: 'Enter your API key first to test the connection',
      testSuccess: 'Test successful!',
      testFailed: 'Test failed',
      connectionFailed: 'Failed to test connection',
      back: 'Back',
      loading: 'Loading...',
      serviceGoogle: 'Google Translate',
      serviceDeepL: 'DeepL',
      serviceAzure: 'Azure Translator',
    },

    // ========================================================================
    // Navigation Manager Component
    // ========================================================================
    navManager: {
      title: 'Navigation Menu Manager',
      description: 'Drag and drop to reorder menus within the same level. Click "Edit" to modify individual items.',
      loading: 'Loading...',
      noMenus: 'No menus found. Create one to get started.',
      noName: '(No Name)',
      hidden: 'Hidden',
      edit: 'Edit',
      backToList: 'Back to List',
      createNew: 'Create New Menu',
      orderSaved: 'Order saved successfully',
      saveFailed: 'Failed to save order',
      loadFailed: 'Failed to load menus',
      sameLevelOnly: 'Can only reorder within same level',
      span: 'span',
    },

    // ========================================================================
    // SMTP Form Config Picker Component
    // ========================================================================
    smtpFormPicker: {
      conflictTitle: 'Form Already Assigned',
      conflictMessage: 'The form "{formName}" is already assigned to SMTP config "{smtpName}". Each form can only belong to one SMTP config. Do you want to remove it from "{smtpName}" and assign it here?',
      reassignSuccess: 'Form reassigned successfully',
      reassignFailed: 'Failed to reassign form',
    },

    // ========================================================================
    // Navigation Labels (CustomNav component)
    // ========================================================================
    nav: {
      dashboard: 'Dashboard',
      // Groups
      usersAccess: 'Users & Access',
      navigation: 'Navigation',
      websitePages: 'Website Pages',
      homepage: 'Homepage',
      mediaLibrary: 'Media Library',
      products: 'Product Center',
      productSeriesManagement: 'Product Series Pages',
      productPageManagement: 'Product Detail Pages',
      content: 'Content',
      forms: 'Forms',
      advanced: 'Advanced',
      siteConfig: 'Site Config',
      websiteSettings: 'Website Settings',
      cmsSettings: 'CMS Settings',
      // Items
      users: 'Users',
      roles: 'Roles',
      permissions: 'Permissions',
      auditLog: 'Audit Log',
      activityLogs: 'Activity Logs',
      navigationMenus: 'Navigation Menus',
      navigationManager: 'Navigation Manager',
      heroBanner: 'Hero Banner',
      productSeriesCarousel: 'Product Series Carousel',
      serviceFeatures: 'Service Features',
      sphere3d: 'Sphere 3D',
      simpleCta: 'Simple CTA',
      seriesIntro: 'Series Intro',
      featuredProducts: 'Featured Products',
      brandAdvantages: 'Brand Advantages',
      oemOdm: 'OEM/ODM',
      quoteSteps: 'Quote Steps',
      mainForm: 'Main Form',
      whyChooseBusrom: 'Why Choose Busrom',
      caseStudies: 'Case Studies',
      brandAnalysis: 'Brand Analysis',
      brandValue: 'Brand Value',
      footer: 'Footer',
      media: 'Media',
      mediaCategories: 'Categories',
      mediaTags: 'Tags',
      productSeries: 'Series Integration Page',
      seriesTemplates: 'Series Template Page',
      seriesReusableBlocks: 'Series Reusable Block',
      productsItem: 'Product Detail Page',
      productAttributes: 'Product Detail Attributes',
      productTemplates: 'Product Detail Template Page',
      productReusableBlocks: 'Product Detail Reusable Block',
      categories: 'Categories',
      blogs: 'Blogs',
      blogTags: 'Blog Tags',
      knowledgeBaseSettings: 'Knowledge Base Settings',
      applications: 'Applications',
      pages: 'Pages',
      homepageManager: 'Homepage Manager',
      subpages: 'Subpages',
      faqItems: 'FAQ Items',
      reusableBlocks: 'Reusable Blocks',
      documentTemplates: 'Document Templates',
      templateCategories: 'Template Categories',
      formConfigs: 'Form Configs',
      formSubmissions: 'Form Submissions',
      smtpConfigs: 'SMTP Configs',
      customScripts: 'Custom Scripts',
      seoSettings: 'SEO Settings',
      indexingLogs: 'SEO Indexing Logs',
      siteConfigItem: 'Site Config',
      homeContent: 'Home Content',
      contactPopup: 'Contact Popup',
      preloaderConfig: 'Preloader Config',
      waterfallConfig: 'Waterfall Config',
      socialConfig: 'Social Config',
      emailConfig: 'Email Config',
      translationConfig: 'Translation Config (Global)',
      myTranslationSettings: 'My Translation Settings',
      systemSettings: 'System Settings',
      systemNotifications: 'Notification Center',
      systemManagement: 'System Management',
      notFoundPages: '404 Pages Config',
    },
  },
  'nested-docs': {
    breadcrumbs: 'Hierarchy Breadcrumbs',
    url: 'URL Path',
    label: 'Label',
  },
  'plugin-nested-docs': {
    breadcrumbs: 'Hierarchy Breadcrumbs',
    url: 'URL Path',
    label: 'Label',
  },
  nestedDocs: {
    breadcrumbs: 'Hierarchy Breadcrumbs',
    url: 'URL Path',
    label: 'Label',
  },
}

export const customTranslationsZh = {
  custom: {
    // ========================================================================
    // Translation Center Component
    // ========================================================================
    translationCenter: {
      title: '翻译中心',
      triggerButton: '翻译中心',
      triggerHint: '个可翻译字段',
      saveFirst: '请先保存',
      notAvailable: '不可用',
      loading: '加载中...',

      // Controls
      sourceLanguage: '源语言',
      targetLanguages: '目标语言',
      selectAll: '全选',
      selectEmpty: '选择空白',
      clearSelection: '全部取消',
      overwriteExisting: '覆盖已有内容',

      // Buttons
      translate: '翻译',
      translating: '翻译中...',
      translateCount: '翻译 ({{count}} 种语言)',
      saveAll: '保存全部',
      saving: '保存中...',
      close: '关闭',

      // Status messages
      selectTargetLanguages: '请选择目标语言',
      translateSuccess: '已翻译',
      translateFailed: '翻译失败',
      saveSuccess: '已保存到',
      saveFailed: '保存失败',
      loadFailed: '加载数据失败',
      partialSave: '部分保存',
      noChanges: '没有修改需要保存',
      sourceEmpty: '源语言内容为空',
      sourceEmptyConfirm: '源语言（{{locale}}）以下字段内容为空：\n\n{{fields}}\n\n从空的源语言翻译将产生空结果，并可能覆盖已有的翻译内容。\n\n确定要继续吗？',
      sourceEmptyRichText: '当前语言（{{locale}}）的此字段没有内容。从空的源语言翻译/复制将产生空结果，并可能覆盖已有的翻译内容。\n\n请先切换到有内容的语言。',
      languages: '种语言',
      fieldLanguageCombinations: '个字段-语言组合',

      // Field labels
      empty: '空',
      source: '源',

      // Additional field labels for pages
      heroText: '顶部文字',
      heroSubtitle: '顶部副标题',
      waterfallTitle: '瀑布流标题',
      waterfallSubtitle: '瀑布流副标题',
      excerpt: '摘要',
      subtitle: '副标题',
      ctaText: '按钮文字',
      description: '描述',
      feature: '特点',
      feature1: '特点 1',
      feature2: '特点 2',
      feature3: '特点 3',
      feature4: '特点 4',
      feature5: '特点 5',
      ctaButtonText: '行动按钮文本',
      fieldTitle: '标题',
      text: '文字',
      name: '名称',
      image: '图片',
      icon: '图标',
      // 知识库设置
      heroTagTitle: 'Hero 标签标题',
      navTagTitle: '导航标签标题',
      shareTitle: '分享标题',
      searchPlaceholder: '搜索占位符',
      categoryListTitle: '分类列表标题',
      recommendedBlogsTitle: '推荐博文标题',
      followUsTitle: '关注我们标题',
      bottomRecommendedTitle: '底部推荐标题',
    },

    // ========================================================================
    // Form Fields Translation Center Component
    // ========================================================================
    formFieldsTranslation: {
      title: '表单字段翻译中心',
      triggerButton: '表单字段翻译',
      fields: '个字段',
      noFields: '未找到表单字段，请先添加字段。',
      label: '标签',
      placeholder: '占位符',
      options: '选项',
      items: '项',
      success: '成功',
      failed: '失败',
      loadFailed: '加载表单字段数据失败',
      noChanges: '没有修改需要保存',
    },
    knowledgeSectionsTranslation: {
      title: '页面拼板块翻译',
      trigger: '翻译板块内容',
      triggerHint: '快速在所有支持的语言中翻译块内的所有文本内容。',
      saveAll: '保存所有板块翻译',
      noFields: '未在板块中找到可翻译字段，请先保存板块。',
      batchTranslate: '批量翻译内容',
      noChanges: '没有修改需要保存',
    },

    // ========================================================================
    // Auto Draft Component
    // ========================================================================
    autoDraft: {
      foundDraft: '发现未保存的草稿',
      restore: '恢复',
      dismiss: '忽略',
      savedAt: '草稿保存于',
      restoreNote: '注意：草稿数据存储在本地浏览器中。如需恢复，请重新输入内容。',
    },

    // ========================================================================
    // Media Picker Component
    // ========================================================================
    mediaPicker: {
      selectMedia: '选择媒体',
      selectImage: '选择图片',
      addMore: '添加更多',
      changeImage: '更换图片',
      uploadNew: '上传新文件',
      removeMedia: '移除',
      noMediaSelected: '未选择媒体',
      dragAndDrop: '拖放文件到此处',
      orClickToUpload: '或点击上传',
      selectMediaFiles: '选择媒体文件',
      clearFilters: '清除筛选',
      confirm: '确定',
      selected: '已选择',
      files: '个文件',
      // Pagination
      firstPage: '首页',
      prevPage: '上一页',
      nextPage: '下一页',
      lastPage: '末页',
      page: '第',
      of: '页',
      // View modes
      gridView: '网格视图',
      listView: '列表视图',
    },

    // ========================================================================
    // Multi-Locale Field Component
    // ========================================================================
    multiLocaleField: {
      switchLanguage: '切换语言',
      currentLocale: '当前: {{locale}}',
      allLanguages: '所有语言',
      emptyLanguages: '空白语言',
      filledLanguages: '已填语言',
    },

    // ========================================================================
    // Common Actions
    // ========================================================================
    actions: {
      save: '保存',
      cancel: '取消',
      delete: '删除',
      edit: '编辑',
      create: '创建',
      duplicate: '复制',
      preview: '预览',
      publish: '发布',
      unpublish: '取消发布',
      archive: '归档',
      restore: '恢复',
    },

    // ========================================================================
    // Common Messages
    // ========================================================================
    messages: {
      confirmDelete: '确定要删除此项吗？',
      saveSuccess: '保存成功',
      saveFailed: '保存失败',
      deleteSuccess: '删除成功',
      deleteFailed: '删除失败',
      loading: '加载中...',
      noResults: '未找到结果',
      required: '此字段为必填项',
    },

    // ========================================================================
    // Field Labels (for custom components)
    // ========================================================================
    fields: {
      name: '名称',
      productName: '产品标题',
      seriesName: '系列名称',
      pageTitle: '页面标题',
      blogTitle: '博客标题',
      question: '问题',
      recommendationTitle: '推荐模块标题',
      tocTitle: '目录导航标题',
      shareTitle: '分享模块标题',
      placeholder: '搜索框占位文案',
      prevLabel: '上一篇文案',
      nextLabel: '下一篇文案',
      applicationName: '应用名称',
      shortDescription: '简短描述',
      description: '描述',
      content: '内容',
      displayName: '显示名称',
      submitButtonText: '提交按钮文字',
      submittingText: '提交中文字',
      successMessage: '成功提示消息',
      errorRequiredFields: '必填字段错误提示',
      errorNetworkMessage: '网络错误提示',
      errorCaptchaMessage: '验证码错误提示',
      autoReplySubject: '自动回复主题',
      metaTitle: 'Meta 标题',
      metaDescription: 'Meta 描述',
      metaKeywords: 'Meta 关键词',
      ogTitle: 'OG 标题',
      ogDescription: 'OG 描述',
      altText: '替代文本',
      sceneName: '场景名称',
      tagName: '标签名称',
      title: '标题',
      answer: '回答',
      label: '标签',
      address: '地址',
      copyrightText: '版权文本',
    },

    // ========================================================================
    // Permission Resources
    // ========================================================================
    permissionResources: {
      USER: '用户',
      ROLE: '角色',
      PERMISSION: '权限',
      AUDIT_LOG: '审计日志',
      PRODUCT: '产品',
      PRODUCT_SERIES: '产品系列',
      PAGE: '页面',
      BLOG: '知识库',
      KNOWLEDGE_BASE_SETTINGS: '知识库全局管理',
      APPLICATION: '应用案例',
      CATEGORY: '分类',
      FAQ_ITEM: '常见问题',
      REUSABLE_BLOCK: '可复用内容块',
      DOCUMENT_TEMPLATE: '文档模版',
      NAVIGATION_MENU: '导航菜单',
      HERO_BANNER_ITEM: '轮播图',
      MEDIA: '媒体',
      MEDIA_CATEGORY: '媒体分类',
      MEDIA_TAG: '媒体标签',
      FORM_CONFIG: '表单配置',
      FORM_SUBMISSION: '表单提交',
      HOME_CONTENT: '首页内容',
      FOOTER: '页脚',
      HOMEPAGE_GLOBAL: '首页组件',
      SITE_CONFIG: '站点配置',
      SEO_SETTING: 'SEO 设置',
      CUSTOM_SCRIPT: '自定义脚本',
      EMAIL_CONFIG: '邮件配置',
      CONTACT_CONFIG: '联系配置',
      SOCIAL_CONFIG: '社交配置',
      TRANSLATION_CONFIG: '翻译配置',
    },

    // ========================================================================
    // Permission Actions
    // ========================================================================
    permissionActions: {
      CREATE: '创建',
      READ: '读取',
      UPDATE: '更新',
      DELETE: '删除',
      PUBLISH: '发布',
      EXPORT: '导出',
      IMPORT: '导入',
      MANAGE: '管理',
    },

    // ========================================================================
    // Permission Categories
    // ========================================================================
    permissionCategories: {
      USER: '用户与权限',
      NAVIGATION: '导航管理',
      WEBSITE_PAGES: '网站页面管理',
      PRODUCTS: '产品管理',
      CONTENT: '内容管理',
      MEDIA: '媒体库',
      FORMS: '表单管理',
      ADVANCED: '高级设置',
      WEBSITE_SETTINGS: '网站设置',
      CMS_SETTINGS: 'CMS 配置',
    },

    // ========================================================================
    // Navigation Manager Component
    // ========================================================================
    navManager: {
      title: '导航菜单管理器',
      description: '拖放以在同一层级内重新排序菜单。点击"编辑"修改单个项目。',
      loading: '加载中...',
      noMenus: '未找到导航菜单，请先创建一个。',
      noName: '(无名称)',
      hidden: '隐藏',
      edit: '编辑',
      backToList: '返回列表',
      createNew: '创建新菜单',
      orderSaved: '排序已保存',
      saveFailed: '保存排序失败',
      loadFailed: '加载菜单失败',
      sameLevelOnly: '只能在同一层级内重新排序',
      span: '跨度',
    },

    // ========================================================================
    // Translation Settings Component
    // ========================================================================
    translationSettings: {
      title: '我的翻译设置',
      description: '配置您的个人翻译 API 设置。这些设置存储在浏览器本地，因此每位团队成员可以使用自己的 API 密钥以避免速率限制。',
      note: '注意：设置存储在您浏览器的 localStorage 中。如果您清除浏览器数据或使用不同的浏览器/设备，则需要重新配置。',
      service: '翻译服务',
      apiKey: 'API 密钥',
      apiKeyHintGoogle: '从 Google Cloud Console 获取 API 密钥',
      apiKeyHintDeepL: '从 DeepL Pro 账户获取 API 密钥',
      apiKeyHintAzure: '从 Azure 门户获取 API 密钥',
      endpoint: '自定义端点（可选）',
      endpointPlaceholder: 'https://api.cognitive.microsofttranslator.com',
      enabled: '启用我的个人设置',
      enabledHint: '启用后，将使用您的个人 API 密钥替代全局设置',
      save: '保存设置',
      test: '测试连接',
      testing: '测试中...',
      clear: '清除设置',
      saved: '设置保存成功！',
      enterKeyFirst: '请先输入 API 密钥以测试连接',
      testSuccess: '测试成功！',
      testFailed: '测试失败',
      connectionFailed: '测试连接失败',
      back: '返回',
      loading: '加载中...',
      serviceGoogle: 'Google 翻译',
      serviceDeepL: 'DeepL',
      serviceAzure: 'Azure 翻译',
    },

    // ========================================================================
    // SMTP Form Config Picker Component
    // ========================================================================
    smtpFormPicker: {
      conflictTitle: '表单已分配',
      conflictMessage: '表单 "{formName}" 已分配给 SMTP 配置 "{smtpName}"。每个表单只能属于一个 SMTP 配置。是否从 "{smtpName}" 中移除并分配到此处？',
      reassignSuccess: '表单重新分配成功',
      reassignFailed: '重新分配表单失败',
    },

    // ========================================================================
    // Navigation Labels (CustomNav component)
    // ========================================================================
    nav: {
      dashboard: '仪表盘',
      // Groups
      usersAccess: '用户与权限',
      navigation: '网站导航管理',
      websitePages: '网站页面管理',
      homepage: '首页内容',
      mediaLibrary: '媒体库',
      products: '产品管理',
      productSeriesManagement: '产品详解页管理',
      productPageManagement: '产品链接页管理',
      content: '内容管理',
      forms: '表单管理',
      advanced: '高级功能',
      siteConfig: '站点配置',
      websiteSettings: '网站全局设置',
      cmsSettings: '翻译设置',
      // Items
      users: '用户',
      roles: '角色',
      permissions: '权限',
      auditLog: '审计日志',
      activityLogs: '操作日志',
      navigationMenus: '导航菜单',
      navigationManager: '导航管理器',
      heroBanner: '轮播图',
      productSeriesCarousel: '产品系列轮播',
      serviceFeatures: '服务特性',
      sphere3d: '3D球体',
      simpleCta: '简单行动召唤',
      seriesIntro: '系列介绍',
      featuredProducts: '精选产品',
      brandAdvantages: '品牌优势',
      oemOdm: '代工服务',
      quoteSteps: '报价步骤',
      mainForm: '主表单',
      whyChooseBusrom: '为何选择',
      caseStudies: '案例研究',
      brandAnalysis: '品牌分析',
      brandValue: '品牌价值',
      footer: '页脚',
      media: '媒体',
      mediaCategories: '媒体分类',
      mediaTags: '媒体标签',
      productSeries: '产品详解整合页',
      seriesTemplates: '产品详解模版页',
      seriesReusableBlocks: '产品详解复用块',
      productsItem: '产品链接整合页',
      productAttributes: '产品链接页属性',
      productTemplates: '产品链接模版页',
      productReusableBlocks: '产品链接复用块',
      categories: '分类结构管理',
      blogs: '知识库',
      blogTags: '知识库标签管理',
      knowledgeBaseSettings: '知识库全局管理',
      applications: '案例图集',
      pages: '页面',
      homepageManager: '首页管理',
      subpages: '其他子页',
      faqItems: '常见问题',
      reusableBlocks: '可复用块',
      documentTemplates: '页面板块模板库',
      templateCategories: '组件模版库分类集合',
      formConfigs: '表单配置',
      formSubmissions: '表单提交',
      smtpConfigs: 'SMTP 配置',
      customScripts: '自定义脚本',
      seoSettings: 'SEO设置',
      indexingLogs: 'SEO 收录日志',
      siteConfigItem: '站点配置',
      homeContent: '首页内容配置',
      contactPopup: '联系弹窗',
      preloaderConfig: '加载动画配置',
      waterfallConfig: '瀑布流配置',
      socialConfig: '社交配置',
      emailConfig: '邮件配置',
      translationConfig: '翻译配置（全局）',
      myTranslationSettings: '我的翻译设置',
      shopPageConfig: 'Shop 列表页管理',
      systemManagement: '系统管理',
      systemNotifications: '系统通知中心',
      systemSettings: '系统全局配置',
      notFoundPages: '404 页面配置',
    },
  },
  'nested-docs': {
    breadcrumbs: '层级面包屑 (系统自动生成)',
    url: 'URL 路径',
    label: '标签名称',
  },
  'plugin-nested-docs': {
    breadcrumbs: '层级面包屑 (系统自动生成)',
    url: 'URL 路径',
    label: '标签名称',
  },
  nestedDocs: {
    breadcrumbs: '层级面包屑 (系统自动生成)',
    url: 'URL 路径',
    label: '标签名称',
  },
}

// Type for custom translations
export type CustomTranslations = typeof customTranslationsEn
