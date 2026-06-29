import { cmsFetch, CMS_URL } from "./client";
import { convertToCDNUrl } from "../cdn-url";

/**
 * Server-side utility to fetch footer data directly from Payload CMS.
 */
let footerPromiseCache: Record<string, Promise<any> | undefined> = {};
let footerCacheTime: Record<string, number> = {};
const CACHE_TTL = 5 * 60 * 1000;

export async function getFooterData(locale: string = 'en') {
  const now = Date.now();
  if (footerPromiseCache[locale] && now - (footerCacheTime[locale] || 0) < CACHE_TTL) {
    return footerPromiseCache[locale];
  }

  const fetchPromise = (async () => {
    try {
      const [footerRes, socialRes] = await Promise.all([
        cmsFetch(`/api/globals/footer?locale=${locale}&depth=1`, {
          headers: {
            'Content-Type': 'application/json',
          },
          next: { revalidate: 3600 },
        }),
        cmsFetch(`/api/globals/social-config?locale=${locale}&depth=1`, {
          headers: {
            'Content-Type': 'application/json',
          },
          next: { revalidate: 3600 },
        }),
      ]);

      if (!footerRes.ok) return null;
      const data = await footerRes.json();
      const socialData = socialRes.ok ? await socialRes.json() : { socialLinks: [] };

      // Resolve background image
      // CMS afterRead hook resolves the JSON picker config into a full media object.
      let backgroundImage: string | null = null;
      const resolved = data.backgroundImageResolved;
      if (resolved) {
        const rawUrl = resolved.sizes?.desktop?.url || resolved.url || null;
        backgroundImage = rawUrl ? convertToCDNUrl(rawUrl) : null;
      }

      // Fallback: resolve from raw JSON config if the hook result is unavailable.
      const bgConfig = data.backgroundImage;
      if (!backgroundImage && bgConfig) {
        if (bgConfig.mode === 'manual' && bgConfig.manualImage) {
          const manualImage = bgConfig.manualImage;
          if (typeof manualImage === 'object' && manualImage?.url) {
            const rawUrl = manualImage.sizes?.desktop?.url || manualImage.url;
            backgroundImage = rawUrl ? convertToCDNUrl(rawUrl) : null;
          } else if (typeof manualImage === 'number' || typeof manualImage === 'string') {
            try {
              const mediaRes = await cmsFetch(`/api/media/${manualImage}?depth=1`, {
                headers: { 'Content-Type': 'application/json' },
                next: { revalidate: 3600 },
              });
              if (mediaRes.ok) {
                const media = await mediaRes.json();
                const rawUrl = media.sizes?.desktop?.url || media.url || null;
                backgroundImage = rawUrl ? convertToCDNUrl(rawUrl) : null;
              }
            } catch (e) {
              console.error('[Footer API Helper] Failed to resolve manual image:', e);
            }
          }
        } else if (bgConfig.mode === 'application' && bgConfig.applicationId) {
          try {
            const appRes = await cmsFetch(`/api/applications/${bgConfig.applicationId}?depth=1`, {
              headers: { 'Content-Type': 'application/json' },
              next: { revalidate: 3600 },
            });
            if (appRes.ok) {
              const app = await appRes.json();
              const allImages = (app.sceneGallery || []).flatMap((scene: any) => scene.images || []);
              const uniqueImages = Array.from(new Map(allImages.map((img: any) => [img.id, img])).values());
              if (uniqueImages.length > 0) {
                const randomIndex = Math.floor(Math.random() * uniqueImages.length);
                const img = uniqueImages[randomIndex] as any;
                const rawUrl = img.sizes?.desktop?.url || img.url || null;
                backgroundImage = rawUrl ? convertToCDNUrl(rawUrl) : null;
              }
            }
          } catch (e) {
            console.error('[Footer API Helper] Failed to resolve application image:', e);
          }
        }
        if (!backgroundImage && bgConfig.url) {
          backgroundImage = convertToCDNUrl(bgConfig.url);
        }
      }

      return {
        formConfigName: data.formConfig?.name || 'footer-form',
        backgroundImage,
        contact: {
          title: data.contactInfoGroup?.contactTitle || 'Contact Us',
          emailLabel: data.contactInfoGroup?.contactEmailLabel || 'Email: ',
          email: data.contactInfoGroup?.contactEmail || '',
          afterSalesLabel: data.contactInfoGroup?.afterSalesLabel || 'After-sales: ',
          afterSales: data.contactInfoGroup?.afterSalesEmail || '',
          whatsappLabel: data.contactInfoGroup?.whatsappLabel || 'WhatsApp: ',
          whatsapp: data.contactInfoGroup?.whatsappNumber || '',
          addressLabel: data.contactInfoGroup?.addressLabel || (locale === 'zh' ? '地址: ' : 'Address: '),
          address: data.contactInfoGroup?.address || '',
          workingHoursLabel: data.contactInfoGroup?.workingHoursLabel || (locale === 'zh' ? '工作时间: ' : 'Working Hours: '),
          workingHours: data.contactInfoGroup?.workingHours || '',
        },
        notice: {
          title: data.officialNoticeGroup?.officialNoticeTitle || 'Official Notice',
          lines: [
            data.officialNoticeGroup?.officialNoticeLine1,
            data.officialNoticeGroup?.officialNoticeLine2,
            data.officialNoticeGroup?.officialNoticeLine3,
            data.officialNoticeGroup?.officialNoticeLine4,
          ].filter(Boolean),
        },
        navigationMenus: (data.navigationMenus || []).map((menu: any) => {
          let link = menu.link || `/${menu.slug}`;
          if (link === '/service/one-stop') link = '/service/one-stop-shop';
          return {
            slug: menu.slug,
            name: menu.name,
            link: link,
          };
        }),
        socialLinks: (socialData.socialLinks || []).map((social: any) => ({
          platform: social.platform,
          url: social.url,
        })),
        copyrightText: data.copyrightText,
        legalLinks: (data.legalLinks || []).map((link: any) => ({
          label: link.label,
          url: link.url,
        })),
      };
    } catch (error) {
      console.error('[Footer API Helper] Error:', error);
      return null;
    }
  })();

  footerPromiseCache[locale] = fetchPromise;
  footerCacheTime[locale] = now;
  return fetchPromise;
}
