"""Jalankan: python test_folder.py
Memproses semua foto di folder test/ tanpa perlu menyalakan server,
lalu menyimpan JSON (persis format respons API) dan gambar hasil ke test_out/.
"""
import base64
import json
from pathlib import Path

from PIL import Image

import app  # memuat model + Excel (sekali)

CONF = 0.4
STRETCH = False  # True hanya kalau best.pt adalah model lama (v2 / Stretch)

OUT = app.BASE / "test_out"
OUT.mkdir(exist_ok=True)

files = [p for p in sorted(app.TEST_DIR.iterdir()) if p.suffix.lower() in app.EXT]
if not files:
    raise SystemExit(f"Tidak ada foto di {app.TEST_DIR}")

for p in files:
    hasil = app.proses_gambar(Image.open(p), p.name, CONF, STRETCH, include_image=True)

    # simpan gambar berkotak, lalu buang base64 dari JSON supaya mudah dibaca
    b64 = hasil.pop("gambar_hasil").split(",", 1)[1]
    (OUT / f"{p.stem}_hasil.jpg").write_bytes(base64.b64decode(b64))
    (OUT / f"{p.stem}.json").write_text(
        json.dumps(hasil, indent=2, ensure_ascii=False), encoding="utf-8"
    )

    print(f"\n=== {p.name} | {hasil['jumlah_terdeteksi']} terdeteksi ===")
    for d in hasil["deteksi"]:
        print(f"  {d['kelas']:<28} conf={d['conf']:<5} gizi={'ada' if d['gizi'] else 'TIDAK ADA'}")
    if hasil["total"]:
        print("  total:", hasil["total"])
    if hasil["tidak_ada_di_excel"]:
        print("  !! kelas tidak ada di Excel:", hasil["tidak_ada_di_excel"])

print(f"\nSelesai. JSON dan gambar ada di: {OUT}")