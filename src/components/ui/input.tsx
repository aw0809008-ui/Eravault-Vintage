import * as React from "react";
import { cn } from "@/lib/utils";
const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, type, ...props }, ref) => (
  <input type={type} className={cn(
    "flex h-10 w-full rounded-xl border border-line bg-field px-4 py-2 text-[13px] text-on-surface placeholder:text-on-surface-3 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/40 transition-all disabled:opacity-50",
    /* Date & time inputs — theme matching */
    "[&[type=date]]:appearance-none [&[type=date]]:cursor-pointer",
    "[&[type=time]]:appearance-none [&[type=time]]:cursor-pointer",
    /* Calendar icon color in dark mode */
    "[&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:rounded [&::-webkit-calendar-picker-indicator]:p-0.5 [&::-webkit-calendar-picker-indicator]:hover:bg-surface-2",
    "dark:[&::-webkit-calendar-picker-indicator]:filter dark:[&::-webkit-calendar-picker-indicator]:invert",
    /* Number input arrows */
    "[&[type=number]::-webkit-inner-spin-button]:appearance-none [&[type=number]::-webkit-outer-spin-button]:appearance-none [&[type=number]]:appearance-textfield",
    className
  )} ref={ref} {...props} />
));
Input.displayName = "Input";
export { Input };
