import { Brain, Users, Code2, Sparkles, ExternalLink } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import TeamList from "@/components/TeamList";

const techStack = [
  { name: "React", description: "Frontend Framework" },
  { name: "TypeScript", description: "Type Safety" },
  { name: "Tailwind CSS", description: "Styling" },
  { name: "BERT", description: "NLP Model" },
  { name: "Python Flask", description: "Backend API" },
  { name: "PyTorch", description: "ML Framework" },
];

const About = () => {
  return (
    <div className="min-h-screen flex flex-col hero-gradient">
      <Navbar />

      <main className="flex-1 pt-28 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Hero */}
          <section className="text-center mb-16 animate-in">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mx-auto mb-6 shadow-glow">
              <Brain className="w-10 h-10 text-primary-foreground" />
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4">
              About <span className="gradient-text">Moodify</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A cutting-edge sentiment analysis tool designed to help businesses 
              understand customer emotions in product reviews.
            </p>
          </section>

          {/* Project Info */}
          <section className="glass-card p-8 mb-8 animate-slide-up opacity-0" style={{ animationDelay: "0.1s", animationFillMode: "forwards" }}>
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="w-6 h-6 text-primary" />
              <h2 className="font-display font-semibold text-2xl">The Project</h2>
            </div>
            <div className="prose prose-muted max-w-none">
              <p className="text-muted-foreground leading-relaxed">
                Moodify is a machine learning-powered web application that performs sentiment 
                analysis on e-commerce product reviews. Using a fine-tuned BERT (Bidirectional 
                Encoder Representations from Transformers) model, it can accurately classify 
                reviews as positive, negative, or neutral, along with confidence scores.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                This project was developed as part of a Project Exhibition, demonstrating the 
                practical application of natural language processing in real-world business scenarios.
              </p>
            </div>
          </section>

          {/* Tech Stack */}
          <section className="glass-card p-8 mb-8 animate-slide-up opacity-0" style={{ animationDelay: "0.2s", animationFillMode: "forwards" }}>
            <div className="flex items-center gap-3 mb-6">
              <Code2 className="w-6 h-6 text-primary" />
              <h2 className="font-display font-semibold text-2xl">Tech Stack</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {techStack.map((tech) => (
                <div key={tech.name} className="p-4 rounded-xl bg-secondary/50 border border-border/50">
                  <p className="font-semibold">{tech.name}</p>
                  <p className="text-sm text-muted-foreground">{tech.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Team */}
          <section className="glass-card p-8 animate-slide-up opacity-0" style={{ animationDelay: "0.3s", animationFillMode: "forwards" }}>
            <div className="flex items-center gap-3 mb-6">
              <Users className="w-6 h-6 text-primary" />
              <h2 className="font-display font-semibold text-2xl">The Team</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Built with passion by our ML project team. We combined our expertise in
              full-stack development and machine learning to deliver a seamless and
              insightful sentiment analysis experience.
            </p>

            <h3 className="font-semibold text-lg mt-6 mb-3">Our Team Members</h3>

            <TeamList />


            <a
              href="https://github.com/priyanshuranjan02/Moodify-WebApp"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="glass">
                <ExternalLink className="w-4 h-4 mr-2" />
                View on GitHub
              </Button>
            </a>

          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;
