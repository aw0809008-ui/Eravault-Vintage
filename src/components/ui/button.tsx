"use client";
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const bv = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-[13px] font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-page disabled:pointer-events-none disabled:opacity-50 cursor-pointer active:scale-[0.98]", {
  variants: { variant: {
    default: "bg-primary text-white hover:bg-primary-hover shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30",
    destructive: "bg-red-600 text-white hover:bg-red-700 shadow-md shadow-red-600/20",
    outline: "border border-line bg-surface text-on-surface hover:bg-surface-2",
    secondary: "bg-surface-2 text-on-surface hover:bg-surface-3",
    ghost: "text-on-surface-2 hover:bg-surface-2 hover:text-on-surface",
    link: "text-primary underline-offset-4 hover:underline",
  }, size: {
    default: "h-10 px-5",
    sm: "h-8 px-3.5 text-xs rounded-lg",
    lg: "h-11 px-6 text-[14px]",
    icon: "h-10 w-10 rounded-xl",
  }}, defaultVariants: { variant: "default", size: "default" }
});

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof bv> { asChild?: boolean; }
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const C = asChild ? Slot : "button";
  return <C className={cn(bv({ variant, size, className }))} ref={ref} {...props} />;
});
Button.displayName = "Button";
export { Button, bv as buttonVariants };
