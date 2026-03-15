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
      productName: 'Product Name',
      seriesName: 'Series Name',
      pageTitle: 'Page Title',
      blogTitle: 'Blog Title',
      question: 'Question',
      applicationName: 'Application Name',
      shortDescription: 'Short Description',
      description: 'Description',
      content: 'Content',
      displayName: 'Display Name',
      submitButtonText: 'Submit Button Text',
      successMessage: 'Success Message',
      metaTitle: 'Meta Title',
      metaDescription: 'Meta Description',
      metaKeywords: 'Meta Keywords',
      ogTitle: 'OG Title',
      ogDescription: 'OG Description',
      altText: 'Alt Text',
      sceneName: 'Scene Name',
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
      USER: 'User Management',
      CONTENT: 'Content Management',
      MEDIA: 'Media Management',
      FORMS: 'Form Management',
      HOMEPAGE: 'Homepage Management',
      SYSTEM: 'System Configuration',
    },

    // ========================================================================
    // Navigation Manager Component
    // ========================================================================
    navManager: {
      title: 'Navigation Menu Manager',
      description: 'Drag and drop to reorder menus within the same level. Click "Edit" to modify individual items.',
      loading: 'Loading menus...',
      noMenus: 'No navigation menus found',
      noName: '(No name)',
      hidden: 'Hidden',
      edit: 'Edit',
      backToList: 'Back to List View',
      createNew: 'Create New Menu',
      orderSaved: 'Order saved!',
      saveFailed: 'Failed to save order',
      loadFailed: 'Failed to load menus',
      sameLevelOnly: 'Can only reorder within the same level',
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
      siteConfigItem: 'Site Config',
      homeContent: 'Home Content',
      preloaderConfig: 'Preloader Config',
      socialConfig: 'Social Config',
      emailConfig: 'Email Config',
      translationConfig: 'Translation Config (Global)',
      myTranslationSettings: 'My Translation Settings',
      shopPageConfig: 'Shop Page Management',
      systemManagement: 'System Management',
      systemNotifications: 'Notification Center',
      systemSettings: 'System Settings',
    },
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
      clearSelection: '清除',
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
      productName: '产品名称',
      seriesName: '系列名称',
      pageTitle: '页面标题',
      blogTitle: '博客标题',
      question: '问题',
      applicationName: '应用名称',
      shortDescription: '简短描述',
      description: '描述',
      content: '内容',
      displayName: '显示名称',
      submitButtonText: '提交按钮文字',
      successMessage: '成功提示消息',
      metaTitle: 'Meta 标题',
      metaDescription: 'Meta 描述',
      metaKeywords: 'Meta 关键词',
      ogTitle: 'OG 标题',
      ogDescription: 'OG 描述',
      altText: '替代文本',
      sceneName: '场景名称',
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
      BLOG: '博客',
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
      CONTENT: '内容管理',
      MEDIA: '媒体库',
      FORMS: '表单管理',
      HOMEPAGE: '首页管理',
      SYSTEM: '系统设置',
    },

    // ========================================================================
    // Navigation Manager Component
    // ========================================================================
    navManager: {
      title: '导航菜单管理器',
      description: '拖放以在同一层级内重新排序菜单。点击"编辑"修改单个项目。',
      loading: '加载菜单中...',
      noMenus: '未找到导航菜单',
      noName: '(无名称)',
      hidden: '隐藏',
      edit: '编辑',
      backToList: '返回列表视图',
      createNew: '创建新菜单',
      orderSaved: '排序已保存！',
      saveFailed: '保存排序失败',
      loadFailed: '加载菜单失败',
      sameLevelOnly: '只能在同一层级内重新排序',
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
      siteConfigItem: '站点配置',
      homeContent: '首页内容配置',
      preloaderConfig: '加载动画配置',
      socialConfig: '社交配置',
      emailConfig: '邮件配置',
      translationConfig: '翻译配置（全局）',
      myTranslationSettings: '我的翻译设置',
      shopPageConfig: 'Shop 列表页管理',
      systemManagement: '系统管理',
      systemNotifications: '系统通知中心',
      systemSettings: '系统全局配置',
    },
  },
}

// Type for custom translations
export type CustomTranslations = typeof customTranslationsEn
