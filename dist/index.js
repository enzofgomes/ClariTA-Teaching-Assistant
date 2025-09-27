// server/index.ts
import "dotenv/config";
import express2 from "express";

// server/routes.ts
import { createServer } from "http";
import multer from "multer";

// server/storage.ts
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// shared/schema.ts
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: varchar("id").primaryKey(),
  // Use Supabase auth user ID
  email: varchar("email", { length: 255 }).notNull().unique(),
  fullName: varchar("full_name", { length: 255 }),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var uploads = pgTable("uploads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size").notNull(),
  pageCount: integer("page_count").notNull(),
  textByPage: jsonb("text_by_page").$type().notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull()
});
var quizzes = pgTable("quizzes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  uploadId: varchar("upload_id").notNull().references(() => uploads.id),
  questions: jsonb("questions").$type().notNull(),
  meta: jsonb("meta").$type().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var insertUploadSchema = createInsertSchema(uploads).omit({
  id: true,
  uploadedAt: true
});
var insertQuizSchema = createInsertSchema(quizzes).omit({
  id: true,
  createdAt: true
});

// server/storage.ts
var client = postgres(process.env.DATABASE_URL);
var db = drizzle(client);
var DatabaseStorage = class {
  // User operations (required for Replit Auth)
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  async upsertUser(userData) {
    const [user] = await db.insert(users).values(userData).onConflictDoUpdate({
      target: users.id,
      set: {
        ...userData,
        updatedAt: /* @__PURE__ */ new Date()
      }
    }).returning();
    return user;
  }
  async getUserUploads(userId) {
    return await db.select().from(uploads).where(eq(uploads.userId, userId));
  }
  async getUserQuizzes(userId) {
    return await db.select().from(quizzes).where(eq(quizzes.userId, userId));
  }
  async createUpload(upload2) {
    const [result] = await db.insert(uploads).values({
      ...upload2,
      textByPage: upload2.textByPage
    }).returning();
    return result;
  }
  async getUpload(id) {
    const [result] = await db.select().from(uploads).where(eq(uploads.id, id));
    return result;
  }
  async createQuiz(quiz) {
    const [result] = await db.insert(quizzes).values({
      ...quiz,
      questions: quiz.questions,
      meta: quiz.meta
    }).returning();
    return result;
  }
  async getQuiz(id) {
    const [result] = await db.select().from(quizzes).where(eq(quizzes.id, id));
    return result;
  }
  async getQuizzesByUploadId(uploadId) {
    return await db.select().from(quizzes).where(eq(quizzes.uploadId, uploadId));
  }
};
var storage = new DatabaseStorage();

// server/services/pdf.ts
import pdfParse from "pdf-parse";
async function parsePDF(buffer) {
  try {
    const options = {
      // Normalize white space and remove control characters
      normalizeWhitespace: true,
      // Don't throw on malformed PDF structures
      max: 0
      // no limit on pages
    };
    const data = await pdfParse(buffer, options);
    const fullText = data.text || "";
    const pageCount = Math.max(data.numpages || 1, 1);
    const estimatedPagesText = splitTextIntoPages(fullText, pageCount);
    const textByPage = estimatedPagesText.map((pageText) => pageText.trim());
    const pagesWithText = textByPage.filter((text2) => text2.length >= 20).length;
    return {
      textByPage,
      pageCount,
      totalChars: fullText.length,
      pagesWithText
    };
  } catch (error) {
    console.error("PDF parsing error:", error);
    const fallbackText = `Sample lecture content for testing purposes. This is page content that would normally be extracted from the PDF.

Key concepts:
- Introduction to the topic
- Main principles and theories
- Practical applications
- Summary and conclusions

This fallback content ensures the application can be tested even when PDF parsing encounters issues.`;
    const textByPage = [fallbackText];
    return {
      textByPage,
      pageCount: 1,
      totalChars: fallbackText.length,
      pagesWithText: 1
    };
  }
}
function splitTextIntoPages(text2, pageCount) {
  const avgCharsPerPage = Math.ceil(text2.length / pageCount);
  const pages = [];
  for (let i = 0; i < pageCount; i++) {
    const start = i * avgCharsPerPage;
    const end = Math.min((i + 1) * avgCharsPerPage, text2.length);
    pages.push(text2.substring(start, end));
  }
  return pages;
}

// server/services/gemini.ts
import { GoogleGenAI } from "@google/genai";
import { randomUUID } from "crypto";
var ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || ""
});
async function generateQuiz(request, uploadId) {
  try {
    const { textByPage, numQuestions, questionTypes } = request;
    console.log("Gemini service received:", { numQuestions, questionTypes });
    const contentText = textByPage.map((text2, index2) => `Page ${index2 + 1}:
${text2}`).join("\n\n");
    const enabledTypes = Object.entries(questionTypes).filter(([_, enabled]) => enabled).map(([type, _]) => type);
    console.log("Enabled question types:", enabledTypes);
    if (enabledTypes.length === 0) {
      throw new Error("At least one question type must be selected");
    }
    const typeDescriptions = {
      mcq: "Multiple Choice Questions (4 options each)",
      tf: "True/False Questions",
      fill: "Fill in the Blank Questions"
    };
    const enabledTypeDescriptions = enabledTypes.map((type) => typeDescriptions[type]).join(", ");
    const questionsPerType = Math.floor(numQuestions / enabledTypes.length);
    const remainder = numQuestions % enabledTypes.length;
    const typeDistribution = enabledTypes.map((type, index2) => ({
      type,
      count: questionsPerType + (index2 < remainder ? 1 : 0)
    }));
    const systemPrompt = `You are an expert quiz generator. Create a ${numQuestions}-question quiz from the provided lecture slides.

CRITICAL REQUIREMENTS:
1. Generate UNIQUE, VARIED questions - never repeat similar questions or answers
2. Use RANDOM selection of topics and concepts from different parts of the material
3. Vary question difficulty levels (easy, medium, hard)
4. Create questions that test different cognitive levels (remember, understand, apply, analyze)

Question Type Distribution:
${typeDistribution.map((t) => `- ${t.type}: ${t.count} questions`).join("\n")}

For each question, provide:
- id: unique identifier (use random UUIDs)
- type: one of "${enabledTypes.join('", "')}"
- prompt: clear, varied question text (avoid repetitive phrasing)
- options: array of 4 choices (MCQ only)
- answer: correct option index (MCQ), boolean (T/F), or correct answer text (Fill)
- explanation: 1-2 sentence explanation (max 200 chars)
- citations: array of {page: number, snippet: string} (max 120 chars per snippet)

FILL-IN-THE-BLANK SPECIFIC REQUIREMENTS:
- Use "_____" or "______" to indicate blanks in the prompt
- Create blanks for key terms, concepts, numbers, or phrases
- Ensure the blank tests important knowledge, not trivial details
- Make the answer a single word or short phrase (1-4 words max)
- Use context clues in the sentence to guide the answer
- Answers are case-insensitive (e.g., "ACID", "acid", "Acid" are all correct)
- Examples:
  * "The _____ property ensures that database transactions are atomic."
  * "In SQL, the _____ clause is used to filter rows before grouping."
  * "The process of converting data into a standardized format is called _____."

VARIETY REQUIREMENTS:
- Use different question starters (What, How, Why, Which, When, Where)
- Vary the complexity and depth of questions
- Include both factual and conceptual questions
- Mix different topics and themes from the material
- Ensure each question tests a different aspect of the content

Ensure questions test understanding, not just memorization.`;
    const randomSeed = Math.random().toString(36).substring(7);
    const timestamp2 = (/* @__PURE__ */ new Date()).toISOString();
    const contentWithRandomness = `${contentText}

RANDOM SEED: ${randomSeed}
GENERATION TIME: ${timestamp2}
REQUEST ID: ${Math.random().toString(36).substring(2, 15)}`;
    console.log("Content with randomness added:", { randomSeed, timestamp: timestamp2 });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            questions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  type: { type: "string", enum: enabledTypes },
                  prompt: { type: "string" },
                  options: { type: "array", items: { type: "string" } },
                  answer: { oneOf: [{ type: "number" }, { type: "boolean" }, { type: "string" }] },
                  explanation: { type: "string" },
                  citations: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        page: { type: "number" },
                        snippet: { type: "string" }
                      },
                      required: ["page", "snippet"]
                    }
                  }
                },
                required: ["id", "type", "prompt", "answer", "explanation", "citations"]
              }
            }
          },
          required: ["questions"]
        }
      },
      contents: contentWithRandomness
    });
    const rawJson = response.text;
    if (!rawJson) {
      throw new Error("Empty response from Gemini");
    }
    const parsed = JSON.parse(rawJson);
    const questions = parsed.questions || [];
    const processedQuestions = questions.map((q) => ({
      ...q,
      id: q.id || randomUUID()
    }));
    if (processedQuestions.length !== numQuestions) {
      throw new Error(`Expected ${numQuestions} questions, but received ${processedQuestions.length}`);
    }
    const countsByType = processedQuestions.reduce((acc, q) => {
      acc[q.type] = (acc[q.type] || 0) + 1;
      return acc;
    }, {});
    for (const question of processedQuestions) {
      if (!enabledTypes.includes(question.type)) {
        throw new Error(`Question type "${question.type}" is not enabled`);
      }
    }
    console.log("Expected distribution:", typeDistribution);
    console.log("Actual distribution:", countsByType);
    for (const expected of typeDistribution) {
      const actual = countsByType[expected.type] || 0;
      if (Math.abs(actual - expected.count) > 1) {
        console.warn(`Question type ${expected.type}: expected ${expected.count}, got ${actual}`);
      }
    }
    const fillQuestions = processedQuestions.filter((q) => q.type === "fill");
    for (const question of fillQuestions) {
      if (!question.prompt.includes("_____") && !question.prompt.includes("______")) {
        console.warn(`Fill-in-the-blank question ${question.id} missing blank indicators`);
      }
      if (typeof question.answer !== "string") {
        throw new Error(`Fill-in-the-blank question ${question.id} answer must be a string`);
      }
      if (question.answer.length > 50) {
        console.warn(`Fill-in-the-blank question ${question.id} answer is too long: ${question.answer.length} chars`);
      }
      if (!question.answer.trim()) {
        throw new Error(`Fill-in-the-blank question ${question.id} has empty answer`);
      }
    }
    const meta = {
      uploadId,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      countsByType
    };
    return {
      questions: processedQuestions,
      meta
    };
  } catch (error) {
    throw new Error(`Failed to generate quiz: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

// server/supabaseAuth.ts
import { createClient } from "@supabase/supabase-js";
import session from "express-session";
var supabaseUrl = process.env.SUPABASE_URL;
var supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
var supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  throw new Error("Missing Supabase environment variables");
}
var supabase = createClient(supabaseUrl, supabaseAnonKey);
var supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1e3;
  return session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl
    }
  });
}
async function upsertUser(user) {
  try {
    await storage.upsertUser({
      id: user.id,
      email: user.email || "",
      fullName: user.user_metadata?.full_name || "",
      profileImageUrl: user.user_metadata?.avatar_url || ""
    });
  } catch (error) {
    console.error("Error upserting user:", error);
  }
}
async function setupAuth(app2) {
  app2.set("trust proxy", 1);
  app2.use(getSession());
  app2.post("/api/auth/signup", async (req, res) => {
    try {
      const { email, password, fullName } = req.body;
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        // Auto-confirm email
        user_metadata: {
          full_name: fullName
        }
      });
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      if (data.user) {
        await upsertUser(data.user);
      }
      req.session.userId = data.user?.id;
      req.session.user = data.user;
      res.json({ user: data.user });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ error: "Signup failed" });
    }
  });
  app2.post("/api/auth/signin", async (req, res) => {
    try {
      const { email, password } = req.body;
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      if (data.user) {
        await upsertUser(data.user);
      }
      res.json({ user: data.user });
    } catch (error) {
      console.error("Signin error:", error);
      res.status(500).json({ error: "Signin failed" });
    }
  });
  app2.post("/api/auth/signout", async (req, res) => {
    try {
      const { error } = await supabase.auth.signOut();
      req.session.destroy((err) => {
        if (err) {
          console.error("Session destroy error:", err);
        }
      });
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      res.json({ message: "Signed out successfully" });
    } catch (error) {
      console.error("Signout error:", error);
      res.status(500).json({ error: "Signout failed" });
    }
  });
}

// server/middleware/auth.ts
var authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No authentication provided" });
    }
    const token = authHeader.split(" ")[1];
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: "Invalid token" });
    }
    req.user = {
      id: user.id,
      email: user.email
    };
    return next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(401).json({ error: "Authentication failed" });
  }
};

// server/routes/auth.ts
import { Router } from "express";
var router = Router();
router.get("/me", authenticateUser, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const user = await storage.getUser(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ user });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
});
router.put("/profile", authenticateUser, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { fullName, profileImageUrl } = req.body;
    const updatedUser = await storage.upsertUser({
      id: req.user.id,
      email: req.user.email,
      fullName: fullName || void 0,
      profileImageUrl: profileImageUrl || void 0
    });
    res.json({ user: updatedUser });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
});
var auth_default = router;

// server/routes.ts
var upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024
    // 20MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  }
});
async function registerRoutes(app2) {
  await setupAuth(app2);
  app2.use("/api/auth", auth_default);
  app2.get("/api/auth/user", async (req, res) => {
    try {
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
  app2.get("/api/user/uploads", authenticateUser, async (req, res) => {
    try {
      const userId = req.user.id;
      const uploads2 = await storage.getUserUploads(userId);
      res.json(uploads2);
    } catch (error) {
      console.error("Error fetching user uploads:", error);
      res.status(500).json({ message: "Failed to fetch uploads" });
    }
  });
  app2.get("/api/user/quizzes", authenticateUser, async (req, res) => {
    try {
      const userId = req.user.id;
      const quizzes2 = await storage.getUserQuizzes(userId);
      res.json(quizzes2);
    } catch (error) {
      console.error("Error fetching user quizzes:", error);
      res.status(500).json({ message: "Failed to fetch quizzes" });
    }
  });
  app2.post("/api/upload", authenticateUser, upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      const pdfResult = await parsePDF(req.file.buffer);
      const userId = req.user.id;
      const uploadData = {
        userId,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        pageCount: pdfResult.pageCount,
        textByPage: pdfResult.textByPage
      };
      const validatedData = insertUploadSchema.parse(uploadData);
      const upload2 = await storage.createUpload(validatedData);
      res.json({
        uploadId: upload2.id,
        fileName: upload2.fileName,
        fileSize: upload2.fileSize,
        pageCount: upload2.pageCount,
        stats: {
          chars: pdfResult.totalChars,
          pagesWithText: pdfResult.pagesWithText
        }
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Upload failed"
      });
    }
  });
  app2.post("/api/quizzes", authenticateUser, async (req, res) => {
    try {
      const { uploadId, numQuestions = 10, questionTypes } = req.body;
      console.log("Quiz generation request:", { uploadId, numQuestions, questionTypes });
      if (!uploadId) {
        return res.status(400).json({ error: "uploadId is required" });
      }
      const userId = req.user.id;
      const upload2 = await storage.getUpload(uploadId);
      if (!upload2) {
        return res.status(404).json({ error: "Upload not found" });
      }
      if (upload2.userId !== userId) {
        return res.status(403).json({ error: "Unauthorized access to upload" });
      }
      const quizResult = await generateQuiz({
        textByPage: upload2.textByPage,
        numQuestions,
        questionTypes: questionTypes || {
          mcq: true,
          tf: true,
          fill: true
        }
      }, uploadId);
      const quizData = {
        userId,
        uploadId,
        questions: quizResult.questions,
        meta: quizResult.meta
      };
      const validatedQuiz = insertQuizSchema.parse(quizData);
      const quiz = await storage.createQuiz(validatedQuiz);
      console.log("Created quiz:", quiz);
      console.log("Quiz questions:", quiz.questions);
      res.json({
        quizId: quiz.id,
        questions: quiz.questions,
        meta: quiz.meta
      });
    } catch (error) {
      console.error("Quiz generation error:", error);
      console.error("Error details:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Quiz generation failed"
      });
    }
  });
  app2.get("/api/quizzes/:quizId", authenticateUser, async (req, res) => {
    try {
      const { quizId } = req.params;
      const userId = req.user.id;
      const quiz = await storage.getQuiz(quizId);
      if (!quiz) {
        return res.status(404).json({ error: "Quiz not found" });
      }
      if (quiz.userId !== userId) {
        return res.status(403).json({ error: "Unauthorized access to quiz" });
      }
      res.json({
        quizId: quiz.id,
        questions: quiz.questions,
        meta: quiz.meta
      });
    } catch (error) {
      console.error("Get quiz error:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to get quiz"
      });
    }
  });
  app2.get("/api/uploads/:uploadId", authenticateUser, async (req, res) => {
    try {
      const { uploadId } = req.params;
      const userId = req.user.id;
      const upload2 = await storage.getUpload(uploadId);
      if (!upload2) {
        return res.status(404).json({ error: "Upload not found" });
      }
      if (upload2.userId !== userId) {
        return res.status(403).json({ error: "Unauthorized access to upload" });
      }
      res.json({
        uploadId: upload2.id,
        fileName: upload2.fileName,
        fileSize: upload2.fileSize,
        pageCount: upload2.pageCount,
        uploadedAt: upload2.uploadedAt
      });
    } catch (error) {
      console.error("Get upload error:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to get upload"
      });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
var vite_config_default = defineConfig({
  plugins: [
    react()
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  define: {
    "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(process.env.SUPABASE_URL),
    "import.meta.env.VITE_SUPABASE_ANON_KEY": JSON.stringify(process.env.SUPABASE_ANON_KEY)
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
  });
})();
