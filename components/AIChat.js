import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles } from "lucide-react";
import { generateAIResponse } from "../lib/geminiService";

const AIChat = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      id: "1",
      role: "model",
      text: "Systems Online. How can I assist you today?",
      timestamp: new Date(),
    },
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = {
      id: Date.now().toString(),
      role: "user",
      text: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const history = messages.map((m) => ({ role: m.role, text: m.text }));
      const responseText = await generateAIResponse(input, history);

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
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
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
                {msg.role === "model" ? <Bot size={12} /> : <User size={12} />}
                <span>{msg.role === "model" ? "Nexus AI" : "You"}</span>
              </div>
              <div className="whitespace-pre-wrap">{msg.text}</div>
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
        <div ref={messagesEndRef} />
      </div>

      <div className="mt-4 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask Gemini..."
          className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-nexus-teal transition-colors font-mono"
        />
        <button
          onClick={handleSend}
          disabled={loading}
          className="bg-nexus-teal hover:bg-teal-400 text-nexus-deep p-2 rounded-xl transition-transform active:scale-95 disabled:opacity-50"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default AIChat;
