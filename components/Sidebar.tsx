
import React, { useState, useRef } from 'react';
import { Home, Users, Wallet, Megaphone, AlertCircle, Menu, X, Camera, Pencil, Check, UserCog, User, Lock, KeyRound, FileText } from 'lucide-react';
import { UserRole } from '../App';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  profileName: string;
  setProfileName: (name: string) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  isOpen, 
  setIsOpen, 
  profileName, 
  setProfileName,
  userRole,
  setUserRole
}) => {
  const [profileImage, setProfileImage] = useState("https://images.unsplash.com/photo-1593113598332-cd288d649433?w=150&h=150&fit=crop&q=80");
  const [isEditingName, setIsEditingName] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'residents', label: 'Data Warga', icon: Users },
    { id: 'financials', label: 'Kas RT', icon: Wallet },
    { id: 'announcements', label: 'Pengumuman', icon: Megaphone },
    { id: 'reports', label: 'Laporan Warga', icon: AlertCircle },
    { id: 'letters', label: 'Surat Pengantar', icon: FileText },
  ];

  const handleImageClick = () => { if (userRole === 'RT') fileInputRef.current?.click(); };
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfileImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const startEditingName = () => {
    if (userRole === 'RT') {
      setIsEditingName(true);
      setTimeout(() => nameInputRef.current?.focus(), 100);
    }
  };

  const handleRoleSwitchRequest = (role: UserRole) => {
    if (role === 'RT' && userRole !== 'RT') {
      setIsLoginModalOpen(true);
      setPasswordInput('');
      setLoginError('');
    } else {
      setUserRole(role);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === '230917') {
      setUserRole('RT');
      setIsLoginModalOpen(false);
    } else {
      setLoginError('Kata sandi salah!');
    }
  };

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setIsOpen(false)} />}
      <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:h-screen ${isOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">RT</div>
            <span className="text-xl font-bold text-slate-800 tracking-tight">SmartRT</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="md:hidden text-slate-500"><X size={24} /></button>
        </div>

        <div className="px-4 py-4 border-b border-slate-100 bg-slate-50">
          <p className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest">Akses Pengguna</p>
          <div className="flex bg-white rounded-lg p-1 border border-slate-200 shadow-sm">
            <button onClick={() => handleRoleSwitchRequest('RT')} className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded transition-all ${userRole === 'RT' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>
              {userRole === 'RT' ? <UserCog size={14} /> : <Lock size={14} />} Pak RT
            </button>
            <button onClick={() => handleRoleSwitchRequest('WARGA')} className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded transition-all ${userRole === 'WARGA' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>
              <User size={14} /> Warga
            </button>
          </div>
        </div>

        <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button key={item.id} onClick={() => { setActiveTab(item.id); setIsOpen(false); }} className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl transition-all ${isActive ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
                <Icon size={20} className={`mr-3 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className={`relative group flex-shrink-0 ${userRole === 'RT' ? 'cursor-pointer' : ''}`} onClick={handleImageClick}>
              <img src={profileImage} alt="Profile" className="w-10 h-10 rounded-full bg-slate-200 object-cover border-2 border-slate-100 shadow-sm" />
              {userRole === 'RT' && <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 rounded-full"><Camera size={14} className="text-white" /></div>}
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800 truncate cursor-pointer hover:text-blue-600 transition-colors" onClick={startEditingName}>{profileName}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase">RT 03 / RW 03</p>
            </div>
          </div>
        </div>
      </div>

      {isLoginModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-blue-600"></div>
            <button onClick={() => setIsLoginModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={20} /></button>
            <div className="flex flex-col items-center mb-6">
              <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-4 shadow-inner"><Lock size={28} /></div>
              <h3 className="text-xl font-bold text-slate-800">Verifikasi Pak RT</h3>
              <p className="text-sm text-slate-500 text-center mt-1 px-4">Akses ini hanya untuk pengurus lingkungan.</p>
            </div>
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="relative">
                <input type="password" autoFocus placeholder="Kata Sandi (Demo: 230917)" className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} />
                <KeyRound size={20} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
              {loginError && <p className="text-red-500 text-xs text-center font-bold bg-red-50 py-2 rounded-lg">{loginError}</p>}
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98]">Masuk Sekarang</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
