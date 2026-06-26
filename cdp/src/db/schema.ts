import { pgTable, serial, varchar, timestamp, integer, jsonb, text, boolean, real, index } from 'drizzle-orm/pg-core'


// 原始访问数据表
export const trafficRaw = pgTable('traffic_raw', {
  id: serial('id').primaryKey(),
  sessionId: varchar('session_id', { length: 255 }).notNull(),
  visitorId: varchar('visitor_id', { length: 255 }).notNull(),
  pagePath: varchar('page_path', { length: 500 }).notNull(),
  referrer: varchar('referrer', { length: 500 }),
  utmSource: varchar('utm_source', { length: 100 }),
  utmMedium: varchar('utm_medium', { length: 100 }),
  utmCampaign: varchar('utm_campaign', { length: 100 }),
  utmTerm: varchar('utm_term', { length: 100 }),
  utmContent: varchar('utm_content', { length: 100 }),
  channel: varchar('channel', { length: 50 }).notNull().default('direct'), // organic, ad, direct, referral, social
  deviceType: varchar('device_type', { length: 50 }), // desktop, mobile, tablet
  browser: varchar('browser', { length: 100 }),
  os: varchar('os', { length: 100 }),
  country: varchar('country', { length: 100 }),
  city: varchar('city', { length: 100 }),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  screenResolution: varchar('screen_resolution', { length: 50 }),
  language: varchar('language', { length: 50 }),
  eventType: varchar('event_type', { length: 50 }).notNull().default('pageview'), // pageview, click, scroll, form_submit
  eventData: jsonb('event_data'), // 额外事件数据
  timestamp: timestamp('timestamp', { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  sessionIdx: index('traffic_raw_session_idx').on(table.sessionId),
  visitorIdx: index('traffic_raw_visitor_idx').on(table.visitorId),
  pagePathIdx: index('traffic_raw_page_path_idx').on(table.pagePath),
  timestampIdx: index('traffic_raw_timestamp_idx').on(table.timestamp),
  channelIdx: index('traffic_raw_channel_idx').on(table.channel),
  eventTypeIdx: index('traffic_raw_event_type_idx').on(table.eventType),
}))

// 每日汇总数据表
export const trafficSummary = pgTable('traffic_summary', {
  id: serial('id').primaryKey(),
  date: varchar('date', { length: 10 }).notNull(), // YYYY-MM-DD
  pagePath: varchar('page_path', { length: 500 }).notNull().default('all'),
  channel: varchar('channel', { length: 50 }).notNull().default('all'),
  
  // 基础指标
  pv: integer('pv').notNull().default(0), // 页面浏览量
  uv: integer('uv').notNull().default(0), // 独立访客
  sessions: integer('sessions').notNull().default(0), // 访问次数
  bounceRate: real('bounce_rate').default(0), // 跳出率
  avgDuration: real('avg_duration').default(0), // 平均访问时长（秒）
  
  // 转化指标
  conversions: integer('conversions').notNull().default(0), // 转化次数
  formSubmissions: integer('form_submissions').notNull().default(0), // 表单提交
  conversionRate: real('conversion_rate').default(0), // 转化率
  formConversionRate: real('form_conversion_rate').default(0), // 表单转化率 = formSubmissions / sessions
  leads: integer('leads').notNull().default(0), // 线索数（WhatsApp/Email/在线聊天点击）
  
  // 设备分布（JSON 存储）
  deviceBreakdown: jsonb('device_breakdown'), // {desktop: 100, mobile: 50, tablet: 10}
  browserBreakdown: jsonb('browser_breakdown'), // {chrome: 100, safari: 50}
  countryBreakdown: jsonb('country_breakdown'), // {CN: 100, US: 50}
  
  // 趋势对比（与昨日/上周/上月对比）
  pvChangeDay: real('pv_change_day'), // PV 日环比
  pvChangeWeek: real('pv_change_week'), // PV 周环比
  pvChangeMonth: real('pv_change_month'), // PV 月环比
  
  uvChangeDay: real('uv_change_day'), // UV 日环比
  uvChangeWeek: real('uv_change_week'), // UV 周环比
  uvChangeMonth: real('uv_change_month'), // UV 月环比
  
  sessionsChangeDay: real('sessions_change_day'), // Sessions 日环比
  sessionsChangeWeek: real('sessions_change_week'), // Sessions 周环比
  sessionsChangeMonth: real('sessions_change_month'), // Sessions 月环比
  
  conversionsChangeDay: real('conversions_change_day'), // Conversions 日环比
  conversionsChangeWeek: real('conversions_change_week'), // Conversions 周环比
  conversionsChangeMonth: real('conversions_change_month'), // Conversions 月环比
  
  formSubmissionsChangeDay: real('form_submissions_change_day'), // Form Submissions 日环比
  formSubmissionsChangeWeek: real('form_submissions_change_week'), // Form Submissions 周环比
  formSubmissionsChangeMonth: real('form_submissions_change_month'), // Form Submissions 月环比
  
  leadsChangeDay: real('leads_change_day'), // Leads 日环比
  leadsChangeWeek: real('leads_change_week'), // Leads 周环比
  leadsChangeMonth: real('leads_change_month'), // Leads 月环比
  
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  dateIdx: index('traffic_summary_date_idx').on(table.date),
  dateChannelIdx: index('traffic_summary_date_channel_idx').on(table.date, table.channel),
  datePageIdx: index('traffic_summary_date_page_idx').on(table.date, table.pagePath),
  uniqueDatePageChannel: index('traffic_summary_unique_idx').on(table.date, table.pagePath, table.channel),
}))

// 访问路径表（用于行为流向图）
export const visitorPaths = pgTable('visitor_paths', {
  id: serial('id').primaryKey(),
  sessionId: varchar('session_id', { length: 255 }).notNull(),
  visitorId: varchar('visitor_id', { length: 255 }).notNull(),
  pathSequence: jsonb('path_sequence').notNull(), // ["/home", "/products", "/contact"]
  entryPage: varchar('entry_page', { length: 500 }).notNull(),
  exitPage: varchar('exit_page', { length: 500 }).notNull(),
  pageCount: integer('page_count').notNull().default(0),
  duration: real('duration').default(0), // 总停留时长
  converted: boolean('converted').default(false), // 是否转化
  conversionPage: varchar('conversion_page', { length: 500 }), // 转化页面
  date: varchar('date', { length: 10 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  sessionIdx: index('visitor_paths_session_idx').on(table.sessionId),
  dateIdx: index('visitor_paths_date_idx').on(table.date),
  entryPageIdx: index('visitor_paths_entry_idx').on(table.entryPage),
}))

// 关键词表（SEO 分析）
export const searchKeywords = pgTable('search_keywords', {
  id: serial('id').primaryKey(),
  date: varchar('date', { length: 10 }).notNull(),
  keyword: varchar('keyword', { length: 500 }).notNull(),
  pagePath: varchar('page_path', { length: 500 }),
  channel: varchar('channel', { length: 50 }).notNull().default('organic'), // organic, paid
  searchEngine: varchar('search_engine', { length: 50 }), // google, bing, baidu
  impressions: integer('impressions').default(0), // 展示次数
  clicks: integer('clicks').default(0), // 点击次数
  ctr: real('ctr').default(0), // 点击率
  position: real('position').default(0), // 平均排名
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  dateIdx: index('search_keywords_date_idx').on(table.date),
  keywordIdx: index('search_keywords_keyword_idx').on(table.keyword),
  dateKeywordIdx: index('search_keywords_date_keyword_idx').on(table.date, table.keyword),
}))

// 路径洞察表（按日期聚合的路径分析结果）
export const pathInsights = pgTable('path_insights', {
  id: serial('id').primaryKey(),
  date: varchar('date', { length: 10 }).notNull(),
  insightType: varchar('insight_type', { length: 50 }).notNull(), // top_paths | entry_pages | exit_pages | drop_offs | conversion_paths
  insightKey: varchar('insight_key', { length: 500 }).notNull(), // 路径字符串或页面路径
  value: integer('value').notNull().default(0), // 出现次数或用户数
  conversionCount: integer('conversion_count').default(0), // 关联转化数
  conversionRate: real('conversion_rate').default(0), // 转化率
  metadata: jsonb('metadata'), // 额外信息（如完整路径序列、平均停留时长）
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  dateIdx: index('path_insights_date_idx').on(table.date),
  typeIdx: index('path_insights_type_idx').on(table.insightType),
  dateTypeIdx: index('path_insights_date_type_idx').on(table.date, table.insightType),
}))

// 操作审计日志表
export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 255 }),
  userEmail: varchar('user_email', { length: 255 }),
  action: varchar('action', { length: 100 }).notNull(),
  resourceType: varchar('resource_type', { length: 100 }).notNull(),
  resourceId: varchar('resource_id', { length: 255 }),
  details: jsonb('details').default({}),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index('audit_logs_user_id_idx').on(table.userId),
  actionIdx: index('audit_logs_action_idx').on(table.action),
  resourceTypeIdx: index('audit_logs_resource_type_idx').on(table.resourceType),
  createdAtIdx: index('audit_logs_created_at_idx').on(table.createdAt),
}))

// ETL 任务日志表
export const etlLogs = pgTable('etl_logs', {
  id: serial('id').primaryKey(),
  taskName: varchar('task_name', { length: 100 }).notNull(),
  status: varchar('status', { length: 50 }).notNull().default('running'), // running, success, failed
  startTime: timestamp('start_time', { withTimezone: true }).notNull().defaultNow(),
  endTime: timestamp('end_time', { withTimezone: true }),
  recordsProcessed: integer('records_processed').default(0),
  errorMessage: text('error_message'),
  details: jsonb('details'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  taskNameIdx: index('etl_logs_task_name_idx').on(table.taskName),
  statusIdx: index('etl_logs_status_idx').on(table.status),
  startTimeIdx: index('etl_logs_start_time_idx').on(table.startTime),
}))

export type TrafficRaw = typeof trafficRaw.$inferSelect
export type NewTrafficRaw = typeof trafficRaw.$inferInsert
export type TrafficSummary = typeof trafficSummary.$inferSelect
export type NewTrafficSummary = typeof trafficSummary.$inferInsert
export type VisitorPath = typeof visitorPaths.$inferSelect
export type NewVisitorPath = typeof visitorPaths.$inferInsert
export type SearchKeyword = typeof searchKeywords.$inferSelect
export type NewSearchKeyword = typeof searchKeywords.$inferInsert
export type PathInsight = typeof pathInsights.$inferSelect
export type NewPathInsight = typeof pathInsights.$inferInsert
export type EtlLog = typeof etlLogs.$inferSelect
export type NewEtlLog = typeof etlLogs.$inferInsert
export type AuditLog = typeof auditLogs.$inferSelect
export type NewAuditLog = typeof auditLogs.$inferInsert
