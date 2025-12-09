import { History as HistoryIcon, Trash2 } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { SentimentHistoryCard } from "@/components/sentiment/SentimentHistoryCard";
import { useSentimentAnalysis } from "@/hooks/useSentimentAnalysis";

const History = () => {
  const { history, clearHistory } = useSentimentAnalysis();

  return (
    <div className="min-h-screen flex flex-col hero-gradient">
      <Navbar />

      <main className="flex-1 pt-28 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-8 animate-in">
            <div>
              <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2">
                Analysis History
              </h1>
              <p className="text-muted-foreground">
                View all your past sentiment analyses
              </p>
            </div>
            {history.length > 0 && (
              <Button variant="ghost" onClick={clearHistory} className="text-muted-foreground hover:text-destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>

          {history.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {history.map((item, index) => (
                <SentimentHistoryCard
                  key={`${item.timestamp.getTime()}-${index}`}
                  data={item}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="glass-card p-12 text-center animate-in">
              <HistoryIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
              <h2 className="font-display font-semibold text-xl mb-2">No History Yet</h2>
              <p className="text-muted-foreground mb-6">
                Your analyzed reviews will appear here. Start by analyzing your first review!
              </p>
              <Button variant="hero" onClick={() => window.location.href = "/"}>
                Start Analyzing
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default History;
