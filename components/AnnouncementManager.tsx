import React, { useState } from 'react';
import { Announcement } from '../types';
import { Sparkles, Send, Trash2, Loader2, FileText } from 'lucide-react';
import { generateAnnouncementDraft } from '../services/geminiService';
import { UserRole } from '../App';

interface AnnouncementManagerProps {
  announcements: Announcement[];
  setAnnouncements: React.Dispatch<React.SetStateAction<Announcement[]>>;
  currentUser: string;
  userRole: UserRole;
}

export const AnnouncementManager: React.FC<AnnouncementManagerProps> = ({ announcements, setAnnouncements, currentUser, userRole }) => {
  const [topic, setTopic] = useState('');
  const [generatedDraft, setGeneratedDraft] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [tone, setTone] = useState<'formal' | 'casual' | 'urgent'>('formal');

  const handleGenerate = async () => {
    if (!topic) return;
    setIsGenerating(true);
    // Mengosongkan draf lama agar user tahu proses sedang berjalan
    setGeneratedDraft(''); 
    
    const draft = await generateAnnouncementDraft(topic, tone);
    setGeneratedDraft(draft);
    setIsGenerating(false);
  };

  const handlePublish = () => {
    if (!generatedDraft) return;
    const newAnnouncement: Announcement = {
      id: Date.now().toString(),
      title: topic,
      content: generatedDraft,
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      author: currentUser
    };
    setAnnouncements([newAnnouncement, ...announcements]);
    setTopic('');
    setGeneratedDraft('');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Hapus pengumuman ini?')) {
      setAnnouncements(announcements.filter(a => a.id !== id));
    }
  };

  return (
    <div className={`grid grid-cols-1 ${userRole === 'RT' ? 'lg:grid-cols-2' : 'lg:grid-cols-1 max-w-4xl mx-auto'} gap-8`}>
      {/* Left Column: Creator (Only for RT) */}
      {userRole === 'RT' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-800">Buat Pengumuman Baru</h2>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">Topik / Kegiatan</label>
              <input 
                type="text" 
                className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="Contoh: Kerja Bakti, Penarikan Iuran Sampah, Lomba 17an..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">Nada Bahasa</label>
              <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2">
                {[
                  { id: 'formal', label: 'Resmi' },
                  { id: 'casual', label: 'Santai' },
                  { id: 'urgent', label: 'Penting/Mendesak' }
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTone(t.id as any)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                      tone === t.id 
                        ? 'bg-blue-600 text-white shadow-md transform scale-105' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !topic}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-medium shadow-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              {isGenerating ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Sedang Menulis Draf...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Buat Draf Otomatis dengan AI
                </>
              )}
            </button>

            {/* Draft Preview Section */}
            <div className={`mt-6 transition-all duration-500 ease-in-out ${generatedDraft ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 hidden'}`}>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-slate-700">
                  Pratinjau & Edit
                </label>
                <span className="text-xs text-slate-400 italic">Silakan edit sebelum terbit</span>
              </div>
              <div className="relative">
                <textarea 
                  className="w-full h-64 border border-slate-300 rounded-lg p-4 focus:ring-2 focus:ring-blue-500 outline-none text-sm leading-relaxed bg-slate-50 font-sans"
                  value={generatedDraft}
                  onChange={(e) => setGeneratedDraft(e.target.value)}
                />
                <div className="absolute bottom-4 right-4 text-slate-300 pointer-events-none">
                  <FileText size={24} />
                </div>
              </div>
              <button
                onClick={handlePublish}
                className="w-full mt-4 bg-emerald-600 text-white py-3 rounded-lg font-medium shadow-md hover:bg-emerald-700 flex items-center justify-center gap-2 transition-colors"
              >
                <Send size={18} />
                Terbitkan Pengumuman
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Right Column: List */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-800">Papan Pengumuman</h2>
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <div key={announcement.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative group hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{announcement.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600">{announcement.date}</span>
                    <span className="text-xs text-slate-400">• {announcement.author}</span>
                  </div>
                </div>
                {userRole === 'RT' && (
                  <button 
                    onClick={() => handleDelete(announcement.id)}
                    className="text-slate-300 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-all"
                    title="Hapus Pengumuman"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
              <div className="prose prose-sm max-w-none text-slate-600 whitespace-pre-wrap bg-slate-50 p-4 rounded-lg border border-slate-100">
                {announcement.content}
              </div>
            </div>
          ))}

          {announcements.length === 0 && (
             <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border-2 border-slate-100 border-dashed text-slate-400">
               <div className="bg-slate-50 p-4 rounded-full mb-3">
                 <FileText size={32} />
               </div>
               <p>Belum ada pengumuman yang diterbitkan.</p>
               {userRole === 'RT' && (
                 <p className="text-sm mt-1">Gunakan AI di samping untuk membuat yang pertama!</p>
               )}
             </div>
          )}
        </div>
      </div>
    </div>
  );
};