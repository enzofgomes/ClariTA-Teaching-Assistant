import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { parsePDF } from "./services/pdf";
import { generateQuiz } from "./services/gemini";
import { insertUploadSchema, insertQuizSchema } from "@shared/schema";
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

  const httpServer = createServer(app);
  return httpServer;
}
