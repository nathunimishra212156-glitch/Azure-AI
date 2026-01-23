
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
      onCommandExecuted("ARCH_SYNTH: " + architectPrompt.slice(0, 25));
    }

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: architectPrompt,
        config: {
          systemInstruction: `You are the Kshitiz Coders Neural Architect. 
          Respond to Kshitiz Mishra as 'Lead Architect'. You are managing Level 9 architectural protocols.`
        }
      });
      setArchitectResponse(response.text || 'Synthesis incomplete.');
    } catch (err) {
      setArchitectResponse('Error: Neural link unstable.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-8 md:p-12 animate-astral space-y-12 overflow-y-auto custom-scrollbar bg-[#000000]">
      <div className="space-y-4">
        <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(59,130,246,1)]"></div>
          <span className="text-[11px] font-black text-blue-400 uppercase tracking-[0.3em]">Architect Level 9 Active</span>
        </div>
        <h2 className="text-5xl font-extrabold text-white tracking-tighter uppercase italic">Update <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Deck</span></h2>
        <p className="text-slate-500 text-lg max-w-2xl font-medium">
          Lead Architect console for Kshitiz Mishra. Neural override enabled.
        </p>
      </div>

      <div className="bg-[#0a0a0a] rounded-[3rem] p-10 md:p-14 space-y-10 shadow-2xl border border-white/5">
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <label className="text-[11px] font-black text-slate-600 uppercase tracking-[0.4em]">Architect Input</label>
            <span className="text-[9px] font-mono text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20 uppercase tracking-widest">ENCRYPTED_LINK</span>
          </div>
          <textarea 
            value={architectPrompt}
            onChange={(e) => setArchitectPrompt(e.target.value)}
            className="w-full bg-[#111111] border border-white/5 rounded-[2rem] p-8 text-lg font-mono text-white focus:border-blue-500/40 outline-none transition-all h-64 resize-none placeholder:text-slate-800"
            placeholder="Command neural expansion..."
          />
          <button 
            onClick={handleArchitectQuery}
            disabled={isProcessing}
            className={`w-full py-6 rounded-full text-[12px] font-black uppercase tracking-[0.4em] transition-all ${isProcessing ? 'bg-slate-900 text-slate-700' : 'bg-white text-black hover:bg-slate-200 shadow-xl active:scale-[0.98]'}`}
          >
            {isProcessing ? 'Synthesizing...' : 'Execute Command'}
          </button>
        </div>

        {architectResponse && (
          <div className="pt-12 border-t border-white/5 animate-astral">
            <div className="flex items-center gap-4 mb-6 px-2">
              <svg className="w-6 h-6 text-blue-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" /></svg>
              <h4 className="text-[11px] font-black text-blue-400 uppercase tracking-[0.4em]">Neural Response</h4>
            </div>
            <div className="bg-black p-10 rounded-[2.5rem] border border-white/5 text-[15px] font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">
              {architectResponse}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
