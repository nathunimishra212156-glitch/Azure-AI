
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Message, MessageRole } from '../types';
import { chatWithSearch } from '../services/geminiService';

interface ChatInterfaceProps {
  onMessageSent?: (title: string) => void;
  currentUser?: { name: string, role: string, isOwner: boolean } | null;
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
    // Advanced clipboard logic for iOS compatibility
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
      });
    } else {
      // Fallback for older iOS
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      textArea.style.top = "0";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
      } catch (err) {
        console.error('Fallback copy failed', err);
      }
      document.body.removeChild(textArea);
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
        content: "Neural link disrupted. Verify credentials or API key.", 
        timestamp: Date.now() 
      }]);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  return (
    <div className="flex flex-col h-full relative bg-[#000000]">
      <div 
        ref={scrollRef} 
        className="flex-1 overflow-y-auto px-4 md:px-8 py-4 space-y-12 custom-scrollbar pb-48"
      >
        {messages.length === 0 && (
          <div className="max-w-2xl mx-auto pt-20 space-y-12 animate-astral">
            <div className="space-y-4">
              <h1 className="text-5xl font-black tracking-tighter leading-none italic">
                {currentUser?.isOwner ? 'WELCOME BACK, ' : 'HELLO, '} 
                <span className="text-blue-500">
                  {currentUser?.name === 'Kshitiz Coder' ? 'ARCHITECT' : 'DEVELOPER'}
                </span>
              </h1>
              <p className="text-xl font-bold text-slate-500 uppercase tracking-widest max-w-lg">
                Ready to architect professional-grade software systems?
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                'Refactor React Architecture',
                'C# Microservices Design',
                'Advanced CSS Grid Engine',
                'Python API Optimization'
              ].map((q, i) => (
                <button 
                  key={i} 
                  onClick={() => handleSend(q)} 
                  className="bg-[#0a0a0a] hover:bg-[#111111] p-6 rounded-3xl text-[12px] font-black uppercase tracking-widest text-slate-400 transition-all border border-white/5 text-left group shadow-xl"
                >
                  <span className="text-blue-500 mr-2 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="max-w-3xl mx-auto w-full space-y-12">
          {messages.map((m) => (
            <div key={m.id} className="animate-astral">
              <div className={`flex gap-5 w-full ${m.role === MessageRole.USER ? 'flex-row-reverse' : ''}`}>
                <div className="shrink-0 pt-1">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-[10px] shadow-2xl border ${m.role === MessageRole.USER ? 'bg-indigo-600 border-indigo-400' : 'bg-[#111111] border-white/10 text-blue-500 italic'}`}>
                    {m.role === MessageRole.USER ? currentUser?.name[0] : 'KC'}
                  </div>
                </div>
                <div className={`flex-1 min-w-0 ${m.role === MessageRole.USER ? 'flex justify-end' : ''}`}>
                  <div className={`
                    max-w-full prose prose-invert prose-p:leading-relaxed text-[15px] md:text-[16px] text-slate-300 font-medium
                    ${m.role === MessageRole.USER ? 'bg-[#111111] px-6 py-4 rounded-3xl inline-block border border-white/5 shadow-xl text-slate-200' : ''}
                  `}>
                    {m.content.split('```').map((part, i) => {
                      if (i % 2 === 1) {
                        const lines = part.split('\n');
                        const lang = lines[0].trim();
                        const code = lines.slice(1).join('\n').trim();
                        const codeId = `code-${m.id}-${i}`;
                        return (
                          <div key={i} className="my-8 border border-white/10 rounded-3xl overflow-hidden bg-[#050505] shadow-[0_20px_50px_rgba(0,0,0,0.5)] group">
                            <div className="flex items-center justify-between bg-white/5 px-6 py-3 border-b border-white/5">
                              <div className="flex items-center gap-3">
                                <div className="flex gap-1.5">
                                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/20"></div>
                                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20"></div>
                                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/20"></div>
                                </div>
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">{lang || 'CODE'}</span>
                              </div>
                              <button 
                                onClick={() => copyToClipboard(code, codeId)} 
                                className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full transition-all ${copiedId === codeId ? 'bg-green-500/10 text-green-400' : 'bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white'}`}
                              >
                                {copiedId === codeId ? (
                                  <>
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                    SYNCED
                                  </>
                                ) : (
                                  <>
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                                    COPY CODE
                                  </>
                                )}
                              </button>
                            </div>
                            <pre className="p-8 overflow-x-auto text-blue-200 font-mono text-sm leading-relaxed custom-scrollbar whitespace-pre-wrap select-all bg-black/40" style={{ fontFamily: '"JetBrains Mono", monospace' }}>{code}</pre>
                          </div>
                        );
                      }
                      return <span key={i} className="whitespace-pre-wrap">{part}</span>;
                    })}
                  </div>
                  {m.groundingLinks && m.groundingLinks.length > 0 && (
                    <div className="mt-8 flex flex-wrap gap-2">
                      {m.groundingLinks.map((link, idx) => (
                        <a key={idx} href={link.uri} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 bg-[#0a0a0a] border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-blue-400 hover:bg-blue-500/10 transition-all flex items-center gap-2">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                          {link.title}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center gap-2 ml-14 py-4">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              <span className="text-[10px] font-black text-slate-700 uppercase tracking-[0.3em] ml-2">Neural Synthesis...</span>
            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-30 px-4 md:px-8 pb-10 bg-gradient-to-t from-black via-black/95 to-transparent pt-20">
        <div className="max-w-3xl mx-auto relative">
          <div className="bg-[#0a0a0a] rounded-[3rem] p-2 flex items-center gap-2 shadow-[0_30px_60px_rgba(0,0,0,1)] border border-white/5 focus-within:border-blue-500/40 transition-all group">
            <button className="p-4 text-slate-600 hover:text-blue-500 transition-all shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
            </button>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Deploy code query..."
              className="flex-1 bg-transparent border-none text-white outline-none px-4 py-4 text-[16px] font-medium placeholder:text-slate-700 resize-none max-h-48 min-h-[56px] custom-scrollbar"
              rows={1}
            />
            <button 
              onClick={() => handleSend()} 
              disabled={!input.trim() || isLoading}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${!input.trim() || isLoading ? 'bg-[#111111] text-slate-800' : 'bg-blue-600 text-white shadow-[0_0_30px_rgba(59,130,246,0.4)] active:scale-95'}`}
            >
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
            </button>
          </div>
          <div className="flex justify-center gap-6 mt-6">
            <p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.5em]">Kshitiz Coders v2.5</p>
            <p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.5em]">•</p>
            <p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.5em]">Proprietary Workspace</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
