ALTER TABLE "quizzes" ADD COLUMN "name" varchar(255);--> statement-breakpoint
ALTER TABLE "quizzes" ADD COLUMN "folder" varchar(255);--> statement-breakpoint
ALTER TABLE "quizzes" ADD COLUMN "tags" jsonb;--> statement-breakpoint
ALTER TABLE "quizzes" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;