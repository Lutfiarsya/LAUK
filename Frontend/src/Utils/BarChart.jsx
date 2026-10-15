import { memo } from "react";
import ChartToolTip, { alignAt } from "./ChartToolTip";


function BarChart({
  data,
  max = 300,
  ticks = [300, 200, 100, 0],
  target = 250, 
  activeIndex,
  onActive,
  unit = "mg/dL",
  height = 130,
}) {
  return (
    <div className="flex gap-3">
      <div className="flex-1">
        {/* Batang */}
        <div className="flex items-end justify-between px-1" style={{ height }}>
          {data.map((d, i) => {
            const pct = Math.max(12, (d.value / max) * 100);
            return (
              <button
                key={i}
                type="button"
                aria-label={`${d.label}: ${d.value} ${unit}`}
                aria-pressed={i === activeIndex}
                onClick={() => onActive(i)}
                onMouseEnter={() => onActive(i)}
                onFocus={() => onActive(i)}
                className="relative h-full w-5 flex items-end outline-none"
              >
                <span
                  className={`w-full rounded-full transition-[height,background-color] duration-300 ${
                    d.value >= target ? "bg-[var(--Primary-color)]" : "bg-gray-200"
                  }`}
                  style={{ height: `${pct}%` }}
                />
                {i === activeIndex && (
                  <ChartToolTip left="50%" top={`${100 - pct}%`} align={alignAt(i, data.length)}>
                    {d.value} {unit}
                  </ChartToolTip>
                )}
              </button>
            );
          })}
        </div>

        {/* Label hari */}
        <div className="flex justify-between px-1 mt-2">
          {data.map((d, i) => (
            <span key={i} className="w-5 text-center text-xs text-gray-700">{d.label}</span>
          ))}
        </div>
      </div>

      {/* Sumbu Y kanan */}
      <div className="relative w-8 shrink-0 text-[10px] text-gray-500" style={{ height }}>
        {ticks.map((t, i) => (
          <span
            key={t}
            className={`absolute left-0 -translate-y-1/2 ${i === 0 ? "text-[var(--Primary-color)]" : ""}`}
            style={{ top: `${100 - (t / max) * 100}%` }}
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

export default memo(BarChart);