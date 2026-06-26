# CDP ETL 验证指南

## 本次改进点

1. **转化统计去重**
   - 由“按原始事件计数”改为“按会话+页面维度去重计数”。
   - 同一 session 在同一页面触发多次 `conversion` 或 `form_submit` 只计一次，避免刷单 inflate。

2. **访问路径保留完整序列**
   - `visitorPaths.pathSequence` 现在保存原始页面访问序列（含重复），而非去重后的路径。
   - 可真实还原用户浏览轨迹，支持后续漏斗和流失分析。

3. **路径洞察聚合**
   - ETL 已生成 `path_insights` 表数据：
     - `top_paths`：Top 10 热门完整路径
     - `entry_pages`：Top 10 入口页
     - `exit_pages`：Top 10 退出页
     - `drop_offs`：Top 10 流失点（单页访问）
     - `conversion_paths`：Top 10 高转化路径

4. **趋势对比**
   - 保持日环比（-1d）、周环比（-7d）、月环比（-30d）计算逻辑。
   - 仅在有对应历史同维度（date + pagePath + channel）数据时写入百分比，否则为 `null`。

## 本地验证步骤

### 1. 准备数据库

```bash
cd /Users/cerfbaleine/workspace/busrom-work
docker-compose up -d postgres

# 确保 busrom_cdp 数据库存在
cd /Users/cerfbaleine/workspace/busrom-work/cdp
npx drizzle-kit push
```

### 2. 写入测试埋点数据

可通过前端页面触发，或直接向采集接口 POST：

```bash
curl -X POST http://localhost:3003/api/analytics/track \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "sess-test-001",
    "visitorId": "visitor-test-001",
    "pagePath": "/products",
    "channel": "organic",
    "deviceType": "desktop",
    "browser": "Chrome",
    "country": "US",
    "eventType": "pageview",
    "timestamp": "2026-06-22T10:00:00Z"
  }'
```

建议为同一 session 生成多条 pageview，并加入 `form_submit`/`conversion` 事件以验证去重逻辑。

### 3. 手动执行 ETL

```bash
cd /Users/cerfbaleine/workspace/busrom-work/cdp
npx tsx src/jobs/run-etl.ts 2026-06-22
```

### 4. 验证汇总数据

```bash
curl "http://localhost:3003/api/analytics/summary?date=2026-06-22"
```

检查字段：

- `conversions`：应与发生转化的 session+页面 组合数一致
- `formSubmissions`：应与发生表单提交的 session+页面 组合数一致
- `pvChangeDay` / `pvChangeWeek` / `pvChangeMonth`：有历史数据时应为数字百分比

### 5. 验证路径数据

```bash
# 单条访问路径
curl "http://localhost:3003/api/analytics/summary?type=paths&date=2026-06-22"

# 聚合路径洞察
curl "http://localhost:3003/api/analytics/summary?type=path-insights&date=2026-06-22"
```

`path-insights` 返回按 `insightType` 分组的数据，例如：

```json
{
  "success": true,
  "data": {
    "top_paths": [...],
    "entry_pages": [...],
    "exit_pages": [...],
    "drop_offs": [...],
    "conversion_paths": [...]
  }
}
```

### 6. 验证数据库表

直接查询 PostgreSQL：

```sql
SELECT date, COUNT(*) AS raw_count FROM traffic_raw GROUP BY date;
SELECT date, COUNT(*) AS summary_count FROM traffic_summary GROUP BY date;
SELECT date, COUNT(*) AS path_count FROM visitor_paths GROUP BY date;
SELECT date, insight_type, COUNT(*) FROM path_insights GROUP BY date, insight_type;
SELECT * FROM etl_logs ORDER BY start_time DESC LIMIT 5;
```

## 自动化 cron 建议

生产环境可通过 Vercel Cron、AWS EventBridge 或系统 cron 每日触发：

```bash
curl -X POST "https://cdp.busromhouse.com/api/analytics/summary?action=run-etl" \
  -H "x-etl-api-key: $ETL_API_KEY"
```
