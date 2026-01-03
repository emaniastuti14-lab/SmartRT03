
import { GoogleGenAI } from "@google/genai";
import { Report } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateAnnouncementDraft = async (topic: string, tone: 'formal' | 'casual' | 'urgent'): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Buatkan draf pengumuman untuk topik: "${topic}".`,
      config: {
        systemInstruction: `Anda adalah Ketua RT (Rukun Tetangga) yang bijaksana di Indonesia.
        Buat draf pengumuman WhatsApp/Surat Edaran.
        Gaya Bahasa: ${tone === 'formal' ? 'Resmi' : tone === 'casual' ? 'Santai' : 'Mendesak'}.
        Output HANYA teks pengumuman saja.`,
        temperature: 0.7,
      },
    });
    return response.text || "Gagal membuat draf.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Terjadi kesalahan koneksi AI.";
  }
};

export const generateReferenceLetter = async (residentName: string, address: string, purpose: string, rtName: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Buatkan Surat Pengantar RT untuk warga bernama ${residentName}, alamat ${address}, untuk keperluan: ${purpose}.`,
      config: {
        systemInstruction: `Anda adalah Sekretaris RT yang profesional. 
        Buatlah surat keterangan/pengantar RT resmi yang mencakup:
        1. Kop Surat (RT 03/RW 03)
        2. Nomor Surat (gunakan placeholder [NOMOR_SURAT])
        3. Data Diri Warga (Nama, Alamat)
        4. Maksud dan Tujuan Surat
        5. Penutup yang sopan
        6. Tempat tanda tangan Ketua RT (${rtName}).
        
        Gunakan format surat resmi Indonesia yang baku dan rapi.`,
      },
    });
    return response.text || "Gagal membuat surat.";
  } catch (error) {
    return "Terjadi kesalahan saat menyusun surat.";
  }
};

export const analyzeCommunityReports = async (reports: Report[]): Promise<string> => {
  try {
    const reportsText = reports.map(r => `- ${r.title}: ${r.description}`).join('\n');
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Daftar Laporan Warga:\n${reportsText}`,
      config: {
        systemInstruction: `Analisislah laporan warga ini dan berikan ringkasan serta saran tindakan untuk Ketua RT dalam poin-poin singkat.`,
      },
    });
    return response.text || "Gagal menganalisis.";
  } catch (error) {
    return "Terjadi kesalahan analisis.";
  }
};
