import { Card, CardContent } from "@/components/ui/card";

const technologies = [
  {
    name: "Next.js",
    description: "React framework for production",
    icon: "⚛️",
    category: "Frontend"
  },
  {
    name: "Tailwind CSS",
    description: "Utility-first CSS framework",
    icon: "🎨",
    category: "Styling"
  },
  {
    name: "Supabase",
    description: "Auth, database & realtime",
    icon: "⚡",
    category: "Backend"
  },
  {
    name: "TipTap",
    description: "Rich text editor",
    icon: "✏️",
    category: "Editor"
  },
  {
    name: "TypeScript",
    description: "Type-safe development",
    icon: "🔷",
    category: "Language"
  },
  {
    name: "shadcn/ui",
    description: "Beautiful UI components",
    icon: "🎯",
    category: "Components"
  }
];

export const TechStack = () => {
  return (
    <section className="py-24 bg-gradient-surface">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Built with Modern Tech
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            StackIt leverages cutting-edge technologies to deliver a fast, reliable, and scalable platform.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {technologies.map((tech, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-card/80 backdrop-blur-sm"
            >
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {tech.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{tech.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">{tech.description}</p>
                <span className="inline-block px-3 py-1 text-xs font-medium bg-accent-light text-accent rounded-full">
                  {tech.category}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground">
            And many more amazing open-source tools that make development a joy
          </p>
        </div>
      </div>
    </section>
  );
};