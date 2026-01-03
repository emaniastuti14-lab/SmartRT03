
import React, { useState } from 'react';
import { LetterRequest, LetterStatus, Resident } from '../types';
import { FileText, Plus, Search, Check, X, Wand2, Download, Printer, Clock, AlertCircle } from 'lucide-react';
import { generateReferenceLetter } from '../services/geminiService';
import { UserRole } from '../App';

interface LetterManagerProps {
  requests: LetterRequest[];
  setRequests: React.Dispatch<React.SetStateAction<LetterRequest[]>>;
  userRole: UserRole;
  residents: Resident[];
  rtName: string;
}

export const LetterManager: React.FC<LetterManagerProps> = ({ requests, setRequests, userRole, residents, rtName }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [newRequest, setNewRequest] = useState({ residentName: '', purpose: '' });
  const [error, setError] = useState('');

  const filteredRequests = requests.filter(r => 
    r.residentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.purpose.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const resident = residents.find(r => r.name.toLowerCase() === newRequest.residentName.trim().toLowerCase());
    if (!resident) {
      setError('Nama tidak terdaftar di data warga. Silakan hubungi pengurus RT.');
      return;
    }

    const request: LetterRequest = {
      id: Date.now().toString(),
      residentName: resident.name,
      residentAddress: resident.address,
      purpose: newRequest.purpose,
      date: new Date().toLocaleDateString('id-ID'),
      status: LetterStatus.PENDING
    };

    setRequests([request, ...requests]);
    setIsModalOpen(false);
    setNewRequest({ residentName: '', purpose: '' });
  };

  const handleGenerateAI = async (requestId: string) => {
    const request = requests.find(r => r.id === requestId);
    if (!request) return;

    setIsGenerating(requestId);
    const content = await generateReferenceLetter(request.residentName, request.residentAddress, request.purpose, rtName);
    
    setRequests(prev => prev.map(r => 
      r.id === requestId ? { ...r, content, status: LetterStatus.APPROVED } : r
    ));
    setIsGenerating(null);
  };

  const updateStatus = (id: string, status: LetterStatus) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Layanan Surat Pengantar</h2>
          <p className="text-slate-500 text-sm">Permohonan surat keterangan RT untuk berbagai keperluan warga.</p>
        </div>
        
        {userRole === 'WARGA' && (
          <button 
            onClick={() => { setIsModalOpen(true); setError(''); }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-blue-100 font-bold"
          >
            <Plus size={20} /> Ajukan Surat
          </button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Cari permohonan surat..." 
          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredRequests.map((req) => (
          <div key={req.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded">{req.date}</span>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
                  req.status === LetterStatus.PENDING ? 'bg-orange-50 text-orange-600' : 
                  req.status === LetterStatus.APPROVED ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                }`}>
                  {req.status}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-800">{req.purpose}</h3>
              <p className="text-slate-500 text-sm mt-1">Pemohon: <span className="text-slate-800 font-medium">{req.residentName}</span></p>
              
              {req.content && (
                <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs font-mono whitespace-pre-wrap text-slate-700 max-h-40 overflow-y-auto">
                  {req.content}
                </div>
              )}
            </div>

            <div className="flex md:flex-col gap-2 min-w-[160px] justify-center border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
              {userRole === 'RT' && req.status === LetterStatus.PENDING && (
                <>
                  <button 
                    onClick={() => handleGenerateAI(req.id)}
                    disabled={isGenerating === req.id}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white p-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    {isGenerating === req.id ? <Clock size={14} className="animate-spin" /> : <Wand2 size={14} />}
                    {isGenerating === req.id ? 'Menyusun...' : 'Buat Draf AI'}
                  </button>
                  <button 
                    onClick={() => updateStatus(req.id, LetterStatus.REJECTED)}
                    className="flex-1 bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-600 p-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all"
                  >
                    <X size={14} /> Tolak
                  </button>
                </>
              )}
              
              {req.status === LetterStatus.APPROVED && (
                <button 
                  className="w-full bg-blue-50 text-blue-600 hover:bg-blue-100 p-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all"
                  onClick={() => window.print()}
                >
                  <Printer size={14} /> Cetak Surat
                </button>
              )}
              
              {userRole === 'WARGA' && req.status === LetterStatus.PENDING && (
                <div className="flex items-center gap-2 text-slate-400 text-xs font-medium justify-center italic">
                  <Clock size={14} /> Menunggu Verifikasi
                </div>
              )}
            </div>
          </div>
        ))}

        {filteredRequests.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
            <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="text-slate-300" size={32} />
            </div>
            <p className="text-slate-400 font-medium">Belum ada permohonan surat masuk.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={24} /></button>
            <h3 className="text-xl font-bold mb-6 text-slate-800">Ajukan Surat Pengantar</h3>
            <form onSubmit={handleCreateRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Nama Lengkap Sesuai Data Warga</label>
                <input 
                  type="text" 
                  required 
                  className={`w-full border ${error ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-slate-50'} rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                  placeholder="Contoh: Budi Santoso"
                  value={newRequest.residentName}
                  onChange={(e) => { setNewRequest({...newRequest, residentName: e.target.value}); setError(''); }}
                />
                {error && <p className="text-red-500 text-[10px] mt-1.5 font-bold flex items-center gap-1"><AlertCircle size={10} /> {error}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Keperluan Surat</label>
                <select 
                  className="w-full border border-slate-200 bg-slate-50 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500"
                  value={newRequest.purpose}
                  onChange={(e) => setNewRequest({...newRequest, purpose: e.target.value})}
                  required
                >
                  <option value="">-- Pilih Keperluan --</option>
                  <option value="Pembuatan KTP Baru">Pembuatan KTP Baru</option>
                  <option value="Pengurusan SKCK">Pengurusan SKCK</option>
                  <option value="Keterangan Domisili">Keterangan Domisili</option>
                  <option value="Keterangan Belum Menikah">Keterangan Belum Menikah</option>
                  <option value="Pengurusan Akta Kelahiran">Pengurusan Akta Kelahiran</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
              <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all mt-6 active:scale-[0.98]">
                Kirim Permohonan
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
