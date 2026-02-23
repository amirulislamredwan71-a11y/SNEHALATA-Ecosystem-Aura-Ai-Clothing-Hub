import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Sparkles, Bot, User, Loader2, RefreshCcw, ArrowUp } from 'lucide-react';
import { startAuraChat, generateAuraImage, generateAuraResponse } from '../services/geminiService';
import { ChatMessage } from '../types';

// যদি আপনার Navigation ফাইল থেকে path দরকার হয় তবে এটি রাখুন
// import { useLocation } from './Navigation'; 

interface ChatAssistantProps {
  embedded?: boolean;
  className?: string;
}

export const ChatAssistant: React.FC<ChatAssistantProps> = ({ embedded = false, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const chatRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if ((isOpen || embedded) && messages.length === 0) {
      setMessages([{
        role: 'ai',
        content: 'আসসালামু আলাইকুম! আমি স্নেহলতা ইকোসিস্টেমের Aura AI 1.5। আমি আপনাকে পণ্য খুঁজে পেতে বা নতুন ডিজাইনের ছবি তৈরি করে দিতে পারি। আজ কীভাবে সাহায্য করতে পারি?',
        timestamp: Date.now()
      }]);
    }
    if ((isOpen || embedded) && !chatRef.current) {
      chatRef.current = startAuraChat();
    }
  }, [isOpen, embedded]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleClearChat = () => {
    if (window.confirm("চ্যাট ইতিহাস মুছে ফেলতে চান?")) {
      setMessages([{
        role: 'ai',
        content: 'চ্যাট ইতিহাস রিসেট করা হয়েছে।',
        timestamp: Date.now()
      }]);
      chatRef.current = startAuraChat();
    }
  };

  const isImageRequest = (text: string) => {
    const keywords = ['image', 'picture', 'photo', 'drawing', 'ছবি', 'পিকচার', 'আঁকো', 'তৈরি করো', 'create', 'generate'];
    return keywords.some(k => text.toLowerCase().includes(k));
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping || isGeneratingImage) return;

    const userMsg: ChatMessage = { role: 'user', content: input, timestamp: Date.now() };
    const currentInput = input;
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      if (isImageRequest(currentInput)) {
        setIsGeneratingImage(true);
        const imageUrl = await generateAuraImage(currentInput);
        if (imageUrl) {
          setMessages(prev => [...prev, {
            role: 'ai',
            content: `আপনার কল্পনা অনুযায়ী ছবিটি তৈরি করা হয়েছে:`,
            generatedImageUrl: imageUrl,
            timestamp: Date.now()
          }]);
          setIsGeneratingImage(false);
          setIsTyping(false);
          return;
        }
      }

      const responseText = await generateAuraResponse(chatRef.current, currentInput);
      setMessages(prev => [...prev, { role: 'ai', content: responseText, timestamp: Date.now() }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', content: 'দুঃখিত, বর্তমানে টেকনিক্যাল সমস্যার কারণে আমি কানেক্ট হতে পারছি না।', timestamp: Date.now() }]);
    } finally {
      setIsTyping(false);
      setIsGeneratingImage(false);
    }
  };

  return (
    <div className={embedded ? `relative w-full max-w-4xl mx-auto my-10 ${className}` : "fixed bottom-8 right-8 z-[150]"}>
      {!embedded && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 ${isOpen ? 'bg-white text-black rotate-90 scale-90' : 'bg-purple-600 text-white hover:scale-110'
            }`}
        >
          {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
        </button>
      )}

      {(isOpen || embedded) && (
        <div className={`${embedded ? "w-full h-[650px]" : "absolute bottom-20 right-0 w-[420px] h-[600px]"} bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300`}>

          {/* Header with Logo */}
          <header className="p-6 bg-white/5 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center border border-purple-500/40 overflow-hidden">
                <img src="/logo.png" alt="Aura" className="w-full h-full object-contain" />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm tracking-widest flex items-center gap-2 uppercase">
                  Aura AI <Sparkles size={12} className="text-purple-400" />
                </h3>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                  <span className="text-[10px] text-green-400 uppercase font-black tracking-tighter">System Active</span>
                </div>
              </div>
            </div>
            <button onClick={handleClearChat} className="p-2 text-gray-500 hover:text-red-400 transition-colors">
              <RefreshCcw size={18} />
            </button>
          </header>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] space-y-2 ${msg.role === 'user' ? 'flex flex-col items-end' : ''}`}>
                  <div className={`px-5 py-3 rounded-2xl text-[13px] leading-relaxed ${msg.role === 'user' ? 'bg-purple-600 text-white rounded-tr-none' : 'bg-white/10 text-gray-100 rounded-tl-none border border-white/5'
                    }`}>
                    {msg.content}
                  </div>
                  {msg.generatedImageUrl && (
                    <img src={msg.generatedImageUrl} className="rounded-2xl border border-white/10 w-full shadow-2xl" alt="AI Generated" />
                  )}
                </div>
              </div>
            ))}
            {(isTyping || isGeneratingImage) && (
              <div className="flex justify-start">
                <div className="bg-white/5 border border-white/10 px-5 py-3 rounded-2xl animate-pulse">
                  <span className="text-[11px] text-purple-400 font-bold uppercase tracking-widest">
                    {isGeneratingImage ? "Rendering Image..." : "Aura is thinking..."}
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSendMessage} className="p-5 bg-black/40 border-t border-white/10">
            <div className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="এআই-কে প্রশ্ন করুন..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-5 pr-14 py-4 text-sm text-white focus:outline-none focus:border-purple-500 transition-all"
              />
              <button type="submit" className="absolute right-2 w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all">
                <ArrowUp size={20} strokeWidth={3} />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};