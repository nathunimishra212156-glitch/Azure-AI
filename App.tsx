
import React, { useState, useEffect } from 'react';
import ChatInterface from './components/ChatInterface';
import AdminPanel from './components/AdminPanel';

const App: React.FC = () => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [currentUser, setCurrentUser] = useState<{name: string, role: string, isOwner: boolean} | null>(null);
  const [error, setError] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [chatKey, setChatKey] = useState(0); 
  const [activeTab, setActiveTab] = useState<'chat' | 'update'>('chat');
  
  const [history, setHistory] = useState<Array<{id: string, title: string, date: number}>>([]);

  useEffect(() => {
    const session = localStorage.getItem('kshitiz_session_active');
    const savedHistory = localStorage.getItem('kshitiz_history_registry');
    
    if (session) {
      try {
        const parsedUser = JSON.parse(session);
        setCurrentUser(parsedUser);
        setIsAuthorized(true);
      } catch (e) {
        localStorage.removeItem('kshitiz_session_active');
      }
    }
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const saveToHistory = (id: string, title: string) => {
    setHistory(prev => {
      const newHistory = [{ id, title, date: Date.now() }, ...prev].slice(0, 50);
      localStorage.setItem('kshitiz_history_registry', JSON.stringify(newHistory));
      return newHistory;
    });
  };

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const inputUser = username.toLowerCase().trim();
    const inputPass = password.trim();

    // Owner Access Updated: kshitizmishra / 9845189
    if (inputUser === 'kshitizmishra' && inputPass === '9845189') {
      const user = { name: 'Kshitiz Coder', role: 'Level 9 Architect', isOwner: true };
      setCurrentUser(user);
      setIsAuthorized(true);
      localStorage.setItem('kshitiz_session_active', JSON.stringify(user));
      return;
    }

    setError('ACCESS DENIED: Credentials mismatch.');
  };

  const handleGuestAccess = () => {
    const guestUser = { name: 'Guest User', role: 'Developer Access', isOwner: false };
    setCurrentUser(guestUser);
    setIsAuthorized(true);
    localStorage.setItem('kshitiz_session_active', JSON.stringify(guestUser));
  };

  const handleLogout = () => {
    localStorage.removeItem('kshitiz_session_active');
    setCurrentUser(null);
    setIsAuthorized(false);
    setIsSidebarOpen(false);
    setActiveTab('chat');
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-[#000000] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-black pointer-events-none"></div>
        <div className="w-full max-w-[360px] space-y-12 animate-astral relative z-10 text-center">
          <div className="space-y-4">
            <svg className="w-16 h-16 mx-auto text-blue-500 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
            </svg>
            <div className="space-y-1">
              <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Kshitiz <span className="text-blue-500">Coders</span></h1>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">Proprietary Workspace</p>
            </div>
          </div>
          <div className="space-y-4">
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              className="w-full bg-[#111111] border border-white/5 text-white rounded-2xl px-6 py-4 outline-none focus:ring-1 ring-blue-500/50 transition-all placeholder:text-slate-700 font-medium" 
              placeholder="Username" 
            />
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full bg-[#111111] border border-white/5 text-white rounded-2xl px-6 py-4 outline-none focus:ring-1 ring-blue-500/50 transition-all placeholder:text-slate-700 font-medium" 
              placeholder="Password" 
            />
            <button onClick={() => handleLogin()} className="w-full bg-blue-600 text-white font-black py-4 rounded-full shadow-2xl transition-all active:scale-95 uppercase tracking-widest text-xs mt-4 hover:bg-blue-500">Authorize Link</button>
            <button onClick={handleGuestAccess} className="w-full text-slate-500 font-bold py-2 text-[10px] uppercase tracking-widest hover:text-blue-400 transition-colors">Enter as Guest</button>
          </div>
          {error && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest px-4">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-[#000000] text-white overflow-hidden font-sans relative">
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[45]" onClick={() => setIsSidebarOpen(false)} />
      )}

      <aside className={`
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        transition-transform duration-400 cubic-bezier(0.16, 1, 0.3, 1) flex flex-col bg-[#0a0a0a] w-[300px] z-50 
        fixed top-0 bottom-0 left-0 overflow-hidden shadow-[20px_0_40px_rgba(0,0,0,0.8)] border-r border-white/5
      `}>
        <div className="p-8 flex-1 overflow-y-auto space-y-8">
           <div className="flex items-center gap-4 px-2 mb-10">
              <svg className="w-7 h-7 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
              </svg>
              <div className="leading-none">
                <span className="font-black text-xl tracking-tighter block">KSHITIZ</span>
                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Coders Node</span>
              </div>
           </div>

           <button onClick={() => { setActiveTab('chat'); setChatKey(k => k+1); setIsSidebarOpen(false); }} className="w-full flex items-center gap-4 px-6 py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all group">
              <svg className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
              New Project
           </button>

           <div className="space-y-2">
              <p className="px-4 text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] mb-4">Memory Registry</p>
              {history.length > 0 ? history.slice(0, 15).map(item => (
                <button key={item.id} className="w-full text-left px-4 py-3 rounded-xl text-[12px] font-bold text-slate-400 hover:bg-white/5 truncate transition-all flex items-center gap-3">
                   <div className="w-1.5 h-1.5 rounded-full bg-slate-800"></div>
                   {item.title}
                </button>
              )) : (
                <p className="px-4 text-[10px] text-slate-800 italic font-bold">Registry Empty</p>
              )}
           </div>
        </div>

        <div className="p-6 space-y-2 border-t border-white/5 bg-[#050505]">
           {currentUser?.isOwner && (
             <button onClick={() => { setActiveTab('update'); setIsSidebarOpen(false); }} className="w-full flex items-center gap-4 px-4 py-4 text-[11px] text-blue-400 hover:bg-blue-400/5 rounded-2xl transition-all font-black uppercase tracking-widest border border-blue-500/20 mb-4">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                Architect Deck
             </button>
           )}
           <div className="px-4 py-2">
              <p className="text-[8px] text-slate-600 uppercase font-black tracking-[0.5em] mb-2">User Rank</p>
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${currentUser?.isOwner ? 'bg-blue-500 animate-pulse' : 'bg-slate-600'}`}></div>
                <p className="text-[12px] font-black text-slate-300 uppercase truncate tracking-widest">{currentUser?.role}</p>
              </div>
           </div>
           <button onClick={handleLogout} className="w-full flex items-center gap-4 px-4 py-3 text-[10px] text-slate-600 font-black uppercase tracking-widest hover:text-red-500 transition-all mt-4">
              Sign out node
           </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative bg-[#000000]">
        <header className="px-6 py-4 flex items-center justify-between z-30 sticky top-0 bg-black/80 backdrop-blur-2xl border-b border-white/5">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-slate-400 hover:text-white transition-all">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <div className="flex flex-col">
              <span className="font-black text-sm tracking-tighter uppercase italic">Kshitiz <span className="text-blue-500">Coders</span></span>
              <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">v2.5 // Stable</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {currentUser?.isOwner && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest leading-none">Architect lvl 9</span>
              </div>
            )}
            <div className="w-10 h-10 rounded-2xl bg-[#111111] border border-white/10 flex items-center justify-center font-black text-blue-500 text-sm shadow-xl italic">
              {currentUser?.name[0]}
            </div>
          </div>
        </header>

        <div className="flex-1 relative overflow-hidden">
          {activeTab === 'chat' ? (
            <ChatInterface 
              key={chatKey} 
              onMessageSent={(t) => saveToHistory(Date.now().toString(), t)} 
              currentUser={currentUser} 
            />
          ) : (
            <AdminPanel onCommandExecuted={(t) => saveToHistory(Date.now().toString(), t)} />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
