# Product Series Customize Feature - 实现说明

## 功能需求

在产品详情页的询盘表单弹窗中:
1. 显示所有产品系列的复选框(包含 Customize 选项)
2. 当用户勾选 "Customize" 选项时,显示 "Customize" 文本输入字段
3. 当用户取消勾选 "Customize" 选项时,隐藏 "Customize" 文本输入字段

## 已完成的修改

### 1. 前端代码修改 (`web/components/shop/FullInquiryModal.tsx`)

#### 修改内容:

1. **识别 "Customize" 选项** - 扩展了识别逻辑,支持多种 value 值:
   - `customize`
   - `custom`
   - `others` ✅ (你的表单配置使用的值)
   - `other`

2. **初始化逻辑** (第 73-95 行):
   ```typescript
   useEffect(() => {
     if (!isOpen) return

     const customizeStates: Record<string, boolean> = {}

     sortedFields.forEach((field) => {
       if (field.fieldType === 'checkbox' && field.options) {
         field.options.forEach((option) => {
           const isCustomize = option.value.toLowerCase().includes('customize') ||
                              option.value.toLowerCase().includes('custom') ||
                              option.value.toLowerCase() === 'others' ||
                              option.value.toLowerCase() === 'other'
           if (isCustomize) {
             const currentValues = formData[field.fieldName] || []
             customizeStates[field.fieldName] = currentValues.includes(option.value)
           }
         })
       }
     })

     setShowCustomizeFields(customizeStates)
   }, [isOpen])
   ```

3. **复选框变化处理** (第 166-187 行):
   ```typescript
   const handleCheckboxChange = (fieldName: string, value: string, checked: boolean) => {
     // ... 更新 formData ...

     const isCustomizeOption = value.toLowerCase().includes('customize') ||
                              value.toLowerCase().includes('custom') ||
                              value.toLowerCase() === 'others' ||
                              value.toLowerCase() === 'other'

     if (isCustomizeOption) {
       setShowCustomizeFields((prev) => ({ ...prev, [fieldName]: checked }))
     }
   }
   ```

4. **渲染逻辑** (第 285-324 行):
   ```typescript
   case "checkbox":
     return (
       <div className="space-y-3">
         {field.options?.map((option) => {
           const isCustomize = option.value.toLowerCase().includes('customize') ||
                              option.value.toLowerCase().includes('custom') ||
                              option.value.toLowerCase() === 'others' ||
                              option.value.toLowerCase() === 'other'

           // ... render checkbox ...
         })}
       </div>
     )
   ```

5. **条件渲染 Customize 字段** (第 429-433 行):
   ```typescript
   // Hide "Customize" field if "InquiryProduct" doesn't have "others" selected
   if (field.fieldName === 'Customize' && !showCustomizeFields['InquiryProduct']) {
     return null
   }
   ```

### 2. 表单配置 (CMS 后台)

当前表单配置 (ID: `be109138-9057-4a52-8857-da94d9d49055`):

**Product Series 字段** (fieldName: `InquiryProduct`):
- 字段类型: `checkbox`
- Order: 3
- 选项:
  - Glass Standoff (glass-standoff)
  - Glass Connected Fitting (glass-connected-fitting)
  - Glass Fence Spigot (glass-fence-spigot)
  - Guardrail Glass Clip (guardrail-glass-clip)
  - Bathroom Glass Clip (bathroom-glass-clip)
  - Glass Hinge (glass-hinge)
  - Sliding Door Kit (sliding-door-kit)
  - Bathroom Handle (bathroom-handle)
  - Door Handle (door-handle)
  - Hidden Hook (hidden-hook)
  - **Customize (others)** ✅

**Customize 字段** (fieldName: `Customize`):
- 字段类型: `textarea`
- Order: 4
- 显示条件: 只有当 InquiryProduct 勾选了 "others" 时才显示

## 工作流程

1. **用户打开产品详情页** → 看到简化表单
2. **填写必填字段并点击 "Submit Inquiry"** → 打开完整表单弹窗
3. **在弹窗中看到 Product Series 复选框列表** (包含 Customize 选项)
4. **勾选 "Customize" 选项** → `Customize` 文本域字段出现
5. **取消勾选 "Customize" 选项** → `Customize` 文本域字段隐藏
6. **填写完整表单并提交** → 数据包含:
   - `InquiryProduct`: ["glass-standoff", "others", ...]
   - `Customize`: "用户输入的定制需求" (仅当勾选了 Customize 时)

## 数据结构示例

### 提交的表单数据:

```json
{
  "Name": "John Doe",
  "Email": "john@example.com",
  "PhoneNumber": "+1234567890",
  "InquiryProduct": ["glass-standoff", "glass-hinge", "others"],
  "Customize": "I need custom size: 100mm x 200mm, and custom color: matte black"
}
```

## 测试步骤

1. ✅ 访问任意产品详情页
2. ✅ 填写简化表单并点击 "Submit Inquiry"
3. ✅ 验证 Product Series 复选框列表是否显示所有选项
4. ✅ 勾选 "Customize" 选项,验证 Customize 字段是否显示
5. ✅ 取消勾选 "Customize" 选项,验证 Customize 字段是否隐藏
6. ✅ 再次勾选 "Customize" 并填写内容
7. ✅ 提交表单,验证数据是否正确保存

## 注意事项

1. **字段名称必须匹配**: 前端代码检查 `field.fieldName === 'Customize'`,所以 CMS 中的字段名必须是 `Customize`
2. **InquiryProduct 字段名**: 前端代码检查 `showCustomizeFields['InquiryProduct']`,所以 Product Series 字段的 fieldName 必须是 `InquiryProduct`
3. **Value 值**: Customize 选项的 value 是 `"others"`,前端代码已经支持识别
4. **多语言**: 字段的 label 和 placeholder 会根据当前语言显示,但 fieldName 和 value 在所有语言中必须一致

## 后续优化建议

1. **多语言占位符**: 目前代码中硬编码的占位符 "Please specify your custom requirements..." 可以改为从表单配置中读取
2. **验证逻辑**: 可以添加验证,当勾选 Customize 时,要求 Customize 字段必填
3. **字段类型**: 考虑是否需要将 Customize 字段类型从 `textarea` 改为其他类型(目前已经是 textarea,符合需求)
