
import React, { useState, useRef, useEffect } from 'react';
import { Message, MessageRole, UserRole } from '../types';
import { chatWithSearch, analyzeImageAndCode } from '../services/geminiService';

interface ChatInterfaceProps {
  onMessageSent?: (title: string) => void;
  currentUser?: { name: string, role: string } | null;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onMessageSent, currentUser }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const handleSend = async (forcedInput?: string) => {
    const finalInput = forcedInput || input;
    if (!finalInput.trim() && !selectedImage) return;

    const query = finalInput.trim();
    const userMessage: Message = {
      id: Date.now().toString(),
      role: MessageRole.USER,
      content: query,
      timestamp: Date.now(),
      image: selectedImage || undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setSelectedImage(null);
    setIsLoading(true);

    try {
      let responseText = '';
      if (userMessage.image) {
        responseText = await analyzeImageAndCode(userMessage.image, query || "Perform visual analysis.");
      } else {
        // If user is Admin, we add architectural context to the prompt
        const finalPrompt = currentUser?.role === 'Administration' 
          ? `[High Architect Context] User is the High Architect of Nexus. Respond with deep technical rigor and blueprint-level detail. \n\nQuery: ${query}` 
          : query;
          
        const result = await chatWithSearch(finalPrompt);
        responseText = result.text;
      }
      setMessages(prev => [...prev, { id: Date.now().toString(), role: MessageRole.MODEL, content: responseText, timestamp: Date.now() }]);
      if (onMessageSent) onMessageSent(query.slice(0, 30) + "...");
    } catch (error) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: MessageRole.MODEL, content: "Synthesis Failed: Neural link severed. Retry protocol.", timestamp: Date.now() }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-10 space-y-16 custom-scrollbar pb-40">
        {messages.length === 0 && (
          <div className="max-w-4xl mx-auto space-y-20 py-10 animate-astral">
            <div className="space-y-8 text-center md:text-left">
              <h1 className="text-8xl md:text-[120px] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 via-purple-500 to-white leading-[0.85] uppercase">SYNTHESIS.</h1>
              <p className="text-slate-500 text-[12px] font-black uppercase tracking-[0.6em] leading-relaxed max-w-2xl">
                {currentUser?.role === 'Administration' ? 'Nexus Cosmic Architect Terminal' : 'Built by Kshitiz Mishra | World-class engineering intelligence.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
              <button onClick={() => handleSend("Perform a deep-dive analysis of a complex Rust snippet. Identify lifetime conflicts.")} className="w-full bg-[#0a0a0f]/60 border border-white/5 p-12 rounded-[3rem] text-left group hover:border-indigo-500/40 transition-all flex flex-col gap-8 shadow-2xl backdrop-blur-2xl">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                </div>
                <div>
                  <h4 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-2">Polyglot Analysis</h4>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Rust • Go • Python • TS Mastery</p>
                </div>
              </button>

              <button onClick={() => handleSend("Audit the security logic for race conditions in shared state access.")} className="w-full bg-[#0a0a0f]/60 border border-white/5 p-12 rounded-[3rem] text-left group hover:border-purple-500/40 transition-all flex flex-col gap-8 shadow-2xl backdrop-blur-2xl">
                <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                </div>
                <div>
                  <h4 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-2">Security Audit</h4>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Vulnerability Scanning</p>
                </div>
              </button>
            </div>
          </div>
        )}

        <div className="max-w-3xl mx-auto w-full space-y-12">
          {messages.map((m) => (
            <div key={m.id} className={`flex gap-8 animate-astral ${m.role === MessageRole.USER ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center mt-1 border ${m.role === MessageRole.USER ? 'bg-white/5 border-white/10' : 'bg-indigo-600 border-white/20'}`}>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {m.role === MessageRole.USER ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  )}
                </svg>
              </div>
              <div className={`px-8 py-6 rounded-[2.5rem] text-[16px] leading-relaxed max-w-[85%] font-medium ${m.role === MessageRole.USER ? 'bg-indigo-600/10 border border-indigo-500/10 text-slate-200 shadow-xl' : 'bg-white/5 border border-white/5 text-slate-300 shadow-xl'}`}>
                <div className="whitespace-pre-wrap">{m.content}</div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-8 items-center px-4">
               <div className="flex space-x-2">
                 <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                 <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.1s]"></div>
                 <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.2s]"></div>
               </div>
               <span className="text-[11px] font-black text-slate-800 uppercase tracking-[0.5em]">Synthesizing...</span>
            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-10 left-0 right-0 px-6 pointer-events-none">
        <div className="max-w-3xl mx-auto pointer-events-auto">
          <div className="bg-[#11111c]/90 backdrop-blur-3xl rounded-full border border-white/5 focus-within:border-indigo-500/40 shadow-[0_40px_80px_rgba(0,0,0,0.6)] pl-10 pr-3 py-3 flex items-center gap-4 group">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Uplink logic demand..."
              className="flex-1 bg-transparent border-none text-slate-100 outline-none py-3 resize-none max-h-32 text-[16px] placeholder:text-slate-800 font-medium"
              rows={1}
            />
            <button
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isLoading || !input.trim() ? 'bg-white/5 text-slate-800' : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white hover:scale-105 active:scale-95 shadow-xl shadow-indigo-900/40'}`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
