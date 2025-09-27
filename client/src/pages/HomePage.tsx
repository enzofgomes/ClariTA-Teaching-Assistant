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
      description: "Simply drag and drop your lecture slides. We support PDF files up to 20MB with intelligent content extraction."
    },
    {
      icon: Zap,
      title: "AI-Powered Generation",
      description: "Our advanced AI analyzes your content and creates comprehensive quizzes with multiple choice, true/false, and short answer questions."
    },
    {
      icon: Brain,
      title: "Smart Learning",
      description: "Get personalized feedback and explanations for each answer to enhance your understanding and retention."
    },
    {
      icon: Users,
      title: "Track & Share",
      description: "Keep track of your quiz history, monitor progress, and share quizzes with classmates or students."
    }
  ];

  const benefits = [
    {
      icon: CheckCircle,
      title: "Instant Results",
      description: "Generate quizzes in seconds, not hours. Our AI works at lightning speed to create comprehensive assessments."
    },
    {
      icon: Star,
      title: "High Quality",
      description: "Advanced AI ensures questions are relevant, challenging, and aligned with your learning objectives."
    },
    {
      icon: Target,
      title: "Personalized Learning",
      description: "Adaptive questioning helps identify knowledge gaps and reinforces key concepts for better retention."
    }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section with Tufts Blue Gradient */}
      <section 
        className="py-20 relative overflow-hidden"
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
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
              Transform Your Lecture Slides Into 
              <span className="text-yellow-300"> Interactive Quizzes</span>
            </h1>
            
            <p className="text-xl mb-8 max-w-3xl mx-auto leading-relaxed text-white/90">
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
                <div className="text-3xl font-bold mb-2 text-yellow-300">1000+</div>
                <div className="text-white/80">Quizzes Generated</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2 text-yellow-300">500+</div>
                <div className="text-white/80">Happy Students</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2 text-yellow-300">95%</div>
                <div className="text-white/80">Accuracy Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section with Light Gray and Subtle Texture */}
      <section 
        id="how-it-works" 
        className="py-20 relative"
        style={{ backgroundColor: '#F9FAFB' }}
      >
        {/* Subtle geometric pattern */}
        <div className="absolute top-0 right-0 w-64 h-64 opacity-5">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1A8FE3" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="200" height="200" fill="url(#grid)" />
          </svg>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4" style={{ color: '#1F2937' }}>
              How ClariTA Helps You Learn
            </h2>
            <p className="text-xl max-w-2xl mx-auto" style={{ color: '#1F2937' }}>
              Our AI-powered platform makes studying more effective and engaging than ever before
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white hover:-translate-y-1">
                <CardHeader>
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: index % 3 === 0 ? '#1A8FE3' : index % 3 === 1 ? '#F17105' : '#AF16B4' }}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl" style={{ color: '#1F2937' }}>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription style={{ color: '#1F2937' }}>
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section with Soft Lavender Pink Tint */}
      <section 
        className="py-20 bg-white relative"
        style={{ 
          background: 'linear-gradient(135deg, rgba(255, 194, 226, 0.1) 0%, rgba(255, 255, 255, 1) 50%, rgba(255, 194, 226, 0.05) 100%)'
        }}
      >
        {/* Soft blob shapes */}
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full opacity-10" style={{ backgroundColor: '#FFC2E2' }}></div>
        <div className="absolute bottom-10 right-10 w-24 h-24 rounded-full opacity-10" style={{ backgroundColor: '#FFC2E2' }}></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4" style={{ color: '#1F2937' }}>
              Why Choose ClariTA?
            </h2>
            <p className="text-xl max-w-2xl mx-auto" style={{ color: '#1F2937' }}>
              Experience the future of personalized learning with our cutting-edge AI technology
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white hover:-translate-y-1">
                <CardContent className="p-8">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#AF16B4' }}>
                      <benefit.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-3" style={{ color: '#1F2937' }}>
                        {benefit.title}
                      </h3>
                      <p className="leading-relaxed" style={{ color: '#1F2937' }}>
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

      {/* CTA Section with Pumpkin to Saffron Gradient */}
      <section 
        className="py-20 relative overflow-hidden"
        style={{ 
          background: 'linear-gradient(135deg, #F17105 0%, #E6C229 100%)'
        }}
      >
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-transparent via-white/5 to-transparent"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold mb-4 text-white">
              Ready to Transform Your Learning?
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto text-white/90">
              Join thousands of students and educators who are already using ClariTA to enhance their learning experience. 
              Start generating quizzes from your lecture slides today!
            </p>
            <Button 
              size="lg" 
              onClick={handleGetStarted}
              className="text-lg px-8 py-4 text-white hover:opacity-90 bg-white/20 border-2 border-white hover:bg-white hover:text-orange-600 transition-all duration-300"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer with Tufts Blue and Abstract Educational Shapes */}
      <footer 
        className="relative overflow-hidden"
        style={{ backgroundColor: '#1A8FE3' }}
      >
        {/* Abstract educational shapes */}
        <div className="absolute inset-0 opacity-10">
          <BookOpen className="absolute top-8 left-16 w-8 h-8 text-white" />
          <Lightbulb className="absolute top-12 right-20 w-6 h-6 text-white" />
          <BarChart3 className="absolute bottom-8 left-32 w-7 h-7 text-white" />
          <Brain className="absolute bottom-12 right-16 w-6 h-6 text-white" />
          <div className="absolute top-20 right-1/4 w-4 h-4 rounded-full bg-white"></div>
          <div className="absolute bottom-20 left-1/4 w-3 h-3 rounded-full bg-white"></div>
        </div>
        
        <div className="container mx-auto px-4 py-8 relative z-10">
          <div className="text-center text-white">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Brain className="h-6 w-6 text-white" />
              <span className="text-lg font-semibold">ClariTA</span>
            </div>
            <p>&copy; 2024 ClariTA. Transforming education with AI.</p>
            <p className="text-sm mt-2">Made with ❤️ by Enzo, Angelica, Fabianne, and Veronica</p>
          </div>
        </div>
      </footer>
    </div>
  );
}