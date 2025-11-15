# Gmail SMTP 配置指南

## 问题现象

错误日志：
```
❌ Error: Unexpected socket close
```

## 原因分析

✅ **网络连接正常** - 可以连接到 smtp.gmail.com:587
❌ **认证失败** - Gmail 拒绝了登录请求

## 根本原因

**您使用的是 Gmail 普通密码,但 Gmail 不允许第三方应用使用普通密码登录！**

必须使用 **应用专用密码** (App-Specific Password)

## 解决方案（3 步）

### 步骤 1: 启用两步验证

1. 访问：https://myaccount.google.com/security
2. 找到"两步验证"
3. 点击"开始使用"
4. 按照指引完成设置

### 步骤 2: 生成应用专用密码

1. 访问：https://myaccount.google.com/apppasswords

   或者：
   - 进入 Google 账户
   - 安全性 → 两步验证
   - 拉到底部找到"应用专用密码"

2. 点击"选择应用" → 选择"邮件"

3. 点击"选择设备" → 选择"其他(自定义名称)"
   - 输入：Busrom CMS

4. 点击"生成"

5. **复制显示的 16 位密码**（格式：`abcd efgh ijkl mnop`）
   - ⚠️ 这个密码只显示一次，记得保存！
   - 示例：`qxvw abcd efgh ijkl`

### 步骤 3: 在 CMS 中更新密码

1. 登录 Keystone CMS：http://localhost:3000

2. 进入 **Site Config**

3. 找到 **SMTP Password** 字段

4. **粘贴刚才生成的 16 位应用专用密码**
   - 注意：可以包含空格，也可以去掉空格
   - `qxvw abcd efgh ijkl` 和 `qxvwabcdefghijkl` 都可以

5. 点击 **Save**

6. **重启 Keystone 服务器**
   ```bash
   # 停止当前服务器 (Ctrl+C)
   # 重新启动
   npm run dev
   ```

## 测试邮件发送

### 方法 1: 使用测试脚本

```bash
cd cms
bash scripts/test-contact-form.sh
```

### 方法 2: 手动提交表单

```bash
curl -X POST http://localhost:3000/api/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { createContactForm(data: { name: \"Test\", email: \"test@example.com\", message: \"Test\" }) { id emailSent } }"
  }'
```

### 期望的日志输出

**成功的日志应该是：**

```
📧 SMTP Config: smtp.gmail.com:587 (secure: false)
📧 SMTP User: smtp-busrom-test
📧 Sending contact form notification for: Test User
📬 Email job added to queue: email-xxx (Queue size: 1)
📧 Processing email job: email-xxx (Attempt 1/3)
✅ Admin notification sent successfully to: pakholam599@gmail.com
✅ Email job completed: email-xxx
```

**失败的日志（密码错误）：**

```
❌ Error: Unexpected socket close
❌ Error: Invalid login
❌ Error: Username and Password not accepted
```

## 常见问题

### Q1: 生成应用专用密码时提示"此设置不可用"

**原因**：没有启用两步验证

**解决**：先启用两步验证，然后才能生成应用专用密码

### Q2: 我已经用了应用专用密码，还是失败

**检查清单**：
- [ ] 密码没有多余的空格或换行符
- [ ] SMTP User 是否正确（应该是完整的 Gmail 地址）
- [ ] 已重启 Keystone 服务器
- [ ] Site Config 中的其他字段都填写正确

### Q3: 需要为每个服务生成不同的应用专用密码吗?

**答**: 可以用同一个，也可以分开。建议分开，便于管理和撤销。

### Q4: 应用专用密码会过期吗？

**答**: 不会。除非你手动撤销或更改 Google 账户密码。

## 完整的 Site Config 配置示例

```yaml
SMTP Host: smtp.gmail.com
SMTP Port: 587
SMTP User: your-email@gmail.com  (完整的 Gmail 地址)
SMTP Password: qxvwabcdefghijkl  (16位应用专用密码)
Email From Address: your-email@gmail.com
Email From Name: Busrom
Form Notification Emails: pakholam599@gmail.com
Enable Auto Reply: true (可选)
```

## 其他 SMTP 服务配置

如果不想用 Gmail,也可以使用其他服务:

### SendGrid (推荐用于生产环境)

```yaml
SMTP Host: smtp.sendgrid.net
SMTP Port: 587
SMTP User: apikey
SMTP Password: [Your SendGrid API Key]
```

### Outlook/Hotmail

```yaml
SMTP Host: smtp-mail.outlook.com
SMTP Port: 587
SMTP User: your-email@outlook.com
SMTP Password: [Your Password]
```

### QQ 邮箱

```yaml
SMTP Host: smtp.qq.com
SMTP Port: 587
SMTP User: your-qq@qq.com
SMTP Password: [授权码，不是 QQ 密码]
```

### 163 邮箱

```yaml
SMTP Host: smtp.163.com
SMTP Port: 465
SMTP User: your-email@163.com
SMTP Password: [授权码，不是邮箱密码]
```

## 故障排除流程图

```
邮件发送失败
    ↓
检查网络连接 (nc -zv smtp.gmail.com 587)
    ↓ 成功
检查 SMTP 用户名是否为完整邮箱地址
    ↓ 正确
检查是否使用应用专用密码 (不是普通密码)
    ↓ 是
重启 Keystone 服务器
    ↓
提交测试表单
    ↓
查看服务器日志
    ↓ 还是失败
检查 Google 账户安全设置
    ↓
尝试重新生成应用专用密码
```

## 安全建议

1. **不要将应用专用密码提交到 Git**
   - 使用环境变量
   - 添加到 .gitignore

2. **定期更换密码**
   - 如果怀疑密码泄露，立即撤销并重新生成

3. **使用专业邮件服务**
   - 生产环境建议使用 SendGrid、AWS SES 等
   - 更高的送达率和详细的统计数据

## 相关链接

- Gmail 应用专用密码: https://support.google.com/accounts/answer/185833
- Gmail SMTP 设置: https://support.google.com/mail/answer/7126229
- nodemailer 文档: https://nodemailer.com/smtp/
- SendGrid 文档: https://sendgrid.com/docs/

---

**最后更新**: 2025-11-05
**维护者**: AI Assistant
