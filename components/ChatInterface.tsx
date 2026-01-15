
import React, { useState, useRef, useEffect } from 'react';
import { Message, MessageRole } from '../types';
import { chatWithSearch } from '../services/geminiService';

interface ChatInterfaceProps {
  onMessageSent?: (title: string) => void;
  currentUser?: { name: string, role: string } | null;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onMessageSent, currentUser }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleSend = async (forcedInput?: string) => {
    const finalInput = forcedInput || input;
    if (!finalInput.trim() || isLoading) return;

    const query = finalInput.trim();
    const userMessage: Message = {
      id: Date.now().toString(),
      role: MessageRole.USER,
      content: query,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Connects to Google Servers via geminiService
      const { text, links } = await chatWithSearch(query);
      const modelMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: MessageRole.MODEL,
        content: text,
        timestamp: Date.now(),
        groundingLinks: links
      };
      setMessages(prev => [...prev, modelMessage]);
      if (onMessageSent) onMessageSent(query.slice(0, 30));
    } catch (error) {
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        role: MessageRole.MODEL, 
        content: "CRITICAL: Online neural link failure. Verify API_KEY status.", 
        timestamp: Date.now() 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full relative bg-[#05050d]">
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 md:px-16 py-8 space-y-12 custom-scrollbar pb-52">
        {messages.length === 0 && (
          <div className="max-w-7xl mx-auto space-y-16 animate-astral pt-12">
            <div className="space-y-6 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full mb-4">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-[8px] font-black text-green-400 uppercase tracking-widest">Global Node Online</span>
              </div>
              <h1 className="text-8xl md:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 uppercase italic leading-none">
                AZURE<br/><span className="text-white/90">ONLINE.</span>
              </h1>
              <p className="text-slate-500 text-[12px] font-black uppercase tracking-[0.8em] ml-2">
                Real-Time Engineering • Cloud Node Active
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: "LATEST REACT/TS", label: "ONLINE_UI", query: "Show me the best practices for React 19 and Server Components", color: "from-cyan-500" },
                { title: "C# 12 FEATURES", label: "CLOUD_LOGIC", query: "Explain C# 12 Primary Constructors with examples", color: "from-blue-500" },
                { title: "LIVE API DOCS", label: "SEARCH_GROUND", query: "Get the latest documentation for Google Gemini API integration", color: "from-indigo-500" }
              ].map((item, i) => (
                <button 
                  key={i} 
                  onClick={() => handleSend(item.query)} 
                  className="bg-[#0a0a14] border border-white/5 p-8 rounded-[2.5rem] text-left hover:border-blue-500/40 transition-all group relative overflow-hidden shadow-2xl"
                >
                  <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${item.color} to-transparent opacity-50`}></div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{item.label}</p>
                  <p className="text-[14px] text-white font-bold group-hover:text-blue-400 transition-colors">{item.title}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto w-full space-y-10">
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === MessageRole.USER ? 'justify-end' : 'justify-start'}`}>
              <div className={`px-8 py-6 rounded-[2.5rem] shadow-2xl ${m.role === MessageRole.USER ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-medium max-w-[80%]' : 'bg-[#0d0d1a]/95 backdrop-blur-xl border border-white/5 text-slate-300 w-full'}`}>
                <div className="prose prose-invert max-w-none text-[15px] leading-relaxed font-sans">
                   {m.content.split('```').map((part, i) => {
                     if (i % 2 === 1) {
                       const lines = part.split('\n');
                       const lang = lines[0].trim();
                       const code = lines.slice(1).join('\n');
                       const codeId = `code-${m.id}-${i}`;
                       
                       return (
                         <div key={i} className="relative group/code my-8 shadow-2xl">
                           <div className="flex items-center justify-between bg-white/5 px-6 py-3 rounded-t-[1.5rem] border-t border-x border-white/10">
                             <div className="flex items-center gap-3">
                               <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{lang || 'CODE'}</span>
                             </div>
                             <button 
                               onClick={() => copyToClipboard(code, codeId)}
                               className="px-4 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-[9px] font-black transition-all border border-white/10"
                             >
                               {copiedId === codeId ? (
                                 <span className="text-green-400 uppercase tracking-widest">COPIED</span>
                               ) : (
                                 <span className="text-blue-400 uppercase tracking-widest">COPY TO CLIPBOARD</span>
                               )}
                             </button>
                           </div>
                           <pre className="bg-black/60 p-8 rounded-b-[1.5rem] overflow-x-auto border-b border-x border-white/10 font-mono text-[14px] text-cyan-300 custom-scrollbar leading-relaxed">
                             {code}
                           </pre>
                         </div>
                       );
                     }
                     return <span key={i} className="whitespace-pre-wrap">{part}</span>;
                   })}
                </div>
                {m.groundingLinks && m.groundingLinks.length > 0 && (
                  <div className="mt-10 pt-6 border-t border-white/5">
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.6em] mb-4">Live Online References</p>
                    <div className="flex flex-wrap gap-3">
                      {m.groundingLinks.map((link, idx) => (
                        <a key={idx} href={link.uri} target="_blank" rel="noopener noreferrer" className="bg-blue-500/5 hover:bg-blue-500/10 border border-blue-500/10 px-5 py-2.5 rounded-2xl text-[11px] text-blue-400 font-bold transition-all flex items-center gap-2 group/link">
                          <svg className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                          {link.title}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center gap-4 p-6 bg-[#0d0d1a] border border-white/5 rounded-[2rem] w-fit shadow-2xl">
               <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
               <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.5em]">Fetching Live Data from Google Servers...</span>
            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-10 left-0 right-0 px-6 md:px-16 z-30">
        <div className="max-w-7xl mx-auto">
          <div className="bg-[#0a0a14]/95 backdrop-blur-3xl rounded-[3rem] border border-white/10 p-3 flex items-center gap-4 shadow-[0_40px_80px_rgba(0,0,0,0.8)] focus-within:border-blue-500/40 transition-all">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { 
                if (e.key === 'Enter' && !e.shiftKey) { 
                  e.preventDefault(); 
                  handleSend(); 
                } 
              }}
              placeholder="Inject architectural demand (C#, React, etc.)..."
              className="flex-1 bg-transparent border-none text-slate-100 outline-none px-8 py-4 text-[16px] font-medium placeholder:text-slate-800 resize-none max-h-48 min-h-[64px] custom-scrollbar"
              rows={1}
            />
            <button
              onClick={() => handleSend()}
              className="w-16 h-16 rounded-[2rem] flex items-center justify-center bg-gradient-to-br from-cyan-500 to-indigo-600 text-white shadow-2xl hover:scale-105 active:scale-95 transition-all flex-shrink-0 group"
            >
              <svg className="w-7 h-7 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 5l7 7-7 7" /></svg>
            </button>
          </div>
          <div className="flex justify-between px-10 mt-5">
             <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
                <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest italic">Live Encrypted Link Active</span>
             </div>
             <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest">Azure Online Node v4.5</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
