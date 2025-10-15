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
    <Card className="p-8 max-w-2xl mx-auto shadow-2xl bg-white/95 backdrop-blur-sm hover:shadow-3xl transition-all duration-300 border-0">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#61C2A2' }}>
          <Settings className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold" style={{ color: '#1F2937' }}>Configure Your Quiz</h2>
          <p className="text-sm" style={{ color: '#6B7280' }}>
            Choose the number of questions and question types
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Number of Questions */}
        <div className="space-y-3">
          <Label htmlFor="numQuestions" className="text-sm font-semibold" style={{ color: '#1F2937' }}>
            Number of Questions
          </Label>
          <Input
            id="numQuestions"
            type="number"
            min="1"
            max="100"
            value={numQuestions}
            onChange={(e) => setNumQuestions(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
            className="w-32 h-12 border-gray-200 focus:border-teal-600 focus:ring-teal-600 rounded-lg text-base"
          />
          <p className="text-xs" style={{ color: '#6B7280' }}>
            Choose between 1 and 100 questions
          </p>
        </div>

        {/* Question Types */}
        <div className="space-y-4">
          <Label className="text-sm font-semibold" style={{ color: '#1F2937' }}>Question Types</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(questionTypeLabels).map(([type, label]) => (
              <div key={type} className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:border-teal-300 transition-colors">
                <Checkbox
                  id={type}
                  checked={questionTypes[type as keyof typeof questionTypes]}
                  onCheckedChange={(checked) => 
                    handleQuestionTypeChange(type as keyof typeof questionTypes, checked as boolean)
                  }
                  className="data-[state=checked]:bg-teal-600 data-[state=checked]:border-teal-600 border-gray-300"
                />
                <Label 
                  htmlFor={type} 
                  className="text-sm font-medium cursor-pointer flex-1"
                  style={{ color: '#1F2937' }}
                >
                  {label}
                </Label>
              </div>
            ))}
          </div>
          <p className="text-xs" style={{ color: '#6B7280' }}>
            Select at least one question type • {selectedTypesCount} selected
          </p>
        </div>

        {/* Generate Button */}
        <div className="pt-6">
          <Button 
            onClick={handleSubmit}
            disabled={isGenerating || selectedTypesCount === 0}
            className="w-full h-12 text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 rounded-lg"
            style={{ backgroundColor: '#09224E' }}
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                Generating Quiz...
              </>
            ) : (
              <>
                <Brain className="mr-2 h-5 w-5" />
                Generate Quiz
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
