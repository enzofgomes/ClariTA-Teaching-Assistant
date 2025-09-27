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
  name: varchar("name", { length: 255 }), // Custom quiz name
  folder: varchar("folder", { length: 255 }), // Folder/category
  tags: jsonb("tags").$type<string[]>(), // Tags for organization
  questions: jsonb("questions").$type<Question[]>().notNull(),
  meta: jsonb("meta").$type<QuizMeta>().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const quizAttempts = pgTable("quiz_attempts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  quizId: varchar("quiz_id").notNull().references(() => quizzes.id),
  score: integer("score").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  percentage: integer("percentage").notNull(),
  answers: jsonb("answers").$type<QuizAttemptAnswer[]>().notNull(),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
});

// TypeScript types for quiz structure
export type QuestionType = 'mcq' | 'tf' | 'fill';

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
};

export type QuizMeta = {
  uploadId: string;
  createdAt: string;
  countsByType: Record<QuestionType, number>;
};

export type QuizAttemptAnswer = {
  questionId: string;
  userAnswer: number | boolean | string;
  correctAnswer: number | boolean | string;
  isCorrect: boolean;
};

export const insertUploadSchema = createInsertSchema(uploads).omit({
  id: true,
  uploadedAt: true,
});

export const insertQuizSchema = createInsertSchema(quizzes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateQuizSchema = createInsertSchema(quizzes).pick({
  name: true,
  folder: true,
  tags: true,
}).partial();

export const insertQuizAttemptSchema = createInsertSchema(quizAttempts).omit({
  id: true,
  completedAt: true,
});

export type InsertUpload = z.infer<typeof insertUploadSchema>;
export type InsertQuiz = z.infer<typeof insertQuizSchema>;
export type UpdateQuiz = z.infer<typeof updateQuizSchema>;
export type InsertQuizAttempt = z.infer<typeof insertQuizAttemptSchema>;
export type Upload = typeof uploads.$inferSelect;
export type Quiz = typeof quizzes.$inferSelect;
export type QuizAttempt = typeof quizAttempts.$inferSelect;

// User types for Supabase Auth
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Auth user interface for frontend
export interface AuthUser {
  id: string;
  email: string;
  fullName?: string;
}
