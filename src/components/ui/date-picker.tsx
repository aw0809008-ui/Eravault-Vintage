"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  value?: string;
  onChange?: (e: { target: { value: string } }) => void;
  placeholder?: string;
  className?: string;
  id?: string;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function formatDisplay(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function toDateStr(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export function DatePicker({ value, onChange, placeholder = "Select date", className, id }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const today = new Date();
  const selected = value ? new Date(value + "T00:00:00") : null;

  const [viewYear, setViewYear] = useState(selected?.getFullYear() || today.getFullYear());
  const [viewMonth, setViewMonth] = useState(selected?.getMonth() ?? today.getMonth());

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (open && selected) {
      setViewYear(selected.getFullYear());
      setViewMonth(selected.getMonth());
    }
  }, [open, selected]);

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  function selectDate(day: number) {
    const dateStr = toDateStr(viewYear, viewMonth, day);
    onChange?.({ target: { value: dateStr } });
    setOpen(false);
  }

  // Calendar grid
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const cells: { day: number; current: boolean; today: boolean; selected: boolean }[] = [];

  // Previous month trailing days
  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ day: daysInPrevMonth - i, current: false, today: false, selected: false });
  }

  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    const isToday = d === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
    const isSel = selected ? d === selected.getDate() && viewMonth === selected.getMonth() && viewYear === selected.getFullYear() : false;
    cells.push({ day: d, current: true, today: isToday, selected: isSel });
  }

  // Next month leading days
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    cells.push({ day: d, current: false, today: false, selected: false });
  }

  return (
    <div ref={ref} className={cn("relative", className)} id={id}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-xl border border-line bg-field px-4 py-2 text-[13px] transition-all cursor-pointer",
          open ? "ring-2 ring-primary/25 border-primary/40" : "hover:border-on-surface-3",
          value ? "text-on-surface" : "text-on-surface-3"
        )}
      >
        <span className="truncate">{value ? formatDisplay(value) : placeholder}</span>
        <Calendar className="w-4 h-4 text-on-surface-3 shrink-0 ml-2" />
      </button>

      {/* Calendar Dropdown */}
      {open && (
        <div className="absolute z-[80] mt-1.5 w-[280px] rounded-xl border border-line bg-surface shadow-xl animate-fade-in p-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <button type="button" onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-surface-2 text-on-surface-3 cursor-pointer transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-[13px] font-semibold text-on-surface">
              {MONTHS[viewMonth]} {viewYear}
            </span>
            <button type="button" onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-surface-2 text-on-surface-3 cursor-pointer transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-1">
            {DAYS.map(d => (
              <div key={d} className="text-center text-[11px] font-medium text-on-surface-3 py-1">{d}</div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7">
            {cells.map((cell, i) => (
              <button
                key={i}
                type="button"
                disabled={!cell.current}
                onClick={() => cell.current && selectDate(cell.day)}
                className={cn(
                  "h-9 w-full rounded-lg text-[13px] transition-all cursor-pointer",
                  !cell.current && "text-on-surface-3/30 cursor-default",
                  cell.current && !cell.selected && !cell.today && "text-on-surface hover:bg-surface-2",
                  cell.today && !cell.selected && "text-primary font-semibold bg-primary/10",
                  cell.selected && "bg-primary text-white font-semibold shadow-sm"
                )}
              >
                {cell.day}
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-line">
            <button
              type="button"
              onClick={() => { const t = today; selectDate(t.getDate()); setViewMonth(t.getMonth()); setViewYear(t.getFullYear()); }}
              className="text-[12px] font-medium text-primary hover:underline cursor-pointer"
            >
              Today
            </button>
            {value && (
              <button
                type="button"
                onClick={() => { onChange?.({ target: { value: "" } }); setOpen(false); }}
                className="text-[12px] font-medium text-on-surface-3 hover:text-red cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
