/**
 * ConsentModeDefaultScript
 *
 * 在 <head> 最早期注入 Google Consent Mode v2 的默认指令。
 * 必须在任何 GTM / GA 脚本之前执行。
 *
 * 如果用户已同意（busrom_consent cookie 存在且包含 granted），
 * 直接设置 granted，避免首次 page_view 带 denied 信号。
 * 新用户（无 cookie）默认 denied，等待 CookieConsentProvider 更新。
 */

export function ConsentModeDefaultScript() {
  const script = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
(function(){
  var c='denied';
  try{
    var m=document.cookie.match(/busrom_consent=([^;]+)/);
    if(m){var d=JSON.parse(decodeURIComponent(m[1]));
      if(d['gtm']===true&&d['cms-scripts']===true) c='granted';
    }
  }catch(e){}
  gtag('consent','default',{
    ad_storage:c,ad_user_data:c,ad_personalization:c,
    analytics_storage:c,functionality_storage:c,
    security_storage:'granted',wait_for_update:1500
  });
})();
`
  return (
    <script
      id="consent-mode-default"
      // 必须同步执行，不能用 defer/async
      dangerouslySetInnerHTML={{ __html: script }}
    />
  )
}
