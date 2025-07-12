import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Vote, Tags, Bell, Users, Shield } from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "Ask & Answer",
    description: "Rich text editor with markdown support for well-formatted questions and comprehensive answers. Express your thoughts clearly with code blocks, lists, and formatting.",
    color: "text-primary"
  },
  {
    icon: Vote,
    title: "Vote & Accept",
    description: "Community-driven quality through voting system. Question authors can accept the best answer, helping future learners find the most helpful solutions quickly.",
    color: "text-success"
  },
  {
    icon: Tags,
    title: "Smart Tagging",
    description: "Organize knowledge with intelligent tagging system. Questions are automatically categorized by topics, making it easy to find and contribute to relevant discussions.",
    color: "text-warning"
  },
  {
    icon: Bell,
    title: "Stay Updated",
    description: "Real-time notifications keep you informed when someone responds to your questions, mentions you, or when there's activity in topics you follow.",
    color: "text-accent"
  },
  {
    icon: Users,
    title: "Simple Roles",
    description: "Clean permission system: Guests can read, Users can post and interact, Admins can moderate. No complicated hierarchies, just focused collaboration.",
    color: "text-slate-foreground"
  },
  {
    icon: Shield,
    title: "Quality First",
    description: "Built-in moderation tools and community guidelines ensure high-quality discussions. Focus on learning and helping others in a respectful environment.",
    color: "text-destructive"
  }
];

export const Features = () => {
  return (
    <section className="py-24 bg-gradient-surface">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Everything You Need for
            <span className="bg-gradient-primary bg-clip-text text-transparent"> Quality Q&A</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Thoughtfully designed features that promote meaningful discussions and collaborative learning.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index} 
                className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-card/50 backdrop-blur-sm border-border/50"
              >
                <CardHeader>
                  <div className={`w-12 h-12 rounded-xl bg-accent-light flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};