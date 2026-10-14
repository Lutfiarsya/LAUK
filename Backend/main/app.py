import base64
import io
import json
from pathlib import Path

import pandas as pd
from fastapi import FastAPI, File, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image, ImageOps
from ultralytics import YOLO

# Basic Configuration, lokasi tergantung path
BASE = Path(__file__).parent
MODEL_PATH = (BASE / "../models/best.pt").resolve()
EXCEL_PATH = (BASE / "../dataset/KandunganGiziProduct.xlsx").resolve()
TEST_DIR = (BASE / "../test").resolve()
EXT = {".jpg", ".jpeg", ".png"}
KOLOM_KELAS = "Nama ProdukClass"  

# Call model Yolov8n
model = YOLO(str(MODEL_PATH))

# Preprocessing Excel ( sementara doank ya anj )
gizi_df = pd.read_excel(EXCEL_PATH)
gizi_df[KOLOM_KELAS] = gizi_df[KOLOM_KELAS].astype(str).str.strip()
gizi_df = gizi_df[gizi_df[KOLOM_KELAS].notna() & (gizi_df[KOLOM_KELAS] != "nan")]

dobel = gizi_df[gizi_df[KOLOM_KELAS].duplicated(keep=False)]
if not dobel.empty:
    raise SystemExit(f"Kelas dobel di Excel, perbaiki dulu:\n{dobel[[KOLOM_KELAS]]}")

gizi_df = gizi_df.set_index(KOLOM_KELAS)
GIZI = json.loads(gizi_df.to_json(orient="index"))  
KOLOM_NUMERIK = list(gizi_df.select_dtypes("number").columns)

# Validation Bounding box object dengan dataset gizi product
_tak_ada = [n for n in model.names.values() if n not in GIZI]
if _tak_ada:
    print("PERINGATAN: kelas model yang TIDAK ada di Excel:", _tak_ada)
else:
    print(f"OK: {len(model.names)} kelas model semuanya ada di Excel.")


def proses_gambar(im, filename="", conf=0.4, stretch=False, include_image=False):
    im = ImageOps.exif_transpose(im).convert("RGB")
    if stretch: 
        im = im.resize((640, 640))

    r = model.predict(im, conf=conf, verbose=False)[0]

    deteksi, tidak_ada = [], []
    total = {k: 0 for k in KOLOM_NUMERIK}

    for box, c, s in zip(r.boxes.xyxyn.tolist(), r.boxes.cls.tolist(), r.boxes.conf.tolist()):
        kelas = model.names[int(c)]
        gizi = GIZI.get(kelas)
        if gizi is None:
            tidak_ada.append(kelas)
        else:
            for k in KOLOM_NUMERIK:
                if gizi.get(k) is not None:
                    total[k] += gizi[k]
        deteksi.append(
            {
                "kelas": kelas,
                "conf": round(s, 3),
                "bbox": [round(v, 4) for v in box],
                "gizi": gizi,
            }
        )

    hasil = {
        "filename": filename,
        "jumlah_terdeteksi": len(deteksi),
        "deteksi": deteksi,
        "total": {k: round(v, 2) for k, v in total.items()} if deteksi else {},
        "tidak_ada_di_excel": sorted(set(tidak_ada)),
        "gambar_hasil": None,
    }

    if include_image:
        buf = io.BytesIO()
        Image.fromarray(r.plot()[:, :, ::-1]).save(buf, format="JPEG", quality=85)
        hasil["gambar_hasil"] = "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode()

    return hasil


# Next update ( mo turu )
app = FastAPI(title="Nutrition Insight API")

app.add_middleware(
    # CORS TAI
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {
        "status": "ok",
        "jumlah_kelas": len(model.names),
        "kolom_gizi": KOLOM_NUMERIK,
        "kelas_tidak_ada_di_excel": _tak_ada,
    }


@app.get("/kelas")
def daftar_kelas():
    return {"kelas": list(model.names.values())}


@app.post("/detect")
async def detect(
    file: UploadFile = File(...),
    conf: float = Query(0.4, ge=0.05, le=0.95),
    stretch: bool = False,
    include_image: bool = True,
):
    try:
        im = Image.open(io.BytesIO(await file.read()))
    except Exception:
        raise HTTPException(status_code=400, detail="File bukan gambar yang valid")
    return proses_gambar(im, file.filename, conf, stretch, include_image)


@app.get("/detect-test")
def detect_test(conf: float = 0.4, stretch: bool = False, include_image: bool = False):
    """Jalankan semua foto di folder test/ dan kembalikan JSON-nya (untuk cek data ke FE)."""
    if not TEST_DIR.exists():
        raise HTTPException(status_code=404, detail=f"Folder tidak ditemukan: {TEST_DIR}")
    hasil = []
    for p in sorted(TEST_DIR.iterdir()):
        if p.suffix.lower() in EXT:
            hasil.append(proses_gambar(Image.open(p), p.name, conf, stretch, include_image))
    return hasil