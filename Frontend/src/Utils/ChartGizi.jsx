import React from "react";

/**
 * Ringkasan gizi: donut satu warna (kalori) + progress bar per nutrisi.
 * Murni SVG + inline style, tanpa library.
 * Font: pasang Poppins di project lu (Google Fonts) biar sama kayak Figma.
 */

const NUTRISI_DEFAULT = [
  { label: "Protein", current: 47, target: 75, unit: "gr", color: "#FFE082", track: "#FFF3D6" },
  { label: "Gula", current: 34, target: 50, unit: "gr", color: "#A8E6CF", track: "#E3F6EE" },
  { label: "Karbo", current: 165, target: 280, unit: "gr", color: "#5BB0C9", track: "#D5E9F0" },
  { label: "Garam", current: 7, target: 10, unit: "gr", color: "#5BB0C9", track: "#D5E9F0" },
];

function Donut({ percent, color, trackColor, size, strokeWidth, children }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, percent));
  const offset = circumference * (1 - clamped / 100);

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function NutrisiBar({ label, current, target, unit, color, track }) {
  const pct = Math.min(100, (current / target) * 100);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: "#111" }}>{label}</span>
        <span style={{ fontSize: 10, color: "#6b6b6b" }}>
          <span style={{ fontSize: 10 }}>{current}</span>/{target} {unit}
        </span>
      </div>
      <div
        style={{
          height: 8,
          borderRadius: 999,
          background: track,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            borderRadius: 999,
            background: color,
            transition: "width 0.8s ease",
          }}
        />
      </div>
    </div>
  );
}

export default function ChartGizi({
  kalori = 1430,
  targetKalori = 1800,
  percent = 74, // di desain 74%; kalau mau otomatis: Math.round((kalori / targetKalori) * 100)
  color = "#FF9800",
  trackColor = "#ECECEC",
  size = 100,
  strokeWidth = 16,
  items = NUTRISI_DEFAULT,
}) {
  const fmt = (n) => n.toLocaleString("id-ID");

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        width: '100%',
        paddingLeft: '10px',
        paddingRight: '10px',
        height: '100%',
        gap: 32,
        flexWrap: "wrap",
        fontFamily: "'Poppins', system-ui, sans-serif",
      }}
    >
      {/* Donut + label */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
        <Donut
          percent={percent}
          color={color}
          trackColor={trackColor}
          size={size}
          strokeWidth={strokeWidth}
        >
          <span style={{ fontSize: size * 0.14, fontWeight: 600, lineHeight: 1.1, color: "#111" }}>
            {fmt(kalori)}
          </span>
          <span style={{ fontSize: size * 0.075, color: "#444" }}>
            Dari {fmt(targetKalori)} kkal
          </span>
        </Donut>
        <span style={{ fontSize: 10, fontWeight: 600, color }}>{percent}% Target Terpenuhi</span>
      </div>

      {/* Progress bar per nutrisi */}
      <div style={{ flex: 1, minWidth: 140, display: "grid", gap: 12 }}>
        {items.map((item) => (
          <NutrisiBar key={item.label} {...item} />
        ))}
      </div>
    </div>
  );
}