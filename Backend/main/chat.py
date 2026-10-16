import os
import time

from dotenv import load_dotenv
from google import genai
from google.genai import errors, types

load_dotenv()

# Daftar model dicoba berurutan, dari yang terbaik ke cadangan.
# Atur di .env, pisahkan dengan koma, contoh:
# GEMINI_MODELS=gemini-3.8-flash,gemini-3.7-flash,gemini-3.5-flash,gemini-flash-lite-latest
MODELS = [
    m.strip()
    for m in os.getenv(
        "GEMINI_MODELS",
        "gemini-3.8-flash,gemini-3.7-flash,gemini-3.5-flash,gemini-flash-lite-latest",
    ).split(",")
    if m.strip()
]

# Otomatis membaca GEMINI_API_KEY dari environment variable.
client = genai.Client()

SYSTEM_PROMPT = """Kamu adalah asisten gizi dan kesehatan di aplikasi LAUK, yang membantu
pengguna memilih makanan kemasan, terutama pengguna dengan atau berisiko diabetes.

Gaya jawaban:
- Bahasa Indonesia, hangat, singkat, dan mudah dipahami orang awam.
- Hindari istilah medis rumit; kalau terpaksa dipakai, jelaskan singkat.
- Untuk penjelasan, pakai paragraf pendek atau maksimal 4-5 poin.

Dua jenis pertanyaan, dengan aturan berbeda:

1. Pertanyaan tentang produk (kandungan, grade, aman atau tidak, perbandingan):
   - Gunakan HANYA data produk yang diberikan di bawah.
   - Jangan mengarang angka. Jika datanya tidak ada, katakan terus terang
     bahwa datanya belum tersedia.
   - Jika tidak ada data produk sama sekali, minta pengguna scan produknya dulu.

2. Pertanyaan umum tentang diabetes, gizi, dan gaya hidup sehat (misalnya apa itu
   diabetes tipe 2, penyebab, gejala umum, pencegahan, pola makan, olahraga):
   - Jawab dengan pengetahuan umum yang akurat dan sesuai pedoman kesehatan yang
     diterima luas. Tidak perlu data produk.
   - Jika tidak yakin, katakan tidak yakin; jangan menebak.

Batasan keselamatan:
- Jangan mendiagnosis penyakit atau menyimpulkan seseorang menderita diabetes.
- Jangan menyarankan obat, dosis insulin, atau mengubah atau menghentikan pengobatan.
- Jangan menjanjikan penyembuhan.
- Untuk kondisi pribadi (gula darah tinggi, gejala, kehamilan, penyakit lain,
  atau pengobatan yang sedang dijalani), beri informasi umum lalu sarankan
  konsultasi ke dokter atau ahli gizi.
- Jika pengguna menyebut gejala darurat (sangat lemas, bingung, napas berbau
  buah, muntah terus-menerus, pingsan), sarankan segera ke fasilitas kesehatan.

Di luar topik gizi, diabetes, dan kesehatan (misalnya politik atau kode program),
tolak dengan sopan dan arahkan kembali ke topik kesehatan dan makanan."""


def _generate(contents, config):
    """Coba tiap model berurutan; lewati yang penuh (503), habis (429), atau tidak ada (404)."""
    last_error = None
    for model in MODELS:
        for attempt in range(2):  
            try:
                print(f"[chat] memakai model: {model}")
                return client.models.generate_content(
                    model=model, contents=contents, config=config
                )
            except errors.ServerError as e: 
                last_error = e
                time.sleep(1)
            except errors.ClientError as e:
                last_error = e
                if e.code in (404, 429):  # model tak tersedia
                    break
                raise  
    raise last_error


def answer(messages: list[dict], product: dict | None = None) -> str:
    """messages: [{"role": "user" | "assistant", "content": "..."}]"""
    history = list(messages)
    while history and history[0]["role"] != "user":
        history.pop(0)

    contents = [
        types.Content(
            role="user" if m["role"] == "user" else "model",
            parts=[types.Part(text=m["content"])],
        )
        for m in history
    ]

    system = SYSTEM_PROMPT
    if product:
        # Lebih aman: terima product id lalu ambil data gizinya dari
        # Excel/database kamu di sini, bukan percaya data dari klien.
        system += f"\n\nData produk:\n{product}"

    config = types.GenerateContentConfig(system_instruction=system)
    return _generate(contents, config).text