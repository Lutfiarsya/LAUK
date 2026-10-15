import { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  Droplets,
  Flame,
  Beef,
  Droplet,
  Wheat,
  Milk,
  Plus,
  CheckCircle2,
} from "lucide-react"

const NUTRIENTS = [
  {
    label: "Kadar gula",
    key: ["Gula (g)"],
    unit: "gram",
    icon: Droplets,
  },
  {
    label: "Energi",
    key: ["Energi (g)"],
    unit: "g",
    icon: Flame,
  },
  {
    label: "Protein",
    key: ["Protein (g)"],
    unit: "gram",
    icon: Beef,
  },
  {
    label: "Lemak",
    key: ["Lemak (g)"],
    unit: "gram",
    icon: Droplet,
  },
  {
    label: "Karbohidrat",
    key: ["Karbohidrat (g)"],
    unit: "gram",
    icon: Wheat,
  },
  {
    label: "Natrium",
    key: ["Garam/Natrium (g)"],
    unit: "gram",
    icon: Milk,
  },
]

const getProductValue = (data, keys) => {
  for (const key of keys) {
    const value = data?.[key]

    if (value !== null && value !== undefined && value !== "") {
      return value
    }
  }

  return null
}

const formatValue = (value) => {
  if (value === null || value === undefined || value === "") {
    return "-"
  }

  const number = Number(value)

  return Number.isFinite(number)
    ? number.toLocaleString("id-ID", {
        maximumFractionDigits: 2,
      })
    : value
}

const DetailGizi = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const [added, setAdded] = useState(false)
  const [error, setError] = useState("")

  // Data dari hasil scan YOLO
  const scanResult = location.state?.scanResult
  const detection =
    location.state?.product || scanResult?.deteksi?.[0]

  const productData = detection?.gizi || {}

  const productName =
    productData["Nama Produk"] ||
    productData["Nama ProdukClass"] ||
    detection?.kelas ||
    "Produk tidak ditemukan"

  // Data gambar hasil scan
  const image = scanResult?.gambar_hasil || null

  // Data tambahan produk
  const brand =
    productData["Brands"] ||
    productData["Merek"] ||
    productData["Brand"] ||
    ""

  const quantity =
    productData["Ukuran"] ||
    productData["Berat"] ||
    productData["quantity"] ||
    ""

  const composition =
    productData["Komposisi"] ||
    productData["Ingredients"] ||
    productData["ingredients_text"] ||
    ""


console.log("Detection:", detection)
console.log("Product data:", productData)
console.log("Kolom gizi:", Object.keys(productData))
  const handleAddConsumption = () => {
    if (!detection?.gizi) {
      setError("Data gizi produk tidak tersedia.")
      return
    }

    try {
      const previous = JSON.parse(
        localStorage.getItem("dailyConsumption") || "[]"
      )

      if (!Array.isArray(previous)) {
        throw new Error("Format data konsumsi tidak valid.")
      }

      const item = {
        id: crypto.randomUUID(),
        nama: productName,
        gizi: productData,
        tanggal: new Date().toISOString(),
      }

      localStorage.setItem(
        "dailyConsumption",
        JSON.stringify([...previous, item])
      )

      setAdded(true)
      setError("")
    } catch (err) {
      console.error("Gagal menyimpan konsumsi:", err)
      setError("Gagal menyimpan data konsumsi harian.")
    }
  }

  if (!detection) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] font-['Poppins'] flex items-center justify-center p-6">
        <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-sm">
          <h1 className="text-lg font-semibold">
            Produk tidak ditemukan
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Silakan lakukan scan produk terlebih dahulu.
          </p>

          <button
            onClick={() => navigate(-1)}
            className="mt-5 w-full rounded-xl bg-orange-500 py-3 text-sm font-medium text-white"
          >
            Kembali ke Scan
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-['Poppins'] text-gray-900">
      <div style={{paddingBottom: 120}} className="mx-auto min-h-screen w-full max-w-md bg-white px-5 pb-8 pt-6 shadow-sm">

        {/* Header */}
        <header className="mb-5 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            aria-label="Kembali"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition hover:bg-gray-100"
          >
            <ArrowLeft size={20} />
          </button>

          <div>
            <h1 className="text-lg font-semibold text-orange-500">
              Ingredients Result
            </h1>

            <p className="text-xs text-gray-500">
              A detailed breakdown of the scanned item.
            </p>
          </div>
        </header>

        {/* Product Card */}
<section className="overflow-hidden rounded-xl border border-gray-200">
  {image ? (
    <img
      src={image}
      alt={productName}
      className="w-full h-auto object-contain"
    />
          ) : (
            <div className="flex h-40 items-center justify-center bg-gray-100">
              <Milk size={44} className="text-gray-300" />
            </div>
          )}

          <div className="p-3">
            <h2 className="text-base font-semibold">
              {productName}
            </h2>

            {brand && (
              <p className="mt-0.5 text-xs text-gray-500">
                {brand}
              </p>
            )}

            {quantity && (
              <p className="mt-2 text-sm text-gray-500">
                {quantity}
              </p>
            )}

            {detection.conf !== undefined && (
              <p className="mt-2 text-[11px] text-gray-400">
                Akurasi keyakinan deteksi:{" "}
                {(detection.conf * 100).toFixed(1)}%
              </p>
            )}
          </div>
        </section>

        {/* Nutrition Information */}
        <section className="mt-4">
          <h2 className="mb-3 text-sm font-semibold">
            Informasi Nilai Gizi
          </h2>

          <div className="grid grid-cols-2 gap-2.5">
            {NUTRIENTS.map((nutrient) => {
              const Icon = nutrient.icon

              const rawValue = getProductValue(
                productData,
                nutrient.key
              )

              const value = formatValue(rawValue)

              return (
                <div
                  key={nutrient.label}
                  className="flex min-h-[68px] items-center gap-2.5 rounded-xl border border-gray-200 p-3"
                >
                  <Icon
                    size={20}
                    strokeWidth={1.8}
                    className="shrink-0 text-orange-500"
                  />

                  <div className="min-w-0">
                    <p className="text-[10px] text-gray-500">
                      {nutrient.label}
                    </p>

                    <p className="mt-0.5 break-words text-sm font-semibold">
                      {value === "-" ? "-" : `${value} ${nutrient.unit}`}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          <p className="mt-2 text-[10px] leading-4 text-gray-400">
            Nilai gizi mengikuti data produk yang tersedia.
            Pastikan satuan dan takaran saji sesuai label kemasan.
          </p>
        </section>

        {/* Product Composition */}
        <section className="mt-5">
          <h2 className="text-base font-semibold text-orange-500">
            Komposisi Produk
          </h2>

          {composition ? (
            <p className="mt-2 whitespace-pre-line text-xs leading-6 text-gray-600">
              {composition}
            </p>
          ) : (
            <p className="mt-2 text-xs leading-5 text-gray-400">
              Informasi komposisi belum tersedia di dataset produk.
            </p>
          )}
        </section>

        {/* Error Message */}
        {error && (
          <div className="mt-4 rounded-lg bg-red-50 p-3 text-xs text-red-600">
            {error}
          </div>
        )}

        {/* Actions */}
        <section className="mt-6 space-y-2.5">
          <button
            onClick={handleAddConsumption}
            disabled={added}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-3 text-sm font-medium text-white transition hover:bg-orange-600 disabled:bg-green-600"
          >
            {added ? (
              <>
                <CheckCircle2 size={17} />
                Berhasil Ditambahkan
              </>
            ) : (
              <>
                <Plus size={17} />
                Tambahkan Konsumsi Harian
              </>
            )}
          </button>

          <button
            onClick={() => navigate(-1)}
            className="w-full rounded-xl border border-orange-400 py-3 text-sm font-medium text-orange-500 transition hover:bg-orange-50"
          >
            Batal
          </button>
        </section>
      </div>
    </div>
  )
}

export default DetailGizi