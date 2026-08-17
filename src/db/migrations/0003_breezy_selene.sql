ALTER TABLE "users" ALTER COLUMN "password_hash" SET DEFAULT 'oauth_google_placeholder';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "password_hash" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "github_id" varchar(255);--> statement-breakpoint
CREATE INDEX "idx_users_active" ON "users" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_users_locked" ON "users" USING btree ("is_locked");--> statement-breakpoint
CREATE INDEX "idx_users_google" ON "users" USING btree ("google_id");--> statement-breakpoint
CREATE INDEX "idx_users_github" ON "users" USING btree ("github_id");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_github_id_unique" UNIQUE("github_id");