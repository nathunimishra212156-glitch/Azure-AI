
import React, { useState } from 'react';
import { UserRole } from '../types';

const IdentityRegistryProtocol: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    authKey: '',
    role: 'Contributor' as UserRole
  });
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error', message: string }>({ type: 'idle', message: '' });

  const roles: UserRole[] = [
    'Senior Data Manager',
    'Junior Data Manager',
    'Contributor',
    'Master Guest',
    'VIP Guest'
  ];

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = formData.name.trim().toUpperCase();
    const cleanKey = formData.authKey.trim();

    if (!cleanName || !cleanKey) {
      setStatus({ type: 'error', message: 'Registry Fault: Incomplete Data' });
      return;
    }

    try {
      // Fetch latest users from persistence layer
      const existingUsers = JSON.parse(localStorage.getItem('nexus_registered_users') || '[]');
      
      // Prevent collisions with Owner and existing registered users
      if (cleanName === 'KSHITIZMISHRA' || existingUsers.some((u: any) => u.name.toUpperCase() === cleanName)) {
        setStatus({ type: 'error', message: 'Registry Fault: Identity Code Collision' });
        return;
      }

      const newUser = { 
        name: cleanName, 
        authKey: cleanKey, 
        role: formData.role,
        provisionDate: Date.now() 
      };
      
      const newUsers = [...existingUsers, newUser];
      
      // Persist to browser-based "Online" storage
      localStorage.setItem('nexus_registered_users', JSON.stringify(newUsers));
      
      setStatus({ type: 'success', message: 'Identity Provisioned and Synced' });
      setFormData({ name: '', authKey: '', role: 'Contributor' });
      
      // Reset status after delay
      setTimeout(() => setStatus({ type: 'idle', message: '' }), 4000);
    } catch (err) {
      setStatus({ type: 'error', message: 'Critical Storage Fault: Persistence Denied' });
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 md:p-10 animate-astral overflow-y-auto custom-scrollbar bg-[#05050d]">
      <div className="w-full max-w-2xl space-y-12 py-10">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-4">
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.8)]"></div>
            <span className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.3em]">Identity Provisioning Node</span>
          </div>
          <h2 className="text-6xl font-black text-white tracking-tighter uppercase leading-none italic">Registry.</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.4em] px-4">Persistent Authorisation Deployment</p>
        </div>

        <div className="bg-[#0d0d1a] rounded-[3.5rem] p-10 md:p-14 border border-white/5 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 pointer-events-none">
            <svg className="w-16 h-16 text-white/5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
            </svg>
          </div>

          <form onSubmit={handleRegister} className="space-y-10 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-3">Identity Code (ID)</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-[#161625] border border-white/5 rounded-2xl p-5 text-sm text-white focus:border-indigo-500/50 outline-none transition-all placeholder:text-slate-800 font-bold"
                  placeholder="NEW_ID_CODE"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-3">Auth Key (Pass)</label>
                <input 
                  type="password" 
                  value={formData.authKey}
                  onChange={e => setFormData({...formData, authKey: e.target.value})}
                  className="w-full bg-[#161625] border border-white/5 rounded-2xl p-5 text-sm text-white focus:border-indigo-500/50 outline-none transition-all placeholder:text-slate-800"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-3">Clearance Assignment</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {roles.map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setFormData({...formData, role: r})}
                    className={`px-4 py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest border transition-all ${formData.role === r ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-500/20' : 'bg-white/5 border-white/5 text-slate-500 hover:bg-white/10'}`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {status.type !== 'idle' && (
              <div className={`p-5 rounded-2xl text-center text-[10px] font-black uppercase tracking-widest animate-astral border ${status.type === 'success' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                {status.message}
              </div>
            )}

            <button 
              type="submit"
              className="w-full py-6 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.4em] text-white hover:opacity-90 transition-all shadow-2xl active:scale-[0.98]"
            >
              COMMIT TO REGISTRY
            </button>
          </form>
        </div>
        
        <div className="text-center">
          <p className="text-[9px] font-black text-slate-800 uppercase tracking-[0.3em]">All identity data is stored locally in your browser's persistent node.</p>
        </div>
      </div>
    </div>
  );
};

export default IdentityRegistryProtocol;
