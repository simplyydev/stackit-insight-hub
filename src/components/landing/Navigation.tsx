import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, MessageSquare } from "lucide-react";

export const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-background/90 backdrop-blur-md shadow-sm' : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">StackIt</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => scrollToSection('features')}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </button>
            <button 
              onClick={() => scrollToSection('how-it-works')}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              How it Works
            </button>
            <button 
              onClick={() => scrollToSection('tech-stack')}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Tech Stack
            </button>
            <Button 
              variant="default" 
              onClick={() => scrollToSection('waitlist')}
            >
              Join Waitlist
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-background/95 backdrop-blur-md border-b border-border">
            <div className="container mx-auto px-6 py-4 space-y-4">
              <button 
                onClick={() => scrollToSection('features')}
                className="block w-full text-left text-muted-foreground hover:text-foreground transition-colors py-2"
              >
                Features
              </button>
              <button 
                onClick={() => scrollToSection('how-it-works')}
                className="block w-full text-left text-muted-foreground hover:text-foreground transition-colors py-2"
              >
                How it Works
              </button>
              <button 
                onClick={() => scrollToSection('tech-stack')}
                className="block w-full text-left text-muted-foreground hover:text-foreground transition-colors py-2"
              >
                Tech Stack
              </button>
              <Button 
                variant="default" 
                className="w-full"
                onClick={() => scrollToSection('waitlist')}
              >
                Join Waitlist
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};