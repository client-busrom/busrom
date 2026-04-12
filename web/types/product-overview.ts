export interface CMSLink {
  title: string;
  url: string;
  openInNewTab?: boolean;
}

export interface ApplicationItem {
  id: string | number;
  title: string;
  subtitle?: string;
  image: any;
  href: string;
}

export interface ProductSeriesItem {
  id: string | number;
  title: string;
  image: any;
  href: string;
}

export interface ExclusiveSolutionItem {
  id: string | number;
  title: string;
  description: string;
  image?: any;
}

export interface ProductOverviewData {
  hero: {
    content1: string[];
    content2: string[];
    content3: string[];
    cta: CMSLink;
    productItems: any[];
  };
  seriesOverview: {
    title: string;
    subtitle: string;
    items: ProductSeriesItem[];
    config: {
      autoplay: boolean;
      interval: number;
      itemsPerView: number;
    };
  };
  applications: {
    title: string;
    subtitle: string;
    cta: CMSLink;
    items: ApplicationItem[];
    config: {
      autoplay: boolean;
      interval: number;
      itemsPerView: number;
    };
  };
  exclusiveSolutions?: {
    logoText: string;
    title: string;
    subtitle: string;
    content: string;
    items: ExclusiveSolutionItem[];
  };
}
