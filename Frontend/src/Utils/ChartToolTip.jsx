const ALIGN = {
  center: { transform: "translate(-50%, -100%)", arrow: "50%" },
  start: { transform: "translate(-16px, -100%)", arrow: "16px" },
  end: { transform: "translate(calc(-100% + 16px), -100%)", arrow: "calc(100% - 16px)" },
};

export const alignAt = (i, total) => (i === 0 ? "start" : i === total - 1 ? "end" : "center");

export default function ChartToolTip({ left, top, align = "center", children }) {
  const a = ALIGN[align];
  return (
    <div
      className="absolute z-10 pointer-events-none transition-[left,top] duration-200"
      style={{ left, top, transform: a.transform, marginTop: -8 }}
    >
      <div className="relative bg-black text-white text-[10px] font-medium rounded-full px-3 py-1 whitespace-nowrap">
        {children}
        <span
          className="absolute top-full -translate-x-1/2 border-4 border-transparent border-t-black"
          style={{ left: a.arrow }}
        />
      </div>
    </div>
  );
}