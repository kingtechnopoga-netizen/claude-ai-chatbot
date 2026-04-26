
"use client";
import { useState, useEffect } from "react";
import { Send, Bot, User, Sparkles, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Chat() {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { setIsMounted(true); }, []);
  
  if (!isMounted) return null;
  
  return (
    <div className="flex h-screen bg-black text-white items-center justify-center">
      <h1 className="text-2xl">Claude AI Chatbot - Production Mode</h1>
    </div>
  );
}
