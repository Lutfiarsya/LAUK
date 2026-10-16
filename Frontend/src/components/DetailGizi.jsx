import { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  Beef,
  CheckCircle2,
  Droplet,
  Droplets,
  Flame,
  Milk,
  Plus,
  Wheat,
} from "lucide-react"



const STORAGE_KEY = "dailyConsumption"

const NUTRIENTS = [
  { label: "Kadar gula", keys: ["Gula (g)"], unit: "gram", icon: Droplets },
  { label: "Energi", keys: ["Energi (g)", "Energi (kkal)"], unit: "kkal", icon: Flame },
  { label: "Protein", keys: ["Protein (g)"], unit: "gram", icon: Beef },
  { label: "Lemak", keys: ["Lemak (g)"], unit: "gram", icon: Droplet },
  { label: "Karbohidrat", keys: ["Karbohidrat (g)"], unit: "gram", icon: Wheat },
  { label: "Natrium", keys: ["Garam/Natrium (g)"], unit: "gram", icon: Milk },
]

// Nutri Level Kemenkes (KMK HK.01.07/MENKES/301/2026):
const GRADE_COLORS = {
  A: "#1B8E3E",
  B: "#7CC242",
  C: "#FFC800",
  D: "#E53935",
  E: "#B71C1C",
}

const SUGAR_LIMITS = [
  { grade: "A", max: 1, inclusive: false },
  { grade: "B", max: 5, inclusive: true },
  { grade: "C", max: 10, inclusive: true },
]



const isEmpty = (value) => value === null || value === undefined || value === ""

const pickFirst = (data, keys) => {
  for (const key of keys) {
    if (!isEmpty(data?.[key])) return data[key]
  }
  return null
}

const toNumber = (value) => {
  if (isEmpty(value)) return null
  const number = Number(String(value).replace(",", "."))
  return Number.isFinite(number) ? number : null
}

const formatValue = (value) => {
  if (isEmpty(value)) return "-"
  const number = toNumber(value)
  return number === null
    ? String(value)
    : number.toLocaleString("id-ID", { maximumFractionDigits: 2 })
}

const gradeFromSugar = (data) => {
  const sugar = toNumber(data?.["Gula (g)"])
  const size = toNumber(pickFirst(data, ["Ukuran (ml)", "Ukuran"]))
  if (sugar === null || size === null || size <= 0) return null

  const per100ml = (sugar / size) * 100
  const match = SUGAR_LIMITS.find(({ max, inclusive }) =>
    inclusive ? per100ml <= max : per100ml < max
  )
  return match ? match.grade : "D"
}

const resolveGrade = (data) => {
  const fromDataset = String(data?.Grade ?? "").trim().toUpperCase()
  return GRADE_COLORS[fromDataset] ? fromDataset : gradeFromSugar(data)
}

const saveConsumption = (item) => {
  const previous = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")
  if (!Array.isArray(previous)) {
    throw new Error("Format data konsumsi tidak valid.")
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...previous, item]))
}

const createId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`

const parseDetection = (state) => {
  const scanResult = state?.scanResult
  const detection = state?.product || scanResult?.deteksi?.[0]
  const data = detection?.gizi || {}

  const sizeMl = pickFirst(data, ["Ukuran (ml)"])

  return {
    detection,
    data,
    image: scanResult?.gambar_hasil || null,
    name:
      data["Nama Produk"] ||
      data["Nama ProdukClass"] ||
      detection?.kelas ||
      "Produk tidak ditemukan",
    brand: pickFirst(data, ["Brands", "Merek", "Brand"]) || "",
    category: data["Kategori"] || "",
    quantity:
      pickFirst(data, ["Ukuran", "Berat", "quantity"]) ||
      (sizeMl ? `${sizeMl} ml` : ""),
    composition: pickFirst(data, ["Komposisi", "Ingredients", "ingredients_text"]) || "",
    grade: resolveGrade(data),
  }
}



const GradeBadge = ({ grade }) => (
  <div className="flex shrink-0 flex-col items-center gap-1 pl-3">
    <span className="text-sm text-gray-500">Grade</span>
    <div
      style={{ backgroundColor: GRADE_COLORS[grade] }}
      className="flex h-14 w-14 items-center justify-center rounded-full text-3xl font-bold text-white shadow-md"
      aria-label={`Grade ${grade}`}
    >
      {grade}
    </div>
  </div>
)

const NutrientCard = ({ label, value, unit, icon: Icon }) => (
  <div className="flex min-h-[68px] items-center gap-2.5 rounded-xl border border-gray-200 p-3">
    <Icon size={20} strokeWidth={1.8} className="shrink-0 text-orange-500" />
    <div className="min-w-0">
      <p className="text-[10px] text-gray-500">{label}</p>
      <p className="mt-0.5 break-words text-sm font-semibold">
        {value === "-" ? "-" : `${value} ${unit}`}
      </p>
    </div>
  </div>
)

const ProductCard = ({ image, name, brand, category, quantity, confidence, grade }) => (
  <section className="overflow-hidden rounded-xl border border-gray-200">
    {image ? (
      <img src={image} alt={name} className="h-auto w-full object-contain" />
    ) : (
      <div className="flex h-40 items-center justify-center bg-gray-100">
        <Milk size={44} className="text-gray-300" />
      </div>
    )}

    <div className="flex items-start justify-between p-3">
      <div className="min-w-0 flex-1">
        <h2 className="text-xl font-semibold">{name}</h2>
        {brand && <p className="mt-0.5 text-xs text-gray-500">{brand}</p>}
        {category && <p className="mt-1 text-sm italic text-gray-600">{category}</p>}
        {quantity && <p className="mt-3 text-2xl font-light text-gray-500">{quantity}</p>}
        {confidence !== undefined && (
          <p className="mt-2 text-[11px] text-gray-400">
            Akurasi keyakinan deteksi: {(confidence * 100).toFixed(1)}%
          </p>
        )}
      </div>

      {grade && <GradeBadge grade={grade} />}
    </div>
  </section>
)

const NutritionSection = ({ data }) => (
  <section className="mt-4">
    <h2 className="mb-3 text-sm font-semibold">Informasi Nilai Gizi</h2>

    <div className="grid grid-cols-2 gap-2.5">
      {NUTRIENTS.map(({ label, keys, unit, icon }) => (
        <NutrientCard
          key={label}
          label={label}
          unit={unit}
          icon={icon}
          value={formatValue(pickFirst(data, keys))}
        />
      ))}
    </div>

    <p className="mt-2 text-[10px] leading-4 text-gray-400">
      Nilai gizi mengikuti data produk yang tersedia. Pastikan satuan dan takaran
      saji sesuai label kemasan.
    </p>
  </section>
)

const CompositionSection = ({ composition }) => (
  <section className="mt-5">
    <h2 className="text-base font-semibold text-orange-500">Komposisi Produk</h2>
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
)

const NotFound = ({ onBack }) => (
  <div className="flex min-h-screen items-center justify-center bg-[#F8F9FA] p-6 font-['Poppins']">
    <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-sm">
      <h1 className="text-lg font-semibold">Produk tidak ditemukan</h1>
      <p className="mt-2 text-sm text-gray-500">
        Silakan lakukan scan produk terlebih dahulu.
      </p>
      <button
        onClick={onBack}
        className="mt-5 w-full rounded-xl bg-orange-500 py-3 text-sm font-medium text-white"
      >
        Kembali ke Scan
      </button>
    </div>
  </div>
)



const DetailGizi = () => {
  const navigate = useNavigate()
  const { state } = useLocation()
  const goBack = () => navigate(-1)

  const [added, setAdded] = useState(false)
  const [error, setError] = useState("")

  const product = parseDetection(state)

  const handleAddConsumption = () => {
    if (!product.detection?.gizi) {
      setError("Data gizi produk tidak tersedia.")
      return
    }

    try {
      saveConsumption({
        id: createId(),
        nama: product.name,
        grade: product.grade,
        gizi: product.data,
        tanggal: new Date().toISOString(),
      })
      setAdded(true)
      setError("")
    } catch (err) {
      console.error("Gagal menyimpan konsumsi:", err)
      setError("Gagal menyimpan data konsumsi harian.")
    }
  }

  if (!product.detection) return <NotFound onBack={goBack} />

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-['Poppins'] text-gray-900">
      <div className="mx-auto min-h-screen w-full max-w-md bg-white px-5 pb-[120px] pt-6 shadow-sm">
        <header className="mb-5 flex items-center gap-3">
          <button
            onClick={goBack}
            aria-label="Kembali"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition hover:bg-gray-100"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-orange-500">Ingredients Result</h1>
            <p className="text-xs text-gray-500">
              A detailed breakdown of the scanned item.
            </p>
          </div>
        </header>

        <ProductCard
          image={product.image}
          name={product.name}
          brand={product.brand}
          category={product.category}
          quantity={product.quantity}
          confidence={product.detection.conf}
          grade={product.grade}
        />

        <NutritionSection data={product.data} />
        <CompositionSection composition={product.composition} />

        {error && (
          <div role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-xs text-red-600">
            {error}
          </div>
        )}

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
            onClick={goBack}
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