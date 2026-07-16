import * as React from "react";
import { cn } from "@/lib/utils";
const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, type, ...props }, ref) => (
  <input type={type} className={cn("flex h-9 w-full rounded-lg border border-[--c-border] bg-[--c-input] px-3 py-1.5 text-[13px] text-[--c-text] placeholder:text-[--c-text-3] focus:outline-none focus:ring-2 focus:ring-[--c-accent]/40 focus:border-[--c-accent]/50 transition-all disabled:opacity-50", className)} ref={ref} {...props} />
));
Input.displayName = "Input";
export { Input };
