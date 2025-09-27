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

export type Quiz = {
  quizId: string;
  questions: Question[];
  meta: QuizMeta;
};

export type Upload = {
  uploadId: string;
  fileName: string;
  fileSize: number;
  pageCount: number;
  stats?: {
    chars: number;
    pagesWithText: number;
  };
};
