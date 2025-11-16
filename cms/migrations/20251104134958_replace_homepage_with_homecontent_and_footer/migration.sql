/*
  Warnings:

  - The `content` column on the `HomeContent` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `HomePage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_HomePage_featuredProducts` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "HomePage" DROP CONSTRAINT "HomePage_heroBanner_fkey";

-- DropForeignKey
ALTER TABLE "_HomePage_featuredProducts" DROP CONSTRAINT "_HomePage_featuredProducts_A_fkey";

-- DropForeignKey
ALTER TABLE "_HomePage_featuredProducts" DROP CONSTRAINT "_HomePage_featuredProducts_B_fkey";

-- AlterTable
ALTER TABLE "HomeContent" DROP COLUMN "content",
ADD COLUMN     "content" JSONB DEFAULT '{}';

-- DropTable
DROP TABLE "HomePage";

-- DropTable
DROP TABLE "_HomePage_featuredProducts";

-- CreateTable
CREATE TABLE "Footer" (
    "id" UUID NOT NULL,
    "formConfig" JSONB DEFAULT '{}',
    "contactInfo" JSONB DEFAULT '{}',
    "officialNotice" JSONB DEFAULT '{}',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Footer_pkey" PRIMARY KEY ("id")
);
