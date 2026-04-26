"use client";

import { useState, useEffect, useRef } from "react";

// SVG Icons to replace lucide-react so it stops breaking
const Sparkles = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/></svg>;
const Trash2 = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>;
const Send = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>;
const Bot = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="14" x="3" y="8" rx="2"/><path d="M12 5a3 3 0 1 0-3 3"/><path d="M9 8h6"/><path d="M15 14v.01"/><path d="M9 14v.01"/></svg>;
const User = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;

type Message = { id: string; role: "user" | "assistant"; content: string; model?: string; };
type Model = "Claude Opus 4.7" | "GPT-5.5";

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<Model>("Claude Opus 4.7");
  const [isMounted, setIsMounted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem("chat_history");
    if (saved) {
      try { setMessages(JSON.parse(saved)); } catch (e) { }
    } else {
      setMessages([{ id: Date.now().toString(), role: "assistant", content: "Hello. I am your advanced AI assistant. How can I help you today?", model: "Claude Opus 4.7" }]);
    }
  }, []);

  useEffect(() => {
    if (isMounted) localStorage.setItem("chat_history", JSON.stringify(messages));
  }, [messages, isMounted]);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => { scrollToBottom(); }, [messages, isLoading]);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  const clearChat = () => {
    setMessages([{ id: Date.now().toString(), role: "assistant", content: "Chat history cleared. How can I help you today?", model: selectedModel }]);
    localStorage.removeItem("chat_history");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    setTimeout(() => {
      let aiResponse = selectedModel === "GPT-5.5" 
        ? "I am GPT-5.5, the latest flagship model from OpenAI. I'm operating in simulated mode right now."
        : "I am Claude, functioning as Opus 4.7. Currently, I am running as a localized UI prototype.";
      
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", content: aiResponse, model: selectedModel }]);
      setIsLoading(false);
    }, 1500);
  };

  if (!isMounted) return null;

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0c] text-zinc-300 font-sans relative overflow-hidden">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#1a1f2e] rounded-full blur-[120px] opacity-40 animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[#0f172a] rounded-full blur-[150px] opacity-50 animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s' }}></div>
      </div>

      <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/5 bg-black/20 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500/20 to-blue-400/20 flex items-center justify-center border border-white/10 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
            <div className="text-indigo-300"><Sparkles /></div>
          </div>
          <span className="text-sm font-medium tracking-wide text-zinc-200">Neural Interface</span>
        </div>
        <div className="flex items-center gap-4">
          <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value as Model)} className="bg-zinc-900/50 border border-white/10 rounded-md px-3 py-1.5 text-xs text-zinc-300 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 appearance-none cursor-pointer hover:bg-zinc-800/50 transition-colors backdrop-blur-sm">
            <option value="Claude Opus 4.7">Claude Opus 4.7</option>
            <option value="GPT-5.5">GPT-5.5</option>
          </select>
          <button onClick={clearChat} className="p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-white/5 rounded-md transition-colors"><Trash2 /></button>
        </div>
      </header>

      <main className="relative z-10 flex-1 overflow-y-auto px-4 py-8 scroll-smooth">
        <div className="max-w-3xl mx-auto space-y-8">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-4 transition-all duration-300 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className="flex-shrink-0 mt-1">
                {msg.role === "assistant" ? (
                  <div className="w-8 h-8 rounded-full bg-zinc-800/80 border border-white/5 flex items-center justify-center shadow-lg backdrop-blur-sm"><div className="text-indigo-300/80"><Bot /></div></div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-indigo-900/30 border border-indigo-500/20 flex items-center justify-center shadow-lg backdrop-blur-sm"><div className="text-indigo-300"><User /></div></div>
                )}
              </div>
              <div className={`max-w-[80%] px-5 py-3.5 rounded-2xl shadow-sm backdrop-blur-sm ${msg.role === "user" ? "bg-zinc-800/40 border border-white/5 text-zinc-200" : "bg-black/20 border border-white/[0.02] text-zinc-300"}`}>
                {msg.model && msg.role === "assistant" && <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2 font-semibold">{msg.model}</div>}
                <div className="leading-relaxed text-[15px]">{msg.content}</div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-4">
              <div className="flex-shrink-0 mt-1"><div className="w-8 h-8 rounded-full bg-zinc-800/80 border border-white/5 flex items-center justify-center shadow-lg"><div className="text-indigo-300/50"><Bot /></div></div></div>
              <div className="px-5 py-4 rounded-2xl bg-black/20 border border-white/[0.02] flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </main>

      <footer className="relative z-20 px-4 py-6 bg-gradient-to-t from-[#0a0a0c] via-[#0a0a0c]/90 to-transparent">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="relative flex items-end gap-2 p-2 bg-zinc-900/60 border border-white/10 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.5)] backdrop-blur-xl focus-within:border-indigo-500/30">
            <textarea ref={textareaRef} value={input} onChange={handleInput} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e); } }} placeholder="Message the neural net..." className="w-full max-h-[200px] min-h-[44px] bg-transparent resize-none py-3 px-3 text-[15px] text-zinc-200 placeholder:text-zinc-600 focus:outline-none" rows={1} />
            <button type="submit" disabled={!input.trim() || isLoading} className="flex-shrink-0 w-10 h-10 mb-1 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white disabled:opacity-50"><Send /></button>
          </form>
        </div>
      </footer>
    </div>
  );
}