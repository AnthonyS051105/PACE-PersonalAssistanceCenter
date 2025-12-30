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
  Plus,
  Clock,
  Search,
  MessageSquare,
  Trash2,
  X,
  Menu,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Image from "next/image";
import { generateAIResponse } from "../lib/geminiService";
import { supabase } from "@/lib/supabase";

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

const AIChat = ({ user, showHeader = false, isCompact = false }) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Multi-session State
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [historySearch, setHistorySearch] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

  // Fetch Conversations List
  const fetchConversations = async () => {
     if (!user) return;
     const { data, error } = await supabase
        .from("chat_conversations")
        .select("*")
        .order("updated_at", { ascending: false });
        
     if (!error && data) {
         setConversations(data);
         // If no current conversation, maybe select the most recent one? 
         // For now, let's keep it empty (New Chat state) unless specified.
     }
  };

  useEffect(() => {
     fetchConversations();
  }, [user]);

  // Load Messages for Specific Conversation
  const loadConversation = async (id) => {
      setCurrentConversationId(id);
      setIsSidebarOpen(false); // Close sidebar on selection on mobile
      
      const { data, error } = await supabase
        .from("chat_history")
        .select("*")
        .eq("conversation_id", id)
        .order("created_at", { ascending: true });

      if (!error && data) {
          setMessages(data.map(m => ({
            id: m.id,
            role: m.role,
            text: m.text,
            timestamp: new Date(m.created_at)
        })));
      }
  };
  
  const handleNewChat = () => {
      setCurrentConversationId(null);
      setMessages([]);
      setIsSidebarOpen(false);
  };

  const handleDeleteConversation = async (e, id) => {
      e.stopPropagation();
      if(!confirm("Delete this conversation?")) return;
      
      const { error } = await supabase.from("chat_conversations").delete().eq("id", id);
      if (!error) {
          setConversations(prev => prev.filter(c => c.id !== id));
          if (currentConversationId === id) handleNewChat();
      }
  };

  // Filtered History
  const filteredConversations = conversations.filter(c => 
      c.title?.toLowerCase().includes(historySearch.toLowerCase()) || 
      "New Conversation".toLowerCase().includes(historySearch.toLowerCase())
  );

  const handleSend = async (text = input) => {
    if (!text.trim() || loading) return;
    const userText = text.trim();

    const userMsg = {
      id: Date.now().toString(),
      role: "user",
      text: userText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    let activeConvId = currentConversationId;

    try {
        // 1. Create Conversation if not exists
        if (!activeConvId && user) {
            // Generate title from first message
            const title = userText.length > 30 ? userText.substring(0,30) + "..." : userText;
            
            const { data: convData, error: convError } = await supabase
                .from("chat_conversations")
                .insert({ user_id: user.id, title: title })
                .select()
                .single();
                
            if (!convError && convData) {
                activeConvId = convData.id;
                setCurrentConversationId(activeConvId);
                fetchConversations(); // Refresh list
            }
        } else if (activeConvId && user) {
            // Update timestamp
            supabase.from("chat_conversations")
                .update({ updated_at: new Date() })
                .eq("id", activeConvId).then(() => fetchConversations());
        }

        // 2. Save User Msg
        if (user && activeConvId) {
            supabase.from("chat_history").insert({
                user_id: user.id,
                conversation_id: activeConvId,
                role: "user",
                text: userText
            }).then();
        }

        const history = messages.map((m) => ({ role: m.role, text: m.text }));
        
        // Use Gemini
        const responseText = await generateAIResponse(userText, history);

        const aiMsg = {
            id: (Date.now() + 1).toString(),
            role: "model",
            text: responseText,
            timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMsg]);
      
        // 3. Save AI Msg
        if (user && activeConvId) {
            supabase.from("chat_history").insert({
                user_id: user.id,
                conversation_id: activeConvId,
                role: "model",
                text: responseText
            }).then();
        }
      
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, {
          id: Date.now(), 
          role: "model", 
          text: "Error: Could not reach AI service."
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full relative overflow-hidden">
      {/* Sidebar (History) */}
      <div 
        className={`absolute inset-y-0 left-0 z-30 w-72 bg-nexus-deep/95 backdrop-blur-xl border-r border-white/10 transform transition-transform duration-300 flex flex-col shadow-2xl ${
          showHistory ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/5">
            <h3 className="font-bold text-white text-sm tracking-wider flex items-center gap-2">
                <Clock size={16} className="text-nexus-purple" />
                HISTORY
            </h3>
            <button 
                onClick={() => setShowHistory(false)} 
                className="text-text-secondary hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
            >
                <X size={18} />
            </button>
        </div>
        
        <div className="p-4">
            <div className="relative group">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-nexus-teal transition-colors" />
                <input 
                    type="text" 
                    placeholder="Search conversations..." 
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-nexus-teal focus:ring-1 focus:ring-nexus-teal/50 transition-all placeholder:text-text-secondary/50"
                />
            </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1">
            <div className="text-[10px] font-bold text-text-secondary uppercase tracking-widest px-2 mb-2 opacity-70">
                Recent Chats
            </div>
            {filteredConversations.map(conv => (
                <button
                    key={conv.id}
                    onClick={() => loadConversation(conv.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all group border ${
                        currentConversationId === conv.id 
                            ? "bg-nexus-purple/10 border-nexus-purple/40 shadow-[0_0_15px_rgba(147,51,234,0.1)]" 
                            : "hover:bg-white/5 border-transparent hover:border-white/5"
                    }`}
                >
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className={`p-1.5 rounded-lg ${currentConversationId === conv.id ? "bg-nexus-purple/20 text-nexus-purple" : "bg-white/5 text-text-secondary group-hover:text-white"}`}>
                            <MessageSquare size={14} />
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <span className={`text-xs truncate font-medium ${currentConversationId === conv.id ? "text-white" : "text-text-secondary group-hover:text-white"}`}>
                                {conv.title || "New Conversation"}
                            </span>
                            <span className="text-[10px] text-text-secondary/50 truncate">
                                {new Date(conv.updated_at).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                    <div 
                        onClick={(e) => handleDeleteConversation(e, conv.id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-all"
                        title="Delete"
                    >
                        <Trash2 size={12} />
                    </div>
                </button>
            ))}
            
            {filteredConversations.length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 text-text-secondary opacity-50 gap-2">
                    <MessageSquare size={24} />
                    <span className="text-xs">No conversations found</span>
                </div>
            )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full w-full relative">
        {showHeader && (
            <div className={`flex items-center justify-between ${isCompact ? "p-3 pb-1" : "p-5 pb-2"} z-10`}>
                <div className="flex items-center gap-3">
                    <div className={`relative w-8 h-8 ${isCompact ? "scale-75" : ""}`}>
                      <Image
                        src="/assets/ai-mascot.png"
                        alt="A.C.E Mascot"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <h3 className={`${isCompact ? "text-sm" : "text-lg"} font-semibold tracking-wide text-text-primary font-sans`}>
                        A.C.E
                    </h3>
                </div>
                <div className="flex items-center gap-1">
                     <button
                       onClick={() => setShowHistory(!showHistory)}
                       className={`p-2 rounded-lg transition-all flex items-center justify-center ${
                           showHistory 
                           ? "text-nexus-purple bg-nexus-purple/10" 
                           : "text-text-secondary hover:text-white hover:bg-white/5"
                       }`}
                       title="History"
                     >
                       <Clock size={18} />
                     </button>
                     <button
                       onClick={handleNewChat}
                       className="p-2 text-text-secondary hover:text-white hover:bg-white/5 rounded-lg transition-all flex items-center justify-center"
                       title="New Chat"
                     >
                       <Plus size={18} />
                     </button>
                </div>
            </div>
        )}

        {/* Header Actions - Positioned Top Right if Header is Hidden */}
        {!showHeader && (
        <div className="absolute -top-1 -right-1 z-20 flex items-center gap-1">
             <button
               onClick={() => setShowHistory(!showHistory)}
               className={`p-2 rounded-lg transition-all flex items-center justify-center ${
                   showHistory 
                   ? "text-nexus-purple bg-nexus-purple/10" 
                   : "text-text-secondary hover:text-white hover:bg-white/5"
               }`}
               title="History"
             >
               <Clock size={18} />
             </button>
             <button
               onClick={handleNewChat}
               className="p-2 text-text-secondary hover:text-nexus-teal hover:bg-nexus-teal/10 rounded-lg transition-all flex items-center justify-center"
               title="New Chat"
             >
               <Plus size={18} />
             </button>
        </div>
        )}

        <div className="flex-1 overflow-y-auto space-y-4 pr-2 pb-4 pt-4">
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
                        code: ({
                          node,
                          inline,
                          className,
                          children,
                          ...props
                        }) => (
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

      <div className={`mt-2 flex gap-2 pl-3 pb-4 pr-3 ${isCompact ? "pb-2" : ""}`}>
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
    </div>
  );
};

export default AIChat;
