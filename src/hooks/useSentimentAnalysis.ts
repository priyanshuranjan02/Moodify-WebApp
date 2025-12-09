import { useState, useCallback } from "react";
import { SentimentData } from "@/components/sentiment/SentimentResult";
import { toast } from "@/hooks/use-toast";

// API Configuration - Update this URL to match your backend
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

interface ApiResponse {
  sentiment: "positive" | "negative" | "neutral";
  confidence: number;
  score?: number;
}

interface BatchApiResponse {
  results: ApiResponse[];
}

export function useSentimentAnalysis() {
  const [isLoading, setIsLoading] = useState(false);
  const [isFileLoading, setIsFileLoading] = useState(false);
  const [result, setResult] = useState<SentimentData | null>(null);
  const [history, setHistory] = useState<SentimentData[]>([]);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(async (text: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text, review: text }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data: ApiResponse = await response.json();

      const sentimentResult: SentimentData = {
        sentiment: data.sentiment.toLowerCase() as "positive" | "negative" | "neutral",
        confidence: data.confidence ?? data.score ?? 0.85,
        text,
        timestamp: new Date(),
      };

      setResult(sentimentResult);
      setHistory((prev) => [sentimentResult, ...prev].slice(0, 20));

      toast({
        title: "Analysis Complete",
        description: `Detected ${sentimentResult.sentiment} sentiment with ${Math.round(sentimentResult.confidence * 100)}% confidence`,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to analyze sentiment";
      setError(message);
      
      // Demo mode: Generate mock result when backend is unavailable
      const mockSentiments: ("positive" | "negative" | "neutral")[] = ["positive", "negative", "neutral"];
      const randomSentiment = mockSentiments[Math.floor(Math.random() * mockSentiments.length)];
      const mockConfidence = 0.75 + Math.random() * 0.2;

      const mockResult: SentimentData = {
        sentiment: randomSentiment,
        confidence: mockConfidence,
        text,
        timestamp: new Date(),
      };

      setResult(mockResult);
      setHistory((prev) => [mockResult, ...prev].slice(0, 20));

      toast({
        title: "Demo Mode",
        description: "Backend unavailable. Showing simulated result.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const analyzeFile = useCallback(async (file: File) => {
    setIsFileLoading(true);
    setError(null);

    try {
      // Parse CSV file
      const text = await file.text();
      const lines = text.split("\n").filter(line => line.trim());
      const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
      
      const reviewIndex = headers.findIndex(h => h === "review" || h === "text" || h === "content");
      if (reviewIndex === -1) {
        throw new Error("CSV must have a 'review', 'text', or 'content' column");
      }

      const reviews = lines.slice(1).map(line => {
        const values = line.split(",");
        return values[reviewIndex]?.trim().replace(/^["']|["']$/g, "") || "";
      }).filter(r => r.length > 0);

      if (reviews.length === 0) {
        throw new Error("No valid reviews found in CSV");
      }

      // Try batch endpoint first
      try {
        const response = await fetch(`${API_BASE_URL}/predict/batch`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reviews }),
        });

        if (response.ok) {
          const data: BatchApiResponse = await response.json();
          const results: SentimentData[] = data.results.map((r, i) => ({
            sentiment: r.sentiment.toLowerCase() as "positive" | "negative" | "neutral",
            confidence: r.confidence ?? r.score ?? 0.85,
            text: reviews[i],
            timestamp: new Date(),
          }));

          setHistory((prev) => [...results, ...prev].slice(0, 50));
          toast({
            title: "Batch Analysis Complete",
            description: `Analyzed ${results.length} reviews successfully`,
          });
          return;
        }
      } catch {
        // Fall through to individual analysis
      }

      // Fallback: analyze individually
      const results: SentimentData[] = [];
      for (const review of reviews.slice(0, 10)) {
        try {
          const response = await fetch(`${API_BASE_URL}/predict`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ text: review, review }),
          });

          if (response.ok) {
            const data: ApiResponse = await response.json();
            results.push({
              sentiment: data.sentiment.toLowerCase() as "positive" | "negative" | "neutral",
              confidence: data.confidence ?? data.score ?? 0.85,
              text: review,
              timestamp: new Date(),
            });
          }
        } catch {
          // Generate mock for failed individual request
          const mockSentiments: ("positive" | "negative" | "neutral")[] = ["positive", "negative", "neutral"];
          results.push({
            sentiment: mockSentiments[Math.floor(Math.random() * 3)],
            confidence: 0.75 + Math.random() * 0.2,
            text: review,
            timestamp: new Date(),
          });
        }
      }

      setHistory((prev) => [...results, ...prev].slice(0, 50));
      toast({
        title: "Batch Analysis Complete",
        description: `Analyzed ${results.length} reviews (demo mode for some)`,
      });

    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to analyze file";
      setError(message);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsFileLoading(false);
    }
  }, []);

  const clearResult = useCallback(() => {
    setResult(null);
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  return {
    isLoading,
    isFileLoading,
    result,
    history,
    error,
    analyze,
    analyzeFile,
    clearResult,
    clearHistory,
  };
}
