
import React, { useState, useEffect } from 'react';
import { User, AttendanceStatus, AttendanceRecord, Role } from '../types';
import { db } from '../services/mockDb';
import { 
  Users, Calendar, Filter, Download, Search, 
  Crown, CheckCircle, Clock, AlertCircle, 
  LogOut, Upload, UserPlus, Database, PieChart,
  Trash2, FileSpreadsheet, ChevronRight, FileText
} from 'lucide-react';

interface SuperAdminDashboardProps {
  user: User;
  onLogout: () => void;
}

const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'reports'>('dashboard');
  const [students, setStudents] = useState<User[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [csvPreview, setCsvPreview] = useState<Partial<User>[]>([]);

  useEffect(() => {
    setStudents(db.getUsers().filter(u => u.role === Role.STUDENT));
    setAttendance(db.getAttendance());
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const rows = text.split('\n').map(row => row.split(','));
        const dataRows = rows.slice(1).filter(row => row.length >= 4 && row[0].trim() !== "");
        
        const parsedUsers = dataRows.map(row => ({
          uid: 'u' + Math.random().toString(36).substr(2, 9),
          nama: row[0].trim(),
          email: row[1].trim(),
          kelas: row[2].trim(),
          waliEmail: row[3].trim(),
          role: Role.STUDENT
        }));

        setCsvPreview(parsedUsers as User[]);
      };
      reader.readAsText(file);
    }
  };

  const confirmUpload = () => {
    if (csvPreview.length > 0) {
      db.saveUsersBatch(csvPreview as User[]);
      alert(`Berhasil mendaftarkan ${csvPreview.length} siswa baru!`);
      setStudents(db.getUsers().filter(u => u.role === Role.STUDENT));
      setCsvPreview([]);
    }
  };

  const exportAttendanceToExcel = () => {
    // Definisi Header Kolom
    const headers = ['Nama Siswa', 'Email', 'Kelas', 'Tanggal', 'Waktu', 'Status Kehadiran', 'Jarak (m)', 'Verifikasi Wajah', 'Skor Akurasi'];
    
    // Pemetaan Data
    const rows = attendance.map(a => {
      const student = students.find(s => s.uid === a.userId);
      return [
        `"${a.nama}"`,
        `"${student?.email || '-'}"`,
        `"${a.kelas}"`,
        `"${a.tanggal}"`,
        `"${new Date(a.timestamp).toLocaleTimeString('id-ID')}"`,
        `"${a.status}"`,
        a.distance.toFixed(2),
        a.verifiedFace ? "TERVERIFIKASI" : "TIDAK",
        `"${(a.faceMatchScore * 100).toFixed(1)}%"`
      ];
    });
    
    // Menambahkan BOM (Byte Order Mark) agar Excel mendeteksi UTF-8 dengan benar
    const csvContent = "\uFEFF" + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Rekap_Absensi_Sekolah_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filteredStudents = students.filter(s => s.nama.toLowerCase().includes(searchQuery.toLowerCase()) || s.email.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#f8f9fe] flex flex-col lg:flex-row">
      {/* SuperAdmin Sidebar */}
      <aside className="w-full lg:w-72 bg-[#1a1c2e] text-white flex flex-col sticky top-0 z-20 h-screen shadow-2xl">
        <div className="p-8 border-b border-white/10 flex items-center gap-4">
          <div className="bg-gradient-to-tr from-purple-500 to-pink-500 p-3 rounded-2xl shadow-lg shadow-purple-500/20">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="font-black text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 uppercase">SuperAdmin</h1>
            <p className="text-[10px] text-purple-400 font-bold tracking-[0.2em] uppercase">Control Panel v2</p>
          </div>
        </div>

        <nav className="flex-1 p-6 space-y-3">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 ${activeTab === 'dashboard' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xl shadow-purple-900/40 translate-x-2' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <PieChart className="w-5 h-5" />
            <span className="font-bold">Dashboard Global</span>
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 ${activeTab === 'users' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xl shadow-purple-900/40 translate-x-2' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <UserPlus className="w-5 h-5" />
            <span className="font-bold">Kelola Siswa</span>
          </button>
          <button 
            onClick={() => setActiveTab('reports')}
            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 ${activeTab === 'reports' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xl shadow-purple-900/40 translate-x-2' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <Database className="w-5 h-5" />
            <span className="font-bold">Database Absensi</span>
          </button>
        </nav>

        <div className="p-6 mt-auto">
          <div className="bg-white/5 p-6 rounded-3xl border border-white/10 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center font-bold text-purple-400">SA</div>
              <div className="overflow-hidden">
                <p className="text-sm font-black truncate">{user.nama}</p>
                <p className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">Top Access</p>
              </div>
            </div>
            <button 
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 py-3 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-2xl transition-all font-bold text-sm"
            >
              <LogOut className="w-4 h-4" /> Keluar Sistem
            </button>
          </div>
        </div>
      </aside>

      {/* Main Panel */}
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {activeTab === 'dashboard' && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <header>
                <h2 className="text-4xl font-black text-[#1a1c2e] mb-2 tracking-tight">Overview Global</h2>
                <p className="text-gray-500 font-medium">Monitoring performa kehadiran seluruh sekolah secara terpusat.</p>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 flex flex-col justify-between group hover:shadow-2xl hover:shadow-purple-500/5 transition-all duration-500">
                  <div className="bg-purple-50 w-16 h-16 rounded-3xl flex items-center justify-center text-purple-600 mb-6 group-hover:scale-110 transition-transform">
                    <Users className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-gray-400 font-bold text-sm tracking-widest mb-1">TOTAL SISWA</p>
                    <p className="text-5xl font-black text-[#1a1c2e]">{students.length}</p>
                  </div>
                </div>
                <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 flex flex-col justify-between group hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-500">
                  <div className="bg-blue-50 w-16 h-16 rounded-3xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-gray-400 font-bold text-sm tracking-widest mb-1">ABSENSI HARI INI</p>
                    <p className="text-5xl font-black text-[#1a1c2e]">
                      {attendance.filter(a => a.tanggal === new Date().toLocaleDateString('id-ID')).length}
                    </p>
                  </div>
                </div>
                <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 flex flex-col justify-between group hover:shadow-2xl hover:shadow-pink-500/5 transition-all duration-500">
                  <div className="bg-pink-50 w-16 h-16 rounded-3xl flex items-center justify-center text-pink-600 mb-6 group-hover:scale-110 transition-transform">
                    <AlertCircle className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-gray-400 font-bold text-sm tracking-widest mb-1">TOTAL IZIN/SAKIT</p>
                    <p className="text-5xl font-black text-[#1a1c2e]">
                      {attendance.filter(a => [AttendanceStatus.IZIN, AttendanceStatus.SAKIT].includes(a.status)).length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-[#1a1c2e] text-white p-12 rounded-[50px] shadow-2xl relative overflow-hidden">
                <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
                  <div className="space-y-4">
                    <h3 className="text-3xl font-black tracking-tight">Butuh Rekapitulasi Tahunan?</h3>
                    <p className="text-gray-400 max-w-md font-medium">Tarik seluruh data database absensi mulai dari awal semester hingga hari ini dalam format Excel.</p>
                  </div>
                  <button 
                    onClick={exportAttendanceToExcel}
                    className="flex items-center gap-3 bg-emerald-500 text-white px-10 py-5 rounded-3xl font-black shadow-xl hover:bg-emerald-600 hover:scale-105 active:scale-95 transition-all"
                  >
                    <FileSpreadsheet className="w-6 h-6" />
                    DOWNLOAD LAPORAN EXCEL
                  </button>
                </div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/3" />
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <h2 className="text-3xl font-black text-[#1a1c2e]">Manajemen Data Siswa</h2>
                <label className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 cursor-pointer shadow-xl shadow-purple-200 transition-all">
                  <Upload className="w-5 h-5" />
                  BATCH UPLOAD (CSV)
                  <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>

              {csvPreview.length > 0 && (
                <div className="bg-yellow-50 border-2 border-yellow-200 p-8 rounded-[40px] space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-black text-yellow-800">Preview Data Unggahan</h3>
                      <p className="text-yellow-700">Ditemukan {csvPreview.length} calon siswa baru.</p>
                    </div>
                    <div className="flex gap-4">
                      <button onClick={() => setCsvPreview([])} className="bg-white text-gray-500 px-6 py-2 rounded-xl font-bold border border-gray-200">Batalkan</button>
                      <button onClick={confirmUpload} className="bg-yellow-800 text-white px-8 py-2 rounded-xl font-bold shadow-lg">Konfirmasi & Simpan</button>
                    </div>
                  </div>
                  <div className="bg-white rounded-3xl overflow-hidden border border-yellow-100 max-h-60 overflow-y-auto">
                    <table className="w-full text-left">
                      <thead className="bg-yellow-100/50 sticky top-0">
                        <tr>
                          <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-yellow-800">Nama</th>
                          <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-yellow-800">Email</th>
                          <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-yellow-800">Kelas</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-yellow-50">
                        {csvPreview.map((p, i) => (
                          <tr key={i}>
                            <td className="px-6 py-3 text-sm font-bold text-yellow-900">{p.nama}</td>
                            <td className="px-6 py-3 text-sm text-yellow-700">{p.email}</td>
                            <td className="px-6 py-3 text-sm font-mono text-yellow-800">{p.kelas}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input 
                      type="text" 
                      placeholder="Cari siswa berdasarkan nama/email..."
                      className="w-full pl-12 pr-6 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-purple-500 transition-all font-medium"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <p className="text-sm font-bold text-gray-400 italic">Total Siswa Terdaftar: {students.length}</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Siswa</th>
                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Kelas</th>
                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Kontak Wali</th>
                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredStudents.map(s => (
                        <tr key={s.uid} className="hover:bg-gray-50/50 transition-colors group">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                              <img src={s.faceImageUrl || 'https://picsum.photos/100'} className="w-12 h-12 rounded-2xl border-2 border-white shadow-md group-hover:scale-110 transition-transform" alt="Face"/>
                              <div>
                                <p className="font-black text-[#1a1c2e]">{s.nama}</p>
                                <p className="text-xs text-gray-500">{s.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl font-black text-xs">{s.kelas}</span>
                          </td>
                          <td className="px-8 py-6 text-sm text-gray-500 font-medium">{s.waliEmail}</td>
                          <td className="px-8 py-6">
                            <button className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all">
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
               <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                  <h2 className="text-3xl font-black text-[#1a1c2e]">Logs Database Absensi</h2>
                  <p className="text-gray-500 text-sm mt-1">Seluruh riwayat kehadiran siswa yang tercatat di sistem.</p>
                </div>
                <button 
                  onClick={exportAttendanceToExcel}
                  className="flex items-center gap-3 bg-emerald-50 text-emerald-700 border border-emerald-200 px-6 py-3 rounded-2xl font-black shadow-sm hover:bg-emerald-100 transition-all"
                >
                  <FileSpreadsheet className="w-5 h-5" />
                  EKSPOR EXCEL
                </button>
              </div>

              <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-[#1a1c2e] text-white/50">
                      <tr>
                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest">Waktu Presensi</th>
                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest">Siswa & Kelas</th>
                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest">Metode & Akurasi</th>
                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {attendance.slice().reverse().map(a => (
                        <tr key={a.id} className="hover:bg-gray-50/50">
                          <td className="px-8 py-6">
                            <p className="text-sm font-black text-[#1a1c2e]">{a.tanggal}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase">{new Date(a.timestamp).toLocaleTimeString('id-ID')}</p>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-400 text-xs">
                                {a.nama.split(' ').map(n => n[0]).join('')}
                              </div>
                              <div>
                                <p className="text-sm font-black text-[#1a1c2e]">{a.nama}</p>
                                <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest">{a.kelas}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-gray-400 uppercase">Face Recognition:</span>
                                <span className="text-[10px] font-black text-emerald-600">{(a.faceMatchScore * 100).toFixed(0)}%</span>
                              </div>
                              <div className="w-24 h-1 bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-emerald-500" 
                                  style={{ width: `${a.faceMatchScore * 100}%` }}
                                />
                              </div>
                              <span className="text-[10px] font-bold text-gray-400">Jarak: {a.distance.toFixed(1)}m</span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                             <span className={`px-4 py-1.5 rounded-2xl text-[10px] font-black tracking-widest uppercase border ${
                                a.status === AttendanceStatus.HADIR ? 'bg-green-100 text-green-700 border-green-200' :
                                a.status === AttendanceStatus.IZIN ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                                a.status === AttendanceStatus.SAKIT ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-red-100 text-red-700 border-red-200'
                              }`}>
                                {a.status}
                              </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {attendance.length === 0 && (
                    <div className="p-20 text-center text-gray-400 italic font-medium">
                      Belum ada data absensi yang tercatat di database.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SuperAdminDashboard;
