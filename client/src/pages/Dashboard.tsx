import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { FileText, Brain, Plus, LogOut, User, Search, Edit, Trash2, Folder, Tag, MoreHorizontal, TrendingUp, Target, BarChart3, BadgePercent, Calendar, CheckCircle, Zap, Award, Trophy, BookOpen, Sparkles, ArrowRight, Upload, Lightbulb, GraduationCap, PencilLine, BookMarked } from "lucide-react";
import Logo from "@/components/Logo";
import { useToast } from "@/hooks/use-toast";
import { authenticatedFetch } from "@/lib/api";
import { useEffect, useState, useMemo } from "react";
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
  name?: string;
  folder?: string;
  tags?: string[];
  createdAt: string;
  updatedAt?: string;
  meta: {
    countsByType: Record<string, number>;
  };
  hasAttempts?: boolean; // Will be populated by checking for attempts
}

interface UserStatistics {
  quizzesCompletedThisMonth: number;
  currentStreak: number;
  maxStreak: number;
  accuracyRate: number;
  averageScore: number;
  totalQuizzesTaken: number;
  totalQuizzesGenerated: number;
}

export default function Dashboard() {
  const { user, loading: isLoading, signOut } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string>("all");
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [editForm, setEditForm] = useState({ name: "", folder: "", tags: "" });
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { data: uploads, isLoading: uploadsLoading } = useQuery<Upload[]>({
    queryKey: ["/api/user/uploads"],
    retry: false,
    refetchOnWindowFocus: true,
    queryFn: async () => {
      const response = await authenticatedFetch("/api/user/uploads");
      return response.json();
    },
  });

  const { data: quizzes, isLoading: quizzesLoading } = useQuery<Quiz[]>({
    queryKey: ["/api/user/quizzes"],
    retry: false,
    refetchOnWindowFocus: true,
    queryFn: async () => {
      const response = await authenticatedFetch("/api/user/quizzes");
      const quizzes = await response.json();
      
      // Check which quizzes have attempts
      const quizzesWithAttempts = await Promise.all(
        quizzes.map(async (quiz: Quiz) => {
          try {
            console.log('Checking attempts for quiz:', quiz.id);
            const attemptResponse = await authenticatedFetch(`/api/quizzes/${quiz.id}/latest-attempt`);
            console.log('Attempt response for quiz', quiz.id, ':', attemptResponse.ok);
            return { ...quiz, hasAttempts: attemptResponse.ok };
          } catch (error) {
            console.log('Error checking attempts for quiz', quiz.id, ':', error);
            return { ...quiz, hasAttempts: false };
          }
        })
      );
      
      return quizzesWithAttempts;
    },
  });

  const { data: folders } = useQuery<string[]>({
    queryKey: ["/api/user/quiz-folders"],
    retry: false,
    refetchOnWindowFocus: true,
    queryFn: async () => {
      const response = await authenticatedFetch("/api/user/quiz-folders");
      return response.json();
    },
  });

  const { data: userStats, isLoading: statsLoading, error: statsError } = useQuery<UserStatistics>({
    queryKey: ["/api/user/statistics"],
    retry: false,
    refetchOnWindowFocus: true,
    queryFn: async () => {
      console.log('Fetching user statistics...');
      const response = await authenticatedFetch("/api/user/statistics");
      console.log('Statistics response status:', response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Statistics API error:', errorText);
        throw new Error(`Failed to fetch statistics: ${response.status} - ${errorText}`);
      }
      const data = await response.json();
      console.log('Statistics data received:', data);
      return data;
    },
  });

  // Debug query to check user data
  const { data: debugData } = useQuery({
    queryKey: ["/api/debug/user-data"],
    retry: false,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const response = await authenticatedFetch("/api/debug/user-data");
      const data = await response.json();
      console.log('Debug user data:', data);
      return data;
    },
  });

  const updateQuizMutation = useMutation({
    mutationFn: async ({ quizId, updates }: { quizId: string; updates: any }) => {
      const response = await authenticatedFetch(`/api/quizzes/${quizId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to update quiz');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/quizzes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/quiz-folders"] });
      toast({ title: "Quiz updated successfully" });
      setEditingQuiz(null);
      setIsEditDialogOpen(false);
      setEditForm({ name: "", folder: "", tags: "" });
    },
    onError: () => {
      toast({ title: "Failed to update quiz", variant: "destructive" });
    },
  });

  const deleteQuizMutation = useMutation({
    mutationFn: async (quizId: string) => {
      const response = await authenticatedFetch(`/api/quizzes/${quizId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to delete quiz');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/quizzes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/quiz-folders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/statistics"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/uploads"] });
      toast({ title: "Quiz deleted successfully" });
    },
    onError: (error) => {
      console.error('Delete quiz error:', error);
      toast({ 
        title: "Failed to delete quiz", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const handleLogout = () => {
    signOut();
  };

  const handleEditQuiz = (quiz: Quiz) => {
    setEditingQuiz(quiz);
    setEditForm({
      name: quiz.name || "",
      folder: quiz.folder || "",
      tags: quiz.tags?.join(", ") || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveQuiz = () => {
    if (!editingQuiz) return;
    
    const updates: any = {};
    if (editForm.name) updates.name = editForm.name;
    if (editForm.folder) updates.folder = editForm.folder;
    if (editForm.tags) updates.tags = editForm.tags.split(",").map(t => t.trim()).filter(t => t);

    updateQuizMutation.mutate({ quizId: editingQuiz.id, updates });
  };

  const handleDeleteQuiz = (quizId: string) => {
    deleteQuizMutation.mutate(quizId);
  };

  const handleCancelEdit = () => {
    setEditingQuiz(null);
    setIsEditDialogOpen(false);
    setEditForm({ name: "", folder: "", tags: "" });
  };


  // Filter quizzes based on search and folder
  const filteredQuizzes = quizzes?.filter(quiz => {
    const matchesSearch = !searchTerm || 
      (quiz.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (quiz.folder?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (quiz.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
    
    const matchesFolder = selectedFolder === "all" || 
      (selectedFolder === "uncategorized" && !quiz.folder) ||
      quiz.folder === selectedFolder;
    
    return matchesSearch && matchesFolder;
  }) || [];

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
        background: 'linear-gradient(135deg, #f8fafc 0%, #BDBFA3 30%, #B6E2D3 70%, #f8fafc 100%)'
      }}
    >

      <div className="relative z-10">
        <header className="shadow-sm" style={{ backgroundColor: '#61C2A2' }}>
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              {/* Logo */}
              <div className="flex items-center space-x-1">
                <Logo size="md" />
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
            <h2 className="text-5xl font-bold mb-4" style={{ color: '#09224E' }}>
              Welcome back, <span style={{ color: '#61C2A2' }}>{user?.fullName?.split(' ')[0] || user?.email?.split('@')[0] || 'Student'}!</span>
            </h2>
            <p className="text-xl max-w-2xl mx-auto leading-relaxed" style={{ color: '#09224E' }}>
              Upload a new PDF to generate quizzes or view your quiz history. Transform your learning experience with AI-powered assessments!
            </p>
          </div>

        <div className="grid lg:grid-cols-3 gap-8">
            {/* Quick Actions */}
            <div className="lg:col-span-1">
              <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-6">
                  <CardTitle className="flex items-center text-2xl" style={{ color: '#09224E' }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3" style={{ backgroundColor: '#09224E' }}>
                      <Plus className="h-5 w-5 text-white" />
                    </div>
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Link href="/upload">
                    <Button 
                      className="w-full h-12 text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 rounded-lg"
                      style={{ backgroundColor: '#61C2A2' }}
                      data-testid="button-upload-new"
                    >
                      <Upload className="h-5 w-5 mr-2" />
                      Upload New PDF
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Stats */}
              <Card className="mt-8 border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-6">
                  <CardTitle className="flex items-center text-2xl" style={{ color: '#09224E' }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3" style={{ backgroundColor: '#09224E' }}>
                      <BadgePercent className="h-5 w-5 text-white" />
                    </div>
                    Your Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {statsLoading ? (
                    <div className="text-center py-4 text-gray-500">Loading statistics...</div>
                  ) : statsError ? (
                    <div className="text-center py-4 text-red-500">
                      <p>Error loading statistics</p>
                      <p className="text-xs text-gray-400 mt-1">{statsError.message}</p>
                    </div>
                  ) : userStats ? (
                    <div className="space-y-6">
                      {/* Main Stats Grid */}
                      <div className="grid grid-cols-1 gap-4">
                        <div className="text-center p-4 rounded-lg" style={{ backgroundColor: '#B6E2D3' }}>
                          <Calendar className="h-6 w-6 mx-auto mb-2" style={{ color: '#09224E' }} />
                          <div className="text-2xl font-bold" style={{ color: '#09224E' }}>
                            {userStats.quizzesCompletedThisMonth}
                          </div>
                          <div className="text-xs" style={{ color: '#09224E' }}>This Month</div>
                        </div>
                      </div>

                      {/* Streaks */}
                      <div className="space-y-3">
                        <h4 className="font-medium text-sm flex items-center gap-2" style={{ color: '#09224E' }}>
                          <Zap className="h-4 w-4" />
                          Streaks
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="text-center p-3 rounded" style={{ backgroundColor: '#AFC8C4' }}>
                            <div className="font-semibold" style={{ color: '#09224E' }}>
                              {userStats.currentStreak}
                            </div>
                            <div className="text-xs" style={{ color: '#09224E' }}>Current</div>
                          </div>
                          <div className="text-center p-3 rounded" style={{ backgroundColor: '#CFD6C2' }}>
                            <div className="font-semibold" style={{ color: '#09224E' }}>
                              {userStats.maxStreak}
                            </div>
                            <div className="text-xs" style={{ color: '#09224E' }}>Best</div>
                          </div>
                        </div>
                      </div>

                      {/* Performance Metrics */}
                      <div className="space-y-3">
                        <h4 className="font-medium text-sm flex items-center gap-2" style={{ color: '#09224E' }}>
                          <Award className="h-4 w-4" />
                          Performance
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between items-center">
                            <span style={{ color: '#09224E' }}>Accuracy Rate</span>
                            <div className="flex items-center gap-2">
                              <div className="w-16 rounded-full h-2" style={{ backgroundColor: '#ffffff' }}>
                                <div 
                                  className="h-2 rounded-full" 
                                  style={{ 
                                    backgroundColor: '#61C2A2',
                                    width: `${Math.min(userStats.accuracyRate, 100)}%` 
                                  }}
                                ></div>
                              </div>
                              <span className="font-medium w-12 text-right" style={{ color: '#09224E' }}>{userStats.accuracyRate}%</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span style={{ color: '#09224E' }}>Average Score</span>
                            <div className="flex items-center gap-2">
                              <div className="w-16 rounded-full h-2" style={{ backgroundColor: '#ffffff' }}>
                                <div 
                                  className="h-2 rounded-full" 
                                  style={{ 
                                    backgroundColor: '#09224E',
                                    width: `${Math.min(userStats.averageScore, 100)}%` 
                                  }}
                                ></div>
                              </div>
                              <span className="font-medium w-12 text-right" style={{ color: '#09224E' }}>{userStats.averageScore}%</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Total Activity */}
                      <div className="space-y-3">
                        <h4 className="font-medium text-sm flex items-center gap-2" style={{ color: '#09224E' }}>
                          <Trophy className="h-4 w-4" />
                          Total Activity
                        </h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="text-center p-3 rounded" style={{ backgroundColor: '#AFC8C4' }}>
                            <div className="font-semibold" style={{ color: '#09224E' }}>
                              {userStats.totalQuizzesTaken}
                            </div>
                            <div className="text-xs" style={{ color: '#09224E' }}>Quizzes Taken</div>
                          </div>
                          <div className="text-center p-3 rounded" style={{ backgroundColor: '#CFD6C2' }}>
                            <div className="font-semibold" style={{ color: '#09224E' }}>
                              {userStats.totalQuizzesGenerated}
                            </div>
                            <div className="text-xs" style={{ color: '#09224E' }}>Quizzes Generated</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4" style={{ color: '#09224E' }}>
                      <BookOpen className="h-8 w-8 mx-auto mb-2" style={{ color: '#09224E' }} />
                      <p>No statistics available yet</p>
                      <p className="text-xs mt-1" style={{ color: '#09224E' }}>Complete some quizzes to see your progress</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quiz Management */}
            <div className="lg:col-span-2">
              <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-6">
                  <CardTitle className="flex items-center text-2xl" style={{ color: '#09224E' }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3" style={{ backgroundColor: '#09224E' }}>
                      <BookMarked className="h-5 w-5 text-white" />
                    </div>
                    Quiz Management
                  </CardTitle>
                  <CardDescription className="text-lg" style={{ color: '#09224E' }}>
                    Manage your quizzes with search, filters, and organization tools
                  </CardDescription>
                  
                  {/* Search and Filter Controls */}
                  <div className="flex flex-col sm:flex-row gap-4 mt-6">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search quizzes by name, folder, or tags..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 h-12 border-0 shadow-lg bg-white/80 backdrop-blur-sm"
                      />
                    </div>
                    <Select value={selectedFolder} onValueChange={setSelectedFolder}>
                      <SelectTrigger className="w-full sm:w-48 h-12 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                        <SelectValue placeholder="Filter by folder" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Folders</SelectItem>
                        <SelectItem value="uncategorized">Uncategorized</SelectItem>
                        {folders?.map(folder => (
                          <SelectItem key={folder} value={folder}>{folder}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  {quizzesLoading ? (
                    <div className="text-center py-12">
                      <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-lg" style={{ color: '#09224E' }}>Loading quizzes...</p>
                    </div>
                  ) : filteredQuizzes.length > 0 ? (
                    <div className="space-y-4">
                      {filteredQuizzes.map((quiz) => {
                        const upload = uploads?.find(u => u.id === quiz.uploadId);
                        return (
                          <div 
                            key={quiz.id} 
                            className="flex items-center justify-between p-6 border-0 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 bg-white hover:-translate-y-1 hover:scale-102"
                          >
                            <div className="flex items-center space-x-4 flex-1">
                              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#61C2A2' }}>
                                <PencilLine className="h-6 w-6 text-white" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="font-semibold text-lg" style={{ color: '#09224E' }}>
                                    {quiz.name || `Quiz from ${upload?.fileName || 'Unknown'}`}
                                  </h3>
                                  {quiz.folder && (
                                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 border-green-200">
                                      <Folder className="h-3 w-3 mr-1" />
                                      {quiz.folder}
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-sm mb-2" style={{ color: '#6B7280' }}>
                                  <span>From: {upload?.fileName}</span>
                                  <span>•</span>
                                  <span>{Object.values(quiz.meta.countsByType).reduce((a, b) => a + b, 0)} questions</span>
                                  <span>•</span>
                                  <span>Created {new Date(quiz.createdAt).toLocaleDateString()}</span>
                                </div>
                                {quiz.tags && quiz.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {quiz.tags.map(tag => (
                                      <Badge key={tag} variant="outline" className="text-xs border-teal-200 text-teal-700">
                                        <Tag className="h-3 w-3 mr-1" />
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {quiz.hasAttempts ? (
                                <Link href={`/quiz-results/${quiz.id}`}>
                                  <Button 
                                    className="h-10 px-4 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 rounded-lg"
                                    style={{ backgroundColor: '#61C2A2' }}
                                  >
                                    View Results
                                  </Button>
                                </Link>
                              ) : (
                                <Link href={`/quiz/${quiz.id}`}>
                                  <Button 
                                    className="h-10 px-4 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 rounded-lg"
                                    style={{ backgroundColor: '#61C2A2' }}
                                  >
                                    Take Quiz
                                  </Button>
                                </Link>
                              )}
                              <Dialog open={isEditDialogOpen && editingQuiz?.id === quiz.id} onOpenChange={setIsEditDialogOpen}>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => handleEditQuiz(quiz)}
                                    className="h-10 w-10 hover:bg-teal-100"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Edit Quiz</DialogTitle>
                                    <DialogDescription>
                                      Update the quiz name, folder, and tags.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <Label htmlFor="name">Quiz Name</Label>
                                      <Input
                                        id="name"
                                        value={editForm.name}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="Enter quiz name"
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="folder">Folder</Label>
                                      <Input
                                        id="folder"
                                        value={editForm.folder}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, folder: e.target.value }))}
                                        placeholder="Enter folder name"
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="tags">Tags (comma-separated)</Label>
                                      <Input
                                        id="tags"
                                        value={editForm.tags}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, tags: e.target.value }))}
                                        placeholder="e.g., database, sql, advanced"
                                      />
                                    </div>
                                  </div>
                                  <DialogFooter>
                                    <Button variant="outline" onClick={handleCancelEdit}>
                                      Cancel
                                    </Button>
                                    <Button 
                                      onClick={handleSaveQuiz}
                                      disabled={updateQuizMutation.isPending}
                                      style={{ backgroundColor: '#61C2A2' }}
                                    >
                                      {updateQuizMutation.isPending ? "Saving..." : "Save Changes"}
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="h-10 w-10 hover:bg-red-100"
                                  >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Quiz</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this quiz? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteQuiz(quiz.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: '#B6E2D3' }}>
                        <Brain className="h-10 w-10" style={{ color: '#09224E' }} />
                      </div>
                      <h3 className="text-2xl font-semibold mb-3" style={{ color: '#09224E' }}>
                        {searchTerm || selectedFolder !== "all" ? "No quizzes found" : "No quizzes yet"}
                      </h3>
                      <p className="text-lg mb-6" style={{ color: '#6B7280' }}>
                        {searchTerm || selectedFolder !== "all" 
                          ? "Try adjusting your search or filter criteria."
                          : "Upload a PDF and generate your first quiz to get started."
                        }
                      </p>
                      {!searchTerm && selectedFolder === "all" && (
                        <Link href="/upload">
                          <Button 
                            className="h-12 px-8 text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 rounded-lg"
                            style={{ backgroundColor: '#61C2A2' }}
                          >
                            <Plus className="h-5 w-5 mr-2" />
                            Upload Your First PDF
                            <ArrowRight className="ml-2 h-5 w-5" />
                          </Button>
                        </Link>
                      )}
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