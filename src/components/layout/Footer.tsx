import { Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full py-8 mt-20 bg-black text-white flex flex-col items-center">
      
      {/* Logo + Brand */}
      <div className="flex items-center gap-3 mb-2">
        <img 
          src="/Logo2.png"   // <-- Replace with /logo.svg if using SVG
          alt="Moodify Logo"
          className="w-10 h-10"
        />
        <span className="font-display text-2xl font-semibold">
          Moodify
        </span>
      </div>

      {/* Subtitle (optional, consistent with your style) */}
      <p className="text-sm opacity-70 mb-3">
        BERT-powered Sentiment Analysis WebApp
      </p>

      {/* GitHub Link (kept clean & minimal) */}
      <a
        href="https://github.com/priyanshuranjan02/Moodify-WebApp.git"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-sm opacity-80 hover:opacity-100 transition"
      >
        <Github className="w-4 h-4" />
        View on GitHub
      </a>

      {/* Trademark Text */}
      <p className="text-xs opacity-60 mt-4">
        © {new Date().getFullYear()} Moodify. All Rights Reserved.
      </p>
    </footer>
  );
}