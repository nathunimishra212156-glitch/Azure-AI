
import React, { useState, useEffect } from 'react';
import ChatInterface from './components/ChatInterface';
import IdentityRegistryProtocol from './components/IdentityRegistryProtocol';
import AdminPanel from './components/AdminPanel';

const App: React.FC = () => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [currentUser, setCurrentUser] = useState<{name: string, role: string, authKey?: string} | null>(null);
  const [error, setError] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [chatKey, setChatKey] = useState(0); 
  const [activeTab, setActiveTab] = useState<'chat' | 'register' | 'update'>('chat');
  
  const [history, setHistory] = useState<Array<{id: string, title: string, date: number, type: 'chat' | 'cmd'}>>([]);

  const appUpdates = [
    { version: 'v4.6.0', date: '2025-05-20', detail: 'Stop Response logic & Guest Protocol v2 enabled' },
    { version: 'v4.5.2', date: '2025-05-15', detail: 'Google Grounding optimized for Kshitiz Coder Nodes' },
    { version: 'v4.5.0', date: '2025-05-10', detail: 'Full multi-language coding support integrated' }
  ];

  useEffect(() => {
    const session = localStorage.getItem('azure_session_active');
    const savedHistory = localStorage.getItem('azure_history_registry');
    
    if (session) {
      try {
        const parsedUser = JSON.parse(session);
        setCurrentUser(parsedUser);
        setIsAuthorized(true);
      } catch (e) {
        localStorage.removeItem('azure_session_active');
      }
    }
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const saveToRegistry = (id: string, title: string, type: 'chat' | 'cmd') => {
    setHistory(prev => {
      const newHistory = [{ id, title, date: Date.now(), type }, ...prev].slice(0, 50);
      localStorage.setItem('azure_history_registry', JSON.stringify(newHistory));
      return newHistory;
    });
  };

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const inputUser = username.toLowerCase().trim();
    const inputPass = password.trim();

    if (inputUser === 'kshitizmishra' && inputPass === '9845189548') {
      const user = { name: 'KSHITIZ MISHRA', role: 'ROOT', authKey: '9845189548' };
      setCurrentUser(user);
      setIsAuthorized(true);
      localStorage.setItem('azure_session_active', JSON.stringify(user));
      return;
    }

    const registeredUsers = JSON.parse(localStorage.getItem('nexus_registered_users') || '[]');
    const foundUser = registeredUsers.find((u: any) => u.name.toLowerCase() === inputUser && u.authKey === inputPass);
    
    if (foundUser) {
      setCurrentUser(foundUser);
      setIsAuthorized(true);
      localStorage.setItem('azure_session_active', JSON.stringify(foundUser));
    } else {
      setError('AUTH_ERROR: ACCESS DENIED');
    }
  };

  const handleGuestAccess = () => {
    const guestUser = { name: 'GUEST_OPERATOR', role: 'VIP Guest', authKey: 'GUEST_MODE' };
    setCurrentUser(guestUser);
    setIsAuthorized(true);
    localStorage.setItem('azure_session_active', JSON.stringify(guestUser));
  };

  const handleLogout = () => {
    localStorage.removeItem('azure_session_active');
    setCurrentUser(null);
    setIsAuthorized(false);
    setActiveTab('chat');
    setUsername('');
    setPassword('');
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#05050d] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-600/10 via-transparent to-black pointer-events-none"></div>
        <div className="w-full max-w-sm space-y-10 animate-astral relative z-10">
          <div className="text-center space-y-4">
            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-cyan-400 to-indigo-600 rounded-[2.5rem] flex items-center justify-center shadow-[0_0_50px_rgba(37,99,235,0.3)] border border-white/10">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <div>
              <h1 className="text-5xl font-black text-white italic tracking-tighter uppercase leading-none">AZURE.</h1>
              <p className="text-blue-500 text-[9px] font-black uppercase tracking-[0.6em] mt-1">Kshitiz Mishra Labs</p>
            </div>
          </div>
          <div className="bg-[#0d0d1a]/90 backdrop-blur-3xl p-8 rounded-[3rem] space-y-6 border border-white/5 shadow-2xl">
            <div className="space-y-4">
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-[#161625] border border-white/5 text-white rounded-2xl px-6 py-4 outline-none focus:border-blue-500/50 text-sm font-bold" placeholder="USERNAME" />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-[#161625] border border-white/5 text-white rounded-2xl px-6 py-4 outline-none focus:border-blue-500/50 text-sm font-bold" placeholder="AUTH KEY" />
            </div>
            <div className="space-y-3">
              <button onClick={() => handleLogin()} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-[12px] uppercase tracking-widest py-4.5 rounded-2xl shadow-xl transition-transform active:scale-95">INITIALIZE_SESSION</button>
              <button onClick={handleGuestAccess} className="w-full bg-white/5 hover:bg-white/10 text-slate-500 font-black text-[10px] uppercase tracking-widest py-3.5 rounded-2xl border border-white/5 transition-all">GUEST_PROTOCOL</button>
            </div>
            {error && <p className="text-red-500/80 text-[8px] font-black text-center uppercase tracking-widest mt-2">{error}</p>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-[#05050d] text-[#e3e3e3] overflow-hidden font-sans">
      <aside className={`${isSidebarOpen ? 'w-[320px]' : 'w-0'} transition-all duration-500 flex flex-col bg-[#05050d] border-r border-white/5 z-40 overflow-hidden`}>
        <div className="p-8 space-y-8 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <div className="flex flex-col">
              <span className="text-[14px] font-black uppercase tracking-widest italic text-white leading-none">KSHITIZ.CORE</span>
              <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest mt-1">ONLINE_SYNC_ACTIVE</span>
            </div>
          </div>
          <button onClick={() => { setActiveTab('chat'); setChatKey(k => k+1); }} className="w-full py-4 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl text-[11px] font-black uppercase tracking-widest text-white transition-all shadow-xl active:scale-[0.98] border border-white/10">NEW SYNTHESIS</button>
          <nav className="space-y-1.5">
            {[
              { id: 'chat', label: 'WORKBENCH', icon: 'M4 6h16M4 12h16M4 18h16' },
              { id: 'register', label: 'REGISTRY', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197' },
              { id: 'update', label: 'SYSTEM_UP', icon: 'M13 10V3L4 14h7v7l9-11h-7z' }
            ].map((nav) => (
              (currentUser?.role === 'ROOT' || nav.id === 'chat') && (
                <button key={nav.id} onClick={() => setActiveTab(nav.id as any)} className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === nav.id ? 'bg-white/5 text-blue-400 border border-white/5' : 'text-slate-600 hover:bg-white/5'}`}>
                  <svg className={`w-4 h-4 ${activeTab === nav.id ? 'text-blue-500' : 'text-slate-700'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={nav.icon} /></svg>
                  {nav.label}
                </button>
              )
            ))}
          </nav>
        </div>
        
        <div className="flex-1 overflow-y-auto px-8 py-2 custom-scrollbar">
          <div className="mb-8">
            <p className="text-[8px] font-black text-blue-500/50 uppercase tracking-[0.4em] mb-4 border-b border-white/5 pb-2">APP_UPDATES_LOG</p>
            <div className="space-y-3">
              {appUpdates.map((update, idx) => (
                <div key={idx} className="p-3 bg-white/5 rounded-xl border border-white/5 group hover:border-blue-500/30 transition-all cursor-default">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[9px] font-black text-white">{update.version}</span>
                    <span className="text-[7px] font-bold text-slate-600">{update.date}</span>
                  </div>
                  <p className="text-[8px] text-slate-400 leading-tight uppercase font-medium">{update.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-[8px] font-black text-slate-800 uppercase tracking-[0.4em] mb-4 border-b border-white/5 pb-2">DATA_HISTORY</p>
          <div className="space-y-1.5">
            {history.map(item => (
              <button key={item.id} className="w-full text-left py-2 px-3 rounded-lg text-[10px] text-slate-600 hover:text-white truncate transition-all font-bold uppercase italic hover:bg-white/5">
                {item.title}
              </button>
            ))}
          </div>
        </div>
        
        <div className="p-8 space-y-4 border-t border-white/5">
          <div className="flex items-center gap-4 bg-[#0a0a14] p-4 rounded-2xl border border-white/5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-700 flex items-center justify-center font-black text-sm text-white">{currentUser?.name[0]}</div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-black truncate text-white uppercase tracking-tighter">{currentUser?.name}</p>
              <p className="text-[8px] font-bold text-blue-500 uppercase tracking-widest">{currentUser?.role}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full py-3.5 bg-white/5 hover:bg-red-500/10 text-slate-600 hover:text-red-400 border border-white/5 hover:border-red-500/20 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] transition-all">TERMINATE_SESSION</button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative overflow-hidden bg-[#05050d]">
        <header className="px-8 py-6 flex items-center justify-between z-30">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-3 bg-[#0d0d1a] rounded-xl text-slate-500 hover:text-white border border-white/10 transition-all">
            <svg className={`w-5 h-5 transform transition-transform ${!isSidebarOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
          </button>
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
              <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.6em] italic leading-none">KSHITIZ_CODER_NETWORK</span>
              <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest mt-1">UPLINK_STABLE</span>
            </div>
            <div className="w-8 h-8 rounded-full border border-white/5 flex items-center justify-center relative overflow-hidden">
               <div className="absolute inset-0 bg-blue-500/5 animate-pulse"></div>
               <div className="w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
            </div>
          </div>
        </header>
        <div className="flex-1 relative">
          {activeTab === 'chat' && <ChatInterface key={chatKey} onMessageSent={(t) => saveToRegistry(Date.now().toString(), t, 'chat')} currentUser={currentUser} />}
          {activeTab === 'register' && <IdentityRegistryProtocol />}
          {activeTab === 'update' && <AdminPanel onCommandExecuted={(t) => saveToRegistry(Date.now().toString(), t, 'cmd')} />}
        </div>
      </main>
    </div>
  );
};

export default App;
