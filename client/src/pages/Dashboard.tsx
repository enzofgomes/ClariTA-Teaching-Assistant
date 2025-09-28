import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Brain, Plus, LogOut, User, Sparkles, ArrowRight, Upload, BarChart3, BookOpen, Lightbulb, GraduationCap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { authenticatedFetch } from "@/lib/api";
import { useEffect } from "react";
import type { User as UserType } from "@shared/schema";

interface Upload {
  id: string;
  fileName: string;
  fileSize: number;
  pageCount: number;
  uploadedAt: string;
}

interface Quiz {
  id: string;
  uploadId: string;
  createdAt: string;
  meta: {
    countsByType: Record<string, number>;
    avgConfidence: number;
  };
}

export default function Dashboard() {
  const { user, loading: isLoading, signOut } = useAuth();
  const { toast } = useToast();

  const { data: uploads, isLoading: uploadsLoading } = useQuery<Upload[]>({
    queryKey: ["/api/user/uploads"],
    retry: false,
    queryFn: async () => {
      const response = await authenticatedFetch("/api/user/uploads");
      return response.json();
    },
  });

  const { data: quizzes, isLoading: quizzesLoading } = useQuery<Quiz[]>({
    queryKey: ["/api/user/quizzes"],
    retry: false,
    queryFn: async () => {
      const response = await authenticatedFetch("/api/user/quizzes");
      return response.json();
    },
  });

  const handleLogout = () => {
    signOut();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

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
        <header className="shadow-sm" style={{ backgroundColor: '#de8318' }}>
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              {/* Logo */}
              <div className="flex items-center space-x-2">
                <Brain className="h-8 w-8 text-white" />
                <h1 className="text-2xl font-bold text-white">ClariTA</h1>
              </div>
              
              <div className="flex items-center space-x-4">
                {user && (
                  <div className="flex items-center space-x-2 text-sm text-white/90 bg-white/20 px-3 py-2 rounded-lg">
                    <User className="h-4 w-4" />
                    <span data-testid="text-user-name">
                      {user.fullName || user.email || 'User'}
                    </span>
                  </div>
                )}
                <Button 
                  variant="outline" 
                  onClick={handleLogout}
                  data-testid="button-logout"
                  className="text-white bg-white/20 border-white/30 hover:bg-white/30 hover:text-white"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-12">
          <div className="mb-12 text-center">
            <h2 className="text-5xl font-bold mb-4" style={{ color: '#6b2d16' }}>
              Welcome back, <span style={{ color: '#dc5817' }}>{user?.fullName?.split(' ')[0] || 'Student'}!</span>
            </h2>
            <p className="text-xl max-w-2xl mx-auto leading-relaxed" style={{ color: '#6b2d16' }}>
              Upload a new PDF to generate quizzes or view your quiz history. Transform your learning experience with AI-powered assessments!
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Quick Actions */}
            <div className="lg:col-span-1">
              <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm hover:shadow-3xl transition-all duration-300 hover:scale-105">
                <CardHeader className="pb-6">
                  <CardTitle className="flex items-center text-2xl" style={{ color: '#1F2937' }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3" style={{ backgroundColor: '#de8318' }}>
                      <Plus className="h-5 w-5 text-white" />
                    </div>
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Link href="/upload">
                    <Button 
                      className="w-full h-12 text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 rounded-lg"
                      style={{ backgroundColor: '#F17105' }}
                      data-testid="button-upload-new"
                    >
                      <Upload className="h-5 w-5 mr-2" />
                      Upload New PDF
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Stats */}
              <Card className="mt-8 border-0 shadow-2xl bg-white/95 backdrop-blur-sm hover:shadow-3xl transition-all duration-300">
                <CardHeader className="pb-6">
                  <CardTitle className="flex items-center text-2xl" style={{ color: '#1F2937' }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3" style={{ backgroundColor: '#dc5817' }}>
                      <BarChart3 className="h-5 w-5 text-white" />
                    </div>
                    Your Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex justify-between items-center p-4 rounded-lg" style={{ backgroundColor: '#F9FAFB' }}>
                      <span className="text-lg font-medium" style={{ color: '#1F2937' }}>Total Uploads</span>
                      <span className="text-2xl font-bold" style={{ color: '#de8318' }} data-testid="text-upload-count">
                        {uploads?.length || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-4 rounded-lg" style={{ backgroundColor: '#F9FAFB' }}>
                      <span className="text-lg font-medium" style={{ color: '#1F2937' }}>Total Quizzes</span>
                      <span className="text-2xl font-bold" style={{ color: '#dc5817' }} data-testid="text-quiz-count">
                        {quizzes?.length || 0}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="lg:col-span-2">
              <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm hover:shadow-3xl transition-all duration-300 hover:scale-105">
                <CardHeader className="pb-6">
                  <CardTitle className="flex items-center text-2xl" style={{ color: '#1F2937' }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3" style={{ backgroundColor: '#6b2d16' }}>
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    Recent Uploads
                  </CardTitle>
                  <CardDescription className="text-lg" style={{ color: '#1F2937' }}>
                    Your latest PDF uploads and generated quizzes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {uploadsLoading ? (
                    <div className="text-center py-12">
                      <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-lg" style={{ color: '#1F2937' }}>Loading uploads...</p>
                    </div>
                  ) : uploads && uploads.length > 0 ? (
                    <div className="space-y-4">
                      {uploads.slice(0, 5).map((upload) => {
                        const uploadQuizzes = quizzes?.filter(q => q.uploadId === upload.id) || [];
                        return (
                          <div 
                            key={upload.id} 
                            className="flex items-center justify-between p-6 border-0 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 bg-white hover:-translate-y-1 hover:scale-105"
                            data-testid={`card-upload-${upload.id}`}
                          >
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#de8318' }}>
                                <FileText className="h-6 w-6 text-white" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-lg" style={{ color: '#1F2937' }}>
                                  {upload.fileName}
                                </h3>
                                <p className="text-sm" style={{ color: '#6B7280' }}>
                                  {upload.pageCount} pages • Uploaded {new Date(upload.uploadedAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className="text-sm font-medium px-3 py-1 rounded-full" style={{ backgroundColor: '#F3F4F6', color: '#1F2937' }}>
                                {uploadQuizzes.length} quiz{uploadQuizzes.length !== 1 ? 'es' : ''}
                              </span>
                              {uploadQuizzes.length > 0 && (
                                <Link href={`/quiz/${uploadQuizzes[0].id}`}>
                                  <Button 
                                    className="h-10 px-6 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 rounded-lg"
                                    style={{ backgroundColor: '#dc5817' }}
                                    data-testid={`button-view-quiz-${upload.id}`}
                                  >
                                    View Quiz
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                  </Button>
                                </Link>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: '#f5e2aa' }}>
                        <FileText className="h-10 w-10" style={{ color: '#6b2d16' }} />
                      </div>
                      <h3 className="text-2xl font-semibold mb-3" style={{ color: '#1F2937' }}>
                        No uploads yet
                      </h3>
                      <p className="text-lg mb-6" style={{ color: '#6B7280' }}>
                        Upload your first PDF to get started with AI-generated quizzes.
                      </p>
                      <Link href="/upload">
                        <Button 
                          className="h-12 px-8 text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 rounded-lg"
                          style={{ backgroundColor: '#F17105' }}
                          data-testid="button-upload-first"
                        >
                          <Plus className="h-5 w-5 mr-2" />
                          Upload Your First PDF
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}