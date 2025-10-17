import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Brain, Menu, X, Info, Sparkles, Heart, Star, Lightbulb, Target } from "lucide-react";
import Logo from "./Logo";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogin = () => {
    window.location.href = "/login";
  };

  return (
    <header className="shadow-sm" style={{ backgroundColor: '#61C2A2' }}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center space-x-1">
            <Logo size="md" />
            <h1 className="text-2xl font-bold text-white">ClariTA</h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 text-white bg-white/20 hover:bg-white/30 hover:text-white group">
                  <div className="relative">
                    <Sparkles className="h-4 w-4 transition-transform group-hover:scale-110 group-hover:rotate-12" />
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-300 rounded-full animate-pulse"></div>
                  </div>
                  <span>About Us</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl" style={{ backgroundColor: '#f8fafc' }}>
                <DialogHeader>
                  <DialogTitle style={{ color: '#09224E' }}>About ClariTA</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p style={{ color: '#09224E' }}>
                    ClariTA is a small personal project aimed to make studying more dynamic. It was built by a student for students that struggle. I hope you enjoy the platform and it helps you study better.
                  </p>
                  <p style={{ color: '#09224E' }}>
                    <strong>How it works:</strong>
                    <br />1. Upload your PDF lecture slides
                    <br />2. AI reads your content and creates quiz questions
                    <br />3. Take the quiz to test your knowledge
                    <br />4. Get instant feedback to see what you know and what to study more
                  </p>
                  <div className="p-4 rounded-lg" style={{ backgroundColor: '#B6E2D3' }}>
                    <h3 className="font-semibold mb-2" style={{ color: '#09224E' }}>Perfect for Students!</h3>
                    <p className="text-sm" style={{ color: '#09224E' }}>
                      Turn any lecture PDF into practice quizzes. Study smarter, not harder! 
                      Great for exam prep and understanding your course material better.
                    </p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

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
                   <Button variant="ghost" className="justify-start text-white bg-white/20 hover:bg-white/30 hover:text-white group">
                     <div className="relative mr-2">
                       <Sparkles className="h-4 w-4 transition-transform group-hover:scale-110 group-hover:rotate-12" />
                       <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-300 rounded-full animate-pulse"></div>
                     </div>
                     About Us
                   </Button>
                 </DialogTrigger>
                 <DialogContent className="max-w-2xl" style={{ backgroundColor: '#f8fafc' }}>
                <DialogHeader>
                  <DialogTitle style={{ color: '#09224E' }}>About ClariTA</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p style={{ color: '#09224E' }}>
                    ClariTA is a small personal project aimed to make studying more dynamic. It was built by a student for students that struggle. I hope you enjoy the platform and it helps you study better.
                  </p>
                  <p style={{ color: '#09224E' }}>
                    <strong>How it works:</strong>
                    <br />1. Upload your PDF lecture slides
                    <br />2. AI reads your content and creates quiz questions
                    <br />3. Take the quiz to test your knowledge
                    <br />4. Get instant feedback to see what you know and what to study more
                  </p>
                  <div className="p-4 rounded-lg" style={{ backgroundColor: '#B6E2D3' }}>
                    <h3 className="font-semibold mb-2" style={{ color: '#09224E' }}>Perfect for Students!</h3>
                    <p className="text-sm" style={{ color: '#09224E' }}>
                      Turn any lecture PDF into practice quizzes. Study smarter, not harder! 
                      Great for exam prep and understanding your course material better.
                    </p>
                  </div>
                </div>
              </DialogContent>
              </Dialog>

            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
