# Superset ↔ Payload CMS SSO 设计方案

> **范围：** 仅用于研究与实现设计，暂不改动生产代码。  
> **目标：** 当用户已持有有效的 Payload CMS `payload-token` Cookie 时，Apache Superset 静默完成登录；当 Cookie 缺失或无效时，将用户重定向至 Payload CMS 登录页。

---

## 1. Payload CMS 如何签发 JWT

### 1.1 Token 签名方式

| 属性 | 值 |
|---|---|
| 算法 | `HS256`（HMAC-SHA-256） |
| 配置密钥 | `process.env.PAYLOAD_SECRET`（由 Payload、CDP 以及后续 Superset 共享） |
| 实际签名密钥 | `crypto.createHash('sha256').update(PAYLOAD_SECRET).digest('hex').slice(0, 32)` — Payload 在内部对配置密钥做 SHA-256 并取前 32 位十六进制字符 |
| 库 | `jose`（`new SignJWT(...).sign(secretKey)`） |
| 有效期 | `collection.auth.tokenExpiration = 28800` 秒 = **8 小时**（`Users.ts`） |

### 1.2 Cookie 属性

Payload 在 `payload/dist/auth/cookies.js` 中生成 Cookie：

| 属性 | 当前值 | 说明 |
|---|---|---|
| 名称 | `payload-token` | `${cookiePrefix}-token`，默认前缀为 `payload` |
| `HttpOnly` | `true` | 无法被 JavaScript 读取 |
| `Path` | `/` |  |
| `Expires` | 当前时间 + 8 小时 |  |
| `Domain` | **未设置** | Cookie 限定在签发它的精确主机（`cms.busrom.local`） |
| `SameSite` | **未设置** | 回退到浏览器默认值（通常为 `Lax`） |
| `Secure` | **未设置** | 本地开发使用 HTTP，因此不需要 |

**后果：** 当前 Cookie 不会从 `cdp.busrom.local` 发送到 `cms.busrom.local`，因为 Domain 是主机级作用域。要实现 SSO，必须显式配置 Cookie 的 Domain。

### 1.3 JWT Payload 字段（默认值 vs. CDP 预期值）

默认 Payload JWT payload（`auth/getFieldsToSign.js` + `auth/jwt.js`）：

```json
{
  "id": 1,
  "collection": "users",
  "email": "admin@busrom.com",
  "sid": "...",
  "iat": 1778214062,
  "exp": 1778242862
}
```

CDP 中间件（`cdp/src/middleware.ts`） additionally 需要 `user.isAdmin` 和 `user.roles`，但 **这些字段默认不会写入 JWT**，因为 `Users` 集合中的字段没有设置 `saveToJWT: true`。

这意味着：

- 除非角色被嵌入 JWT，或在验证后从 Payload 获取，否则当前 CDP 中间件可能无法与真实 Payload Token 正确配合。
- Superset SSO 设计必须显式决定如何获取 `roles`、`isAdmin`、`name` 和 `status`。

可选解决方案：

1. 在 `Users.ts` 中为 `isAdmin`、`name`、`status` 以及一个归一化的 `roles` 字段添加 `saveToJWT: true`（或自定义键）。  
   - *注意：* `roles` 是一个指向 `roles` 集合的 `relationship`；直接保存可能嵌入 ID 或对象。更干净的做法是使用计算/虚拟字段，将角色代码（`admin`、`editor`、`analytics`）写入 JWT。
2. 在 Token 验证后查询用户。Token 已包含稳定的 `email` 和 `id`，因此 Superset 可以查询 Payload 的 PostgreSQL `users` 表（或调用 Payload 的 `/api/users/me`）来获取完整资料和角色。  
   - 现有的 `PayloadCMSSecurityManager` 在密码认证时已经采用这种方式。

> **建议：** 为 SSO 采用方案 2，以避免改动 JWT 结构，并复用现有的 Superset ↔ Payload 数据库查询模式。

---

## 2. 实现方案选项

### 2.1 方案 A — Superset 自定义 `SecurityManager`（推荐）

Superset 使用 Flask-AppBuilder 进行认证。我们扩展/重写 `docker/superset/superset_config.py` 中现有的 `PayloadCMSSecurityManager`，使其：

1. 从传入请求的 Cookie 中读取 `payload-token`（对于 API/嵌入场景，也可选读取 `Authorization: Bearer …` 请求头）。
2. 使用 PyJWT 和 **SHA-256 哈希后的密钥**（`hashlib.sha256(PAYLOAD_SECRET.encode()).hexdigest()[:32]`）验证 JWT 签名和有效期。
3. 从 Token 中提取 `email`。
4. 查询 Payload CMS 的 PostgreSQL `users` 表（或调用 Payload `/api/users/me`）以获取 `name`、`is_admin`、`status` 和角色。
5. 确认账户为 `active` 状态。
6. 将 Payload 角色映射为 Superset 角色，并以幂等方式创建/更新 Superset 用户。
7. 静默完成 Superset 登录。

为了实现“每次请求静默登录”，需注册一个 Flask `before_request` 钩子（通过 `FLASK_APP_MUTATOR` 或在自定义 SecurityManager 内部），其行为如下：

- 跳过静态资源、`/health`、`/login`、`/logout` 以及无需保护的 API 端点的认证检查。
- 若 `current_user.is_authenticated` → 不执行任何操作。
- 若无 `payload-token` Cookie → 重定向至 `${PAYLOAD_CMS_URL}/admin/login?redirect=${current_url}`。
- 若 Token 无效或已过期 → 清除 Cookie 并重定向至登录页。
- 若 Token 有效但用户缺少允许的角色 → 返回 403 或重定向至无权限页面。

#### 高层代码示意

```python
import hashlib
import os
import jwt
from flask import redirect, request, g
from flask_login import current_user
from superset.security import SupersetSecurityManager

class PayloadCMSSecurityManager(SupersetSecurityManager):
    def before_request(self):
        # 通过 FLASK_APP_MUTATOR 注册后调用
        if self._is_exempt_path(request.path):
            return
        if current_user.is_authenticated:
            return

        token = request.cookies.get('payload-token')
        if not token:
            return self._redirect_to_cms_login()

        try:
            payload = jwt.decode(
                token,
                hashlib.sha256(os.environ['PAYLOAD_SECRET'].encode()).hexdigest()[:32],
                algorithms=['HS256'],
                options={'require': ['exp']}
            )
        except jwt.InvalidTokenError:
            return self._redirect_to_cms_login(clear_cookie=True)

        user = self._lookup_payload_user(payload['email'])
        if not user or user['status'] != 'active':
            return self._redirect_to_cms_login(clear_cookie=True)

        superset_user = self._sync_user_to_superset(user)
        self.update_user_auth_stat(superset_user, True)
        login_user(superset_user, remember=False)
```

> 具体的 FAB 登录 API（`login_user`、`update_user_auth_stat` 等）必须在实现前，根据已安装的 Superset 4.1.1 源码进行确认。

### 2.2 方案 B — Nginx 验证 JWT + `AUTH_REMOTE_USER`

此方案中，Nginx 位于 Superset 之前，并注入可信请求头：

1. 用户访问 `cdp.busrom.local`。
2. Nginx 从 Cookie 中提取 `payload-token`。
3. Nginx 验证 JWT（签名、有效期、以及可能使用的 audience/issuer）。
4. 验证成功后，Nginx 在代理至 Superset 前设置 `X-Remote-User: <email>`，并可选设置 `X-Remote-Roles: ...`。
5. Superset 配置为 `AUTH_TYPE = AUTH_REMOTE_USER`，并信任 `X-Remote-User`。
6. 当 JWT 缺失或无效时，Nginx 重定向至 Payload CMS 登录页。

#### Nginx 如何验证 JWT

标准 `nginx:alpine` 镜像**不包含** JWT 验证功能。可选方案：

| 方案 | 优点 | 缺点 |
|---|---|---|
| **Nginx Plus** `ngx_http_auth_jwt_module` | 原生、快速、文档完善 | 商业许可证；当前未使用 |
| **OpenResty + lua-resty-jwt** | 开源，运行在 Nginx 内 | 需要替换网关镜像并维护 Lua 代码；增加一个需要保护的运行时 |
| **Nginx `auth_request` 到小型验证服务** | 将 JWT 逻辑保留在团队已熟悉的 Python/Node 中；使用标准 Nginx 模块 | 每次请求增加一次额外跳转；验证服务本身必须被妥善保护 |

对于开源环境，`auth_request` 是最现实的路径：

```nginx
location / {
    auth_request /_sso_validate;
    auth_request_set $remote_user $upstream_http_x_remote_user;
    proxy_set_header X-Remote-User $remote_user;
    proxy_pass http://superset_backend;
}

location = /_sso_validate {
    internal;
    proxy_pass http://sso_validator/validate;
    proxy_pass_request_body off;
    proxy_set_header Content-Length "";
    proxy_set_header Cookie $http_cookie;
}
```

验证服务可以是一个小型 Flask/Fastify 应用，共享 `PAYLOAD_SECRET`，并可选择从 Payload 数据库查询角色。

---

## 3. 方案对比

| 评估维度 | 方案 A：Superset SecurityManager | 方案 B：Nginx + AUTH_REMOTE_USER |
|---|---|---|
| **代码归属** | 位于现有 `docker/superset/superset_config.py`；团队完全掌控 | 逻辑分散在 Nginx 配置和新的验证服务之间 |
| **现有基础** | `PayloadCMSSecurityManager` 已能查询 Payload DB 并同步用户 | 网关中目前无 JWT 验证层 |
| **基础设施改动** | 较小：更新 Superset 配置 + Dockerfile 依赖 | 中等：新增服务或自定义 Nginx 构建；更新 `gateway.conf` 和 compose |
| **Cookie 重定向流程** | 使用 Python 实现；便于构建 `?redirect=` URL | 使用 Nginx 实现；需要 `error_page 401` 重定向逻辑 |
| **角色映射灵活性** | 容易：可完全访问 Payload DB 和 Superset 角色 | 较困难：请求头是字符串；多角色映射需要解析 |
| **请求头伪造风险** | 低：Superset 直接读取 Cookie，不信任来自 Nginx 的请求头 | 较高：必须确保 `X-Remote-User` 不会被公网接受；只能由 Nginx 设置 |
| **API / 嵌入场景** | 可复用相同逻辑处理 `Authorization: Bearer` 请求头 | 仅限 Cookie，除非额外复制逻辑 |
| **调试/可观测性** | Python 堆栈跟踪、Superset 日志 | 分散在 Nginx 访问日志和验证服务日志中 |
| **运维复杂度** | 较低 | 较高 |

---

## 4. 推荐方案

**方案 A — Superset 自定义 `SecurityManager`，本地验证 JWT 并查询 Payload 数据库。**

理由：

- 复用现有的 `PayloadCMSSecurityManager` 和 `sync_users.py` 模式。
- 认证决策集中在后端团队熟悉的 Python 代码中。
- 避免引入新的 Nginx 模块/语言（Lua）或独立的验证微服务。
- 天然支持基于 Cookie 的浏览器 SSO 以及未来的 `Authorization: Bearer` API 访问，无需额外基础设施。
- 不存在请求头伪造风险，因为 Superset 永远不会信任传入的 `X-Remote-User` 请求头。

---

## 5. 分步实施计划

### 第一阶段 — Payload CMS Cookie 配置

1. 在 `payload-cms/src/collections/Users.ts` 的 `auth` 配置中新增 `cookies` 块，由环境变量驱动：

   ```ts
   auth: {
     tokenExpiration: 28800,
     maxLoginAttempts: 5,
     lockTime: 600 * 1000,
     cookies: {
       domain: process.env.COOKIE_DOMAIN || undefined,
       sameSite: (process.env.COOKIE_SAME_SITE as any) || 'Lax',
       secure: process.env.COOKIE_SECURE === 'true',
     },
   },
   ```

   - 本地开发：`COOKIE_DOMAIN=.busrom.local`、`COOKIE_SAME_SITE=Lax`、`COOKIE_SECURE=false`
   - 生产环境：`COOKIE_DOMAIN=.busromhouse.com`、`COOKIE_SAME_SITE=Lax`、`COOKIE_SECURE=true`

2. 验证登录后，`payload-token` 是否设置了 `Domain=.busrom.local`，并能被发送至 `cdp.busrom.local`。

### 第二阶段 — Superset 依赖

3. 更新 `docker/superset/Dockerfile` 以安装 PyJWT：

   ```dockerfile
   RUN pip install --no-cache-dir psycopg2-binary bcrypt pyjwt
   ```

   （如果 DB 密码路径被完全废弃，`bcrypt` 和 `psycopg2-binary` 后续可移除。）

### 第三阶段 — Superset SecurityManager

4. 重构 `docker/superset/superset_config.py`：

   - 将 `AUTH_TYPE = 1`（DB 认证）改为支持程序化登录的模型，或保留 DB 认证并覆盖登录流程。
   - 新增环境变量：`PAYLOAD_SECRET`、`PAYLOAD_CMS_URL`、`PAYLOAD_COOKIE_DOMAIN`、`PAYLOAD_SSO_ALLOWED_ROLES`、`PAYLOAD_SSO_DEFAULT_ROLE`。
   - 实现 `PayloadCMSSecurityManager` 方法：
     - `_validate_payload_token(token)` — 使用 PyJWT 解码。
     - `_lookup_payload_user(email)` — 查询 `users` + `users_roles` + `roles`，获取 email、name、status、is_admin、角色代码。
     - `_map_roles(payload_roles, is_admin)` → Superset 角色列表。
     - `_sync_user_to_superset(...)` — 幂等 upsert（可复用现有逻辑）。
   - 通过 `FLASK_APP_MUTATOR` 注册 `before_request` 钩子，执行静默 SSO 和重定向。
   - 移除或加门控当前基于 `auth_user_db` 的 bcrypt 路径；仅在需要直接 Superset 管理员访问时保留为 fallback。

5. 将 `SUPERSET_SECRET_KEY` 设置为 `.env` 和 Docker Compose 中的真实密钥（当前为硬编码默认值）。

### 第四阶段 — Nginx / 路由

6. 确定公网 URL 形态（参见“待确认问题”）：

   - **方案 A1：** Superset 位于根路径（`cdp.busrom.local/`），Next.js CDP 仪表盘迁移至子路径（例如 `/dashboard`）。
   - **方案 A2：** 保持当前布局：CDP 仪表盘位于根路径，Superset 位于 `/superset/`。SSO 登录页仍位于 `/superset/login`，并与 CMS 完成重定向。
   - **方案 A3：** 为 Superset 分配独立子域名（`superset.busrom.local` / `superset.busromhouse.com`）。

7. 相应更新 `docker/nginx/gateway.conf` 和 `docker/nginx/production.conf`。

### 第五阶段 — 测试与加固

8. 测试矩阵：

   - 已登录且拥有 `analytics` 角色的 Payload 用户 → 静默进入 Superset。
   - 已登录但缺少允许角色的 Payload 用户 → 403 / 无权限重定向。
   - 无 Cookie → 重定向至 CMS 登录页，并保留 `?redirect=`。
   - Token 过期 → 重定向至 CMS 登录页。
   - Token 被篡改 → 拒绝并重定向至登录页。
   - 直接 Superset 管理员 fallback 仍可正常工作（如果保留）。

9. 审计日志：在 `INFO`/`WARNING` 级别记录 SSO 成功/失败事件。

---

## 6. 所需环境变量与配置变更

### Payload CMS（`payload-cms/.env`）

| 变量 | 示例（本地） | 示例（生产） |
|---|---|---|
| `PAYLOAD_SECRET` | `CHANGE_ME_TO_A_SECURE_SECRET_AT_LEAST_32_CHARS` | `<随机 32 位以上字符串>` |
| `COOKIE_DOMAIN` | `.busrom.local` | `.busromhouse.com` |
| `COOKIE_SAME_SITE` | `Lax` | `Lax` |
| `COOKIE_SECURE` | `false` | `true` |

### CDP（`cdp/.env`）

| 变量 | 用途 |
|---|---|
| `PAYLOAD_SECRET` | 必须与 Payload CMS 密钥一致，用于 JWT 验证 |
| `PAYLOAD_CMS_URL` | 构建登录重定向URL的基础地址 |

### Superset（`docker/superset/superset_config.py` + compose）

| 变量 | 用途 |
|---|---|
| `PAYLOAD_SECRET` | 验证 `payload-token` 的 HS256 密钥 |
| `PAYLOAD_CMS_URL` | 例如 `http://cms.busrom.local` / `https://cms.busromhouse.com`；用于重定向 |
| `PAYLOAD_DB_URI` 或现有 Postgres 变量 | 从 Payload DB 查询完整用户/角色记录 |
| `PAYLOAD_SSO_ALLOWED_ROLES` | 允许进入 Superset 的 Payload 角色代码，逗号分隔，例如 `admin,editor,analytics` |
| `PAYLOAD_SSO_DEFAULT_ROLE` | 无匹配角色时的 fallback Superset 角色，例如 `Gamma` |
| `SUPERSET_SECRET_KEY` | Flask session 加密密钥（必须强且保密） |

### Nginx

- 确保保留 `proxy_set_header Host $host;`，使 Superset 看到正确的公网主机名。
- 如果选择方案 B，需添加 `proxy_set_header X-Forwarded-User ...` 并阻止直接访问 Superset。

---

## 7. 安全注意事项

| 风险 | 缓解措施 |
|---|---|
| **Token 过期** | 尊重 `exp` 声明；PyJWT 会自动验证。Superset session 有效期应 <= Payload token 有效期。 |
| **签名验证** | 始终使用 `SHA256(PAYLOAD_SECRET).hexdigest()[:32]` 验证签名；拒绝 `alg: none`；显式使用 `algorithms=['HS256']`。 |
| **角色映射** | 显式将 Payload 角色代码映射为 Superset 角色；未授权用户默认不分配角色或阻止访问。 |
| **非活跃/已停用用户** | 验证 Token 后，检查 Payload DB 中 `users.status = 'active'`；否则拒绝。 |
| **请求头伪造** | 方案 A 不信任 `X-Remote-User`。如果使用方案 B，Nginx 必须剥离客户端传入的 `X-Remote-User`，且验证端点必须为内部访问。 |
| **Cookie Domain** | 使用点前缀域名（`.busrom.local`），使 Cookie 在同一注册域下的子域间共享，但不泄露给无关域名。 |
| **Secure / SameSite** | 生产环境：`Secure=true`、`SameSite=Lax`（同一注册域已足够）。本地开发：`Secure=false`，因为使用 HTTP。 |
| **密钥轮换** | 轮换 `PAYLOAD_SECRET` 会使所有活跃会话失效。需规划维护窗口；Payload 和 Superset 必须原子化地同时接收新密钥。 |
| **直接绕过 Superset 访问** | 确保 Superset 容器不通过公网端口/ALB 暴露，只能通过网关访问。生产环境网关应强制 HTTPS。 |
| **审计日志** | 记录每次 SSO 尝试：验证结果、邮箱、映射角色、来源 IP。不要记录 JWT 本身。 |
| **CSRF / 会话固定** | Flask-AppBuilder 管理 session；保持 `WTF_CSRF_ENABLED = True`。SSO 登录后，如果 FAB 提供钩子，应轮换 session ID。 |
| **Token 出现在 URL 中** | 避免在查询字符串中传递 JWT。重定向流程应仅依赖 HttpOnly Cookie。如果需要一次性 token，应设置短有效期且单次使用。 |
| **2FA** | Payload 已通过自定义端点支持 2FA。由于 SSO 使用的是 *完成 2FA 后的* `payload-token`，Superset 继承该 2FA 保证。 |

---

## 8. 待确认问题清单（提交给首席架构师 / 用户）

1. **Superset 的 URL 路由**
   - 需求要求 `http://cdp.busrom.local/` 应为 Superset，但当前 Nginx 网关在 `/` 提供 Next.js CDP 仪表盘，在 `/superset/` 提供 Superset。
   - 需要决策：将 Superset 放到根路径、保留 `/superset/`，还是引入独立子域名（`superset.busrom.local` / `superset.busromhouse.com`）？

2. **如何获取用户角色**
   - 需要决策：（a）JWT 验证后从 Superset 查询 Payload DB（推荐），或（b）修改 `Users.ts` 通过 `saveToJWT` 将角色代码嵌入 JWT。  
   - 如果选择（b），需要一个计算/归一化字段来存储角色代码，避免嵌入完整关系对象。

3. **Superset 超级管理员的 Fallback 登录**
   - 需要决策：是否保留直接 Superset DB 登录作为应急访问，还是所有认证都必须通过 Payload CMS？

4. **生产域名 / TLS**
   - 确认生产域名：`cms.busromhouse.com` 和 `cdp.busromhouse.com`。是否还需要 `superset.busromhouse.com`？  
   - 确认 TLS 终止发生在 ALB/Nginx，再到达 Superset。

5. **Payload session vs. Superset session 有效期**
   - Payload Token 8 小时后过期。Superset session 是否也应 8 小时过期，还是采用滑动/刷新模式？  
   - 注意：Payload refresh token 基于 session；Superset 需要在 Cookie 过期时重定向回 CMS。

6. **Cookie 前缀 / 多租户未来**
   - Payload Cookie 前缀当前为 `payload`。是否有更改计划？如有，SSO 代码必须读取配置的前缀。

---

## 9. 相关文件

- `cdp/src/middleware.ts` — CDP Next.js 应用中现有的 JWT 验证逻辑。
- `cdp/src/lib/auth.ts` — 另一个 CDP 认证辅助文件（注意：matcher/请求头名称与 `middleware.ts` 不一致；实现时应统一）。
- `docker/superset/superset_config.py` — 现有的 `PayloadCMSSecurityManager`（基于 DB 密码认证）。
- `docker/superset/sync_users.py` — 现有的幂等用户同步脚本。
- `docker/superset/Dockerfile` — 将安装 PyJWT 的位置。
- `payload-cms/src/collections/Users.ts` — 配置 Cookie Domain 和 `saveToJWT` 的位置。
- `payload-cms/src/endpoints/auth-login.ts` — 带 2FA 的自定义 Payload 登录端点。
- `docker/nginx/gateway.conf` / `docker/nginx/production.conf` — 反向代理路由配置。
- `docs/CDP开发文档.md` — 原始 SSO 需求（中文）。
