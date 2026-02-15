
import React, { useState, useEffect } from 'react';
import { User, AttendanceStatus, AttendanceRecord } from '../types';
import { db } from '../services/mockDb';
import { 
  SCHOOL_COORDS, SCHOOL_ADDRESS, MAX_RADIUS_METERS, 
  ACCURACY_THRESHOLD_METERS, calculateDistance, getCurrentLocation 
} from '../services/locationService';
import FaceScanner from '../components/FaceScanner';
import { 
  LogOut, MapPin, CheckCircle, Clock, 
  History, Navigation, Send, Info, ScanFace, 
  ShieldCheck, AlertTriangle, XCircle, Map as MapIcon,
  Satellite, RefreshCw, ChevronRight, Calendar, Lock
} from 'lucide-react';

const StudentDashboard: React.FC<{ user: User; onLogout: () => void }> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'absen' | 'history'>('absen');
  const [location, setLocation] = useState<{ lat: number; lng: number; dist: number; accuracy: number } | null>(null);
  const [locError, setLocError] = useState<string | null>(null);
  const [faceDistance, setFaceDistance] = useState<number | null>(null);
  const [isFaceVerified, setIsFaceVerified] = useState(false);
  const [status, setStatus] = useState<AttendanceStatus>(AttendanceStatus.HADIR);
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    checkLocation();
    refreshHistory();
  }, [user.uid]);

  const refreshHistory = () => {
    const data = db.getAttendance().filter(a => a.userId === user.uid).sort((a, b) => b.timestamp - a.timestamp);
    setHistory(data);
  };

  const checkLocation = async () => {
    setIsRefreshing(true);
    setLocError(null);
    try {
      const pos = await getCurrentLocation();
      const dist = calculateDistance(pos.coords.latitude, pos.coords.longitude, SCHOOL_COORDS.lat, SCHOOL_COORDS.lng);
      setLocation({ 
        lat: pos.coords.latitude, 
        lng: pos.coords.longitude, 
        dist,
        accuracy: pos.coords.accuracy
      });
    } catch (err: any) {
      setLocError("Gagal mengunci GPS. Pastikan izin lokasi aktif dan sinyal kuat.");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleScanComplete = (distance: number) => {
    setFaceDistance(distance);
    setIsFaceVerified(distance < 0.60);
  };

  const handleAbsen = () => {
    // SECURITY CHECK: Lokasi Terdeteksi?
    if (!location) {
      alert("Error Keamanan: Sinyal GPS tidak ditemukan.");
      return;
    }
    
    // SECURITY CHECK: Radius Geofencing?
    if (location.dist > MAX_RADIUS_METERS) {
      alert(`Keamanan: Anda berada di luar area sekolah (${location.dist.toFixed(0)}m).`);
      return;
    }

    // SECURITY CHECK: Akurasi Sinyal (Anti-Spoofing)
    if (location.accuracy > ACCURACY_THRESHOLD_METERS) {
      alert("Keamanan: Sinyal GPS lemah atau terdeteksi manipulasi. Harap ke tempat terbuka.");
      return;
    }
    
    // SECURITY CHECK: Biometrik Wajah?
    if (!isFaceVerified) {
      alert("Keamanan: Verifikasi wajah gagal!");
      return;
    }

    const record: AttendanceRecord = {
      id: 'att-' + Date.now(),
      userId: user.uid,
      nama: user.nama,
      kelas: user.kelas || 'N/A',
      tanggal: new Date().toLocaleDateString('id-ID'),
      status,
      latitude: location.lat,
      longitude: location.lng,
      distance: location.dist,
      timestamp: Date.now(),
      verifiedFace: true,
      faceMatchScore: faceDistance !== null ? (1 - faceDistance) : 0
    };

    db.saveAttendance(record);
    refreshHistory();
    alert("Berhasil! Absensi telah diverifikasi secara biometrik dan geografis.");
    setIsFaceVerified(false);
    setFaceDistance(null);
    setActiveTab('history');
  };

  const isWithinRadius = location && location.dist <= MAX_RADIUS_METERS;
  const isAccuracySecure = location && location.accuracy <= ACCURACY_THRESHOLD_METERS;

  return (
    <div className="min-h-screen bg-[#f8f9fe] flex flex-col md:flex-row">
      <aside className="w-full md:w-72 bg-white border-r border-gray-100 p-8 flex flex-col sticky top-0 md:h-screen z-10 shadow-sm">
        <div className="mb-12 flex items-center gap-4">
          <div className="bg-gradient-to-tr from-[#1a1c2e] to-indigo-800 p-3 rounded-2xl text-white shadow-xl shadow-indigo-100">
            <CheckCircle size={24} />
          </div>
          <h1 className="text-2xl font-black text-[#1a1c2e]">Presensi<span className="text-indigo-600">Pro</span></h1>
        </div>
        
        <nav className="flex-1 space-y-4">
          <button onClick={() => setActiveTab('absen')}
            className={`w-full p-5 rounded-3xl font-black flex items-center gap-4 transition-all duration-300 ${activeTab === 'absen' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'}`}>
            <Navigation className="w-5 h-5" /> <span className="text-sm">Absensi</span>
          </button>
          <button onClick={() => setActiveTab('history')}
            className={`w-full p-5 rounded-3xl font-black flex items-center gap-4 transition-all duration-300 ${activeTab === 'history' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'}`}>
            <History className="w-5 h-5" /> <span className="text-sm">Riwayat Saya</span>
          </button>
        </nav>

        <div className="pt-8 border-t border-gray-100">
          <div className="mb-4 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
             <div className="flex items-center gap-2 text-indigo-700 mb-1">
               <Lock size={12} className="font-black" />
               <span className="text-[10px] font-black uppercase tracking-widest">Secure Session</span>
             </div>
             <p className="text-[10px] text-indigo-600 font-medium">Data dienkripsi secara lokal (AES-256 Mock)</p>
          </div>
          <button onClick={onLogout} className="w-full flex items-center justify-center gap-3 py-4 text-red-500 font-black bg-red-50 hover:bg-red-100 transition-colors rounded-2xl">
            <LogOut className="w-4 h-4" /> Keluar
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-12 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
          {activeTab === 'absen' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-5 space-y-6">
                {/* GPS Card with Security Status */}
                <div className={`p-6 rounded-[32px] border-2 shadow-sm transition-all duration-500 ${
                  isWithinRadius && isAccuracySecure ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Satellite size={20} className={isWithinRadius && isAccuracySecure ? 'text-emerald-600' : 'text-rose-600'} />
                      <span className="text-xs font-black uppercase tracking-wider">Verifikasi Lokasi</span>
                    </div>
                    <button onClick={checkLocation} disabled={isRefreshing} className="bg-white px-4 py-2 rounded-xl text-[10px] font-black text-indigo-600 shadow-sm active:scale-95">
                      {isRefreshing ? 'MEMINDAI...' : 'REFRESH GPS'}
                    </button>
                  </div>

                  {location ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-2xl font-black text-gray-800">{location.dist.toFixed(0)}m</p>
                          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Jarak ke Sekolah</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${isWithinRadius ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                            {isWithinRadius ? '✓ AREA VALID' : '✗ DI LUAR AREA'}
                          </p>
                        </div>
                      </div>
                      
                      <div className={`p-4 rounded-2xl border ${isAccuracySecure ? 'bg-white/50 border-emerald-200' : 'bg-rose-100 border-rose-200 animate-pulse'}`}>
                        <div className="flex justify-between mb-2">
                          <span className="text-[10px] font-black text-gray-400 uppercase">Akurasi Sinyal</span>
                          <span className={`text-[10px] font-black ${isAccuracySecure ? 'text-emerald-600' : 'text-rose-600'}`}>
                            ±{location.accuracy.toFixed(1)}m {isAccuracySecure ? '(Aman)' : '(Lemah)'}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div className={`h-full transition-all duration-1000 ${isAccuracySecure ? 'bg-emerald-500' : 'bg-rose-500'}`} 
                               style={{ width: `${Math.max(5, 100 - (location.accuracy))}%` }} />
                        </div>
                        {!isAccuracySecure && (
                          <p className="text-[9px] text-rose-700 font-bold mt-2 uppercase tracking-tight">Peringatan: Sinyal terlalu lemah untuk verifikasi kehadiran.</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-[10px] font-black text-gray-400 animate-pulse uppercase">Mengunci Koordinat GPS...</p>
                    </div>
                  )}
                </div>

                <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Keterangan Presensi</label>
                    <div className="grid grid-cols-1 gap-2">
                      {[AttendanceStatus.HADIR, AttendanceStatus.IZIN, AttendanceStatus.SAKIT].map((s) => (
                        <button key={s} onClick={() => setStatus(s)}
                          className={`p-4 rounded-2xl text-left font-black text-xs transition-all flex items-center justify-between border ${status === s ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white text-gray-500'}`}>
                          {s} {status === s && <CheckCircle className="w-4 h-4" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button onClick={handleAbsen} disabled={!isFaceVerified || !isWithinRadius || !isAccuracySecure}
                    className="w-full bg-[#1a1c2e] disabled:bg-gray-100 disabled:text-gray-400 text-white font-black py-5 rounded-[24px] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3">
                    <Send size={18} /> KIRIM ABSENSI AMAN
                  </button>
                </div>
              </div>

              <div className="lg:col-span-7">
                <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
                  <FaceScanner onScanComplete={handleScanComplete} targetImage={user.faceImageUrl || 'https://i.pravatar.cc/150'} />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <h2 className="text-3xl font-black text-[#1a1c2e]">Riwayat Kehadiran Terverifikasi</h2>
              <div className="grid grid-cols-1 gap-4">
                {history.map((a) => (
                  <div key={a.id} className="bg-white p-6 rounded-[32px] border border-gray-100 flex items-center justify-between group">
                    <div className="flex items-center gap-5">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black ${a.status === AttendanceStatus.HADIR ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {a.status[0]}
                      </div>
                      <div>
                        <p className="text-sm font-black text-[#1a1c2e]">{a.tanggal}</p>
                        <div className="flex items-center gap-2">
                          <ShieldCheck size={10} className="text-emerald-500" />
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Biometrik: {(a.faceMatchScore * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-black px-4 py-1.5 bg-gray-50 rounded-xl text-gray-500 uppercase">{a.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
