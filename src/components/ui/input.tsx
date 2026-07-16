import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input type={type} className={cn(
      "flex h-9 w-full rounded-lg border border-[--border] bg-[--bg-input] px-3 py-1.5 text-sm text-[--text] placeholder:text-[--text-dim] focus:outline-none focus:ring-2 focus:ring-[--ring] focus:ring-offset-1 focus:ring-offset-[--bg] transition-shadow disabled:cursor-not-allowed disabled:opacity-50",
      className
    )} ref={ref} {...props} />
  )
);
Input.displayName = "Input";
export { Input };
