import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation, Redirect } from 'wouter';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { Brain, Sparkles, ArrowRight } from 'lucide-react';

interface AuthFormProps {
  onSuccess?: () => void;
}

export default function AuthForm({ onSuccess }: AuthFormProps = {}) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { signIn, signUp, user, loading } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect to dashboard if already authenticated
  if (user) {
    return <Redirect to="/dashboard" />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      if (isSignUp) {
        const { error } = await signUp(
          formData.email,
          formData.password,
          formData.fullName
        );
        
        if (error) {
          setError(error.message || 'Sign up failed');
        } else {
          onSuccess?.();
          setLocation('/dashboard');
        }
      } else {
        const { error } = await signIn(formData.email, formData.password);
        
        if (error) {
          setError(error.message || 'Sign in failed');
        } else {
          onSuccess?.();
          setLocation('/dashboard');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Background styling to match LandingPage
  useEffect(() => {
    document.body.style.background = 'linear-gradient(135deg, #1A8FE3 0%, #2563EB 100%)';
    document.body.style.backgroundAttachment = 'fixed';
    
    return () => {
      document.body.style.background = '';
      document.body.style.backgroundAttachment = '';
    };
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1A8FE3 0%, #2563EB 100%)' }}>
      {/* Subtle wave pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" fill="white"/>
          <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" fill="white"/>
        </svg>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="w-full py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className="relative">
                <div className="w-16 h-16 rounded-xl flex items-center justify-center shadow-xl" style={{ backgroundColor: '#F17105' }}>
                  <Brain className="h-9 w-9 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: '#AF16B4' }}>
                  <Sparkles className="h-3 w-3 text-white" />
                </div>
              </div>
              <div className="text-center">
                <h1 className="text-4xl font-bold text-white">
                  ClariTA
                </h1>
                <p className="text-lg font-medium text-white/90">
                  Teaching Assistant
                </p>
              </div>
            </div>
            <div className="text-center">
              <p className="text-white/90 max-w-2xl mx-auto text-lg leading-relaxed">
                Transform your lecture slides into interactive quizzes with AI-powered intelligence
              </p>
            </div>
          </div>
        </header>

        {/* Auth Form */}
        <div className="flex items-center justify-center px-4 pb-12">
          <Card className="w-full max-w-md shadow-2xl border-0 bg-white/95 backdrop-blur-sm hover:shadow-3xl transition-all duration-300">
            <CardHeader className="text-center pb-8 pt-8">
              <CardTitle className="text-3xl font-bold" style={{ color: '#1F2937' }}>
                Welcome Back
              </CardTitle>
              <CardDescription className="text-lg" style={{ color: '#1F2937' }}>
                Sign in to your account or create a new one to get started
              </CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <Tabs value={isSignUp ? 'signup' : 'signin'} onValueChange={(value) => setIsSignUp(value === 'signup')}>
                <TabsList className="grid w-full grid-cols-2 bg-gray-100 rounded-lg p-1">
                  <TabsTrigger 
                    value="signin" 
                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm font-medium transition-all duration-200"
                    style={{ color: '#1F2937' }}
                  >
                    Sign In
                  </TabsTrigger>
                  <TabsTrigger 
                    value="signup" 
                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm font-medium transition-all duration-200"
                    style={{ color: '#1F2937' }}
                  >
                    Sign Up
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="signin" className="mt-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-3">
                      <Label htmlFor="email" className="text-sm font-semibold" style={{ color: '#1F2937' }}>
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                        className="h-12 border-gray-200 focus:border-orange-500 focus:ring-orange-500 rounded-lg text-base"
                        placeholder="Enter your email"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="password" className="text-sm font-semibold" style={{ color: '#1F2937' }}>
                        Password
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        required
                        className="h-12 border-gray-200 focus:border-orange-500 focus:ring-orange-500 rounded-lg text-base"
                        placeholder="Enter your password"
                      />
                    </div>
                    {error && (
                      <Alert variant="destructive" className="border-red-200 bg-red-50 rounded-lg">
                        <AlertDescription className="text-red-800">
                          {error}
                        </AlertDescription>
                      </Alert>
                    )}
                    <Button 
                      type="submit" 
                      className="w-full h-12 text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 rounded-lg"
                      style={{ backgroundColor: '#F17105' }}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Signing In...</span>
                        </div>
                      ) : (
                        <>
                          Sign In
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="signup" className="mt-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-3">
                      <Label htmlFor="signup-email" className="text-sm font-semibold" style={{ color: '#1F2937' }}>
                        Email Address
                      </Label>
                      <Input
                        id="signup-email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                        className="h-12 border-gray-200 focus:border-orange-500 focus:ring-orange-500 rounded-lg text-base"
                        placeholder="Enter your email"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="fullName" className="text-sm font-semibold" style={{ color: '#1F2937' }}>
                        Full Name
                      </Label>
                      <Input
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        className="h-12 border-gray-200 focus:border-orange-500 focus:ring-orange-500 rounded-lg text-base"
                        placeholder="Full name"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="signup-password" className="text-sm font-semibold" style={{ color: '#1F2937' }}>
                        Password
                      </Label>
                      <Input
                        id="signup-password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        required
                        className="h-12 border-gray-200 focus:border-orange-500 focus:ring-orange-500 rounded-lg text-base"
                        placeholder="Create a password"
                      />
                    </div>
                    {error && (
                      <Alert variant="destructive" className="border-red-200 bg-red-50 rounded-lg">
                        <AlertDescription className="text-red-800">
                          {error}
                        </AlertDescription>
                      </Alert>
                    )}
                    <Button 
                      type="submit" 
                      className="w-full h-12 text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 rounded-lg"
                      style={{ backgroundColor: '#F17105' }}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Creating Account...</span>
                        </div>
                      ) : (
                        <>
                          Create Account
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}