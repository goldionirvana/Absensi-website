
import { User, AttendanceRecord, Role, AttendanceStatus } from '../types';

const USERS_KEY = 'absensi_users';
const ATTENDANCE_KEY = 'absensi_attendance';

const initialUsers: User[] = [
  { uid: 'admin1', nama: 'Admin Sekolah', email: 'admin@sekolah.com', role: Role.ADMIN, password: 'admin123' },
  { uid: 'guru1', nama: 'Bapak Budi (Guru)', email: 'guru@sekolah.com', role: Role.GURU, assignedClasses: ['10-IPA-1'], password: 'guru123' },
  { uid: 'student1', nama: 'Siswa Contoh', email: 'siswa@sekolah.com', role: Role.STUDENT, kelas: '10-IPA-1', faceImageUrl: 'https://i.pravatar.cc/150', password: 'siswa123' }
];

export const db = {
  getUsers: (): User[] => {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : initialUsers;
  },
  saveUser: (user: User) => {
    const users = db.getUsers();
    users.push(user);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  },
  saveUsersBatch: (newUsers: User[]) => {
    const users = db.getUsers();
    localStorage.setItem(USERS_KEY, JSON.stringify([...users, ...newUsers]));
  },
  getAttendance: (): AttendanceRecord[] => {
    const data = localStorage.getItem(ATTENDANCE_KEY);
    return data ? JSON.parse(data) : [];
  },
  saveAttendance: (record: AttendanceRecord) => {
    const data = db.getAttendance();
    data.push(record);
    localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(data));
  },
  updateAttendanceStatus: (id: string, status: AttendanceStatus) => {
    const data = db.getAttendance();
    const idx = data.findIndex(r => r.id === id);
    if (idx > -1) {
      data[idx].status = status;
      localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(data));
    }
  }
};
