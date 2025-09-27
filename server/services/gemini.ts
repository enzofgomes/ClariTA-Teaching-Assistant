import { GoogleGenAI } from "@google/genai";
import { type Question, type QuestionType, type Citation, type QuizMeta } from "@shared/schema";
import { randomUUID } from "crypto";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || "" 
});

export interface QuizGenerationRequest {
  textByPage: string[];
  numQuestions: number;
  questionTypes: {
    mcq: boolean;
    tf: boolean;
    fill: boolean;
  };
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
    const { textByPage, numQuestions, questionTypes } = request;
    
    console.log('Gemini service received:', { numQuestions, questionTypes });
    
    // Prepare content for Gemini
    const contentText = textByPage
      .map((text, index) => `Page ${index + 1}:\n${text}`)
      .join('\n\n');

    // Build question type distribution
    const enabledTypes = Object.entries(questionTypes)
      .filter(([_, enabled]) => enabled)
      .map(([type, _]) => type);
    
    console.log('Enabled question types:', enabledTypes);
    
    if (enabledTypes.length === 0) {
      throw new Error("At least one question type must be selected");
    }

    const typeDescriptions = {
      mcq: "Multiple Choice Questions (4 options each)",
      tf: "True/False Questions",
      fill: "Fill in the Blank Questions"
    };

    const enabledTypeDescriptions = enabledTypes.map(type => typeDescriptions[type as keyof typeof typeDescriptions]).join(", ");

    // Calculate distribution for each question type
    const questionsPerType = Math.floor(numQuestions / enabledTypes.length);
    const remainder = numQuestions % enabledTypes.length;
    
    const typeDistribution = enabledTypes.map((type, index) => ({
      type,
      count: questionsPerType + (index < remainder ? 1 : 0)
    }));

    const systemPrompt = `You are an expert quiz generator. Create a ${numQuestions}-question quiz from the provided lecture slides.

CRITICAL REQUIREMENTS:
1. Generate UNIQUE, VARIED questions - never repeat similar questions or answers
2. Use RANDOM selection of topics and concepts from different parts of the material
3. Vary question difficulty levels (easy, medium, hard)
4. Create questions that test different cognitive levels (remember, understand, apply, analyze)

Question Type Distribution:
${typeDistribution.map(t => `- ${t.type}: ${t.count} questions`).join('\n')}

For each question, provide:
- id: unique identifier (use random UUIDs)
- type: one of "${enabledTypes.join('", "')}"
- prompt: clear, varied question text (avoid repetitive phrasing)
- options: array of 4 choices (REQUIRED for all question types - use empty array [] for non-MCQ)
- answer: correct option index (MCQ), boolean (T/F), or correct answer text (Fill)
- explanation: 1-2 sentence explanation (max 200 chars)
- citations: array of {page: number, snippet: string} (max 120 chars per snippet)

CRITICAL: The "options" field is REQUIRED for all questions. For MCQ questions, provide exactly 4 options. For True/False and Fill-in-the-blank questions, provide an empty array [].

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

    // Add randomness to the content to ensure variety
    const randomSeed = Math.random().toString(36).substring(7);
    const timestamp = new Date().toISOString();
    const contentWithRandomness = `${contentText}\n\nRANDOM SEED: ${randomSeed}\nGENERATION TIME: ${timestamp}\nREQUEST ID: ${Math.random().toString(36).substring(2, 15)}`;
    
    console.log('Content with randomness added:', { randomSeed, timestamp });

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
                  },
                },
                required: ["id", "type", "prompt", "options", "answer", "explanation", "citations"]
              }
            }
          },
          required: ["questions"]
        }
      },
      contents: contentWithRandomness,
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

    // Validate that all generated questions use enabled types
    for (const question of processedQuestions) {
      if (!enabledTypes.includes(question.type)) {
        throw new Error(`Question type "${question.type}" is not enabled`);
      }
    }

    // Validate question type distribution
    console.log('Expected distribution:', typeDistribution);
    console.log('Actual distribution:', countsByType);

    // Check if distribution is close to expected (allow some flexibility)
    for (const expected of typeDistribution) {
      const actual = countsByType[expected.type as QuestionType] || 0;
      if (Math.abs(actual - expected.count) > 1) {
        console.warn(`Question type ${expected.type}: expected ${expected.count}, got ${actual}`);
      }
    }

    // Validate all questions have options field
    for (const question of processedQuestions) {
      if (!question.options || !Array.isArray(question.options)) {
        throw new Error(`Question ${question.id} is missing options array`);
      }
    }

    // Validate MCQ questions
    const mcqQuestions = processedQuestions.filter(q => q.type === 'mcq');
    for (const question of mcqQuestions) {
      // Check if MCQ has exactly 4 options
      if (!question.options || question.options.length !== 4) {
        throw new Error(`MCQ question ${question.id} must have exactly 4 options, got ${question.options?.length || 0}`);
      }
      
      // Check if answer is a valid index
      if (typeof question.answer !== 'number' || question.answer < 0 || question.answer >= 4) {
        throw new Error(`MCQ question ${question.id} answer must be a number between 0-3, got ${question.answer}`);
      }
      
      // Check if options are not empty
      for (let i = 0; i < question.options.length; i++) {
        if (!question.options[i] || !question.options[i].trim()) {
          throw new Error(`MCQ question ${question.id} option ${i} is empty`);
        }
      }
    }

    // Validate non-MCQ questions have empty options
    const nonMcqQuestions = processedQuestions.filter(q => q.type !== 'mcq');
    for (const question of nonMcqQuestions) {
      if (!question.options || question.options.length !== 0) {
        console.warn(`Non-MCQ question ${question.id} has options but should have empty array`);
        // Don't throw error, just fix it
        question.options = [];
      }
    }

    // Validate fill-in-the-blank questions
    const fillQuestions = processedQuestions.filter(q => q.type === 'fill');
    for (const question of fillQuestions) {
      // Check if prompt contains blanks
      if (!question.prompt.includes('_____') && !question.prompt.includes('______')) {
        console.warn(`Fill-in-the-blank question ${question.id} missing blank indicators`);
      }
      
      // Check if answer is a string and not too long
      if (typeof question.answer !== 'string') {
        throw new Error(`Fill-in-the-blank question ${question.id} answer must be a string`);
      }
      
      if (question.answer.length > 50) {
        console.warn(`Fill-in-the-blank question ${question.id} answer is too long: ${question.answer.length} chars`);
      }
      
      // Check if answer is reasonable (not empty, not just spaces)
      if (!question.answer.trim()) {
        throw new Error(`Fill-in-the-blank question ${question.id} has empty answer`);
      }
    }

    const meta: QuizMeta = {
      uploadId,
      createdAt: new Date().toISOString(),
      countsByType
    };

    return {
      questions: processedQuestions,
      meta
    };

  } catch (error) {
    throw new Error(`Failed to generate quiz: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
