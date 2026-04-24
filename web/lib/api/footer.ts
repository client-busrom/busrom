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
    const response = await fetch(
      `${CMS_URL}/api/globals/footer?locale=${locale}&depth=2`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        next: { revalidate: 3600 },
      }
    );

    if (!response.ok) return null;
    const data = await response.json();

    return {
      formConfigName: data.formConfig?.name || 'footer-form',
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
      socialLinks: (data.socialLinks || []).map((social: any) => ({
        platform: social.platform,
        url: social.url,
      })),
      copyrightText: data.copyrightText,
    };
  } catch (error) {
    console.error('[Footer API Helper] Error:', error);
    return null;
  }
}
