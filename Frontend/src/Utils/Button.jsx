import { useState } from "react";
import { Icon } from "@iconify/react";

const DEFAULT_OPTIONS = ["Harian", "Mingguan", "Bulanan"];

export default function Dropdown({ value, onChange, options = DEFAULT_OPTIONS }) {
  const [open, setOpen] = useState(false);

  const select = (option) => {
    onChange(option);
    setOpen(false);
  };

  return (
    <div className="relative font-['Poppins']">
      {open && <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />}

      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between gap-3 w-[104px] h-7 px-3 text-xs bg-white border border-gray-300 rounded-full"
      >
        {value}
        <Icon icon="mdi:chevron-down" fontSize={18} />
      </button>

      {open && (
        <ul className="absolute right-0 top-full mt-1 z-20 w-full bg-white border border-gray-300 rounded-2xl overflow-hidden">
          {options.map((option) => (
            <li
              key={option}
              onClick={() => select(option)}
              className={`px-3 py-1.5 text-xs cursor-pointer hover:bg-gray-100 ${
                option === value ? "font-semibold" : ""
              }`}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}