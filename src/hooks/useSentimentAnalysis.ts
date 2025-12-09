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

export function useSentimentAnalysis() {
  const [isLoading, setIsLoading] = useState(false);
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

  const clearResult = useCallback(() => {
    setResult(null);
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  return {
    isLoading,
    result,
    history,
    error,
    analyze,
    clearResult,
    clearHistory,
  };
}
