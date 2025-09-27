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
import { FileText, Brain, Plus, LogOut, User, Search, Edit, Trash2, Folder, Tag, MoreHorizontal } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { authenticatedFetch } from "@/lib/api";
import { useEffect, useState } from "react";
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

          {/* Quiz Management */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Quiz Management</CardTitle>
                    <CardDescription>
                      Manage your generated quizzes with folders, tags, and search
                    </CardDescription>
                  </div>
                </div>
                
                {/* Search and Filter Controls */}
                <div className="flex flex-col sm:flex-row gap-4 mt-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search quizzes by name, folder, or tags..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={selectedFolder} onValueChange={setSelectedFolder}>
                    <SelectTrigger className="w-full sm:w-48">
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
                  <div className="text-center py-8 text-gray-500">Loading quizzes...</div>
                ) : filteredQuizzes.length > 0 ? (
                  <div className="space-y-4">
                    {filteredQuizzes.map((quiz) => {
                      const upload = uploads?.find(u => u.id === quiz.uploadId);
                      return (
                        <div 
                          key={quiz.id} 
                          className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <div className="flex items-center space-x-3 flex-1">
                            <Brain className="h-8 w-8 text-purple-500" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-medium text-gray-900 dark:text-white">
                                  {quiz.name || `Quiz from ${upload?.fileName || 'Unknown'}`}
                                </h3>
                                {quiz.folder && (
                                  <Badge variant="secondary" className="text-xs">
                                    <Folder className="h-3 w-3 mr-1" />
                                    {quiz.folder}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <span>From: {upload?.fileName}</span>
                                <span>•</span>
                                <span>{Object.values(quiz.meta.countsByType).reduce((a, b) => a + b, 0)} questions</span>
                                <span>•</span>
                                <span>Created {new Date(quiz.createdAt).toLocaleDateString()}</span>
                              </div>
                              {quiz.tags && quiz.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {quiz.tags.map(tag => (
                                    <Badge key={tag} variant="outline" className="text-xs">
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
                                <Button variant="outline" size="sm">
                                  View Results
                                </Button>
                              </Link>
                            ) : (
                              <Link href={`/quiz/${quiz.id}`}>
                                <Button variant="outline" size="sm">
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
                                  >
                                    {updateQuizMutation.isPending ? "Saving..." : "Save Changes"}
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm">
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
                  <div className="text-center py-8">
                    <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      {searchTerm || selectedFolder !== "all" ? "No quizzes found" : "No quizzes yet"}
                    </h3>
                    <p className="text-gray-500 mb-4">
                      {searchTerm || selectedFolder !== "all" 
                        ? "Try adjusting your search or filter criteria."
                        : "Upload a PDF and generate your first quiz to get started."
                      }
                    </p>
                    {!searchTerm && selectedFolder === "all" && (
                      <Link href="/upload">
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Upload Your First PDF
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
  );
}