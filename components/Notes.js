import React, { useState, useRef, useEffect } from "react";
import {
  Download,
  Image as ImageIcon,
  FileText,
  Code,
  Sparkles,
  Upload,
  LayoutTemplate,
  ChevronDown,
  Archive,
  Save,
} from "lucide-react";
import { summarizeNotes } from "../lib/geminiService";

const Notes = ({ searchQuery = "" }) => {
  const [content, setContent] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("nexus_notes_content");
      if (saved) return saved;
    }
    return "# Lecture 4: React Hooks\n\n- useState\n- useEffect\n\nEquation: $E=mc^2$";
  });

  const contentRef = useRef(content);
  const [lastSaved, setLastSaved] = useState(null);

  // Update ref whenever content changes
  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  // Auto-save logic
  useEffect(() => {
    const saveContent = () => {
      localStorage.setItem("nexus_notes_content", contentRef.current);
      setLastSaved(new Date());
    };

    // Save every 30 seconds
    const interval = setInterval(saveContent, 30000);

    // Save on unmount or page reload
    const handleBeforeUnload = () => {
      saveContent();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      saveContent(); // Save on component unmount
    };
  }, []);

  const hasMatch =
    searchQuery && content.toLowerCase().includes(searchQuery.toLowerCase());
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const fileInputRef = useRef(null);

  const templates = {
    meeting:
      "# Meeting Notes\n\n**Date:** \n**Attendees:** \n\n## Agenda\n1. \n2. \n\n## Action Items\n- [ ] ",
    journal:
      "# Daily Journal\n\n**Date:** \n\n## Highlights\n- \n\n## Challenges\n- \n\n## Tomorrow's Goals\n- ",
    code: "# Code Documentation\n\n## Overview\n\n## Functions\n\n```javascript\n\n```\n\n## Dependencies\n- ",
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      setContent(
        (prev) =>
          prev + "\n\n---\n**Imported File:** " + file.name + "\n\n" + text
      );
    };
    reader.readAsText(file);
  };

  const applyTemplate = (type) => {
    if (window.confirm("This will replace current content. Continue?")) {
      setContent(templates[type]);
      setShowTemplates(false);
    }
  };

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

  const handleArchive = () => {
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `note-${new Date().toISOString().split("T")[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExport = () => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Note Export</title>
          <style>
            body { 
              font-family: 'Courier New', Courier, monospace; 
              padding: 40px; 
              white-space: pre-wrap; 
              color: #000;
              line-height: 1.5;
            }
            h1 { border-bottom: 1px solid #ccc; padding-bottom: 10px; }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex items-center justify-between mb-2">
        <div className="flex gap-2 items-center">
          {hasMatch && (
            <span className="text-[10px] font-bold text-nexus-teal bg-nexus-teal/10 px-2 py-0.5 rounded border border-nexus-teal/30 animate-pulse mr-2">
              MATCH
            </span>
          )}
          <button
            onClick={handleSummarize}
            disabled={isSummarizing}
            className="flex items-center gap-2 text-xs font-bold text-nexus-purple hover:text-nexus-purple/80 transition-colors mr-2"
          >
            <Sparkles size={14} />
            {isSummarizing ? "SUMMARIZING..." : "AI SUMMARIZE"}
          </button>
          <div className="w-px h-4 bg-card-border mx-1"></div>
          <button
            className="p-1.5 hover:bg-input-bg rounded text-text-secondary hover:text-nexus-teal transition-colors"
            title="Insert Image"
          >
            <ImageIcon size={16} />
          </button>
          <button
            className="p-1.5 hover:bg-input-bg rounded text-text-secondary hover:text-nexus-teal transition-colors"
            title="Code Block"
          >
            <Code size={16} />
          </button>
          <button
            className="p-1.5 hover:bg-input-bg rounded text-text-secondary hover:text-nexus-teal transition-colors"
            title="Latex Mode"
          >
            <span className="font-serif italic font-bold">∑</span>
          </button>

          <div className="w-px h-4 bg-card-border mx-1"></div>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 hover:bg-input-bg rounded text-text-secondary hover:text-nexus-teal transition-colors"
            title="Upload File"
          >
            <Upload size={16} />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept=".txt,.md,.js,.json,.csv"
          />

          <div className="relative">
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="p-1.5 hover:bg-input-bg rounded text-text-secondary hover:text-nexus-teal transition-colors flex items-center gap-1"
              title="Templates"
            >
              <LayoutTemplate size={16} />
              <ChevronDown size={10} />
            </button>

            {showTemplates && (
              <div className="absolute top-full left-0 mt-1 w-40 bg-card-bg border border-card-border rounded-lg shadow-xl z-50 overflow-hidden">
                <button
                  onClick={() => applyTemplate("meeting")}
                  className="w-full text-left px-3 py-2 text-xs text-text-secondary hover:bg-input-bg hover:text-text-primary transition-colors"
                >
                  Meeting Notes
                </button>
                <button
                  onClick={() => applyTemplate("journal")}
                  className="w-full text-left px-3 py-2 text-xs text-text-secondary hover:bg-input-bg hover:text-text-primary transition-colors"
                >
                  Daily Journal
                </button>
                <button
                  onClick={() => applyTemplate("code")}
                  className="w-full text-left px-3 py-2 text-xs text-text-secondary hover:bg-input-bg hover:text-text-primary transition-colors"
                >
                  Code Docs
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2 items-center">
          {lastSaved && (
            <div className="flex items-center gap-1 text-[10px] text-gray-500 mr-2">
              <Save size={12} />
              <span>
                {lastSaved.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          )}
          <button
            onClick={handleArchive}
            className="flex items-center gap-1 text-[10px] bg-nexus-deep border border-nexus-teal/30 text-nexus-teal px-2 py-1 rounded hover:bg-nexus-teal hover:text-nexus-deep transition-all"
            title="Archive as Markdown"
          >
            <Archive size={12} /> MD
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-1 text-[10px] bg-nexus-deep border border-nexus-teal/30 text-nexus-teal px-2 py-1 rounded hover:bg-nexus-teal hover:text-nexus-deep transition-all"
          >
            <Download size={12} /> PDF
          </button>
        </div>
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
