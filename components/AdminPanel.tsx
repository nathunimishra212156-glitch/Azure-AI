
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
      onCommandExecuted("AZURE_ARCH: " + architectPrompt.slice(0, 35) + "...");
    }

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: architectPrompt,
        config: {
          systemInstruction: `You are the Azure AI Cosmic Architect. 
          Your mission is to expand the astral capabilities of the Azure AI platform. 
          Address the Operator as 'High Architect'. Use technical and cosmic metaphors.`
        }
      });
      const resText = response.text || 'Azure synthesis incomplete.';
      setArchitectResponse(resText);
    } catch (err) {
      setArchitectResponse('Error: Azure neural link unstable.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-10 animate-astral space-y-12 overflow-y-auto custom-scrollbar">
      <div className="space-y-4">
        <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
          <span className="text-[11px] font-black text-blue-400 uppercase tracking-[0.3em]">Azure Architect Level 9</span>
        </div>
        <h2 className="text-5xl font-extrabold text-white tracking-tighter uppercase italic">Azure <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Deck</span></h2>
        <p className="text-slate-400 text-lg max-w-2xl leading-relaxed font-medium">
          Override Azure neural parameters and expand the logic horizons.
        </p>
      </div>

      <div className="glass-panel rounded-[3rem] p-12 space-y-10 shadow-2xl relative overflow-hidden group border-white/10">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full pointer-events-none group-hover:bg-blue-600/20 transition-all duration-1000"></div>
        
        <div className="space-y-6 relative z-10">
          <div className="flex items-center justify-between px-2">
            <label className="text-[12px] font-black text-slate-500 uppercase tracking-[0.4em]">Modification Input</label>
            <div className="flex gap-4">
               <span className="text-[10px] font-mono text-blue-900 bg-blue-500/20 px-3 py-1 rounded-full border border-blue-500/20 uppercase tracking-widest">AZURE_READY</span>
            </div>
          </div>
          <textarea 
            value={architectPrompt}
            onChange={(e) => setArchitectPrompt(e.target.value)}
            className="w-full bg-black/40 border border-white/5 rounded-[2rem] p-10 text-lg font-mono text-blue-100 focus:border-blue-500/50 outline-none transition-all h-64 resize-none shadow-2xl placeholder:text-slate-800"
            placeholder="E.g., Design an Azure-themed logic gate..."
          />
          <button 
            onClick={handleArchitectQuery}
            disabled={isProcessing}
            className={`group relative w-full py-6 rounded-[1.5rem] text-[12px] font-black uppercase tracking-[0.4em] transition-all overflow-hidden ${isProcessing ? 'bg-slate-900 text-slate-700' : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-[0_20px_40px_rgba(37,99,235,0.3)] active:scale-[0.99]'}`}
          >
            <span className="relative z-10">{isProcessing ? 'Azure Syncing...' : 'Execute Azure Synthesis'}</span>
          </button>
        </div>

        {architectResponse && (
          <div className="pt-12 border-t border-white/5 animate-astral relative z-10">
            <div className="flex items-center gap-4 mb-8 px-2">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <h4 className="text-[12px] font-black text-blue-400 uppercase tracking-[0.4em]">Azure Blueprint Ready</h4>
            </div>
            <div className="bg-black/60 p-10 rounded-[2.5rem] border border-white/5 text-[15px] font-mono text-slate-300 whitespace-pre-wrap leading-relaxed shadow-inner">
              {architectResponse}
            </div>
          </div>
        )}
      </div>
      
      <div className="flex items-center justify-between px-8 py-6 glass-panel rounded-3xl border-white/5 shadow-2xl">
        <div className="flex gap-8">
          <div className="flex flex-col">
            <span className="text-[9px] text-slate-600 font-black uppercase tracking-widest mb-1">Architecture</span>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">AZURE GEN PRO</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] text-slate-600 font-black uppercase tracking-widest mb-1">Link</span>
            <span className="text-[11px] font-bold text-blue-500 uppercase tracking-widest italic">AZURE ACTIVE</span>
          </div>
        </div>
        <div className="text-[10px] font-black text-slate-700 uppercase tracking-[0.4em]">Azure AI OS v4.0.0</div>
      </div>
    </div>
  );
};

export default AdminPanel;
