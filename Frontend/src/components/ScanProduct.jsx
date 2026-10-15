import { useState } from "react"
import useCamera from "../Utils/UseCamera"
import { useNavigate } from "react-router"

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"

const MESSAGES = {
  loading: "Meminta izin kamera...",
  denied: "Izin kamera ditolak. Aktifkan lewat ikon gembok di address bar (Izin situs → Kamera), lalu coba lagi.",
  unsupported: "Kamera tidak didukung. Pastikan web dibuka lewat HTTPS.",
  error: "Kamera tidak bisa dibuka. Pastikan tidak sedang dipakai aplikasi lain.",
}

const ScanProduct = () => {
  const { videoRef, status, retry } = useCamera()

  const granted = status === "granted"

  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState("")
  const [result, setResult] = useState(null)

  const navigate = useNavigate()

const handleScan = async () => {
  const video = videoRef.current

  if (!video || !video.videoWidth || !video.videoHeight) {
    setError("Kamera belum siap. Coba tunggu beberapa saat.")
    return
  }

  setScanning(true)
  setError("")

  try {
    // Ambil gambar dari kamera
    const canvas = document.createElement("canvas")

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const context = canvas.getContext("2d")
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Konversi gambar menjadi JPEG
    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (file) => {
          if (file) resolve(file)
          else reject(new Error("Gagal mengambil gambar."))
        },
        "image/jpeg",
        0.9
      )
    })

    // Siapkan gambar untuk backend
    const formData = new FormData()
    formData.append("file", blob, "scan-product.jpg")

    // Kirim ke FastAPI
const response = await fetch(
  `${import.meta.env.VITE_API_URL || "/api"}/detect?conf=0.4&include_image=true`,
  {
    method: "POST",
    body: formData,
  }
)

    if (!response.ok) {
      const data = await response.json().catch(() => null)

      throw new Error(
        data?.detail || "Gagal mendeteksi produk."
      )
    }

    const data = await response.json()

    // Validasi hasil deteksi
    if (!data.deteksi || data.deteksi.length === 0) {
      setError("Produk tidak terdeteksi. Coba arahkan kamera kembali.")
      return
    }

    // Langsung buka halaman DetailGizi
    navigate("/detail-gizi", {
      state: {
        scanResult: data,
        product: data.deteksi[0],
      },
    })
  } catch (err) {
    console.error(err)

    setError(
      err.message ||
      "Gagal menghubungi backend. Pastikan FastAPI berjalan."
    )
  } finally {
    setScanning(false)
  }
}

  return (
    <div className="relative w-screen min-h-screen bg-black overflow-hidden font-['Poppins']">

      {/* Kamera */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`fixed inset-0 w-full h-full object-cover ${
          granted ? "" : "invisible"
        }`}
      />

      {granted ? (
        <>
          {/* Frame kamera */}
          <div className="fixed inset-x-10 top-24 bottom-40 pointer-events-none">
            <span className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-white rounded-tl-lg" />

            <span className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-white rounded-tr-lg" />

            <span className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-white rounded-bl-lg" />

            <span className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-white rounded-br-lg" />
          </div>

          {/* Tombol scan */}
            <button
              onClick={handleScan}
              disabled={scanning}
              className="absolute bottom-20 left-1/2 -translate-x-1/2 w-[85%] py-3 rounded-lg text-white font-medium bg-[var(--Primary-color)] disabled:opacity-60"
            >
              {scanning ? "Analyzing Product..." : "Check Ingredients"}
            </button>

          {/* Loading */}
          {scanning && (
            <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/50">
              <p className="text-white text-sm">
                Menganalisis produk...
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="fixed top-6 left-5 right-5 z-20 p-4 rounded-xl bg-white text-red-600 text-sm">
              <p>{error}</p>

              <button
                onClick={() => setError("")}
                className="mt-2 font-medium"
              >
                Tutup
              </button>
            </div>
          )}

          {/* Hasil deteksi */}
          {result && (
            <div className="fixed inset-x-0 bottom-0 z-20 max-h-[65vh] overflow-y-auto rounded-t-3xl bg-white p-5">

              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">
                  Hasil Scan
                </h2>

                <button
                  onClick={() => setResult(null)}
                  className="text-sm text-gray-500"
                >
                  Tutup
                </button>
              </div>

              {result.gambar_hasil && (
                <img
                  src={result.gambar_hasil}
                  alt="Hasil deteksi produk"
                  className="w-full max-h-56 object-contain rounded-xl mb-4 bg-gray-100"
                />
              )}

              {result.jumlah_terdeteksi === 0 ? (
                <p className="text-sm text-gray-600">
                  Produk tidak terdeteksi. Coba arahkan kamera
                  ke produk dengan pencahayaan yang lebih baik.
                </p>
              ) : (
                <div className="space-y-4">

                  {/* Daftar produk */}
                  {result.deteksi.map((item, index) => (
                    <div
                      key={`${item.kelas}-${index}`}
                      className="p-4 rounded-xl bg-gray-50"
                    >
                      <h3 className="font-semibold text-gray-900">
                        {item.gizi?.["Nama Produk"] || item.kelas}
                      </h3>

                      <p className="mt-1 text-xs text-gray-500">
                        Confidence: {(item.conf * 100).toFixed(1)}%
                      </p>

                      {!item.gizi && (
                        <p className="mt-2 text-sm text-red-500">
                          Data gizi produk tidak ditemukan di Excel.
                        </p>
                      )}

                      {item.gizi && (
                        <div className="mt-3 space-y-2">
                          {Object.entries(item.gizi).map(([key, value]) => {
                            if (
                              value === null ||
                              value === undefined ||
                              key === "Nama Produk" ||
                              key === "Nama ProdukClass"
                            ) {
                              return null
                            }

                            return (
                              <div
                                key={key}
                                className="flex justify-between gap-4 text-sm"
                              >
                                <span className="text-gray-600">
                                  {key}
                                </span>

                                <span className="font-medium text-gray-900 text-right">
                                  {typeof value === "number"
                                    ? Number(value.toFixed(2))
                                    : value}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Total kandungan gizi */}
                  <div className="p-4 rounded-xl border border-gray-200">
                    <h3 className="font-semibold mb-3">
                      Total Kandungan Gizi
                    </h3>

                    {Object.entries(result.total || {}).map(
                      ([key, value]) => (
                        <div
                          key={key}
                          className="flex justify-between gap-4 py-1 text-sm"
                        >
                          <span className="text-gray-600">
                            {key}
                          </span>

                          <span className="font-medium">
                            {value}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {result.tidak_ada_di_excel?.length > 0 && (
                <p className="mt-4 text-xs text-amber-600">
                  Beberapa kelas belum memiliki data di Excel:{" "}
                  {result.tidak_ada_di_excel.join(", ")}
                </p>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="fixed inset-0 flex flex-col items-center justify-center gap-4 p-8 text-center text-white">
          <p className="text-sm">
            {MESSAGES[status] || MESSAGES.loading}
          </p>

          {status !== "loading" && (
            <button
              onClick={retry}
              className="px-5 py-2 rounded-lg text-sm font-medium bg-[var(--Primary-color)]"
            >
              Coba lagi
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default ScanProduct
