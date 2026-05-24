import { NextRequest, NextResponse } from 'next/server';

const CMS_URL = process.env.CMS_URL || process.env.NEXT_PUBLIC_CMS_URL || 'https://cms.busromhouse.com';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const locale = searchParams.get('locale') || 'en';

    // 从 Payload CMS 获取 footer global 和 social-config global
    const [footerRes, socialRes] = await Promise.all([
      fetch(`${CMS_URL}/api/globals/footer?locale=${locale}&depth=2`, {
        headers: {
          'Content-Type': 'application/json',
        },
        next: { revalidate: 60 },
      }),
      fetch(`${CMS_URL}/api/globals/social-config?locale=${locale}&depth=2`, {
        headers: {
          'Content-Type': 'application/json',
        },
        next: { revalidate: 60 },
      }),
    ]);

    if (!footerRes.ok) {
      console.error('[Footer API] CMS error:', footerRes.status);
      return NextResponse.json({ error: 'Failed to fetch footer data' }, { status: footerRes.status });
    }

    const data = await footerRes.json();
    const socialData = socialRes.ok ? await socialRes.json() : { socialLinks: [] };

    // Resolve background image
    let backgroundImage: string | null = null
    const bgConfig = data.backgroundImage
    if (bgConfig) {
      if (bgConfig.mode === 'manual' && bgConfig.manualImage?.url) {
        backgroundImage = bgConfig.manualImage.sizes?.desktop?.url || bgConfig.manualImage.url
      } else if (bgConfig.mode === 'application' && bgConfig.applicationId) {
        // Fetch application and randomly pick one image from scene gallery
        try {
          const appRes = await fetch(`${CMS_URL}/api/applications/${bgConfig.applicationId}?depth=1`, {
            headers: { 'Content-Type': 'application/json' },
            next: { revalidate: 60 },
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
          console.error('[Footer API] Failed to resolve application image:', e)
        }
      }
      // Fallback: old structure (direct media relation)
      if (!backgroundImage && bgConfig.url) {
        backgroundImage = bgConfig.url
      }
    }

    // 转换数据格式
    const footerData = {
      formConfigName: data.formConfig?.name || 'footer-form', // 获取 CMS 中配置的表单名称
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
        if (link === '/service/one-stop') {
          link = '/service/one-stop-shop'
        }
        return {
          slug: menu.slug,
          name: menu.name,
          link: link,
        }
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

    return NextResponse.json(footerData);
  } catch (error: any) {
    console.error('[Footer API] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
