
import React, { useState, useEffect } from 'react';
import { User, AttendanceRecord, Role, AttendanceStatus } from '../types';
import { db } from '../services/mockDb';
import { 
  Users, Calendar, Filter, Download, Search, 
  LogOut, Edit2, Check
} from 'lucide-react';

const GuruDashboard: React.FC<{ user: User; onLogout: () => void }> = ({ user, onLogout }) => {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [filterKelas, setFilterKelas] = useState(user.assignedClasses?.[0] || '');
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    setAttendance(db.getAttendance());
  }, []);

  const filtered = attendance.filter(a => a.kelas === filterKelas);

  const updateStatus = (id: string, s: AttendanceStatus) => {
    db.updateAttendanceStatus(id, s);
    setAttendance(db.getAttendance());
    setEditingId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      <aside className="w-full lg:w-72 bg-white border-r p-6 flex flex-col sticky top-0 h-screen">
        <div className="mb-10 flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-xl text-white"><Users /></div>
          <h1 className="text-xl font-bold">GuruDashboard</h1>
        </div>
        <nav className="flex-1 space-y-2">
          <div className="p-4 bg-indigo-50 text-indigo-700 rounded-2xl font-bold flex items-center gap-3">
            <Calendar className="w-5 h-5" /> Presensi Kelas
          </div>
        </nav>
        <button onClick={onLogout} className="mt-auto flex items-center justify-center gap-2 py-3 bg-red-50 text-red-600 rounded-xl font-bold">
          <LogOut className="w-4 h-4" /> Keluar
        </button>
      </aside>

      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold">Kelola Presensi</h2>
              <p className="text-gray-400 font-medium">Monitoring kehadiran siswa kelas ampu.</p>
            </div>
            <select 
              className="p-4 bg-white border border-gray-200 rounded-2xl font-bold outline-none"
              value={filterKelas}
              onChange={e => setFilterKelas(e.target.value)}
            >
              {user.assignedClasses?.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                  <tr>
                    <th className="px-8 py-5">Siswa</th>
                    <th className="px-8 py-5">Tanggal</th>
                    <th className="px-8 py-5">Status</th>
                    <th className="px-8 py-5">Face Verified</th>
                    <th className="px-8 py-5">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.length > 0 ? filtered.map(a => (
                    <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-8 py-5 font-bold text-gray-800">{a.nama}</td>
                      <td className="px-8 py-5 text-sm text-gray-500">{a.tanggal}</td>
                      <td className="px-8 py-5">
                        {editingId === a.id ? (
                          <select 
                            className="p-2 border rounded-lg text-xs outline-none"
                            onChange={(e) => updateStatus(a.id, e.target.value as AttendanceStatus)}
                          >
                            {Object.values(AttendanceStatus).map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        ) : (
                          <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase ${
                            a.status === AttendanceStatus.HADIR ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {a.status}
                          </span>
                        )}
                      </td>
                      <td className="px-8 py-5">
                        {a.verifiedFace ? <span className="text-green-500 font-black text-xs">YA</span> : <span className="text-red-500 font-black text-xs">TIDAK</span>}
                      </td>
                      <td className="px-8 py-5">
                        <button onClick={() => setEditingId(a.id)} className="p-2 text-indigo-400 hover:bg-indigo-50 rounded-lg">
                          <Edit2 className="w-4 h-4"/>
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={5} className="p-20 text-center text-gray-400 italic">Tidak ada data untuk kelas ini.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GuruDashboard;
