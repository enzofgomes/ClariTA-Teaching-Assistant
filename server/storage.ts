import { eq, and, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { uploads, quizzes, users, quizAttempts, type Upload, type Quiz, type InsertUpload, type InsertQuiz, type UpdateQuiz, type InsertQuizAttempt, type QuizAttempt, type User, type UpsertUser } from "@shared/schema";

// Configure postgres client for serverless environments
const client = postgres(process.env.DATABASE_URL!, {
  max: 1, // Limit connections in serverless environment
  idle_timeout: 20,
  connect_timeout: 10,
});
const db = drizzle(client);

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Upload operations
  createUpload(upload: InsertUpload): Promise<Upload>;
  getUpload(id: string): Promise<Upload | undefined>;
  getUserUploads(userId: string): Promise<Upload[]>;
  
  // Quiz operations
  createQuiz(quiz: InsertQuiz): Promise<Quiz>;
  getQuiz(id: string): Promise<Quiz | undefined>;
  getQuizzesByUploadId(uploadId: string): Promise<Quiz[]>;
  getUserQuizzes(userId: string): Promise<Quiz[]>;
  updateQuiz(id: string, updates: UpdateQuiz): Promise<Quiz>;
  deleteQuiz(id: string): Promise<void>;
  getUserQuizFolders(userId: string): Promise<string[]>;
  
  // Quiz attempt operations
  createQuizAttempt(attempt: InsertQuizAttempt): Promise<QuizAttempt>;
  getQuizAttempts(quizId: string): Promise<QuizAttempt[]>;
  getUserQuizAttempts(userId: string): Promise<QuizAttempt[]>;
  getLatestQuizAttempt(quizId: string, userId: string): Promise<QuizAttempt | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getUserUploads(userId: string): Promise<Upload[]> {
    return await db.select().from(uploads).where(eq(uploads.userId, userId));
  }

  async getUserQuizzes(userId: string): Promise<Quiz[]> {
    return await db.select().from(quizzes).where(eq(quizzes.userId, userId));
  }

  async createUpload(upload: InsertUpload): Promise<Upload> {
    const [result] = await db.insert(uploads).values({
      ...upload,
      textByPage: upload.textByPage as any
    }).returning();
    return result;
  }

  async getUpload(id: string): Promise<Upload | undefined> {
    const [result] = await db.select().from(uploads).where(eq(uploads.id, id));
    return result;
  }

  async createQuiz(quiz: InsertQuiz): Promise<Quiz> {
    const [result] = await db.insert(quizzes).values({
      ...quiz,
      questions: quiz.questions as any,
      meta: quiz.meta as any,
      tags: quiz.tags as any
    }).returning();
    return result;
  }

  async getQuiz(id: string): Promise<Quiz | undefined> {
    const [result] = await db.select().from(quizzes).where(eq(quizzes.id, id));
    return result;
  }

  async getQuizzesByUploadId(uploadId: string): Promise<Quiz[]> {
    return await db.select().from(quizzes).where(eq(quizzes.uploadId, uploadId));
  }

  async updateQuiz(id: string, updates: UpdateQuiz): Promise<Quiz> {
    const updateData: any = {
      updatedAt: new Date(),
    };

    // Only set fields that are provided in updates
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.folder !== undefined) updateData.folder = updates.folder;
    if (updates.tags !== undefined) updateData.tags = updates.tags;
    if (updates.questions !== undefined) updateData.questions = updates.questions;
    if (updates.meta !== undefined) updateData.meta = updates.meta;

    console.log('updateQuiz called with:', { id, updateData });

    const [result] = await db
      .update(quizzes)
      .set(updateData)
      .where(eq(quizzes.id, id))
      .returning();
    
    console.log('updateQuiz result:', result);
    return result;
  }

  async deleteQuiz(id: string): Promise<void> {
    try {
      // First delete all quiz attempts associated with this quiz
      await db.delete(quizAttempts).where(eq(quizAttempts.quizId, id));
      
      // Then delete the quiz itself
      await db.delete(quizzes).where(eq(quizzes.id, id));
    } catch (error) {
      console.error('Error deleting quiz:', id, error);
      throw error;
    }
  }

  async getUserQuizFolders(userId: string): Promise<string[]> {
    const userQuizzes = await db
      .select({ folder: quizzes.folder })
      .from(quizzes)
      .where(eq(quizzes.userId, userId));
    
    const folders = userQuizzes
      .map(q => q.folder)
      .filter((folder): folder is string => folder !== null && folder !== undefined)
      .filter((folder, index, arr) => arr.indexOf(folder) === index); // Remove duplicates
    
    return folders;
  }

  // Quiz attempt operations
  async createQuizAttempt(attempt: InsertQuizAttempt): Promise<QuizAttempt> {
    const [result] = await db.insert(quizAttempts).values({
      ...attempt,
      answers: attempt.answers as any
    }).returning();
    return result;
  }

  async getQuizAttempts(quizId: string): Promise<QuizAttempt[]> {
    return await db.select().from(quizAttempts).where(eq(quizAttempts.quizId, quizId));
  }

  async getUserQuizAttempts(userId: string): Promise<QuizAttempt[]> {
    return await db.select().from(quizAttempts).where(eq(quizAttempts.userId, userId));
  }

  async getLatestQuizAttempt(quizId: string, userId: string): Promise<QuizAttempt | undefined> {
    const [result] = await db
      .select()
      .from(quizAttempts)
      .where(and(eq(quizAttempts.quizId, quizId), eq(quizAttempts.userId, userId)))
      .orderBy(desc(quizAttempts.completedAt))
      .limit(1);
    return result;
  }
}

export const storage = new DatabaseStorage();
