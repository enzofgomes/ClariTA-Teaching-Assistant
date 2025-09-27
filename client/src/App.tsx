import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import AuthForm from "@/components/AuthForm";
import UploadPage from "@/pages/UploadPage";
import QuizPage from "@/pages/QuizPage";
import LandingPage from "@/pages/LandingPage";
import Dashboard from "@/pages/Dashboard";
import NotFound from "@/pages/not-found";

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
    <Switch>
      {!user ? (
        <Route path="/" component={AuthForm} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/upload" component={UploadPage} />
          <Route path="/quiz/:quizId" component={QuizPage} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
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
