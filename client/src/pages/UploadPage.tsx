import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { authenticatedFetch } from "@/lib/api";
import { Uploader } from "@/components/Uploader";
import { GraduationCap, Moon, Brain, FileText, Scale, FileCheck } from "lucide-react";
import type { Upload } from "@/types/quiz";

export default function UploadPage() {
  const [, setLocation] = useLocation();
  const [uploadResult, setUploadResult] = useState<Upload | null>(null);
  const { toast } = useToast();

  const generateQuizMutation = useMutation({
    mutationFn: async (uploadId: string) => {
      const response = await authenticatedFetch("/api/quizzes", {
        method: "POST",
        body: JSON.stringify({ uploadId, numQuestions: 10 }),
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Quiz Generated!",
        description: `Successfully created ${data.questions.length} questions.`,
      });
      setLocation(`/quiz/${data.quizId}`);
    },
    onError: (error) => {
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate quiz",
        variant: "destructive",
      });
    },
  });

  const handleUploadSuccess = (upload: Upload) => {
    setUploadResult(upload);
    toast({
      title: "Upload Successful",
      description: `Processed ${upload.pageCount} pages from ${upload.fileName}`,
    });
  };

  const handleGenerateQuiz = () => {
    if (uploadResult) {
      generateQuizMutation.mutate(uploadResult.uploadId);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
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
        {/* Upload Section */}
        <div className="mb-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Upload Lecture Slides
            </h2>
            <p className="text-muted-foreground">
              Upload a PDF of your lecture slides to generate an instant quiz
            </p>
          </div>

          <Uploader onUploadSuccess={handleUploadSuccess} />

          {/* Upload Results */}
          {uploadResult && (
            <div className="mt-6 fade-in">
              <Card className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-foreground">Upload Successful</h3>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    <FileCheck className="w-3 h-3 inline mr-1" />
                    Complete
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <FileText className="text-red-500" />
                    <div>
                      <p className="text-sm font-medium" data-testid="text-filename">
                        {uploadResult.fileName}
                      </p>
                      <p className="text-xs text-muted-foreground">File name</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Scale className="text-blue-500" />
                    <div>
                      <p className="text-sm font-medium" data-testid="text-filesize">
                        {(uploadResult.fileSize / (1024 * 1024)).toFixed(1)} MB
                      </p>
                      <p className="text-xs text-muted-foreground">File size</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <FileText className="text-green-500" />
                    <div>
                      <p className="text-sm font-medium" data-testid="text-pagecount">
                        {uploadResult.pageCount} pages
                      </p>
                      <p className="text-xs text-muted-foreground">Page count</p>
                    </div>
                  </div>
                </div>
                
                <Button 
                  onClick={handleGenerateQuiz}
                  disabled={generateQuizMutation.isPending}
                  className="w-full"
                  data-testid="button-generate-quiz"
                >
                  <Brain className="mr-2 h-4 w-4" />
                  {generateQuizMutation.isPending ? "Generating..." : "Generate 10-Question Quiz"}
                </Button>
              </Card>
            </div>
          )}
        </div>

        {/* Loading State */}
        {generateQuizMutation.isPending && (
          <div className="text-center py-12">
            <div className="inline-flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="text-muted-foreground">Generating quiz with AI...</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">This may take up to 30 seconds</p>
          </div>
        )}
      </div>
    </div>
  );
}
