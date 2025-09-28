import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Brain, Settings } from "lucide-react";

export interface QuizConfig {
  numQuestions: number;
  questionTypes: {
    mcq: boolean;
    tf: boolean;
    fill: boolean;
  };
}

interface QuizConfigProps {
  onConfigSubmit: (config: QuizConfig) => void;
  isGenerating: boolean;
}

const questionTypeLabels = {
  mcq: "Multiple Choice",
  tf: "True/False",
  fill: "Fill in the Blank"
};

export function QuizConfig({ onConfigSubmit, isGenerating }: QuizConfigProps) {
  const [numQuestions, setNumQuestions] = useState(10);
  const [questionTypes, setQuestionTypes] = useState({
    mcq: true,
    tf: true,
    fill: true
  });

  const handleQuestionTypeChange = (type: keyof typeof questionTypes, checked: boolean) => {
    setQuestionTypes(prev => ({
      ...prev,
      [type]: checked
    }));
  };

  const handleSubmit = () => {
    // Ensure at least one question type is selected
    const hasSelectedTypes = Object.values(questionTypes).some(Boolean);
    if (!hasSelectedTypes) {
      return;
    }

    onConfigSubmit({
      numQuestions,
      questionTypes
    });
  };

  const selectedTypesCount = Object.values(questionTypes).filter(Boolean).length;

  return (
    <Card className="p-6 max-w-2xl mx-auto shadow-2xl bg-white/95 backdrop-blur-sm hover:shadow-3xl transition-all duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
          <Settings className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground">Configure Your Quiz</h2>
          <p className="text-sm text-muted-foreground">
            Choose the number of questions and question types
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Number of Questions */}
        <div className="space-y-2">
          <Label htmlFor="numQuestions" className="text-sm font-medium">
            Number of Questions
          </Label>
          <Input
            id="numQuestions"
            type="number"
            min="1"
            max="100"
            value={numQuestions}
            onChange={(e) => setNumQuestions(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
            className="w-32"
          />
          <p className="text-xs text-muted-foreground">
            Choose between 1 and 100 questions
          </p>
        </div>

        {/* Question Types */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Question Types</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(questionTypeLabels).map(([type, label]) => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox
                  id={type}
                  checked={questionTypes[type as keyof typeof questionTypes]}
                  onCheckedChange={(checked) => 
                    handleQuestionTypeChange(type as keyof typeof questionTypes, checked as boolean)
                  }
                />
                <Label 
                  htmlFor={type} 
                  className="text-sm font-normal cursor-pointer"
                >
                  {label}
                </Label>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Select at least one question type • {selectedTypesCount} selected
          </p>
        </div>

        {/* Generate Button */}
        <div className="pt-4">
          <Button 
            onClick={handleSubmit}
            disabled={isGenerating || selectedTypesCount === 0}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generating Quiz...
              </>
            ) : (
              <>
                <Brain className="mr-2 h-4 w-4" />
                Generate Quiz
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
