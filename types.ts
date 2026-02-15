
export enum Role {
  STUDENT = 'STUDENT',
  GURU = 'GURU',
  ADMIN = 'ADMIN'
}

export enum AttendanceStatus {
  HADIR = 'HADIR',
  IZIN = 'IZIN',
  SAKIT = 'SAKIT',
  ALFA = 'ALFA'
}

export interface User {
  uid: string;
  nama: string;
  email: string;
  password?: string; // Menambahkan password (opsional agar tidak merusak data lama, tapi wajib untuk fungsionalitas baru)
  role: Role;
  kelas?: string;
  assignedClasses?: string[];
  waliEmail?: string;
  faceImageUrl?: string;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  nama: string;
  kelas: string;
  tanggal: string;
  status: AttendanceStatus;
  latitude: number;
  longitude: number;
  distance: number;
  timestamp: number;
  verifiedFace: boolean;
  faceMatchScore: number;
}
