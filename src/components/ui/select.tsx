"use client";
import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectProps {
  options: { value: string; label: string }[];
  value?: string;
  onChange?: (e: { target: { value: string } }) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  disabled?: boolean;
}

function Select({ options, value, onChange, placeholder, className, id, disabled }: SelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find(o => o.value === value);
  const displayText = selected?.label || placeholder || "Select...";

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleSelect(val: string) {
    onChange?.({ target: { value: val } });
    setOpen(false);
  }

  return (
    <div ref={ref} className={cn("relative", className)} id={id}>
      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-xl border border-line bg-field px-4 py-2 text-[13px] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
          open ? "ring-2 ring-primary/25 border-primary/40" : "hover:border-on-surface-3",
          selected ? "text-on-surface" : "text-on-surface-3"
        )}
      >
        <span className="truncate">{displayText}</span>
        <ChevronDown className={cn("w-4 h-4 text-on-surface-3 shrink-0 ml-2 transition-transform", open && "rotate-180")} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-[80] mt-1.5 w-full min-w-[160px] max-h-[240px] overflow-y-auto rounded-xl border border-line bg-surface shadow-xl animate-fade-in">
          <div className="p-1">
            {placeholder && (
              <button
                type="button"
                onClick={() => handleSelect("")}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] text-on-surface-3 hover:bg-surface-2 transition-colors cursor-pointer text-left"
              >
                {displayText === placeholder && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
                {displayText !== placeholder && <span className="w-3.5 shrink-0" />}
                {placeholder}
              </button>
            )}
            {options.map(o => (
              <button
                key={o.value}
                type="button"
                onClick={() => handleSelect(o.value)}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] transition-colors cursor-pointer text-left",
                  value === o.value
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-on-surface hover:bg-surface-2"
                )}
              >
                {value === o.value ? <Check className="w-3.5 h-3.5 text-primary shrink-0" /> : <span className="w-3.5 shrink-0" />}
                {o.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export { Select };
