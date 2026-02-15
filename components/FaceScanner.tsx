
import React, { useRef, useEffect, useState } from 'react';
import { Camera, RefreshCw, Scan, ShieldCheck, AlertCircle } from 'lucide-react';
import { faceApi } from '../services/api';

interface FaceScannerProps {
  onScanComplete: (distance: number) => void;
  targetImage: string;
}

const FaceScanner: React.FC<FaceScannerProps> = ({ onScanComplete, targetImage }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [livenessStep, setLivenessStep] = useState<'idle' | 'blink' | 'verifying'>('idle');

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480, facingMode: 'user' } 
      });
      setStream(s);
      if (videoRef.current) videoRef.current.srcObject = s;
      setError(null);
    } catch (err) {
      setError("Kamera tidak dapat diakses. Pastikan izin diberikan.");
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, []);

  const handleStartProcess = () => {
    setLivenessStep('blink');
    // Simulasi deteksi kedipan (liveness)
    setTimeout(() => {
      captureAndVerify();
    }, 2000);
  };

  const captureAndVerify = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setLivenessStep('verifying');
    setIsScanning(true);

    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const base64Image = canvas.toDataURL('image/jpeg', 0.8);
      
      const result = await faceApi.verifyFace(base64Image, targetImage);
      
      if (result.status === 'success') {
        onScanComplete(result.distance);
      } else {
        setError(result.message || "Gagal memverifikasi wajah.");
      }
    }

    setIsScanning(false);
    setLivenessStep('idle');
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <div className="relative group">
        <div className={`relative w-72 h-72 rounded-[48px] overflow-hidden border-8 transition-all duration-500 shadow-2xl ${
          livenessStep === 'blink' ? 'border-yellow-400 scale-105' : 
          livenessStep === 'verifying' ? 'border-blue-500 animate-pulse' : 'border-white'
        }`}>
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover scale-x-[-1]"
          />
          <canvas ref={canvasRef} className="hidden" />
          
          {/* Overlay scanning line */}
          {isScanning && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="w-full h-1 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)] absolute top-0 animate-[scan_2s_linear_infinite]" />
            </div>
          )}

          {/* Instructions Overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-6 pointer-events-none">
            <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-2xl text-white text-[10px] font-black uppercase tracking-widest border border-white/20">
              {livenessStep === 'idle' && "Posisikan wajah di tengah"}
              {livenessStep === 'blink' && "Silakan berkedip sekarang..."}
              {livenessStep === 'verifying' && "Memverifikasi identitas..."}
            </div>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="absolute -top-4 -right-4 flex gap-2">
          {stream && (
            <div className="bg-green-500 p-2 rounded-xl text-white shadow-lg animate-bounce">
              <ShieldCheck size={20} />
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-500 bg-red-50 px-4 py-2 rounded-xl border border-red-100 text-xs font-bold animate-in fade-in zoom-in">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <button 
        onClick={handleStartProcess}
        disabled={isScanning || !stream}
        className={`w-full max-w-xs flex items-center justify-center gap-3 py-5 rounded-[24px] font-black transition-all shadow-xl active:scale-95 ${
          isScanning ? 'bg-gray-200 text-gray-400' : 'bg-[#1a1c2e] text-white hover:bg-black shadow-indigo-200'
        }`}
      >
        {isScanning ? (
          <RefreshCw className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <Scan size={20} />
            MULAI SCAN WAJAH
          </>
        )}
      </button>

      <style>{`
        @keyframes scan {
          0% { top: 0%; }
          100% { top: 100%; }
        }
      `}</style>
    </div>
  );
};

export default FaceScanner;
