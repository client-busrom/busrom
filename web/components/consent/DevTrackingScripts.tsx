/**
 * DevTrackingScripts
 *
 * 开发环境专用的跟踪脚本注入组件。
 * 仅在 NODE_ENV=development 时渲染，用于本地测试 GA4/UET/Clarity 等跟踪代码。
 *
 * 使用方式：在 layout.tsx 的 <head> 中引入，放在 GlobalScripts 之后。
 *
 * 生产环境由 CMS 的 CustomScripts collection 管理这些脚本。
 */

import Script from 'next/script'

/** 测试用的跟踪 ID（从线上站点或 CMS 后台获取） */
const DEV_TRACKING_IDS = {
  // Bing UET Tag ID（从 CMS 后台获取或使用测试 ID）
  bingUet: process.env.NEXT_PUBLIC_BING_UET_ID || '231510617',
  // Microsoft Clarity Project ID
  clarity: process.env.NEXT_PUBLIC_CLARITY_ID || 'wmgzrvahrd',
}

export function DevTrackingScripts() {
  // 仅在开发环境渲染
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <>
      {/* Bing UET Tag */}
      <Script
        id="dev-bing-uet"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(w,d,t,r,u){var f,n,i;w[u]=w[u]||[],f=function(){var o={ti:"${DEV_TRACKING_IDS.bingUet}",enableAutoSpaTracking:true};o.q=w[u],w[u]=new UET(o),w[u].push("pageLoad")},n=d.createElement(t),n.src=r,n.async=1,n.onload=n.onreadystatechange=function(){var s=this.readyState;s&&s!=="loaded"&&s!=="complete"||(f(),n.onload=n.onreadystatechange=null)},i=d.getElementsByTagName(t)[0],i.parentNode.insertBefore(n,i)})(window,document,"script","https://bat.bing.com/bat.js","uetq");
          `,
        }}
      />
      {/* Bing UET Consent Mode: GDPR default denied */}
      <Script
        id="dev-bing-uet-consent"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.uetq = window.uetq || [];
            window.uetq.push('consent', 'default', { 'ad_storage': 'denied' });
          `,
        }}
      />

      {/* Microsoft Clarity */}
      <Script
        id="dev-ms-clarity"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "${DEV_TRACKING_IDS.clarity}");
          `,
        }}
      />
    </>
  )
}
