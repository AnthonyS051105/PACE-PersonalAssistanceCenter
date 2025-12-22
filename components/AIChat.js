import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  User,
  Sparkles,
  Quote,
  Code,
  Terminal,
  Zap,
  Copy,
  Check,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Image from "next/image";
import { generateAIResponse } from "../lib/geminiService";

const SyntaxHighlight = ({ code }) => {
  if (!code) return null;

  // Tokenizer Regex
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

  // Fix indentation for nested lists (convert 2-3 spaces to 4 spaces)
  processed = processed.replace(/^ {2,3}([-*+]|\d+\.) /gm, "    $1 ");

  // Group consecutive blockquotes (remove empty lines between > lines to ensure single block)
  processed = processed.replace(/(^>.*)(\n\s*\n)(>)/gm, "$1\n$3");

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

const AIChat = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const suggestions = [
    { icon: <Code size={14} />, text: "Refactor this React component" },
    { icon: <Terminal size={14} />, text: "Explain this error message" },
    { icon: <Zap size={14} />, text: "Draft a daily schedule" },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  const handleSend = async (text = input) => {
    if (!text.trim() || loading) return;

    const userMsg = {
      id: Date.now().toString(),
      role: "user",
      text: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const history = messages.map((m) => ({ role: m.role, text: m.text }));
      const responseText = await generateAIResponse(text, history);

      const aiMsg = {
        id: (Date.now() + 1).toString(),
        role: "model",
        text: responseText,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 pb-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
            <div className="relative w-14 h-14">
              <Image
                src="/assets/ai-mascot.png"
                alt="A.C.E Mascot"
                fill
                className="object-contain drop-shadow-[0_0_15px_rgba(115,42,223,0.5)]"
              />
            </div>
            <div>
              <h3 className="text-xl font-bold text-text-primary mb-1">
                A.C.E Online
              </h3>
              <p className="text-xs text-text-secondary max-w-[200px] mx-auto">
                System ready. Awaiting the input for processing.
              </p>
            </div>
            <div className="flex flex-col gap-2 w-full max-w-xs">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(s.text)}
                  className="flex items-center gap-3 p-3 rounded-xl bg-input-bg hover:bg-card-bg border border-card-border hover:border-nexus-purple/30 transition-all text-xs text-text-secondary hover:text-text-primary text-left group"
                >
                  <div className="p-1.5 rounded-lg bg-nexus-deep text-nexus-purple group-hover:text-nexus-teal transition-colors">
                    {s.icon}
                  </div>
                  {s.text}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`
                max-w-[85%] p-3 rounded-2xl text-sm font-mono
                ${
                  msg.role === "user"
                    ? "bg-nexus-purple text-white rounded-br-none"
                    : "bg-input-bg border border-card-border text-text-primary rounded-bl-none"
                }
              `}
                >
                  <div className="flex items-center gap-2 mb-1 opacity-50 text-xs">
                    {msg.role === "model" ? (
                      <Bot size={12} />
                    ) : (
                      <User size={12} />
                    )}
                    <span>{msg.role === "model" ? "A.C.E" : "You"}</span>
                  </div>
                  <div className="markdown-content">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({ node, ...props }) => (
                          <h1
                            className="text-lg font-bold text-white mt-6 mb-3 pb-2 border-b border-white/10"
                            {...props}
                          />
                        ),
                        h2: ({ node, ...props }) => (
                          <h2
                            className="text-base font-bold text-nexus-teal mt-5 mb-2"
                            {...props}
                          />
                        ),
                        h3: ({ node, ...props }) => (
                          <h3
                            className="text-sm font-bold text-text-primary mt-4 mb-2"
                            {...props}
                          />
                        ),
                        p: ({ node, ...props }) => (
                          <p className="mb-3 leading-7 last:mb-0" {...props} />
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
                        hr: ({ node, ...props }) => (
                          <div className="my-6 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent border-none" />
                        ),
                        strong: ({ node, ...props }) => (
                          <strong
                            className="font-bold text-nexus-teal"
                            {...props}
                          />
                        ),
                        em: ({ node, ...props }) => (
                          <em
                            className="italic text-text-secondary"
                            {...props}
                          />
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
                          <CodeBlock
                            inline={inline}
                            className={className}
                            {...props}
                          >
                            {children}
                          </CodeBlock>
                        ),
                      }}
                    >
                      {preprocessMarkdown(msg.text)}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start animate-pulse">
                <div className="bg-nexus-dark/50 border border-white/10 p-3 rounded-2xl rounded-bl-none text-sm text-nexus-teal flex items-center gap-2">
                  <Sparkles size={14} className="animate-spin" />
                  <span>Thinking...</span>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="mt-2 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask ACE..."
          className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-nexus-purple transition-colors font-mono"
        />
        <button
          onClick={() => handleSend()}
          disabled={loading}
          className="bg-nexus-teal text-nexus-deep p-3 rounded-xl hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default AIChat;
