import { useMemo, useState } from "react"
import { widthResponsive, heightResponsive } from "../helper"
import LineChart from "../Utils/LineChart"
import BarChart from "../Utils/BarChart"
import Dropdown from "../Utils/Button"

const progressData = [
  { label: "01.01", value: 12 },
  { label: "02.01", value: 60 },
  { label: "03.01", value: 100 },
  { label: "04.01", value: 30 },
  { label: "05.01", value: 22 },
  { label: "06.01", value: 10 },
  { label: "07.01", value: 38 },
  { label: "08.01", value: 3 },
  { label: "09.01", value: 10 },
]

const toBars = (labels, values) => labels.map((label, i) => ({ label, value: values[i] }))

// Key harus sama persis dengan opsi di Dropdown
const intakeByPeriod = {
  Harian: toBars(["S", "M", "T", "W", "T", "F", "S"], [90, 130, 260, 282, 200, 265, 180]),
  Mingguan: toBars(["W1", "W2", "W3", "W4"], [210, 265, 240, 282]),
  Bulanan: toBars(["M", "A", "M", "J", "J", "A", "S"], [180, 220, 260, 240, 282, 250, 200]),
}

const Insight = () => {
  const [active, setActive] = useState(6)
  const [period, setPeriod] = useState("Harian")
  const [activeBar, setActiveBar] = useState(3)

  const barData = intakeByPeriod[period]
  const average = useMemo(
    () => Math.round(barData.reduce((sum, d) => sum + d.value, 0) / barData.length),
    [barData]
  )

  const changePeriod = (p) => {
    setPeriod(p)
    setActiveBar(3)
  }

  return (
    <div
      className="w-screen font-['Poppins'] p-4 flex flex-col items-center gap-8 no-scrollbar"
      style={{ height: "100%", overflowY: "auto", paddingBottom: 110 }}
    >
      <div className="flex flex-col justify-center gap-2" style={{ width: widthResponsive(350), height: heightResponsive(75) }}>
        <h2 className="text-2xl font-semibold">Insight</h2>
        <p className="text-sm text-gray-500">Update berdasarkan hasil scan makanan</p>
      </div>

      {/* Progress */}
      <div className="flex flex-col gap-4" style={{ width: widthResponsive(350) }}>
        <h2 className="text-2xl font-semibold">Progress chart</h2>
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <span className="w-6 h-3 rounded-sm bg-[var(--Primary-color)]" />
          Progress
        </div>
        <LineChart data={progressData} year={2026} activeIndex={active} onActive={setActive} />
      </div>

      {/* Intake */}
      <div className="flex flex-col gap-4" style={{ width: widthResponsive(350) }}>
        <div className="flex flex-row items-center justify-between">
          <h2 className="text-2xl font-semibold">Nutrisi Intake</h2>
          <Dropdown value={period} onChange={changePeriod} />
        </div>

        <div>
          <p className="text-sm text-gray-500">Rata-rata Gula</p>
          <p className="text-base font-semibold">{average} mg/dL</p>
        </div>

        <div className="pt-8">
          <BarChart data={barData} activeIndex={activeBar} onActive={setActiveBar} />
        </div>
      </div>
    </div>
  )
}

export default Insight