import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Eye, EyeOff, Quote, CheckCircle, XCircle, Lightbulb } from "lucide-react";
import { useState } from "react";
import type { Question } from "@/types/quiz";

interface QuizCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  userAnswer?: number | boolean | string;
  onAnswerChange: (answer: number | boolean | string) => void;
}

export function QuizCard({
  question,
  questionNumber,
  totalQuestions,
  userAnswer,
  onAnswerChange,
}: QuizCardProps) {
  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case 'mcq':
        return { label: 'MCQ', color: 'bg-blue-100 text-blue-800' };
      case 'tf':
        return { label: 'T/F', color: 'bg-purple-100 text-purple-800' };
      case 'fill':
        return { label: 'Fill', color: 'bg-teal-100 text-teal-800' };
      default:
        return { label: 'Unknown', color: 'bg-gray-100 text-gray-800' };
    }
  };

  const typeInfo = getQuestionTypeLabel(question.type);
  const isCorrectAnswer = question.answer;

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
          <RadioGroup 
            value={typeof userAnswer === 'number' ? userAnswer.toString() : undefined}
            onValueChange={(value) => onAnswerChange(parseInt(value))}
          >
            {question.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                <RadioGroupItem 
                  value={index.toString()} 
                  id={`${question.id}-${index}`}
                  className="border-teal-600 text-teal-600 data-[state=checked]:border-teal-600 data-[state=checked]:text-teal-600"
                />
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
          <RadioGroup 
            value={typeof userAnswer === 'boolean' ? userAnswer.toString() : undefined}
            onValueChange={(value) => onAnswerChange(value === 'true')}
          >
            <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
              <RadioGroupItem 
                value="true" 
                id={`${question.id}-true`}
                className="border-teal-600 text-teal-600 data-[state=checked]:border-teal-600 data-[state=checked]:text-teal-600"
              />
              <Label htmlFor={`${question.id}-true`} className="flex-1 cursor-pointer">True</Label>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
              <RadioGroupItem 
                value="false" 
                id={`${question.id}-false`}
                className="border-teal-600 text-teal-600 data-[state=checked]:border-teal-600 data-[state=checked]:text-teal-600"
              />
              <Label htmlFor={`${question.id}-false`} className="flex-1 cursor-pointer">False</Label>
            </div>
          </RadioGroup>
        </div>
      )}

      {/* Fill in the Blank Input */}
      {question.type === 'fill' && (
        <div className="mb-4">
          <Input 
            placeholder="Fill in the blank..." 
            value={typeof userAnswer === 'string' ? userAnswer : ''}
            onChange={(e) => onAnswerChange(e.target.value)}
            className="w-full"
          />
        </div>
      )}

    </Card>
  );
}
