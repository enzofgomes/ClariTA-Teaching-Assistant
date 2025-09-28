import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Zap, Brain, Users, ArrowRight, CheckCircle, Star, Target, BookOpen, Lightbulb, BarChart3 } from "lucide-react";
import Header from "@/components/Header";

export default function HomePage() {
  const handleGetStarted = () => {
    window.location.href = "/login";
  };

  const features = [
    {
      icon: FileText,
      title: "Upload PDFs",
      description: "Simply drag and drop your lecture slides! We support PDF files up to 20MB with intelligent content extraction. It's super easy!"
    },
    {
      icon: Zap,
      title: "AI-Powered Generation",
      description: "Our super smart AI analyzes your content and creates amazing quizzes with multiple choice, true/false, and short answer questions!"
    },
    {
      icon: Brain,
      title: "Smart Learning",
      description: "Get personalized feedback and explanations for each answer to boost your understanding and memory! You'll learn faster!"
    },
    {
      icon: Users,
      title: "Track & Share",
      description: "Keep track of your quiz history, monitor your awesome progress, and share quizzes with friends or classmates!"
    }
  ];

  const benefits = [
    {
      icon: CheckCircle,
      title: "Instant Results",
      description: "Generate quizzes in seconds, not hours! Our AI works at lightning speed to create amazing assessments. Super fast!"
    },
    {
      icon: Star,
      title: "High Quality",
      description: "Advanced AI ensures questions are super relevant, challenging, and perfectly aligned with your learning goals!"
    },
    {
      icon: Target,
      title: "Personalized Learning",
      description: "Smart questioning helps find knowledge gaps and reinforces key concepts for better memory! You'll ace it!"
    }
  ];

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section with Desert Mountains */}
      <section 
        className="py-20 relative overflow-hidden"
        style={{ 
          background: 'linear-gradient(180deg, #f4e4bc 0%, #e8d5a3 30%, #d4c4a8 60%, #c4b59a 100%)'
        }}
      >
        {/* Desert Sand Dunes */}
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" viewBox="0 0 1200 400" preserveAspectRatio="none">
            {/* Tall sand dunes - background */}
            <path d="M0,300 Q200,220 400,240 Q600,200 800,230 Q1000,180 1200,210 L1200,400 L0,400 Z" fill="#8b7355"/>
            {/* Smaller sand dunes - foreground */}
            <path d="M0,350 Q300,340 600,345 Q900,335 1200,340 L1200,400 L0,400 Z" fill="#b89d6b"/>
          </svg>
        </div>
        
        {/* Subtle overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/10"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-6" style={{ color: '#6b2d16' }}>
              Transform Your Lecture Slides Into 
              <span style={{ color: '#dc5817' }}> Interactive Quizzes</span>
            </h1>

            <p className="text-xl mb-8 max-w-3xl mx-auto leading-relaxed" style={{ color: '#6b2d16' }}>
              Upload your PDF lecture slides and instantly generate personalized quizzes powered by AI. 
              Perfect for students, educators, and professionals who want to test their knowledge and enhance their learning experience.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button 
                size="lg" 
                onClick={handleGetStarted}
                className="text-lg px-8 py-4 text-white hover:opacity-90"
                style={{ backgroundColor: '#F17105' }}
              >
                Give It a Try
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="text-lg px-8 py-4 hover:opacity-90 border-orange-300 text-orange-600 hover:bg-orange-50 hover:text-orange-700"
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Learn More
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold mb-2" style={{ color: '#dc5817' }}>1000+</div>
                <div style={{ color: '#6b2d16' }}>Quizzes Generated</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2" style={{ color: '#dc5817' }}>670+</div>
                <div style={{ color: '#6b2d16' }}>Happy Students</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2" style={{ color: '#dc5817' }}>95%</div>
                <div style={{ color: '#6b2d16' }}>Accuracy Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section with Warm Cream Background */}
      <section 
        id="how-it-works" 
        className="py-20 relative"
        style={{ backgroundColor: '#fef7e0' }}
      >
        {/* Subtle pattern */}
        <div className="absolute top-0 right-0 w-64 h-64 opacity-5">
          <div className="w-full h-full bg-gradient-to-br from-transparent via-orange-200/20 to-transparent rounded-full"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4" style={{ color: '#6b2d16' }}>
              How ClariTA Helps You Learn
            </h2>
            <p className="text-xl max-w-2xl mx-auto" style={{ color: '#6b2d16' }}>
              Our AI-powered platform makes studying more effective and engaging than ever before!
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white hover:-translate-y-1 hover:scale-105">
                <CardHeader>
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: index % 3 === 0 ? '#de8318' : index % 3 === 1 ? '#dc5817' : '#6b2d16' }}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl" style={{ color: '#6b2d16' }}>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription style={{ color: '#6b2d16' }}>
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section with Warm Cream Background */}
      <section 
        className="py-20 relative"
        style={{ backgroundColor: '#fef7e0' }}
      >
        {/* Subtle blob shapes */}
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full opacity-20" style={{ backgroundColor: '#f5e2aa' }}></div>
        <div className="absolute bottom-10 right-10 w-24 h-24 rounded-full opacity-20" style={{ backgroundColor: '#f5e2aa' }}></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4" style={{ color: '#dc5817' }}>
              Why Choose ClariTA?
            </h2>
            <p className="text-xl max-w-2xl mx-auto" style={{ color: '#6b2d16' }}>
              Experience the future of personalized learning with our cutting-edge AI technology!
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white hover:-translate-y-1 hover:scale-105">
                <CardContent className="p-8">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#de8318' }}>
                      <benefit.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-3" style={{ color: '#6b2d16' }}>
                        {benefit.title}
                      </h3>
                      <p className="leading-relaxed" style={{ color: '#6b2d16' }}>
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section with Warm Gradient Background */}
      <section 
        className="py-20 relative overflow-hidden"
        style={{ 
          background: 'linear-gradient(135deg, #fef7e0 0%, #f5e2aa 50%, #fef7e0 100%)'
        }}
      >
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-transparent via-white/5 to-transparent"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold mb-4" style={{ color: '#6b2d16' }}>
              Ready to Transform Your Learning?
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto" style={{ color: '#6b2d16' }}>
              Join thousands of students and educators who are already using ClariTA to enhance their learning experience! 
              Start generating quizzes from your lecture slides today!
            </p>
            <Button 
              size="lg" 
              onClick={handleGetStarted}
              className="text-lg px-8 py-4 text-white hover:opacity-90 transition-all duration-300 hover:scale-105"
              style={{ backgroundColor: '#de8318' }}
            >
              Get Started Free!
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer with Warm Orange and Educational Shapes */}
      <footer 
        className="relative overflow-hidden"
        style={{ backgroundColor: '#de8318' }}
      >

        <div className="container mx-auto px-4 py-8 relative z-10">
          <div className="text-center text-white">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Brain className="h-6 w-6 text-white" />
              <span className="text-lg font-semibold">ClariTA</span>
            </div>
            <p>&copy; 2025 ClariTA. Transforming education with AI!</p>
            <p className="text-sm mt-2">Made with ❤️ by Enzo, Angelica, Fabianne, and Veronica</p>
          </div>
        </div>
      </footer>
    </div>
  );
}