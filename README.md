# LAUK 

**LAUK** merupakan aplikasi pemindaian produk makanan dan minuman berbasis kecerdasan buatan (*Artificial Intelligence*). Aplikasi ini dirancang untuk membantu pengguna mengenali produk serta memperoleh informasi kandungan gizi melalui pemrosesan gambar.

Dengan menggabungkan teknologi *computer vision* dan dataset informasi gizi, LAUK membantu pengguna memahami kandungan nutrisi produk sebagai bahan pertimbangan dalam memilih makanan dan minuman.

## Fitur Utama

- **Deteksi Produk Berbasis AI** — Mengenali produk makanan dan minuman melalui gambar menggunakan model YOLO.
- **Informasi Kandungan Gizi** — Menampilkan informasi energi, gula, natrium, lemak, protein, dan karbohidrat berdasarkan data produk yang tersedia.
- **Pencocokan Data Produk** — Menghubungkan hasil deteksi model dengan dataset untuk memperoleh informasi produk yang sesuai.
- **Informasi Produk** — Menampilkan nama produk, merek, komposisi, ukuran, dan kategori apabila tersedia dalam dataset.
- **Informasi Grade Gizi** — Menampilkan grade gizi produk berdasarkan data yang tersedia.
- **Chabot Assistant** — Membantu pengguna untuk berkonsultasi terkait produk ataupun pantangan lainnya.

## Teknologi yang Digunakan

| Teknologi | Kegunaan |
|---|---|
| React.js | Membangun antarmuka pengguna aplikasi. |
| Tailwind CSS | Mengatur tampilan dan responsivitas antarmuka. |
| Python | Menangani logika backend dan pemrosesan gambar. |
| FastAPI | Menyediakan API untuk menghubungkan frontend dengan backend. |
| YOLO | Menggunakan YOLOV8n untuk Mendeteksi produk melalui gambar. |
| Pandas | Mengolah dan memproses data informasi gizi. |
| OpenPyXL | Membaca dataset informasi gizi dalam format Excel. |
| Google AI Studio | Platform yang digunakan untuk mengakses dan mengintegrasikan model AI pada chatbot. |
| Gemini Flash | Model AI yang mendukung interaksi percakapan dan memberikan respons terhadap pertanyaan pengguna. |
| Ngrok | Mengekspos server frontend lokal ke internet melalui URL publik sehingga aplikasi dapat diakses tanpa harus menjalankan frontend pada server hosting. |

## Cara Kerja Aplikasi

1. **Pemindaian Produk** — Pengguna mengunggah gambar produk makanan atau minuman.
2. **Deteksi Gambar** — Backend memproses gambar menggunakan model YOLO untuk mengenali produk.
3. **Pencocokan Data** — Kelas produk hasil deteksi dicocokkan dengan data produk yang tersedia.
4. **Pengambilan Informasi Gizi** — Sistem mengambil informasi produk dan kandungan gizinya dari dataset.
5. **Penampilan Hasil** — Hasil deteksi dan informasi gizi dikirim melalui API untuk ditampilkan pada frontend.

## Struktur Proyek

```text
LAUK/
├── FE/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
├── Backend/
│   ├── main/
│   │   └── app.py
│   ├── models/
│   │   └── best.pt
│   ├── dataset/
│   │   └── KandunganGiziProduct.xlsx
│   ├── test/
│   └── ...
```

## Instalasi dan Menjalankan Aplikasi

### Persyaratan

Pastikan perangkat telah memiliki:

- Node.js dan npm
- Python
- pip

### 1. Unduh Proyek

```bash
git clone <URL-REPOSITORY>
cd LAUK
```

### 2. Menjalankan Backend

Masuk ke direktori backend:

```bash
cd Backend
```

Buat virtual environment:

```bash
python -m venv .venv
```

Aktifkan virtual environment pada Windows:

```bash
.venv\Scripts\activate
```

Instal dependensi yang diperlukan:

```bash
pip install fastapi "uvicorn[standard]" ultralytics pandas openpyxl python-multipart pillow
```

Jalankan server backend:

```bash
uvicorn main.app:app --reload
```

Backend berjalan pada alamat:

```text
http://127.0.0.1:8000
```

Dokumentasi API dapat diakses melalui:

```text
http://127.0.0.1:8000/docs
```

### 3. Menjalankan Frontend

Buka terminal baru, kemudian masuk ke direktori frontend dari direktori utama proyek:

```bash
cd FE
```

Instal dependensi frontend:

```bash
npm install
```

Jalankan aplikasi:

```bash
npm run dev
```

Menjalankan ngrok (Optional, jika ingin dapat diakses oleh internat)
```bash
ngrok http 5173
```

Buka alamat lokal yang ditampilkan oleh Vite pada terminal untuk mengakses aplikasi.

**Catatan:** Pastikan backend aktif dan konfigurasi alamat API pada frontend sudah sesuai agar fitur pemindaian dapat digunakan.

## Dataset Informasi Gizi

LAUK menggunakan dataset informasi gizi untuk menghubungkan kelas produk hasil deteksi dengan informasi produk yang sesuai.

Dataset mencakup atribut berikut, apabila tersedia:

- Kelas dan nama produk
- Merek dan kategori
- Komposisi produk
- Ukuran produk
- Energi
- Gula
- Natrium
- Lemak
- Protein
- Karbohidrat
- Grade gizi

Informasi yang ditampilkan bergantung pada kelengkapan data setiap produk dalam dataset.

## Tujuan Pengembangan

LAUK dikembangkan untuk mempermudah akses terhadap informasi gizi produk makanan dan minuman melalui teknologi pengenalan gambar. Dengan mengintegrasikan model AI dan dataset informasi gizi, LAUK diharapkan dapat membantu pengguna memperoleh informasi produk secara lebih praktis sebagai bahan pertimbangan dalam menentukan pilihan konsumsi.

## Pengembangan

LAUK dikembangkan menggunakan React.js pada sisi frontend serta Python dan FastAPI pada sisi backend. Model YOLO digunakan untuk mendeteksi produk, sedangkan dataset informasi gizi digunakan untuk menyajikan informasi produk berdasarkan hasil deteksi.
