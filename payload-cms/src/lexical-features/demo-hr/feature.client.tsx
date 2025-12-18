/**
 * Demo HR Feature - Client Side
 * 官方示例：https://payloadcms.com/docs/rich-text/custom-features
 */

'use client'

import { createClientFeature, slashMenuBasicGroupWithItems } from '@payloadcms/richtext-lexical/client'
import { $isNodeSelection } from '@payloadcms/richtext-lexical/lexical'
import { HorizontalRuleNode, $isHorizontalRuleNode } from './HorizontalRuleNode'
import { INSERT_HORIZONTAL_RULE_COMMAND, HorizontalRulePlugin } from './plugin'

// 简单的 Icon 组件
const HRIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <line x1="4" y1="12" x2="20" y2="12" strokeWidth="2" />
  </svg>
)

export const DemoHRFeatureClient = createClientFeature({
  nodes: [HorizontalRuleNode],
  plugins: [
    {
      Component: HorizontalRulePlugin,
      position: 'normal',
    },
  ],
  slashMenu: {
    groups: [
      slashMenuBasicGroupWithItems([
        {
          Icon: HRIcon,
          key: 'demo-horizontalrule', // 与节点类型保持一致
          keywords: ['horizontal rule', 'divider', 'hr', '分割线', 'demo'],
          label: ({ i18n }) => '🧪 Demo HR',
          onSelect: ({ editor }) => {
            editor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined)
          },
        },
      ]),
    ],
  },
})
