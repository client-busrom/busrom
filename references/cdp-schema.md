# CDP 数据库与 API 参考

> 对应代码：`cdp/src/db/schema.ts`、`cdp/src/app/api/*`

---

## 数据表

### 1. `traffic_raw` — 原始访问事件

用途：接收前端埋点，逐条记录页面浏览、点击、滚动、表单提交等事件。

核心列：

| 列 | 说明 |
|----|------|
| `session_id` / `visitor_id` | 会话与访客标识 |
| `page_path` | 页面路径 |
| `referrer` / `utm_*` | 来源与 UTM 参数 |
| `channel` | 渠道：organic、ad、direct、referral、social |
| `device_type` / `browser` / `os` | 设备与客户端信息 |
| `country` / `city` | GeoIP 解析结果 |
| `ip_address` / `user_agent` | 原始 IP 与 UA |
| `event_type` | pageview、click、scroll、form_submit |
| `event_data` | JSONB 额外事件数据 |
| `timestamp` | 事件发生时戳 |

索引：`session_id`、`visitor_id`、`page_path`、`timestamp`、`channel`、`event_type`。

---

### 2. `traffic_summary` — 每日汇总指标

用途：ETL 按天聚合，支撑看板/overview 快速查询。

核心列：

| 列 | 说明 |
|----|------|
| `date` | YYYY-MM-DD |
| `page_path` / `channel` | 支持按页面/渠道拆分；默认 `all` |
| `pv` / `uv` / `sessions` | 基础流量指标 |
| `bounce_rate` / `avg_duration` | 跳出率、平均访问时长 |
| `conversions` / `form_submissions` / `conversion_rate` | 转化指标 |
| `device_breakdown` / `browser_breakdown` / `country_breakdown` | JSONB 分布 |
| `*_change_day/week/month` | 日/周/月环比 |

索引：`date`、`(date, channel)`、`(date, page_path)`、`(date, page_path, channel)`。

---

### 3. `visitor_paths` — 访客路径

用途：行为流向图、entry/exit 页面、转化路径分析。

核心列：

| 列 | 说明 |
|----|------|
| `session_id` / `visitor_id` | 会话/访客 |
| `path_sequence` | JSONB 路径数组，如 `["/", "/products", "/contact"]` |
| `entry_page` / `exit_page` | 进入/退出页 |
| `page_count` / `duration` | 深度与时长 |
| `converted` / `conversion_page` | 是否转化及转化页 |
| `date` | 归属日期 |

索引：`session_id`、`date`、`entry_page`。

---

### 4. `search_keywords` — 搜索关键词

用途：SEO/SEM 关键词表现分析。

核心列：

| 列 | 说明 |
|----|------|
| `date` | 日期 |
| `keyword` / `page_path` | 关键词与落地页 |
| `channel` | organic / paid |
| `search_engine` | google、bing、baidu |
| `impressions` / `clicks` / `ctr` / `position` | 搜索指标 |

索引：`date`、`keyword`、`(date, keyword)`。

---

### 5. `path_insights` — 路径洞察聚合

用途：按日期预聚合 top_paths、entry_pages、exit_pages、drop_offs、conversion_paths。

核心列：

| 列 | 说明 |
|----|------|
| `date` | 日期 |
| `insight_type` | top_paths / entry_pages / exit_pages / drop_offs / conversion_paths |
| `insight_key` | 路径字符串或页面路径 |
| `value` | 出现次数/用户数 |
| `conversion_count` / `conversion_rate` | 关联转化 |
| `metadata` | JSONB 额外信息 |

索引：`date`、`insight_type`、`(date, insight_type)`。

---

### 6. `etl_logs` — ETL 任务日志

用途：记录每次 ETL 运行状态、处理量、错误信息。

核心列：

| 列 | 说明 |
|----|------|
| `task_name` | 任务名 |
| `status` | running / success / failed |
| `start_time` / `end_time` | 起止时间 |
| `records_processed` | 处理记录数 |
| `error_message` / `details` | 错误与详情 |

索引：`task_name`、`status`、`start_time`。

---

## API 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| `POST` | `/api/analytics/track` | 前端埋点接入，写入 `traffic_raw` |
| `GET`  | `/api/analytics/summary` | 查询汇总数据；`type` 参数见下 |
| `POST` | `/api/analytics/summary?action=run-etl` | 手动触发 ETL（需 `ETL_API_KEY` 或 Payload JWT） |
| `GET`  | `/api/analytics/export` | 导出原始/汇总数据（CSV/JSON） |
| `GET`  | `/api/health` | 健康检查 |

`GET /api/analytics/summary` 常用 `type`：

- `summary`（默认）
- `overview`
- `paths`
- `path-insights`
- `keywords`
- `top-pages`
- `device-breakdown`
- `browser-breakdown`
- `country-breakdown`
- `channel-bounce`

---

## 关键环境变量

| 变量 | 说明 |
|------|------|
| `DATABASE_URL` | PostgreSQL 连接字符串，如 `postgresql://user:pass@localhost:5432/busrom_cdp` |
| `PAYLOAD_SECRET` | Payload CMS JWT 签名密钥 |
| `PAYLOAD_CMS_URL` | Payload CMS 地址，用于 SSO/校验 |
| `ETL_API_KEY` | 内部 cron/CI 触发 ETL 的 API Key |
| `NEXT_PUBLIC_CDP_ENDPOINT` | 前端埋点上报地址 |
| `CDP_ANONYMIZE_IP` | 设为 `true` 时，写入 `traffic_raw` 前对 IP 做匿名化处理 |
