
import { Resident, ResidentStatus, Transaction, TransactionType, Report, Announcement, LetterRequest, LetterStatus } from './types';

export const MOCK_RESIDENTS: Resident[] = [
  { id: '1', name: 'Budi Santoso', address: 'Blok A1 No. 5', phone: '081234567890', status: ResidentStatus.PERMANENT, familyMembers: 4, isHeadOfFamily: true },
  { id: '2', name: 'Siti Aminah', address: 'Blok A1 No. 7', phone: '081987654321', status: ResidentStatus.TEMPORARY, familyMembers: 2, isHeadOfFamily: true },
  { id: '3', name: 'Joko Widodo', address: 'Blok B2 No. 10', phone: '085678901234', status: ResidentStatus.PERMANENT, familyMembers: 3, isHeadOfFamily: true },
];

export const MOCK_TRANSACTIONS: Transaction[] = [];

export const MOCK_REPORTS: Report[] = [];

export const MOCK_LETTERS: LetterRequest[] = [
  { id: 'L1', residentName: 'Budi Santoso', residentAddress: 'Blok A1 No. 5', purpose: 'Pembuatan KTP Baru', date: '21/05/2024', status: LetterStatus.PENDING }
];

export const MOCK_ANNOUNCEMENTS: Announcement[] = [
  { id: '1', title: 'Kerja Bakti Minggu Ini', date: '20 Mei 2024', author: 'Pak RT Ahmad Dul Malik', content: 'Yth. Warga RT 05,\n\nKami mengundang Bapak/Ibu untuk hadir dalam kerja bakti membersihkan selokan utama pada hari Minggu besok. Harap membawa cangkul atau sapu lidi.\n\nTerima kasih!' },
];
