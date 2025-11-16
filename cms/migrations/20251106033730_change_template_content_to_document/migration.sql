/*
  Warnings:

  - The primary key for the `Footer` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `contactInfo` on the `Footer` table. All the data in the column will be lost.
  - You are about to drop the column `formConfig` on the `Footer` table. All the data in the column will be lost.
  - You are about to drop the column `officialNotice` on the `Footer` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[internalLabel]` on the table `Footer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `Role` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `id` on the `Footer` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "PermissionResourceType" AS ENUM ('Product', 'ProductSeries', 'Blog', 'Application', 'FaqItem', 'Media', 'MediaCategory', 'MediaTag', 'Category', 'DocumentTemplate', 'ReusableBlock', 'ReusableBlockVersion', 'NavigationMenu', 'HomeContent', 'Footer', 'SiteConfig', 'SeoSetting', 'CustomScript', 'ContactForm', 'ActivityLog', 'User', 'Role', 'Permission');

-- CreateEnum
CREATE TYPE "PermissionActionType" AS ENUM ('create', 'read', 'update', 'delete', 'publish', 'export', 'import', 'manage_roles', 'manage_permissions', 'inject_code', 'view_logs');

-- CreateEnum
CREATE TYPE "ProductSeriesCarouselStatusType" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "SeriesIntroStatusType" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "FeaturedProductsStatusType" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "WhyChooseBusromStatusType" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "CaseStudiesStatusType" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "BrandValueStatusType" AS ENUM ('DRAFT', 'PUBLISHED');

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_role_fkey";

-- DropIndex
DROP INDEX "User_role_idx";

-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "category" UUID;

-- AlterTable
ALTER TABLE "ContactForm" ADD COLUMN     "emailSent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "relatedProduct" UUID;

-- AlterTable
ALTER TABLE "Footer" DROP CONSTRAINT "Footer_pkey",
DROP COLUMN "contactInfo",
DROP COLUMN "formConfig",
DROP COLUMN "officialNotice",
ADD COLUMN     "afterSalesEmail" JSONB DEFAULT '{}',
ADD COLUMN     "afterSalesLabel" JSONB DEFAULT '{}',
ADD COLUMN     "contactEmail" JSONB DEFAULT '{}',
ADD COLUMN     "contactEmailLabel" JSONB DEFAULT '{}',
ADD COLUMN     "contactTitle" JSONB DEFAULT '{}',
ADD COLUMN     "formButtonText" JSONB DEFAULT '{}',
ADD COLUMN     "formPlaceholderEmail" JSONB DEFAULT '{}',
ADD COLUMN     "formPlaceholderMessage" JSONB DEFAULT '{}',
ADD COLUMN     "formPlaceholderName" JSONB DEFAULT '{}',
ADD COLUMN     "formTitle" JSONB DEFAULT '{}',
ADD COLUMN     "internalLabel" TEXT NOT NULL DEFAULT 'Footer Configuration',
ADD COLUMN     "officialNoticeLine1" JSONB DEFAULT '{}',
ADD COLUMN     "officialNoticeLine2" JSONB DEFAULT '{}',
ADD COLUMN     "officialNoticeLine3" JSONB DEFAULT '{}',
ADD COLUMN     "officialNoticeLine4" JSONB DEFAULT '{}',
ADD COLUMN     "officialNoticeTitle" JSONB DEFAULT '{}',
ADD COLUMN     "publishedAt" TIMESTAMP(3),
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "whatsappLabel" JSONB DEFAULT '{}',
ADD COLUMN     "whatsappNumber" JSONB DEFAULT '{}',
DROP COLUMN "id",
ADD COLUMN     "id" INTEGER NOT NULL,
ADD CONSTRAINT "Footer_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "HomeContent" ADD COLUMN     "draftContent" JSONB,
ADD COLUMN     "publishedAt" TIMESTAMP(3),
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "Media" ADD COLUMN     "fileSize" INTEGER,
ADD COLUMN     "height" INTEGER,
ADD COLUMN     "mimeType" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "variants" JSONB DEFAULT '{}',
ADD COLUMN     "width" INTEGER;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "specifications" JSONB DEFAULT '[]';

-- AlterTable
ALTER TABLE "Role" ADD COLUMN     "code" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "createdBy" UUID,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isSystem" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "parentRole" UUID,
ADD COLUMN     "priority" INTEGER DEFAULT 5,
ADD COLUMN     "updatedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role",
ADD COLUMN     "isAdmin" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastLoginIp" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "loginAttempts" JSONB DEFAULT '[]',
ADD COLUMN     "twoFactorSecret" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "updatedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Permission" (
    "id" UUID NOT NULL,
    "resource" "PermissionResourceType" NOT NULL,
    "action" "PermissionActionType" NOT NULL,
    "identifier" TEXT NOT NULL DEFAULT '',
    "name" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "category" TEXT DEFAULT 'content_management',
    "isSystem" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HeroBannerItem" (
    "id" UUID NOT NULL,
    "internalLabel" TEXT NOT NULL DEFAULT '',
    "title" JSONB DEFAULT '{}',
    "feature1" JSONB DEFAULT '{}',
    "feature2" JSONB DEFAULT '{}',
    "feature3" JSONB DEFAULT '{}',
    "feature4" JSONB DEFAULT '{}',
    "feature5" JSONB DEFAULT '{}',
    "image1" UUID,
    "image2" UUID,
    "image3" UUID,
    "image4" UUID,
    "order" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "HeroBannerItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductSeriesCarousel" (
    "id" UUID NOT NULL,
    "internalLabel" TEXT NOT NULL DEFAULT '',
    "order" INTEGER NOT NULL DEFAULT 1,
    "autoPlay" BOOLEAN NOT NULL DEFAULT true,
    "autoPlaySpeed" INTEGER DEFAULT 5000,
    "status" "ProductSeriesCarouselStatusType" DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "ProductSeriesCarousel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceFeaturesConfig" (
    "id" UUID NOT NULL,
    "internalLabel" TEXT NOT NULL DEFAULT 'Service Features Configuration',
    "title" JSONB DEFAULT '{}',
    "subtitle" JSONB DEFAULT '{}',
    "feature1Title" JSONB DEFAULT '{}',
    "feature1ShortTitle" JSONB DEFAULT '{}',
    "feature1Description" JSONB DEFAULT '{}',
    "feature1Image1" UUID,
    "feature1Image2" UUID,
    "feature1Image3" UUID,
    "feature1Image4" UUID,
    "feature2Title" JSONB DEFAULT '{}',
    "feature2ShortTitle" JSONB DEFAULT '{}',
    "feature2Description" JSONB DEFAULT '{}',
    "feature2Image1" UUID,
    "feature2Image2" UUID,
    "feature3Title" JSONB DEFAULT '{}',
    "feature3ShortTitle" JSONB DEFAULT '{}',
    "feature3Description" JSONB DEFAULT '{}',
    "feature3Image1" UUID,
    "feature3Image2" UUID,
    "feature3Image3" UUID,
    "feature3Image4" UUID,
    "feature3Image5" UUID,
    "feature3Image6" UUID,
    "feature4Title" JSONB DEFAULT '{}',
    "feature4ShortTitle" JSONB DEFAULT '{}',
    "feature4Description" JSONB DEFAULT '{}',
    "feature4Image1" UUID,
    "feature4Image2" UUID,
    "feature5Title" JSONB DEFAULT '{}',
    "feature5ShortTitle" JSONB DEFAULT '{}',
    "feature5Description" JSONB DEFAULT '{}',
    "feature5Image1" UUID,
    "feature5Image2" UUID,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "ServiceFeaturesConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sphere3d" (
    "id" UUID NOT NULL,
    "internalLabel" TEXT NOT NULL DEFAULT '3D Sphere Configuration',
    "note" TEXT NOT NULL DEFAULT 'This configuration is reserved for future 3D sphere functionality',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Sphere3d_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SimpleCta" (
    "id" UUID NOT NULL,
    "internalLabel" TEXT NOT NULL DEFAULT 'Simple CTA Configuration',
    "title" JSONB DEFAULT '{}',
    "title2" JSONB DEFAULT '{}',
    "subtitle" JSONB DEFAULT '{}',
    "description" JSONB DEFAULT '{}',
    "buttonText" JSONB DEFAULT '{}',
    "image1" UUID,
    "image2" UUID,
    "image3" UUID,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "SimpleCta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeriesIntro" (
    "id" UUID NOT NULL,
    "internalLabel" TEXT NOT NULL DEFAULT '',
    "productSeries" UUID,
    "title" JSONB,
    "description" JSONB,
    "href" TEXT NOT NULL DEFAULT '',
    "status" "SeriesIntroStatusType" DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "SeriesIntro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeaturedProducts" (
    "id" INTEGER NOT NULL,
    "internalLabel" TEXT NOT NULL DEFAULT 'Featured Products Configuration',
    "title" JSONB,
    "description" JSONB,
    "viewAllButtonText" JSONB,
    "status" "FeaturedProductsStatusType" DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "FeaturedProducts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrandAdvantages" (
    "id" UUID NOT NULL,
    "internalLabel" TEXT NOT NULL DEFAULT 'Brand Advantages Configuration',
    "advantage1" JSONB DEFAULT '{}',
    "icon1" TEXT NOT NULL DEFAULT 'Sparkles',
    "advantage2" JSONB DEFAULT '{}',
    "icon2" TEXT NOT NULL DEFAULT 'Target',
    "advantage3" JSONB DEFAULT '{}',
    "icon3" TEXT NOT NULL DEFAULT 'Component',
    "advantage4" JSONB DEFAULT '{}',
    "icon4" TEXT NOT NULL DEFAULT 'ShieldCheck',
    "advantage5" JSONB DEFAULT '{}',
    "icon5" TEXT NOT NULL DEFAULT 'Gauge',
    "advantage6" JSONB DEFAULT '{}',
    "icon6" TEXT NOT NULL DEFAULT 'EyeOff',
    "advantage7" JSONB DEFAULT '{}',
    "icon7" TEXT NOT NULL DEFAULT 'Waves',
    "advantage8" JSONB DEFAULT '{}',
    "icon8" TEXT NOT NULL DEFAULT 'Cpu',
    "advantage9" JSONB DEFAULT '{}',
    "icon9" TEXT NOT NULL DEFAULT 'Factory',
    "image" UUID,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "BrandAdvantages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OemOdm" (
    "id" UUID NOT NULL,
    "internalLabel" TEXT NOT NULL DEFAULT 'OEM/ODM Configuration',
    "oemTitle" JSONB DEFAULT '{}',
    "oemBgImage" UUID,
    "oemImage" UUID,
    "oemDescription1" JSONB DEFAULT '{}',
    "oemDescription2" JSONB DEFAULT '{}',
    "odmTitle" JSONB DEFAULT '{}',
    "odmBgImage" UUID,
    "odmImage" UUID,
    "odmDescription1" JSONB DEFAULT '{}',
    "odmDescription2" JSONB DEFAULT '{}',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "OemOdm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuoteSteps" (
    "id" UUID NOT NULL,
    "internalLabel" TEXT NOT NULL DEFAULT 'Quote Steps Configuration',
    "title" JSONB DEFAULT '{}',
    "title2" JSONB DEFAULT '{}',
    "subtitle" JSONB DEFAULT '{}',
    "description" JSONB DEFAULT '{}',
    "step1Text" JSONB DEFAULT '{}',
    "step1Image" UUID,
    "step2Text" JSONB DEFAULT '{}',
    "step2Image" UUID,
    "step3Text" JSONB DEFAULT '{}',
    "step3Image" UUID,
    "step4Text" JSONB DEFAULT '{}',
    "step4Image" UUID,
    "step5Text" JSONB DEFAULT '{}',
    "step5Image" UUID,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "QuoteSteps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MainForm" (
    "id" UUID NOT NULL,
    "internalLabel" TEXT NOT NULL DEFAULT 'Main Form Configuration',
    "placeholderName" JSONB DEFAULT '{}',
    "placeholderEmail" JSONB DEFAULT '{}',
    "placeholderWhatsapp" JSONB DEFAULT '{}',
    "placeholderCompany" JSONB DEFAULT '{}',
    "placeholderMessage" JSONB DEFAULT '{}',
    "placeholderVerify" JSONB DEFAULT '{}',
    "buttonText" JSONB DEFAULT '{}',
    "designTextLeft" JSONB DEFAULT '{}',
    "designTextRight" JSONB DEFAULT '{}',
    "image1" UUID,
    "image2" UUID,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "MainForm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WhyChooseBusrom" (
    "id" INTEGER NOT NULL,
    "internalLabel" TEXT NOT NULL DEFAULT 'Why Choose Busrom Configuration',
    "title" JSONB,
    "title2" JSONB,
    "reason1Title" JSONB,
    "reason1Description" JSONB,
    "reason1Image" UUID,
    "reason2Title" JSONB,
    "reason2Description" JSONB,
    "reason2Image" UUID,
    "reason3Title" JSONB,
    "reason3Description" JSONB,
    "reason3Image" UUID,
    "reason4Title" JSONB,
    "reason4Description" JSONB,
    "reason4Image" UUID,
    "reason5Title" JSONB,
    "reason5Description" JSONB,
    "reason5Image" UUID,
    "status" "WhyChooseBusromStatusType" DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "WhyChooseBusrom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseStudies" (
    "id" INTEGER NOT NULL,
    "internalLabel" TEXT NOT NULL DEFAULT 'Case Studies Configuration',
    "title" JSONB,
    "description" JSONB,
    "status" "CaseStudiesStatusType" DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "CaseStudies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrandAnalysis" (
    "id" UUID NOT NULL,
    "internalLabel" TEXT NOT NULL DEFAULT 'Brand Analysis Configuration',
    "analysisTitle" JSONB DEFAULT '{}',
    "analysisTitle2" JSONB DEFAULT '{}',
    "analysisText" JSONB DEFAULT '{}',
    "analysisText2" JSONB DEFAULT '{}',
    "brandCenterTitle" JSONB DEFAULT '{}',
    "brandCenterDescription" JSONB DEFAULT '{}',
    "projectCenterTitle" JSONB DEFAULT '{}',
    "projectCenterDescription" JSONB DEFAULT '{}',
    "serviceCenterTitle" JSONB DEFAULT '{}',
    "serviceCenterDescription" JSONB DEFAULT '{}',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "BrandAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrandValue" (
    "id" INTEGER NOT NULL,
    "internalLabel" TEXT NOT NULL DEFAULT 'Brand Value Configuration',
    "title" JSONB,
    "subtitle" JSONB,
    "param1Title" JSONB,
    "param1Description" JSONB,
    "param1Image" UUID,
    "param2Title" JSONB,
    "param2Description" JSONB,
    "param2Image" UUID,
    "sloganTitle" JSONB,
    "sloganDescription" JSONB,
    "sloganImage" UUID,
    "valueTitle" JSONB,
    "valueDescription" JSONB,
    "valueImage" UUID,
    "visionTitle" JSONB,
    "visionDescription" JSONB,
    "visionImage" UUID,
    "status" "BrandValueStatusType" DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "BrandValue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentTemplate" (
    "id" UUID NOT NULL,
    "key" TEXT NOT NULL DEFAULT '',
    "name" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "category" TEXT DEFAULT 'other',
    "content" JSONB NOT NULL DEFAULT '[{"type":"paragraph","children":[{"text":""}]}]',
    "previewImage" UUID,
    "tags" TEXT NOT NULL DEFAULT '',
    "usageCount" JSONB DEFAULT '{"count":0}',
    "status" TEXT DEFAULT 'active',
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "DocumentTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReusableBlock" (
    "id" UUID NOT NULL,
    "key" TEXT NOT NULL DEFAULT '',
    "name" TEXT NOT NULL DEFAULT '',
    "locale" TEXT NOT NULL DEFAULT 'en',
    "category" TEXT DEFAULT 'other',
    "content" JSONB NOT NULL DEFAULT '[{"type":"paragraph","children":[{"text":""}]}]',
    "status" TEXT DEFAULT 'active',
    "updatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReusableBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReusableBlockVersion" (
    "id" UUID NOT NULL,
    "reusableBlock" UUID,
    "versionNumber" INTEGER NOT NULL,
    "content" JSONB,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReusableBlockVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_Role_users" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateTable
CREATE TABLE "_Permission_roles" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateTable
CREATE TABLE "_Permission_users" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateTable
CREATE TABLE "_FeaturedProducts_categories" (
    "A" INTEGER NOT NULL,
    "B" UUID NOT NULL
);

-- CreateTable
CREATE TABLE "_CaseStudies_categories" (
    "A" INTEGER NOT NULL,
    "B" UUID NOT NULL
);

-- CreateTable
CREATE TABLE "_SeriesIntro_images" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateTable
CREATE TABLE "_ProductSeriesCarousel_productSeries" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Permission_identifier_key" ON "Permission"("identifier");

-- CreateIndex
CREATE INDEX "HeroBannerItem_image1_idx" ON "HeroBannerItem"("image1");

-- CreateIndex
CREATE INDEX "HeroBannerItem_image2_idx" ON "HeroBannerItem"("image2");

-- CreateIndex
CREATE INDEX "HeroBannerItem_image3_idx" ON "HeroBannerItem"("image3");

-- CreateIndex
CREATE INDEX "HeroBannerItem_image4_idx" ON "HeroBannerItem"("image4");

-- CreateIndex
CREATE INDEX "ServiceFeaturesConfig_feature1Image1_idx" ON "ServiceFeaturesConfig"("feature1Image1");

-- CreateIndex
CREATE INDEX "ServiceFeaturesConfig_feature1Image2_idx" ON "ServiceFeaturesConfig"("feature1Image2");

-- CreateIndex
CREATE INDEX "ServiceFeaturesConfig_feature1Image3_idx" ON "ServiceFeaturesConfig"("feature1Image3");

-- CreateIndex
CREATE INDEX "ServiceFeaturesConfig_feature1Image4_idx" ON "ServiceFeaturesConfig"("feature1Image4");

-- CreateIndex
CREATE INDEX "ServiceFeaturesConfig_feature2Image1_idx" ON "ServiceFeaturesConfig"("feature2Image1");

-- CreateIndex
CREATE INDEX "ServiceFeaturesConfig_feature2Image2_idx" ON "ServiceFeaturesConfig"("feature2Image2");

-- CreateIndex
CREATE INDEX "ServiceFeaturesConfig_feature3Image1_idx" ON "ServiceFeaturesConfig"("feature3Image1");

-- CreateIndex
CREATE INDEX "ServiceFeaturesConfig_feature3Image2_idx" ON "ServiceFeaturesConfig"("feature3Image2");

-- CreateIndex
CREATE INDEX "ServiceFeaturesConfig_feature3Image3_idx" ON "ServiceFeaturesConfig"("feature3Image3");

-- CreateIndex
CREATE INDEX "ServiceFeaturesConfig_feature3Image4_idx" ON "ServiceFeaturesConfig"("feature3Image4");

-- CreateIndex
CREATE INDEX "ServiceFeaturesConfig_feature3Image5_idx" ON "ServiceFeaturesConfig"("feature3Image5");

-- CreateIndex
CREATE INDEX "ServiceFeaturesConfig_feature3Image6_idx" ON "ServiceFeaturesConfig"("feature3Image6");

-- CreateIndex
CREATE INDEX "ServiceFeaturesConfig_feature4Image1_idx" ON "ServiceFeaturesConfig"("feature4Image1");

-- CreateIndex
CREATE INDEX "ServiceFeaturesConfig_feature4Image2_idx" ON "ServiceFeaturesConfig"("feature4Image2");

-- CreateIndex
CREATE INDEX "ServiceFeaturesConfig_feature5Image1_idx" ON "ServiceFeaturesConfig"("feature5Image1");

-- CreateIndex
CREATE INDEX "ServiceFeaturesConfig_feature5Image2_idx" ON "ServiceFeaturesConfig"("feature5Image2");

-- CreateIndex
CREATE INDEX "SimpleCta_image1_idx" ON "SimpleCta"("image1");

-- CreateIndex
CREATE INDEX "SimpleCta_image2_idx" ON "SimpleCta"("image2");

-- CreateIndex
CREATE INDEX "SimpleCta_image3_idx" ON "SimpleCta"("image3");

-- CreateIndex
CREATE INDEX "SeriesIntro_productSeries_idx" ON "SeriesIntro"("productSeries");

-- CreateIndex
CREATE UNIQUE INDEX "FeaturedProducts_internalLabel_key" ON "FeaturedProducts"("internalLabel");

-- CreateIndex
CREATE INDEX "BrandAdvantages_image_idx" ON "BrandAdvantages"("image");

-- CreateIndex
CREATE INDEX "OemOdm_oemBgImage_idx" ON "OemOdm"("oemBgImage");

-- CreateIndex
CREATE INDEX "OemOdm_oemImage_idx" ON "OemOdm"("oemImage");

-- CreateIndex
CREATE INDEX "OemOdm_odmBgImage_idx" ON "OemOdm"("odmBgImage");

-- CreateIndex
CREATE INDEX "OemOdm_odmImage_idx" ON "OemOdm"("odmImage");

-- CreateIndex
CREATE INDEX "QuoteSteps_step1Image_idx" ON "QuoteSteps"("step1Image");

-- CreateIndex
CREATE INDEX "QuoteSteps_step2Image_idx" ON "QuoteSteps"("step2Image");

-- CreateIndex
CREATE INDEX "QuoteSteps_step3Image_idx" ON "QuoteSteps"("step3Image");

-- CreateIndex
CREATE INDEX "QuoteSteps_step4Image_idx" ON "QuoteSteps"("step4Image");

-- CreateIndex
CREATE INDEX "QuoteSteps_step5Image_idx" ON "QuoteSteps"("step5Image");

-- CreateIndex
CREATE INDEX "MainForm_image1_idx" ON "MainForm"("image1");

-- CreateIndex
CREATE INDEX "MainForm_image2_idx" ON "MainForm"("image2");

-- CreateIndex
CREATE UNIQUE INDEX "WhyChooseBusrom_internalLabel_key" ON "WhyChooseBusrom"("internalLabel");

-- CreateIndex
CREATE INDEX "WhyChooseBusrom_reason1Image_idx" ON "WhyChooseBusrom"("reason1Image");

-- CreateIndex
CREATE INDEX "WhyChooseBusrom_reason2Image_idx" ON "WhyChooseBusrom"("reason2Image");

-- CreateIndex
CREATE INDEX "WhyChooseBusrom_reason3Image_idx" ON "WhyChooseBusrom"("reason3Image");

-- CreateIndex
CREATE INDEX "WhyChooseBusrom_reason4Image_idx" ON "WhyChooseBusrom"("reason4Image");

-- CreateIndex
CREATE INDEX "WhyChooseBusrom_reason5Image_idx" ON "WhyChooseBusrom"("reason5Image");

-- CreateIndex
CREATE UNIQUE INDEX "CaseStudies_internalLabel_key" ON "CaseStudies"("internalLabel");

-- CreateIndex
CREATE UNIQUE INDEX "BrandValue_internalLabel_key" ON "BrandValue"("internalLabel");

-- CreateIndex
CREATE INDEX "BrandValue_param1Image_idx" ON "BrandValue"("param1Image");

-- CreateIndex
CREATE INDEX "BrandValue_param2Image_idx" ON "BrandValue"("param2Image");

-- CreateIndex
CREATE INDEX "BrandValue_sloganImage_idx" ON "BrandValue"("sloganImage");

-- CreateIndex
CREATE INDEX "BrandValue_valueImage_idx" ON "BrandValue"("valueImage");

-- CreateIndex
CREATE INDEX "BrandValue_visionImage_idx" ON "BrandValue"("visionImage");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentTemplate_key_key" ON "DocumentTemplate"("key");

-- CreateIndex
CREATE INDEX "DocumentTemplate_previewImage_idx" ON "DocumentTemplate"("previewImage");

-- CreateIndex
CREATE UNIQUE INDEX "ReusableBlock_key_key" ON "ReusableBlock"("key");

-- CreateIndex
CREATE INDEX "ReusableBlockVersion_reusableBlock_idx" ON "ReusableBlockVersion"("reusableBlock");

-- CreateIndex
CREATE UNIQUE INDEX "_Role_users_AB_unique" ON "_Role_users"("A", "B");

-- CreateIndex
CREATE INDEX "_Role_users_B_index" ON "_Role_users"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Permission_roles_AB_unique" ON "_Permission_roles"("A", "B");

-- CreateIndex
CREATE INDEX "_Permission_roles_B_index" ON "_Permission_roles"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Permission_users_AB_unique" ON "_Permission_users"("A", "B");

-- CreateIndex
CREATE INDEX "_Permission_users_B_index" ON "_Permission_users"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_FeaturedProducts_categories_AB_unique" ON "_FeaturedProducts_categories"("A", "B");

-- CreateIndex
CREATE INDEX "_FeaturedProducts_categories_B_index" ON "_FeaturedProducts_categories"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_CaseStudies_categories_AB_unique" ON "_CaseStudies_categories"("A", "B");

-- CreateIndex
CREATE INDEX "_CaseStudies_categories_B_index" ON "_CaseStudies_categories"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_SeriesIntro_images_AB_unique" ON "_SeriesIntro_images"("A", "B");

-- CreateIndex
CREATE INDEX "_SeriesIntro_images_B_index" ON "_SeriesIntro_images"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ProductSeriesCarousel_productSeries_AB_unique" ON "_ProductSeriesCarousel_productSeries"("A", "B");

-- CreateIndex
CREATE INDEX "_ProductSeriesCarousel_productSeries_B_index" ON "_ProductSeriesCarousel_productSeries"("B");

-- CreateIndex
CREATE INDEX "Application_category_idx" ON "Application"("category");

-- CreateIndex
CREATE INDEX "ContactForm_relatedProduct_idx" ON "ContactForm"("relatedProduct");

-- CreateIndex
CREATE UNIQUE INDEX "Footer_internalLabel_key" ON "Footer"("internalLabel");

-- CreateIndex
CREATE UNIQUE INDEX "Role_code_key" ON "Role"("code");

-- CreateIndex
CREATE INDEX "Role_parentRole_idx" ON "Role"("parentRole");

-- CreateIndex
CREATE INDEX "Role_createdBy_idx" ON "Role"("createdBy");

-- AddForeignKey
ALTER TABLE "Role" ADD CONSTRAINT "Role_parentRole_fkey" FOREIGN KEY ("parentRole") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Role" ADD CONSTRAINT "Role_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeroBannerItem" ADD CONSTRAINT "HeroBannerItem_image1_fkey" FOREIGN KEY ("image1") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeroBannerItem" ADD CONSTRAINT "HeroBannerItem_image2_fkey" FOREIGN KEY ("image2") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeroBannerItem" ADD CONSTRAINT "HeroBannerItem_image3_fkey" FOREIGN KEY ("image3") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeroBannerItem" ADD CONSTRAINT "HeroBannerItem_image4_fkey" FOREIGN KEY ("image4") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceFeaturesConfig" ADD CONSTRAINT "ServiceFeaturesConfig_feature1Image1_fkey" FOREIGN KEY ("feature1Image1") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceFeaturesConfig" ADD CONSTRAINT "ServiceFeaturesConfig_feature1Image2_fkey" FOREIGN KEY ("feature1Image2") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceFeaturesConfig" ADD CONSTRAINT "ServiceFeaturesConfig_feature1Image3_fkey" FOREIGN KEY ("feature1Image3") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceFeaturesConfig" ADD CONSTRAINT "ServiceFeaturesConfig_feature1Image4_fkey" FOREIGN KEY ("feature1Image4") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceFeaturesConfig" ADD CONSTRAINT "ServiceFeaturesConfig_feature2Image1_fkey" FOREIGN KEY ("feature2Image1") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceFeaturesConfig" ADD CONSTRAINT "ServiceFeaturesConfig_feature2Image2_fkey" FOREIGN KEY ("feature2Image2") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceFeaturesConfig" ADD CONSTRAINT "ServiceFeaturesConfig_feature3Image1_fkey" FOREIGN KEY ("feature3Image1") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceFeaturesConfig" ADD CONSTRAINT "ServiceFeaturesConfig_feature3Image2_fkey" FOREIGN KEY ("feature3Image2") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceFeaturesConfig" ADD CONSTRAINT "ServiceFeaturesConfig_feature3Image3_fkey" FOREIGN KEY ("feature3Image3") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceFeaturesConfig" ADD CONSTRAINT "ServiceFeaturesConfig_feature3Image4_fkey" FOREIGN KEY ("feature3Image4") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceFeaturesConfig" ADD CONSTRAINT "ServiceFeaturesConfig_feature3Image5_fkey" FOREIGN KEY ("feature3Image5") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceFeaturesConfig" ADD CONSTRAINT "ServiceFeaturesConfig_feature3Image6_fkey" FOREIGN KEY ("feature3Image6") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceFeaturesConfig" ADD CONSTRAINT "ServiceFeaturesConfig_feature4Image1_fkey" FOREIGN KEY ("feature4Image1") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceFeaturesConfig" ADD CONSTRAINT "ServiceFeaturesConfig_feature4Image2_fkey" FOREIGN KEY ("feature4Image2") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceFeaturesConfig" ADD CONSTRAINT "ServiceFeaturesConfig_feature5Image1_fkey" FOREIGN KEY ("feature5Image1") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceFeaturesConfig" ADD CONSTRAINT "ServiceFeaturesConfig_feature5Image2_fkey" FOREIGN KEY ("feature5Image2") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SimpleCta" ADD CONSTRAINT "SimpleCta_image1_fkey" FOREIGN KEY ("image1") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SimpleCta" ADD CONSTRAINT "SimpleCta_image2_fkey" FOREIGN KEY ("image2") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SimpleCta" ADD CONSTRAINT "SimpleCta_image3_fkey" FOREIGN KEY ("image3") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeriesIntro" ADD CONSTRAINT "SeriesIntro_productSeries_fkey" FOREIGN KEY ("productSeries") REFERENCES "ProductSeries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandAdvantages" ADD CONSTRAINT "BrandAdvantages_image_fkey" FOREIGN KEY ("image") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OemOdm" ADD CONSTRAINT "OemOdm_oemBgImage_fkey" FOREIGN KEY ("oemBgImage") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OemOdm" ADD CONSTRAINT "OemOdm_oemImage_fkey" FOREIGN KEY ("oemImage") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OemOdm" ADD CONSTRAINT "OemOdm_odmBgImage_fkey" FOREIGN KEY ("odmBgImage") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OemOdm" ADD CONSTRAINT "OemOdm_odmImage_fkey" FOREIGN KEY ("odmImage") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteSteps" ADD CONSTRAINT "QuoteSteps_step1Image_fkey" FOREIGN KEY ("step1Image") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteSteps" ADD CONSTRAINT "QuoteSteps_step2Image_fkey" FOREIGN KEY ("step2Image") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteSteps" ADD CONSTRAINT "QuoteSteps_step3Image_fkey" FOREIGN KEY ("step3Image") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteSteps" ADD CONSTRAINT "QuoteSteps_step4Image_fkey" FOREIGN KEY ("step4Image") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteSteps" ADD CONSTRAINT "QuoteSteps_step5Image_fkey" FOREIGN KEY ("step5Image") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MainForm" ADD CONSTRAINT "MainForm_image1_fkey" FOREIGN KEY ("image1") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MainForm" ADD CONSTRAINT "MainForm_image2_fkey" FOREIGN KEY ("image2") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhyChooseBusrom" ADD CONSTRAINT "WhyChooseBusrom_reason1Image_fkey" FOREIGN KEY ("reason1Image") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhyChooseBusrom" ADD CONSTRAINT "WhyChooseBusrom_reason2Image_fkey" FOREIGN KEY ("reason2Image") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhyChooseBusrom" ADD CONSTRAINT "WhyChooseBusrom_reason3Image_fkey" FOREIGN KEY ("reason3Image") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhyChooseBusrom" ADD CONSTRAINT "WhyChooseBusrom_reason4Image_fkey" FOREIGN KEY ("reason4Image") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhyChooseBusrom" ADD CONSTRAINT "WhyChooseBusrom_reason5Image_fkey" FOREIGN KEY ("reason5Image") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandValue" ADD CONSTRAINT "BrandValue_param1Image_fkey" FOREIGN KEY ("param1Image") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandValue" ADD CONSTRAINT "BrandValue_param2Image_fkey" FOREIGN KEY ("param2Image") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandValue" ADD CONSTRAINT "BrandValue_sloganImage_fkey" FOREIGN KEY ("sloganImage") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandValue" ADD CONSTRAINT "BrandValue_valueImage_fkey" FOREIGN KEY ("valueImage") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandValue" ADD CONSTRAINT "BrandValue_visionImage_fkey" FOREIGN KEY ("visionImage") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_category_fkey" FOREIGN KEY ("category") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentTemplate" ADD CONSTRAINT "DocumentTemplate_previewImage_fkey" FOREIGN KEY ("previewImage") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReusableBlockVersion" ADD CONSTRAINT "ReusableBlockVersion_reusableBlock_fkey" FOREIGN KEY ("reusableBlock") REFERENCES "ReusableBlock"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactForm" ADD CONSTRAINT "ContactForm_relatedProduct_fkey" FOREIGN KEY ("relatedProduct") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Role_users" ADD CONSTRAINT "_Role_users_A_fkey" FOREIGN KEY ("A") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Role_users" ADD CONSTRAINT "_Role_users_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Permission_roles" ADD CONSTRAINT "_Permission_roles_A_fkey" FOREIGN KEY ("A") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Permission_roles" ADD CONSTRAINT "_Permission_roles_B_fkey" FOREIGN KEY ("B") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Permission_users" ADD CONSTRAINT "_Permission_users_A_fkey" FOREIGN KEY ("A") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Permission_users" ADD CONSTRAINT "_Permission_users_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FeaturedProducts_categories" ADD CONSTRAINT "_FeaturedProducts_categories_A_fkey" FOREIGN KEY ("A") REFERENCES "FeaturedProducts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FeaturedProducts_categories" ADD CONSTRAINT "_FeaturedProducts_categories_B_fkey" FOREIGN KEY ("B") REFERENCES "ProductSeries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CaseStudies_categories" ADD CONSTRAINT "_CaseStudies_categories_A_fkey" FOREIGN KEY ("A") REFERENCES "CaseStudies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CaseStudies_categories" ADD CONSTRAINT "_CaseStudies_categories_B_fkey" FOREIGN KEY ("B") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SeriesIntro_images" ADD CONSTRAINT "_SeriesIntro_images_A_fkey" FOREIGN KEY ("A") REFERENCES "Media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SeriesIntro_images" ADD CONSTRAINT "_SeriesIntro_images_B_fkey" FOREIGN KEY ("B") REFERENCES "SeriesIntro"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductSeriesCarousel_productSeries" ADD CONSTRAINT "_ProductSeriesCarousel_productSeries_A_fkey" FOREIGN KEY ("A") REFERENCES "ProductSeries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductSeriesCarousel_productSeries" ADD CONSTRAINT "_ProductSeriesCarousel_productSeries_B_fkey" FOREIGN KEY ("B") REFERENCES "ProductSeriesCarousel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
