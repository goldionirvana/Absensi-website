
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import cv2
import numpy as np
import base64
from deepface import DeepFace
import os

app = FastAPI()

# Konfigurasi CORS agar bisa diakses dari Frontend browser
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Threshold kecocokan (makin kecil makin ketat)
THRESHOLD = 0.40 

@app.post("/verify-face")
async def verify_face(
    current_frame: str = Form(...), # Base64 string dari kamera
    target_image_url: str = Form(...) # URL foto profil siswa
):
    try:
        # Decode base64 ke OpenCV image
        header, encoded = current_frame.split(",", 1)
        data = base64.b64decode(encoded)
        np_data = np.frombuffer(data, np.uint8)
        img = cv2.imdecode(np_data, cv2.IMREAD_COLOR)
        
        # Simpan sementara untuk perbandingan
        temp_path = "temp_scan.jpg"
        cv2.imwrite(temp_path, img)

        # Verifikasi menggunakan DeepFace (FaceNet model)
        # DeepFace akan mendownload model secara otomatis saat pertama kali jalan
        result = DeepFace.verify(
            img1_path = temp_path, 
            img2_path = target_image_url, 
            model_name = "Facenet",
            distance_metric = "cosine"
        )

        is_match = result["distance"] < THRESHOLD
        
        return {
            "verified": bool(is_match),
            "distance": result["distance"],
            "threshold": THRESHOLD,
            "status": "success"
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/extract-embedding")
async def extract_embedding(file: UploadFile = File(...)):
    # Fungsi untuk mengambil embedding saat registrasi pertama kali
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    # Ambil embedding (vektor wajah)
    embeddings = DeepFace.represent(img, model_name="Facenet")
    return {"embedding": embeddings[0]["embedding"]}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
