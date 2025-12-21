import React, { useState } from "react";
import {
  Download,
  Image as ImageIcon,
  FileText,
  Code,
  Sparkles,
} from "lucide-react";
import { summarizeNotes } from "../lib/geminiService";

const Notes = () => {
  const [content, setContent] = useState(
    "# Lecture 4: React Hooks\n\n- useState\n- useEffect\n\nEquation: $E=mc^2$"
  );
  const [isSummarizing, setIsSummarizing] = useState(false);

  const handleSummarize = async () => {
    if (!content.trim()) return;
    setIsSummarizing(true);
    try {
      const summary = await summarizeNotes(content);
      setContent((prev) => prev + "\n\n### AI Summary\n" + summary);
    } catch (error) {
      console.error("Summarization failed", error);
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleExport = () => {
    // Mock PDF export
    alert("Exporting note as PDF...");
    const printContent = document.getElementById("note-editor")?.innerHTML;
    const originalContents = document.body.innerHTML;

    // In a real app, use jsPDF or html2pdf
    // document.body.innerHTML = printContent || "";
    // window.print();
    // document.body.innerHTML = originalContents;
  };

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex items-center justify-between mb-2">
        <div className="flex gap-2 items-center">
          <button
            onClick={handleSummarize}
            disabled={isSummarizing}
            className="flex items-center gap-2 text-xs font-bold text-nexus-purple hover:text-nexus-purple/80 transition-colors mr-2"
          >
            <Sparkles size={14} />
            {isSummarizing ? "SUMMARIZING..." : "AI SUMMARIZE"}
          </button>
          <div className="w-px h-4 bg-white/10 mx-1"></div>
          <button
            className="p-1.5 hover:bg-white/10 rounded text-gray-400 hover:text-nexus-teal transition-colors"
            title="Insert Image"
          >
            <ImageIcon size={16} />
          </button>
          <button
            className="p-1.5 hover:bg-white/10 rounded text-gray-400 hover:text-nexus-teal transition-colors"
            title="Code Block"
          >
            <Code size={16} />
          </button>
          <button
            className="p-1.5 hover:bg-white/10 rounded text-gray-400 hover:text-nexus-teal transition-colors"
            title="Latex Mode"
          >
            <span className="font-serif italic font-bold">∑</span>
          </button>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-1 text-[10px] bg-nexus-deep border border-nexus-teal/30 text-nexus-teal px-2 py-1 rounded hover:bg-nexus-teal hover:text-nexus-deep transition-all"
        >
          <Download size={12} /> PDF
        </button>
      </div>

      <textarea
        className="flex-1 bg-black/10 rounded-xl p-4 text-sm text-gray-300 font-mono focus:outline-none focus:ring-1 focus:ring-nexus-purple/50 resize-none leading-relaxed w-full h-full overflow-y-auto"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        spellCheck={false}
      />

      <div className="absolute bottom-2 right-4 text-[10px] text-gray-600">
        Markdown Supported
      </div>
    </div>
  );
};

export default Notes;
