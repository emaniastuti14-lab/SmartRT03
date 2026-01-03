
import React, { useState } from 'react';
import { Report, ReportStatus, Resident } from '../types';
import { AlertCircle, CheckCircle, Clock, BrainCircuit, Plus, X, Trash2 } from 'lucide-react';
import { analyzeCommunityReports } from '../services/geminiService';
import { UserRole } from '../App';

interface ReportManagerProps {
  reports: Report[];
  setReports: React.Dispatch<React.SetStateAction<Report[]>>;
  userRole: UserRole;
  residents: Resident[];
}

export const ReportManager: React.FC<ReportManagerProps> = ({ reports, setReports, userRole, residents }) => {
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Create Report State for Resident
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newReport, setNewReport] = useState({ title: '', description: '', reporterName: '' });
  const [nameError, setNameError] = useState('');

  const handleStatusChange = (id: string, newStatus: ReportStatus) => {
    if (userRole !== 'RT') return;
    setReports(reports.map(r => r.id === id ? { ...r, status: newStatus } : r));
  };

  const handleDeleteReport = (id: string) => {
    if (userRole !== 'RT') return;
    if (window.confirm('Hapus laporan ini secara permanen?')) {
      setReports(reports.filter(r => r.id !== id));
    }
  };

  const handleAnalyze = async () => {
    if (reports.length === 0) return;
    setIsAnalyzing(true);
    const analysis = await analyzeCommunityReports(reports);
    setAiAnalysis(analysis);
    setIsAnalyzing(false);
  };

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReport.title || !newReport.description || !newReport.reporterName) return;

    // Reset error
    setNameError('');

    // Validasi: Cek apakah nama pelapor ada di data warga (case-insensitive)
    const residentExists = residents.some(
      r => r.name.toLowerCase() === newReport.reporterName.trim().toLowerCase()
    );

    if (!residentExists) {
      setNameError('Maaf, nama Anda tidak terdaftar di Data Warga. Silakan hubungi Pak RT.');
      return;
    }

    const report: Report = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      title: newReport.title,
      description: newReport.description,
      reporterName: newReport.reporterName, 
      status: ReportStatus.PENDING
    };

    setReports([report, ...reports]);
    setNewReport({ title: '', description: '', reporterName: '' });
    setIsModalOpen(false);
  };

  const getStatusIcon = (status: ReportStatus) => {
    switch (status) {
      case ReportStatus.RESOLVED: return <CheckCircle size={18} className="text-green-500" />;
      case ReportStatus.IN_PROGRESS: return <Clock size={18} className="text-blue-500" />;
      default: return <AlertCircle size={18} className="text-orange-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Laporan & Aduan Warga</h2>
        
        <div className="flex gap-2">
          {userRole === 'WARGA' && (
            <button
              onClick={() => {
                setIsModalOpen(true);
                setNameError('');
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
            >
              <Plus size={20} />
              Buat Laporan
            </button>
          )}

          {userRole === 'RT' && (
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || reports.length === 0}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm disabled:opacity-50"
            >
              {isAnalyzing ? <span className="animate-spin">⌛</span> : <BrainCircuit size={20} />}
              {isAnalyzing ? 'Menganalisis...' : 'Analisis AI'}
            </button>
          )}
        </div>
      </div>

      {aiAnalysis && userRole === 'RT' && (
        <div className="bg-purple-50 border border-purple-100 p-6 rounded-xl animate-fade-in relative">
          <button 
            onClick={() => setAiAnalysis(null)} 
            className="absolute top-4 right-4 text-purple-400 hover:text-purple-700 font-bold"
          >
            ✕
          </button>
          <div className="flex items-start gap-4">
            <div className="bg-purple-100 p-2 rounded-lg text-purple-600 mt-1">
              <BrainCircuit size={24} />
            </div>
            <div>
              <h3 className="font-bold text-purple-900 mb-2">Analisis & Saran AI</h3>
              <p className="text-purple-800 text-sm whitespace-pre-wrap leading-relaxed">{aiAnalysis}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {reports.map((report) => (
          <div key={report.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded font-medium">
                  {report.date}
                </span>
                <span className="text-xs text-slate-400">oleh {report.reporterName}</span>
              </div>
              <h3 className="font-bold text-slate-800 text-lg mb-1">{report.title}</h3>
              <p className="text-slate-600 text-sm">{report.description}</p>
            </div>

            <div className="flex flex-col gap-2 min-w-[220px] border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 justify-center">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-500">Status:</span>
                <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded border border-slate-200">
                  {getStatusIcon(report.status)}
                  <span className="text-sm font-medium text-slate-700">{report.status}</span>
                </div>
              </div>
              
              {userRole === 'RT' && (
                <div className="flex gap-2">
                  {report.status !== ReportStatus.IN_PROGRESS && report.status !== ReportStatus.RESOLVED && (
                    <button 
                      onClick={() => handleStatusChange(report.id, ReportStatus.IN_PROGRESS)}
                      className="flex-1 bg-blue-50 text-blue-600 hover:bg-blue-100 px-2 py-2 rounded text-xs font-medium transition-colors"
                    >
                      Proses
                    </button>
                  )}
                  {report.status !== ReportStatus.RESOLVED && (
                    <button 
                      onClick={() => handleStatusChange(report.id, ReportStatus.RESOLVED)}
                      className="flex-1 bg-green-50 text-green-600 hover:bg-green-100 px-2 py-2 rounded text-xs font-medium transition-colors"
                    >
                      Selesai
                    </button>
                  )}
                  <button 
                    onClick={() => handleDeleteReport(report.id)}
                    className="flex items-center justify-center bg-red-50 text-red-600 hover:bg-red-100 px-3 py-2 rounded transition-colors"
                    title="Hapus Laporan"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {reports.length === 0 && (
          <div className="text-center py-12 text-slate-400 bg-white rounded-xl border border-slate-200 border-dashed">
            Tidak ada laporan warga saat ini.
          </div>
        )}
      </div>

      {/* Modal Buat Laporan untuk Warga */}
      {isModalOpen && userRole === 'WARGA' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl relative">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X size={24} />
            </button>
            
            <h3 className="text-xl font-bold mb-6 text-slate-800">Buat Laporan / Aduan</h3>
            <form onSubmit={handleSubmitReport} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Pelapor</label>
                <input 
                  type="text" 
                  required
                  className={`w-full border rounded-lg p-2.5 outline-none transition-colors ${nameError ? 'border-red-300 focus:ring-2 focus:ring-red-200 bg-red-50' : 'border-slate-300 focus:ring-2 focus:ring-blue-500'}`}
                  value={newReport.reporterName}
                  onChange={e => {
                    setNewReport({...newReport, reporterName: e.target.value});
                    if (nameError) setNameError('');
                  }}
                  placeholder="Nama sesuai data warga"
                />
                {nameError && (
                  <p className="text-red-500 text-xs mt-1 font-medium flex items-center">
                    <AlertCircle size={12} className="mr-1" />
                    {nameError}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Judul Laporan</label>
                <input 
                  type="text" 
                  required
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newReport.title}
                  onChange={e => setNewReport({...newReport, title: e.target.value})}
                  placeholder="Contoh: Lampu Jalan Mati"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Detail Masalah</label>
                <textarea 
                  required
                  rows={4}
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newReport.description}
                  onChange={e => setNewReport({...newReport, description: e.target.value})}
                  placeholder="Jelaskan detail lokasi dan masalahnya..."
                />
              </div>
              <button 
                type="submit" 
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-md transition-all"
              >
                Kirim Laporan
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
