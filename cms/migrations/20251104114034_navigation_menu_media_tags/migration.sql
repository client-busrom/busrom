-- CreateEnum
CREATE TYPE "NavigationMenuTypeType" AS ENUM ('STANDARD', 'PRODUCT_CARDS', 'SUBMENU');

-- CreateEnum
CREATE TYPE "CustomScriptScriptPositionType" AS ENUM ('header', 'footer', 'body_start');

-- CreateEnum
CREATE TYPE "CustomScriptScopeType" AS ENUM ('global', 'page_type', 'exact_path', 'path_pattern', 'related_content');

-- CreateEnum
CREATE TYPE "CustomScriptPageTypeType" AS ENUM ('home', 'product_series_list', 'product_series_detail', 'shop_list', 'shop_detail', 'blog_list', 'blog_detail', 'application_list', 'application_detail', 'service_overview', 'service_one_stop', 'service_faq', 'about_story', 'about_support', 'contact', 'privacy_policy', 'fraud_notice', 'custom');

-- CreateEnum
CREATE TYPE "SeoSettingScopeType" AS ENUM ('global', 'page_type', 'exact_path', 'path_pattern', 'related_content');

-- CreateEnum
CREATE TYPE "SeoSettingPageTypeType" AS ENUM ('home', 'product_series_list', 'product_series_detail', 'shop_list', 'shop_detail', 'blog_list', 'blog_detail', 'application_list', 'application_detail', 'service_overview', 'service_one_stop', 'service_faq', 'about_story', 'about_support', 'contact', 'privacy_policy', 'fraud_notice', 'custom');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL DEFAULT '',
    "password" TEXT NOT NULL,
    "avatar" UUID,
    "role" UUID,
    "status" TEXT DEFAULT 'ACTIVE',
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" UUID NOT NULL,
    "user" UUID,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL DEFAULT '',
    "entityId" TEXT NOT NULL DEFAULT '',
    "changes" TEXT NOT NULL DEFAULT '',
    "ipAddress" TEXT NOT NULL DEFAULT '',
    "userAgent" TEXT NOT NULL DEFAULT '',
    "timestamp" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteConfig" (
    "id" INTEGER NOT NULL,
    "identifier" TEXT NOT NULL DEFAULT 'site-config',
    "siteName" JSONB DEFAULT '{"en":"Busrom","zh":"Busrom"}',
    "companyName" JSONB DEFAULT '{"en":"Busrom Hardware Co., Ltd.","zh":"Busrom 五金有限公司"}',
    "logo" UUID,
    "favicon" UUID,
    "email" TEXT NOT NULL DEFAULT '',
    "phone" TEXT NOT NULL DEFAULT '',
    "whatsapp" TEXT NOT NULL DEFAULT '',
    "wechat" TEXT NOT NULL DEFAULT '',
    "address" TEXT NOT NULL DEFAULT '',
    "facebookUrl" TEXT NOT NULL DEFAULT '',
    "instagramUrl" TEXT NOT NULL DEFAULT '',
    "linkedinUrl" TEXT NOT NULL DEFAULT '',
    "youtubeUrl" TEXT NOT NULL DEFAULT '',
    "twitterUrl" TEXT NOT NULL DEFAULT '',
    "googleAnalyticsId" TEXT NOT NULL DEFAULT '',
    "googleSearchConsoleKey" TEXT NOT NULL DEFAULT '',
    "tiktokPixelId" TEXT NOT NULL DEFAULT '',
    "smtpHost" TEXT NOT NULL DEFAULT '',
    "smtpPort" TEXT NOT NULL DEFAULT '',
    "smtpUser" TEXT NOT NULL DEFAULT '',
    "smtpPassword" TEXT NOT NULL DEFAULT '',
    "emailFromAddress" TEXT NOT NULL DEFAULT 'noreply@busrom.com',
    "emailFromName" JSONB DEFAULT '{"en":"Busrom Team","zh":"Busrom 团队"}',
    "formNotificationEmails" TEXT NOT NULL DEFAULT '',
    "enableAutoReply" BOOLEAN NOT NULL DEFAULT false,
    "autoReplyTemplate" JSONB DEFAULT '{"en":"Dear {name},\n\nThank you for contacting Busrom. We have received your message and will get back to you within 24 hours.\n\nBest regards,\nBusrom Team","zh":"尊敬的 {name}，\n\n感谢您联系 Busrom。我们已收到您的留言，将在 24 小时内回复您。\n\n此致\nBusrom 团队"}',
    "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    "enableCaptcha" BOOLEAN NOT NULL DEFAULT true,
    "recaptchaSiteKey" TEXT NOT NULL DEFAULT '',
    "recaptchaSecretKey" TEXT NOT NULL DEFAULT '',
    "defaultLanguage" TEXT DEFAULT 'en',
    "enableIndexNow" BOOLEAN NOT NULL DEFAULT true,
    "indexNowKey" TEXT NOT NULL DEFAULT '',
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "SiteConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomePage" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Homepage Content',
    "heroHeadline" JSONB DEFAULT '{}',
    "heroSubheadline" JSONB DEFAULT '{}',
    "heroBanner" UUID,
    "aboutTitle" JSONB DEFAULT '{}',
    "aboutDescription" JSONB DEFAULT '{}',
    "status" TEXT DEFAULT 'ACTIVE',

    CONSTRAINT "HomePage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomeContent" (
    "id" UUID NOT NULL,
    "section" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER DEFAULT 1,
    "content" TEXT NOT NULL DEFAULT '',
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "HomeContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NavigationMenu" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL DEFAULT '',
    "name" JSONB DEFAULT '{}',
    "type" "NavigationMenuTypeType" NOT NULL DEFAULT 'STANDARD',
    "icon" TEXT NOT NULL DEFAULT '',
    "parent" UUID,
    "link" TEXT NOT NULL DEFAULT '',
    "order" INTEGER DEFAULT 1,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "visible" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "NavigationMenu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Media" (
    "id" UUID NOT NULL,
    "file_id" TEXT,
    "file_filesize" INTEGER,
    "file_width" INTEGER,
    "file_height" INTEGER,
    "file_extension" TEXT,
    "filename" TEXT NOT NULL DEFAULT '',
    "status" TEXT DEFAULT 'ACTIVE',
    "altText" JSONB DEFAULT '{}',
    "primaryCategory" UUID,
    "metadata" JSONB DEFAULT '{}',
    "uploadedBy" UUID,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaCategory" (
    "id" UUID NOT NULL,
    "name" JSONB DEFAULT '{}',
    "slug" TEXT NOT NULL DEFAULT '',
    "order" INTEGER DEFAULT 0,
    "icon" TEXT NOT NULL DEFAULT '',
    "description" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "MediaCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaTag" (
    "id" UUID NOT NULL,
    "name" JSONB DEFAULT '{}',
    "slug" TEXT NOT NULL DEFAULT '',
    "type" TEXT DEFAULT 'CUSTOM',
    "order" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "MediaTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" UUID NOT NULL,
    "name" JSONB DEFAULT '{}',
    "slug" TEXT NOT NULL DEFAULT '',
    "type" TEXT NOT NULL,
    "parent" UUID,
    "description" JSONB DEFAULT '{}',
    "order" INTEGER DEFAULT 0,
    "status" TEXT DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductSeries" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL DEFAULT '',
    "name" JSONB DEFAULT '{}',
    "description" JSONB DEFAULT '{}',
    "featuredImage" UUID,
    "category" UUID,
    "order" INTEGER DEFAULT 0,
    "status" TEXT DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "ProductSeries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductSeriesContentTranslation" (
    "id" UUID NOT NULL,
    "locale" TEXT NOT NULL DEFAULT '',
    "content" JSONB NOT NULL DEFAULT '[{"type":"paragraph","children":[{"text":""}]}]',
    "productSeries" UUID,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "ProductSeriesContentTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" UUID NOT NULL,
    "sku" TEXT NOT NULL DEFAULT '',
    "slug" TEXT NOT NULL DEFAULT '',
    "name" JSONB DEFAULT '{}',
    "shortDescription" JSONB DEFAULT '{}',
    "description" JSONB DEFAULT '{}',
    "featuredImage" UUID,
    "series" UUID,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER DEFAULT 0,
    "status" TEXT DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductContentTranslation" (
    "id" UUID NOT NULL,
    "locale" TEXT NOT NULL DEFAULT '',
    "content" JSONB NOT NULL DEFAULT '[{"type":"paragraph","children":[{"text":""}]}]',
    "product" UUID,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "ProductContentTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Blog" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL DEFAULT '',
    "title" JSONB DEFAULT '{}',
    "excerpt" JSONB DEFAULT '{}',
    "coverImage" UUID,
    "author" TEXT NOT NULL DEFAULT 'Busrom Team',
    "status" TEXT DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Blog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogContentTranslation" (
    "id" UUID NOT NULL,
    "locale" TEXT NOT NULL DEFAULT '',
    "content" JSONB NOT NULL DEFAULT '[{"type":"paragraph","children":[{"text":""}]}]',
    "blog" UUID,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "BlogContentTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Application" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL DEFAULT '',
    "name" JSONB DEFAULT '{}',
    "shortDescription" JSONB DEFAULT '{}',
    "description" JSONB DEFAULT '{}',
    "mainImage" UUID,
    "status" TEXT DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicationContentTranslation" (
    "id" UUID NOT NULL,
    "locale" TEXT NOT NULL DEFAULT '',
    "content" JSONB NOT NULL DEFAULT '[{"type":"paragraph","children":[{"text":""}]}]',
    "application" UUID,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "ApplicationContentTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FaqItem" (
    "id" UUID NOT NULL,
    "internalId" TEXT NOT NULL DEFAULT '',
    "question" JSONB DEFAULT '{}',
    "answer" JSONB DEFAULT '{}',
    "category" UUID,
    "order" INTEGER DEFAULT 0,
    "status" TEXT DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "FaqItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactForm" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL DEFAULT '',
    "whatsapp" TEXT NOT NULL DEFAULT '',
    "companyName" TEXT NOT NULL DEFAULT '',
    "message" TEXT NOT NULL DEFAULT '',
    "source" TEXT NOT NULL DEFAULT '',
    "locale" TEXT NOT NULL DEFAULT '',
    "ipAddress" TEXT NOT NULL DEFAULT '',
    "userAgent" TEXT NOT NULL DEFAULT '',
    "status" TEXT DEFAULT 'UNREAD',
    "submittedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactForm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomScript" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "scriptPosition" "CustomScriptScriptPositionType" NOT NULL DEFAULT 'header',
    "content" TEXT NOT NULL DEFAULT '',
    "scope" "CustomScriptScopeType" NOT NULL DEFAULT 'global',
    "pageType" "CustomScriptPageTypeType",
    "customPageRule" TEXT NOT NULL DEFAULT '',
    "exactPath" TEXT NOT NULL DEFAULT '',
    "pathPattern" TEXT NOT NULL DEFAULT '',
    "relatedProduct" UUID,
    "relatedBlog" UUID,
    "relatedApplication" UUID,
    "relatedProductSeries" UUID,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "priority" INTEGER DEFAULT 5,
    "async" BOOLEAN NOT NULL DEFAULT false,
    "defer" BOOLEAN NOT NULL DEFAULT false,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "lastTestedAt" TIMESTAMP(3),

    CONSTRAINT "CustomScript_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeoSetting" (
    "id" UUID NOT NULL,
    "identifier" TEXT NOT NULL DEFAULT '',
    "scope" "SeoSettingScopeType" NOT NULL DEFAULT 'global',
    "pageType" "SeoSettingPageTypeType",
    "customPageRule" TEXT NOT NULL DEFAULT '',
    "exactPath" TEXT NOT NULL DEFAULT '',
    "pathPattern" TEXT NOT NULL DEFAULT '',
    "relatedProduct" UUID,
    "relatedBlog" UUID,
    "relatedApplication" UUID,
    "relatedProductSeries" UUID,
    "title" JSONB DEFAULT '{}',
    "description" JSONB DEFAULT '{}',
    "keywords" JSONB DEFAULT '{}',
    "ogTitle" TEXT NOT NULL DEFAULT '',
    "ogDescription" TEXT NOT NULL DEFAULT '',
    "ogImage" UUID,
    "schemaType" TEXT,
    "schemaData" TEXT NOT NULL DEFAULT '',
    "hreflangInfo" TEXT NOT NULL DEFAULT '✅ Hreflang links are auto-generated by frontend | Hreflang链接由前端自动生成',
    "robotsIndex" BOOLEAN NOT NULL DEFAULT true,
    "robotsFollow" BOOLEAN NOT NULL DEFAULT true,
    "canonicalUrl" TEXT NOT NULL DEFAULT '',
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "SeoSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_HomePage_featuredProducts" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateTable
CREATE TABLE "_Media_tags" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateTable
CREATE TABLE "_Product_images" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateTable
CREATE TABLE "_NavigationMenu_mediaTags" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateTable
CREATE TABLE "_Blog_categories" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateTable
CREATE TABLE "_Application_images" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_avatar_idx" ON "User"("avatar");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE INDEX "ActivityLog_user_idx" ON "ActivityLog"("user");

-- CreateIndex
CREATE INDEX "SiteConfig_logo_idx" ON "SiteConfig"("logo");

-- CreateIndex
CREATE INDEX "SiteConfig_favicon_idx" ON "SiteConfig"("favicon");

-- CreateIndex
CREATE INDEX "HomePage_heroBanner_idx" ON "HomePage"("heroBanner");

-- CreateIndex
CREATE UNIQUE INDEX "HomeContent_section_key" ON "HomeContent"("section");

-- CreateIndex
CREATE UNIQUE INDEX "NavigationMenu_slug_key" ON "NavigationMenu"("slug");

-- CreateIndex
CREATE INDEX "NavigationMenu_parent_idx" ON "NavigationMenu"("parent");

-- CreateIndex
CREATE INDEX "Media_filename_idx" ON "Media"("filename");

-- CreateIndex
CREATE INDEX "Media_primaryCategory_idx" ON "Media"("primaryCategory");

-- CreateIndex
CREATE INDEX "Media_uploadedBy_idx" ON "Media"("uploadedBy");

-- CreateIndex
CREATE UNIQUE INDEX "MediaCategory_slug_key" ON "MediaCategory"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "MediaTag_slug_key" ON "MediaTag"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE INDEX "Category_parent_idx" ON "Category"("parent");

-- CreateIndex
CREATE UNIQUE INDEX "ProductSeries_slug_key" ON "ProductSeries"("slug");

-- CreateIndex
CREATE INDEX "ProductSeries_featuredImage_idx" ON "ProductSeries"("featuredImage");

-- CreateIndex
CREATE INDEX "ProductSeries_category_idx" ON "ProductSeries"("category");

-- CreateIndex
CREATE INDEX "ProductSeriesContentTranslation_productSeries_idx" ON "ProductSeriesContentTranslation"("productSeries");

-- CreateIndex
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- CreateIndex
CREATE INDEX "Product_featuredImage_idx" ON "Product"("featuredImage");

-- CreateIndex
CREATE INDEX "Product_series_idx" ON "Product"("series");

-- CreateIndex
CREATE INDEX "ProductContentTranslation_product_idx" ON "ProductContentTranslation"("product");

-- CreateIndex
CREATE UNIQUE INDEX "Blog_slug_key" ON "Blog"("slug");

-- CreateIndex
CREATE INDEX "Blog_coverImage_idx" ON "Blog"("coverImage");

-- CreateIndex
CREATE INDEX "BlogContentTranslation_blog_idx" ON "BlogContentTranslation"("blog");

-- CreateIndex
CREATE UNIQUE INDEX "Application_slug_key" ON "Application"("slug");

-- CreateIndex
CREATE INDEX "Application_mainImage_idx" ON "Application"("mainImage");

-- CreateIndex
CREATE INDEX "ApplicationContentTranslation_application_idx" ON "ApplicationContentTranslation"("application");

-- CreateIndex
CREATE INDEX "FaqItem_category_idx" ON "FaqItem"("category");

-- CreateIndex
CREATE INDEX "CustomScript_relatedProduct_idx" ON "CustomScript"("relatedProduct");

-- CreateIndex
CREATE INDEX "CustomScript_relatedBlog_idx" ON "CustomScript"("relatedBlog");

-- CreateIndex
CREATE INDEX "CustomScript_relatedApplication_idx" ON "CustomScript"("relatedApplication");

-- CreateIndex
CREATE INDEX "CustomScript_relatedProductSeries_idx" ON "CustomScript"("relatedProductSeries");

-- CreateIndex
CREATE UNIQUE INDEX "SeoSetting_identifier_key" ON "SeoSetting"("identifier");

-- CreateIndex
CREATE INDEX "SeoSetting_relatedProduct_idx" ON "SeoSetting"("relatedProduct");

-- CreateIndex
CREATE INDEX "SeoSetting_relatedBlog_idx" ON "SeoSetting"("relatedBlog");

-- CreateIndex
CREATE INDEX "SeoSetting_relatedApplication_idx" ON "SeoSetting"("relatedApplication");

-- CreateIndex
CREATE INDEX "SeoSetting_relatedProductSeries_idx" ON "SeoSetting"("relatedProductSeries");

-- CreateIndex
CREATE INDEX "SeoSetting_ogImage_idx" ON "SeoSetting"("ogImage");

-- CreateIndex
CREATE UNIQUE INDEX "_HomePage_featuredProducts_AB_unique" ON "_HomePage_featuredProducts"("A", "B");

-- CreateIndex
CREATE INDEX "_HomePage_featuredProducts_B_index" ON "_HomePage_featuredProducts"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Media_tags_AB_unique" ON "_Media_tags"("A", "B");

-- CreateIndex
CREATE INDEX "_Media_tags_B_index" ON "_Media_tags"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Product_images_AB_unique" ON "_Product_images"("A", "B");

-- CreateIndex
CREATE INDEX "_Product_images_B_index" ON "_Product_images"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_NavigationMenu_mediaTags_AB_unique" ON "_NavigationMenu_mediaTags"("A", "B");

-- CreateIndex
CREATE INDEX "_NavigationMenu_mediaTags_B_index" ON "_NavigationMenu_mediaTags"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Blog_categories_AB_unique" ON "_Blog_categories"("A", "B");

-- CreateIndex
CREATE INDEX "_Blog_categories_B_index" ON "_Blog_categories"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Application_images_AB_unique" ON "_Application_images"("A", "B");

-- CreateIndex
CREATE INDEX "_Application_images_B_index" ON "_Application_images"("B");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_avatar_fkey" FOREIGN KEY ("avatar") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_role_fkey" FOREIGN KEY ("role") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_user_fkey" FOREIGN KEY ("user") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteConfig" ADD CONSTRAINT "SiteConfig_logo_fkey" FOREIGN KEY ("logo") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteConfig" ADD CONSTRAINT "SiteConfig_favicon_fkey" FOREIGN KEY ("favicon") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomePage" ADD CONSTRAINT "HomePage_heroBanner_fkey" FOREIGN KEY ("heroBanner") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NavigationMenu" ADD CONSTRAINT "NavigationMenu_parent_fkey" FOREIGN KEY ("parent") REFERENCES "NavigationMenu"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_primaryCategory_fkey" FOREIGN KEY ("primaryCategory") REFERENCES "MediaCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_parent_fkey" FOREIGN KEY ("parent") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductSeries" ADD CONSTRAINT "ProductSeries_featuredImage_fkey" FOREIGN KEY ("featuredImage") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductSeries" ADD CONSTRAINT "ProductSeries_category_fkey" FOREIGN KEY ("category") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductSeriesContentTranslation" ADD CONSTRAINT "ProductSeriesContentTranslation_productSeries_fkey" FOREIGN KEY ("productSeries") REFERENCES "ProductSeries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_featuredImage_fkey" FOREIGN KEY ("featuredImage") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_series_fkey" FOREIGN KEY ("series") REFERENCES "ProductSeries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductContentTranslation" ADD CONSTRAINT "ProductContentTranslation_product_fkey" FOREIGN KEY ("product") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Blog" ADD CONSTRAINT "Blog_coverImage_fkey" FOREIGN KEY ("coverImage") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogContentTranslation" ADD CONSTRAINT "BlogContentTranslation_blog_fkey" FOREIGN KEY ("blog") REFERENCES "Blog"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_mainImage_fkey" FOREIGN KEY ("mainImage") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationContentTranslation" ADD CONSTRAINT "ApplicationContentTranslation_application_fkey" FOREIGN KEY ("application") REFERENCES "Application"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FaqItem" ADD CONSTRAINT "FaqItem_category_fkey" FOREIGN KEY ("category") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomScript" ADD CONSTRAINT "CustomScript_relatedProduct_fkey" FOREIGN KEY ("relatedProduct") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomScript" ADD CONSTRAINT "CustomScript_relatedBlog_fkey" FOREIGN KEY ("relatedBlog") REFERENCES "Blog"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomScript" ADD CONSTRAINT "CustomScript_relatedApplication_fkey" FOREIGN KEY ("relatedApplication") REFERENCES "Application"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomScript" ADD CONSTRAINT "CustomScript_relatedProductSeries_fkey" FOREIGN KEY ("relatedProductSeries") REFERENCES "ProductSeries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeoSetting" ADD CONSTRAINT "SeoSetting_relatedProduct_fkey" FOREIGN KEY ("relatedProduct") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeoSetting" ADD CONSTRAINT "SeoSetting_relatedBlog_fkey" FOREIGN KEY ("relatedBlog") REFERENCES "Blog"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeoSetting" ADD CONSTRAINT "SeoSetting_relatedApplication_fkey" FOREIGN KEY ("relatedApplication") REFERENCES "Application"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeoSetting" ADD CONSTRAINT "SeoSetting_relatedProductSeries_fkey" FOREIGN KEY ("relatedProductSeries") REFERENCES "ProductSeries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeoSetting" ADD CONSTRAINT "SeoSetting_ogImage_fkey" FOREIGN KEY ("ogImage") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_HomePage_featuredProducts" ADD CONSTRAINT "_HomePage_featuredProducts_A_fkey" FOREIGN KEY ("A") REFERENCES "HomePage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_HomePage_featuredProducts" ADD CONSTRAINT "_HomePage_featuredProducts_B_fkey" FOREIGN KEY ("B") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Media_tags" ADD CONSTRAINT "_Media_tags_A_fkey" FOREIGN KEY ("A") REFERENCES "Media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Media_tags" ADD CONSTRAINT "_Media_tags_B_fkey" FOREIGN KEY ("B") REFERENCES "MediaTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Product_images" ADD CONSTRAINT "_Product_images_A_fkey" FOREIGN KEY ("A") REFERENCES "Media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Product_images" ADD CONSTRAINT "_Product_images_B_fkey" FOREIGN KEY ("B") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_NavigationMenu_mediaTags" ADD CONSTRAINT "_NavigationMenu_mediaTags_A_fkey" FOREIGN KEY ("A") REFERENCES "MediaTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_NavigationMenu_mediaTags" ADD CONSTRAINT "_NavigationMenu_mediaTags_B_fkey" FOREIGN KEY ("B") REFERENCES "NavigationMenu"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Blog_categories" ADD CONSTRAINT "_Blog_categories_A_fkey" FOREIGN KEY ("A") REFERENCES "Blog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Blog_categories" ADD CONSTRAINT "_Blog_categories_B_fkey" FOREIGN KEY ("B") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Application_images" ADD CONSTRAINT "_Application_images_A_fkey" FOREIGN KEY ("A") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Application_images" ADD CONSTRAINT "_Application_images_B_fkey" FOREIGN KEY ("B") REFERENCES "Media"("id") ON DELETE CASCADE ON UPDATE CASCADE;
