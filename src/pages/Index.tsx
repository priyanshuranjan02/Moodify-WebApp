import { Sparkles, Zap, Shield, BarChart3, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SentimentInput } from "@/components/sentiment/SentimentInput";
import { SentimentResult } from "@/components/sentiment/SentimentResult";
import { LoadingAnimation } from "@/components/sentiment/LoadingAnimation";
import { SentimentHistoryCard } from "@/components/sentiment/SentimentHistoryCard";
import { FileUpload } from "@/components/sentiment/FileUpload";
import { useSentimentAnalysis } from "@/hooks/useSentimentAnalysis";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const features = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Get instant sentiment analysis powered by optimized BERT inference",
  },
  {
    icon: Shield,
    title: "Highly Accurate",
    description: "State-of-the-art NLP model trained on millions of reviews",
  },
  {
    icon: BarChart3,
    title: "Detailed Insights",
    description: "Confidence scores and comprehensive sentiment breakdown",
  },
];

const Index = () => {
  const { isLoading, isFileLoading, result, history, analyze, analyzeFile, clearResult } = useSentimentAnalysis();

  return (
    <div className="min-h-screen flex flex-col hero-gradient">
      <Navbar />
      
      <main className="flex-1 pt-28 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Hero Section */}
          <section className="text-center mb-16 animate-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/50 border border-primary/20 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4 text-primary" />
              BERT-Powered Sentiment Analysis
            </div>
            
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
              Understand Customer
              <br />
              <span className="gradient-text">Emotions Instantly</span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Moodify uses advanced machine learning to analyze product reviews and extract 
              meaningful sentiment insights. Perfect for e-commerce businesses.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button variant="hero" size="lg" onClick={() => document.getElementById('analyze')?.scrollIntoView({ behavior: 'smooth' })}>
                Start Analyzing
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button variant="glass" size="lg">
                Learn More
              </Button>
            </div>
          </section>

          {/* Features */}
          <section className="grid md:grid-cols-3 gap-6 mb-16">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="glass-card p-6 text-center animate-slide-up opacity-0"
                style={{ animationDelay: `${index * 0.1}s`, animationFillMode: "forwards" }}
              >
                <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </section>

          {/* Analysis Section */}
          <section id="analyze" className="space-y-8 scroll-mt-32">
            <div className="grid gap-6 lg:grid-cols-2">
              <SentimentInput onAnalyze={analyze} isLoading={isLoading} />
              <FileUpload onFileAnalyze={analyzeFile} isLoading={isFileLoading} />
            </div>

            {isLoading && <LoadingAnimation />}

            {result && !isLoading && (
              <div className="space-y-4">
                <SentimentResult result={result} />
                <div className="flex justify-center">
                  <Button variant="ghost" onClick={clearResult}>
                    Clear & Analyze Another
                  </Button>
                </div>
              </div>
            )}

            {/* Recent History */}
            {history.length > 0 && !isLoading && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-display font-semibold text-xl">Recent Analyses</h2>
                  <span className="text-sm text-muted-foreground">{history.length} results</span>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {history.slice(0, 4).map((item, index) => (
                    <SentimentHistoryCard key={`${item.timestamp.getTime()}-${index}`} data={item} index={index} />
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
