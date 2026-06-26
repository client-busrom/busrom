数据分析系统开发说明文档

# 模块定位与目标

CDP（Customer Database Platform）为 Busrom 官网数据分析模块，旨在实现网站用户访问行为数据的自动采集、结构化存储与分析，并为运营团队提供直观的流量趋势、渠道结构、访问路径、跳出率等指标展示。

系统为自建的轻量用户行为数据平台（CDP），用于整合并分析网站数据，主要包括：自动区分自然流量与广告流量，监测指标变化趋势，并根据数据变化自动生成 SEO 和广告投放的优化建议，帮助提升网站访问质量和营销效果。

该模块供内部使用，与 Payload CMS 后台深度集成，需要对其做权限限制，主要作用是辅助决策和提升网站运营效果。

核心能力：
- 通过前端埋点采集原始行为事件。
- 存储原始埋点（Traffic Raw）及每日汇总（Traffic Summary）。
- 通过 ETL 任务完成会话组装、清洗和指标汇总。
- 使用 Apache Superset 作为可视化分析平台，提供图表、仪表盘、即席查询。
- 基于规则和轻量 AI 生成 SEO 与广告优化建议。

---

# 总体架构

CDP 现在采用 "Apache Superset + CDP Next.js 服务" 的混合架构：

| 组件 | 作用 | 部署位置 |
|---|---|---|
| Apache Superset | 可视化 UI、仪表盘、图表、即席查询 | 独立容器/服务，访问地址为 `cdp.busrom.local`（本地）/ `cdp.busromhouse.com`（生产） |
| CDP Next.js 服务（`cdp/` 目录） | 埋点 API、ETL、数据模型、与 CMS 的认证对接 | 独立 Next.js 应用 |
| PostgreSQL | 共享 RDS/PostgreSQL 实例，使用独立逻辑库 `busrom_cdp` | 与 Payload CMS 同一数据库实例 |

**废弃说明**：原方案中 "使用 React + Tailwind CSS 自建可视化大屏" 已废弃。CDP 不再维护独立的可视化前端，所有数据查看和报表均通过 Superset 完成。

整体数据流向：

```
用户浏览器
  → 前端埋点脚本
  → CDP Next.js 后端 /api/analytics/track
  → busrom_cdp 原始事件表 (traffic_raw)
  → 定时 ETL 任务
  → busrom_cdp 汇总表 (traffic_summary 等)
  → Apache Superset 数据集 / 图表 / 仪表盘
  → 运营人员查看分析结果
```

---

# 域名与路由

## 本地开发

- `cdp.busrom.local` → Apache Superset（端口 `8088`）。
- `cms.busrom.local` → Payload CMS 后台。
- CDP Next.js 服务 API 域名通常与 CMS 共用，例如：
  - `https://cms.busrom.local/api/analytics/track`（前端埋点上报）。
  - 或独立的 CDP 服务域名，视部署配置而定。

## 生产环境

- `cdp.busromhouse.com` → Apache Superset。
- `cms.busromhouse.com` → Payload CMS。
- `/api/analytics/track` 路由由 CDP Next.js 服务（或统一网关）提供。

## 路由拆分原则

| 访问路径 | 目标服务 | 说明 |
|---|---|---|
| `cdp.busrom.local` / `cdp.busromhouse.com` | Superset | 所有数据分析 UI |
| `/api/analytics/track` | CDP Next.js 服务 | 前端埋点写入接口 |
| `/api/analytics/*`（其他 ETL/查询 API） | CDP Next.js 服务 | 内部或 Superset 数据集对接 |

---

# 数据库设计

## 共享 PostgreSQL 实例

CDP 与 Payload CMS 共用同一个 RDS/PostgreSQL 实例，但使用独立的逻辑数据库：

```
PostgreSQL 实例
├── busrom_cms        (Payload CMS 业务数据)
├── busrom_cdp        (CDP 埋点、汇总、ETL 数据)
```

## 逻辑库划分

- 库名：`busrom_cdp`。
- 通过独立的连接字符串访问，避免与 CMS 表冲突。
- 数据模型由 CDP Next.js 服务通过 Drizzle ORM 管理。
- 若 Superset 需要读取 CDP 数据，使用只读账号连接 `busrom_cdp`。

## 核心数据表

- `traffic_raw`：原始埋点事件。
- `traffic_summary`：按日/渠道/页面等维度汇总的指标。
- `sessions`：会话组装结果。
- `conversions`：表单/聊天/点击等转化事件。
- `optimization_suggestions`：自动生成的运营建议（可选）。

---

# 数据采集（埋点）

在网站前端页面中埋点，收集用户访问行为数据，包括页面路径、来源、UTM 参数、设备、浏览器、国家地区等。数据通过后端接口实时写入 PostgreSQL。

主要采集字段：
- 页面路径、页面标题、来源页面（referrer）。
- UTM 参数（source / medium / campaign / term / content）。
- 设备类型、浏览器类型、操作系统、屏幕分辨率。
- IP 解析后的国家/地区。
- 会话标识（session_id）、访客标识（visitor_id）。
- 转化动作：表单提交、聊天点击、WhatsApp 点击、Email 点击等。

上报接口：`POST /api/analytics/track`

---

# 数据处理与 ETL

自动定期从原始访问数据表中抽取数据，进行清洗、会话组装和统计计算（例如计算访问次数、独立访客、跳出率等），将结果写入汇总表供 Superset 查询。

ETL 流程参考标准的 Extract-Transform-Load 模式：
1. Extract：从 `traffic_raw` 读取增量事件。
2. Transform：会话切割（15 分钟无操作、关闭浏览器、跨天）、渠道归类、去重、指标计算。
3. Load：写入 `traffic_summary`、`sessions`、`conversions` 等表。

ETL 任务使用独立进程或定时触发器执行（如 Vercel Cron、AWS Lambda、Docker 定时任务），避免影响 CMS 主服务。

---

# 可视化分析平台（Apache Superset）

CDP 的数据可视化与探索全部在 Apache Superset 中完成，不再自建 React + Tailwind CSS 大屏。

Superset 负责：
- 连接 `busrom_cdp` 数据库，创建数据集（Dataset）。
- 基于汇总表创建图表（Chart）：趋势图、饼图、漏斗图、表格等。
- 组合仪表盘（Dashboard）：流量总览、渠道分析、页面路径、转化漏斗、设备分布等。
- 即席查询（SQL Lab）：技术/运营人员可直接写 SQL 探查数据。

为保证分析结果准确，所有埋点数据须经 ETL 流程完成基础清洗与规则处理后，方可进入 Superset 展示。

---

# 单点登录（SSO）

Superset 的访问入口集成在 Payload CMS 中。用户使用 Payload CMS 的 JWT 登录 Superset，无需单独注册 Superset 账号。

## 登录场景

### 已登录 CMS

用户已在 `cms.busromhouse.com` 登录。

1. 用户点击 CMS 后台导航栏的 "数据分析"。
2. 浏览器跳转至 `cdp.busromhouse.com`。
3. Superset 自定义认证层读取 Payload CMS JWT（Cookie 或 URL 参数传递）。
4. 向 Payload CMS 校验 JWT 有效性及用户角色。
5. 校验通过后，Superset 自动、静默地完成登录。
6. 用户直接进入 Superset 仪表盘，无需输入账号密码。

### 未登录 CMS

用户未在 `cms.busromhouse.com` 登录。

1. 用户点击 CMS 后台导航栏的 "数据分析"，或直接访问 `cdp.busromhouse.com`。
2. Superset 未检测到有效 Payload JWT。
3. 将用户重定向到 Payload CMS 登录页（`cms.busromhouse.com/admin/login`）。
4. 用户完成 CMS 登录。
5. Payload CMS 将用户重定向回 `cdp.busromhouse.com`，并携带 JWT。
6. Superset 校验 JWT 后静默登录。

## 角色映射

- Payload CMS 角色：`admin`、`editor`、`analytics` 等。
- Superset 角色：`Admin`、`Alpha`、`Gamma`、`Public` 等。
- 登录时根据 Payload 角色映射到对应的 Superset 角色。未授权用户禁止访问，返回 403 或重定向到 CMS。

## 安全要求

- JWT 必须设置 HttpOnly / Secure / SameSite 等安全属性（按实际部署环境配置）。
- Superset 与 CMS 间使用 HTTPS 通信。
- 避免在 URL 中明文暴露 JWT；优先通过受信任的 Cookie 或安全重定向参数传递。

---

# 与 CMS 的集成

## 导航入口

在 Payload CMS 后台导航栏添加 "数据分析" 菜单项：
- 点击后跳转至 `cdp.busromhouse.com`。
- 仅对拥有 `analytics`、`admin`、`editor` 等角色的用户可见。

## 权限控制

- 复用 Payload CMS 的账号体系和 RBAC 权限模型。
- Superset 本身不维护独立的 Busrom 用户体系，仅保留 Superset 内置角色模板。
- CDP Next.js 服务在需要时调用 Payload CMS Auth API 或校验 JWT，确保用户无需重复登录。
- 未授权用户访问 CDP 时，自动重定向到 CMS 登录页或返回 403。

## 日志与审计

- CDP 通过 `audit_logs` 表记录关键操作日志：
  - 数据导出：`/api/analytics/export` 中任何 `type` 的导出都会写入 `export_summary` / `export_keywords` / `export_path_insights` 等 action。
  - 报表查看：`/api/analytics/summary?type=keywords` 等高敏感读操作会写入 `view_report` action。
  - ETL 触发：`/api/analytics/summary?action=run-etl` 会写入 `run_etl` action。
  - 记录字段包括 `user_id`、`user_email`、`action`、`resource_type`、`resource_id`、`details`（JSONB）、`ip_address`、`user_agent`、`created_at`。
- 敏感数据（访客 IP、城市、原始 User-Agent 等）在 API 响应中根据角色脱敏：
  - `admin`：返回原始数据。
  - `editor` / `analytics`：IP 匿名化最后一组（IPv4）/ 最后一个 hextet（IPv6），城市替换为 `MASKED`，原始 UA 替换为 `[REDACTED]`。
- 审计日志中的 `ip_address` 也遵循上述隐私策略：仅 admin 访问日志保留原始 IP，其他角色自动匿名化，与 `CDP_ANONYMIZE_IP` / GDPR 的埋点匿名化策略保持一致。

---

# 部署说明

## 本地开发（Docker）

- 使用 `docker/` 目录下的 Superset 配置启动 Superset 容器，监听 `8088` 端口。
- 配置本地 hosts：
  ```
  127.0.0.1  cdp.busrom.local
  127.0.0.1  cms.busrom.local
  ```
- CDP Next.js 服务与 Payload CMS 服务在同一 Docker Compose 网络中运行，连接共享 PostgreSQL 的 `busrom_cdp` 库。
- Superset 通过 PostgreSQL 只读账号连接 `busrom_cdp`。

## 生产环境

- Superset 部署在独立服务/容器中，使用域名 `cdp.busromhouse.com`。
- CDP Next.js 服务独立部署，承担 API 与 ETL 职责。
- Payload CMS 部署在 `cms.busromhouse.com`。
- 三者通过共享 RDS/PostgreSQL 实例连接，其中 CDP 使用 `busrom_cdp` 库。
- 配置反向代理（如 Nginx / ALB）将 `cdp.busromhouse.com` 路由到 Superset。

## 扩展与性能

- CDP Next.js 服务可根据埋点并发和 ETL 负载独立扩缩容。
- ETL 任务独立运行，避免影响 CMS 主服务。
- Superset 可独立扩展查询缓存、Worker 节点等。

---

# 分析系统中的数据指标

## 基础指标

**页面浏览量（PV）**：页面被加载或刷新的次数，即衡量内容被浏览的总次数。

**独立访客数（UV）**：在统计周期内访问网站的不同访客数量，同一访客在同一时间多次访问只计一次。

**访问次数（Sessions）**：又称会话数，用户在一定时间内访问网站的一次完整访问过程（一人多次访问会产生多个会话）。

设置当出现以下情况时，该访问次数会被重新标记：
1. 该访客 15 分钟没有进行任何操作（可配置为默认时间）。
2. 访客关闭浏览器或离开网站。
3. 过了凌晨 12 点（以凌晨 12 点为时间界限，重新计算）。

**平均每次访问浏览的网站页数（PV/Sessions）**：用户每次来网站平均看了几页的内容。公式 = 页面浏览量 ÷ 访问次数。

**跳出率（Bounce Rate）**：只查看一个页面后短时间内就离开网站的比例（包含点击进入但未加载完整网页）。公式 = 只看一个页面就离开的访问次数 ÷ 总访问次数。

**平均访问时长（Avg. Duration）**：访客每次访问的平均停留时长，以秒（"S"）作为时间单位。

**转化次数（Conversion Count）**：在统计周期内达成目标动作的总次数（即在周期内提交表单的总次数）。

目标动作包括：提交表单、点击按钮进行聊天（包括 WhatsApp、Email 或 "在线聊天"）。

**转化率（Conversion Rate）**：达成目标动作的访问占比。公式 = 转化次数 ÷ 总访问次数。

## 趋势与对比指标

**日环比（Day-over-Day）**：与前一天同一指标数值的比值。增长幅度用红色标记且添加 "+"，下降幅度用绿色标记且添加 "-"。

**周环比（Week-over-Week）**：与前一周同一指标数值的比值。增长幅度用红色标记且添加 "+"，下降幅度用绿色标记且添加 "-"。

**月环比（Month-over-Month）**：与前一月份指标数值的比值。增长幅度用红色标记且添加 "+"，下降幅度用绿色标记且添加 "-"。

**7 日趋势（7-Day Trend）**：最近 7 天内某指标的每日变化曲线。

**30 日趋势（30-Day Trend）**：最近 30 天内某指标的每日变化曲线。

## 渠道指标

**自然流量访问量（Organic Visits）**：自然搜索的访问次数（搜索引擎非付费来的流量）。

**广告流量访问量（AD Visits）**：付费广告的访问次数（主要是付费渠道来的流量）。

**直接访问量（Direct Visits）**：未带来源标识的直接访问次数（域名输入或书签收藏）。

**引荐流量访问量（Referral Visits）**：来自其他网站外链的推荐链接点击次数（非搜索引擎、非付费广告点击）。

**社交流量访问量（Social Visits）**：来自社交媒体平台的访问次数（主要为 Facebook、Instagram、YouTube、LinkedIn、Twitter、TikTok、Pinterest、Reddit、Rednote 等）。

**渠道占比（Channel Share）**：各渠道访问量在总访问量中所占比例（上方 5 个渠道分别占比）。

**渠道跳出率（Channel Bounce Rate）**：各渠道的跳出率。公式 = 通过该渠道跳转链接后只看一个页面就离开的访问次数 ÷ 该渠道总访问次数。

## 热门页面 & 路径指标

**热门页面（Top Pages）**：按页面浏览量排名前 10 的页面路径及对应访问量。

**入口页（Top Entry Pages）**：访客首次进入网站时访问的页面，需要展示出该入口页的占比。公式 = 访客进入网站时浏览该入口页的浏览量 ÷ 访客进入网站时浏览所有入口页的总浏览量。

**退出页（Top Exit Pages）**：访客离开网站前最后访问的页面，需要展示出该退出页的占比。公式 = 访客退出网站前访问的页面的浏览量 ÷ 访客退出网站时浏览所有出口页的总浏览量。

**热门访问路径（Popular Paths）**：主要用于构建行为流向图。该路径需主要储存在数据库中，用于优化 SEO 和广告的时候，可以根据页面进行特定的优化。

例如该访客的浏览路径为：页面 A → 页面 B → 页面 C / 页面 B → 页面 A → 页面 C。主要是需要此路径行为图来直观知道访客主要是通过什么路径来填写表单发送询单，或者观看了哪一页网页之后跳失的。

## 转化与表单指标

**表单提交次数（Form Submission Count）**：在线表单被提交的总次数（网站表单、实时聊天）。

**表单转化率（Form Conversion Rate）**：表单转化的比例（包括网站表单、实时聊天）。公式 = 表单提交次数 ÷ 访问量。

**线索数（Lead Count）**：访客通过触发其他关键动作而生成的潜在客户数量（包括点击网站的 WhatsApp 添加链接、Email 发送链接）。

## 用户画像 & 设备指标

**设备类型（Visits by Device）**：按电脑端、手机端、平板端设备类型划分的访问量。

**浏览器类型（Visits by Browser）**：按浏览器类型划分的访问量（如 Chrome、Safari、Firefox、Edge 等国际主要浏览器）。

**国家地区类型（Visits by Country）**：按国家和地区划分的访问量（如该访问的 IP 位于哪个国家或地区，统计其访问量）。

---

# 优化建议指标

用于 Superset 仪表盘侧边或独立报表中展示系统自动生成的运营建议。

## SEO 优化建议参考

当跳出率 > 50% 时，示例建议文本：
> 当前跳出率过高，大部分/多数用户在访问 XXX 页面时/加载 XXX 页面时退出了网站，建议优化页面核心内容及加载速度，增强用户留存，优化方法如下 XXXXXXXXX（根据网站内容或结构给出较为具体的优化方案）。

当自然搜索流量下降 10% 时，示例建议文本：
> 当日/周/月自然搜索流量下降了 10%，建议检查关键词排名及 Meta 描述是否准确，优化方法如下 XXXXXXX（需要找出数据的影响源头并给出对策，是关键词流量下降了还是网站排名掉了，考虑是增加关键词数量还是优化 SEO 关键词，如果页面近期有过更新，可使用 XXX 通知搜索引擎加速抓取）。

根据 Google Indexing / IndexNow 协议，自动检查网站的 robots.txt、sitemap、Title/Meta 标签等，若发现问题生成建议。比如：
- 建议在 robots.txt 中允许搜索引擎抓取核心页面。
- 请为页面 Z 补充 title 和 meta description。

## 广告优化建议参考

当付费渠道流量下降 20% 时，示例建议文本：
> 当日/周/月付费广告渠道流量下降了 20%，建议调整广告文案/出价策略，优化方法如下 XXXXXX（需要列出具体方案，是优化广告文案还是广告着陆页）。

## 转化优化建议参考

当转化率低于 2% 时，示例建议文本：
> 当日/周/月转化率低于 2% 时，建议优化表单简化流程或增加用户信任要素，优化方法如下 XXXXXXXX（需要列出哪些渠道来的客户的转化率低，如何提高该渠道接入客户的质量，比如添加精准长尾关键词等）。

## 内容更新建议参考

结合关键词排名和访问趋势，如果某个内容页面流量持续下降，建议更新内容或添加内部链接。

例如：页面 Y 在过去 7/30 天流量下降，考虑增加相关内容或优化 SEO 关键词。

## 趋势异常提醒建议参考

如果流量或指标出现异常波动（如突增或骤降），系统生成分析建议：
- 昨日/上周/上月访问量显著上升，可能与 XXX 相关，建议 XXX。
- 昨日/上周/上月访问量下降明显，建议检查网站状态或内容更新情况。

**注意**：所有建议需要基于网站本身数据为出发点，而且可以根据时间周期来展示数据，然后根据展示的数据找出哪些数据异常，并且建议如何进行调整。需要采集并列出对应的关键词，比如该访客是通过哪些关键词进来访问网站的，后台需要有可以查询并导出关键词词表，特别是 "热门页面 & 路径指标" 和 "广告流量" 这两大板块的数据。

---

# 废弃内容记录

以下内容仅为历史参考，已不再作为当前 CDP 的主要实现方案。

## 原 UI 方案（已废弃）

原方案计划使用 React + Tailwind CSS 自建可视化大屏作为 CDP 的主要 UI，保持与 CMS 后台视觉风格一致，并支持导出报表、关键词表等功能。

废弃原因：
- Apache Superset 作为开源 BI 工具，已能满足仪表盘、图表、即席查询等需求。
- 避免重复开发可视化组件和图表库，降低维护成本。
- Superset 支持更灵活的自助式分析，运营人员可自定义报表。

因此，`cdp/` 服务现在只保留埋点 API 与 ETL，不维护独立的可视化前端页面。
