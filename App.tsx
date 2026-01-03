
import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { DashboardOverview } from './components/DashboardOverview';
import { ResidentManager } from './components/ResidentManager';
import { Financials } from './components/Financials';
import { AnnouncementManager } from './components/AnnouncementManager';
import { ReportManager } from './components/ReportManager';
import { LetterManager } from './components/LetterManager';
import { Menu } from 'lucide-react';
import { MOCK_RESIDENTS, MOCK_TRANSACTIONS, MOCK_REPORTS, MOCK_ANNOUNCEMENTS, MOCK_LETTERS } from './constants';
import { Resident, Transaction, Report, Announcement, LetterRequest } from './types';

export type UserRole = 'RT' | 'WARGA';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [userRole, setUserRole] = useState<UserRole>('WARGA');
  const [profileName, setProfileName] = useState("Pak RT Ahmad Dul Malik");
  const [residents, setResidents] = useState<Resident[]>(MOCK_RESIDENTS);
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [reports, setReports] = useState<Report[]>(MOCK_REPORTS);
  const [announcements, setAnnouncements] = useState<Announcement[]>(MOCK_ANNOUNCEMENTS);
  const [letterRequests, setLetterRequests] = useState<LetterRequest[]>(MOCK_LETTERS);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview residents={residents} transactions={transactions} reports={reports} userRole={userRole} profileName={profileName} />;
      case 'residents':
        return <ResidentManager residents={residents} setResidents={setResidents} userRole={userRole} />;
      case 'financials':
        return <Financials transactions={transactions} setTransactions={setTransactions} userRole={userRole} />;
      case 'announcements':
        return <AnnouncementManager announcements={announcements} setAnnouncements={setAnnouncements} currentUser={profileName} userRole={userRole} />;
      case 'reports':
        return <ReportManager reports={reports} setReports={setReports} userRole={userRole} residents={residents} />;
      case 'letters':
        return <LetterManager requests={letterRequests} setRequests={setLetterRequests} userRole={userRole} residents={residents} rtName={profileName} />;
      default:
        return <DashboardOverview residents={residents} transactions={transactions} reports={reports} userRole={userRole} profileName={profileName} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-900 selection:bg-blue-100 selection:text-blue-700">
      <Sidebar 
        activeTab={activeTab} setActiveTab={setActiveTab} 
        isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen}
        profileName={profileName} setProfileName={setProfileName}
        userRole={userRole} setUserRole={setUserRole}
      />
      
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 p-4 md:hidden flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-blue-200">RT</div>
            <span className="font-bold text-slate-800 tracking-tight">SmartRT</span>
          </div>
          <button onClick={() => setIsSidebarOpen(true)} className="text-slate-600 bg-slate-50 p-2 rounded-lg"><Menu size={24} /></button>
        </header>

        <main className="flex-1 p-4 md:p-10 lg:p-12 overflow-y-auto bg-slate-50/50">
          <div className="max-w-6xl mx-auto animate-fade-in-up">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
