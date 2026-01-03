import React from 'react';
import { Users, Wallet, AlertCircle, TrendingUp, Sun, Moon, CloudSun, Sunrise } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Resident, Transaction, Report } from '../types';
import { UserRole } from '../App';

interface DashboardProps {
  residents: Resident[];
  transactions: Transaction[];
  reports: Report[];
  userRole: UserRole;
  profileName: string;
}

export const DashboardOverview: React.FC<DashboardProps> = ({ residents, transactions, reports, userRole, profileName }) => {
  const totalResidents = residents.length;
  const activeReports = reports.filter(r => r.status !== 'Selesai').length;
  const currentBalance = transactions.reduce((acc, curr) => {
    return curr.type === 'Pemasukan' ? acc + curr.amount : acc - curr.amount;
  }, 0);

  // Time-based greeting logic
  const getGreetingData = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) return { text: 'Selamat Pagi', icon: Sunrise, message: 'Semoga harimu menyenangkan!' };
    if (hour >= 11 && hour < 15) return { text: 'Selamat Siang', icon: Sun, message: 'Tetap semangat beraktivitas.' };
    if (hour >= 15 && hour < 18) return { text: 'Selamat Sore', icon: CloudSun, message: 'Selamat beristirahat sejenak.' };
    return { text: 'Selamat Malam', icon: Moon, message: 'Selamat beristirahat.' };
  };

  const greeting = getGreetingData();
  const GreetingIcon = greeting.icon;

  // Prepare chart data (Last 6 months simplified)
  // Logic: Jika tidak ada transaksi, tampilkan grafik kosong (0)
  const chartData = transactions.length > 0 ? [
    { name: 'Jan', amount: 4500000 },
    { name: 'Feb', amount: 3200000 },
    { name: 'Mar', amount: 5100000 },
    { name: 'Apr', amount: 3800000 },
    { name: 'Mei', amount: 4200000 },
    { name: 'Jun', amount: currentBalance > 4000000 ? 4500000 : 3500000 },
  ] : [
    { name: 'Jan', amount: 0 },
    { name: 'Feb', amount: 0 },
    { name: 'Mar', amount: 0 },
    { name: 'Apr', amount: 0 },
    { name: 'Mei', amount: 0 },
    { name: 'Jun', amount: 0 },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Dynamic Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
           <GreetingIcon size={200} />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <GreetingIcon size={24} className="text-blue-200" />
            <span className="text-blue-100 font-medium tracking-wide text-sm uppercase">{greeting.text}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold mb-2">
             Halo, {userRole === 'RT' ? profileName : 'Warga'}! 👋
          </h1>
          <p className="text-blue-100 max-w-xl">
            {userRole === 'RT' 
              ? 'Selamat datang kembali di panel kontrol RT. Berikut adalah ringkasan kondisi lingkungan hari ini.' 
              : `Selamat datang di SmartRT. ${greeting.message} Mari jaga lingkungan kita bersama.`}
          </p>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">Total Warga</p>
              <p className="text-3xl font-bold text-slate-800 mt-1">{totalResidents}</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg text-blue-600">
              <Users size={24} />
            </div>
          </div>
          <p className="text-xs text-green-600 mt-4 flex items-center font-medium">
            <TrendingUp size={14} className="mr-1" /> +2 bulan ini
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">Saldo Kas RT</p>
              <p className="text-3xl font-bold text-slate-800 mt-1">{formatCurrency(currentBalance)}</p>
            </div>
            <div className="bg-emerald-50 p-3 rounded-lg text-emerald-600">
              <Wallet size={24} />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-4">Update terakhir: Hari ini</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">Laporan Aktif</p>
              <p className="text-3xl font-bold text-slate-800 mt-1">{activeReports}</p>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg text-orange-600">
              <AlertCircle size={24} />
            </div>
          </div>
          <p className="text-xs text-orange-600 mt-4 font-medium">Butuh penanganan segera</p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 mb-6">Pemasukan Iuran Bulanan</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} tickFormatter={(value) => `Rp${value/1000}k`} />
              <Tooltip 
                cursor={{fill: '#f1f5f9'}}
                contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                formatter={(value: number) => [formatCurrency(value), 'Jumlah']}
              />
              <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};