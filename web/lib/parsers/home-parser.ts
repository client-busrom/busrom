import { HomeContent, ImageObject } from "@/lib/content-data";
import { convertToCDNUrl } from "@/lib/cdn-url";

// Helper function to convert Media URL to CDN URL
function getMediaUrl(fileUrl: string | null | undefined, strategy?: string): string {
  if (!fileUrl) return '/images/placeholder.jpg';
  return convertToCDNUrl(fileUrl, strategy);
}

// Helper function to convert media data to ImageObject
const toImageObject = (
  mediaData: any, 
  alt: string = '',
  strategy?: string,
  seoKeywords: string[] = [],
  keywordIndexRef: { current: number } = { current: 0 }
): ImageObject => {
  // Determine the SEO alt text - Distribute ALL keywords across available images
  let seoAlt = alt;
  if (seoKeywords.length > 0) {
    // We want to use all 1500 keywords across the images on the page.
    // Assuming an average of 50-100 images per page, each image gets a chunk.
    const totalImages = 50; // Conservative estimate for chunking
    const chunkSize = Math.max(1, Math.ceil(seoKeywords.length / totalImages));
    const start = (keywordIndexRef.current * chunkSize) % seoKeywords.length;
    const chunk = seoKeywords.slice(start, start + chunkSize);
    
    // Join chunked keywords with commas for the alt tag
    seoAlt = chunk.join(', ');
    keywordIndexRef.current++;
  }

  if (!mediaData) {
    return { url: '/images/placeholder.jpg', altText: seoAlt };
  }
  // Handle string URL (legacy format)
  if (typeof mediaData === 'string') {
    return {
      url: getMediaUrl(mediaData, strategy),
      altText: seoAlt
    };
  }
  // Handle object with url, variants, and cropFocalPoint
  const variants = mediaData.variants ? Object.fromEntries(
    Object.entries(mediaData.variants).map(([key, value]) => {
      const url = typeof value === 'string' ? value : (value as any)?.url;
      return [key, getMediaUrl(url, strategy)];
    })
  ) : undefined;
  
  return {
    url: getMediaUrl(mediaData.url || mediaData.file?.url || mediaData.fileUrl, strategy),
    altText: seoAlt, // Force use SEO alt instead of mediaData.altText
    variants,
    cropFocalPoint: mediaData.cropFocalPoint
  };
};

/**
 * Transforms raw CMS data from the /api/home endpoint into the standardized HomeContent structure.
 */
export function parseHomeData(data: any, locale: string, strategy?: string, seoKeywords: string[] = []): HomeContent {
  if (!data) return {} as HomeContent;

  const keywordIndexRef = { current: 0 };
  
  // Wrap toImageObject to include the keywords and counter automatically
  const autoSeoImage = (mediaData: any, fallbackAlt: string = '') => 
    toImageObject(mediaData, fallbackAlt, strategy, seoKeywords, keywordIndexRef);

  // Helper to fix legacy URLs and ensure standardized formatting
  const fixProductUrl = (url: string | null | undefined): string => {
    if (!url) return '#';
    
    let processedUrl = url.replace(/^\/product\//, '/products/');

    if (processedUrl.includes('/shop?series=')) {
      processedUrl = processedUrl.replace('/shop?series=', '/shop?category=');
    }

    if (processedUrl.includes('/shop?category=')) {
      const [base, query] = processedUrl.split('?');
      const params = new URLSearchParams(query);
      const cat = params.get('category');
      if (cat) {
        const cleanCat = cat.trim().toLowerCase().replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '').replace(/[^a-z0-9-]/g, '');
        params.set('category', cleanCat);
        processedUrl = `${base}?${params.toString()}`;
      }
    }
    
    return processedUrl;
  };

  // 1. Transform Carousel Items
  const carouselItemsData = data.productSeriesCarousel?.items;
  const rawCarouselItems = Array.isArray(carouselItemsData)
    ? carouselItemsData
    : (carouselItemsData?.[locale] || carouselItemsData?.en || []);

  const carouselItems = (Array.isArray(rawCarouselItems) ? rawCarouselItems : []).map((item: any, index: number) => ({
    key: item.linkUrl || `item-${index}`,
    order: index,
    name: item.title || '',
    image: autoSeoImage(item.image, item.title),
    sceneImage: autoSeoImage(item.sceneImage, item.title),
    buttonText: item.buttonText || 'Learn More',
    href: fixProductUrl(item.linkUrl),
  }));

  // 2. Transform Brand Advantages
  const brandAdvantages = {
    advantages: data.brandAdvantages?.advantages?.map((item: any) => item.text) || [],
    icons: data.brandAdvantages?.advantages?.map((item: any) => item.icon) || [],
    image: data.brandAdvantages?.image ? autoSeoImage(data.brandAdvantages.image, 'Brand Advantages') : { url: '', altText: '' },
  };

  // 3. Transform SimpleCta
  const simpleCtaRaw = data.simpleCta || {};
  
  // Extract marquee content after "scrolling-link" marker if it exists
  let marqueeContent = simpleCtaRaw.marqueeContent;
  if (marqueeContent?.root?.children) {
    const children = marqueeContent.root.children;
    let foundMarker = false;
    const filteredChildren = [];
    
    for (const node of children) {
      const totalText = (node.children?.map((c: any) => c.text).join('') || '').trim().toLowerCase();
      const isMarker = (node.type === 'paragraph' || node.type === 'quote' || node.type === 'code') && 
                       (totalText === 'scrolling-link' || node.children?.[0]?.format === 16 && totalText === 'scrolling-link');
      
      if (isMarker) {
        foundMarker = true;
        continue;
      }
      
      if (foundMarker) {
        filteredChildren.push(node);
      }
    }
    
    if (foundMarker) {
      marqueeContent = {
        ...marqueeContent,
        root: {
          ...marqueeContent.root,
          children: filteredChildren
        }
      };
    }
  }

  const simpleCta = {
    title: simpleCtaRaw.title || '',
    title2: simpleCtaRaw.title2 || '',
    subtitle: simpleCtaRaw.subtitle || '',
    description: simpleCtaRaw.description || '',
    ctaText: simpleCtaRaw.ctaText || simpleCtaRaw.buttonText || '',
    ctaLink: simpleCtaRaw.ctaLink || '/contact-us',
    marqueeContent: marqueeContent || null,
    images: simpleCtaRaw.images 
      ? simpleCtaRaw.images.map((imgData: any) => autoSeoImage(imgData, simpleCtaRaw.title))
      : [
          autoSeoImage(simpleCtaRaw.image1, simpleCtaRaw.title),
          autoSeoImage(simpleCtaRaw.image2, simpleCtaRaw.title),
          autoSeoImage(simpleCtaRaw.image3, simpleCtaRaw.title),
        ].filter(img => img.url !== '/images/placeholder.jpg' || img.altText !== '')
  };

  // 4. Transform OemOdm
  const oemOdm = {
    oem: {
      title: data.oemOdm?.oem?.title || '',
      bgImage: autoSeoImage(data.oemOdm?.oem?.bgImage, 'OEM Background'),
      image: autoSeoImage(data.oemOdm?.oem?.image, 'OEM'),
      description: data.oemOdm?.oem?.description || [],
    },
    odm: {
      title: data.oemOdm?.odm?.title || '',
      bgImage: autoSeoImage(data.oemOdm?.odm?.bgImage, 'ODM Background'),
      image: autoSeoImage(data.oemOdm?.odm?.image, 'ODM'),
      description: data.oemOdm?.odm?.description || [],
    },
  };

  // 5. Transform SeriesIntro
  const seriesIntro = (data.seriesIntro || []).map((item: any) => ({
    ...item,
    images: (item.images || []).map((imgData: any) => autoSeoImage(imgData, item.title)),
  }));

  // 6. Transform WhyChooseBusrom
  const whyChooseBusrom = data.whyChooseBusrom ? {
    ...data.whyChooseBusrom,
    reasons: (data.whyChooseBusrom.reasons || []).map((reason: any) => ({
      ...reason,
      image: autoSeoImage(reason.image, reason.title),
    })),
  } : {
    title: '',
    title2: '',
    reasons: []
  };

  // 7. Transform QuoteSteps
  const quoteSteps = data.quoteSteps ? {
    headerTitle: data.quoteSteps.headerTitle || data.quoteSteps.title || '',
    headerTitle2: data.quoteSteps.headerTitle2 || data.quoteSteps.title2 || '',
    headerSubtitle: data.quoteSteps.headerSubtitle || data.quoteSteps.subtitle || '',
    headerDescription: data.quoteSteps.headerDescription || data.quoteSteps.description || '',
    steps: (data.quoteSteps.steps || []).map((step: any) => ({
      ...step,
      image: autoSeoImage(step.image, step.text),
    })),
  } : {
    headerTitle: '',
    headerTitle2: '',
    headerSubtitle: '',
    headerDescription: '',
    steps: []
  };

  // 8. Transform MainForm
  const mainForm = {
    placeholderName: data.mainForm?.labelName || data.mainForm?.placeholderName || 'Name',
    placeholderEmail: data.mainForm?.labelEmail || data.mainForm?.placeholderEmail || 'Email',
    placeholderWhatsapp: data.mainForm?.labelWhatsapp || data.mainForm?.placeholderWhatsapp || 'WhatsApp',
    placeholderCompany: data.mainForm?.labelCompany || data.mainForm?.placeholderCompany || 'Company',
    placeholderMessage: data.mainForm?.labelMessage || data.mainForm?.placeholderMessage || 'Message',
    placeholderVerify: data.mainForm?.placeholderVerify || 'Verify',
    buttonText: data.mainForm?.buttonText || 'Submit',
    submittingText: data.mainForm?.submittingText || 'Submitting...',
    successMessage: data.mainForm?.successMessage || 'Submitted successfully! We will contact you soon.',
    errorRequired: data.mainForm?.errorRequired || 'Please fill in name and email',
    errorNetwork: data.mainForm?.errorNetwork || 'Network error, please try again',
    errorCaptcha: data.mainForm?.errorCaptcha || 'Please complete the captcha verification',
    designTextLeft: data.mainForm?.designTextLeft || '',
    designTextRight: data.mainForm?.designTextRight || '',
    image1: data.mainForm?.images?.[0] ? autoSeoImage(data.mainForm.images[0], 'Main Form Left') : null,
    image2: data.mainForm?.images?.[1] ? autoSeoImage(data.mainForm.images[1], 'Main Form Right') : null,
    formConfig: data.mainForm?.formConfig || null,
  };

  // 9. Transform BrandValue
  const defaultValueItem = { title: '', description: '', image: { url: '', altText: '' } };
  const brandValue = {
    title: data.brandValue?.title || '',
    subtitle: data.brandValue?.subtitle || '',
    param1: data.brandValue?.items?.[0] ? {
      ...data.brandValue.items[0],
      image: autoSeoImage(data.brandValue.items[0].image, data.brandValue.items[0].title),
    } : defaultValueItem,
    param2: data.brandValue?.items?.[1] ? {
      ...data.brandValue.items[1],
      image: autoSeoImage(data.brandValue.items[1].image, data.brandValue.items[1].title),
    } : defaultValueItem,
    slogan: data.brandValue?.items?.[2] ? {
      ...data.brandValue.items[2],
      image: autoSeoImage(data.brandValue.items[2].image, data.brandValue.items[2].title),
    } : defaultValueItem,
    value: data.brandValue?.items?.[3] ? {
      ...data.brandValue.items[3],
      image: autoSeoImage(data.brandValue.items[3].image, data.brandValue.items[3].title),
    } : defaultValueItem,
    vision: data.brandValue?.items?.[4] ? {
      ...data.brandValue.items[4],
      image: autoSeoImage(data.brandValue.items[4].image, data.brandValue.items[4].title),
    } : defaultValueItem,
  };

  // 10. Transform ServiceFeatures
  const serviceFeatures = data.serviceFeatures ? {
    title: data.serviceFeatures.title || '',
    subtitle: data.serviceFeatures.subtitle || '',
    features: (() => {
      const rawFeatures = data.serviceFeatures.features;
      
      // 如果后端已经是数组格式，按原逻辑处理并添加裁剪数据支持
      if (Array.isArray(rawFeatures)) {
        return rawFeatures.map((feature: any) => ({
          ...feature,
          images: (feature.images || []).map((imgData: any) => autoSeoImage(imgData, feature.title)),
          imageCropDataList: feature.imageCropDataList || [],
        }));
      }
      
      // 兼容平铺格式 (feature01Image1, feature01Image1CropData 等)
      const features = [];
      for (let i = 1; i <= 5; i++) {
        const prefix = `feature0${i}`;
        const title = data.serviceFeatures[`${prefix}Title`];
        if (!title) continue;

        const featureImages = [];
        const featureCrops = [];

        // 处理该 Feature 下的多张图 (通常 1-2 张)
        for (let j = 1; j <= 2; j++) {
          const imgKey = `${prefix}Image${j}`;
          const cropKey = `${prefix}Image${j}CropData`;
          
          if (data.serviceFeatures[imgKey]) {
            featureImages.push(autoSeoImage(data.serviceFeatures[imgKey], title));
            featureCrops.push(data.serviceFeatures[cropKey] || null);
          }
        }

        features.push({
          title,
          shortTitle: data.serviceFeatures[`${prefix}ShortTitle`] || title,
          description: data.serviceFeatures[`${prefix}Description`] || '',
          images: featureImages,
          imageCropDataList: featureCrops,
        });
      }
      return features;
    })(),
  } : {
    title: '',
    subtitle: '',
    features: []
  };

  // 11. Transform HeroBanner
  const heroBanner = (data.heroBanner || []).map((item: any) => ({
    ...item,
    images: (item.images || []).map((imgData: any) => autoSeoImage(imgData, item.title)),
    // 裁剪数据直接透传（后端已处理好）
    imageCropDataList: item.imageCropDataList || undefined,
  }));

  // 12. Transform FeaturedProducts
  const featuredProducts = data.featuredProducts ? {
    title: data.featuredProducts.title || '',
    description: data.featuredProducts.description || '',
    viewAllButton: data.featuredProducts.viewAllButtonText || '',
    categories: '',
    series: (data.featuredProducts.series || []).map((s: any) => ({
      seriesTitle: s.seriesTitle || '',
      products: (s.products || []).map((p: any) => ({
        slug: p.slug || '',
        title: p.title || '',
        image: autoSeoImage(p.image, p.title),
        features: p.features || [],
      })),
    })),
  } : {
    title: '',
    description: '',
    viewAllButton: '',
    categories: '',
    series: []
  };

  // 13. Transform Case Studies
  const caseStudies = data.caseStudies || {
    title: '',
    description: '',
    applications: []
  };

  // 14. Transform Brand Analysis
  const brandAnalysis = data.brandAnalysis ? {
    backgroundImage: data.brandAnalysis.backgroundImage ? autoSeoImage(data.brandAnalysis.backgroundImage, 'Brand Analysis Background') : null,
    centers: (data.brandAnalysis.centers || []).map((center: any) => {
      const largeImg = autoSeoImage(center.largeImage, center.title);
      const smallImg = autoSeoImage(center.smallImage, center.title);
      const bgImg = center.backgroundImage ? autoSeoImage(center.backgroundImage, 'Background') : null;
      const fallbackBg = data.brandAnalysis.backgroundImage ? autoSeoImage(data.brandAnalysis.backgroundImage, 'Brand Analysis Background') : null;
      return {
        title: center.title || '',
        description: center.description || '',
        backgroundImage: bgImg || fallbackBg,
        largeImage: largeImg.url,
        smallImage: smallImg.url,
        largeImageData: largeImg,
        smallImageData: smallImg,
      };
    }),
  } : {
    centers: []
  };

  // 15. Transform Footer
  const footer = data.footer ? {
    form: {
      title: data.footer.form?.title || '',
      placeholders: {
        name: data.footer.form?.placeholders?.name || '',
        email: data.footer.form?.placeholders?.email || '',
        message: data.footer.form?.placeholders?.message || '',
      },
      buttonText: data.footer.form?.buttonText || '',
    },
    contact: {
      title: data.footer.contact?.title || '',
      emailLabel: data.footer.contact?.emailLabel || 'Email',
      email: data.footer.contact?.email || '',
      afterSalesLabel: data.footer.contact?.afterSalesLabel || 'After Sales',
      afterSales: data.footer.contact?.afterSales || '',
      whatsappLabel: data.footer.contact?.whatsappLabel || 'WhatsApp',
      whatsapp: data.footer.contact?.whatsapp || '',
      addressLabel: data.footer.contact?.addressLabel || '',
      address: data.footer.contact?.address || '',
      workingHoursLabel: data.footer.contact?.workingHoursLabel || '',
      workingHours: data.footer.contact?.workingHours || '',
    },
    notice: {
      title: data.footer.notice?.title || '',
      lines: data.footer.notice?.text ? [data.footer.notice.text] : [],
    },
  } : {
    form: { title: '', placeholders: { name: '', email: '', message: '' }, buttonText: '' },
    contact: { title: '', emailLabel: '', email: '', afterSalesLabel: '', afterSales: '', whatsappLabel: '', whatsapp: '' },
    notice: { title: '', lines: [] },
  };

  return {
    locale,
    heroBanner,
    productSeriesCarousel: carouselItems,
    serviceFeatures,
    sphere3d: data.sphere3d ? {
      title: data.sphere3d.title || '',
      description: data.sphere3d.description || '',
    } : null,
    simpleCta,
    seriesIntro,
    featuredProducts,
    brandAdvantages,
    oemOdm,
    quoteSteps,
    mainForm,
    whyChooseBusrom,
    caseStudies,
    brandAnalysis,
    brandValue,
    footer: footer as any,
  };
}
