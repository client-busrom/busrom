# Lexical Blocks 测试指南

## ✅ 已完成的工作

### 1. Block 定义 (12个)
所有 12 个自定义 content blocks 已创建：
- 📷 Single Image
- 🖼️ Image Gallery
- 🎥 Video Embed
- 🔘 CTA Button
- 📢 Notice
- 🎯 Hero
- 🎠 Carousel
- ✓ Checklist
- 📝 Form Block
- 🔗 Link Jump
- 🎪 Marquee Links
- ♻️ Reusable Block Reference

### 2. Preview 组件（已移除）
~~所有 12 个 blocks 都添加了预览组件~~
- ❌ `admin.components.Block` 会**完全替换**表单编辑界面
- ❌ 用户无法看到表单字段和保存按钮
- ✅ 已移除预览配置，恢复正常表单编辑
- 📝 Preview 组件代码保留在 `src/blocks/previews/`，可用于前端渲染

### 3. BlocksFeature 配置
- `payload.config.ts` 已配置 BlocksFeature
- 所有 blocks 已加载到 Lexical editor

## 🧪 测试步骤

### 步骤 1: 访问 Payload Admin

```bash
# 服务器已启动在
http://localhost:3002/admin
```

1. 打开浏览器访问 `http://localhost:3002/admin`
2. 使用管理员账号登录

### 步骤 2: 测试 Blocks Slash Menu

1. 进入任意一个 Product
2. 找到 "Content" 字段（富文本编辑器）
3. 在编辑器中输入 "/"

**预期结果：**
弹出菜单应该显示所有 12 个自定义 blocks：
- 📷 Single Image
- 🖼️ Image Gallery
- 🎥 Video Embed
- 🔘 CTA Button
- 📢 Notice
- 🎯 Hero
- 🎠 Carousel
- ✓ Checklist
- 📝 Form Block
- 🔗 Link Jump
- 🎪 Marquee Links
- ♻️ Reusable Block Reference

### 步骤 3: 测试 Block 表单编辑

1. 选择任意 block（例如 📷 Single Image）
2. 填写表单字段（例如上传图片、添加 caption）
3. 观察是否能正常编辑和保存

**预期结果：**
- ✅ 显示正常的表单字段
- ✅ 可以输入文本、上传图片
- ✅ 有保存按钮可以保存内容
- ✅ Block 可以正常添加、编辑、删除

### 步骤 4: 测试不同 Block 类型

建议测试以下几个 blocks 确保表单编辑正常：

#### a) 📷 Single Image
- 上传图片 ✓
- 添加 caption ✓
- 选择 alignment（left/center/right）✓
- 选择 size（small/medium/large/full）✓

#### b) 🖼️ Image Gallery
- 添加多张图片 ✓
- 修改 columns（2/3/4 列）✓
- 每张图片可以添加 caption ✓

#### c) 🎥 Video Embed
- 输入 YouTube/Vimeo URL ✓
- 添加 caption ✓
- 选择 aspectRatio ✓

#### d) 📢 Notice
- 选择 type（info/success/warning/error）✓
- 输入 title 和 message ✓

#### e) 🔘 CTA Button
- 输入按钮文字和链接 ✓
- 选择 style（primary/secondary/outline）✓
- 选择 size（small/medium/large）✓

## 📋 检查清单

- [ ] Payload Admin 可以正常访问
- [ ] "/" 菜单显示所有 12 个 blocks
- [ ] 可以看到表单字段和编辑按钮
- [ ] Single Image block 可以正常编辑
- [ ] Image Gallery block 可以正常编辑
- [ ] Video Embed block 可以正常编辑
- [ ] 可以保存 block 内容
- [ ] 保存后刷新页面，数据正确加载

## 🐛 调试指南

### 如果看不到 blocks：

1. 检查浏览器控制台（F12）是否有错误
2. 检查终端是否有 TypeScript 错误
3. 确认看到这行日志：
   ```
   🔍 [Payload Config] Content blocks count: 12
   ```

### 如果看到 blocks 但无法编辑：

1. 检查浏览器控制台是否有 JavaScript 错误
2. 刷新页面清除缓存
3. 确认 block 定义没有语法错误

### 清理并重启

如果遇到缓存问题：

```bash
cd payload-cms

# 停止进程
lsof -ti:3002 | xargs kill -9

# 清理缓存
rm -rf .next
rm -rf node_modules/.cache

# 重新启动
npm run dev
```

## 📚 下一步

测试完成后，我们需要：

1. ✅ 确认所有 blocks 表单编辑正常
2. ✅ Payload Layout 功能已调研（参考 PAYLOAD_LAYOUT_GUIDE.md）
3. 🔧 更新前端 API 路由处理 Lexical 数据
4. 🎨 创建前端 Lexical 渲染组件（使用 `src/blocks/previews/` 中的组件）

## 💡 关于预览功能

**为什么移除了预览？**
- Payload 的 `admin.components.Block` 会**完全替换**表单界面
- 用户无法看到编辑字段和保存按钮
- 这不是我们想要的效果

**预览应该在哪里？**
- ✅ **前端网站** - 使用 `src/blocks/previews/` 中的组件渲染 Lexical 内容
- ✅ **Live Preview** - 可选：配置 Payload 的 Live Preview 功能在 iframe 中显示网站预览
- ❌ **不在后台编辑器** - 会影响编辑体验
