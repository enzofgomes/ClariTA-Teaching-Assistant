import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { lazy, Suspense } from "react";
import AuthForm from "@/components/AuthForm";
import LandingPage from "@/pages/LandingPage";

// Lazy load pages for better performance
const UploadPage = lazy(() => import("@/pages/UploadPage"));
const QuizPage = lazy(() => import("@/pages/QuizPage"));
const QuizResultsPage = lazy(() => import("@/pages/QuizResultsPage"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const NotFound = lazy(() => import("@/pages/not-found"));

function Router() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    }>
      <Switch>
        <Route path="/" component={LandingPage} />
        <Route path="/login" component={() => <AuthForm />} />
        {user && (
          <>
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/upload" component={UploadPage} />
            <Route path="/quiz/:quizId" component={QuizPage} />
            <Route path="/quiz-results/:quizId" component={QuizResultsPage} />
          </>
        )}
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
