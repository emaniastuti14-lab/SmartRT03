
export enum ResidentStatus {
  PERMANENT = 'Tetap',
  TEMPORARY = 'Kontrak/Kos',
  MOVED = 'Pindah'
}

export interface Resident {
  id: string;
  name: string;
  address: string;
  phone: string;
  status: ResidentStatus;
  familyMembers: number;
  isHeadOfFamily: boolean;
}

export enum TransactionType {
  INCOME = 'Pemasukan',
  EXPENSE = 'Pengeluaran'
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
}

export enum ReportStatus {
  PENDING = 'Menunggu',
  IN_PROGRESS = 'Diproses',
  RESOLVED = 'Selesai'
}

export interface Report {
  id: string;
  reporterName: string;
  date: string;
  title: string;
  description: string;
  status: ReportStatus;
}

export enum LetterStatus {
  PENDING = 'Menunggu',
  APPROVED = 'Disetujui',
  REJECTED = 'Ditolak'
}

export interface LetterRequest {
  id: string;
  residentName: string;
  residentAddress: string;
  purpose: string; // e.g., 'Pembuatan KTP', 'SKCK', 'Domisili'
  date: string;
  status: LetterStatus;
  content?: string; // Draf yang dihasilkan AI
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  author: string;
}
