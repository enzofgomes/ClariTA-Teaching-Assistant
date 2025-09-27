import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle, XCircle, Brain, Trophy, Calendar } from "lucide-react";
import { authenticatedFetch } from "@/lib/api";
import type { Quiz, Question } from "@/types/quiz";

interface QuizAttemptAnswer {
  questionId: string;
  userAnswer: number | boolean | string;
  correctAnswer: number | boolean | string;
  isCorrect: boolean;
}

interface QuizAttempt {
  id: string;
  userId: string;
  quizId: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  answers: QuizAttemptAnswer[];
  completedAt: string;
}

export default function QuizResultsPage() {
  const { quizId } = useParams();
  const [, setLocation] = useLocation();

  const { data: quiz, isLoading: quizLoading } = useQuery<Quiz>({
    queryKey: ["/api/quizzes", quizId],
    queryFn: async () => {
      console.log('Fetching quiz data for quizId:', quizId);
      const response = await authenticatedFetch(`/api/quizzes/${quizId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch quiz');
      }
      const quizData = await response.json();
      console.log('Quiz data fetched:', quizData);
      return quizData;
    },
    enabled: !!quizId,
  });

  const { data: attempt, isLoading: attemptLoading } = useQuery<QuizAttempt>({
    queryKey: ["/api/quizzes", quizId, "latest-attempt"],
    queryFn: async () => {
      console.log('Fetching attempt data for quizId:', quizId);
      const response = await authenticatedFetch(`/api/quizzes/${quizId}/latest-attempt`);
      if (!response.ok) {
        throw new Error('Failed to fetch quiz attempt');
      }
      const attemptData = await response.json();
      console.log('Attempt data fetched:', attemptData);
      return attemptData;
    },
    enabled: !!quizId,
  });

  if (quizLoading || attemptLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading quiz results...</div>
      </div>
    );
  }

  if (!quiz || !attempt) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Quiz Results Not Found</h2>
          <p className="text-gray-600 mb-4">
            The quiz or your attempt results could not be found.
          </p>
          <Button onClick={() => setLocation("/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadgeVariant = (percentage: number) => {
    if (percentage >= 80) return "default";
    if (percentage >= 60) return "secondary";
    return "destructive";
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setLocation("/dashboard")}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Brain className="text-primary-foreground text-sm" />
              </div>
              <h1 className="text-xl font-semibold text-foreground">ClariTA</h1>
              <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded-full">
                Quiz Results
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Quiz Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                {quiz.name || `Quiz Results`}
              </CardTitle>
              <CardDescription>
                Completed on {new Date(attempt.completedAt).toLocaleDateString()} at {new Date(attempt.completedAt).toLocaleTimeString()}
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Score Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Quiz Complete!</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center space-x-8 mb-6">
                <div className="text-center">
                  <div className={`text-4xl font-bold ${getScoreColor(attempt.percentage)}`}>
                    {attempt.percentage}%
                  </div>
                  <div className="text-sm text-muted-foreground">Score</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-foreground">
                    {attempt.score}/{attempt.totalQuestions}
                  </div>
                  <div className="text-sm text-muted-foreground">Correct</div>
                </div>
              </div>
              
              <div className="flex justify-center">
                <Badge variant={getScoreBadgeVariant(attempt.percentage)} className="text-lg px-4 py-2">
                  {attempt.percentage >= 80 ? "Excellent!" : 
                   attempt.percentage >= 60 ? "Good Job!" : 
                   "Keep Practicing!"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Answer Key */}
          <Card>
            <CardHeader>
              <CardTitle>Answer Key</CardTitle>
              <CardDescription>
                Review your answers and explanations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {quiz.questions.map((question, index) => {
                  const attemptAnswer = attempt.answers.find(a => a.questionId === question.id);
                  if (!attemptAnswer) return null;
                  
                  // Debug: Log the question structure for MCQ questions
                  if (question.type === 'mcq') {
                    console.log(`Question ${index + 1}:`, {
                      id: question.id,
                      type: question.type,
                      options: question.options,
                      optionsLength: question.options?.length,
                      userAnswer: attemptAnswer.userAnswer,
                      userAnswerType: typeof attemptAnswer.userAnswer,
                      correctAnswer: question.answer,
                      correctAnswerType: typeof question.answer,
                      userAnswerText: question.options && question.options.length > 0 ? question.options[attemptAnswer.userAnswer as number] : 'NO OPTIONS',
                      correctAnswerText: question.options && question.options.length > 0 ? question.options[question.answer as number] : 'NO OPTIONS'
                    });
                  }

                  return (
                    <div key={question.id} className="border rounded-lg p-4">
                      <div className="flex items-start gap-3 mb-3">
                        {attemptAnswer.isCorrect ? (
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <h3 className="font-medium text-foreground mb-2">
                            Question {index + 1}: {question.prompt}
                          </h3>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Your Answer:</span>
                              <span className={`px-2 py-1 rounded ${
                                attemptAnswer.isCorrect 
                                  ? "bg-green-100 text-green-800" 
                                  : "bg-red-100 text-red-800"
                              }`}>
                                {(() => {
                                  console.log('Rendering user answer for question:', question.id, {
                                    type: question.type,
                                    userAnswer: attemptAnswer.userAnswer,
                                    options: question.options,
                                    optionsLength: question.options?.length
                                  });
                                  
                                  if (question.type === 'mcq') {
                                    if (question.options && question.options.length > 0) {
                                      const optionIndex = attemptAnswer.userAnswer as number;
                                      if (optionIndex >= 0 && optionIndex < question.options.length) {
                                        const selectedOption = question.options[optionIndex];
                                        console.log('Selected option:', selectedOption, 'for index:', optionIndex);
                                        return selectedOption;
                                      } else {
                                        return `Option ${optionIndex + 1} (Invalid Index)`;
                                      }
                                    } else {
                                      return `Option ${(attemptAnswer.userAnswer as number) + 1} (Options Missing)`;
                                    }
                                  }
                                  return String(attemptAnswer.userAnswer);
                                })()}
                              </span>
                            </div>
                            
                            {!attemptAnswer.isCorrect && (
                              <div className="flex items-center gap-2">
                                <span className="font-medium">Correct Answer:</span>
                                <span className="px-2 py-1 rounded bg-green-100 text-green-800">
                                  {(() => {
                                    console.log('Rendering correct answer for question:', question.id, {
                                      type: question.type,
                                      correctAnswer: question.answer,
                                      options: question.options,
                                      optionsLength: question.options?.length
                                    });
                                    
                                    if (question.type === 'mcq') {
                                      if (question.options && question.options.length > 0) {
                                        const answerIndex = question.answer as number;
                                        if (answerIndex >= 0 && answerIndex < question.options.length) {
                                          const correctOption = question.options[answerIndex];
                                          console.log('Correct option:', correctOption, 'for index:', answerIndex);
                                          return correctOption;
                                        } else {
                                          return `Option ${answerIndex + 1} (Invalid Index)`;
                                        }
                                      } else {
                                        return `Option ${(question.answer as number) + 1} (Options Missing)`;
                                      }
                                    }
                                    return String(question.answer);
                                  })()}
                                </span>
                              </div>
                            )}
                            
                            <div className="mt-3 p-3 bg-muted rounded">
                              <span className="font-medium">Explanation:</span> {question.explanation}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-center space-x-4">
            <Button 
              variant="outline" 
              onClick={() => setLocation(`/quiz/${quizId}`)}
            >
              Retake Quiz
            </Button>
            <Button onClick={() => setLocation("/dashboard")}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
