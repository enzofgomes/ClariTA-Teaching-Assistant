import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb, real, index, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User storage table for Supabase Auth - extends Supabase auth.users
export const users = pgTable("users", {
  id: varchar("id").primaryKey(), // Use Supabase auth user ID
  email: varchar("email", { length: 255 }).notNull().unique(),
  fullName: varchar("full_name", { length: 255 }),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const uploads = pgTable("uploads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size").notNull(),
  pageCount: integer("page_count").notNull(),
  textByPage: jsonb("text_by_page").$type<string[]>().notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

export const quizzes = pgTable("quizzes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  uploadId: varchar("upload_id").notNull().references(() => uploads.id),
  questions: jsonb("questions").$type<Question[]>().notNull(),
  meta: jsonb("meta").$type<QuizMeta>().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// TypeScript types for quiz structure
export type QuestionType = 'mcq' | 'tf' | 'short';

export type Citation = {
  page: number;
  snippet: string;
};

export type Question = {
  id: string;
  type: QuestionType;
  prompt: string;
  options?: string[];
  answer: number | boolean | string;
  explanation: string;
  citations: Citation[];
  confidence: number;
};

export type QuizMeta = {
  uploadId: string;
  createdAt: string;
  countsByType: Record<QuestionType, number>;
  avgConfidence: number;
};

export const insertUploadSchema = createInsertSchema(uploads).omit({
  id: true,
  uploadedAt: true,
});

export const insertQuizSchema = createInsertSchema(quizzes).omit({
  id: true,
  createdAt: true,
});

export type InsertUpload = z.infer<typeof insertUploadSchema>;
export type InsertQuiz = z.infer<typeof insertQuizSchema>;
export type Upload = typeof uploads.$inferSelect;
export type Quiz = typeof quizzes.$inferSelect;

// User types for Supabase Auth
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Auth user interface for frontend
export interface AuthUser {
  id: string;
  email: string;
  fullName?: string;
}
