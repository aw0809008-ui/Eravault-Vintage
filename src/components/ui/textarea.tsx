import * as React from "react";
import { cn } from "@/lib/utils";
const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...props }, ref) => (
  <textarea className={cn("flex min-h-[80px] w-full rounded-lg border border-[--c-border] bg-[--c-input] px-3 py-2 text-[13px] text-[--c-text] placeholder:text-[--c-text-3] focus:outline-none focus:ring-2 focus:ring-[--c-accent]/40 focus:border-[--c-accent]/50 transition-all disabled:opacity-50 resize-none", className)} ref={ref} {...props} />
));
Textarea.displayName = "Textarea";
export { Textarea };
