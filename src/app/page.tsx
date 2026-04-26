"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Bot, User, Sparkles, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  model?: string;
};

type Model = "Claude Opus 4.7" | "GPT-5.5";

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<Model>("Claude Opus 4.7");
  const [isMounted, setIsMounted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load from LocalStorage
  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem("chat_history");
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse chat history");
      }
    } else {
      // Initial greeting
      const initialMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: "Hello. I am your advanced AI assistant. How can I help you today?",
        model: "Claude Opus 4.7"
      };
      setMessages([initialMessage]);
    }
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("chat_history", JSON.stringify(messages));
    }
  }, [messages, isMounted]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  const clearChat = () => {
    const initialMessage: Message = {
      id: Date.now().toString(),
      role: "assistant",
      content: "Chat history cleared. How can I help you today?",
      model: selectedModel
    };
    setMessages([initialMessage]);
    localStorage.removeItem("chat_history");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    // Mock API Delay
    setTimeout(() => {
      let aiResponse = "";
      if (selectedModel === "GPT-5.5") {
        aiResponse = "I am GPT-5.5, the latest flagship model from OpenAI. " + 
                     "I'm operating in simulated mode right now. In a production environment, " + 
                     "you would connect my API key in the Next.js backend to get real responses.";
      } else {
        aiResponse = "I am Claude, functioning as Opus 4.7. " + 
                     "Currently, I am running as a localized UI prototype. " +
                     "To unlock my full capabilities, you will need to add your Anthropic API key to the backend routes.";
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: aiResponse,
        model: selectedModel
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsLoading(false);
    }, 1500);
  };

  if (!isMounted) return null; // Prevent hydration mismatch

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0c] text-zinc-300 font-sans relative overflow-hidden">
      
      {/* Luxury Background Animation */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#1a1f2e] rounded-full blur-[120px] opacity-40 animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[#0f172a] rounded-full blur-[150px] opacity-50 animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s' }}></div>
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/5 bg-black/20 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500/20 to-blue-400/20 flex items-center justify-center border border-white/10 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
            <Sparkles className="w-4 h-4 text-indigo-300" />
          </div>
          <span className="text-sm font-medium tracking-wide text-zinc-200">Neural Interface</span>
        </div>

        <div className="flex items-center gap-4">
          <select 
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value as Model)}
            className="bg-zinc-900/50 border border-white/10 rounded-md px-3 py-1.5 text-xs text-zinc-300 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 appearance-none cursor-pointer hover:bg-zinc-800/50 transition-colors backdrop-blur-sm"
          >
            <option value="Claude Opus 4.7">Claude Opus 4.7</option>
            <option value="GPT-5.5">GPT-5.5</option>
          </select>

          <button 
            onClick={clearChat}
            className="p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-white/5 rounded-md transition-colors"
            title="Clear Chat History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Chat Area */}
      <main className="relative z-10 flex-1 overflow-y-auto px-4 py-8 scroll-smooth">
        <div className="max-w-3xl mx-auto space-y-8">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div 
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div className="flex-shrink-0 mt-1">
                  {msg.role === "assistant" ? (
                    <div className="w-8 h-8 rounded-full bg-zinc-800/80 border border-white/5 flex items-center justify-center shadow-lg backdrop-blur-sm">
                      <Bot className="w-4 h-4 text-indigo-300/80" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-indigo-900/30 border border-indigo-500/20 flex items-center justify-center shadow-lg backdrop-blur-sm">
                      <User className="w-4 h-4 text-indigo-300" />
                    </div>
                  )}
                </div>
                
                <div className={`max-w-[80%] px-5 py-3.5 rounded-2xl shadow-sm backdrop-blur-sm ${
                  msg.role === "user" 
                    ? "bg-zinc-800/40 border border-white/5 text-zinc-200" 
                    : "bg-black/20 border border-white/[0.02] text-zinc-300"
                }`}>
                  {msg.model && msg.role === "assistant" && (
                    <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2 font-semibold">
                      {msg.model}
                    </div>
                  )}
                  <div className="leading-relaxed text-[15px]">
                    {msg.content}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-4"
            >
              <div className="flex-shrink-0 mt-1">
                <div className="w-8 h-8 rounded-full bg-zinc-800/80 border border-white/5 flex items-center justify-center shadow-lg">
                  <Bot className="w-4 h-4 text-indigo-300/50" />
                </div>
              </div>
              <div className="px-5 py-4 rounded-2xl bg-black/20 border border-white/[0.02] flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </main>

      {/* Input Area */}
      <footer className="relative z-20 px-4 py-6 bg-gradient-to-t from-[#0a0a0c] via-[#0a0a0c]/90 to-transparent">
        <div className="max-w-3xl mx-auto">
          <form 
            onSubmit={handleSubmit}
            className="relative flex items-end gap-2 p-2 bg-zinc-900/60 border border-white/10 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all focus-within:border-indigo-500/30 focus-within:bg-zinc-900/80 focus-within:shadow-[0_0_40px_rgba(99,102,241,0.05)]"
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInput}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Message the neural net..."
              className="w-full max-h-[200px] min-h-[44px] bg-transparent resize-none py-3 px-3 text-[15px] text-zinc-200 placeholder:text-zinc-600 focus:outline-none"
              rows={1}
            />
            <button 
              type="submit"
              disabled={!input.trim() || isLoading}
              className="flex-shrink-0 w-10 h-10 mb-1 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 disabled:opacity-50 disabled:hover:bg-zinc-800 disabled:hover:text-zinc-400 transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="text-center mt-3 text-[11px] text-zinc-600 tracking-wide">
            AI can make mistakes. Verify important information.
          </div>
        </div>
      </footer>
    </div>
  );
}
