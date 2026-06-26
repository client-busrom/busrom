# CDP Nginx Gateway 验证指南

## 配置概览

统一入口网关位于 `docker/nginx/gateway.conf`，通过 `docker-compose.gateway.yml` 启动。

路由规则：

| 域名 | 目标服务 | 本地端口 |
|------|---------|---------|
| busrom.local | Web Frontend (Next.js) | 3001 |
| cms.busrom.local | Payload CMS | 3002 |
| cdp.busrom.local | CDP Analytics (Next.js) | 3003 |
| cdp.busrom.local/superset/ | Apache Superset | 8088 |

## 本地验证步骤

### 1. 配置 hosts

确保 `/etc/hosts` 包含以下条目（项目已提供 `.hosts` 文件）：

```text
127.0.0.1  busrom.local
127.0.0.1  cms.busrom.local
127.0.0.1  cdp.busrom.local
127.0.0.1  api.busrom.local
```

Linux/macOS 可执行：

```bash
sudo cp /Users/cerfbaleine/workspace/busrom-work/.hosts /etc/hosts.busrom
sudo sh -c 'cat /Users/cerfbaleine/workspace/busrom-work/.hosts >> /etc/hosts'
```

### 2. 启动依赖服务

```bash
cd /Users/cerfbaleine/workspace/busrom-work
docker-compose up -d
```

### 3. 启动 CDP 服务

```bash
cd /Users/cerfbaleine/workspace/busrom-work/cdp
cp .env.example .env
npm install
npm run dev
```

CDP 默认监听 `0.0.0.0:3003`。

### 4. 启动网关

```bash
cd /Users/cerfbaleine/workspace/busrom-work
docker-compose -f docker-compose.yml -f docker-compose.gateway.yml up -d nginx-gateway
```

### 5. 端到端验证

```bash
# 网关健康检查
curl -i http://localhost/health

# 通过域名访问 CDP 首页
curl -i -H "Host: cdp.busrom.local" http://localhost/

# 通过域名访问 CDP API
curl -i -H "Host: cdp.busrom.local" http://localhost/api/health

# 通过域名访问 Superset
curl -i -H "Host: cdp.busrom.local" http://localhost/superset/

# 浏览器访问
open http://cdp.busrom.local
```

### 6. 预期结果

- `http://cdp.busrom.local` 返回 CDP Dashboard HTML
- `http://cdp.busrom.local/api/health` 返回 JSON `{ healthy: true }`
- `http://cdp.busrom.local/superset/` 返回 Superset 登录页
- `http://busrom.local` 返回 Web 前端
- `http://cms.busrom.local` 返回 Payload CMS

## 常见问题

### `host.docker.internal` 无法解析

在较旧 Linux  Docker 引擎上，需手动添加：

```yaml
extra_hosts:
  - "host.docker.internal:host-gateway"
```

`docker-compose.gateway.yml` 已包含此配置。

### 端口 80 被占用

 macOS 可能已有系统服务占用 80 端口。可临时停止或改用高位端口映射：

```yaml
ports:
  - "8081:80"
```

然后访问 `http://cdp.busrom.local:8081`。

### CDP 服务未启动

网关配置依赖宿主机上的 CDP 服务运行在 `127.0.0.1:3003`。确认：

```bash
lsof -i :3003
```

