import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { QuizCard } from "@/components/QuizCard";
import { Toolbar } from "@/components/Toolbar";
import { GraduationCap, Moon, ArrowLeft } from "lucide-react";
import type { Quiz } from "@/types/quiz";

export default function QuizPage() {
  const { quizId } = useParams();
  const [, setLocation] = useLocation();
  const [revealedAnswers, setRevealedAnswers] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const { data: quiz, isLoading, error } = useQuery<Quiz>({
    queryKey: ["/api/quizzes", quizId],
    enabled: !!quizId,
  });

  const toggleAnswer = (questionId: string) => {
    setRevealedAnswers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const revealAllAnswers = () => {
    if (quiz) {
      const allQuestionIds = new Set(quiz.questions.map(q => q.id));
      setRevealedAnswers(allQuestionIds);
    }
  };

  const hideAllAnswers = () => {
    setRevealedAnswers(new Set());
  };

  const copyJson = () => {
    if (quiz) {
      navigator.clipboard.writeText(JSON.stringify(quiz, null, 2));
      toast({
        title: "Copied!",
        description: "Quiz JSON copied to clipboard",
      });
    }
  };

  const downloadJson = () => {
    if (quiz) {
      const blob = new Blob([JSON.stringify(quiz, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `quiz-${quiz.quizId}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Downloaded!",
        description: "Quiz JSON file downloaded",
      });
    }
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

  const allRevealed = revealedAnswers.size === quiz.questions.length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setLocation("/")}
                data-testid="button-back"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <GraduationCap className="text-primary-foreground text-sm" />
              </div>
              <h1 className="text-xl font-semibold text-foreground">ClariTA</h1>
              <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded-full">
                Quiz Generator
              </span>
            </div>
            <Button variant="ghost" size="icon" data-testid="button-dark-mode">
              <Moon className="text-muted-foreground" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Quiz Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Generated Quiz</h2>
            <p className="text-muted-foreground">
              {quiz.questions.length} questions • {quiz.meta?.countsByType?.mcq || 0} MCQ, {quiz.meta?.countsByType?.tf || 0} True/False, {quiz.meta?.countsByType?.short || 0} Short Answer
            </p>
          </div>
          
          <Toolbar
            onRevealAll={allRevealed ? hideAllAnswers : revealAllAnswers}
            onCopyJson={copyJson}
            onDownloadJson={downloadJson}
            allRevealed={allRevealed}
          />
        </div>

        {/* Quiz Questions */}
        <div className="space-y-6">
          {quiz.questions.map((question, index) => (
            <QuizCard
              key={question.id}
              question={question}
              questionNumber={index + 1}
              totalQuestions={quiz.questions.length}
              isAnswerRevealed={revealedAnswers.has(question.id)}
              onToggleAnswer={() => toggleAnswer(question.id)}
            />
          ))}
        </div>

        {/* Quiz Statistics */}
        <Card className="mt-8 p-6 bg-muted">
          <h3 className="font-medium text-foreground mb-4">Quiz Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-semibold text-primary" data-testid="text-total-questions">
                {quiz.questions.length}
              </p>
              <p className="text-sm text-muted-foreground">Total Questions</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-semibold text-blue-600" data-testid="text-mcq-count">
                {quiz.meta?.countsByType?.mcq || 0}
              </p>
              <p className="text-sm text-muted-foreground">Multiple Choice</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-semibold text-purple-600" data-testid="text-tf-count">
                {quiz.meta?.countsByType?.tf || 0}
              </p>
              <p className="text-sm text-muted-foreground">True/False</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-semibold text-orange-600" data-testid="text-short-count">
                {quiz.meta?.countsByType?.short || 0}
              </p>
              <p className="text-sm text-muted-foreground">Short Answer</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Average Confidence:</span>
              <span className="font-medium text-foreground" data-testid="text-confidence">
                {((quiz.meta?.avgConfidence || 0) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-muted-foreground">Generated:</span>
              <span className="font-medium text-foreground" data-testid="text-created-at">
                {quiz.meta?.createdAt ? new Date(quiz.meta.createdAt).toLocaleDateString() : 'Unknown'} at{" "}
                {quiz.meta?.createdAt ? new Date(quiz.meta.createdAt).toLocaleTimeString() : 'Unknown'}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
