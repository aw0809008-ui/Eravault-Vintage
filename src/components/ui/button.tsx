"use client";
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const bv = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-[13px] font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--c-accent]/50 disabled:pointer-events-none disabled:opacity-50 cursor-pointer", {
  variants: { variant: {
    default: "bg-[--c-accent] text-[--c-accent-text] hover:bg-[--c-accent-hover] shadow-sm",
    destructive: "bg-red-600 text-white hover:bg-red-700 shadow-sm",
    outline: "border border-[--c-border] bg-[--c-surface] text-[--c-text] hover:bg-[--c-hover] shadow-sm",
    secondary: "bg-[--c-surface-2] text-[--c-text] hover:bg-[--c-hover]",
    ghost: "text-[--c-text-2] hover:bg-[--c-hover] hover:text-[--c-text]",
    link: "text-[--c-accent] underline-offset-4 hover:underline",
  }, size: {
    default: "h-9 px-4",
    sm: "h-8 px-3 text-xs rounded-md",
    lg: "h-10 px-5",
    icon: "h-9 w-9",
  }}, defaultVariants: { variant: "default", size: "default" }
});

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof bv> { asChild?: boolean; }
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const C = asChild ? Slot : "button";
  return <C className={cn(bv({ variant, size, className }))} ref={ref} {...props} />;
});
Button.displayName = "Button";
export { Button, bv as buttonVariants };
