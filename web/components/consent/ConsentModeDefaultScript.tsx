/**
 * ConsentModeDefaultScript
 *
 * 在 <head> 最早期注入 Google Consent Mode v2 的"默认全部拒绝"指令。
 * 必须在任何 GTM / GA 脚本之前执行，否则 EEA 用户首屏会被默认追踪。
 *
 * 本组件是 Server Component，输出一段极小的 inline JS。
 */

export function ConsentModeDefaultScript() {
  const script = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('consent', 'default', {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
  functionality_storage: 'denied',
  security_storage: 'granted',
  wait_for_update: 1500
});
`
  return (
    <script
      id="consent-mode-default"
      // 必须同步执行，不能用 defer/async
      dangerouslySetInnerHTML={{ __html: script }}
    />
  )
}
