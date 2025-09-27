import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Brain, Plus, LogOut, User } from "lucide-react";
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ClariTA</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {user && (
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
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
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back!
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Upload a new PDF to generate quizzes or view your quiz history.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plus className="h-5 w-5 mr-2" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/upload">
                  <Button className="w-full" data-testid="button-upload-new">
                    <FileText className="h-4 w-4 mr-2" />
                    Upload New PDF
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Your Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Total Uploads</span>
                    <span className="font-semibold" data-testid="text-upload-count">
                      {uploads?.length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Total Quizzes</span>
                    <span className="font-semibold" data-testid="text-quiz-count">
                      {quizzes?.length || 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Uploads</CardTitle>
                <CardDescription>
                  Your latest PDF uploads and generated quizzes
                </CardDescription>
              </CardHeader>
              <CardContent>
                {uploadsLoading ? (
                  <div className="text-center py-8 text-gray-500">Loading uploads...</div>
                ) : uploads && uploads.length > 0 ? (
                  <div className="space-y-4">
                    {uploads.slice(0, 5).map((upload) => {
                      const uploadQuizzes = quizzes?.filter(q => q.uploadId === upload.id) || [];
                      return (
                        <div 
                          key={upload.id} 
                          className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700"
                          data-testid={`card-upload-${upload.id}`}
                        >
                          <div className="flex items-center space-x-3">
                            <FileText className="h-8 w-8 text-blue-500" />
                            <div>
                              <h3 className="font-medium text-gray-900 dark:text-white">
                                {upload.fileName}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {upload.pageCount} pages • Uploaded {new Date(upload.uploadedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">
                              {uploadQuizzes.length} quiz{uploadQuizzes.length !== 1 ? 'es' : ''}
                            </span>
                            {uploadQuizzes.length > 0 && (
                              <Link href={`/quiz/${uploadQuizzes[0].id}`}>
                                <Button variant="outline" size="sm" data-testid={`button-view-quiz-${upload.id}`}>
                                  View Quiz
                                </Button>
                              </Link>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No uploads yet
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Upload your first PDF to get started with AI-generated quizzes.
                    </p>
                    <Link href="/upload">
                      <Button data-testid="button-upload-first">
                        <Plus className="h-4 w-4 mr-2" />
                        Upload Your First PDF
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
  );
}