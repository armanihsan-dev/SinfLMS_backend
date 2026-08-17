ALTER TABLE "users" ADD COLUMN "is_locked" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "locked_until" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "login_attempts" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "last_login_ip" "inet";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "current_session_id" uuid;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "deleted_at" timestamp with time zone;