import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { authenticatedFetch } from "@/lib/api";
import { Uploader } from "@/components/Uploader";
import { QuizConfig, type QuizConfig as QuizConfigType } from "@/components/QuizConfig";
import { GraduationCap, Brain, FileText, Scale, FileCheck, ArrowLeft, Home } from "lucide-react";
import type { Upload } from "@/types/quiz";

export default function UploadPage() {
  const [, setLocation] = useLocation();
  const [uploadResult, setUploadResult] = useState<Upload | null>(null);
  const [showConfig, setShowConfig] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const generateQuizMutation = useMutation({
    mutationFn: async ({ uploadId, config }: { uploadId: string; config: QuizConfigType }) => {
      const requestBody = { 
        uploadId, 
        numQuestions: config.numQuestions,
        questionTypes: config.questionTypes
      };
      
      console.log('Sending quiz generation request:', requestBody);
      
      const response = await authenticatedFetch("/api/quizzes", {
        method: "POST",
        body: JSON.stringify(requestBody),
      });
      return response.json();
    },
    onSuccess: (data) => {
      console.log('Quiz generation response:', data);
      if (data && data.questions && Array.isArray(data.questions)) {
        // Invalidate dashboard queries to refresh the data
        queryClient.invalidateQueries({ queryKey: ["/api/user/quizzes"] });
        queryClient.invalidateQueries({ queryKey: ["/api/user/quiz-folders"] });
        queryClient.invalidateQueries({ queryKey: ["/api/user/uploads"] });
        
        toast({
          title: "Quiz Generated!",
          description: `Successfully created ${data.questions.length} questions.`,
        });
        setLocation(`/quiz/${data.quizId}`);
      } else {
        throw new Error('Invalid response format from server');
      }
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
    setShowConfig(true);
    // Invalidate uploads query to refresh dashboard
    queryClient.invalidateQueries({ queryKey: ["/api/user/uploads"] });
    toast({
      title: "Upload Successful",
      description: `Processed ${upload.pageCount} pages from ${upload.fileName}`,
    });
  };

  const handleConfigSubmit = (config: QuizConfigType) => {
    if (uploadResult) {
      generateQuizMutation.mutate({ uploadId: uploadResult.uploadId, config });
    }
  };

  const handleBackToUpload = () => {
    setShowConfig(false);
    setUploadResult(null);
  };

  return (
    <div 
      className="min-h-screen relative overflow-hidden" 
      style={{ 
        background: 'linear-gradient(135deg, #f5e2aa 0%, #fef7e0 50%, #f5e2aa 100%)'
      }}
    >
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-10">
        {/* Floating circles */}
        <div className="absolute top-20 left-10 w-16 h-16 rounded-full" style={{ backgroundColor: '#dc5817' }}></div>
        <div className="absolute top-32 right-20 w-12 h-12 rounded-full" style={{ backgroundColor: '#6b2d16' }}></div>
        <div className="absolute bottom-20 left-1/4 w-20 h-20 rounded-full" style={{ backgroundColor: '#de8318' }}></div>
        <div className="absolute bottom-32 right-1/3 w-14 h-14 rounded-full" style={{ backgroundColor: '#dc5817' }}></div>
        
        {/* Geometric shapes */}
        <div className="absolute top-40 left-1/3 w-8 h-8 transform rotate-45" style={{ backgroundColor: '#6b2d16' }}></div>
        <div className="absolute bottom-40 right-1/4 w-6 h-6 transform rotate-12" style={{ backgroundColor: '#de8318' }}></div>
        
        {/* Additional floating elements */}
        <div className="absolute top-1/2 left-1/6 w-10 h-10 rounded-full" style={{ backgroundColor: '#dc5817' }}></div>
        <div className="absolute top-1/3 right-1/6 w-8 h-8 rounded-full" style={{ backgroundColor: '#6b2d16' }}></div>
        <div className="absolute bottom-1/3 left-1/2 w-12 h-12 rounded-full" style={{ backgroundColor: '#de8318' }}></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="shadow-sm" style={{ backgroundColor: '#de8318' }}>
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#6b2d16' }}>
                  <GraduationCap className="text-white text-sm" />
                </div>
                <h1 className="text-xl font-semibold text-white">ClariTA</h1>
                <span className="text-sm text-white/90 bg-white/20 px-2 py-1 rounded-full">
                  Quiz Generator
                </span>
              </div>
              <Button
                onClick={() => setLocation('/dashboard')}
                className="text-white bg-white/20 border-white/30 hover:bg-white/30 hover:text-white"
                data-testid="button-back-to-dashboard"
              >
                <Home className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-12 max-w-4xl">
          {!showConfig ? (
            /* Upload Section */
            <div className="mb-8">
              <div className="text-center mb-8">
                <h2 className="text-4xl font-bold mb-4" style={{ color: '#6b2d16' }}>
                  Upload Lecture Slides
                </h2>
                <p className="text-xl max-w-2xl mx-auto leading-relaxed" style={{ color: '#6b2d16' }}>
                  Upload a PDF of your lecture slides to generate an instant quiz with AI-powered assessments!
                </p>
              </div>

            <Uploader onUploadSuccess={handleUploadSuccess} />

            {/* Upload Results */}
            {uploadResult && (
              <div className="mt-8 fade-in">
                <Card className="p-6 border-0 shadow-2xl bg-white/95 backdrop-blur-sm hover:shadow-3xl transition-all duration-300">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-semibold text-xl" style={{ color: '#1F2937' }}>Upload Successful</h3>
                    <span className="text-sm bg-green-100 text-green-800 px-3 py-2 rounded-full font-medium">
                      <FileCheck className="w-4 h-4 inline mr-2" />
                      Complete
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="flex items-center space-x-3 p-4 rounded-lg" style={{ backgroundColor: '#F9FAFB' }}>
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#dc5817' }}>
                        <FileText className="text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: '#1F2937' }} data-testid="text-filename">
                          {uploadResult.fileName}
                        </p>
                        <p className="text-xs" style={{ color: '#6B7280' }}>File name</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-4 rounded-lg" style={{ backgroundColor: '#F9FAFB' }}>
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#de8318' }}>
                        <Scale className="text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: '#1F2937' }} data-testid="text-filesize">
                          {(uploadResult.fileSize / (1024 * 1024)).toFixed(1)} MB
                        </p>
                        <p className="text-xs" style={{ color: '#6B7280' }}>File size</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-4 rounded-lg" style={{ backgroundColor: '#F9FAFB' }}>
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#6b2d16' }}>
                        <FileText className="text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: '#1F2937' }} data-testid="text-pagecount">
                          {uploadResult.pageCount} pages
                        </p>
                        <p className="text-xs" style={{ color: '#6B7280' }}>Page count</p>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => setShowConfig(true)}
                    className="w-full h-12 text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 rounded-lg"
                    style={{ backgroundColor: '#F17105' }}
                    data-testid="button-configure-quiz"
                  >
                    <Brain className="mr-2 h-5 w-5" />
                    Configure Quiz
                  </Button>
                </Card>
              </div>
            )}
          </div>
          ) : (
            /* Quiz Configuration Section */
            <div className="mb-8">
              <div className="text-center mb-8">
                <Button
                  onClick={handleBackToUpload}
                  className="mb-6 text-white bg-white/20 border-white/30 hover:bg-white/30 hover:text-white"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Upload
                </Button>
                <h2 className="text-4xl font-bold mb-4" style={{ color: '#6b2d16' }}>
                  Quiz Configuration
                </h2>
                <p className="text-xl max-w-2xl mx-auto leading-relaxed" style={{ color: '#6b2d16' }}>
                  Customize your quiz with the number of questions and types you want
                </p>
              </div>

            <QuizConfig 
              onConfigSubmit={handleConfigSubmit}
              isGenerating={generateQuizMutation.isPending}
            />
          </div>
        )}

          {/* Loading State */}
          {generateQuizMutation.isPending && (
            <div className="text-center py-12">
              <div className="inline-flex items-center space-x-3">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-orange-600 border-t-transparent"></div>
                <span className="text-lg" style={{ color: '#1F2937' }}>Generating quiz with AI...</span>
              </div>
              <p className="text-sm mt-2" style={{ color: '#6B7280' }}>This may take up to 30 seconds</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
