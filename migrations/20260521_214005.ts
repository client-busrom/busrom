import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('en', 'zh', 'es', 'fr', 'de', 'ja', 'ko', 'pt', 'it', 'nl', 'pl', 'ru', 'ar', 'th', 'vi', 'id', 'ms', 'tr', 'hi', 'bn', 'sv', 'da', 'no', 'fi');
  CREATE TYPE "public"."enum_users_quick_actions_route" AS ENUM('/admin/collections/products/create', '/admin/collections/products', '/admin/collections/product-series', '/admin/collections/product-attributes', '/admin/collections/blogs/create', '/admin/collections/blogs', '/admin/collections/categories', '/admin/collections/faq-items', '/admin/collections/document-templates', '/admin/collections/media', '/admin/collections/media-categories', '/admin/collections/applications', '/admin/collections/form-submissions', '/admin/collections/form-configs', '/admin/collections/smtp-configs', '/admin/collections/hero-banner-items', '/admin/collections/pages', '/admin/globals/shop-page-config', '/admin/collections/navigation-menus', '/admin/globals/seo-setting', '/admin/collections/indexing-logs', '/admin/globals/site-config', '/admin/globals/footer', '/admin/globals/translation-config', '/admin/collections/users');
  CREATE TYPE "public"."enum_users_quick_actions_color_preset" AS ENUM('success', 'info', 'warning', 'error', 'default');
  CREATE TYPE "public"."enum_users_status" AS ENUM('active', 'inactive', 'suspended');
  CREATE TYPE "public"."enum_media_status" AS ENUM('active', 'archived');
  CREATE TYPE "public"."enum_media_tags_type" AS ENUM('general', 'product_series', 'product_model', 'scene', 'color', 'material', 'style');
  CREATE TYPE "public"."enum_permissions_resource" AS ENUM('USER', 'ROLE', 'PERMISSION', 'AUDIT_LOG', 'PRODUCT', 'PRODUCT_SERIES', 'PRODUCT_ATTRIBUTE', 'PRODUCT_TEMPLATE', 'PRODUCT_REUSABLE_BLOCK', 'SERIES_TEMPLATE', 'SERIES_REUSABLE_BLOCK', 'SERIES_INTRO_ITEM', 'PAGE', 'BLOG', 'BLOG_TAG', 'KNOWLEDGE_BASE_SETTINGS', 'AUTHOR', 'APPLICATION', 'CATEGORY', 'FAQ_ITEM', 'REUSABLE_BLOCK', 'DOCUMENT_TEMPLATE', 'TEMPLATE_CATEGORY', 'NAVIGATION_MENU', 'HERO_BANNER_ITEM', 'MEDIA', 'MEDIA_CATEGORY', 'MEDIA_TAG', 'FORM_CONFIG', 'FORM_SUBMISSION', 'HOME_CONTENT', 'FOOTER', 'HOMEPAGE_GLOBAL', 'SITE_CONFIG', 'SEO_SETTING', 'CUSTOM_SCRIPT', 'EMAIL_CONFIG', 'CONTACT_CONFIG', 'SOCIAL_CONFIG', 'TRANSLATION_CONFIG', 'SHOP_PAGE_CONFIG', 'PRELOADER_CONFIG');
  CREATE TYPE "public"."enum_permissions_action" AS ENUM('CREATE', 'READ', 'UPDATE', 'DELETE', 'PUBLISH', 'EXPORT', 'IMPORT', 'MANAGE');
  CREATE TYPE "public"."enum_permissions_category" AS ENUM('USER', 'NAVIGATION', 'WEBSITE_PAGES', 'PRODUCTS', 'CONTENT', 'MEDIA', 'FORMS', 'ADVANCED', 'WEBSITE_SETTINGS', 'CMS_SETTINGS', 'HOMEPAGE', 'SYSTEM');
  CREATE TYPE "public"."enum_products_status" AS ENUM('published', 'draft', 'archived');
  CREATE TYPE "public"."enum_product_series_status" AS ENUM('published', 'draft', 'archived');
  CREATE TYPE "public"."enum_product_templates_status" AS ENUM('published', 'draft', 'archived');
  CREATE TYPE "public"."enum_product_reusable_blocks_status" AS ENUM('published', 'draft', 'archived');
  CREATE TYPE "public"."enum_series_templates_status" AS ENUM('published', 'draft', 'archived');
  CREATE TYPE "public"."enum_series_reusable_blocks_status" AS ENUM('published', 'draft', 'archived');
  CREATE TYPE "public"."enum_hero_banner_items_status" AS ENUM('published', 'draft');
  CREATE TYPE "public"."enum_series_intro_items_status" AS ENUM('published', 'draft');
  CREATE TYPE "public"."enum_navigation_menus_type" AS ENUM('standard', 'product_cards', 'submenu');
  CREATE TYPE "public"."enum_authors_social_links_platform" AS ENUM('instagram', 'linkedin', 'twitter', 'facebook', 'pinterest', 'youtube', 'website');
  CREATE TYPE "public"."enum_pages_status" AS ENUM('published', 'draft', 'archived');
  CREATE TYPE "public"."enum_pages_page_type" AS ENUM('TEMPLATE', 'FREEFORM');
  CREATE TYPE "public"."enum_blogs_status" AS ENUM('published', 'draft', 'archived');
  CREATE TYPE "public"."enum_blogs_template_type" AS ENUM('template1', 'template2', 'template3');
  CREATE TYPE "public"."enum_blogs_kb_toc_mode" AS ENUM('inherit', 'override', 'disable');
  CREATE TYPE "public"."enum_blogs_kb_share_mode" AS ENUM('inherit', 'override', 'disable');
  CREATE TYPE "public"."enum_blogs_kb_search_box_mode" AS ENUM('inherit', 'override', 'disable');
  CREATE TYPE "public"."enum_blogs_kb_category_list_mode" AS ENUM('inherit', 'override', 'disable');
  CREATE TYPE "public"."enum_blogs_kb_recommended_posts_mode" AS ENUM('inherit', 'override', 'disable');
  CREATE TYPE "public"."enum_blogs_kb_recommended_posts_logic" AS ENUM('category', 'latest');
  CREATE TYPE "public"."enum_blogs_kb_follow_us_mode" AS ENUM('inherit', 'override', 'disable');
  CREATE TYPE "public"."enum_blogs_kb_bottom_categories_mode" AS ENUM('inherit', 'override', 'disable');
  CREATE TYPE "public"."enum_blogs_kb_pagination_mode" AS ENUM('inherit', 'override', 'disable');
  CREATE TYPE "public"."enum_blogs_kb_pagination_type" AS ENUM('auto', 'manual');
  CREATE TYPE "public"."enum_blogs_kb_bottom_recommended_mode" AS ENUM('inherit', 'override', 'disable');
  CREATE TYPE "public"."enum_blogs_kb_bottom_recommended_logic" AS ENUM('category', 'latest');
  CREATE TYPE "public"."enum_applications_status" AS ENUM('published', 'draft', 'archived');
  CREATE TYPE "public"."enum_categories_type" AS ENUM('PAGE', 'PRODUCT', 'BLOG', 'APPLICATION', 'FAQ');
  CREATE TYPE "public"."enum_categories_status" AS ENUM('published', 'draft', 'archived');
  CREATE TYPE "public"."enum_faq_items_status" AS ENUM('published', 'draft', 'archived');
  CREATE TYPE "public"."enum_reusable_blocks_block_type" AS ENUM('CTA', 'FEATURE', 'TESTIMONIAL', 'CONTACT', 'CUSTOM');
  CREATE TYPE "public"."enum_reusable_blocks_status" AS ENUM('published', 'draft', 'archived');
  CREATE TYPE "public"."enum_document_templates_status" AS ENUM('active', 'draft', 'archived');
  CREATE TYPE "public"."enum_custom_scripts_script_type" AS ENUM('template', 'custom');
  CREATE TYPE "public"."enum_custom_scripts_template_type" AS ENUM('google_analytics_4', 'google_tag_manager', 'google_tag_manager_noscript', 'facebook_pixel', 'tiktok_pixel', 'microsoft_clarity', 'hotjar');
  CREATE TYPE "public"."enum_custom_scripts_script_position" AS ENUM('header', 'footer', 'body_start');
  CREATE TYPE "public"."enum_custom_scripts_scope" AS ENUM('global', 'page_type', 'exact_path', 'path_pattern');
  CREATE TYPE "public"."enum_custom_scripts_page_type" AS ENUM('home', 'product_series_list', 'product_series_detail', 'shop_list', 'shop_detail', 'blog_list', 'blog_detail', 'applications');
  CREATE TYPE "public"."enum_custom_scripts_test_status" AS ENUM('not_tested', 'passed', 'failed');
  CREATE TYPE "public"."enum_seo_settings_scope" AS ENUM('global', 'page_type', 'exact_path', 'path_pattern');
  CREATE TYPE "public"."enum_seo_settings_page_type" AS ENUM('home', 'product_series_list', 'product_series_detail', 'shop_list', 'shop_detail', 'blog_list', 'blog_detail', 'applications');
  CREATE TYPE "public"."enum_seo_settings_og_type" AS ENUM('website', 'article', 'product');
  CREATE TYPE "public"."enum_seo_settings_sitemap_changefreq" AS ENUM('always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never');
  CREATE TYPE "public"."enum_form_configs_fields_field_type" AS ENUM('text', 'email', 'phone', 'textarea', 'select', 'checkbox', 'radio', 'number', 'date', 'file', 'country');
  CREATE TYPE "public"."enum_form_configs_fields_width" AS ENUM('full', 'half', 'third');
  CREATE TYPE "public"."enum_form_configs_captcha_theme" AS ENUM('auto', 'light', 'dark');
  CREATE TYPE "public"."enum_form_configs_captcha_size" AS ENUM('normal', 'compact');
  CREATE TYPE "public"."enum_form_configs_auto_reply_enabled" AS ENUM('inherit', 'enabled', 'disabled');
  CREATE TYPE "public"."enum_form_configs_status" AS ENUM('published', 'draft');
  CREATE TYPE "public"."enum_form_submissions_status" AS ENUM('UNREAD', 'READ', 'ARCHIVED');
  CREATE TYPE "public"."enum_form_submissions_submission_type" AS ENUM('MANUAL', 'AUTO');
  CREATE TYPE "public"."enum_smtp_configs_status" AS ENUM('enabled', 'disabled');
  CREATE TYPE "public"."enum_indexing_logs_engine" AS ENUM('google', 'indexnow');
  CREATE TYPE "public"."enum_indexing_logs_action" AS ENUM('update', 'delete');
  CREATE TYPE "public"."enum_indexing_logs_status" AS ENUM('success', 'failed_keys', 'failed_network');
  CREATE TYPE "public"."enum_audit_logs_type" AS ENUM('info', 'debug', 'warning', 'error', 'audit', 'security', 'unknown');
  CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'regenerateImageSizes', 'cleanup-payload-auditor-log');
  CREATE TYPE "public"."enum_payload_jobs_log_state" AS ENUM('failed', 'succeeded');
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'regenerateImageSizes', 'cleanup-payload-auditor-log');
  CREATE TYPE "public"."enum_home_content_sections_section_type" AS ENUM('hero_banner', 'product_series_carousel', 'service_features', 'sphere_3d', 'simple_cta', 'series_intro', 'featured_products', 'brand_advantages', 'oem_odm', 'quote_steps', 'main_form', 'why_choose_busrom', 'case_studies', 'brand_analysis', 'brand_value');
  CREATE TYPE "public"."enum_contact_popup_options_link_type" AS ENUM('url', 'phone', 'email', 'chat');
  CREATE TYPE "public"."enum_contact_popup_status" AS ENUM('published', 'draft');
  CREATE TYPE "public"."enum_preloader_config_images_aspect_ratio" AS ENUM('9 / 16', '9 / 12', '9 / 6', '1 / 1', '16 / 9');
  CREATE TYPE "public"."enum_social_config_social_links_platform" AS ENUM('facebook', 'instagram', 'linkedin', 'youtube', 'twitter', 'tiktok', 'pinterest', 'whatsapp', 'telegram', 'discord', 'wechat', 'weibo', 'douyin', 'xiaohongshu', 'bilibili', 'custom');
  CREATE TYPE "public"."enum_knowledge_base_settings_toc_templates" AS ENUM('template1', 'template2', 'template3');
  CREATE TYPE "public"."enum_knowledge_base_settings_share_config_templates" AS ENUM('template1', 'template2', 'template3');
  CREATE TYPE "public"."enum_knowledge_base_settings_search_box_templates" AS ENUM('template1', 'template2', 'template3');
  CREATE TYPE "public"."enum_knowledge_base_settings_category_list_templates" AS ENUM('template1', 'template2', 'template3');
  CREATE TYPE "public"."enum_knowledge_base_settings_recommended_posts_templates" AS ENUM('template1', 'template2', 'template3');
  CREATE TYPE "public"."enum_knowledge_base_settings_follow_us_templates" AS ENUM('template1', 'template2', 'template3');
  CREATE TYPE "public"."enum_knowledge_base_settings_bottom_categories_templates" AS ENUM('template1', 'template2', 'template3');
  CREATE TYPE "public"."enum_knowledge_base_settings_pagination_templates" AS ENUM('template1', 'template2', 'template3');
  CREATE TYPE "public"."enum_knowledge_base_settings_bottom_recommended_templates" AS ENUM('template1', 'template2', 'template3');
  CREATE TYPE "public"."enum_knowledge_base_settings_status" AS ENUM('published', 'draft');
  CREATE TYPE "public"."enum_product_series_carousel_status" AS ENUM('published', 'draft');
  CREATE TYPE "public"."enum_service_features_status" AS ENUM('published', 'draft');
  CREATE TYPE "public"."enum_sphere_3d_status" AS ENUM('published', 'draft');
  CREATE TYPE "public"."enum_simple_cta_status" AS ENUM('published', 'draft');
  CREATE TYPE "public"."enum_featured_products_status" AS ENUM('published', 'draft');
  CREATE TYPE "public"."enum_brand_advantages_status" AS ENUM('published', 'draft');
  CREATE TYPE "public"."enum_oem_odm_status" AS ENUM('published', 'draft');
  CREATE TYPE "public"."enum_quote_steps_status" AS ENUM('published', 'draft');
  CREATE TYPE "public"."enum_main_form_status" AS ENUM('published', 'draft');
  CREATE TYPE "public"."enum_why_choose_busrom_status" AS ENUM('published', 'draft');
  CREATE TYPE "public"."enum_case_studies_status" AS ENUM('published', 'draft');
  CREATE TYPE "public"."enum_brand_analysis_status" AS ENUM('published', 'draft');
  CREATE TYPE "public"."enum_brand_value_status" AS ENUM('published', 'draft');
  CREATE TYPE "public"."enum_translation_config_service" AS ENUM('google', 'deepl', 'azure');
  CREATE TYPE "public"."enum_translation_config_default_source_lang" AS ENUM('en', 'zh', 'auto');
  CREATE TYPE "public"."enum_translation_config_last_test_result" AS ENUM('success', 'failed', 'not_tested');
  CREATE TYPE "public"."enum_system_settings_admin_banner_type" AS ENUM('info', 'warning', 'success', 'error');
  CREATE TABLE "users_quick_actions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"route" "enum_users_quick_actions_route",
  	"custom_label" varchar,
  	"color_preset" "enum_users_quick_actions_color_preset" DEFAULT 'success'
  );
  
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
  	"specs" jsonb,
  	"metadata_group" numeric,
  	"metadata_scene_number" numeric,
  	"metadata_image_number" numeric,
  	"metadata_notes" varchar,
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
  	"is_system" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "permissions_locales" (
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "products" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"sku" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"series_id" integer,
  	"category_id" integer,
  	"attribute_page_id" integer,
  	"content_template_id" integer,
  	"linked_form_id" integer,
  	"show_image_id" integer,
  	"status" "enum_products_status" DEFAULT 'draft',
  	"is_featured" boolean DEFAULT false,
  	"shop_visibility" boolean DEFAULT true,
  	"is_hot" boolean DEFAULT false,
  	"is_new" boolean DEFAULT false,
  	"order" numeric DEFAULT 0,
  	"shop_order" numeric DEFAULT 0,
  	"user_id" integer,
  	"operation" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "products_locales" (
  	"name" varchar NOT NULL,
  	"short_description" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "products_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "product_series" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"is_system" boolean DEFAULT false,
  	"status" "enum_product_series_status" DEFAULT 'draft',
  	"published_at" timestamp(3) with time zone,
  	"slug" varchar NOT NULL,
  	"category_id" integer,
  	"series_template_id" integer,
  	"featured_image_id" integer,
  	"order" numeric DEFAULT 0,
  	"is_featured" boolean DEFAULT false,
  	"user_id" integer,
  	"operation" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "product_series_locales" (
  	"name" varchar NOT NULL,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "product_attributes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"category_id" integer,
  	"user_id" integer,
  	"operation" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "product_attributes_locales" (
  	"product_attributes" jsonb,
  	"specifications" jsonb,
  	"custom_attributes" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "product_templates" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"is_system" boolean DEFAULT false,
  	"status" "enum_product_templates_status" DEFAULT 'draft',
  	"published_at" timestamp(3) with time zone,
  	"category_id" integer,
  	"user_id" integer,
  	"operation" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "product_templates_locales" (
  	"name" varchar NOT NULL,
  	"content" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "product_reusable_blocks" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"category_id" integer,
  	"status" "enum_product_reusable_blocks_status" DEFAULT 'draft',
  	"user_id" integer,
  	"operation" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "product_reusable_blocks_locales" (
  	"title" varchar,
  	"content_translation" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "series_templates" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"is_system" boolean DEFAULT false,
  	"status" "enum_series_templates_status" DEFAULT 'draft',
  	"published_at" timestamp(3) with time zone,
  	"category_id" integer,
  	"user_id" integer,
  	"operation" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "series_templates_locales" (
  	"name" varchar NOT NULL,
  	"content" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "series_reusable_blocks" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"category_id" integer,
  	"status" "enum_series_reusable_blocks_status" DEFAULT 'draft',
  	"user_id" integer,
  	"operation" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "series_reusable_blocks_locales" (
  	"title" varchar,
  	"content_translation" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "hero_banner_items" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"internal_label" varchar NOT NULL,
  	"image1_id" integer,
  	"image1_crop_data" jsonb,
  	"image2_id" integer,
  	"image2_crop_data" jsonb,
  	"image3_id" integer,
  	"image3_crop_data" jsonb,
  	"image4_id" integer,
  	"image4_crop_data" jsonb,
  	"cta_button_link" varchar,
  	"order" numeric DEFAULT 0,
  	"status" "enum_hero_banner_items_status" DEFAULT 'draft',
  	"user_id" integer,
  	"operation" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "hero_banner_items_locales" (
  	"title" varchar NOT NULL,
  	"feature1" varchar NOT NULL,
  	"feature2" varchar NOT NULL,
  	"feature3" varchar NOT NULL,
  	"feature4" varchar NOT NULL,
  	"feature5" varchar NOT NULL,
  	"cta_button_text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "series_intro_items" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"internal_label" varchar NOT NULL,
  	"product_series_id" integer,
  	"images" jsonb,
  	"image_crop_data_list" jsonb,
  	"status" "enum_series_intro_items_status" DEFAULT 'draft',
  	"user_id" integer,
  	"operation" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "series_intro_items_locales" (
  	"title" varchar,
  	"description" varchar,
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
  	"user_id" integer,
  	"operation" varchar,
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
  
  CREATE TABLE "authors_social_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"platform" "enum_authors_social_links_platform" NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "authors" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"role" varchar,
  	"avatar_id" integer NOT NULL,
  	"bio" varchar,
  	"slug" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"status" "enum_pages_status" DEFAULT 'draft',
  	"published_at" timestamp(3) with time zone,
  	"is_system" boolean DEFAULT false,
  	"slug" varchar NOT NULL,
  	"path" varchar NOT NULL,
  	"page_type" "enum_pages_page_type" DEFAULT 'FREEFORM' NOT NULL,
  	"template" varchar,
  	"author_id" integer,
  	"order" numeric DEFAULT 0,
  	"user_id" integer,
  	"operation" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "pages_locales" (
  	"title" varchar NOT NULL,
  	"content_translation" jsonb,
  	"hero_text" varchar,
  	"hero_subtitle" varchar,
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
  
  CREATE TABLE "blogs_kb_share_networks" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" varchar,
  	"url" varchar
  );
  
  CREATE TABLE "blogs_kb_follow_us_socials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" varchar,
  	"url" varchar
  );
  
  CREATE TABLE "blogs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"admin_label" varchar,
  	"status" "enum_blogs_status",
  	"published_at" timestamp(3) with time zone,
  	"author_id" integer,
  	"slug" varchar,
  	"cover_image_id" integer,
  	"use_custom_overrides" boolean DEFAULT false,
  	"template_type" "enum_blogs_template_type" DEFAULT 'template1',
  	"kb_toc_mode" "enum_blogs_kb_toc_mode" DEFAULT 'inherit',
  	"kb_share_mode" "enum_blogs_kb_share_mode" DEFAULT 'inherit',
  	"kb_search_box_mode" "enum_blogs_kb_search_box_mode" DEFAULT 'inherit',
  	"kb_category_list_mode" "enum_blogs_kb_category_list_mode" DEFAULT 'inherit',
  	"kb_recommended_posts_mode" "enum_blogs_kb_recommended_posts_mode" DEFAULT 'inherit',
  	"kb_recommended_posts_logic" "enum_blogs_kb_recommended_posts_logic" DEFAULT 'category',
  	"kb_follow_us_mode" "enum_blogs_kb_follow_us_mode" DEFAULT 'inherit',
  	"kb_bottom_categories_mode" "enum_blogs_kb_bottom_categories_mode" DEFAULT 'inherit',
  	"kb_pagination_mode" "enum_blogs_kb_pagination_mode" DEFAULT 'inherit',
  	"kb_pagination_type" "enum_blogs_kb_pagination_type" DEFAULT 'auto',
  	"kb_pagination_prev_post_id" integer,
  	"kb_pagination_next_post_id" integer,
  	"kb_bottom_recommended_mode" "enum_blogs_kb_bottom_recommended_mode" DEFAULT 'inherit',
  	"kb_bottom_recommended_logic" "enum_blogs_kb_bottom_recommended_logic" DEFAULT 'category',
  	"user_id" integer,
  	"operation" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "blogs_locales" (
  	"title" varchar,
  	"excerpt" varchar,
  	"content_translation" jsonb,
  	"kb_toc_title" varchar DEFAULT 'Table of Contents',
  	"kb_share_title" varchar,
  	"kb_search_box_placeholder" varchar,
  	"kb_category_list_title" varchar,
  	"kb_recommended_posts_title" varchar,
  	"kb_follow_us_title" varchar,
  	"kb_bottom_recommended_title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "blogs_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"categories_id" integer,
  	"blog_tags_id" integer,
  	"blogs_id" integer
  );
  
  CREATE TABLE "blog_tags" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"user_id" integer,
  	"operation" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "blog_tags_locales" (
  	"name" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "applications_scene_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "applications_scene_gallery_locales" (
  	"scene_name" varchar,
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
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "applications_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "categories_breadcrumbs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"doc_id" integer,
  	"url" varchar,
  	"label" varchar
  );
  
  CREATE TABLE "categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"full_title" varchar,
  	"admin_label" varchar,
  	"type" "enum_categories_type" NOT NULL,
  	"parent_id" integer,
  	"order" numeric DEFAULT 0,
  	"status" "enum_categories_status" DEFAULT 'draft',
  	"show_in_shop" boolean DEFAULT true,
  	"shop_tab_order" numeric DEFAULT 0,
  	"slug" varchar,
  	"user_id" integer,
  	"operation" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "categories_locales" (
  	"name" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "categories_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"categories_id" integer
  );
  
  CREATE TABLE "faq_items" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"admin_label" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"category_id" integer,
  	"order" numeric DEFAULT 0,
  	"status" "enum_faq_items_status" DEFAULT 'draft',
  	"user_id" integer,
  	"operation" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "faq_items_locales" (
  	"question" varchar NOT NULL,
  	"content_translation" jsonb,
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
  	"status" "enum_reusable_blocks_status" DEFAULT 'draft',
  	"user_id" integer,
  	"operation" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "reusable_blocks_locales" (
  	"title" varchar,
  	"subtitle" varchar,
  	"content_translation" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "document_templates" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"category_id" integer,
  	"content" jsonb,
  	"tags" varchar,
  	"usage_count" numeric DEFAULT 0,
  	"status" "enum_document_templates_status" DEFAULT 'active',
  	"user_id" integer,
  	"operation" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "document_templates_locales" (
  	"name" varchar NOT NULL,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "template_categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"slug" varchar NOT NULL,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "template_categories_locales" (
  	"name" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "custom_scripts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"description" varchar,
  	"script_type" "enum_custom_scripts_script_type" DEFAULT 'template' NOT NULL,
  	"template_type" "enum_custom_scripts_template_type",
  	"template_id" varchar,
  	"script_position" "enum_custom_scripts_script_position" DEFAULT 'header' NOT NULL,
  	"content" varchar,
  	"generated_content" varchar,
  	"scope" "enum_custom_scripts_scope" DEFAULT 'global' NOT NULL,
  	"page_type" "enum_custom_scripts_page_type",
  	"exact_path" varchar,
  	"path_pattern" varchar,
  	"is_enabled" boolean DEFAULT true,
  	"priority" numeric DEFAULT 0,
  	"preview_url" varchar,
  	"last_tested_at" timestamp(3) with time zone,
  	"test_status" "enum_custom_scripts_test_status" DEFAULT 'not_tested',
  	"user_id" integer,
  	"operation" varchar,
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
  	"is_main_seo" boolean DEFAULT false,
  	"og_image_id" integer,
  	"og_type" "enum_seo_settings_og_type" DEFAULT 'website',
  	"robots_index" boolean DEFAULT true,
  	"robots_follow" boolean DEFAULT true,
  	"canonical_url" varchar,
  	"include_in_sitemap" boolean DEFAULT true,
  	"sitemap_priority" numeric DEFAULT 0.5,
  	"sitemap_changefreq" "enum_seo_settings_sitemap_changefreq" DEFAULT 'weekly',
  	"user_id" integer,
  	"operation" varchar,
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
  	"value" varchar,
  	"has_custom_input" boolean DEFAULT false
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
  	"allow_multiple" boolean DEFAULT true,
  	"required" boolean DEFAULT false,
  	"width" "enum_form_configs_fields_width" DEFAULT 'full'
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
  	"rate_limit_enabled" boolean DEFAULT true,
  	"rate_limit_per_i_p" numeric DEFAULT 5,
  	"rate_limit_per_day" numeric DEFAULT 100,
  	"min_submit_interval" numeric DEFAULT 30,
  	"captcha_enabled" boolean DEFAULT false,
  	"captcha_theme" "enum_form_configs_captcha_theme" DEFAULT 'auto',
  	"captcha_size" "enum_form_configs_captcha_size" DEFAULT 'normal',
  	"auto_reply_enabled" "enum_form_configs_auto_reply_enabled" DEFAULT 'inherit',
  	"status" "enum_form_configs_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "form_configs_locales" (
  	"display_name" varchar,
  	"description" varchar,
  	"submit_button_text" varchar DEFAULT 'Submit',
  	"submitting_text" varchar DEFAULT 'Submitting...',
  	"success_message" varchar DEFAULT 'Submitted successfully! We will contact you soon.',
  	"error_required_fields" varchar DEFAULT 'Please fill in required fields',
  	"error_network_message" varchar DEFAULT 'Network error, please try again',
  	"error_captcha_message" varchar DEFAULT 'Please complete the captcha verification',
  	"privacy_consent_text" varchar,
  	"auto_reply_subject" varchar,
  	"auto_reply_template" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "form_configs_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "form_submissions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"form_config_id" integer,
  	"form_name" varchar,
  	"assigned_to_id" integer,
  	"data" jsonb,
  	"attachments" jsonb DEFAULT '[]'::jsonb,
  	"total_attachment_size" numeric DEFAULT 0,
  	"status" "enum_form_submissions_status" DEFAULT 'UNREAD' NOT NULL,
  	"submission_type" "enum_form_submissions_submission_type" DEFAULT 'MANUAL',
  	"locale" varchar,
  	"source_page" varchar,
  	"ip_address" varchar,
  	"country" varchar,
  	"city" varchar,
  	"user_agent" varchar,
  	"admin_notes" varchar,
  	"email_sent" boolean DEFAULT false,
  	"submitted_at" timestamp(3) with time zone,
  	"read_at" timestamp(3) with time zone,
  	"user_local_time" varchar,
  	"china_time" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "smtp_configs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"description" varchar,
  	"smtp_host" varchar NOT NULL,
  	"smtp_port" numeric DEFAULT 587,
  	"smtp_user" varchar NOT NULL,
  	"smtp_password" varchar NOT NULL,
  	"email_from_address" varchar,
  	"notification_enabled" boolean DEFAULT true,
  	"notification_emails" varchar,
  	"auto_reply_enabled" boolean DEFAULT false,
  	"status" "enum_smtp_configs_status" DEFAULT 'enabled',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "smtp_configs_locales" (
  	"email_from_name" varchar DEFAULT 'Busrom',
  	"notification_subject" varchar DEFAULT 'New Form Submission: {formName}',
  	"auto_reply_subject" varchar DEFAULT 'Thank you for contacting Busrom',
  	"auto_reply_template" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "smtp_configs_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"form_configs_id" integer
  );
  
  CREATE TABLE "indexing_logs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"target_url" varchar NOT NULL,
  	"engine" "enum_indexing_logs_engine" NOT NULL,
  	"action" "enum_indexing_logs_action" NOT NULL,
  	"status" "enum_indexing_logs_status" NOT NULL,
  	"trigger_user_id" integer,
  	"raw_response" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "audit_logs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"operation" varchar NOT NULL,
  	"on_collection" varchar NOT NULL,
  	"document_id" varchar,
  	"user_id" integer NOT NULL,
  	"user_agent" varchar,
  	"hook" varchar,
  	"type" "enum_audit_logs_type" DEFAULT 'info' NOT NULL,
  	"created_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_jobs_log" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"executed_at" timestamp(3) with time zone NOT NULL,
  	"completed_at" timestamp(3) with time zone NOT NULL,
  	"task_slug" "enum_payload_jobs_log_task_slug" NOT NULL,
  	"task_i_d" varchar NOT NULL,
  	"input" jsonb,
  	"output" jsonb,
  	"state" "enum_payload_jobs_log_state" NOT NULL,
  	"error" jsonb
  );
  
  CREATE TABLE "payload_jobs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"input" jsonb,
  	"completed_at" timestamp(3) with time zone,
  	"total_tried" numeric DEFAULT 0,
  	"has_error" boolean DEFAULT false,
  	"error" jsonb,
  	"task_slug" "enum_payload_jobs_task_slug",
  	"queue" varchar DEFAULT 'default',
  	"wait_until" timestamp(3) with time zone,
  	"processing" boolean DEFAULT false,
  	"meta" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
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
  	"products_id" integer,
  	"product_series_id" integer,
  	"product_attributes_id" integer,
  	"product_templates_id" integer,
  	"product_reusable_blocks_id" integer,
  	"series_templates_id" integer,
  	"series_reusable_blocks_id" integer,
  	"hero_banner_items_id" integer,
  	"series_intro_items_id" integer,
  	"navigation_menus_id" integer,
  	"authors_id" integer,
  	"pages_id" integer,
  	"blogs_id" integer,
  	"blog_tags_id" integer,
  	"applications_id" integer,
  	"categories_id" integer,
  	"faq_items_id" integer,
  	"reusable_blocks_id" integer,
  	"document_templates_id" integer,
  	"template_categories_id" integer,
  	"custom_scripts_id" integer,
  	"seo_settings_id" integer,
  	"form_configs_id" integer,
  	"form_submissions_id" integer,
  	"smtp_configs_id" integer,
  	"indexing_logs_id" integer,
  	"audit_logs_id" integer
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
  	"form_config_id" integer,
  	"contact_info_group_contact_email" varchar,
  	"contact_info_group_after_sales_email" varchar,
  	"contact_info_group_whatsapp_number" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "footer_locales" (
  	"contact_info_group_contact_title" varchar,
  	"contact_info_group_contact_email_label" varchar,
  	"contact_info_group_after_sales_label" varchar,
  	"contact_info_group_whatsapp_label" varchar,
  	"contact_info_group_address_label" varchar,
  	"contact_info_group_address" varchar,
  	"contact_info_group_working_hours_label" varchar,
  	"contact_info_group_working_hours" varchar,
  	"official_notice_group_official_notice_title" varchar,
  	"official_notice_group_official_notice_line1" varchar,
  	"official_notice_group_official_notice_line2" varchar,
  	"official_notice_group_official_notice_line3" varchar,
  	"official_notice_group_official_notice_line4" varchar,
  	"copyright_text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "footer_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"navigation_menus_id" integer
  );
  
  CREATE TABLE "site_config" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"logo_id" integer,
  	"favicon_id" integer,
  	"turnstile_enabled" boolean DEFAULT false,
  	"turnstile_site_key" varchar,
  	"turnstile_secret_key" varchar,
  	"turnstile_threshold" numeric DEFAULT 2,
  	"cloudfront_distribution_id" varchar,
  	"frontend_url" varchar,
  	"revalidate_secret" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "site_config_locales" (
  	"site_name" varchar NOT NULL,
  	"site_tagline" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "contact_popup_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon_id" integer,
  	"link_type" "enum_contact_popup_options_link_type" DEFAULT 'url',
  	"link_url" varchar,
  	"open_in_new_tab" boolean DEFAULT true,
  	"sort_order" numeric DEFAULT 0
  );
  
  CREATE TABLE "contact_popup_options_locales" (
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "contact_popup" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"status" "enum_contact_popup_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "contact_popup_locales" (
  	"title" varchar DEFAULT 'Find the support that works for you',
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "preloader_config_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL,
  	"position_top" numeric DEFAULT 50,
  	"position_left" numeric DEFAULT 50,
  	"aspect_ratio" "enum_preloader_config_images_aspect_ratio" DEFAULT '9 / 6',
  	"width_scale" numeric DEFAULT 1
  );
  
  CREATE TABLE "preloader_config" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"background_color" varchar DEFAULT '#EBE6D8',
  	"text_color" varchar DEFAULT '#EBE6D8',
  	"highlight_color" varchar DEFAULT '#000000',
  	"image_wall_enabled" boolean DEFAULT true,
  	"loading_duration" numeric DEFAULT 2.5,
  	"logo_animation_duration" numeric DEFAULT 2,
  	"image_wall_duration" numeric DEFAULT 0.8,
  	"image_wall_stagger" numeric DEFAULT 0.2,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "social_config_social_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"platform" "enum_social_config_social_links_platform" NOT NULL,
  	"custom_name" varchar,
  	"url" varchar NOT NULL,
  	"icon_id" integer,
  	"order" numeric DEFAULT 0
  );
  
  CREATE TABLE "social_config" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "shop_page_config" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"show_all_tab" boolean DEFAULT true,
  	"page_size" numeric DEFAULT 24,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "shop_page_config_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"categories_id" integer
  );
  
  CREATE TABLE "knowledge_base_settings_toc_templates" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_knowledge_base_settings_toc_templates",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "knowledge_base_settings_share_config_templates" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_knowledge_base_settings_share_config_templates",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "knowledge_base_settings_share_config_networks" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" varchar,
  	"url" varchar
  );
  
  CREATE TABLE "knowledge_base_settings_search_box_templates" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_knowledge_base_settings_search_box_templates",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "knowledge_base_settings_category_list_templates" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_knowledge_base_settings_category_list_templates",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "knowledge_base_settings_recommended_posts_templates" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_knowledge_base_settings_recommended_posts_templates",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "knowledge_base_settings_follow_us_templates" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_knowledge_base_settings_follow_us_templates",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "knowledge_base_settings_follow_us_socials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" varchar,
  	"url" varchar
  );
  
  CREATE TABLE "knowledge_base_settings_bottom_categories_templates" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_knowledge_base_settings_bottom_categories_templates",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "knowledge_base_settings_pagination_templates" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_knowledge_base_settings_pagination_templates",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "knowledge_base_settings_bottom_recommended_templates" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_knowledge_base_settings_bottom_recommended_templates",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "knowledge_base_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"status" "enum_knowledge_base_settings_status" DEFAULT 'draft',
  	"featured_post_id" integer,
  	"show_all" boolean DEFAULT true,
  	"sections_data" jsonb,
  	"toc_enabled" boolean,
  	"share_config_enabled" boolean DEFAULT true,
  	"search_box_enabled" boolean,
  	"category_list_enabled" boolean,
  	"recommended_posts_enabled" boolean,
  	"follow_us_enabled" boolean,
  	"bottom_categories_enabled" boolean,
  	"pagination_enabled" boolean DEFAULT true,
  	"bottom_recommended_enabled" boolean,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "knowledge_base_settings_locales" (
  	"hero_title" varchar,
  	"nav_title" varchar,
  	"share_config_title" varchar,
  	"search_box_placeholder" varchar,
  	"category_list_title" varchar,
  	"recommended_posts_title" varchar,
  	"follow_us_title" varchar,
  	"bottom_recommended_title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "knowledge_base_settings_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"categories_id" integer,
  	"blogs_id" integer
  );
  
  CREATE TABLE "product_series_carousel" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"status" "enum_product_series_carousel_status" DEFAULT 'draft',
  	"items" jsonb,
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
  
  CREATE TABLE "service_features" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"status" "enum_service_features_status" DEFAULT 'draft',
  	"feature01_image1_id" integer,
  	"feature01_image1_crop_data" jsonb,
  	"feature01_image2_id" integer,
  	"feature01_image2_crop_data" jsonb,
  	"feature01_image3_id" integer,
  	"feature01_image3_crop_data" jsonb,
  	"feature01_image4_id" integer,
  	"feature01_image4_crop_data" jsonb,
  	"feature02_image1_id" integer,
  	"feature02_image1_crop_data" jsonb,
  	"feature02_image2_id" integer,
  	"feature02_image2_crop_data" jsonb,
  	"feature03_image1_id" integer,
  	"feature03_image1_crop_data" jsonb,
  	"feature03_image2_id" integer,
  	"feature03_image2_crop_data" jsonb,
  	"feature03_image3_id" integer,
  	"feature03_image3_crop_data" jsonb,
  	"feature03_image4_id" integer,
  	"feature03_image4_crop_data" jsonb,
  	"feature03_image5_id" integer,
  	"feature03_image5_crop_data" jsonb,
  	"feature03_image6_id" integer,
  	"feature03_image6_crop_data" jsonb,
  	"feature04_image1_id" integer,
  	"feature04_image1_crop_data" jsonb,
  	"feature04_image2_id" integer,
  	"feature04_image2_crop_data" jsonb,
  	"feature05_image1_id" integer,
  	"feature05_image1_crop_data" jsonb,
  	"feature05_image2_id" integer,
  	"feature05_image2_crop_data" jsonb,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "service_features_locales" (
  	"title" varchar,
  	"subtitle" varchar,
  	"feature01_title" varchar,
  	"feature01_short_title" varchar,
  	"feature01_description" varchar,
  	"feature02_title" varchar,
  	"feature02_short_title" varchar,
  	"feature02_description" varchar,
  	"feature03_title" varchar,
  	"feature03_short_title" varchar,
  	"feature03_description" varchar,
  	"feature04_title" varchar,
  	"feature04_short_title" varchar,
  	"feature04_description" varchar,
  	"feature05_title" varchar,
  	"feature05_short_title" varchar,
  	"feature05_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "sphere_3d" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"status" "enum_sphere_3d_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "sphere_3d_locales" (
  	"title" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "simple_cta" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"status" "enum_simple_cta_status" DEFAULT 'draft',
  	"cta_link" varchar,
  	"image1_id" integer,
  	"image2_id" integer,
  	"image3_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "simple_cta_locales" (
  	"title" varchar,
  	"subtitle" varchar,
  	"description" varchar,
  	"cta_text" varchar,
  	"marquee_content" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "featured_products" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"status" "enum_featured_products_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "featured_products_locales" (
  	"title" varchar,
  	"description" varchar,
  	"view_all_button_text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "featured_products_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"product_series_id" integer
  );
  
  CREATE TABLE "brand_advantages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"status" "enum_brand_advantages_status" DEFAULT 'draft',
  	"image_id" integer,
  	"advantage01_icon" varchar DEFAULT 'lucide:sparkles',
  	"advantage02_icon" varchar DEFAULT 'lucide:sparkles',
  	"advantage03_icon" varchar DEFAULT 'lucide:sparkles',
  	"advantage04_icon" varchar DEFAULT 'lucide:sparkles',
  	"advantage05_icon" varchar DEFAULT 'lucide:sparkles',
  	"advantage06_icon" varchar DEFAULT 'lucide:sparkles',
  	"advantage07_icon" varchar DEFAULT 'lucide:sparkles',
  	"advantage08_icon" varchar DEFAULT 'lucide:sparkles',
  	"advantage09_icon" varchar DEFAULT 'lucide:sparkles',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "brand_advantages_locales" (
  	"advantage01_text" varchar,
  	"advantage02_text" varchar,
  	"advantage03_text" varchar,
  	"advantage04_text" varchar,
  	"advantage05_text" varchar,
  	"advantage06_text" varchar,
  	"advantage07_text" varchar,
  	"advantage08_text" varchar,
  	"advantage09_text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "oem_odm" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"status" "enum_oem_odm_status" DEFAULT 'draft',
  	"oem_bg_image_id" integer,
  	"oem_image_id" integer,
  	"odm_bg_image_id" integer,
  	"odm_image_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "oem_odm_locales" (
  	"oem_title" varchar,
  	"oem_description1" varchar,
  	"oem_description2" varchar,
  	"odm_title" varchar,
  	"odm_description1" varchar,
  	"odm_description2" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "quote_steps" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"status" "enum_quote_steps_status" DEFAULT 'draft',
  	"step01_image_id" integer,
  	"step02_image_id" integer,
  	"step03_image_id" integer,
  	"step04_image_id" integer,
  	"step05_image_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "quote_steps_locales" (
  	"header_title" varchar,
  	"header_title2" varchar,
  	"header_subtitle" varchar,
  	"header_description" varchar,
  	"step01_text" varchar,
  	"step02_text" varchar,
  	"step03_text" varchar,
  	"step04_text" varchar,
  	"step05_text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "main_form" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"status" "enum_main_form_status" DEFAULT 'draft',
  	"form_config_id" integer,
  	"image1_id" integer,
  	"image2_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "main_form_locales" (
  	"design_text_left" varchar,
  	"design_text_right" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "why_choose_busrom" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"status" "enum_why_choose_busrom_status" DEFAULT 'draft',
  	"view_more_button_url" varchar,
  	"reason01_icon" varchar,
  	"reason01_image_id" integer,
  	"reason02_icon" varchar,
  	"reason02_image_id" integer,
  	"reason03_icon" varchar,
  	"reason03_image_id" integer,
  	"reason04_icon" varchar,
  	"reason04_image_id" integer,
  	"reason05_icon" varchar,
  	"reason05_image_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "why_choose_busrom_locales" (
  	"title" varchar,
  	"title2" varchar,
  	"view_more_button_text" varchar,
  	"reason01_title" varchar,
  	"reason01_description" varchar,
  	"reason02_title" varchar,
  	"reason02_description" varchar,
  	"reason03_title" varchar,
  	"reason03_description" varchar,
  	"reason04_title" varchar,
  	"reason04_description" varchar,
  	"reason05_title" varchar,
  	"reason05_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "case_studies" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"status" "enum_case_studies_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "case_studies_locales" (
  	"title" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "case_studies_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"applications_id" integer
  );
  
  CREATE TABLE "brand_analysis" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"status" "enum_brand_analysis_status" DEFAULT 'draft',
  	"brand_center_background_image_id" integer,
  	"brand_center_large_image_id" integer,
  	"brand_center_small_image_id" integer,
  	"project_center_background_image_id" integer,
  	"project_center_large_image_id" integer,
  	"project_center_small_image_id" integer,
  	"service_center_background_image_id" integer,
  	"service_center_large_image_id" integer,
  	"service_center_small_image_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "brand_analysis_locales" (
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
  
  CREATE TABLE "brand_value" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"status" "enum_brand_value_status" DEFAULT 'draft',
  	"param1_image_id" integer,
  	"param2_image_id" integer,
  	"slogan_image_id" integer,
  	"value_image_id" integer,
  	"vision_image_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "brand_value_locales" (
  	"title" varchar,
  	"subtitle" varchar,
  	"param1_title" varchar,
  	"param1_description" varchar,
  	"param2_title" varchar,
  	"param2_description" varchar,
  	"slogan_title" varchar,
  	"slogan_description" varchar,
  	"value_title" varchar,
  	"value_description" varchar,
  	"vision_title" varchar,
  	"vision_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
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
  
  CREATE TABLE "system_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"admin_banner_type" "enum_system_settings_admin_banner_type" DEFAULT 'info',
  	"show_banner" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "system_settings_locales" (
  	"admin_banner_text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload_jobs_stats" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"stats" jsonb,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "users_quick_actions" ADD CONSTRAINT "users_quick_actions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
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
  ALTER TABLE "permissions_locales" ADD CONSTRAINT "permissions_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."permissions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_series_id_product_series_id_fk" FOREIGN KEY ("series_id") REFERENCES "public"."product_series"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_attribute_page_id_product_attributes_id_fk" FOREIGN KEY ("attribute_page_id") REFERENCES "public"."product_attributes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_content_template_id_product_templates_id_fk" FOREIGN KEY ("content_template_id") REFERENCES "public"."product_templates"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_linked_form_id_form_configs_id_fk" FOREIGN KEY ("linked_form_id") REFERENCES "public"."form_configs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_show_image_id_media_id_fk" FOREIGN KEY ("show_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_locales" ADD CONSTRAINT "products_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "product_series" ADD CONSTRAINT "product_series_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "product_series" ADD CONSTRAINT "product_series_series_template_id_series_templates_id_fk" FOREIGN KEY ("series_template_id") REFERENCES "public"."series_templates"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "product_series" ADD CONSTRAINT "product_series_featured_image_id_media_id_fk" FOREIGN KEY ("featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "product_series" ADD CONSTRAINT "product_series_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "product_series_locales" ADD CONSTRAINT "product_series_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."product_series"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "product_attributes" ADD CONSTRAINT "product_attributes_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "product_attributes" ADD CONSTRAINT "product_attributes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "product_attributes_locales" ADD CONSTRAINT "product_attributes_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."product_attributes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "product_templates" ADD CONSTRAINT "product_templates_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "product_templates" ADD CONSTRAINT "product_templates_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "product_templates_locales" ADD CONSTRAINT "product_templates_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."product_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "product_reusable_blocks" ADD CONSTRAINT "product_reusable_blocks_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "product_reusable_blocks" ADD CONSTRAINT "product_reusable_blocks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "product_reusable_blocks_locales" ADD CONSTRAINT "product_reusable_blocks_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."product_reusable_blocks"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "series_templates" ADD CONSTRAINT "series_templates_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "series_templates" ADD CONSTRAINT "series_templates_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "series_templates_locales" ADD CONSTRAINT "series_templates_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."series_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "series_reusable_blocks" ADD CONSTRAINT "series_reusable_blocks_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "series_reusable_blocks" ADD CONSTRAINT "series_reusable_blocks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "series_reusable_blocks_locales" ADD CONSTRAINT "series_reusable_blocks_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."series_reusable_blocks"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hero_banner_items" ADD CONSTRAINT "hero_banner_items_image1_id_media_id_fk" FOREIGN KEY ("image1_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "hero_banner_items" ADD CONSTRAINT "hero_banner_items_image2_id_media_id_fk" FOREIGN KEY ("image2_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "hero_banner_items" ADD CONSTRAINT "hero_banner_items_image3_id_media_id_fk" FOREIGN KEY ("image3_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "hero_banner_items" ADD CONSTRAINT "hero_banner_items_image4_id_media_id_fk" FOREIGN KEY ("image4_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "hero_banner_items" ADD CONSTRAINT "hero_banner_items_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "hero_banner_items_locales" ADD CONSTRAINT "hero_banner_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."hero_banner_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "series_intro_items" ADD CONSTRAINT "series_intro_items_product_series_id_product_series_id_fk" FOREIGN KEY ("product_series_id") REFERENCES "public"."product_series"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "series_intro_items" ADD CONSTRAINT "series_intro_items_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "series_intro_items_locales" ADD CONSTRAINT "series_intro_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."series_intro_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_menus" ADD CONSTRAINT "navigation_menus_parent_id_navigation_menus_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."navigation_menus"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_menus" ADD CONSTRAINT "navigation_menus_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_menus_locales" ADD CONSTRAINT "navigation_menus_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation_menus"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_menus_rels" ADD CONSTRAINT "navigation_menus_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."navigation_menus"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_menus_rels" ADD CONSTRAINT "navigation_menus_rels_media_tags_fk" FOREIGN KEY ("media_tags_id") REFERENCES "public"."media_tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "authors_social_links" ADD CONSTRAINT "authors_social_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."authors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "authors" ADD CONSTRAINT "authors_avatar_id_media_id_fk" FOREIGN KEY ("avatar_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_locales" ADD CONSTRAINT "pages_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_media_tags_fk" FOREIGN KEY ("media_tags_id") REFERENCES "public"."media_tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "blogs_kb_share_networks" ADD CONSTRAINT "blogs_kb_share_networks_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."blogs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "blogs_kb_follow_us_socials" ADD CONSTRAINT "blogs_kb_follow_us_socials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."blogs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "blogs" ADD CONSTRAINT "blogs_author_id_authors_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."authors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "blogs" ADD CONSTRAINT "blogs_cover_image_id_media_id_fk" FOREIGN KEY ("cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "blogs" ADD CONSTRAINT "blogs_kb_pagination_prev_post_id_blogs_id_fk" FOREIGN KEY ("kb_pagination_prev_post_id") REFERENCES "public"."blogs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "blogs" ADD CONSTRAINT "blogs_kb_pagination_next_post_id_blogs_id_fk" FOREIGN KEY ("kb_pagination_next_post_id") REFERENCES "public"."blogs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "blogs" ADD CONSTRAINT "blogs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "blogs_locales" ADD CONSTRAINT "blogs_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."blogs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "blogs_rels" ADD CONSTRAINT "blogs_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."blogs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "blogs_rels" ADD CONSTRAINT "blogs_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "blogs_rels" ADD CONSTRAINT "blogs_rels_blog_tags_fk" FOREIGN KEY ("blog_tags_id") REFERENCES "public"."blog_tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "blogs_rels" ADD CONSTRAINT "blogs_rels_blogs_fk" FOREIGN KEY ("blogs_id") REFERENCES "public"."blogs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "blog_tags" ADD CONSTRAINT "blog_tags_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "blog_tags_locales" ADD CONSTRAINT "blog_tags_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."blog_tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "applications_scene_gallery" ADD CONSTRAINT "applications_scene_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "applications_scene_gallery_locales" ADD CONSTRAINT "applications_scene_gallery_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."applications_scene_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "applications" ADD CONSTRAINT "applications_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "applications_locales" ADD CONSTRAINT "applications_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "applications_rels" ADD CONSTRAINT "applications_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "applications_rels" ADD CONSTRAINT "applications_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "categories_breadcrumbs" ADD CONSTRAINT "categories_breadcrumbs_doc_id_categories_id_fk" FOREIGN KEY ("doc_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "categories_breadcrumbs" ADD CONSTRAINT "categories_breadcrumbs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "categories" ADD CONSTRAINT "categories_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "categories_locales" ADD CONSTRAINT "categories_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "categories_rels" ADD CONSTRAINT "categories_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "categories_rels" ADD CONSTRAINT "categories_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "faq_items" ADD CONSTRAINT "faq_items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "faq_items" ADD CONSTRAINT "faq_items_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "faq_items_locales" ADD CONSTRAINT "faq_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."faq_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "faq_items_rels" ADD CONSTRAINT "faq_items_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."faq_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "faq_items_rels" ADD CONSTRAINT "faq_items_rels_faq_items_fk" FOREIGN KEY ("faq_items_id") REFERENCES "public"."faq_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "reusable_blocks" ADD CONSTRAINT "reusable_blocks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "reusable_blocks_locales" ADD CONSTRAINT "reusable_blocks_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."reusable_blocks"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "document_templates" ADD CONSTRAINT "document_templates_category_id_template_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."template_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "document_templates" ADD CONSTRAINT "document_templates_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "document_templates_locales" ADD CONSTRAINT "document_templates_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."document_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "template_categories_locales" ADD CONSTRAINT "template_categories_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."template_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "custom_scripts" ADD CONSTRAINT "custom_scripts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "seo_settings" ADD CONSTRAINT "seo_settings_og_image_id_media_id_fk" FOREIGN KEY ("og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "seo_settings" ADD CONSTRAINT "seo_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "seo_settings_locales" ADD CONSTRAINT "seo_settings_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."seo_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "form_configs_fields_options" ADD CONSTRAINT "form_configs_fields_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."form_configs_fields"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "form_configs_fields_options_locales" ADD CONSTRAINT "form_configs_fields_options_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."form_configs_fields_options"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "form_configs_fields" ADD CONSTRAINT "form_configs_fields_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."form_configs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "form_configs_fields_locales" ADD CONSTRAINT "form_configs_fields_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."form_configs_fields"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "form_configs_locales" ADD CONSTRAINT "form_configs_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."form_configs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "form_configs_rels" ADD CONSTRAINT "form_configs_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."form_configs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "form_configs_rels" ADD CONSTRAINT "form_configs_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "form_submissions" ADD CONSTRAINT "form_submissions_form_config_id_form_configs_id_fk" FOREIGN KEY ("form_config_id") REFERENCES "public"."form_configs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "form_submissions" ADD CONSTRAINT "form_submissions_assigned_to_id_users_id_fk" FOREIGN KEY ("assigned_to_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "smtp_configs_locales" ADD CONSTRAINT "smtp_configs_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."smtp_configs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "smtp_configs_rels" ADD CONSTRAINT "smtp_configs_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."smtp_configs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "smtp_configs_rels" ADD CONSTRAINT "smtp_configs_rels_form_configs_fk" FOREIGN KEY ("form_configs_id") REFERENCES "public"."form_configs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "indexing_logs" ADD CONSTRAINT "indexing_logs_trigger_user_id_users_id_fk" FOREIGN KEY ("trigger_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_jobs_log" ADD CONSTRAINT "payload_jobs_log_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."payload_jobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_categories_fk" FOREIGN KEY ("media_categories_id") REFERENCES "public"."media_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_tags_fk" FOREIGN KEY ("media_tags_id") REFERENCES "public"."media_tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_roles_fk" FOREIGN KEY ("roles_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_permissions_fk" FOREIGN KEY ("permissions_id") REFERENCES "public"."permissions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_product_series_fk" FOREIGN KEY ("product_series_id") REFERENCES "public"."product_series"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_product_attributes_fk" FOREIGN KEY ("product_attributes_id") REFERENCES "public"."product_attributes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_product_templates_fk" FOREIGN KEY ("product_templates_id") REFERENCES "public"."product_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_product_reusable_blocks_fk" FOREIGN KEY ("product_reusable_blocks_id") REFERENCES "public"."product_reusable_blocks"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_series_templates_fk" FOREIGN KEY ("series_templates_id") REFERENCES "public"."series_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_series_reusable_blocks_fk" FOREIGN KEY ("series_reusable_blocks_id") REFERENCES "public"."series_reusable_blocks"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_hero_banner_items_fk" FOREIGN KEY ("hero_banner_items_id") REFERENCES "public"."hero_banner_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_series_intro_items_fk" FOREIGN KEY ("series_intro_items_id") REFERENCES "public"."series_intro_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_navigation_menus_fk" FOREIGN KEY ("navigation_menus_id") REFERENCES "public"."navigation_menus"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_authors_fk" FOREIGN KEY ("authors_id") REFERENCES "public"."authors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_blogs_fk" FOREIGN KEY ("blogs_id") REFERENCES "public"."blogs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_blog_tags_fk" FOREIGN KEY ("blog_tags_id") REFERENCES "public"."blog_tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_applications_fk" FOREIGN KEY ("applications_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_faq_items_fk" FOREIGN KEY ("faq_items_id") REFERENCES "public"."faq_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_reusable_blocks_fk" FOREIGN KEY ("reusable_blocks_id") REFERENCES "public"."reusable_blocks"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_document_templates_fk" FOREIGN KEY ("document_templates_id") REFERENCES "public"."document_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_template_categories_fk" FOREIGN KEY ("template_categories_id") REFERENCES "public"."template_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_custom_scripts_fk" FOREIGN KEY ("custom_scripts_id") REFERENCES "public"."custom_scripts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_seo_settings_fk" FOREIGN KEY ("seo_settings_id") REFERENCES "public"."seo_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_form_configs_fk" FOREIGN KEY ("form_configs_id") REFERENCES "public"."form_configs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_form_submissions_fk" FOREIGN KEY ("form_submissions_id") REFERENCES "public"."form_submissions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_smtp_configs_fk" FOREIGN KEY ("smtp_configs_id") REFERENCES "public"."smtp_configs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_indexing_logs_fk" FOREIGN KEY ("indexing_logs_id") REFERENCES "public"."indexing_logs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_audit_logs_fk" FOREIGN KEY ("audit_logs_id") REFERENCES "public"."audit_logs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_content_sections" ADD CONSTRAINT "home_content_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_legal_links" ADD CONSTRAINT "footer_legal_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_legal_links_locales" ADD CONSTRAINT "footer_legal_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer_legal_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer" ADD CONSTRAINT "footer_form_config_id_form_configs_id_fk" FOREIGN KEY ("form_config_id") REFERENCES "public"."form_configs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "footer_locales" ADD CONSTRAINT "footer_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_rels" ADD CONSTRAINT "footer_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_rels" ADD CONSTRAINT "footer_rels_navigation_menus_fk" FOREIGN KEY ("navigation_menus_id") REFERENCES "public"."navigation_menus"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_config" ADD CONSTRAINT "site_config_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_config" ADD CONSTRAINT "site_config_favicon_id_media_id_fk" FOREIGN KEY ("favicon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_config_locales" ADD CONSTRAINT "site_config_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_config"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contact_popup_options" ADD CONSTRAINT "contact_popup_options_icon_id_media_id_fk" FOREIGN KEY ("icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "contact_popup_options" ADD CONSTRAINT "contact_popup_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contact_popup"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contact_popup_options_locales" ADD CONSTRAINT "contact_popup_options_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contact_popup_options"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contact_popup_locales" ADD CONSTRAINT "contact_popup_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contact_popup"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "preloader_config_images" ADD CONSTRAINT "preloader_config_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "preloader_config_images" ADD CONSTRAINT "preloader_config_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."preloader_config"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "social_config_social_links" ADD CONSTRAINT "social_config_social_links_icon_id_media_id_fk" FOREIGN KEY ("icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "social_config_social_links" ADD CONSTRAINT "social_config_social_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."social_config"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "shop_page_config_rels" ADD CONSTRAINT "shop_page_config_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."shop_page_config"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "shop_page_config_rels" ADD CONSTRAINT "shop_page_config_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "knowledge_base_settings_toc_templates" ADD CONSTRAINT "knowledge_base_settings_toc_templates_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."knowledge_base_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "knowledge_base_settings_share_config_templates" ADD CONSTRAINT "knowledge_base_settings_share_config_templates_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."knowledge_base_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "knowledge_base_settings_share_config_networks" ADD CONSTRAINT "knowledge_base_settings_share_config_networks_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."knowledge_base_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "knowledge_base_settings_search_box_templates" ADD CONSTRAINT "knowledge_base_settings_search_box_templates_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."knowledge_base_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "knowledge_base_settings_category_list_templates" ADD CONSTRAINT "knowledge_base_settings_category_list_templates_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."knowledge_base_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "knowledge_base_settings_recommended_posts_templates" ADD CONSTRAINT "knowledge_base_settings_recommended_posts_templates_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."knowledge_base_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "knowledge_base_settings_follow_us_templates" ADD CONSTRAINT "knowledge_base_settings_follow_us_templates_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."knowledge_base_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "knowledge_base_settings_follow_us_socials" ADD CONSTRAINT "knowledge_base_settings_follow_us_socials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."knowledge_base_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "knowledge_base_settings_bottom_categories_templates" ADD CONSTRAINT "knowledge_base_settings_bottom_categories_templates_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."knowledge_base_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "knowledge_base_settings_pagination_templates" ADD CONSTRAINT "knowledge_base_settings_pagination_templates_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."knowledge_base_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "knowledge_base_settings_bottom_recommended_templates" ADD CONSTRAINT "knowledge_base_settings_bottom_recommended_templates_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."knowledge_base_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "knowledge_base_settings" ADD CONSTRAINT "knowledge_base_settings_featured_post_id_blogs_id_fk" FOREIGN KEY ("featured_post_id") REFERENCES "public"."blogs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "knowledge_base_settings_locales" ADD CONSTRAINT "knowledge_base_settings_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."knowledge_base_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "knowledge_base_settings_rels" ADD CONSTRAINT "knowledge_base_settings_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."knowledge_base_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "knowledge_base_settings_rels" ADD CONSTRAINT "knowledge_base_settings_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "knowledge_base_settings_rels" ADD CONSTRAINT "knowledge_base_settings_rels_blogs_fk" FOREIGN KEY ("blogs_id") REFERENCES "public"."blogs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "product_series_carousel_locales" ADD CONSTRAINT "product_series_carousel_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."product_series_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "service_features" ADD CONSTRAINT "service_features_feature01_image1_id_media_id_fk" FOREIGN KEY ("feature01_image1_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "service_features" ADD CONSTRAINT "service_features_feature01_image2_id_media_id_fk" FOREIGN KEY ("feature01_image2_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "service_features" ADD CONSTRAINT "service_features_feature01_image3_id_media_id_fk" FOREIGN KEY ("feature01_image3_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "service_features" ADD CONSTRAINT "service_features_feature01_image4_id_media_id_fk" FOREIGN KEY ("feature01_image4_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "service_features" ADD CONSTRAINT "service_features_feature02_image1_id_media_id_fk" FOREIGN KEY ("feature02_image1_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "service_features" ADD CONSTRAINT "service_features_feature02_image2_id_media_id_fk" FOREIGN KEY ("feature02_image2_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "service_features" ADD CONSTRAINT "service_features_feature03_image1_id_media_id_fk" FOREIGN KEY ("feature03_image1_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "service_features" ADD CONSTRAINT "service_features_feature03_image2_id_media_id_fk" FOREIGN KEY ("feature03_image2_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "service_features" ADD CONSTRAINT "service_features_feature03_image3_id_media_id_fk" FOREIGN KEY ("feature03_image3_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "service_features" ADD CONSTRAINT "service_features_feature03_image4_id_media_id_fk" FOREIGN KEY ("feature03_image4_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "service_features" ADD CONSTRAINT "service_features_feature03_image5_id_media_id_fk" FOREIGN KEY ("feature03_image5_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "service_features" ADD CONSTRAINT "service_features_feature03_image6_id_media_id_fk" FOREIGN KEY ("feature03_image6_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "service_features" ADD CONSTRAINT "service_features_feature04_image1_id_media_id_fk" FOREIGN KEY ("feature04_image1_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "service_features" ADD CONSTRAINT "service_features_feature04_image2_id_media_id_fk" FOREIGN KEY ("feature04_image2_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "service_features" ADD CONSTRAINT "service_features_feature05_image1_id_media_id_fk" FOREIGN KEY ("feature05_image1_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "service_features" ADD CONSTRAINT "service_features_feature05_image2_id_media_id_fk" FOREIGN KEY ("feature05_image2_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "service_features_locales" ADD CONSTRAINT "service_features_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."service_features"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sphere_3d_locales" ADD CONSTRAINT "sphere_3d_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sphere_3d"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "simple_cta" ADD CONSTRAINT "simple_cta_image1_id_media_id_fk" FOREIGN KEY ("image1_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "simple_cta" ADD CONSTRAINT "simple_cta_image2_id_media_id_fk" FOREIGN KEY ("image2_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "simple_cta" ADD CONSTRAINT "simple_cta_image3_id_media_id_fk" FOREIGN KEY ("image3_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "simple_cta_locales" ADD CONSTRAINT "simple_cta_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."simple_cta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "featured_products_locales" ADD CONSTRAINT "featured_products_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."featured_products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "featured_products_rels" ADD CONSTRAINT "featured_products_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."featured_products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "featured_products_rels" ADD CONSTRAINT "featured_products_rels_product_series_fk" FOREIGN KEY ("product_series_id") REFERENCES "public"."product_series"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "brand_advantages" ADD CONSTRAINT "brand_advantages_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "brand_advantages_locales" ADD CONSTRAINT "brand_advantages_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."brand_advantages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "oem_odm" ADD CONSTRAINT "oem_odm_oem_bg_image_id_media_id_fk" FOREIGN KEY ("oem_bg_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "oem_odm" ADD CONSTRAINT "oem_odm_oem_image_id_media_id_fk" FOREIGN KEY ("oem_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "oem_odm" ADD CONSTRAINT "oem_odm_odm_bg_image_id_media_id_fk" FOREIGN KEY ("odm_bg_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "oem_odm" ADD CONSTRAINT "oem_odm_odm_image_id_media_id_fk" FOREIGN KEY ("odm_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "oem_odm_locales" ADD CONSTRAINT "oem_odm_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."oem_odm"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "quote_steps" ADD CONSTRAINT "quote_steps_step01_image_id_media_id_fk" FOREIGN KEY ("step01_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "quote_steps" ADD CONSTRAINT "quote_steps_step02_image_id_media_id_fk" FOREIGN KEY ("step02_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "quote_steps" ADD CONSTRAINT "quote_steps_step03_image_id_media_id_fk" FOREIGN KEY ("step03_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "quote_steps" ADD CONSTRAINT "quote_steps_step04_image_id_media_id_fk" FOREIGN KEY ("step04_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "quote_steps" ADD CONSTRAINT "quote_steps_step05_image_id_media_id_fk" FOREIGN KEY ("step05_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "quote_steps_locales" ADD CONSTRAINT "quote_steps_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."quote_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "main_form" ADD CONSTRAINT "main_form_form_config_id_form_configs_id_fk" FOREIGN KEY ("form_config_id") REFERENCES "public"."form_configs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "main_form" ADD CONSTRAINT "main_form_image1_id_media_id_fk" FOREIGN KEY ("image1_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "main_form" ADD CONSTRAINT "main_form_image2_id_media_id_fk" FOREIGN KEY ("image2_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "main_form_locales" ADD CONSTRAINT "main_form_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."main_form"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "why_choose_busrom" ADD CONSTRAINT "why_choose_busrom_reason01_image_id_media_id_fk" FOREIGN KEY ("reason01_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "why_choose_busrom" ADD CONSTRAINT "why_choose_busrom_reason02_image_id_media_id_fk" FOREIGN KEY ("reason02_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "why_choose_busrom" ADD CONSTRAINT "why_choose_busrom_reason03_image_id_media_id_fk" FOREIGN KEY ("reason03_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "why_choose_busrom" ADD CONSTRAINT "why_choose_busrom_reason04_image_id_media_id_fk" FOREIGN KEY ("reason04_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "why_choose_busrom" ADD CONSTRAINT "why_choose_busrom_reason05_image_id_media_id_fk" FOREIGN KEY ("reason05_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "why_choose_busrom_locales" ADD CONSTRAINT "why_choose_busrom_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."why_choose_busrom"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "case_studies_locales" ADD CONSTRAINT "case_studies_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."case_studies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "case_studies_rels" ADD CONSTRAINT "case_studies_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."case_studies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "case_studies_rels" ADD CONSTRAINT "case_studies_rels_applications_fk" FOREIGN KEY ("applications_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "brand_analysis" ADD CONSTRAINT "brand_analysis_brand_center_background_image_id_media_id_fk" FOREIGN KEY ("brand_center_background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "brand_analysis" ADD CONSTRAINT "brand_analysis_brand_center_large_image_id_media_id_fk" FOREIGN KEY ("brand_center_large_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "brand_analysis" ADD CONSTRAINT "brand_analysis_brand_center_small_image_id_media_id_fk" FOREIGN KEY ("brand_center_small_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "brand_analysis" ADD CONSTRAINT "brand_analysis_project_center_background_image_id_media_id_fk" FOREIGN KEY ("project_center_background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "brand_analysis" ADD CONSTRAINT "brand_analysis_project_center_large_image_id_media_id_fk" FOREIGN KEY ("project_center_large_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "brand_analysis" ADD CONSTRAINT "brand_analysis_project_center_small_image_id_media_id_fk" FOREIGN KEY ("project_center_small_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "brand_analysis" ADD CONSTRAINT "brand_analysis_service_center_background_image_id_media_id_fk" FOREIGN KEY ("service_center_background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "brand_analysis" ADD CONSTRAINT "brand_analysis_service_center_large_image_id_media_id_fk" FOREIGN KEY ("service_center_large_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "brand_analysis" ADD CONSTRAINT "brand_analysis_service_center_small_image_id_media_id_fk" FOREIGN KEY ("service_center_small_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "brand_analysis_locales" ADD CONSTRAINT "brand_analysis_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."brand_analysis"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "brand_value" ADD CONSTRAINT "brand_value_param1_image_id_media_id_fk" FOREIGN KEY ("param1_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "brand_value" ADD CONSTRAINT "brand_value_param2_image_id_media_id_fk" FOREIGN KEY ("param2_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "brand_value" ADD CONSTRAINT "brand_value_slogan_image_id_media_id_fk" FOREIGN KEY ("slogan_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "brand_value" ADD CONSTRAINT "brand_value_value_image_id_media_id_fk" FOREIGN KEY ("value_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "brand_value" ADD CONSTRAINT "brand_value_vision_image_id_media_id_fk" FOREIGN KEY ("vision_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "brand_value_locales" ADD CONSTRAINT "brand_value_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."brand_value"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "system_settings_locales" ADD CONSTRAINT "system_settings_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."system_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_quick_actions_order_idx" ON "users_quick_actions" USING btree ("_order");
  CREATE INDEX "users_quick_actions_parent_id_idx" ON "users_quick_actions" USING btree ("_parent_id");
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
  CREATE UNIQUE INDEX "permissions_locales_locale_parent_id_unique" ON "permissions_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "products_sku_idx" ON "products" USING btree ("sku");
  CREATE UNIQUE INDEX "products_slug_idx" ON "products" USING btree ("slug");
  CREATE INDEX "products_series_idx" ON "products" USING btree ("series_id");
  CREATE INDEX "products_category_idx" ON "products" USING btree ("category_id");
  CREATE INDEX "products_attribute_page_idx" ON "products" USING btree ("attribute_page_id");
  CREATE INDEX "products_content_template_idx" ON "products" USING btree ("content_template_id");
  CREATE INDEX "products_linked_form_idx" ON "products" USING btree ("linked_form_id");
  CREATE INDEX "products_show_image_idx" ON "products" USING btree ("show_image_id");
  CREATE INDEX "products_user_idx" ON "products" USING btree ("user_id");
  CREATE INDEX "products_updated_at_idx" ON "products" USING btree ("updated_at");
  CREATE INDEX "products_created_at_idx" ON "products" USING btree ("created_at");
  CREATE UNIQUE INDEX "products_locales_locale_parent_id_unique" ON "products_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "products_rels_order_idx" ON "products_rels" USING btree ("order");
  CREATE INDEX "products_rels_parent_idx" ON "products_rels" USING btree ("parent_id");
  CREATE INDEX "products_rels_path_idx" ON "products_rels" USING btree ("path");
  CREATE INDEX "products_rels_media_id_idx" ON "products_rels" USING btree ("media_id");
  CREATE UNIQUE INDEX "product_series_slug_idx" ON "product_series" USING btree ("slug");
  CREATE INDEX "product_series_category_idx" ON "product_series" USING btree ("category_id");
  CREATE INDEX "product_series_series_template_idx" ON "product_series" USING btree ("series_template_id");
  CREATE INDEX "product_series_featured_image_idx" ON "product_series" USING btree ("featured_image_id");
  CREATE INDEX "product_series_user_idx" ON "product_series" USING btree ("user_id");
  CREATE INDEX "product_series_updated_at_idx" ON "product_series" USING btree ("updated_at");
  CREATE INDEX "product_series_created_at_idx" ON "product_series" USING btree ("created_at");
  CREATE UNIQUE INDEX "product_series_locales_locale_parent_id_unique" ON "product_series_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "product_attributes_category_idx" ON "product_attributes" USING btree ("category_id");
  CREATE INDEX "product_attributes_user_idx" ON "product_attributes" USING btree ("user_id");
  CREATE INDEX "product_attributes_updated_at_idx" ON "product_attributes" USING btree ("updated_at");
  CREATE INDEX "product_attributes_created_at_idx" ON "product_attributes" USING btree ("created_at");
  CREATE UNIQUE INDEX "product_attributes_locales_locale_parent_id_unique" ON "product_attributes_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "product_templates_category_idx" ON "product_templates" USING btree ("category_id");
  CREATE INDEX "product_templates_user_idx" ON "product_templates" USING btree ("user_id");
  CREATE INDEX "product_templates_updated_at_idx" ON "product_templates" USING btree ("updated_at");
  CREATE INDEX "product_templates_created_at_idx" ON "product_templates" USING btree ("created_at");
  CREATE UNIQUE INDEX "product_templates_locales_locale_parent_id_unique" ON "product_templates_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "product_reusable_blocks_slug_idx" ON "product_reusable_blocks" USING btree ("slug");
  CREATE INDEX "product_reusable_blocks_category_idx" ON "product_reusable_blocks" USING btree ("category_id");
  CREATE INDEX "product_reusable_blocks_user_idx" ON "product_reusable_blocks" USING btree ("user_id");
  CREATE INDEX "product_reusable_blocks_updated_at_idx" ON "product_reusable_blocks" USING btree ("updated_at");
  CREATE INDEX "product_reusable_blocks_created_at_idx" ON "product_reusable_blocks" USING btree ("created_at");
  CREATE UNIQUE INDEX "product_reusable_blocks_locales_locale_parent_id_unique" ON "product_reusable_blocks_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "series_templates_category_idx" ON "series_templates" USING btree ("category_id");
  CREATE INDEX "series_templates_user_idx" ON "series_templates" USING btree ("user_id");
  CREATE INDEX "series_templates_updated_at_idx" ON "series_templates" USING btree ("updated_at");
  CREATE INDEX "series_templates_created_at_idx" ON "series_templates" USING btree ("created_at");
  CREATE UNIQUE INDEX "series_templates_locales_locale_parent_id_unique" ON "series_templates_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "series_reusable_blocks_slug_idx" ON "series_reusable_blocks" USING btree ("slug");
  CREATE INDEX "series_reusable_blocks_category_idx" ON "series_reusable_blocks" USING btree ("category_id");
  CREATE INDEX "series_reusable_blocks_user_idx" ON "series_reusable_blocks" USING btree ("user_id");
  CREATE INDEX "series_reusable_blocks_updated_at_idx" ON "series_reusable_blocks" USING btree ("updated_at");
  CREATE INDEX "series_reusable_blocks_created_at_idx" ON "series_reusable_blocks" USING btree ("created_at");
  CREATE UNIQUE INDEX "series_reusable_blocks_locales_locale_parent_id_unique" ON "series_reusable_blocks_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "hero_banner_items_image1_idx" ON "hero_banner_items" USING btree ("image1_id");
  CREATE INDEX "hero_banner_items_image2_idx" ON "hero_banner_items" USING btree ("image2_id");
  CREATE INDEX "hero_banner_items_image3_idx" ON "hero_banner_items" USING btree ("image3_id");
  CREATE INDEX "hero_banner_items_image4_idx" ON "hero_banner_items" USING btree ("image4_id");
  CREATE INDEX "hero_banner_items_user_idx" ON "hero_banner_items" USING btree ("user_id");
  CREATE INDEX "hero_banner_items_updated_at_idx" ON "hero_banner_items" USING btree ("updated_at");
  CREATE INDEX "hero_banner_items_created_at_idx" ON "hero_banner_items" USING btree ("created_at");
  CREATE UNIQUE INDEX "hero_banner_items_locales_locale_parent_id_unique" ON "hero_banner_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "series_intro_items_product_series_idx" ON "series_intro_items" USING btree ("product_series_id");
  CREATE INDEX "series_intro_items_user_idx" ON "series_intro_items" USING btree ("user_id");
  CREATE INDEX "series_intro_items_updated_at_idx" ON "series_intro_items" USING btree ("updated_at");
  CREATE INDEX "series_intro_items_created_at_idx" ON "series_intro_items" USING btree ("created_at");
  CREATE UNIQUE INDEX "series_intro_items_locales_locale_parent_id_unique" ON "series_intro_items_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "navigation_menus_slug_idx" ON "navigation_menus" USING btree ("slug");
  CREATE INDEX "navigation_menus_parent_idx" ON "navigation_menus" USING btree ("parent_id");
  CREATE INDEX "navigation_menus_user_idx" ON "navigation_menus" USING btree ("user_id");
  CREATE INDEX "navigation_menus_updated_at_idx" ON "navigation_menus" USING btree ("updated_at");
  CREATE INDEX "navigation_menus_created_at_idx" ON "navigation_menus" USING btree ("created_at");
  CREATE UNIQUE INDEX "navigation_menus_locales_locale_parent_id_unique" ON "navigation_menus_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "navigation_menus_rels_order_idx" ON "navigation_menus_rels" USING btree ("order");
  CREATE INDEX "navigation_menus_rels_parent_idx" ON "navigation_menus_rels" USING btree ("parent_id");
  CREATE INDEX "navigation_menus_rels_path_idx" ON "navigation_menus_rels" USING btree ("path");
  CREATE INDEX "navigation_menus_rels_media_tags_id_idx" ON "navigation_menus_rels" USING btree ("media_tags_id");
  CREATE INDEX "authors_social_links_order_idx" ON "authors_social_links" USING btree ("_order");
  CREATE INDEX "authors_social_links_parent_id_idx" ON "authors_social_links" USING btree ("_parent_id");
  CREATE INDEX "authors_avatar_idx" ON "authors" USING btree ("avatar_id");
  CREATE INDEX "authors_updated_at_idx" ON "authors" USING btree ("updated_at");
  CREATE INDEX "authors_created_at_idx" ON "authors" USING btree ("created_at");
  CREATE UNIQUE INDEX "pages_slug_idx" ON "pages" USING btree ("slug");
  CREATE UNIQUE INDEX "pages_path_idx" ON "pages" USING btree ("path");
  CREATE INDEX "pages_author_idx" ON "pages" USING btree ("author_id");
  CREATE INDEX "pages_user_idx" ON "pages" USING btree ("user_id");
  CREATE INDEX "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");
  CREATE UNIQUE INDEX "pages_locales_locale_parent_id_unique" ON "pages_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_rels_order_idx" ON "pages_rels" USING btree ("order");
  CREATE INDEX "pages_rels_parent_idx" ON "pages_rels" USING btree ("parent_id");
  CREATE INDEX "pages_rels_path_idx" ON "pages_rels" USING btree ("path");
  CREATE INDEX "pages_rels_media_tags_id_idx" ON "pages_rels" USING btree ("media_tags_id");
  CREATE INDEX "blogs_kb_share_networks_order_idx" ON "blogs_kb_share_networks" USING btree ("_order");
  CREATE INDEX "blogs_kb_share_networks_parent_id_idx" ON "blogs_kb_share_networks" USING btree ("_parent_id");
  CREATE INDEX "blogs_kb_follow_us_socials_order_idx" ON "blogs_kb_follow_us_socials" USING btree ("_order");
  CREATE INDEX "blogs_kb_follow_us_socials_parent_id_idx" ON "blogs_kb_follow_us_socials" USING btree ("_parent_id");
  CREATE INDEX "blogs_author_idx" ON "blogs" USING btree ("author_id");
  CREATE UNIQUE INDEX "blogs_slug_idx" ON "blogs" USING btree ("slug");
  CREATE INDEX "blogs_cover_image_idx" ON "blogs" USING btree ("cover_image_id");
  CREATE INDEX "blogs_kb_pagination_prev_post_idx" ON "blogs" USING btree ("kb_pagination_prev_post_id");
  CREATE INDEX "blogs_kb_pagination_next_post_idx" ON "blogs" USING btree ("kb_pagination_next_post_id");
  CREATE INDEX "blogs_user_idx" ON "blogs" USING btree ("user_id");
  CREATE INDEX "blogs_updated_at_idx" ON "blogs" USING btree ("updated_at");
  CREATE INDEX "blogs_created_at_idx" ON "blogs" USING btree ("created_at");
  CREATE UNIQUE INDEX "blogs_locales_locale_parent_id_unique" ON "blogs_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "blogs_rels_order_idx" ON "blogs_rels" USING btree ("order");
  CREATE INDEX "blogs_rels_parent_idx" ON "blogs_rels" USING btree ("parent_id");
  CREATE INDEX "blogs_rels_path_idx" ON "blogs_rels" USING btree ("path");
  CREATE INDEX "blogs_rels_categories_id_idx" ON "blogs_rels" USING btree ("categories_id");
  CREATE INDEX "blogs_rels_blog_tags_id_idx" ON "blogs_rels" USING btree ("blog_tags_id");
  CREATE INDEX "blogs_rels_blogs_id_idx" ON "blogs_rels" USING btree ("blogs_id");
  CREATE UNIQUE INDEX "blog_tags_slug_idx" ON "blog_tags" USING btree ("slug");
  CREATE INDEX "blog_tags_user_idx" ON "blog_tags" USING btree ("user_id");
  CREATE INDEX "blog_tags_updated_at_idx" ON "blog_tags" USING btree ("updated_at");
  CREATE INDEX "blog_tags_created_at_idx" ON "blog_tags" USING btree ("created_at");
  CREATE UNIQUE INDEX "blog_tags_locales_locale_parent_id_unique" ON "blog_tags_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "applications_scene_gallery_order_idx" ON "applications_scene_gallery" USING btree ("_order");
  CREATE INDEX "applications_scene_gallery_parent_id_idx" ON "applications_scene_gallery" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "applications_scene_gallery_locales_locale_parent_id_unique" ON "applications_scene_gallery_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "applications_slug_idx" ON "applications" USING btree ("slug");
  CREATE INDEX "applications_category_idx" ON "applications" USING btree ("category_id");
  CREATE INDEX "applications_updated_at_idx" ON "applications" USING btree ("updated_at");
  CREATE INDEX "applications_created_at_idx" ON "applications" USING btree ("created_at");
  CREATE UNIQUE INDEX "applications_locales_locale_parent_id_unique" ON "applications_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "applications_rels_order_idx" ON "applications_rels" USING btree ("order");
  CREATE INDEX "applications_rels_parent_idx" ON "applications_rels" USING btree ("parent_id");
  CREATE INDEX "applications_rels_path_idx" ON "applications_rels" USING btree ("path");
  CREATE INDEX "applications_rels_media_id_idx" ON "applications_rels" USING btree ("media_id");
  CREATE INDEX "categories_breadcrumbs_order_idx" ON "categories_breadcrumbs" USING btree ("_order");
  CREATE INDEX "categories_breadcrumbs_parent_id_idx" ON "categories_breadcrumbs" USING btree ("_parent_id");
  CREATE INDEX "categories_breadcrumbs_doc_idx" ON "categories_breadcrumbs" USING btree ("doc_id");
  CREATE INDEX "categories_full_title_idx" ON "categories" USING btree ("full_title");
  CREATE INDEX "categories_parent_idx" ON "categories" USING btree ("parent_id");
  CREATE INDEX "categories_user_idx" ON "categories" USING btree ("user_id");
  CREATE INDEX "categories_updated_at_idx" ON "categories" USING btree ("updated_at");
  CREATE INDEX "categories_created_at_idx" ON "categories" USING btree ("created_at");
  CREATE UNIQUE INDEX "categories_locales_locale_parent_id_unique" ON "categories_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "categories_rels_order_idx" ON "categories_rels" USING btree ("order");
  CREATE INDEX "categories_rels_parent_idx" ON "categories_rels" USING btree ("parent_id");
  CREATE INDEX "categories_rels_path_idx" ON "categories_rels" USING btree ("path");
  CREATE INDEX "categories_rels_categories_id_idx" ON "categories_rels" USING btree ("categories_id");
  CREATE UNIQUE INDEX "faq_items_slug_idx" ON "faq_items" USING btree ("slug");
  CREATE INDEX "faq_items_category_idx" ON "faq_items" USING btree ("category_id");
  CREATE INDEX "faq_items_user_idx" ON "faq_items" USING btree ("user_id");
  CREATE INDEX "faq_items_updated_at_idx" ON "faq_items" USING btree ("updated_at");
  CREATE INDEX "faq_items_created_at_idx" ON "faq_items" USING btree ("created_at");
  CREATE UNIQUE INDEX "faq_items_locales_locale_parent_id_unique" ON "faq_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "faq_items_rels_order_idx" ON "faq_items_rels" USING btree ("order");
  CREATE INDEX "faq_items_rels_parent_idx" ON "faq_items_rels" USING btree ("parent_id");
  CREATE INDEX "faq_items_rels_path_idx" ON "faq_items_rels" USING btree ("path");
  CREATE INDEX "faq_items_rels_faq_items_id_idx" ON "faq_items_rels" USING btree ("faq_items_id");
  CREATE UNIQUE INDEX "reusable_blocks_slug_idx" ON "reusable_blocks" USING btree ("slug");
  CREATE INDEX "reusable_blocks_user_idx" ON "reusable_blocks" USING btree ("user_id");
  CREATE INDEX "reusable_blocks_updated_at_idx" ON "reusable_blocks" USING btree ("updated_at");
  CREATE INDEX "reusable_blocks_created_at_idx" ON "reusable_blocks" USING btree ("created_at");
  CREATE UNIQUE INDEX "reusable_blocks_locales_locale_parent_id_unique" ON "reusable_blocks_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "document_templates_key_idx" ON "document_templates" USING btree ("key");
  CREATE INDEX "document_templates_category_idx" ON "document_templates" USING btree ("category_id");
  CREATE INDEX "document_templates_user_idx" ON "document_templates" USING btree ("user_id");
  CREATE INDEX "document_templates_updated_at_idx" ON "document_templates" USING btree ("updated_at");
  CREATE INDEX "document_templates_created_at_idx" ON "document_templates" USING btree ("created_at");
  CREATE UNIQUE INDEX "document_templates_locales_locale_parent_id_unique" ON "document_templates_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "template_categories_slug_idx" ON "template_categories" USING btree ("slug");
  CREATE INDEX "template_categories_updated_at_idx" ON "template_categories" USING btree ("updated_at");
  CREATE INDEX "template_categories_created_at_idx" ON "template_categories" USING btree ("created_at");
  CREATE UNIQUE INDEX "template_categories_locales_locale_parent_id_unique" ON "template_categories_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "custom_scripts_user_idx" ON "custom_scripts" USING btree ("user_id");
  CREATE INDEX "custom_scripts_updated_at_idx" ON "custom_scripts" USING btree ("updated_at");
  CREATE INDEX "custom_scripts_created_at_idx" ON "custom_scripts" USING btree ("created_at");
  CREATE UNIQUE INDEX "seo_settings_identifier_idx" ON "seo_settings" USING btree ("identifier");
  CREATE INDEX "seo_settings_og_image_idx" ON "seo_settings" USING btree ("og_image_id");
  CREATE INDEX "seo_settings_user_idx" ON "seo_settings" USING btree ("user_id");
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
  CREATE INDEX "form_configs_rels_order_idx" ON "form_configs_rels" USING btree ("order");
  CREATE INDEX "form_configs_rels_parent_idx" ON "form_configs_rels" USING btree ("parent_id");
  CREATE INDEX "form_configs_rels_path_idx" ON "form_configs_rels" USING btree ("path");
  CREATE INDEX "form_configs_rels_users_id_idx" ON "form_configs_rels" USING btree ("users_id");
  CREATE INDEX "form_submissions_form_config_idx" ON "form_submissions" USING btree ("form_config_id");
  CREATE INDEX "form_submissions_assigned_to_idx" ON "form_submissions" USING btree ("assigned_to_id");
  CREATE INDEX "form_submissions_updated_at_idx" ON "form_submissions" USING btree ("updated_at");
  CREATE INDEX "form_submissions_created_at_idx" ON "form_submissions" USING btree ("created_at");
  CREATE UNIQUE INDEX "smtp_configs_name_idx" ON "smtp_configs" USING btree ("name");
  CREATE INDEX "smtp_configs_updated_at_idx" ON "smtp_configs" USING btree ("updated_at");
  CREATE INDEX "smtp_configs_created_at_idx" ON "smtp_configs" USING btree ("created_at");
  CREATE UNIQUE INDEX "smtp_configs_locales_locale_parent_id_unique" ON "smtp_configs_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "smtp_configs_rels_order_idx" ON "smtp_configs_rels" USING btree ("order");
  CREATE INDEX "smtp_configs_rels_parent_idx" ON "smtp_configs_rels" USING btree ("parent_id");
  CREATE INDEX "smtp_configs_rels_path_idx" ON "smtp_configs_rels" USING btree ("path");
  CREATE INDEX "smtp_configs_rels_form_configs_id_idx" ON "smtp_configs_rels" USING btree ("form_configs_id");
  CREATE INDEX "indexing_logs_trigger_user_idx" ON "indexing_logs" USING btree ("trigger_user_id");
  CREATE INDEX "indexing_logs_updated_at_idx" ON "indexing_logs" USING btree ("updated_at");
  CREATE INDEX "indexing_logs_created_at_idx" ON "indexing_logs" USING btree ("created_at");
  CREATE INDEX "audit_logs_user_idx" ON "audit_logs" USING btree ("user_id");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_jobs_log_order_idx" ON "payload_jobs_log" USING btree ("_order");
  CREATE INDEX "payload_jobs_log_parent_id_idx" ON "payload_jobs_log" USING btree ("_parent_id");
  CREATE INDEX "payload_jobs_completed_at_idx" ON "payload_jobs" USING btree ("completed_at");
  CREATE INDEX "payload_jobs_total_tried_idx" ON "payload_jobs" USING btree ("total_tried");
  CREATE INDEX "payload_jobs_has_error_idx" ON "payload_jobs" USING btree ("has_error");
  CREATE INDEX "payload_jobs_task_slug_idx" ON "payload_jobs" USING btree ("task_slug");
  CREATE INDEX "payload_jobs_queue_idx" ON "payload_jobs" USING btree ("queue");
  CREATE INDEX "payload_jobs_wait_until_idx" ON "payload_jobs" USING btree ("wait_until");
  CREATE INDEX "payload_jobs_processing_idx" ON "payload_jobs" USING btree ("processing");
  CREATE INDEX "payload_jobs_updated_at_idx" ON "payload_jobs" USING btree ("updated_at");
  CREATE INDEX "payload_jobs_created_at_idx" ON "payload_jobs" USING btree ("created_at");
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
  CREATE INDEX "payload_locked_documents_rels_products_id_idx" ON "payload_locked_documents_rels" USING btree ("products_id");
  CREATE INDEX "payload_locked_documents_rels_product_series_id_idx" ON "payload_locked_documents_rels" USING btree ("product_series_id");
  CREATE INDEX "payload_locked_documents_rels_product_attributes_id_idx" ON "payload_locked_documents_rels" USING btree ("product_attributes_id");
  CREATE INDEX "payload_locked_documents_rels_product_templates_id_idx" ON "payload_locked_documents_rels" USING btree ("product_templates_id");
  CREATE INDEX "payload_locked_documents_rels_product_reusable_blocks_id_idx" ON "payload_locked_documents_rels" USING btree ("product_reusable_blocks_id");
  CREATE INDEX "payload_locked_documents_rels_series_templates_id_idx" ON "payload_locked_documents_rels" USING btree ("series_templates_id");
  CREATE INDEX "payload_locked_documents_rels_series_reusable_blocks_id_idx" ON "payload_locked_documents_rels" USING btree ("series_reusable_blocks_id");
  CREATE INDEX "payload_locked_documents_rels_hero_banner_items_id_idx" ON "payload_locked_documents_rels" USING btree ("hero_banner_items_id");
  CREATE INDEX "payload_locked_documents_rels_series_intro_items_id_idx" ON "payload_locked_documents_rels" USING btree ("series_intro_items_id");
  CREATE INDEX "payload_locked_documents_rels_navigation_menus_id_idx" ON "payload_locked_documents_rels" USING btree ("navigation_menus_id");
  CREATE INDEX "payload_locked_documents_rels_authors_id_idx" ON "payload_locked_documents_rels" USING btree ("authors_id");
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");
  CREATE INDEX "payload_locked_documents_rels_blogs_id_idx" ON "payload_locked_documents_rels" USING btree ("blogs_id");
  CREATE INDEX "payload_locked_documents_rels_blog_tags_id_idx" ON "payload_locked_documents_rels" USING btree ("blog_tags_id");
  CREATE INDEX "payload_locked_documents_rels_applications_id_idx" ON "payload_locked_documents_rels" USING btree ("applications_id");
  CREATE INDEX "payload_locked_documents_rels_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("categories_id");
  CREATE INDEX "payload_locked_documents_rels_faq_items_id_idx" ON "payload_locked_documents_rels" USING btree ("faq_items_id");
  CREATE INDEX "payload_locked_documents_rels_reusable_blocks_id_idx" ON "payload_locked_documents_rels" USING btree ("reusable_blocks_id");
  CREATE INDEX "payload_locked_documents_rels_document_templates_id_idx" ON "payload_locked_documents_rels" USING btree ("document_templates_id");
  CREATE INDEX "payload_locked_documents_rels_template_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("template_categories_id");
  CREATE INDEX "payload_locked_documents_rels_custom_scripts_id_idx" ON "payload_locked_documents_rels" USING btree ("custom_scripts_id");
  CREATE INDEX "payload_locked_documents_rels_seo_settings_id_idx" ON "payload_locked_documents_rels" USING btree ("seo_settings_id");
  CREATE INDEX "payload_locked_documents_rels_form_configs_id_idx" ON "payload_locked_documents_rels" USING btree ("form_configs_id");
  CREATE INDEX "payload_locked_documents_rels_form_submissions_id_idx" ON "payload_locked_documents_rels" USING btree ("form_submissions_id");
  CREATE INDEX "payload_locked_documents_rels_smtp_configs_id_idx" ON "payload_locked_documents_rels" USING btree ("smtp_configs_id");
  CREATE INDEX "payload_locked_documents_rels_indexing_logs_id_idx" ON "payload_locked_documents_rels" USING btree ("indexing_logs_id");
  CREATE INDEX "payload_locked_documents_rels_audit_logs_id_idx" ON "payload_locked_documents_rels" USING btree ("audit_logs_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "home_content_sections_order_idx" ON "home_content_sections" USING btree ("_order");
  CREATE INDEX "home_content_sections_parent_id_idx" ON "home_content_sections" USING btree ("_parent_id");
  CREATE INDEX "footer_legal_links_order_idx" ON "footer_legal_links" USING btree ("_order");
  CREATE INDEX "footer_legal_links_parent_id_idx" ON "footer_legal_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "footer_legal_links_locales_locale_parent_id_unique" ON "footer_legal_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "footer_form_config_idx" ON "footer" USING btree ("form_config_id");
  CREATE UNIQUE INDEX "footer_locales_locale_parent_id_unique" ON "footer_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "footer_rels_order_idx" ON "footer_rels" USING btree ("order");
  CREATE INDEX "footer_rels_parent_idx" ON "footer_rels" USING btree ("parent_id");
  CREATE INDEX "footer_rels_path_idx" ON "footer_rels" USING btree ("path");
  CREATE INDEX "footer_rels_navigation_menus_id_idx" ON "footer_rels" USING btree ("navigation_menus_id");
  CREATE INDEX "site_config_logo_idx" ON "site_config" USING btree ("logo_id");
  CREATE INDEX "site_config_favicon_idx" ON "site_config" USING btree ("favicon_id");
  CREATE UNIQUE INDEX "site_config_locales_locale_parent_id_unique" ON "site_config_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "contact_popup_options_order_idx" ON "contact_popup_options" USING btree ("_order");
  CREATE INDEX "contact_popup_options_parent_id_idx" ON "contact_popup_options" USING btree ("_parent_id");
  CREATE INDEX "contact_popup_options_icon_idx" ON "contact_popup_options" USING btree ("icon_id");
  CREATE UNIQUE INDEX "contact_popup_options_locales_locale_parent_id_unique" ON "contact_popup_options_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "contact_popup_locales_locale_parent_id_unique" ON "contact_popup_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "preloader_config_images_order_idx" ON "preloader_config_images" USING btree ("_order");
  CREATE INDEX "preloader_config_images_parent_id_idx" ON "preloader_config_images" USING btree ("_parent_id");
  CREATE INDEX "preloader_config_images_image_idx" ON "preloader_config_images" USING btree ("image_id");
  CREATE INDEX "social_config_social_links_order_idx" ON "social_config_social_links" USING btree ("_order");
  CREATE INDEX "social_config_social_links_parent_id_idx" ON "social_config_social_links" USING btree ("_parent_id");
  CREATE INDEX "social_config_social_links_icon_idx" ON "social_config_social_links" USING btree ("icon_id");
  CREATE INDEX "shop_page_config_rels_order_idx" ON "shop_page_config_rels" USING btree ("order");
  CREATE INDEX "shop_page_config_rels_parent_idx" ON "shop_page_config_rels" USING btree ("parent_id");
  CREATE INDEX "shop_page_config_rels_path_idx" ON "shop_page_config_rels" USING btree ("path");
  CREATE INDEX "shop_page_config_rels_categories_id_idx" ON "shop_page_config_rels" USING btree ("categories_id");
  CREATE INDEX "knowledge_base_settings_toc_templates_order_idx" ON "knowledge_base_settings_toc_templates" USING btree ("order");
  CREATE INDEX "knowledge_base_settings_toc_templates_parent_idx" ON "knowledge_base_settings_toc_templates" USING btree ("parent_id");
  CREATE INDEX "knowledge_base_settings_share_config_templates_order_idx" ON "knowledge_base_settings_share_config_templates" USING btree ("order");
  CREATE INDEX "knowledge_base_settings_share_config_templates_parent_idx" ON "knowledge_base_settings_share_config_templates" USING btree ("parent_id");
  CREATE INDEX "knowledge_base_settings_share_config_networks_order_idx" ON "knowledge_base_settings_share_config_networks" USING btree ("_order");
  CREATE INDEX "knowledge_base_settings_share_config_networks_parent_id_idx" ON "knowledge_base_settings_share_config_networks" USING btree ("_parent_id");
  CREATE INDEX "knowledge_base_settings_search_box_templates_order_idx" ON "knowledge_base_settings_search_box_templates" USING btree ("order");
  CREATE INDEX "knowledge_base_settings_search_box_templates_parent_idx" ON "knowledge_base_settings_search_box_templates" USING btree ("parent_id");
  CREATE INDEX "knowledge_base_settings_category_list_templates_order_idx" ON "knowledge_base_settings_category_list_templates" USING btree ("order");
  CREATE INDEX "knowledge_base_settings_category_list_templates_parent_idx" ON "knowledge_base_settings_category_list_templates" USING btree ("parent_id");
  CREATE INDEX "knowledge_base_settings_recommended_posts_templates_order_idx" ON "knowledge_base_settings_recommended_posts_templates" USING btree ("order");
  CREATE INDEX "knowledge_base_settings_recommended_posts_templates_parent_idx" ON "knowledge_base_settings_recommended_posts_templates" USING btree ("parent_id");
  CREATE INDEX "knowledge_base_settings_follow_us_templates_order_idx" ON "knowledge_base_settings_follow_us_templates" USING btree ("order");
  CREATE INDEX "knowledge_base_settings_follow_us_templates_parent_idx" ON "knowledge_base_settings_follow_us_templates" USING btree ("parent_id");
  CREATE INDEX "knowledge_base_settings_follow_us_socials_order_idx" ON "knowledge_base_settings_follow_us_socials" USING btree ("_order");
  CREATE INDEX "knowledge_base_settings_follow_us_socials_parent_id_idx" ON "knowledge_base_settings_follow_us_socials" USING btree ("_parent_id");
  CREATE INDEX "knowledge_base_settings_bottom_categories_templates_order_idx" ON "knowledge_base_settings_bottom_categories_templates" USING btree ("order");
  CREATE INDEX "knowledge_base_settings_bottom_categories_templates_parent_idx" ON "knowledge_base_settings_bottom_categories_templates" USING btree ("parent_id");
  CREATE INDEX "knowledge_base_settings_pagination_templates_order_idx" ON "knowledge_base_settings_pagination_templates" USING btree ("order");
  CREATE INDEX "knowledge_base_settings_pagination_templates_parent_idx" ON "knowledge_base_settings_pagination_templates" USING btree ("parent_id");
  CREATE INDEX "knowledge_base_settings_bottom_recommended_templates_order_idx" ON "knowledge_base_settings_bottom_recommended_templates" USING btree ("order");
  CREATE INDEX "knowledge_base_settings_bottom_recommended_templates_parent_idx" ON "knowledge_base_settings_bottom_recommended_templates" USING btree ("parent_id");
  CREATE INDEX "knowledge_base_settings_featured_post_idx" ON "knowledge_base_settings" USING btree ("featured_post_id");
  CREATE UNIQUE INDEX "knowledge_base_settings_locales_locale_parent_id_unique" ON "knowledge_base_settings_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "knowledge_base_settings_rels_order_idx" ON "knowledge_base_settings_rels" USING btree ("order");
  CREATE INDEX "knowledge_base_settings_rels_parent_idx" ON "knowledge_base_settings_rels" USING btree ("parent_id");
  CREATE INDEX "knowledge_base_settings_rels_path_idx" ON "knowledge_base_settings_rels" USING btree ("path");
  CREATE INDEX "knowledge_base_settings_rels_categories_id_idx" ON "knowledge_base_settings_rels" USING btree ("categories_id");
  CREATE INDEX "knowledge_base_settings_rels_blogs_id_idx" ON "knowledge_base_settings_rels" USING btree ("blogs_id");
  CREATE UNIQUE INDEX "product_series_carousel_locales_locale_parent_id_unique" ON "product_series_carousel_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "service_features_feature01_image1_idx" ON "service_features" USING btree ("feature01_image1_id");
  CREATE INDEX "service_features_feature01_image2_idx" ON "service_features" USING btree ("feature01_image2_id");
  CREATE INDEX "service_features_feature01_image3_idx" ON "service_features" USING btree ("feature01_image3_id");
  CREATE INDEX "service_features_feature01_image4_idx" ON "service_features" USING btree ("feature01_image4_id");
  CREATE INDEX "service_features_feature02_image1_idx" ON "service_features" USING btree ("feature02_image1_id");
  CREATE INDEX "service_features_feature02_image2_idx" ON "service_features" USING btree ("feature02_image2_id");
  CREATE INDEX "service_features_feature03_image1_idx" ON "service_features" USING btree ("feature03_image1_id");
  CREATE INDEX "service_features_feature03_image2_idx" ON "service_features" USING btree ("feature03_image2_id");
  CREATE INDEX "service_features_feature03_image3_idx" ON "service_features" USING btree ("feature03_image3_id");
  CREATE INDEX "service_features_feature03_image4_idx" ON "service_features" USING btree ("feature03_image4_id");
  CREATE INDEX "service_features_feature03_image5_idx" ON "service_features" USING btree ("feature03_image5_id");
  CREATE INDEX "service_features_feature03_image6_idx" ON "service_features" USING btree ("feature03_image6_id");
  CREATE INDEX "service_features_feature04_image1_idx" ON "service_features" USING btree ("feature04_image1_id");
  CREATE INDEX "service_features_feature04_image2_idx" ON "service_features" USING btree ("feature04_image2_id");
  CREATE INDEX "service_features_feature05_image1_idx" ON "service_features" USING btree ("feature05_image1_id");
  CREATE INDEX "service_features_feature05_image2_idx" ON "service_features" USING btree ("feature05_image2_id");
  CREATE UNIQUE INDEX "service_features_locales_locale_parent_id_unique" ON "service_features_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "sphere_3d_locales_locale_parent_id_unique" ON "sphere_3d_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "simple_cta_image1_idx" ON "simple_cta" USING btree ("image1_id");
  CREATE INDEX "simple_cta_image2_idx" ON "simple_cta" USING btree ("image2_id");
  CREATE INDEX "simple_cta_image3_idx" ON "simple_cta" USING btree ("image3_id");
  CREATE UNIQUE INDEX "simple_cta_locales_locale_parent_id_unique" ON "simple_cta_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "featured_products_locales_locale_parent_id_unique" ON "featured_products_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "featured_products_rels_order_idx" ON "featured_products_rels" USING btree ("order");
  CREATE INDEX "featured_products_rels_parent_idx" ON "featured_products_rels" USING btree ("parent_id");
  CREATE INDEX "featured_products_rels_path_idx" ON "featured_products_rels" USING btree ("path");
  CREATE INDEX "featured_products_rels_product_series_id_idx" ON "featured_products_rels" USING btree ("product_series_id");
  CREATE INDEX "brand_advantages_image_idx" ON "brand_advantages" USING btree ("image_id");
  CREATE UNIQUE INDEX "brand_advantages_locales_locale_parent_id_unique" ON "brand_advantages_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "oem_odm_oem_bg_image_idx" ON "oem_odm" USING btree ("oem_bg_image_id");
  CREATE INDEX "oem_odm_oem_image_idx" ON "oem_odm" USING btree ("oem_image_id");
  CREATE INDEX "oem_odm_odm_bg_image_idx" ON "oem_odm" USING btree ("odm_bg_image_id");
  CREATE INDEX "oem_odm_odm_image_idx" ON "oem_odm" USING btree ("odm_image_id");
  CREATE UNIQUE INDEX "oem_odm_locales_locale_parent_id_unique" ON "oem_odm_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "quote_steps_step01_image_idx" ON "quote_steps" USING btree ("step01_image_id");
  CREATE INDEX "quote_steps_step02_image_idx" ON "quote_steps" USING btree ("step02_image_id");
  CREATE INDEX "quote_steps_step03_image_idx" ON "quote_steps" USING btree ("step03_image_id");
  CREATE INDEX "quote_steps_step04_image_idx" ON "quote_steps" USING btree ("step04_image_id");
  CREATE INDEX "quote_steps_step05_image_idx" ON "quote_steps" USING btree ("step05_image_id");
  CREATE UNIQUE INDEX "quote_steps_locales_locale_parent_id_unique" ON "quote_steps_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "main_form_form_config_idx" ON "main_form" USING btree ("form_config_id");
  CREATE INDEX "main_form_image1_idx" ON "main_form" USING btree ("image1_id");
  CREATE INDEX "main_form_image2_idx" ON "main_form" USING btree ("image2_id");
  CREATE UNIQUE INDEX "main_form_locales_locale_parent_id_unique" ON "main_form_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "why_choose_busrom_reason01_image_idx" ON "why_choose_busrom" USING btree ("reason01_image_id");
  CREATE INDEX "why_choose_busrom_reason02_image_idx" ON "why_choose_busrom" USING btree ("reason02_image_id");
  CREATE INDEX "why_choose_busrom_reason03_image_idx" ON "why_choose_busrom" USING btree ("reason03_image_id");
  CREATE INDEX "why_choose_busrom_reason04_image_idx" ON "why_choose_busrom" USING btree ("reason04_image_id");
  CREATE INDEX "why_choose_busrom_reason05_image_idx" ON "why_choose_busrom" USING btree ("reason05_image_id");
  CREATE UNIQUE INDEX "why_choose_busrom_locales_locale_parent_id_unique" ON "why_choose_busrom_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "case_studies_locales_locale_parent_id_unique" ON "case_studies_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "case_studies_rels_order_idx" ON "case_studies_rels" USING btree ("order");
  CREATE INDEX "case_studies_rels_parent_idx" ON "case_studies_rels" USING btree ("parent_id");
  CREATE INDEX "case_studies_rels_path_idx" ON "case_studies_rels" USING btree ("path");
  CREATE INDEX "case_studies_rels_applications_id_idx" ON "case_studies_rels" USING btree ("applications_id");
  CREATE INDEX "brand_analysis_brand_center_brand_center_background_imag_idx" ON "brand_analysis" USING btree ("brand_center_background_image_id");
  CREATE INDEX "brand_analysis_brand_center_brand_center_large_image_idx" ON "brand_analysis" USING btree ("brand_center_large_image_id");
  CREATE INDEX "brand_analysis_brand_center_brand_center_small_image_idx" ON "brand_analysis" USING btree ("brand_center_small_image_id");
  CREATE INDEX "brand_analysis_project_center_project_center_background__idx" ON "brand_analysis" USING btree ("project_center_background_image_id");
  CREATE INDEX "brand_analysis_project_center_project_center_large_image_idx" ON "brand_analysis" USING btree ("project_center_large_image_id");
  CREATE INDEX "brand_analysis_project_center_project_center_small_image_idx" ON "brand_analysis" USING btree ("project_center_small_image_id");
  CREATE INDEX "brand_analysis_service_center_service_center_background__idx" ON "brand_analysis" USING btree ("service_center_background_image_id");
  CREATE INDEX "brand_analysis_service_center_service_center_large_image_idx" ON "brand_analysis" USING btree ("service_center_large_image_id");
  CREATE INDEX "brand_analysis_service_center_service_center_small_image_idx" ON "brand_analysis" USING btree ("service_center_small_image_id");
  CREATE UNIQUE INDEX "brand_analysis_locales_locale_parent_id_unique" ON "brand_analysis_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "brand_value_param1_image_idx" ON "brand_value" USING btree ("param1_image_id");
  CREATE INDEX "brand_value_param2_image_idx" ON "brand_value" USING btree ("param2_image_id");
  CREATE INDEX "brand_value_slogan_image_idx" ON "brand_value" USING btree ("slogan_image_id");
  CREATE INDEX "brand_value_value_image_idx" ON "brand_value" USING btree ("value_image_id");
  CREATE INDEX "brand_value_vision_image_idx" ON "brand_value" USING btree ("vision_image_id");
  CREATE UNIQUE INDEX "brand_value_locales_locale_parent_id_unique" ON "brand_value_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "system_settings_locales_locale_parent_id_unique" ON "system_settings_locales" USING btree ("_locale","_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_quick_actions" CASCADE;
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
  DROP TABLE "permissions_locales" CASCADE;
  DROP TABLE "products" CASCADE;
  DROP TABLE "products_locales" CASCADE;
  DROP TABLE "products_rels" CASCADE;
  DROP TABLE "product_series" CASCADE;
  DROP TABLE "product_series_locales" CASCADE;
  DROP TABLE "product_attributes" CASCADE;
  DROP TABLE "product_attributes_locales" CASCADE;
  DROP TABLE "product_templates" CASCADE;
  DROP TABLE "product_templates_locales" CASCADE;
  DROP TABLE "product_reusable_blocks" CASCADE;
  DROP TABLE "product_reusable_blocks_locales" CASCADE;
  DROP TABLE "series_templates" CASCADE;
  DROP TABLE "series_templates_locales" CASCADE;
  DROP TABLE "series_reusable_blocks" CASCADE;
  DROP TABLE "series_reusable_blocks_locales" CASCADE;
  DROP TABLE "hero_banner_items" CASCADE;
  DROP TABLE "hero_banner_items_locales" CASCADE;
  DROP TABLE "series_intro_items" CASCADE;
  DROP TABLE "series_intro_items_locales" CASCADE;
  DROP TABLE "navigation_menus" CASCADE;
  DROP TABLE "navigation_menus_locales" CASCADE;
  DROP TABLE "navigation_menus_rels" CASCADE;
  DROP TABLE "authors_social_links" CASCADE;
  DROP TABLE "authors" CASCADE;
  DROP TABLE "pages" CASCADE;
  DROP TABLE "pages_locales" CASCADE;
  DROP TABLE "pages_rels" CASCADE;
  DROP TABLE "blogs_kb_share_networks" CASCADE;
  DROP TABLE "blogs_kb_follow_us_socials" CASCADE;
  DROP TABLE "blogs" CASCADE;
  DROP TABLE "blogs_locales" CASCADE;
  DROP TABLE "blogs_rels" CASCADE;
  DROP TABLE "blog_tags" CASCADE;
  DROP TABLE "blog_tags_locales" CASCADE;
  DROP TABLE "applications_scene_gallery" CASCADE;
  DROP TABLE "applications_scene_gallery_locales" CASCADE;
  DROP TABLE "applications" CASCADE;
  DROP TABLE "applications_locales" CASCADE;
  DROP TABLE "applications_rels" CASCADE;
  DROP TABLE "categories_breadcrumbs" CASCADE;
  DROP TABLE "categories" CASCADE;
  DROP TABLE "categories_locales" CASCADE;
  DROP TABLE "categories_rels" CASCADE;
  DROP TABLE "faq_items" CASCADE;
  DROP TABLE "faq_items_locales" CASCADE;
  DROP TABLE "faq_items_rels" CASCADE;
  DROP TABLE "reusable_blocks" CASCADE;
  DROP TABLE "reusable_blocks_locales" CASCADE;
  DROP TABLE "document_templates" CASCADE;
  DROP TABLE "document_templates_locales" CASCADE;
  DROP TABLE "template_categories" CASCADE;
  DROP TABLE "template_categories_locales" CASCADE;
  DROP TABLE "custom_scripts" CASCADE;
  DROP TABLE "seo_settings" CASCADE;
  DROP TABLE "seo_settings_locales" CASCADE;
  DROP TABLE "form_configs_fields_options" CASCADE;
  DROP TABLE "form_configs_fields_options_locales" CASCADE;
  DROP TABLE "form_configs_fields" CASCADE;
  DROP TABLE "form_configs_fields_locales" CASCADE;
  DROP TABLE "form_configs" CASCADE;
  DROP TABLE "form_configs_locales" CASCADE;
  DROP TABLE "form_configs_rels" CASCADE;
  DROP TABLE "form_submissions" CASCADE;
  DROP TABLE "smtp_configs" CASCADE;
  DROP TABLE "smtp_configs_locales" CASCADE;
  DROP TABLE "smtp_configs_rels" CASCADE;
  DROP TABLE "indexing_logs" CASCADE;
  DROP TABLE "audit_logs" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_jobs_log" CASCADE;
  DROP TABLE "payload_jobs" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "home_content_sections" CASCADE;
  DROP TABLE "home_content" CASCADE;
  DROP TABLE "footer_legal_links" CASCADE;
  DROP TABLE "footer_legal_links_locales" CASCADE;
  DROP TABLE "footer" CASCADE;
  DROP TABLE "footer_locales" CASCADE;
  DROP TABLE "footer_rels" CASCADE;
  DROP TABLE "site_config" CASCADE;
  DROP TABLE "site_config_locales" CASCADE;
  DROP TABLE "contact_popup_options" CASCADE;
  DROP TABLE "contact_popup_options_locales" CASCADE;
  DROP TABLE "contact_popup" CASCADE;
  DROP TABLE "contact_popup_locales" CASCADE;
  DROP TABLE "preloader_config_images" CASCADE;
  DROP TABLE "preloader_config" CASCADE;
  DROP TABLE "social_config_social_links" CASCADE;
  DROP TABLE "social_config" CASCADE;
  DROP TABLE "shop_page_config" CASCADE;
  DROP TABLE "shop_page_config_rels" CASCADE;
  DROP TABLE "knowledge_base_settings_toc_templates" CASCADE;
  DROP TABLE "knowledge_base_settings_share_config_templates" CASCADE;
  DROP TABLE "knowledge_base_settings_share_config_networks" CASCADE;
  DROP TABLE "knowledge_base_settings_search_box_templates" CASCADE;
  DROP TABLE "knowledge_base_settings_category_list_templates" CASCADE;
  DROP TABLE "knowledge_base_settings_recommended_posts_templates" CASCADE;
  DROP TABLE "knowledge_base_settings_follow_us_templates" CASCADE;
  DROP TABLE "knowledge_base_settings_follow_us_socials" CASCADE;
  DROP TABLE "knowledge_base_settings_bottom_categories_templates" CASCADE;
  DROP TABLE "knowledge_base_settings_pagination_templates" CASCADE;
  DROP TABLE "knowledge_base_settings_bottom_recommended_templates" CASCADE;
  DROP TABLE "knowledge_base_settings" CASCADE;
  DROP TABLE "knowledge_base_settings_locales" CASCADE;
  DROP TABLE "knowledge_base_settings_rels" CASCADE;
  DROP TABLE "product_series_carousel" CASCADE;
  DROP TABLE "product_series_carousel_locales" CASCADE;
  DROP TABLE "service_features" CASCADE;
  DROP TABLE "service_features_locales" CASCADE;
  DROP TABLE "sphere_3d" CASCADE;
  DROP TABLE "sphere_3d_locales" CASCADE;
  DROP TABLE "simple_cta" CASCADE;
  DROP TABLE "simple_cta_locales" CASCADE;
  DROP TABLE "featured_products" CASCADE;
  DROP TABLE "featured_products_locales" CASCADE;
  DROP TABLE "featured_products_rels" CASCADE;
  DROP TABLE "brand_advantages" CASCADE;
  DROP TABLE "brand_advantages_locales" CASCADE;
  DROP TABLE "oem_odm" CASCADE;
  DROP TABLE "oem_odm_locales" CASCADE;
  DROP TABLE "quote_steps" CASCADE;
  DROP TABLE "quote_steps_locales" CASCADE;
  DROP TABLE "main_form" CASCADE;
  DROP TABLE "main_form_locales" CASCADE;
  DROP TABLE "why_choose_busrom" CASCADE;
  DROP TABLE "why_choose_busrom_locales" CASCADE;
  DROP TABLE "case_studies" CASCADE;
  DROP TABLE "case_studies_locales" CASCADE;
  DROP TABLE "case_studies_rels" CASCADE;
  DROP TABLE "brand_analysis" CASCADE;
  DROP TABLE "brand_analysis_locales" CASCADE;
  DROP TABLE "brand_value" CASCADE;
  DROP TABLE "brand_value_locales" CASCADE;
  DROP TABLE "translation_config" CASCADE;
  DROP TABLE "system_settings" CASCADE;
  DROP TABLE "system_settings_locales" CASCADE;
  DROP TABLE "payload_jobs_stats" CASCADE;
  DROP TYPE "public"."_locales";
  DROP TYPE "public"."enum_users_quick_actions_route";
  DROP TYPE "public"."enum_users_quick_actions_color_preset";
  DROP TYPE "public"."enum_users_status";
  DROP TYPE "public"."enum_media_status";
  DROP TYPE "public"."enum_media_tags_type";
  DROP TYPE "public"."enum_permissions_resource";
  DROP TYPE "public"."enum_permissions_action";
  DROP TYPE "public"."enum_permissions_category";
  DROP TYPE "public"."enum_products_status";
  DROP TYPE "public"."enum_product_series_status";
  DROP TYPE "public"."enum_product_templates_status";
  DROP TYPE "public"."enum_product_reusable_blocks_status";
  DROP TYPE "public"."enum_series_templates_status";
  DROP TYPE "public"."enum_series_reusable_blocks_status";
  DROP TYPE "public"."enum_hero_banner_items_status";
  DROP TYPE "public"."enum_series_intro_items_status";
  DROP TYPE "public"."enum_navigation_menus_type";
  DROP TYPE "public"."enum_authors_social_links_platform";
  DROP TYPE "public"."enum_pages_status";
  DROP TYPE "public"."enum_pages_page_type";
  DROP TYPE "public"."enum_blogs_status";
  DROP TYPE "public"."enum_blogs_template_type";
  DROP TYPE "public"."enum_blogs_kb_toc_mode";
  DROP TYPE "public"."enum_blogs_kb_share_mode";
  DROP TYPE "public"."enum_blogs_kb_search_box_mode";
  DROP TYPE "public"."enum_blogs_kb_category_list_mode";
  DROP TYPE "public"."enum_blogs_kb_recommended_posts_mode";
  DROP TYPE "public"."enum_blogs_kb_recommended_posts_logic";
  DROP TYPE "public"."enum_blogs_kb_follow_us_mode";
  DROP TYPE "public"."enum_blogs_kb_bottom_categories_mode";
  DROP TYPE "public"."enum_blogs_kb_pagination_mode";
  DROP TYPE "public"."enum_blogs_kb_pagination_type";
  DROP TYPE "public"."enum_blogs_kb_bottom_recommended_mode";
  DROP TYPE "public"."enum_blogs_kb_bottom_recommended_logic";
  DROP TYPE "public"."enum_applications_status";
  DROP TYPE "public"."enum_categories_type";
  DROP TYPE "public"."enum_categories_status";
  DROP TYPE "public"."enum_faq_items_status";
  DROP TYPE "public"."enum_reusable_blocks_block_type";
  DROP TYPE "public"."enum_reusable_blocks_status";
  DROP TYPE "public"."enum_document_templates_status";
  DROP TYPE "public"."enum_custom_scripts_script_type";
  DROP TYPE "public"."enum_custom_scripts_template_type";
  DROP TYPE "public"."enum_custom_scripts_script_position";
  DROP TYPE "public"."enum_custom_scripts_scope";
  DROP TYPE "public"."enum_custom_scripts_page_type";
  DROP TYPE "public"."enum_custom_scripts_test_status";
  DROP TYPE "public"."enum_seo_settings_scope";
  DROP TYPE "public"."enum_seo_settings_page_type";
  DROP TYPE "public"."enum_seo_settings_og_type";
  DROP TYPE "public"."enum_seo_settings_sitemap_changefreq";
  DROP TYPE "public"."enum_form_configs_fields_field_type";
  DROP TYPE "public"."enum_form_configs_fields_width";
  DROP TYPE "public"."enum_form_configs_captcha_theme";
  DROP TYPE "public"."enum_form_configs_captcha_size";
  DROP TYPE "public"."enum_form_configs_auto_reply_enabled";
  DROP TYPE "public"."enum_form_configs_status";
  DROP TYPE "public"."enum_form_submissions_status";
  DROP TYPE "public"."enum_form_submissions_submission_type";
  DROP TYPE "public"."enum_smtp_configs_status";
  DROP TYPE "public"."enum_indexing_logs_engine";
  DROP TYPE "public"."enum_indexing_logs_action";
  DROP TYPE "public"."enum_indexing_logs_status";
  DROP TYPE "public"."enum_audit_logs_type";
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  DROP TYPE "public"."enum_payload_jobs_log_state";
  DROP TYPE "public"."enum_payload_jobs_task_slug";
  DROP TYPE "public"."enum_home_content_sections_section_type";
  DROP TYPE "public"."enum_contact_popup_options_link_type";
  DROP TYPE "public"."enum_contact_popup_status";
  DROP TYPE "public"."enum_preloader_config_images_aspect_ratio";
  DROP TYPE "public"."enum_social_config_social_links_platform";
  DROP TYPE "public"."enum_knowledge_base_settings_toc_templates";
  DROP TYPE "public"."enum_knowledge_base_settings_share_config_templates";
  DROP TYPE "public"."enum_knowledge_base_settings_search_box_templates";
  DROP TYPE "public"."enum_knowledge_base_settings_category_list_templates";
  DROP TYPE "public"."enum_knowledge_base_settings_recommended_posts_templates";
  DROP TYPE "public"."enum_knowledge_base_settings_follow_us_templates";
  DROP TYPE "public"."enum_knowledge_base_settings_bottom_categories_templates";
  DROP TYPE "public"."enum_knowledge_base_settings_pagination_templates";
  DROP TYPE "public"."enum_knowledge_base_settings_bottom_recommended_templates";
  DROP TYPE "public"."enum_knowledge_base_settings_status";
  DROP TYPE "public"."enum_product_series_carousel_status";
  DROP TYPE "public"."enum_service_features_status";
  DROP TYPE "public"."enum_sphere_3d_status";
  DROP TYPE "public"."enum_simple_cta_status";
  DROP TYPE "public"."enum_featured_products_status";
  DROP TYPE "public"."enum_brand_advantages_status";
  DROP TYPE "public"."enum_oem_odm_status";
  DROP TYPE "public"."enum_quote_steps_status";
  DROP TYPE "public"."enum_main_form_status";
  DROP TYPE "public"."enum_why_choose_busrom_status";
  DROP TYPE "public"."enum_case_studies_status";
  DROP TYPE "public"."enum_brand_analysis_status";
  DROP TYPE "public"."enum_brand_value_status";
  DROP TYPE "public"."enum_translation_config_service";
  DROP TYPE "public"."enum_translation_config_default_source_lang";
  DROP TYPE "public"."enum_translation_config_last_test_result";
  DROP TYPE "public"."enum_system_settings_admin_banner_type";`)
}
