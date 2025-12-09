import { useState, useCallback } from "react";
import { SentimentData } from "@/components/sentiment/SentimentResult";
import { CsvSummaryData } from "@/components/sentiment/CsvSentimentSummary";
import { toast } from "@/hooks/use-toast";

// API Configuration - Update this URL to match your backend
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

type ExtendedSentiment = "very_positive" | "positive" | "neutral" | "negative" | "very_negative";

interface ApiResponse {
  sentiment: ExtendedSentiment;
  confidence: number;
  score?: number;
}

interface BatchApiResponse {
  results: ApiResponse[];
}

interface CsvApiResponse {
  very_positive?: number;
  positive?: number;
  neutral?: number;
  negative?: number;
  very_negative?: number;
  veryPositive?: number;
  veryNegative?: number;
  total?: number;
}

export function useSentimentAnalysis() {
  const [isLoading, setIsLoading] = useState(false);
  const [isFileLoading, setIsFileLoading] = useState(false);
  const [result, setResult] = useState<SentimentData | null>(null);
  const [csvSummary, setCsvSummary] = useState<CsvSummaryData | null>(null);
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
    setCsvSummary(null);

    try {
      // Try FormData upload first (for backend that accepts file directly)
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch(`${API_BASE_URL}/predict/csv`, {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const data: CsvApiResponse = await response.json();
          const summary: CsvSummaryData = {
            veryPositive: data.very_positive ?? data.veryPositive ?? 0,
            positive: data.positive ?? 0,
            neutral: data.neutral ?? 0,
            negative: data.negative ?? 0,
            veryNegative: data.very_negative ?? data.veryNegative ?? 0,
            total: data.total ?? 0,
          };
          
          // Calculate total if not provided
          if (!summary.total) {
            summary.total = summary.veryPositive + summary.positive + summary.neutral + summary.negative + summary.veryNegative;
          }
          
          setCsvSummary(summary);
          toast({
            title: "CSV Analysis Complete",
            description: `Analyzed ${summary.total.toLocaleString()} reviews successfully`,
          });
          return;
        }
      } catch {
        // Fall through to parse CSV manually
      }

      // Parse CSV file manually
      const text = await file.text();
      const lines = text.split("\n").filter(line => line.trim());
      const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
      
      const reviewIndex = headers.findIndex(h => h === "review" || h === "text" || h === "content");
      if (reviewIndex === -1) {
        throw new Error("CSV must have a 'review', 'text', or 'content' column");
      }

      const reviews = lines.slice(1).map(line => {
        // Handle CSV with quoted values containing commas
        const values: string[] = [];
        let current = "";
        let inQuotes = false;
        
        for (const char of line) {
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            values.push(current.trim());
            current = "";
          } else {
            current += char;
          }
        }
        values.push(current.trim());
        
        return values[reviewIndex]?.replace(/^["']|["']$/g, "") || "";
      }).filter(r => r.length > 0);

      if (reviews.length === 0) {
        throw new Error("No valid reviews found in CSV");
      }

      // Try batch endpoint
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
          
          // Aggregate results into summary
          const summary: CsvSummaryData = {
            veryPositive: 0,
            positive: 0,
            neutral: 0,
            negative: 0,
            veryNegative: 0,
            total: data.results.length,
          };

          data.results.forEach((r) => {
            const sentiment = r.sentiment.toLowerCase();
            if (sentiment === "very_positive" || sentiment === "verypositive") {
              summary.veryPositive++;
            } else if (sentiment === "positive") {
              summary.positive++;
            } else if (sentiment === "neutral") {
              summary.neutral++;
            } else if (sentiment === "negative") {
              summary.negative++;
            } else if (sentiment === "very_negative" || sentiment === "verynegative") {
              summary.veryNegative++;
            }
          });

          setCsvSummary(summary);
          toast({
            title: "Batch Analysis Complete",
            description: `Analyzed ${summary.total} reviews successfully`,
          });
          return;
        }
      } catch {
        // Fall through to demo mode
      }

      // Demo mode: Generate mock summary
      const total = reviews.length;
      const summary: CsvSummaryData = {
        veryPositive: Math.floor(total * 0.35),
        positive: Math.floor(total * 0.25),
        neutral: Math.floor(total * 0.15),
        negative: Math.floor(total * 0.12),
        veryNegative: Math.floor(total * 0.08),
        total,
      };
      
      // Adjust to match total
      const diff = total - (summary.veryPositive + summary.positive + summary.neutral + summary.negative + summary.veryNegative);
      summary.neutral += diff;

      setCsvSummary(summary);
      toast({
        title: "Demo Mode",
        description: `Backend unavailable. Showing simulated results for ${total} reviews.`,
        variant: "destructive",
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

  const clearCsvSummary = useCallback(() => {
    setCsvSummary(null);
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  return {
    isLoading,
    isFileLoading,
    result,
    csvSummary,
    history,
    error,
    analyze,
    analyzeFile,
    clearResult,
    clearCsvSummary,
    clearHistory,
  };
}
