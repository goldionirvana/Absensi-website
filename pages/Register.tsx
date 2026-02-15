
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Role } from '../types';
import { db } from '../services/mockDb';
import { faceApi } from '../services/api';
import { 
  UserPlus, Camera, Upload, ArrowRight, 
  ShieldCheck, RefreshCw, Mail, Lock, 
  User as UserIcon, GraduationCap 
} from 'lucide-react';

const Register: React.FC<{ onRegister: (user: User) => void }> = ({ onRegister }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    kelas: '10-IPA-1',
    waliEmail: '',
    role: Role.STUDENT,
    password: ''
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("File terlalu besar. Maksimal 2MB.");
        return;
      }
      
      setIsProcessing(true);
      try {
        const reader = new FileReader();
        reader.onloadend = async () => {
          setPreviewImage(reader.result as string);
          await faceApi.extractEmbedding(file);
          setIsProcessing(false);
        };
        reader.readAsDataURL(file);
      } catch (err) {
        console.error(err);
        setIsProcessing(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!previewImage && formData.role === Role.STUDENT) {
      alert("Siswa wajib mengunggah foto profil untuk verifikasi wajah!");
      return;
    }

    const newUser: User = {
      uid: 'u' + Date.now(),
      nama: formData.nama,
      email: formData.email,
      password: formData.password, // Meneruskan password ke database
      role: formData.role,
      kelas: formData.role === Role.STUDENT ? formData.kelas : undefined,
      assignedClasses: formData.role === Role.GURU ? [formData.kelas] : undefined,
      waliEmail: formData.waliEmail,
      faceImageUrl: previewImage || 'https://i.pravatar.cc/150'
    };

    db.saveUser(newUser);
    onRegister(newUser);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fe] flex items-center justify-center p-4 md:p-10">
      <div className="bg-white w-full max-w-6xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col lg:flex-row border border-gray-100">
        
        {/* Sisi Kiri - Branding */}
        <div className="lg:w-5/12 bg-[#1a1c2e] p-10 md:p-16 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="bg-indigo-600 p-4 rounded-3xl w-fit mb-10 shadow-2xl shadow-indigo-900/50">
              <UserPlus size={32} />
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-8 leading-[1.1] tracking-tight">
              Akses Masa Depan<br/>
              <span className="text-indigo-500 underline decoration-indigo-500/30 underline-offset-8">E-Absensi.</span>
            </h2>
            <p className="text-gray-400 font-medium leading-relaxed max-w-sm">
              Sistem presensi cerdas dengan enkripsi biometrik tercanggih untuk akurasi data tanpa kompromi.
            </p>
          </div>
          
          <div className="relative z-10 space-y-4 mt-12 lg:mt-0">
            <div className="bg-white/5 backdrop-blur-md p-6 rounded-[32px] border border-white/10 flex gap-5">
              <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400 shrink-0">
                <ShieldCheck size={24} />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-indigo-400 mb-1">Keamanan Data</p>
                <p className="text-[11px] text-gray-400 font-medium leading-relaxed">Credential Anda disimpan dengan aman menggunakan hash lokal untuk simulasi.</p>
              </div>
            </div>
          </div>

          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/20 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
        </div>

        {/* Sisi Kanan - Form */}
        <div className="lg:w-7/12 p-8 md:p-16 bg-white overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="flex items-center justify-between">
               <div>
                 <h1 className="text-3xl font-black text-[#1a1c2e] tracking-tight">Pendaftaran Akun</h1>
                 <p className="text-sm text-gray-400 font-medium mt-1">Lengkapi data diri Anda dengan benar.</p>
               </div>
               <Link to="/login" className="text-xs font-black text-indigo-600 hover:text-indigo-800 transition-colors uppercase tracking-widest border-b-2 border-indigo-600/20 pb-1">Masuk</Link>
            </div>

            <div className="bg-gray-50/50 p-8 rounded-[40px] border-2 border-dashed border-gray-200 flex flex-col items-center group transition-all hover:border-indigo-300">
              <div className="relative mb-6">
                <div className={`w-36 h-36 rounded-[48px] bg-white flex items-center justify-center overflow-hidden border-4 shadow-2xl transition-all duration-500 ${isProcessing ? 'border-indigo-400 scale-105 rotate-3' : 'border-white group-hover:scale-105'}`}>
                  {isProcessing ? (
                    <RefreshCw className="text-indigo-600 w-10 h-10 animate-spin" />
                  ) : previewImage ? (
                    <img src={previewImage} className="w-full h-full object-cover" alt="Preview" />
                  ) : (
                    <Camera className="text-gray-300 w-12 h-12" />
                  )}
                </div>
                <input required={formData.role === Role.STUDENT} type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                <div className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-3.5 rounded-2xl shadow-xl"><Upload size={18} /></div>
              </div>
              <div className="text-center">
                <p className="text-xs font-black text-[#1a1c2e] uppercase tracking-widest">Identitas Wajah</p>
                <p className="text-[10px] text-gray-400 mt-2 font-medium">Wajib untuk Siswa untuk keperluan Face Recognition.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
                <input required type="text" placeholder="Ahmad Subardjo"
                  className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 transition-all font-bold text-[#1a1c2e]" 
                  value={formData.nama} onChange={e => setFormData({...formData, nama: e.target.value})} />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email</label>
                <input required type="email" placeholder="nama@sekolah.com"
                  className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 transition-all font-bold text-[#1a1c2e]" 
                  value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Password</label>
                <input required type="password" placeholder="••••••••"
                  className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 transition-all font-bold text-[#1a1c2e]" 
                  value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Wali</label>
                <input required={formData.role === Role.STUDENT} type="email" placeholder="ortu@gmail.com"
                  className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 transition-all font-bold text-[#1a1c2e]" 
                  value={formData.waliEmail} onChange={e => setFormData({...formData, waliEmail: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Peran Akses</label>
                <select className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 font-black text-indigo-600 appearance-none cursor-pointer"
                  value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as Role})}>
                  <option value={Role.STUDENT}>SISWA</option>
                  <option value={Role.GURU}>GURU</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Kelas</label>
                <select className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 font-bold text-[#1a1c2e] appearance-none cursor-pointer"
                  value={formData.kelas} onChange={e => setFormData({...formData, kelas: e.target.value})}>
                  <option>10-IPA-1</option>
                  <option>10-IPA-2</option>
                  <option>11-IPA-1</option>
                  <option>11-IPS-1</option>
                  <option>12-IPA-1</option>
                </select>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isProcessing}
              className="w-full bg-indigo-600 hover:bg-[#1a1c2e] disabled:bg-gray-200 text-white font-black py-6 rounded-[32px] shadow-2xl transition-all flex items-center justify-center gap-4 uppercase tracking-[0.2em] text-sm"
            >
              {isProcessing ? 'Memverifikasi Foto...' : 'Daftar Sekarang'} <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
