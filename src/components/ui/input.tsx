import * as React from "react";
import { cn } from "@/lib/utils";
const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, type, ...props }, ref) => (
  <input type={type} className={cn(
    "flex h-10 w-full rounded-xl border border-line bg-field px-4 py-2 text-[13px] text-on-surface placeholder:text-on-surface-3 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/40 transition-all disabled:opacity-50",
    type === "date" && "cursor-pointer",
    type === "number" && "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
    className
  )} ref={ref} style={type === "date" ? { colorScheme: 'auto' } : undefined} {...props} />
));
Input.displayName = "Input";
export { Input };
