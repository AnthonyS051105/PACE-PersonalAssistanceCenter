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
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Image from "next/image";
import { generateAIResponse } from "../lib/geminiService";

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
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
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
              <h3 className="text-xl font-bold text-white mb-1">
                A.C.E Online
              </h3>
              <p className="text-xs text-gray-400 max-w-[200px] mx-auto">
                System ready. Awaiting the input for processing.
              </p>
            </div>
            <div className="flex flex-col gap-2 w-full max-w-xs">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(s.text)}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-nexus-purple/30 transition-all text-xs text-gray-300 hover:text-white text-left group"
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
                    : "bg-nexus-dark/50 border border-white/10 text-gray-200 rounded-bl-none"
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
                        p: ({ node, ...props }) => (
                          <p className="mb-3 leading-7 last:mb-0" {...props} />
                        ),
                        ul: ({ node, ...props }) => (
                          <ul
                            className="list-disc list-outside mb-3 space-y-1 pl-4"
                            {...props}
                          />
                        ),
                        ol: ({ node, ...props }) => (
                          <ol
                            className="list-decimal list-outside mb-3 space-y-1 pl-4"
                            {...props}
                          />
                        ),
                        li: ({ node, ...props }) => (
                          <li className="text-gray-200 pl-1" {...props} />
                        ),
                        blockquote: ({ node, ...props }) => (
                          <blockquote className="border-l-4 border-nexus-purple bg-white/5 p-3 my-4 rounded-r-lg relative">
                            <div className="flex gap-2">
                              <Quote
                                size={16}
                                className="text-nexus-purple shrink-0 mt-1"
                              />
                              <div
                                className="italic text-gray-300"
                                {...props}
                              />
                            </div>
                          </blockquote>
                        ),
                        hr: ({ node, ...props }) => (
                          <hr
                            className="border-t border-white/10 my-6"
                            {...props}
                          />
                        ),
                        strong: ({ node, ...props }) => (
                          <strong
                            className="font-bold text-nexus-teal"
                            {...props}
                          />
                        ),
                        em: ({ node, ...props }) => (
                          <em className="italic text-gray-300" {...props} />
                        ),
                        a: ({ node, ...props }) => (
                          <a
                            className="text-nexus-teal underline hover:text-white transition-colors"
                            target="_blank"
                            rel="noopener noreferrer"
                            {...props}
                          />
                        ),
                        code: ({
                          node,
                          inline,
                          className,
                          children,
                          ...props
                        }) => {
                          return inline ? (
                            <code
                              className="bg-black/30 px-1 py-0.5 rounded text-nexus-teal font-mono text-xs"
                              {...props}
                            >
                              {children}
                            </code>
                          ) : (
                            <div className="bg-black/30 p-3 rounded-lg my-3 overflow-x-auto border border-white/5">
                              <code
                                className="font-mono text-xs text-gray-300 leading-relaxed"
                                {...props}
                              >
                                {children}
                              </code>
                            </div>
                          );
                        },
                      }}
                    >
                      {msg.text}
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
