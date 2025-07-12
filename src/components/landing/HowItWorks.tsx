import { Card, CardContent } from "@/components/ui/card";
import { HelpCircle, MessageCircle, Lightbulb, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: HelpCircle,
    title: "Ask",
    description: "Post your question with clear context, relevant tags, and code examples if needed. Our rich text editor makes formatting easy.",
    step: "01"
  },
  {
    icon: MessageCircle,
    title: "Answer",
    description: "Community members provide thoughtful answers. Vote on helpful responses and engage in constructive discussions.",
    step: "02"
  },
  {
    icon: Lightbulb,
    title: "Learn",
    description: "Mark the best answer as accepted, bookmark useful content, and build your knowledge base for future reference.",
    step: "03"
  }
];

export const HowItWorks = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            How StackIt Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Simple, straightforward process that gets you the answers you need quickly and efficiently.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connection lines for desktop */}
            <div className="hidden md:block absolute top-16 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-primary via-accent to-success"></div>
            
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isMiddle = index === 1;
              
              return (
                <div key={index} className="relative">
                  {/* Step number */}
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-primary text-primary-foreground text-xl font-bold mb-4 relative z-10">
                      {step.step}
                    </div>
                  </div>

                  <Card className="text-center group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <CardContent className="p-8">
                      <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-accent-light flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Icon className="w-8 h-8 text-primary" />
                      </div>
                      
                      <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                      <p className="text-muted-foreground text-base leading-relaxed">
                        {step.description}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Arrow for mobile */}
                  {index < steps.length - 1 && (
                    <div className="md:hidden flex justify-center my-8">
                      <ArrowRight className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};