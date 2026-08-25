import { History as HistoryIcon, Trash2, RefreshCw, AlertCircle, Loader2 } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { SentimentHistoryCard } from "@/components/sentiment/SentimentHistoryCard";
import { useSentimentAnalysis } from "@/hooks/useSentimentAnalysis";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const History = () => {
  const { history, isHistoryLoading, historyError, loadHistoryFromDB, clearHistory } =
    useSentimentAnalysis();

  return (
    <div className="min-h-screen flex flex-col hero-gradient">
      <Navbar />

      <main className="flex-1 pt-28 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 animate-in">
            <div>
              <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2">
                Analysis History
              </h1>
              <p className="text-muted-foreground">
                View recent sentiment predictions from our BiLSTM model
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="glass"
                size="sm"
                onClick={loadHistoryFromDB}
                disabled={isHistoryLoading}
              >
                <RefreshCw className={cn("w-4 h-4 mr-2", isHistoryLoading && "animate-spin")} />
                Refresh
              </Button>
              {history.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearHistory}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear View
                </Button>
              )}
            </div>
          </div>

          {historyError && (
            <div className="mb-6 p-4 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive flex items-center justify-between animate-in">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">{historyError}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={loadHistoryFromDB}>
                Retry
              </Button>
            </div>
          )}

          {isHistoryLoading && history.length === 0 ? (
            <div className="glass-card p-12 text-center animate-in">
              <Loader2 className="w-10 h-10 mx-auto mb-4 text-primary animate-spin" />
              <h2 className="font-display font-semibold text-lg mb-2">Loading History...</h2>
              <p className="text-sm text-muted-foreground">
                Fetching recent sentiment analyses from database
              </p>
            </div>
          ) : history.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {history.map((item, index) => (
                <SentimentHistoryCard
                  key={`${item.timestamp?.getTime?.() ?? index}-${index}`}
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
              <Link to="/">
                <Button variant="hero">Start Analyzing</Button>
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default History;
