/**
 * Chinese (Simplified) translations for Payload CMS Admin UI
 *
 * This file provides Chinese translations for all admin interface elements
 */

export const zhTranslations = {
  // ============================================================
  // General / Common
  // ============================================================
  general: {
    // Actions
    save: '保存',
    saving: '保存中...',
    cancel: '取消',
    delete: '删除',
    deleting: '删除中...',
    edit: '编辑',
    create: '创建',
    duplicate: '复制',
    copy: '复制',
    upload: '上传',
    uploading: '上传中...',
    close: '关闭',
    confirm: '确认',
    submit: '提交',
    reset: '重置',
    clear: '清除',
    search: '搜索',
    filter: '筛选',
    sort: '排序',
    refresh: '刷新',
    loading: '加载中...',
    processing: '处理中...',

    // Status
    success: '成功',
    error: '错误',
    warning: '警告',
    info: '信息',
    draft: '草稿',
    published: '已发布',
    archived: '已归档',

    // Navigation
    back: '返回',
    next: '下一步',
    previous: '上一步',
    home: '首页',
    dashboard: '仪表盘',

    // Common labels
    title: '标题',
    name: '名称',
    description: '描述',
    status: '状态',
    createdAt: '创建时间',
    updatedAt: '更新时间',
    actions: '操作',
    options: '选项',
    settings: '设置',
    details: '详情',
    preview: '预览',
    view: '查看',
    viewAll: '查看全部',

    // Common messages
    noResults: '没有找到结果',
    noData: '暂无数据',
    loading_: '正在加载数据...',
    selectOption: '请选择',
    required: '必填',
    optional: '可选',

    // Confirmation
    areYouSure: '确定要执行此操作吗？',
    confirmDelete: '确定要删除吗？此操作不可撤销。',
    unsavedChanges: '您有未保存的更改，确定要离开吗？',

    // Errors
    somethingWentWrong: '出错了',
    tryAgain: '请重试',
    notFound: '未找到',
    unauthorized: '未授权',
    forbidden: '禁止访问',
  },

  // ============================================================
  // Authentication
  // ============================================================
  authentication: {
    login: '登录',
    logout: '退出登录',
    loggedIn: '已登录',
    loggedOut: '已退出',
    email: '邮箱',
    password: '密码',
    forgotPassword: '忘记密码？',
    resetPassword: '重置密码',
    newPassword: '新密码',
    confirmPassword: '确认密码',
    changePassword: '修改密码',
    loginFailed: '登录失败',
    invalidCredentials: '邮箱或密码错误',
    accountLocked: '账户已锁定，请稍后再试',
    sessionExpired: '会话已过期，请重新登录',
    rememberMe: '记住我',
    welcomeBack: '欢迎回来',
    signInToContinue: '请登录以继续',
  },

  // ============================================================
  // Collections & Documents
  // ============================================================
  collections: {
    // Actions
    createNew: '新建{{label}}',
    editDocument: '编辑{{label}}',
    deleteDocument: '删除{{label}}',
    duplicateDocument: '复制{{label}}',

    // List view
    allDocuments: '所有{{label}}',
    documents: '文档',
    document: '文档',
    noDocuments: '没有找到{{label}}',
    selectAll: '全选',
    deselectAll: '取消全选',
    selected: '已选择 {{count}} 项',

    // Pagination
    showing: '显示',
    of: '共',
    items: '条',
    perPage: '每页',
    page: '页',
    goToPage: '跳转到',

    // Sorting
    sortBy: '排序方式',
    ascending: '升序',
    descending: '降序',

    // Filters
    filterBy: '筛选条件',
    addFilter: '添加筛选',
    removeFilter: '移除筛选',
    clearFilters: '清除所有筛选',
    equals: '等于',
    notEquals: '不等于',
    contains: '包含',
    isGreaterThan: '大于',
    isLessThan: '小于',
    isIn: '在...中',
    isNotIn: '不在...中',
    exists: '存在',
  },

  // ============================================================
  // Fields
  // ============================================================
  fields: {
    // Field types
    text: '文本',
    textarea: '多行文本',
    number: '数字',
    email: '邮箱',
    richText: '富文本',
    select: '选择',
    radio: '单选',
    checkbox: '复选',
    date: '日期',
    upload: '上传',
    relationship: '关联',
    array: '数组',
    blocks: '区块',
    group: '分组',
    row: '行',
    tabs: '标签页',
    collapsible: '可折叠',
    json: 'JSON',
    code: '代码',
    point: '坐标点',

    // Field actions
    addItem: '添加',
    removeItem: '移除',
    moveUp: '上移',
    moveDown: '下移',
    collapse: '收起',
    expand: '展开',
    collapseAll: '全部收起',
    expandAll: '全部展开',

    // Validation
    required: '此字段为必填项',
    minLength: '最少需要 {{min}} 个字符',
    maxLength: '最多允许 {{max}} 个字符',
    minValue: '最小值为 {{min}}',
    maxValue: '最大值为 {{max}}',
    invalidEmail: '请输入有效的邮箱地址',
    invalidUrl: '请输入有效的URL',
    unique: '此值已存在',

    // Rich text
    bold: '粗体',
    italic: '斜体',
    underline: '下划线',
    strikethrough: '删除线',
    link: '链接',
    unlink: '取消链接',
    orderedList: '有序列表',
    unorderedList: '无序列表',
    heading: '标题',
    blockquote: '引用',
    codeBlock: '代码块',
    insertImage: '插入图片',
    insertLink: '插入链接',
    alignLeft: '左对齐',
    alignCenter: '居中',
    alignRight: '右对齐',

    // Upload
    dragAndDrop: '拖拽文件到此处或点击上传',
    selectFile: '选择文件',
    maxFileSize: '最大文件大小: {{size}}',
    allowedTypes: '允许的文件类型: {{types}}',
    fileUploaded: '文件上传成功',
    uploadFailed: '文件上传失败',
    removeFile: '移除文件',

    // Relationship
    selectRelation: '选择关联',
    noRelations: '没有可选的关联项',
    createRelation: '创建新的关联',
    searchRelation: '搜索...',
  },

  // ============================================================
  // Globals
  // ============================================================
  globals: {
    title: '全局设置',
    edit: '编辑 {{label}}',
    save: '保存更改',
    saved: '已保存',
    saveFailed: '保存失败',
  },

  // ============================================================
  // Versions / History
  // ============================================================
  versions: {
    title: '版本历史',
    version: '版本',
    versions: '版本',
    current: '当前版本',
    draft: '草稿',
    published: '已发布',
    restore: '恢复此版本',
    compare: '对比版本',
    noVersions: '暂无版本记录',
    versionCreated: '版本创建于',
    restoreConfirm: '确定要恢复此版本吗？',
    restored: '版本已恢复',
    autosave: '自动保存',
  },

  // ============================================================
  // Upload / Media
  // ============================================================
  upload: {
    title: '媒体库',
    uploadFile: '上传文件',
    uploadFiles: '上传文件',
    dragDrop: '将文件拖放到此处',
    browseFiles: '浏览文件',
    fileInfo: '文件信息',
    fileName: '文件名',
    fileSize: '文件大小',
    fileType: '文件类型',
    dimensions: '尺寸',
    alt: '替代文本',
    crop: '裁剪',
    focalPoint: '焦点',
  },

  // ============================================================
  // Errors
  // ============================================================
  errors: {
    unknown: '发生未知错误',
    notFound: '页面未找到',
    unauthorized: '请先登录',
    forbidden: '您没有权限访问此页面',
    serverError: '服务器错误',
    networkError: '网络错误，请检查您的连接',
    validationFailed: '验证失败，请检查输入',
    deleteFailed: '删除失败',
    saveFailed: '保存失败',
    uploadFailed: '上传失败',
  },

  // ============================================================
  // Confirmation dialogs
  // ============================================================
  confirm: {
    delete: '确定要删除此项吗？',
    deleteMultiple: '确定要删除选中的 {{count}} 项吗？',
    unsavedChanges: '您有未保存的更改，确定要离开吗？',
    restore: '确定要恢复此版本吗？',
    publish: '确定要发布吗？',
    unpublish: '确定要取消发布吗？',
  },

  // ============================================================
  // Date & Time
  // ============================================================
  datetime: {
    today: '今天',
    yesterday: '昨天',
    tomorrow: '明天',
    now: '现在',
    selectDate: '选择日期',
    selectTime: '选择时间',
    clear: '清除',
    months: {
      january: '一月',
      february: '二月',
      march: '三月',
      april: '四月',
      may: '五月',
      june: '六月',
      july: '七月',
      august: '八月',
      september: '九月',
      october: '十月',
      november: '十一月',
      december: '十二月',
    },
    weekdays: {
      sunday: '周日',
      monday: '周一',
      tuesday: '周二',
      wednesday: '周三',
      thursday: '周四',
      friday: '周五',
      saturday: '周六',
    },
  },
}

export default zhTranslations
