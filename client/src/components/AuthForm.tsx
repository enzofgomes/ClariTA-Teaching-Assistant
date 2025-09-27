import React, { useState, useEffect } from 'react';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { Brain, GraduationCap, Sparkles, BookOpen, Lightbulb, BarChart3 } from 'lucide-react';

interface AuthFormProps {
  onSuccess?: () => void;
}

export default function AuthForm({ onSuccess }: AuthFormProps = {}) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });

  const {
    signIn,
    signUp,
    isSigningIn,
    isSigningUp,
    signInError,
    signUpError,
  } = useSupabaseAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSignUp) {
      signUp(
        {
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
        },
        {
          onSuccess: () => {
            onSuccess?.();
          },
        }
      );
    } else {
      signIn(
        {
          email: formData.email,
          password: formData.password,
        },
        {
          onSuccess: () => {
            onSuccess?.();
          },
        }
      );
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Clean up background styling
  useEffect(() => {
    document.body.classList.add('auth-form-page');
    document.documentElement.classList.add('auth-form-page');
    
    return () => {
      document.body.classList.remove('auth-form-page');
      document.documentElement.classList.remove('auth-form-page');
      // Reset styles
      document.body.style.background = '';
      document.documentElement.style.background = '';
    };
  }, []);

  return (
    <div 
      className="min-h-screen relative overflow-hidden"
      style={{ 
        background: 'linear-gradient(135deg, #1A8FE3 0%, #2563EB 100%)'
      }}
    >
      {/* Subtle wave pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" fill="white"/>
          <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" fill="white"/>
        </svg>
      </div>

      {/* Abstract educational shapes */}
      <div className="absolute inset-0 opacity-10">
        <BookOpen className="absolute top-16 left-16 w-8 h-8 text-white" />
        <Lightbulb className="absolute top-20 right-20 w-6 h-6 text-white" />
        <BarChart3 className="absolute bottom-16 left-32 w-7 h-7 text-white" />
        <Brain className="absolute bottom-20 right-16 w-6 h-6 text-white" />
        <div className="absolute top-32 right-1/4 w-4 h-4 rounded-full bg-white"></div>
        <div className="absolute bottom-32 left-1/4 w-3 h-3 rounded-full bg-white"></div>
      </div>
      
      <div className="relative z-10">
        {/* Header */}
        <header className="w-full py-8">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="relative">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                  style={{
                    background: 'linear-gradient(135deg, #1A8FE3 0%, #2563EB 100%)',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                  }}
                >
                  <Brain 
                    className="h-7 w-7" 
                    style={{ color: 'white' }}
                  />
                </div>
                <div 
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #F17105 0%, #E6C229 100%)'
                  }}
                >
                  <Sparkles 
                    className="h-2.5 w-2.5" 
                    style={{ color: 'white' }}
                  />
                </div>
              </div>
              <div className="text-center">
                <h1 
                  className="text-3xl font-bold text-white"
                >
                  ClariTA
                </h1>
                <p 
                  className="text-sm font-medium text-white/80"
                >
                  Teaching Assistant
                </p>
              </div>
            </div>
            <div className="text-center">
              <p className="text-white/90 max-w-md mx-auto">
                Transform your lecture slides into interactive quizzes with AI-powered intelligence
              </p>
            </div>
          </div>
        </header>

        {/* Auth Form */}
        <div className="flex items-center justify-center px-4 pb-8">
          <Card className="w-full max-w-md shadow-xl border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-semibold" style={{ color: '#1F2937' }}>
                Welcome Back
              </CardTitle>
              <CardDescription style={{ color: '#1F2937' }}>
                Sign in to your account or create a new one to get started
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={isSignUp ? 'signup' : 'signin'} onValueChange={(value) => setIsSignUp(value === 'signup')}>
                <TabsList className="grid w-full grid-cols-2" style={{ backgroundColor: '#F9FAFB' }}>
                  <TabsTrigger 
                    value="signin" 
                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    style={{ color: '#1F2937' }}
                  >
                    Sign In
                  </TabsTrigger>
                  <TabsTrigger 
                    value="signup" 
                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    style={{ color: '#1F2937' }}
                  >
                    Sign Up
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="signin" className="mt-6">
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium" style={{ color: '#1F2937' }}>
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                        className="h-11 border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                        placeholder="Enter your email"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-medium" style={{ color: '#1F2937' }}>
                        Password
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        required
                        className="h-11 border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                        placeholder="Enter your password"
                      />
                    </div>
                    {signInError && (
                      <Alert variant="destructive" className="border-red-200 bg-red-50">
                        <AlertDescription className="text-red-800">
                          {signInError.message}
                        </AlertDescription>
                      </Alert>
                    )}
                    <Button 
                      type="submit" 
                      className="w-full h-11 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200" 
                      disabled={isSigningIn}
                      style={{
                        background: '#F17105',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#E65A00';
                        e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#F17105';
                        e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
                      }}
                    >
                      {isSigningIn ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Signing In...</span>
                        </div>
                      ) : (
                        'Sign In'
                      )}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="signup" className="mt-6">
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="text-sm font-medium" style={{ color: '#1F2937' }}>
                        Email Address
                      </Label>
                      <Input
                        id="signup-email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                        className="h-11 border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                        placeholder="Enter your email"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-sm font-medium" style={{ color: '#1F2937' }}>
                          First Name
                        </Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          className="h-11 border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                          placeholder="First name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-sm font-medium" style={{ color: '#1F2937' }}>
                          Last Name
                        </Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          className="h-11 border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                          placeholder="Last name"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-sm font-medium" style={{ color: '#1F2937' }}>
                        Password
                      </Label>
                      <Input
                        id="signup-password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        required
                        className="h-11 border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                        placeholder="Create a password"
                      />
                    </div>
                    {signUpError && (
                      <Alert variant="destructive" className="border-red-200 bg-red-50">
                        <AlertDescription className="text-red-800">
                          {signUpError.message}
                        </AlertDescription>
                      </Alert>
                    )}
                    <Button 
                      type="submit" 
                      className="w-full h-11 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200" 
                      disabled={isSigningUp}
                      style={{
                        background: '#F17105',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#E65A00';
                        e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#F17105';
                        e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
                      }}
                    >
                      {isSigningUp ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Creating Account...</span>
                        </div>
                      ) : (
                        'Create Account'
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