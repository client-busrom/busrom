import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('en', 'zh', 'es', 'fr', 'de', 'ja', 'ko', 'pt', 'it', 'nl', 'pl', 'ru', 'ar', 'th', 'vi', 'id', 'ms', 'tr', 'hi', 'bn', 'sv', 'da', 'no', 'fi');
  CREATE TYPE "public"."enum_users_status" AS ENUM('active', 'inactive', 'suspended');
  CREATE TYPE "public"."enum_media_status" AS ENUM('active', 'archived');
  CREATE TYPE "public"."enum_media_tags_type" AS ENUM('general', 'product_series', 'product_model', 'scene', 'color', 'material', 'style');
  CREATE TYPE "public"."enum_permissions_resource" AS ENUM('USER', 'ROLE', 'PERMISSION', 'ACTIVITY_LOG', 'PRODUCT', 'PRODUCT_SERIES', 'PAGE', 'BLOG', 'APPLICATION', 'CATEGORY', 'FAQ_ITEM', 'REUSABLE_BLOCK', 'DOCUMENT_TEMPLATE', 'NAVIGATION_MENU', 'HERO_BANNER_ITEM', 'MEDIA', 'MEDIA_CATEGORY', 'MEDIA_TAG', 'FORM_CONFIG', 'FORM_SUBMISSION', 'HOME_CONTENT', 'FOOTER', 'HOMEPAGE_GLOBAL', 'SITE_CONFIG', 'SEO_SETTING', 'CUSTOM_SCRIPT', 'EMAIL_CONFIG', 'CONTACT_CONFIG', 'SOCIAL_CONFIG', 'TRANSLATION_CONFIG');
  CREATE TYPE "public"."enum_permissions_action" AS ENUM('CREATE', 'READ', 'UPDATE', 'DELETE', 'PUBLISH', 'EXPORT', 'IMPORT', 'MANAGE');
  CREATE TYPE "public"."enum_permissions_category" AS ENUM('USER', 'CONTENT', 'MEDIA', 'FORMS', 'HOMEPAGE', 'SYSTEM');
  CREATE TYPE "public"."enum_activity_logs_action" AS ENUM('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'PUBLISH', 'UNPUBLISH', 'EXPORT', 'IMPORT', 'RESTORE', 'DUPLICATE', 'BULK_UPDATE', 'BULK_DELETE');
  CREATE TYPE "public"."enum_activity_logs_entity" AS ENUM('USER', 'ROLE', 'PERMISSION', 'MEDIA', 'PRODUCT', 'PRODUCT_SERIES', 'PAGE', 'BLOG', 'APPLICATION', 'CATEGORY', 'FAQ_ITEM', 'REUSABLE_BLOCK', 'NAVIGATION_MENU', 'HERO_BANNER_ITEM', 'SITE_CONFIG', 'SEO_SETTING', 'CUSTOM_SCRIPT', 'FORM_CONFIG', 'FORM_SUBMISSION', 'FOOTER', 'HOME_CONTENT', 'EMAIL_CONFIG', 'SYSTEM');
  CREATE TYPE "public"."enum_products_status" AS ENUM('published', 'draft', 'archived');
  CREATE TYPE "public"."enum_product_series_status" AS ENUM('published', 'draft', 'archived');
  CREATE TYPE "public"."enum_hero_banner_items_status" AS ENUM('published', 'draft');
  CREATE TYPE "public"."enum_navigation_menus_type" AS ENUM('standard', 'product_cards', 'submenu');
  CREATE TYPE "public"."enum_pages_page_type" AS ENUM('TEMPLATE', 'FREEFORM');
  CREATE TYPE "public"."enum_pages_status" AS ENUM('published', 'draft', 'archived');
  CREATE TYPE "public"."enum_blogs_status" AS ENUM('published', 'draft', 'archived');
  CREATE TYPE "public"."enum_applications_status" AS ENUM('published', 'draft', 'archived');
  CREATE TYPE "public"."enum_categories_type" AS ENUM('PAGE', 'PRODUCT', 'BLOG', 'APPLICATION', 'FAQ');
  CREATE TYPE "public"."enum_categories_status" AS ENUM('published', 'draft', 'archived');
  CREATE TYPE "public"."enum_faq_items_status" AS ENUM('published', 'draft', 'archived');
  CREATE TYPE "public"."enum_reusable_blocks_block_type" AS ENUM('CTA', 'FEATURE', 'TESTIMONIAL', 'CONTACT', 'CUSTOM');
  CREATE TYPE "public"."enum_reusable_blocks_cta_style" AS ENUM('primary', 'secondary', 'outline');
  CREATE TYPE "public"."enum_reusable_blocks_status" AS ENUM('published', 'draft', 'archived');
  CREATE TYPE "public"."enum_document_templates_category" AS ENUM('product-intro', 'feature', 'faq', 'testimonial', 'cta', 'comparison', 'other');
  CREATE TYPE "public"."enum_document_templates_status" AS ENUM('active', 'draft', 'archived');
  CREATE TYPE "public"."enum_custom_scripts_script_position" AS ENUM('header', 'footer', 'body_start');
  CREATE TYPE "public"."enum_custom_scripts_scope" AS ENUM('global', 'page_type', 'exact_path', 'path_pattern');
  CREATE TYPE "public"."enum_custom_scripts_page_type" AS ENUM('home', 'product_series_list', 'product_series_detail', 'shop_list', 'shop_detail', 'blog_list', 'blog_detail', 'application_list', 'application_detail');
  CREATE TYPE "public"."enum_seo_settings_scope" AS ENUM('global', 'page_type', 'exact_path', 'path_pattern');
  CREATE TYPE "public"."enum_seo_settings_page_type" AS ENUM('home', 'product_series_list', 'product_series_detail', 'shop_list', 'shop_detail', 'blog_list', 'blog_detail', 'application_list', 'application_detail');
  CREATE TYPE "public"."enum_seo_settings_og_type" AS ENUM('website', 'article', 'product');
  CREATE TYPE "public"."enum_seo_settings_sitemap_changefreq" AS ENUM('always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never');
  CREATE TYPE "public"."enum_form_configs_fields_field_type" AS ENUM('text', 'email', 'phone', 'textarea', 'select', 'checkbox', 'radio', 'number', 'date', 'file');
  CREATE TYPE "public"."enum_form_configs_fields_width" AS ENUM('full', 'half', 'third');
  CREATE TYPE "public"."enum_form_configs_location" AS ENUM('HOME_MAIN', 'FOOTER', 'CONTACT_US', 'QUICK_INQUIRY', 'CUSTOM');
  CREATE TYPE "public"."enum_form_configs_status" AS ENUM('published', 'draft');
  CREATE TYPE "public"."enum_form_submissions_status" AS ENUM('UNREAD', 'READ', 'ARCHIVED');
  CREATE TYPE "public"."enum_form_submissions_submission_type" AS ENUM('MANUAL', 'AUTO');
  CREATE TYPE "public"."enum_footer_social_links_platform" AS ENUM('facebook', 'twitter', 'instagram', 'linkedin', 'youtube', 'tiktok', 'wechat', 'whatsapp');
  CREATE TYPE "public"."enum_home_content_sections_section_type" AS ENUM('hero_banner', 'product_series_carousel', 'service_features', 'sphere_3d', 'simple_cta', 'series_intro', 'featured_products', 'brand_advantages', 'oem_odm', 'quote_steps', 'main_form', 'why_choose_busrom', 'case_studies', 'brand_analysis', 'brand_value');
  CREATE TYPE "public"."enum_brand_advantages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_brand_analysis_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_brand_value_value_items_key" AS ENUM('param1', 'param2', 'slogan', 'value', 'vision');
  CREATE TYPE "public"."enum_brand_value_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_service_features_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_quote_steps_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_why_choose_busrom_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_oem_odm_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_simple_cta_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_series_intro_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_sphere_3d_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_main_form_fields_field_type" AS ENUM('text', 'email', 'phone', 'textarea', 'select', 'checkbox');
  CREATE TYPE "public"."enum_main_form_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_featured_products_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_product_series_carousel_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_case_studies_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_case_studies_display_mode" AS ENUM('manual', 'auto');
  CREATE TYPE "public"."enum_translation_config_service" AS ENUM('google', 'deepl', 'azure');
  CREATE TYPE "public"."enum_translation_config_default_source_lang" AS ENUM('en', 'zh', 'auto');
  CREATE TYPE "public"."enum_translation_config_last_test_result" AS ENUM('success', 'failed', 'not_tested');
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"is_admin" boolean DEFAULT false,
  	"status" "enum_users_status" DEFAULT 'active',
  	"last_login" timestamp(3) with time zone,
  	"two_factor_enabled" boolean DEFAULT false,
  	"two_factor_secret" varchar,
  	"backup_codes" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "users_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"roles_id" integer,
  	"permissions_id" integer
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"primary_category_id" integer,
  	"metadata_group" numeric,
  	"metadata_scene_number" numeric,
  	"metadata_image_number" numeric,
  	"metadata_specs" jsonb,
  	"metadata_notes" varchar,
  	"focal_point_data_x" numeric DEFAULT 50,
  	"focal_point_data_y" numeric DEFAULT 50,
  	"status" "enum_media_status" DEFAULT 'active',
  	"usage_count" numeric DEFAULT 0,
  	"prefix" varchar DEFAULT 'media',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar NOT NULL,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_tablet_url" varchar,
  	"sizes_tablet_width" numeric,
  	"sizes_tablet_height" numeric,
  	"sizes_tablet_mime_type" varchar,
  	"sizes_tablet_filesize" numeric,
  	"sizes_tablet_filename" varchar,
  	"sizes_desktop_url" varchar,
  	"sizes_desktop_width" numeric,
  	"sizes_desktop_height" numeric,
  	"sizes_desktop_mime_type" varchar,
  	"sizes_desktop_filesize" numeric,
  	"sizes_desktop_filename" varchar
  );
  
  CREATE TABLE "media_locales" (
  	"alt" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "media_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_tags_id" integer
  );
  
  CREATE TABLE "media_categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"icon" varchar,
  	"color" varchar,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "media_categories_locales" (
  	"display_name" varchar NOT NULL,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "media_tags" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"type" "enum_media_tags_type" DEFAULT 'general' NOT NULL,
  	"category_id" integer,
  	"color" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "media_tags_locales" (
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "roles" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"code" varchar NOT NULL,
  	"parent_role_id" integer,
  	"priority" numeric DEFAULT 5,
  	"is_system" boolean DEFAULT false,
  	"is_active" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "roles_locales" (
  	"name" varchar NOT NULL,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "roles_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"permissions_id" integer
  );
  
  CREATE TABLE "permissions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"resource" "enum_permissions_resource" NOT NULL,
  	"action" "enum_permissions_action" NOT NULL,
  	"identifier" varchar,
  	"category" "enum_permissions_category",
  	"description" varchar,
  	"is_system" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "activity_logs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer,
  	"user_name" varchar,
  	"user_email" varchar,
  	"action" "enum_activity_logs_action" NOT NULL,
  	"entity" "enum_activity_logs_entity" NOT NULL,
  	"entity_id" varchar,
  	"entity_title" varchar,
  	"summary" varchar,
  	"changes" jsonb,
  	"metadata" jsonb,
  	"ip_address" varchar,
  	"user_agent" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "products_attributes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "products_attributes_locales" (
  	"key" varchar NOT NULL,
  	"value" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "products_specifications_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer
  );
  
  CREATE TABLE "products_specifications_options_locales" (
  	"value" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "products_specifications" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "products_specifications_locales" (
  	"name" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "products_main_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL
  );
  
  CREATE TABLE "products_main_images_locales" (
  	"alt" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "products_scene_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL
  );
  
  CREATE TABLE "products_scene_images_locales" (
  	"caption" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "products" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"sku" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"series_id" integer,
  	"show_image_id" integer,
  	"status" "enum_products_status" DEFAULT 'draft',
  	"is_featured" boolean DEFAULT false,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "products_locales" (
  	"name" varchar NOT NULL,
  	"short_description" varchar,
  	"description" jsonb,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "product_series_gallery_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL
  );
  
  CREATE TABLE "product_series_gallery_images_locales" (
  	"caption" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "product_series" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"featured_image_id" integer,
  	"status" "enum_product_series_status" DEFAULT 'draft',
  	"order" numeric DEFAULT 0,
  	"is_featured" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "product_series_locales" (
  	"name" varchar NOT NULL,
  	"description" varchar,
  	"content" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "hero_banner_items_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "hero_banner_items_features_locales" (
  	"text" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "hero_banner_items_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL
  );
  
  CREATE TABLE "hero_banner_items_images_locales" (
  	"alt" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "hero_banner_items" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"internal_label" varchar NOT NULL,
  	"cta_button_link" varchar,
  	"order" numeric DEFAULT 0,
  	"status" "enum_hero_banner_items_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "hero_banner_items_locales" (
  	"title" varchar NOT NULL,
  	"cta_button_text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "navigation_menus" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"type" "enum_navigation_menus_type" DEFAULT 'standard' NOT NULL,
  	"icon" varchar,
  	"parent_id" integer,
  	"link" varchar,
  	"inquiry_link" varchar,
  	"order" numeric DEFAULT 1,
  	"is_system" boolean DEFAULT false,
  	"visible" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "navigation_menus_locales" (
  	"name" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "navigation_menus_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_tags_id" integer
  );
  
  CREATE TABLE "pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"path" varchar NOT NULL,
  	"page_type" "enum_pages_page_type" DEFAULT 'FREEFORM' NOT NULL,
  	"template" varchar,
  	"is_system" boolean DEFAULT false,
  	"status" "enum_pages_status" DEFAULT 'draft',
  	"published_at" timestamp(3) with time zone,
  	"order" numeric DEFAULT 0,
  	"author_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "pages_locales" (
  	"title" varchar NOT NULL,
  	"content" jsonb,
  	"hero_text" varchar,
  	"hero_subtitle" varchar,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "pages_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_tags_id" integer
  );
  
  CREATE TABLE "blogs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"author" varchar DEFAULT 'Busrom Team',
  	"cover_image_id" integer,
  	"status" "enum_blogs_status" DEFAULT 'draft',
  	"published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "blogs_locales" (
  	"title" varchar NOT NULL,
  	"excerpt" varchar,
  	"content" jsonb,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "blogs_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"categories_id" integer
  );
  
  CREATE TABLE "applications_scene_gallery_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL
  );
  
  CREATE TABLE "applications_scene_gallery_images_locales" (
  	"caption" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "applications_scene_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "applications_scene_gallery_locales" (
  	"scene_name" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "applications" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"category_id" integer,
  	"status" "enum_applications_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "applications_locales" (
  	"name" varchar NOT NULL,
  	"short_description" varchar,
  	"description" jsonb,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"type" "enum_categories_type" NOT NULL,
  	"parent_id" integer,
  	"order" numeric DEFAULT 0,
  	"status" "enum_categories_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "categories_locales" (
  	"name" varchar NOT NULL,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "faq_items" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"category_id" integer,
  	"order" numeric DEFAULT 0,
  	"status" "enum_faq_items_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "faq_items_locales" (
  	"question" varchar NOT NULL,
  	"answer" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "faq_items_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"faq_items_id" integer
  );
  
  CREATE TABLE "reusable_blocks" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"block_type" "enum_reusable_blocks_block_type" NOT NULL,
  	"image_id" integer,
  	"cta_link" varchar,
  	"cta_style" "enum_reusable_blocks_cta_style" DEFAULT 'primary',
  	"status" "enum_reusable_blocks_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "reusable_blocks_locales" (
  	"title" varchar,
  	"subtitle" varchar,
  	"content" jsonb,
  	"cta_text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "document_templates" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"category" "enum_document_templates_category" DEFAULT 'other',
  	"preview_image_id" integer,
  	"tags" varchar,
  	"usage_count" numeric DEFAULT 0,
  	"status" "enum_document_templates_status" DEFAULT 'active',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "document_templates_locales" (
  	"name" varchar NOT NULL,
  	"description" varchar,
  	"content" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "custom_scripts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"description" varchar,
  	"script_position" "enum_custom_scripts_script_position" DEFAULT 'header' NOT NULL,
  	"content" varchar NOT NULL,
  	"scope" "enum_custom_scripts_scope" DEFAULT 'global' NOT NULL,
  	"page_type" "enum_custom_scripts_page_type",
  	"exact_path" varchar,
  	"path_pattern" varchar,
  	"is_enabled" boolean DEFAULT true,
  	"priority" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "seo_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"identifier" varchar NOT NULL,
  	"scope" "enum_seo_settings_scope" DEFAULT 'global' NOT NULL,
  	"page_type" "enum_seo_settings_page_type",
  	"exact_path" varchar,
  	"path_pattern" varchar,
  	"og_image_id" integer,
  	"og_type" "enum_seo_settings_og_type" DEFAULT 'website',
  	"robots_index" boolean DEFAULT true,
  	"robots_follow" boolean DEFAULT true,
  	"canonical_url" varchar,
  	"include_in_sitemap" boolean DEFAULT true,
  	"sitemap_priority" numeric DEFAULT 0.5,
  	"sitemap_changefreq" "enum_seo_settings_sitemap_changefreq" DEFAULT 'weekly',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "seo_settings_locales" (
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_keywords" varchar,
  	"og_title" varchar,
  	"og_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "form_configs_fields_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar
  );
  
  CREATE TABLE "form_configs_fields_options_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "form_configs_fields" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"field_name" varchar NOT NULL,
  	"field_type" "enum_form_configs_fields_field_type" DEFAULT 'text' NOT NULL,
  	"required" boolean DEFAULT false,
  	"width" "enum_form_configs_fields_width" DEFAULT 'full',
  	"order" numeric DEFAULT 0
  );
  
  CREATE TABLE "form_configs_fields_locales" (
  	"label" varchar NOT NULL,
  	"placeholder" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "form_configs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"location" "enum_form_configs_location" DEFAULT 'CUSTOM' NOT NULL,
  	"status" "enum_form_configs_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "form_configs_locales" (
  	"display_name" varchar,
  	"description" varchar,
  	"submit_button_text" varchar DEFAULT 'Submit',
  	"success_message" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "form_submissions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"form_config_id" integer,
  	"form_name" varchar,
  	"data" jsonb,
  	"attachments" jsonb DEFAULT '[]'::jsonb,
  	"total_attachment_size" numeric DEFAULT 0,
  	"status" "enum_form_submissions_status" DEFAULT 'UNREAD' NOT NULL,
  	"submission_type" "enum_form_submissions_submission_type" DEFAULT 'MANUAL',
  	"locale" varchar,
  	"source_page" varchar,
  	"ip_address" varchar,
  	"user_agent" varchar,
  	"admin_notes" varchar,
  	"email_sent" boolean DEFAULT false,
  	"submitted_at" timestamp(3) with time zone,
  	"read_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"media_id" integer,
  	"media_categories_id" integer,
  	"media_tags_id" integer,
  	"roles_id" integer,
  	"permissions_id" integer,
  	"activity_logs_id" integer,
  	"products_id" integer,
  	"product_series_id" integer,
  	"hero_banner_items_id" integer,
  	"navigation_menus_id" integer,
  	"pages_id" integer,
  	"blogs_id" integer,
  	"applications_id" integer,
  	"categories_id" integer,
  	"faq_items_id" integer,
  	"reusable_blocks_id" integer,
  	"document_templates_id" integer,
  	"custom_scripts_id" integer,
  	"seo_settings_id" integer,
  	"form_configs_id" integer,
  	"form_submissions_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "footer_social_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"platform" "enum_footer_social_links_platform",
  	"url" varchar NOT NULL,
  	"icon_id" integer
  );
  
  CREATE TABLE "footer_legal_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "footer_legal_links_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "footer" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"email" varchar,
  	"phone" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "footer_locales" (
  	"form_title" varchar,
  	"form_placeholders_name" varchar,
  	"form_placeholders_email" varchar,
  	"form_placeholders_message" varchar,
  	"submit_button_text" varchar,
  	"contact_title" varchar,
  	"address" varchar,
  	"working_hours" varchar,
  	"official_notice_title" varchar,
  	"official_notice_content" jsonb,
  	"copyright_text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "site_config" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"logo_id" integer,
  	"favicon_id" integer,
  	"contact_email" varchar,
  	"contact_phone" varchar,
  	"google_maps_url" varchar,
  	"default_og_image_id" integer,
  	"google_analytics_id" varchar,
  	"google_tag_manager_id" varchar,
  	"facebook" varchar,
  	"twitter" varchar,
  	"instagram" varchar,
  	"linkedin" varchar,
  	"youtube" varchar,
  	"tiktok" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "site_config_locales" (
  	"site_name" varchar NOT NULL,
  	"site_tagline" varchar,
  	"contact_address" varchar,
  	"default_meta_title" varchar,
  	"default_meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "home_content_sections" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"section_type" "enum_home_content_sections_section_type" NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"order" numeric DEFAULT 1
  );
  
  CREATE TABLE "home_content" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "brand_advantages_advantages" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" varchar DEFAULT 'Sparkles'
  );
  
  CREATE TABLE "brand_advantages_advantages_locales" (
  	"text" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "brand_advantages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"status" "enum_brand_advantages_status" DEFAULT 'draft',
  	"image_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "brand_analysis" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"status" "enum_brand_analysis_status" DEFAULT 'draft',
  	"brand_center_large_image_id" integer,
  	"brand_center_small_image_id" integer,
  	"project_center_large_image_id" integer,
  	"project_center_small_image_id" integer,
  	"service_center_large_image_id" integer,
  	"service_center_small_image_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "brand_analysis_locales" (
  	"brand_name_analysis_title_part1" varchar,
  	"brand_name_analysis_title_part2" varchar,
  	"brand_name_analysis_text_part1" varchar,
  	"brand_name_analysis_text_part2" varchar,
  	"brand_center_title" varchar,
  	"brand_center_description" varchar,
  	"project_center_title" varchar,
  	"project_center_description" varchar,
  	"service_center_title" varchar,
  	"service_center_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "brand_value_value_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"key" "enum_brand_value_value_items_key" NOT NULL,
  	"image_id" integer
  );
  
  CREATE TABLE "brand_value_value_items_locales" (
  	"title" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "brand_value" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"status" "enum_brand_value_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "brand_value_locales" (
  	"title" varchar,
  	"subtitle" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "service_features_features_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL
  );
  
  CREATE TABLE "service_features_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "service_features_features_locales" (
  	"title" varchar NOT NULL,
  	"short_title" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "service_features" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"status" "enum_service_features_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "service_features_locales" (
  	"title" varchar,
  	"subtitle" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "quote_steps_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer
  );
  
  CREATE TABLE "quote_steps_steps_locales" (
  	"text" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "quote_steps" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"status" "enum_quote_steps_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "quote_steps_locales" (
  	"header_title" varchar,
  	"header_title2" varchar,
  	"header_subtitle" varchar,
  	"header_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "why_choose_busrom_reasons" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" varchar,
  	"image_id" integer
  );
  
  CREATE TABLE "why_choose_busrom_reasons_locales" (
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "why_choose_busrom" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"status" "enum_why_choose_busrom_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "why_choose_busrom_locales" (
  	"title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "oem_odm_services" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" varchar
  );
  
  CREATE TABLE "oem_odm_services_locales" (
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "oem_odm" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"status" "enum_oem_odm_status" DEFAULT 'draft',
  	"image_id" integer,
  	"cta_link" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "oem_odm_locales" (
  	"title" varchar,
  	"subtitle" varchar,
  	"description" jsonb,
  	"cta_text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "simple_cta_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL
  );
  
  CREATE TABLE "simple_cta" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"status" "enum_simple_cta_status" DEFAULT 'draft',
  	"cta_link" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "simple_cta_locales" (
  	"title" varchar,
  	"subtitle" varchar,
  	"cta_text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "series_intro_series" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"link" varchar,
  	"product_series_id" integer
  );
  
  CREATE TABLE "series_intro_series_locales" (
  	"name" varchar NOT NULL,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "series_intro" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"status" "enum_series_intro_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "series_intro_locales" (
  	"title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "sphere_3d" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"status" "enum_sphere_3d_status" DEFAULT 'draft',
  	"enabled" boolean DEFAULT false,
  	"model_url" varchar,
  	"background_color" varchar DEFAULT '#000000',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "sphere_3d_locales" (
  	"title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "main_form_fields_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar
  );
  
  CREATE TABLE "main_form_fields_options_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "main_form_fields" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"field_type" "enum_main_form_fields_field_type" NOT NULL,
  	"name" varchar NOT NULL,
  	"required" boolean DEFAULT false
  );
  
  CREATE TABLE "main_form_fields_locales" (
  	"label" varchar NOT NULL,
  	"placeholder" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "main_form" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"status" "enum_main_form_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "main_form_locales" (
  	"title" varchar,
  	"subtitle" varchar,
  	"description" varchar,
  	"submit_text" varchar DEFAULT 'Submit',
  	"success_message" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "featured_products_featured_series" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"series_id" integer NOT NULL
  );
  
  CREATE TABLE "featured_products_featured_series_locales" (
  	"custom_title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "featured_products" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"status" "enum_featured_products_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "featured_products_locales" (
  	"title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "featured_products_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"products_id" integer
  );
  
  CREATE TABLE "product_series_carousel_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"series_id" integer NOT NULL,
  	"custom_image_id" integer
  );
  
  CREATE TABLE "product_series_carousel_items_locales" (
  	"custom_title" varchar,
  	"custom_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "product_series_carousel" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"status" "enum_product_series_carousel_status" DEFAULT 'draft',
  	"autoplay" boolean DEFAULT true,
  	"autoplay_speed" numeric DEFAULT 5000,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "product_series_carousel_locales" (
  	"title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "case_studies_cases" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"link" varchar
  );
  
  CREATE TABLE "case_studies_cases_locales" (
  	"title" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "case_studies" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"status" "enum_case_studies_status" DEFAULT 'draft',
  	"display_mode" "enum_case_studies_display_mode" DEFAULT 'manual',
  	"auto_count" numeric DEFAULT 8,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "case_studies_locales" (
  	"title" varchar,
  	"subtitle" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "email_config" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"smtp_host" varchar,
  	"smtp_port" varchar,
  	"smtp_user" varchar,
  	"smtp_password" varchar,
  	"email_from_address" varchar DEFAULT 'noreply@busrom.com',
  	"form_notification_emails" varchar,
  	"enable_auto_reply" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "email_config_locales" (
  	"email_from_name" varchar DEFAULT 'Busrom Team',
  	"auto_reply_subject" varchar DEFAULT 'Thank you for contacting Busrom',
  	"auto_reply_template" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "contact_config" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"email" varchar,
  	"phone" varchar,
  	"whatsapp" varchar,
  	"wechat" varchar,
  	"address" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "social_config" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"facebook_url" varchar,
  	"instagram_url" varchar,
  	"linkedin_url" varchar,
  	"youtube_url" varchar,
  	"twitter_url" varchar,
  	"tiktok_url" varchar,
  	"pinterest_url" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "translation_config" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"service" "enum_translation_config_service" DEFAULT 'google' NOT NULL,
  	"api_key" varchar,
  	"api_endpoint" varchar,
  	"default_source_lang" "enum_translation_config_default_source_lang" DEFAULT 'en',
  	"max_requests_per_minute" numeric DEFAULT 60,
  	"delay_between_requests" numeric DEFAULT 100,
  	"is_enabled" boolean DEFAULT false,
  	"last_tested_at" timestamp(3) with time zone,
  	"last_test_result" "enum_translation_config_last_test_result" DEFAULT 'not_tested',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_rels" ADD CONSTRAINT "users_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_rels" ADD CONSTRAINT "users_rels_roles_fk" FOREIGN KEY ("roles_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_rels" ADD CONSTRAINT "users_rels_permissions_fk" FOREIGN KEY ("permissions_id") REFERENCES "public"."permissions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media" ADD CONSTRAINT "media_primary_category_id_media_categories_id_fk" FOREIGN KEY ("primary_category_id") REFERENCES "public"."media_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "media_locales" ADD CONSTRAINT "media_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_rels" ADD CONSTRAINT "media_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_rels" ADD CONSTRAINT "media_rels_media_tags_fk" FOREIGN KEY ("media_tags_id") REFERENCES "public"."media_tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_categories_locales" ADD CONSTRAINT "media_categories_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."media_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_tags" ADD CONSTRAINT "media_tags_category_id_media_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."media_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "media_tags_locales" ADD CONSTRAINT "media_tags_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."media_tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "roles" ADD CONSTRAINT "roles_parent_role_id_roles_id_fk" FOREIGN KEY ("parent_role_id") REFERENCES "public"."roles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "roles_locales" ADD CONSTRAINT "roles_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "roles_rels" ADD CONSTRAINT "roles_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "roles_rels" ADD CONSTRAINT "roles_rels_permissions_fk" FOREIGN KEY ("permissions_id") REFERENCES "public"."permissions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_attributes" ADD CONSTRAINT "products_attributes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_attributes_locales" ADD CONSTRAINT "products_attributes_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products_attributes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_specifications_options" ADD CONSTRAINT "products_specifications_options_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_specifications_options" ADD CONSTRAINT "products_specifications_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products_specifications"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_specifications_options_locales" ADD CONSTRAINT "products_specifications_options_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products_specifications_options"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_specifications" ADD CONSTRAINT "products_specifications_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_specifications_locales" ADD CONSTRAINT "products_specifications_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products_specifications"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_main_images" ADD CONSTRAINT "products_main_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_main_images" ADD CONSTRAINT "products_main_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_main_images_locales" ADD CONSTRAINT "products_main_images_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products_main_images"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_scene_images" ADD CONSTRAINT "products_scene_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_scene_images" ADD CONSTRAINT "products_scene_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_scene_images_locales" ADD CONSTRAINT "products_scene_images_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products_scene_images"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_series_id_product_series_id_fk" FOREIGN KEY ("series_id") REFERENCES "public"."product_series"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_show_image_id_media_id_fk" FOREIGN KEY ("show_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_locales" ADD CONSTRAINT "products_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "product_series_gallery_images" ADD CONSTRAINT "product_series_gallery_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "product_series_gallery_images" ADD CONSTRAINT "product_series_gallery_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."product_series"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "product_series_gallery_images_locales" ADD CONSTRAINT "product_series_gallery_images_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."product_series_gallery_images"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "product_series" ADD CONSTRAINT "product_series_featured_image_id_media_id_fk" FOREIGN KEY ("featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "product_series_locales" ADD CONSTRAINT "product_series_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."product_series"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hero_banner_items_features" ADD CONSTRAINT "hero_banner_items_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."hero_banner_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hero_banner_items_features_locales" ADD CONSTRAINT "hero_banner_items_features_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."hero_banner_items_features"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hero_banner_items_images" ADD CONSTRAINT "hero_banner_items_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "hero_banner_items_images" ADD CONSTRAINT "hero_banner_items_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."hero_banner_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hero_banner_items_images_locales" ADD CONSTRAINT "hero_banner_items_images_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."hero_banner_items_images"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hero_banner_items_locales" ADD CONSTRAINT "hero_banner_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."hero_banner_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_menus" ADD CONSTRAINT "navigation_menus_parent_id_navigation_menus_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."navigation_menus"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_menus_locales" ADD CONSTRAINT "navigation_menus_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation_menus"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_menus_rels" ADD CONSTRAINT "navigation_menus_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."navigation_menus"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_menus_rels" ADD CONSTRAINT "navigation_menus_rels_media_tags_fk" FOREIGN KEY ("media_tags_id") REFERENCES "public"."media_tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_locales" ADD CONSTRAINT "pages_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_media_tags_fk" FOREIGN KEY ("media_tags_id") REFERENCES "public"."media_tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "blogs" ADD CONSTRAINT "blogs_cover_image_id_media_id_fk" FOREIGN KEY ("cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "blogs_locales" ADD CONSTRAINT "blogs_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."blogs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "blogs_rels" ADD CONSTRAINT "blogs_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."blogs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "blogs_rels" ADD CONSTRAINT "blogs_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "applications_scene_gallery_images" ADD CONSTRAINT "applications_scene_gallery_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "applications_scene_gallery_images" ADD CONSTRAINT "applications_scene_gallery_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."applications_scene_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "applications_scene_gallery_images_locales" ADD CONSTRAINT "applications_scene_gallery_images_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."applications_scene_gallery_images"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "applications_scene_gallery" ADD CONSTRAINT "applications_scene_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "applications_scene_gallery_locales" ADD CONSTRAINT "applications_scene_gallery_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."applications_scene_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "applications" ADD CONSTRAINT "applications_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "applications_locales" ADD CONSTRAINT "applications_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "categories_locales" ADD CONSTRAINT "categories_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "faq_items" ADD CONSTRAINT "faq_items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "faq_items_locales" ADD CONSTRAINT "faq_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."faq_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "faq_items_rels" ADD CONSTRAINT "faq_items_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."faq_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "faq_items_rels" ADD CONSTRAINT "faq_items_rels_faq_items_fk" FOREIGN KEY ("faq_items_id") REFERENCES "public"."faq_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "reusable_blocks" ADD CONSTRAINT "reusable_blocks_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "reusable_blocks_locales" ADD CONSTRAINT "reusable_blocks_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."reusable_blocks"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "document_templates" ADD CONSTRAINT "document_templates_preview_image_id_media_id_fk" FOREIGN KEY ("preview_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "document_templates_locales" ADD CONSTRAINT "document_templates_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."document_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "seo_settings" ADD CONSTRAINT "seo_settings_og_image_id_media_id_fk" FOREIGN KEY ("og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "seo_settings_locales" ADD CONSTRAINT "seo_settings_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."seo_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "form_configs_fields_options" ADD CONSTRAINT "form_configs_fields_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."form_configs_fields"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "form_configs_fields_options_locales" ADD CONSTRAINT "form_configs_fields_options_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."form_configs_fields_options"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "form_configs_fields" ADD CONSTRAINT "form_configs_fields_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."form_configs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "form_configs_fields_locales" ADD CONSTRAINT "form_configs_fields_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."form_configs_fields"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "form_configs_locales" ADD CONSTRAINT "form_configs_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."form_configs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "form_submissions" ADD CONSTRAINT "form_submissions_form_config_id_form_configs_id_fk" FOREIGN KEY ("form_config_id") REFERENCES "public"."form_configs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_categories_fk" FOREIGN KEY ("media_categories_id") REFERENCES "public"."media_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_tags_fk" FOREIGN KEY ("media_tags_id") REFERENCES "public"."media_tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_roles_fk" FOREIGN KEY ("roles_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_permissions_fk" FOREIGN KEY ("permissions_id") REFERENCES "public"."permissions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_activity_logs_fk" FOREIGN KEY ("activity_logs_id") REFERENCES "public"."activity_logs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_product_series_fk" FOREIGN KEY ("product_series_id") REFERENCES "public"."product_series"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_hero_banner_items_fk" FOREIGN KEY ("hero_banner_items_id") REFERENCES "public"."hero_banner_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_navigation_menus_fk" FOREIGN KEY ("navigation_menus_id") REFERENCES "public"."navigation_menus"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_blogs_fk" FOREIGN KEY ("blogs_id") REFERENCES "public"."blogs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_applications_fk" FOREIGN KEY ("applications_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_faq_items_fk" FOREIGN KEY ("faq_items_id") REFERENCES "public"."faq_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_reusable_blocks_fk" FOREIGN KEY ("reusable_blocks_id") REFERENCES "public"."reusable_blocks"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_document_templates_fk" FOREIGN KEY ("document_templates_id") REFERENCES "public"."document_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_custom_scripts_fk" FOREIGN KEY ("custom_scripts_id") REFERENCES "public"."custom_scripts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_seo_settings_fk" FOREIGN KEY ("seo_settings_id") REFERENCES "public"."seo_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_form_configs_fk" FOREIGN KEY ("form_configs_id") REFERENCES "public"."form_configs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_form_submissions_fk" FOREIGN KEY ("form_submissions_id") REFERENCES "public"."form_submissions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_social_links" ADD CONSTRAINT "footer_social_links_icon_id_media_id_fk" FOREIGN KEY ("icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "footer_social_links" ADD CONSTRAINT "footer_social_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_legal_links" ADD CONSTRAINT "footer_legal_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_legal_links_locales" ADD CONSTRAINT "footer_legal_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer_legal_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_locales" ADD CONSTRAINT "footer_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_config" ADD CONSTRAINT "site_config_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_config" ADD CONSTRAINT "site_config_favicon_id_media_id_fk" FOREIGN KEY ("favicon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_config" ADD CONSTRAINT "site_config_default_og_image_id_media_id_fk" FOREIGN KEY ("default_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_config_locales" ADD CONSTRAINT "site_config_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_config"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_content_sections" ADD CONSTRAINT "home_content_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "brand_advantages_advantages" ADD CONSTRAINT "brand_advantages_advantages_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."brand_advantages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "brand_advantages_advantages_locales" ADD CONSTRAINT "brand_advantages_advantages_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."brand_advantages_advantages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "brand_advantages" ADD CONSTRAINT "brand_advantages_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "brand_analysis" ADD CONSTRAINT "brand_analysis_brand_center_large_image_id_media_id_fk" FOREIGN KEY ("brand_center_large_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "brand_analysis" ADD CONSTRAINT "brand_analysis_brand_center_small_image_id_media_id_fk" FOREIGN KEY ("brand_center_small_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "brand_analysis" ADD CONSTRAINT "brand_analysis_project_center_large_image_id_media_id_fk" FOREIGN KEY ("project_center_large_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "brand_analysis" ADD CONSTRAINT "brand_analysis_project_center_small_image_id_media_id_fk" FOREIGN KEY ("project_center_small_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "brand_analysis" ADD CONSTRAINT "brand_analysis_service_center_large_image_id_media_id_fk" FOREIGN KEY ("service_center_large_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "brand_analysis" ADD CONSTRAINT "brand_analysis_service_center_small_image_id_media_id_fk" FOREIGN KEY ("service_center_small_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "brand_analysis_locales" ADD CONSTRAINT "brand_analysis_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."brand_analysis"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "brand_value_value_items" ADD CONSTRAINT "brand_value_value_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "brand_value_value_items" ADD CONSTRAINT "brand_value_value_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."brand_value"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "brand_value_value_items_locales" ADD CONSTRAINT "brand_value_value_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."brand_value_value_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "brand_value_locales" ADD CONSTRAINT "brand_value_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."brand_value"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "service_features_features_images" ADD CONSTRAINT "service_features_features_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "service_features_features_images" ADD CONSTRAINT "service_features_features_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."service_features_features"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "service_features_features" ADD CONSTRAINT "service_features_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."service_features"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "service_features_features_locales" ADD CONSTRAINT "service_features_features_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."service_features_features"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "service_features_locales" ADD CONSTRAINT "service_features_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."service_features"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "quote_steps_steps" ADD CONSTRAINT "quote_steps_steps_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "quote_steps_steps" ADD CONSTRAINT "quote_steps_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."quote_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "quote_steps_steps_locales" ADD CONSTRAINT "quote_steps_steps_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."quote_steps_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "quote_steps_locales" ADD CONSTRAINT "quote_steps_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."quote_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "why_choose_busrom_reasons" ADD CONSTRAINT "why_choose_busrom_reasons_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "why_choose_busrom_reasons" ADD CONSTRAINT "why_choose_busrom_reasons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."why_choose_busrom"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "why_choose_busrom_reasons_locales" ADD CONSTRAINT "why_choose_busrom_reasons_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."why_choose_busrom_reasons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "why_choose_busrom_locales" ADD CONSTRAINT "why_choose_busrom_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."why_choose_busrom"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "oem_odm_services" ADD CONSTRAINT "oem_odm_services_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."oem_odm"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "oem_odm_services_locales" ADD CONSTRAINT "oem_odm_services_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."oem_odm_services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "oem_odm" ADD CONSTRAINT "oem_odm_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "oem_odm_locales" ADD CONSTRAINT "oem_odm_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."oem_odm"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "simple_cta_images" ADD CONSTRAINT "simple_cta_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "simple_cta_images" ADD CONSTRAINT "simple_cta_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."simple_cta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "simple_cta_locales" ADD CONSTRAINT "simple_cta_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."simple_cta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "series_intro_series" ADD CONSTRAINT "series_intro_series_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "series_intro_series" ADD CONSTRAINT "series_intro_series_product_series_id_product_series_id_fk" FOREIGN KEY ("product_series_id") REFERENCES "public"."product_series"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "series_intro_series" ADD CONSTRAINT "series_intro_series_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."series_intro"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "series_intro_series_locales" ADD CONSTRAINT "series_intro_series_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."series_intro_series"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "series_intro_locales" ADD CONSTRAINT "series_intro_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."series_intro"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sphere_3d_locales" ADD CONSTRAINT "sphere_3d_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sphere_3d"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "main_form_fields_options" ADD CONSTRAINT "main_form_fields_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."main_form_fields"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "main_form_fields_options_locales" ADD CONSTRAINT "main_form_fields_options_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."main_form_fields_options"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "main_form_fields" ADD CONSTRAINT "main_form_fields_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."main_form"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "main_form_fields_locales" ADD CONSTRAINT "main_form_fields_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."main_form_fields"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "main_form_locales" ADD CONSTRAINT "main_form_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."main_form"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "featured_products_featured_series" ADD CONSTRAINT "featured_products_featured_series_series_id_product_series_id_fk" FOREIGN KEY ("series_id") REFERENCES "public"."product_series"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "featured_products_featured_series" ADD CONSTRAINT "featured_products_featured_series_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."featured_products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "featured_products_featured_series_locales" ADD CONSTRAINT "featured_products_featured_series_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."featured_products_featured_series"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "featured_products_locales" ADD CONSTRAINT "featured_products_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."featured_products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "featured_products_rels" ADD CONSTRAINT "featured_products_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."featured_products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "featured_products_rels" ADD CONSTRAINT "featured_products_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "product_series_carousel_items" ADD CONSTRAINT "product_series_carousel_items_series_id_product_series_id_fk" FOREIGN KEY ("series_id") REFERENCES "public"."product_series"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "product_series_carousel_items" ADD CONSTRAINT "product_series_carousel_items_custom_image_id_media_id_fk" FOREIGN KEY ("custom_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "product_series_carousel_items" ADD CONSTRAINT "product_series_carousel_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."product_series_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "product_series_carousel_items_locales" ADD CONSTRAINT "product_series_carousel_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."product_series_carousel_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "product_series_carousel_locales" ADD CONSTRAINT "product_series_carousel_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."product_series_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "case_studies_cases" ADD CONSTRAINT "case_studies_cases_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "case_studies_cases" ADD CONSTRAINT "case_studies_cases_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."case_studies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "case_studies_cases_locales" ADD CONSTRAINT "case_studies_cases_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."case_studies_cases"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "case_studies_locales" ADD CONSTRAINT "case_studies_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."case_studies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "email_config_locales" ADD CONSTRAINT "email_config_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."email_config"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "users_rels_order_idx" ON "users_rels" USING btree ("order");
  CREATE INDEX "users_rels_parent_idx" ON "users_rels" USING btree ("parent_id");
  CREATE INDEX "users_rels_path_idx" ON "users_rels" USING btree ("path");
  CREATE INDEX "users_rels_roles_id_idx" ON "users_rels" USING btree ("roles_id");
  CREATE INDEX "users_rels_permissions_id_idx" ON "users_rels" USING btree ("permissions_id");
  CREATE INDEX "media_primary_category_idx" ON "media" USING btree ("primary_category_id");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_tablet_sizes_tablet_filename_idx" ON "media" USING btree ("sizes_tablet_filename");
  CREATE INDEX "media_sizes_desktop_sizes_desktop_filename_idx" ON "media" USING btree ("sizes_desktop_filename");
  CREATE UNIQUE INDEX "media_locales_locale_parent_id_unique" ON "media_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "media_rels_order_idx" ON "media_rels" USING btree ("order");
  CREATE INDEX "media_rels_parent_idx" ON "media_rels" USING btree ("parent_id");
  CREATE INDEX "media_rels_path_idx" ON "media_rels" USING btree ("path");
  CREATE INDEX "media_rels_media_tags_id_idx" ON "media_rels" USING btree ("media_tags_id");
  CREATE UNIQUE INDEX "media_categories_name_idx" ON "media_categories" USING btree ("name");
  CREATE INDEX "media_categories_updated_at_idx" ON "media_categories" USING btree ("updated_at");
  CREATE INDEX "media_categories_created_at_idx" ON "media_categories" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_categories_locales_locale_parent_id_unique" ON "media_categories_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "media_tags_name_idx" ON "media_tags" USING btree ("name");
  CREATE INDEX "media_tags_category_idx" ON "media_tags" USING btree ("category_id");
  CREATE INDEX "media_tags_updated_at_idx" ON "media_tags" USING btree ("updated_at");
  CREATE INDEX "media_tags_created_at_idx" ON "media_tags" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_tags_locales_locale_parent_id_unique" ON "media_tags_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "roles_code_idx" ON "roles" USING btree ("code");
  CREATE INDEX "roles_parent_role_idx" ON "roles" USING btree ("parent_role_id");
  CREATE INDEX "roles_updated_at_idx" ON "roles" USING btree ("updated_at");
  CREATE INDEX "roles_created_at_idx" ON "roles" USING btree ("created_at");
  CREATE UNIQUE INDEX "roles_locales_locale_parent_id_unique" ON "roles_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "roles_rels_order_idx" ON "roles_rels" USING btree ("order");
  CREATE INDEX "roles_rels_parent_idx" ON "roles_rels" USING btree ("parent_id");
  CREATE INDEX "roles_rels_path_idx" ON "roles_rels" USING btree ("path");
  CREATE INDEX "roles_rels_permissions_id_idx" ON "roles_rels" USING btree ("permissions_id");
  CREATE UNIQUE INDEX "permissions_identifier_idx" ON "permissions" USING btree ("identifier");
  CREATE INDEX "permissions_updated_at_idx" ON "permissions" USING btree ("updated_at");
  CREATE INDEX "permissions_created_at_idx" ON "permissions" USING btree ("created_at");
  CREATE INDEX "activity_logs_user_idx" ON "activity_logs" USING btree ("user_id");
  CREATE INDEX "activity_logs_updated_at_idx" ON "activity_logs" USING btree ("updated_at");
  CREATE INDEX "activity_logs_created_at_idx" ON "activity_logs" USING btree ("created_at");
  CREATE INDEX "products_attributes_order_idx" ON "products_attributes" USING btree ("_order");
  CREATE INDEX "products_attributes_parent_id_idx" ON "products_attributes" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "products_attributes_locales_locale_parent_id_unique" ON "products_attributes_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "products_specifications_options_order_idx" ON "products_specifications_options" USING btree ("_order");
  CREATE INDEX "products_specifications_options_parent_id_idx" ON "products_specifications_options" USING btree ("_parent_id");
  CREATE INDEX "products_specifications_options_image_idx" ON "products_specifications_options" USING btree ("image_id");
  CREATE UNIQUE INDEX "products_specifications_options_locales_locale_parent_id_uni" ON "products_specifications_options_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "products_specifications_order_idx" ON "products_specifications" USING btree ("_order");
  CREATE INDEX "products_specifications_parent_id_idx" ON "products_specifications" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "products_specifications_locales_locale_parent_id_unique" ON "products_specifications_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "products_main_images_order_idx" ON "products_main_images" USING btree ("_order");
  CREATE INDEX "products_main_images_parent_id_idx" ON "products_main_images" USING btree ("_parent_id");
  CREATE INDEX "products_main_images_image_idx" ON "products_main_images" USING btree ("image_id");
  CREATE UNIQUE INDEX "products_main_images_locales_locale_parent_id_unique" ON "products_main_images_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "products_scene_images_order_idx" ON "products_scene_images" USING btree ("_order");
  CREATE INDEX "products_scene_images_parent_id_idx" ON "products_scene_images" USING btree ("_parent_id");
  CREATE INDEX "products_scene_images_image_idx" ON "products_scene_images" USING btree ("image_id");
  CREATE UNIQUE INDEX "products_scene_images_locales_locale_parent_id_unique" ON "products_scene_images_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "products_sku_idx" ON "products" USING btree ("sku");
  CREATE UNIQUE INDEX "products_slug_idx" ON "products" USING btree ("slug");
  CREATE INDEX "products_series_idx" ON "products" USING btree ("series_id");
  CREATE INDEX "products_show_image_idx" ON "products" USING btree ("show_image_id");
  CREATE INDEX "products_updated_at_idx" ON "products" USING btree ("updated_at");
  CREATE INDEX "products_created_at_idx" ON "products" USING btree ("created_at");
  CREATE UNIQUE INDEX "products_locales_locale_parent_id_unique" ON "products_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "product_series_gallery_images_order_idx" ON "product_series_gallery_images" USING btree ("_order");
  CREATE INDEX "product_series_gallery_images_parent_id_idx" ON "product_series_gallery_images" USING btree ("_parent_id");
  CREATE INDEX "product_series_gallery_images_image_idx" ON "product_series_gallery_images" USING btree ("image_id");
  CREATE UNIQUE INDEX "product_series_gallery_images_locales_locale_parent_id_uniqu" ON "product_series_gallery_images_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "product_series_slug_idx" ON "product_series" USING btree ("slug");
  CREATE INDEX "product_series_featured_image_idx" ON "product_series" USING btree ("featured_image_id");
  CREATE INDEX "product_series_updated_at_idx" ON "product_series" USING btree ("updated_at");
  CREATE INDEX "product_series_created_at_idx" ON "product_series" USING btree ("created_at");
  CREATE UNIQUE INDEX "product_series_locales_locale_parent_id_unique" ON "product_series_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "hero_banner_items_features_order_idx" ON "hero_banner_items_features" USING btree ("_order");
  CREATE INDEX "hero_banner_items_features_parent_id_idx" ON "hero_banner_items_features" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "hero_banner_items_features_locales_locale_parent_id_unique" ON "hero_banner_items_features_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "hero_banner_items_images_order_idx" ON "hero_banner_items_images" USING btree ("_order");
  CREATE INDEX "hero_banner_items_images_parent_id_idx" ON "hero_banner_items_images" USING btree ("_parent_id");
  CREATE INDEX "hero_banner_items_images_image_idx" ON "hero_banner_items_images" USING btree ("image_id");
  CREATE UNIQUE INDEX "hero_banner_items_images_locales_locale_parent_id_unique" ON "hero_banner_items_images_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "hero_banner_items_updated_at_idx" ON "hero_banner_items" USING btree ("updated_at");
  CREATE INDEX "hero_banner_items_created_at_idx" ON "hero_banner_items" USING btree ("created_at");
  CREATE UNIQUE INDEX "hero_banner_items_locales_locale_parent_id_unique" ON "hero_banner_items_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "navigation_menus_slug_idx" ON "navigation_menus" USING btree ("slug");
  CREATE INDEX "navigation_menus_parent_idx" ON "navigation_menus" USING btree ("parent_id");
  CREATE INDEX "navigation_menus_updated_at_idx" ON "navigation_menus" USING btree ("updated_at");
  CREATE INDEX "navigation_menus_created_at_idx" ON "navigation_menus" USING btree ("created_at");
  CREATE UNIQUE INDEX "navigation_menus_locales_locale_parent_id_unique" ON "navigation_menus_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "navigation_menus_rels_order_idx" ON "navigation_menus_rels" USING btree ("order");
  CREATE INDEX "navigation_menus_rels_parent_idx" ON "navigation_menus_rels" USING btree ("parent_id");
  CREATE INDEX "navigation_menus_rels_path_idx" ON "navigation_menus_rels" USING btree ("path");
  CREATE INDEX "navigation_menus_rels_media_tags_id_idx" ON "navigation_menus_rels" USING btree ("media_tags_id");
  CREATE UNIQUE INDEX "pages_slug_idx" ON "pages" USING btree ("slug");
  CREATE UNIQUE INDEX "pages_path_idx" ON "pages" USING btree ("path");
  CREATE INDEX "pages_author_idx" ON "pages" USING btree ("author_id");
  CREATE INDEX "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");
  CREATE UNIQUE INDEX "pages_locales_locale_parent_id_unique" ON "pages_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_rels_order_idx" ON "pages_rels" USING btree ("order");
  CREATE INDEX "pages_rels_parent_idx" ON "pages_rels" USING btree ("parent_id");
  CREATE INDEX "pages_rels_path_idx" ON "pages_rels" USING btree ("path");
  CREATE INDEX "pages_rels_media_tags_id_idx" ON "pages_rels" USING btree ("media_tags_id");
  CREATE UNIQUE INDEX "blogs_slug_idx" ON "blogs" USING btree ("slug");
  CREATE INDEX "blogs_cover_image_idx" ON "blogs" USING btree ("cover_image_id");
  CREATE INDEX "blogs_updated_at_idx" ON "blogs" USING btree ("updated_at");
  CREATE INDEX "blogs_created_at_idx" ON "blogs" USING btree ("created_at");
  CREATE UNIQUE INDEX "blogs_locales_locale_parent_id_unique" ON "blogs_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "blogs_rels_order_idx" ON "blogs_rels" USING btree ("order");
  CREATE INDEX "blogs_rels_parent_idx" ON "blogs_rels" USING btree ("parent_id");
  CREATE INDEX "blogs_rels_path_idx" ON "blogs_rels" USING btree ("path");
  CREATE INDEX "blogs_rels_categories_id_idx" ON "blogs_rels" USING btree ("categories_id");
  CREATE INDEX "applications_scene_gallery_images_order_idx" ON "applications_scene_gallery_images" USING btree ("_order");
  CREATE INDEX "applications_scene_gallery_images_parent_id_idx" ON "applications_scene_gallery_images" USING btree ("_parent_id");
  CREATE INDEX "applications_scene_gallery_images_image_idx" ON "applications_scene_gallery_images" USING btree ("image_id");
  CREATE UNIQUE INDEX "applications_scene_gallery_images_locales_locale_parent_id_u" ON "applications_scene_gallery_images_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "applications_scene_gallery_order_idx" ON "applications_scene_gallery" USING btree ("_order");
  CREATE INDEX "applications_scene_gallery_parent_id_idx" ON "applications_scene_gallery" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "applications_scene_gallery_locales_locale_parent_id_unique" ON "applications_scene_gallery_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "applications_slug_idx" ON "applications" USING btree ("slug");
  CREATE INDEX "applications_category_idx" ON "applications" USING btree ("category_id");
  CREATE INDEX "applications_updated_at_idx" ON "applications" USING btree ("updated_at");
  CREATE INDEX "applications_created_at_idx" ON "applications" USING btree ("created_at");
  CREATE UNIQUE INDEX "applications_locales_locale_parent_id_unique" ON "applications_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "categories_slug_idx" ON "categories" USING btree ("slug");
  CREATE INDEX "categories_parent_idx" ON "categories" USING btree ("parent_id");
  CREATE INDEX "categories_updated_at_idx" ON "categories" USING btree ("updated_at");
  CREATE INDEX "categories_created_at_idx" ON "categories" USING btree ("created_at");
  CREATE UNIQUE INDEX "categories_locales_locale_parent_id_unique" ON "categories_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "faq_items_slug_idx" ON "faq_items" USING btree ("slug");
  CREATE INDEX "faq_items_category_idx" ON "faq_items" USING btree ("category_id");
  CREATE INDEX "faq_items_updated_at_idx" ON "faq_items" USING btree ("updated_at");
  CREATE INDEX "faq_items_created_at_idx" ON "faq_items" USING btree ("created_at");
  CREATE UNIQUE INDEX "faq_items_locales_locale_parent_id_unique" ON "faq_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "faq_items_rels_order_idx" ON "faq_items_rels" USING btree ("order");
  CREATE INDEX "faq_items_rels_parent_idx" ON "faq_items_rels" USING btree ("parent_id");
  CREATE INDEX "faq_items_rels_path_idx" ON "faq_items_rels" USING btree ("path");
  CREATE INDEX "faq_items_rels_faq_items_id_idx" ON "faq_items_rels" USING btree ("faq_items_id");
  CREATE UNIQUE INDEX "reusable_blocks_slug_idx" ON "reusable_blocks" USING btree ("slug");
  CREATE INDEX "reusable_blocks_image_idx" ON "reusable_blocks" USING btree ("image_id");
  CREATE INDEX "reusable_blocks_updated_at_idx" ON "reusable_blocks" USING btree ("updated_at");
  CREATE INDEX "reusable_blocks_created_at_idx" ON "reusable_blocks" USING btree ("created_at");
  CREATE UNIQUE INDEX "reusable_blocks_locales_locale_parent_id_unique" ON "reusable_blocks_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "document_templates_key_idx" ON "document_templates" USING btree ("key");
  CREATE INDEX "document_templates_preview_image_idx" ON "document_templates" USING btree ("preview_image_id");
  CREATE INDEX "document_templates_updated_at_idx" ON "document_templates" USING btree ("updated_at");
  CREATE INDEX "document_templates_created_at_idx" ON "document_templates" USING btree ("created_at");
  CREATE UNIQUE INDEX "document_templates_locales_locale_parent_id_unique" ON "document_templates_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "custom_scripts_updated_at_idx" ON "custom_scripts" USING btree ("updated_at");
  CREATE INDEX "custom_scripts_created_at_idx" ON "custom_scripts" USING btree ("created_at");
  CREATE UNIQUE INDEX "seo_settings_identifier_idx" ON "seo_settings" USING btree ("identifier");
  CREATE INDEX "seo_settings_og_image_idx" ON "seo_settings" USING btree ("og_image_id");
  CREATE INDEX "seo_settings_updated_at_idx" ON "seo_settings" USING btree ("updated_at");
  CREATE INDEX "seo_settings_created_at_idx" ON "seo_settings" USING btree ("created_at");
  CREATE UNIQUE INDEX "seo_settings_locales_locale_parent_id_unique" ON "seo_settings_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "form_configs_fields_options_order_idx" ON "form_configs_fields_options" USING btree ("_order");
  CREATE INDEX "form_configs_fields_options_parent_id_idx" ON "form_configs_fields_options" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "form_configs_fields_options_locales_locale_parent_id_unique" ON "form_configs_fields_options_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "form_configs_fields_order_idx" ON "form_configs_fields" USING btree ("_order");
  CREATE INDEX "form_configs_fields_parent_id_idx" ON "form_configs_fields" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "form_configs_fields_locales_locale_parent_id_unique" ON "form_configs_fields_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "form_configs_name_idx" ON "form_configs" USING btree ("name");
  CREATE INDEX "form_configs_updated_at_idx" ON "form_configs" USING btree ("updated_at");
  CREATE INDEX "form_configs_created_at_idx" ON "form_configs" USING btree ("created_at");
  CREATE UNIQUE INDEX "form_configs_locales_locale_parent_id_unique" ON "form_configs_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "form_submissions_form_config_idx" ON "form_submissions" USING btree ("form_config_id");
  CREATE INDEX "form_submissions_updated_at_idx" ON "form_submissions" USING btree ("updated_at");
  CREATE INDEX "form_submissions_created_at_idx" ON "form_submissions" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_media_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("media_categories_id");
  CREATE INDEX "payload_locked_documents_rels_media_tags_id_idx" ON "payload_locked_documents_rels" USING btree ("media_tags_id");
  CREATE INDEX "payload_locked_documents_rels_roles_id_idx" ON "payload_locked_documents_rels" USING btree ("roles_id");
  CREATE INDEX "payload_locked_documents_rels_permissions_id_idx" ON "payload_locked_documents_rels" USING btree ("permissions_id");
  CREATE INDEX "payload_locked_documents_rels_activity_logs_id_idx" ON "payload_locked_documents_rels" USING btree ("activity_logs_id");
  CREATE INDEX "payload_locked_documents_rels_products_id_idx" ON "payload_locked_documents_rels" USING btree ("products_id");
  CREATE INDEX "payload_locked_documents_rels_product_series_id_idx" ON "payload_locked_documents_rels" USING btree ("product_series_id");
  CREATE INDEX "payload_locked_documents_rels_hero_banner_items_id_idx" ON "payload_locked_documents_rels" USING btree ("hero_banner_items_id");
  CREATE INDEX "payload_locked_documents_rels_navigation_menus_id_idx" ON "payload_locked_documents_rels" USING btree ("navigation_menus_id");
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");
  CREATE INDEX "payload_locked_documents_rels_blogs_id_idx" ON "payload_locked_documents_rels" USING btree ("blogs_id");
  CREATE INDEX "payload_locked_documents_rels_applications_id_idx" ON "payload_locked_documents_rels" USING btree ("applications_id");
  CREATE INDEX "payload_locked_documents_rels_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("categories_id");
  CREATE INDEX "payload_locked_documents_rels_faq_items_id_idx" ON "payload_locked_documents_rels" USING btree ("faq_items_id");
  CREATE INDEX "payload_locked_documents_rels_reusable_blocks_id_idx" ON "payload_locked_documents_rels" USING btree ("reusable_blocks_id");
  CREATE INDEX "payload_locked_documents_rels_document_templates_id_idx" ON "payload_locked_documents_rels" USING btree ("document_templates_id");
  CREATE INDEX "payload_locked_documents_rels_custom_scripts_id_idx" ON "payload_locked_documents_rels" USING btree ("custom_scripts_id");
  CREATE INDEX "payload_locked_documents_rels_seo_settings_id_idx" ON "payload_locked_documents_rels" USING btree ("seo_settings_id");
  CREATE INDEX "payload_locked_documents_rels_form_configs_id_idx" ON "payload_locked_documents_rels" USING btree ("form_configs_id");
  CREATE INDEX "payload_locked_documents_rels_form_submissions_id_idx" ON "payload_locked_documents_rels" USING btree ("form_submissions_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "footer_social_links_order_idx" ON "footer_social_links" USING btree ("_order");
  CREATE INDEX "footer_social_links_parent_id_idx" ON "footer_social_links" USING btree ("_parent_id");
  CREATE INDEX "footer_social_links_icon_idx" ON "footer_social_links" USING btree ("icon_id");
  CREATE INDEX "footer_legal_links_order_idx" ON "footer_legal_links" USING btree ("_order");
  CREATE INDEX "footer_legal_links_parent_id_idx" ON "footer_legal_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "footer_legal_links_locales_locale_parent_id_unique" ON "footer_legal_links_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "footer_locales_locale_parent_id_unique" ON "footer_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "site_config_logo_idx" ON "site_config" USING btree ("logo_id");
  CREATE INDEX "site_config_favicon_idx" ON "site_config" USING btree ("favicon_id");
  CREATE INDEX "site_config_default_og_image_idx" ON "site_config" USING btree ("default_og_image_id");
  CREATE UNIQUE INDEX "site_config_locales_locale_parent_id_unique" ON "site_config_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "home_content_sections_order_idx" ON "home_content_sections" USING btree ("_order");
  CREATE INDEX "home_content_sections_parent_id_idx" ON "home_content_sections" USING btree ("_parent_id");
  CREATE INDEX "brand_advantages_advantages_order_idx" ON "brand_advantages_advantages" USING btree ("_order");
  CREATE INDEX "brand_advantages_advantages_parent_id_idx" ON "brand_advantages_advantages" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "brand_advantages_advantages_locales_locale_parent_id_unique" ON "brand_advantages_advantages_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "brand_advantages_image_idx" ON "brand_advantages" USING btree ("image_id");
  CREATE INDEX "brand_analysis_brand_center_brand_center_large_image_idx" ON "brand_analysis" USING btree ("brand_center_large_image_id");
  CREATE INDEX "brand_analysis_brand_center_brand_center_small_image_idx" ON "brand_analysis" USING btree ("brand_center_small_image_id");
  CREATE INDEX "brand_analysis_project_center_project_center_large_image_idx" ON "brand_analysis" USING btree ("project_center_large_image_id");
  CREATE INDEX "brand_analysis_project_center_project_center_small_image_idx" ON "brand_analysis" USING btree ("project_center_small_image_id");
  CREATE INDEX "brand_analysis_service_center_service_center_large_image_idx" ON "brand_analysis" USING btree ("service_center_large_image_id");
  CREATE INDEX "brand_analysis_service_center_service_center_small_image_idx" ON "brand_analysis" USING btree ("service_center_small_image_id");
  CREATE UNIQUE INDEX "brand_analysis_locales_locale_parent_id_unique" ON "brand_analysis_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "brand_value_value_items_order_idx" ON "brand_value_value_items" USING btree ("_order");
  CREATE INDEX "brand_value_value_items_parent_id_idx" ON "brand_value_value_items" USING btree ("_parent_id");
  CREATE INDEX "brand_value_value_items_image_idx" ON "brand_value_value_items" USING btree ("image_id");
  CREATE UNIQUE INDEX "brand_value_value_items_locales_locale_parent_id_unique" ON "brand_value_value_items_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "brand_value_locales_locale_parent_id_unique" ON "brand_value_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "service_features_features_images_order_idx" ON "service_features_features_images" USING btree ("_order");
  CREATE INDEX "service_features_features_images_parent_id_idx" ON "service_features_features_images" USING btree ("_parent_id");
  CREATE INDEX "service_features_features_images_image_idx" ON "service_features_features_images" USING btree ("image_id");
  CREATE INDEX "service_features_features_order_idx" ON "service_features_features" USING btree ("_order");
  CREATE INDEX "service_features_features_parent_id_idx" ON "service_features_features" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "service_features_features_locales_locale_parent_id_unique" ON "service_features_features_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "service_features_locales_locale_parent_id_unique" ON "service_features_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "quote_steps_steps_order_idx" ON "quote_steps_steps" USING btree ("_order");
  CREATE INDEX "quote_steps_steps_parent_id_idx" ON "quote_steps_steps" USING btree ("_parent_id");
  CREATE INDEX "quote_steps_steps_image_idx" ON "quote_steps_steps" USING btree ("image_id");
  CREATE UNIQUE INDEX "quote_steps_steps_locales_locale_parent_id_unique" ON "quote_steps_steps_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "quote_steps_locales_locale_parent_id_unique" ON "quote_steps_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "why_choose_busrom_reasons_order_idx" ON "why_choose_busrom_reasons" USING btree ("_order");
  CREATE INDEX "why_choose_busrom_reasons_parent_id_idx" ON "why_choose_busrom_reasons" USING btree ("_parent_id");
  CREATE INDEX "why_choose_busrom_reasons_image_idx" ON "why_choose_busrom_reasons" USING btree ("image_id");
  CREATE UNIQUE INDEX "why_choose_busrom_reasons_locales_locale_parent_id_unique" ON "why_choose_busrom_reasons_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "why_choose_busrom_locales_locale_parent_id_unique" ON "why_choose_busrom_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "oem_odm_services_order_idx" ON "oem_odm_services" USING btree ("_order");
  CREATE INDEX "oem_odm_services_parent_id_idx" ON "oem_odm_services" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "oem_odm_services_locales_locale_parent_id_unique" ON "oem_odm_services_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "oem_odm_image_idx" ON "oem_odm" USING btree ("image_id");
  CREATE UNIQUE INDEX "oem_odm_locales_locale_parent_id_unique" ON "oem_odm_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "simple_cta_images_order_idx" ON "simple_cta_images" USING btree ("_order");
  CREATE INDEX "simple_cta_images_parent_id_idx" ON "simple_cta_images" USING btree ("_parent_id");
  CREATE INDEX "simple_cta_images_image_idx" ON "simple_cta_images" USING btree ("image_id");
  CREATE UNIQUE INDEX "simple_cta_locales_locale_parent_id_unique" ON "simple_cta_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "series_intro_series_order_idx" ON "series_intro_series" USING btree ("_order");
  CREATE INDEX "series_intro_series_parent_id_idx" ON "series_intro_series" USING btree ("_parent_id");
  CREATE INDEX "series_intro_series_image_idx" ON "series_intro_series" USING btree ("image_id");
  CREATE INDEX "series_intro_series_product_series_idx" ON "series_intro_series" USING btree ("product_series_id");
  CREATE UNIQUE INDEX "series_intro_series_locales_locale_parent_id_unique" ON "series_intro_series_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "series_intro_locales_locale_parent_id_unique" ON "series_intro_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "sphere_3d_locales_locale_parent_id_unique" ON "sphere_3d_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "main_form_fields_options_order_idx" ON "main_form_fields_options" USING btree ("_order");
  CREATE INDEX "main_form_fields_options_parent_id_idx" ON "main_form_fields_options" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "main_form_fields_options_locales_locale_parent_id_unique" ON "main_form_fields_options_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "main_form_fields_order_idx" ON "main_form_fields" USING btree ("_order");
  CREATE INDEX "main_form_fields_parent_id_idx" ON "main_form_fields" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "main_form_fields_locales_locale_parent_id_unique" ON "main_form_fields_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "main_form_locales_locale_parent_id_unique" ON "main_form_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "featured_products_featured_series_order_idx" ON "featured_products_featured_series" USING btree ("_order");
  CREATE INDEX "featured_products_featured_series_parent_id_idx" ON "featured_products_featured_series" USING btree ("_parent_id");
  CREATE INDEX "featured_products_featured_series_series_idx" ON "featured_products_featured_series" USING btree ("series_id");
  CREATE UNIQUE INDEX "featured_products_featured_series_locales_locale_parent_id_u" ON "featured_products_featured_series_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "featured_products_locales_locale_parent_id_unique" ON "featured_products_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "featured_products_rels_order_idx" ON "featured_products_rels" USING btree ("order");
  CREATE INDEX "featured_products_rels_parent_idx" ON "featured_products_rels" USING btree ("parent_id");
  CREATE INDEX "featured_products_rels_path_idx" ON "featured_products_rels" USING btree ("path");
  CREATE INDEX "featured_products_rels_products_id_idx" ON "featured_products_rels" USING btree ("products_id");
  CREATE INDEX "product_series_carousel_items_order_idx" ON "product_series_carousel_items" USING btree ("_order");
  CREATE INDEX "product_series_carousel_items_parent_id_idx" ON "product_series_carousel_items" USING btree ("_parent_id");
  CREATE INDEX "product_series_carousel_items_series_idx" ON "product_series_carousel_items" USING btree ("series_id");
  CREATE INDEX "product_series_carousel_items_custom_image_idx" ON "product_series_carousel_items" USING btree ("custom_image_id");
  CREATE UNIQUE INDEX "product_series_carousel_items_locales_locale_parent_id_uniqu" ON "product_series_carousel_items_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "product_series_carousel_locales_locale_parent_id_unique" ON "product_series_carousel_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "case_studies_cases_order_idx" ON "case_studies_cases" USING btree ("_order");
  CREATE INDEX "case_studies_cases_parent_id_idx" ON "case_studies_cases" USING btree ("_parent_id");
  CREATE INDEX "case_studies_cases_image_idx" ON "case_studies_cases" USING btree ("image_id");
  CREATE UNIQUE INDEX "case_studies_cases_locales_locale_parent_id_unique" ON "case_studies_cases_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "case_studies_locales_locale_parent_id_unique" ON "case_studies_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "email_config_locales_locale_parent_id_unique" ON "email_config_locales" USING btree ("_locale","_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "users_rels" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "media_locales" CASCADE;
  DROP TABLE "media_rels" CASCADE;
  DROP TABLE "media_categories" CASCADE;
  DROP TABLE "media_categories_locales" CASCADE;
  DROP TABLE "media_tags" CASCADE;
  DROP TABLE "media_tags_locales" CASCADE;
  DROP TABLE "roles" CASCADE;
  DROP TABLE "roles_locales" CASCADE;
  DROP TABLE "roles_rels" CASCADE;
  DROP TABLE "permissions" CASCADE;
  DROP TABLE "activity_logs" CASCADE;
  DROP TABLE "products_attributes" CASCADE;
  DROP TABLE "products_attributes_locales" CASCADE;
  DROP TABLE "products_specifications_options" CASCADE;
  DROP TABLE "products_specifications_options_locales" CASCADE;
  DROP TABLE "products_specifications" CASCADE;
  DROP TABLE "products_specifications_locales" CASCADE;
  DROP TABLE "products_main_images" CASCADE;
  DROP TABLE "products_main_images_locales" CASCADE;
  DROP TABLE "products_scene_images" CASCADE;
  DROP TABLE "products_scene_images_locales" CASCADE;
  DROP TABLE "products" CASCADE;
  DROP TABLE "products_locales" CASCADE;
  DROP TABLE "product_series_gallery_images" CASCADE;
  DROP TABLE "product_series_gallery_images_locales" CASCADE;
  DROP TABLE "product_series" CASCADE;
  DROP TABLE "product_series_locales" CASCADE;
  DROP TABLE "hero_banner_items_features" CASCADE;
  DROP TABLE "hero_banner_items_features_locales" CASCADE;
  DROP TABLE "hero_banner_items_images" CASCADE;
  DROP TABLE "hero_banner_items_images_locales" CASCADE;
  DROP TABLE "hero_banner_items" CASCADE;
  DROP TABLE "hero_banner_items_locales" CASCADE;
  DROP TABLE "navigation_menus" CASCADE;
  DROP TABLE "navigation_menus_locales" CASCADE;
  DROP TABLE "navigation_menus_rels" CASCADE;
  DROP TABLE "pages" CASCADE;
  DROP TABLE "pages_locales" CASCADE;
  DROP TABLE "pages_rels" CASCADE;
  DROP TABLE "blogs" CASCADE;
  DROP TABLE "blogs_locales" CASCADE;
  DROP TABLE "blogs_rels" CASCADE;
  DROP TABLE "applications_scene_gallery_images" CASCADE;
  DROP TABLE "applications_scene_gallery_images_locales" CASCADE;
  DROP TABLE "applications_scene_gallery" CASCADE;
  DROP TABLE "applications_scene_gallery_locales" CASCADE;
  DROP TABLE "applications" CASCADE;
  DROP TABLE "applications_locales" CASCADE;
  DROP TABLE "categories" CASCADE;
  DROP TABLE "categories_locales" CASCADE;
  DROP TABLE "faq_items" CASCADE;
  DROP TABLE "faq_items_locales" CASCADE;
  DROP TABLE "faq_items_rels" CASCADE;
  DROP TABLE "reusable_blocks" CASCADE;
  DROP TABLE "reusable_blocks_locales" CASCADE;
  DROP TABLE "document_templates" CASCADE;
  DROP TABLE "document_templates_locales" CASCADE;
  DROP TABLE "custom_scripts" CASCADE;
  DROP TABLE "seo_settings" CASCADE;
  DROP TABLE "seo_settings_locales" CASCADE;
  DROP TABLE "form_configs_fields_options" CASCADE;
  DROP TABLE "form_configs_fields_options_locales" CASCADE;
  DROP TABLE "form_configs_fields" CASCADE;
  DROP TABLE "form_configs_fields_locales" CASCADE;
  DROP TABLE "form_configs" CASCADE;
  DROP TABLE "form_configs_locales" CASCADE;
  DROP TABLE "form_submissions" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "footer_social_links" CASCADE;
  DROP TABLE "footer_legal_links" CASCADE;
  DROP TABLE "footer_legal_links_locales" CASCADE;
  DROP TABLE "footer" CASCADE;
  DROP TABLE "footer_locales" CASCADE;
  DROP TABLE "site_config" CASCADE;
  DROP TABLE "site_config_locales" CASCADE;
  DROP TABLE "home_content_sections" CASCADE;
  DROP TABLE "home_content" CASCADE;
  DROP TABLE "brand_advantages_advantages" CASCADE;
  DROP TABLE "brand_advantages_advantages_locales" CASCADE;
  DROP TABLE "brand_advantages" CASCADE;
  DROP TABLE "brand_analysis" CASCADE;
  DROP TABLE "brand_analysis_locales" CASCADE;
  DROP TABLE "brand_value_value_items" CASCADE;
  DROP TABLE "brand_value_value_items_locales" CASCADE;
  DROP TABLE "brand_value" CASCADE;
  DROP TABLE "brand_value_locales" CASCADE;
  DROP TABLE "service_features_features_images" CASCADE;
  DROP TABLE "service_features_features" CASCADE;
  DROP TABLE "service_features_features_locales" CASCADE;
  DROP TABLE "service_features" CASCADE;
  DROP TABLE "service_features_locales" CASCADE;
  DROP TABLE "quote_steps_steps" CASCADE;
  DROP TABLE "quote_steps_steps_locales" CASCADE;
  DROP TABLE "quote_steps" CASCADE;
  DROP TABLE "quote_steps_locales" CASCADE;
  DROP TABLE "why_choose_busrom_reasons" CASCADE;
  DROP TABLE "why_choose_busrom_reasons_locales" CASCADE;
  DROP TABLE "why_choose_busrom" CASCADE;
  DROP TABLE "why_choose_busrom_locales" CASCADE;
  DROP TABLE "oem_odm_services" CASCADE;
  DROP TABLE "oem_odm_services_locales" CASCADE;
  DROP TABLE "oem_odm" CASCADE;
  DROP TABLE "oem_odm_locales" CASCADE;
  DROP TABLE "simple_cta_images" CASCADE;
  DROP TABLE "simple_cta" CASCADE;
  DROP TABLE "simple_cta_locales" CASCADE;
  DROP TABLE "series_intro_series" CASCADE;
  DROP TABLE "series_intro_series_locales" CASCADE;
  DROP TABLE "series_intro" CASCADE;
  DROP TABLE "series_intro_locales" CASCADE;
  DROP TABLE "sphere_3d" CASCADE;
  DROP TABLE "sphere_3d_locales" CASCADE;
  DROP TABLE "main_form_fields_options" CASCADE;
  DROP TABLE "main_form_fields_options_locales" CASCADE;
  DROP TABLE "main_form_fields" CASCADE;
  DROP TABLE "main_form_fields_locales" CASCADE;
  DROP TABLE "main_form" CASCADE;
  DROP TABLE "main_form_locales" CASCADE;
  DROP TABLE "featured_products_featured_series" CASCADE;
  DROP TABLE "featured_products_featured_series_locales" CASCADE;
  DROP TABLE "featured_products" CASCADE;
  DROP TABLE "featured_products_locales" CASCADE;
  DROP TABLE "featured_products_rels" CASCADE;
  DROP TABLE "product_series_carousel_items" CASCADE;
  DROP TABLE "product_series_carousel_items_locales" CASCADE;
  DROP TABLE "product_series_carousel" CASCADE;
  DROP TABLE "product_series_carousel_locales" CASCADE;
  DROP TABLE "case_studies_cases" CASCADE;
  DROP TABLE "case_studies_cases_locales" CASCADE;
  DROP TABLE "case_studies" CASCADE;
  DROP TABLE "case_studies_locales" CASCADE;
  DROP TABLE "email_config" CASCADE;
  DROP TABLE "email_config_locales" CASCADE;
  DROP TABLE "contact_config" CASCADE;
  DROP TABLE "social_config" CASCADE;
  DROP TABLE "translation_config" CASCADE;
  DROP TYPE "public"."_locales";
  DROP TYPE "public"."enum_users_status";
  DROP TYPE "public"."enum_media_status";
  DROP TYPE "public"."enum_media_tags_type";
  DROP TYPE "public"."enum_permissions_resource";
  DROP TYPE "public"."enum_permissions_action";
  DROP TYPE "public"."enum_permissions_category";
  DROP TYPE "public"."enum_activity_logs_action";
  DROP TYPE "public"."enum_activity_logs_entity";
  DROP TYPE "public"."enum_products_status";
  DROP TYPE "public"."enum_product_series_status";
  DROP TYPE "public"."enum_hero_banner_items_status";
  DROP TYPE "public"."enum_navigation_menus_type";
  DROP TYPE "public"."enum_pages_page_type";
  DROP TYPE "public"."enum_pages_status";
  DROP TYPE "public"."enum_blogs_status";
  DROP TYPE "public"."enum_applications_status";
  DROP TYPE "public"."enum_categories_type";
  DROP TYPE "public"."enum_categories_status";
  DROP TYPE "public"."enum_faq_items_status";
  DROP TYPE "public"."enum_reusable_blocks_block_type";
  DROP TYPE "public"."enum_reusable_blocks_cta_style";
  DROP TYPE "public"."enum_reusable_blocks_status";
  DROP TYPE "public"."enum_document_templates_category";
  DROP TYPE "public"."enum_document_templates_status";
  DROP TYPE "public"."enum_custom_scripts_script_position";
  DROP TYPE "public"."enum_custom_scripts_scope";
  DROP TYPE "public"."enum_custom_scripts_page_type";
  DROP TYPE "public"."enum_seo_settings_scope";
  DROP TYPE "public"."enum_seo_settings_page_type";
  DROP TYPE "public"."enum_seo_settings_og_type";
  DROP TYPE "public"."enum_seo_settings_sitemap_changefreq";
  DROP TYPE "public"."enum_form_configs_fields_field_type";
  DROP TYPE "public"."enum_form_configs_fields_width";
  DROP TYPE "public"."enum_form_configs_location";
  DROP TYPE "public"."enum_form_configs_status";
  DROP TYPE "public"."enum_form_submissions_status";
  DROP TYPE "public"."enum_form_submissions_submission_type";
  DROP TYPE "public"."enum_footer_social_links_platform";
  DROP TYPE "public"."enum_home_content_sections_section_type";
  DROP TYPE "public"."enum_brand_advantages_status";
  DROP TYPE "public"."enum_brand_analysis_status";
  DROP TYPE "public"."enum_brand_value_value_items_key";
  DROP TYPE "public"."enum_brand_value_status";
  DROP TYPE "public"."enum_service_features_status";
  DROP TYPE "public"."enum_quote_steps_status";
  DROP TYPE "public"."enum_why_choose_busrom_status";
  DROP TYPE "public"."enum_oem_odm_status";
  DROP TYPE "public"."enum_simple_cta_status";
  DROP TYPE "public"."enum_series_intro_status";
  DROP TYPE "public"."enum_sphere_3d_status";
  DROP TYPE "public"."enum_main_form_fields_field_type";
  DROP TYPE "public"."enum_main_form_status";
  DROP TYPE "public"."enum_featured_products_status";
  DROP TYPE "public"."enum_product_series_carousel_status";
  DROP TYPE "public"."enum_case_studies_status";
  DROP TYPE "public"."enum_case_studies_display_mode";
  DROP TYPE "public"."enum_translation_config_service";
  DROP TYPE "public"."enum_translation_config_default_source_lang";
  DROP TYPE "public"."enum_translation_config_last_test_result";`)
}
