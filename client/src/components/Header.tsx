import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Brain, Menu, X, Users, Info, Sparkles, Heart, Star, Lightbulb, Target } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const teamMembers = [
  {
    name: "Enzo",
    description: "BS Information Technology | FIU | First Time Hacker",
    initial: "E"
  },
  {
    name: "Angelica", 
    description: "AA Computer Science | MDC | First Time Hacker",
    initial: "A"
  },
  {
    name: "Fabianne",
    description: "BS Computer Science | FIU | First Time Hacker",
    initial: "F"
  },
  {
    name: "Veronica",
    description: "AA Computer Science | MDC | First Time Hacker",
    initial: "V"
  }
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogin = () => {
    window.location.href = "/login";
  };

  return (
    <header className="shadow-sm border-b" style={{ backgroundColor: '#1A8FE3' }}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-white" />
            <h1 className="text-2xl font-bold text-white">ClariTA</h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 text-white hover:bg-white/10 group">
                  <div className="relative">
                    <Sparkles className="h-4 w-4 transition-transform group-hover:scale-110 group-hover:rotate-12" />
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-300 rounded-full animate-pulse"></div>
                  </div>
                  <span>About Us</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>About ClariTA</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-gray-600 dark:text-gray-300">
                    ClariTA is an innovative AI-powered teaching assistant designed to transform the way students 
                    and educators interact with educational content. Our mission is to make learning more engaging, 
                    accessible, and effective through intelligent quiz generation.
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">
                    By leveraging cutting-edge artificial intelligence, we convert static lecture slides into 
                    dynamic, interactive quizzes that help students test their knowledge, identify learning gaps, 
                    and reinforce key concepts. Whether you're a student preparing for exams or an educator 
                    looking to enhance your teaching materials, ClariTA provides the tools you need to succeed.
                  </p>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Our Goal</h3>
                    <p className="text-blue-800 dark:text-blue-200 text-sm">
                      To democratize access to personalized learning experiences by making AI-powered educational 
                      tools available to everyone, regardless of their technical background or resources.
                    </p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 text-white hover:bg-white/10 group">
                  <div className="relative">
                    <Users className="h-4 w-4 transition-transform group-hover:scale-110" />
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-pink-300 rounded-full animate-pulse"></div>
                  </div>
                  <span>The Team</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>Meet Our Team</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {teamMembers.map((member, index) => (
                    <Card key={index} className="border-0 shadow-sm">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                              {member.initial}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                              {member.name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                              {member.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </DialogContent>
            </Dialog>

            <Button onClick={handleLogin} style={{ backgroundColor: '#F17105' }} className="hover:opacity-90 text-white">
              Try It Now
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden text-white hover:bg-white/10"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t border-white/20 pt-4">
            <div className="flex flex-col space-y-3">
               <Dialog>
                 <DialogTrigger asChild>
                   <Button variant="ghost" className="justify-start text-white hover:bg-white/10 group">
                     <div className="relative mr-2">
                       <Sparkles className="h-4 w-4 transition-transform group-hover:scale-110 group-hover:rotate-12" />
                       <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-300 rounded-full animate-pulse"></div>
                     </div>
                     About Us
                   </Button>
                 </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>About ClariTA</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <p className="text-gray-600 dark:text-gray-300">
                      ClariTA is an innovative AI-powered teaching assistant designed to transform the way students 
                      and educators interact with educational content. Our mission is to make learning more engaging, 
                      accessible, and effective through intelligent quiz generation.
                    </p>
                    <p className="text-gray-600 dark:text-gray-300">
                      By leveraging cutting-edge artificial intelligence, we convert static lecture slides into 
                      dynamic, interactive quizzes that help students test their knowledge, identify learning gaps, 
                      and reinforce key concepts. Whether you're a student preparing for exams or an educator 
                      looking to enhance your teaching materials, ClariTA provides the tools you need to succeed.
                    </p>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Our Goal</h3>
                      <p className="text-blue-800 dark:text-blue-200 text-sm">
                        To democratize access to personalized learning experiences by making AI-powered educational 
                        tools available to everyone, regardless of their technical background or resources.
                      </p>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

               <Dialog>
                 <DialogTrigger asChild>
                   <Button variant="ghost" className="justify-start text-white hover:bg-white/10 group">
                     <div className="relative mr-2">
                       <Users className="h-4 w-4 transition-transform group-hover:scale-110" />
                       <div className="absolute -top-1 -right-1 w-2 h-2 bg-pink-300 rounded-full animate-pulse"></div>
                     </div>
                     The Team
                   </Button>
                 </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <DialogHeader>
                    <DialogTitle>Meet Our Team</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {teamMembers.map((member, index) => (
                      <Card key={index} className="border-0 shadow-sm">
                        <CardContent className="p-6">
                          <div className="flex items-start space-x-4">
                            <Avatar className="h-12 w-12">
                              <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                                {member.initial}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                                {member.name}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                                {member.description}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>

              <Button onClick={handleLogin} style={{ backgroundColor: '#F17105' }} className="hover:opacity-90 text-white w-full">
                Try It Now
              </Button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
