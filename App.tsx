
import React, { useState, useEffect } from 'react';
import ChatInterface from './components/ChatInterface';
import IdentityRegistryProtocol from './components/IdentityRegistryProtocol';

const App: React.FC = () => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [currentUser, setCurrentUser] = useState<{name: string, role: string, authKey?: string} | null>(null);
  const [error, setError] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [chatKey, setChatKey] = useState(0); 
  const [activeTab, setActiveTab] = useState<'chat' | 'register'>('chat');
  
  const [history, setHistory] = useState<Array<{id: string, title: string, date: number, type: 'chat' | 'cmd'}>>([]);

  useEffect(() => {
    const session = localStorage.getItem('nexus_ai_session');
    const savedHistory = localStorage.getItem('nexus_unified_history');
    
    if (session) {
      const userData = JSON.parse(session);
      setCurrentUser(userData);
      setIsAuthorized(true);
    }
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const saveToRegistry = (id: string, title: string, type: 'chat' | 'cmd') => {
    setHistory(prev => {
      const newItem = { id, title, date: Date.now(), type };
      const newHistory = [newItem, ...prev].slice(0, 100);
      localStorage.setItem('nexus_unified_history', JSON.stringify(newHistory));
      return newHistory;
    });
  };

  const startNewChat = () => {
    setActiveTab('chat');
    setChatKey(prev => prev + 1); 
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check Master Admin
    if (username === 'kshitizmishra' && password === '9845189548') {
      const user = { name: 'Kshitiz Mishra', role: 'Administration', authKey: '9845189548' };
      setCurrentUser(user);
      setIsAuthorized(true);
      localStorage.setItem('nexus_ai_session', JSON.stringify(user));
      return;
    }

    // Check Registered Users
    const registeredUsers = JSON.parse(localStorage.getItem('nexus_registered_users') || '[]');
    const foundUser = registeredUsers.find((u: any) => u.name === username && u.authKey === password);

    if (foundUser) {
      setCurrentUser(foundUser);
      setIsAuthorized(true);
      localStorage.setItem('nexus_ai_session', JSON.stringify(foundUser));
    } else {
      setError('Access Denied: Neural pattern mismatch');
    }
  };

  const handleGuestLogin = () => {
    const guestId = Math.floor(1000 + Math.random() * 9000);
    const guest = { name: `Voyager_${guestId}`, role: 'Master Guest', authKey: 'GUEST_MODE' };
    setCurrentUser(guest);
    setIsAuthorized(true);
    localStorage.setItem('nexus_ai_session', JSON.stringify(guest));
  };

  const handleLogout = () => {
    localStorage.removeItem('nexus_ai_session');
    setIsAuthorized(false);
    setCurrentUser(null);
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-black relative overflow-hidden">
        <div className="w-full max-w-md space-y-8 animate-astral relative z-10">
          <div className="text-center space-y-6">
            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl flex items-center justify-center shadow-[0_0_50px_rgba(79,70,229,0.3)]">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl font-extrabold tracking-tighter text-white">NEXUS AI</h1>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.4em]">Laboratory Access Terminal</p>
            </div>
          </div>
          
          <div className="glass-panel p-8 rounded-[2.5rem] space-y-6 border-white/5 shadow-2xl bg-[#0a0a0f]/80 backdrop-blur-3xl">
            <form onSubmit={handleLogin} className="space-y-4">
              <input 
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                className="w-full bg-[#11111a] border border-white/5 text-white rounded-2xl p-5 focus:border-indigo-500/50 outline-none transition-all placeholder:text-slate-700 text-sm" 
                placeholder="Identity Code" 
              />
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full bg-[#11111a] border border-white/5 text-white rounded-2xl p-5 focus:border-indigo-500/50 outline-none transition-all placeholder:text-slate-700 text-sm" 
                placeholder="Laboratory Auth Key" 
              />
              {error && <p className="text-red-400 text-[10px] font-bold uppercase text-center">{error}</p>}
              <button type="submit" className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white font-bold text-sm uppercase tracking-widest py-5 rounded-2xl transition-all shadow-xl active:scale-[0.98]">
                Authorize Access
              </button>
            </form>
            <div className="relative text-center py-1"><span className="text-[10px] text-slate-700 font-bold uppercase tracking-widest">OR</span></div>
            <button onClick={handleGuestLogin} className="w-full bg-white/5 border border-white/5 py-4 rounded-2xl text-slate-500 text-[11px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all">Enter as Master Guest</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-transparent text-[#e3e3e3] overflow-hidden">
      <aside className={`transition-all duration-500 flex flex-col bg-[#050508]/95 backdrop-blur-3xl border-r border-white/5 z-30 ${isSidebarOpen ? 'w-[320px]' : 'w-0 opacity-0 overflow-hidden'}`}>
        <div className="p-6 pt-10 space-y-4">
          <button onClick={startNewChat} className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-[#11111a] hover:bg-[#1a1a25] rounded-2xl text-sm font-bold transition-all border border-indigo-500/20 text-indigo-400 shadow-xl">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            <span>New Chat</span>
          </button>
          
          <button className="w-full flex items-center justify-between px-6 py-4 bg-purple-600/5 hover:bg-purple-600/10 rounded-2xl border border-purple-500/10 group transition-all">
            <div className="flex items-center gap-3">
               <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
               <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">AI for Update</span>
            </div>
            <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 14l-7 7-7-7" /></svg>
          </button>

          <div className="mt-4 p-5 bg-[#0a0a0f] rounded-3xl border border-white/5 shadow-2xl space-y-4">
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-md font-bold text-white shadow-lg">
                  {currentUser?.name[0]}
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="text-[12px] font-black text-white truncate uppercase tracking-widest">Identity Registry</div>
                  <div className="text-[8px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-0.5">Neural Access Verified</div>
                </div>
             </div>
             
             <div className="space-y-2.5 pt-2">
                <div className="flex flex-col gap-1">
                   <span className="text-[8px] text-slate-600 font-black uppercase tracking-widest">Identity Code</span>
                   <div className="px-3 py-2 bg-white/5 rounded-lg border border-white/5 text-[11px] font-mono text-slate-300 truncate">{currentUser?.name}</div>
                </div>
                <div className="flex flex-col gap-1">
                   <span className="text-[8px] text-slate-600 font-black uppercase tracking-widest">Auth Key</span>
                   <div className="px-3 py-2 bg-white/5 rounded-lg border border-white/5 text-[11px] font-mono text-slate-400 truncate tracking-tighter">••••••••{currentUser?.authKey?.slice(-2)}</div>
                </div>
                <div className="flex flex-col gap-1">
                   <span className="text-[8px] text-slate-600 font-black uppercase tracking-widest">Sector Rank</span>
                   <div className="px-3 py-2 bg-indigo-500/10 rounded-lg border border-indigo-500/10 text-[10px] font-black text-indigo-400 uppercase tracking-widest">{currentUser?.role}</div>
                </div>
             </div>
          </div>

          {currentUser?.role === 'Administration' && (
            <button 
              onClick={() => setActiveTab('register')}
              className={`w-full flex items-center gap-3 px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${activeTab === 'register' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
              Register Account
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-4 space-y-8 mt-4">
          <div>
            <h3 className="px-2 text-[10px] font-black text-slate-800 uppercase tracking-widest mb-6">Uplink Logs</h3>
            <div className="space-y-2">
              {history.length > 0 ? history.map(item => (
                <button key={item.id} onClick={() => { setActiveTab('chat'); setChatKey(prev => prev + 1); }} className="w-full text-left px-4 py-3 rounded-xl text-[13px] text-slate-700 hover:bg-white/5 hover:text-white truncate transition-all">
                  {item.title}
                </button>
              )) : (
                <div className="px-4 py-10 text-center border border-dashed border-white/5 rounded-2xl opacity-10">
                   <p className="text-[10px] uppercase font-bold tracking-widest">No Logs Detected</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 mt-auto">
          <button onClick={handleLogout} className="w-full py-4 text-red-500/40 hover:text-red-400 text-[10px] font-black uppercase tracking-[0.3em] transition-all hover:bg-red-500/5 rounded-2xl border border-red-500/5">
            Terminate Link
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative overflow-hidden bg-transparent">
        <header className="px-8 py-6 flex items-center justify-between z-20 backdrop-blur-sm border-b border-white/5">
          <div className="flex items-center gap-8">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5 text-slate-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <span className="text-xs font-black text-white uppercase tracking-[0.5em] opacity-80">Nexus AI Laboratory</span>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Neural Link Active</span>
          </div>
        </header>

        <div className="flex-1 overflow-hidden relative">
          {activeTab === 'chat' ? (
            <ChatInterface key={chatKey} currentUser={currentUser} onMessageSent={(title) => saveToRegistry(Date.now().toString(), title, 'chat')} />
          ) : (
            <IdentityRegistryProtocol />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
