
import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  const abortControllerRef = useRef<AbortController | null>(null);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const stopResponse = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
      setMessages(prev => [...prev, { 
        id: `stop-${Date.now()}`, 
        role: MessageRole.MODEL, 
        content: "_[Uplink Terminated by High Architect]_", 
        timestamp: Date.now() 
      }]);
    }
  };

  const handleSend = async (forcedInput?: string) => {
    const finalInput = forcedInput || input;
    if (!finalInput.trim()) return;

    const query = finalInput.trim();
    const userMessage: Message = {
      id: `u-${Date.now()}`,
      role: MessageRole.USER,
      content: query,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    if (!forcedInput) setInput('');
    setIsLoading(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const { text, links } = await chatWithSearch(query, controller.signal);
      
      if (controller.signal.aborted) return;

      const modelMessage: Message = {
        id: `m-${Date.now()}`,
        role: MessageRole.MODEL,
        content: text,
        timestamp: Date.now(),
        groundingLinks: links
      };
      setMessages(prev => [...prev, modelMessage]);
      if (onMessageSent) onMessageSent(query.slice(0, 30));
    } catch (error: any) {
      if (error.name === 'AbortError') return;
      setMessages(prev => [...prev, { 
        id: `err-${Date.now()}`, 
        role: MessageRole.MODEL, 
        content: "CRITICAL: Uplink unstable. Node retry suggested.", 
        timestamp: Date.now() 
      }]);
    } finally {
      if (abortControllerRef.current === controller) {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    }
  };

  return (
    <div className="flex flex-col h-full relative bg-[#05050d] w-full">
      <div 
        ref={scrollRef} 
        className="flex-1 overflow-y-auto px-4 lg:px-0 py-6 md:py-8 custom-scrollbar pb-64 md:pb-72"
      >
        <div className="max-w-[900px] xl:max-w-[1200px] mx-auto w-full px-4 lg:px-10">
          {messages.length === 0 && (
            <div className="space-y-12 md:space-y-20 animate-astral pt-12 md:pt-24">
              <div className="space-y-4 md:space-y-8 text-center">
                <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,1)]"></div>
                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">Kshitiz Coder Node Active</span>
                </div>
                <h1 className="text-7xl md:text-[10rem] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 uppercase italic leading-none drop-shadow-2xl">
                  AZURE<span className="text-white/90">.AI</span>
                </h1>
                <p className="text-slate-500 text-sm md:text-lg font-bold uppercase tracking-[0.5em] italic">The Premier Coding Facility</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                {[
                  { q: 'Design a clean C# architecture', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
                  { q: 'Build a React 19 Framer Motion App', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
                  { q: 'Optimize high-speed Python backend', icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' }
                ].map((item, i) => (
                  <button key={i} onClick={() => handleSend(item.q)} className="bg-[#0d0d1a]/80 backdrop-blur-xl border border-white/5 p-8 rounded-[2.5rem] text-left hover:border-blue-500/50 transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-20 transition-opacity">
                      <svg className="w-16 h-16 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} /></svg>
                    </div>
                    <span className="text-[13px] md:text-[16px] text-white font-black uppercase italic group-hover:text-blue-400 leading-tight block pr-8">{item.q}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-12 md:space-y-16">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === MessageRole.USER ? 'justify-end' : 'justify-start'}`}>
                <div className={`w-full ${m.role === MessageRole.USER ? 'max-w-[85%] md:max-w-[70%] ml-auto' : ''}`}>
                  {m.role === MessageRole.MODEL && (
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg border border-white/10">
                         <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                      </div>
                      <span className="text-[11px] font-black text-blue-500 uppercase tracking-[0.3em]">Azure Synthesis</span>
                    </div>
                  )}
                  <div className={`
                    px-6 md:px-10 py-6 md:py-8 rounded-[2rem] md:rounded-[3rem] transition-all duration-500 
                    ${m.role === MessageRole.USER 
                      ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-[0_20px_40px_rgba(37,99,235,0.2)]' 
                      : 'bg-[#0d0d1a]/95 border border-white/5 text-slate-200'
                    }
                  `}>
                    <div className="prose prose-invert max-w-none text-[15px] md:text-[18px] leading-relaxed font-medium">
                       {m.content.split('```').map((part, i) => {
                         if (i % 2 === 1) {
                           const lines = part.split('\n');
                           const lang = lines[0].trim();
                           const code = lines.slice(1).join('\n');
                           const codeId = `code-${m.id}-${i}`;
                           return (
                             <div key={i} className="my-10 md:my-12 border border-white/10 rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl bg-[#030307]">
                               <div className="flex items-center justify-between bg-white/5 px-6 md:px-10 py-3 md:py-4 border-b border-white/10">
                                 <div className="flex items-center gap-3">
                                   <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,1)]"></div>
                                   <span className="text-[10px] md:text-[12px] font-black text-slate-500 uppercase tracking-[0.4em]">{lang || 'BLUEPRINT'}</span>
                                 </div>
                                 <button 
                                   onClick={() => copyToClipboard(code, codeId)} 
                                   className="flex items-center gap-3 text-[10px] md:text-[11px] font-black uppercase text-blue-400 hover:text-white transition-all py-1.5 px-4 bg-blue-500/10 rounded-full border border-blue-500/20"
                                 >
                                   {copiedId === codeId ? 'SYNCHRONIZED' : 'COPY_STRUCTURE'}
                                 </button>
                               </div>
                               <pre className="p-8 md:p-12 overflow-x-auto text-cyan-300 font-mono text-[13px] md:text-base leading-relaxed custom-scrollbar whitespace-pre-wrap selection:bg-blue-500/30">
                                 {code}
                               </pre>
                             </div>
                           );
                         }
                         return <span key={i} className="whitespace-pre-wrap">{part}</span>;
                       })}
                    </div>
                    {m.groundingLinks && m.groundingLinks.length > 0 && (
                      <div className="mt-8 pt-6 border-t border-white/5">
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4 italic">Verification Nodes:</p>
                        <div className="flex flex-wrap gap-3">
                          {m.groundingLinks.map((link, idx) => (
                            <a key={idx} href={link.uri} target="_blank" rel="noopener noreferrer" className="px-3 py-1 bg-white/5 border border-white/5 rounded-full text-[10px] font-bold text-blue-500 hover:text-blue-400 uppercase tracking-tighter transition-all hover:border-blue-500/30">
                              {link.title}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center gap-4 p-6 bg-[#0d0d1a] border border-white/5 rounded-[2rem] w-fit animate-pulse shadow-2xl ml-2">
                 <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-ping"></div>
                 <span className="text-[11px] md:text-[13px] font-black text-slate-400 uppercase tracking-[0.3em] italic">Synthesizing Advanced Logic...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Persistent Workbench Overlay - Wide Format */}
      <div className="absolute bottom-6 md:bottom-12 left-0 right-0 px-4 md:px-0 z-30 pointer-events-none">
        <div className="max-w-[900px] xl:max-w-[1100px] mx-auto space-y-4 pointer-events-auto px-4 md:px-10">
          {isLoading && (
            <div className="flex justify-center mb-6">
              <button 
                onClick={stopResponse} 
                className="group flex items-center gap-3 px-10 py-3.5 bg-red-600/10 border border-red-600/30 text-red-500 rounded-full text-[11px] font-black uppercase tracking-[0.4em] hover:bg-red-600/20 transition-all shadow-2xl backdrop-blur-xl"
              >
                <div className="w-2 h-2 bg-red-500 rounded-sm group-hover:scale-125 transition-transform"></div>
                TERMINATE_PROCESS
              </button>
            </div>
          )}
          <div className="bg-[#0a0a14]/90 backdrop-blur-3xl rounded-[2.5rem] md:rounded-[4rem] border border-white/10 p-3 md:p-4 flex items-center gap-3 md:gap-6 shadow-[0_40px_100px_rgba(0,0,0,0.9)] focus-within:border-blue-500/50 transition-all border-b-blue-600/40 border-b-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Inject Demand / Logic Query..."
              className="flex-1 bg-transparent border-none text-slate-100 outline-none px-6 md:px-10 py-4 md:py-6 text-[16px] md:text-[20px] placeholder:text-slate-800 resize-none max-h-48 min-h-[56px] md:min-h-[80px] custom-scrollbar font-medium"
              rows={1}
            />
            <button 
              onClick={() => handleSend()} 
              disabled={!input.trim()}
              className="w-14 h-14 md:w-20 md:h-20 rounded-2xl md:rounded-[3rem] flex items-center justify-center bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 text-white shadow-[0_10px_30px_rgba(37,99,235,0.4)] hover:scale-105 active:scale-95 transition-all flex-shrink-0 disabled:opacity-50 group overflow-hidden"
            >
              <svg className="w-8 h-8 md:w-10 md:h-10 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 5l7 7-7 7" /></svg>
            </button>
          </div>
          <div className="flex justify-between px-10 md:px-16 mt-2">
             <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
                <span className="text-[10px] font-black text-slate-700 uppercase tracking-[0.4em] italic">AZURE CORE PROTOCOL</span>
             </div>
             <span className="text-[10px] font-black text-slate-700 uppercase tracking-[0.4em] italic leading-none">OS v4.7.5 HYPER</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
