import { GoogleGenAI } from "@google/genai";
import { type Question, type QuestionType, type Citation, type QuizMeta } from "@shared/schema";
import { randomUUID } from "crypto";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || "" 
});

export interface QuizGenerationRequest {
  textByPage: string[];
  numQuestions: number;
}

export interface QuizGenerationResult {
  questions: Question[];
  meta: QuizMeta;
}

export async function generateQuiz(
  request: QuizGenerationRequest,
  uploadId: string
): Promise<QuizGenerationResult> {
  try {
    const { textByPage, numQuestions } = request;
    
    // Prepare content for Gemini
    const contentText = textByPage
      .map((text, index) => `Page ${index + 1}:\n${text}`)
      .join('\n\n');

    const systemPrompt = `You are an expert quiz generator. Create a ${numQuestions}-question quiz from the provided lecture slides.

Distribution: 6 MCQ, 2 True/False, 2 Short Answer questions.

For each question, provide:
- id: unique identifier
- type: "mcq", "tf", or "short"
- prompt: clear question text
- options: array of 4 choices (MCQ only)
- answer: correct option index (MCQ), boolean (T/F), or sample answer text (Short)
- explanation: 1-2 sentence explanation (max 200 chars)
- citations: array of {page: number, snippet: string} (max 120 chars per snippet)
- confidence: 0-1 rating of question quality

Ensure questions test understanding, not just memorization.`;

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
                  type: { type: "string", enum: ["mcq", "tf", "short"] },
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
                  },
                  confidence: { type: "number" }
                },
                required: ["id", "type", "prompt", "answer", "explanation", "citations", "confidence"]
              }
            }
          },
          required: ["questions"]
        }
      },
      contents: contentText,
    });

    const rawJson = response.text;
    if (!rawJson) {
      throw new Error("Empty response from Gemini");
    }

    const parsed = JSON.parse(rawJson);
    const questions: Question[] = parsed.questions || [];

    // Ensure we have the right distribution and add IDs if missing
    const processedQuestions = questions.map(q => ({
      ...q,
      id: q.id || randomUUID()
    }));

    // Validate question count and distribution
    if (processedQuestions.length !== numQuestions) {
      throw new Error(`Expected ${numQuestions} questions, but received ${processedQuestions.length}`);
    }

    // Calculate statistics
    const countsByType = processedQuestions.reduce((acc, q) => {
      acc[q.type] = (acc[q.type] || 0) + 1;
      return acc;
    }, {} as Record<QuestionType, number>);

    // Validate exact distribution for 10-question quizzes
    if (numQuestions === 10) {
      const expectedCounts = { mcq: 6, tf: 2, short: 2 };
      for (const [type, expectedCount] of Object.entries(expectedCounts)) {
        const actualCount = countsByType[type as QuestionType] || 0;
        if (actualCount !== expectedCount) {
          throw new Error(`Expected ${expectedCount} ${type} questions, but received ${actualCount}`);
        }
      }
    }

    // Guard against division by zero
    const avgConfidence = processedQuestions.length > 0 
      ? processedQuestions.reduce((sum, q) => sum + q.confidence, 0) / processedQuestions.length
      : 0;

    const meta: QuizMeta = {
      uploadId,
      createdAt: new Date().toISOString(),
      countsByType,
      avgConfidence
    };

    return {
      questions: processedQuestions,
      meta
    };

  } catch (error) {
    throw new Error(`Failed to generate quiz: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
