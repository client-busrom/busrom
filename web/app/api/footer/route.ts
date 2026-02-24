import { NextRequest, NextResponse } from 'next/server';

const CMS_URL = process.env.CMS_URL || process.env.NEXT_PUBLIC_CMS_URL || 'http://localhost:3002';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const locale = searchParams.get('locale') || 'en';

    // 从 Payload CMS 获取 footer global
    const response = await fetch(
      `${CMS_URL}/api/globals/footer?locale=${locale}&depth=2`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        next: { revalidate: 60 },
      }
    );

    if (!response.ok) {
      console.error('[Footer API] CMS error:', response.status);
      return NextResponse.json({ error: 'Failed to fetch footer data' }, { status: response.status });
    }

    const data = await response.json();

    // 转换数据格式
    const footerData = {
      contact: {
        title: data.contactInfoGroup?.contactTitle || 'Contact Us',
        emailLabel: data.contactInfoGroup?.contactEmailLabel || 'Email: ',
        email: data.contactInfoGroup?.contactEmail || '',
        afterSalesLabel: data.contactInfoGroup?.afterSalesLabel || 'After-sales: ',
        afterSales: data.contactInfoGroup?.afterSalesEmail || '',
        whatsappLabel: data.contactInfoGroup?.whatsappLabel || 'WhatsApp: ',
        whatsapp: data.contactInfoGroup?.whatsappNumber || '',
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
      socialLinks: (data.socialLinks || []).map((social: any) => ({
        platform: social.platform,
        url: social.url,
      })),
      copyrightText: data.copyrightText,
    };

    return NextResponse.json(footerData);
  } catch (error: any) {
    console.error('[Footer API] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
