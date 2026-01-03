import React, { useState } from 'react';
import { Search, Plus, User, Users, MapPin, Phone, Trash2, ShieldCheck, Pencil, AlertTriangle, X } from 'lucide-react';
import { Resident, ResidentStatus } from '../types';
import { UserRole } from '../App';

interface ResidentManagerProps {
  residents: Resident[];
  setResidents: React.Dispatch<React.SetStateAction<Resident[]>>;
  userRole: UserRole;
}

export const ResidentManager: React.FC<ResidentManagerProps> = ({ residents, setResidents, userRole }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Delete Confirmation State
  const [deleteConfirmation, setDeleteConfirmation] = useState<{id: string, name: string} | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Resident>>({
    name: '',
    address: '',
    phone: '',
    status: ResidentStatus.PERMANENT,
    familyMembers: 1,
    isHeadOfFamily: true
  });

  const filteredResidents = residents.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setFormData({ 
      name: '', 
      address: '', 
      phone: '', 
      status: ResidentStatus.PERMANENT, 
      familyMembers: 1,
      isHeadOfFamily: true
    });
    setEditingId(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (resident: Resident) => {
    setEditingId(resident.id);
    setFormData({
      name: resident.name,
      address: resident.address,
      phone: resident.phone,
      status: resident.status,
      familyMembers: resident.familyMembers,
      isHeadOfFamily: resident.isHeadOfFamily
    });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: string, name: string) => {
    setDeleteConfirmation({ id, name });
  };

  const confirmDelete = () => {
    if (deleteConfirmation) {
      setResidents(prev => prev.filter(r => r.id !== deleteConfirmation.id));
      setDeleteConfirmation(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.address) return;

    if (editingId) {
      // Logic Update Data Warga
      setResidents(prev => prev.map(r => 
        r.id === editingId 
          ? { ...formData as Resident, id: editingId } 
          : r
      ));
    } else {
      // Logic Tambah Warga Baru
      const newResident: Resident = {
        ...formData as Resident,
        id: Date.now().toString(),
        phone: formData.phone || '-',
      };
      setResidents(prev => [newResident, ...prev]);
    }
    
    setIsModalOpen(false);
    resetForm();
  };

  const getStatusColor = (status: ResidentStatus) => {
    switch(status) {
      case ResidentStatus.PERMANENT: return 'bg-blue-100 text-blue-700';
      case ResidentStatus.TEMPORARY: return 'bg-yellow-100 text-yellow-700';
      case ResidentStatus.MOVED: return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Manajemen Data Warga</h2>
        {userRole === 'RT' && (
          <button 
            onClick={handleOpenAdd}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
          >
            <Plus size={20} />
            Tambah Warga
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text"
          placeholder="Cari nama atau alamat..."
          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Residents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResidents.map((resident) => (
          <div key={resident.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative">
            <div className="flex justify-between items-start mb-4">
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                  <User size={24} />
                </div>
                {resident.isHeadOfFamily && (
                  <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-1 rounded-full shadow-sm" title="Kepala Keluarga">
                    <ShieldCheck size={12} />
                  </div>
                )}
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(resident.status)}`}>
                {resident.status}
              </span>
            </div>
            
            <div>
              <h3 className="text-lg font-bold text-slate-900 leading-tight">{resident.name}</h3>
              {resident.isHeadOfFamily && (
                <span className="text-xs text-blue-600 font-medium mt-1 inline-block">Kepala Keluarga</span>
              )}
            </div>
            
            <div className="space-y-3 mt-4 pt-4 border-t border-slate-50">
              <div className="flex items-center text-slate-600 text-sm">
                <MapPin size={16} className="mr-3 text-slate-400 min-w-[16px]" />
                <span className="truncate">{resident.address}</span>
              </div>
              <div className="flex items-center text-slate-600 text-sm">
                <Phone size={16} className="mr-3 text-slate-400 min-w-[16px]" />
                <span>{resident.phone}</span>
              </div>
              <div className="flex items-center text-slate-600 text-sm">
                <Users size={16} className="mr-3 text-slate-400 min-w-[16px]" />
                <span>{resident.familyMembers} Anggota Keluarga</span>
              </div>
            </div>
            
            {userRole === 'RT' && (
              <div className="mt-6 flex gap-2">
                <button 
                  type="button"
                  onClick={() => handleOpenEdit(resident)}
                  className="flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                  title="Edit Warga"
                >
                  <Pencil size={16} className="mr-2" /> Edit
                </button>
                <button 
                  type="button"
                  onClick={() => handleDeleteClick(resident.id, resident.name)}
                  className="flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                  title="Hapus Warga"
                >
                  <Trash2 size={16} className="mr-2" /> Hapus
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredResidents.length === 0 && (
        <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
          <p>Tidak ada data warga yang ditemukan.</p>
          {userRole === 'RT' && (
            <button onClick={handleOpenAdd} className="text-blue-600 font-medium hover:underline mt-2">Tambah Warga Baru</button>
          )}
        </div>
      )}

      {/* Add/Edit Resident Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-6 text-slate-800">
              {editingId ? 'Edit Data Warga' : 'Tambah Warga Baru'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
                <input 
                  type="text" 
                  required
                  placeholder="Nama sesuai KTP"
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Alamat (Blok/Nomor)</label>
                <input 
                  type="text" 
                  required
                  placeholder="Contoh: Blok A1 No. 5"
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nomor Telepon / WA</label>
                <input 
                  type="tel" 
                  placeholder="08xxxxxxxxxx"
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status Tempat Tinggal</label>
                  <select 
                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value as ResidentStatus})}
                  >
                    <option value={ResidentStatus.PERMANENT}>Tetap</option>
                    <option value={ResidentStatus.TEMPORARY}>Kontrak / Kos</option>
                    <option value={ResidentStatus.MOVED}>Pindah</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Jml. Anggota Keluarga</label>
                  <input 
                    type="number" 
                    min="1"
                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.familyMembers}
                    onChange={e => setFormData({...formData, familyMembers: parseInt(e.target.value) || 1})}
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                  <input 
                    type="checkbox"
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    checked={formData.isHeadOfFamily}
                    onChange={e => setFormData({...formData, isHeadOfFamily: e.target.checked})}
                  />
                  <div>
                    <span className="text-sm font-medium text-slate-900 block">Kepala Keluarga</span>
                    <span className="text-xs text-slate-500 block">Centang jika warga ini adalah kepala keluarga</span>
                  </div>
                </label>
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 shadow-md transition-all"
                >
                  {editingId ? 'Simpan Perubahan' : 'Tambah Warga'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl relative">
            <button 
              onClick={() => setDeleteConfirmation(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600 mx-auto mb-4">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Hapus Warga?</h3>
              <p className="text-slate-600 mb-6">
                Apakah Anda yakin ingin menghapus data warga <span className="font-semibold text-slate-900">{deleteConfirmation.name}</span>? Tindakan ini tidak dapat dibatalkan.
              </p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setDeleteConfirmation(null)}
                  className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 shadow-sm transition-colors"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};