"use client";

import { useState, useRef, useEffect } from "react";
import { X, ChevronDown } from "lucide-react";

type MultiSelectChipsProps<T extends string> = {
  options: T[];
  value: T[];
  onChange: (value: T[]) => void;
  placeholder?: string;
};

export function MultiSelectChips<T extends string>({
  options,
  value,
  onChange,
  placeholder = "Select options",
}: MultiSelectChipsProps<T>) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const toggleSelect = (item: T) => {
    const exists = value.includes(item);

    const updated = exists
      ? value.filter(v => v !== item)
      : [...value, item];

    onChange(updated);
  };

  const removeTag = (item: T) => {
    onChange(value.filter(v => v !== item));
  };

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div
        className="flex px-4 py-[10px] min-h-[53.6px] flex-1 items-center bg-white rounded-[99px] outline-none w-full border border-[#e8e8e8] text-paragraph text-sm font-light justify-between rounded-full cursor-pointer"
        onClick={() => setOpen(prev => !prev)}
      >
        <div className="flex gap-2 flex-wrap">
          {value.length ? (
            value.map(item => (
              <span
                key={item}
                className="flex items-center gap-2 bg-slate-600 text-white px-2 py-1 rounded-md text-xs"
                onClick={e => e.stopPropagation()}
              >
                {item}
                <X
                  size={12}
                  className="cursor-pointer"
                  onClick={() => removeTag(item)}
                />
              </span>
            ))
          ) : (
            <span className="text-paragraph text-sm font-light">
              {placeholder}
            </span>
          )}
        </div>

        <ChevronDown size={18} />
      </div>

      {open && (
        <div className="absolute flex flex-col gap-1 z-50 mt-2 w-full rounded-md border bg-white shadow-md p-2">
          {options.map(item => (
            <div
              key={item}
              className={`px-3 py-2 rounded-md cursor-pointer text-xs
                ${
                  value.includes(item)
                    ? "bg-primary_heading text-white"
                    : "hover:bg-primary_blue hover:text-white"
                }`}
              onClick={() => toggleSelect(item)}
            >
              {item}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
