import { memo, useCallback, useMemo, useRef } from "react";
import { smoothPath } from "./Smoothpath";
import ChartToolTip, { alignAt } from "./ChartToolTip";

const W = 300;
const H = 100;

function LineChart({ data, year, max = 100, step = 10, activeIndex, onActive, unit = "mg", height = 200 }) {
  const plotRef = useRef(null);
  const last = data?.length - 1;
  const active = data[activeIndex];

  const ticks = useMemo(
    () => Array.from({ length: max / step + 1 }, (_, i) => max - i * step),
    [max, step]
  );
  const path = useMemo(
    () => smoothPath(data.map((d, i) => ({ x: (i / last) * W, y: H - (d.value / max) * H })), 0, H),
    [data, max, last]
  );

  const x = (i) => `${(i / last) * 100}%`;
  const y = (v) => `${100 - (v / max) * 100}%`;

  // Satu handler buat seluruh area: hover, tap, dan geser jari (scrub) pilih titik terdekat.
  const pick = useCallback(
    (e) => {
      const { left, width } = plotRef.current.getBoundingClientRect();
      const ratio = Math.min(1, Math.max(0, (e.clientX - left) / width));
      onActive(Math.round(ratio * last));
    },
    [last, onActive]
  );

  const onKeyDown = (e) => {
    if (e.key === "ArrowRight") onActive(Math.min(last, activeIndex + 1));
    if (e.key === "ArrowLeft") onActive(Math.max(0, activeIndex - 1));
  };

  return (
    <div className="flex gap-2">
      {/* Sumbu Y */}
      <div className="relative w-6 shrink-0" style={{ height }}>
        {ticks.map((t) => (
          <span key={t} className="absolute right-0 -translate-y-1/2 text-[10px] text-gray-500" style={{ top: y(t) }}>
            {t}
          </span>
        ))}
      </div>

      <div className="flex-1 mx-3">
        {/* Area plot (interaktif) */}
        <div
          ref={plotRef}
          role="slider"
          tabIndex={0}
          aria-label="Progress chart"
          aria-valuemin={0}
          aria-valuemax={max}
          aria-valuenow={active?.value}
          aria-valuetext={active ? `${active.label}: ${active.value} ${unit}` : undefined}
          onPointerDown={pick}
          onPointerMove={pick}
          onKeyDown={onKeyDown}
          className="relative touch-pan-y outline-none focus-visible:ring-2 focus-visible:ring-[var(--Primary-color)] rounded"
          style={{ height }}
        >
          <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
            {ticks.map((t) => (
              <line key={t} x1="0" x2={W} y1={H - (t / max) * H} y2={H - (t / max) * H} stroke="#f0f0f0" vectorEffect="non-scaling-stroke" />
            ))}
            <path d={path} fill="none" strokeWidth="3.5" strokeLinecap="round" vectorEffect="non-scaling-stroke" style={{ stroke: "var(--Primary-color, #FF9800)" }} />
          </svg>

          {active && (
            <>
              <ChartToolTip left={x(activeIndex)} top={y(active.value)} align={alignAt(activeIndex, data.length)}>
                {active.value} {unit}
              </ChartToolTip>
              <span
                className="absolute w-2.5 h-2.5 rounded-full bg-black -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-[left,top] duration-200"
                style={{ left: x(activeIndex), top: y(active.value) }}
              />
            </>
          )}
        </div>

        {/* Label X */}
        <div className="relative h-8 mt-2">
          {data.map((d, i) => (
            <span key={d.label} className="absolute -translate-x-1/2 text-center text-[9px] leading-tight text-gray-500" style={{ left: x(i) }}>
              {year}
              <br />
              {d.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default memo(LineChart);