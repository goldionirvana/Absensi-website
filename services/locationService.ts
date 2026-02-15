
// Lokasi Target Sekolah
export const SCHOOL_COORDS = {
  lat: -6.989544,
  lng: 112.377313
};

export const SCHOOL_ADDRESS = "Area Karang Geneng, Lamongan";

// Konfigurasi Keamanan Geofencing
export const MAX_RADIUS_METERS = 200;
export const ACCURACY_THRESHOLD_METERS = 50; // GPS dengan akurasi > 50m akan ditolak (mencegah spoofing kasar)

/**
 * Menghitung jarak antara dua koordinat menggunakan rumus Haversine
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; 
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Mendapatkan posisi perangkat dengan pemaksaan akurasi tinggi
 */
export function getCurrentLocation(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation tidak didukung."));
      return;
    }
    
    const options = {
      enableHighAccuracy: true, // WAJIB: Memaksa penggunaan GPS hardware bukan cell tower
      timeout: 10000,
      maximumAge: 0   
    };

    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });
}
