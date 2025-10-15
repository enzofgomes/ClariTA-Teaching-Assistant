import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { QuizCard } from "@/components/QuizCard";
import { Toolbar } from "@/components/Toolbar";
import { GraduationCap, ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import { authenticatedFetch } from "@/lib/api";
import Logo from "@/components/Logo";
import type { Quiz, Question } from "@/types/quiz";

interface QuizAnswer {
  questionId: string;
  answer: number | boolean | string;
}

interface QuizResult {
  score: number;
  totalQuestions: number;
  percentage: number;
  answers: Array<{
    questionId: string;
    userAnswer: number | boolean | string;
    correctAnswer: number | boolean | string;
    isCorrect: boolean;
  }>;
}

export default function QuizPage() {
  const { quizId } = useParams();
  const [, setLocation] = useLocation();
  const [userAnswers, setUserAnswers] = useState<Record<string, number | boolean | string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const saveAttemptMutation = useMutation({
    mutationFn: async (attemptData: any) => {
      console.log("Saving quiz attempt:", attemptData);
      const response = await authenticatedFetch("/api/quiz-attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(attemptData),
      });
      if (!response.ok) {
        let errorText;
        try {
          errorText = await response.text();
        } catch (e) {
          errorText = "Unknown error";
        }
        console.error("Failed to save quiz attempt:", response.status, errorText);
        throw new Error(`Failed to save quiz attempt: ${response.status} - ${errorText}`);
      }
      
      let result;
      try {
        result = await response.json();
        console.log("Quiz attempt saved successfully:", result);
      } catch (e) {
        console.error("Failed to parse response as JSON:", e);
        throw new Error("Invalid response format from server");
      }
      return result;
    },
    onSuccess: (data) => {
      console.log("Quiz attempt saved successfully:", data);
    },
    onError: (error) => {
      console.error("Failed to save quiz attempt:", error);
      toast({
        title: "Warning",
        description: "Quiz completed but results may not be saved properly.",
        variant: "destructive",
      });
    },
  });

  const { data: quiz, isLoading, error } = useQuery<Quiz>({
    queryKey: ["/api/quizzes", quizId],
    queryFn: async () => {
      const response = await authenticatedFetch(`/api/quizzes/${quizId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch quiz');
      }
      return response.json();
    },
    enabled: !!quizId,
  });

  const updateAnswer = (questionId: string, answer: number | boolean | string) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const submitQuiz = () => {
    if (!quiz) return;

    const answeredQuestions = Object.keys(userAnswers).length;
    if (answeredQuestions < quiz.questions.length) {
      toast({
        title: "Incomplete Quiz",
        description: `Please answer all ${quiz.questions.length} questions before submitting.`,
        variant: "destructive",
      });
      return;
    }

    // Calculate results
    let correctCount = 0;
    const results = quiz.questions.map(question => {
      const userAnswer = userAnswers[question.id];
      let isCorrect: boolean;
      
      // Handle case-insensitive comparison for fill-in-the-blank questions
      if (question.type === 'fill' && typeof userAnswer === 'string' && typeof question.answer === 'string') {
        isCorrect = userAnswer.toLowerCase().trim() === question.answer.toLowerCase().trim();
      } else {
        isCorrect = JSON.stringify(userAnswer) === JSON.stringify(question.answer);
      }
      
      if (isCorrect) correctCount++;
      
      return {
        questionId: question.id,
        userAnswer,
        correctAnswer: question.answer,
        isCorrect
      };
    });

    const percentage = Math.round((correctCount / quiz.questions.length) * 100);
    
    const result: QuizResult = {
      score: correctCount,
      totalQuestions: quiz.questions.length,
      percentage,
      answers: results
    };

    setQuizResult(result);
    setIsSubmitted(true);

    // Save the quiz attempt
    saveAttemptMutation.mutate({
      quizId: quiz.quizId,
      score: correctCount,
      totalQuestions: quiz.questions.length,
      percentage,
      answers: results
    });

    toast({
      title: "Quiz Submitted!",
      description: `You scored ${correctCount}/${quiz.questions.length} (${percentage}%)`,
    });
  };

  const regenerateQuizMutation = useMutation({
    mutationFn: async (quizId: string) => {
      const response = await authenticatedFetch(`/api/quizzes/${quizId}/regenerate`, {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error('Failed to regenerate quiz');
      }
      return response.json();
    },
    onSuccess: (newQuiz) => {
      // Reset the quiz state with new questions
      setUserAnswers({});
      setIsSubmitted(false);
      setQuizResult(null);
      
      // Invalidate the quiz query to refetch with new questions
      queryClient.invalidateQueries({ queryKey: ["/api/quizzes", quizId] });
      
      toast({
        title: "Quiz Regenerated!",
        description: "New questions have been generated for better learning.",
      });
    },
    onError: (error) => {
      console.error('Failed to regenerate quiz:', error);
      
      // Check if it's a quota error
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const isQuotaError = errorMessage.includes('quota') || errorMessage.includes('limit');
      
      toast({
        title: "Regeneration Failed",
        description: isQuotaError 
          ? "API quota exceeded. Please try again tomorrow or upgrade your plan."
          : "Could not generate new questions. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetQuiz = () => {
    if (!quizId) return;
    regenerateQuizMutation.mutate(quizId);
  };


  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="inline-flex items-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <span className="text-muted-foreground">Loading quiz...</span>
        </div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-6 max-w-md">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-foreground mb-2">Quiz Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The quiz you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => setLocation("/")} data-testid="button-back-home">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Upload
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const answeredCount = Object.keys(userAnswers).length;
  const isComplete = answeredCount === quiz.questions.length;

  // Results View
  if (isSubmitted && quizResult) {
    return (
      <div 
        className="min-h-screen relative overflow-hidden" 
        style={{ 
          background: 'linear-gradient(135deg, #B6E2D3 0%, #BDBFA3 50%, #B6E2D3 100%)'
        }}
      >
        {/* Decorative background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-16 h-16 rounded-full" style={{ backgroundColor: '#61C2A2' }}></div>
          <div className="absolute top-32 right-20 w-12 h-12 rounded-full" style={{ backgroundColor: '#09224E' }}></div>
          <div className="absolute bottom-20 left-1/4 w-20 h-20 rounded-full" style={{ backgroundColor: '#BDBFA3' }}></div>
          <div className="absolute bottom-32 right-1/3 w-14 h-14 rounded-full" style={{ backgroundColor: '#61C2A2' }}></div>
        </div>

        <div className="relative z-10">
          {/* Header */}
          <header className="shadow-sm" style={{ backgroundColor: '#61C2A2' }}>
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => window.location.href = "/dashboard"}
                    data-testid="button-back"
                    className="text-white hover:bg-white/20"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center space-x-1">
                    <Logo size="md" />
                    <h1 className="text-xl font-semibold text-white">ClariTA</h1>
                  </div>
                  <span className="text-sm text-white/90 bg-white/20 px-2 py-1 rounded-full">
                    Quiz Results
                  </span>
                </div>
              </div>
            </div>
          </header>

          <div className="container mx-auto px-4 py-8 max-w-4xl">
            {/* Results Header */}
            <Card className="p-6 mb-6 border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-2" style={{ color: '#09224E' }}>Quiz Complete!</h2>
              <div className="flex items-center justify-center space-x-4 mb-4">
                <div className="text-center">
                  <p className="text-4xl font-bold text-primary">{quizResult.percentage}%</p>
                  <p className="text-sm text-muted-foreground">Score</p>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-bold text-foreground">{quizResult.score}/{quizResult.totalQuestions}</p>
                  <p className="text-sm text-muted-foreground">Correct</p>
                </div>
              </div>
              <div className="flex justify-center space-x-4">
                <Button 
                  onClick={resetQuiz} 
                  variant="outline"
                  disabled={regenerateQuizMutation.isPending}
                >
                  {regenerateQuizMutation.isPending ? "Generating..." : "Retake Quiz"}
                </Button>
                <Button 
                  onClick={() => window.location.href = "/dashboard"}
                  className="hover:shadow-lg transition-all duration-200"
                >
                  Back to Dashboard
                </Button>
              </div>
            </div>
          </Card>

          {/* Answer Key */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4">Answer Key</h3>
            <div className="space-y-4">
              {quiz.questions.map((question, index) => {
                const result = quizResult.answers.find(a => a.questionId === question.id);
                return (
                  <div key={question.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-foreground">Question {index + 1}</h4>
                      {result?.isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{question.prompt}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-foreground">Your Answer:</p>
                        <p className={`${result?.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                          {typeof result?.userAnswer === 'boolean' 
                            ? result.userAnswer ? 'True' : 'False'
                            : result?.userAnswer || 'No answer'}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Correct Answer:</p>
                        <p className="text-green-600">
                          {typeof question.answer === 'boolean' 
                            ? question.answer ? 'True' : 'False'
                            : question.answer}
                        </p>
                      </div>
                    </div>
                    {question.explanation && (
                      <div className="mt-3 p-3 bg-muted rounded">
                        <p className="text-sm text-muted-foreground">
                          <strong>Explanation:</strong> {question.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
          </div>
        </div>
      </div>
    );
  }

  // Quiz Taking View
  return (
    <div 
      className="min-h-screen relative overflow-hidden" 
      style={{ 
        background: 'linear-gradient(135deg, #B6E2D3 0%, #BDBFA3 50%, #B6E2D3 100%)'
      }}
    >
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-16 h-16 rounded-full" style={{ backgroundColor: '#61C2A2' }}></div>
        <div className="absolute top-32 right-20 w-12 h-12 rounded-full" style={{ backgroundColor: '#09224E' }}></div>
        <div className="absolute bottom-20 left-1/4 w-20 h-20 rounded-full" style={{ backgroundColor: '#BDBFA3' }}></div>
        <div className="absolute bottom-32 right-1/3 w-14 h-14 rounded-full" style={{ backgroundColor: '#61C2A2' }}></div>
      </div>

      <div className="relative z-10">
      {/* Header */}
        <header className="shadow-sm" style={{ backgroundColor: '#61C2A2' }}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => window.location.href = "/dashboard"}
                  data-testid="button-back"
                  className="text-white hover:bg-white/20"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center space-x-1">
                  <Logo size="md" />
                  <h1 className="text-xl font-semibold text-white">ClariTA</h1>
                </div>
                <span className="text-sm text-white/90 bg-white/20 px-2 py-1 rounded-full">
                  Quiz
                </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                {answeredCount}/{quiz.questions.length} answered
              </span>
              <Button 
                onClick={submitQuiz}
                disabled={!isComplete}
                className="min-w-[100px]"
              >
                Submit Quiz
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Quiz Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-foreground mb-2">Quiz</h2>
          <p className="text-muted-foreground">
            {quiz.questions.length} questions • {quiz.meta?.countsByType?.mcq || 0} MCQ, {quiz.meta?.countsByType?.tf || 0} True/False, {quiz.meta?.countsByType?.fill || 0} Fill in the Blank
          </p>
        </div>

        {/* Quiz Questions */}
        <div className="space-y-6">
          {quiz.questions.map((question, index) => (
            <QuizCard
              key={question.id}
              question={question}
              questionNumber={index + 1}
              totalQuestions={quiz.questions.length}
              userAnswer={userAnswers[question.id]}
              onAnswerChange={(answer) => updateAnswer(question.id, answer)}
            />
          ))}
        </div>

        {/* Submit Button */}
        <div className="mt-8 text-center">
          <Button 
            onClick={submitQuiz}
            disabled={!isComplete}
            size="lg"
            className="min-w-[200px]"
          >
            Submit Quiz ({answeredCount}/{quiz.questions.length})
          </Button>
        </div>
        </div>
      </div>
    </div>
  );
}
