import React, { useState } from 'react';
import { Transaction, TransactionType } from '../types';
import { ArrowUpRight, ArrowDownLeft, Plus, Pencil, Trash2, X, Filter, Calendar } from 'lucide-react';
import { UserRole } from '../App';

interface FinancialsProps {
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  userRole: UserRole;
}

export const Financials: React.FC<FinancialsProps> = ({ transactions, setTransactions, userRole }) => {
  // Filter States
  const [filterType, setFilterType] = useState<'ALL' | TransactionType>('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  // Modal & Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Transaction>>({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: 0,
    type: TransactionType.INCOME,
    category: 'Iuran Wajib'
  });

  const CATEGORIES = [
    'Iuran Wajib', 'Sumbangan', 'Keamanan', 'Kebersihan', 
    'Pembangunan', 'Pemeliharaan', 'Konsumsi', 'Lainnya'
  ];

  // Logic: Filtering
  const filteredTransactions = transactions.filter(t => {
    const matchesType = filterType === 'ALL' || t.type === filterType;
    const matchesStart = !startDate || t.date >= startDate;
    const matchesEnd = !endDate || t.date <= endDate;
    return matchesType && matchesStart && matchesEnd;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Logic: Summary Calculation
  const totalIncome = filteredTransactions
    .filter(t => t.type === TransactionType.INCOME)
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpense = filteredTransactions
    .filter(t => t.type === TransactionType.EXPENSE)
    .reduce((acc, curr) => acc + curr.amount, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
  };

  // Logic: CRUD
  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      description: '',
      amount: 0,
      type: TransactionType.INCOME,
      category: 'Iuran Wajib'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (transaction: Transaction) => {
    setEditingId(transaction.id);
    setFormData({ ...transaction });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, desc: string) => {
    if (window.confirm(`Hapus transaksi "${desc}"?`)) {
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || !formData.amount) return;

    if (editingId) {
      setTransactions(prev => prev.map(t => 
        t.id === editingId ? { ...formData, id: editingId } as Transaction : t
      ));
    } else {
      const newTransaction: Transaction = {
        ...formData as Transaction,
        id: Date.now().toString()
      };
      setTransactions(prev => [newTransaction, ...prev]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Keuangan & Kas RT</h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <button 
            onClick={() => setIsFilterVisible(!isFilterVisible)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors border ${isFilterVisible ? 'bg-slate-200 border-slate-300 text-slate-800' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
          >
            <Filter size={20} />
            <span className="hidden sm:inline">Filter</span>
          </button>
          {userRole === 'RT' && (
            <button 
              onClick={handleOpenAdd}
              className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <Plus size={20} />
              Catat Transaksi
            </button>
          )}
        </div>
      </div>

      {/* Filter Section */}
      {isFilterVisible && (
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm animate-fade-in grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Jenis Transaksi</label>
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="ALL">Semua Transaksi</option>
              <option value={TransactionType.INCOME}>Pemasukan</option>
              <option value={TransactionType.EXPENSE}>Pengeluaran</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Dari Tanggal</label>
            <div className="relative">
              <input 
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 text-sm pl-8 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <Calendar size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Sampai Tanggal</label>
            <div className="relative">
              <input 
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 text-sm pl-8 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <Calendar size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-emerald-500 text-white p-6 rounded-xl shadow-md">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-emerald-100 font-medium">Total Pemasukan</p>
              <h3 className="text-3xl font-bold mt-1">{formatCurrency(totalIncome)}</h3>
            </div>
            <div className="bg-white/20 p-2 rounded-lg">
              <ArrowDownLeft className="text-white" size={24} />
            </div>
          </div>
          <p className="text-emerald-100 text-sm mt-4">
            {isFilterVisible && (startDate || endDate || filterType !== 'ALL') ? 'Berdasarkan filter saat ini' : 'Akumulasi keseluruhan'}
          </p>
        </div>

        <div className="bg-rose-500 text-white p-6 rounded-xl shadow-md">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-rose-100 font-medium">Total Pengeluaran</p>
              <h3 className="text-3xl font-bold mt-1">{formatCurrency(totalExpense)}</h3>
            </div>
            <div className="bg-white/20 p-2 rounded-lg">
              <ArrowUpRight className="text-white" size={24} />
            </div>
          </div>
          <p className="text-rose-100 text-sm mt-4">
             {isFilterVisible && (startDate || endDate || filterType !== 'ALL') ? 'Berdasarkan filter saat ini' : 'Akumulasi keseluruhan'}
          </p>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="font-bold text-lg text-slate-800">Riwayat Transaksi</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tanggal</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Keterangan</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Kategori</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Jumlah</th>
                {userRole === 'RT' && (
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Aksi</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">{t.date}</td>
                  <td className="px-6 py-4 text-sm text-slate-900 font-medium">{t.description}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                      {t.category}
                    </span>
                  </td>
                  <td className={`px-6 py-4 text-sm font-bold text-right whitespace-nowrap ${t.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {t.type === TransactionType.INCOME ? '+' : '-'} {formatCurrency(t.amount)}
                  </td>
                  {userRole === 'RT' && (
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handleOpenEdit(t)}
                          className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(t.id, t.description)}
                          className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                          title="Hapus"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={userRole === 'RT' ? 5 : 4} className="px-6 py-12 text-center text-slate-400 text-sm">
                    Tidak ada transaksi yang ditemukan sesuai filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && userRole === 'RT' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl relative">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X size={24} />
            </button>
            
            <h3 className="text-xl font-bold mb-6 text-slate-800">
              {editingId ? 'Edit Transaksi' : 'Catat Transaksi Baru'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
                <button
                  type="button"
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${formData.type === TransactionType.INCOME ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'}`}
                  onClick={() => setFormData({ ...formData, type: TransactionType.INCOME })}
                >
                  Pemasukan
                </button>
                <button
                  type="button"
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${formData.type === TransactionType.EXPENSE ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'}`}
                  onClick={() => setFormData({ ...formData, type: TransactionType.EXPENSE })}
                >
                  Pengeluaran
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal</label>
                <input 
                  type="date" 
                  required
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Keterangan</label>
                <input 
                  type="text" 
                  required
                  placeholder="Contoh: Iuran Bapak Budi, Beli Sapu Lidi"
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Kategori</label>
                  <select 
                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Jumlah (Rp)</label>
                  <input 
                    type="number" 
                    required
                    min="0"
                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.amount}
                    onChange={e => setFormData({...formData, amount: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className={`w-full py-3 rounded-lg font-bold text-white shadow-md mt-6 transition-all ${formData.type === TransactionType.INCOME ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'}`}
              >
                Simpan Transaksi
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};