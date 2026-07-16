"use client";
import * as React from "react";
import * as L from "@radix-ui/react-label";
import { cn } from "@/lib/utils";

const Label = React.forwardRef<React.ComponentRef<typeof L.Root>, React.ComponentPropsWithoutRef<typeof L.Root>>(({ className, ...props }, ref) => (
  <L.Root ref={ref} className={cn("text-sm font-medium text-[--text-sub] leading-none", className)} {...props} />
));
Label.displayName = L.Root.displayName;
export { Label };
