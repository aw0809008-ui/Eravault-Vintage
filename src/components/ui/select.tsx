"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[];
  placeholder?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ className, options, placeholder, ...props }, ref) => (
  <select ref={ref} className={cn(
    "flex h-9 w-full rounded-lg border border-[--border] bg-[--bg-input] px-3 py-1.5 text-sm text-[--text] focus:outline-none focus:ring-2 focus:ring-[--ring] focus:ring-offset-1 focus:ring-offset-[--bg] transition-shadow disabled:cursor-not-allowed disabled:opacity-50 appearance-none cursor-pointer",
    className
  )} {...props}>
    {placeholder && <option value="" disabled>{placeholder}</option>}
    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
));
Select.displayName = "Select";
export { Select };
