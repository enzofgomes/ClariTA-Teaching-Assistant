import React, { useState, useEffect } from 'react';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { Brain, GraduationCap, Sparkles } from 'lucide-react';

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

  // Force background to stay by adding classes to body and html
  useEffect(() => {
    document.body.classList.add('auth-form-page');
    document.documentElement.classList.add('auth-form-page');
    
    // Force background every 100ms to prevent any override
    const forceBackground = () => {
      const body = document.body;
      const html = document.documentElement;
      const container = document.querySelector('.auth-form-container');
      
      if (body) {
        body.style.background = 'linear-gradient(to bottom right, rgb(239 246 255), rgb(238 242 255), rgb(221 214 254))';
        body.style.backgroundAttachment = 'fixed';
        body.style.backgroundSize = 'cover';
        body.style.backgroundRepeat = 'no-repeat';
      }
      
      if (html) {
        html.style.background = 'linear-gradient(to bottom right, rgb(239 246 255), rgb(238 242 255), rgb(221 214 254))';
        html.style.backgroundAttachment = 'fixed';
        html.style.backgroundSize = 'cover';
        html.style.backgroundRepeat = 'no-repeat';
      }
      
      if (container && container instanceof HTMLElement) {
        container.style.background = 'linear-gradient(to bottom right, rgb(239 246 255), rgb(238 242 255), rgb(221 214 254))';
        container.style.backgroundAttachment = 'fixed';
        container.style.backgroundSize = 'cover';
        container.style.backgroundRepeat = 'no-repeat';
      }

      // Force logo styling to stay consistent
      const logoContainer = document.querySelector('.w-12.h-12.rounded-xl');
      const logoText = document.querySelector('h1');
      const sparkleContainer = document.querySelector('.absolute.-top-1.-right-1');
      
      if (logoContainer && logoContainer instanceof HTMLElement) {
        logoContainer.style.background = 'linear-gradient(to bottom right, rgb(37 99 235), rgb(147 51 234))';
        logoContainer.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
      }
      
      if (logoText && logoText instanceof HTMLElement) {
        logoText.style.background = 'linear-gradient(to right, rgb(37 99 235), rgb(147 51 234))';
        logoText.style.webkitBackgroundClip = 'text';
        logoText.style.webkitTextFillColor = 'transparent';
        logoText.style.backgroundClip = 'text';
      }
      
      if (sparkleContainer && sparkleContainer instanceof HTMLElement) {
        sparkleContainer.style.background = 'linear-gradient(to bottom right, rgb(251 191 36), rgb(249 115 22))';
      }

      // Force button styling to stay consistent
      const buttons = document.querySelectorAll('button[type="submit"]');
      buttons.forEach(button => {
        if (button instanceof HTMLButtonElement && !button.disabled) {
          button.style.background = 'linear-gradient(to right, rgb(37 99 235), rgb(147 51 234))';
          button.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
          button.style.color = 'white';
        }
      });
    };
    
    // Force immediately
    forceBackground();
    
    // Force every 100ms
    const interval = setInterval(forceBackground, 100);
    
    return () => {
      clearInterval(interval);
      document.body.classList.remove('auth-form-page');
      document.documentElement.classList.remove('auth-form-page');
      // Reset styles
      document.body.style.background = '';
      document.documentElement.style.background = '';
    };
  }, []);

  return (
    <div 
      className="auth-form-container min-h-screen fixed inset-0 overflow-y-auto"
      style={{
        background: 'linear-gradient(to bottom right, rgb(239 246 255), rgb(238 242 255), rgb(221 214 254))',
        backgroundAttachment: 'fixed',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="relative z-10">
        {/* Header */}
        <header className="w-full py-8">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="relative">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                  style={{
                    background: 'linear-gradient(to bottom right, rgb(37 99 235), rgb(147 51 234))',
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
                    background: 'linear-gradient(to bottom right, rgb(251 191 36), rgb(249 115 22))'
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
                  className="text-3xl font-bold"
                  style={{
                    background: 'linear-gradient(to right, rgb(37 99 235), rgb(147 51 234))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  ClariTA
                </h1>
                <p 
                  className="text-sm font-medium"
                  style={{ color: 'rgb(75 85 99)' }}
                >
                  Teaching Assistant
                </p>
              </div>
            </div>
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
                Transform your lecture slides into interactive quizzes with AI-powered intelligence
              </p>
            </div>
          </div>
        </header>

        {/* Auth Form */}
        <div className="flex items-center justify-center px-4 pb-8">
          <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-white">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Sign in to your account or create a new one to get started
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={isSignUp ? 'signup' : 'signin'} onValueChange={(value) => setIsSignUp(value === 'signup')}>
                <TabsList className="grid w-full grid-cols-2 bg-gray-100 dark:bg-gray-700">
                  <TabsTrigger value="signin" className="data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-600">
                    Sign In
                  </TabsTrigger>
                  <TabsTrigger value="signup" className="data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-600">
                    Sign Up
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="signin" className="mt-6">
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                        className="h-11 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Enter your email"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Password
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        required
                        className="h-11 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Enter your password"
                      />
                    </div>
                    {signInError && (
                      <Alert variant="destructive" className="border-red-200 bg-red-50 dark:bg-red-900/20">
                        <AlertDescription className="text-red-800 dark:text-red-200">
                          {signInError.message}
                        </AlertDescription>
                      </Alert>
                    )}
                    <Button 
                      type="submit" 
                      className="w-full h-11 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200" 
                      disabled={isSigningIn}
                      style={{
                        background: 'linear-gradient(to right, rgb(37 99 235), rgb(147 51 234))',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(to right, rgb(29 78 216), rgb(126 34 206))';
                        e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(to right, rgb(37 99 235), rgb(147 51 234))';
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
                      <Label htmlFor="signup-email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email Address
                      </Label>
                      <Input
                        id="signup-email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                        className="h-11 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Enter your email"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          First Name
                        </Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          className="h-11 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                          placeholder="First name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Last Name
                        </Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          className="h-11 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                          placeholder="Last name"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Password
                      </Label>
                      <Input
                        id="signup-password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        required
                        className="h-11 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Create a password"
                      />
                    </div>
                    {signUpError && (
                      <Alert variant="destructive" className="border-red-200 bg-red-50 dark:bg-red-900/20">
                        <AlertDescription className="text-red-800 dark:text-red-200">
                          {signUpError.message}
                        </AlertDescription>
                      </Alert>
                    )}
                    <Button 
                      type="submit" 
                      className="w-full h-11 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200" 
                      disabled={isSigningUp}
                      style={{
                        background: 'linear-gradient(to right, rgb(37 99 235), rgb(147 51 234))',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(to right, rgb(29 78 216), rgb(126 34 206))';
                        e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(to right, rgb(37 99 235), rgb(147 51 234))';
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