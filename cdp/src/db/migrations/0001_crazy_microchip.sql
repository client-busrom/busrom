CREATE TABLE "audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(255),
	"user_email" varchar(255),
	"action" varchar(100) NOT NULL,
	"resource_type" varchar(100) NOT NULL,
	"resource_id" varchar(255),
	"details" jsonb DEFAULT '{}'::jsonb,
	"ip_address" varchar(45),
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "traffic_summary" ADD COLUMN "form_conversion_rate" real DEFAULT 0;--> statement-breakpoint
ALTER TABLE "traffic_summary" ADD COLUMN "leads" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "traffic_summary" ADD COLUMN "leads_change_day" real;--> statement-breakpoint
ALTER TABLE "traffic_summary" ADD COLUMN "leads_change_week" real;--> statement-breakpoint
ALTER TABLE "traffic_summary" ADD COLUMN "leads_change_month" real;--> statement-breakpoint
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "audit_logs_action_idx" ON "audit_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "audit_logs_resource_type_idx" ON "audit_logs" USING btree ("resource_type");--> statement-breakpoint
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs" USING btree ("created_at");