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
import Logo from './Logo';

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

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #f5e2aa 0%, #fef7e0 50%, #f5e2aa 100%)' }}>

      <div className="relative z-10">
        {/* Header */}
        <header className="w-full py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className="relative">
                <div className="w-16 h-16 rounded-xl flex items-center justify-center shadow-xl" style={{ backgroundColor: '#de8318' }}>
                  <Logo size="lg" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: '#dc5817' }}>
                  <Sparkles className="h-3 w-3 text-white" />
                </div>
              </div>
              <div className="text-center">
                <h1 className="text-4xl font-bold" style={{ color: '#6b2d16' }}>
                  ClariTA
                </h1>
                <p className="text-lg font-medium" style={{ color: '#6b2d16' }}>
                  Teaching Assistant
                </p>
              </div>
            </div>
            <div className="text-center">
              <p className="max-w-2xl mx-auto text-lg leading-relaxed" style={{ color: '#6b2d16' }}>
                Transform your lecture slides into interactive quizzes with AI-powered intelligence
              </p>
            </div>
          </div>
        </header>

        {/* Auth Form */}
        <div className="flex items-center justify-center px-4 pb-12">
          <Card className="w-full max-w-md shadow-2xl border-0 bg-white/95 backdrop-blur-sm :shadhoverow-3xl transition-all duration-300 hover:scale-105">
            <CardHeader className="text-center pb-8 pt-8">
              <CardTitle className="text-3xl font-bold" style={{ color: '#6b2d16' }}>
                Welcome Back
              </CardTitle>
              <CardDescription className="text-lg" style={{ color: '#6b2d16' }}>
                Sign in to your account or create a new one to get started
              </CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <Tabs value={isSignUp ? 'signup' : 'signin'} onValueChange={(value) => setIsSignUp(value === 'signup')}>
                <TabsList className="grid w-full grid-cols-2 bg-gray-100 rounded-lg p-1">
                  <TabsTrigger 
                    value="signin" 
                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm font-medium transition-all duration-200"
                    style={{ color: '#6b2d16' }}
                  >
                    Sign In
                  </TabsTrigger>
                  <TabsTrigger 
                    value="signup" 
                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm font-medium transition-all duration-200"
                    style={{ color: '#6b2d16' }}
                  >
                    Sign Up
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="signin" className="mt-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-3">
                      <Label htmlFor="email" className="text-sm font-semibold" style={{ color: '#6b2d16' }}>
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                        className="h-12 border-gray-200 focus:border-orange-600 focus:ring-orange-600 rounded-lg text-base"
                        placeholder="Enter your email"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="password" className="text-sm font-semibold" style={{ color: '#6b2d16' }}>
                        Password
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        required
                        className="h-12 border-gray-200 focus:border-orange-600 focus:ring-orange-600 rounded-lg text-base"
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
                      style={{ backgroundColor: '#de8318' }}
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
                      <Label htmlFor="signup-email" className="text-sm font-semibold" style={{ color: '#6b2d16' }}>
                        Email Address
                      </Label>
                      <Input
                        id="signup-email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                        className="h-12 border-gray-200 focus:border-orange-600 focus:ring-orange-600 rounded-lg text-base"
                        placeholder="Enter your email"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="fullName" className="text-sm font-semibold" style={{ color: '#6b2d16' }}>
                        Full Name
                      </Label>
                      <Input
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        className="h-12 border-gray-200 focus:border-orange-600 focus:ring-orange-600 rounded-lg text-base"
                        placeholder="Full name"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="signup-password" className="text-sm font-semibold" style={{ color: '#6b2d16' }}>
                        Password
                      </Label>
                      <Input
                        id="signup-password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        required
                        className="h-12 border-gray-200 focus:border-orange-600 focus:ring-orange-600 rounded-lg text-base"
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
                      style={{ backgroundColor: '#de8318' }}
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