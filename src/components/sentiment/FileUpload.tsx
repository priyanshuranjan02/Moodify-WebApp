import { useState, useRef } from "react";
import { Upload, FileSpreadsheet, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFileAnalyze: (file: File) => Promise<void>;
  isLoading: boolean;
}

export function FileUpload({ onFileAnalyze, isLoading }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "text/csv" || file.name.endsWith(".csv")) {
        setSelectedFile(file);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (selectedFile && !isLoading) {
      await onFileAnalyze(selectedFile);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="glass-card p-6 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <FileSpreadsheet className="w-5 h-5 text-primary" />
        <h2 className="font-display font-semibold text-lg">Batch Analysis</h2>
      </div>

      <p className="text-sm text-muted-foreground">
        Upload a CSV file with a "review" or "text" column to analyze multiple reviews at once.
      </p>

      <div
        className={cn(
          "relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer",
          dragActive
            ? "border-primary bg-primary/5"
            : "border-border/50 hover:border-primary/50 hover:bg-accent/30",
          selectedFile && "border-positive bg-positive-light"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          onChange={handleChange}
          className="hidden"
        />

        {selectedFile ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-positive/20 flex items-center justify-center">
              <FileSpreadsheet className="w-6 h-6 text-positive" />
            </div>
            <div>
              <p className="font-medium text-foreground">{selectedFile.name}</p>
              <p className="text-sm text-muted-foreground">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                clearFile();
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4 mr-1" />
              Remove
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
              <Upload className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">
                Drop your CSV file here
              </p>
              <p className="text-sm text-muted-foreground">
                or click to browse
              </p>
            </div>
          </div>
        )}
      </div>

      {selectedFile && (
        <Button
          variant="hero"
          size="lg"
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <FileSpreadsheet className="w-5 h-5" />
              Analyze {selectedFile.name}
            </>
          )}
        </Button>
      )}
    </div>
  );
}
