
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";

interface AdminPanelProps {
  onCommandExecuted?: (title: string) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onCommandExecuted }) => {
  const [architectPrompt, setArchitectPrompt] = useState('');
  const [architectResponse, setArchitectResponse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleArchitectQuery = async () => {
    if (!architectPrompt.trim()) return;
    setIsProcessing(true);
    
    if (onCommandExecuted) {
      onCommandExecuted("ARCH: " + architectPrompt.slice(0, 35) + "...");
    }

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: architectPrompt,
        config: {
          systemInstruction: `You are the Nexus AI Cosmic Architect. 
          Your mission is to expand the astral capabilities of the Nexus AI platform. 
          Provide technical blueprints, React architecture updates, and deep-space UI enhancements.
          Address the Operator as 'High Architect'. Use cosmic metaphors occasionally.`
        }
      });
      const resText = response.text || 'Synthesis incomplete.';
      setArchitectResponse(resText);
    } catch (err) {
      setArchitectResponse('Error: Neural link unstable. Re-sync in next sector.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-10 animate-astral space-y-12 overflow-y-auto custom-scrollbar">
      <div className="space-y-4">
        <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-full">
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(168,85,247,0.8)]"></div>
          <span className="text-[11px] font-black text-purple-400 uppercase tracking-[0.3em]">Architect Access Level 9</span>
        </div>
        <h2 className="text-5xl font-extrabold text-white tracking-tighter">Command <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Deck</span></h2>
        <p className="text-slate-400 text-lg max-w-2xl leading-relaxed font-medium">
          Override neural parameters and expand the Nexus horizons. Inject structural modifications directly into the core engine.
        </p>
      </div>

      <div className="glass-panel rounded-[3rem] p-12 space-y-10 shadow-2xl relative overflow-hidden group border-white/10">
        {/* Animated background glow */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-600/10 blur-[120px] rounded-full pointer-events-none group-hover:bg-purple-600/20 transition-all duration-1000"></div>
        
        <div className="space-y-6 relative z-10">
          <div className="flex items-center justify-between px-2">
            <label className="text-[12px] font-black text-slate-500 uppercase tracking-[0.4em]">Modification Input</label>
            <div className="flex gap-4">
               <span className="text-[10px] font-mono text-purple-900 bg-purple-500/20 px-3 py-1 rounded-full border border-purple-500/20">ROOT_READY</span>
            </div>
          </div>
          <textarea 
            value={architectPrompt}
            onChange={(e) => setArchitectPrompt(e.target.value)}
            className="w-full bg-black/40 border border-white/5 rounded-[2rem] p-10 text-lg font-mono text-purple-100 focus:border-purple-500/50 outline-none transition-all h-64 resize-none shadow-2xl placeholder:text-slate-800"
            placeholder="E.g., Design a pulsar-themed analytics dashboard..."
          />
          <button 
            onClick={handleArchitectQuery}
            disabled={isProcessing}
            className={`group relative w-full py-6 rounded-[1.5rem] text-[12px] font-black uppercase tracking-[0.4em] transition-all overflow-hidden ${isProcessing ? 'bg-slate-900 text-slate-700' : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-[0_20px_40px_rgba(139,92,246,0.3)] active:scale-[0.99]'}`}
          >
            <span className="relative z-10">{isProcessing ? 'Synchronizing Neural Paths...' : 'Execute Structural Synthesis'}</span>
            {!isProcessing && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>}
          </button>
        </div>

        {architectResponse && (
          <div className="pt-12 border-t border-white/5 animate-astral relative z-10">
            <div className="flex items-center gap-4 mb-8 px-2">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.2)]">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <h4 className="text-[12px] font-black text-purple-400 uppercase tracking-[0.4em]">Blueprint Synchronized</h4>
            </div>
            <div className="bg-black/60 p-10 rounded-[2.5rem] border border-white/5 text-[15px] font-mono text-slate-300 whitespace-pre-wrap leading-relaxed shadow-inner">
              <span className="text-purple-500/40 select-none mr-2">>>> </span>
              {architectResponse}
            </div>
          </div>
        )}
      </div>
      
      <div className="flex items-center justify-between px-8 py-6 glass-panel rounded-3xl border-white/5 shadow-2xl">
        <div className="flex gap-8">
          <div className="flex flex-col">
            <span className="text-[9px] text-slate-600 font-black uppercase tracking-widest mb-1">Architecture Model</span>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">GEMINI PRO ARCHITECT 3.0</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] text-slate-600 font-black uppercase tracking-widest mb-1">Sector Link</span>
            <span className="text-[11px] font-bold text-blue-500 uppercase tracking-widest">ACTIVE // DEEP SPACE</span>
          </div>
        </div>
        <div className="text-[10px] font-black text-slate-700 uppercase tracking-[0.4em]">Nexus Core OS v3.1.0_STABLE</div>
      </div>
    </div>
  );
};

export default AdminPanel;
