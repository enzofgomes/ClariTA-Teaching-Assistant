import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { parsePDF } from "./services/pdf";
import { generateQuiz } from "./services/gemini";
import { insertUploadSchema, insertQuizSchema, updateQuizSchema, insertQuizAttemptSchema } from "@shared/schema";
import { z } from "zod";
import { setupAuth } from "./supabaseAuth";
import { authenticateUser, AuthenticatedRequest } from "./middleware/auth";
import authRoutes from "./routes/auth";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware setup
  await setupAuth(app);

  // Mount auth routes
  app.use('/api/auth', authRoutes);

  // Legacy auth route for backward compatibility
  app.get('/api/auth/user', async (req: AuthenticatedRequest, res) => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const userId = req.user.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Get user's uploads
  app.get('/api/user/uploads', authenticateUser, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const uploads = await storage.getUserUploads(userId);
      res.json(uploads);
    } catch (error) {
      console.error("Error fetching user uploads:", error);
      res.status(500).json({ message: "Failed to fetch uploads" });
    }
  });

  // Get user's quizzes
  app.get('/api/user/quizzes', authenticateUser, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const quizzes = await storage.getUserQuizzes(userId);
      res.json(quizzes);
    } catch (error) {
      console.error("Error fetching user quizzes:", error);
      res.status(500).json({ message: "Failed to fetch quizzes" });
    }
  });

  // Upload PDF endpoint (protected)
  app.post('/api/upload', authenticateUser, upload.single('file'), async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // Parse PDF
      const pdfResult = await parsePDF(req.file.buffer);
      
      // Create upload record
      const userId = req.user!.id;
      const uploadData = {
        userId,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        pageCount: pdfResult.pageCount,
        textByPage: pdfResult.textByPage
      };

      const validatedData = insertUploadSchema.parse(uploadData);
      const upload = await storage.createUpload(validatedData);

      res.json({
        uploadId: upload.id,
        fileName: upload.fileName,
        fileSize: upload.fileSize,
        pageCount: upload.pageCount,
        stats: {
          chars: pdfResult.totalChars,
          pagesWithText: pdfResult.pagesWithText
        }
      });

    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Upload failed' 
      });
    }
  });

  // Generate quiz endpoint (protected)
  app.post('/api/quizzes', authenticateUser, async (req: AuthenticatedRequest, res) => {
    try {
      const { uploadId, numQuestions = 10, questionTypes } = req.body;

      console.log('Quiz generation request:', { uploadId, numQuestions, questionTypes });

      if (!uploadId) {
        return res.status(400).json({ error: 'uploadId is required' });
      }

      // Get user and upload data
      const userId = req.user!.id;
      const upload = await storage.getUpload(uploadId);
      if (!upload) {
        return res.status(404).json({ error: 'Upload not found' });
      }

      // Check if user owns this upload
      if (upload.userId !== userId) {
        return res.status(403).json({ error: 'Unauthorized access to upload' });
      }

      // Generate quiz using Gemini
      const quizResult = await generateQuiz({
        textByPage: upload.textByPage,
        numQuestions,
        questionTypes: questionTypes || {
          mcq: true,
          tf: true,
          fill: true
        }
      }, uploadId);

      // Save quiz to database
      const quizData = {
        userId,
        uploadId,
        questions: quizResult.questions,
        meta: quizResult.meta
      };

      const validatedQuiz = insertQuizSchema.parse(quizData);
      const quiz = await storage.createQuiz(validatedQuiz);

      console.log('Created quiz:', quiz);
      console.log('Quiz questions:', quiz.questions);

      res.json({
        quizId: quiz.id,
        questions: quiz.questions,
        meta: quiz.meta
      });

    } catch (error) {
      console.error('Quiz generation error:', error);
      console.error('Error details:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Quiz generation failed' 
      });
    }
  });

  // Get quiz endpoint (protected)
  app.get('/api/quizzes/:quizId', authenticateUser, async (req: AuthenticatedRequest, res) => {
    try {
      const { quizId } = req.params;
      const userId = req.user!.id;
      
      const quiz = await storage.getQuiz(quizId);
      if (!quiz) {
        return res.status(404).json({ error: 'Quiz not found' });
      }

      // Check if user owns this quiz
      if (quiz.userId !== userId) {
        return res.status(403).json({ error: 'Unauthorized access to quiz' });
      }

      // Debug: Log the quiz structure for MCQ questions
      console.log('Quiz data for results:', {
        quizId: quiz.id,
        questionsCount: quiz.questions?.length,
        mcqQuestions: quiz.questions?.filter(q => q.type === 'mcq').map(q => ({
          id: q.id,
          type: q.type,
          options: q.options,
          optionsLength: q.options?.length,
          answer: q.answer
        }))
      });

      res.json({
        quizId: quiz.id,
        questions: quiz.questions,
        meta: quiz.meta
      });

    } catch (error) {
      console.error('Get quiz error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to get quiz' 
      });
    }
  });

  // Get upload endpoint (protected)
  app.get('/api/uploads/:uploadId', authenticateUser, async (req: AuthenticatedRequest, res) => {
    try {
      const { uploadId } = req.params;
      const userId = req.user!.id;
      
      const upload = await storage.getUpload(uploadId);
      if (!upload) {
        return res.status(404).json({ error: 'Upload not found' });
      }

      // Check if user owns this upload
      if (upload.userId !== userId) {
        return res.status(403).json({ error: 'Unauthorized access to upload' });
      }

      res.json({
        uploadId: upload.id,
        fileName: upload.fileName,
        fileSize: upload.fileSize,
        pageCount: upload.pageCount,
        uploadedAt: upload.uploadedAt
      });

    } catch (error) {
      console.error('Get upload error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to get upload' 
      });
    }
  });

  // Update quiz endpoint (protected)
  app.patch('/api/quizzes/:quizId', authenticateUser, async (req: AuthenticatedRequest, res) => {
    try {
      const { quizId } = req.params;
      const userId = req.user!.id;
      
      const quiz = await storage.getQuiz(quizId);
      if (!quiz) {
        return res.status(404).json({ error: 'Quiz not found' });
      }

      // Check if user owns this quiz
      if (quiz.userId !== userId) {
        return res.status(403).json({ error: 'Unauthorized access to quiz' });
      }

      const validatedData = updateQuizSchema.parse(req.body);
      const updatedQuiz = await storage.updateQuiz(quizId, validatedData);

      res.json({
        quizId: updatedQuiz.id,
        name: updatedQuiz.name,
        folder: updatedQuiz.folder,
        tags: updatedQuiz.tags,
        updatedAt: updatedQuiz.updatedAt
      });

    } catch (error) {
      console.error('Update quiz error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to update quiz' 
      });
    }
  });

  // Delete quiz endpoint (protected)
  app.delete('/api/quizzes/:quizId', authenticateUser, async (req: AuthenticatedRequest, res) => {
    try {
      const { quizId } = req.params;
      const userId = req.user!.id;
      
      console.log('Delete quiz request:', { quizId, userId });
      
      const quiz = await storage.getQuiz(quizId);
      if (!quiz) {
        console.log('Quiz not found:', quizId);
        return res.status(404).json({ error: 'Quiz not found' });
      }

      // Check if user owns this quiz
      if (quiz.userId !== userId) {
        console.log('Unauthorized access:', { quizUserId: quiz.userId, requestUserId: userId });
        return res.status(403).json({ error: 'Unauthorized access to quiz' });
      }

      console.log('Deleting quiz:', quizId);
      await storage.deleteQuiz(quizId);
      console.log('Quiz deleted successfully:', quizId);

      res.json({ message: 'Quiz deleted successfully' });

    } catch (error) {
      console.error('Delete quiz error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to delete quiz' 
      });
    }
  });

  // Get user's quiz folders endpoint (protected)
  app.get('/api/user/quiz-folders', authenticateUser, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const folders = await storage.getUserQuizFolders(userId);
      res.json(folders);
    } catch (error) {
      console.error("Error fetching quiz folders:", error);
      res.status(500).json({ message: "Failed to fetch quiz folders" });
    }
  });

  // Create quiz attempt endpoint (protected)
  app.post('/api/quiz-attempts', authenticateUser, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      console.log('Creating quiz attempt for user:', userId);
      console.log('Request body:', req.body);
      console.log('Auth header:', req.headers.authorization);
      
      const attemptData = {
        userId,
        ...req.body
      };

      console.log('Attempt data before validation:', attemptData);
      const validatedData = insertQuizAttemptSchema.parse(attemptData);
      console.log('Validated data:', validatedData);
      
      const attempt = await storage.createQuizAttempt(validatedData);
      console.log('Created attempt:', attempt);

      res.json({
        attemptId: attempt.id,
        score: attempt.score,
        totalQuestions: attempt.totalQuestions,
        percentage: attempt.percentage,
        completedAt: attempt.completedAt
      });

    } catch (error) {
      console.error('Create quiz attempt error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to save quiz attempt' 
      });
    }
  });

  // Get quiz attempts endpoint (protected)
  app.get('/api/quizzes/:quizId/attempts', authenticateUser, async (req: AuthenticatedRequest, res) => {
    try {
      const { quizId } = req.params;
      const userId = req.user!.id;
      
      const quiz = await storage.getQuiz(quizId);
      if (!quiz) {
        return res.status(404).json({ error: 'Quiz not found' });
      }

      // Check if user owns this quiz
      if (quiz.userId !== userId) {
        return res.status(403).json({ error: 'Unauthorized access to quiz' });
      }

      const attempts = await storage.getQuizAttempts(quizId);
      res.json(attempts);

    } catch (error) {
      console.error('Get quiz attempts error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to get quiz attempts' 
      });
    }
  });

  // Get latest quiz attempt endpoint (protected)
  app.get('/api/quizzes/:quizId/latest-attempt', authenticateUser, async (req: AuthenticatedRequest, res) => {
    try {
      const { quizId } = req.params;
      const userId = req.user!.id;
      
      console.log('Getting latest attempt for quiz:', quizId, 'user:', userId);
      
      const quiz = await storage.getQuiz(quizId);
      if (!quiz) {
        console.log('Quiz not found:', quizId);
        return res.status(404).json({ error: 'Quiz not found' });
      }

      // Check if user owns this quiz
      if (quiz.userId !== userId) {
        console.log('User does not own quiz:', userId, 'vs', quiz.userId);
        return res.status(403).json({ error: 'Unauthorized access to quiz' });
      }

      const attempt = await storage.getLatestQuizAttempt(quizId, userId);
      console.log('Latest attempt found:', attempt);
      
      if (!attempt) {
        return res.status(404).json({ error: 'No attempts found' });
      }

      res.json(attempt);

    } catch (error) {
      console.error('Get latest quiz attempt error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to get latest quiz attempt' 
      });
    }
  });

  // Get user statistics endpoint (protected)
  app.get('/api/user/statistics', authenticateUser, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      
      console.log('Getting user statistics for:', userId);
      
      // Get all user quizzes and attempts
      const [quizzes, attempts] = await Promise.all([
        storage.getUserQuizzes(userId),
        storage.getUserQuizAttempts(userId)
      ]);
      
      console.log('Statistics debug:', {
        userId,
        quizzesCount: quizzes.length,
        attemptsCount: attempts.length,
        quizzes: quizzes.map(q => ({ id: q.id, name: q.name, createdAt: q.createdAt })),
        attempts: attempts.map(a => ({ id: a.id, quizId: a.quizId, score: a.score, completedAt: a.completedAt }))
      });
      
      // Calculate statistics
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      // Quizzes completed this month
      const quizzesCompletedThisMonth = attempts.filter(attempt => 
        new Date(attempt.completedAt) >= startOfMonth
      ).length;
      
      
      // Calculate streaks (consecutive days with quiz completions)
      const sortedAttempts = attempts.sort((a, b) => 
        new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
      );
      
      let currentStreak = 0;
      let maxStreak = 0;
      let tempStreak = 0;
      let lastDate: Date | null = null;
      
      for (const attempt of sortedAttempts) {
        const attemptDate = new Date(attempt.completedAt);
        const attemptDateStr = attemptDate.toDateString();
        
        if (lastDate === null) {
          tempStreak = 1;
          lastDate = attemptDate;
        } else {
          const lastDateStr = lastDate.toDateString();
          const daysDiff = Math.floor((attemptDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysDiff === 1) {
            // Consecutive day
            tempStreak++;
          } else if (daysDiff === 0) {
            // Same day, don't break streak
            continue;
          } else {
            // Streak broken
            maxStreak = Math.max(maxStreak, tempStreak);
            tempStreak = 1;
          }
          lastDate = attemptDate;
        }
      }
      
      maxStreak = Math.max(maxStreak, tempStreak);
      
      // Calculate current streak (from most recent attempt)
      if (sortedAttempts.length > 0) {
        const mostRecentAttempt = sortedAttempts[sortedAttempts.length - 1];
        const mostRecentDate = new Date(mostRecentAttempt.completedAt);
        const daysSinceLastAttempt = Math.floor((now.getTime() - mostRecentDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysSinceLastAttempt <= 1) {
          // Check if there are consecutive days leading up to the most recent attempt
          currentStreak = 1;
          for (let i = sortedAttempts.length - 2; i >= 0; i--) {
            const currentAttemptDate = new Date(sortedAttempts[i].completedAt);
            const nextAttemptDate = new Date(sortedAttempts[i + 1].completedAt);
            const daysDiff = Math.floor((nextAttemptDate.getTime() - currentAttemptDate.getTime()) / (1000 * 60 * 60 * 24));
            
            if (daysDiff === 1) {
              currentStreak++;
            } else {
              break;
            }
          }
        }
      }
      
      // Accuracy rate (correct vs incorrect answers)
      const totalAnswers = attempts.reduce((sum, attempt) => sum + attempt.totalQuestions, 0);
      const correctAnswers = attempts.reduce((sum, attempt) => sum + attempt.score, 0);
      const accuracyRate = totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0;
      
      // Average score percentage
      const averageScore = attempts.length > 0 
        ? attempts.reduce((sum, attempt) => sum + attempt.percentage, 0) / attempts.length 
        : 0;
      
      // Total quizzes taken
      const totalQuizzesTaken = attempts.length;
      
      const statistics = {
        quizzesCompletedThisMonth,
        currentStreak,
        maxStreak,
        accuracyRate: Math.round(accuracyRate * 100) / 100,
        averageScore: Math.round(averageScore * 100) / 100,
        totalQuizzesTaken,
        totalQuizzesGenerated: quizzes.length
      };
      
      console.log('Calculated statistics:', statistics);
      res.json(statistics);
      
    } catch (error) {
      console.error('Get user statistics error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to get user statistics' 
      });
    }
  });

  // Debug endpoint to check user data
  app.get('/api/debug/user-data', authenticateUser, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      
      console.log('Debug: Getting user data for:', userId);
      
      const [quizzes, attempts] = await Promise.all([
        storage.getUserQuizzes(userId),
        storage.getUserQuizAttempts(userId)
      ]);
      
      res.json({
        userId,
        quizzesCount: quizzes.length,
        attemptsCount: attempts.length,
        quizzes: quizzes.map(q => ({ id: q.id, name: q.name, createdAt: q.createdAt })),
        attempts: attempts.map(a => ({ id: a.id, quizId: a.quizId, score: a.score, completedAt: a.completedAt }))
      });

    } catch (error) {
      console.error('Debug user data error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to get user data' 
      });
    }
  });

  // Debug endpoint to check all attempts for a quiz
  app.get('/api/debug/quizzes/:quizId/attempts', authenticateUser, async (req: AuthenticatedRequest, res) => {
    try {
      const { quizId } = req.params;
      const userId = req.user!.id;
      
      console.log('Debug: Getting all attempts for quiz:', quizId, 'user:', userId);
      
      const attempts = await storage.getQuizAttempts(quizId);
      console.log('All attempts for quiz:', attempts);
      
      res.json({ quizId, userId, attempts });

    } catch (error) {
      console.error('Debug get attempts error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to get attempts' 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
