import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
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
  X,
  Link,
  FileImage,
  CloudUpload,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { summarizeNotes } from "../lib/geminiService";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "react-quill-new/dist/quill.snow.css";
import "katex/dist/katex.min.css";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

// ================== MODAL COMPONENTS ==================

// Image Insert Modal
const ImageModal = ({ isOpen, onClose, onInsert, mode }) => {
  const [imageUrl, setImageUrl] = useState("");
  const [altText, setAltText] = useState("");
  const [uploadedImage, setUploadedImage] = useState(null);
  const [activeTab, setActiveTab] = useState("url");
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedImage(event.target.result);
      setActiveTab("upload");
    };
    reader.readAsDataURL(file);
  };

  const handleInsert = () => {
    const src = activeTab === "url" ? imageUrl : uploadedImage;
    if (!src) return;

    if (mode === "markdown") {
      onInsert(`![${altText || "image"}](${src})`);
    } else {
      onInsert(`<img src="${src}" alt="${altText || "image"}" style="max-width: 100%; border-radius: 8px; margin: 8px 0;" />`);
    }
    handleClose();
  };

  const handleClose = () => {
    setImageUrl("");
    setAltText("");
    setUploadedImage(null);
    setActiveTab("url");
    onClose();
  };

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!isOpen || !mounted) return null;
  const modalRoot = document.getElementById("modal-root") || document.body;

  return createPortal(
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-center justify-center p-8">
      <div className="bg-gradient-to-br from-[#1a1a2e] to-[#0f0f1a] border border-white/20 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-nexus-purple/20 rounded-lg">
              <ImageIcon size={18} className="text-nexus-purple" />
            </div>
            <h3 className="text-lg font-bold text-white">Insert Image</h3>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={18} className="text-text-secondary" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10 bg-black/40">
          <button
            onClick={() => setActiveTab("url")}
            className={`flex-1 py-3 text-sm font-medium transition-all ${
              activeTab === "url"
                ? "text-nexus-teal border-b-2 border-nexus-teal bg-nexus-teal/20"
                : "text-text-secondary hover:text-text-primary hover:bg-white/5"
            }`}
          >
            <Link size={14} className="inline mr-2" />
            URL
          </button>
          <button
            onClick={() => setActiveTab("upload")}
            className={`flex-1 py-3 text-sm font-medium transition-all ${
              activeTab === "upload"
                ? "text-nexus-teal border-b-2 border-nexus-teal bg-nexus-teal/20"
                : "text-text-secondary hover:text-text-primary hover:bg-white/5"
            }`}
          >
            <FileImage size={14} className="inline mr-2" />
            Upload
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {activeTab === "url" ? (
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-2">
                Image URL
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.png"
                className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-nexus-teal/50 transition-all placeholder:text-text-secondary/50"
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-2">
                Upload Image
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-32 border-2 border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-nexus-teal/50 hover:bg-white/5 transition-all"
              >
                {uploadedImage ? (
                  <img
                    src={uploadedImage}
                    alt="Preview"
                    className="max-h-28 max-w-full object-contain rounded-lg"
                  />
                ) : (
                  <>
                    <Upload size={24} className="text-text-secondary mb-2" />
                    <span className="text-xs text-text-secondary">
                      Click to upload
                    </span>
                  </>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-2">
              Alt Text (optional)
            </label>
            <input
              type="text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Describe the image..."
              className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-nexus-teal/50 transition-all placeholder:text-text-secondary/50"
            />
          </div>

          {/* Preview */}
          {(imageUrl || uploadedImage) && (
            <div className="mt-4">
              <label className="block text-xs font-medium text-text-secondary mb-2">
                Preview
              </label>
              <div className="bg-black/20 rounded-xl p-3 border border-white/5">
                <img
                  src={activeTab === "url" ? imageUrl : uploadedImage}
                  alt={altText || "Preview"}
                  className="max-h-40 max-w-full object-contain rounded-lg mx-auto"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-5 py-4 border-t border-white/10 bg-black/20">
          <button
            onClick={handleClose}
            className="flex-1 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary border border-white/10 rounded-xl hover:bg-white/5 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleInsert}
            disabled={!imageUrl && !uploadedImage}
            className="flex-1 py-2.5 text-sm font-medium bg-gradient-to-r from-nexus-purple to-nexus-teal text-white rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Insert Image
          </button>
        </div>
      </div>
    </div>,
    modalRoot
  );
};

// Code Block Modal
const CodeModal = ({ isOpen, onClose, onInsert, mode }) => {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  const languages = [
    { value: "javascript", label: "JavaScript" },
    { value: "typescript", label: "TypeScript" },
    { value: "python", label: "Python" },
    { value: "java", label: "Java" },
    { value: "cpp", label: "C++" },
    { value: "c", label: "C" },
    { value: "csharp", label: "C#" },
    { value: "go", label: "Go" },
    { value: "rust", label: "Rust" },
    { value: "ruby", label: "Ruby" },
    { value: "php", label: "PHP" },
    { value: "swift", label: "Swift" },
    { value: "kotlin", label: "Kotlin" },
    { value: "html", label: "HTML" },
    { value: "css", label: "CSS" },
    { value: "sql", label: "SQL" },
    { value: "bash", label: "Bash" },
    { value: "json", label: "JSON" },
    { value: "yaml", label: "YAML" },
    { value: "markdown", label: "Markdown" },
  ];

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  const handleInsert = () => {
    if (!code.trim()) return;

    if (mode === "markdown") {
      onInsert(`\n\`\`\`${language}\n${code}\n\`\`\`\n`);
    } else {
      onInsert(`<pre><code class="language-${language}">${code}</code></pre>`);
    }
    handleClose();
  };

  const handleClose = () => {
    setCode("");
    setLanguage("javascript");
    onClose();
  };

  if (!isOpen || !mounted) return null;
  const modalRoot = document.getElementById("modal-root") || document.body;

  return createPortal(
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-center justify-center p-8">
      <div className="bg-gradient-to-br from-[#1a1a2e] to-[#0f0f1a] border border-white/20 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-nexus-teal/20 rounded-lg">
              <Code size={18} className="text-nexus-teal" />
            </div>
            <h3 className="text-lg font-bold text-white">Insert Code Block</h3>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={18} className="text-text-secondary" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-2">
              Language
            </label>
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-text-primary text-sm flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-nexus-teal/50 transition-all"
              >
                <span>
                  {languages.find((l) => l.value === language)?.label || "Select Language"}
                </span>
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-200 ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              
              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a2e] border border-white/20 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto">
                  {languages.map((lang) => (
                    <button
                      key={lang.value}
                      onClick={() => {
                        setLanguage(lang.value);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                        language === lang.value
                          ? "bg-nexus-teal/20 text-nexus-teal font-medium"
                          : "text-text-secondary hover:bg-white/5 hover:text-text-primary"
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-2">
              Code
            </label>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={`// Enter your ${language} code here...`}
              rows={6}
              className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-text-primary text-sm font-mono focus:outline-none focus:ring-2 focus:ring-nexus-teal/50 transition-all resize-none placeholder:text-text-secondary/50 leading-relaxed"
              spellCheck={false}
            />
          </div>

          {/* Preview */}
          {code && (
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-2">
                Preview
              </label>
              <div className="bg-black/40 rounded-xl border border-white/10 overflow-hidden">
                <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/5">
                  <span className="text-xs text-text-secondary font-mono">
                    {language}
                  </span>
                </div>
                <div className="p-4 overflow-x-auto">
                  <pre className="font-mono text-xs text-gray-300 leading-relaxed whitespace-pre-wrap">
                    <SyntaxHighlight code={code} />
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-5 py-4 border-t border-white/10 bg-black/20">
          <button
            onClick={handleClose}
            className="flex-1 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary border border-white/10 rounded-xl hover:bg-white/5 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleInsert}
            disabled={!code.trim()}
            className="flex-1 py-2.5 text-sm font-medium bg-gradient-to-r from-nexus-teal to-emerald-500 text-nexus-deep font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Insert Code
          </button>
        </div>
      </div>
    </div>,
    modalRoot
  );
};

// Math/LaTeX Modal with KaTeX
const MathModal = ({ isOpen, onClose, onInsert, mode }) => {
  const [latex, setLatex] = useState("");
  const [isBlock, setIsBlock] = useState(true);
  const [renderedMath, setRenderedMath] = useState("");
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const exampleEquations = [
    { label: "Quadratic Formula", latex: "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}" },
    { label: "Euler's Identity", latex: "e^{i\\pi} + 1 = 0" },
    { label: "Pythagorean Theorem", latex: "a^2 + b^2 = c^2" },
    { label: "Sum Notation", latex: "\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}" },
    { label: "Integral", latex: "\\int_{0}^{\\infty} e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}" },
    { label: "Matrix", latex: "\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}" },
  ];

  useEffect(() => {
    if (!latex.trim()) {
      setRenderedMath("");
      setError("");
      return;
    }

    const renderMath = async () => {
      try {
        const katex = (await import("katex")).default;
        const html = katex.renderToString(latex, {
          throwOnError: true,
          displayMode: isBlock,
        });
        setRenderedMath(html);
        setError("");
      } catch (err) {
        setError(err.message);
        setRenderedMath("");
      }
    };

    renderMath();
  }, [latex, isBlock]);

  const handleInsert = () => {
    if (!latex.trim() || error) return;

    if (mode === "markdown") {
      if (isBlock) {
        onInsert(`\n$$\n${latex}\n$$\n`);
      } else {
        onInsert(`$${latex}$`);
      }
    } else {
      // For HTML mode, insert rendered KaTeX
      onInsert(`<span class="katex-equation" data-latex="${latex}">${renderedMath}</span>`);
    }
    handleClose();
  };

  const handleClose = () => {
    setLatex("");
    setIsBlock(true);
    setRenderedMath("");
    setError("");
    onClose();
  };

  if (!isOpen || !mounted) return null;
  const modalRoot = document.getElementById("modal-root") || document.body;

  return createPortal(
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-center justify-center p-8">
      <div className="bg-gradient-to-br from-[#1a1a2e] to-[#0f0f1a] border border-white/20 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <span className="text-amber-400 font-serif text-lg font-bold">∑</span>
            </div>
            <h3 className="text-lg font-bold text-white">Insert Math Equation</h3>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={18} className="text-text-secondary" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Display Mode Toggle */}
          <div className="flex items-center gap-4">
            <label className="text-xs font-medium text-text-secondary">Display Mode:</label>
            <div className="flex items-center gap-1 bg-black/20 rounded-lg p-1 border border-white/5">
              <button
                onClick={() => setIsBlock(true)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  isBlock
                    ? "bg-amber-500/30 text-amber-400"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                Block
              </button>
              <button
                onClick={() => setIsBlock(false)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  !isBlock
                    ? "bg-amber-500/30 text-amber-400"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                Inline
              </button>
            </div>
          </div>

          {/* LaTeX Input */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-2">
              LaTeX Expression
            </label>
            <textarea
              value={latex}
              onChange={(e) => setLatex(e.target.value)}
              placeholder="Enter LaTeX: e.g., \frac{a}{b}, \sqrt{x}, \sum_{i=1}^{n} i"
              rows={2}
              className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-text-primary text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all resize-none placeholder:text-text-secondary/50 leading-relaxed"
              spellCheck={false}
            />
          </div>

          {/* Example Equations */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-2">
              Quick Examples
            </label>
            <div className="flex flex-wrap gap-2">
              {exampleEquations.map((eq) => (
                <button
                  key={eq.label}
                  onClick={() => setLatex(eq.latex)}
                  className="px-3 py-1.5 text-xs font-medium bg-black/30 border border-white/10 rounded-lg text-text-secondary hover:text-amber-400 hover:border-amber-500/30 transition-all"
                >
                  {eq.label}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-2">
              Live Preview
            </label>
            <div className="bg-black/30 rounded-xl border border-white/10 p-4 min-h-[60px] flex items-center justify-center">
              {error ? (
                <span className="text-red-400 text-sm font-mono">{error}</span>
              ) : renderedMath ? (
                <div
                  className="text-white text-lg"
                  dangerouslySetInnerHTML={{ __html: renderedMath }}
                />
              ) : (
                <span className="text-text-secondary/50 text-sm italic">
                  Preview will appear here...
                </span>
              )}
            </div>
          </div>

          {/* LaTeX Help */}
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
            <h4 className="text-xs font-bold text-amber-400 mb-2">LaTeX Quick Reference</h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-text-secondary font-mono">
              <div><code>\frac{"{a}"}{"{b}"}</code> → Fraction</div>
              <div><code>\sqrt{"{x}"}</code> → Square root</div>
              <div><code>x^{"{n}"}</code> → Superscript</div>
              <div><code>x_{"{n}"}</code> → Subscript</div>
              <div><code>\sum_{"{i=1}"}^{"{n}"}</code> → Sum</div>
              <div><code>\int_{"{a}"}^{"{b}"}</code> → Integral</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-5 py-4 border-t border-white/10 bg-black/20">
          <button
            onClick={handleClose}
            className="flex-1 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary border border-white/10 rounded-xl hover:bg-white/5 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleInsert}
            disabled={!latex.trim() || !!error}
            className="flex-1 py-2.5 text-sm font-medium bg-gradient-to-r from-amber-500 to-orange-500 text-nexus-deep font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Insert Equation
          </button>
        </div>
      </div>
    </div>,
    modalRoot
  );
};

// ================== MARKDOWN PREVIEW COMPONENTS ==================
const SyntaxHighlight = ({ code }) => {
  if (!code) return null;

  const tokenRegex =
    /(\"(?:[^\"\\]|\\.)*\"|'(?:[^'\\]|\\.)*')|(\/\/.*|\/\*[\s\S]*?\*\/)|(\b(?:const|let|var|function|return|if|else|for|while|import|export|from|class|extends|try|catch|async|await|new|this|super|default|case|switch|break|continue|true|false|null|undefined)\b)|(\b\d+\b)|(\b[A-Z][a-zA-Z0-9_]*\b)|([^\"'/a-zA-Z0-9_]+|[a-zA-Z0-9_]+)/g;

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

// Markdown Preview Component with Math Support
const MarkdownPreview = ({ content }) => {
  return (
    <div className="markdown-content prose prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
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
          img: ({ node, ...props }) => (
            <img
              className="max-w-full rounded-xl border border-white/10 my-4"
              {...props}
            />
          ),
        }}
      >
        {preprocessMarkdown(content)}
      </ReactMarkdown>
    </div>
  );
};

// ================== MAIN NOTES COMPONENT ==================
const Notes = ({ searchQuery = "", content, setContent, markdownContent, setMarkdownContent, user }) => {
  const contentRef = useRef(content);
  const markdownRef = useRef(markdownContent);
  const [lastSaved, setLastSaved] = useState(null);
  
  // Mode state: "docs" (Quill WYSIWYG) or "markdown" (split-pane)
  const [editorMode, setEditorMode] = useState("docs");
  
  // Markdown view mode: "edit", "split", "preview"
  const [viewMode, setViewMode] = useState("split");
  
  // Update refs
  useEffect(() => {
    contentRef.current = content;
    markdownRef.current = markdownContent;
  }, [content, markdownContent]);

  // Auto-save logic (Debounced)
  useEffect(() => {
    if (!user) return;

    const saveToCloud = async () => {
        try {
            const { error } = await supabase.from("user_notes_state").upsert({
                user_id: user.id,
                content: contentRef.current,
                markdown_content: markdownRef.current,
                updated_at: new Date().toISOString()
            });
            if (!error) setLastSaved(new Date());
        } catch (err) {
            console.error("Auto-save failed:", err);
        }
    };

    const timeoutId = setTimeout(saveToCloud, 2000); // Save after 2s of inactivity

    return () => clearTimeout(timeoutId);
  }, [content, markdownContent, user]);

  const hasMatch =
    searchQuery && content.toLowerCase().includes(searchQuery.toLowerCase());
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const fileInputRef = useRef(null);
  const markdownTextareaRef = useRef(null);
  
  // Modal states
  const [showImageModal, setShowImageModal] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [showMathModal, setShowMathModal] = useState(false);

  // Insert content handler
  const handleInsertContent = (insertedContent) => {
    if (editorMode === "markdown") {
      // Insert at cursor position or append
      if (markdownTextareaRef.current) {
        const textarea = markdownTextareaRef.current;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newContent = 
          markdownContent.substring(0, start) + 
          insertedContent + 
          markdownContent.substring(end);
        setMarkdownContent(newContent);
        // Set cursor position after insert
        setTimeout(() => {
          textarea.focus();
          const newPos = start + insertedContent.length;
          textarea.setSelectionRange(newPos, newPos);
        }, 0);
      } else {
        setMarkdownContent((prev) => prev + insertedContent);
      }
    } else {
      // Append to Quill content
      setContent((prev) => prev + insertedContent);
    }
  };

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

  const handleSaveToVault = async () => {
    if (!user) {
        alert("Please login to save to Vault.");
        return;
    }
    
    const filename = prompt("Enter a filename for this note (e.g. MyMeeting.md):", `Note-${new Date().toISOString().split("T")[0]}.md`);
    if (!filename) return;

    try {
        const exportContent = editorMode === "markdown" ? markdownContent : content;
        // If docs mode, maybe convert HTML to something else or just save as .html? 
        // For now, let's treat docs as HTML and markdown as MD.
        const type = editorMode === "markdown" ? "markdown" : "html";
        const file = new File([exportContent], filename, { type: type === "markdown" ? "text/markdown" : "text/html" });
        
        const filePath = `${user.id}/${filename}`;
        
        // Upload
        const { error: uploadError } = await supabase.storage
            .from("vault")
            .upload(filePath, file, { upsert: true });

        if (uploadError) throw uploadError;
        
        // Get URL
        const { data: publicData } = supabase.storage.from("vault").getPublicUrl(filePath);

        // Add to Vault Items
        const { error: dbError } = await supabase.from("vault_items").insert({
            user_id: user.id,
            title: filename,
            url: publicData.publicUrl,
            category: "doc",
            type: "note",
            storage_path: filePath,
            size: file.size
        });

        if (dbError) throw dbError;
        
        alert("Saved to Vault!");
        
    } catch (err) {
        console.error("Error saving to vault:", err);
        alert("Failed to save to vault: " + err.message);
    }
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
            onClick={() => setShowImageModal(true)}
            className="p-1.5 hover:bg-input-bg rounded text-text-secondary hover:text-nexus-purple transition-colors"
            title="Insert Image"
          >
            <ImageIcon size={16} />
          </button>
          <button
            onClick={() => setShowCodeModal(true)}
            className="p-1.5 hover:bg-input-bg rounded text-text-secondary hover:text-nexus-teal transition-colors"
            title="Insert Code Block"
          >
            <Code size={16} />
          </button>
          <button
            onClick={() => setShowMathModal(true)}
            className="p-1.5 hover:bg-input-bg rounded text-text-secondary hover:text-amber-400 transition-colors"
            title="Insert Math Equation"
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
            onClick={handleSaveToVault}
            className="flex items-center gap-1 text-[10px] bg-nexus-deep border border-nexus-teal/30 text-nexus-teal px-2 py-1 rounded hover:bg-nexus-teal hover:text-nexus-deep transition-all"
            title="Save to Data Vault"
          >
            <CloudUpload size={12} /> Save to Vault
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
                ref={markdownTextareaRef}
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

      {/* Modals */}
      <ImageModal
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        onInsert={handleInsertContent}
        mode={editorMode}
      />
      <CodeModal
        isOpen={showCodeModal}
        onClose={() => setShowCodeModal(false)}
        onInsert={handleInsertContent}
        mode={editorMode}
      />
      <MathModal
        isOpen={showMathModal}
        onClose={() => setShowMathModal(false)}
        onInsert={handleInsertContent}
        mode={editorMode}
      />
    </div>
  );
};

export default Notes;
