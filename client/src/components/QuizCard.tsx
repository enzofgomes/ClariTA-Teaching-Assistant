import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Eye, EyeOff, Quote, CheckCircle, XCircle, Lightbulb } from "lucide-react";
import type { Question } from "@/types/quiz";

interface QuizCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  isAnswerRevealed: boolean;
  onToggleAnswer: () => void;
}

export function QuizCard({
  question,
  questionNumber,
  totalQuestions,
  isAnswerRevealed,
  onToggleAnswer,
}: QuizCardProps) {
  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case 'mcq':
        return { label: 'MCQ', color: 'bg-blue-100 text-blue-800' };
      case 'tf':
        return { label: 'T/F', color: 'bg-purple-100 text-purple-800' };
      case 'short':
        return { label: 'Short Answer', color: 'bg-orange-100 text-orange-800' };
      default:
        return { label: 'Unknown', color: 'bg-gray-100 text-gray-800' };
    }
  };

  const typeInfo = getQuestionTypeLabel(question.type);
  const isCorrectAnswer = question.answer;
  const confidenceLevel = question.confidence > 0.8 ? 'High' : question.confidence > 0.6 ? 'Medium' : 'Low';

  return (
    <Card className="p-6 fade-in" data-testid={`card-question-${question.id}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${typeInfo.color}`}>
              {typeInfo.label}
            </span>
            <span className="text-xs text-muted-foreground">
              Question {questionNumber} of {totalQuestions}
            </span>
            {question.confidence > 0.8 && (
              <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                High Confidence
              </span>
            )}
          </div>
          <h3 className="text-lg font-medium text-foreground mb-4" data-testid={`text-prompt-${question.id}`}>
            {question.prompt}
          </h3>
        </div>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" data-testid={`button-citations-${question.id}`}>
              <Quote className="h-4 w-4 text-muted-foreground" />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <div>
              <strong>Citations:</strong>
              {question.citations.map((citation, index) => (
                <div key={index} className="mt-1">
                  Page {citation.page}: "{citation.snippet}"
                </div>
              ))}
            </div>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Question Options */}
      {question.type === 'mcq' && question.options && (
        <div className="space-y-3 mb-4">
          <RadioGroup disabled>
            {question.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                <RadioGroupItem value={index.toString()} id={`${question.id}-${index}`} />
                <Label htmlFor={`${question.id}-${index}`} className="flex-1 cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      )}

      {question.type === 'tf' && (
        <div className="space-y-3 mb-4">
          <RadioGroup disabled>
            <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
              <RadioGroupItem value="true" id={`${question.id}-true`} />
              <Label htmlFor={`${question.id}-true`} className="flex-1 cursor-pointer">True</Label>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
              <RadioGroupItem value="false" id={`${question.id}-false`} />
              <Label htmlFor={`${question.id}-false`} className="flex-1 cursor-pointer">False</Label>
            </div>
          </RadioGroup>
        </div>
      )}

      {/* Answer Toggle */}
      <Button
        variant="link"
        className="text-primary hover:underline text-sm mb-3 p-0"
        onClick={onToggleAnswer}
        data-testid={`button-toggle-answer-${question.id}`}
      >
        {isAnswerRevealed ? <EyeOff className="mr-1 h-4 w-4" /> : <Eye className="mr-1 h-4 w-4" />}
        {isAnswerRevealed ? "Hide Answer" : "Show Answer"}
      </Button>

      {/* Answer Section */}
      {isAnswerRevealed && (
        <div className={`rounded-lg p-4 border ${
          question.type === 'short' 
            ? 'bg-blue-50 border-blue-200' 
            : 'bg-green-50 border-green-200'
        }`} data-testid={`answer-section-${question.id}`}>
          <div className="flex items-start space-x-2">
            {question.type === 'mcq' && (
              <CheckCircle className="text-green-600 mt-1 h-5 w-5" />
            )}
            {question.type === 'tf' && (
              <>
                {question.answer === true ? (
                  <CheckCircle className="text-green-600 mt-1 h-5 w-5" />
                ) : (
                  <XCircle className="text-red-600 mt-1 h-5 w-5" />
                )}
              </>
            )}
            {question.type === 'short' && (
              <Lightbulb className="text-blue-600 mt-1 h-5 w-5" />
            )}
            
            <div className="flex-1">
              <p className={`font-medium mb-2 ${
                question.type === 'short' ? 'text-blue-800' : 'text-green-800'
              }`}>
                {question.type === 'mcq' && `Correct Answer: ${String.fromCharCode(65 + (question.answer as number))}`}
                {question.type === 'tf' && `Correct Answer: ${question.answer ? 'True' : 'False'}`}
                {question.type === 'short' && 'Sample Answer:'}
              </p>
              <p className={`text-sm ${
                question.type === 'short' ? 'text-blue-700' : 'text-green-700'
              }`} data-testid={`text-explanation-${question.id}`}>
                {question.type === 'short' ? question.answer : question.explanation}
              </p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
