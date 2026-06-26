# Superset Dashboard 说明

## 导出/导入 Dashboard

1. 进入 Superset UI：`http://cdp.busrom.local/superset/`（或本地 `http://localhost:8088`）。
2. 打开目标 Dashboard，点击右上角 **⋮ → Export**。
3. 选择导出格式（推荐 JSON），下载得到 dashboard 定义文件。
4. 导入时进入 **+ → Import Dashboard**，上传 JSON 文件即可。

> 提示：导出/导入会同时携带 chart、dataset、metadata 等依赖；若目标环境数据库连接不同，需重新配置 dataset 的 SQLAlchemy URI。

## CDP 默认 Chart 建议

为配合 `traffic_summary`、`traffic_raw`、`visitor_paths` 表，建议默认创建以下 Chart：

| Chart | 数据源 | 用途 |
|-------|--------|------|
| **PV 趋势** | `traffic_summary` | 按 `date` 汇总 `pv`，展示每日流量走势 |
| **渠道分布** | `traffic_summary` | 按 `channel` 汇总 `sessions`，饼图/环形图展示渠道占比 |
| **转化漏斗** | `visitor_paths` + `traffic_raw` | 从入口页 → 产品页 → 联系页 → 表单提交，计算每步转化率 |
| **Top Pages** | `traffic_summary` | 按 `page_path` 汇总 `pv`，展示高访问量页面 |
| **设备分布** | `traffic_summary` | 展开 `device_breakdown` JSONB，展示 desktop/mobile/tablet 占比 |

建议把这些 Chart 组装到一个名为 **Busrom CDP Overview** 的 Dashboard 中，作为运营日常监控入口。
