
import React, { useState, useEffect } from 'react';
import { User, AttendanceRecord, Role, AttendanceStatus } from '../types';
import { db } from '../services/mockDb';
import { 
  BarChart3, Users, Calendar, Download, Search, 
  Trash2, Upload, LogOut, Filter, CheckCircle, Clock
} from 'lucide-react';

const AdminDashboard: React.FC<{ user: User; onLogout: () => void }> = ({ user, onLogout }) => {
  const [students, setStudents] = useState<User[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [filterKelas, setFilterKelas] = useState('SEMUA');
  const [search, setSearch] = useState('');

  useEffect(() => {
    setStudents(db.getUsers().filter(u => u.role === Role.STUDENT));
    setAttendance(db.getAttendance());
  }, []);

  const filtered = attendance.filter(a => {
    const matchKelas = filterKelas === 'SEMUA' || a.kelas === filterKelas;
    const matchSearch = a.nama.toLowerCase().includes(search.toLowerCase());
    return matchKelas && matchSearch;
  });

  const exportCSV = () => {
    const headers = ["Nama", "Kelas", "Tanggal", "Status", "Jarak(m)"];
    const rows = filtered.map(r => [r.nama, r.kelas, r.tanggal, r.status, r.distance.toFixed(1)]);
    const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "rekap_absen_global.csv";
    link.click();
  };

  const stats = {
    hadir: filtered.filter(a => a.status === AttendanceStatus.HADIR).length,
    izin: filtered.filter(a => a.status !== AttendanceStatus.HADIR).length,
    total: students.length
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      <aside className="w-full lg:w-72 bg-[#1a1c2e] text-white flex flex-col p-6 sticky top-0 h-screen">
        <div className="mb-10 flex items-center gap-3">
          <div className="bg-blue-500 p-2 rounded-xl text-white"><BarChart3 /></div>
          <h1 className="text-xl font-bold">AdminPro</h1>
        </div>
        <nav className="flex-1 space-y-2">
          <div className="p-4 bg-white/10 rounded-2xl font-bold flex items-center gap-3">
            <BarChart3 className="w-5 h-5" /> Statistik
          </div>
          <div className="p-4 text-gray-400 rounded-2xl font-medium flex items-center gap-3 hover:bg-white/5 cursor-pointer">
            <Users className="w-5 h-5" /> Kelola Siswa
          </div>
          <div className="p-4 text-gray-400 rounded-2xl font-medium flex items-center gap-3 hover:bg-white/5 cursor-pointer">
            <Upload className="w-5 h-5" /> Import Data
          </div>
        </nav>
        <button onClick={onLogout} className="mt-auto flex items-center justify-center gap-2 py-3 bg-red-500/10 text-red-400 rounded-xl font-bold">
          <LogOut className="w-4 h-4" /> Keluar
        </button>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold">Dashboard Statistik</h2>
            <button onClick={exportCSV} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-xl font-bold">
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
              <div className="bg-green-100 w-12 h-12 rounded-2xl flex items-center justify-center text-green-600 mb-4"><CheckCircle /></div>
              <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Hadir Hari Ini</p>
              <p className="text-4xl font-black mt-1">{stats.hadir}</p>
            </div>
            <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
              <div className="bg-yellow-100 w-12 h-12 rounded-2xl flex items-center justify-center text-yellow-600 mb-4"><Clock /></div>
              <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Izin/Sakit</p>
              <p className="text-4xl font-black mt-1">{stats.izin}</p>
            </div>
            <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
              <div className="bg-blue-100 w-12 h-12 rounded-2xl flex items-center justify-center text-blue-600 mb-4"><Users /></div>
              <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Total Siswa</p>
              <p className="text-4xl font-black mt-1">{stats.total}</p>
            </div>
          </div>

          <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-8 border-b flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                  type="text" 
                  placeholder="Cari siswa..." 
                  className="w-full pl-12 pr-6 py-3 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <div className="flex gap-4 w-full md:w-auto">
                <select 
                  className="p-3 bg-gray-50 border-none rounded-xl font-bold text-sm outline-none"
                  value={filterKelas}
                  onChange={e => setFilterKelas(e.target.value)}
                >
                  <option value="SEMUA">Semua Kelas</option>
                  <option value="10-IPA-1">10 IPA 1</option>
                  <option value="10-IPA-2">10 IPA 2</option>
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                  <tr>
                    <th className="px-8 py-4">Siswa</th>
                    <th className="px-8 py-4">Kelas</th>
                    <th className="px-8 py-4">Lokasi (M)</th>
                    <th className="px-8 py-4">Status</th>
                    <th className="px-8 py-4">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map(a => (
                    <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 text-xs">
                            {a.nama[0]}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-800">{a.nama}</p>
                            <p className="text-[10px] text-gray-400">{a.tanggal}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-4 text-sm font-medium text-gray-600">{a.kelas}</td>
                      <td className="px-8 py-4 text-sm text-gray-600">{a.distance.toFixed(1)}m</td>
                      <td className="px-8 py-4">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          a.status === AttendanceStatus.HADIR ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {a.status}
                        </span>
                      </td>
                      <td className="px-8 py-4">
                        <button className="text-red-400 hover:text-red-600 p-2"><Trash2 className="w-4 h-4"/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
