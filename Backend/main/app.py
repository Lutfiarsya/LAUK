
import base64
import io
import json
import re
from pathlib import Path

import pandas as pd
from fastapi import FastAPI, File, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image, ImageOps
from ultralytics import YOLO


#Configuration

BASE = Path(__file__).parent

MODEL_PATH = (BASE / "../models/best.pt").resolve()
EXCEL_PATH = (BASE / "../dataset/KandunganGiziProduct.xlsx").resolve()
TEST_DIR = (BASE / "../test").resolve()

EXT = {".jpg", ".jpeg", ".png"}
KOLOM_KELAS = "Nama ProdukClass"

NUTRITION_COLUMNS = [
    "Energi (g)",
    "Gula (g)",
    "Garam/Natrium (g)",
    "Lemak (g)",
    "Protein (g)",
    "Karbohidrat (g)",
]



# Validation File
if not MODEL_PATH.exists():
    raise FileNotFoundError(f"Model YOLO tidak ditemukan: {MODEL_PATH}")

if not EXCEL_PATH.exists():
    raise FileNotFoundError(f"Dataset Excel tidak ditemukan: {EXCEL_PATH}")


# Call Model ( pake yolov8n )
model = YOLO(str(MODEL_PATH))



# Call excel and Preprocessing
gizi_df = pd.read_excel(EXCEL_PATH)

# Rapikan nama kolom Excel.
gizi_df.columns = [
    str(column).strip()
    for column in gizi_df.columns
]

if KOLOM_KELAS not in gizi_df.columns:
    raise ValueError(
        f"Kolom '{KOLOM_KELAS}' tidak ditemukan. "
        f"Kolom yang tersedia: {list(gizi_df.columns)}"
    )

# Bersihkan nama kelas.
gizi_df[KOLOM_KELAS] = (
    gizi_df[KOLOM_KELAS]
    .astype("string")
    .str.strip()
)

# Hapus baris tanpa nama kelas.
gizi_df = gizi_df[
    gizi_df[KOLOM_KELAS].notna()
    & (gizi_df[KOLOM_KELAS] != "")
    & (gizi_df[KOLOM_KELAS].str.lower() != "nan")
].copy()

# Periksa kelas duplikat.
duplicates = gizi_df[
    gizi_df[KOLOM_KELAS].duplicated(keep=False)
]

if not duplicates.empty:
    raise ValueError(
        "Ada Nama ProdukClass duplikat di Excel:\n"
        f"{duplicates[[KOLOM_KELAS]].to_string(index=False)}"
    )

# Pastikan kolom nutrisi tersedia.
missing_columns = [
    column
    for column in NUTRITION_COLUMNS
    if column not in gizi_df.columns
]

if missing_columns:
    print(
        "PERINGATAN: kolom nutrisi berikut tidak ditemukan:",
        missing_columns,
    )

# Konversi kolom nutrisi ke angka.
for column in NUTRITION_COLUMNS:
    if column in gizi_df.columns:
        gizi_df[column] = pd.to_numeric(
            gizi_df[column],
            errors="coerce",
        )

gizi_df = gizi_df.astype(object).where(
    pd.notna(gizi_df),
    None,
)

# Buat dictionary berdasarkan nama kelas asli.
gizi_df = gizi_df.set_index(KOLOM_KELAS)

GIZI = gizi_df.to_dict(orient="index")



# Normalisasi class yang masih anonim
def normalize_class(value):
    if value is None:
        return ""

    value = str(value).strip().lower()

    return re.sub(r"[^a-z0-9]", "", value)


GIZI_NORMALIZED = {}

for class_name, nutrition in GIZI.items():
    normalized = normalize_class(class_name)

    if normalized in GIZI_NORMALIZED:
        raise ValueError(
            f"{class_name}"
        )

    GIZI_NORMALIZED[normalized] = nutrition

# Match object detection sama excel
def get_nutrition(class_name):
    if class_name in GIZI:
        return GIZI[class_name]

    return GIZI_NORMALIZED.get(
        normalize_class(class_name)
    )



KOLOM_NUMERIK = [
    column
    for column in NUTRITION_COLUMNS
    if column in gizi_df.columns
]


# Validate YOLO Class
_tak_ada = [
    class_name
    for class_name in model.names.values()
    if get_nutrition(class_name) is None
]

if _tak_ada:
    print(
        "PERINGATAN: kelas model tidak ditemukan di Excel:",
        _tak_ada,
    )
else:
    print(
        f"OK: seluruh {len(model.names)} kelas YOLO "
        "memiliki pasangan data Excel."
    )

print("Kolom nutrisi yang digunakan:", KOLOM_NUMERIK)
print("Jumlah produk di Excel:", len(GIZI))


# Image Processing
def proses_gambar(
    im,
    filename="",
    conf=0.4,
    stretch=False,
    include_image=False,
):
    im = ImageOps.exif_transpose(im).convert("RGB")

    if stretch:
        im = im.resize((640, 640))

    result = model.predict(
        im,
        conf=conf,
        verbose=False,
    )[0]

    deteksi = []
    tidak_ada = []

    total = {
        column: 0.0
        for column in KOLOM_NUMERIK
    }

    # Gunakan kotak deteksi YOLO yang dinormalisasi.
    for box, class_id, score in zip(
        result.boxes.xyxyn.tolist(),
        result.boxes.cls.tolist(),
        result.boxes.conf.tolist(),
    ):
        kelas = model.names[int(class_id)]

        gizi = get_nutrition(kelas)

        if gizi is None:
            tidak_ada.append(kelas)

        else:
            for column in KOLOM_NUMERIK:
                value = gizi.get(column)

                if value is not None:
                    try:
                        total[column] += float(value)
                    except (TypeError, ValueError):
                        pass

        deteksi.append({
            "kelas": kelas,
            "conf": round(float(score), 3),
            "bbox": [
                round(float(value), 4)
                for value in box
            ],
            "gizi": gizi,
        })

    hasil = {
        "filename": filename,
        "jumlah_terdeteksi": len(deteksi),
        "deteksi": deteksi,
        "total": (
            {
                column: round(value, 2)
                for column, value in total.items()
            }
            if deteksi
            else {}
        ),
        "tidak_ada_di_excel": sorted(set(tidak_ada)),
        "gambar_hasil": None,
    }

    if include_image:
        buffer = io.BytesIO()

        annotated = result.plot()[:, :, ::-1]

        Image.fromarray(annotated).save(
            buffer,
            format="JPEG",
            quality=85,
        )

        hasil["gambar_hasil"] = (
            "data:image/jpeg;base64,"
            + base64.b64encode(buffer.getvalue()).decode("utf-8")
        )

    return hasil



# Configuration FAST API
app = FastAPI(title="Nutrition Insight API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "https://kiln-library-parmesan.ngrok-free.dev",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)



# Endpoint Kandungan Gizi
@app.get("/health")
def health():
    return {
        "status": "ok",
        "jumlah_kelas": len(model.names),
        "jumlah_produk_excel": len(GIZI),
        "kolom_gizi": KOLOM_NUMERIK,
        "kelas_tidak_ada_di_excel": _tak_ada,
    }


# List YOLO Class
@app.get("/kelas")
def daftar_kelas():
    return {
        "kelas": list(model.names.values())
    }



# Debug inspect Data
@app.get("/debug/produk/{nama_kelas}")
def debug_produk(nama_kelas: str):
    gizi = get_nutrition(nama_kelas)

    return {
        "kelas_diminta": nama_kelas,
        "ditemukan": gizi is not None,
        "kolom_excel": list(gizi_df.columns),
        "kolom_numerik": KOLOM_NUMERIK,
        "data_gizi": gizi,
    }


# Detect Product

@app.post("/detect")
async def detect(
    file: UploadFile = File(...),
    conf: float = Query(0.4, ge=0.05, le=0.95),
    stretch: bool = False,
    include_image: bool = True,
):
    try:
        image_bytes = await file.read()

        im = Image.open(
            io.BytesIO(image_bytes)
        )

        im.load()

    except Exception:
        raise HTTPException(
            status_code=400,
            detail="File bukan gambar yang valid",
        )

    return proses_gambar(
        im=im,
        filename=file.filename,
        conf=conf,
        stretch=stretch,
        include_image=include_image,
    )


# Test all images
@app.get("/detect-test")
def detect_test(
    conf: float = 0.4,
    stretch: bool = False,
    include_image: bool = False,
):
    if not TEST_DIR.exists():
        raise HTTPException(
            status_code=404,
            detail=f"Folder tidak ditemukan: {TEST_DIR}",
        )

    hasil = []

    for path in sorted(TEST_DIR.iterdir()):
        if path.suffix.lower() not in EXT:
            continue

        try:
            with Image.open(path) as image:
                image.load()

                result = proses_gambar(
                    im=image.copy(),
                    filename=path.name,
                    conf=conf,
                    stretch=stretch,
                    include_image=include_image,
                )

                hasil.append(result)

        except Exception as error:
            print(
                f"Gagal memproses {path.name}: {error}"
            )

    return hasil
