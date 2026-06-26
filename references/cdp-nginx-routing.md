# CDP Nginx 网关路由参考

> 对应配置：`docker/nginx/gateway.conf`

---

## 本地开发 hosts

在 `/etc/hosts` 或 `.hosts` 中配置：

```
127.0.0.1  busrom.local
127.0.0.1  cms.busrom.local
127.0.0.1  cdp.busrom.local
```

项目已提供 `.hosts` 文件，可直接同步到系统 hosts。

---

## 端口映射

| 服务 | 端口 | 说明 |
|------|------|------|
| Web Frontend | 3001 | Next.js 前端 |
| Payload CMS | 3002 | CMS 与 API |
| CDP | 3003 | 分析与 ETL |
| Superset | 8088 | BI 看板 |
| Nginx Gateway | 80 / 443 | 统一入口（本地 80，生产 443） |

---

## `/api/analytics/*` 路由说明

`docker/nginx/gateway.conf` 中，`cdp.busrom.local` server 块处理所有 CDP 流量：

```nginx
upstream cdp_api_backend {
    server host.docker.internal:3003;
}

server {
    listen 80;
    server_name cdp.busrom.local;

    location / {
        proxy_pass http://cdp_api_backend;
        # ... 标准代理头
    }

    location /api/analytics/ {
        proxy_pass http://cdp_api_backend;
        # ... 标准代理头
    }

    location /superset/ {
        proxy_pass http://superset_backend/;
    }
}
```

关键点：

- `cdp.busrom.local` 下所有请求默认转发到 CDP 服务（3003）。
- `/api/analytics/` 单独声明，明确该路径属于 CDP API。
- Superset 通过 `/superset/` 路径代理到 8088。
- 代理头携带 `Host`、`X-Real-IP`、`X-Forwarded-For`、`X-Forwarded-Proto`，便于 CDP 做 GeoIP 和协议识别。

启动顺序建议：

1. 启动 PostgreSQL、Payload CMS（3002）、Web（3001）、CDP（3003）、Superset（8088）。
2. 启动 Nginx Gateway：`docker-compose -f docker-compose.gateway.yml up -d`。
3. 访问 `http://cdp.busrom.local/api/health` 验证 CDP 连通性。
