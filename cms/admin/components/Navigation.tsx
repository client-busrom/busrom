/** @jsxRuntime classic */
/** @jsx jsx */
/** @jsxFrag React.Fragment */

/**
 * Custom Navigation Component
 *
 * Organized navigation with collapsible grouped lists for better usability
 */

import React, { useState } from "react";
import { jsx, useTheme } from "@keystone-ui/core";
import { NavItem, ListNavItems } from "@keystone-6/core/admin-ui/components";
import type { NavigationProps } from "@keystone-6/core/admin-ui/components";
import { gql, useQuery } from "@keystone-6/core/admin-ui/apollo";
import { AccountSettingsDialog } from "./AccountSettingsDialog";

// AuthenticatedItem type definition (matches Keystone's type)
type AuthenticatedItem =
  | { state: 'authenticated'; label: string; id: string; listKey: string }
  | { state: 'unauthenticated' }
  | { state: 'loading' }
  | { state: 'error'; error: Error | readonly [any, ...any[]] };

// GraphQL query to get current user
const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    authenticatedItem {
      ... on User {
        id
        name
        email
        isAdmin
      }
    }
  }
`;

// Custom AuthenticatedItemDialog to replace the default one
const AuthenticatedItemDialog = ({ item }: { item: AuthenticatedItem | undefined }) => {
  const { spacing, typography } = useTheme()
  return (
    <div
      css={{
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        margin: spacing.xlarge,
        marginBottom: 0,
      }}
    >
      {item && item.state === 'authenticated' ? (
        <div css={{ fontSize: typography.fontSize.small }}>
          Signed in as <strong css={{ display: 'block' }}>{item.label}</strong>
        </div>
      ) : null}

      {item && item.state === 'authenticated' && <AccountSettingsDialog />}
    </div>
  )
}

// Custom NavigationContainer to use our custom AuthenticatedItemDialog
type NavigationContainerProps = Partial<Pick<NavigationProps, 'authenticatedItem'>> & {
  children: React.ReactNode
}

const CustomNavigationContainer = ({ authenticatedItem, children }: NavigationContainerProps) => {
  const { spacing } = useTheme()
  return (
    <div
      css={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      <AuthenticatedItemDialog item={authenticatedItem} />
      <nav role="navigation" aria-label="Side Navigation" css={{ marginTop: spacing.xlarge }}>
        <ul
          css={{
            padding: 0,
            margin: 0,
            li: {
              listStyle: 'none',
            },
          }}
        >
          {children}
        </ul>
      </nav>
    </div>
  )
}

// Collapsible group component
interface CollapsibleGroupProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const CollapsibleGroup = ({ title, children, defaultOpen = true }: CollapsibleGroupProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <>
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: "16px 24px 8px",
          fontSize: "16px",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          color: "var(--muted)",
          borderTop: "1px solid var(--border-color)",
          marginTop: "8px",
          cursor: "pointer",
          userSelect: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          transition: "background-color 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.03)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "transparent";
        }}
      >
        <span>{title}</span>
        <span
          style={{
            fontSize: "14px",
            transition: "transform 0.2s",
            transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
          }}
        >
          ▸
        </span>
      </div>
      <div
        style={{
          maxHeight: isOpen ? "2000px" : "0",
          overflow: "hidden",
          transition: "max-height 0.3s ease-in-out",
        }}
      >
        {children}
      </div>
    </>
  );
};

export function CustomNavigation({ lists, authenticatedItem }: NavigationProps) {
  // Query current user to get admin status
  // Use cache-first policy to avoid unnecessary network requests
  const { data } = useQuery(GET_CURRENT_USER, {
    fetchPolicy: 'cache-first', // Use cached data if available
  });
  const isAdmin = data?.authenticatedItem?.isAdmin === true;

  // Helper function to check if any list in a group is visible
  const hasVisibleLists = (listKeys: string[]) => {
    return listKeys.some(key => {
      const list = lists.find(l => l.key === key)
      return list !== undefined
    })
  }

  return (
    <>
      <CustomNavigationContainer authenticatedItem={authenticatedItem}>

      {/* Authentication & Users - Only visible to admins */}
      {isAdmin && hasVisibleLists(["User", "Role", "Permission", "ActivityLog"]) && (
        <CollapsibleGroup title="身份验证 & 用户">
          <ListNavItems lists={lists} include={["User", "Role", "Permission", "ActivityLog"]} />
        </CollapsibleGroup>
      )}

      {/* Site Configuration */}
      {hasVisibleLists(["NavigationMenu"]) && (
        <CollapsibleGroup title="导航管理">
          <ListNavItems lists={lists} include={["NavigationMenu"]} />
          <NavItem href="/navigation-manager">Navigation Manager</NavItem>
        </CollapsibleGroup>
      )}

      {/* Home Page Content */}
      {hasVisibleLists([
        "HeroBannerItem",
        "ProductSeriesCarousel",
        "ServiceFeaturesConfig",
        "Sphere3d",
        "SimpleCta",
        "SeriesIntro",
        "FeaturedProducts",
        "BrandAdvantages",
        "OemOdm",
        "QuoteSteps",
        "MainForm",
        "WhyChooseBusrom",
        "CaseStudies",
        "BrandAnalysis",
        "BrandValue",
        "Footer",
      ]) && (
        <CollapsibleGroup title="首页内容" defaultOpen={false}>
          <ListNavItems
            lists={lists}
            include={[
              "HeroBannerItem",
              "ProductSeriesCarousel",
              "ServiceFeaturesConfig",
              "Sphere3d",
              "SimpleCta",
              "SeriesIntro",
              "FeaturedProducts",
              "BrandAdvantages",
              "OemOdm",
              "QuoteSteps",
              "MainForm",
              "WhyChooseBusrom",
              "CaseStudies",
              "BrandAnalysis",
              "BrandValue",
              "Footer",
            ]}
          />
        </CollapsibleGroup>
      )}

      {/* Media Library */}
      {hasVisibleLists(["Media", "MediaCategory", "MediaTag"]) && (
        <CollapsibleGroup title="媒体库 (AWS S3)">
          <ListNavItems lists={lists} include={["Media", "MediaCategory", "MediaTag"]} />
          <NavItem href="/batch-media-upload">Batch Media Upload</NavItem>
        </CollapsibleGroup>
      )}

      {/* Product Catalog */}
      {hasVisibleLists(["ProductSeries", "Product"]) && (
        <CollapsibleGroup title="产品管理">
          <ListNavItems lists={lists} include={["ProductSeries", "Product"]} />
        </CollapsibleGroup>
      )}

      {/* Content */}
      {hasVisibleLists(["Category", "Blog", "BlogContentTranslation", "Application", "Page", "FaqItem"]) && (
        <CollapsibleGroup title="内容管理">
          <ListNavItems
            lists={lists}
            include={["Category", "Blog", "BlogContentTranslation", "Application", "Page", "FaqItem"]}
          />
        </CollapsibleGroup>
      )}

      {/* Component Block */}
      {hasVisibleLists(["ProductSeriesContentTranslation", "ProductContentTranslation", "ApplicationContentTranslation", "PageContentTranslation", "BlogContentTranslation", "DocumentTemplate", "ReusableBlock", "ReusableBlockContentTranslation"]) && (
        <CollapsibleGroup title="组件块管理" defaultOpen={false}>
          <NavItem href="/product-series-content-translations">ProductSeries Component</NavItem>
          <NavItem href="/product-content-translations">Product Component</NavItem>
          <NavItem href="/application-content-translations">Application Component</NavItem>
          <NavItem href="/page-content-translations">Page Component</NavItem>
          <NavItem href="/blog-content-translations">Blog Component</NavItem>
          <ListNavItems
            lists={lists}
            include={["DocumentTemplate", "ReusableBlock", "ReusableBlockContentTranslation"]}
          />
        </CollapsibleGroup>
      )}

      {/* Forms */}
      {hasVisibleLists(["FormConfig", "FormSubmission"]) && (
        <CollapsibleGroup title="表单">
          <ListNavItems lists={lists} include={["FormConfig", "FormSubmission"]} />
          <NavItem href="/export-form-submissions">📊 Export Form Submissions</NavItem>
        </CollapsibleGroup>
      )}

      {/* Advanced Features */}
      {hasVisibleLists(["CustomScript", "SeoSetting"]) && (
        <CollapsibleGroup title="高级功能">
          <ListNavItems lists={lists} include={["CustomScript", "SeoSetting"]} />
        </CollapsibleGroup>
      )}

      {/* Site Configuration */}
      {hasVisibleLists(["SiteConfig"]) && (
        <CollapsibleGroup title="站点配置">
          <ListNavItems lists={lists} include={["SiteConfig"]} />
        </CollapsibleGroup>
      )}
      </CustomNavigationContainer>
    </>
  );
}
