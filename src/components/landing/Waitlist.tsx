import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Mail, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const Waitlist = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address to join the waitlist.",
        variant: "destructive"
      });
      return;
    }

    // Simulate API call
    setTimeout(() => {
      setIsSubmitted(true);
      toast({
        title: "Welcome to the waitlist! 🎉",
        description: "We'll notify you as soon as StackIt launches.",
      });
    }, 500);
  };

  return (
    <section id="waitlist" className="py-24 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-gradient-primary opacity-10 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Be the First to Experience
            <span className="bg-gradient-primary bg-clip-text text-transparent"> StackIt</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Join our waitlist to get early access, beta testing opportunities, and updates on our development progress.
          </p>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-accent-light rounded-full flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold mb-2">Early Access</h3>
              <p className="text-sm text-muted-foreground">Get first access to StackIt when we launch</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Beta Testing</h3>
              <p className="text-sm text-muted-foreground">Help shape the platform with your feedback</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 text-success" />
              </div>
              <h3 className="font-semibold mb-2">Updates</h3>
              <p className="text-sm text-muted-foreground">Regular development updates and launch notifications</p>
            </div>
          </div>

          <Card className="max-w-md mx-auto bg-card/80 backdrop-blur-sm shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Join the Waitlist</CardTitle>
              <CardDescription>
                No spam, just updates about StackIt's development and launch.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!isSubmitted ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    variant="waitlist" 
                    size="lg" 
                    className="w-full"
                  >
                    Join Waitlist
                  </Button>
                </form>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">You're on the list!</h3>
                  <p className="text-muted-foreground">
                    We'll keep you updated on StackIt's progress and let you know as soon as we launch.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <p className="text-sm text-muted-foreground mt-8">
            Expected launch: Q1 2025 • No spam, unsubscribe anytime
          </p>
        </div>
      </div>
    </section>
  );
};