import React, { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
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
  Pen,
  Columns,
  Eye,
  Quote,
  Copy,
  Check,
} from "lucide-react";
import { summarizeNotes } from "../lib/geminiService";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

// ================== MARKDOWN PREVIEW COMPONENTS ==================
const SyntaxHighlight = ({ code }) => {
  if (!code) return null;

  const tokenRegex =
    /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|(\/\/.*|\/\*[\s\S]*?\*\/)|(\b(?:const|let|var|function|return|if|else|for|while|import|export|from|class|extends|try|catch|async|await|new|this|super|default|case|switch|break|continue|true|false|null|undefined)\b)|(\b\d+\b)|(\b[A-Z][a-zA-Z0-9_]*\b)|([^"'/a-zA-Z0-9_]+|[a-zA-Z0-9_]+)/g;

  const tokens = [];
  let match;
  let lastIndex = 0;

  while ((match = tokenRegex.exec(code)) !== null) {
    const [fullMatch, string, comment, keyword, number, type, other] = match;
    const key = lastIndex++;

    if (string) {
      tokens.push(
        <span key={key} className="text-emerald-400">
          {string}
        </span>
      );
    } else if (comment) {
      tokens.push(
        <span key={key} className="text-gray-500 italic">
          {comment}
        </span>
      );
    } else if (keyword) {
      tokens.push(
        <span key={key} className="text-pink-400">
          {keyword}
        </span>
      );
    } else if (number) {
      tokens.push(
        <span key={key} className="text-amber-400">
          {number}
        </span>
      );
    } else if (type) {
      tokens.push(
        <span key={key} className="text-yellow-200">
          {type}
        </span>
      );
    } else {
      tokens.push(
        <span key={key} className="text-gray-300">
          {fullMatch}
        </span>
      );
    }
  }

  return <>{tokens}</>;
};

const preprocessMarkdown = (text) => {
  if (!text) return "";
  let processed = text;
  processed = processed.replace(/^ {2,3}([-*+]|\d+\.) /gm, "    $1 ");
  processed = processed.replace(/(^>.*)(\\n\\s*\\n)(>)/gm, "$1\\n$3");
  return processed;
};

const CodeBlock = ({ inline, className, children, ...props }) => {
  const [isCopied, setIsCopied] = useState(false);

  if (inline) {
    return (
      <code
        className="bg-black/30 px-1.5 py-0.5 rounded text-nexus-teal font-mono text-xs border border-white/5"
        {...props}
      >
        {children}
      </code>
    );
  }

  const codeContent = String(children).replace(/\n$/, "");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeContent);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="relative group my-4 rounded-xl overflow-hidden border border-white/10 shadow-inner bg-black/40">
      <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/5">
        <span className="text-xs text-text-secondary font-mono">
          {className ? className.replace("language-", "") : "code"}
        </span>
        <button
          onClick={handleCopy}
          className="p-1.5 rounded-lg hover:bg-white/10 text-text-secondary hover:text-white transition-colors"
          title="Copy code"
        >
          {isCopied ? (
            <Check size={14} className="text-emerald-400" />
          ) : (
            <Copy size={14} />
          )}
        </button>
      </div>
      <div className="p-4 overflow-x-auto">
        <pre
          className="font-mono text-xs text-gray-300 leading-relaxed"
          {...props}
        >
          <SyntaxHighlight code={codeContent} />
        </pre>
      </div>
    </div>
  );
};

// Markdown Preview Component
const MarkdownPreview = ({ content }) => {
  return (
    <div className="markdown-content prose prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => (
            <h1
              className="text-2xl font-bold text-white mt-6 mb-3 pb-2 border-b border-white/10"
              {...props}
            />
          ),
          h2: ({ node, ...props }) => (
            <h2
              className="text-xl font-bold text-nexus-teal mt-5 mb-2"
              {...props}
            />
          ),
          h3: ({ node, ...props }) => (
            <h3
              className="text-lg font-bold text-text-primary mt-4 mb-2"
              {...props}
            />
          ),
          h4: ({ node, ...props }) => (
            <h4
              className="text-base font-bold text-text-primary mt-3 mb-1"
              {...props}
            />
          ),
          p: ({ node, ...props }) => (
            <p className="mb-3 leading-7 last:mb-0 text-text-primary" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul
              className="list-disc list-outside mb-4 space-y-2 pl-5 marker:text-nexus-purple [&_ul]:list-[circle] [&_ul_ul]:list-[square]"
              {...props}
            />
          ),
          ol: ({ node, ...props }) => (
            <ol
              className="list-decimal list-outside mb-4 space-y-2 pl-5 marker:text-nexus-teal [&_ol]:list-[lower-alpha] [&_ol_ol]:list-[lower-roman]"
              {...props}
            />
          ),
          li: ({ node, ...props }) => (
            <li
              className="text-text-primary pl-1 leading-relaxed"
              {...props}
            />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-nexus-purple bg-white/5 p-4 my-4 rounded-r-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 opacity-10">
                <Quote size={40} className="fill-nexus-purple" />
              </div>
              <div className="relative z-10 flex gap-3">
                <Quote
                  size={20}
                  className="text-nexus-purple shrink-0 mt-1 fill-nexus-purple"
                />
                <div
                  className="italic text-text-secondary text-sm leading-relaxed"
                  {...props}
                />
              </div>
            </blockquote>
          ),
          hr: () => (
            <div className="my-6 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent border-none" />
          ),
          strong: ({ node, ...props }) => (
            <strong className="font-bold text-nexus-teal" {...props} />
          ),
          em: ({ node, ...props }) => (
            <em className="italic text-text-secondary" {...props} />
          ),
          a: ({ node, ...props }) => (
            <a
              className="text-nexus-teal underline hover:text-text-primary transition-colors"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            />
          ),
          code: ({ node, inline, className, children, ...props }) => (
            <CodeBlock inline={inline} className={className} {...props}>
              {children}
            </CodeBlock>
          ),
        }}
      >
        {preprocessMarkdown(content)}
      </ReactMarkdown>
    </div>
  );
};

// ================== MAIN NOTES COMPONENT ==================
const Notes = ({ searchQuery = "", content, setContent }) => {
  const contentRef = useRef(content);
  const [lastSaved, setLastSaved] = useState(null);
  
  // Mode state: "docs" (Quill WYSIWYG) or "markdown" (split-pane)
  const [editorMode, setEditorMode] = useState("docs");
  
  // Markdown view mode: "edit", "split", "preview"
  const [viewMode, setViewMode] = useState("split");
  
  // Separate content for markdown mode
  const [markdownContent, setMarkdownContent] = useState(
    "# Welcome to Neural Notes\n\n* Type standard **Markdown** on the left.\n* See the *live preview* on the right.\n\n## Code Example\n```javascript\nconsole.log(\"Hello Nexus\");\n```"
  );

  // Update ref whenever content changes
  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  // Auto-save logic
  useEffect(() => {
    const saveContent = () => {
      localStorage.setItem("nexus_notes_content", contentRef.current);
      localStorage.setItem("nexus_notes_markdown", markdownContent);
      setLastSaved(new Date());
    };

    const interval = setInterval(saveContent, 30000);

    const handleBeforeUnload = () => {
      saveContent();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      saveContent();
    };
  }, [markdownContent]);

  // Load markdown content from localStorage on mount
  useEffect(() => {
    const savedMarkdown = localStorage.getItem("nexus_notes_markdown");
    if (savedMarkdown) {
      setMarkdownContent(savedMarkdown);
    }
  }, []);

  const hasMatch =
    searchQuery && content.toLowerCase().includes(searchQuery.toLowerCase());
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const fileInputRef = useRef(null);

  const templates = {
    meeting:
      "<h1>Meeting Notes</h1><p><strong>Date:</strong> </p><p><strong>Attendees:</strong> </p><h2>Agenda</h2><ol><li></li><li></li></ol><h2>Action Items</h2><ul><li></li></ul>",
    journal:
      "<h1>Daily Journal</h1><p><strong>Date:</strong> </p><h2>Highlights</h2><ul><li></li></ul><h2>Challenges</h2><ul><li></li></ul><h2>Tomorrow's Goals</h2><ul><li></li></ul>",
    code: "<h1>Code Documentation</h1><h2>Overview</h2><h2>Functions</h2><pre><code></code></pre><h2>Dependencies</h2><ul><li></li></ul>",
  };

  const markdownTemplates = {
    meeting: `# Meeting Notes

**Date:** 
**Attendees:** 

## Agenda
1. 
2. 

## Action Items
- `,
    journal: `# Daily Journal

**Date:** 

## Highlights
- 

## Challenges
- 

## Tomorrow's Goals
- `,
    code: `# Code Documentation

## Overview

## Functions
\`\`\`javascript

\`\`\`

## Dependencies
- `,
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      
      if (editorMode === "markdown") {
        // Append to markdown content
        setMarkdownContent(
          (prev) => prev + "\n\n---\n**Imported File:** " + file.name + "\n\n" + text
        );
      } else {
        // Append to Quill content
        setContent(
          (prev) => prev + "\n\n---\n**Imported File:** " + file.name + "\n\n" + text
        );
      }
    };
    reader.readAsText(file);
  };

  const applyTemplate = (type) => {
    if (window.confirm("This will replace current content. Continue?")) {
      if (editorMode === "markdown") {
        setMarkdownContent(markdownTemplates[type]);
      } else {
        setContent(templates[type]);
      }
      setShowTemplates(false);
    }
  };

  const handleSummarize = async () => {
    let plainText;
    
    if (editorMode === "markdown") {
      plainText = markdownContent;
    } else {
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = content;
      plainText = tempDiv.textContent || tempDiv.innerText || "";
    }

    if (!plainText.trim()) return;
    setIsSummarizing(true);
    try {
      const summary = await summarizeNotes(plainText);
      
      if (editorMode === "markdown") {
        setMarkdownContent((prev) => prev + "\n\n---\n\n### AI Summary\n\n" + summary);
      } else {
        setContent((prev) => prev + "<h3>AI Summary</h3><p>" + summary + "</p>");
      }
    } catch (error) {
      console.error("Summarization failed", error);
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleArchive = () => {
    const exportContent = editorMode === "markdown" ? markdownContent : content;
    const blob = new Blob([exportContent], { type: "text/markdown" });
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
    const exportContent = editorMode === "markdown" ? markdownContent : content;
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
        <body>${exportContent}</body>
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
          {/* Editor Mode Toggle */}
          <div className="flex items-center gap-1 bg-black/20 rounded-lg p-0.5 border border-white/5">
            <button
              onClick={() => setEditorMode("docs")}
              className={`px-2 py-1 text-[10px] font-bold rounded transition-all ${
                editorMode === "docs"
                  ? "bg-nexus-purple text-white"
                  : "text-text-secondary hover:text-text-primary"
              }`}
              title="Docs Mode (WYSIWYG)"
            >
              DOCS
            </button>
            <button
              onClick={() => setEditorMode("markdown")}
              className={`px-2 py-1 text-[10px] font-bold rounded transition-all ${
                editorMode === "markdown"
                  ? "bg-nexus-teal text-nexus-deep"
                  : "text-text-secondary hover:text-text-primary"
              }`}
              title="Markdown Mode"
            >
              MD
            </button>
          </div>
          
          {/* Markdown View Mode Toggle - Only show in markdown mode */}
          {editorMode === "markdown" && (
            <div className="flex items-center gap-0.5 bg-black/30 rounded-lg p-0.5 border border-white/10">
              <button
                onClick={() => setViewMode("edit")}
                className={`p-1.5 rounded transition-all ${
                  viewMode === "edit"
                    ? "bg-nexus-purple/30 text-nexus-purple"
                    : "text-text-secondary hover:text-text-primary"
                }`}
                title="Edit Only"
              >
                <Pen size={12} />
              </button>
              <button
                onClick={() => setViewMode("split")}
                className={`p-1.5 rounded transition-all ${
                  viewMode === "split"
                    ? "bg-nexus-purple/30 text-nexus-purple"
                    : "text-text-secondary hover:text-text-primary"
                }`}
                title="Split View"
              >
                <Columns size={12} />
              </button>
              <button
                onClick={() => setViewMode("preview")}
                className={`p-1.5 rounded transition-all ${
                  viewMode === "preview"
                    ? "bg-nexus-purple/30 text-nexus-purple"
                    : "text-text-secondary hover:text-text-primary"
                }`}
                title="Preview Only"
              >
                <Eye size={12} />
              </button>
            </div>
          )}
          
          <div className="w-px h-4 bg-card-border mx-1"></div>
          
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

      {/* Editor Area */}
      {editorMode === "docs" ? (
        // Original Quill Editor
        <div className="flex-1 bg-black/10 rounded-xl overflow-hidden flex flex-col [&_*]:outline-none [&_*]:ring-0">
          <ReactQuill
            theme="snow"
            value={content}
            onChange={setContent}
            modules={{
              toolbar: [
                [{ header: [1, 2, false] }],
                ["bold", "italic", "code-block"],
                [{ list: "ordered" }, { list: "bullet" }],
              ],
            }}
            className="h-full flex flex-col border-none outline-none"
          />
        </div>
      ) : (
        // Markdown Split-Pane Editor
        <div className="flex-1 bg-black/10 rounded-xl overflow-hidden flex">
          {/* Left Pane: Markdown Editor */}
          {(viewMode === "edit" || viewMode === "split") && (
            <div
              className={`${
                viewMode === "split" ? "w-1/2" : "w-full"
              } flex flex-col h-full ${
                viewMode === "split" ? "border-r border-white/10" : ""
              }`}
            >
              <div className="px-3 py-2 bg-black/20 border-b border-white/5 flex items-center gap-2">
                <Pen size={12} className="text-text-secondary" />
                <span className="text-[10px] font-mono text-text-secondary uppercase tracking-wider">
                  Editor
                </span>
              </div>
              <textarea
                value={markdownContent}
                onChange={(e) => setMarkdownContent(e.target.value)}
                placeholder="# Start typing your Markdown here..."
                className="flex-1 w-full p-4 bg-transparent text-text-primary font-mono text-sm resize-none focus:outline-none leading-relaxed placeholder:text-text-secondary/50"
                spellCheck={false}
              />
            </div>
          )}

          {/* Right Pane: Markdown Preview */}
          {(viewMode === "preview" || viewMode === "split") && (
            <div
              className={`${
                viewMode === "split" ? "w-1/2" : "w-full"
              } flex flex-col h-full overflow-hidden`}
            >
              <div className="px-3 py-2 bg-black/20 border-b border-white/5 flex items-center gap-2">
                <Eye size={12} className="text-text-secondary" />
                <span className="text-[10px] font-mono text-text-secondary uppercase tracking-wider">
                  Preview
                </span>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <MarkdownPreview content={markdownContent} />
              </div>
            </div>
          )}
        </div>
      )}

      <div className="absolute bottom-2 right-4 text-[10px] text-gray-600">
        {editorMode === "markdown" ? "Markdown Mode" : "Docs Mode"}
      </div>
    </div>
  );
};

export default Notes;
