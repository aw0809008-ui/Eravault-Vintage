"use client";
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const v = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--ring] focus-visible:ring-offset-2 focus-visible:ring-offset-[--bg] disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  { variants: { variant: {
    default: "bg-[--bg-accent] text-[--bg] hover:bg-[--bg-accent-hover]",
    destructive: "bg-red-600 text-white hover:bg-red-700",
    outline: "border border-[--border] bg-transparent text-[--text] hover:bg-[--bg-hover]",
    secondary: "bg-[--bg-el] text-[--text] border border-[--border] hover:bg-[--bg-hover]",
    ghost: "text-[--text-sub] hover:bg-[--bg-hover] hover:text-[--text]",
    link: "text-[--text] underline-offset-4 hover:underline",
  }, size: {
    default: "h-9 px-4 py-2",
    sm: "h-8 rounded-md px-3 text-xs",
    lg: "h-10 rounded-lg px-6",
    icon: "h-9 w-9",
  }}, defaultVariants: { variant: "default", size: "default" } }
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof v> { asChild?: boolean; }
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const C = asChild ? Slot : "button";
  return <C className={cn(v({ variant, size, className }))} ref={ref} {...props} />;
});
Button.displayName = "Button";
export { Button, v as buttonVariants };
