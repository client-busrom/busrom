# ActivityLog 测试清单

## 🧪 快速测试指南

### 准备工作
- [ ] 重启 CMS：`cd cms && npm run dev`
- [ ] 以管理员身份登录
- [ ] 在侧边栏找到 "Users & Access" → "Activity Log"

---

## 1️⃣ Media 更新测试（新功能）

**目标：** 验证 Media 的 update 操作现在会被记录

### 步骤：
1. [ ] 进入 Media 列表
2. [ ] 选择任意一张图片
3. [ ] 修改 **Filename** 字段（例如：`image.jpg` → `new-image.jpg`）
4. [ ] 点击保存

### 验证：
- [ ] 进入 Activity Log
- [ ] 应该看到一条 **Update** 记录
- [ ] Entity 为 **Media**
- [ ] Changes 字段应显示：
```json
{
  "id": "xxx",
  "filename": {
    "from": "image.jpg",
    "to": "new-image.jpg"
  }
}
```

✅ **如果能看到 from → to 的对比，说明修复成功！**

---

## 2️⃣ Product Before/After 测试

**目标：** 验证 Product 的 originalItem 参数正常工作

### 步骤：
1. [ ] 进入 Product 列表
2. [ ] 选择任意产品
3. [ ] 修改 **Name (EN)** 字段
4. [ ] 修改 **Status** 字段（例如：Draft → Published）
5. [ ] 点击保存

### 验证：
- [ ] 进入 Activity Log
- [ ] 应该看到一条 **Update** 记录
- [ ] Changes 字段应显示两个字段的变更：
```json
{
  "id": "xxx",
  "name": {
    "from": {"en": "Old Name"},
    "to": {"en": "New Name"}
  },
  "status": {
    "from": "DRAFT",
    "to": "PUBLISHED"
  }
}
```

✅ **如果能看到完整的 before/after，说明修复成功！**

---

## 3️⃣ SiteConfig 测试

**目标：** 验证全站配置的变更记录

### 步骤：
1. [ ] 进入 Site Config
2. [ ] 修改 **Company Name (EN)**
3. [ ] 修改 **Email**
4. [ ] 点击保存

### 验证：
- [ ] Activity Log 应显示变更记录
- [ ] 确认 **SMTP Password** 等敏感字段**没有**被记录
- [ ] Changes 应该只包含修改的字段

---

## 4️⃣ ContactForm 删除测试

**目标：** 验证 ContactForm 的删除操作被记录

### 步骤：
1. [ ] 进入 Contact Form 列表
2. [ ] 选择一个测试表单
3. [ ] 点击删除

### 验证：
- [ ] Activity Log 应显示一条 **Delete** 记录
- [ ] Entity 为 **ContactForm**
- [ ] Changes 应包含表单的基本信息

---

## 5️⃣ User 变更测试

**目标：** 验证 User 使用新的 logActivity 工具

### 步骤：
1. [ ] 进入 User 列表
2. [ ] 选择一个用户（不是自己）
3. [ ] 修改 **Status** 或 **isAdmin**
4. [ ] 点击保存

### 验证：
- [ ] Activity Log 应显示变更记录
- [ ] 确认 **Password** 字段**没有**被记录
- [ ] Changes 应显示 from/to 对比

---

## 6️⃣ 其他模型快速测试

### Blog
- [ ] 创建新文章 → 检查 Create 记录
- [ ] 修改标题 → 检查 Update 记录 + from/to
- [ ] 删除文章 → 检查 Delete 记录

### Category
- [ ] 创建新分类 → 检查记录
- [ ] 修改分类名称 → 检查 from/to

### NavigationMenu
- [ ] 启用/禁用菜单项 → 检查 enabled 字段变更

---

## ✅ 测试通过标准

### 必须满足：
- ✅ 所有操作都被记录到 ActivityLog
- ✅ Update 操作显示 from/to 对比
- ✅ 记录包含：User, IP Address, Timestamp
- ✅ 敏感数据被过滤（密码、完整脚本等）

### UI 检查：
- ✅ ActivityLog 列表正常显示
- ✅ 点击记录可查看详情
- ✅ 所有字段都是只读（无法编辑）
- ✅ 没有 "Create" 和 "Delete" 按钮

---

## 🐛 问题排查

### 如果没有看到日志：

1. **检查用户权限**
   - 确认你以 **管理员** 身份登录
   - 检查 `isAdmin: true`

2. **检查后端日志**
   ```bash
   # 查找 ActivityLogger 相关日志
   grep "ActivityLogger" cms/logs/*
   ```

3. **检查模型 hooks**
   ```bash
   # 验证模型是否有 afterOperation
   grep -n "afterOperation" cms/schemas/Media.ts
   ```

4. **检查 session**
   - ActivityLog 需要 session 存在
   - 系统级操作不会记录日志

### 如果没有看到 from/to：

1. **检查是否传递了 originalItem**
   ```typescript
   // 应该是：
   await logActivity(context, operation, 'Model', item, undefined, originalItem)

   // 而不是：
   await logActivity(context, operation, 'Model', item)
   ```

2. **检查模型的 hook 签名**
   ```typescript
   // 应该包含 originalItem 参数
   afterOperation: async ({ operation, item, originalItem, context }) => {
   ```

---

## 📊 测试结果模板

### 日期：________

| 测试项 | 通过 | 失败 | 备注 |
|--------|------|------|------|
| Media Update | ☐ | ☐ | |
| Product Before/After | ☐ | ☐ | |
| SiteConfig | ☐ | ☐ | |
| ContactForm Delete | ☐ | ☐ | |
| User 变更 | ☐ | ☐ | |
| Blog 操作 | ☐ | ☐ | |
| Category 操作 | ☐ | ☐ | |
| NavigationMenu 操作 | ☐ | ☐ | |

### 问题记录：
```
（记录测试中发现的问题）
```

### 总体评价：
- [ ] 完全通过，可以上线
- [ ] 部分问题，需要修复
- [ ] 严重问题，需要重新检查

---

**测试人：**________
**测试完成时间：**________
