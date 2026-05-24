const getCmsUrl = () => {
  if (process.env.CMS_URL) return process.env.CMS_URL;
  if (process.env.NEXT_PUBLIC_CMS_URL) return process.env.NEXT_PUBLIC_CMS_URL;
  if (process.env.NODE_ENV === 'development') return 'http://localhost:3002';
  return 'https://cms.busromhouse.com';
};

/**
 * Server-side utility to fetch footer data directly from Payload CMS.
 */
export async function getFooterData(locale: string = 'en') {
  const CMS_URL = getCmsUrl();
  try {
    const [footerRes, socialRes] = await Promise.all([
      fetch(`${CMS_URL}/api/globals/footer?locale=${locale}&depth=2`, {
        headers: {
          'Content-Type': 'application/json',
        },
        next: { revalidate: 3600 },
      }),
      fetch(`${CMS_URL}/api/globals/social-config?locale=${locale}&depth=2`, {
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
    let backgroundImage: string | null = null
    const bgConfig = data.backgroundImage
    if (bgConfig) {
      if (bgConfig.mode === 'manual' && bgConfig.manualImage?.url) {
        backgroundImage = bgConfig.manualImage.sizes?.desktop?.url || bgConfig.manualImage.url
      } else if (bgConfig.mode === 'application' && bgConfig.applicationId) {
        try {
          const appRes = await fetch(`${CMS_URL}/api/applications/${bgConfig.applicationId}?depth=1`, {
            headers: { 'Content-Type': 'application/json' },
            next: { revalidate: 3600 },
          })
          if (appRes.ok) {
            const app = await appRes.json()
            const allImages = (app.sceneGallery || []).flatMap((scene: any) => scene.images || [])
            const uniqueImages = Array.from(new Map(allImages.map((img: any) => [img.id, img])).values())
            if (uniqueImages.length > 0) {
              const randomIndex = Math.floor(Math.random() * uniqueImages.length)
              const img = uniqueImages[randomIndex] as any
              backgroundImage = img.sizes?.desktop?.url || img.url || null
            }
          }
        } catch (e) {
          console.error('[Footer API Helper] Failed to resolve application image:', e)
        }
      }
      if (!backgroundImage && bgConfig.url) {
        backgroundImage = bgConfig.url
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
        let link = menu.link || `/${menu.slug}`
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
}
