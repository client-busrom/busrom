CREATE TABLE "etl_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"task_name" varchar(100) NOT NULL,
	"status" varchar(50) DEFAULT 'running' NOT NULL,
	"start_time" timestamp with time zone DEFAULT now() NOT NULL,
	"end_time" timestamp with time zone,
	"records_processed" integer DEFAULT 0,
	"error_message" text,
	"details" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "path_insights" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" varchar(10) NOT NULL,
	"insight_type" varchar(50) NOT NULL,
	"insight_key" varchar(500) NOT NULL,
	"value" integer DEFAULT 0 NOT NULL,
	"conversion_count" integer DEFAULT 0,
	"conversion_rate" real DEFAULT 0,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "search_keywords" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" varchar(10) NOT NULL,
	"keyword" varchar(500) NOT NULL,
	"page_path" varchar(500),
	"channel" varchar(50) DEFAULT 'organic' NOT NULL,
	"search_engine" varchar(50),
	"impressions" integer DEFAULT 0,
	"clicks" integer DEFAULT 0,
	"ctr" real DEFAULT 0,
	"position" real DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "traffic_raw" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" varchar(255) NOT NULL,
	"visitor_id" varchar(255) NOT NULL,
	"page_path" varchar(500) NOT NULL,
	"referrer" varchar(500),
	"utm_source" varchar(100),
	"utm_medium" varchar(100),
	"utm_campaign" varchar(100),
	"utm_term" varchar(100),
	"utm_content" varchar(100),
	"channel" varchar(50) DEFAULT 'direct' NOT NULL,
	"device_type" varchar(50),
	"browser" varchar(100),
	"os" varchar(100),
	"country" varchar(100),
	"city" varchar(100),
	"ip_address" varchar(45),
	"user_agent" text,
	"screen_resolution" varchar(50),
	"language" varchar(50),
	"event_type" varchar(50) DEFAULT 'pageview' NOT NULL,
	"event_data" jsonb,
	"timestamp" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "traffic_summary" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" varchar(10) NOT NULL,
	"page_path" varchar(500) DEFAULT 'all' NOT NULL,
	"channel" varchar(50) DEFAULT 'all' NOT NULL,
	"pv" integer DEFAULT 0 NOT NULL,
	"uv" integer DEFAULT 0 NOT NULL,
	"sessions" integer DEFAULT 0 NOT NULL,
	"bounce_rate" real DEFAULT 0,
	"avg_duration" real DEFAULT 0,
	"conversions" integer DEFAULT 0 NOT NULL,
	"form_submissions" integer DEFAULT 0 NOT NULL,
	"conversion_rate" real DEFAULT 0,
	"device_breakdown" jsonb,
	"browser_breakdown" jsonb,
	"country_breakdown" jsonb,
	"pv_change_day" real,
	"pv_change_week" real,
	"pv_change_month" real,
	"uv_change_day" real,
	"uv_change_week" real,
	"uv_change_month" real,
	"sessions_change_day" real,
	"sessions_change_week" real,
	"sessions_change_month" real,
	"conversions_change_day" real,
	"conversions_change_week" real,
	"conversions_change_month" real,
	"form_submissions_change_day" real,
	"form_submissions_change_week" real,
	"form_submissions_change_month" real,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "visitor_paths" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" varchar(255) NOT NULL,
	"visitor_id" varchar(255) NOT NULL,
	"path_sequence" jsonb NOT NULL,
	"entry_page" varchar(500) NOT NULL,
	"exit_page" varchar(500) NOT NULL,
	"page_count" integer DEFAULT 0 NOT NULL,
	"duration" real DEFAULT 0,
	"converted" boolean DEFAULT false,
	"conversion_page" varchar(500),
	"date" varchar(10) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "etl_logs_task_name_idx" ON "etl_logs" USING btree ("task_name");--> statement-breakpoint
CREATE INDEX "etl_logs_status_idx" ON "etl_logs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "etl_logs_start_time_idx" ON "etl_logs" USING btree ("start_time");--> statement-breakpoint
CREATE INDEX "path_insights_date_idx" ON "path_insights" USING btree ("date");--> statement-breakpoint
CREATE INDEX "path_insights_type_idx" ON "path_insights" USING btree ("insight_type");--> statement-breakpoint
CREATE INDEX "path_insights_date_type_idx" ON "path_insights" USING btree ("date","insight_type");--> statement-breakpoint
CREATE INDEX "search_keywords_date_idx" ON "search_keywords" USING btree ("date");--> statement-breakpoint
CREATE INDEX "search_keywords_keyword_idx" ON "search_keywords" USING btree ("keyword");--> statement-breakpoint
CREATE INDEX "search_keywords_date_keyword_idx" ON "search_keywords" USING btree ("date","keyword");--> statement-breakpoint
CREATE INDEX "traffic_raw_session_idx" ON "traffic_raw" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "traffic_raw_visitor_idx" ON "traffic_raw" USING btree ("visitor_id");--> statement-breakpoint
CREATE INDEX "traffic_raw_page_path_idx" ON "traffic_raw" USING btree ("page_path");--> statement-breakpoint
CREATE INDEX "traffic_raw_timestamp_idx" ON "traffic_raw" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "traffic_raw_channel_idx" ON "traffic_raw" USING btree ("channel");--> statement-breakpoint
CREATE INDEX "traffic_raw_event_type_idx" ON "traffic_raw" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "traffic_summary_date_idx" ON "traffic_summary" USING btree ("date");--> statement-breakpoint
CREATE INDEX "traffic_summary_date_channel_idx" ON "traffic_summary" USING btree ("date","channel");--> statement-breakpoint
CREATE INDEX "traffic_summary_date_page_idx" ON "traffic_summary" USING btree ("date","page_path");--> statement-breakpoint
CREATE INDEX "traffic_summary_unique_idx" ON "traffic_summary" USING btree ("date","page_path","channel");--> statement-breakpoint
CREATE INDEX "visitor_paths_session_idx" ON "visitor_paths" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "visitor_paths_date_idx" ON "visitor_paths" USING btree ("date");--> statement-breakpoint
CREATE INDEX "visitor_paths_entry_idx" ON "visitor_paths" USING btree ("entry_page");